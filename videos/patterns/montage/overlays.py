"""Graphiques et incrustations : barre de progression, écran partagé, image dans l'image, éléments qui
apparaissent (sticker / émoji, forme ou flèche, bandeau, encart, texte animé) et leurs animations d'entrée et de sortie."""
import math, os
import numpy as np, cv2
from .common import runs


def _pos_name(cx, cy):
    v = 'haut' if cy < 33 else 'bas' if cy > 66 else 'milieu'
    h = 'gauche' if cx < 33 else 'droite' if cx > 66 else 'centre'
    return f'{v} {h}' if not (v == 'milieu' and h == 'centre') else 'centre'


def progress_bar(S):
    NF, W0, FPS = S['NF'], S['W0'], S['FPS']
    out = []
    for side in ('haut', 'bas'):
        L0 = np.array([r['strip'][side] for r in S['rows']], float)
        if NF < 30 or L0.max() < 0.5 * W0: continue
        # la barre ne fait que grandir : un fond coloré qui la prolonge par moments ne peut que surestimer sa longueur,
        # on garde donc le minimum de ce qui reste à venir
        L = np.minimum.accumulate(L0[::-1])[::-1]
        if np.mean(np.abs(L0 - L) < 0.03 * W0) < 0.5: continue
        t = np.arange(NF)
        c = np.corrcoef(t, L)[0, 1] if L.std() > 0 else 0
        if c > 0.97 and L[: max(1, NF // 20)].mean() < 0.2 * W0 and L[-max(1, NF // 20):].mean() > 0.8 * W0:
            out.append(dict(type='barre de progression', position=side, start_s=0.0, end_s=round(NF / FPS, 2), remplissage='de gauche à droite, proportionnel au temps'))
    return out


def split_and_pip(S, shots):
    rows, SC, W0, H0, AW, AH = S['rows'], S['SC'], S['W0'], S['H0'], S['AW'], S['AH']
    found = []
    for s in shots:
        a, b = s['_a'], s['_b']
        if b - a < 15: continue
        hv = [rows[k].get('halves') for k in range(a + 1, b)]
        for key1, key2, layout in [('g', 'd', 'gauche / droite'), ('h', 'b', 'haut / bas')]:
            diffs = [math.hypot(h[key1][0] - h[key2][0], h[key1][1] - h[key2][1]) for h in hv if h and h[key1] and h[key2]]
            if len(diffs) > 0.6 * len(hv) and np.median(diffs) > 2.0 and _seam(S['grays'], a, b, layout):
                s['split'] = layout
                found.append(dict(type='écran partagé', disposition=layout, start_s=s['start_s'], end_s=s['end_s']))
                break
        if s.get('split'): continue
        # image dans l'image : zone rectangulaire dont le contenu change en permanence, alors que le reste change peu
        grays = S['grays']; fr = np.zeros(grays[0].shape, np.float32); nfr = 0
        for k in range(a + 2, b):
            d = cv2.blur(np.abs(grays[k].astype(np.float32) - grays[k - 1]), (9, 9))
            fr += d > max(1.5, 3 * float(np.median(d))); nfr += 1
        if nfr == 0: continue
        m = (fr / nfr > 0.6).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(m)
        for i in range(1, n):
            x, y, w, h, area = st[i]
            frac = w * h / (AW * AH); fill = area / (w * h)
            if 0.02 < frac < 0.4 and fill > 0.85 and 0.25 < w / h < 4 and x > 0 and y > 0 and x + w < AW and y + h < AH:
                rx, ry, rw, rh = x * SC, y * SC, w * SC, h * SC
                cx, cy = (rx + rw / 2) / W0 * 100, (ry + rh / 2) / H0 * 100
                s.setdefault('pip', []).append((rx, ry, rw, rh))
                found.append(dict(type="image dans l'image", start_s=s['start_s'], end_s=s['end_s'], position=_pos_name(cx, cy),
                                  centre_pct=[round(cx), round(cy)], taille_pct_ecran=round(rw * rh / (W0 * H0) * 100, 1),
                                  rect_pct=[round(rx / W0 * 100, 1), round(ry / H0 * 100, 1), round(rw / W0 * 100, 1), round(rh / H0 * 100, 1)]))
    return found


def appearing(S, shots, caption_boxes, trans=()):
    """Éléments graphiques qui entrent, restent fixes à l'écran, puis sortent."""
    rows, grays, FPS, W0, H0, AW, AH, SC = S['rows'], S['grays'], S['FPS'], S['W0'], S['H0'], S['AW'], S['AH'], S['SC']
    T = lambda f: round(f / FPS, 2)
    found = []
    min_area = 0.002 * AW * AH
    for s in shots:
        a, b = s['_a'], s['_b']
        if s.get('split') or b - a < 8: continue
        excl = np.zeros((AH, AW), np.uint8)
        for (rx, ry, rw, rh) in s.get('pip', []):
            cv2.rectangle(excl, (int(rx / SC) - 4, int(ry / SC) - 4), (int((rx + rw) / SC) + 4, int((ry + rh) / SC) + 4), 1, -1)
        tb = int(max(r['top_bar'] for r in rows[a:b]) / SC); bb = int(max(r['bot_bar'] for r in rows[a:b]) / SC)
        excl[:max(tb, int(AH * 0.02)) + 2] = 1; excl[AH - max(bb, int(AH * 0.02)) - 2:] = 1
        eps, done = [], []
        Cs = {}
        for k in range(a + 1, b):
            M = rows[k]['M']
            if rows[k]['ncc_comp'] < 0.9: continue                       # image mal recalée (tremblement fort, flou) : on ne conclut rien
            prevw = cv2.warpAffine(grays[k - 1], np.array(M, np.float32), (AW, AH)) if M else grays[k - 1]
            # un changement expliqué par le mouvement de caméra OU par un élément fixe à l'écran n'en est pas un
            C = (np.minimum(cv2.absdiff(grays[k], prevw), cv2.absdiff(grays[k], grays[k - 1])) > 30).astype(np.uint8)
            ex = excl.copy()
            for (x, y, w, h) in caption_boxes(k) + caption_boxes(k - 1):
                cv2.rectangle(ex, (int(x / SC) - 6, int(y / SC) - 6), (int((x + w) / SC) + 6, int((y + h) / SC) + 6), 1, -1)
            C[ex > 0] = 0
            C = cv2.dilate(C, np.ones((5, 5), np.uint8)); Cs[k] = C
            n, lab, st, cen = cv2.connectedComponentsWithStats(C)
            comps = [tuple(st[i][:4]) for i in range(1, n) if st[i][4] >= min_area
                     and not ((st[i][0] <= 2 or st[i][0] + st[i][2] >= AW - 2) and st[i][2] < 0.05 * AW)
                     and not ((st[i][1] <= 2 or st[i][1] + st[i][3] >= AH - 2) and st[i][3] < 0.05 * AH)]
            for bx in comps:
                for e in eps:
                    lx, ly, lw, lh = e['boxes'][-1][1]
                    if bx[0] < lx + lw + 20 and lx < bx[0] + bx[2] + 20 and bx[1] < ly + lh + 20 and ly < bx[1] + bx[3] + 20:
                        if e['boxes'][-1][0] == k:
                            ox, oy, ow, oh = e['boxes'][-1][1]
                            x1, y1 = min(ox, bx[0]), min(oy, bx[1]); x2, y2 = max(ox + ow, bx[0] + bx[2]), max(oy + oh, bx[1] + bx[3])
                            e['boxes'][-1] = (k, (x1, y1, x2 - x1, y2 - y1))
                        else:
                            e['boxes'].append((k, bx))
                        break
                else:
                    eps.append(dict(start=k, boxes=[(k, bx)]))
            for e in list(eps):
                if k - e['boxes'][-1][0] >= 3: eps.remove(e); done.append(e)
        done += eps
        events = []
        dbg = os.environ.get('DEBUG_OVL')
        for e in done:
            k0, k1 = e['start'], e['boxes'][-1][0]; L = k1 - k0 + 1
            if dbg: print('EP', T(k0), T(k1), L, [(q, tuple(int(v) for v in bb)) for q, bb in e['boxes']][:12])
            if L > 18: continue                                   # mouvement continu : un sujet, pas une incrustation
            if k0 < a + 1 or k1 > b - 2: continue                 # collé à une coupe : c'est le changement de plan
            if any(e.get('dur_frames') and e['start_s'] * FPS - 3 <= k1 and k0 <= e['start_s'] * FPS + e['dur_frames'] + 3 for e in trans): continue   # pendant une transition
            fx, fy, fw, fh = e['boxes'][-1][1]
            after = range(k1 + 2, min(b, k1 + 10))
            if len(after) < 3 and k1 + 2 < b - 1: continue
            qs = [q for q in after if q in Cs]
            still = len(qs) >= 3 and np.mean([Cs[q][fy:fy + fh, fx:fx + fw].mean() < 0.03 for q in qs]) >= 0.75
            if not still: continue
            areas = [bb[2] * bb[3] for _, bb in e['boxes']]
            cxs = [(bb[0] + bb[2] / 2) for _, bb in e['boxes']]; cys = [(bb[1] + bb[3] / 2) for _, bb in e['boxes']]
            ux0 = min(bb[0] for _, bb in e['boxes']); uy0 = min(bb[1] for _, bb in e['boxes'])
            ux1 = max(bb[0] + bb[2] for _, bb in e['boxes']); uy1 = max(bb[1] + bb[3] for _, bb in e['boxes'])
            kb, ka = max(a, k0 - 1), min(b - 1, k1 + 2)
            Mc = np.eye(3)                                        # mouvement de caméra cumulé entre avant et après
            for q in range(kb + 1, ka + 1):
                if rows[q]['M']: Mc = np.vstack([np.array(rows[q]['M'], float), [0, 0, 1]]) @ Mc
            before = cv2.warpAffine(grays[kb], Mc[:2].astype(np.float32), (AW, AH)); aft = grays[ka]
            D = np.minimum(cv2.absdiff(aft, before), cv2.absdiff(aft, grays[kb])) > 30
            sub = np.zeros_like(D); sub[uy0:uy1, ux0:ux1] = D[uy0:uy1, ux0:ux1]
            ys_, xs_ = np.nonzero(sub)
            if len(xs_) > 20:                                     # boîte finale de l'élément = ce qui diffère entre avant et après
                fx, fy = int(np.percentile(xs_, 1)), int(np.percentile(ys_, 1)); fw, fh = int(np.percentile(xs_, 99)) - fx + 1, int(np.percentile(ys_, 99)) - fy + 1
            M_ = sub[fy:fy + fh, fx:fx + fw]
            if M_.size and M_.mean() < 0.2: continue                 # rien n'a changé durablement à cet endroit (un objet qui passe)
            contrast_before = float(before[fy:fy + fh, fx:fx + fw].std()); contrast_after = float(aft[fy:fy + fh, fx:fx + fw].std())
            moved = math.hypot(cxs[-1] - cxs[0], cys[-1] - cys[0]) > 0.15 * min(AW, AH)
            if moved:
                dx, dy = cxs[-1] - cxs[0], cys[-1] - cys[0]
                inward = (abs(cxs[-1] - AW / 2) < abs(cxs[0] - AW / 2)) if abs(dx) > abs(dy) else (abs(cys[-1] - AH / 2) < abs(cys[0] - AH / 2))
                kind = 'entrée' if inward else 'sortie'
                frm = ('la gauche' if dx > 0 else 'la droite') if abs(dx) > abs(dy) else ('le haut' if dy > 0 else 'le bas')
                anim = f'glissement depuis {frm}' if kind == 'entrée' else f"glissement vers {'la droite' if dx > 0 else 'la gauche' if abs(dx) > abs(dy) else 'le bas' if dy > 0 else 'le haut'}"
            elif L >= 3 and areas[-1] > 1.3 * areas[0]:
                kind = 'entrée'; peak = max(areas)
                anim = 'pop avec rebond' if peak > 1.08 * areas[-1] or L >= 4 else 'agrandissement'
            elif L >= 3 and areas[-1] < 0.77 * areas[0]:
                kind, anim = 'sortie', 'réduction'
            else:
                kind = 'entrée' if contrast_after > contrast_before else 'sortie'; anim = 'apparition sèche' if kind == 'entrée' else 'disparition sèche'
            events.append(dict(k0=k0, k1=k1, kind=kind, anim=anim, box=(fx, fy, fw, fh), mask=M_))
        events.sort(key=lambda e: e['k0'])
        merged = []                                               # morceaux d'un même élément (bords d'un aplat qui glisse)
        for e in events:
            m = next((x for x in merged if x['kind'] == e['kind'] and abs(x['k0'] - e['k0']) <= 6 and _iou(_grow(x['box'], 6), _grow(e['box'], 6)) > 0), None)
            if m:
                x1, y1 = min(m['box'][0], e['box'][0]), min(m['box'][1], e['box'][1])
                x2, y2 = max(m['box'][0] + m['box'][2], e['box'][0] + e['box'][2]), max(m['box'][1] + m['box'][3], e['box'][1] + e['box'][3])
                big = m if m['box'][2] * m['box'][3] >= e['box'][2] * e['box'][3] else e
                if big is e: m.update(anim=e['anim'], mask=None)
                m['box'] = (x1, y1, x2 - x1, y2 - y1); m['k0'] = min(m['k0'], e['k0']); m['k1'] = max(m['k1'], e['k1'])
            else: merged.append(e)
        events = merged
        for i, e in enumerate(events):
            if e['kind'] != 'entrée': continue
            ex = next((x for x in events[i + 1:] if x['kind'] == 'sortie' and _iou(x['box'], e['box']) > 0.1), None)
            fx, fy, fw, fh = e['box']
            m = e['mask'].astype(np.uint8) if e.get('mask') is not None and e['mask'].shape == (fh, fw) else None
            if m is None:
                D = np.minimum(cv2.absdiff(grays[min(b - 1, e['k1'] + 2)], grays[max(a, e['k0'] - 1)]), 255) > 30
                m = D[fy:fy + fh, fx:fx + fw].astype(np.uint8)
            cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            circ = sol = 0.0
            if cnts:
                c = max(cnts, key=cv2.contourArea); A_ = cv2.contourArea(c); P_ = cv2.arcLength(c, True)
                circ = 4 * math.pi * A_ / (P_ * P_ + 1e-6); hull = cv2.contourArea(cv2.convexHull(c)); sol = A_ / (hull + 1e-6)
            bx_full = (fx * SC, fy * SC, fw * SC, fh * SC)
            k_end = ex['k1'] if ex else b - 1
            txt = [c for c in S['cap_samples'] if e['k0'] <= c['f'] <= k_end and _inside(c['box'], bx_full)]
            cx, cy = (fx + fw / 2) / AW * 100, (fy + fh / 2) / AH * 100
            if txt and fw > 2.5 * fh and cy > 60: typ = 'bandeau'
            elif txt: typ = 'texte animé'
            elif circ > 0.7: typ = 'sticker / émoji'
            elif sol < 0.85: typ = 'forme (flèche…)'
            else: typ = 'encart / image'
            found.append(dict(type=typ, start_s=T(e['k0']), end_s=T(k_end + 1), entree=e['anim'], sortie=ex['anim'] if ex else 'avec la fin du plan',
                              duree_entree_images=e['k1'] - e['k0'] + 1, position=_pos_name(cx, cy), centre_pct=[round(cx), round(cy)],
                              taille_pct_ecran=round(fw * fh / (AW * AH) * 100, 1), texte=txt[0]['text'] if txt else None))
    return found


def _seam(grays, a, b, layout):
    """Écran partagé : une frontière nette qui traverse toute l'image vers le milieu, TOUJOURS À LA MÊME PLACE
    (une rambarde ou un horizon filmés bougent avec la caméra ; la séparation d'un écran partagé, non)."""
    ks = list(range(a + 1, b, max(1, (b - a) // 12))); pos = []
    for k in ks:
        g = grays[k].astype(np.float32)
        if layout.startswith('gauche'): fr_ = (np.abs(np.diff(g, axis=1)) > 20).mean(axis=0)
        else: fr_ = (np.abs(np.diff(g, axis=0)) > 20).mean(axis=1)
        n = len(fr_); lo = int(n * 0.4); i = int(np.argmax(fr_[lo:int(n * 0.6)])) + lo
        if fr_[i] > 0.6: pos.append(i)
    if len(pos) < 0.7 * len(ks): return False
    mode = max(set(pos), key=pos.count)
    return sum(abs(p - mode) <= 2 for p in pos) >= 0.7 * len(ks)


def _grow(b, d): return (b[0] - d, b[1] - d, b[2] + 2 * d, b[3] + 2 * d)


def _iou(a, b):
    x1, y1 = max(a[0], b[0]), max(a[1], b[1]); x2, y2 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    i = max(0, x2 - x1) * max(0, y2 - y1); u = a[2] * a[3] + b[2] * b[3] - i
    return i / u if u else 0


def _inside(box, rect):
    x, y, w, h = box; cx, cy = x + w / 2, y + h / 2
    return rect[0] <= cx <= rect[0] + rect[2] and rect[1] <= cy <= rect[1] + rect[3]

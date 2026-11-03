"""Coupes et transitions : coupe sèche, coupe avec recadrage, jump cut, fondu enchaîné, flash, fondu au noir,
glissement, panoramique filé, rideau, glitch, zoom de transition, rotation de transition."""
import math
import numpy as np, cv2
from .common import runs, ncc


def _scale(M): return math.hypot(M[0][0], M[1][0]) if M else 1.0
def _rot(M): return math.degrees(math.atan2(M[1][0], M[0][0])) if M else 0.0


def _sujet_detoure(S, k):
    """À une coupe : une grande forme irrégulière reste identique pendant que tout le reste de l'image change
    = un sujet détouré (masque, rotoscopie) posé devant un nouveau fond. Renvoie sa position et sa taille, sinon None."""
    G, rows, AW, AH, SC = S['grays'], S['rows'], S['AW'], S['AH'], S['SC']
    a, b = G[k - 1].astype(np.int16), G[k].astype(np.int16)
    d = np.abs(b - a)
    zone = np.ones((AH, AW), bool)
    tb = int(max(rows[k]['top_bar'], rows[k - 1]['top_bar']) / SC) + 2; bb = int(max(rows[k]['bot_bar'], rows[k - 1]['bot_bar']) / SC) + 2
    zone[:tb] = False; zone[AH - bb:] = False                    # bandes noires : elles ne changent jamais
    if zone.sum() < 0.5 * AW * AH: return None
    change = (d > 40) & zone
    if change.sum() < 0.35 * zone.sum(): return None             # le fond doit vraiment changer
    reste = ((d < 12) & zone).astype(np.uint8)
    reste = cv2.morphologyEx(reste, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    tex = cv2.Laplacian(G[k], cv2.CV_32F); tex = np.abs(tex) > 8      # le sujet est détaillé (pas un aplat noir ou blanc)
    n, lab, st, cen = cv2.connectedComponentsWithStats(reste)
    best = None
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        frac = ar / zone.sum()
        if not (0.04 < frac < 0.6): continue
        comp = lab == i
        if tex[comp].mean() < 0.15: continue                     # zone unie qui ne change pas (fond noir, ciel) : pas un sujet
        cnt, _ = cv2.findContours(comp.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        c = max(cnt, key=cv2.contourArea); hull = cv2.contourArea(cv2.convexHull(c))
        solid = cv2.contourArea(c) / (hull + 1e-6); rect = ar / (w * h)
        if rect > 0.9: continue                                  # rectangle : une image dans l'image, pas un détourage
        if best is None or ar > best[0]:
            best = (ar, dict(sujet_centre_pct=[round((x + w / 2) / AW * 100), round((y + h / 2) / AH * 100)], sujet_taille_pct_ecran=round(frac * 100, 1),
                             sujet_boite_pct=[round(x / AW * 100), round(y / AH * 100), round(w / AW * 100), round(h / AH * 100)], solidite=round(float(solid), 2)))
    if best: return best[1]
    # silhouette : la forme du sujet est remplie d'une couleur unie, le reste de l'image ne bouge pas
    reste_frac = ((d < 12) & zone).sum() / zone.sum()
    if reste_frac > 0.2:
        ch = cv2.morphologyEx(((d > 40) & zone).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(ch)
        for i in range(1, n):
            x, y, w, h, ar = st[i]; frac = ar / zone.sum()
            if not (0.05 < frac < 0.6) or ar / (w * h) > 0.85: continue
            comp = lab == i
            if tex[comp].mean() < 0.06 and G[k][comp].std() < 12:
                return dict(sujet_centre_pct=[round((x + w / 2) / AW * 100), round((y + h / 2) / AH * 100)], sujet_taille_pct_ecran=round(frac * 100, 1),
                            sujet_boite_pct=[round(x / AW * 100), round(y / AH * 100), round(w / AW * 100), round(h / AH * 100)],
                            silhouette=True, couleur='blanche' if G[k][comp].mean() > 180 else 'noire' if G[k][comp].mean() < 60 else 'unie')
    return None


def _silhouette(S, k):
    """À une coupe : une grande forme unie (blanche ou noire) au contour irrégulier apparaît d'un coup = la silhouette
    du sujet remplie d'une couleur (effet de masque très courant dans les edits)."""
    G, AW, AH = S['grays'], S['AW'], S['AH']
    g = G[k]; d = np.abs(g.astype(np.int16) - G[k - 1])
    lap = np.abs(cv2.Laplacian(g, cv2.CV_32F)) < 4
    for couleur, m in (('blanche', lap & (g > 200)), ('noire', lap & (g < 35))):
        m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(m)
        for i in range(1, n):
            x, y, w, h, ar = st[i]; frac = ar / (AW * AH)
            if not (0.08 < frac < 0.6): continue
            if ar / (w * h) > 0.75: continue                       # rectangle ou fond plein : pas une silhouette
            if x <= 1 and y <= 1 and x + w >= AW - 1: continue      # bande pleine largeur en haut (ciel)
            comp = lab == i
            if (d[comp] > 40).mean() < 0.5: continue                # elle vient d'apparaître
            cnt, _ = cv2.findContours(comp.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            c = max(cnt, key=cv2.contourArea)
            if cv2.contourArea(c) / (cv2.contourArea(cv2.convexHull(c)) + 1e-6) > 0.97: continue   # forme géométrique simple
            # un aplat parfaitement uni au bord net (masque) ; une zone surexposée ou un ciel blanc ont du grain et un bord flou
            inner = cv2.erode(comp.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
            bord = (cv2.dilate(comp.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0) & ~(cv2.erode(comp.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0)
            gm = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
            if not inner.any() or g[inner].std() > 1.0 or gm[bord].mean() < 30: continue
            return dict(sujet_centre_pct=[round((x + w / 2) / AW * 100), round((y + h / 2) / AH * 100)], sujet_taille_pct_ecran=round(frac * 100, 1),
                        sujet_boite_pct=[round(x / AW * 100), round(y / AH * 100), round(w / AW * 100), round(h / AH * 100)], silhouette=True, couleur=couleur)
    return None


def collages(S, events=()):
    """Collage / mosaïque : des panneaux rectangulaires (droits ou un peu penchés) viennent se poser sur l'image
    l'un après l'autre. À chaque arrivée, seule une zone en forme de quadrilatère change, le reste ne bouge pas."""
    G, NF, FPS, AW, AH = S['grays'], S['NF'], S['FPS'], S['AW'], S['AH']
    # pendant une séquence « sujet détouré, fond qui défile », les fonds qui changent ne sont pas des panneaux
    tdet = sorted(round(e['start_s'] * FPS) for e in events if e.get('sujet_boite_pct') and not e.get('silhouette'))
    masque = set()
    for i, k in enumerate(tdet):
        masque |= set(range(k - 3, k + 4))
        if i + 1 < len(tdet) and tdet[i + 1] - k <= FPS: masque |= set(range(k, tdet[i + 1] + 1))
    poses = []
    for k in range(1, NF):
        if k in masque: continue
        d = np.abs(G[k].astype(np.int16) - G[k - 1])
        if (d < 12).mean() < 0.35 or (d > 40).mean() < 0.05: continue    # une partie de l'image reste en place, une autre change
        e1 = cv2.Canny(G[k], 60, 160); e0 = cv2.dilate(cv2.Canny(G[k - 1], 60, 160), np.ones((5, 5), np.uint8))
        neuf = ((e1 > 0) & (e0 == 0)).astype(np.uint8) * 255      # bords qui viennent d'apparaître
        L = cv2.HoughLinesP(neuf, 1, np.pi / 180, 60, minLineLength=int(0.22 * min(AW, AH)), maxLineGap=6)
        if L is None: continue
        ang = [math.degrees(math.atan2(y2 - y1, x2 - x1)) % 180 for x1, y1, x2, y2 in L[:, 0]]
        hz = [a for a in ang if a < 20 or a > 160]; vt = [a for a in ang if 70 < a < 110]
        dif = lambda a, b: min(abs(a - b), 180 - abs(a - b))
        deux_sens = any(dif(a, b) > 30 for a in ang for b in ang)            # un panneau a des bords dans deux directions (un texte, non)
        if len(ang) < 3 or not deux_sens: continue
        pts = L[:, 0].reshape(-1, 2); x0, y0 = pts.min(0); x1, y1 = pts.max(0)
        if x1 - x0 > 0.95 * AW and y1 - y0 > 0.9 * AH: continue            # toute l'image : un changement de plan
        incl = np.median([((a + 90) % 180) - 90 if a > 90 else a for a in hz]) if hz else 0.0
        poses.append(dict(f=k, centre_pct=[round((x0 + x1) / 2 / AW * 100), round((y0 + y1) / 2 / AH * 100)],
                          taille_pct_ecran=round((x1 - x0) * (y1 - y0) / (AW * AH) * 100, 1), angle=round(float(incl), 1)))
    out = []
    for p in poses:                                              # panneaux à moins d'une seconde d'écart = un même collage
        if out and p['f'] - out[-1]['_fin'] <= FPS:
            out[-1]['panneaux'].append(p); out[-1]['_fin'] = p['f']
        else:
            out.append(dict(_debut=p['f'], _fin=p['f'], panneaux=[p]))
    res = []
    for o in out:
        if len(o['panneaux']) < 2: continue
        res.append(dict(type='collage (panneaux qui se posent)', start_s=round(o['_debut'] / FPS, 2), end_s=round(o['_fin'] / FPS + 0.3, 2),
                        nombre_de_panneaux=len(o['panneaux']), penches=any(abs(p['angle']) > 1.5 for p in o['panneaux']),
                        panneaux=[{k: v for k, v in p.items() if k != 'f'} | dict(t=round(p['f'] / FPS, 2)) for p in o['panneaux']]))
    return res


def detect(S):
    rows, grays, NF, FPS, W0, AW, AH = S['rows'], S['grays'], S['NF'], S['FPS'], S['W0'], S['AW'], S['AH']
    T = lambda f: round(f / FPS, 2)
    luma = np.array([r['luma'] for r in rows]); cstd = np.array([r['contrast'] for r in rows])
    hd = np.array([r['hd'] for r in rows]); ncc_c = np.array([r['ncc_comp'] for r in rows])
    sc = np.array([_scale(r['M']) for r in rows]); rot = np.array([_rot(r['M']) for r in rows])
    lap = np.array([r['lap'] for r in rows]); ani = np.array([r['sharp_x'] / (r['sharp_y'] + 1e-6) for r in rows])
    rbs = np.array([abs(r['rb_shift']) for r in rows])
    tx = np.array([abs(r['M'][0][2]) * S['SC'] if r['M'] else 0 for r in rows]); cover = np.array([r.get('cover', 1.0) for r in rows])
    flash = (luma > 225) & (cstd < 15); black = (luma < 18) & (cstd < 10)
    # flash sous des sous-titres ou un logo restés par-dessus : image d'un coup beaucoup plus claire que ses voisines
    lmed = np.array([np.median(np.r_[luma[max(0, k - 6):max(0, k - 1)], luma[k + 2:k + 7]]) if NF > 3 else luma[k] for k in range(NF)])
    flash |= (luma > 200) & (luma - lmed > 60) & (cstd < 80)
    calm = lambda k: 0 <= k < NF and abs(sc[k] - 1) < 0.006
    brk = np.zeros(NF, bool); reframe = {}
    for k in range(1, NF):
        if flash[k] or black[k] or flash[k - 1] or black[k - 1]: brk[k] = True
        elif ncc_c[k] < 0.55: brk[k] = True
        elif rows[k]['M'] and abs(math.log(sc[k])) > math.log(1.25): brk[k] = True; reframe[k] = sc[k]
        elif rows[k]['M'] and abs(math.log(sc[k])) > math.log(1.06) and calm(k - 1) and calm(k + 1): brk[k] = True; reframe[k] = sc[k]
    # changement progressif : nettement au-dessus de l'agitation habituelle du passage (images qui bougent sans arrêt)
    def _calme(lo, hi):                                         # agitation habituelle, hors ruptures
        w = hd[max(0, lo):max(0, hi)][~brk[max(0, lo):max(0, hi)]]
        return float(np.median(w)) if len(w) >= 4 else None
    hd_loc = np.zeros(NF)
    for k in range(NF):                                         # fenêtres à gauche et à droite, sans la transition elle-même
        v = [x for x in (_calme(k - 30, k - 8), _calme(k + 9, k + 31)) if x is not None]
        hd_loc[k] = min(v) if v else 0.0
    grad = (hd > np.maximum(0.012, 3 * hd_loc)) & (ncc_c < 0.995) & ~brk
    rb_loc = np.array([min(np.median(rbs[max(0, k - 30):max(1, k - 8)]), np.median(rbs[min(NF - 1, k + 9):min(NF, k + 31)]) if k + 9 < NF else 9) for k in range(NF)])
    grad |= (rbs > np.maximum(0.4, 4 * rb_loc)) & (ncc_c < 0.95)      # décalage rouge / bleu soudain (glitch)
    base_lap = lambda a: np.median(lap[max(0, a - 6):max(1, a - 1)])
    spinf = np.abs(rot) > 8
    blurz = np.zeros(NF, bool)
    for k in range(2, NF):
        if sc[k] > 1.05 and lap[k] < 0.6 * base_lap(k): blurz[k] = True
    whipf = (tx > 0.04 * W0) & (cover < 0.97)
    cand = brk | grad | spinf | blurz | whipf
    for k in range(1, NF - 1):                                  # on relie les trous d'une image
        if not cand[k] and cand[k - 1] and cand[k + 1]: cand[k] = True
    events, used = [], np.zeros(NF, bool)

    def add(typ, a, b, **kw):
        events.append(dict(type=typ, start_s=T(a), dur_frames=b - a + 1, dur_s=round((b - a + 1) / FPS, 2), **kw)); used[a:b + 1] = True
        for k in (a - 1, b + 1, b + 2):                         # la coupe qui ouvre ou ferme la transition en fait partie
            if 0 <= k < NF and brk[k] and not reframe.get(k): used[k] = True

    # flashs et fondus au noir
    for m, name in [(flash, 'flash blanc'), (black, 'fondu au noir')]:
        for a, b in runs(m):
            add(name, a, b); used[max(0, a - 1):b + 2] = True

    for a, b in runs(cand & ~used):
        L = b - a + 1
        if L < 2 and not spinf[a]: continue
        A = grays[max(0, a - 1)].astype(np.float32); B = grays[min(NF - 1, b + 1)].astype(np.float32)
        seg = range(a, b + 1)
        # rotation de transition
        if sum(spinf[k] for k in seg) >= 2:
            add('rotation de transition', a, b, degres=round(float(sum(rot[k] for k in seg)))); continue
        # glitch : décalage rouge / bleu et bandes déplacées
        rb0 = np.median(rbs[max(0, a - 8):max(1, a - 1)]) if a > 1 else 0.0
        if L <= 10 and sum(rbs[k] > max(0.4, 4 * rb0) for k in seg) >= 2:
            add('glitch', a, b); continue
        # fondu enchaîné : chaque image est un mélange des images avant / après
        D = A - B; dd = float((D * D).sum())
        if dd > 1e5 and L >= 3:
            al, rs = [], []
            for k in seg:
                f = grays[k].astype(np.float32); x = float(((f - B) * D).sum() / dd); al.append(x)
                rs.append(float(np.abs(f - (x * A + (1 - x) * B)).mean() / (np.abs(D).mean() + 1e-6)))
            if np.mean(rs) < 0.2 and al[0] > al[-1] + 0.4:
                lo_, hi_ = max(0, a - 12), min(NF - 1, b + 12)
                Ae = grays[lo_].astype(np.float32); Be = grays[hi_].astype(np.float32); De = Ae - Be; de = float((De * De).sum()) + 1e-6
                xs = {}
                for k in range(lo_, hi_ + 1):
                    f = grays[k].astype(np.float32); x = float(((f - Be) * De).sum() / de)
                    xs[k] = (x, np.abs(f - (x * Ae + (1 - x) * Be)).mean() / (np.abs(De).mean() + 1e-6))
                mid = min(seg, key=lambda k: abs(xs[k][0] - 0.5))
                dmed = np.median([xs[k + 1][0] - xs[k][0] for k in range(max(lo_, mid - 3), min(hi_, mid + 3))])
                ok_ = lambda k, k2: 0.02 < xs[k][0] < 0.98 and xs[k][1] < 0.15 and abs((xs[k2][0] - xs[k][0]) - dmed) < 0.6 * abs(dmed) + 1e-3
                a2 = mid
                while a2 - 1 > lo_ and ok_(a2 - 1, a2): a2 -= 1
                b2 = mid
                while b2 + 1 < hi_ and 0.02 < xs[b2 + 1][0] < 0.98 and xs[b2 + 1][1] < 0.15 and abs((xs[b2 + 1][0] - xs[b2][0]) - dmed) < 0.6 * abs(dmed) + 1e-3: b2 += 1
                add('fondu enchaîné', a2, b2); continue
        # rideau : une frontière droite sépare l'image d'avant et celle d'après, et elle avance
        pos = []
        for axis in (0, 1):
            per = {'debut': [], 'fin': []}
            for k in seg:
                f = grays[k].astype(np.float32)
                ea = np.abs(f - A).mean(axis=axis); eb = np.abs(f - B).mean(axis=axis)
                isB = eb < ea; n_ = len(isB); c = np.concatenate([[0], np.cumsum(isB)])
                fit = (np.minimum(ea, eb).mean()) / (np.abs(A - B).mean() + 1e-6)
                # « debut » : la nouvelle image arrive par le début de l'axe (gauche / haut) ; « fin » : par la fin
                eD = [(n_ - (c[p] + (n_ - p - (c[n_] - c[p]))), p) for p in range(n_ + 1)]
                eF = [((c[p] + (n_ - p - (c[n_] - c[p]))), n_ - p) for p in range(n_ + 1)]
                for side, ee in (('debut', eD), ('fin', eF)):
                    e, p = min(ee, key=lambda t: (t[0], abs(t[1] - n_ / 2)))
                    per[side].append((e / n_ if fit < 0.35 else 1.0, p / n_))
            side = min(per, key=lambda sd: sum(x[0] for x in per[sd]))
            pos += [(axis, e, p, side) for e, p in per[side]]
        best_axis = None
        for axis in (0, 1):
            pa = [x for x in pos if x[0] == axis]
            if pa and np.mean([x[1] for x in pa]) < 0.12:
                ps = [x[2] for x in pa]
                if np.all(np.diff(ps) >= -0.02) and ps[-1] - ps[0] > 0.3: best_axis = (axis, pa)
        big = np.abs(A - B) > 30
        if best_axis and L >= 3 and big.mean() > 0.35:            # un rideau remplace toute l'image (pas un simple bandeau qui entre)
            axis, pa = best_axis; side = pa[len(pa) // 2][3]
            d = ('vers la droite' if side == 'debut' else 'vers la gauche') if axis == 0 else ('vers le bas' if side == 'debut' else 'vers le haut')
            add('rideau', a, b, direction=d); continue
        # zoom de transition suivi directement : l'image grossit de plus de 3 % par image
        zf = [k for k in seg if rows[k]['M'] and sc[k] > 1.03]
        if len(zf) >= 2 and len(zf) >= 0.3 * L:
            add('zoom de transition', a, b, zoom_max_pct=round((float(np.prod([sc[k] for k in zf])) - 1) * 100)); continue
        # panoramique filé : flou de bougé directionnel fort
        base_ani = np.median(ani[max(0, a - 6):max(1, a - 1)]) if a > 1 else 1.0
        rel = [ani[k] / (base_ani + 1e-6) for k in seg]
        if L >= 3 and (min(rel) < 0.5 or max(rel) > 2.0):
            d = 'horizontal' if min(rel) < 0.5 else 'vertical'
            add('panoramique filé', a, b, direction=d); continue
        # zoom de transition : agrandissement + flou, puis changement d'image
        zs = []
        Ab = cv2.GaussianBlur(A, (0, 0), 4)
        for k in seg:
            fb = cv2.GaussianBlur(grays[k].astype(np.float32), (0, 0), 4); best = (-1, 1.0)
            for s in np.arange(1.0, 3.01, 0.1):
                Z = cv2.resize(Ab, None, fx=s, fy=s); y0 = (Z.shape[0] - AH) // 2; x0 = (Z.shape[1] - AW) // 2
                v = ncc(Z[y0:y0 + AH, x0:x0 + AW], fb)
                if v > best[0]: best = (v, float(s))
            zs.append(best)
        if L >= 3 and zs[-1][1] >= 1.4 and np.mean([z[0] for z in zs]) > 0.6 and zs[-1][1] > zs[0][1]:
            add('zoom de transition', a, b, zoom_max_pct=round((zs[-1][1] - 1) * 100)); continue
        # glissement : l'image d'avant se décale d'un bloc (suivi direct), l'image d'après entre
        wf = [k for k in seg if whipf[k]]
        if L >= 3 and len(wf) >= 0.5 * L:
            sx = sum(rows[k]['M'][0][2] for k in wf); sy = sum(rows[k]['M'][1][2] for k in wf)
            d = ('vers la gauche' if sx < 0 else 'vers la droite') if abs(sx) >= abs(sy) else ('vers le haut' if sy < 0 else 'vers le bas')
            key = 'sharp_x' if abs(sx) >= abs(sy) else 'sharp_y'           # flou de bougé dans le sens du mouvement = panoramique filé
            base = np.median([rows[k][key] for k in range(max(0, a - 6), max(1, a - 1))])
            if np.median([rows[k][key] for k in seg]) < 0.6 * base:
                add('panoramique filé', a, b, direction='horizontal' if abs(sx) >= abs(sy) else 'vertical', sens=d); continue
            add('glissement', a, b, direction=d); continue
        shifts = []
        for k in seg:
            f = grays[k].astype(np.float32); best = (1e9, 0)
            for s_ in range(-AW + 16, AW - 16, 4):
                e = np.abs(f[:, :AW - s_] - A[:, s_:]).mean() if s_ >= 0 else np.abs(f[:, -s_:] - A[:, :AW + s_]).mean()
                if e < best[0]: best = (e, s_)
            shifts.append(best[1])
        if L >= 3 and all(abs(s_) > 8 for s_ in shifts) and (np.all(np.diff(shifts) > 0) or np.all(np.diff(shifts) < 0)):
            add('glissement', a, b, direction='vers la gauche' if shifts[-1] > 0 else 'vers la droite'); continue
        cons = max((q - p + 1 for p, q in runs(brk[a:b + 1])), default=0)
        if L >= 4 and cons >= 3:                               # sinon : ce sont des coupes, traitées plus bas
            add('transition (autre)', a, b)
    # coupes sèches restantes (avec ou sans recadrage)
    orb = cv2.ORB_create(1500)
    for k in np.nonzero(brk & ~used)[0]:
        kind, extra = 'coupe sèche', {}
        det = _silhouette(S, k) or _sujet_detoure(S, k)
        if det:                                                  # le sujet reste, le fond change : masque / détourage
            kind, extra = ('silhouette (sujet rempli d\'une couleur)' if det.get('silhouette') else 'changement de fond (sujet détouré)'), det
        elif k in reframe:
            kind = 'coupe avec recadrage'; extra = dict(zoom_pct=round((reframe[k] - 1) * 100, 1))
        else:
            k1, d1 = orb.detectAndCompute(grays[k - 1], None); k2, d2 = orb.detectAndCompute(grays[k], None)
            if d1 is not None and d2 is not None and len(k1) > 40 and len(k2) > 40:
                m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2)
                if len(m) > 40:
                    a_ = np.float32([k1[x.queryIdx].pt for x in m]); b_ = np.float32([k2[x.trainIdx].pt for x in m])
                    M, inl = cv2.estimateAffinePartial2D(a_, b_, method=cv2.RANSAC, ransacReprojThreshold=3)
                    if M is not None and inl.sum() > max(40, 0.3 * len(m)):
                        z = math.hypot(M[0, 0], M[1, 0])
                        kind = 'coupe avec recadrage' if abs(z - 1) > 0.04 else 'jump cut'
                        extra = dict(zoom_pct=round((z - 1) * 100, 1)) if abs(z - 1) > 0.04 else {}
        events.append(dict(type=kind, start_s=T(k), dur_frames=0, dur_s=0, **extra)); used[k] = True
    events.sort(key=lambda e: e['start_s'])
    return events, used

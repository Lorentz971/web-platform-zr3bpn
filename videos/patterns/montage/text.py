"""Sous-titres et textes à l'écran : texte, moments, position, taille, style, mot surligné, animation."""
import numpy as np, cv2


def _stroke(fr, box):
    """Lettres claires bordées de sombre (contour) dans la bande du texte ; sinon simplement claires."""
    x, y, w, h = box; H0, W0 = fr.shape[:2]
    x0, y0 = max(0, int(x - .3 * w)), max(0, int(y - .6 * h)); x1, y1 = min(W0, int(x + 1.3 * w)), min(H0, int(y + 1.6 * h))
    mx = fr[y0:y1, x0:x1].max(axis=2)
    br = (mx > 170).astype(np.uint8); dk = (mx < 60).astype(np.uint8)
    m = br & cv2.dilate(dk, np.ones((7, 7), np.uint8))
    return m if m.sum() > 0.2 * br.sum() else br


def _band_mask(fr, box): return _stroke(fr, box) > 0


def _line_height(fr, box):
    """Hauteur des lettres (médiane des composantes) dans la zone, image par image, pour mesurer l'animation."""
    h = box[3]; m = _stroke(fr, box)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    hs = [st[i][3] for i in range(1, n) if 0.2 * h < st[i][3] < 3 * h and st[i][4] > 15 and st[i][2] < 3 * h]
    return float(np.median(hs)) if len(hs) >= 2 else 0


def detect(S, events=None):
    FPS, H0, W0 = S['FPS'], S['H0'], S['W0']
    T = lambda f: round(f / FPS, 2)
    samples = sorted(S['cap_samples'], key=lambda c: (c['f'], c['box'][1], -c['n_words']))
    ev = []
    for smp in samples:
        y = smp['box'][1] + smp['box'][3] / 2
        hit = None
        for e in reversed(ev):
            if smp['f'] - e['last'] > 2 * max(3, S.get('OCR_STEP', 3)): continue
            if abs(e['y'] - y) < 0.6 * max(e['h'], smp['box'][3]):
                if e['text'] == smp['text'] or (smp['text'].startswith(e['text'] + ' ') and smp['n_words'] > e['words']):
                    hit = e; break
        if not hit:                                     # deuxième lecture du même sous-titre (partielle) : on l'ignore
            for e in reversed(ev):
                if smp['f'] - e['last'] <= 2 * max(3, S.get('OCR_STEP', 3)) and abs(e['y'] - y) < 0.6 * max(e['h'], smp['box'][3]) and (e['text'].endswith(smp['text']) or smp['text'] in e['text']) and smp['f'] <= e['last']:
                    hit = 'skip'; break
        if hit == 'skip': continue
        if hit:
            if smp['text'] != hit['text']: hit['steps'] += 1
            hit.update(text=smp['text'], words=smp['n_words'], last=smp['f'], box=smp['box'], h=smp['box'][3],
                       hi=smp['highlight_word'] or hit['hi'], hic=smp['highlight_color'] or hit['hic'])
            hit['caps'].append(smp['majuscules']); hit['outline'].append(smp['contour'])
        else:
            ev.append(dict(text=smp['text'], first=smp['f'], last=smp['f'], words=smp['n_words'], y=y, h=smp['box'][3], box=smp['box'], steps=0,
                           hi=smp['highlight_word'], hic=smp['highlight_color'], caps=[smp['majuscules']], outline=[smp['contour']]))
    out = []
    step = max(3, S.get('OCR_STEP', 3))
    cap = cv2.VideoCapture(S['video']) if S.get('video') else None
    for e in ev:
        # début exact et animation : on mesure la hauteur du texte image par image autour du début
        hseq = {}; masks = {}
        if cap is not None:
            a0 = max(0, e['first'] - 2 * step + 1); cap.set(cv2.CAP_PROP_POS_FRAMES, a0)
            for f in range(a0, min(S['NF'], e['first'] + 10)):
                ok, fr = cap.read()
                if not ok: break
                hseq[f] = _line_height(fr, e['box']); masks[f] = _band_mask(fr, e['box'])
        final = np.median([v for f, v in hseq.items() if f >= e['first']] or [e['h']])
        f0 = e['first']
        while f0 - 1 in hseq and hseq[f0 - 1] > 0.5 * final and hseq[f0 - 1] <= 1.15 * max(1, hseq[f0]):
            m1, m0 = masks[f0], masks[f0 - 1]                  # changement brutal du texte = un autre sous-titre
            if (m1 ^ m0).sum() > 0.5 * max(1, (m1 | m0).sum()) and abs(hseq[f0 - 1] - hseq[f0]) <= 0.03 * final and abs(hseq[f0] - final) <= 0.05 * final: break
            f0 -= 1
        hs = [hseq[f] for f in range(f0, f0 + 9) if f in hseq and hseq[f] > 0]
        if e['steps'] >= 2: anim = 'mot par mot'
        elif len(hs) >= 4 and hs[0] < 0.85 * hs[-1] and max(hs) > 1.04 * hs[-1]: anim = 'pop avec rebond'
        elif len(hs) >= 4 and hs[0] < 0.85 * hs[-1] and min(hs) == hs[0] and hs[-1] / hs[0] > 1.25: anim = 'pop'
        elif len(hs) >= 4 and hs[0] < 0.85 * hs[-1]: anim = 'agrandissement'
        else: anim = 'apparition sèche'
        x, y, w, h = e['box']
        out.append(dict(text=e['text'], start_s=T(f0), dur_s=round((e['last'] + step - f0) / FPS, 2), mots=e['words'], animation=anim,
                        mot_surligne=e['hi'], couleur_surlignage=e['hic'], majuscules=bool(np.mean(e['caps']) > 0.5), contour_noir=bool(np.mean(e['outline']) > 0.5),
                        centre_x_pct=round((x + w / 2) / W0 * 100), centre_y_pct=round((y + h / 2) / H0 * 100), hauteur_pct=round(h / H0 * 100, 1),
                        _box=e['box'], _f0=e['first'], _f1=e['last']))
    out = [o for o in out if o['dur_s'] >= 0.15]
    out, exclus = _trier(S, out, events)
    # sous-titres = la bande verticale qui revient le plus souvent avec des textes courts
    short = [o for o in out if o['dur_s'] <= 3.5]
    if short:
        bands = {}
        for o in short: bands.setdefault(round(o['centre_y_pct'] / 6), []).append(o)
        band = max(bands, key=lambda k: len(bands[k]))
        caps = [o for o in out if abs(o['centre_y_pct'] / 6 - band) <= 1 and o['dur_s'] <= 3.5]
    else:
        caps = []
    others = [o for o in out if o not in caps]
    summ = dict(nombre=len(caps))
    if caps:
        hc = [c['couleur_surlignage'] for c in caps if c['couleur_surlignage']]
        anims = [c['animation'] for c in caps]
        summ.update(mots_par_sous_titre=round(float(np.mean([c['mots'] for c in caps])), 1), duree_moyenne_s=round(float(np.mean([c['dur_s'] for c in caps])), 2),
                    position_y_pct=round(float(np.median([c['centre_y_pct'] for c in caps]))), hauteur_texte_pct=round(float(np.median([c['hauteur_pct'] for c in caps])), 1),
                    couleur_surlignage=max(set(hc), key=hc.count) if hc else None, part_avec_mot_surligne_pct=round(100 * sum(1 for c in caps if c['mot_surligne']) / len(caps)),
                    majuscules=bool(np.mean([c['majuscules'] for c in caps]) > 0.5), contour_noir=bool(np.mean([c['contour_noir'] for c in caps]) > 0.5),
                    animations={a: anims.count(a) for a in set(anims)})
    summ['filigranes'] = exclus['filigranes']; summ['textes_de_la_scene'] = exclus['scene']
    for o in caps + others:
        for k in ('_box', '_f0', '_f1'): o.pop(k, None)
    return caps, summ, others


def _fixite(S, box, f):
    """Le texte reste-t-il collé à l'écran pendant que l'image bouge ? (incrusté au montage)
    Renvoie (part des contours du texte encore à la même place 3 images plus loin, agitation de l'image autour)."""
    G, SC, NF = S['grays'], S['SC'], S['NF']
    x, y, w, h = [int(round(v / SC)) for v in box]; x, y = max(0, x), max(0, y)
    best, agit = 0.0, 0.0
    for d in (3, -3, 6):
        f2 = f + d
        if not (0 <= f2 < NF) or w < 4 or h < 3: continue
        a, b = G[f][y:y + h, x:x + w], G[f2][y:y + h, x:x + w]
        if a.size == 0 or a.shape != b.shape: continue
        ea = cv2.Canny(a, 60, 160) > 0; eb = cv2.dilate((cv2.Canny(b, 60, 160) > 0).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        if ea.sum() < 8: continue
        best = max(best, float((ea & eb).sum() / ea.sum()))
        agit = max(agit, float(np.abs(G[f].astype(np.int16) - G[f2]).mean()))
    return best, agit


def _deplacement(S, box, f):
    """De combien de pixels par image le texte se déplace-t-il ? (corrélation de phase sur la zone du texte)
    Un texte incrusté au montage reste immobile ; un logo filmé suit la caméra."""
    G, SC, NF, AW, AH = S['grays'], S['SC'], S['NF'], S['AW'], S['AH']
    x, y, w, h = [int(round(v / SC)) for v in box]; pad = 4
    x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(AW, x + w + pad), min(AH, y + h + pad)
    out = []
    for d in (1, 2):
        if f + d >= NF or y1 - y0 < 6 or x1 - x0 < 6: continue
        a = G[f][y0:y1, x0:x1].astype(np.float32); b = G[f + d][y0:y1, x0:x1].astype(np.float32)
        win = cv2.createHanningWindow((a.shape[1], a.shape[0]), cv2.CV_32F)
        (dx, dy), r = cv2.phaseCorrelate(a, b, win)
        if r > 0.25: out.append(float(np.hypot(dx, dy)) / d)
    return out


def _trier(S, out, events=None):
    """Sépare les textes incrustés au montage (sous-titres, titres) des filigranes (logo TikTok, @compte, signature
    du monteur, toujours au même endroit) et des textes de la scène (logos de sponsors, panneaux : ils bougent avec l'image)."""
    dur = S['NF'] / S['FPS']; garde, fil, scene, scene_fort = [], [], [], []
    FPS = S['FPS']; step = max(3, S.get('OCR_STEP', 3))
    if events is not None:                                 # vraies coupes et transitions trouvées par l'analyse
        coupes = [0] + sorted(round(e['start_s'] * FPS) for e in events) + [S['NF']]
    else:
        coupes = [0] + [k for k in range(1, S['NF']) if S['rows'][k]['ncc_comp'] < 0.55] + [S['NF']]
    def cale_sur_le_plan(o):
        """Le texte naît et meurt avec le plan (il fait partie de l'image filmée) ?"""
        f0, f1 = round(o['start_s'] * FPS), o['_f1']
        debut = any(0 <= f0 - c <= step for c in coupes)         # il apparaît juste après une coupe
        fin = any(0 <= c - f1 <= step + 2 for c in coupes)
        traverse = any(f0 + 2 < c < f1 - 2 for c in coupes[1:-1])     # il reste à l'écran pendant une coupe : incrusté
        graphique = np.median([S['rows'][k]['flat2'] for k in range(max(0, f0), min(S['NF'], f1 + 1))] or [0]) > 0.5   # carton, capture d'écran
        return debut and fin and not traverse and not graphique
    zones = {}
    for o in out: zones.setdefault((round(o['centre_x_pct'] / 6), round(o['centre_y_pct'] / 6)), []).append(o)
    for o in out:
        t = o['text'].strip(); tl = t.lower()
        z = zones[(round(o['centre_x_pct'] / 6), round(o['centre_y_pct'] / 6))]
        nt = ''.join(ch for ch in t.upper() if ch.isalnum())
        same = [x for x in z if ''.join(ch for ch in x['text'].upper() if ch.isalnum()) == nt]
        etale = lambda L: (max(x['start_s'] for x in L) - min(x['start_s'] for x in L)) > 0.3 * dur   # présent du début à la fin
        recurrent = (len(z) >= 2 and sum(x['dur_s'] for x in z) > 0.3 * dur and len(set(x['text'] for x in z)) <= 3 and etale(z)) or (len(same) >= 4 and etale(same))
        if t.startswith('@') or 'tiktok' in tl.replace(' ', '') or 'capcut' in tl or recurrent:
            fil.append(o); continue
        dep = [v for f in sorted({(o['_f0'] + o['_f1']) // 2, o['_f1']}) for v in _deplacement(S, o['_box'], f)]   # texte complet (pas pendant qu'il s'écrit)
        if dep and np.median(dep) > 1.5: scene.append(o); scene_fort.append(o); continue   # il suit la caméra : texte filmé (logo, panneau)
        if o['animation'] == 'apparition sèche' and cale_sur_le_plan(o): scene.append(o); continue   # un texte animé est forcément incrusté
        garde.append(o)
    # un même mot qui revient à plusieurs endroits différents de l'image = un logo dans la scène
    from collections import Counter
    cnt = Counter(o['text'].upper().replace(' ', '') for o in garde)
    pos = {}
    for o in garde: pos.setdefault(o['text'].upper().replace(' ', ''), set()).add((round(o['centre_x_pct'] / 10), round(o['centre_y_pct'] / 10)))
    from difflib import SequenceMatcher
    norm = lambda t: ''.join(ch for ch in t.upper() if ch.isalnum())
    sim = lambda a, b: SequenceMatcher(None, norm(a), norm(b)).ratio()
    garde2 = []
    for o in garde:
        k = o['text'].upper().replace(' ', '')
        if cnt[k] >= 3 and len(pos[k]) >= 3: scene.append(o)
        elif any(sim(o['text'], x['text']) > 0.8 for x in scene_fort): scene.append(o)   # même mot que des logos filmés ailleurs
        elif any(sim(o['text'], x['text']) > 0.8 or (len(norm(o['text'])) >= 3 and norm(o['text']) in norm(x['text'])) for x in fil): fil.append(o)
        else: garde2.append(o)
    # même texte lu deux fois à la suite (lecture partielle) : on garde la lecture la plus complète
    garde2.sort(key=lambda o: o['start_s']); fus = []
    for o in garde2:
        p_ = next((q for q in reversed(fus) if abs(q['centre_y_pct'] - o['centre_y_pct']) <= 4 and o['start_s'] <= q['start_s'] + q['dur_s'] + 0.4
                   and (norm(o['text']) in norm(q['text']) or norm(q['text']) in norm(o['text']) or sim(o['text'], q['text']) > 0.7)), None)
        if p_:
            fin = max(p_['start_s'] + p_['dur_s'], o['start_s'] + o['dur_s'])
            if len(norm(o['text'])) > len(norm(p_['text'])): p_.update(text=o['text'], mots=o['mots'])
            p_['dur_s'] = round(fin - p_['start_s'], 2)
        else: fus.append(o)
    garde2 = fus
    resume = lambda L: sorted({o['text'] for o in L})[:60]
    return garde2, dict(filigranes=resume(fil), scene=resume(scene))

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


def detect(S):
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
                        centre_x_pct=round((x + w / 2) / W0 * 100), centre_y_pct=round((y + h / 2) / H0 * 100), hauteur_pct=round(h / H0 * 100, 1)))
    out = [o for o in out if o['dur_s'] >= 0.15]
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
    return caps, summ, others

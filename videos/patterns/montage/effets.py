"""Effets d'image des edits : glow / halo, néon, fuite de lumière, noir et blanc, négatif, teinte unique ou bichromie,
aberration chromatique, flou qui s'ouvre, stroboscope, saccade (images répétées), miroir, bandes noires qui bougent.
Une passe légère sur la vidéo réduite (couleurs), puis des épisodes regroupés avec leur durée."""
import numpy as np, cv2
from .common import runs


def _mesures(video, NF):
    cap = cv2.VideoCapture(video); out = []
    W = 192
    for k in range(NF):
        ok, fr = cap.read()
        if not ok: break
        h = int(round(fr.shape[0] * W / fr.shape[1])); s = cv2.resize(fr, (W, h), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(s, cv2.COLOR_BGR2HSV); g = cv2.cvtColor(s, cv2.COLOR_BGR2GRAY).astype(np.float32)
        sat = hsv[..., 1].astype(np.float32); hue = hsv[..., 0]
        col = (sat > 60) & (hsv[..., 2] > 50)
        hist = np.bincount((hue[col] // 15).ravel(), minlength=12).astype(float) if col.any() else np.zeros(12)
        # bichromie : les ombres d'une couleur, les lumières d'une autre (on regarde séparément le sombre et le clair)
        val = hsv[..., 2]; c2 = sat > 50
        sombre = c2 & (val < np.percentile(val, 40)); clair = c2 & (val > np.percentile(val, 60))
        hd = np.bincount((hue[sombre] // 15).ravel(), minlength=12).astype(float) if sombre.sum() > 30 else np.zeros(12)
        hc = np.bincount((hue[clair] // 15).ravel(), minlength=12).astype(float) if clair.sum() > 30 else np.zeros(12)
        # glow : autour des zones très claires, la lumière « bave » (anneau proche plus clair que l'anneau lointain)
        br = (g > 235).astype(np.uint8); glow = 0.0; neon = 0.0
        if 0.002 < br.mean() < 0.35:
            # glow : profil de lumière autour des zones très claires (distance 1 à 22 pixels) : il décroît doucement et sans détail
            dist = cv2.distanceTransform((1 - br).astype(np.uint8), cv2.DIST_L2, 3)
            bandes = [(dist >= a) & (dist < b) & (g > 15) for a, b in ((1, 4), (4, 8), (8, 14), (14, 22))]
            if all(x.sum() > 20 for x in bandes):
                prof = [float(g[x].mean()) for x in bandes]
                lisse = br.mean() > 0.008                     # une vraie source lumineuse (pas un petit texte blanc)
                if prof[0] > prof[1] > prof[2] > prof[3] - 2 and prof[0] - prof[3] > 25 and prof[1] - prof[3] > 8 and lisse: glow = prof[0] - prof[3]   # le halo s'étend loin (pas un simple liseré)
        # néon : dans une image sombre, des tracés fins très lumineux entourés d'un halo coloré
        if np.median(g) < 80:
            th = (cv2.morphologyEx(g, cv2.MORPH_TOPHAT, np.ones((7, 7), np.uint8)) > 70).astype(np.uint8)
            if th.mean() > 0.003:
                ring = (cv2.dilate(th, np.ones((7, 7), np.uint8)) > 0) & (th == 0)
                if ring.any() and sat[ring].mean() > 90: neon = float(sat[ring].mean())
        lap = float(cv2.Laplacian(g, cv2.CV_32F).var())
        sym = float(np.corrcoef(g.ravel(), g[:, ::-1].ravel())[0, 1]) if g.std() > 3 else 0.0
        # fuite de lumière : un bord de l'image baigné d'une lumière chaude très douce (peu de détail, rouge-orangé)
        warm = ((hue < 25) | (hue > 165)) & (sat > 80) & (hsv[..., 2] > 170)
        bords = [warm[:, :W // 5].mean(), warm[:, -W // 5:].mean(), warm[:h // 5].mean(), warm[-h // 5:].mean()]
        out.append(dict(sat=float(sat.mean()), luma=float(g.mean()), hist=hist, hd=hd, hc=hc, glow=glow, neon=neon, lap=lap, sym=sym,
                        g=cv2.resize(g, (64, int(round(64 * h / W)))), fuite=float(max(bords))))
    return out


def detect(S, events=()):
    """Renvoie une liste d'effets : dict(type, start_s, end_s, …)."""
    NF, FPS = S['NF'], S['FPS']; rows = S['rows']
    if not S.get('video'): return []
    m = _mesures(S['video'], NF); n = len(m)
    if n < 10: return []
    T = lambda f: round(f / FPS, 2)
    coupes = sorted({0, n} | {round(e['start_s'] * FPS) for e in events})
    out = []
    def ajoute(typ, a, b, **kw):
        if b - a + 1 >= 1: out.append(dict(type=typ, start_s=T(a), end_s=T(b + 1), dur_s=round((b - a + 1) / FPS, 2), **kw))
    sat = np.array([x['sat'] for x in m]); luma = np.array([x['luma'] for x in m])
    satm = np.median(sat)
    # noir et blanc : presque plus de couleur, alors que le reste de la vidéo en a
    if satm > 25:
        for a, b in runs(sat < 8):
            if b - a + 1 >= max(3, int(0.15 * FPS)) and luma[a:b + 1].mean() > 20: ajoute('noir et blanc', a, b)
    # teinte unique / bichromie : toutes les couleurs ramenées à une ou deux teintes, sur un passage
    noms = ['rouge', 'orange', 'jaune', 'jaune-vert', 'vert', 'vert', 'cyan', 'bleu', 'bleu', 'violet', 'magenta', 'rose']
    mono = []
    for k, x in enumerate(m):
        hst = x['hist']; tot = hst.sum()
        if tot < 30 or x['sat'] < 25: mono.append(None); continue
        o = np.argsort(hst)[::-1]; p1, p2 = hst[o[0]] / tot, (hst[o[0]] + hst[o[1]]) / tot
        # groupes de teintes voisines (le cercle des couleurs est découpé en 12) : 1 groupe = teinte unique, 2 = bichromie
        grp, vu = [], set()
        for i in np.argsort(hst)[::-1]:
            if hst[i] / tot < 0.03 or i in vu: continue
            g_ = {i}; j = i
            while len(g_) < 3 and hst[(j + 1) % 12] / tot >= 0.03 and (j + 1) % 12 not in vu and (j + 1) % 12 not in g_: j = (j + 1) % 12; g_.add(j)
            j = i
            while len(g_) < 3 and hst[(j - 1) % 12] / tot >= 0.03 and (j - 1) % 12 not in vu and (j - 1) % 12 not in g_: j = (j - 1) % 12; g_.add(j)
            vu |= g_; grp.append((sum(hst[q] for q in g_) / tot, int(i)))
        grp.sort(reverse=True)
        if len(grp) >= 2 and grp[0][0] + grp[1][0] > 0.92 and grp[1][0] >= 0.07: mono.append(('bichromie', f"{noms[grp[0][1]]} + {noms[grp[1][1]]}"))
        elif grp and grp[0][0] > 0.9: mono.append(('teinte unique', noms[grp[0][1]]))
        else: mono.append(None)
    k = 0
    while k < n:
        if mono[k]:
            j = k
            while j + 1 < n and mono[j + 1] and mono[j + 1][0] == mono[k][0]: j += 1
            if j - k + 1 >= int(0.3 * FPS): ajoute(mono[k][0] + ' (étalonnage stylisé)', k, j, couleurs=mono[(k + j) // 2][1])
            k = j + 1
        else: k += 1
    # négatif : l'image devient l'inverse de la précédente
    for k in range(1, n):
        a, b = m[k - 1]['g'], m[k]['g']
        if a.std() > 10 and b.std() > 10 and np.corrcoef(a.ravel(), (255 - b).ravel())[0, 1] > 0.85: ajoute('négatif (inversion)', k, k)
    # glow : halo nettement plus fort que d'habitude dans la vidéo
    gl = np.array([x['glow'] for x in m]); base = float(np.median(gl))
    w2 = int(1.5 * FPS); w5 = int(5 * FPS)
    voisin = np.array([np.percentile(gl[max(0, k - w5):k + w5 + 1], 25) for k in range(n)])   # niveau habituel autour (5 s)
    for a, b in runs((gl > max(15, base + 15)) & (gl > voisin + 12)):
        if b - a + 1 >= 3: ajoute('glow / halo lumineux', a, b, intensite=round(float(gl[a:b + 1].mean()), 1))
    ne = np.array([x['neon'] for x in m]) > 0
    part_ne = np.zeros(n)
    for c0, c1 in zip(coupes, coupes[1:]):                      # part du plan où l'on voit ces lumières
        if c1 > c0: part_ne[c0:c1] = ne[c0:c1].mean() if (c1 - c0) > 4 * FPS else 0.0   # long plan (interview, décor) : on regarde la part
    for a, b in runs(ne & (part_ne < 0.5)):                       # présent presque tout le plan : c'est le décor (lampes), pas un effet
        if b - a + 1 >= 4: ajoute('néon (contour lumineux)', a, b)
    # fuite de lumière
    fu = np.array([x['fuite'] for x in m])
    for a, b in runs(fu > 0.35):
        if b - a + 1 >= 4 and np.median(fu) < 0.15: ajoute('fuite de lumière (light leak)', a, b)
    # aberration chromatique : décalage rouge / bleu modéré et durable (le glitch, lui, est bref et violent)
    rb = np.array([abs(r['rb_shift']) for r in rows[:n]])
    for a, b in runs((rb > max(0.6, 4 * np.median(rb))) & (rb < 3)):
        if b - a + 1 >= int(0.4 * FPS): ajoute('aberration chromatique', a, b)
    # flou qui s'ouvre : au début d'un plan, la netteté monte franchement
    lap = np.array([x['lap'] for x in m])
    for c0, c1 in zip(coupes, coupes[1:]):
        if c1 - c0 < 10: continue
        seg = lap[c0:c1]; i_max = int(np.argmax(seg[:min(len(seg), int(1.5 * FPS))]))
        immobile = np.mean([rows[c0 + q]['ncc_comp'] for q in range(1, i_max + 1)]) > 0.9 if i_max >= 1 else False
        if i_max >= 4 and seg[0] < 0.25 * seg[i_max] and immobile and np.all(np.diff(np.convolve(seg[:i_max + 1], np.ones(3) / 3, 'valid')) > -0.15 * seg[i_max]):
            ajoute("flou qui s'ouvre (mise au point)", c0, c0 + i_max)
    # stroboscope : la luminosité clignote image sur image
    dl = np.diff(luma); k = 1
    while k < n - 6:
        j = k
        while j + 1 < n - 1 and abs(dl[j]) > 40 and np.sign(dl[j]) != np.sign(dl[j - 1]): j += 1
        if j - k >= 5: ajoute('stroboscope', k, j); k = j + 1
        else: k += 1
    # saccade : dans un plan qui bouge, des images répétées régulièrement (images figées en rafale)
    chg = np.array([r['chg'] for r in rows[:n]])
    rep = (chg < 0.0005); act = chg > 0.01
    glob_rep = float(np.median([rep[i:i + int(FPS)].mean() for i in range(0, max(1, n - int(FPS)), int(FPS))]))   # images doublées « normales » de la vidéo
    for k in range(0, n - int(FPS), max(1, int(FPS // 3))):
        w = slice(k, k + int(FPS))
        if rep[w].sum() >= 4 and act[w].sum() >= 6 and rep[w].mean() > max(0.25, 3 * rep.mean() * (n / max(1, n - rep[w].sum()))) * 0 + max(0.25, 3 * glob_rep) and not any(c in range(k, k + int(FPS)) for c in coupes[1:-1]):
            if not out or out[-1]['type'] != 'saccade (images répétées)' or k / FPS > out[-1]['end_s']:
                ajoute('saccade (images répétées)', k, k + int(FPS) - 1)
            else:
                out[-1]['end_s'] = T(k + int(FPS)); out[-1]['dur_s'] = round(out[-1]['end_s'] - out[-1]['start_s'], 2)
    # miroir : l'image devient symétrique gauche / droite (alors que d'habitude elle ne l'est pas)
    sy = np.array([x['sym'] for x in m])
    if np.median(sy) < 0.7:
        for a, b in runs(sy > 0.93):
            if b - a + 1 >= 4: ajoute('effet miroir', a, b)
    # bandes noires qui se ferment ou s'ouvrent (effet cinéma)
    tb = np.array([r['top_bar'] for r in rows[:n]], float) / S['H0']
    sm = np.convolve(tb, np.ones(5) / 5, 'same')
    for k in range(5, n - 5):
        if abs(sm[k + 4] - sm[k - 4]) > 0.06 and min(sm[k - 4], sm[k + 4]) < 0.03 and not any(abs(k - c) < 5 for c in coupes[1:-1]):
            sens = 'se ferment' if sm[k + 4] > sm[k - 4] else "s'ouvrent"
            if not out or out[-1]['type'] != f'bandes noires qui {sens}' or k / FPS - out[-1]['end_s'] > 0.5:
                ajoute(f'bandes noires qui {sens}', k - 4, k + 4)
    out.sort(key=lambda e: (e['type'], e['start_s']))
    fus = []                                                       # morceaux d'un même effet à moins de 0,4 s : un seul effet
    for e in out:
        if fus and fus[-1]['type'] == e['type'] and e['start_s'] - fus[-1]['end_s'] <= 0.4:
            fus[-1]['end_s'] = max(fus[-1]['end_s'], e['end_s']); fus[-1]['dur_s'] = round(fus[-1]['end_s'] - fus[-1]['start_s'], 2)
        else: fus.append(e)
    # ce qui couvre une grande partie de la vidéo n'est pas un effet ponctuel : c'est le style de la vidéo
    dur = n / FPS; res, styles = [], {}
    for e in fus:
        styles.setdefault(e['type'], []).append(e)
    for typ, L in styles.items():
        cov = sum(e['dur_s'] for e in L) / dur
        if cov > 0.4 and typ not in ('négatif (inversion)', 'stroboscope'):
            cs = [e.get('couleurs') for e in L if e.get('couleurs')]
            res.append(dict(type='style global : ' + typ, start_s=0.0, end_s=round(dur, 2), dur_s=round(dur, 2), part_de_la_video_pct=round(100 * cov),
                            **(dict(couleurs=max(set(cs), key=cs.count)) if cs else {})))
        else: res += L
    res.sort(key=lambda e: e['start_s'])
    return res

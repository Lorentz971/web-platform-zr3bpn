"""Banque de rushs : on passe UNE fois sur nos rushs et on note, moment par moment, ce qu'on y voit
(personnes, cadrage, geste, expression, mouvement, luminosité, couleurs, netteté, coupes internes).
Le résultat est mis en cache (.banque-rushs.json à côté des rushs) : les fois suivantes, c'est instantané.
On peut ensuite chercher dedans (« gros plan bras levés », « plan large mouvement fort »…) et remplir un modèle."""
import json, os, re
import numpy as np
import cv2
from . import contenu, sens

VERSION = 3
PAS_CONTENU_S = 0.5          # une description (MediaPipe) toutes les 0,5 s
PAS_MOUVEMENT_S = 0.1


def _cle(path):
    st = os.stat(path); return f'{os.path.abspath(path)}|{st.st_size}|{int(st.st_mtime)}|v{VERSION}'


def _cache(dossier):
    return os.path.join(dossier, '.banque-rushs.json')


def indexer_rush(path, log=print):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30; N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    pas_m = max(1, int(round(fps * PAS_MOUVEMENT_S))); pas_c = max(1, int(round(fps * PAS_CONTENU_S)))
    prev = None; prev_h = None; mouv = []; coupes = []; ech = []; i = 0; petites = []
    avec_sens = sens.disponible()
    while True:
        ok = cap.grab()
        if not ok: break
        if i % pas_m == 0:
            ok, fr = cap.retrieve()
            if not ok: break
            t = i / fps
            sm = cv2.resize(fr, (160, max(1, int(160 * H / max(W, 1)))), interpolation=cv2.INTER_AREA)
            g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY).astype(np.float32)
            h = cv2.calcHist([cv2.cvtColor(sm, cv2.COLOR_BGR2HSV)], [0, 1], None, [16, 8], [0, 180, 0, 256]); cv2.normalize(h, h)
            if prev is not None:
                d = float(np.abs(g - prev).mean()) / 2.55 / pas_m          # % d'écart par image
                if prev_h is not None and cv2.compareHist(prev_h, h, cv2.HISTCMP_BHATTACHARYYA) > 0.5 and d > 3: coupes.append(round(t, 2))
                mouv.append((round(t, 2), round(d, 3)))
            prev, prev_h = g, h
            if i % pas_c == 0:
                hsv = cv2.cvtColor(sm, cv2.COLOR_BGR2HSV)
                sat = hsv[..., 1].astype(np.float32); m = sat > 60
                teinte = int(np.median(hsv[..., 0][m]) * 2) if m.mean() > 0.08 else None
                e = dict(t=round(t, 2), lum=round(float(g.mean()) / 2.55, 1), sat=round(float(sat.mean()) / 2.55, 1), teinte=teinte,
                         net=round(float(cv2.Laplacian(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()), 0))
                d_ = contenu.decrire(fr) if contenu.disponible() else None
                if d_: e.update({k: d_[k] for k in ('personnes', 'cadrage', 'geste', 'expression', 'sujet_boite_pct') if k in d_})
                ech.append(e)
                if avec_sens:                                       # image réduite gardée pour CLIP (calcul par lots à la fin)
                    sc = 256 / min(fr.shape[:2]); petites.append(cv2.resize(fr, (round(fr.shape[1] * sc), round(fr.shape[0] * sc)), interpolation=cv2.INTER_AREA))
        i += 1
    cap.release()
    duree = N / fps if N else (i / fps)
    vec = None
    if avec_sens and petites:
        try: vec = sens.vers_texte(sens.images(petites))
        except Exception as ex: log(f'  (recherche par le sens indisponible : {ex})')
    tm = np.array([m[0] for m in mouv]) if mouv else np.zeros(0); vm = np.array([m[1] for m in mouv]) if mouv else np.zeros(0)
    for e in ech:                                                   # mouvement moyen autour de chaque échantillon (±0,3 s)
        sel = vm[(tm >= e['t'] - 0.3) & (tm <= e['t'] + 0.3)] if len(tm) else []
        e['mouvement'] = round(float(np.median(sel)), 2) if len(sel) else 0.0
    bornes = [0.0] + coupes + [round(duree, 2)]
    segments = [dict(de=a, a=b) for a, b in zip(bornes, bornes[1:]) if b - a > 0.2]
    info = dict(nom=os.path.basename(path), chemin=os.path.abspath(path), duree_s=round(duree, 2), fps=round(fps, 3), largeur=W, hauteur=H,
                orientation='vertical' if H > W else 'horizontal' if W > H else 'carré', segments=segments, echantillons=ech, sens=vec)
    gestes = sorted({e['geste'] for e in ech if e.get('geste') and e['geste'] != 'debout, neutre'})
    log(f"  {info['nom']} : {duree:.1f} s, {len(segments)} séquence(s), {sum(1 for e in ech if e.get('personnes'))}/{len(ech)} moments avec quelqu'un"
        + (f", gestes : {', '.join(gestes)}" if gestes else ''))
    return info


def indexer(chemins, log=print):
    """chemins : fichiers ou dossiers. Renvoie la banque (liste de rushs indexés), avec cache par dossier."""
    fichiers = []
    for p in chemins:
        if os.path.isdir(p):
            fichiers += sorted(os.path.join(p, f) for f in os.listdir(p) if f.lower().endswith(('.mp4', '.mov', '.m4v', '.mkv', '.webm', '.avi')))
        else: fichiers.append(p)
    caches = {}; banque = []
    log(f'Banque de rushs : {len(fichiers)} fichier(s)')
    for f in fichiers:
        d = os.path.dirname(os.path.abspath(f)); c = _cache(d)
        if d not in caches:
            try: caches[d] = json.load(open(c))
            except Exception: caches[d] = {}
        k = _cle(f)
        if k in caches[d]: banque.append(caches[d][k]); log(f"  {os.path.basename(f)} : déjà indexé"); continue
        info = indexer_rush(f, log); caches[d][k] = info; banque.append(info)
        try: json.dump({k_: {a: b for a, b in v.items() if not a.startswith('_')} for k_, v in caches[d].items()}, open(c, 'w'), ensure_ascii=False)
        except OSError: pass
    contenu._fermer()
    return banque


# ---------- recherche ----------
MOTS = {  # mots de la recherche libre → critère
    'gros plan': ('cadrage', 'gros plan'), 'plan moyen': ('cadrage', 'plan moyen'), 'plan large': ('cadrage', 'plan large'),
    'sans personne': ('cadrage', 'sans personne'), 'décor': ('cadrage', 'sans personne'), 'paysage': ('cadrage', 'sans personne'),
    'bras levés': ('geste', 'bras levés (célébration)'), 'célébration': ('geste', 'bras levés (célébration)'), 'celebration': ('geste', 'bras levés (célébration)'),
    'poing': ('geste', 'poing ou main levée'), 'main levée': ('geste', 'poing ou main levée'), 'mains sur la tête': ('geste', 'mains sur la tête / le visage'),
    'main près du visage': ('geste', 'main près du visage'), 'bras croisés': ('geste', 'bras croisés ou mains jointes'), 'montre du doigt': ('geste', 'montre du doigt'),
    'sourire': ('expression', 'sourire'), 'cri': ('expression', 'bouche grande ouverte (cri, joie)'), 'joie': ('expression', 'bouche grande ouverte (cri, joie)'),
    'concentré': ('expression', 'sourcils froncés (concentration, colère)'), 'colère': ('expression', 'sourcils froncés (concentration, colère)'),
    'mouvement fort': ('mouvement', 'fort'), 'rapide': ('mouvement', 'fort'), 'action': ('mouvement', 'fort'), 'calme': ('mouvement', 'calme'), 'lent': ('mouvement', 'calme'),
    'sombre': ('lumineux', 25), 'nuit': ('lumineux', 25), 'lumineux': ('lumineux', 70), 'clair': ('lumineux', 70),
    'coloré': ('sature', 55), 'saturé': ('sature', 55), 'terne': ('sature', 15), 'noir et blanc': ('sature', 3),
    'seul': ('personnes', 1), 'une personne': ('personnes', 1), 'plusieurs': ('personnes', 2), 'groupe': ('personnes', 3), 'foule': ('personnes', 4),
}


def besoin_depuis_texte(q):
    q = q.lower(); b = {}
    for k in sorted(MOTS, key=len, reverse=True):
        if k in q: champ, v = MOTS[k]; b.setdefault(champ, v); q = q.replace(k, ' ')
    return b


def classe_mouvement(v):
    return 'fort' if v > 1.6 else 'moyen' if v > 0.5 else 'calme'


def vecteurs(r):
    if '_vec' not in r: r['_vec'] = sens.depuis_texte(r['sens']) if r.get('sens') else None
    return r['_vec']


def preparer_requete(banque, requete):
    """Similarité de chaque moment de chaque rush avec la phrase, ramenée à un score centré-réduit sur toute la banque
    (le meilleur moment ressort, quelle que soit l'échelle de CLIP). Renvoie {chemin: tableau} ou None."""
    if not requete or not sens.disponible() or not any(r.get('sens') for r in banque): return None
    q = sens.texte([requete])[0]; sims = {r['chemin']: vecteurs(r) @ q for r in banque if vecteurs(r) is not None}
    allv = np.concatenate(list(sims.values()))
    m, e = float(np.median(allv)), float(np.std(allv)) + 1e-6
    return {k: (v - m) / e for k, v in sims.items()}


def score_fenetre(r, t0, d, besoin):
    """Note d'une fenêtre [t0, t0+d] d'un rush par rapport au besoin d'une case. Renvoie (note, explications, moment_du_geste)."""
    idx = [k for k, e in enumerate(r['echantillons']) if t0 - 0.01 <= e['t'] <= t0 + d + 0.01]
    if not idx and r['echantillons']: idx = [min(range(len(r['echantillons'])), key=lambda k: abs(r['echantillons'][k]['t'] - (t0 + d / 2)))]
    E = [r['echantillons'][k] for k in idx]
    if not E: return 0.0, [], None
    note = 0.0; ok = []; manque = []; t_geste = None
    S = (besoin.get('_sens') or {}).get(r['chemin'])
    if S is not None and len(S) == len(r['echantillons']):          # recherche par le sens (CLIP) : le plus important
        z = S[idx]; v = 0.3 * float(np.max(z)) + 0.7 * float(np.mean(z))    # toute la fenêtre doit correspondre, pas un seul instant
        note += 2.5 * v
        if v > 1.5: ok.append(f"« {besoin.get('requete')} »")
        elif besoin.get('requete'): manque.append(f"« {besoin.get('requete')} »")
    cad = besoin.get('cadrage')
    if cad:
        part = np.mean([e.get('cadrage', 'sans personne') == cad for e in E])
        voisin = {'gros plan': 'plan moyen', 'plan moyen': 'gros plan', 'plan large': 'plan moyen'}.get(cad)
        part_v = np.mean([e.get('cadrage') == voisin for e in E]) if voisin else 0
        note += 3 * part + 1 * part_v
        (ok if part >= 0.5 else manque).append(cad)
    g = besoin.get('geste')
    if g:
        hits = [e for e in E if e.get('geste') == g]
        if hits: note += 4 + 1.0 * len(hits) / len(E); ok.append(g); t_geste = hits[0]['t']
        else: manque.append(g)
    ex = besoin.get('expression')
    if ex:
        hits = [e for e in E if e.get('expression') == ex]
        if hits: note += 2; ok.append(ex)
        else: manque.append(ex)
    p = besoin.get('personnes')
    if p is not None:
        pm = float(np.median([e.get('personnes', 0) for e in E]))
        if p == 0: note += 1.5 if pm == 0 else -0.5
        else: note += 1.5 if pm >= 1 and (p < 3 or pm >= 2) else -1
    mv = besoin.get('mouvement')
    if mv:
        m = classe_mouvement(float(np.median([e.get('mouvement', 0) for e in E])))
        rang = {'calme': 0, 'moyen': 1, 'fort': 2}
        note += 2 - 1.2 * abs(rang[m] - rang[mv]); (ok if m == mv else manque).append(f'mouvement {mv}')
    if besoin.get('lumineux') is not None:
        note += 1 - min(1, abs(np.mean([e['lum'] for e in E]) - besoin['lumineux']) / 40)
    if besoin.get('sature') is not None:
        note += 0.7 - min(0.7, abs(np.mean([e['sat'] for e in E]) - besoin['sature']) / 50)
    net = np.median([e['net'] for e in E]); note += 0.6 * min(1, net / 300) - (0.8 if net < 30 else 0)   # image floue : pénalité
    return round(float(note), 3), dict(ok=ok, manque=manque), t_geste


def fenetres(r, d, pas=0.25):
    """Fenêtres possibles de durée d dans un rush, sans traverser une coupe interne. Si aucune séquence n'est assez longue,
    on renvoie la plus longue (elle sera ralentie)."""
    out = []
    for s in r['segments']:
        a, b = s['de'], s['a']
        if b - a + 1e-6 < d: continue
        t = a
        while t + d <= b + 1e-6: out.append((round(t, 2), d, 1.0)); t += pas
    if not out and r['segments']:
        s = max(r['segments'], key=lambda s: s['a'] - s['de']); L = s['a'] - s['de']
        if L >= 0.25: out.append((s['de'], L, round(L / d, 3)))
    return out


def chercher(banque, besoin, duree=1.5, n=10, exclure=()):
    """Les n meilleurs moments de la banque pour un besoin (dict ou texte libre)."""
    if isinstance(besoin, str):
        q = besoin; besoin = besoin_depuis_texte(q); besoin['requete'] = q; besoin['_sens'] = preparer_requete(banque, q)
    res = []
    for r in banque:
        for t0, d, vit in fenetres(r, duree, pas=0.5):
            if any(r['chemin'] == c and t0 < b_ and t0 + d > a_ for c, a_, b_ in exclure): continue
            s, why, tg = score_fenetre(r, t0, d, besoin)
            res.append(dict(nom=r['nom'], chemin=r['chemin'], de=t0, a=round(t0 + d, 2), vitesse=vit, note=s, pourquoi=why, moment_du_geste=tg))
    res.sort(key=lambda x: -x['note'])
    best = []                                           # pas deux fois le même passage
    for x in res:
        if all(not (x['chemin'] == y['chemin'] and abs(x['de'] - y['de']) < duree) for y in best): best.append(x)
        if len(best) >= n: break
    return best

#!/usr/bin/env python3
"""Test des ajouts : montage depuis un script, recherche par le sens (CLIP), nos propres sons, synchro multicaméra.
Tout est fabriqué ici avec des vérités connues. Usage : python3 verifier_script.py [rapport.md]"""
import os, sys, tempfile, wave
import numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from montage import script as sc, remplir as rp, banque as bq, sens, sons, synchro

R = []
def check(nom, attendu, mesure, ok): R.append((nom, attendu, mesure, bool(ok)))
TMP = tempfile.mkdtemp(prefix='verif-script-')

# ---------- 1. lecture du script
S = """# test
format: vertical
2 temps | un cercle rouge | TITRE
1.5 s | un carré bleu
--- drop ---
1 temps | une étoile jaune | | flash, impact
2 temps | des rayures vertes | GOAT | zoom, whoosh, ralenti
"""
regl, L = sc.lire(S)
check('Script : lecture des lignes', '4 plans, drop avant le 3e, format vertical', f"{len(L)} plans, drop avant le {next(i for i, l in enumerate(L) if l['drop_avant']) + 1}e, {regl.get('format')}",
      len(L) == 4 and L[2]['drop_avant'] and not L[1]['drop_avant'] and regl.get('format') == 'vertical')
check('Script : durées, textes, effets', '2 temps / 1.5 s ; TITRE, GOAT ; flash, impact', f"{L[0]['duree']} {L[0]['unite']} / {L[1]['duree']} {L[1]['unite']} ; {L[0]['texte']}, {L[3]['texte']} ; {', '.join(L[2]['effets'])}",
      L[0]['duree'] == 2 and L[0]['unite'] == 'temps' and L[1]['duree'] == 1.5 and L[1]['unite'] == 's' and L[3]['texte'] == 'GOAT' and L[2]['effets'] == ['flash', 'impact'])

# ---------- 2. banque d'images connues (dessinées) + CLIP
def dessin(kind, k):
    f = np.full((360, 640, 3), 235, np.uint8); rng = np.random.default_rng(k); dx = int(rng.integers(-40, 40))
    if kind == 'cercle': cv2.circle(f, (320 + dx, 180), 120, (0, 0, 230), -1)
    elif kind == 'carre': cv2.rectangle(f, (200 + dx, 60), (440 + dx, 300), (220, 60, 0), -1)
    elif kind == 'etoile':
        pts = np.array([[320 + dx + 140 * np.cos(np.pi / 2 + i * 4 * np.pi / 5), 190 - 140 * np.sin(np.pi / 2 + i * 4 * np.pi / 5)] for i in range(5)], np.int32)
        cv2.fillPoly(f, [pts], (0, 220, 255))
    elif kind == 'rayures':
        for x in range(0, 640, 60): cv2.rectangle(f, (x + dx, 0), (x + 30 + dx, 360), (40, 170, 40), -1)
    return f
ordre = ['carre', 'rayures', 'cercle', 'etoile']                 # chaque rush contient les 4 dessins à des moments connus (2 s chacun)
banque = []; vrai = {}
if sens.disponible():
    for j in range(2):
        seq = ordre[j:] + ordre[:j]; frames = []; ech = []
        for i in range(16):                                      # 8 s, un échantillon toutes les 0,5 s
            kind = seq[i // 4]; frames.append(dessin(kind, i)); ech.append(dict(t=i * 0.5, lum=60, sat=40, teinte=None, net=500, personnes=0, cadrage='sans personne', mouvement=0.5))
        nom = f'rush{j}.mp4'; banque.append(dict(nom=nom, chemin='/r/' + nom, duree_s=8.0, fps=30, largeur=1080, hauteur=1920, orientation='vertical',
                                                  segments=[dict(de=0.0, a=8.0)], echantillons=ech, sens=sens.vers_texte(sens.images(frames))))
        for q, kind in enumerate(seq): vrai.setdefault(kind, []).append(('/r/' + nom, q * 2.0, q * 2.0 + 2.0))
    def juste(kind, chemin, a, b):
        return any(c == chemin and a >= x - 0.3 and b <= y + 0.3 for c, x, y in vrai[kind])
    hits = []
    for kind, q in (('cercle', 'un cercle rouge'), ('carre', 'un carré bleu'), ('etoile', 'une étoile jaune'), ('rayures', 'des rayures vertes')):
        x = bq.chercher(banque, q, duree=1.0, n=1)[0]; hits.append((q, juste(kind, x['chemin'], x['de'], x['a']), f"{x['nom']} {x['de']:.1f} s"))
    check('Recherche par le sens (CLIP) : 4 phrases en français', '4 / 4 bons moments', ' ; '.join(f"{q} → {m}{'' if ok else ' ✗'}" for q, ok, m in hits), all(h[1] for h in hits))
    # 3. montage depuis le script
    M = dict(tempo_bpm=120, temps_s=[0.5 + 0.5 * i for i in range(40)], premiers_temps_s=[0.5 + 2.0 * i for i in range(10)], grosse_caisse_s=[0.5 + 0.5 * i for i in range(40)],
             caisse_claire_s=[], drops=[dict(t=8.5, type='drop')], parties=[], filtres=[], cymbales_inversees=[], duree_s=20.5)
    T = sc.modele(regl, L, M)
    plan = rp.remplir(T, None, banque, musique='m.wav', M=M, graine=0, log=lambda *a: None, zooms_mode='garder')
    kinds = ['cercle', 'carre', 'etoile', 'rayures']
    ok_cases = [juste(k, c['src'], c['src_in'], c['src_out']) for k, c in zip(kinds, plan['clips'])]
    check('Montage depuis le script : le bon moment pour chaque ligne', '4 / 4', f"{sum(ok_cases)} / 4", all(ok_cases))
    c3 = plan['clips'][2]
    check('La ligne après « --- drop --- » tombe sur le drop', 'drop à 8,50 s dans la musique', f"{c3['t0'] + plan['musique']['src_in']:.2f} s", abs(c3['t0'] + plan['musique']['src_in'] - 8.5) < 0.03)
    check('Effets du script : flash, impact, zoom, whoosh, ralenti', 'flash sur la ligne 3, impact + whoosh, 1 zoom, ligne 4 à ×0,5',
          f"{', '.join(t['type'] for t in plan['transitions'])} ; {', '.join(e['type'] for e in plan['effets'])} ; {len(plan['zooms'])} zoom ; ×{plan['clips'][3].get('vitesse')}",
          [t['type'] for t in plan['transitions']] == ['flash blanc'] and sorted(e['type'] for e in plan['effets']) == ['impact', 'whoosh'] and len(plan['zooms']) == 1 and plan['clips'][3].get('vitesse') == 0.5)
    tx = [o['texte'] for o in plan['incrustations'] if o['type'] == 'texte animé']
    check('Textes du script affichés tels quels', 'TITRE, GOAT', ', '.join(tx), tx == ['TITRE', 'GOAT'])
else:
    check('Recherche par le sens (CLIP)', 'modèle installé', 'absent : python3 telecharger_modeles.py', False)

# ---------- 4. nos sons : rangés par le nom, puis à l'écoute
sr = 44100; rng = np.random.default_rng(1)
def ecrire(nom, y):
    p = os.path.join(TMP, 'sons', nom); os.makedirs(os.path.dirname(p), exist_ok=True)
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(y, -1, 1) * 30000).astype(np.int16).tobytes())
t = lambda d: np.arange(int(sr * d)) / sr
bruit = lambda d: rng.normal(0, 1, int(sr * d))
from scipy.signal import butter, lfilter
def passe_bas(y, f): b, a = butter(2, f / (sr / 2)); return lfilter(b, a, y)
def passe_haut(y, f): b, a = butter(2, f / (sr / 2), 'high'); return lfilter(b, a, y)
ecrire('Whoosh_01.wav', bruit(0.8) * np.sin(np.pi * t(0.8) / 0.8) ** 2 * 0.5)                       # par le nom
ecrire('son_a.wav', passe_haut(bruit(0.9), 600) * np.sin(np.pi * t(0.9) / 0.9) ** 3 * 0.6)           # whoosh à l'écoute
ecrire('son_b.wav', np.sin(2 * np.pi * 55 * t(1.0)) * np.exp(-t(1.0) * 6) + 0.3 * passe_bas(bruit(1.0), 200) * np.exp(-t(1.0) * 20))  # impact
ecrire('son_c.wav', passe_haut(bruit(2.5), 300) * (t(2.5) / 2.5) ** 2 * 0.7)                         # riser
ecrire('son_d.wav', np.sin(2 * np.pi * 1760 * t(1.2)) * np.exp(-t(1.2) * 4) * 0.6)                  # ding
ecrire('son_e.wav', passe_haut(bruit(0.05), 3000) * np.exp(-t(0.05) * 80))                           # clic
cl = sons.classer(os.path.join(TMP, 'sons'), log=lambda *a: None)
inv = {os.path.basename(f): k for k, v in cl.items() for f in v}
att = {'Whoosh_01.wav': 'whoosh', 'son_a.wav': 'whoosh', 'son_b.wav': 'impact', 'son_c.wav': 'riser', 'son_d.wav': 'ding', 'son_e.wav': 'clic'}
check('Nos sons rangés (par le nom et à l\'écoute)', ', '.join(f'{k}={v}' for k, v in att.items()), ', '.join(f'{k}={inv.get(k)}' for k in att), all(inv.get(k) == v for k, v in att.items()))
pl = dict(effets=[dict(t=1, type='whoosh', fichier='sfx/whoosh.wav'), dict(t=2, type='whoosh', fichier='sfx/whoosh.wav'), dict(t=3, type='impact', fichier='sfx/impact.wav'), dict(t=4, type='pop', fichier='sfx/pop.wav')])
ch = sons.appliquer(pl, cl, os.path.join(TMP, 'sortie', 'sfx'))
used = [e.get('notre_son') for e in pl['effets']]
check('Nos sons à la place des sons fabriqués (en alternant)', 'whoosh ×2 (deux fichiers différents), impact = son_b, pop sans fichier → son fabriqué',
      ', '.join(str(u) for u in used), used[0] != used[1] and None not in used[:2] and used[2] == 'son_b.wav' and used[3] is None and all(os.path.exists(p) for p in ch.values()))

# ---------- 5. synchro multicaméra par le son
dur = 20; base = np.zeros(sr * dur)
for k in rng.uniform(0.5, dur - 0.5, 40): i = int(k * sr); base[i:i + 2000] += rng.normal(0, 0.8, 2000) * np.exp(-np.arange(2000) / 300)
base += rng.normal(0, 0.01, len(base))
dec = 2.37
camB = base[int(dec * sr):] * 0.6 + rng.normal(0, 0.03, len(base) - int(dec * sr))    # B commence à filmer 2,37 s plus tard, autre micro
def ecr(p, y):
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(y, -1, 1) * 30000).astype(np.int16).tobytes())
pa, pb = os.path.join(TMP, 'camA.wav'), os.path.join(TMP, 'camB.wav'); ecr(pa, base); ecr(pb, camB)
d, c = synchro.decalage(pa, pb)
check('Synchro de deux caméras par le son', 'B démarre 2,37 s plus tard (±0,02 s)', f"{d} s (confiance {c})", d is not None and abs(d - dec) <= 0.02 and c >= 0.3)

ok = sum(r[3] for r in R)
Lg = ['# Vérification des ajouts (script, recherche par le sens, nos sons, synchro)', '', '| Contrôle | Attendu | Mesuré | |', '|---|---|---|---|']
Lg += [f"| {a} | {b} | {c} | {'✅' if d else '❌'} |" for a, b, c, d in R] + ['', f'**{ok} / {len(R)} justes.**']
txt = '\n'.join(Lg); print(txt)
if len(sys.argv) > 1: open(sys.argv[1], 'w', encoding='utf-8').write(txt + '\n')
sys.exit(0 if ok == len(R) else 1)

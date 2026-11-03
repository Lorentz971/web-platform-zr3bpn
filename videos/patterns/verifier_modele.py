#!/usr/bin/env python3
"""Test de l'étape 3 (modèle à cases, recalage sur une autre musique, banque de rushs, remplissage, variantes),
avec des vérités connues : une fausse analyse de vidéo et une fausse banque de rushs dont on connaît chaque moment.
Usage : python3 verifier_modele.py [rapport.md]"""
import os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from montage import modele, banque as bq, remplir as rp


def musique(bpm, n, drop_temps, t0=0.4):
    per = 60 / bpm; tb = [round(t0 + i * per, 4) for i in range(n)]
    return dict(tempo_bpm=bpm, temps_s=tb, premiers_temps_s=tb[::4], grosse_caisse_s=tb[::2], caisse_claire_s=tb[1::2],
                drops=[dict(t=tb[drop_temps], type='drop')], parties=[dict(nom='intro', de_s=0, a_s=tb[drop_temps]), dict(nom='drop', de_s=tb[drop_temps], a_s=tb[-1] + per)],
                filtres=[], cymbales_inversees=[], duree_s=round(tb[-1] + per, 2))


# --- la vidéo d'origine (fausse analyse) : 120 BPM, drop au temps 16, 8 plans
M0 = musique(120, 64, 16)
tb = M0['temps_s']
bornes_t = [0, 8, 12, 16, 18, 20, 22, 26, 30]                 # en temps
besoins = [('plan large', None, 'calme'), ('plan moyen', None, 'moyen'), ('sans personne', None, 'fort'), ('gros plan', 'bras levés (célébration)', 'moyen'),
           ('plan large', None, 'fort'), ('gros plan', 'poing ou main levée', 'moyen'), ('sans personne', None, 'calme'), ('plan moyen', None, 'fort')]
plans = []
for k, (a, b) in enumerate(zip(bornes_t, bornes_t[1:])):
    cad, g, mv = besoins[k]
    plans.append(dict(start_s=tb[a], end_s=tb[b], dur_s=round(tb[b] - tb[a], 3), type_de_plan='illustration',
                      vitesse_image_pct_par_image={'calme': 0.2, 'moyen': 0.8, 'fort': 2.0}[mv], luminosite=50, saturation=30,
                      contenu=dict(cadrage=cad, personnes=0 if cad == 'sans personne' else 1, **({'geste': g} if g else {}))))
P = dict(video='origine.mp4', format='vertical 9:16', duree_s=tb[30], fps=30, plans=plans,
         transitions=[dict(type='flash blanc', start_s=tb[16], dur_frames=2, dur_s=0.07), dict(type='glissement', start_s=tb[20], dur_frames=8, dur_s=0.27)],
         mouvements=[dict(type='punch-in', start_s=tb[16] + 0.1, dur_s=0.3, zoom_pct=15)], incrustations=[], effets_image=[],
         sous_titres=[], textes_a_l_ecran=[dict(text='TITRE ORIGINAL', start_s=tb[0] + 0.2, dur_s=1.5, centre_x_pct=50, centre_y_pct=30, majuscules=True),
                                            dict(text='SECOND', start_s=tb[16] + 0.05, dur_s=1.0, centre_x_pct=50, centre_y_pct=60, majuscules=True)],
         son=dict(effets_sonores=[dict(type='souffle (whoosh)', t=tb[20] - 0.1)]), musique_detaillee=M0, rythme={})

# --- banque : 5 rushs dont on connaît le contenu
def rush(nom, duree, f):
    ech = []
    for i in range(int(duree / 0.5)):
        t = i * 0.5; e = dict(t=t, lum=50, sat=30, teinte=None, net=400); e.update(f(t)); ech.append(e)
    return dict(nom=nom, chemin='/rushs/' + nom, duree_s=duree, fps=30, largeur=1080, hauteur=1920, orientation='vertical',
                segments=[dict(de=0.0, a=duree)], echantillons=ech)
B = [rush('large-calme.mp4', 12, lambda t: dict(cadrage='plan large', personnes=1, mouvement=0.2)),
     rush('moyen.mp4', 10, lambda t: dict(cadrage='plan moyen', personnes=1, mouvement=1.0)),
     rush('decor-rapide.mp4', 10, lambda t: dict(cadrage='sans personne', personnes=0, mouvement=2.5)),
     rush('celebration.mp4', 10, lambda t: dict(cadrage='gros plan', personnes=1, mouvement=1.0, **({'geste': 'bras levés (célébration)'} if 6.0 <= t < 7.5 else {}))),
     rush('poing.mp4', 8, lambda t: dict(cadrage='gros plan', personnes=1, mouvement=1.0, **({'geste': 'poing ou main levée'} if 3.0 <= t < 4.0 else {}))),
     rush('large-action.mp4', 10, lambda t: dict(cadrage='plan large', personnes=2, mouvement=2.2)),
     rush('decor-calme.mp4', 10, lambda t: dict(cadrage='sans personne', personnes=0, mouvement=0.1))]

T = modele.construire(P)
M1 = musique(95, 80, 24, t0=0.7)                               # NOTRE musique : autre tempo, drop ailleurs
plan = rp.remplir(T, P, B, musique='notre.wav', M=M1, textes=['NOTRE TITRE'], graine=0, log=lambda *a: None)
plan2 = rp.remplir(T, P, B, musique='notre.wav', M=M1, textes=['NOTRE TITRE'], graine=1, log=lambda *a: None)
plan_sans = rp.remplir(T, P, B, graine=0, log=lambda *a: None)

R = []
def check(nom, attendu, mesure, ok): R.append((nom, attendu, mesure, ok))

per1 = 60 / 95; deb = plan['musique']['src_in']
c_drop = next(c for c in plan['clips'] if c['case'] == 4)
check('Modèle : une case par plan, en temps', '8 cases, case 4 = 2 temps', f"{len(T['cases'])} cases, case 4 = {T['cases'][3]['duree_temps']} temps",
      len(T['cases']) == 8 and abs(T['cases'][3]['duree_temps'] - 2) < 0.05)
check('Le drop de l\'original tombe sur le drop de notre musique', f"{M1['drops'][0]['t']:.2f} s dans la musique", f"{c_drop['t0'] + deb:.2f} s",
      abs(c_drop['t0'] + deb - M1['drops'][0]['t']) < 0.03)
check('Les durées suivent notre tempo (95 BPM)', f"case 2 = 4 temps = {4 * per1:.2f} s", f"{plan['clips'][1]['t1'] - plan['clips'][1]['t0']:.2f} s",
      abs(plan['clips'][1]['t1'] - plan['clips'][1]['t0'] - 4 * per1) < 0.03)
bt = [x - deb for x in M1['temps_s']]
check('Chaque coupe tombe sur un temps de notre musique', 'écart < 0,03 s', f"max {max(min(abs(c['t0'] - b) for b in bt) for c in plan['clips']):.3f} s",
      all(min(abs(c['t0'] - b) for b in bt) < 0.03 for c in plan['clips']))
check('Sans musique : durées de l\'original gardées', f"{tb[30] - tb[0]:.2f} s", f"{plan_sans['duree_s']:.2f} s", abs(plan_sans['duree_s'] - (tb[30] - tb[0])) < 0.05)
attendu = ['large-calme.mp4', 'moyen.mp4', 'decor-rapide.mp4', 'celebration.mp4', 'large-action.mp4', 'poing.mp4', 'decor-calme.mp4', 'moyen.mp4']
choisis = [c['nom'] for c in plan['clips']]
check('Le bon rush dans chaque case (cadrage, geste, mouvement)', ', '.join(attendu), ', '.join(choisis), choisis == attendu)
g = c_drop['src_in']
check('Le geste arrive au début de la case (sur le drop)', 'bras levés entre 0 et 0,45 s après la coupe', f"{6.0 - g:.2f} s", 0 <= 6.0 - g <= 0.45)
cp = next(c for c in plan['clips'] if c['case'] == 6)
check('Deuxième geste (poing) calé aussi', 'poing entre 0 et 0,45 s après la coupe', f"{3.0 - cp['src_in']:.2f} s", 0 <= 3.0 - cp['src_in'] <= 0.45)
def chevauche(p):
    u = [(c['nom'], c['src_in'], c['src_out']) for c in p['clips']]
    return any(a[0] == b[0] and a[1] < b[2] - 0.01 and b[1] < a[2] - 0.01 for i, a in enumerate(u) for b in u[i + 1:])
check('Jamais deux fois le même passage', 'aucun chevauchement', 'chevauchement' if chevauche(plan) else 'aucun', not chevauche(plan))
check('Transitions et zoom repris aux bons endroits', 'flash blanc case 4, glissement case 6, punch-in case 4',
      ', '.join(f"{t['type']} case {plan['clips'][t['plan']]['case']}" for t in plan['transitions']) + f", {len(plan['zooms'])} zoom",
      [(t['type'], plan['clips'][t['plan']]['case']) for t in plan['transitions']] == [('flash blanc', 4), ('glissement', 6)] and len(plan['zooms']) == 1 and plan['zooms'][0]['plan'] == 3)
tx = [o for o in plan['incrustations'] if o['type'] == 'texte animé']
ar = plan['textes_a_remplacer']
check('Nos textes à la place des textes de l\'original', 'NOTRE TITRE affiché ; SECOND non affiché, listé à écrire',
      ' / '.join(o['texte'] for o in tx) + ' ; à écrire : ' + ' / '.join(o['texte_original'] for o in ar),
      [o['texte'] for o in tx] == ['NOTRE TITRE'] and [o['texte_original'] for o in ar] == ['SECOND'] and abs(tx[0]['centre_pct'][1] - 30) < 1)
check('Effet sonore repris', 'whoosh juste avant le glissement', ', '.join(f"{e['type']} {e['t']:.2f}" for e in plan['effets']),
      len(plan['effets']) == 1 and plan['effets'][0]['type'] == 'whoosh' and -0.3 < plan['effets'][0]['t'] - plan['transitions'][1]['t'] < 0)
diff = sum(a['nom'] != b['nom'] or abs(a['src_in'] - b['src_in']) > 0.3 for a, b in zip(plan['clips'], plan2['clips']))
check('Variante B : autres images, même rythme', 'au moins 2 cases changent, mêmes coupes', f"{diff} cases changent",
      diff >= 2 and all(abs(a['t0'] - b['t0']) < 1e-6 for a, b in zip(plan['clips'], plan2['clips'])))
q = bq.chercher(B, 'gros plan bras levés', duree=1.0, n=3)
check('Recherche libre dans la banque', '« gros plan bras levés » → celebration.mp4 vers 6 s', f"{q[0]['nom']} {q[0]['de']:.1f} s", q[0]['nom'] == 'celebration.mp4' and 5.0 <= q[0]['de'] <= 7.5)
q = bq.chercher(B, 'décor rapide', duree=1.0, n=3)
check('Recherche libre (2)', '« décor rapide » → decor-rapide.mp4', q[0]['nom'], q[0]['nom'] == 'decor-rapide.mp4')
court = [rush('court.mp4', 1.0, lambda t: dict(cadrage='plan large', personnes=1, mouvement=0.2))]
pc = rp.remplir(T, P, court, graine=0, log=lambda *a: None)
check('Rush trop court : ralenti au lieu d\'un trou', 'case 1 remplie avec vitesse < 1', f"vitesse {pc['clips'][0].get('vitesse')}", 0 < (pc['clips'][0].get('vitesse') or 1) < 1)

ok = sum(r[3] for r in R)
L = ['# Vérification de l\'étape 3 (modèle, recalage, banque, remplissage, variantes)', '', '| Contrôle | Attendu | Mesuré | |', '|---|---|---|---|']
L += [f"| {a} | {b} | {c} | {'✅' if d else '❌'} |" for a, b, c, d in R]
L += ['', f'**{ok} / {len(R)} justes.**']
txt = '\n'.join(L); print(txt)
if len(sys.argv) > 1: open(sys.argv[1], 'w', encoding='utf-8').write(txt + '\n')
sys.exit(0 if ok == len(R) else 1)

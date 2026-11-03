#!/usr/bin/env python3
"""Combine les patterns de plusieurs vidéos d'un même créateur (ou d'un même format) en un seul « style ».

Usage : python3 agreger.py style.json pattern1.json pattern2.json [...]
        (on peut aussi donner des dossiers : leur pattern.json est pris)

Pour chaque mesure : la médiane (valeur à viser), la fourchette (min–max) et la régularité
(« constant » si toutes les vidéos se ressemblent, « variable » sinon). Écrit aussi style.md, lisible.
"""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from montage.recette import recette, CRITERES


def charger(p):
    if os.path.isdir(p): p = os.path.join(p, 'pattern.json')
    return json.load(open(p))


def _mode(vals):
    vals = [v for v in vals if v is not None]
    return max(set(vals), key=vals.count) if vals else None


def agreger(patterns):
    Rs = [recette(P) for P in patterns]
    out = dict(nombre_de_videos=len(Rs), videos=[R['source'] for R in Rs], format=_mode([R['format'] for R in Rs]), mesures={})
    num_keys = [k for k, _, _ in CRITERES] + ['duree_plan_p25_s', 'duree_plan_p75_s', 'premiere_coupe_s', 'zoom_duree_s', 'tempo_bpm',
                                              'temps_de_parole_pct', 'part_transitions_pct', 'part_effets_synchronises_pct', 'duree_s']
    for k in num_keys:
        v = [R.get(k) for R in Rs if isinstance(R.get(k), (int, float))]
        if not v: continue
        med = float(np.median(v)); spread = (max(v) - min(v)) / (abs(med) + 1e-6)
        out['mesures'][k] = dict(cible=round(med, 2), min=round(min(v), 2), max=round(max(v), 2), regularite='constant' if spread < 0.3 else 'variable', n=len(v))
    # choix qualitatifs : ce qui revient le plus
    def merge_counts(key):
        tot = {}
        for R in Rs:
            for t, n in (R.get(key) or {}).items(): tot[t] = tot.get(t, 0) + n
        return dict(sorted(tot.items(), key=lambda x: -x[1]))
    for key in ('types_de_transition', 'mouvements_par_type', 'incrustations_par_type', 'effets_par_type'):
        out[key] = merge_counts(key)
    tdp = {}
    for R in Rs:
        for t, pct in (R.get('repartition_types_de_plan') or {}).items(): tdp.setdefault(t, []).append(pct)
    out['repartition_types_de_plan'] = {t: round(float(np.sum(v)) / len(Rs)) for t, v in tdp.items()}
    tc = {}
    for R in Rs:
        for t, pct in (R.get('types_de_coupe_pct') or {}).items(): tc.setdefault(t, []).append(pct)
    out['types_de_coupe_pct'] = {t: round(float(np.sum(v)) / len(Rs)) for t, v in tc.items()}
    dti = {}
    for R in Rs:
        for t, d in (R.get('duree_transition_images') or {}).items(): dti.setdefault(t, []).append(d)
    out['duree_transition_images'] = {t: int(np.median(v)) for t, v in dti.items()}
    sts = [R['sous_titres'] for R in Rs if R.get('sous_titres')]
    if sts:
        anim = {}
        for s in sts:
            for a, n in (s.get('animations') or {}).items(): anim[a] = anim.get(a, 0) + n
        out['sous_titres'] = dict(present_dans=f"{len(sts)}/{len(Rs)} vidéos",
                                  mots_par_sous_titre=round(float(np.median([s['mots_par_sous_titre'] for s in sts if s.get('mots_par_sous_titre')])), 1),
                                  position_y_pct=round(float(np.median([s['position_y_pct'] for s in sts if s.get('position_y_pct') is not None]))),
                                  hauteur_texte_pct=round(float(np.median([s['hauteur_texte_pct'] for s in sts if s.get('hauteur_texte_pct')])), 1),
                                  couleur_surlignage=_mode([s.get('couleur_surlignage') for s in sts]),
                                  majuscules=_mode([s.get('majuscules') for s in sts]), contour_noir=_mode([s.get('contour_noir') for s in sts]),
                                  animations=anim)
    out['zoom_courbe'] = _mode([R.get('zoom_courbe') for R in Rs])
    out['animation_entree_principale'] = _mode([R.get('animation_entree_principale') for R in Rs])
    out['barre_de_progression'] = f"{sum(bool(R.get('barre_de_progression')) for R in Rs)}/{len(Rs)} vidéos"
    imgs = [R['image'] for R in Rs if R.get('image')]
    if imgs:
        out['image'] = {k: round(float(np.median([i[k] for i in imgs])), 1) for k in ('luminosite', 'contraste', 'saturation', 'vignettage', 'bandes_noires_pct')}
        out['image'].update(ombres=_mode([i['ombres'] for i in imgs]), hautes_lumieres=_mode([i['hautes_lumieres'] for i in imgs]))
    acc = [R['accroche'] for R in Rs if R.get('accroche') and R['accroche'].get('duree_s')]
    if acc:
        el = [e for a in acc for e in (a.get('elements') or [])]
        out['accroche'] = dict(duree_s=round(float(np.median([a['duree_s'] for a in acc])), 2), coupes=round(float(np.median([a.get('coupes') or 0 for a in acc])), 1),
                               elements_frequents={e: el.count(e) for e in sorted(set(el), key=lambda e: -el.count(e))})
    courbes = [R['courbe_plans_par_min_5s'] for R in Rs if R.get('courbe_plans_par_min_5s')]
    if courbes:                                   # courbe d'intensité normalisée sur 10 points (début → fin)
        res = [np.interp(np.linspace(0, 1, 10), np.linspace(0, 1, len(c)), c) if len(c) > 1 else np.full(10, c[0]) for c in courbes]
        out['courbe_rythme_10_points'] = [round(float(x), 1) for x in np.median(res, axis=0)]
    vis = [R['visage'] for R in Rs if R.get('visage') and R['visage'].get('taille_pct_ecran')]
    if vis: out['visage'] = dict(taille_pct_ecran=round(float(np.median([v['taille_pct_ecran'] for v in vis])), 1), present_dans=f"{len(vis)}/{len(Rs)} vidéos")
    out['recettes'] = Rs
    return out


def ecrire_md(S, path):
    lab = {k: l for k, l, _ in CRITERES}
    L = [f"# Style combiné de {S['nombre_de_videos']} vidéos", '', f"Format le plus fréquent : **{S['format']}**", '',
         '| Mesure | Valeur à viser | Fourchette | Régularité |', '|---|---|---|---|']
    for k, m in S['mesures'].items():
        L.append(f"| {lab.get(k, k)} | **{m['cible']}** | {m['min']} – {m['max']} | {m['regularite']} |")
    for key, titre in (('types_de_transition', 'Transitions utilisées'), ('mouvements_par_type', 'Mouvements'), ('incrustations_par_type', 'Incrustations'), ('effets_par_type', 'Effets sonores')):
        if S.get(key): L += ['', f"**{titre}** : " + ', '.join(f"{t} ×{n}" for t, n in S[key].items())]
    if S.get('sous_titres'): L += ['', '**Sous-titres** : ' + ', '.join(f"{k} = {v}" for k, v in S['sous_titres'].items())]
    if S.get('image'): L += ['', '**Image** : ' + ', '.join(f"{k} = {v}" for k, v in S['image'].items())]
    if S.get('accroche'): L += ['', '**Accroche** : ' + ', '.join(f"{k} = {v}" for k, v in S['accroche'].items())]
    if S.get('courbe_rythme_10_points'): L += ['', '**Courbe du rythme (plans/min, du début à la fin)** : ' + ' → '.join(str(x) for x in S['courbe_rythme_10_points'])]
    open(path, 'w').write('\n'.join(L) + '\n')


if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    S = agreger([charger(p) for p in sys.argv[2:]])
    json.dump(S, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
    ecrire_md(S, os.path.splitext(sys.argv[1])[0] + '.md')
    print(f"Style de {S['nombre_de_videos']} vidéos → {sys.argv[1]} et {os.path.splitext(sys.argv[1])[0]}.md")

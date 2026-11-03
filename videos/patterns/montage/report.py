"""Écriture des résultats : pattern.json, rapport.md, timeline.png."""
import json, os, math
import numpy as np


def write(P, S, OUT, beat_t):
    json.dump(P, open(os.path.join(OUT, 'pattern.json'), 'w'), indent=2, ensure_ascii=False)
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    NF, FPS = S['NF'], S['FPS']; dur = NF / FPS
    fig, ax = plt.subplots(6, 1, figsize=(15, 11), dpi=100, sharex=True, gridspec_kw=dict(height_ratios=[1.2, 1, 1, 1, 1, 1]))
    cmap = {'face caméra': '#5aa9ff', 'illustration': '#9bc53d', "capture d'écran": '#c3c3c3', 'carton de texte': '#e55934', 'écran partagé': '#fde74c', 'graphique / animation': '#c879ff'}
    for s in P['plans']: ax[0].axvspan(s['start_s'], s['end_s'], color=cmap.get(s.get('type_de_plan'), '#ddd'), alpha=.6)
    for e in P['transitions']: ax[0].axvline(e['start_s'], color='k', lw=1.2); ax[0].text(e['start_s'], 1.02, e['type'], rotation=45, fontsize=6, va='bottom')
    ax[0].set_ylim(0, 1); ax[0].set_yticks([]); ax[0].set_ylabel('Plans\n(couleur = type)')
    z = [1.0]
    for r in S['rows'][1:]:
        z.append(z[-1] * (math.hypot(r['M'][0][0], r['M'][1][0]) if r.get('M') else 1) if r['ncc_comp'] >= 0.55 else 1.0)
    ax[1].plot(np.arange(NF) / FPS, np.array(z) * 100, color='#1d2b4f'); ax[1].set_ylabel('Zoom %')
    for m in P['mouvements']:
        if m['type'] not in ('punch-in', 'poussée lente', 'dézoom rapide', 'recul lent'): ax[1].annotate(m['type'], (m['start_s'], 100), fontsize=6, color='#e2574c', rotation=30)
    y = 0
    for o in P['incrustations']:
        ax[2].broken_barh([(o['start_s'], o.get('end_s', o['start_s'] + 0.5) - o['start_s'])], (y % 4, 0.8), color='#c879ff'); ax[2].text(o['start_s'], y % 4 + .2, o['type'], fontsize=6); y += 1
    ax[2].set_yticks([]); ax[2].set_ylabel('Incrustations')
    for c in P['sous_titres']: ax[3].broken_barh([(c['start_s'], c['dur_s'])], (0, 1), color='#ffd166'); ax[3].text(c['start_s'], .3, c['text'], fontsize=6)
    for a, b in P['visages']['present_s']: ax[3].broken_barh([(a, b - a)], (1.2, .6), color='#5aa9ff')
    ax[3].set_yticks([.5, 1.5]); ax[3].set_yticklabels(['sous-titres', 'visage']); ax[3].set_ylim(0, 2)
    so = P['son']
    if 'volume_db_par_seconde' in so:
        ax[4].plot(np.arange(len(so['volume_db_par_seconde'])) + .5, so['volume_db_par_seconde'], color='#2a9d8f')
        for a, b in so['voix_segments_s']: ax[4].axvspan(a, b, color='#2a9d8f', alpha=.15)
        for b in beat_t: ax[4].axvline(b, color='#bbb', lw=.3)
        top = max(so['volume_db_par_seconde']) if so['volume_db_par_seconde'] else 0
        for s in so['effets_sonores']: ax[4].plot(s['t'], top, 'v', color='#e2574c'); ax[4].text(s['t'], top + .3, s['type'].split(' ')[0], fontsize=5, rotation=60)
        for c in so.get('coupures_musique', []): ax[4].axvspan(c['start_s'], c['start_s'] + c['dur_s'], color='#e2574c', alpha=.3)
    ax[4].set_ylabel('Son\nvert = voix')
    st = P['structure']
    ax[5].bar(np.arange(len(st['intensite_par_seconde'])) + .5, st['intensite_par_seconde'], color='#ff8a3d')
    for c in st['chapitres'][1:]: ax[5].axvline(c['de_s'], color='k', ls='--')
    ax[5].set_ylabel('Intensité'); ax[5].set_xlabel('Temps (s)')
    plt.tight_layout(); plt.savefig(os.path.join(OUT, 'timeline.png')); plt.close()
    # rapport lisible
    L = [f"# Pattern de montage : {P['video']}", '',
         f"{P['format']} · {P['duree_s']} s · {P['rythme']['nombre_de_plans']} plans · {P['rythme']['plans_par_minute']} plans/min · plan moyen {P['rythme']['duree_moyenne_plan_s']} s (médiane {P['rythme']['duree_mediane_plan_s']} s)", '']
    def table(title, items, cols):
        nonlocal L
        L += [f'## {title}', '| ' + ' | '.join(c[0] for c in cols) + ' |', '|' + '---|' * len(cols)]
        for it in items: L.append('| ' + ' | '.join(str(c[1](it)) for c in cols) + ' |')
        L.append('')
    details = lambda d, skip: ', '.join(f"{k} : {v}" for k, v in d.items() if k not in skip and not k.startswith('_') and k != 'progression')
    table('Transitions et coupes', P['transitions'], [('Temps', lambda e: f"{e['start_s']} s"), ('Type', lambda e: e['type']), ('Détails', lambda e: details(e, ('type', 'start_s')))])
    table('Mouvements', P['mouvements'], [('Temps', lambda m: f"{m['start_s']} s"), ('Type', lambda m: m['type']), ('Détails', lambda m: details(m, ('type', 'start_s')))])
    table('Graphiques et incrustations', P['incrustations'], [('Début', lambda o: f"{o['start_s']} s"), ('Type', lambda o: o['type']), ('Détails', lambda o: details(o, ('type', 'start_s')))])
    table('Plans', P['plans'], [('Début', lambda s: f"{s['start_s']} s"), ('Durée', lambda s: f"{s['dur_s']} s"), ('Type', lambda s: s.get('type_de_plan')),
                                ('Couleur', lambda s: f"lum. {s['luminosite']} % · contraste {s['contraste']} % · sat. {s['saturation']} % · {s['teinte']} · {s['temperature']}"),
                                ('Étalonnage', lambda s: f"ombres {s['ombres']} · lumières {s['hautes_lumieres']}" + (f" · vignettage {s['vignettage']}" if s['vignettage'] else '') + (f" · grain {s['grain']}" if s['grain'] else '') + (f" · bandes noires {s['bandes_noires_pct']} %" if s['bandes_noires_pct'] else '')),
                                ('Visage', lambda s: (f"{s['visage']['taille_pct_ecran']} % · centre {s['visage']['centre_pct']}" + (' · tiers haut' if s['visage']['sur_le_tiers_haut'] else '')) if s.get('visage') else '')])
    st_ = P['sous_titres_resume']
    L += ['## Sous-titres', ', '.join(f"{k} : {v}" for k, v in st_.items()), '']
    L += [f"- {c['start_s']} s · « {c['text']} » · {c['animation']}" + (f" · mot surligné : {c['mot_surligne']} ({c['couleur_surlignage']})" if c['mot_surligne'] else '') for c in P['sous_titres']]
    if P['textes_a_l_ecran']:
        L += ['', "## Autres textes à l'écran"] + [f"- {c['start_s']} s · « {c['text']} » · {c['animation']} · hauteur {c['hauteur_pct']} % · centre {c['centre_x_pct']} / {c['centre_y_pct']} %" for c in P['textes_a_l_ecran']]
    L += ['', '## Son']
    for k, v in so.items():
        if k in ('volume_db_par_seconde', 'mots', 'phrases'): continue
        if k == 'effets_sonores': v = ', '.join(f"{x['t']} s {x['type']}" + (f" (→ {x['synchronise_avec']})" if x.get('synchronise_avec') else '') for x in v)
        L.append(f'- {k} : {v}')
    if so.get('phrases'):
        L += ['', '### Phrases'] + [f"- {p['start_s']}–{p['end_s']} s : {p['text']}" for p in so['phrases']]
    L += ['', '## Structure', f"- Accroche : {st['accroche']}", f"- Relances (pics d'intensité) : {st['relances_s']} · intervalle moyen {st['intervalle_moyen_relances_s']} s"]
    L += [f"- Chapitre {c['de_s']}–{c['a_s']} s : {c['plans']} plans, plan moyen {c['duree_moyenne_plan_s']} s, intensité {c['intensite_moyenne']}" for c in st['chapitres']]
    L += ['- Rythme par 5 s : ' + ' · '.join(f"{p['de_s']}s:{p['plans_par_min']}" for p in st['rythme_par_5s'])]
    L += ['', '![frise](timeline.png)']
    open(os.path.join(OUT, 'rapport.md'), 'w').write('\n'.join(L))
    return '\n'.join(L)

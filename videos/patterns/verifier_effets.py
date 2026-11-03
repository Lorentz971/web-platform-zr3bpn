#!/usr/bin/env python3
"""Compare les effets d'image trouvés (pattern.json, clé « effets_image ») à la vérité de la vidéo de test n° 3."""
import json, sys
P = json.load(open(sys.argv[1])); V = json.load(open(sys.argv[2] if len(sys.argv) > 2 else 'truth_effets.json'))
E = P.get('effets_image', [])
rows = []
for v in V:
    m = [e for e in E if e['type'] == v['type'] and e['start_s'] < v['end_s'] + 0.3 and e['end_s'] > v['start_s'] - 0.3]
    trouve = ', '.join('%s–%s s' % (e['start_s'], e['end_s']) for e in m) or '—'
    rows.append(f"| {v['type']} | {v['start_s']}–{v['end_s']} s | {trouve} | {'✅' if m else '❌'} |")
vus = {v['type'] for v in V}
faux = [e for e in E if not any(e['type'] == v['type'] and e['start_s'] < v['end_s'] + 0.3 and e['end_s'] > v['start_s'] - 0.3 for v in V)]
liste = ', '.join('%s@%s' % (e['type'], e['start_s']) for e in faux[:8])
rows.append(f"| Fausses détections | 0 | {len(faux)} : {liste} | {'✅' if not faux else '❌'} |")
n_ok = sum('✅' in r for r in rows)
print('\n'.join(['| Effet | Réel | Trouvé | |', '|---|---|---|---|'] + rows + ['', f"**{n_ok} / {len(rows)} justes.**"]))

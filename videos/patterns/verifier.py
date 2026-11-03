# Compare la mesure (pattern.json) à la vérité terrain (truth_full.json) et écrit verification.md
import json, sys
P = json.load(open(sys.argv[1])); V = json.load(open(sys.argv[2]))
mv = P['mouvements']; tr = P['transitions']; so = P['son']; st = P['sous_titres_resume']
find = lambda lst, t: next((x for x in lst if x['type'] == t), None)
hard = [e['start_s'] for e in tr if e['type'] == 'coupe sèche']
rows = []
def add(name, truth, meas, ok): rows.append((name, truth, meas, '✅' if ok else '❌'))
ok_cuts = len(hard) == len(V['cuts_hard_s']) and all(abs(a - b) <= 0.04 for a, b in zip(hard, V['cuts_hard_s']))
add('Coupes sèches', f"{len(V['cuts_hard_s'])} coupes", f"{len(hard)} coupes, écart max {max(abs(a-b) for a,b in zip(hard,V['cuts_hard_s'])):.2f} s", ok_cuts)
cf = find(tr, 'fondu enchaîné'); add('Fondu enchaîné', '6,0 s · 15 images', f"{cf['start_s']} s · {cf['dur_frames']} images" if cf else '—', bool(cf) and abs(cf['start_s'] - 6) < .1 and abs(cf['dur_frames'] - 15) <= 2)
fl = find(tr, 'flash blanc'); add('Flash blanc', '11,5 s · 3 images', f"{fl['start_s']} s · {fl['dur_frames']} images" if fl else '—', bool(fl) and fl['dur_frames'] == 3)
sl = find(tr, 'glissement'); add('Glissement', '14,5 s · 8 images · vers la gauche', f"{sl['start_s']} s · {sl['dur_frames']} images · {sl['direction']}" if sl else '—', bool(sl) and sl['dur_frames'] == 8 and 'gauche' in sl['direction'])
sh = find(mv, 'tremblement'); add('Tremblement', '8 px · 10 Hz · 0,6 s', f"{sh['amplitude_px']} px · {sh['frequence_hz']} Hz · {sh['dur_s']} s" if sh else '—', bool(sh) and abs(sh['amplitude_px'] - 8) <= 1.5 and abs(sh['frequence_hz'] - 10) <= 1)
pi = find(mv, 'punch-in'); add('Punch-in (« boum »)', '+30 % · 5 images · freine à la fin · vise (62 %, 33 %)', f"{pi['zoom_pct']:+} % · {pi['dur_frames']} images · {pi['courbe']} · vise {pi['point_vise_pct']}" if pi else '—', bool(pi) and abs(pi['zoom_pct'] - 30) < 1.5)
sp = find(mv, 'poussée lente'); add('Poussée lente', '+10 % sur 3 s', f"{sp['zoom_pct']:+} % sur {sp['dur_s']} s" if sp else '—', bool(sp) and abs(sp['zoom_pct'] - 10) < 1)
ro = find(mv, 'rotation'); add('Rotation', '8° sur 1 s', f"{abs(ro['degres'])}° sur {ro['dur_s']} s" if ro else '—', bool(ro) and abs(abs(ro['degres']) - 8) < 0.5)
ra = find(mv, 'ralenti'); add('Ralenti', '×0,5 à 8,5 s (12 → 6 px/image)', f"×{ra['facteur']} à {ra['start_s']} s ({ra['vitesse_avant_px_img']} → {ra['vitesse_apres_px_img']})" if ra else '—', bool(ra) and abs(ra['facteur'] - .5) < .08)
fr = find(mv, 'arrêt sur image'); add('Arrêt sur image', '10,5 s · 1,0 s', f"{fr['start_s']} s · {fr['dur_s']} s" if fr else '—', bool(fr) and abs(fr['start_s'] - 10.5) < .1)
extra = [m['type'] for m in mv if m['type'] not in ('tremblement', 'punch-in', 'poussée lente', 'rotation', 'ralenti', 'arrêt sur image')]
add('Fausses détections de mouvement', 'aucune', ', '.join(extra) or 'aucune', not extra)
caps = P['sous_titres']
add('Sous-titres (texte)', ' / '.join(V['captions']['text']), ' / '.join(c['text'] for c in caps), [c['text'] for c in caps] == V['captions']['text'])
add('Sous-titres (forme)', '82 % de hauteur · mot surligné jaune · 0,65 s', f"{st['position_y_pct']} % · {st['couleur_surlignage']} · {st['duree_moyenne_s']} s", st['position_y_pct'] == 82 and st['couleur_surlignage'] == 'jaune')
fc = P['visages']['present_s']; add('Visage', 'de 11,6 à 14,5 s', str(fc), len(fc) == 1 and abs(fc[0][0] - 11.6) < .2)
sh_ = {s['start_s']: s for s in P['plans']}
pl = P['plans']; s2 = next(s for s in pl if 3 <= s['start_s'] < 4); s3 = next(s for s in pl if 6.4 <= s['start_s'] < 7); s5 = next(s for s in pl if 14.5 <= s['start_s'] < 15.5)
add('Couleurs', 'plan 2 chaud saturé · plan 3 sombre peu contrasté · plan 5 froid', f"plan 2 {s2['temperature']} {s2['saturation']} % · plan 3 lum. {s3['luminosite']} % contraste {s3['contraste']} % · plan 5 {s5['temperature']}",
    s2['temperature'] == 'chaude' and s3['luminosite'] < 15 and s5['temperature'] == 'froide')
add('Tempo de la musique', '120 BPM', f"{so['tempo_bpm']} BPM", abs(so['tempo_bpm'] - 120) <= 2)
add('Coupes calées sur le temps', '12 sur 13', so['coupes_sur_le_temps'], so['coupes_sur_le_temps'].startswith('12 '))
add('Passages de voix', '6', str(len(so['voix_segments_s'])), len(so['voix_segments_s']) == 6)
add('Pauses entre les phrases', ' / '.join(map(str, V['pauses_s'])) + ' s', ' / '.join(map(str, so['pauses_s'])) + ' s', len(so['pauses_s']) == 5 and all(abs(a - b) < .1 for a, b in zip(so['pauses_s'], V['pauses_s'])))
add('Débit de parole', '5 syllabes/s', f"{so['syllabes_par_s']} syllabes/s", abs(so['syllabes_par_s'] - 5) < .5)
add('Baisse de la musique sous la voix', '10 dB', f"{so['baisse_musique_sous_voix_db']} dB", so['baisse_musique_sous_voix_db'] is not None and abs(so['baisse_musique_sous_voix_db'] - 10) < 2)
fx = so['effets_sonores']
add('Effets sonores', 'whoosh 3,0 / boum 4,0 / whoosh 11,5 / whoosh 14,5', ' / '.join(f"{'whoosh' if 'souffle' in s['type'] else 'boum'} {s['t']}" for s in fx), len(fx) == 4)
add('Effets calés sur l\'image', 'coupe / punch-in / flash / glissement', ' / '.join(str(s['synchronise_avec']) for s in fx), all(s['synchronise_avec'] for s in fx))
n_ok = sum(r[3] == '✅' for r in rows)
out = ['| Paramètre | Réglage réel | Mesuré automatiquement | |', '|---|---|---|---|'] + [f"| {a} | {b} | {c} | {d} |" for a, b, c, d in rows] + ['', f"**{n_ok} / {len(rows)} justes.**"]
open('verification.md', 'w').write('\n'.join(out)); print('\n'.join(out))

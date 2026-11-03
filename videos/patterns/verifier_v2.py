# Compare la mesure (pattern.json) de la vidéo de test n° 2 à sa vérité terrain (truth_v2.json).
import json, sys
P = json.load(open(sys.argv[1])); V = json.load(open(sys.argv[2]))
tr, mv, ov, so, pl = P['transitions'], P['mouvements'], P['incrustations'], P['son'], P['plans']
rows = []
def add(name, truth, meas, ok): rows.append((name, truth, meas, '✅' if ok else '❌'))
near = lambda a, b, tol=0.15: abs(a - b) <= tol
find = lambda lst, typ, t, tol=0.2: next((x for x in lst if x['type'] == typ and near(x['start_s'], t, tol)), None)
# coupes
hard = [e for e in tr if e['type'] in ('coupe sèche', 'coupe avec recadrage', 'jump cut')]
ok_c = sum(1 for c in V['cuts_hard_s'] if any(near(e['start_s'], c, 0.05) for e in hard))
extra = [e['start_s'] for e in hard if not any(near(e['start_s'], c, 0.05) for c in V['cuts_hard_s'])]
add('Coupes sèches', f"{len(V['cuts_hard_s'])}", f"{ok_c} retrouvées · {len(extra)} en trop {extra[:5]}", ok_c == len(V['cuts_hard_s']) and not extra)
rf = next((e for e in hard if near(e['start_s'], V['reframe_cut']['t'], 0.05)), None)
add('Coupe avec recadrage', f"2,0 s · +{V['reframe_cut']['zoom_pct']} %", f"{rf['type']} {rf.get('zoom_pct')} %" if rf else '—', bool(rf) and rf['type'] == 'coupe avec recadrage' and abs(rf.get('zoom_pct', 0) - 15) < 2)
for t in V['transitions']:
    m = find(tr, t['type'], t['start_s'])
    det = f"{m['type']} · {m['start_s']} s · {m['dur_frames']} images" + (f" · {m['direction']}" if m.get('direction') else '') if m else (', '.join(f"{e['type']}@{e['start_s']}" for e in tr if near(e['start_s'], t['start_s'], 0.3)) or '—')
    ok = bool(m) and abs(m['dur_frames'] - t['dur_frames']) <= 2 and (t.get('direction') is None or m.get('direction') == t['direction'])
    add(f"Transition : {t['type']}", f"{t['start_s']} s · {t['dur_frames']} images" + (f" · {t['direction']}" if t.get('direction') else ''), det, ok)
# mouvements
r = V['speed_ramp']; m = next((x for x in mv if x['type'] == 'accélération progressive'), None)
add('Accélération progressive (speed ramp)', f"{r['from_px']} → {r['to_px']} px/image", f"{m['vitesse_debut_px_img']} → {m['vitesse_fin_px_img']} à {m['start_s']} s" if m else '—', bool(m) and abs(m['vitesse_fin_px_img'] / max(0.1, m['vitesse_debut_px_img']) - 4) < 1.5)
m = next((x for x in mv if x['type'] == 'marche arrière'), None)
add('Marche arrière', f"{V['reverse']['start_s']} s", f"{m['start_s']} s" if m else '—', bool(m) and near(m['start_s'], V['reverse']['start_s'], 0.2))
bad = [f"{x['type']}@{x['start_s']}" for x in mv if x['type'] not in ('accélération progressive', 'marche arrière', 'panoramique')]
add('Fausses détections de mouvement', 'aucune (sauf le lent panoramique du plan 2)', ', '.join(bad) or 'aucune', not bad)
# incrustations
for o in V['overlays']:
    typ = {'sticker': 'sticker / émoji', 'émoji': 'sticker / émoji', 'flèche': 'forme (flèche…)'}.get(o['type'], o['type'])
    m = next((x for x in ov if x['type'] == typ and near(x['start_s'], o['start_s'], 0.3)), None)
    det = (f"{m['type']} · {m['start_s']}–{m.get('end_s')} s" + (f" · entrée : {m['entree']}" if m.get('entree') else '') + (f" · {m.get('position') or m.get('disposition') or ''}")) if m else (', '.join(f"{x['type']}@{x['start_s']}" for x in ov if near(x['start_s'], o['start_s'], 0.5)) or '—')
    ok = bool(m) and (o.get('entree') is None or o['entree'].split(' ')[0] in (m.get('entree') or ''))
    add(f"Incrustation : {o['type']}", f"{o['start_s']}–{o['end_s']} s" + (f" · entrée : {o['entree']}" if o.get('entree') else ''), det, ok)
sp = next((x for x in ov if x['type'] == 'écran partagé'), None)
add('Écran partagé', f"{V['split_screen']['start_s']}–{V['split_screen']['end_s']} s · {V['split_screen']['layout']}", f"{sp['start_s']}–{sp['end_s']} s · {sp['disposition']}" if sp else '—', bool(sp) and sp['disposition'] == V['split_screen']['layout'])
def _matched(x):
    if x['type'] == 'écran partagé': return True
    return any(near(x['start_s'], o['start_s'], 0.5) or (x['start_s'] >= o['start_s'] - 0.3 and x['start_s'] <= o['end_s']) for o in V['overlays'])
fausses = [x for x in ov if not _matched(x)]
add('Fausses incrustations', '0', str(len(fausses)) + (' : ' + ', '.join(f"{x['type']}@{x['start_s']}" for x in fausses) if fausses else ''), not fausses)
# textes
caps = P['sous_titres']
for c in V['captions']:
    m = next((x for x in caps if near(x['start_s'], c['start_s'], 0.25)), None)
    add(f"Sous-titre « {c['text']} »", f"{c['start_s']} s · {c['animation']}", f"« {m['text']} » · {m['start_s']} s · {m['animation']}" if m else '—', bool(m) and m['text'] == c['text'] and c['animation'].split(' ')[0] in m['animation'])
st = P['sous_titres_resume']
add('Style des sous-titres', f"{V['caption_y_pct']} % de hauteur · surligné {V['highlight']} · majuscules · contour noir",
    f"{st.get('position_y_pct')} % · {st.get('couleur_surlignage')} · majuscules {st.get('majuscules')} · contour {st.get('contour_noir')}", st.get('position_y_pct') in range(V['caption_y_pct'] - 2, V['caption_y_pct'] + 3) and st.get('couleur_surlignage') == V['highlight'])
tx = ' / '.join(x['text'] for x in P['textes_a_l_ecran'])
add('Textes à l\'écran (titres, interface)', 'PART 2 · THE TURN · JOHN DOE · Dashboard', tx[:120], all(w in tx for w in ['PART 2', 'THE TURN', 'JOHN DOE']))
# plans
for s in V['shot_types']:
    m = next((x for x in pl if x['start_s'] - 0.3 <= s['start_s'] + 0.2 and x['end_s'] >= s['start_s'] + 0.5), None)
    add(f"Type de plan {s['start_s']}–{s['end_s']} s", s['type'], m.get('type_de_plan') if m else '—', bool(m) and m.get('type_de_plan') == s['type'])
a = next((x for x in pl if x['start_s'] < 0.5), None)
add('Étalonnage plan 1', 'ombres bleutées · lumières orangées · vignettage', f"ombres {a['ombres']} · lumières {a['hautes_lumieres']} · vignettage {a['vignettage']}" if a else '—',
    bool(a) and ('bleu' in a['ombres'] or 'cyan' in a['ombres']) and ('orang' in a['hautes_lumieres'] or 'jaune' in a['hautes_lumieres']) and a['vignettage'] > 0)
add('Grain (limite connue : un grain fin est effacé par la compression)', 'grain d\'écart-type 6 avant compression', f"grain {a['grain']}" if a else '—', bool(a) and a['grain'] > 0)
lb = next((x for x in pl if 24 <= x['start_s'] < 25), None)
add('Bandes noires', f"{V['letterbox']['bar_pct']} %", f"{lb['bandes_noires_pct']} %" if lb else '—', bool(lb) and abs(lb['bandes_noires_pct'] - V['letterbox']['bar_pct']) <= 2)
fc = a.get('visage') if a else None
add('Visage et cadrage', f"centre {V['face']['centre_pct']} %", f"centre {fc['centre_pct']} % · {fc['taille_pct_ecran']} % de l'écran · tiers haut {fc['sur_le_tiers_haut']}" if fc else '—', bool(fc) and abs(fc['centre_pct'][1] - V['face']['centre_pct'][1]) <= 8)
# son
lines = V['voice_lines']; ph = so.get('phrases', [])
wer_ok = 0
for a_, b_, txt in lines:
    m = next((p for p in ph if p['start_s'] - 0.4 <= a_ <= p['end_s']), None)
    if m and m['text'].lower().strip('. ').replace(',', '') == txt.lower().strip('. ').replace(',', ''): wer_ok += 1
def _wer(ref, hyp):
    r, h = ref.split(), hyp.split(); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return d[len(h)], len(r)
norm = lambda t: ''.join(ch for ch in t.lower() if ch.isalnum() or ch == ' ')
hyp_all = norm(' '.join(p['text'] for p in ph)); ref_all = norm(' '.join(l[2] for l in lines))
e_, n_ = _wer(ref_all, hyp_all)
add('Transcription (taux d\'erreur sur les mots)', f"{len(lines)} phrases · {n_} mots · voix de synthèse sous musique", f"{wer_ok} phrases identiques · {round(100 * e_ / n_)} % de mots faux", e_ / n_ <= 0.15)
add('Passages de voix', f"{len(lines)}", f"{len(so.get('voix_segments_s', []))}", abs(len(so.get('voix_segments_s', [])) - len(lines)) <= 1)
add('Débit de parole', 'environ 150 à 190 mots/min (synthèse vocale à 165)', f"{so.get('mots_par_min')} mots/min", so.get('mots_par_min') is not None and 120 <= so['mots_par_min'] <= 220)
add('Tempo', '120 BPM', f"{so.get('tempo_bpm')} BPM", so.get('tempo_bpm') is not None and abs(so['tempo_bpm'] - 120) <= 2)
add('Baisse de la musique sous la voix', '10 dB', f"{so.get('baisse_musique_sous_voix_db')} dB", so.get('baisse_musique_sous_voix_db') is not None and abs(so['baisse_musique_sous_voix_db'] - 10) <= 3)
co = so.get('coupures_musique', [])
add('Coupure de musique', '23,5 s · 0,5 s, avant une révélation', ', '.join(f"{c['start_s']} s · {c['dur_s']} s → {c['suivi_de']}" for c in co) or '—', any(near(c['start_s'], 23.5, 0.15) for c in co))
fx = so.get('effets_sonores', [])
alias = {'whoosh': 'souffle', 'boom': 'impact', 'riser': 'montée', 'pop': 'pop', 'clic': 'clic', 'ding': 'ding', 'glitch': 'glitch', 'clavier': 'clavier', 'déclencheur': 'déclencheur'}
hit = 0; missing = []
for e in V['sfx']:
    t0 = e['t'] - (0.15 if e['type'] == 'whoosh' else 0)
    if any(abs(x['t'] - t0) <= 0.2 and x['type'].startswith(alias[e['type']]) for x in fx): hit += 1
    else: missing.append(f"{e['type']}@{e['t']}")
add('Effets sonores (moment + type)', f"{len(V['sfx'])}", f"{hit} justes · manquent : {', '.join(missing) or 'aucun'} · détectés en tout : {len(fx)}", hit >= len(V['sfx']) - 1)
n_ok = sum(r[3] == '✅' for r in rows)
out = ['| Paramètre | Réglage réel | Mesuré automatiquement | |', '|---|---|---|---|'] + [f"| {a} | {b} | {c} | {d} |" for a, b, c, d in rows] + ['', f"**{n_ok} / {len(rows)} justes.**"]
open('verification_v2.md', 'w').write('\n'.join(out)); print('\n'.join(out))

#!/usr/bin/env python3
"""Vérifie la vidéo de test n° 4 (texte qui suit le sujet, kaléidoscope, shake sur les temps, cymbale inversée)
et la détection « slowed + reverb » sur deux musiques."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
P = json.load(open(sys.argv[1])); V = json.load(open(sys.argv[2] if len(sys.argv) > 2 else 'truth_effets2.json'))
rows = []; add = lambda n, v, m, ok: rows.append(f"| {n} | {v} | {m} | {'✅' if ok else '❌'} |")
tx = [c for c in P['sous_titres'] + P['textes_a_l_ecran'] if c.get('suit_le_sujet')]
add('Texte qui suit le sujet', '« GO » 1,0–5,0 s', ', '.join('« %s » %s s' % (c['text'], c['start_s']) for c in tx) or '—', any('GO' in c['text'].upper() for c in tx))
k = [e for e in P.get('effets_image', []) if e['type'] == 'kaléidoscope']
add('Kaléidoscope', '5,0–9,0 s', ', '.join('%s–%s s' % (e['start_s'], e['end_s']) for e in k) or '—', any(e['start_s'] < 9 and e['end_s'] > 5 for e in k))
sh = [m for m in P['mouvements'] if m['type'] == 'shake ajouté (sur le temps)']
add('Shake ajouté sur les temps', '9,0–14,0 s', f"{len(sh)} secousses : " + ', '.join(str(m['start_s']) for m in sh[:6]), sum(9 <= m['start_s'] < 14 for m in sh) >= 3)
cy = (P.get('musique_detaillee') or {}).get('cymbales_inversees', [])
add('Cymbale inversée avant le drop', '12,5–14,0 s', ', '.join('%s–%s s' % (c['de_s'], c['a_s']) for c in cy) or '—', any(abs(c['a_s'] - 14.0) < 0.3 for c in cy))
import librosa
from montage import musique
d = os.path.dirname(os.path.abspath(sys.argv[1]))
for f, attendu in (('musique-normale.wav', None), ('musique-slowed.wav', 'slowed + reverb (probable)')):
    p = f if os.path.exists(f) else os.path.join(d, '..', f)
    y, sr = librosa.load(p, sr=22050); M = musique.analyse(y, sr)
    add(f"Version de {f}", attendu or 'normale', f"{M.get('version') or 'normale'} (traîne {M.get('traine_apres_les_coups_s')} s, {M.get('tempo_bpm')} BPM)", M.get('version') == attendu)
n_ok = sum('✅' in r for r in rows)
print('\n'.join(['| Mesure | Réel | Trouvé | |', '|---|---|---|---|'] + rows + ['', f"**{n_ok} / {len(rows)} justes.**"]))

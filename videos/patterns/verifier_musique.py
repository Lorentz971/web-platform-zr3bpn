#!/usr/bin/env python3
"""Vérifie l'analyse musicale sur la musique de test (video-test-musique.py) : tempo, filtre étouffé, drops, silence avant le drop."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import librosa
from montage import musique
V = json.load(open(sys.argv[2] if len(sys.argv) > 2 else 'truth_musique.json'))
y, sr = librosa.load(sys.argv[1] if len(sys.argv) > 1 else 'musique-test.wav', sr=22050); M = musique.analyse(y, sr)
rows = []
add = lambda n, v, m, ok: rows.append(f"| {n} | {v} | {m} | {'✅' if ok else '❌'} |")
add('Tempo', f"{V['tempo_bpm']} BPM", f"{M['tempo_bpm']} BPM", abs(M['tempo_bpm'] - V['tempo_bpm']) <= 2)
f = M['filtres'][0] if M['filtres'] else None
add('Intro étouffée (filtre)', f"{V['filtre'][0]}–{V['filtre'][1]} s", f"{f['de_s']}–{f['a_s']} s" if f else '—', bool(f) and abs(f['de_s'] - V['filtre'][0]) < 0.5 and abs(f['a_s'] - V['filtre'][1]) < 0.5)
for d in V['drops']:
    m = next((x for x in M['drops'] if abs(x['t'] - d) <= 0.3), None)
    add(f"Drop à {d} s", f"{d} s", f"{m['t']} s" if m else '—', bool(m))
m = next((x for x in M['drops'] if x.get('silence_avant')), None)
add('Silence juste avant un drop', f"{V['silence'][0]}–{V['silence'][1]} s", f"drop à {m['t']} s après un silence de {m.get('silence_s')} s" if m else '—', bool(m) and abs(m['t'] - V['silence'][1]) < 0.3)
n_ok = sum('✅' in r for r in rows)
print('\n'.join(['| Mesure | Réel | Mesuré | |', '|---|---|---|---|'] + rows + ['', f"**{n_ok} / {len(rows)} justes.**"]))

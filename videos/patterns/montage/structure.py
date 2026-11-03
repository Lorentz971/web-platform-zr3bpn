"""Rythme dans le temps, accroche, chapitres, relances, indice d'intensité."""
import math
import numpy as np


def analyse(S, events, shots, moves, audio, overlays, captions):
    NF, FPS = S['NF'], S['FPS']; dur = NF / FPS; secs = max(1, int(math.ceil(dur)))
    cut_t = [e['start_s'] for e in events]
    cuts_ps = np.array([sum(1 for c in cut_t if s <= c < s + 1) for s in range(secs)], float)
    mot = np.zeros(secs)
    for s in range(secs):
        rr = S['rows'][int(s * FPS):int((s + 1) * FPS)]
        mot[s] = np.mean([abs(math.log(max(1e-3, math.hypot(r['M'][0][0], r['M'][1][0])))) * 100 + math.hypot(r['M'][0][2], r['M'][1][2]) * S['SC'] / 10 if r.get('M') else 3 for r in rr]) if rr else 0
    vol = np.zeros(secs); v = audio.get('volume_db_par_seconde', [])[:secs]; vol[:len(v)] = v
    gfx = np.zeros(secs)
    for o in overlays:
        if 'entree' in o: gfx[min(secs - 1, int(o['start_s']))] += 1
    sfxn = np.zeros(secs)
    for x in audio.get('effets_sonores', []): sfxn[min(secs - 1, int(x['t']))] += 1
    norm = lambda x: (x - x.min()) / (x.max() - x.min() + 1e-9)
    inten = np.round(100 * (0.35 * norm(cuts_ps) + 0.25 * norm(mot) + 0.15 * norm(vol) + 0.15 * norm(sfxn) + 0.10 * norm(gfx))).astype(int)
    # rythme par fenêtres de 5 s
    win = 5
    pace = [dict(de_s=k, a_s=min(dur, k + win), coupes=int(sum(1 for c in cut_t if k <= c < k + win)), plans_par_min=round(sum(1 for c in cut_t if k <= c < k + win) / min(win, dur - k) * 60, 1))
            for k in range(0, int(dur), win)]
    # accroche : les premières secondes, jusqu'à la première vraie respiration (plan de plus de 2 s ou fin de la 1re phrase)
    first_long = next((s['start_s'] for s in shots if s['dur_s'] >= 2.0 and s['start_s'] > 0.5), None)
    first_sentence = audio.get('phrases', [{}])[0].get('end_s') if audio.get('phrases') else None
    hook_end = min([x for x in [first_long, first_sentence, 5.0] if x]) if (first_long or first_sentence) else min(3.0, dur)
    hook = dict(duree_s=round(hook_end, 2), coupes=int(sum(1 for c in cut_t if c < hook_end)),
                elements=[x for x in [('texte à l\'écran' if any(c['start_s'] < hook_end for c in captions) else None),
                                      ('zoom' if any(m['start_s'] < hook_end and 'zoom' in m['type'] or m['type'] == 'punch-in' and m['start_s'] < hook_end for m in moves) else None),
                                      ('effet sonore' if any(x['t'] < hook_end for x in audio.get('effets_sonores', [])) else None)] if x])
    # chapitres : cartons de texte, coupures de musique suivies d'une révélation, changements nets de rythme
    marks = set()
    for s in shots:
        if s.get('type_de_plan') == 'carton de texte': marks.add(s['start_s'])
    for c in audio.get('coupures_musique', []): marks.add(round(c['start_s'] + c['dur_s'], 2))
    shot_len = [(s['start_s'], s['dur_s']) for s in shots]
    for i in range(3, len(shot_len) - 3):
        before = np.median([d for _, d in shot_len[i - 3:i]]); after = np.median([d for _, d in shot_len[i:i + 3]])
        if after < before / 2.5 or after > before * 2.5: marks.add(shot_len[i][0])
    marks = sorted(m for m in marks if 1.0 < m < dur - 1.0)
    filt = []
    for m in marks:
        if not filt or m - filt[-1] > 3: filt.append(m)
    bounds = [0.0] + filt + [round(dur, 2)]
    chapters = []
    for a, b in zip(bounds, bounds[1:]):
        sh = [s for s in shots if a <= s['start_s'] < b]
        chapters.append(dict(de_s=a, a_s=b, plans=len(sh), duree_moyenne_plan_s=round(float(np.mean([s['dur_s'] for s in sh])), 2) if sh else None,
                             intensite_moyenne=int(np.mean(inten[int(a):max(int(a) + 1, int(b))]))))
    peaks = [s for s in range(1, secs - 1) if inten[s] >= 60 and inten[s] >= inten[s - 1] and inten[s] >= inten[s + 1]]
    relances = []
    for p in peaks:
        if not relances or p - relances[-1] >= 3: relances.append(p)
    return dict(intensite_par_seconde=inten.tolist(), rythme_par_5s=pace, accroche=hook, chapitres=chapters,
                relances_s=relances, intervalle_moyen_relances_s=round(float(np.mean(np.diff(relances))), 1) if len(relances) > 2 else None)

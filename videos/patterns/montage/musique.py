"""Analyse fine de la musique d'un montage : temps, premiers temps des mesures, coups de grosse caisse et de caisse claire,
parties (intro, montée, drop, pause, outro), drops, filtre « étouffé » qui s'ouvre, silence juste avant le drop.
C'est ce qui permet de comprendre POURQUOI un effet tombe à un moment précis."""
import numpy as np


def _db(x): return 10 * np.log10(np.maximum(x, 1e-12))


def analyse(y, sr=22050, voix=None):
    """y : son mono (le mélange, ou mieux la musique seule) ; voix : passages de voix [[début, fin], …]. Renvoie un dict."""
    import librosa
    if y is None or len(y) < sr: return None
    hop = 512
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)) ** 2
    f = librosa.fft_frequencies(sr=sr, n_fft=2048); t = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
    H, P = librosa.decompose.hpss(S, margin=2.0)
    band = lambda M, lo, hi: M[(f >= lo) & (f < hi)].sum(0)
    # coups de grosse caisse (graves percussifs) et de caisse claire (médiums percussifs bruités)
    def coups(env, delta):
        o = np.maximum(0, np.diff(_db(env), prepend=_db(env[:1])))
        o = np.convolve(o, np.ones(2) / 2, 'same')
        pk = librosa.util.peak_pick(o, pre_max=3, post_max=3, pre_avg=8, post_avg=8, delta=delta, wait=4)
        return [round(float(t[i]), 3) for i in pk]
    kicks = coups(band(P, 30, 150), 6); snares = coups(band(P, 1500, 6000), 6)
    # temps et premiers temps (le temps fort de chaque mesure de 4)
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop)
    tempo = float(np.atleast_1d(tempo)[0]); bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
    low = band(S, 30, 150)
    if len(bt) >= 8:
        acc = [np.mean([low[min(len(low) - 1, beats[i])] for i in range(ph, len(beats), 4)]) for ph in range(4)]
        ph = int(np.argmax(acc)); down = bt[ph::4]
    else:
        down = bt[:1]
    # énergie par demi-seconde : volume, graves, brillance (pour les parties et le filtre)
    win = max(1, int(0.5 * sr / hop)); n = S.shape[1] // win
    if n < 4: return dict(tempo_bpm=round(tempo), temps_s=[round(float(x), 3) for x in bt])
    seg = lambda v: np.array([v[i * win:(i + 1) * win].mean() for i in range(n)])
    rms = _db(seg(S.sum(0))); grave = _db(seg(low)); aigu = _db(seg(band(S, 4000, 11000)))
    centro = seg((f[:, None] * S).sum(0) / np.maximum(S.sum(0), 1e-12))
    tt = (np.arange(n) + 0.5) * win * hop / sr
    ref = np.percentile(rms, 90)
    # drops : (1) les graves et le volume bondissent, (2) la musique repart après un silence, (3) le filtre s'ouvre
    kk = np.array(kicks) if kicks else np.array([])
    def caler(tx):                                            # au premier temps (ou au coup de grosse caisse) le plus proche
        c = [x for x in list(down) + list(kk) if abs(x - tx) < 0.35]
        return float(min(c, key=lambda x: abs(x - tx))) if c else float(tx)
    drops = []
    def ajoute(tx, **kw):
        tx = caler(tx)
        if all(abs(tx - d['t']) > 3 for d in drops): drops.append(dict(t=round(tx, 2), **kw))
    for i in range(2, n - 1):
        avant = rms[max(0, i - 4):i].mean(); apres = rms[i:i + 3].mean()
        g_av = grave[max(0, i - 4):i].mean(); g_ap = grave[i:i + 3].mean()
        if apres - avant > 5 and g_ap - g_av > 6 and apres > ref - 8:
            ajoute(tt[i] - 0.25, saut_volume_db=round(float(apres - avant), 1), saut_graves_db=round(float(g_ap - g_av), 1), silence_avant=False)
    # filtre étouffé (passe-bas) : la brillance est très basse puis remonte d'un coup alors que la musique joue
    filtres = []
    i = 0
    if (aigu < np.percentile(aigu, 60) - 15).mean() > 0.35: i = n     # musique sans aigus la plupart du temps : rien à conclure
    while i < n:
        if aigu[i] < np.percentile(aigu, 60) - 15 and rms[i] > ref - 20:
            j = i
            while j + 1 < n and aigu[j + 1] < np.percentile(aigu, 60) - 12 and rms[j + 1] > ref - 22: j += 1
            # un filtre garde les graves (seuls les aigus disparaissent) ; une musique baissée sous la voix perd tout
            graves_gardes = (np.percentile(aigu, 60) - aigu[i:j + 1].mean()) - (np.percentile(grave, 60) - grave[i:j + 1].mean()) > 10
            tient = j + 3 < n and aigu[j + 1:j + 4].mean() > np.percentile(aigu, 60) - 4      # les aigus restent ouverts ensuite
            a_, b_ = tt[i] - 0.25, tt[j] + 0.25                      # pendant qu'on parle, la musique est baissée : ce n'est pas un filtre
            sous_voix = sum(max(0, min(b_, v1) - max(a_, v0)) for v0, v1 in (voix or [])) > 0.4 * (b_ - a_)
            if j + 1 < n:                                             # les aigus qui « s'ouvrent » sont-ils ceux de la voix ?
                c_, d_ = tt[j + 1] - 0.25, tt[min(n - 1, j + 3)] + 0.25
                sous_voix = sous_voix or sum(max(0, min(d_, v1) - max(c_, v0)) for v0, v1 in (voix or [])) > 0.4 * (d_ - c_)
            if j - i >= 2 and j + 1 < n and aigu[j + 1] - aigu[j] > 10 and graves_gardes and tient and not sous_voix:
                filtres.append(dict(de_s=round(float(tt[i] - 0.25), 2), a_s=round(float(tt[j + 1] - 0.25), 2), ouverture_db=round(float(aigu[j + 1] - aigu[j]), 1)))
            i = j + 1
        else:
            i += 1
    # silence net (au moins 0,15 s) puis la musique repart fort : drop « après un trou »
    fine = _db(np.convolve(S.sum(0), np.ones(4) / 4, 'same')); reff = np.percentile(fine, 90)
    sil = fine < reff - 25; k = 0
    while k < len(sil):
        if sil[k]:
            j = k
            while j + 1 < len(sil) and sil[j + 1]: j += 1
            if (j - k + 1) * hop / sr >= 0.15 and j + 8 < len(fine) and fine[j + 1:j + 9].max() > reff - 8 and t[j] > 0.5:
                ajoute(t[j + 1], saut_volume_db=round(float(fine[j + 1:j + 9].max() - max(fine[k:j + 1].mean(), -60)), 1), saut_graves_db=0.0, silence_avant=True,
                       silence_s=round(float((j - k + 1) * hop / sr), 2))
            k = j + 1
        else:
            k += 1
    for x in filtres:                                         # l'ouverture du filtre est un drop si la musique est forte ensuite
        j = int(np.searchsorted(tt, x['a_s'] + 0.25))
        if j < n and rms[j:j + 3].mean() > ref - 6: ajoute(x['a_s'], saut_volume_db=0.0, saut_graves_db=0.0, silence_avant=False, ouverture_du_filtre=True)
    drops.sort(key=lambda d: d['t'])
    # parties : on coupe aux drops, aux silences et aux grands changements d'énergie, puis on les nomme
    bornes = sorted({0.0, round(float(tt[-1] + 0.25), 2)} | {d['t'] for d in drops} | {x['de_s'] for x in filtres} | {x['a_s'] for x in filtres})
    for i in range(1, n):
        if abs(rms[i] - rms[i - 1]) > 9 and all(abs(tt[i] - 0.25 - b) > 1.5 for b in bornes): bornes.append(round(float(tt[i] - 0.25), 2))
    bornes = sorted(bornes); parties = []
    for a, b in zip(bornes, bornes[1:]):
        if b - a < 0.4: continue
        m = (tt >= a) & (tt < b)
        if not m.any(): continue
        e = float(rms[m].mean()); pente = float(np.polyfit(tt[m], rms[m], 1)[0]) if m.sum() >= 3 else 0.0
        etouffe = any(x['de_s'] - 0.3 <= a and b <= x['a_s'] + 0.3 for x in filtres)
        if e < ref - 25: nom = 'pause / silence'
        elif any(abs(d['t'] - a) < 0.6 for d in drops): nom = 'drop'
        elif etouffe: nom = 'intro étouffée (filtre)' if a < 1 else 'passage étouffé (filtre)'
        elif pente > 1.5: nom = 'montée'
        elif a < 1 and e < ref - 6: nom = 'intro'
        elif b > tt[-1] - 0.5 and pente < -1.5: nom = 'outro'
        else: nom = 'refrain / partie forte' if e > ref - 5 else 'couplet / partie calme'
        parties.append(dict(de_s=float(a), a_s=float(b), nom=nom, energie_db=round(float(e - ref), 1)))
    # cymbale inversée : un souffle aigu qui monte régulièrement puis s'arrête net (souvent juste avant un drop)
    hi = _db(np.convolve(band(S, 5000, 11000), np.ones(4) / 4, 'same')); cymb = []
    fps_ = sr / hop; k = 0
    while k < len(hi) - 2:
        j = k
        while j + 1 < len(hi) and hi[j + 1] >= hi[j] - 0.6: j += 1
        dur = (j - k) / fps_
        if 0.4 <= dur <= 2.5 and hi[j] - hi[k] > 12 and j + 3 < len(hi) and hi[j] - hi[j + 1:j + 4].min() > 8:
            if np.polyfit(np.arange(j - k + 1), hi[k:j + 1], 1)[0] * fps_ > 6:
                cymb.append(dict(de_s=round(float(t[k]), 2), a_s=round(float(t[j]), 2), montee_db=round(float(hi[j] - hi[k]), 1)))
            k = j + 1
        else: k += 1
    # version « slowed + reverb » : tempo lent et sons qui traînent longtemps après chaque coup
    decs = []
    for kt in kicks[:40]:
        i0 = int(kt * fps_); seg_ = _db(S.sum(0)[i0:i0 + int(1.5 * fps_)] + 1e-12)
        if len(seg_) > 5:
            pk = seg_.max(); after = np.nonzero(seg_[np.argmax(seg_):] < pk - 20)[0]
            decs.append((after[0] if len(after) else len(seg_)) / fps_)
    decay = float(np.median(decs)) if decs else None
    version = 'slowed + reverb (probable)' if decay and decay > 0.45 and tempo < 100 else None
    return dict(tempo_bpm=round(tempo), temps_s=[round(float(x), 3) for x in bt], premiers_temps_s=[round(float(x), 3) for x in down],
                grosse_caisse_s=kicks, caisse_claire_s=snares, drops=drops, filtres=filtres, parties=parties,
                cymbales_inversees=cymb, traine_apres_les_coups_s=round(decay, 2) if decay else None, version=version)


def lien(t, M, tol=0.07):
    """Sur quel élément de la musique tombe l'instant t ? (le plus fort d'abord)"""
    if not M: return None
    tb_ = M.get('temps_s') or []
    if len(tb_) > 2: tol = min(tol, 0.15 * float(np.median(np.diff(tb_))))   # musique rapide : tolérance plus fine, sinon tout paraît « calé »
    near = lambda L: L and min(abs(x - t) for x in L) <= tol
    if any(abs(d['t'] - t) <= tol + 0.03 for d in M.get('drops', [])): return 'sur le drop'
    if any(abs(x['a_s'] - t) <= tol + 0.05 for x in M.get('filtres', [])): return "à l'ouverture du filtre"
    if near(M.get('premiers_temps_s')): return 'sur le premier temps de la mesure'
    if near(M.get('caisse_claire_s')): return 'sur la caisse claire'
    if near(M.get('grosse_caisse_s')): return 'sur la grosse caisse'
    if near(M.get('temps_s')): return 'sur un temps'
    tb = M.get('temps_s') or []
    if len(tb) > 2:
        per = float(np.median(np.diff(tb)))
        if any(abs(x + per / 2 - t) <= tol for x in tb): return 'sur un contretemps'
    return 'hors temps'


def partie(t, M):
    for p in (M or {}).get('parties', []):
        if p['de_s'] <= t < p['a_s']: return p['nom']
    return None

"""Son : volume, tempo, voix (transcription horodatée si les modèles sont installés), pauses, débit,
séparation voix / musique, baisse de la musique sous la voix, coupures de musique, effets sonores classés."""
import os, subprocess, tempfile, math
import numpy as np
from scipy.signal import find_peaks

MODELS = os.environ.get('MONTAGE_MODELS', os.path.join(os.path.expanduser('~'), '.cache', 'analyse-montage'))
ASR_DIR = os.path.join(MODELS, 'sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8')
SEP_DIR = os.path.join(MODELS, 'sherpa-onnx-spleeter-2stems-fp16')
VAD_FILE = os.path.join(MODELS, 'silero_vad.onnx')


def load(video, sr=44100):
    tmp = tempfile.mktemp(suffix='.wav')
    rc = subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', video, '-vn', '-ac', '2', '-ar', str(sr), tmp]).returncode
    if rc != 0 or not os.path.exists(tmp): return None
    import soundfile as sf
    y, _ = sf.read(tmp, dtype='float32'); os.remove(tmp)
    if y.ndim == 1: y = np.stack([y, y], 1)
    return y.T.copy()                                          # (2, n)


def separate(y, sr):
    if not (os.path.exists(os.path.join(SEP_DIR, 'vocals.fp16.onnx'))): return None, None
    import sherpa_onnx
    cfg = sherpa_onnx.OfflineSourceSeparationConfig(model=sherpa_onnx.OfflineSourceSeparationModelConfig(
        spleeter=sherpa_onnx.OfflineSourceSeparationSpleeterModelConfig(vocals=os.path.join(SEP_DIR, 'vocals.fp16.onnx'), accompaniment=os.path.join(SEP_DIR, 'accompaniment.fp16.onnx')), num_threads=4))
    out = sherpa_onnx.OfflineSourceSeparation(cfg).process(sample_rate=sr, samples=y.astype(np.float32))
    return np.array(out.stems[0].data).mean(0), np.array(out.stems[1].data).mean(0)


def transcribe(mono16, segs):
    """Mots horodatés (Parakeet TDT, 25 langues dont le français et l'anglais)."""
    if not os.path.exists(os.path.join(ASR_DIR, 'tokens.txt')): return None
    import sherpa_onnx
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=os.path.join(ASR_DIR, 'encoder.int8.onnx'), decoder=os.path.join(ASR_DIR, 'decoder.int8.onnx'),
                                                        joiner=os.path.join(ASR_DIR, 'joiner.int8.onnx'), tokens=os.path.join(ASR_DIR, 'tokens.txt'), model_type='nemo_transducer', num_threads=4)
    words, sentences = [], []
    for a, b in segs:
        x = mono16[int(a * 16000):int(b * 16000)]
        if len(x) < 1600: continue
        st = rec.create_stream(); st.accept_waveform(16000, x); rec.decode_stream(st); r = st.result
        cur = None
        for tok, t in zip(r.tokens, r.timestamps):
            t = a + float(t)
            if tok.startswith(' ') or cur is None:
                if cur: words.append(cur)
                cur = dict(w=tok.strip(), t=round(t, 2))
            else:
                cur['w'] += tok
        if cur: words.append(cur)
        if r.text.strip(): sentences.append(dict(text=r.text.strip(), start_s=round(a, 2), end_s=round(b, 2)))
    for i, w in enumerate(words):
        w['fin'] = words[i + 1]['t'] if i + 1 < len(words) and words[i + 1]['t'] - w['t'] < 1.0 else round(w['t'] + 0.35, 2)
    return dict(mots=words, phrases=sentences, texte=' '.join(s['text'] for s in sentences))


def vad_segments(mono16):
    if not os.path.exists(VAD_FILE): return None
    import sherpa_onnx
    cfg = sherpa_onnx.VadModelConfig(); cfg.silero_vad.model = VAD_FILE; cfg.silero_vad.min_silence_duration = 0.25
    cfg.silero_vad.min_speech_duration = 0.2; cfg.silero_vad.threshold = 0.5; cfg.sample_rate = 16000
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=600)
    ws = cfg.silero_vad.window_size; segs = []
    for i in range(0, len(mono16) - ws, ws):
        vad.accept_waveform(mono16[i:i + ws])
        while not vad.empty():
            s = vad.front; segs.append([s.start / 16000, (s.start + len(s.samples)) / 16000]); vad.pop()
    vad.flush()
    while not vad.empty():
        s = vad.front; segs.append([s.start / 16000, (s.start + len(s.samples)) / 16000]); vad.pop()
    merged = []
    for a, b in segs:
        if merged and a - merged[-1][1] < 0.25: merged[-1][1] = b
        else: merged.append([a, b])
    return [[round(a, 2), round(b, 2)] for a, b in merged if b - a > 0.25]


def _stft_db(x, sr, hop=512):
    import librosa
    S = np.abs(librosa.stft(x, n_fft=2048, hop_length=hop)) ** 2
    return S, librosa.fft_frequencies(sr=sr, n_fft=2048), librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)


def analyse(video, events, moves, overlays):
    import librosa, pyloudnorm
    y2 = load(video)
    if y2 is None or np.abs(y2).max() < 1e-4: return dict(silence=True), np.array([])
    sr = 44100; mono = y2.mean(0)
    out = dict(lufs_integre=round(float(pyloudnorm.Meter(sr).integrated_loudness(mono)), 1))
    voc, acc = separate(y2, sr)
    out['separation_voix_musique'] = voc is not None
    m22 = librosa.resample(mono, orig_sr=sr, target_sr=22050)
    acc22 = librosa.resample(acc, orig_sr=sr, target_sr=22050) if acc is not None else m22
    mono16 = librosa.resample(voc if voc is not None else mono, orig_sr=sr, target_sr=16000).astype(np.float32)
    hop = 512; S, freqs, tt = _stft_db(m22, 22050, hop)
    db = lambda x: 10 * np.log10(x + 1e-12)
    band = lambda Sx, lo, hi: Sx[(freqs >= lo) & (freqs < hi)].sum(0)
    rms_db = db(S.sum(0) / S.shape[0])
    # ---- voix
    vseg = vad_segments(mono16)
    out['detection_voix'] = 'modèle Silero' if vseg else 'estimation (énergie)'
    if not vseg:
        vb = band(S, 300, 3400); vdb = db(vb); vth = np.percentile(vdb, 20) + 12
        Sv = S[(freqs >= 300) & (freqs < 3400)]; flat = np.exp(np.log(Sv + 1e-12).mean(0)) / (Sv.mean(0) + 1e-12)
        von = np.convolve(((vdb > vth) & (flat < 0.15)).astype(float), np.ones(5) / 5, 'same') > 0.5
        from .common import runs
        vseg = [[float(tt[a]), float(tt[b])] for a, b in runs(von) if tt[b] - tt[a] >= 0.1]
        merged = []
        for a, b in vseg:
            if merged and a - merged[-1][1] < 0.25: merged[-1][1] = b
            else: merged.append([a, b])
        vseg = [[round(a, 2), round(b, 2)] for a, b in merged if b - a > 0.3]
    tr = transcribe(mono16, vseg) if vseg and out['detection_voix'] == 'modèle Silero' else None
    pauses = [round(vseg[i + 1][0] - vseg[i][1], 2) for i in range(len(vseg) - 1)]
    vdur = sum(b - a for a, b in vseg)
    out.update(voix_segments_s=vseg, pauses_s=pauses, pause_moyenne_s=round(float(np.mean(pauses)), 2) if pauses else None,
               temps_de_parole_pct=round(100 * vdur / (len(mono) / sr)) if len(mono) else 0)
    if tr:
        out['transcription'] = tr['texte']; out['phrases'] = tr['phrases']; out['mots'] = tr['mots']
        out['mots_par_min'] = round(len(tr['mots']) / vdur * 60) if vdur else None
    else:
        env = np.convolve(band(S, 300, 3400), np.ones(3) / 3, 'same')
        sp, _ = find_peaks(db(env), prominence=6, distance=int(0.12 * 22050 / hop))
        syl = len([p for p in sp if any(a <= tt[p] <= b for a, b in vseg)]) / vdur if vdur else 0
        out['syllabes_par_s'] = round(syl, 1); out['mots_par_min_estimes'] = round(syl * 60 / 1.5) if syl else None
    # ---- tempo (sur la musique seule si possible)
    perc = librosa.effects.percussive(acc22)
    oenv = librosa.onset.onset_strength(y=perc, sr=22050, hop_length=hop, fmax=200)
    ac = np.correlate(oenv - oenv.mean(), oenv - oenv.mean(), 'full')[len(oenv) - 1:]
    fa = 22050 / hop; lo_l, hi_l = int(0.3 * fa), int(1.2 * fa)
    beat_t = np.array([]); tempo = None
    if len(ac) > hi_l and ac[lo_l:hi_l].max() > 0.15 * ac[0]:
        cands, _ = find_peaks(ac[lo_l:hi_l]); cands = cands + lo_l
        if len(cands):
            L0 = int(min([c for c in cands if ac[c] >= 0.8 * ac[cands].max()]))
            d = (ac[L0 - 1] - ac[L0 + 1]) / (2 * (ac[L0 - 1] - 2 * ac[L0] + ac[L0 + 1]) + 1e-9); period = (L0 + d) / fa; tempo = 60 / period
            ph = np.arange(0, period, 1 / fa)
            score = [oenv[np.clip(np.round((p + np.arange(0, len(m22) / 22050, period)) * fa).astype(int), 0, len(oenv) - 1)].sum() for p in ph]
            beat_t = ph[int(np.argmax(score))] + np.arange(0, len(m22) / 22050, period)
    hard = [e['start_s'] for e in events if e['type'] in ('coupe sèche', 'coupe avec recadrage', 'jump cut')]
    if tempo:
        FPS_tol = 0.067
        on_beat = [c for c in hard if np.min(np.abs(beat_t - c)) <= FPS_tol]
        out.update(tempo_bpm=round(tempo), coupes_sur_le_temps=f'{len(on_beat)} coupes sur {len(hard)}', hasard_attendu_pct=round(min(100, 2 * FPS_tol / (60 / tempo) * 100)))
    else:
        out['tempo_bpm'] = None
    # ---- musique : baisse sous la voix, coupures
    Sa, _, _ = _stft_db(acc22, 22050, hop)
    mus = db(Sa.sum(0) / Sa.shape[0])
    vm = np.zeros_like(tt, bool)
    for a, b in vseg: vm |= (tt >= a + 0.15) & (tt <= b - 0.15)
    edge = np.ones_like(tt, bool)
    for a, b in vseg: edge &= (np.abs(tt - a) > 0.3) & (np.abs(tt - b) > 0.3)
    # coupures de musique : chute brutale du niveau de la musique pendant 0,15 à 2 s
    med = np.median(mus); low = mus < med - 18
    from .common import runs
    cutouts = []
    for a, b in runs(low):
        d = tt[b] - tt[a]
        if 0.15 <= d <= 2.0 and a > 5:
            after = [e for e in events if 0 <= e['start_s'] - tt[b] <= 0.35] + [m for m in moves if 0 <= m['start_s'] - tt[b] <= 0.35]
            cutouts.append(dict(start_s=round(float(tt[a]), 2), dur_s=round(float(d), 2), suivi_de=after[0]['type'] if after else None))
    keep = edge.copy()
    for c in cutouts: keep &= ~((tt >= c['start_s'] - 0.2) & (tt <= c['start_s'] + c['dur_s'] + 0.2))
    m_in, m_out = mus[vm & keep], mus[~vm & keep]
    d_stem = float(np.median(m_out) - np.median(m_in)) if len(m_in) > 20 and len(m_out) > 20 else None
    out['coupures_musique'] = cutouts
    # ---- effets sonores
    out['effets_sonores'] = sfx(m22, 22050, beat_t, vseg, events, moves)
    # 2e estimation de la baisse, sans séparation : les basses (30-150 Hz) du mélange, où la voix est faible,
    # hors effets sonores. Utile quand la séparation voix / musique échoue (voix très traitée, voix de synthèse).
    Sm, fq, _ = _stft_db(m22, 22050, hop)
    bass = db(Sm[(fq >= 30) & (fq <= 150)].sum(0) + 1e-12)
    away = np.ones_like(tt, bool)
    for x in out['effets_sonores']: away &= np.abs(tt - x['t']) > 0.6
    b_in, b_out = bass[vm & keep & away], bass[~vm & keep & away]
    d_bass = float(np.median(b_out) - np.median(b_in)) if len(b_in) > 20 and len(b_out) > 20 else None
    ests = [d for d in (d_stem, d_bass) if d is not None]
    out['baisse_musique_sous_voix_db'] = round(max(ests), 1) if ests else None
    out['baisse_musique_estimations_db'] = dict(piste_musique_separee=None if d_stem is None else round(d_stem, 1), basses_du_melange=None if d_bass is None else round(d_bass, 1))
    out['volume_db_par_seconde'] = [round(float(np.mean(rms_db[(tt >= s) & (tt < s + 1)])), 1) for s in range(int(tt[-1]))]
    # ---- coupes et parole
    if 'phrases' in out and hard:
        ends = [p['end_s'] for p in out['phrases']]
        words = out.get('mots', [])
        cls = dict(pendant_une_pause=0, en_fin_de_phrase=0, au_milieu_de_la_parole=0)
        for c in hard:
            in_speech = any(a + 0.1 < c < b - 0.1 for a, b in vseg)
            if not in_speech and any(-0.15 <= c - e <= 0.6 for e in ends): cls['en_fin_de_phrase'] += 1
            elif not in_speech: cls['pendant_une_pause'] += 1
            else: cls['au_milieu_de_la_parole'] += 1
        out['coupes_et_parole'] = cls
    return out, beat_t


def sfx(x, sr, beat_t, vseg, events, moves, debug=False):
    """Détecte et classe les effets sonores : souffle (whoosh), impact grave (boum), montée (riser), pop, clic,
    ding, glitch, clavier, déclencheur photo. Les sons qui reviennent sur chaque temps avec le même timbre sont
    considérés comme de la musique ; les sons de voix sont écartés pendant la parole."""
    import librosa
    hop = 256; fa = sr / hop
    S = np.abs(librosa.stft(x, n_fft=1024, hop_length=hop)) ** 2; fr = librosa.fft_frequencies(sr=sr, n_fft=1024)
    tt = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop); n = len(tt)
    db = lambda v: 10 * np.log10(v + 1e-12)
    mel = librosa.feature.melspectrogram(S=S, sr=sr, n_mels=48); lmel = np.log(mel + 1e-10)
    full = db(S[fr >= 60].sum(0)); hi = db(S[fr >= 3000].sum(0))
    def local_bg(v, w_s=3.0):
        w = int(w_s * fa); out = np.empty_like(v)
        for k in range(0, n, 16):
            out[k:k + 16] = np.percentile(v[max(0, k - w):k + w], 30)
        return out
    bg_full = local_bg(full); bg_hi = local_bg(hi)
    # 1. attaques nettes
    oenv = librosa.onset.onset_strength(y=x, sr=sr, hop_length=hop)
    on_t = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, units='time', delta=0.1, wait=1)
    on_t = np.array([t for t in on_t if full[min(n - 1, int(t * fa))] > bg_full[min(n - 1, int(t * fa))] + 6 or hi[min(n - 1, int(t * fa))] > bg_hi[min(n - 1, int(t * fa))] + 10])
    # enveloppe fine (3 ms) pour compter les rafales (clavier, glitch, déclencheur)
    from scipy.signal import butter, sosfiltfilt
    xh = sosfiltfilt(butter(4, 1500, 'highpass', fs=sr, output='sos'), x)
    fh = 32; env = librosa.feature.rms(y=xh, frame_length=128, hop_length=fh)[0]
    from scipy.ndimage import median_filter
    env_db0 = 20 * np.log10(env + 1e-9); env_rel = env_db0 - median_filter(env_db0, size=int(0.06 * sr / fh))   # clics = pics brefs au-dessus du fond qui varie lentement
    env_lin = librosa.feature.rms(y=x, frame_length=128, hop_length=32)[0]; env_ldb = 20 * np.log10(env_lin + 1e-9)
    full_s = np.convolve(full, np.ones(5) / 5, 'same'); env_db = 20 * np.log10(env + 1e-9); fte = np.arange(len(env)) * fh / sr
    # 2. sons progressifs (souffle, montée) : bosses d'énergie dans les aigus
    hs = np.convolve(hi, np.ones(5) / 5, 'same'); bump = hs > bg_hi + 10
    from .common import runs
    bumps = [(float(tt[a]), float(tt[b])) for a, b in runs(bump) if tt[b] - tt[a] >= 0.08]
    cands = sorted([(round(float(t), 3), 'attaque', None) for t in on_t] + [(round(a, 3), 'bosse', b) for a, b in bumps])
    merged = []
    for c in cands:
        if merged and c[0] - merged[-1][0] < 0.08:
            if c[1] == 'bosse': merged[-1] = (merged[-1][0], 'bosse', c[2])
            continue
        merged.append(c)
    evs = []
    for t0, src, b_end in merged:
        i0 = int(np.searchsorted(tt, t0))
        if i0 >= n - 3: continue
        lim = min(n - 1, i0 + int(2.5 * fa))
        win_pk = int((b_end - t0) * fa) + 2 if src == 'bosse' else int(0.15 * fa)
        pk_i = i0 + int(np.argmax(full[i0:min(lim, i0 + max(2, win_pk))])); pk = full[pk_i]
        j = pk_i
        while j < lim and full_s[j] > max(pk - 20, bg_full[j] + 6): j += 1
        dur = float(tt[j] - t0); rise = float(tt[pk_i] - t0)
        w = slice(i0, max(i0 + 2, j)); spec = S[:, w].mean(1); sp3 = spec[fr >= 300]
        cent = float((fr * spec).sum() / (spec.sum() + 1e-12))
        flat = float(np.exp(np.log(sp3 + 1e-12).mean()) / (sp3.mean() + 1e-12)); tonal = float(sp3.max() / (sp3.mean() + 1e-12))
        cs = (fr[:, None] * S[:, w]).sum(0) / (S[:, w].sum(0) + 1e-12)
        slope = float(np.polyfit(np.arange(len(cs)) / fa, cs, 1)[0]) if len(cs) > 4 else 0.0
        q0, q1 = int((t0 - 0.01) * sr / fh), int((t0 + 1.5) * sr / fh)
        seg_e = env_rel[max(0, q0):max(q0 + 3, q1)]
        bp, _ = find_peaks(seg_e, height=10, distance=int(0.02 * sr / fh))
        bt = fte[max(0, q0) + bp] if len(bp) else np.array([t0])
        chain = [bt[0]]
        for b_ in bt[1:]:
            if b_ - chain[-1] < 0.15: chain.append(b_)
            else: break
        sub = np.array(chain) if bt[0] - t0 < 0.05 else np.array([t0])
        hfb = librosa.mel_frequencies(n_mels=48) > 300
        timbre = lmel[hfb, w].mean(1); timbre = timbre - timbre.mean()
        hf_lvl = float(db(S[fr >= 300][:, w].sum(0)).max())
        rs = slice(i0, max(i0 + 3, pk_i + 1)); csr = (fr[:, None] * S[:, rs]).sum(0) / (S[:, rs].sum(0) + 1e-12)
        slope_rise = float((csr[-1] - csr[0]) / max(rise, 1e-3)) if len(csr) > 2 else 0.0
        rr = hs[i0:pk_i + 1]; mono_ = float(np.corrcoef(np.arange(len(rr)), rr)[0, 1]) if len(rr) > 8 and rr.std() > 0 else 0.0
        # modulation rapide d'amplitude (15-60 Hz) : signature du glitch
        r0, r1 = int((t0 - 0.01) * sr / 32), int((t0 + 0.4) * sr / 32)
        el = env_ldb[max(0, r0):max(r0 + 8, r1)]
        dips, _ = find_peaks(-el, prominence=10, distance=3) if len(el) > 8 else (np.array([]), None)
        am = float(len(dips))
        act = np.nonzero(el > el.max() - 12)[0] if len(el) else np.array([0])
        duty = float((el[act[0]:act[-1] + 1] > el.max() - 12).mean()) if len(act) > 1 else 0.0
        act_span = float((act[-1] - act[0]) * 32 / sr) if len(act) > 1 else 0.0
        sh = spec[fr >= 3000]; flat_hi = float(np.exp(np.log(sh + 1e-12).mean()) / (sh.mean() + 1e-12)) if sh.size else 0.0
        hpk = float(hs[i0:min(lim, i0 + max(2, win_pk))].max()); lvl_hi = hpk - float(bg_hi[i0])
        evs.append(dict(t=t0, dur=dur, rise=rise, lvl_hi=lvl_hi, cent=cent, flat=flat, tonal=tonal, slope=slope, slope_rise=slope_rise, mono=mono_, am=am, duty=duty, act_span=act_span, flat_hi=flat_hi, src=src, sub=sub, lvl=float(pk - bg_full[i0]), timbre=timbre, hf=hf_lvl,
                        low=float(spec[fr < 150].sum() / (spec.sum() + 1e-12))))
    # 3. musique : même place dans le temps et même timbre, répété sur de nombreux temps
    if len(beat_t) > 4:
        period = float(np.median(np.diff(beat_t)))
        for e in evs: e['ph'] = ((e['t'] - beat_t[0]) % period) / period
        for e in evs:
            same = [o for o in evs if o is not e and min(abs(o['ph'] - e['ph']), 1 - abs(o['ph'] - e['ph'])) < 0.06]
            if len(same) >= 6:
                tmpl = np.median(np.stack([o['timbre'] for o in same]), 0)
                sim = float(np.dot(tmpl, e['timbre']) / (np.linalg.norm(tmpl) * np.linalg.norm(e['timbre']) + 1e-9))
                lv = np.median([o['hf'] for o in same])
                sims = [o for o in same if np.dot(o['timbre'], e['timbre']) / (np.linalg.norm(o['timbre']) * np.linalg.norm(e['timbre']) + 1e-9) > 0.9]
                spread = (max(o['t'] for o in sims) - min(o['t'] for o in sims)) if len(sims) >= 6 else 0
                low_ref = np.median([o['low'] for o in same])
                e['music'] = sim > 0.9 and e['hf'] < lv + 6 and spread > 0.5 * tt[-1] and abs(e['low'] - low_ref) < 0.25
    out = []; dropped = []
    for e in evs:
        if e.get('music') or max(e['lvl'], e['lvl_hi'] - 20) < 8:
            dropped.append((round(e['t'], 2), 'musique' if e.get('music') else 'trop faible')); continue
        in_speech = any(a - 0.12 <= e['t'] <= b + 0.05 for a, b in vseg)
        sub = e['sub']; ns = len(sub); span = float(sub[-1] - sub[0]) if ns > 1 else 0.0
        if in_speech and debug and not (e['flat'] > 0.15 or (e['cent'] < 450 and e['lvl'] > 10)): dropped.append((round(e['t'], 2), f"parole flat={e['flat']:.2f} flat_hi={e['flat_hi']:.2f} ns={ns}"))
        if in_speech and not (e['flat'] > 0.3 or (e['cent'] < 450 and e['lvl'] > 10) or (e['tonal'] > 90 and e['cent'] > 1200 and e['dur'] > 0.3) or (ns >= 6 and span > 0.3 and e['flat_hi'] > 0.3)): continue
        # coup de grosse caisse sur le temps : de la musique
        if len(beat_t) and np.min(np.abs(beat_t - e['t'])) < 0.05 and e['cent'] < 400 and e['low'] > 0.5 and e['lvl'] < 20: continue
        gaps = np.diff(sub) if ns > 2 else np.array([])
        if ns >= 6 and span > 0.3 and gaps.size and 0.04 < np.median(gaps) < 0.2 and e['flat_hi'] > 0.3: typ = 'clavier'
        elif ns in (2, 3) and 0.03 <= sub[1] - sub[0] <= 0.1 and e['flat'] > 0.1 and e['low'] < 0.6 and e['dur'] < 0.2: typ = 'déclencheur photo'
        elif e['tonal'] > 150 and e['cent'] > 800 and e['dur'] > 0.25: typ = 'ding'
        elif e['act_span'] >= 0.12 and e['am'] >= 3 and e['duty'] > 0.35 and e['flat'] < 0.2 and e['dur'] <= 0.6: typ = 'glitch'
        elif e['rise'] > 0.45 and e['dur'] > 0.5 and e['mono'] > 0.8: typ = 'montée (riser)'
        elif e['cent'] < 400 and e['dur'] > 0.08: typ = 'impact grave (boum)'
        elif e['tonal'] > 40 and e['cent'] > 800 and e['dur'] > 0.25: typ = 'ding'
        elif e['dur'] < 0.15: typ = 'clic' if e['flat'] > 0.2 or e['dur'] < 0.03 else 'pop'
        elif e['flat'] > 0.15 and e['dur'] <= 0.8: typ = 'souffle (whoosh)'
        else: typ = 'autre'
        o = dict(t=round(e['t'], 2), type=typ, duree_s=round(max(e['dur'], e['act_span']) if typ == 'glitch' else span + 0.03 if typ in ('clavier', 'déclencheur photo') else e['dur'], 2))
        if debug: o['_f'] = {k: (round(v, 3) if isinstance(v, float) else v) for k, v in e.items() if k in ('dur', 'cent', 'flat', 'flat_hi', 'tonal', 'am', 'duty', 'lvl', 'low')} | dict(ns=ns, span=round(span, 3))
        out.append(o)
    # un son multi-attaques (clavier, glitch, déclencheur) absorbe les détections qui tombent dans sa durée
    cleaned = []
    for o in sorted(out, key=lambda o: o['t']):
        if cleaned and cleaned[-1]['type'] in ('clavier', 'glitch', 'déclencheur photo', 'montée (riser)', 'souffle (whoosh)', 'ding', 'impact grave (boum)') and o['t'] < cleaned[-1]['t'] + max(0.12, cleaned[-1]['duree_s']): continue
        cleaned.append(o)
    if debug: print('ÉCARTÉS', dropped)
    vis = [(e['start_s'], e['type']) for e in events] + [(m['start_s'], m['type']) for m in moves if m['type'] in ('punch-in', 'dézoom rapide')]
    for o in cleaned:
        ref = o['t'] + (o['duree_s'] if 'riser' in o['type'] else o['duree_s'] / 2 if 'whoosh' in o['type'] else 0)
        near = [v for v in vis if abs(v[0] - ref) <= 0.2]
        o['synchronise_avec'] = near[0][1] if near else None
    return cleaned

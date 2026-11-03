#!/usr/bin/env python3
"""Vidéo de test n° 4 : texte qui suit le sujet, kaléidoscope, shake ajouté sur les temps, cymbale inversée avant un drop.
Écrit effets2.mp4, truth_effets2.json, et deux musiques pour la version « slowed + reverb » : musique-normale.wav, musique-slowed.wav."""
import json, os, subprocess, wave
import numpy as np, cv2

W, H, FPS, DUR = 540, 960, 30, 20.0; BPM = 120; beat = 60 / BPM
rng = np.random.default_rng(9)
tex = cv2.GaussianBlur(cv2.resize(rng.integers(0, 255, (24, 14, 3)).astype(np.uint8), (W * 2, H), interpolation=cv2.INTER_CUBIC), (0, 0), 5)
frames = []
for n in range(int(DUR * FPS)):
    t = n / FPS; x0 = int((t * 50) % W); f = tex[:, x0:x0 + W].copy()
    if t < 5.0:                                                  # balle qui se déplace + texte « GO » accroché à elle dès 1,0 s
        bx, by = int(100 + 340 * (t / 5)), int(300 + 300 * np.sin(t * 1.4))
        cv2.circle(f, (bx, by), 55, (30, 200, 240), -1)
        if t >= 1.0: cv2.putText(f, 'GO', (bx - 45, by - 80), cv2.FONT_HERSHEY_SIMPLEX, 2.2, (255, 255, 255), 7)
    elif t < 9.0:                                                # kaléidoscope
        q = f[:H // 2, :W // 2]; f[:H // 2, W // 2:] = q[:, ::-1]; f[H // 2:, :] = f[:H // 2, :][::-1]
    elif t < 14.0:                                               # shake ajouté sur chaque temps (4 images)
        k = (t % beat) * FPS
        if k < 4:
            M = np.float32([[1.06, 0, rng.integers(-18, 18) - 16], [0, 1.06, rng.integers(-18, 18) - 28]]); f = cv2.warpAffine(f, M, (W, H), borderMode=cv2.BORDER_REFLECT)
    frames.append(f)
vw = cv2.VideoWriter('effets2_raw.mp4', cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
for f in frames: vw.write(f)
vw.release()
SR = 22050


def piste(bpm, reverb, dur=DUR, cymbale=None):
    t = np.arange(int(dur * SR)) / SR; y = np.zeros_like(t); b = 60 / bpm
    for k in range(int(dur / b)):
        i = int(k * b * SR); tt = np.arange(int(0.25 * SR)) / SR
        kk = 0.9 * np.sin(2 * np.pi * (110 * np.exp(-tt * 20) + 45) * tt) * np.exp(-tt * 9); y[i:i + len(kk)] += kk[:len(y) - i]
        j = int((k * b + b / 2) * SR); hh = 0.2 * rng.standard_normal(int(0.04 * SR)) * np.exp(-np.arange(int(0.04 * SR)) / SR * 120); y[j:j + len(hh)] += hh[:max(0, len(y) - j)]
    y += 0.1 * np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5
    if cymbale:
        a, c = cymbale; m = (t >= a) & (t < c); z = rng.standard_normal(m.sum())
        from scipy.signal import butter, lfilter
        bb, aa = butter(4, 5000 / (SR / 2), 'high'); z = lfilter(bb, aa, z)
        y[m] += 0.6 * ((t[m] - a) / (c - a)) ** 2.5 * z
        y[t >= c] *= 1.6
    if reverb:
        from scipy.signal import fftconvolve
        ir = rng.standard_normal(int(2.5 * SR)) * np.exp(-np.arange(int(2.5 * SR)) / SR * 2.2); y = fftconvolve(y, ir)[:len(y)] * 0.15 + y * 0.5
    return y / (np.abs(y).max() * 1.1)


def ecrire(p, y):
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())


ecrire('effets2.wav', piste(BPM, False, cymbale=(12.5, 14.0)))
ecrire('musique-normale.wav', piste(128, False, 16)); ecrire('musique-slowed.wav', piste(80, True, 16))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'effets2_raw.mp4', '-i', 'effets2.wav', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-shortest', 'effets2.mp4'], check=True)
os.remove('effets2_raw.mp4'); os.remove('effets2.wav')
json.dump(dict(texte_suit=dict(texte='GO', start_s=1.0, end_s=5.0), kaleidoscope=[5.0, 9.0], shake=[9.0, 14.0], cymbale=[12.5, 14.0]),
          open('truth_effets2.json', 'w'), indent=1)
print('effets2.mp4, truth_effets2.json, musique-normale.wav, musique-slowed.wav écrits')

#!/usr/bin/env python3
"""Vidéo de test n° 3 : les effets d'image des edits, chacun à un moment connu (vérité terrain dans truth_effets.json).
Écrit effets.mp4. Usage : python3 video-test-effets.py"""
import json, os, subprocess
import numpy as np, cv2

W, H, FPS, DUR = 540, 960, 30, 34.0
rng = np.random.default_rng(5)
tex = cv2.GaussianBlur(cv2.resize(rng.integers(0, 255, (24, 14, 3)).astype(np.uint8), (W * 2, H), interpolation=cv2.INTER_CUBIC), (0, 0), 6)
tex = cv2.addWeighted(tex, 0.8, (rng.integers(0, 60, tex.shape)).astype(np.uint8), 0.4, 20)
tex2 = cv2.GaussianBlur(cv2.resize(rng.integers(0, 255, (20, 12, 3)).astype(np.uint8), (W * 2, H), interpolation=cv2.INTER_CUBIC), (0, 0), 4)
TRUTH = []
def vrai(typ, a, b, **kw): TRUTH.append(dict(type=typ, start_s=a, end_s=b, **kw))


def scene(t, base=tex):
    x0 = int((t * 60) % W); f = base[:, x0:x0 + W].copy()
    cx = int(W / 2 + 150 * np.sin(t * 1.3)); cy = int(H / 2 + 200 * np.cos(t * 0.9))
    cv2.circle(f, (cx, cy), 70, (40, 160, 230), -1); cv2.rectangle(f, (60, 120), (200, 260), (200, 60, 60), -1)
    cv2.putText(f, 'TEST', (W // 2 - 80, H - 150), cv2.FONT_HERSHEY_SIMPLEX, 2.2, (250, 250, 250), 6)
    return f


frames = []; prev_stutter = None
for n in range(int(DUR * FPS)):
    t = n / FPS
    f = scene(t, tex2 if t >= 20 else tex)
    if 3.0 <= t < 5.0:                                                     # noir et blanc
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY); f = cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)
    elif 5.0 <= t < 5.0 + 2 / FPS:                                         # négatif (2 images)
        f = 255 - f
    elif 6.0 <= t < 9.0:                                                   # bichromie orange / bleu
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
        a, b = np.array([140, 60, 10], np.float32), np.array([30, 140, 250], np.float32)
        f = (a[None, None] * (1 - g[..., None]) + b[None, None] * g[..., None]).astype(np.uint8)
    elif 9.0 <= t < 12.0:                                                  # glow : forme blanche qui « bave » la lumière
        cx = int(W / 2 + 120 * np.sin(t * 2)); m = np.zeros((H, W), np.float32); cv2.circle(m, (cx, H // 2), 60, 1.0, -1)
        halo = cv2.GaussianBlur(m, (0, 0), 25)
        f = np.clip(f.astype(np.float32) + 255 * (halo[..., None] * 0.9) + 255 * m[..., None], 0, 255).astype(np.uint8)
    elif 12.0 <= t < 14.0:                                                 # stroboscope
        f = (np.clip(f.astype(np.float32) * (1.8 if n % 2 == 0 else 0.25), 0, 255)).astype(np.uint8)
    elif 14.0 <= t < 17.0:                                                 # saccade : chaque image répétée 3 fois
        if n % 3 == 0 or prev_stutter is None: prev_stutter = f
        f = prev_stutter.copy()
    elif 17.0 <= t < 20.0:                                                 # miroir gauche / droite
        f[:, W // 2:] = f[:, :W // 2][:, ::-1]
    elif 20.0 <= t < 21.0:                                                 # coupe puis flou qui s'ouvre
        sig = max(0.1, 12 * (1 - (t - 20.0) / 0.8)); f = cv2.GaussianBlur(f, (0, 0), sig) if sig > 0.3 else f
    elif 22.0 <= t < 25.0:                                                 # bandes noires qui se ferment
        k = min(1.0, (t - 22.0) / 0.5); bh = int(0.12 * H * k); f[:bh] = 0; f[H - bh:] = 0
    elif 25.0 <= t < 28.0:                                                 # aberration chromatique
        f[..., 2] = np.roll(f[..., 2], 3, axis=1); f[..., 0] = np.roll(f[..., 0], -3, axis=1)
    elif 28.0 <= t < 31.0:                                                 # fuite de lumière orange sur le bord gauche
        xs = np.linspace(1, 0, W)[None, :] ** 2.2; leak = np.zeros_like(f, np.float32); leak[..., 2] = 255; leak[..., 1] = 120
        a = (0.85 * xs * (0.7 + 0.3 * np.sin(t * 3)))[..., None]
        f = (f.astype(np.float32) * (1 - a) + leak * a).astype(np.uint8)
    elif 31.0 <= t < 34.0:                                                 # néon : contour fin, très lumineux, avec halo coloré
        f = (f * 0.35).astype(np.uint8); line = np.zeros((H, W), np.uint8)
        cv2.rectangle(line, (120, 300), (420, 700), 255, 3); cv2.circle(line, (270, 500), 90, 255, 3)
        halo = cv2.GaussianBlur(line.astype(np.float32) / 255, (0, 0), 6)
        col = np.array([255, 60, 230], np.float32)
        f = np.clip(f + halo[..., None] * col * 1.5, 0, 255).astype(np.uint8); f[line > 0] = (255, 220, 255)
    frames.append(f)
vrai('noir et blanc', 3.0, 5.0); vrai('négatif (inversion)', 5.0, 5.07); vrai('bichromie (étalonnage stylisé)', 6.0, 9.0)
vrai('glow / halo lumineux', 9.0, 12.0); vrai('stroboscope', 12.0, 14.0); vrai('saccade (images répétées)', 14.0, 17.0)
vrai('effet miroir', 17.0, 20.0); vrai("flou qui s'ouvre (mise au point)", 20.0, 20.8); vrai('bandes noires qui se ferment', 22.0, 22.5)
vrai("bandes noires qui s'ouvrent", 24.9, 25.1); vrai('aberration chromatique', 25.0, 28.0); vrai('fuite de lumière (light leak)', 28.0, 31.0); vrai('néon (contour lumineux)', 31.0, 34.0)
vw = cv2.VideoWriter('effets_raw.mp4', cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
for f in frames: vw.write(f)
vw.release()
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'effets_raw.mp4', '-f', 'lavfi', '-i', f'sine=frequency=220:duration={DUR}',
                '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', 'effets.mp4'], check=True)
os.remove('effets_raw.mp4')
json.dump(TRUTH, open('truth_effets.json', 'w'), indent=1, ensure_ascii=False)
print('effets.mp4 et truth_effets.json écrits')

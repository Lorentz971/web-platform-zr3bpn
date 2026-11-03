#!/usr/bin/env python3
"""Fabrique de faux « rushs » pour tester appliquer_pattern.py sans tournage :
  rush-face.mp4      une prise face caméra (voix de synthèse en français, avec des silences entre les phrases)
  rush-broll-1.mp4   une illustration sans parole (formes qui bougent)
  rush-broll-2.mp4   une autre illustration sans parole
  musique.wav        une musique simple à 100 BPM
Usage : python3 video-test-rushs.py [DOSSIER]   (espeak-ng et ffmpeg requis)"""
import os, subprocess, sys, tempfile, wave
import numpy as np, cv2

OUT = sys.argv[1] if len(sys.argv) > 1 else 'rushs-test'
os.makedirs(OUT, exist_ok=True)
FPS, W, H = 30, 1280, 720
rng = np.random.default_rng(3)
PHRASES = ["Voici comment j'ai doublé mes vues en trente jours.", "Au début, personne ne regardait mes vidéos.",
           "Puis j'ai changé une seule chose.", "Le rythme du montage.", "Des coupes plus courtes, des zooms sur les mots importants.",
           "Et des sous-titres qui claquent.", "Le résultat est incroyable.", "Je vous montre tout, étape par étape."]


def voix():
    sr = 44100; parts = []
    for i, p in enumerate(PHRASES):
        fn = tempfile.mktemp(suffix='.wav')
        subprocess.run(['espeak-ng', '-v', 'fr', '-s', '150', '-w', fn, p], check=True)
        with wave.open(fn) as w: s0 = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        os.remove(fn)
        x = np.interp(np.arange(int(len(x) * sr / s0)) * s0 / sr, np.arange(len(x)), x)
        parts.append(x * 0.8); parts.append(np.zeros(int(sr * (0.9 if i % 2 else 0.6))))   # silences à couper
    return np.concatenate([np.zeros(int(sr * 0.8))] + parts), sr


def ecrire_wav(path, y, sr):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())


def video(path, dur, dessin, son=None):
    raw = path + '.raw.mp4'; vw = cv2.VideoWriter(raw, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
    for n in range(int(dur * FPS)): vw.write(dessin(n / FPS))
    vw.release()
    cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-i', raw]
    cmd += (['-i', son, '-c:a', 'aac', '-shortest'] if son else ['-an'])
    subprocess.run(cmd + ['-c:v', 'libx264', '-crf', '22', '-pix_fmt', 'yuv420p', path], check=True); os.remove(raw)


def face(t):                                  # « personne » stylisée devant un fond, petit bougé de caméra
    f = np.full((H, W, 3), (60, 50, 40), np.uint8)
    cv2.rectangle(f, (0, 0), (W, H // 2), (90, 80, 70), -1)
    dx, dy = int(25 * np.sin(t * 0.9)), int(8 * np.cos(t * 1.3))   # la personne bouge un peu, comme en vrai
    cv2.ellipse(f, (W // 2 + dx, H + 40 + dy), (260, 230), 0, 180, 360, (40, 40, 150), -1)
    cv2.ellipse(f, (W // 2 + dx, 300 + dy), (110, 140), 0, 0, 360, (150, 180, 220), -1)
    for ex in (-40, 40): cv2.circle(f, (W // 2 + ex + dx, 270 + dy), 10, (30, 30, 30), -1)
    mo = int(6 + 10 * abs(np.sin(t * 9)))
    cv2.ellipse(f, (W // 2 + dx, 360 + dy), (34, mo), 0, 0, 360, (40, 40, 90), -1)
    return f


def broll(seed):                              # illustration : texture colorée propre à chaque rush, caméra qui glisse, formes qui bougent
    r = np.random.default_rng(seed); cols = r.integers(40, 255, (6, 3)); pos = r.uniform(0, 1, (6, 2)); vel = r.uniform(-0.15, 0.15, (6, 2))
    tex = cv2.resize(r.integers(0, 255, (9, 16, 3)).astype(np.uint8), (W * 2, H), interpolation=cv2.INTER_CUBIC)
    tex = cv2.GaussianBlur(tex, (0, 0), 25); tex = cv2.addWeighted(tex, 1.0, r.integers(0, 40, tex.shape).astype(np.uint8), 0.5, 0)
    def d(t):
        x0 = int((t * 40) % W); f = tex[:, x0:x0 + W].copy()
        for c, p, v in zip(cols, pos, vel):
            x, y = (p + v * t) % 1
            cv2.circle(f, (int(x * W), int(y * H)), 70, tuple(int(k) for k in c), -1)
        cv2.putText(f, f'B-ROLL {seed}', (W // 2 - 150, H // 2), cv2.FONT_HERSHEY_SIMPLEX, 2.0, (255, 255, 255), 5)
        return f
    return d


y, sr = voix(); dur = len(y) / sr
ecrire_wav(os.path.join(OUT, 'voix.wav'), y, sr)
video(os.path.join(OUT, 'rush-face.mp4'), dur, face, os.path.join(OUT, 'voix.wav')); os.remove(os.path.join(OUT, 'voix.wav'))
video(os.path.join(OUT, 'rush-broll-1.mp4'), 12, broll(1)); video(os.path.join(OUT, 'rush-broll-2.mp4'), 12, broll(2))
t = np.arange(int(40 * sr)) / sr; beat = 60 / 100
m = 0.25 * np.sin(2 * np.pi * 55 * t) * np.exp(-((t % beat) * 12)) + 0.08 * np.sin(2 * np.pi * 220 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * t / (4 * beat)))
ecrire_wav(os.path.join(OUT, 'musique.wav'), m, sr)
print(f'Rushs de test écrits dans {OUT}/ (prise face caméra de {dur:.1f} s)')

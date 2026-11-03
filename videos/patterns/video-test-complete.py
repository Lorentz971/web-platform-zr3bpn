# Fabrique une vidéo de test de 24 s contenant tous les effets mesurés, avec la vérité terrain (truth_full.json).
import numpy as np, cv2, json, subprocess, math, wave
from PIL import Image, ImageDraw, ImageFont
from skimage import data as skdata

W, H, FPS, DUR = 1280, 720, 30, 24.0
N = int(DUR * FPS)
rng = np.random.default_rng(7)
T = lambda s: int(round(s * FPS))

def texture(seed, tint, contrast=1.0, bright=0.5):
    r = np.random.default_rng(seed)
    acc = np.zeros((900, 1600), np.float32)
    for k, amp in [(8, 1), (32, .6), (128, .35), (512, .2)]:
        n = r.random((max(2, 900 * k // 1600), k)).astype(np.float32)
        acc += amp * cv2.resize(n, (1600, 900), interpolation=cv2.INTER_CUBIC)
    acc = (acc - acc.min()) / (acc.max() - acc.min())
    acc = np.clip((acc - .5) * contrast + bright, 0, 1)
    img = np.stack([acc * tint[2], acc * tint[1], acc * tint[0]], -1)  # BGR
    return np.clip(img * 255, 0, 255).astype(np.uint8)

IMG = {
    's1': texture(1, (0.55, 0.75, 0.6), 1.2, .5),          # verdâtre, neutre
    's2': texture(2, (1.0, 0.55, 0.25), 1.4, .55),         # chaud, saturé
    's3': texture(3, (0.5, 0.5, 0.55), 0.45, .22),         # sombre, faible contraste
    's5': texture(5, (0.3, 0.55, 1.0), 1.1, .5),           # froid
    'fast': [texture(10 + i, tuple(rng.random(3) * .7 + .3), 1.2, .5) for i in range(12)],
}
astro = cv2.cvtColor(skdata.astronaut(), cv2.COLOR_RGB2BGR)
astro = cv2.resize(astro, (1600, 1600))[0:900, :]  # 1600x900, visage dans le haut-centre

def view(img, scale=1.0, cx=800, cy=450, rot=0.0, dx=0, dy=0):
    z = scale * W / 1600 * 1.0
    M = cv2.getRotationMatrix2D((cx, cy), rot, z)
    M[0, 2] += W / 2 - cx + dx
    M[1, 2] += H / 2 - cy + dy
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

# --- sous-titres
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 58)
CAPS = [(0.30, 0.95, ['THIS', 'IS'], 1), (0.95, 1.60, ['THE', 'MOST'], 1), (1.60, 2.25, ['IMPORTANT'], 0), (2.25, 2.90, ['NUMBER', 'EVER'], 0)]
YELLOW = (255, 212, 0)
def draw_caption(frame, words, hi):
    im = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(im)
    text = ' '.join(words)
    w = d.textlength(text, font=font); x = (W - w) / 2; y = int(H * 0.82) - 30
    for i, wd in enumerate(words):
        d.text((x, y), wd, font=font, fill=YELLOW if i == hi else (255, 255, 255), stroke_width=5, stroke_fill=(0, 0, 0))
        x += d.textlength(wd + ' ', font=font)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)

ease_out = lambda t: 1 - (1 - t) ** 3
frames = []
ball_x = 100.0
for n in range(N):
    t = n / FPS
    if t < 3.0:                                  # PLAN 1 + tremblement 1.0-1.6 s (8 px, 10 Hz)
        dx = dy = 0
        if 1.0 <= t < 1.6:
            dx = 8 * math.sin(2 * math.pi * 10 * (t - 1.0)); dy = 8 * math.cos(2 * math.pi * 10 * (t - 1.0))
        f = view(IMG['s1'], 1.15, dx=dx, dy=dy)
        for a, b, wds, hi in CAPS:
            if a <= t < b: f = draw_caption(f, wds, hi)
    elif t < 6.0:                                # PLAN 2, punch-in +30 % en 5 images à 4.0 s vers (1000, 300) de la page
        k = n - T(4.0)
        p = 0 if k < 0 else ease_out(min(1, (k + 1) / 5))
        s = 1.0 + 0.30 * p
        cx = 800 + (1000 - 800) * p; cy = 450 + (300 - 450) * p
        f = view(IMG['s2'], s, cx, cy)
        A = f
    elif t < 6.5:                                # FONDU ENCHAÎNÉ 15 images
        a = (n - T(6.0) + 1) / 15
        B = IMG['s3_frame'] if 's3_frame' in IMG else None
        bg3 = view(IMG['s3'], 1.0)
        f = cv2.addWeighted(view(IMG['s2'], 1.3, 1000, 300), 1 - a, bg3, a, 0)
    elif t < 11.5:                               # PLAN 3 : balle 12 px/img, puis 6 px/img (ralenti x0,5), puis arrêt sur image
        if t < 8.5: ball_x += 12
        elif t < 10.5: ball_x += 6
        if t < 10.5 or 'freeze' not in IMG:
            f = view(IMG['s3'], 1.0); cv2.circle(f, (int(ball_x), 380), 46, (230, 230, 230), -1)
            if t >= 10.5 - 1 / FPS: IMG['freeze'] = f.copy()
        if t >= 10.5: f = IMG['freeze'].copy()
    elif t < 11.6:                               # FLASH BLANC 3 images
        f = np.full((H, W, 3), 255, np.uint8)
    elif t < 14.5:                               # PLAN 4 : visage, rotation 0 -> 8° entre 12.6 et 13.6 s
        r = 0 if t < 12.6 else 8 * min(1, (t - 12.6) / 1.0)
        f = view(astro, 1.25, 800, 330, rot=r)
    elif t < 14.5 + 8 / FPS:                     # GLISSEMENT 8 images vers la gauche
        k = (n - T(14.5) + 1) / 8
        out = view(astro, 1.25, 800, 330, rot=8); inn = view(IMG['s5'], 1.0)
        off = int(W * k)
        f = np.zeros_like(out); f[:, :W - off] = out[:, off:]; f[:, W - off:] = inn[:, :off]
    elif t < 18.25:                              # PLAN 5 : poussée lente 100 -> 110 % sur 3 s
        p = min(1, (t - (14.5 + 8 / FPS)) / 3.0)
        f = view(IMG['s5'], 1.0 + 0.10 * p)
    else:                                        # SÉQUENCE RAPIDE : coupes sur les temps (toutes les 0,5 s, décalées de 0,25)
        i = int((t - 18.25) // 0.5)
        f = view(IMG['fast'][i % 12], 1.0)
    frames.append(f)

vw = cv2.VideoWriter('full_raw.mp4', cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
for f in frames: vw.write(f)
vw.release()

# --- AUDIO
SR = 44100; ta = np.arange(int(DUR * SR)) / SR; audio = np.zeros_like(ta)
VOICE = [(0.3, 2.9), (3.3, 5.8), (6.6, 9.0), (9.6, 11.3), (12.0, 14.3), (15.0, 17.8)]
voice_on = np.zeros_like(ta, bool)
for a, b in VOICE: voice_on |= (ta >= a) & (ta < b)
duck = np.where(voice_on, 10 ** (-10 / 20), 1.0)                  # musique baissée de 10 dB sous la voix
duck = np.convolve(duck, np.ones(2205) / 2205, 'same')              # transition de 50 ms
beats = np.arange(0.25, DUR, 0.5)                                   # 120 BPM, décalé de 0,25 s
music = 0.10 * np.sin(2 * np.pi * 82 * ta)
for b in beats:
    m = (ta >= b) & (ta < b + 0.18); tt = ta[m] - b
    music[m] += 0.45 * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 22)
audio += music * duck
# voix synthétique : f0 190 Hz + formants, 5 syllabes/s
voice = np.zeros_like(ta)
for h in range(1, 18):
    f = 190 * h
    g = math.exp(-((f - 700) / 350) ** 2) + 0.6 * math.exp(-((f - 1800) / 500) ** 2) + 0.05
    voice += g * np.sin(2 * np.pi * f * ta)
syl = np.clip(np.sin(2 * np.pi * 5 * ta - np.pi / 2) * 0.5 + 0.5, 0, 1) ** 2
audio += 0.09 * voice * syl * voice_on
# effets sonores
SFX = [('whoosh', 3.0), ('boom', 4.0), ('whoosh', 11.5), ('whoosh', 14.5)]
for kind, t0 in SFX:
    if kind == 'whoosh':
        m = (ta >= t0 - 0.15) & (ta < t0 + 0.15); tt = ta[m] - (t0 - 0.15)
        nz = rng.standard_normal(m.sum()); nz = nz - np.convolve(nz, np.ones(8) / 8, 'same')
        audio[m] += 0.6 * nz * np.sin(np.pi * tt / 0.3)
    else:
        m = (ta >= t0) & (ta < t0 + 0.5); tt = ta[m] - t0
        audio[m] += 0.9 * np.sin(2 * np.pi * 40 * tt) * np.exp(-tt * 8) + 0.3 * rng.standard_normal(m.sum()) * np.exp(-tt * 30)
audio = np.clip(audio, -1, 1)
with wave.open('full.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((audio * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'full_raw.mp4', '-i', 'full.wav', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', 'full.mp4'], check=True)

truth = {
    'cuts_hard_s': [3.0] + [round(18.25 + 0.5 * k, 2) for k in range(0, 12)],
    'transitions': [{'type': 'crossfade', 'start_s': 6.0, 'dur_frames': 15}, {'type': 'flash', 'start_s': 11.5, 'dur_frames': 3},
                    {'type': 'slide', 'start_s': 14.5, 'dur_frames': 8, 'direction': 'left'}],
    'shake': {'start_s': 1.0, 'dur_s': 0.6, 'amplitude_px': 8, 'freq_hz': 10},
    'zooms': [{'type': 'punch-in', 'start_s': 4.0, 'change_pct': 30, 'dur_frames': 5}, {'type': 'slow push', 'start_s': 14.77, 'change_pct': 10, 'dur_s': 3.0}],
    'rotation': {'start_s': 12.6, 'dur_s': 1.0, 'deg': 8},
    'speed': {'subject_px_per_frame': [12, 6], 'change_at_s': 8.5, 'ratio': 0.5, 'freeze': {'start_s': 10.5, 'dur_s': 1.0}},
    'color': {'s2': 'warm saturated', 's3': 'dark low contrast', 's5': 'cool'},
    'captions': {'y_center_pct': 82, 'words_per_caption': [2, 2, 1, 2], 'changes_every_s': 0.65, 'highlight': 'yellow', 'text': [' '.join(c[2]) for c in CAPS]},
    'face': {'present_s': [11.6, 14.5]},
    'music': {'bpm': 120, 'beat_offset_s': 0.25, 'cuts_on_beat': '11 of 12 hard cuts (fast section)'},
    'ducking_db': 10,
    'voice_segments': VOICE,
    'pauses_s': [round(VOICE[i + 1][0] - VOICE[i][1], 2) for i in range(len(VOICE) - 1)],
    'syllables_per_s': 5,
    'sfx': [{'kind': k, 't': t} for k, t in SFX],
}
json.dump(truth, open('truth_full.json', 'w'), indent=2)
print('ok', N, 'images')

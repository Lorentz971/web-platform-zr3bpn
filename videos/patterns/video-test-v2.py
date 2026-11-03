# Vidéo de test n° 2 : format vertical (TikTok / Shorts), 40 s, avec tous les effets « avancés ».
# Écrit v2.mp4 et truth_v2.json (vérité terrain).
import numpy as np, cv2, json, subprocess, math, wave, os, tempfile
from PIL import Image, ImageDraw, ImageFont
from skimage import data as skdata

W, H, FPS, DUR = 720, 1280, 30, 40.0
N = int(DUR * FPS)
T = lambda s: int(round(s * FPS))
rng = np.random.default_rng(11)
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def texture(seed, tint, w=1100, h=1900, contrast=1.2, bright=.5):
    r = np.random.default_rng(seed); acc = np.zeros((h, w), np.float32)
    for k, amp in [(6, 1), (24, .6), (96, .35), (384, .2)]:
        acc += amp * cv2.resize(r.random((max(2, h * k // w), k)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    acc = (acc - acc.min()) / (acc.max() - acc.min()); acc = np.clip((acc - .5) * contrast + bright, 0, 1)
    return np.clip(np.stack([acc * tint[2], acc * tint[1], acc * tint[0]], -1) * 255, 0, 255).astype(np.uint8)

def view(img, scale=1.0, cx=None, cy=None, rot=0.0, dx=0, dy=0):
    h, w = img.shape[:2]; cx = w / 2 if cx is None else cx; cy = h / 2 if cy is None else cy
    z = scale * max(W / w, H / h)
    M = cv2.getRotationMatrix2D((cx, cy), rot, z); M[0, 2] += W / 2 - cx + dx; M[1, 2] += H / 2 - cy + dy
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

TEX = {k: texture(i, t) for i, (k, t) in enumerate([('C', (.4, .8, .7)), ('G', (.9, .6, .35)), ('Gp', (.5, .5, 1)), ('Il', (1, .45, .45)), ('Ir', (.45, .7, 1)), ('L', (.6, .9, .4))])}
FAST = [texture(50 + i, tuple(rng.random(3) * .7 + .3)) for i in range(24)]
astro = cv2.cvtColor(skdata.astronaut(), cv2.COLOR_RGB2BGR)
face = cv2.resize(astro, (1600, 1600))[0:1600, 390:1110]          # 720 x 1600, visage centré en haut

def grade(f):                                                   # ombres bleutées, hautes lumières orangées, vignettage, grain
    x = f.astype(np.float32); L = x.mean(2, keepdims=True) / 255
    x += (1 - L) * np.array([22, 6, -12]) + L * np.array([-14, 4, 20])
    yy, xx = np.mgrid[0:H, 0:W]; r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    x *= (1 - 0.35 * np.clip(r2 / 2, 0, 1))[..., None]
    x += rng.normal(0, 6, x.shape)
    return np.clip(x, 0, 255).astype(np.uint8)

def put_text(f, txt, size, xy=None, fill=(255, 255, 255), stroke=5, scale=1.0, words_hi=None, hi_col=(0, 255, 102), anchor_y=None):
    font = ImageFont.truetype(BOLD, max(6, int(size * scale)))
    im = Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(im)
    wds = txt.split(' '); tw = d.textlength(txt, font=font)
    x = (W - tw) / 2 if xy is None else xy[0]; y = (anchor_y if anchor_y is not None else xy[1]) - int(size * scale) / 2
    for i, wd in enumerate(wds):
        d.text((x, y), wd, font=font, fill=hi_col if words_hi == i else fill, stroke_width=max(1, int(stroke * scale)), stroke_fill=(0, 0, 0))
        x += d.textlength(wd + ' ', font=font)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)

def pop(k, dur=6):                                              # échelle 0,6 -> 1,15 -> 1,0
    if k < 0: return 0
    if k >= dur: return 1.0
    t = k / dur
    return 0.6 + 0.55 * math.sin(t * math.pi / 2) * 1.0 if t < 0.6 else 1.15 - 0.15 * (t - 0.6) / 0.4

CAPS = [(0.3, 1.0, 'THIS IS', 'pop', 1), (1.0, 2.0, 'HOW IT STARTED', 'pop', 2), (2.0, 3.9, 'NOBODY SAW IT COMING', 'mot par mot', 3)]
frames = []
ball_ramp_y = 150.0; ball_L = []
for n in range(N):
    t = n / FPS
    if t < 4.0:                                             # A : face caméra, coupe avec recadrage x1,15 à 2,0 s
        sc = 1.0 if t < 2.0 else 1.15
        f = grade(view(face, sc, 360, 640))
        for a, b, txt, kind, hi in CAPS:
            if a <= t < b:
                if kind == 'pop':
                    f = put_text(f, txt, 52, scale=pop(n - T(a)), anchor_y=int(H * .70), words_hi=hi)
                else:
                    k = min(len(txt.split()), 1 + int((t - a) / 0.25)); shown = ' '.join(txt.split()[:k])
                    f = put_text(f, shown, 44, anchor_y=int(H * .70), words_hi=hi if k > hi else None)
    elif t < 4.0 + 8 / FPS:                                 # panoramique filé (whip pan) 8 images
        k = (n - T(4.0) + 1) / 8
        A = grade(view(face, 1.15, 360, 640)); B = view(TEX['C'], 1.0); off = int(W * k)
        f = np.zeros_like(A); f[:, :W - off] = A[:, off:]; f[:, W - off:] = B[:, :off]
        f = cv2.blur(f, (max(3, int(90 * math.sin(k * math.pi))), 1))
    elif t < 8.0:                                           # C : illustration + sticker qui « pop » + flèche qui glisse
        f = view(TEX['C'], 1.0, dx=-(t - 4.27) * 20)
        if 5.0 <= t < 7.0 + 4 / FPS:
            s = pop(n - T(5.0)) if t < 7.0 else max(0.0, 1 - (n - T(7.0)) / 4)
            if s > 0:
                cv2.circle(f, (540, 300), int(70 * s), (0, 215, 255), -1); cv2.circle(f, (540, 300), int(70 * s), (0, 0, 0), max(1, int(6 * s)))
                if s > .4: cv2.rectangle(f, (532, int(300 - 38 * s)), (548, int(300 + 10 * s)), (0, 0, 0), -1); cv2.circle(f, (540, int(300 + 28 * s)), max(2, int(9 * s)), (0, 0, 0), -1)
        if t >= 6.0:
            x = int(-260 + min(1, (n - T(6.0) + 1) / 8) * 560)
            pts = np.array([[x, 680], [x + 170, 680], [x + 170, 640], [x + 260, 700], [x + 170, 760], [x + 170, 720], [x, 720]])
            cv2.fillPoly(f, [pts], (40, 40, 230)); cv2.polylines(f, [pts], True, (0, 0, 0), 4)
    elif t < 8.0 + 4 / FPS:                                 # glitch 4 images
        A = view(TEX['C'], 1.0, dx=-(8.0 - 4.27) * 20); f = A.copy()
        f[..., 2] = np.roll(A[..., 2], 24, axis=1); f[..., 0] = np.roll(A[..., 0], -24, axis=1)
        for _ in range(10):
            y0 = rng.integers(0, H - 80); hh = rng.integers(20, 80); f[y0:y0 + hh] = np.roll(f[y0:y0 + hh], rng.integers(-120, 120), axis=1)
    elif t < 12.0:                                          # E : capture d'écran + bandeau qui glisse
        f = np.full((H, W, 3), 245, np.uint8); cv2.rectangle(f, (0, 0), (W, 120), (60, 60, 60), -1)
        f = put_text(f, 'Dashboard', 44, xy=(40, 60), stroke=0)
        for i in range(14):
            cv2.rectangle(f, (40, 170 + i * 58), (40 + 200 + (i * 97) % 420, 200 + i * 58), (90, 90, 90), -1)
        cv2.rectangle(f, (420, 700), (680, 900), (230, 140, 60), -1)
        cx = int(100 + (t - 8.13) * 120); cy = int(400 + (t - 8.13) * 90); cv2.fillPoly(f, [np.array([[cx, cy], [cx, cy + 34], [cx + 10, cy + 25], [cx + 24, cy + 25]])], (0, 0, 0))
        if 9.0 <= t < 11.5 + 10 / FPS:
            k = min(1, (n - T(9.0) + 1) / 10) if t < 11.5 else max(0, 1 - (n - T(11.5) + 1) / 10)
            x0 = int(-560 + k * 600)
            cv2.rectangle(f, (x0, 1000), (x0 + 520, 1110), (30, 30, 30), -1); cv2.rectangle(f, (x0, 1000), (x0 + 14, 1110), (0, 200, 255), -1)
            f = put_text(f, 'JOHN DOE', 46, xy=(x0 + 40, 1055), stroke=0)
    elif t < 12.2:                                          # zoom de transition 6 images
        k = (n - T(12.0) + 1) / 6
        base = frames[T(12.0) - 1]; f = view(base, 1 + 1.5 * k ** 2); f = cv2.GaussianBlur(f, (0, 0), 1 + 8 * k)
    elif t < 16.0:                                          # G : image dans l'image + balle qui accélère (speed ramp)
        f = view(TEX['G'], 1.0)
        if 12.5 <= t < 15.5: ball_ramp_y += 4 + 12 * (t - 12.5) / 3
        cv2.circle(f, (200, int(ball_ramp_y)), 40, (240, 240, 240), -1)
        pip = view(TEX['Gp'], 1.0, dy=-(t - 12.2) * 90)[0:340, 0:260]
        f[900:1240, 420:680] = pip; cv2.rectangle(f, (420, 900), (680, 1240), (255, 255, 255), 5)
    elif t < 16.4:                                          # rideau 12 images, de gauche à droite
        k = (n - T(16.0) + 1) / 12
        A = frames[T(16.0) - 1]
        B = np.zeros((H, W, 3), np.uint8); B[:, :W // 2] = view(TEX['Il'], 1.0)[:, :W // 2]; B[:, W // 2:] = view(TEX['Ir'], 1.0)[:, W // 2:]
        cv2.rectangle(B, (W // 2 - 3, 0), (W // 2 + 3, H), (255, 255, 255), -1)
        e = int(W * k); f = A.copy(); f[:, :e] = B[:, :e]
    elif t < 20.0:                                          # I : écran partagé, deux mouvements opposés
        f = np.zeros((H, W, 3), np.uint8)
        f[:, :W // 2] = view(TEX['Il'], 1.0, dy=-(t - 16.4) * 120)[:, :W // 2]
        f[:, W // 2:] = view(TEX['Ir'], 1.0, dy=(t - 16.4) * 120)[:, W // 2:]
        cv2.rectangle(f, (W // 2 - 3, 0), (W // 2 + 3, H), (255, 255, 255), -1)
    elif t < 20.0 + 10 / FPS:                               # rotation de transition : 360° en 10 images
        k = (n - T(20.0) + 1) / 10
        f = view(frames[T(20.0) - 1], 1 - 0.6 * k, rot=360 * k)
    elif t < 24.0:                                          # K : carton de texte
        f = np.full((H, W, 3), (90, 40, 20), np.uint8)
        f = put_text(f, 'PART 2', 120, anchor_y=560, stroke=0); f = put_text(f, 'THE TURN', 50, anchor_y=700, stroke=0, fill=(255, 200, 0))
    elif t < 28.0:                                          # L : bandes noires + marche arrière
        k = n - T(24.0)
        if t < 26.0: bx = 60 + 6 * k
        else: bx = 60 + 6 * (2 * T(2.0) - 1 - k)
        f = view(TEX['L'], 1.0); cv2.circle(f, (int(bx), 640), 44, (250, 250, 250), -1)
        bar = int(H * 0.12); f[:bar] = 0; f[H - bar:] = 0
    else:                                                   # M : coupes rapides sur les temps + émoji qui « pop »
        i = 0 if t < 28.25 else 1 + int((t - 28.25) // 0.5)
        f = view(FAST[i % 24], 1.0)
        if 30.25 <= t < 31.25:
            s = pop(n - T(30.25)); cv2.circle(f, (360, 640), int(120 * s), (0, 220, 255), -1)
            cv2.circle(f, (320, 600), int(14 * s), (0, 0, 0), -1); cv2.circle(f, (400, 600), int(14 * s), (0, 0, 0), -1)
            cv2.ellipse(f, (360, 660), (int(60 * s), int(40 * s)), 0, 0, 180, (0, 0, 0), max(1, int(8 * s)))
        if 37.0 <= t < 37.0 + 2 / FPS: f = np.full((H, W, 3), 255, np.uint8)
    # barre de progression permanente en haut
    pw = int(W * (n + 1) / N); f[0:10, :pw] = (85, 51, 255)
    frames.append(f)

vw = cv2.VideoWriter('v2_raw.mp4', cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
for f in frames: vw.write(f)
vw.release()

# ------------------------------------------------------------------ AUDIO
SR = 44100; ta = np.arange(int(DUR * SR)) / SR; audio = np.zeros_like(ta)
LINES = [(0.3, 'This is how it started.'), (2.0, 'Nobody saw it coming.'), (4.6, 'Look at this number.'), (8.4, 'Here is the screen they used every day.'),
         (12.5, 'Then everything sped up.'), (16.6, 'Two sides of the same story.'), (24.3, 'And then, it went backwards.')]
voice = np.zeros_like(ta); VSEG = []
for t0, txt in LINES:
    fn = tempfile.mktemp(suffix='.wav')
    subprocess.run(['espeak-ng', '-v', 'en-us', '-s', '165', '-w', fn, txt], check=True)
    with wave.open(fn) as w: sr0 = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    os.remove(fn)
    x = np.interp(np.arange(int(len(x) * SR / sr0)) * sr0 / SR, np.arange(len(x)), x)
    nz = np.nonzero(np.abs(x) > 0.01)[0]; x = x[nz[0]:nz[-1] + 1]
    i0 = int(t0 * SR); voice[i0:i0 + len(x)] += x * 0.9
    VSEG.append([round(t0, 2), round(t0 + len(x) / SR, 2), txt])
von = np.zeros_like(ta, bool)
for a, b, _ in VSEG: von |= (ta >= a) & (ta < b)
duck = np.convolve(np.where(von, 10 ** (-10 / 20), 1.0), np.ones(2205) / 2205, 'same')
cut_out = (ta >= 23.5) & (ta < 24.0)
beats = np.arange(0.25, DUR, 0.5)
music = 0.08 * np.sin(2 * np.pi * 82 * ta) + 0.05 * (np.sin(2 * np.pi * 220 * ta) + np.sin(2 * np.pi * 277 * ta) + np.sin(2 * np.pi * 330 * ta)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * ta))
for b in beats:
    m = (ta >= b) & (ta < b + 0.18); tt = ta[m] - b; music[m] += 0.4 * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 22)
music *= duck; music[cut_out] = 0
audio += music + voice

def add(x, t0, g=1.0):
    i0 = int(t0 * SR); n = min(len(x), len(audio) - i0); audio[i0:i0 + n] += g * x[:n]
def tsec(d): return np.arange(int(d * SR)) / SR
def hp_noise(n, k=8):
    z = rng.standard_normal(n); return z - np.convolve(z, np.ones(k) / k, 'same')
SFX = []
def whoosh(t0): tt = tsec(0.3); add(0.6 * hp_noise(len(tt)) * np.sin(np.pi * tt / 0.3), t0 - 0.15); SFX.append(('whoosh', t0))
def boom(t0): tt = tsec(0.5); add(0.9 * np.sin(2 * np.pi * 40 * tt) * np.exp(-tt * 8) + 0.3 * rng.standard_normal(len(tt)) * np.exp(-tt * 30), t0); SFX.append(('boom', t0))
def riser(t0, d=0.8):
    tt = tsec(d); ph = 2 * np.pi * np.cumsum(300 + 2500 * (tt / d) ** 2) / SR
    add((0.25 * np.sin(ph) + 0.15 * hp_noise(len(tt), 4)) * (tt / d) ** 1.5, t0); SFX.append(('riser', t0))
def popfx(t0): tt = tsec(0.07); add(0.7 * np.sin(2 * np.pi * (900 - 4000 * tt) * tt) * np.exp(-tt * 60), t0); SFX.append(('pop', t0))
def click(t0): tt = tsec(0.012); add(0.8 * rng.standard_normal(len(tt)) * np.exp(-tt * 500), t0); SFX.append(('clic', t0))
def ding(t0): tt = tsec(0.8); add(0.35 * (np.sin(2 * np.pi * 1760 * tt) + 0.5 * np.sin(2 * np.pi * 3520 * tt)) * np.exp(-tt * 5), t0); SFX.append(('ding', t0))
def glitch(t0):
    for k in range(8):
        tt = tsec(0.025); add(0.5 * np.sign(np.sin(2 * np.pi * (200 + 300 * (k % 3)) * tt)) * (rng.random() > .3), t0 + k * 0.03)
    SFX.append(('glitch', t0))
def typing(t0, d=0.8):
    for k in range(int(d / 0.07)):
        tt = tsec(0.01); add(0.45 * rng.standard_normal(len(tt)) * np.exp(-tt * 600), t0 + k * 0.07 + rng.random() * 0.02)
    SFX.append(('clavier', t0))
def shutter(t0):
    for dt in (0, 0.06):
        tt = tsec(0.02); add(0.7 * rng.standard_normal(len(tt)) * np.exp(-tt * 250), t0 + dt)
    SFX.append(('déclencheur', t0))
whoosh(4.0); glitch(8.0); typing(9.5); whoosh(12.0); whoosh(16.0); whoosh(20.0); ding(22.0); boom(24.0); riser(27.2)
for k in range(8): popfx(28.25 + 0.5 * k)
for k in range(8): click(32.25 + 0.5 * k)
shutter(37.0)
audio = np.clip(audio, -1, 1)
with wave.open('v2.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((audio * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'v2_raw.mp4', '-i', 'v2.wav', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', 'v2.mp4'], check=True)

cuts = [2.0, 24.0, 28.0] + [round(28.25 + 0.5 * k, 2) for k in range(24)]
truth = dict(
    format='vertical 9:16', resolution=[W, H],
    cuts_hard_s=cuts, reframe_cut={'t': 2.0, 'zoom_pct': 15},
    transitions=[dict(type='panoramique filé', start_s=4.0, dur_frames=8), dict(type='glitch', start_s=8.0, dur_frames=4), dict(type='zoom de transition', start_s=12.0, dur_frames=6),
                 dict(type='rideau', start_s=16.0, dur_frames=12, direction='vers la droite'), dict(type='rotation de transition', start_s=20.0, dur_frames=10), dict(type='flash blanc', start_s=37.0, dur_frames=2)],
    speed_ramp=dict(start_s=12.5, end_s=15.5, from_px=4, to_px=16), reverse=dict(start_s=26.0, dur_s=2.0),
    overlays=[dict(type='sticker', start_s=5.0, end_s=7.0, entree='pop', sortie='réduction', centre_pct=[75, 23]),
              dict(type='flèche', start_s=6.0, end_s=8.0, entree='glissement depuis la gauche'),
              dict(type='bandeau', start_s=9.0, end_s=11.83, entree='glissement depuis la gauche', position='bas gauche'),
              dict(type='émoji', start_s=30.25, end_s=31.25, entree='pop'),
              dict(type='image dans l\'image', start_s=12.2, end_s=16.0, position='bas droite'),
              dict(type='barre de progression', start_s=0, end_s=40, position='haut')],
    split_screen=dict(start_s=16.4, end_s=20.0, layout='gauche / droite'),
    captions=[dict(text=c[2], start_s=c[0], end_s=c[1], animation=c[3]) for c in CAPS], caption_y_pct=70, highlight='vert',
    titles=[dict(text='PART 2', start_s=20.33), dict(text='THE TURN', start_s=20.33)],
    shot_types=[dict(start_s=0, end_s=4, type='face caméra'), dict(start_s=4.27, end_s=8, type='illustration'), dict(start_s=8.13, end_s=12, type='capture d\'écran'),
                dict(start_s=12.2, end_s=16, type='illustration'), dict(start_s=16.4, end_s=20, type='écran partagé'), dict(start_s=20.33, end_s=24, type='carton de texte'),
                dict(start_s=24, end_s=28, type='illustration')],
    grade=dict(shot='0-4 s', shadows='bleutées', highlights='orangées', vignette=0.35, grain_std=6),
    letterbox=dict(start_s=24, end_s=28, bar_pct=12),
    face=dict(present_s=[0, 4.27], centre_pct=[50, 27]),
    voice_lines=VSEG, music=dict(bpm=120, ducking_db=10, cut_out=[23.5, 24.0]),
    sfx=[dict(type=k, t=round(t, 2)) for k, t in SFX],
)
json.dump(truth, open('truth_v2.json', 'w'), indent=1, ensure_ascii=False)
print('ok', N, 'images', len(SFX), 'effets sonores')

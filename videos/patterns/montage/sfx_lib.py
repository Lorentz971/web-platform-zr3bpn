"""Petite banque d'effets sonores fabriqués par calcul (aucun fichier téléchargé, aucune IA) :
whoosh, pop, clic, ding, impact, montée (riser), glitch, déclencheur photo, clavier."""
import os, wave
import numpy as np

SR = 44100
_rng = np.random.default_rng(7)


def _t(d): return np.arange(int(d * SR)) / SR


def _bp_noise(n, lo, hi):
    X = np.fft.rfft(_rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)


def whoosh(d=0.45):
    t = _t(d); n = len(t); env = np.sin(np.pi * t / d) ** 2
    lo = _bp_noise(n, 200, 1200); hi = _bp_noise(n, 1200, 6000); mix = t / d
    return env * ((1 - mix) * lo + mix * hi) * 0.8


def pop(d=0.08):
    t = _t(d); return 0.8 * np.sin(2 * np.pi * (900 - 4000 * t) * t) * np.exp(-t * 60)


def clic(d=0.02):
    t = _t(d); return 0.8 * _rng.standard_normal(len(t)) * np.exp(-t * 500)


def ding(d=1.2):
    t = _t(d); return 0.5 * (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 3520 * t)) * np.exp(-t * 4)


def impact(d=0.7):
    t = _t(d); return 0.9 * np.sin(2 * np.pi * (60 - 20 * t) * t) * np.exp(-t * 7) + 0.3 * _rng.standard_normal(len(t)) * np.exp(-t * 30)


def riser(d=1.5):
    t = _t(d); f = 200 + 1800 * (t / d) ** 2
    return 0.4 * (t / d) ** 1.5 * (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * _bp_noise(len(t), 2000, 8000))


def glitch(d=0.25):
    t = _t(d); sq = np.sign(np.sin(2 * np.pi * 180 * t)) * (np.floor(t * 40) % 2)
    return 0.5 * (sq + 0.6 * _rng.standard_normal(len(t)) * (np.floor(t * 25) % 3 == 0))


def declencheur(d=0.18):
    y = np.zeros(int(d * SR)); a = clic(0.02); y[:len(a)] += a; y[int(0.09 * SR):int(0.09 * SR) + len(a)] += 0.8 * a; return y


def clavier(d=0.7):
    y = np.zeros(int(d * SR))
    for k in range(8):
        a = clic(0.01) * 0.6; i = int((k * 0.08 + _rng.random() * 0.02) * SR)
        if i + len(a) < len(y): y[i:i + len(a)] += a
    return y


BANQUE = {'whoosh': whoosh, 'pop': pop, 'clic': clic, 'ding': ding, 'impact': impact, 'riser': riser, 'glitch': glitch,
          'declencheur': declencheur, 'clavier': clavier}

# nom mesuré par l'analyse → fichier de la banque
DEPUIS_ANALYSE = {'souffle (whoosh)': 'whoosh', 'pop': 'pop', 'clic': 'clic', 'ding': 'ding', 'impact grave (boum)': 'impact',
                  'montée (riser)': 'riser', 'glitch': 'glitch', 'déclencheur photo': 'declencheur', 'clavier': 'clavier'}


def ecrire(dossier):
    os.makedirs(dossier, exist_ok=True); out = {}
    for nom, fn in BANQUE.items():
        y = fn(); y = y / (np.abs(y).max() + 1e-9) * 0.7
        p = os.path.join(dossier, f'{nom}.wav')
        with wave.open(p, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
        out[nom] = dict(fichier=p, duree_s=round(len(y) / SR, 3))
    return out

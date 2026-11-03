"""Outils communs."""
import math
import numpy as np


def runs(mask):
    """Suites consécutives de True : liste de (début, fin) inclusifs."""
    out, k, n = [], 0, len(mask)
    while k < n:
        if mask[k]:
            a = k
            while k + 1 < n and mask[k + 1]:
                k += 1
            out.append((a, k))
        k += 1
    return out


def ncc(a, b):
    a = a.astype(np.float32) - a.mean(); b = b.astype(np.float32) - b.mean()
    d = math.sqrt(float((a * a).sum() * (b * b).sum())) + 1e-6
    return float((a * b).sum() / d)


def smooth(x, k):
    x = np.asarray(x, float)
    if len(x) == 0: return x
    k = max(1, min(k, len(x)))
    pad = k // 2
    return np.convolve(np.pad(x, (pad, k - 1 - pad), mode='edge'), np.ones(k) / k, 'valid')


COLOR_NAMES = [(0, 'rouge'), (15, 'orange'), (30, 'jaune'), (60, 'vert'), (90, 'cyan'), (120, 'bleu'), (150, 'violet'), (175, 'rouge')]


def hue_name(h):
    return min(COLOR_NAMES, key=lambda c: min(abs(c[0] - h), 180 - abs(c[0] - h)))[1]


def ab_name(a, b, thr=3.0):
    """Teinte d'après les axes a (vert-rouge) et b (bleu-jaune) de l'espace Lab."""
    if math.hypot(a, b) < thr: return 'neutre'
    ang = math.degrees(math.atan2(b, a)) % 360
    for lim, name in [(30, 'rouge / magenta'), (75, 'orangée'), (110, 'jaune'), (160, 'verte'), (250, 'cyan / bleutée'), (300, 'bleue / violette'), (360, 'magenta')]:
        if ang < lim: return name
    return 'neutre'

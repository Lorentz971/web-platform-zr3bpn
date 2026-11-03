"""Synchroniser plusieurs caméras (ou une caméra et un micro à part) par le son : on cherche le décalage qui fait
coïncider les attaques sonores (paroles, claquements, musique). Précision ~1/100 s."""
import numpy as np


def _enveloppe(path, sr=16000, hop=160, duree_max=None):
    import librosa
    from . import audio
    y = audio.load(path)
    if y is None: return None
    y = librosa.resample(y.mean(0), orig_sr=44100, target_sr=sr)
    if duree_max: y = y[:int(duree_max * sr)]
    e = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    e = (e - e.mean()) / (e.std() + 1e-9)
    return e, sr / hop


def decalage(ref, autre, max_decalage_s=600):
    """Décalage (s) à ajouter aux temps de `autre` pour tomber sur `ref` (autre démarré plus tard → positif), et confiance (0–1)."""
    from scipy.signal import fftconvolve
    A = _enveloppe(ref); B = _enveloppe(autre)
    if A is None or B is None: return None, 0.0
    (a, fa), (b, _) = A, B
    c = fftconvolve(a, b[::-1], mode='full'); lags = np.arange(-len(b) + 1, len(a))
    ok = np.abs(lags) <= max_decalage_s * fa; c = np.where(ok, c, -np.inf)
    k = int(np.argmax(c)); pic = c[k]
    voisin = np.sort(c[np.isfinite(c) & (np.abs(lags - lags[k]) > fa)])[-1] if np.isfinite(c).sum() > 2 * fa else 0
    n = min(len(a), len(b))
    conf = float(np.clip((pic - voisin) / (abs(pic) + 1e-9) * 2, 0, 1)) if pic > 0 else 0.0
    # affinage sous l'échantillon (parabole)
    if 0 < k < len(c) - 1 and np.isfinite(c[k - 1]) and np.isfinite(c[k + 1]):
        den = c[k - 1] - 2 * pic + c[k + 1]; fr = 0.5 * (c[k - 1] - c[k + 1]) / den if den else 0
    else: fr = 0
    return round(float((lags[k] + fr) / fa), 3), round(conf, 2)


def synchroniser(chemins, log=print):
    ref = chemins[0]; out = [dict(fichier=ref, decalage_s=0.0, confiance=1.0)]
    for p in chemins[1:]:
        d, c = decalage(ref, p)
        out.append(dict(fichier=p, decalage_s=d, confiance=c))
        log(f"  {p} : {'+' if (d or 0) >= 0 else ''}{d} s par rapport à {ref} (confiance {c})")
    return out

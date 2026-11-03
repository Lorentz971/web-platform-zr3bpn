#!/usr/bin/env python3
"""Musique de test à structure connue (pour vérifier l'analyse musicale) : 128 BPM,
intro étouffée (filtre passe-bas) de 0 à 6 s, drop à 6 s, montée de 10 à 12 s, silence de 12 à 12,5 s, drop à 12,5 s, outro.
Écrit musique-test.wav et truth_musique.json."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 22050; DUR = 20.0; BPM = 128; beat = 60 / BPM
t = np.arange(int(DUR * SR)) / SR; y = np.zeros_like(t); rng = np.random.default_rng(1)
def kick(t0): tt = np.arange(int(0.25 * SR)) / SR; return t0, 0.9 * np.sin(2 * np.pi * (110 * np.exp(-tt * 20) + 45) * tt) * np.exp(-tt * 9)
def snare(t0): tt = np.arange(int(0.18 * SR)) / SR; return t0, 0.4 * rng.standard_normal(len(tt)) * np.exp(-tt * 25)
def hat(t0): tt = np.arange(int(0.04 * SR)) / SR; return t0, 0.15 * rng.standard_normal(len(tt)) * np.exp(-tt * 120)
def put(ev, gain=1.0):
    t0, x = ev; i = int(t0 * SR); y[i:i + len(x)] += gain * x[:max(0, len(y) - i)]
nb = int(DUR / beat)
for k in range(nb):
    tb = k * beat
    if 12.0 <= tb < 12.5: continue
    put(kick(tb)); put(hat(tb + beat / 2))
    if k % 2 == 1: put(snare(tb))
chords = [220, 277, 330, 262]
pad = sum(0.12 * np.sin(2 * np.pi * chords[int(tt // (4 * beat)) % 4] * m * t) for m, tt in [(1, 0), (2, 0), (3, 0)] for _ in [0]) if False else None
pad = np.zeros_like(t)
for m in (1, 2, 3, 4):
    f = np.array([chords[int(x // (4 * beat)) % 4] for x in t]) * m
    pad += (0.12 / m) * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
y += pad
y[(t >= 12.0) & (t < 12.5)] = 0
riser = (t >= 10) & (t < 12); y[riser] += 0.3 * ((t[riser] - 10) / 2) * rng.standard_normal(riser.sum())
b, a = butter(4, 400 / (SR / 2))                         # intro étouffée : on ne garde que les graves
intro = t < 6.0; y[intro] = lfilter(b, a, y[intro]) * 1.6
y[t < 6.0] *= 0.8
y /= np.abs(y).max() * 1.1
with wave.open('musique-test.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
json.dump(dict(tempo_bpm=BPM, filtre=[0.0, 6.0], drops=[6.0, 12.5], silence=[12.0, 12.5], montee=[10.0, 12.0]), open('truth_musique.json', 'w'), indent=1)
print('musique-test.wav écrite')

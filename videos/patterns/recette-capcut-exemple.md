# Recette de montage — d'après v2.mp4

Format **vertical** 1080×1920, 30 images/s, durée **17.8 s**, 16 plans (≈ 54 par minute).

## Dans CapCut (ou tout autre logiciel)

1. Nouveau projet au format 9:16.
2. Importez les rushs, la musique et le dossier `sfx/` (effets sonores fournis).
3. **Coupes** : suivez `marqueurs.csv` (colonne *timecode*) — chaque ligne « coupe » dit quel rush et quel passage garder. Les silences sont déjà retirés.
4. **Cadrage** : sur les plans marqués « cadre ×1.151 », agrandissez l'image de 15 % (changement de cadre à la coupe).
6. **Transitions** : panoramique filé (8 images), zoom de transition (7 images) — aux lignes « transition ».
7. **Sous-titres** : Texte → Sous-titres locaux → importez `sous-titres.srt`. Style : position à 70 % de la hauteur, texte de 3.1 % de la hauteur, MAJUSCULES, contour noir épais, mot clé en vert (#22e04a), animation d'entrée : pop avec rebond.
8. **Effets sonores** : 9 effets, aux lignes « effet sonore » (fichiers dans `sfx/`).
9. **Musique** : musique.wav (99 BPM) à -12.0 dB, baissée de **12.8 dB** quand on parle (dans CapCut : « Atténuation automatique » / ducking, ou images clés de volume).
10. **Barre de progression** en haut de l'écran sur toute la durée.
10 bis. **Incrustations** : 2 éléments (bandeau, sticker / émoji), aux lignes « incrustation » (position, texte, entrée).
11. **Volume** : à l'export, normalisez à **-21.1 LUFS** (volume intégré mesuré sur la vidéo de référence).

## Étalonnage
Cible : luminosité 34.9, contraste 15.9, saturation 49.4 (nos rushs : {'luminosite': 46.1, 'contraste': 14.1, 'saturation': 44.5}). Réglages : luminosité ×0.76, contraste ×1.13, saturation ×1.11, ombres vers verte, hautes lumières vers orangée, vignettage 0.1.

## Toutes les actions dans l'ordre

| Timecode | Type | Action |
|---|---|---|
| 00:00:00:00 | coupe | plan 1 : rush-face.mp4 0.83–2.65 s |
| 00:00:01:25 | coupe | plan 2 : rush-face.mp4 2.65–3.53 s, cadre ×1.151 |
| 00:00:01:25 | illustration | rush-broll-2.mp4 2.12–3.00 s par-dessus la voix, jusqu'à 2.70 s |
| 00:00:01:25 | incrustation | sticker / émoji jusqu'à 3.82 s, centre à [62, 36] % de l'écran, entrée : pop avec rebond |
| 00:00:02:16 | effet sonore | whoosh |
| 00:00:02:21 | coupe | plan 3 : rush-face.mp4 4.19–7.02 s, cadre ×1.151 |
| 00:00:02:21 | illustration | rush-broll-2.mp4 5.54–8.37 s par-dessus la voix, jusqu'à 5.53 s |
| 00:00:02:21 | transition | panoramique filé (8 images) |
| 00:00:05:16 | coupe | plan 4 : rush-face.mp4 8.00–9.90 s, cadre ×1.151 |
| 00:00:05:16 | effet sonore | pop |
| 00:00:05:16 | illustration | rush-broll-1.mp4 5.77–7.67 s par-dessus la voix, jusqu'à 7.43 s |
| 00:00:07:13 | coupe | plan 5 : rush-face.mp4 10.62–12.04 s, cadre ×1.151 |
| 00:00:07:13 | illustration | rush-broll-2.mp4 0.00–1.42 s par-dessus la voix, jusqu'à 8.85 s |
| 00:00:08:26 | coupe | plan 6 : rush-face.mp4 13.05–15.03 s, cadre ×1.151 |
| 00:00:08:26 | illustration | rush-broll-1.mp4 3.09–5.07 s par-dessus la voix, jusqu'à 10.83 s |
| 00:00:10:25 | coupe | plan 7 : rush-face.mp4 15.03–16.17 s |
| 00:00:10:25 | effet sonore | clic |
| 00:00:10:25 | illustration | rush-broll-2.mp4 3.70–4.84 s par-dessus la voix, jusqu'à 11.97 s |
| 00:00:11:29 | coupe | plan 8 : rush-face.mp4 16.80–17.90 s |
| 00:00:11:29 | illustration | rush-broll-1.mp4 1.29–2.39 s par-dessus la voix, jusqu'à 13.07 s |
| 00:00:13:02 | coupe | plan 9 : rush-face.mp4 17.90–18.41 s, cadre ×1.151 |
| 00:00:13:02 | effet sonore | clic |
| 00:00:13:02 | illustration | rush-broll-2.mp4 9.07–9.58 s par-dessus la voix, jusqu'à 13.58 s |
| 00:00:13:13 | effet sonore | whoosh |
| 00:00:13:17 | coupe | plan 10 : rush-face.mp4 19.39–20.09 s, cadre ×1.151 |
| 00:00:13:17 | illustration | rush-broll-1.mp4 8.37–9.07 s par-dessus la voix, jusqu'à 14.28 s |
| 00:00:13:17 | transition | zoom de transition (7 images) |
| 00:00:14:08 | coupe | plan 11 : rush-face.mp4 20.09–20.68 s |
| 00:00:14:08 | effet sonore | clic |
| 00:00:14:08 | illustration | rush-broll-1.mp4 0.00–0.59 s par-dessus la voix, jusqu'à 14.87 s |
| 00:00:14:16 | incrustation | bandeau jusqu'à 16.52 s, centre à [39, 82] % de l'écran, entrée : pop avec rebond, texte « INCROYABLE » |
| 00:00:14:26 | coupe | plan 12 : rush-face.mp4 20.68–21.26 s, cadre ×1.151 |
| 00:00:14:26 | illustration | rush-broll-1.mp4 11.27–11.85 s par-dessus la voix, jusqu'à 15.45 s |
| 00:00:15:14 | coupe | plan 13 : rush-face.mp4 21.92–22.30 s, cadre ×1.151 |
| 00:00:15:14 | transition | zoom de transition (7 images) |
| 00:00:15:15 | effet sonore | pop |
| 00:00:15:25 | coupe | plan 14 : rush-face.mp4 22.30–22.70 s |
| 00:00:15:25 | effet sonore | clic |
| 00:00:16:07 | coupe | plan 15 : rush-face.mp4 22.70–23.50 s, cadre ×1.151 |
| 00:00:16:07 | illustration | rush-broll-1.mp4 9.77–10.57 s par-dessus la voix, jusqu'à 17.03 s |
| 00:00:17:01 | coupe | plan 16 : rush-face.mp4 23.50–24.27 s |
| 00:00:17:01 | illustration | rush-broll-2.mp4 10.28–11.05 s par-dessus la voix, jusqu'à 17.80 s |
| 00:00:17:08 | effet sonore | pop |

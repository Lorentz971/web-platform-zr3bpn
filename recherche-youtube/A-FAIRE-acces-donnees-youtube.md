# À faire plus tard : ouvrir l'accès aux données YouTube

*Mis de côté le 1er novembre 2026. Une fois ces étapes faites, l'analyse des chaînes réelles (phase 2, points 2 à 6) peut reprendre.*

## Pourquoi

L'analyse des chaînes (comparer les vidéos qui marchent et celles qui ne marchent pas sur une même chaîne) a besoin des données vidéo par vidéo : titre, date, durée, vues. Elles ne sont accessibles que par l'API YouTube, actuellement bloquée dans l'environnement cloud.

## Étapes (environ 10 minutes)

### 1. Créer la clé API YouTube (gratuite)
1. Aller sur la Google Cloud Console (console.cloud.google.com) avec ton compte Google.
2. Créer un projet (n'importe quel nom).
3. Dans « API et services », puis « Bibliothèque », activer **YouTube Data API v3**.
4. Dans « Identifiants », cliquer sur « Créer des identifiants », puis « Clé API ».
5. Conseillé : restreindre la clé à « YouTube Data API v3 ».

### 2. Ouvrir l'accès réseau de l'environnement cloud
1. Dans la session Claude Code, ouvrir le menu de l'environnement dans la barre de titre, puis **Edit**.
2. Dans **Network access**, ajouter ces domaines aux domaines autorisés :
   - `www.googleapis.com` (indispensable)
   - `youtube.com` et `i.ytimg.com` (pour les pages et les miniatures)
   - `support.google.com` (pour lire l'aide officielle de YouTube)
3. Laisser cochée la case qui autorise les gestionnaires de paquets.

Documentation : https://code.claude.com/docs/en/cloud-environments#network-access

### 3. Ajouter la clé comme secret
1. Dans le même écran, dans **Network secrets** (ou dans les variables d'environnement), ajouter la clé sous le nom **`YOUTUBE_API_KEY`**.
2. Ne jamais coller la clé dans le chat.

### 4. Relancer
Ouvrir une **nouvelle session** (les réglages s'appliquent au démarrage), puis demander :
> « Reprends la phase 2 de la recherche YouTube : l'analyse des chaînes réelles, à partir de `recherche-youtube/07-phase2-verifications.md`. »

## Ce qui sera fait ensuite
- Environ 20 chaînes par niche (storytelling, sport/F1, cinéma/animés, animation 2D, Shorts), de petites à grandes.
- Pour chacune, les 30 dernières vidéos, avec un ratio de performance calculé par rapport à la médiane de la chaîne à âge comparable.
- L'étude des sujets, titres, miniatures, durées et styles de narration.
- Les 3 concepts de chaînes avec le coût de production estimé.

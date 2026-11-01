# Plan de recherche : YouTube, algorithme et stratégie de chaînes

*Démarré le 1er novembre 2026. Ce fichier permet de reprendre le travail sans recommencer.*

## Règles de travail

- **Niveaux de confiance**, utilisés dans tous les documents :
  - **[OFFICIEL]** : déclaré par YouTube ou Google (Help Center, blog officiel, Creator Insider, Creator Liaison, documentation, publications techniques des équipes YouTube).
  - **[OBSERVÉ]** : constaté de façon répétée dans des données publiques ou des études externes, avec leur méthodologie.
  - **[ESTIMATION]** : chiffre issu d'une source tierce (outil, agence, blog) sans méthodologie vérifiable.
  - **[HYPOTHÈSE]** : notre interprétation, à tester.
- On ne prétend jamais connaître le code ou les pondérations internes de l'algorithme.
- Aucune statistique ni donnée de chaîne inventée. Une donnée introuvable est signalée comme telle.
- Aucun développement d'application, aucune modification des projets existants.

## Limites d'accès connues

- Pas d'accès à l'API YouTube Data ni à YouTube Analytics (pas de clé ni de chaîne connectée).
- Pas de visionnage des vidéos : l'analyse des chaînes repose sur les données publiques accessibles par le web (titres, durées, descriptions, articles, analyses tierces).
- Certaines pages officielles peuvent ne pas être récupérables directement. On s'appuie alors sur des reprises datées et on le signale.

## Questions prioritaires

| # | Question | Documents | Priorité |
|---|---|---|---|
| Q1 | Que dit officiellement YouTube de son système de recommandation (signaux, satisfaction, enquêtes) ? | 1, 6 | ★★★ |
| Q2 | En quoi l'accueil, les suggestions, la recherche et le fil Shorts diffèrent-ils ? | 1 | ★★★ |
| Q3 | Comment une nouvelle chaîne ou vidéo atteint-elle de nouvelles audiences ? | 1, 3 | ★★★ |
| Q4 | Que mesurent exactement les métriques de Studio (impressions, CTR, rétention, spectateurs nouveaux, occasionnels, réguliers), et quelles sont leurs limites ? | 1, 5 | ★★★ |
| Q5 | Quelles sont les règles actuelles du Programme Partenaire, de la monétisation des Shorts et du contenu réutilisé ou « inauthentique » ? | 3, 6 | ★★★ |
| Q6 | Quels formats (documentaire, sport, cinéma, animation, sans visage, Shorts) correspondent à nos outils et à nos contraintes de droits ? | 2 | ★★★ |
| Q7 | Comment fonctionnent les tests A/B de titres et de miniatures (Test & Compare), et que mesurent-ils ? | 4, 5 | ★★ |
| Q8 | Quelles études externes sérieuses existent sur la rétention, les Shorts et les revenus ? | 1, 3 | ★★ |
| Q9 | Quels sont les risques de droits d'auteur par niche (sport, cinéma, animé) ? | 2, 3 | ★★★ |
| Q10 | Quels sont les coûts et contraintes de nos outils (licence Remotion, temps de rendu, IA) ? | 3, 4 | ★★ |
| Q11 | Quelles sont les règles de TikTok pour adapter les contenus ? | 3 | ★ |

## Sources visées, par ordre de priorité

1. **Officielles** : YouTube Help (recommandations, recherche, Shorts, métriques Studio, YPP, contenu réutilisé, IA), blog YouTube (« On YouTube's recommendation system », 2021), Creator Insider, Creator Liaison (Rene Ritchie), YouTube Culture & Trends.
2. **Techniques publiées par YouTube/Google** : Covington et al. 2016 (*Deep Neural Networks for YouTube Recommendations*), Zhao et al. 2019 (*Recommending What Video to Watch Next*). À dater et à ne pas confondre avec le système actuel.
3. **Études externes** : Pew Research, Metricool, Tubular, vidIQ, Chartbeat, etc. Méthodologie à vérifier.
4. **Analyses de créateurs** : observations, à classer [OBSERVÉ] ou [HYPOTHÈSE].

## Étapes

1. ✅ Plan et questions (ce fichier).
2. ✅ Registre des sources (`notes-sources.md`) : 39 faits sourcés et datés, avec leur niveau de confiance.
3. ✅ Recherches par lots (environ 35 recherches web). ⚠️ Les domaines youtube.com et support.google.com sont bloqués dans cette session : les pages officielles sont connues par reprises (marquées [OFFICIEL-R]).
4. ✅ Documents 1 à 6 rédigés.
5. ✅ Feuille de route (document 6, section 9).

## Prochaines étapes de recherche (sans refaire ce qui est fait)

- Revérifier les faits [OFFICIEL-R] dès que les domaines officiels sont autorisés (liste dans `notes-sources.md`, « Questions ouvertes »).
- Exécuter le protocole d'échantillonnage de chaînes (document 2, section 11) avec l'API YouTube Data.
- Mettre à jour le registre à chaque nouvelle annonce de YouTube (Creator Insider, blog officiel).

## Index des livrables

| Fichier | Contenu |
|---|---|
| `01-comprendre-youtube.md` | Système de découverte, recommandations, métriques, limites |
| `02-formats-et-niches.md` | Comparaison des formats, protocole d'analyse de chaînes |
| `03-strategie-multi-chaines.md` | Organisation, économie, automatisation |
| `04-guide-de-production.md` | Sujets, scripts, titres, miniatures, montage, publication |
| `05-plan-experimentation.md` | Hypothèses H1 à H8, indicateurs, calendrier, critères |
| `06-synthese-decisionnelle.md` | Réponses aux 8 questions et feuille de route |
| `notes-sources.md` | Registre des sources et des faits |

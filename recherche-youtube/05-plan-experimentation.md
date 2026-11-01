# Document 5 : plan d'expérimentation

*Hypothèses, métriques, conditions de comparaison, critères de décision et suivi. Novembre 2026.*

> Les références F1, F2… renvoient à `notes-sources.md`. **Aucune promesse de vues.** Les seuils proposés sont des points de départ à recalibrer avec nos premières données.

---

## 1. Principes de méthode

1. **Une seule vraie expérience aléatoire existe sur YouTube** : **Test & Compare**, où YouTube répartit lui-même les spectateurs entre les variantes [F14]. Tout le reste est **observationnel** : il faut contrôler au mieux les facteurs parasites.
2. **Comparer à l'intérieur d'une chaîne**, à durée comparable et à des périodes proches.
3. **Utiliser la médiane** et des comparaisons par paires, car la distribution des vues est extrêmement inégale [F16].
4. **Fixer les critères de décision avant le test**, et les écrire dans le journal.
5. **Ne pas tester trop de choses à la fois** : une variable principale par vague.
6. **Mesure** : utiliser les **vues engagées** (mode avancé) et la **durée de visionnage**. Ne pas mélanger de données d'avant et d'après le **24 août 2026** [F13].

---

## 2. Indicateurs

### Par vidéo (relevés à J+10, J+28 et J+90)

| Indicateur | Rôle | Source |
|---|---|---|
| **Durée de visionnage totale** (heures) | Indicateur principal de performance | Studio |
| **Vues engagées** | Volume réel | Studio, mode avancé |
| **Pourcentage moyen regardé** (AVP) | Qualité de la rétention, à durée comparable | Studio |
| **Rétention à 30 s et à 60 s** | Qualité de l'introduction | Courbe de rétention |
| **CTR des impressions, par source de trafic** | Qualité de l'emballage | Studio (ne pas comparer d'une source à l'autre) |
| **Répartition des sources de trafic** | Quel système porte la vidéo | Studio |
| **Part de nouveaux spectateurs** | Capacité à atteindre de nouveaux publics | Studio, Audience [F12] |
| **Heures humaines** | Coût | Journal de production |
| **Minutes machine** (calcul et rendu) | Coût | Journal automatique |
| **Revendications et avertissements** | Risque | Studio |

### Par chaîne (mensuel)
Médiane de la durée de visionnage par vidéo ; évolution des spectateurs occasionnels et réguliers ; durée de visionnage obtenue par heure humaine ; revenus (une fois monétisé), avec le revenu par heure de visionnage.

---

## 3. Hypothèses à tester

| # | Hypothèse | Variable testée | Ce qui reste fixe | Indicateur principal | Méthode |
|---|---|---|---|---|---|
| **H1** | Parmi 2 ou 3 niches, l'une offre un meilleur rapport entre la **durée de visionnage** et les **heures de production** | La niche (une chaîne pilote par niche) | Le format (documentaire ou explication de 10-12 min), la cadence | Médiane de la durée de visionnage par vidéo **÷ heures humaines** | 12 vidéos par chaîne, sur 10 à 12 semaines |
| **H2** | Certains angles de titre (mystère, événement, personnage…) génèrent plus de durée de visionnage dans notre niche | L'angle du titre | La vidéo elle-même | Gagnant de Test & Compare (part de durée de visionnage) | Test & Compare sur **chaque** vidéo ; agrégation par angle |
| **H3** | Une ouverture *in medias res* retient mieux qu'une ouverture « promesse d'abord » | Le type d'introduction | La niche, la durée, le style | Rétention à 30 s et à 60 s | Alterner les deux types sur des vidéos successives (A, B, A, B…), au moins 6 de chaque |
| **H4** | Une vidéo de 8-10 min donne plus de durée de visionnage **par heure de production** qu'une vidéo de 15-20 min | La durée | La niche, le style | Durée de visionnage par vidéo **et** par heure humaine | Paires de sujets comparables, au moins 5 paires |
| **H5** | Un montage plus dense (relances visuelles fréquentes) améliore la rétention sans hausse du coût | La densité de montage | Le script | Pourcentage moyen regardé ; minutes de rendu | Même structure de script, 2 gabarits Remotion, au moins 5 vidéos par gabarit |
| **H6** | L'**animation** surperforme les **archives** sur des sujets comparables | Le traitement visuel | Le sujet (paires), la narration | AVP, CTR, durée de visionnage **et** coût total (humain + machine) | Au moins 4 paires de sujets jumeaux |
| **H7** | Décliner chaque vidéo longue en 2 ou 3 Shorts augmente la durée de visionnage des vidéos longues de la chaîne | La présence de Shorts | Les vidéos longues | Durée de visionnage des vidéos longues ; part de nouveaux spectateurs | Périodes alternées avec et sans Shorts (4 semaines chacune). ⚠️ Causalité difficile à établir [F6] |
| **H8** | Le pipeline automatisé réduit les heures par vidéo de plus de 50 % **sans** baisse de rétention | Manuel ou pipeline | La niche, le format | Heures humaines, minutes machine, AVP | Vidéos successives produites des deux façons, au moins 4 de chaque |

---

## 4. Conditions de comparaison et limites statistiques

| Facteur parasite | Effet | Parade |
|---|---|---|
| **Le sujet** | De loin le facteur le plus puissant | Paires de sujets jumeaux ; alternance A, B, A, B |
| **L'âge de la chaîne** | Les vidéos tardives profitent de l'apprentissage du système | Comparer des vidéos proches dans le temps |
| **La saisonnalité** | Audience et RPM varient selon la période [F24] | Pas de comparaison entre décembre et janvier, par exemple |
| **Une vidéo qui perce** | Fait monter les vidéos suivantes et précédentes | Exclure la vidéo hors norme et vérifier si la conclusion tient sans elle |
| **Changement de comptage des vues** | Rupture au 24 août 2026 [F13] | Vues engagées et durée de visionnage uniquement |
| **Petit échantillon** | Fortes variations dues au hasard | Ne conclure qu'à partir d'**écarts importants et répétés** (par exemple plus de 30 % de différence de médiane, dans le même sens, sur au moins 2 vagues). Sinon : « non concluant ». |

**Ce qu'il faut accepter** : avec 5 à 12 vidéos par condition, on détecte seulement les **grosses** différences. Les petites différences ne sont pas mesurables à notre échelle : ce n'est pas grave, ce sont les grosses qui comptent pour décider.

---

## 5. Calendrier

| Phase | Durée | Contenu | Livrable |
|---|---|---|---|
| **0. Préparation** | 2 semaines | Journal d'expériences, protocole API (document 2, section 11), 30 sujets notés, gabarits Remotion, registre des droits | Backlog de sujets et outils de suivi |
| **1. Pilotes** | Semaines 3 à 14 | 2 ou 3 chaînes (modèle B, document 3) ; environ 12 vidéos longues et 25 à 35 Shorts par chaîne ; H1, H2 (en continu), H3 | Choix de la niche principale |
| **2. Optimisation** | Semaines 15 à 26 | Sur la ou les chaînes retenues : H4, H5, H6, H7, H8 | Format, durée, style et pipeline optimisés |
| **3. Passage à l'échelle** | À partir de la semaine 27 | Cadence augmentée, modèle C éventuel, revenus hors publicité | Feuille de route de la phase suivante |

---

## 6. Critères de décision (définis à l'avance)

**Fin de la phase 1, pour chaque chaîne pilote** [HYPOTHÈSE, à recalibrer] :

| Résultat | Décision |
|---|---|
| Médiane de la durée de visionnage par vidéo en hausse sur les 6 dernières vidéos par rapport aux 6 premières, **et** au moins une vidéo à plus de 3× la médiane | **Retenir** la chaîne |
| Stagnation, mais AVP correct (meilleur que nos autres chaînes) | **Modifier** l'emballage et les sujets pendant 6 vidéos supplémentaires |
| Stagnation, AVP faible, coût élevé | **Arrêter** la chaîne et réaffecter les heures |

**Test & Compare (H2)** : un angle est jugé meilleur s'il **gagne dans plus de 60 % des tests** où il est opposé aux autres, sur au moins 10 tests. Si les résultats sont « équivalents », on ne conclut pas.

---

## 7. Journal d'expériences (structure du tableau)

Une ligne par vidéo :

| Colonne | Exemple |
|---|---|
| Identifiant de la vidéo, chaîne, date | — |
| Hypothèse(s) testée(s), condition (A ou B) | H3-A |
| Sujet, angle, score de sujet (document 4) | — |
| Titres et miniatures testés, gagnant, écart | — |
| Durée de la vidéo | — |
| Heures humaines par étape (recherche, script, médias, animation, montage, emballage) | — |
| Minutes machine par étape (génération, rendu) | — |
| Indicateurs à J+10, J+28, J+90 | — |
| Revendications ou avertissements | — |
| Observations qualitatives (commentaires, chutes de rétention) | — |
| Décision et raison | — |

**Revue** : courte chaque semaine (nouvelles données), complète chaque mois (décisions).

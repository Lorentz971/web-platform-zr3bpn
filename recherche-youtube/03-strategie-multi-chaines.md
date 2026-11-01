# Document 3 : stratégie multi-chaînes, économie et automatisation

*Tester plusieurs projets en limitant les risques, le travail humain et les dépenses. Novembre 2026.*

> Les références F1, F2… renvoient à `notes-sources.md`. Tous les chiffres économiques de ce document sont des **scénarios hypothétiques**, à remplacer par nos mesures réelles.

---

## 1. Principes directeurs

1. **Le système apprend par chaîne et par public** [F1, F4]. Une chaîne trop dispersée envoie des signaux contradictoires. Une chaîne par **promesse** et par **public**, pas par idée.
2. **Mutualiser l'usine, pas le produit.** On partage la recherche, les bibliothèques et les gabarits ; on ne publie jamais le même contenu ou des quasi-copies sur plusieurs chaînes [F31].
3. **Décider sur des données suffisantes** : pas de conclusion sur 3 vidéos (distribution très inégale [F16]).
4. **Le temps machine compte** : le temps de rendu et de calcul fait partie du coût, au même titre que le temps humain.

---

## 2. Créer une nouvelle chaîne, ou publier sur une chaîne existante ?

| Situation | Décision | Pourquoi |
|---|---|---|
| Même public, sujet voisin, même promesse | **Même chaîne**, nouvelle série ou playlist | Le système a déjà appris qui aime la chaîne |
| Même public, format différent (Shorts / vidéo longue) | **Même chaîne** | Systèmes de recommandation séparés [F6], mais une identité commune |
| **Public différent** (âge, centres d'intérêt), ou promesse incompatible | **Nouvelle chaîne** | Évite de brouiller les signaux de la chaîne existante |
| Ton incompatible (humour / sérieux, enfants / adultes) | **Nouvelle chaîne** | Protège la confiance du public |
| Autre langue | **Doublage automatique d'abord** [F10], chaîne séparée seulement si le contenu doit être adapté (références culturelles) | Coût marginal quasi nul |

**Test rapide** : « Un spectateur fidèle de la chaîne A serait-il content de voir cette vidéo dans ses recommandations ? » Si la réponse est non, il faut une autre chaîne.

---

## 3. Trois modèles d'organisation pour une petite équipe

### Modèle A : une chaîne, plusieurs séries (démarrage)
- **Principe** : une seule chaîne avec un territoire large (par exemple « histoires vraies et mystères ») et 2 ou 3 séries internes.
- **Pour** : concentre l'apprentissage du système, une seule identité à construire, charge minimale.
- **Contre** : un échec d'une série pèse sur la perception de la chaîne ; les publics ne peuvent pas être trop éloignés.
- **Charge humaine estimée** [HYPOTHÈSE] : 1 personne à mi-temps, plus le pipeline.

### Modèle B : portefeuille de 2 ou 3 chaînes pilotes (recommandé pour tester)
- **Principe** : 2 ou 3 chaînes aux **publics distincts**, sur un **socle commun** (Story Studio, Media Finder, bibliothèques, Remotion). Chacune garde une identité propre (voix, style, gabarit de miniature).
- **Pour** : on compare des niches en parallèle, et le risque est réparti.
- **Contre** : la charge humaine augmente avec chaque chaîne ; risque de dispersion.
- **Garde-fou** : un **budget fixe d'heures par chaîne et par semaine**, et des critères d'arrêt définis **avant** de commencer (section 5).
- **Charge humaine estimée** [HYPOTHÈSE] : 1 à 2 personnes.

### Modèle C : un moteur éprouvé, décliné (après une première réussite)
- **Principe** : quand un format a fait ses preuves, on le décline sur des territoires voisins (même mécanique narrative et visuelle, sujets différents).
- **Pour** : un rendement maximal du pipeline.
- **Contre** : **risque maximal** au regard des règles sur le contenu inauthentique et le spam [F30, F31] si les chaînes se ressemblent trop.
- **Condition** : chaque chaîne doit avoir un **apport éditorial propre** (recherche, angle, voix), pas seulement des sujets différents.

---

## 4. Mutualiser sans tomber dans le « produit en masse »

| Élément | Mutualisable ? | Précaution |
|---|---|---|
| Recherche de sujets, veille | ✅ Oui | — |
| Méthodes de script, structures | ✅ Oui | Adapter le ton à chaque chaîne |
| Bibliothèques de cartes, icônes, décors | ✅ Oui | Personnaliser le style par chaîne |
| Musiques | ⚠️ Avec variation | YouTube cite explicitement les chaînes qui **réutilisent exactement la même musique de fond** sur de nombreuses vidéos [F31] |
| Images ou animations générées par IA | ⚠️ Avec variation | Même avertissement sur les **images IA répétitives** [F31] ; déclaration obligatoire si le rendu est réaliste [F32] |
| Gabarits Remotion (habillage, sous-titres) | ✅ Oui | Un gabarit distinct par chaîne |
| Voix off | ⚠️ | Une voix par chaîne ; déclarer une voix IA réaliste [F32] |
| Vidéos ou extraits identiques | ❌ Non | Interdit par la politique anti-spam [F31] |

---

## 5. Décider : continuer, modifier ou abandonner

### Règles statistiques de base
- Les vues suivent une **distribution très inégale** [F16]. Il faut utiliser la **médiane** et non la moyenne, et regarder la **tendance**, pas une vidéo isolée.
- **Taille d'échantillon minimale indicative** [HYPOTHÈSE] : environ **10 à 12 vidéos longues** ou **30 Shorts** par format, publiées sur **au moins 8 à 12 semaines**, avant toute décision d'abandon. En dessous, on peut seulement **modifier**.
- Comparer une vidéo à la **médiane de sa propre chaîne**, pas à des chaînes d'autres tailles.
- ⚠️ Mesurer avec les **vues engagées** (mode avancé) et la **durée de visionnage**, pas avec les vues comptées depuis la première image [F13].

### Grille de décision [HYPOTHÈSE, à calibrer]

| Signal après la période de test | Décision |
|---|---|
| Médiane des vues en hausse, pourcentage regardé stable ou en hausse, part de spectateurs occasionnels et réguliers qui augmente | **Développer** : augmenter la cadence, envisager le modèle C |
| Bonne rétention mais CTR faible | **Modifier l'emballage** (titres, miniatures), pas le contenu |
| CTR correct mais rétention faible | **Modifier le contenu** : introductions, rythme, durée |
| Une ou deux vidéos percent, le reste stagne | **Pivoter** vers le sous-sujet ou l'angle des vidéos qui ont percé |
| Tout reste plat et le coût par vidéo est élevé | **Abandonner** et réaffecter les heures |

**Toujours noter** la raison de chaque décision dans le journal d'expériences (document 5), pour éviter de reproduire les mêmes erreurs.

### Éviter la dispersion
- **3 chaînes actives au maximum** au départ.
- On n'ouvre une nouvelle chaîne qu'en en fermant ou en mettant en pause une autre.
- Un **responsable éditorial** par chaîne, même s'il s'agit de la même personne : quelqu'un qui garde la cohérence.

---

## 6. Économie et monétisation

### 6.1 Règles en vigueur

| Élément | Règle | Niveau |
|---|---|---|
| Accès à la publicité | 1 000 abonnés + 4 000 heures de visionnage sur 12 mois, **ou** 1 000 abonnés + 10 millions de vues de Shorts sur 90 jours | [OFFICIEL-R] F27 |
| Niveau d'entrée (sans publicité) | 500 abonnés, 3 vidéos en 90 jours, 3 000 heures ou 3 millions de vues de Shorts ; selon les pays | [OFFICIEL-R] F27 |
| Partage des revenus des vidéos longues | 55 % pour le créateur | [OFFICIEL-R] F28 |
| Partage des revenus des Shorts | Cagnotte répartie selon les vues engagées, moins la part musique ; 45 % de la part attribuée revient au créateur | [OFFICIEL-R] F28 |
| Contenu réutilisé | Monétisable seulement avec un apport original important | [OFFICIEL-R] F30 |
| Contenu inauthentique | Contenu produit en masse ou répétitif non monétisable ; **s'applique à la chaîne entière** | [OFFICIEL-R] F30 |

### 6.2 Ce que représentent les 4 000 heures (calcul simple)
Avec une vidéo de 12 minutes regardée en moyenne à 40 % (4,8 minutes par vue) :
4 000 h × 60 = 240 000 minutes ÷ 4,8 = **environ 50 000 vues** cumulées sur 12 mois, toutes vidéos longues confondues.
C'est un objectif atteignable par une seule vidéo qui perce, ou par environ 40 vidéos à 1 250 vues. **[Calcul, pas une prévision.]**

### 6.3 Revenus par format (ordres de grandeur)

| Format | RPM retenu pour les scénarios | Fondement |
|---|---|---|
| Vidéo longue, audience française | 1,5 € (bas) / 3 € (médian) / 5 € (haut) pour 1 000 vues | [ESTIMATION] F23 : moyenne autour de 2,6 $, éducation 2,8 $, finance 4,2 $ |
| Short | Environ 3 à 14 % du RPM des vidéos longues, soit environ 0,05 à 0,40 € | [OBSERVÉ] F19 |
| Saisonnalité | Q4 plus élevé ; janvier −30 à −50 % | [ESTIMATION] F24 |

⚠️ **[HYPOTHÈSE]** Depuis le 24 août 2026, les vues comptées dès la première image augmentent le nombre de vues sans augmenter les revenus [F13]. Le **RPM calculé par vue risque de baisser mécaniquement**. Pour comparer des périodes, il vaut mieux suivre le **revenu par heure de visionnage**.

### 6.4 Scénarios de rentabilité (hypothétiques)

Valeur du temps humain retenue : **25 € de l'heure** (convention de calcul).

| Scénario | Heures humaines par vidéo | Coût humain | Vues nécessaires pour couvrir ce coût (RPM 3 €) |
|---|---|---|---|
| Documentaire 12 min, sans pipeline | 25 h | 625 € | ≈ 208 000 |
| Documentaire 12 min, avec pipeline mûr | 8 h | 200 € | ≈ 67 000 |
| Explication animée 8 min, sans pipeline | 50 h | 1 250 € | ≈ 417 000 |
| Explication animée 8 min, avec bibliothèques mûres | 12 h | 300 € | ≈ 100 000 |
| Short décliné d'une vidéo longue | 0,5 h | 12,5 € | ≈ 62 500 (RPM Short 0,20 €) |

**Lecture** :
1. La **publicité seule** rentabilise rarement une vidéo coûteuse sur une petite chaîne. **Réduire les heures par vidéo** (le pipeline) est le levier principal.
2. Une vidéo evergreen continue de rapporter pendant des mois [F18]. Le calcul sur 12 mois est donc plus juste que sur un mois.
3. Les Shorts sont rentables **seulement** quand ils sont déclinés à très faible coût.

### 6.5 Diversifier les revenus

| Source | Quand | Remarque |
|---|---|---|
| **Sponsoring** | Dès quelques milliers de vues régulières dans une niche recherchée | Souvent calculé en CPM sur les vues moyennes [F25] ; peut dépasser la publicité |
| **Affiliation** | Niches liées à des produits (sport, tech, livres) | Liens en description ; mention obligatoire |
| **Abonnements et dons** (membres, Super Thanks) | Dès le niveau d'entrée [F27] | Nécessite un noyau fidèle |
| **Produits propres** (applications, guides, formations) | Quand une audience réclame un outil | Synergie possible avec nos autres projets |
| **Licence de nos animations ou bibliothèques** | Quand le style est reconnu | Revenu hors YouTube |
| **TikTok** | Pour réutiliser les formats verticaux | Programme Creator Rewards : environ 10 000 abonnés et 100 000 vues sur 30 jours, vidéos de plus d'une minute (à confirmer) [F39] |

### 6.6 Risques économiques

| Risque | Parade |
|---|---|
| **Démonétisation de toute la chaîne** pour contenu inauthentique [F30] | Apport éditorial visible dans chaque vidéo ; variations réelles d'une vidéo à l'autre |
| **Revendications ou avertissements pour droits d'auteur** [F34-F37] | Priorité à l'animation et aux médias sous licence ; registre des droits de chaque média utilisé |
| **Dépendance à YouTube seul** | Au moins une source de revenus hors publicité dès que possible |
| **Contenu sensible** (publicité limitée) | Traitement sans images choquantes ; règles assouplies en janvier 2026 [F33] |
| **Coût des outils** (licence Remotion au-delà de 3 salariés [F38], rendu dans le cloud) | Rendu local tant que c'est possible ; prévoir la licence dans le budget dès qu'on grossit |

---

## 7. Automatisation : évaluation par étape

Les gains sont des **estimations relatives [HYPOTHÈSE]**. Chaque automatisation doit être **mesurée** avant et après (critère d'utilité dans la dernière colonne). Le **temps machine** (calcul, rendu) est compté à part.

| Étape | Gain humain estimé | Coût de création | Maintenance | Temps machine | Risque qualité | Doit rester humain | Critère d'utilité |
|---|---|---|---|---|---|---|---|
| **Recherche de sujets** (veille, tendances, questions fréquentes) | Moyen | Faible | Faible | Faible | Faible | Le **choix final** du sujet | Plus de sujets « validés » par heure de recherche |
| **Analyse des opportunités** (vidéos hors norme dans une niche, via l'API) | **Élevé** | Moyen | Moyen (quotas, changements d'API) | Faible | Moyen (données publiques seulement) | L'interprétation | Une meilleure médiane des vues sur les sujets choisis par l'outil que sur les autres |
| **Assistance au script** (plan, recherche de faits, premières versions) | Élevé | Faible | Faible | Faible | **Élevé** (erreurs, ton générique) | **Vérification des faits, angle, voix finale** | Moins d'heures par script **sans** baisse de rétention |
| **Recherche et découpage de médias** (Media Finder) | **Élevé** | Moyen | Moyen | Moyen | Moyen (**droits**) | **Validation des droits** de chaque média | Moins d'heures de recherche ; zéro revendication |
| **Bibliothèques réutilisables** (Audio, VFX, décors) | Élevé à terme | Élevé au départ | Faible | — | Moyen (répétition [F31]) | La variété et la cohérence du style | Part des éléments réutilisés par vidéo, sans hausse des signalements |
| **Animation automatisée** (Animation Studio) | Élevé | **Élevé** | Élevé | **Élevé** (rendu) | Élevé (rendu « générique ») | La direction artistique | Heures **et** minutes de rendu par minute de vidéo finale |
| **Montage Remotion** (Editing Studio) | **Élevé** | Moyen | Moyen | **Élevé** (rendu) | Moyen (rythme mécanique) | Le rythme, les coupes clés | Heures de montage par minute finale ; rétention comparable au montage manuel |
| **Déclinaison en Shorts** | **Très élevé** | Faible | Faible | Moyen | Moyen (accroches faibles) | Le choix des moments et de l'accroche | Coût marginal par Short ; part de Shorts qui dépassent la médiane |
| **Analyse des performances** (rapports automatiques) | Moyen | Faible | Faible | Faible | Faible | Les décisions | Délai entre la publication et la décision |
| **Suivi des expériences** (journal, tableau de bord) | Moyen | Faible | Faible | Faible | Faible | La rigueur du protocole | Décisions documentées à 100 % |

### Mesurer le temps machine (protocole)
Pour chaque vidéo, enregistrer automatiquement :
- la durée de chaque étape de calcul (génération, découpage, rendu) ;
- les **minutes de rendu par minute de vidéo finale**, en local et dans le cloud ;
- le coût du cloud éventuel (Lambda est facturé par AWS en plus de la licence Remotion [F38]).

**Ordre de priorité de l'automatisation [HYPOTHÈSE]** :
1. Déclinaison en Shorts (gain très élevé, faible coût).
2. Analyse des opportunités (meilleurs sujets = levier principal sur les vues).
3. Montage Remotion avec gabarits.
4. Recherche de médias **avec registre des droits**.
5. Animation automatisée : la plus coûteuse à construire. À lancer seulement si les tests montrent que l'animation surperforme les archives (document 5, test H6).

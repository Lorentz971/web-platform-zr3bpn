# Faire ses impôts avec un LLM

*Fiche de conception, octobre 2026*

> Suite de `verticales-llm.md`. Cette fiche décrit une idée de produit, pas un conseil fiscal. Les montants et dispositifs cités sont à vérifier sur impots.gouv.fr et le BOFiP.

---

## 0. Le constat qui change tout : un LLM ne doit **jamais** calculer l'impôt

- **TaxCalcBench (2025)** : les meilleurs modèles calculaient correctement **moins d'un tiers** de déclarations fédérales américaines simples.
- **Benchmark VITA** (*Artificial Intelligence and Law*) : tous les modèles testés (GPT-4, Claude, Llama…) peinent sur les questions qui demandent un **calcul exact et l'application de règles**.
- Aux États-Unis, l'usage explose malgré tout : **26 %** des contribuables ont utilisé l'IA pour leurs revenus 2025, contre 11 % l'année précédente (sondage Adobe ⚠️).
- En France, ⚠️ **65 %** des ménages redouteraient de se tromper dans leur déclaration.

➡️ **La frustration n'est pas « je n'ai pas d'IA pour mes impôts »** : TaxCut, Fiscaly.AI, TaxGenius ou Buddy existent déjà. **C'est « je ne peux pas faire confiance à une IA pour mes impôts ».** C'est sur la confiance qu'on se différencie.

---

### **Fisc Clair** *(nom provisoire)*

**Signal d'origine** :
- Erreurs récurrentes documentées : la case T « parent isolé », jamais préremplie ; le crédit pour frais de garde oublié ; les dons ; les versements PER non reportés ; les pensions alimentaires mal déclarées (Bercy Infos, presse spécialisée).
- La **déclaration automatique** concerne environ 11 M de foyers en 2026 (presse ⚠️). Ces foyers ne relisent rien : **une déclaration automatique, ce sont aussi des oublis automatiques.**
- **Le droit de réclamation** permet de corriger jusqu'au 31 décembre de la 2e année suivant la mise en recouvrement. On peut donc encore récupérer des avantages oubliés sur les revenus 2023, 2024 et 2025.

**JTBD** : *Quand ma situation change (enfant, séparation, garde, dons, travaux, déménagement dans un DOM…) ou quand je reçois mon avis d'imposition, je veux être sûr de ne rien avoir oublié et de ne pas me tromper, pour pouvoir payer le juste impôt sans y passer un week-end ni risquer un redressement.*

---

## 1. CORE

- **Clarté** : les gens perdent de l'argent par **omission** (avantages non réclamés), pas par manque d'optimisation sophistiquée.
- **Objectif unique** : **vérifier, puis récupérer**. Comparer la situation réelle du foyer avec sa déclaration, et récupérer ce qui manque, y compris sur les 3 dernières années.
- **Résolution (mécanisme)** : une **architecture à trois couches où le LLM ne calcule rien** (voir section 3). Le LLM comprend la situation et lit les documents ; un **moteur de règles déterministe** calcule ; chaque conclusion cite **l'article de loi et la ligne de calcul**.
- **Aha moment (< 60 s)** : photographier son **avis d'imposition** → « Vous êtes parent isolé mais la case T n'est pas cochée en 2024. Impôt payé en trop estimé : 1 2xx €. Récupérable jusqu'au 31/12/2027. [Voir le calcul] [Préparer la réclamation] ».

---

## 2. Positionnement

**Profondeur de différenciation** : **structurelle** (LLM + moteur de règles vérifiable + rattrapage sur plusieurs années), avec une base **systémique** : des données agrégées sur les oublis les plus fréquents par profil, qui servent à cibler la détection.

**Carte concurrence** :

| Concurrent | Force | Faiblesse / angle négligé | Taille | Axe laissé ouvert |
|---|---|---|---|---|
| **impots.gouv (DGFiP)** | Gratuit, prérempli, déclaration automatique | N'a aucun intérêt à signaler ce que vous oubliez ; ne revient pas sur le passé | Universel | **Détection des oublis et rattrapage** |
| **ChatGPT / Claude / Gemini** | Gratuits, déjà utilisés | Calculs faux, sources fiscales obsolètes, aucune responsabilité | Massive | **Exactitude prouvée** |
| **TaxCut** | Moteur de plus de 450 dispositifs, lecture des avis | Centré sur la déclaration de l'année ; prix à l'abonnement | Petite | Rattrapage sur 3 ans, prix au résultat |
| **Fiscaly.AI, TaxGenius** | Promesse d'économies | Flou sur les données et la responsabilité (critiques de la presse) | Petite | **Transparence du calcul** |
| **Buddy** | Démarches administratives en général | Fiscalité secondaire, revenus modestes (~70 k€ de CA en 2024) | Très petite | Profondeur fiscale |
| **Experts-comptables / CGP** | Responsabilité, conseil personnalisé | Chers ; ignorent les petits foyers | Grande | Les 30 M de foyers « trop petits » |

**Power visé (7 Powers)** :
- **Counter-positioning** *(immédiat)* : facturer **un pourcentage de l'impôt récupéré**. L'État ne le peut pas. Les logiciels à l'abonnement ne le veulent pas, car ce serait cannibaliser leur revenu récurrent. Les généralistes ne le peuvent pas non plus : ils n'assument aucune responsabilité.
- **Coûts de changement** *(après la 1re année)* : le **coffre fiscal du foyer** (avis, justificatifs, historique de situation sur 3+ années) rend le départ coûteux.
- **Process power** *(long terme)* : la base de règles maintenue, testée sur des cas réels, avec des tests de non-régression à chaque loi de finances.

**Vecteur de percée** : n° 1, **10x meilleur sur une chose qui compte vraiment** : *ne rien oublier, preuves à l'appui*. Ensuite n° 5 : être le meilleur pour résoudre complètement le problème des foyers aux situations atypiques (DOM, familles recomposées, emploi à domicile, frontaliers).

---

## 3. Architecture : le cœur de la différenciation

```
  Documents (avis, attestations, bulletins, reçus de dons)
         │  photo / PDF
         ▼
┌─────────────────────────┐
│ 1. LLM : COMPRÉHENSION  │  extraction structurée (montants, cases),
│    (open-weight, FR)    │  questions de situation en langage naturel
└───────────┬─────────────┘  → produit un JSON « situation du foyer »
            │                  (jamais un montant d'impôt)
            ▼
┌─────────────────────────┐
│ 2. MOTEUR DE RÈGLES     │  calcul déterministe de l'IR, millésimé
│    (OpenFisca)          │  (2023, 2024, 2025…) ; testé ; le même
└───────────┬─────────────┘  moteur open-source que celui de l'État
            │                  et de LexImpact (Assemblée nationale)
            ▼
┌─────────────────────────┐
│ 3. LLM : EXPLICATION    │  « Voici pourquoi » + article du CGI/BOFiP
│    + ACTION             │  cité + delta chiffré ; prépare la
└─────────────────────────┘  correction ou la réclamation
            │
            ▼
   👤 L'utilisateur valide et dépose lui-même sur impots.gouv
```

- **Brique clé : OpenFisca**. C'est le moteur open-source de microsimulation socio-fiscale française, utilisé par des administrations et par LexImpact. Il apporte la **crédibilité** (« même calcul que les outils publics ») et réduit fortement le coût de développement.
- **Différence de calcul comme garde-fou** : on recalcule l'impôt **tel que déclaré** et on le compare au montant de l'avis réel. **Si l'écart dépasse quelques euros, l'extraction est fausse** et on n'affiche rien. C'est une **auto-vérification** qu'aucun chatbot généraliste n'a.
- **Modèle de données central** : `Foyer` → `Situations datées` (mariage, naissance, séparation, résidence DOM…) → `Années fiscales` → `Pièces justificatives` → `Écarts détectés` (avec la règle et l'article cités).
- **Structure** : asynchrone, données **chiffrées côté utilisateur**, hébergées en France. **Aucune connexion automatique à impots.gouv** : on ne stocke jamais les identifiants FranceConnect, c'est l'utilisateur qui dépose.
- **Archétype de marque** : *le vérificateur scrupuleux*. Pas « payez moins d'impôts », mais « **payez le juste impôt** ». Règle produit : **aucun chiffre affiché sans sa démonstration** (bouton « voir le calcul » partout).

---

## 4. Sizing *(ordres de grandeur)*

- **TAM** : environ **40 M de foyers fiscaux** en France.
- **SAM** : les foyers avec au moins un élément « oubliable » (enfants, garde, emploi à domicile, dons, PER, pension alimentaire, frais réels, résidence DOM, changement de situation) : environ **15-20 M**.
- **SOM (24 mois)** : **100-200 k** foyers vérifiés, dont **10-20 k** rattrapages payants.
- **Anti-rétrécissement** : ✅ le mécanisme (vérifier, puis rattraper) est universel. Le **lancement par les DOM** est un **terrain de preuve**, pas une limite. La réduction d'impôt spécifique aux DOM (⚠️ de l'ordre de 30 % plafonnée en Guadeloupe, Martinique et à La Réunion, 40 % en Guyane et à Mayotte, à vérifier au BOFiP) et les situations de mobilité entre DOM et métropole sont mal couvertes par les outils nationaux.

---

## 5. UI/UX

- **Ton visuel** : sobre, ordonné, « relevé bancaire ». Couleurs neutres ; le **vert est réservé aux euros récupérables prouvés**.
- **Onboarding (3 écrans)** :
  1. « Photographiez votre dernier avis d'imposition. »
  2. 5 questions de situation maximum (« En 2024, viviez-vous seul avec vos enfants ? »).
  3. Verdict : ✅ « Rien d'oublié », ou une **liste d'écarts chiffrés avec leur preuve**.
- **Friction volontaire** : l'utilisateur **coche lui-même** chaque correction avant de déposer. Cela sert la responsabilité, et la compréhension.
- **Friction éliminée** : aucune saisie manuelle de montants (tout vient des documents).

---

## 6. Boucle d'engagement

L'impôt est **annuel**, ce qui donne une rétention faible par nature. Il faut créer une raison de revenir **sans spammer** :

- **Hook** :
  - *Déclencheur* : un événement réel (avis reçu en été, ouverture de la campagne en avril, changement de situation signalé : naissance, séparation, déménagement).
  - *Action* : photographier ou répondre à une question.
  - *Récompense variable* : « 0 € oublié » (rassurant) **ou** « 340 € récupérables ».
  - *Investissement* : le coffre fiscal s'enrichit, et la déclaration suivante est pré-vérifiée.
- **Octalysis (2 leviers)** : **accomplissement** (« 3 années vérifiées, 0 écart ») et **évitement de perte** (« le délai de réclamation pour 2023 expire le 31/12/2026 »).
- **Test éthique** : ✅ les urgences affichées sont des **délais légaux réels**. On n'incite jamais à la défiscalisation agressive (pas de produits financiers poussés, pas de commission d'un vendeur de Girardin ou de Pinel). **C'est une règle de marque : zéro rétrocommission.**

---

## 7. Modèle économique

| Offre | Prix | Logique |
|---|---|---|
| **Vérification** | Gratuite | Acquisition. Le « 0 € oublié » rassure et crée la confiance. |
| **Rattrapage** | **20 % des sommes effectivement remboursées** (plafonné), **rien si rien n'est récupéré** | Counter-positioning ; aligné sur le résultat. |
| **Foyer serein** | 29-39 €/an | Pré-vérification de la déclaration annuelle, suivi des changements de situation, coffre fiscal. |
| **B2B2C** | Licence | Employeurs (avantage salarié), mutuelles, banques en ligne, CCAS et associations. |

**Hypothèses vs benchmarks** :
- Conversion freemium vers l'abonnement : **3 %** (médiane de la catégorie : 2-5 %).
- Rattrapage : il ne concerne que les foyers avec un écart détecté (hypothèse **10-15 %** des vérifiés), dont **40 %** passent à l'action, car le gain est concret et sans risque.
- Calcul pour 150 k vérifications : environ 7 k rattrapages × gain moyen hypothétique de 600 € × 20 % ≈ **0,8 M€**, plus environ 4,5 k abonnés × 35 € ≈ 0,16 M€. **Viable comme amorçage, insuffisant seul**. Le B2B2C est nécessaire pour l'échelle.

---

## 8. Risques et angles morts

1. **Monopole du conseil juridique (article 54 de la loi de 1971)** : la consultation juridique **habituelle et rémunérée** pour autrui est réservée aux avocats et, dans leur périmètre, aux experts-comptables. **Une commission sur le rattrapage peut être requalifiée en consultation rémunérée.** Parades :
   - rester un **outil de calcul et d'information** que l'utilisateur pilote (comme un simulateur) ;
   - **ou** adosser le rattrapage payant à un cabinet partenaire (avocat ou expert-comptable) qui valide et signe.
   ➡️ **Consultation d'un avocat obligatoire avant le lancement.** C'est le risque n°1.
2. **Responsabilité en cas d'erreur** : un faux positif entraîne une réclamation rejetée, voire un contrôle. D'où la vérification par différence de calcul, la validation humaine, une assurance RC professionnelle, et un affichage d'un **niveau de confiance**.
3. **L'État améliore le préremplissage** : chaque case que la DGFiP préremplit (ex. une case T demain) réduit le gisement. Le moat ne doit donc pas reposer sur *un* oubli, mais sur le **moteur de comparaison situation ↔ déclaration**.
4. **Saisonnalité** : 70 % de l'activité se concentre entre avril et juin et à la réception des avis. La trésorerie et le support doivent l'absorber.
5. **Données ultra-sensibles** (revenus, situation familiale) : une fuite tuerait la marque. Chiffrement de bout en bout, hébergement en France, **aucune revente de données** (écrit dans les CGU).
6. **Maintenance des règles** : chaque loi de finances impose une mise à jour. OpenFisca mutualise une partie du travail, mais il faut des tests de non-régression sur des cas réels.

---

## 9. Validation (avant toute ligne de code produit)

1. **Test de la phrase** : landing page « **Vérifiez gratuitement vos 3 dernières déclarations. On ne se paie que si vous récupérez de l'argent.** » Mesurer le taux d'envoi d'un avis d'imposition (objectif > 15 % des visiteurs).
2. **Wizard of Oz** : 30 foyers (en commençant par la Guadeloupe et des familles monoparentales) envoient leurs avis. On fait la vérification **à la main** avec OpenFisca et on mesure **la part de foyers avec un écart réel et le montant moyen**. C'est **l'hypothèse qui conditionne tout le modèle**.
3. **En parallèle** : un rendez-vous avec un avocat fiscaliste sur le montage juridique (outil seul ou partenariat cabinet).
4. **Seuil de go** : au moins **10 % des foyers** avec un écart, **plus de 300 € en moyenne**, et un montage juridique validé.

---

## 10. Où ça s'inscrit dans la stratégie

C'est le **même moteur** que *Dossier Vivant* et les verticales prioritaires (**documents → règles → horloge → rédaction → escalade**), avec ici un moteur de règles **déjà existant et public** (OpenFisca). C'est donc probablement la **verticale la moins chère à prototyper**. Le moteur pourra ensuite servir aux **aides sociales non réclamées** (OpenFisca les modélise aussi), le même problème d'omission.

---

## Sources

- [Bercy Infos : principales erreurs de déclaration et droit à l'erreur](https://www.economie.gouv.fr/particuliers/declaration-revenus-quelles-principales-erreurs-eviter-corriger-droit) · [Finalib : 15 erreurs fréquentes 2026](https://finalib.fr/blog/fiscalite/erreurs-frequentes-declaration-impots-2026-corriger) · [Euodia : pièges 2026](https://www.euodia.fr/blog/declaration-dimpots-2026-les-pieges-a-eviter-absolument-cette-annee/)
- [Déclaration automatique 2026 (Bourse Inside)](https://bourseinside.fr/patrimoine/impots-2026-ce-dispositif-permet-a-10-millions-de-foyers-de-declarer-leurs-revenus-sans-rien-faire-faites-vous-partie-des-exclus/) · [Meilleurtaux : qui bénéficie de la déclaration automatique](https://placement.meilleurtaux.com/placement-financier/actualites/2026-mars/impots-2026-qui-beneficie-de-la-declaration-automatique.html) · [MoneyVox : campagne 2026](https://www.moneyvox.fr/impot/actualites/108375/declaration-impots-2026-date-limite-nouveautes-et-mode-emploi-pour-declarer-vos-revenus-2025)
- [TaxCut (L'Essentiel de l'éco)](https://lessentieldeleco.fr/4335-taxcut-mise-sur-lia-pour-simplifier-la-declaration-dimpots/) · [Buddy (L'Essentiel de l'éco)](https://lessentieldeleco.fr/5617-buddy-la-start-up-anti-phobie-administrative/) · [TaxCut, Fiscaly.AI : les limites (Bourse Inside)](https://bourseinside.fr/patrimoine/impots-ces-ia-comme-taxcut-ou-fiscaly-ai-promettent-de-vous-faire-payer-moins-dimpots-mais-ce-detail-peut-vous-couter-tres-cher/) · [Ce que ChatGPT peut vraiment faire pour vos impôts (Bourse Inside)](https://bourseinside.fr/patrimoine/declaration-dimpots-2026-ce-que-chatgpt-et-lia-peuvent-vraiment-faire-pour-vous-et-les-erreurs-qui-peuvent-vous-couter-tres-cher-face-au-fisc/) · [TaxGenius (Creati)](https://creati.ai/fr/ai-tools/taxgenius/)
- [Les LLM induisent les contribuables en erreur par des calculs faux](https://letsdatascience.com/news/llms-mislead-tax-filers-with-calculation-errors-b668afe4) · [Les Américains utilisent l'IA pour leurs impôts](https://letsdatascience.com/news/americans-use-ai-for-tax-preparation-754321f5) · [Benchmark VITA (NSF PAR)](https://par.nsf.gov/biblio/10649839) · [Maintenance de logiciels fiscaux par LLM (arXiv)](https://arxiv.org/pdf/2504.18693)
- [Cour de cassation, 17 févr. 2016 (Dalloz)](https://www.dalloz-actualite.fr/document/civ-1re-17-fevr-2016-f-pb-n-14-26342) · [Cour de cassation, 19 juin 2013 (Dalloz)](https://www.dalloz-actualite.fr/document/civ-1-19-juin-2013-f-d-n-12-20832) · [CA Paris, 25 févr. 2015 (CNB)](https://www.cnb.avocat.fr/sites/default/files/documents/paris_25_fevrier_2015-_altax-harryplast.pdf)
- OpenFisca : [openfisca.org](https://openfisca.org) · [github.com/openfisca/openfisca-france](https://github.com/openfisca/openfisca-france)

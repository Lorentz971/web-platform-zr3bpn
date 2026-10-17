# Les verticales où un LLM gagne

*Analyse et reverse engineering des domaines verticaux, octobre 2026*

> Suite de `reverse-engineering-assistants-ia.md`. Le positionnement retenu : un **agent spécialisé, sur modèle open-weight, qui agit, avec un coût annoncé et une mémoire qui appartient à l'utilisateur**. Ici, on cherche **où** l'appliquer.
> ⚠️ = chiffre issu d'une source secondaire, à vérifier.

---

## 1. Ce que l'IA verticale achète vraiment : du travail, pas du logiciel

La thèse dominante, portée notamment par Bessemer : **l'IA verticale ne se finance pas sur les budgets informatiques, mais sur les budgets de main-d'œuvre**. Un logiciel SaaS vendait un outil à 50 €/mois. Un agent vertical remplace ou démultiplie des heures de travail facturées 50 €/heure. Le marché adressable change d'ordre de grandeur. C'est ce qu'on appelle le *services-as-software*.

**Les preuves en 2026** :

| Acteur | Verticale | Signal |
|---|---|---|
| Harvey | Juridique (grands cabinets) | Valorisé 11 Md$ (mars 2026) ; ⚠️ ~300 M$ d'ARR mi-2026 |
| Legora | Juridique | ⚠️ 100 M$ d'ARR en 18 mois |
| OpenEvidence | Information médicale pour médecins | Valorisé 12 Md$ ⚠️ |
| Abridge / **Nabla** (FR) | Comptes rendus médicaux automatiques | Nabla : ~70 M$ levés en 2025, plus de 130 établissements, intégré aux logiciels de dossier patient |
| Sierra / Decagon | Service client | Sierra valorisé 15 Md$ (mai 2026) ⚠️ ; **facturation au résultat** (~0,50 à 2,50 $ par ticket résolu ⚠️) |
| Cursor / Cognition / Claude Code | Développement logiciel | Cognition : ⚠️ ~490 M$ de run-rate ; Cursor : ⚠️ plusieurs Md$ d'ARR |

---

## 2. Reverse engineering des gagnants : le schéma commun

En démontant Harvey, Abridge/Nabla, Sierra, EvenUp et Cursor, on retrouve **le même schéma en 5 étapes** :

```
1. COIN D'ENTRÉE   Une tâche unique, douloureuse, fréquente, à forte part de texte
                   (Nabla : le compte rendu de consultation ; EvenUp : la lettre
                   de réclamation pour dommages corporels ; Sierra : le ticket N1)
        ↓
2. INTÉGRATION     Se brancher sur le système de référence existant (logiciel de
                   dossier patient, gestion de cabinet, CRM, dépôt Git) : c'est le
                   « dernier kilomètre » que les généralistes ne font pas
        ↓
3. BOUCLE DE DONNÉES  Chaque correction humaine améliore le système
                   (gabarits, règles, cas limites) : moat de données propriétaire
        ↓
4. EXTENSION DU FLUX  Passer de « rédiger » à « exécuter » : commandes, codage,
                   envoi, suivi. On devient le flux de travail lui-même
        ↓
5. PRIX AU RÉSULTAT   Facturer par ticket résolu, dossier traité, note produite,
                   et non par siège : aligné sur la valeur, impossible pour le
                   SaaS historique (counter-positioning)
```

**Ce qui ne marche pas** (les échecs observés) :
- Un « ChatGPT pour [métier] » sans intégration : il se fait absorber par la prochaine version du modèle généraliste.
- Une verticale où **l'erreur coûte plus cher que le temps gagné**, sans humain dans la boucle.
- Un acheteur introuvable : l'utilisateur souffre, mais personne n'a de budget.

---

## 3. La grille de scoring (8 critères, notés de 1 à 5)

| Critère | Question | Pourquoi |
|---|---|---|
| **A. Densité textuelle** | Le travail consiste-t-il surtout à lire, écrire, classer ou extraire des documents ? | C'est le cœur de compétence des LLM |
| **B. Budget de main-d'œuvre** | Combien d'heures payées, et à quel coût, cette tâche consomme-t-elle ? | La taille réelle du marché |
| **C. Vérifiabilité** | Peut-on vérifier vite que le résultat est juste (règle, montant, case remplie) ? | Limite le risque d'hallucination et permet le prix au résultat |
| **D. Tolérance à l'erreur** | Une erreur est-elle rattrapable (brouillon relu) ou catastrophique ? | Conditionne la responsabilité et la vitesse d'adoption |
| **E. Logiciels en place vieillissants** | Le logiciel actuel est-il ancien, fragmenté ou absent ? | Plus c'est archaïque, plus le saut est visible |
| **F. Fragmentation des acheteurs** | Beaucoup de petits acheteurs non servis par les géants ? | Les géants visent les grands comptes et laissent la longue traîne |
| **G. Moat local / réglementaire** | Règles nationales, langue, spécificités locales ? | Protège des acteurs américains |
| **H. Saturation** (inversé) | Combien d'acteurs bien financés sont déjà là ? | 5 = terrain libre |

**Score /40.** Au-dessus de 30 = cible prioritaire pour un petit acteur francophone.

---

## 4. La carte des verticales (28 domaines)

| # | Verticale | A | B | C | D | E | F | G | H | **/40** | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Admin & gestion TPE/artisans** (devis, factures, relances, facture électronique) | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 3 | **35** | 🟢 Ouvert, timing idéal |
| 2 | **Marchés publics, réponse aux appels d'offres PME** | 5 | 4 | 4 | 4 | 4 | 5 | 5 | 3 | **34** | 🟢 Ouvert |
| 3 | **Démarches administratives particuliers** (Dossier Vivant) | 5 | 3 | 4 | 3 | 5 | 5 | 5 | 4 | **34** | 🟢 Ouvert |
| 4 | **Paramédical libéral** (infirmiers, kinés : cotation, facturation, transmissions) | 4 | 4 | 4 | 3 | 5 | 5 | 5 | 4 | **34** | 🟢 Ouvert |
| 5 | **Sinistres et assurance côté assuré** (catastrophes naturelles, cyclones) | 5 | 3 | 4 | 4 | 4 | 5 | 4 | 4 | **33** | 🟢 Ouvert |
| 6 | **Import, douane, octroi de mer (DOM)** | 5 | 3 | 5 | 3 | 4 | 4 | 5 | 5 | **34** | 🟢 Niche locale forte |
| 7 | Associations et subventions (dossiers de financement, bilans) | 5 | 3 | 3 | 4 | 4 | 5 | 4 | 4 | **32** | 🟢 Ouvert, faible capacité à payer |
| 8 | Syndics et gestion locative (AG, sinistres, relances) | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | **31** | 🟢 Ouvert |
| 9 | Litiges de consommation (Passe-Droit) | 5 | 2 | 4 | 4 | 4 | 5 | 4 | 3 | **31** | 🟡 Usage épisodique |
| 10 | Rénovation énergétique (DPE, MaPrimeRénov', CEE) | 4 | 4 | 4 | 3 | 4 | 4 | 5 | 3 | **31** | 🟢 Ouvert |
| 11 | RH et paie TPE (contrats, conventions collectives) | 4 | 4 | 4 | 3 | 3 | 5 | 5 | 2 | **30** | 🟡 Concurrence (Payfit…) |
| 12 | Transport et logistique (documents, litiges transporteurs) | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | **29** | 🟡 |
| 13 | Comptabilité et expertise comptable | 4 | 5 | 5 | 3 | 3 | 3 | 5 | 1 | **29** | 🟡 Saturé (Pennylane…) |
| 14 | Agriculture (PAC, traçabilité, cahiers des charges) | 3 | 3 | 4 | 3 | 4 | 4 | 5 | 4 | **30** | 🟡 Adoption lente |
| 15 | Tourisme et hôtellerie indépendante (avis, réservations, multilingue) | 4 | 3 | 3 | 4 | 3 | 5 | 3 | 3 | **28** | 🟡 |
| 16 | Immobilier (annonces, diagnostics, compromis) | 4 | 4 | 3 | 3 | 3 | 4 | 4 | 2 | **27** | 🟡 Encombré |
| 17 | Formation et éducation (correction, soutien, Qualiopi) | 5 | 3 | 3 | 4 | 3 | 4 | 3 | 2 | **27** | 🟡 Géants présents |
| 18 | Traduction et langues régionales (créole, etc.) | 5 | 2 | 3 | 4 | 3 | 4 | 5 | 4 | **30** | 🟡 Petit marché payant |
| 19 | Maintenance industrielle (manuels, diagnostics) | 4 | 4 | 3 | 2 | 4 | 3 | 3 | 3 | **26** | 🟡 Vente longue |
| 20 | Cybersécurité (tri d'alertes SOC) | 4 | 5 | 3 | 2 | 3 | 2 | 2 | 2 | **23** | 🔴 Saturé, technique |
| 21 | Juridique grands cabinets | 5 | 5 | 3 | 2 | 3 | 1 | 4 | 1 | **24** | 🔴 Harvey, Legora, Doctrine |
| 22 | Comptes rendus médicaux | 5 | 5 | 3 | 2 | 3 | 3 | 4 | 1 | **26** | 🔴 Nabla, Abridge… |
| 23 | Service client (agents N1) | 5 | 5 | 4 | 3 | 3 | 2 | 2 | 1 | **25** | 🔴 Sierra, Decagon, Intercom |
| 24 | Développement logiciel (agents de code) | 5 | 5 | 5 | 3 | 2 | 2 | 1 | 1 | **24** | 🔴 Guerre des géants |
| 25 | Marketing et contenu générique | 5 | 3 | 2 | 5 | 2 | 4 | 1 | 1 | **23** | 🔴 Commodité |
| 26 | Finance de marché, analyse d'investissement | 5 | 5 | 3 | 2 | 2 | 1 | 2 | 1 | **21** | 🔴 Bloomberg, Hebbia, Rogo |
| 27 | Diagnostic médical grand public | 4 | 3 | 1 | 1 | 3 | 5 | 3 | 2 | **22** | ⛔ Piège (responsabilité) |
| 28 | Soutien psychologique / thérapie IA | 5 | 3 | 1 | 1 | 3 | 5 | 2 | 2 | **22** | ⛔ Piège (éthique, risques) |

**Lecture** : les verticales 🔴 sont **excellentes pour les LLM**, mais déjà prises par des acteurs à plusieurs milliards. Les meilleures opportunités pour vous sont celles qui combinent **règles françaises ou locales**, **petits acheteurs nombreux** et **logiciel vieillissant**.

---

## 5. Les 6 verticales prioritaires en détail

### 5.1 🥇 Admin et gestion TPE/artisans : **le copilote de la facture électronique**

**Pourquoi maintenant** : depuis le **1er septembre 2026**, toutes les entreprises assujetties à la TVA, micro-entrepreneurs compris, doivent pouvoir **recevoir** des factures électroniques. L'**émission** devient obligatoire pour les PME/TPE au **1er septembre 2027**. C'est un **changement d'infrastructure** qui fait arriver chez des millions de TPE un **flux de données structurées qui n'existait pas**, ce qui est exactement la matière première d'un agent.

- **JTBD** : *Quand je reçois et envoie des factures, je veux que la paperasse se fasse seule (devis → facture → relance → rapprochement), pour pouvoir passer mon temps sur le chantier.*
- **Mécanisme** : l'artisan dicte un devis à la voix (« salle de bain, 6 m², carrelage… ») → devis conforme → facture électronique conforme → **relances graduées automatiques** → alerte de trésorerie. L'agent lit aussi les factures fournisseurs reçues (anomalies, doublons, hausses de prix).
- **Ne pas faire** : devenir soi-même **plateforme agréée** (lourd, réglementé, occupé par Sage, Cegid, Pennylane…). Se brancher **dessus** par API.
- **Power** : *coûts de changement* (historique client, prix, catalogue) et *counter-positioning* (prix au résultat, par exemple un pourcentage des impayés récupérés, que les éditeurs à l'abonnement ne peuvent pas proposer).
- **Risques** : guerre des prix des éditeurs historiques, qui ajouteront de l'IA ; dépendance aux API des plateformes agréées ; les artisans sont durs à acquérir, donc il faut des canaux (CMA, CAPEB, grossistes, Point.P).

### 5.2 🥈 Marchés publics : **l'agent de réponse aux appels d'offres**

- **Signal** : les PME renoncent aux marchés publics, faute de temps pour lire des dossiers de consultation de 200 pages et rédiger le mémoire technique.
- **Mécanisme** : veille sur les marchés pertinents → **analyse go/no-go** du dossier en 2 minutes (critères, pièces exigées, pièges) → mémoire technique pré-rédigé à partir des références passées de l'entreprise → **liste de pièces manquantes** et rappel des dates.
- **Boucle de données** : les marchés gagnés et perdus, et les notes obtenues, alimentent le moteur. Il apprend ce qui marche **par acheteur public**.
- **Power** : *ressource exclusive* qui se constitue avec le temps (base d'attributions, et données de notation demandées aux acheteurs) ; *coûts de changement* (bibliothèque de références de l'entreprise).
- **Modèle** : abonnement plus **prime au marché gagné**.
- **Risques** : acteurs de veille existants (qui ajoutent de l'IA) ; un mémoire générique fait perdre des points, donc la qualité des données de l'entreprise est critique.

### 5.3 🥉 Paramédical libéral : **le secrétariat invisible de l'infirmier libéral**

- **Signal** : les professionnels libéraux (infirmiers, kinés, orthophonistes) passent une part importante de leur temps sur la cotation des actes, la facturation à l'Assurance maladie, les rejets et les transmissions, souvent le soir.
- **Mécanisme** : transmission vocale après le soin → transmission structurée, **cotation suggérée** (nomenclature), détection des **rejets probables avant envoi**, suivi des impayés.
- **Pourquoi pas Nabla** : Nabla vise les médecins et les établissements. Les libéraux paramédicaux sont une longue traîne fragmentée, avec des logiciels de facturation vieillissants.
- **Power** : *process power* (règles de cotation, motifs de rejet) et *coûts de changement*.
- **Risques** : **données de santé**, donc hébergement certifié HDS obligatoire (coût d'entrée réel) ; responsabilité en cas de cotation erronée (l'humain valide toujours) ; intégration aux logiciels agréés.

### 5.4 Sinistres côté assuré : **l'avocat de poche après la catastrophe**

- **Signal** : après un cyclone, une inondation ou une sécheresse, les sinistrés doivent prouver, chiffrer et relancer, face à des assureurs outillés. Aux Antilles, le risque cyclonique rend le besoin **récurrent et massif**.
- **Mécanisme** : inventaire photo et vidéo guidé (avant et après le sinistre) → estimation chiffrée → déclaration conforme au contrat (l'agent **lit le contrat** et repère franchises, exclusions et délais) → horloge des délais légaux de l'arrêté de catastrophe naturelle → contestation de l'expertise.
- **Lien** : même moteur que *Dossier Vivant* et *Passe-Droit* (dossier, horloge, escalade).
- **Power** : *counter-positioning* (aucun assureur ne financera l'outil qui l'oblige à payer plus) et données d'indemnisation réelles.
- **Risques** : pic d'usage très saisonnier ; frontière avec l'expertise d'assuré, qui est une profession existante (donc s'en faire un partenaire plutôt qu'un concurrent).

### 5.5 Import et douane DOM : **l'expert octroi de mer**

- **Signal** : les importateurs des DOM jonglent avec la douane, l'**octroi de mer** (taxe propre aux DOM, avec des taux variables selon le produit et le territoire), les transitaires et les factures en plusieurs langues.
- **Mécanisme** : on dépose une facture fournisseur (même en anglais ou en espagnol) → classification douanière suggérée → **calcul du coût de revient débarqué** (octroi de mer, TVA, fret) → comparaison avec un achat en métropole.
- **Power** : ***ressource exclusive* locale** (règles et taux DOM que personne ne modélise) ; c'est un terrain où les acteurs américains ne viendront jamais.
- **Risques** : marché adressable petit (à étendre ensuite à toutes les **îles et zones franches**) ; erreurs de classification à conséquences douanières (validation par un transitaire partenaire).

### 5.6 Syndics et copropriétés : **le gestionnaire qui répond**

- **Signal** : la plainte n°1 des copropriétaires envers les syndics est un **syndic qui ne répond pas**. Côté syndic, chaque gestionnaire suit des centaines de lots, sous une avalanche d'e-mails.
- **Mécanisme** : un agent qui trie et répond aux copropriétaires (règlement, procès-verbaux d'AG, sinistres), prépare les AG, suit les devis et les sinistres. **Vendu au syndic** (budget main-d'œuvre), **perçu par le copropriétaire**.
- **Power** : *coûts de changement* (historique de l'immeuble) et *process power*.
- **Risques** : cycle de vente B2B ; logiciels métier en place, d'où une intégration nécessaire.

---

## 6. La plateforme cachée : un seul moteur, plusieurs verticales

En démontant les 6 verticales prioritaires, on retrouve **les mêmes 5 briques** :

| Brique | Admin TPE | Marchés publics | Paramédical | Sinistres | Douane DOM | Syndic |
|---|---|---|---|---|---|---|
| **Ingestion de documents** (photo, PDF, voix) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Moteur de règles locales** (droit, nomenclature, taux) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Horloge et délais** | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Rédaction conforme** (courrier, mémoire, déclaration) | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Escalade et relances** | ✅ | — | ✅ | ✅ | — | ✅ |

**Conséquence stratégique** : on construit **un seul moteur** (« dossier + règles + horloge + rédaction + escalade ») sur un modèle open-weight bon marché, puis on le **déploie verticale par verticale**. Chaque verticale ajoutée coûte un pack de règles et des intégrations, pas un nouveau produit. Le **process power** s'accumule d'une verticale à l'autre. C'est la réponse à la faiblesse identifiée précédemment (« marché de départ étroit »).

---

## 7. Ordre de bataille recommandé

1. **Verticale d'amorçage : admin TPE/artisans (5.1)**. Le timing réglementaire est unique (2026-2027), le marché très vaste, le résultat facile à vérifier (montants, conformité) et le ROI immédiat (impayés récupérés).
2. **Deuxième verticale : marchés publics (5.2)**. Mêmes clients (PME du BTP), donc vente croisée.
3. **Carte locale : douane DOM (5.5) et sinistres (5.4)**. Ce sont des avantages défendables liés aux Antilles, que personne d'autre ne viendra chercher.
4. **Plus tard (données de santé, coût HDS)** : paramédical (5.3), une fois le moteur rentable.

**Validation immédiate (2 semaines)** :
- 10 entretiens avec des artisans (CAPEB, CMA, CCI Guadeloupe) : *combien d'heures par semaine sur devis, factures et relances ? Combien d'impayés ? Êtes-vous prêt pour la réception de factures électroniques ?*
- Prototype « Wizard of Oz » : l'artisan envoie un vocal WhatsApp, et reçoit un devis PDF conforme en 10 minutes (fait à la main au début).
- Critère de succès : **3 artisans sur 10** veulent payer après la première semaine.

---

## Sources

- [Harvey (Sacra)](https://sacra.com/c/harvey/) · [Harvey valorisé 11 Md$ (AI2Work)](https://ai2.work/blog/harvey-raises-at-11b-valuation-vertical-ai-reshapes-professional-services)
- [Bessemer : l'avenir de l'IA est vertical](https://www.bvp.com/atlas/part-i-the-future-of-ai-is-vertical) · [Crunchbase : Bessemer et l'IA verticale](https://news.crunchbase.com/ai/legacy-cloud-evolving-vertical-ai-dholakia-bessemer) · [VC Cafe : IA verticale en 2026](https://www.vccafe.com/vertical-ai-in-2026-the-good-the-bad-and-the-ugly/) · [SaaS Magazine : les agents verticaux mangent le SaaS](https://www.saasmag.com/vertical-ai-agents-eating-horizontal-saas/)
- [Grand View Research : marché de l'IA verticale](https://www.grandviewresearch.com/industry-analysis/vertical-ai-market-report) · [Kings Research](https://www.kingsresearch.com/report/global-vertical-ai-market-3174)
- [Nabla lève 65 M€ (FrenchWeb)](https://www.frenchweb.fr/nabla-leve-65-millions-deuros-pour-transformer-lia-medicale-en-infrastructure-clinique/455513) · [Maddyness : Nabla](https://www.maddyness.com/2025/06/17/ia-nabla-leve-70-millions-de-dollars-pour-passer-la-vitesse-superieure-en-europe/)
- [Sierra valorisé 15 Md$ (AI2Work)](https://ai2.work/blog/sierra-hits-15b-valuation-as-the-enterprise-ai-agent-race-heats-up) · [Tarifs du support IA (Macha)](https://www.getmacha.com/blog/enterprise-ai-customer-support-pricing) · [Tarification au résultat en 2026](https://aiagentrank.io/blog/outcome-based-pricing-in-ai-2026)
- [Cognition à 26 Md$ (Selfemployed)](https://www.selfemployed.com/news/cognition-devin-coding-agent-26b-valuation-2026/) · [Cursor (Wikipedia)](https://en.wikipedia.org/wiki/Cursor_(company)) · [État des agents de code (Amplifying)](https://amplifying.ai/research/state-of-coding-agents)
- [Calendrier de la facture électronique (Cegid)](https://www.cegid.com/fr/facture-electronique-obligatoire/calendrier-facture-electronique/) · [La Poste : calendrier de dématérialisation](https://www.laposte.fr/entreprise-collectivites/actualites/calendrier-dematerialisation-factures-en-est-votre-entreprise) · [CCI Paris IdF : obligations](https://www.entreprises.cci-paris-idf.fr/fiches-pratiques/factures-electroniques-quelles-sont-les-obligations-specifiques)

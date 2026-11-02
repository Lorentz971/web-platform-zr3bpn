# Quels autres logiciels mériteraient une « app avec l'IA intégrée » ?

*2 novembre 2026. Suite de la réflexion sur notre app de montage : une app mobile (puis web), pilotée à la voix, où l'IA **fait** le travail dans l'outil, sans aller-retour entre Claude et un logiciel.*

> **Légende** : [SOURCE] = vu dans une source citée en bas · [HYPOTHÈSE] = à vérifier · [ESTIMATION] = ordre de grandeur.

---

## 1. Le constat de départ (et ce qu'il cache)

**Le signal est réel.** Des gens sans aucune connaissance de Blender construisent des scènes 3D « à la voix » avec Claude. Le connecteur Blender est le plus populaire des connecteurs créatifs (environ 23 000 étoiles sur GitHub) [SOURCE]. D'autres pilotent Ableton (musique) ou Figma (design) de la même façon [SOURCE].

**Mais il y a trois limites, et elles font notre opportunité :**
1. **L'installation est un parcours du combattant** : deux programmes à faire communiquer, des dossiers à copier, des réglages, un seul serveur à la fois [SOURCE, pour Ableton]. Aucun débutant ne passe cette étape.
2. **Les résultats restent simples** : c'est très bon pour préparer une scène ou modifier un fichier, plus faible pour un résultat complexe en une seule demande [SOURCE, retours d'utilisateurs Blender].
3. **On jongle entre deux fenêtres** : l'assistant d'un côté, le logiciel de l'autre. Quand quelque chose ne marche pas, on retourne voir l'assistant et on recommence. C'est exactement votre intuition.

**⚠️ La mauvaise nouvelle : les géants l'ont aussi compris.**
- Photoshop, Adobe Express et Acrobat sont maintenant **directement dans ChatGPT** [SOURCE].
- Un « ChatGPT pour Excel » serait sorti en mars 2026 [SOURCE, à vérifier].
- En France, les logiciels de **devis pour artisans** font déjà la dictée vocale par IA : Obat, Vulko, Mediabat, Artiso [SOURCE].

➡️ **Leçon** : « plus simple, avec l'IA dedans » ne suffit pas. Ce positionnement est cité parmi ceux qui échouent le plus souvent, parce que le leader peut ajouter la même chose en quelques mois. Il faut un **mécanisme que le leader ne peut pas copier facilement**.

---

## 2. Les 4 critères pour choisir un logiciel à « réinventer »

Une catégorie est intéressante si elle coche au moins trois de ces cases :

| Critère | Pourquoi |
|---|---|
| **A. Le logiciel actuel est un outil d'expert sur ordinateur** (3D, CAO, musique, motion design) | Le leader ne peut pas devenir mobile et vocal sans casser son produit (il sert d'abord les pros) |
| **B. Le téléphone apporte quelque chose d'unique** (caméra, scan LiDAR, micro, être sur place) | C'est un vrai mécanisme, pas juste « la même chose sur un petit écran » |
| **C. Le résultat est un objet fini et utile** (une vidéo, une pièce à imprimer, un plan), pas une conversation | On paie pour un résultat, pas pour de l'aide |
| **D. Le résultat reste modifiable** (calques, pistes, cotes) | C'est la différence avec les générateurs « boîte noire » qui donnent un résultat qu'on ne peut que regénérer |

---

## 3. Le tableau des catégories

| Catégorie (logiciel remplacé) | A | B | C | D | Concurrence IA | Verdict |
|---|---|---|---|---|---|---|
| **Pièces pour imprimante 3D** (Fusion 360, Tinkercad) | ✅ | ✅ (photo de la pièce cassée) | ✅ (fichier imprimable) | ✅ (cotes) | Naissante, surtout sur ordinateur | ⭐ **À creuser** |
| **Motion design et animations de données** (After Effects) | ✅ | ⚠️ | ✅ | ✅ | Moyenne (Canva, gabarits CapCut) | ⭐ **Extension de notre app de montage** |
| **Scènes 3D pour non-experts** (Blender) | ✅ | ⚠️ | ✅ | ✅ | Moyenne (Spline, générateurs de modèles 3D) | ✅ Intéressant, techniquement lourd |
| **Musique : un producteur IA sur une vraie table de mixage** (Ableton, FL Studio) | ✅ | ✅ (fredonner, chanter) | ✅ | ✅ | **Forte** (BandLab, Suno) [HYPOTHÈSE] | ⚠️ Marché en train de se remplir |
| **Plans et rénovation** (SketchUp, AutoCAD) | ✅ | ✅ (LiDAR) | ✅ | ✅ | **Forte** (magicplan pour les pros, apps de déco) [SOURCE] | ⚠️ Occupé |
| **Devis et factures pour artisans** | ❌ | ✅ | ✅ | ✅ | **Déjà fait** (Obat, Vulko, Mediabat, Artiso) [SOURCE] | ❌ Trop tard |
| **Tableur, retouche photo, présentations** (Excel, Photoshop, PowerPoint) | ❌ | ❌ | ✅ | ✅ | **Les géants** (Adobe dans ChatGPT, Microsoft) [SOURCE] | ❌ Piège |
| **Domotique et électronique** (Home Assistant, Arduino) | ✅ | ⚠️ | ✅ | ✅ | Faible | ⚠️ Public trop technique et petit [HYPOTHÈSE] |

---

## 4. Fiche complète n° 1 : **Pièce Juste** *(remplacer la CAO pour imprimer une pièce de rechange)*

**Signal d'origine** : le succès des connecteurs qui pilotent des logiciels 3D et CAO montre que des non-experts veulent un résultat 3D sans apprendre l'outil. Les débuts du « texte vers CAO » vont dans le même sens. [HYPOTHÈSE : il faut maintenant chercher des verbatims sur les forums d'impression 3D, par exemple « je ne sais pas modéliser, je veux juste réparer ».]

**JTBD** : *Quand un objet de la maison casse (clip, support, bouton, charnière), je veux obtenir une pièce de remplacement imprimable, pour pouvoir réparer sans savoir modéliser en 3D.*

**CORE**
- **Clarté** : réparer un objet du quotidien sans connaître la CAO.
- **Objectif unique** : photo + voix → fichier imprimable.
- **Résolution** : vous photographiez la pièce cassée à côté d'un objet de taille connue (une pièce de monnaie, une carte bancaire), puis vous dites « le trou fait 6 mm, il faut qu'il s'emboîte ». L'IA construit un modèle **paramétrique**, avec des cotes modifiables par la voix, pas un modèle 3D figé.
- **Expérience** : en moins de 60 s, vous voyez la pièce en 3D, à la bonne taille, et vous dites « un peu plus épais » pour la modifier.

**Positionnement**
- **Profondeur** : **structurelle**. La capture photo à l'échelle, la voix et un modèle à cotes modifiables forment un flux qu'aucun logiciel de CAO actuel ne propose sur téléphone.
- **Carte de la concurrence** :

| Concurrent | Force | Faiblesse | Axe laissé ouvert |
|---|---|---|---|
| Tinkercad | Gratuit, simple | Tout est manuel, sur ordinateur | La capture par photo, la voix |
| Fusion 360 | Puissant | Long à apprendre, réservé aux experts | Les non-experts |
| Bibliothèques de modèles (Printables, Thingiverse) | Des millions de modèles | La pièce exacte manque souvent | Le sur-mesure |
| Outils « texte vers CAO » | L'IA crée la forme | Sur ordinateur, pas de mesure par photo | Le téléphone, l'échelle réelle |

- **Power visé** : **Counter-positioning** (les éditeurs de CAO vendent à des pros et ne vont pas simplifier leur produit au point de le casser), puis une **base de données de pièces** (chaque réparation réussie enrichit les modèles de départ : clip, charnière, support…), qui devient une ressource propre.
- **Vecteur de percée** : 10 fois mieux sur la seule chose qui compte (obtenir *la* pièce exacte), et le meilleur « problem-solver » complet pour ce segment.

**Sizing** [ESTIMATION, à vérifier]
- **TAM** : les possesseurs d'imprimantes 3D grand public et semi-pro dans le monde, de l'ordre de plusieurs millions de foyers.
- **SAM** : ceux qui ne savent pas modéliser, probablement la majorité.
- **SOM** à 3 ans : quelques dizaines de milliers d'utilisateurs payants.
- **Extension naturelle** : ceux qui n'ont **pas** d'imprimante, via l'envoi du fichier à un service d'impression en ligne (un revenu par commande). C'est cette extension qui élargit vraiment le marché.
- **Anti-rétrécissement** : la cible n'est pas « les makers débutants ». C'est un **travail** (réparer un objet), qui concerne tous les foyers.

**Architecture et ADN**
- **Données centrales** : une pièce = forme paramétrique + cotes + photo de référence + historique des versions.
- **Structure** : rendu et calcul dans le cloud ; le téléphone sert à capturer, dicter et visualiser.
- **Archétype** : « le réparateur malin » (pratique, précis, un peu bricoleur), loin d'un logiciel d'ingénieur.

**UI/UX** : 3 écrans au maximum avant le premier résultat (photo → dictée → pièce en 3D). La seule friction volontaire est de confirmer les cotes critiques avant l'impression.

**Boucle d'engagement**
- **Déclencheur** : un objet casse.
- **Action** : une photo.
- **Récompense** : la pièce qui s'emboîte.
- **Investissement** : la pièce rejoint « mes pièces », réimprimable et partageable.
- **Leviers** : accomplissement et créativité.
- **Test éthique** : ✅ aucune mécanique artificielle. Revers honnête : l'usage est ponctuel, la rétention sera faible.

**Modèle économique** : quelques pièces gratuites, puis un abonnement léger ou un paiement à la pièce, plus une commission sur l'impression en ligne. Une conversion freemium réaliste est de 2 à 5 % (médiane de la catégorie) ; l'usage ponctuel pousse plutôt vers le paiement à l'acte.

**Risques et angles morts**
1. **La précision** : une erreur de 1 mm rend la pièce inutile. Les mesures par photo ou LiDAR peuvent se tromper nettement sur des formes complexes [SOURCE, test LiDAR]. Il faudra une vérification au pied à coulisse.
2. **L'usage est rare** : on ne casse pas une pièce chaque semaine. La rétention J30 sera sous la moyenne (4 à 6 %, toutes catégories confondues).
3. **La concurrence « texte vers CAO »** évolue vite et pourrait arriver sur mobile.

**Prochaine étape de validation** : une page qui présente la promesse (« Photographiez, dites la taille, imprimez ») et un test « Magicien d'Oz ». Les 20 premières demandes sont modélisées **à la main** pour mesurer combien de pièces s'emboîtent réellement.

---

## 5. Fiche courte n° 2 : **Studio Motion** *(module de notre app de montage)*

- **L'idée** : « Fais-moi une course de barres des 10 pays les plus riches » ou « une jauge à 87 % avec le logo » dicté dans l'app de montage, et l'animation apparaît **sur la timeline**, modifiable.
- **Pourquoi c'est fort pour nous** : on a déjà construit et testé **69 éléments animés et 14 styles** avec Remotion. Cette bibliothèque est un savoir-faire (*process power*) que des concurrents devraient reconstruire.
- **Pourquoi un module et pas une app** : le résultat finit toujours dans une vidéo. Le séparer recréerait exactement le va-et-vient qu'on veut supprimer.
- **Risque** : Canva et CapCut ont des gabarits animés. Notre avantage doit être les **données** (graphiques justes, à partir d'un tableau ou d'une phrase), pas les simples effets.

## 6. Fiche courte n° 3 : **Scène 3D vocale** *(remplacer Blender pour des besoins simples)*

- **L'idée** : « Une table en bois, une tasse fumante, lumière du matin, caméra qui tourne autour », et on obtient une scène 3D modifiable, rendue en vidéo.
- **Usages** : visuels pour réseaux sociaux, présentation d'un produit, plans d'intro de vidéos.
- **Pour** : forte demande prouvée par l'usage de Blender avec Claude.
- **Contre** : très lourd techniquement (rendu 3D dans le cloud, coût par vidéo). Concurrence de Spline et des générateurs de modèles 3D. Les experts restent sur Blender.

---

## 7. Recommandation

1. **D'abord, renforcer l'app de montage** avec le module **Studio Motion**. C'est le meilleur rapport effort/avantage, parce qu'on a déjà la bibliothèque.
2. **Comme nouvelle app**, **Pièce Juste** est la piste la plus défendable : un vrai mécanisme mobile (photo à l'échelle, voix, cotes modifiables), une concurrence encore surtout sur ordinateur, et un résultat concret. Elle doit d'abord passer le test « Magicien d'Oz » sur la précision.
3. **À éviter** : les devis pour artisans (déjà pris), et tout ce qui touche Excel, Photoshop ou PowerPoint (les géants y sont déjà).

---

## Sources
- [Retours d'utilisateurs Reddit sur Claude et Blender (archives, 2026)](https://reddit.sentinel-team.org/posts/1sy49oi/snapshots/2026-05-02T04%3A50%3A06.954017Z)
- [Claude Market, connecteurs de design (étoiles GitHub)](https://claudemarket.ai/blog/best-design-mcp-servers) · [Shyft, connecteurs créatifs](https://www.shyft.ai/blog/mcp-servers-creative-tools)
- [Guide Ableton MCP 2026 (installation)](https://mcp.directory/blog/ableton-mcp-complete-guide-2026) · [README AbletonMCP](https://cdn.jsdelivr.net/gh/ahujasid/ableton-mcp@main/README.md)
- [TechRadar : Photoshop intégré à ChatGPT](https://www.techradar.com/ai-platforms-assistants/adobe-photoshop-is-now-built-into-chatgpt-for-free-and-you-dont-need-graphic-design-skills-to-use-it) · [Fstoppers](https://fstoppers.com/artificial-intelligence/photoshop-inside-chatgpt-what-works-what-breaks-721331)
- [ChatGPT pour Excel (blog, à vérifier)](https://appalach-ai-d33.pages.dev/blog/chatgpt-for-excel-small-business-finance)
- [Obat, devis par IA](https://www.obat.fr/blog/devis-par-ia/) · [Comparatif des outils IA pour le BTP](https://tensoria.fr/blog/outils-ia-artisans-batiment-comparatif) · [Codeur, comparatif mai 2026](https://www.codeur.com/comparatif/logiciel-facturation-btp)
- [magicplan sur Capterra](https://www.capterra.fr/software/210335/magicplan) · [Test LiDAR de magicplan (2020)](https://mavricresearch.com/2020/11/10/magicplan-now-with-added-lidar-🧂)

"""Glossaire des effets de montage : à quoi sert chaque effet, et comment le refaire dans chaque logiciel.
Sert à la couche « rôles » (rapport) et aux recettes de reproduction."""

G = {
    'coupe sèche': dict(
        role="enchaîner sans pause ; sur un temps, elle donne le rythme",
        refaire=dict(after_effects="couper le calque (Ctrl+Maj+D) sur le temps", davinci="lame (B) sur le temps", capcut="Diviser sur le temps", remotion="nouvelle <Sequence>")),
    'jump cut': dict(
        role="enlever les temps morts d'une même prise ; donne de l'énergie et du rythme à la parole",
        refaire=dict(after_effects="couper puis rapprocher les calques", davinci="Ripple delete des silences", capcut="Diviser + supprimer le silence", remotion="plans successifs de la même source, sans le silence")),
    'coupe avec recadrage': dict(
        role="relancer l'attention sans changer de plan (punch-in à la coupe) ; souligne une phrase",
        refaire=dict(after_effects="Échelle 100 % → 115 % au calque suivant", davinci="Zoom dans l'inspecteur sur le plan suivant", capcut="Agrandir le plan suivant", remotion="scale du plan suivant")),
    'fondu enchaîné': dict(
        role="adoucir, marquer le temps qui passe ou un souvenir",
        refaire=dict(after_effects="opacité croisée", davinci="Cross Dissolve", capcut="Transition « Fondu »", remotion="opacité croisée sur la poignée")),
    'flash blanc': dict(
        role="ponctuer un coup de la musique, cacher la coupe, effet « impact »",
        refaire=dict(after_effects="Solide blanc 2 images, opacité 0→100→0", davinci="Dip to Color blanc 2 images", capcut="Transition « Flash »", remotion="calque blanc 2 images")),
    'fondu au noir': dict(
        role="fermer une partie ou la vidéo, laisser respirer avant la signature",
        refaire=dict(after_effects="Solide noir, opacité 0→100", davinci="Dip to Color noir", capcut="Fondu au noir", remotion="calque noir qui monte")),
    'glissement': dict(
        role="changer de plan en restant dans le mouvement ; dynamique, propre",
        refaire=dict(after_effects="Position X animée sur les deux calques", davinci="Push / Slide", capcut="Transition « Glisser »", remotion="translateX des deux plans")),
    'panoramique filé': dict(
        role="vitesse et énergie ; lie deux plans sur un temps fort",
        refaire=dict(after_effects="Position X + Flou directionnel (Directional Blur)", davinci="Whip pan (Fusion) ou Transform + Motion Blur", capcut="Transition « Whip pan / Flou de mouvement »", remotion="translateX + flou directionnel SVG")),
    'rideau': dict(
        role="révéler le plan suivant comme une page qui tourne ; transition graphique",
        refaire=dict(after_effects="Masque animé ou Linear Wipe", davinci="Edge Wipe", capcut="Transition « Volet »", remotion="clipPath inset animé")),
    'glitch': dict(
        role="tension, bug, effet technologie ; marque un temps fort de façon agressive",
        refaire=dict(after_effects="Décalage RVB + bandes déplacées (Displacement)", davinci="Glitch (Fusion / Resolve FX)", capcut="Effet « Glitch »", remotion="décalage rouge/bleu + translateX saccadé")),
    'zoom de transition': dict(
        role="plonger dans l'image puis en ressortir sur le plan suivant ; énergie, sur le drop",
        refaire=dict(after_effects="Échelle 100→200 % + flou radial, puis 200→100 % sur le plan suivant", davinci="Zoom + Radial blur", capcut="Transition « Zoom »", remotion="scale + blur (sortie / entrée)")),
    'rotation de transition': dict(
        role="effet tourbillon, énergie ; souvent sur un drop",
        refaire=dict(after_effects="Rotation animée + Motion Tile", davinci="Spin (Fusion)", capcut="Transition « Rotation »", remotion="rotate + scale")),
    'transition (autre)': dict(role="transition non identifiée : à regarder sur la frise", refaire={}),
    'changement de fond (sujet détouré)': dict(
        role="garder le héros fixe pendant que son monde défile : résume une carrière en une seconde, monte l'énergie, installe le personnage",
        refaire=dict(after_effects="Rotobrush sur le sujet, plans d'arrière-plan qui changent toutes les 2-4 images en dessous",
                     davinci="Magic Mask sur le sujet (Fusion), fonds en dessous", capcut="Supprimer l'arrière-plan + incrustation au-dessus des fonds",
                     remotion="sujet détouré (calque alpha) au-dessus de plans qui changent")),
    "silhouette (sujet rempli d'une couleur)": dict(
        role="flash centré sur le sujet : marque un temps fort, cache une coupe, fait du sujet une icône (affiche)",
        refaire=dict(after_effects="Rotobrush puis Remplissage blanc sur le masque, 1-3 images", davinci="Magic Mask + Solid Color", capcut="Détourage + filtre « Blanc »", remotion="masque du sujet rempli de blanc")),
    'collage (panneaux qui se posent)': dict(
        role="montrer plusieurs moments à la fois : souvenir, bilan, montée finale ; les angles penchés donnent du dynamisme",
        refaire=dict(after_effects="Calques réduits, rotation ±5°, Position animée sur le temps", davinci="Transform + Rotation par plan (V2, V3…)", capcut="Incrustations avec rotation, entrée « pop »", remotion="cartes penchées qui entrent sur le temps")),
    'rampe de vitesse (velocity)': dict(
        role="figer un instant fort (geste, regard) au ralenti et coller les accélérations aux temps forts de la musique : le cœur d'un edit",
        refaire=dict(after_effects="Remappage temporel + courbes de vitesse (Graph Editor)", davinci="Retime Curve", capcut="Vitesse → Courbe (Montage / personnalisé)", remotion="interpolation du temps source")),
    'ralenti': dict(role="laisser voir un moment fort, émotion", refaire=dict(after_effects="Time Stretch", davinci="Retime 50 %", capcut="Vitesse 0,5×", remotion="playbackRate 0,5")),
    'accéléré': dict(role="énergie, compresser le temps", refaire=dict(after_effects="Time Stretch", davinci="Retime 200 %", capcut="Vitesse 2×", remotion="playbackRate 2")),
    'accélération progressive': dict(role="montée de tension, envol", refaire=dict(after_effects="Remappage temporel", davinci="Retime Curve", capcut="Courbe de vitesse", remotion="interpolation du temps")),
    'marche arrière': dict(role="surprise, rembobinage, effet « regarde encore »", refaire=dict(after_effects="Time Reverse Layer", davinci="Reverse Segment", capcut="Inverser", remotion="lecture inversée")),
    'arrêt sur image': dict(role="figer le moment : présentation du personnage, chute comique, révélation", refaire=dict(after_effects="Freeze Frame", davinci="Freeze Frame", capcut="Figer", remotion="<Still> de l'image")),
    'punch-in': dict(role="souligner un mot, une réaction, un coup de la musique", refaire=dict(after_effects="Échelle +20 % en 4-5 images, ease-out", davinci="Zoom animé", capcut="Images clés de zoom", remotion="scale interpolé ease-out")),
    'poussée lente': dict(role="installer, faire monter la tension doucement", refaire=dict(after_effects="Échelle +10 % sur tout le plan", davinci="Zoom lent", capcut="Animation « Zoom lent »", remotion="scale linéaire")),
    'tremblement': dict(role="impact, chaos, énergie", refaire=dict(after_effects="Wiggle sur la position", davinci="Camera Shake", capcut="Effet « Secousse »", remotion="translate aléatoire")),
    'rotation': dict(role="déséquilibre, dynamisme", refaire=dict(after_effects="Rotation animée", davinci="Rotation dans l'inspecteur", capcut="Images clés de rotation", remotion="rotate")),
    'panoramique': dict(role="suivre ou découvrir", refaire=dict(after_effects="Position animée", davinci="Pan", capcut="Images clés de position", remotion="translateX")),
    'sous-titre': dict(role="faire lire la phrase (son coupé), rythmer, mettre en valeur un mot", refaire=dict(after_effects="Texte animé (échelle/opacité)", davinci="Text+ / sous-titres", capcut="Sous-titres automatiques + style", remotion="composant de sous-titres")),
    'texte derrière le sujet': dict(
        role="donner de la profondeur (texte dans la scène), mettre en valeur une phrase culte au service du héros",
        refaire=dict(after_effects="Texte sous un calque du sujet détouré (Rotobrush)", davinci="Text+ sous le Magic Mask", capcut="Texte + calque du sujet détouré au-dessus", remotion="texte entre le fond et le sujet détouré")),
    'barre de progression': dict(role="faire rester jusqu'au bout (on voit qu'il reste peu)", refaire=dict(after_effects="Forme dont l'échelle X va de 0 à 100 %", davinci="Rectangle animé", capcut="Forme + images clés", remotion="largeur = frame / durée")),
    'sticker / émoji': dict(role="ajouter une émotion, une blague, attirer l'œil", refaire=dict(after_effects="Calque + animation pop", davinci="Image + zoom", capcut="Stickers", remotion="image + spring")),
    'forme (flèche…)': dict(role="montrer quelque chose du doigt", refaire=dict(after_effects="Calque de forme animé", davinci="Fusion shape", capcut="Sticker flèche", remotion="SVG animé")),
    'bandeau': dict(role="présenter une personne, une info", refaire=dict(after_effects="Lower third", davinci="Lower third (Text+)", capcut="Texte + fond", remotion="bandeau animé")),
    'encart / image': dict(role="montrer une preuve, une image, une info en plus", refaire=dict(after_effects="Calque réduit", davinci="Transform", capcut="Incrustation", remotion="image positionnée")),
    "image dans l'image": dict(role="réaction + contenu en même temps", refaire=dict(after_effects="Calque réduit en coin", davinci="Picture in Picture", capcut="Incrustation réduite", remotion="vidéo réduite en coin")),
    'écran partagé': dict(role="comparer, montrer deux choses en même temps", refaire=dict(after_effects="Deux calques recadrés", davinci="Split screen", capcut="Disposition partagée", remotion="deux moitiés")),
}


def role(typ):
    return G.get(typ, {}).get('role')


def refaire(typ):
    return G.get(typ, {}).get('refaire', {})

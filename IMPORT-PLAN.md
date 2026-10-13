# Importer un plan complet (JSON v2)

Dans File → Import JSON, sélectionner `example-plan.json` pour tester un salon de 20 m² avec une porte et une fenêtre. Export JSON enregistre maintenant la géométrie avec l’aménagement. Les imports sont annulables avec Undo et conservés après rechargement. Les anciens JSON sans `plan` restent associés au logement d’origine.

## Format à fournir à Claude

Joindre `example-plan.json` et le plan coté, puis demander :

> Analyse ce plan et produis uniquement un fichier JSON compatible avec cet exemple, version 2, unités mm. Ne devine pas les dimensions illisibles : demande-moi de les confirmer. Les coordonnées x augmentent vers la droite, y vers le bas. Représente les pièces par leurs contours intérieurs. Découpe les murs en rectangles disjoints aux emplacements des portes et fenêtres : les ouvertures ne percent pas automatiquement un mur continu. Utilise uniquement les murs horizontaux ou verticaux. Signale les éléments non représentables. Confirme avec moi la hauteur des murs et les hauteurs/allèges des ouvertures.

## Champs

- `version`: 2 ; `units`: "mm".
- `plan.height`: hauteur générale, 2200 à 6000 mm. Un seul niveau.
- `plan.rooms`: `{id,name,poly,mat,at}`. `poly`: points `[x,y]` dans l’ordre du contour, sans croisement. `at`: point intérieur pour l’étiquette, l’éclairage et le départ de visite de la première pièce. IDs alphanumériques avec `_` ou `-`, uniques.
- `plan.walls`: rectangles `[x0,y0,x1,y1,type]`, x1>x0 et y1>y0. Types `e` extérieur, `n` cloison démontable, `b` porteur identifié par l’utilisateur, `low` muret de 1 m. Aucune déduction automatique du rôle structurel.
- `plan.windows`: `[x0,y0,x1,y1,allège,haut]`. Les deux hauteurs sont mesurées depuis le sol.
- `plan.doors`: `{name,rect,h,c,o,len,height,entry}`. `rect` est le rectangle de réservation ; `h` le point de charnière ; `c` la direction fermée, `o` la direction ouverte (vecteurs perpendiculaires parmi `[1,0],[-1,0],[0,1],[0,-1]`) ; `len` largeur en mm. La charnière et la largeur doivent correspondre à la réservation.
- `plan.slides`: `{rect,v,height}`, `v` vrai pour une réservation verticale sur le plan.
- Matériaux : `wood`, `walnut`, `tile800`, `tile600`, `marble`, `antislip`, `terrazzo`, `carpet`.
- `furniture`: tableau vide ou meubles conformes à un export de l’application (`id,type,name,cx,cy,w,d,rot,color`). Couleur hexadécimale à 6 chiffres.
- `rooms`: réglages par ID (`name,mat`), facultatifs.
- `demolished`: IDs de segments de murs, comme `w0` ; vide par défaut.
- `measures`: mesures `{a:{x,y},b:{x,y}}` ; vide par défaut.

## Limites et contrôle

La validation contrôle les types, bornes et identifiants avant de remplacer le projet, mais ne garantit pas la cohérence architecturale (polygones auto-croisés, chevauchements, exactitude des cotes, passage des portes). Vérifier la 2D avant la 3D. Pas de murs obliques/courbes. Pour plusieurs niveaux, utiliser la version 3 ci-dessous. Les escaliers sont décrits ci-dessous. Les anciennes cotations fixes sont masquées sur les plans importés ; utiliser l’outil de mesure. Les prix des matériaux restent ceux de la démo et doivent être adaptés avant tout usage de devis. Les fichiers sont limités à 5 Mo.

## Escaliers (extension v2)

`plan.stairs` est facultatif. `example-stairs.json` montre un escalier droit et un quart tournant avec palier, chacun montant de 2800 mm. Ces exemples illustrent le format, pas une validation réglementaire.

Chaque escalier contient `id`, `name`, `color` (hexadécimal), et `steps`, ordonnées dans le sens de montée. Chaque marche est `{ "poly": [[x,y], ...], "top": 175 }` : son emprise horizontale et l’altitude de sa face supérieure en mm depuis le sol. Les altitudes doivent augmenter strictement et ne pas dépasser `plan.height + plan.slabThickness`. Un palier est une marche à emprise plus grande. Des polygones triangulaires ou trapézoïdaux permettent les marches tournantes/balancées ; éviter les chevauchements et les contours auto-croisés.

Instruction complémentaire pour Claude : « Décris l’escalier dans plan.stairs, marche par marche avec poly et top. Respecte l’emprise, le sens de montée, le nombre de marches et la hauteur à franchir. Demande les cotes manquantes ; ne remplace pas un escalier balancé par un palier sans accord. »

Affichage 2D avec lignes de marches et flèche de montée ; volumes 3D pleins sous les marches. Import, export, sauvegarde et annulation utilisent ces mêmes données. Pas encore de modification des marches à la souris, garde-corps ou montée en mode promenade. Les trémies et niveaux sont décrits ci-dessous. La vue en coupe tronque les volumes à la hauteur choisie. Pour observer tout l’escalier, utiliser Full walls en vue orbitale.

## Plusieurs niveaux — JSON v3

Voir `example-levels.json` : deux niveaux à 0 et 3000 mm, escalier droit jusqu’à 3000 mm, plafond RDC ouvert et dalle de l’étage percée.

Racine : `{ "version":3, "units":"mm", "activeLevel":"rdc", "levels":[...] }`.
Chaque niveau : `{ "id":"rdc", "name":"RDC", "elevation":0, "plan":{...}, "furniture":[], "rooms":{}, "demolished":[], "measures":[] }`.
Les coordonnées X/Y partagent la même origine pour tous les niveaux. `elevation` est l’altitude du sol fini, en mm. Niveaux dans l’ordre croissant, 12 maximum. Les IDs des meubles/pièces peuvent se répéter entre niveaux.
`plan.height` est la hauteur libre sous plafond ; `plan.slabThickness` est l’épaisseur de dalle sous le sol du niveau (200 mm par défaut). Exemple : RDC hauteur libre 2800, étage altitude 3000 et dalle 200. Les volumes de niveaux ne doivent pas se chevaucher.

Pour une trémie : `holes` dans la pièce du niveau supérieur décrit une liste de polygones découpant son sol/dalle ; `ceilingHoles` dans la pièce du niveau inférieur décrit les polygones découpant son plafond. Ces polygones doivent être simples, entièrement à l’intérieur de la pièce, sans chevauchement. Si une trémie touche une limite, modifier le contour de la pièce plutôt qu’utiliser un trou tangent. Ils doivent être cohérents entre les niveaux. Les surfaces affichées déduisent les trous du sol. Ces ouvertures ne percent pas les murs.

Le sélecteur change le niveau éditable en 2D et en 3D. « Ensemble 3D » superpose les niveaux à leurs altitudes et sert à l’inspection : sélection 3D et promenade désactivées dans cette vue. Décocher pour aménager le niveau actif. L’export conserve tous les niveaux ; les anciens fichiers v2 et JSON historiques restent utilisables.

Limites : pas de création de niveaux par bouton, pas de montée automatique des marches, garde-corps, toiture ou validation constructive. Les plans des niveaux partagent le même cadrage horizontal. Utiliser le zoom/orbite pour inspecter l’ensemble. La cohérence des trémies, escaliers, échappées et structures reste à vérifier.

## Vérification technique

`node tests/import-json.cjs` vérifie le format et sa compatibilité.
Pour `tests/levels.cjs`, installer `jsdom` et `three@0.160.0` dans un répertoire de test puis définir `TEST_NODE_MODULES` vers son `node_modules`. Ce test exécute l’interface via DOM simulé et les géométries Three.js : changements de niveau, mobilier, annulation, sauvegarde, altitudes, escalier jusqu’à l’étage et rayon traversant réellement la trémie. Il ne remplace pas une vérification visuelle WebGL dans un navigateur.

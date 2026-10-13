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

La validation contrôle les types, bornes et identifiants avant de remplacer le projet, mais ne garantit pas la cohérence architecturale (polygones auto-croisés, chevauchements, exactitude des cotes, passage des portes). Vérifier la 2D avant la 3D. Pas de murs obliques/courbes, escaliers ou étages dans cette version. Les anciennes cotations fixes sont masquées sur les plans importés ; utiliser l’outil de mesure. Les prix des matériaux restent ceux de la démo et doivent être adaptés avant tout usage de devis. Les fichiers sont limités à 5 Mo.

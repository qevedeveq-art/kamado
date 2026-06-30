# Kamado Kokko

Application web statique de recettes pour kamado.

URL publique : https://qevedeveq-art.github.io/kamado/

## Utilisation sur iPhone et PC

Ouvrez `index.html` depuis un serveur web ou depuis GitHub Pages. Après le premier chargement, l'application peut être installée comme PWA et fonctionner hors ligne.

Sur iPhone : ouvrez le site dans Safari, utilisez le bouton Partager, puis choisissez `Sur l'écran d'accueil`.

Sur PC : ouvrez le site dans Chrome ou Edge, puis utilisez l'icône d'installation de la barre d'adresse ou le menu du navigateur.

## Données personnelles

Les favoris et notes sont stockés localement dans le navigateur. L'onglet `Données` permet d'exporter une sauvegarde JSON et de l'importer sur un autre appareil.

L'import fusionne les favoris et notes existants au lieu de supprimer les données locales.

L'onglet `Données` permet aussi de générer un code ou un lien de transfert. En ouvrant le lien sur un autre appareil, l'application fusionne automatiquement la sauvegarde locale.

## Organisation

- `Recettes` : cuissons kamado uniquement.
- `Menus` : génération d'un menu complet autour d'une cuisson kamado.
- `Bases` : sauces, rubs et marinades utiles, séparés des recettes principales.

Les fiches affichent une ou plusieurs sauces uniquement quand c'est pertinent. Les nouvelles recettes peuvent définir leurs sauces directement ; les anciennes bénéficient d'une suggestion automatique selon la famille de cuisson et les ingrédients, ou n'affichent rien si une sauce n'apporte pas de valeur.

## Améliorations envisagées

- Filtres saisonniers : printemps, été, automne, hiver/fêtes.
- Liste de courses groupée pour un menu complet.
- Badges piquant et allergènes détectés automatiquement.
- Historique local des dernières recettes consultées.
- Impression/PDF propre depuis chaque fiche recette.

## Prochaines améliorations possibles

- Mode garde-manger avec exclusions d'ingrédients.
- Notation personnelle des recettes.
- Planification de cuisson multi-plats avec rappels.
- Export PDF d'un menu complet.

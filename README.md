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

Chaque fiche recette affiche une sauce associée. Les nouvelles recettes peuvent définir leur sauce directement ; les anciennes bénéficient d'une suggestion automatique selon la famille de cuisson et les ingrédients.

## Améliorations envisagées

- Mode saison : été, automne, hiver, fêtes.
- Liste de courses groupée pour un menu complet.
- Échelle de piquant et allergènes.
- Historique des dernières recettes consultées.
- Impression PDF propre pour cuisiner sans téléphone.

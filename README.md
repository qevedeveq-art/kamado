# Kamado Kokko

![Kamado Kokko Cover](kamado_kokko_cover.jpg)

Application web progressive (PWA) de recettes, d'assistance et de planification pour les amateurs de cuisine au Kamado (Kokko, Big Green Egg, Kamado Joe).

**URL publique** : [https://qevedeveq-art.github.io/kamado/](https://qevedeveq-art.github.io/kamado/)

---

## 🔥 Fonctionnalités Majeures

L'application a été enrichie d'outils interactifs avancés pour offrir une expérience culinaire de premier ordre :

*   **📖 Livre de Recettes Premium &amp; Bases** : 219 recettes classées par familles (Bœuf, Porc, Volaille, Agneau, Poissons, Légumes, Pizzas, Desserts, Sauces &amp; Rubs). Moteur de recherche avancé avec inclusions et exclusions (ex: `poulet citron -gluten`).
*   **📅 Planificateur de Session BBQ (Timeline)** : Indiquez simplement votre heure de repas cible (ex: 13h00) et ajoutez vos recettes. L'application calcule à rebours et planifie chaque étape de votre journée (allumage, stabilisation, enfournement de chaque plat selon sa durée, repos des viandes).
*   **📈 Simulateur de Cuisson Low &amp; Slow** : Visualisez graphiquement l'évolution de la température à cœur de votre viande (Pulled Pork, Brisket, Ribs 3-2-1) sur un graphique SVG interactif modélisant la phase de plateau (*stall*).
*   **🔥 Calculateur de Charbon &amp; Bois** : Obtenez des estimations précises sur la quantité de charbon requise, l'essence et le nombre de morceaux de bois de fumage (*chunks*) ainsi que le réglage de départ des évents selon votre type de viande et le mode de cuisson.
*   **⏱️ Minuteurs multiples avec son de qualité** : Lancez autant de minuteurs que nécessaire. Ils s'affichent sous forme de cercles SVG animés décomptant le temps restant et préviennent par une double alerte sonore professionnelle (Web Audio API) et vibrations à l'échéance.
*   **🍷 Accords Vins &amp; Régimes (Diets)** : Les badges d'allergènes et de régimes (*Sans Gluten, Végétarien, Keto*) ainsi que des suggestions d'accords vins précises et gastronomiques sont automatiquement calculés et affichés pour chaque plat.
*   **🛒 Liste de courses triée par rayons** : Ajoutez des ingrédients depuis n'importe quelle recette pour générer une liste globale. La copie presse-papiers classe automatiquement vos achats par rayons (Boucherie, Fruits &amp; Légumes, Épicerie) au format Markdown compatible avec Obsidian et Apple Notes.
*   **🖨️ Fiche d'Impression Premium avec QR Code** : Imprimez vos recettes ou générez des PDF parfaits, nettoyés de l'interface numérique et équipés d'un QR code dynamique permettant de revenir en un flash à la fiche interactive en ligne.

---

## 📲 Utilisation sur iPhone et PC (PWA)

L'application fonctionne entièrement en mode hors ligne (Offline First) après le premier chargement grâce aux Service Workers.

*   **Sur iPhone** : Ouvrez le site dans Safari, appuyez sur le bouton *Partager*, puis choisissez `Sur l'écran d'accueil`.
*   **Sur PC / Android** : Ouvrez le site dans Chrome ou Edge, puis cliquez sur l'icône d'installation dans la barre d'adresse ou le menu du navigateur.

---

## 💾 Sauvegarde &amp; Synchronisation des Données

Toutes vos données personnelles (favoris, notes libres, notations de recettes) sont stockées localement dans votre navigateur.
L'onglet **Données** vous permet de :
1.  **Exporter** une sauvegarde JSON complète.
2.  **Importer** un fichier pour fusionner vos notes et favoris entre vos appareils sans écraser l'existant.
3.  Générer un **Lien de transfert rapide** (hash) pour synchroniser votre iPhone et votre PC en un clic.

---

## 🛠️ Vérification Qualité &amp; Développement

Avant de publier des modifications sur les recettes ou le code, exécutez le script d'audit des données :

```bash
node scripts/audit-data.js
```

Ce script contrôle la conformité des schémas de données, l'absence de doublons de noms, la compatibilité des modes de cuisson Kamado, la détection des allergènes, piquant et saisons.

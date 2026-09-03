# Chef Reviewer — Gastronomie & Sécurité des Allergènes

## Scope
- Audite la justesse culinaire, la précision des cuissons, et l'exactitude stricte des allergènes (norme européenne 14 allergènes majeurs) pour l'ensemble des recettes du Kamado.

## Contrôles Majeurs
1. **Exactitude des Allergènes :**
   - Aucune fausse alerte (ex. noix de muscade ≠ fruit à coque, noix de coco ≠ fruit à coque, lait de coco végétal ≠ lactose).
   - Aucun oubli (ex. bière = gluten, sauce Worcestershire = poisson/gluten, moutarde dans rubs, soja/miso/tamari, sésame séparé des fruits à coque).
   - Cohérence des filtres diététiques (notamment `sans gluten` et `sans lactose`).

2. **Justesse Culinaire & Sécurité Sanitaire :**
   - Températures à cœur conformes aux règles de sécurité (USDA/FSIS, ThermoWorks, FoodSafety.gov) : volaille ≥ 74 °C, porc ≥ 63 °C, burger ≥ 71 °C.
   - Respect des temps de repos post-cuisson selon les découpes de viande pour redistribution des sucs.
   - Cohérence des accords bois de fumage, assaisonnements et sauces associées.

## Références
- Règlement UE n° 1169/2011 (INCO - 14 allergènes à déclaration obligatoire).
- USDA FSIS Safe Minimum Internal Temperature Chart.
- ThermoWorks Chef-Recommended Temperatures.
- Escoffier / Guide Culinaire pour les techniques classiques.

## Commandes de vérification
- `node scripts/audit-chef.js`
- `node scripts/extract-data.js`
- `node --test 'tests/*.test.js'`

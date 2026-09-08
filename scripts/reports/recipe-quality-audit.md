# Recipe Quality Audit

Generated: 2026-09-08T10:29:34.887Z

## Summary

- Recipes reviewed: 269
- Cooking recipes reviewed: 246
- Clean cooking recipes (no issue/warning): 233
- Issues: 0
- Warnings: 15
- Improvements: 236

## Role Counts

- french-chef-reviewer: 6
- kamado-expert: 108
- marinade-reviewer: 1
- recipe-declutter: 108
- temperature: 28

## Top Findings

- **WARNING** [temperature] Aubergine entière fumée façon steak `phases[0].temp_C`: Phase "Fumage direct" à 220 C hors bande fumage / low and slow. Corriger mode de phase ou température.
- **WARNING** [temperature] Aubergines fumées façon baba ganoush `phases[0].temp_C`: Phase "Fumage direct sur braises" à 220 C hors bande caveman / braises vives. Corriger mode de phase ou température.
- **WARNING** [temperature] Échine marinée à la bière `phases[1].temp_C`: Phase "Réduction marinade" à 100 C hors bande préparation / marinade / pousse. Corriger mode de phase ou température.
- **WARNING** [temperature] Filet mignon fumé au miel `phases[0].temp_C`: Phase "Fumage à froid relatif" à 90 C hors bande fumage à froid. Corriger mode de phase ou température.
- **WARNING** [temperature] Focaccia romarin & gros sel `tempK`: 220 °C sort de la bande pierre / pizza (280-420 C). Vérifier mode/tempK ou préciser la cuisson multi-phase.
- **WARNING** [temperature] Fougasse aux olives `tempK`: 230 °C sort de la bande pierre / pizza (280-420 C). Vérifier mode/tempK ou préciser la cuisson multi-phase.
- **WARNING** [temperature] Giant Skillet Cookie aux pépites de chocolat en poêle fonte `tempK`: 180 °C sort de la bande plancha / cuisson vive (210-300 C). Vérifier mode/tempK ou préciser la cuisson multi-phase.
- **WARNING** [temperature] Mont d'Or / Camembert fumé `tempK`: 180 °C sort de la bande fumage / low and slow (95-135 C). Vérifier mode/tempK ou préciser la cuisson multi-phase.
- **WARNING** [temperature] Pizza al taglio romaine 72h `phases[3].temp_C`: Phase "Cuisson blanche" à 280 C hors bande indirect / rotissage. Corriger mode de phase ou température.
- **WARNING** [temperature] Pizza al taglio romaine 72h `phases[4].temp_C`: Phase "Cuisson garnie" à 280 C hors bande indirect / rotissage. Corriger mode de phase ou température.
- **WARNING** [temperature] Pizza napolitaine `phases[2].temp_C`: Phase "Cuisson" à 400 C hors bande direct / saisie. Corriger mode de phase ou température.
- **WARNING** [temperature] Ribs asiatiques au cinq-épices `phases[1].temp_C`: Phase "Wrap miel+marinade (2 h)" à 110 C hors bande préparation / marinade / pousse. Corriger mode de phase ou température.
- **WARNING** [temperature] Rogan josh d'agneau au Dutch oven `phases[1].temp_C`: Phase "Base masala" à 180 C hors bande direct / saisie. Corriger mode de phase ou température.
- **WARNING** [marinade-reviewer] Tacos al pastor `etapes`: Enzyme crue potentiellement laissée plusieurs heures. Limiter ananas/kiwi/papaye crus à 30 min ou cuire l'enzyme.
- **WARNING** [temperature] Tacos al pastor `phases[1].temp_C`: Phase "Saisie directe" à 180 C hors bande direct / saisie. Corriger mode de phase ou température.
- **IMPROVEMENT** [recipe-declutter] Adana kebab (agneau haché épicé au maras) `equipement`: Équipement trivial: Hachoir couteau. Garder seulement outils kamado ou non évidents.
- **IMPROVEMENT** [recipe-declutter] Ailes de poulet Buffalo `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Asado d'entraña & chimichurri `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Asperges grillées au parmesan `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Asperges grillées au parmesan `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Aubergine entière fumée façon steak `_derived.sauces`: Sauce suggérée absente du catalogue: Laque soja-mirin-gingembre. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Aubergines fumées façon baba ganoush `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt ail-menthe. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Baby back ribs façon Memphis `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Baby back ribs façon Memphis `equipement`: Équipement trivial: Couteau ou cuillère pour membrane. Garder seulement outils kamado ou non évidents.
- **IMPROVEMENT** [recipe-declutter] Baked beans BBQ `equipement`: Équipement trivial: Cuillère longue. Garder seulement outils kamado ou non évidents.
- **IMPROVEMENT** [recipe-declutter] Bar entier grillé au fenouil `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Beef short ribs « dino ribs » `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Beer can cabbage (chou à la bière) `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Beer can cabbage (chou à la bière) `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Beer can cabbage (chou à la bière) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Betteraves rôties en croûte de sel `equipement`: Équipement trivial: Couteau pointu. Garder seulement outils kamado ou non évidents.
- **IMPROVEMENT** [recipe-declutter] Birria de bœuf (tacos) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Bistecca alla Fiorentina (T-bone) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [french-chef-reviewer] Blanquette de veau au kamado `chef_ref.note`: Référence chef trop bavarde. Réduire à une phrase centrée sur la technique.
- **IMPROVEMENT** [recipe-declutter] Bò Lá Lốt (bœuf en feuilles de betel) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Boerewors façon braai `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [french-chef-reviewer] Bœuf bourguignon au kamado `chef_ref.note`: Référence chef trop bavarde. Réduire à une phrase centrée sur la technique.
- **IMPROVEMENT** [recipe-declutter] Brisket fumé (poitrine de bœuf) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Brochettes halloumi & légumes `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Brochettes halloumi & légumes `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Bulgogi (bœuf mariné coréen) `_derived.sauces`: Sauce suggérée absente du catalogue: Ssamjang. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Bulgogi (bœuf mariné coréen) `_derived.sauces`: Sauce suggérée absente du catalogue: Sauce gochujang-sésame. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Bulgogi (bœuf mariné coréen) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Burgers smash maison `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Burnt ends de poitrine de bœuf `_derived.sauces`: Sauce suggérée absente du catalogue: Sauce BBQ épaisse. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Burnt ends de poitrine de bœuf `_derived.sauces`: Sauce suggérée absente du catalogue: jus de cuisson réduit. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Burnt ends de poitrine de bœuf `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Butternut rôtie, sauce tahini `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Butternut rôtie, sauce tahini `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Calamars grillés en persillade `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Canard entier laqué orange-soja `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [temperature] Canard entier laqué orange-soja `phases`: Somme phases 805 min éloignée du temps affiché 1 h 30–1 h 45. Aligner phases et temps affiché, ou expliquer repos/variabilité.
- **IMPROVEMENT** [kamado-expert] Canard laqué croustillant au kamado façon Pékin `_derived.sauces`: Sauce suggérée absente du catalogue: Sauce Hoisin. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Carne asada (tacos mexicains) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Carolina pulled pork (sauce vinaigrée) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Carottes glacées miso-miel `_derived.sauces`: Sauce suggérée absente du catalogue: Laque soja-mirin-gingembre. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Carré d'agneau en croûte d'herbes `_derived.sauces`: Sauce suggérée absente du catalogue: Jus réduit romarin-ail. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Carré d'agneau en croûte d'herbes `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt menthe. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Carré de porc rôti aux herbes `_derived.sauces`: Sauce suggérée absente du catalogue: Sauce moutarde-miel. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Carré de porc rôti aux herbes `_derived.sauces`: Sauce suggérée absente du catalogue: BBQ maison. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [french-chef-reviewer] Cassoulet toulousain au kamado `chef_ref.note`: Référence chef trop bavarde. Réduire à une phrase centrée sur la technique.
- **IMPROVEMENT** [kamado-expert] Cassoulet toulousain au kamado `_derived.sauces`: Sauce suggérée absente du catalogue: Sauce moutarde-miel. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Cassoulet toulousain au kamado `_derived.sauces`: Sauce suggérée absente du catalogue: BBQ maison. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Cassoulet toulousain au kamado `astuce`: Astuce longue pour un usage personnel. Réduire à deux phrases utiles en cuisine.
- **IMPROVEMENT** [recipe-declutter] Cassoulet toulousain au kamado `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Cassoulet toulousain au kamado `equipement`: Équipement trivial: Cuillère en bois pour casser la croûte. Garder seulement outils kamado ou non évidents.
- **IMPROVEMENT** [temperature] Cassoulet toulousain au kamado `phases`: Somme phases 170 min éloignée du temps affiché 3 h (+ trempage haricots 12 h). Aligner phases et temps affiché, ou expliquer repos/variabilité.
- **IMPROVEMENT** [kamado-expert] Champignons portobello farcis `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Champignons portobello farcis `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [recipe-declutter] Chapon/dinde rôti des fêtes `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [recipe-declutter] Chapon/dinde rôti des fêtes `equipement`: Équipement trivial: Lèchefrite/plat. Garder seulement outils kamado ou non évidents.
- **IMPROVEMENT** [recipe-declutter] Char Siu cantonais laqué `astuce`: Astuce longue pour un usage personnel. Réduire à deux phrases utiles en cuisine.
- **IMPROVEMENT** [temperature] Cheesecake fumé `phases`: Somme phases 315 min éloignée du temps affiché 1 h–1 h 15. Aligner phases et temps affiché, ou expliquer repos/variabilité.
- **IMPROVEMENT** [recipe-declutter] Chicken tikka (Inde) `notes_securite`: Notes sécurité longues ou nombreuses. Garder 1-2 points non redondants avec coeur.
- **IMPROVEMENT** [kamado-expert] Chou pointu rôti au beurre noisette `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Chou pointu rôti au beurre noisette `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Chou-fleur entier rôti & tahini `_derived.sauces`: Sauce suggérée absente du catalogue: Tahini-citron. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Chou-fleur entier rôti & tahini `_derived.sauces`: Sauce suggérée absente du catalogue: Yaourt aux herbes. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Choucroute garnie alsacienne au kamado `_derived.sauces`: Sauce suggérée absente du catalogue: Sauce moutarde-miel. Créer la base sauce ou simplifier les suggestions.
- **IMPROVEMENT** [kamado-expert] Choucroute garnie alsacienne au kamado `_derived.sauces`: Sauce suggérée absente du catalogue: BBQ maison. Créer la base sauce ou simplifier les suggestions.

_171 more findings in scripts/reports/recipe-quality-audit.json._

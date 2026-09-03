# Agent Handoff

## Current Status
- Zero-build PWA & native mobile app Kamado upgraded to v31.
- Complete Wine & Sommelier Overhaul (Accords Vins):
  - Enriched with authoritative sommellerie standards: Philippe Faure-Brac (Meilleur Sommelier du Monde 1992, UDSF), Olivier Poussier (Meilleur Sommelier du Monde 2000), Revue du Vin de France (RVF), and Meathead Goldwyn (AmazingRibs wine & BBQ science).
  - Integrated the 5 Golden Laws of BBQ Sommellerie (Maillard vs tannins, oak smoke vs fruit, collagen melting vs acidity, glazes/heat vs residual sugar, and summer outdoor serving temperatures).
  - Created interactive Wine Explorer in "Accords vins" tab with real-time text search and category pills (Bœuf, Porc, Volaille, Agneau, Mer, Pizza, Fromages, Desserts, Bières Craft).
  - Embedded dedicated Sommelier Cards inside each Recipe Modal (`openRecipe`), displaying optimal AOC/cépage, accessible alternative, sommelier notes, and precise serving temperature.
- 46 tests passing natively via `node --test 'tests/*.test.js'`. 0 issues, 0 warnings on Data & Chef audits.
- Service worker bumped to `v31`.

## Last Commands
- `node scripts/extract-data.js`
- `npm test`
- `npm run audit`
- `node scripts/prepare-mobile.js`
- `node scripts/bump-sw-version.js --force`

## Files Changed
- `index.html` (comprehensive wine guide, interactive sommelier explorer, recipe modal sommelier cards)
- `data/vins.html` (regenerated)
- `sw.js` (bumped to `v31`)
- `.agents/handoff.md` (updated handoff)


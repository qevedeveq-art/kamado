# Agent Handoff

## Current Status
- Zero-build PWA & native mobile app Kamado fully universalized and upgraded to v24.
- Complete allergen audit and overhaul:
  - Eliminated the `boeuf` / `oeuf` substring collision that was tagging pure beef recipes (côte de bœuf, tomahawk, brisket, bavette, burgers) with "œuf".
  - Refined detection to check actual preparation ingredients (`r.ings`, `r.sauce`, `r.nom`, `r.cat`) instead of search tags/astuces.
  - Eliminated false positive on `fruits à coque` from `beurre noisette` (brown butter is dairy, not tree nut) and `champignons` (which matched `pignon`).
  - Eliminated false positive on `poisson` from `four à sole` in flammekueche.
- Frontend unification & high-contrast accessibility:
  - Replaced the clashing beige modal sheet with a unified, luxurious, high-contrast Kamado Master Charcoal & Flame dark aesthetic.
  - Upgraded `--txt` to `#fffaf0` and `--muted` to `#cbd4c0` (WCAG AAA contrast > 8.5:1).
  - High-contrast styling for all badges (allergens, mode, temp, coeur, sauce), filter bars, search inputs, tables, and prose guides.
- 46 tests passing natively via `node --test 'tests/*.test.js'`. 0 issues, 0 warnings across all audit scripts.
- Service worker bumped to `v24`.

## Last Commands
- `node scripts/extract-data.js`
- `npm test`
- `npm run audit`
- `node scripts/prepare-mobile.js`
- `node scripts/bump-sw-version.js --force`

## Files Changed
- `index.html` (allergen overhaul, unified dark modal sheet, WCAG AAA contrast tokens)
- `scripts/audit-chef.js` (refined allergen detection, added 2 false-positive guard checks)
- `tests/data.test.js` (added allergen precision assertion test)
- `sw.js` (bumped to `v24`)
- `.agents/handoff.md` (updated handoff)


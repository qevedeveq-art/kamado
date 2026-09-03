# Agent Handoff

## Current Status
- Zero-build PWA Kamado Kokko fully upgraded and validated.
- 247 recipes (226 cooking, 21 sauces/bases) with complete schema, trusted chef references, and rich metadata.
- Allergen exclusion filters integrated in the UI: `sans gluten`, `sans lactose`, `sans porc`, `sans poisson`, `sans fruits à coque`, `végétarien`, `keto`.
- Reverse service timeline (« À table à HH:MM ») dynamically calculates ignition, preheat, intermediate phases, rest, and service.
- Cook Log system integrated: logs date, weather, charcoal brand, actual cook time, core temp, and outcome notes. Included in backup v3 payload.
- Kamado quick calculator implemented: food cut, target temp, duration -> charcoal estimate (kg), vent settings, ignition advice, ideal smoking wood pairing.
- Floating multi-timers upgraded: `+5m` instant extension button, harmonic culinary chime via Web Audio API, and native phone vibration.
- Interactive Meat Doneness Visualizer added in `#temp` with core and pull temperatures, color slice cross-sections, and resting intervals.
- Print / PDF binder layout overhauled with `@media print` (2-column ingredients with checkboxes, crisp typography, clean formatting).
- Burp safety badge and airtight extinction instructions added.
- Ultra-contrast "Plein Soleil" outdoor mode added with instant toggle.
- Interactive substitutions box added directly beneath ingredients.
- 45 tests passing natively via `node --test 'tests/*.test.js'`. 0 issues, 0 warnings across all audit scripts.
- Service worker bumped to `v20`.

## Last Commands
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node scripts/audit-kamado-expert.js`
- `node scripts/audit-chef.js`
- `node scripts/bump-sw-version.js --force`
- `node --test 'tests/*.test.js'`

## Files Changed
- `index.html` (visualizer, burp badge, substitutions, sun mode, print styles)
- `tests/custom-recipes.test.js` (tests for meat doneness & substitutions)
- `sw.js` (bumped to `v20`)
- `data/recipes.json` (extracted & synchronized)
- `.agents/handoff.md` (updated handoff)


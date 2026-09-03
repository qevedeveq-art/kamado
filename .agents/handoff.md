# Agent Handoff

## Current Status
- Zero-build PWA Kamado Kokko fully upgraded and validated.
- 247 recipes (226 cooking, 21 sauces/bases) with complete schema, trusted chef references, and rich metadata.
- Allergen exclusion filters integrated in the UI: `sans gluten`, `sans lactose`, `sans porc`, `sans poisson`, `sans fruits à coque`, `végétarien`, `keto`.
- Reverse service timeline (« À table à HH:MM ») dynamically calculates ignition, preheat, intermediate phases, rest, and service.
- Cook Log system integrated: logs date, weather, charcoal brand, actual cook time, core temp, and outcome notes. Included in backup v3 payload.
- Kamado quick calculator implemented: food cut, target temp, duration -> charcoal estimate (kg), vent settings, ignition advice, ideal smoking wood pairing.
- Floating multi-timers upgraded: `+5m` instant extension button, harmonic culinary chime via Web Audio API, and native phone vibration.
- 43 tests passing natively via `node --test 'tests/*.test.js'`. 0 issues, 0 warnings across all audit scripts.
- Service worker bumped to `v19`.

## Last Commands
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node scripts/audit-kamado-expert.js`
- `node scripts/audit-chef.js`
- `node scripts/bump-sw-version.js --force`
- `node --test 'tests/*.test.js'`

## Files Changed
- `index.html` (CSS, allergen filters, reverse timeline, cook log, calculator, timers)
- `tests/custom-recipes.test.js` (unit tests for timeline, setup, cook logs)
- `tests/data.test.js` (runtime VM context test & chef allergen rules)
- `scripts/audit-chef.js` (culinary safety & 14 EU allergens audit script)
- `.agents/roles/chef.md` (shared role specification for Chef reviewer)
- `.codex/agents/chef.toml` (Codex agent configuration)
- `sw.js` (bumped to `v19`)
- `data/recipes.json` (extracted & synchronized)
- `.agents/handoff.md` (updated handoff)


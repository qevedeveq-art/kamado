# Agent Handoff

## Current Status
- Zero-build PWA & native mobile app Kamado fully universalized (all specific brand references removed; compatible with all ceramic kamados : Big Green Egg, Kamado Joe, Monolith, Primo, The Bastard, etc.).
- 249 recipes (228 cooking, 21 sauces/bases) with complete schema, trusted chef references, and rich metadata.
- Storage keys universalized (`kamado_*` with transparent legacy fallback for existing users).
- App metadata and packaging universalized (`capacitor.config.json` -> `com.kamado.app`, `manifest.webmanifest`, `package.json`).
- Guide tab enriched with « Les 4 Règles d'Or des Communautés Mondiales » (Egghead Forum, Kamado Joe Nation, Pitmaster Club) : Thin Blue Smoke, Catch it on the way up, Coal Basket Stacking, Water Pan demystification.
- « Thin Blue Smoke » safety badge dynamically displayed on all indirect / smoking recipes to prevent acrid creosote.
- Allergen exclusion filters integrated in the UI: `sans gluten`, `sans lactose`, `sans porc`, `sans poisson`, `sans fruits à coque`, `végétarien`, `keto`.
- Reverse service timeline (« À table à HH:MM ») dynamically calculates ignition, preheat, intermediate phases, rest, and service.
- Cook Log system integrated: logs date, weather, charcoal brand, actual cook time, core temp, and outcome notes. Included in backup v3 payload.
- Kamado quick calculator implemented: food cut, target temp, duration -> charcoal estimate (kg), vent settings, ignition advice, ideal smoking wood pairing.
- Floating multi-timers upgraded: `+5m` instant extension button, harmonic culinary chime via Web Audio API, native phone vibration, and Notification API background alerts.
- Interactive Meat Doneness Visualizer in `#temp` with core and pull temperatures, color slice cross-sections, and resting intervals.
- Print / PDF binder layout overhauled with `@media print` (2-column ingredients with checkboxes, crisp typography, clean formatting).
- Burp safety badge and airtight extinction instructions.
- Ultra-contrast "Plein Soleil" outdoor mode with instant toggle.
- Mobile Capacitor configuration added (`capacitor.config.json`, `package.json`, `scripts/prepare-mobile.js`) for native iOS App Store & Android Play Store deployment.
- Security hardened with strict Content Security Policy (CSP) and hybrid IndexedDB + LocalStorage persistence.
- 45 tests passing natively via `node --test 'tests/*.test.js'`. 0 issues, 0 warnings across all audit scripts.
- Service worker bumped to `v23`.

## Last Commands
- `node scripts/extract-data.js`
- `npm test`
- `npm run audit`
- `node scripts/prepare-mobile.js`
- `node scripts/bump-sw-version.js --force`

## Files Changed
- `index.html` (universal branding, universal storage keys with legacy fallback, Crêpes au kamado)
- `manifest.webmanifest` (app name universalized)
- `capacitor.config.json` (appId and appName universalized)
- `package.json` (name and description universalized)
- `README.md` (universal branding)
- `scripts/prepare-mobile.js` (asset sync)
- `sw.js` (bumped to `v23`)
- `.agents/handoff.md` (updated handoff)


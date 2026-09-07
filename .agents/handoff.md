# Agent Handoff

## Current Status
- Zero-build PWA & native mobile app Kamado upgraded to service-worker v37.
- Product roadmap approved on 2026-09-06 and stored in `.agents/memory.md`; product north star is an independent, expert, local-first kamado cooking copilot.
- Phase 0 implemented:
  - 269 explicit recipe IDs, permanent `#recette=<id>` deep links, legacy QR compatibility, canonical sharing and direct opening on startup.
  - Accessible recipe dialog, keyboard focus trap, named filters, semantic recipe cards and reduced-motion handling.
  - Local PWA icons/screenshots, complete install metadata, offline precache and an app-shell performance budget.
  - Chromium smoke test for deep links, QR, focus, offline reload and backup codes.
  - GitHub Actions updated to Node 24/actions v7 plus a scheduled GitHub Pages health check.
  - Remote Google font dependency removed for a faster and fully offline app shell.
- Phase 1 deployed and fully verified in production on 2026-09-07 (`6396b35`):
  - Search engine supports phrases, exclusions, BBQ synonyms, field filters and relevance ranking.
  - Four intent-based pathways are exposed in the recipe hub: first cooks, signatures, low & slow and reference sheets.
  - 269 canonical static recipe pages, one catalogue, four guide pages and one guide index are generated from the app source.
  - `sitemap.xml`, `robots.txt`, canonical/social metadata and honest Schema.org markup are included.
  - `Recipe` rich-result markup is intentionally deferred until representative finished-dish photos exist.
  - CI verifies generated editorial output; Pages health checks cover search, sitemap and a canonical recipe page.
  - Capacitor packaging now includes runtime scripts, icons, assets and the generated editorial library.
- Phase 2 Cook Engine 2.0 implemented and fully verified:
  - Pure, testable runtime module converts structured recipe phases (or recipe steps as fallback) into a guided cook plan.
  - One active session persists locally with step progress, absolute-deadline timer, manual dôme/cœur observations and conservative guidance.
  - Closing or reloading preserves the cook; an app banner and recipe action resume it at the correct point.
  - Completion writes a compatible Journal de Braises entry and clears the active session.
  - Backup schema v4 includes the active session and imports the newest valid session without overwriting a newer local cook.
  - Cockpit has dialog state, keyboard focus containment, explicit abandon/close actions and offline/native packaging.
- Major Feature Suite 3 Deployed:
  - 🚨 SOS & Dépannage Express Kamado (`#sosModal`): Interactive urgent troubleshooter for runaway temperature, dropping heat, acrid white smoke, pizza base burn, long stall, and flashback flare-ups with immediate action plans.
  - 📲 Instant QR Code Sharing (`#qrModal`): Zero-dependency pure JavaScript SVG QR code generator embedded in recipe modals, allowing guests and friends to scan and open any recipe instantly on their devices.
  - ⚖️ Rub Builder & Precision Salt Calculator: Meat weight-based spice and kosher salt calculator enforcing the 1.0–1.1% salt baseline across Texas Dalmatian, Memphis Sweet & Smoky, and Provençal poultry rub profiles.
  - 📖 Mon Journal de Braises: Consolidated global cook journal in Assistant tab gathering all cook logs across recipes with wood used, core temperatures, personal ratings, and notes.
- 73 tests passing natively via `node --test 'tests/*.test.js'`.
- All métier audits plus the PWA performance budget pass (Data, Kamado Expert, Chef Reviewer, Sommelier, app shell).
- Phase 0 production Lighthouse baseline: performance 94, accessibility 100 and best practices 100.
- GitHub Pages incident resolved on 2026-09-06: the repository privacy change had disabled Pages on the current GitHub plan.
- Repository `qevedeveq-art/kamado` is PUBLIC again; Pages publishes from `main` at `/ (root)`.
- Pages deployment #76 completed successfully; `index.html`, `manifest.webmanifest`, and `sw.js` return HTTP 200 at `https://qevedeveq-art.github.io/kamado/`.

## Last Commands
- `node scripts/bump-sw-version.js` (v36 → v37)
- `node --test tests/cook-engine.test.js tests/data.test.js tests/pwa.test.js tests/custom-recipes.test.js` (39/39)
- `NODE_PATH=/private/tmp/kamado-e2e-phase0/node_modules node scripts/browser-smoke.js` (persistent Cook Engine path passed)
- `node scripts/extract-data.js`
- `npm test` (73/73)
- `npm run audit`
- `npm run audit:quality`
- `npm audit` (not applicable: zero-dependency repository has no lockfile)
- `node scripts/audit-editorial.js`
- `node scripts/audit-performance-budget.js`
- `node --test tests/editorial-search.test.js tests/editorial-pages.test.js tests/pwa.test.js tests/data.test.js`
- `npm test` (66/66)
- `npm run audit`
- `npm run audit:quality`
- `NODE_PATH=/private/tmp/kamado-e2e-phase0/node_modules node scripts/browser-smoke.js`
- Headless Chromium visual review of the app hub and canonical recipe page
- GitHub Actions runs `34094119354` (audit) and `34094118090` (Pages), both successful
- Production HTTP checks for the app, expert search, canonical recipe, guide index and sitemap (all 200)

## Files Changed
- Phase 2 runtime/UI: `index.html`, `scripts/cook-engine.js`, `sw.js`.
- Phase 2 verification/packaging: `tests/cook-engine.test.js`, `tests/data.test.js`, `tests/pwa.test.js`, `tests/custom-recipes.test.js`, `scripts/browser-smoke.js`, `scripts/prepare-mobile.js`, `scripts/audit-performance-budget.js`.
- Phase 2 documentation/state: `README.md`, `.agents/memory.md`, `.agents/handoff.md`.
- App shell: `index.html`, `sw.js`, `assets/editorial.css`.
- Editorial generation/search/audit: `scripts/editorial-search.js`, `scripts/generate-editorial-pages.js`, `scripts/audit-editorial.js`, `scripts/extract-data.js`, `scripts/audit-performance-budget.js`, `scripts/browser-smoke.js`.
- Generated discoverability output: `recettes/`, `guides/`, `sitemap.xml`, `robots.txt`.
- Tests and CI: `tests/data.test.js`, `tests/pwa.test.js`, `tests/editorial-search.test.js`, `tests/editorial-pages.test.js`, `.github/workflows/audit.yml`, `.github/workflows/pages-health.yml`.
- Native packaging: `scripts/prepare-mobile.js`.
- Documentation/state: `README.md`, `.agents/memory.md`, `.agents/handoff.md`, `package.json`.

## Next Steps
- Commit and push Phase 2 after the user's explicit authorization, then verify the GitHub Pages workflow and production Cook Engine path.
- Submit/inspect `https://qevedeveq-art.github.io/kamado/sitemap.xml` in Google Search Console if the owner chooses to connect it.

## External Changes
- Changed GitHub repository visibility from private to public after explicit user approval.
- Enabled GitHub Pages from `main` at `/ (root)` after explicit user approval.
- Pushed Phase 1 commit `6396b35` to `main`; audit and Pages deployment completed successfully.

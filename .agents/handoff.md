# Agent Handoff

## Current Status
- Zero-build PWA & native mobile app Kamado upgraded to service-worker v35.
- Product roadmap approved on 2026-09-06 and stored in `.agents/memory.md`; product north star is an independent, expert, local-first kamado cooking copilot.
- Phase 0 implemented:
  - 269 explicit recipe IDs, permanent `#recette=<id>` deep links, legacy QR compatibility, canonical sharing and direct opening on startup.
  - Accessible recipe dialog, keyboard focus trap, named filters, semantic recipe cards and reduced-motion handling.
  - Local PWA icons/screenshots, complete install metadata, offline precache and an app-shell performance budget.
  - Chromium smoke test for deep links, QR, focus, offline reload and backup codes.
  - GitHub Actions updated to Node 24/actions v7 plus a scheduled GitHub Pages health check.
  - Remote Google font dependency removed for a faster and fully offline app shell.
- Major Feature Suite 3 Deployed:
  - 🚨 SOS & Dépannage Express Kamado (`#sosModal`): Interactive urgent troubleshooter for runaway temperature, dropping heat, acrid white smoke, pizza base burn, long stall, and flashback flare-ups with immediate action plans.
  - 📲 Instant QR Code Sharing (`#qrModal`): Zero-dependency pure JavaScript SVG QR code generator embedded in recipe modals, allowing guests and friends to scan and open any recipe instantly on their devices.
  - ⚖️ Rub Builder & Precision Salt Calculator: Meat weight-based spice and kosher salt calculator enforcing the 1.0–1.1% salt baseline across Texas Dalmatian, Memphis Sweet & Smoky, and Provençal poultry rub profiles.
  - 📖 Mon Journal de Braises: Consolidated global cook journal in Assistant tab gathering all cook logs across recipes with wood used, core temperatures, personal ratings, and notes.
- 58 tests passing natively via `node --test 'tests/*.test.js'`.
- All métier audits plus the PWA performance budget pass (Data, Kamado Expert, Chef Reviewer, Sommelier, app shell).
- Lighthouse local baseline after Phase 0: accessibility 100, best practices 100, performance 66 on the uncompressed Python preview; production compression still needs post-deploy measurement.
- GitHub Pages incident resolved on 2026-09-06: the repository privacy change had disabled Pages on the current GitHub plan.
- Repository `qevedeveq-art/kamado` is PUBLIC again; Pages publishes from `main` at `/ (root)`.
- Pages deployment #76 completed successfully; `index.html`, `manifest.webmanifest`, and `sw.js` return HTTP 200 at `https://qevedeveq-art.github.io/kamado/`.

## Last Commands
- `gitleaks git --no-banner --redact --exit-code 1 .`
- `npm run audit`
- `node scripts/audit-recipe-quality.js`
- `npm test`
- `NODE_PATH=<isolated-playwright> node scripts/browser-smoke.js`
- Lighthouse audit against the local preview

## Files Changed
- App shell and data: `index.html`, `data/recipes.json`, `manifest.webmanifest`, `sw.js`, `icons/`, `assets/screenshots/`.
- Link/performance/browser tooling: `scripts/recipe-links.js`, `scripts/audit-performance-budget.js`, `scripts/browser-smoke.js`.
- Tests and CI: `tests/data.test.js`, `tests/recipe-links.test.js`, `tests/pwa.test.js`, `.github/workflows/audit.yml`, `.github/workflows/pages-health.yml`.
- Documentation/state: `README.md`, `.agents/memory.md`, `.agents/handoff.md`, `package.json`.

## External Changes
- Changed GitHub repository visibility from private to public after explicit user approval.
- Enabled GitHub Pages from `main` at `/ (root)` after explicit user approval.

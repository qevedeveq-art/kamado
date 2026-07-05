# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Kamado Kokko is a **zero-build, single-file PWA** for kamado recipes. There is no bundler, no npm install, no framework: `index.html` (~9800 lines) is the source of truth. Everything else in the repo is either **derived from it**, **audits it**, or **serves it offline**.

The only runtime dependency at development time is Node.js (v20 in CI) for the scripts and tests.

## Commands

```bash
# Refresh derived JSON/HTML in data/ from index.html (MUST run after any recipe change)
node scripts/extract-data.js

# Audit dataset (schemas, duplicates, kamado-compatible modes, allergens, spice, seasons)
node scripts/audit-data.js

# Deeper expert audit (food-safety temps, phases, sauces cohérence, sources)
# → writes scripts/reports/kamado-expert-report.json
node scripts/audit-kamado-expert.js

# Full test suite (native Node runner, no framework)
node --test 'tests/*.test.js'

# Run a single test file
node --test tests/data.test.js

# Run a single test by name
node --test --test-name-pattern="phases timeline is well-formed" tests/data.test.js

# Local preview (any static server works, e.g.)
python3 -m http.server 8000
```

CI (`.github/workflows/audit.yml`) runs `extract-data.js` and **fails if `data/` is out of sync with `index.html`** — always commit the regenerated `data/` files with recipe changes.

## Architecture

### Single-file source of truth

`index.html` contains, in order:
- CSS (lines ~1-2950)
- The `<script>` block (lines 2955-9834) which defines:
  - `const CATS = [...]` (line 2957) — category list
  - `const RECIPES = [...]` (line 2959) — the entire recipe dataset (~525 KB)
  - `const GUIDE = \`...\`` (7666), `const TEMP` (7785), `const VINS` (7866) — long-form templates
  - `/* LOGIQUE */` (7940+) — helpers (`saucesFor`, `allergens`, `seasonFor`, `spiceLevel`), rendering (`renderRichSchema` at 8540), planner, timers, shopping list, PWA glue

There is **no module system**. Everything is top-level in one `<script>`. Do not split it without a migration plan — the extract/audit pipeline parses the file with string markers (see below).

### Derived artifacts pipeline

`scripts/extract-data.js` is the pivot. It:
1. Slices `index.html` between literal markers (`const CATS = [`, `/* ================= GUIDE`, `const TEMP = \``, etc.). **These markers are load-bearing** — renaming or reformatting them breaks extraction.
2. `new Function()`-evals the recipes block to get `RECIPES` and `CATS` as real JS values.
3. Re-evals with the helpers block to derive `spice/season/sauces/allergens` per recipe.
4. Writes `data/recipes.json`, `data/categories.json`, `data/{guide,temperatures,vins}.html`.

`scripts/audit-data.js` and the test suite consume `data/*.json`, not `index.html`. If `data/` is stale, they fall back to invoking `extract-data.js` on the fly.

### Rich recipe schema (optional fields)

Base schema: `nom, categorie, ingredients, etapes, cuisson, temps, tempK, astuce`.
Optional enrichment fields (all rendered conditionally by `renderRichSchema`):
`phases[], wrap, brine, marinade_h, repos_min, charbon_kg, difficulty (1..5), vents{bottom,top}, equipement[], substitutions[], erreurs[], notes_securite[], source`.

`scripts/derive.js` mechanically computes `difficulty/vents/charbon_kg/repos_min` from `temps`, `tempK`, `mode`, `cat` — used to bulk-enrich recipes that don't have hand-authored values. Tests in `tests/derive.test.js` pin its behavior; `tests/data.test.js` enforces dataset-wide invariants (unique names, valid categories, ≥200 recipes, all cooking recipes enriched, phases well-formed, difficulty ∈ [1,5], wrap material starts with an allowed family, trusted-chef URL fragments still present in `index.html`).

`scripts/patch-warnings.js` and `scripts/apply-chef-refs.js` are one-off maintenance scripts that mutate `RECIPES` inside `index.html` in place (regex-based). Read them before running — they modify the source of truth.

### Service Worker

`sw.js` implements offline-first with three strategies (networkFirst for navigations, cacheFirst for same-origin assets, staleWhileRevalidate for Google Fonts). **Bump `const VERSION` at the top of `sw.js`** whenever you change `index.html` or app-shell assets — this is how clients get the update.

### Storage & sync

All user data (favorites, ratings, notes, shopping list, session, garde-manger) lives in `localStorage`. The "Données" tab exports/imports JSON and generates hash-based transfer links. There is no backend.

### Kamado expert audit

`.codex/agents/kamado-expert.toml` defines a Codex agent used by `scripts/audit-kamado-expert.js` to enforce food-safety temperatures, phase coherence, and kamado-appropriate cooking modes. Reports land in `scripts/reports/`.

## When editing recipes

1. Edit `RECIPES` inside `index.html`.
2. Run `node scripts/extract-data.js` to refresh `data/`.
3. Run `node scripts/audit-data.js` and `node --test 'tests/*.test.js'`.
4. Commit `index.html` **and** the updated `data/` files together (CI enforces this).
5. If UI or app-shell changed, bump `VERSION` in `sw.js`.

## Importing a recipe from a URL

`node scripts/import-url.js <url>` fetches the page, extracts the `<script type="application/ld+json">` schema.org/Recipe block, maps it onto the Kamado schema with conservative defaults (mode: Indirect, tempK: 180 °C, category-safe `coeur` from USDA/FoodSafety.gov), and appends the recipe just before `];` in the RECIPES array. Flags: `--dry-run` prints the JS literal without writing, `--html <path>` reads local HTML (used by tests).

The full pipeline (import → curate → extract → audit → tests → bump SW) is wrapped by the `/add-recipe` skill (`.claude/skills/add-recipe/SKILL.md`), which delegates kamado-specific enrichment (mode, bois, phases, wrap, notes_securite) to the `kamado-recipe-curator` agent. A PostToolUse hook in `.claude/settings.json` re-runs `extract-data.js` and `bump-sw-version.js` whenever `index.html` is edited by Claude — keep them idempotent.

If a target site has no JSON-LD, the importer errors clearly and stops. Do not hand-scrape HTML from the pipeline.

## When editing UI/logic in `index.html`

Preserve the marker comments (`/* ================= GUIDE ================= */`, `/* ================= LOGIQUE ================= */`, the `const CATS = [` / `const RECIPES = [` / `const GUIDE = \`` prefixes) — the extractor depends on their exact form.

# Agent Instructions

## Project Shape
- Zero-build PWA; `index.html` is the source of truth.
- No package manager or bundler; use Node.js scripts and native `node --test`.
- `data/*.json` and `data/*.html` are derived from `index.html`.
- Preserve extractor markers: `const CATS = [`, `const RECIPES = [`, `const GUIDE = \``, `const TEMP = \``, `/* ================= LOGIQUE`.

## Commands
| Task | Command |
|------|---------|
| Refresh derived data | `node scripts/extract-data.js` |
| Data audit | `node scripts/audit-data.js` |
| Expert audit | `node scripts/audit-kamado-expert.js` |
| All tests | `node --test 'tests/*.test.js'` |
| Single test file | `node --test tests/data.test.js` |
| Single test name | `node --test --test-name-pattern="phases timeline is well-formed" tests/data.test.js` |
| Local preview | `python3 -m http.server 8000` |

## Edit Rules
- Recipe changes: edit `RECIPES` in `index.html`, then run `extract-data`, `audit-data`, and tests.
- Commit `index.html` and regenerated `data/` files together after recipe changes.
- UI/app-shell changes: bump `const VERSION` in `sw.js` with `node scripts/bump-sw-version.js`.
- Do not split `index.html` or rename parser markers without updating `scripts/extract-data.js`.
- Read mutation scripts before use: `scripts/patch-warnings.js`, `scripts/apply-chef-refs.js`.

## Recipe Schema
- Base fields: `nom`, `categorie`, `ingredients`, `etapes`, `cuisson`, `temps`, `tempK`, `astuce`.
- Optional rich fields: `phases`, `wrap`, `brine`, `marinade_h`, `repos_min`, `charbon_kg`, `difficulty`, `vents`, `equipement`, `substitutions`, `erreurs`, `notes_securite`, `source`.
- Cooking recipes must stay kamado-compatible and safety-aware for volaille, poisson, haché, saucisse, salaison, saumure longue, and fumage à froid.

## Shared Agent State
- Cross-CLI memory lives in `.agents/memory.md`.
- Current handoff lives in `.agents/handoff.md`.
- Reusable role specs live in `.agents/roles/`.
- Before substantial work, read memory + handoff; after substantial work, update handoff with status, commands run, files changed, and next steps.
- Networked tools are read-only by default; ask before posting, pushing, publishing, changing third-party resources, or modifying credentials.

## Local Roles
| Role | Codex config | Shared spec |
|------|--------------|-------------|
| Kamado expert | `.codex/agents/kamado-expert.toml` | `.agents/roles/kamado-expert.md` |
| Recipe curator | `.codex/agents/kamado-recipe-curator.toml` | `.agents/roles/kamado-recipe-curator.md` |
| Temperature reviewer | `.codex/agents/kamado-temperature-reviewer.toml` | `.agents/roles/kamado-temperature-reviewer.md` |
| Marinade reviewer | `.codex/agents/marinade-reviewer.toml` | `.agents/roles/marinade-reviewer.md` |
| French chef reviewer | `.codex/agents/french-chef-reviewer.toml` | `.agents/roles/french-chef-reviewer.md` |
| Recipe declutter | `.codex/agents/recipe-declutter.toml` | `.agents/roles/recipe-declutter.md` |

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: (the agent's name and attribution byline)
```

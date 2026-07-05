# Kamado Recipe Curator

## Scope
- Run immediately after `node scripts/import-url.js <url>`.
- Refine the newly appended recipe in `RECIPES` inside `index.html`.

## Edit Fields
- `mode`: one of `Direct`, `Indirect`, `Indirect puis Direct`, `Fumage`, `Braisé`, `Cocotte`, `Pierre`, `Plancha/Fonte`, `Braises directes`.
- `tempK`, `coeur`, `bois`, `phases`, `wrap`, `vents`, `notes_securite`, `erreurs`, `equipement`.

## Constraints
- Preserve `nom`, `ori`, `pour`, `ings`, `etapes`, and `source` from import except minor typo fixes.
- Do not invent references.
- Prefer conservative USDA/FoodSafety.gov targets when unsure.
- If not realistically achievable on a kamado, add a short JS comment to the recipe object and stop.

## Verification
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node --test 'tests/*.test.js'`

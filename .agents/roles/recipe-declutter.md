# Recipe Declutter

## Scope
- Final editorial pass for personal-use recipes after technical reviewers.
- Remove non-essential prose while preserving cooking-critical data.

## Preserve Verbatim
- `nom`, `ori`, `pour`, `cat`, `mode`, `tempK`, `coeur`, `temps`, `bois`, `tags`, `ings`, `etapes`, `source`, `sauce`, `phases`, `difficulty`, `charbon_kg`, `repos_min`, `vents`, `wrap`, `equipement`.

## Trim Fields
- `astuce`: max two short sentences.
- `notes_securite`: max two concise bullets; keep only real safety needs.
- `erreurs`: max three dish- or kamado-specific entries.
- `substitutions`: max three meaningful substitutions.
- `chef_ref`: reduce to `{chef, work, note}`; one sentence note.
- `equipement`: keep non-obvious or kamado-specific items only.

## Constraints
- Do not add fields.
- Delete fields that become empty.
- Do not touch sauce recipes.

## Verification
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node --test 'tests/*.test.js'`

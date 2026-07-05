# Marinade Reviewer

## Scope
- Audit marinades, saumures, brines, rubs, salaisons, and cold-smoking safety.

## Checks
- Marinade timing by protein; acid/enzyme marinades must not overrun texture-safe windows.
- Wet brine salt concentration usually 5-8%; gentle poultry brines may use 3%.
- Dry brine equilibrium target is about 1% salt by meat weight.
- Cold smoking or long charcuterie requires nitrite controls and cold-chain safety.
- Raw marinade must not be reused as sauce without boiling.

## Edit Fields
- `etapes`, `astuce`, `notes_securite`, `ings`.

## Constraints
- Do not add unrelated flavors.
- Keep signature marinades; correct ratios and timing only.
- Keep `notes_securite` to at most two concise bullets.

## Verification
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node --test 'tests/*.test.js'`

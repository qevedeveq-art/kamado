# Kamado Temperature Reviewer

## Scope
- Audit and fix kamado temperatures, doneness targets, phase timing, and mode-temperature coherence.

## Bands
| Mode | Dome temperature |
|------|------------------|
| Fumage / low and slow | 100-130 C |
| Braisé / cocotte | 130-170 C |
| Indirect / rôtissage | 140-220 C |
| Cuisson vive / plancha | 220-280 C |
| Direct / saisie | 250-320 C |
| Pierre / pizza | 320-400 C |

## Constraints
- Do not rewrite `ings`, `etapes`, `nom`, `ori`, `astuce`, or `source`.
- Round numeric temperatures to nearest 5 C and durations to nearest 5 min.
- Prefer safer internal temperatures when ambiguous.

## Verification
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node --test 'tests/*.test.js'`

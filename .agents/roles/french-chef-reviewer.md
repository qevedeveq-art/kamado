# French Chef Reviewer

## Scope
- Audit French classics for authenticity, cuts, technique terms, regional coherence, sauces, and concise chef references.

## Checks
- Correct canonical cuts for bourguignon, daube, blanquette, confit, tartare, pot-au-feu, cassoulet, choucroute, and related classics.
- Correct French kitchen verbs where technique matters: saisir, déglacer, pincer, singer, dégraisser, mouiller, réduire, monter au beurre, chinoiser, dresser.
- Signature accompaniments and wine region coherence.
- French classics should not drift into unrelated American BBQ rubs or sauces.

## Edit Fields
- `etapes`, `astuce`, `substitutions`, `chef_ref`, `sauce`.

## Constraints
- Do not rewrite non-French recipes.
- Preserve `nom`, `ori`, and `ings` quantities unless clearly absurd.
- Keep `chef_ref.note` to one sentence.

## Verification
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node --test 'tests/*.test.js'`

---
name: recipe-declutter
description: Prunes non-essential prose from recipes for personal use. Removes pedagogical padding, duplicated safety citations, chef biographies, and obvious erreurs. Keeps every cooking-critical field. Global review pass — run after temperature/marinade/chef agents.
tools: ["Read", "Edit", "Grep", "Bash"]
model: sonnet
---

# Role

You are the final editorial pass on the RECIPES dataset in `index.html`. This is a **personal-use recipe book**, not a teaching manual. Trim everything that reads like a food-safety course, a chef biography, or a beginner's caveat. Keep exactly what's needed to cook the dish.

## Fields that MUST stay verbatim (never touch)

- `nom`, `ori`, `pour`, `cat`, `mode`, `tempK`, `coeur`, `temps`, `bois`, `tags`, `ings`, `etapes`, `source`, `sauce`, `phases`, `difficulty`, `charbon_kg`, `repos_min`, `vents`, `wrap`, `equipement`

Never delete a recipe. Never touch the ingredient list or cooking steps.

## Fields to trim

### `astuce`
- Cap at **2 sentences, ≤ 220 characters**.
- Keep only the technique/tip that isn't already in `etapes`.
- Drop generalities ("veillez à bien saler", "utilisez de bons ingrédients").
- Drop "sur kamado la plus-value vs four…" prose — the user knows they're on a kamado.

### `notes_securite`
- Keep at most **2 bullets**, each ≤ 120 characters.
- Merge duplicate USDA citations across recipes into a single sentence like `"Volaille : 74 °C à cœur (USDA)"`.
- Delete notes that repeat information already in `coeur` (e.g. `coeur: "74 °C"` and `notes_securite: "cuire à 74 °C"`).
- Keep only if food-safety-sensitive (volaille, poisson, haché, saucisse, salaison, fumage à froid).

### `erreurs`
- Cap at **3 entries**, each ≤ 80 characters.
- Delete obvious ones ("ne pas brûler", "ne pas trop cuire").
- Keep only kamado-specific or dish-specific mistakes (e.g. "ouvrir le couvercle pendant le stall", "trancher chaud sans repos").

### `substitutions`
- Cap at **3 entries**.
- Delete common items (beurre → margarine, thym → thym citron).
- Keep only substitutions that change the recipe's identity (paleron → joue de bœuf) or handle real allergies (lactose, gluten).

### `chef_ref`
- Reduce to `{chef, work, note}` where `note` is **one sentence** anchored on the specific technique this recipe uses.
- Delete multi-paragraph biographies. Delete "codification bocusienne de…" flourishes.
- If `note` just says "grand chef français", drop the whole `chef_ref` object.

### `equipement`
- Cap at **4 items**. Drop trivial items (couteau, planche, saladier, poêle) — assumed to be in every kitchen.
- Keep only kamado-specific and non-obvious tools: sonde à cœur, papier boucher, glacière, pierre à pizza, Dutch oven, planche cèdre, plancha, thermomètre laser.

## Global rules

- **Do not add fields.** Only shrink or delete.
- If a trimmed field becomes empty, delete the field itself (not `astuce: ""`).
- Preserve exact numeric values everywhere.
- Do not touch recipes in `cat === "sauces"` — they're already short.

## Verification

```bash
node scripts/extract-data.js
node scripts/audit-data.js
node --test 'tests/*.test.js'
```

The tests enforce dataset invariants — if you trim too aggressively, they'll catch missing `notes_securite` on volaille or `wrap.materiau` prefix. Fix by re-adding the minimum required.

## Output

- Total recipes scanned : N
- Recipes trimmed : N
- Characters saved (approx) : N
- Fields deleted (count by field name)
- Any recipe where trimming was rejected (why : safety-required, only field present, etc.)

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const RECIPES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "recipes.json"), "utf8"));
const CATS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "categories.json"), "utf8"));

test("dataset has expected scale", () => {
  assert.ok(RECIPES.length >= 200, `expected >=200 recipes, got ${RECIPES.length}`);
});

test("every recipe has a unique name", () => {
  const seen = new Map();
  for (const [i, r] of RECIPES.entries()) {
    if (seen.has(r.nom)) {
      assert.fail(`duplicate "${r.nom}" at index ${i} (first at ${seen.get(r.nom)})`);
    }
    seen.set(r.nom, i);
  }
});

test("every recipe references a known category", () => {
  const ids = new Set(CATS.map(c => c.id));
  for (const r of RECIPES) {
    assert.ok(ids.has(r.cat), `unknown category "${r.cat}" in "${r.nom}"`);
  }
});

test("all cooking recipes are enriched (rich schema coverage)", () => {
  const RICH_FIELDS = ["phases", "vents", "wrap", "brine", "marinade_h", "repos_min", "charbon_kg", "difficulty", "equipement", "substitutions", "erreurs", "notes_securite", "source"];
  const cooking = RECIPES.filter(r => r.cat !== "sauces");
  const enriched = cooking.filter(r => RICH_FIELDS.some(f => r[f] != null));
  assert.equal(enriched.length, cooking.length, `${cooking.length - enriched.length} cooking recipes are not enriched`);
});

function operationalQualityScore(r) {
  const steps = Array.isArray(r.etapes) ? r.etapes : [];
  const ingredients = Array.isArray(r.ings) ? r.ings : [];
  const joinedSteps = steps.join(" ");
  return [
    ingredients.length >= 3,
    steps.length >= 4,
    !!r.coeur || /doré|tendre|nacré|sonde|flocon|prise|souple/i.test(joinedSteps),
    !!r.tempK && !!r.mode && !!r.bois,
    !!r.temps && r.repos_min != null && r.charbon_kg != null,
    Array.isArray(r.phases) && r.phases.length > 0,
    Array.isArray(r.erreurs) && r.erreurs.length > 0,
    !!r.source
  ].filter(Boolean).length;
}

test("all cooking recipes have enough operational detail to cook from", () => {
  const weak = RECIPES
    .filter(r => r.cat !== "sauces")
    .map(r => ({ name: r.nom, score: operationalQualityScore(r) }))
    .filter(r => r.score < 5);
  assert.deepEqual(weak, []);
});

test("phases timeline is well-formed when present", () => {
  for (const r of RECIPES) {
    if (!r.phases) continue;
    assert.ok(Array.isArray(r.phases) && r.phases.length > 0, `${r.nom}: phases must be a non-empty array`);
    for (const [i, p] of r.phases.entries()) {
      assert.ok(typeof p.name === "string" && p.name.length, `${r.nom}: phase[${i}].name`);
      assert.ok(typeof p.mode === "string" && p.mode.length, `${r.nom}: phase[${i}].mode`);
      assert.ok(typeof p.temp_C === "number" && p.temp_C >= 0, `${r.nom}: phase[${i}].temp_C`);
      assert.ok(typeof p.duration_min === "number" && p.duration_min >= 0, `${r.nom}: phase[${i}].duration_min`);
    }
  }
});

test("difficulty is always between 1 and 5", () => {
  for (const r of RECIPES) {
    if (r.difficulty == null) continue;
    assert.ok(Number.isInteger(r.difficulty) && r.difficulty >= 1 && r.difficulty <= 5,
      `${r.nom}: difficulty=${r.difficulty}`);
  }
});

test("wrap material is from the allowed list", () => {
  const ALLOWED = new Set(["papier boucher", "alu", "papier sulfurisé"]);
  for (const r of RECIPES) {
    if (!r.wrap) continue;
    assert.ok(ALLOWED.has(r.wrap.materiau), `${r.nom}: wrap.materiau="${r.wrap.materiau}"`);
  }
});

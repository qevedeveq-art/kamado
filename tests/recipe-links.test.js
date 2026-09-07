"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  recipeSlug,
  recipeRef,
  recipeHash,
  recipeUrl,
  parseRecipeHash,
  findRecipeIndex
} = require("../scripts/recipe-links.js");

const RECIPES = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "recipes.json"), "utf8")
);

test("recipeSlug normalizes French names into readable URL slugs", () => {
  assert.equal(recipeSlug("Côte de bœuf reverse-sear"), "cote-de-boeuf-reverse-sear");
  assert.equal(recipeSlug("Crème brûlée — façon Kamado"), "creme-brulee-facon-kamado");
});

test("every built-in recipe exposes a unique permanent id", () => {
  const ids = RECIPES.map(recipeRef);
  assert.equal(new Set(ids).size, RECIPES.length);
  for (const [index, id] of ids.entries()) {
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${RECIPES[index].nom}: invalid id`);
    assert.equal(RECIPES[index].id, id, `${RECIPES[index].nom}: id must be explicit`);
  }
});

test("recipeHash and recipeUrl point to the permanent recipe id", () => {
  const recipe = { id: "cote-de-boeuf-reverse-sear", nom: "Côte de bœuf reverse-sear" };
  assert.equal(recipeHash(recipe), "#recette=cote-de-boeuf-reverse-sear");
  assert.equal(
    recipeUrl(recipe, { origin: "https://example.test", pathname: "/kamado/" }),
    "https://example.test/kamado/#recette=cote-de-boeuf-reverse-sear"
  );
});

test("parseRecipeHash supports permanent and legacy QR links", () => {
  assert.deepEqual(parseRecipeHash("#recette=cote-de-boeuf-reverse-sear"), {
    kind: "id",
    value: "cote-de-boeuf-reverse-sear"
  });
  assert.deepEqual(parseRecipeHash("#recipe-C%C3%B4te%20de%20b%C5%93uf"), {
    kind: "legacy-name",
    value: "Côte de bœuf"
  });
  assert.equal(parseRecipeHash("#sync=abc"), null);
  assert.equal(parseRecipeHash("#recette=%E0%A4%A"), null);
});

test("findRecipeIndex resolves id and legacy name without fuzzy collisions", () => {
  const recipes = [
    { id: "cote-de-boeuf", nom: "Côte de bœuf" },
    {
      id: "cote-de-boeuf-fumee",
      nom: "Côte de bœuf fumée maison",
      _orig: { nom: "Côte de bœuf fumée" }
    }
  ];
  assert.equal(findRecipeIndex(recipes, { kind: "id", value: "cote-de-boeuf" }), 0);
  assert.equal(findRecipeIndex(recipes, { kind: "legacy-name", value: "Côte de bœuf fumée" }), 1);
  assert.equal(findRecipeIndex(recipes, { kind: "legacy-name", value: "Côte de bœuf fumée maison" }), 1);
  assert.equal(findRecipeIndex(recipes, { kind: "id", value: "inconnue" }), -1);
});

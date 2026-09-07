"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseSearchQuery,
  matchesRecipeQuery,
  scoreRecipeQuery
} = require("../scripts/editorial-search.js");

const RECIPES = [
  {
    nom: "Brisket texan low & slow",
    cat: "boeuf",
    mode: "Fumage lent indirect",
    bois: "Chêne ou hickory",
    tempK: "110 °C",
    coeur: "94 °C",
    ings: ["Poitrine de bœuf", "Poivre noir", "Sel"],
    source: "Aaron Franklin"
  },
  {
    nom: "Travers de porc Memphis",
    cat: "porc",
    mode: "Fumage lent indirect",
    bois: "Pommier",
    tempK: "120 °C",
    coeur: "92 °C",
    ings: ["Travers de porc", "Paprika", "Cassonade"],
    source: "Steven Raichlen"
  },
  {
    nom: "Saumon sur planche de cèdre",
    cat: "poisson",
    mode: "Indirect",
    bois: "Cèdre",
    tempK: "180 °C",
    coeur: "52 °C",
    ings: ["Saumon", "Citron", "Aneth"],
    source: "Big Green Egg"
  }
];

test("parseSearchQuery separates phrases, exclusions and expert filters", () => {
  assert.deepEqual(parseSearchQuery('"low slow" -porc mode:fumage bois:chene'), {
    terms: ["low slow"],
    excluded: ["porc"],
    filters: [
      { field: "mode", value: "fumage", excluded: false },
      { field: "wood", value: "chene", excluded: false }
    ]
  });
});

test("matchesRecipeQuery supports barbecue synonyms and exclusions", () => {
  assert.equal(matchesRecipeQuery(RECIPES[1], "ribs"), true);
  assert.equal(matchesRecipeQuery(RECIPES[0], "poitrine -porc"), true);
  assert.equal(matchesRecipeQuery(RECIPES[1], "fumage -porc"), false);
});

test("matchesRecipeQuery scopes category, mode, wood, source and ingredient filters", () => {
  assert.equal(matchesRecipeQuery(RECIPES[0], "cat:boeuf mode:fumage bois:chene"), true);
  assert.equal(matchesRecipeQuery(RECIPES[2], "ingredient:citron source:egg temp:180"), true);
  assert.equal(matchesRecipeQuery(RECIPES[0], "-cat:porc source:franklin"), true);
  assert.equal(matchesRecipeQuery(RECIPES[1], "-cat:porc"), false);
});

test("scoreRecipeQuery ranks a title match above an ingredient-only match", () => {
  assert.ok(scoreRecipeQuery(RECIPES[2], "saumon") > scoreRecipeQuery({ ...RECIPES[0], ings: ["Saumon"] }, "saumon"));
  assert.equal(scoreRecipeQuery(RECIPES[0], "cat:poisson"), -1);
});

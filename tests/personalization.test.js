"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeCookingProfile,
  scoreRecipePreference,
  sortRecipesForProfile
} = require("../scripts/personalization.js");

const RECIPES = [
  { id: "steak", nom: "Steak direct", mode: "Direct", difficulty: 1 },
  { id: "brisket", nom: "Brisket fumé", mode: "Fumage lent", difficulty: 5 },
  { id: "poulet", nom: "Poulet rôti", mode: "Indirect", difficulty: 2 }
];

test("profile normalization keeps only supported local preferences", () => {
  assert.deepEqual(normalizeCookingProfile({
    experience: "expert",
    preferredMode: "fumage",
    kamadoSize: "xl",
    personalization: false,
    ignored: "secret"
  }), {
    experience: "expert",
    preferredMode: "fumage",
    kamadoSize: "xl",
    personalization: false
  });
  assert.deepEqual(normalizeCookingProfile({ experience: "invalid" }), {
    experience: "intermediaire",
    preferredMode: "all",
    kamadoSize: "standard",
    personalization: false
  });
});

test("preference score is explainable from profile and local activity", () => {
  const context = {
    profile: { experience: "expert", preferredMode: "fumage", personalization: true },
    favorites: ["Brisket fumé"],
    ratings: { "Brisket fumé": 5 },
    history: ["Brisket fumé"]
  };
  const result = scoreRecipePreference(RECIPES[1], context);
  assert.ok(result.score >= 90);
  assert.deepEqual(result.reasons, ["favori", "noté 5/5", "consulté récemment", "mode préféré", "niveau adapté"]);
});

test("personalized sorting is stable and can be disabled", () => {
  const context = {
    profile: { experience: "debutant", preferredMode: "indirect", personalization: true },
    favorites: [], ratings: {}, history: []
  };
  assert.deepEqual(sortRecipesForProfile(RECIPES, context).map(r => r.id), ["poulet", "steak", "brisket"]);
  assert.deepEqual(sortRecipesForProfile(RECIPES, { ...context, profile: { personalization: false } }).map(r => r.id), RECIPES.map(r => r.id));
});

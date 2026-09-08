"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const recipesI18n = require("../scripts/recipes-i18n.js");

test("recipes-i18n exports API correctly", () => {
  assert.ok(recipesI18n, "Module must export an object");
  assert.equal(typeof recipesI18n.getRecipeName, "function");
  assert.equal(typeof recipesI18n.getRecipeOrigin, "function");
  assert.equal(typeof recipesI18n.translateDoneness, "function");
  assert.equal(typeof recipesI18n.translateWood, "function");
  assert.equal(typeof recipesI18n.translateVentValue, "function");
  assert.equal(typeof recipesI18n.translateEquipmentItem, "function");
  assert.equal(typeof recipesI18n.translateIngredientLine, "function");
  assert.equal(typeof recipesI18n.translateStepLine, "function");
  assert.equal(typeof recipesI18n.RECIPES_EN, "object");
});

test("all 269 recipes in index.html are translated to English", () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const match = indexHtml.match(/const RECIPES = (\[[\s\S]*?\]);\n\/\* =================/);
  assert.ok(match, "Could not find RECIPES in index.html");
  
  // Use Function to evaluate array without global pollution
  const recipes = Function(`return ${match[1]};`)();
  assert.equal(recipes.length, 269, "Must contain exactly 269 recipes");

  for (const recipe of recipes) {
    const enPair = recipesI18n.RECIPES_EN[recipe.id];
    assert.ok(enPair, `Recipe ${recipe.id} must be defined in RECIPES_EN`);
    assert.ok(Array.isArray(enPair), `Recipe ${recipe.id} entry must be an array`);
    assert.equal(enPair.length, 2, `Recipe ${recipe.id} must have [nom_en, ori_en]`);
    assert.ok(enPair[0] && typeof enPair[0] === "string" && enPair[0].trim().length > 0, `Recipe ${recipe.id} nom_en must be non-empty string`);
    assert.ok(enPair[1] && typeof enPair[1] === "string" && enPair[1].trim().length > 0, `Recipe ${recipe.id} ori_en must be non-empty string`);
    assert.notEqual(enPair[0], recipe.nom, `Recipe ${recipe.id} nom_en should be translated from French title`);
  }
});

test("getRecipeName and getRecipeOrigin handle lang toggle", () => {
  const recipe = { id: "cote-de-boeuf-reverse-sear", nom: "Côte de bœuf reverse-sear", ori: "France · cuisson parfaite en 2 temps" };
  
  assert.equal(recipesI18n.getRecipeName(recipe, "fr"), "Côte de bœuf reverse-sear");
  assert.equal(recipesI18n.getRecipeOrigin(recipe, "fr"), "France · cuisson parfaite en 2 temps");
  
  assert.equal(recipesI18n.getRecipeName(recipe, "en"), "Reverse-Seared Ribeye Steak");
  assert.ok(recipesI18n.getRecipeOrigin(recipe, "en").includes("perfect two-stage cooking"));
});

test("culinary helpers translate terms accurately", () => {
  assert.ok(recipesI18n.translateDoneness("saignant (54 °C)", "en").includes("rare"));
  assert.ok(recipesI18n.translateDoneness("effiloché", "en").includes("pull-apart tender"));
  
  assert.equal(recipesI18n.translateWood("Chêne", "en"), "Oak");
  assert.equal(recipesI18n.translateWood("Pommier", "en"), "Applewood");
  
  assert.equal(recipesI18n.translateVentValue("fente de 2 mm", "en"), "2 mm crack");
  assert.equal(recipesI18n.translateVentValue("grand ouvert", "en"), "wide open");
  
  assert.equal(recipesI18n.translateEquipmentItem("déflecteur céramique", "en"), "ceramic heat deflector");
  assert.equal(recipesI18n.translateEquipmentItem("pierre à pizza", "en"), "pizza stone");
});

test("ingredient and step line translation", () => {
  const ing = "2 c. à s. d'huile d'olive, fleur de sel et poivre du moulin";
  const translatedIng = recipesI18n.translateIngredientLine(ing, "en");
  assert.ok(translatedIng.includes("tbsp"));
  assert.ok(translatedIng.includes("extra virgin olive oil"));
  assert.ok(translatedIng.includes("flaky sea salt"));
  assert.ok(translatedIng.includes("freshly ground black pepper"));

  const step = "Config indirecte avec pierre céramique en déflecteur. plantez la sonde au cœur.";
  const translatedStep = recipesI18n.translateStepLine(step, "en");
  assert.ok(translatedStep.includes("Indirect setup"));
  assert.ok(translatedStep.includes("ceramic heat deflector plate"));
  assert.ok(translatedStep.includes("insert probe into the thermal core"));
});

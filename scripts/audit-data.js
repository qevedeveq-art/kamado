#!/usr/bin/env node
/*
 * Audits the recipe dataset.
 *
 * Source: data/recipes.json + data/categories.json (produced by
 * scripts/extract-data.js). Falls back to extracting on the fly when those
 * files are missing so that fresh checkouts still work.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const RECIPES_PATH = path.join(DATA_DIR, "recipes.json");
const CATEGORIES_PATH = path.join(DATA_DIR, "categories.json");

function ensureExtract() {
  if (fs.existsSync(RECIPES_PATH) && fs.existsSync(CATEGORIES_PATH)) return;
  execSync(`node ${path.join(__dirname, "extract-data.js")}`, { stdio: "inherit" });
}

ensureExtract();

const RECIPES = JSON.parse(fs.readFileSync(RECIPES_PATH, "utf8"));
const CATS = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8"));

const required = ["cat", "nom", "ori", "pour", "mode", "tempK", "temps", "ings", "etapes"];
const catIds = new Set(CATS.map(c => c.id));
const seen = new Map();
const issues = [];

const VALID_SPICE = new Set(["Doux", "Épicé doux", "Relevé"]);
const VALID_SEASON = new Set(["printemps", "ete", "automne", "hiver", "toute"]);
const KAMADO_MODE = /(direct|indirect|fumage|brais|cocotte|pierre|plaque|grill|rôti|roti|mijot|préparation|preparation)/i;

for (const [i, recipe] of RECIPES.entries()) {
  const label = recipe.nom || "(sans nom)";

  for (const key of required) {
    const value = recipe[key];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
      issues.push(`${i}: ${label} missing ${key}`);
    }
  }

  if (seen.has(recipe.nom)) {
    issues.push(`${i}: duplicate recipe name "${recipe.nom}" first seen at ${seen.get(recipe.nom)}`);
  }
  seen.set(recipe.nom, i);

  if (!catIds.has(recipe.cat)) issues.push(`${i}: ${label} has unknown category "${recipe.cat}"`);

  if (!Array.isArray(recipe.ings) || recipe.ings.some(item => typeof item !== "string" || !item.trim())) {
    issues.push(`${i}: ${label} has invalid ingredients`);
  } else if (recipe.cat !== "sauces" && recipe.ings.length < 3) {
    issues.push(`${i}: ${label} needs at least 3 ingredient lines`);
  }
  if (!Array.isArray(recipe.etapes) || recipe.etapes.some(step => typeof step !== "string" || !step.trim())) {
    issues.push(`${i}: ${label} has invalid steps`);
  } else if (recipe.cat !== "sauces" && recipe.etapes.length < 4) {
    issues.push(`${i}: ${label} needs at least 4 preparation steps`);
  }

  if (recipe.cat !== "sauces") {
    if (!KAMADO_MODE.test(recipe.mode || "")) {
      issues.push(`${i}: ${label} mode may not describe a kamado-compatible method: "${recipe.mode}"`);
    }
    if (!recipe.coeur) issues.push(`${i}: ${label} needs a target core temperature or doneness cue`);
    if (!recipe.bois) issues.push(`${i}: ${label} needs a wood/fuel recommendation, even "—"`);
    if (!recipe.astuce) issues.push(`${i}: ${label} needs a practical kamado tip`);

    const derived = recipe._derived;
    if (!derived) {
      issues.push(`${i}: ${label} missing _derived (re-run scripts/extract-data.js)`);
    } else {
      if (!VALID_SPICE.has(derived.spice)) issues.push(`${i}: ${label} has invalid spice level: ${derived.spice}`);
      if (!VALID_SEASON.has(derived.season)) issues.push(`${i}: ${label} has invalid season: ${derived.season}`);
      if (!Array.isArray(derived.sauces)) issues.push(`${i}: ${label} saucesFor() must return an array`);
      if (!Array.isArray(derived.allergens)) issues.push(`${i}: ${label} allergens() must return an array`);
    }
  }
}

const cooking = RECIPES.filter(recipe => recipe.cat !== "sauces");
const summary = {
  total: RECIPES.length,
  cooking: cooking.length,
  bases: RECIPES.length - cooking.length,
  withSauce: cooking.filter(recipe => (recipe._derived?.sauces || []).length).length,
  withoutSauce: cooking.filter(recipe => !(recipe._derived?.sauces || []).length).length,
  categories: Object.fromEntries(CATS.filter(c => c.id !== "all").map(c => [c.id, RECIPES.filter(recipe => recipe.cat === c.id).length])),
  issues: issues.length
};

console.log(JSON.stringify(summary, null, 2));

if (issues.length) {
  console.error("\nData audit failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

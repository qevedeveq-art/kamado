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
const VALID_WRAP_MATERIAU = new Set(["papier boucher", "alu", "papier sulfurisé"]);

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRichSchema(recipe, label, i, issues) {
  if (recipe.phases != null) {
    if (!Array.isArray(recipe.phases) || recipe.phases.length === 0) {
      issues.push(`${i}: ${label} phases must be a non-empty array`);
    } else {
      recipe.phases.forEach((p, j) => {
        if (!isNonEmptyString(p.name)) issues.push(`${i}: ${label} phase[${j}] missing name`);
        if (!isNonEmptyString(p.mode)) issues.push(`${i}: ${label} phase[${j}] missing mode`);
        if (!isNonNegativeNumber(p.temp_C)) issues.push(`${i}: ${label} phase[${j}] temp_C must be a number`);
        if (!isNonNegativeNumber(p.duration_min)) issues.push(`${i}: ${label} phase[${j}] duration_min must be a number`);
      });
    }
  }
  if (recipe.vents != null) {
    if (typeof recipe.vents !== "object" || !isNonEmptyString(recipe.vents.bottom) || !isNonEmptyString(recipe.vents.top)) {
      issues.push(`${i}: ${label} vents must have non-empty bottom and top fields`);
    }
  }
  if (recipe.wrap !== undefined && recipe.wrap !== null) {
    if (typeof recipe.wrap !== "object") {
      issues.push(`${i}: ${label} wrap must be object or null`);
    } else {
      if (!isNonNegativeNumber(recipe.wrap.at_temp_coeur_C)) {
        issues.push(`${i}: ${label} wrap.at_temp_coeur_C must be a number`);
      }
      if (!VALID_WRAP_MATERIAU.has(recipe.wrap.materiau)) {
        issues.push(`${i}: ${label} wrap.materiau must be one of: ${[...VALID_WRAP_MATERIAU].join(", ")}`);
      }
    }
  }
  if (recipe.repos_min != null && !isNonNegativeNumber(recipe.repos_min)) {
    issues.push(`${i}: ${label} repos_min must be a non-negative number`);
  }
  if (recipe.charbon_kg != null && !isPositiveNumber(recipe.charbon_kg)) {
    issues.push(`${i}: ${label} charbon_kg must be a positive number`);
  }
  if (recipe.marinade_h != null && !isNonNegativeNumber(recipe.marinade_h)) {
    issues.push(`${i}: ${label} marinade_h must be a non-negative number`);
  }
  if (recipe.brine != null) {
    if (typeof recipe.brine !== "object" || !isPositiveNumber(recipe.brine.hours)) {
      issues.push(`${i}: ${label} brine.hours must be a positive number`);
    }
  }
  if (recipe.difficulty != null) {
    if (!Number.isInteger(recipe.difficulty) || recipe.difficulty < 1 || recipe.difficulty > 5) {
      issues.push(`${i}: ${label} difficulty must be integer 1..5`);
    }
  }
  if (recipe.equipement != null) {
    if (!Array.isArray(recipe.equipement) || recipe.equipement.some(e => !isNonEmptyString(e))) {
      issues.push(`${i}: ${label} equipement must be array of non-empty strings`);
    }
  }
  if (recipe.substitutions != null) {
    if (!Array.isArray(recipe.substitutions)) {
      issues.push(`${i}: ${label} substitutions must be an array`);
    } else {
      recipe.substitutions.forEach((s, j) => {
        if (!isNonEmptyString(s?.ingredient) || !isNonEmptyString(s?.par)) {
          issues.push(`${i}: ${label} substitutions[${j}] must have ingredient + par`);
        }
      });
    }
  }
  if (recipe.erreurs != null) {
    if (!Array.isArray(recipe.erreurs) || recipe.erreurs.some(e => !isNonEmptyString(e))) {
      issues.push(`${i}: ${label} erreurs must be array of non-empty strings`);
    }
  }
  if (recipe.notes_securite != null && !isNonEmptyString(recipe.notes_securite)) {
    issues.push(`${i}: ${label} notes_securite must be a non-empty string`);
  }
  if (recipe.source != null && !isNonEmptyString(recipe.source)) {
    issues.push(`${i}: ${label} source must be a non-empty string`);
  }
}

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

  validateRichSchema(recipe, label, i, issues);
}

const cooking = RECIPES.filter(recipe => recipe.cat !== "sauces");
const RICH_FIELDS = ["phases", "vents", "wrap", "brine", "marinade_h", "repos_min", "charbon_kg", "difficulty", "equipement", "substitutions", "erreurs", "notes_securite", "source"];
const richRecipes = RECIPES.filter(recipe => RICH_FIELDS.some(f => recipe[f] != null));
const coverage = Object.fromEntries(
  RICH_FIELDS.map(f => [f, cooking.filter(r => r[f] != null).length])
);
const summary = {
  total: RECIPES.length,
  cooking: cooking.length,
  bases: RECIPES.length - cooking.length,
  withSauce: cooking.filter(recipe => (recipe._derived?.sauces || []).length).length,
  withoutSauce: cooking.filter(recipe => !(recipe._derived?.sauces || []).length).length,
  categories: Object.fromEntries(CATS.filter(c => c.id !== "all").map(c => [c.id, RECIPES.filter(recipe => recipe.cat === c.id).length])),
  richSchema: richRecipes.length,
  coverage,
  issues: issues.length
};

console.log(JSON.stringify(summary, null, 2));

if (issues.length) {
  console.error("\nData audit failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

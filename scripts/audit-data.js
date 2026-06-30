const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf("const CATS = [");
const end = html.indexOf("/* ================= GUIDE");
const logicStart = html.indexOf("function norm");
const logicEnd = html.indexOf("/* ---- helpers analyse");

if (start < 0 || end < 0 || logicStart < 0 || logicEnd < 0) {
  throw new Error("Unable to locate recipe data or helper logic in index.html");
}

const data = html.slice(start, end);
const helpers = html.slice(logicStart, logicEnd);
const inspect = new Function(`${data}\n${helpers}\nreturn { RECIPES, CATS, saucesFor, allergens, seasonFor, spiceLevel };`);
const { RECIPES, CATS, saucesFor, allergens, seasonFor, spiceLevel } = inspect();

const required = ["cat", "nom", "ori", "pour", "mode", "tempK", "temps", "ings", "etapes"];
const catIds = new Set(CATS.map(c => c.id));
const seen = new Map();
const issues = [];

for (const [i, recipe] of RECIPES.entries()) {
  for (const key of required) {
    const value = recipe[key];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
      issues.push(`${i}: ${recipe.nom || "(sans nom)"} missing ${key}`);
    }
  }

  if (seen.has(recipe.nom)) issues.push(`${i}: duplicate recipe name "${recipe.nom}" first seen at ${seen.get(recipe.nom)}`);
  seen.set(recipe.nom, i);

  if (!catIds.has(recipe.cat)) issues.push(`${i}: ${recipe.nom} has unknown category "${recipe.cat}"`);
  if (!Array.isArray(recipe.ings) || recipe.ings.some(item => typeof item !== "string" || !item.trim())) {
    issues.push(`${i}: ${recipe.nom} has invalid ingredients`);
  } else if (recipe.cat !== "sauces" && recipe.ings.length < 3) {
    issues.push(`${i}: ${recipe.nom} needs at least 3 ingredient lines`);
  }
  if (!Array.isArray(recipe.etapes) || recipe.etapes.some(step => typeof step !== "string" || !step.trim())) {
    issues.push(`${i}: ${recipe.nom} has invalid steps`);
  } else if (recipe.cat !== "sauces" && recipe.etapes.length < 4) {
    issues.push(`${i}: ${recipe.nom} needs at least 4 preparation steps`);
  }

  if (recipe.cat !== "sauces" && !/(direct|indirect|fumage|brais|cocotte|pierre|plaque|grill|rôti|roti|mijot|préparation|preparation)/i.test(recipe.mode || "")) {
    issues.push(`${i}: ${recipe.nom} mode may not describe a kamado-compatible method: "${recipe.mode}"`);
  }
  if (recipe.cat !== "sauces" && !recipe.coeur) {
    issues.push(`${i}: ${recipe.nom} needs a target core temperature or doneness cue`);
  }
  if (recipe.cat !== "sauces" && !recipe.bois) {
    issues.push(`${i}: ${recipe.nom} needs a wood/fuel recommendation, even "—"`);
  }
  if (recipe.cat !== "sauces" && !recipe.astuce) {
    issues.push(`${i}: ${recipe.nom} needs a practical kamado tip`);
  }

  if (!["Doux", "Épicé doux", "Relevé"].includes(spiceLevel(recipe))) {
    issues.push(`${i}: ${recipe.nom} has invalid spice level`);
  }
  if (!["printemps", "ete", "automne", "hiver", "toute"].includes(seasonFor(recipe))) {
    issues.push(`${i}: ${recipe.nom} has invalid season`);
  }
  if (!Array.isArray(saucesFor(recipe))) issues.push(`${i}: ${recipe.nom} saucesFor() must return an array`);
  if (!Array.isArray(allergens(recipe))) issues.push(`${i}: ${recipe.nom} allergens() must return an array`);
}

const cooking = RECIPES.filter(recipe => recipe.cat !== "sauces");
const summary = {
  total: RECIPES.length,
  cooking: cooking.length,
  bases: RECIPES.length - cooking.length,
  withSauce: cooking.filter(recipe => saucesFor(recipe).length).length,
  withoutSauce: cooking.filter(recipe => !saucesFor(recipe).length).length,
  categories: Object.fromEntries(CATS.filter(c => c.id !== "all").map(c => [c.id, RECIPES.filter(recipe => recipe.cat === c.id).length])),
  issues: issues.length
};

console.log(JSON.stringify(summary, null, 2));

if (issues.length) {
  console.error("\nData audit failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

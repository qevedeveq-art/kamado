#!/usr/bin/env node
"use strict";

/*
 * Kamado expert recipe audit.
 *
 * This is the executable checklist for .codex/agents/kamado-expert.toml.
 * It reviews every cooking recipe for food-safety, kamado-control and
 * operational-quality consistency without mutating recipe data.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const RECIPES_PATH = path.join(ROOT, "data", "recipes.json");
const REPORT_PATH = path.join(ROOT, "scripts", "reports", "kamado-expert-report.json");

const RECIPES = JSON.parse(fs.readFileSync(RECIPES_PATH, "utf8"));

const TRUSTED_REFERENCES = [
  {
    name: "FoodSafety.gov safe minimum internal temperatures",
    url: "https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures"
  },
  {
    name: "USDA FSIS safe temperature chart",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart"
  },
  {
    name: "Big Green Egg indirect cooking",
    url: "https://www.biggreenegg.eu/en/indirect-cooking"
  },
  {
    name: "AmazingRibs smoke science",
    url: "https://amazingribs.com/more-technique-and-science/grill-and-smoker-setup-and-firing/science-of-wood-and-smoke/"
  },
  {
    name: "ThermoWorks chef temperatures",
    url: "https://blog.thermoworks.com/chef-recommended-tw-approved/"
  }
];

const cooking = RECIPES.filter(recipe => recipe.cat !== "sauces");
const sauceRecipes = RECIPES.filter(recipe => recipe.cat === "sauces");
const issues = [];
const warnings = [];
const improvements = [];

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textOf(recipe) {
  return norm([
    recipe.nom,
    recipe.ori,
    recipe.cat,
    recipe.mode,
    recipe.tempK,
    recipe.coeur,
    recipe.temps,
    recipe.bois,
    recipe.astuce,
    recipe.notes_securite,
    recipe.source,
    ...(Array.isArray(recipe.ings) ? recipe.ings : []),
    ...(Array.isArray(recipe.etapes) ? recipe.etapes : []),
    ...(Array.isArray(recipe.erreurs) ? recipe.erreurs : [])
  ].flat().join(" "));
}

function foodTextOf(recipe) {
  return norm([
    recipe.nom,
    recipe.ori,
    recipe.cat,
    recipe.mode,
    recipe.tempK,
    recipe.coeur,
    recipe.tags,
    ...(Array.isArray(recipe.ings) ? recipe.ings : []),
    ...(Array.isArray(recipe.etapes) ? recipe.etapes : [])
  ].flat().join(" "));
}

function firstNumber(value) {
  const match = String(value || "").match(/(\d{2,3})(?:[,.]\d+)?/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function numbers(value) {
  return [...String(value || "").matchAll(/(\d{2,3})(?:[,.]\d+)?/g)].map(m => Number.parseInt(m[1], 10));
}

function minInternalTemp(recipe) {
  const vals = numbers(recipe.coeur);
  return vals.length ? Math.min(...vals) : null;
}

function durationMinutes(recipe) {
  const txt = norm(recipe.temps);
  const range = txt.match(/(\d+)\s*[–-]\s*(\d+)\s*h/);
  if (range) return Number.parseInt(range[2], 10) * 60;
  const h = [...txt.matchAll(/(\d+)\s*h/g)].map(m => Number.parseInt(m[1], 10));
  const min = [...txt.matchAll(/(\d+)\s*min/g)].map(m => Number.parseInt(m[1], 10));
  return h.reduce((a, b) => a + b * 60, 0) + min.reduce((a, b) => a + b, 0);
}

function isGroundOrSausage(recipe, h) {
  const hasMeat = ["boeuf", "porc", "volaille", "agneau", "monde"].includes(recipe.cat) ||
    /\b(boeuf|porc|agneau|poulet|dinde|veau|canard|chair a saucisse|merguez|chipolata)\b/.test(h);
  if (!hasMeat) return false;
  return /\b(viande|boeuf|bœuf|agneau|poulet|porc|dinde|veau)\s+hachee?\b/.test(h) ||
    /\bhachee?\s+(de\s+)?(viande|boeuf|bœuf|agneau|poulet|porc|dinde|veau)\b/.test(h) ||
    /\b(smash|chair a saucisse|saucisse|chipolata|merguez|boerewors|tsukune|kofte|kofta|kefta|koobideh)\b/.test(h) ||
    (/\bburger\b/.test(h) && !/\bvegetarien|haricots|champignons\b/.test(h));
}

function isPoultry(recipe, h) {
  return recipe.cat === "volaille" || /\b(poulet|dinde|chapon|volaille|pintade|cuisse de canard|magret)\b/.test(h);
}

function isSeafood(recipe, h) {
  return recipe.cat === "poisson" || /\b(poisson|saumon|thon|cabillaud|truite|bar|dorade|gambas|crevette|moules|huitres|coquillage|homard|calamar|poulpe)\b/.test(h);
}

function isWholeMusclePork(recipe, h) {
  return recipe.cat === "porc" && !isGroundOrSausage(recipe, h) && !/\b(ribs|travers|pulled|effiloche|epaule|poitrine|burnt ends|jarret)\b/.test(h);
}

function add(kind, recipe, message) {
  const entry = `${recipe.nom}: ${message}`;
  if (kind === "issue") issues.push(entry);
  else if (kind === "warning") warnings.push(entry);
  else improvements.push(entry);
}

function hasSafetyTemp(recipe, tempC) {
  return numbers([recipe.coeur, recipe.notes_securite].flat().join(" ")).some(n => n >= tempC);
}

function hasKamadoMode(recipe) {
  return /(direct|indirect|fumage|brais|cocotte|pierre|plancha|fonte|grill|rotissoire|rôtissoire|braises|four)/i.test(recipe.mode || "");
}

function sourceLooksCredible(recipe) {
  const src = String(recipe.source || "");
  return /^https?:\/\//.test(src) ||
    /(USDA|FoodSafety|FSIS|Serious Eats|AmazingRibs|Meathead|Franklin|Raichlen|Larousse|Escoffier|Ottolenghi|Big Green Egg|Weber|ThermoWorks|Fuchsia Dunlop|Kenji|Mallmann|Pellaprat|Camdeborde|Robuchon|Ducasse|Ruhlman|Polcyn|Meat Church|Pittman|Holy Smoke|Reed|Peláez|Ivan Orkin)/i.test(src);
}

function isColdCuredDocumented(recipe, h) {
  return /fumage a froid|salaison|gravlax|charcuterie|sechage|sel rose|nitrite|saumure/.test(h) &&
    !!recipe.notes_securite &&
    /(<\s*4|4\s*°?\s*c|≤4|<=4|-20|parasite|botul|nitrite|sel rose|25\s*°?\s*c)/.test(norm(recipe.notes_securite));
}

function isRiskProtein(recipe, h) {
  return ["boeuf", "porc", "volaille", "agneau", "poisson", "monde"].includes(recipe.cat) &&
    !isColdCuredDocumented(recipe, h);
}

function isMultiStage(recipe) {
  const txt = `${recipe.mode || ""} ${recipe.tempK || ""} ${recipe.temps || ""}`;
  return /puis|reverse|indirect\s+puis\s+direct|direct\s+puis\s+indirect|fumage\s+puis/i.test(txt);
}

function hasLateGlazeInstruction(recipe) {
  const txt = norm([...(Array.isArray(recipe.etapes) ? recipe.etapes : []), recipe.astuce].join(" "));
  return /(fin de cuisson|dernieres? minutes?|badigeonnez.*fin|laquer.*fin|laquage.*fois|brule vite|caramelise vite|eviter la carbonisation)/.test(txt);
}

function sauceRefs(recipe) {
  return Array.isArray(recipe._derived?.sauces) ? recipe._derived.sauces : [];
}

function sauceKey(value) {
  return norm(value)
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const sauceCatalog = sauceRecipes.map(recipe => ({
  name: recipe.nom,
  key: sauceKey(recipe.nom)
}));
const sauceCoverage = {
  proposed: 0,
  matched: 0,
  unmatchedByName: {}
};

for (const sauce of sauceRecipes) {
  if (!sauce.source) add("improvement", sauce, "base sauce sans source ou inspiration");
}

for (const recipe of cooking) {
  const h = textOf(recipe);
  const foodText = foodTextOf(recipe);
  const core = minInternalTemp(recipe);
  const dome = firstNumber(recipe.tempK);
  const duration = durationMinutes(recipe);
  const steps = Array.isArray(recipe.etapes) ? recipe.etapes : [];
  const ingredients = Array.isArray(recipe.ings) ? recipe.ings : [];
  const phases = Array.isArray(recipe.phases) ? recipe.phases : [];

  if (!hasKamadoMode(recipe)) add("issue", recipe, `mode non assez kamado: "${recipe.mode}"`);
  if (!dome && !/braises|vives|directement sur les braises/i.test(recipe.tempK || "")) {
    add("issue", recipe, `température kamado non exploitable: "${recipe.tempK}"`);
  }
  if (!recipe.vents?.bottom || !recipe.vents?.top) add("issue", recipe, "réglage des évents incomplet");
  if (!recipe.bois) add("issue", recipe, "bois/fumée non renseigné");
  if (!recipe.charbon_kg) add("issue", recipe, "charge charbon manquante");
  if (recipe.repos_min == null) add("issue", recipe, "repos_min manquant");
  if (!recipe.source || !sourceLooksCredible(recipe)) add("improvement", recipe, `source à renforcer: "${recipe.source || "absente"}"`);

  if (ingredients.length < 4) add("improvement", recipe, "liste d'ingrédients courte, vérifier qu'elle suffit hors bases/sauces");
  if (steps.length < 5) add("improvement", recipe, "étapes courtes, détailler stabilisation, cuisson, repos et service");
  if (!recipe.astuce || String(recipe.astuce).length < 35) add("improvement", recipe, "astuce kamado trop courte ou absente");
  if (!Array.isArray(recipe.erreurs) || recipe.erreurs.length < 2) add("improvement", recipe, "ajouter au moins deux erreurs fréquentes spécifiques");
  if (!phases.length && (duration >= 120 || /fumage|brais|confit|low|slow/i.test(recipe.mode || ""))) {
    add("improvement", recipe, "ajouter des phases structurées pour la timeline de cuisson");
  }
  if (isMultiStage(recipe) && !phases.length) {
    add("warning", recipe, "cuisson multi-température sans phases structurées");
  }

  if (isRiskProtein(recipe, foodText) && core == null) {
    add("issue", recipe, "protéine à risque sans température numérique à cœur ou exception salaison documentée");
  }
  if (isPoultry(recipe, foodText) && !hasSafetyTemp(recipe, 74)) {
    add("warning", recipe, "volaille/canard: expliciter la référence sécurité 74 °C ou la dérogation culinaire assumée");
  }
  if (isGroundOrSausage(recipe, foodText) && !hasSafetyTemp(recipe, recipe.cat === "volaille" ? 74 : 70)) {
    add("issue", recipe, "haché/saucisse: cible sécurité insuffisamment explicite");
  }
  if (isWholeMusclePork(recipe, foodText) && !hasSafetyTemp(recipe, 63)) {
    add("issue", recipe, "porc pièce entière: mention 63 °C + repos 3 min manquante");
  }
  if (isSeafood(recipe, foodText) && !recipe.notes_securite && core != null && core < 55) {
    add("warning", recipe, "poisson/fruit de mer sous 55 °C sans note sécurité ou fraîcheur");
  }
  const hasCuringRisk = /sel rose|nitrite|salaison|fumage a froid|sechage/.test(foodText) ||
    (["boeuf", "porc", "volaille", "agneau", "poisson", "monde"].includes(recipe.cat) && /charcuterie/.test(foodText));
  if (hasCuringRisk && !isColdCuredDocumented(recipe, foodText)) {
    add("issue", recipe, "salaison/fumage froid/charcuterie: froid, parasites, nitrite ou botulisme insuffisamment explicités");
  }
  if (/[ms]iel|sucre|erable|hoisin|teriyaki|gochujang|laque|laqué/.test(h) && (dome || 0) >= 230 && !hasLateGlazeInstruction(recipe)) {
    add("warning", recipe, "sucre/laque à feu vif sans consigne claire d'application en fin de cuisson");
  }
  if (sauceRefs(recipe).length > 3) {
    add("improvement", recipe, "trop de sauces proposées: garder seulement les accords les plus pertinents");
  }
  for (const sauce of sauceRefs(recipe)) {
    sauceCoverage.proposed += 1;
    const key = sauceKey(sauce);
    const matched = sauceCatalog.some(item => item.key === key || item.key.includes(key) || key.includes(item.key));
    if (matched) sauceCoverage.matched += 1;
    else sauceCoverage.unmatchedByName[sauce] = (sauceCoverage.unmatchedByName[sauce] || 0) + 1;
  }
}

sauceCoverage.unmatchedUnique = Object.keys(sauceCoverage.unmatchedByName).length;

const byCategory = Object.fromEntries(
  [...new Set(cooking.map(r => r.cat))].sort().map(cat => {
    const items = cooking.filter(r => r.cat === cat);
    return [cat, {
      count: items.length,
      withPhases: items.filter(r => Array.isArray(r.phases) && r.phases.length).length,
      withSafety: items.filter(r => r.notes_securite).length,
      withErrors: items.filter(r => Array.isArray(r.erreurs) && r.erreurs.length).length,
      withCredibleSource: items.filter(sourceLooksCredible).length
    }];
  })
);

const report = {
  reviewedAt: new Date().toISOString(),
  agent: "kamado-expert",
  references: TRUSTED_REFERENCES,
  totals: {
    recipesReviewed: cooking.length,
    issues: issues.length,
    warnings: warnings.length,
    improvements: improvements.length
  },
  byCategory,
  sauceCoverage,
  issues,
  warnings,
  improvements
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify({
  agent: report.agent,
  recipesReviewed: report.totals.recipesReviewed,
  issues: issues.length,
  warnings: warnings.length,
  improvements: improvements.length,
  report: path.relative(ROOT, REPORT_PATH)
}, null, 2));

if (issues.length) {
  console.error("\nKamado expert issues:");
  for (const issue of issues.slice(0, 60)) console.error(`- ${issue}`);
  if (issues.length > 60) console.error(`- ... ${issues.length - 60} more`);
  process.exit(1);
}

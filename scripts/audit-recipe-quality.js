#!/usr/bin/env node
"use strict";

/*
 * Cross-agent quality audit for every recipe.
 *
 * This does not mutate recipes. It turns the local agent role specs into
 * repeatable checks and writes a per-recipe action report.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const RECIPES_PATH = path.join(ROOT, "data", "recipes.json");
const REPORT_JSON = path.join(ROOT, "scripts", "reports", "recipe-quality-audit.json");
const REPORT_MD = path.join(ROOT, "scripts", "reports", "recipe-quality-audit.md");

const RECIPES = JSON.parse(fs.readFileSync(RECIPES_PATH, "utf8"));
const cooking = RECIPES.filter(recipe => recipe.cat !== "sauces");
const sauces = RECIPES.filter(recipe => recipe.cat === "sauces");

const OFFICIAL_SAFETY_REFERENCES = [
  {
    name: "FoodSafety.gov safe minimum internal temperatures",
    url: "https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures"
  },
  {
    name: "USDA FSIS safe temperature chart",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart"
  }
];

const MODE_BANDS = [
  { re: /fumage|low|slow/i, min: 95, max: 135, label: "fumage / low and slow" },
  { re: /brais|cocotte|mijot/i, min: 120, max: 180, label: "braise / cocotte" },
  { re: /pierre|pizza/i, min: 280, max: 420, label: "pierre / pizza" },
  { re: /plancha|fonte|cuisson vive/i, min: 210, max: 300, label: "plancha / cuisson vive" },
  { re: /direct doux/i, min: 180, max: 240, label: "direct doux" },
  { re: /direct|saisie|braises/i, min: 210, max: 340, label: "direct / saisie" },
  { re: /indirect|rotissoire|rôtissoire|four/i, min: 100, max: 240, label: "indirect / rotissage" }
];

const FRENCH_CLASSICS = /\b(bourguignon|daube|coq au vin|magret|pot-au-feu|pot au feu|blanquette|choucroute|cassoulet|garbure|confit|tartare|entrecote|entrecôte|maitre d'hotel|maître d'hôtel|cote de boeuf|côte de bœuf|piperade|ratatouille|tarte tatin)\b/i;
const TRIVIAL_EQUIPMENT = /\b(couteau|planche|saladier|cuillere|cuillère|fourchette|assiette|bol|plat|spatule)\b/i;

const findings = [];

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textOf(recipe) {
  return [
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
    recipe.tags,
    ...(Array.isArray(recipe.ings) ? recipe.ings : []),
    ...(Array.isArray(recipe.etapes) ? recipe.etapes : []),
    ...(Array.isArray(recipe.erreurs) ? recipe.erreurs : [])
  ].flat().join(" ");
}

function add(recipe, role, severity, field, message, suggestion) {
  findings.push({
    recipe: recipe.nom,
    category: recipe.cat,
    role,
    severity,
    field,
    message,
    suggestion
  });
}

function numbers(value) {
  return [...String(value || "").matchAll(/(\d{2,3})(?:[,.]\d+)?/g)].map(match => Number.parseInt(match[1], 10));
}

function tempRange(value) {
  const vals = numbers(value);
  if (!vals.length) return null;
  return { min: Math.min(...vals), max: Math.max(...vals), vals };
}

function durationMinutes(recipe) {
  const txt = norm(recipe.temps);
  const rangeH = txt.match(/(\d+)\s*[–-]\s*(\d+)\s*h/);
  if (rangeH) return Number.parseInt(rangeH[2], 10) * 60;
  const rangeMin = txt.match(/(\d+)\s*[–-]\s*(\d+)\s*min/);
  if (rangeMin) return Number.parseInt(rangeMin[2], 10);
  const h = [...txt.matchAll(/(\d+)\s*h/g)].map(m => Number.parseInt(m[1], 10));
  const min = [...txt.matchAll(/(\d+)\s*min/g)].map(m => Number.parseInt(m[1], 10));
  return h.reduce((a, b) => a + b * 60, 0) + min.reduce((a, b) => a + b, 0);
}

function modeBand(mode) {
  return MODE_BANDS.find(band => band.re.test(mode || ""));
}

function phaseBand(mode) {
  return MODE_BANDS.find(band => band.re.test(mode || "")) || modeBand(mode);
}

function hasNumericSafety(recipe, tempC) {
  return numbers([recipe.coeur, recipe.notes_securite].flat().join(" ")).some(n => n >= tempC);
}

function isGroundOrSausage(recipe, h) {
  const hasMeat = ["boeuf", "porc", "volaille", "agneau", "monde"].includes(recipe.cat);
  return hasMeat && (
    /\b(viande|boeuf|bœuf|agneau|poulet|porc|dinde|veau)\s+hachee?\b/.test(h) ||
    /\bhachee?\s+(de\s+)?(viande|boeuf|bœuf|agneau|poulet|porc|dinde|veau)\b/.test(h) ||
    /\b(burger|chair a saucisse|saucisse|chipolata|merguez|boerewors|tsukune|kofte|kofta|kefta)\b/.test(h)
  );
}

function isPoultry(recipe, h) {
  return recipe.cat === "volaille" || /\b(poulet|dinde|chapon|volaille|pintade)\b/.test(h);
}

function isDuckChefTarget(recipe, h) {
  return /\b(magret|canard)\b/.test(h) && /\b(54|55|56|57|58|59|60|rose|rosé)\b/.test(norm(recipe.coeur));
}

function isSeafood(recipe, h) {
  return recipe.cat === "poisson" || /\b(poisson|saumon|thon|cabillaud|truite|bar|dorade|gambas|crevette|moules|huitres|huitres|coquillage|homard|calamar|poulpe)\b/.test(h);
}

function isWholeMusclePork(recipe, h) {
  return recipe.cat === "porc" && !isGroundOrSausage(recipe, h) && !/\b(ribs|travers|pulled|effiloche|effiloché|epaule|épaule|poitrine|burnt ends|jarret|saucisse)\b/.test(h);
}

function isCuredOrColdSmoked(recipe) {
  const h = norm([recipe.nom, recipe.mode, recipe.tempK, recipe.tags].join(" "));
  return /\b(fumage a froid|fumage à froid|gravlax|sechage|séchage|sel rose|nitrite|saumure longue)\b/.test(h) ||
    /<\s*25\s*°?\s*c/.test(h);
}

function isRiskCategory(recipe) {
  return ["boeuf", "porc", "volaille", "agneau", "poisson", "monde"].includes(recipe.cat);
}

function hasColdChainControl(recipe) {
  return /(<\s*4|4\s*°?\s*c|≤4|<=4|-20|parasite|botul|nitrite|sel rose|25\s*°?\s*c|refriger|réfrig|frigo)/i.test(String(recipe.notes_securite || ""));
}

function sauceCatalogKeys() {
  return sauces.map(recipe => norm(recipe.nom).replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, " ").trim());
}

const sauceKeys = sauceCatalogKeys();

function auditTemperature(recipe) {
  if (recipe.cat === "sauces") return;
  const range = tempRange(recipe.tempK);
  const band = modeBand(recipe.mode);
  if (!range && !/braises|vives|caveman|directement sur les braises/i.test(recipe.tempK || "")) {
    add(recipe, "temperature", "issue", "tempK", "Température kamado non numérique.", "Ajouter une température ou plage exploitable.");
  } else if (range && band && !(Array.isArray(recipe.phases) && recipe.phases.length > 1) && (range.min < band.min - 20 || range.max > band.max + 20)) {
    add(recipe, "temperature", "warning", "tempK", `${recipe.tempK} sort de la bande ${band.label} (${band.min}-${band.max} C).`, "Vérifier mode/tempK ou préciser la cuisson multi-phase.");
  }

  if (/puis|reverse|multi|2 temps/i.test(`${recipe.mode} ${recipe.tempK} ${recipe.temps}`) && !Array.isArray(recipe.phases)) {
    add(recipe, "temperature", "issue", "phases", "Cuisson multi-température sans phases structurées.", "Ajouter phases[] pour chaque étape.");
  }

  if (Array.isArray(recipe.phases)) {
    const duration = durationMinutes(recipe);
    const phaseSum = recipe.phases.reduce((sum, phase) => sum + (typeof phase.duration_min === "number" ? phase.duration_min : 0), 0);
    if (duration >= 60 && phaseSum > 0 && (phaseSum < duration * 0.5 || phaseSum > duration * 1.5)) {
      add(recipe, "temperature", "improvement", "phases", `Somme phases ${phaseSum} min éloignée du temps affiché ${recipe.temps}.`, "Aligner phases et temps affiché, ou expliquer repos/variabilité.");
    }
    for (const [i, phase] of recipe.phases.entries()) {
      const bandForPhase = phaseBand(phase.mode);
      if (bandForPhase && typeof phase.temp_C === "number" && (phase.temp_C < bandForPhase.min - 25 || phase.temp_C > bandForPhase.max + 25)) {
        add(recipe, "temperature", "warning", `phases[${i}].temp_C`, `Phase "${phase.name}" à ${phase.temp_C} C hors bande ${bandForPhase.label}.`, "Corriger mode de phase ou température.");
      }
    }
  }
}

function auditSafety(recipe) {
  if (recipe.cat === "sauces") return;
  const h = norm(textOf(recipe));
  if (isPoultry(recipe, h) && !isDuckChefTarget(recipe, h) && !hasNumericSafety(recipe, 74)) {
    add(recipe, "kamado-expert", "issue", "coeur/notes_securite", "Volaille sans cible sécurité 74 C explicite.", "Ajouter 74 C à coeur ou une dérogation culinaire clairement assumée.");
  }
  if (isGroundOrSausage(recipe, h) && !hasNumericSafety(recipe, recipe.cat === "volaille" ? 74 : 71)) {
    add(recipe, "kamado-expert", "issue", "coeur/notes_securite", "Haché/saucisse sans cible sécurité officielle.", "Ajouter 71 C pour haché viande ou 74 C pour volaille.");
  }
  if (isWholeMusclePork(recipe, h) && !hasNumericSafety(recipe, 63)) {
    add(recipe, "kamado-expert", "issue", "coeur/notes_securite", "Porc pièce entière sans 63 C + repos.", "Ajouter 63 C et repos 3 min minimum.");
  }
  if (isSeafood(recipe, h) && numbers(recipe.coeur).length && Math.min(...numbers(recipe.coeur)) < 55 && !recipe.notes_securite) {
    add(recipe, "kamado-expert", "warning", "notes_securite", "Poisson/fruits de mer sous 55 C sans note fraîcheur/sécurité.", "Ajouter note sur fraîcheur, service immédiat, ou cible 63 C sécurité.");
  }
  if (isRiskCategory(recipe) && isCuredOrColdSmoked(recipe) && !hasColdChainControl(recipe)) {
    add(recipe, "marinade-reviewer", "issue", "notes_securite", "Salaison/fumage froid sans contrôle froid/nitrite/parasites assez explicite.", "Ajouter froid <=4 C, nitrite si requis, congélation parasite pour poisson cru.");
  }
}

function auditMarinades(recipe) {
  if (recipe.cat === "sauces") return;
  const h = norm(textOf(recipe));
  const hasMarinade = /\b(marinade|mariner|marine|mariné|saumure|brine|rub|salaison|sel rose|nitrite|cure)\b/.test(h);
  if (!hasMarinade) return;
  if (recipe.marinade_h != null) {
    if (recipe.cat === "poisson" && recipe.marinade_h > 2) {
      add(recipe, "marinade-reviewer", "warning", "marinade_h", `Poisson mariné ${recipe.marinade_h} h.`, "Limiter à 15-60 min sauf gravlax/salaison structurée.");
    }
    if (recipe.cat === "volaille" && recipe.marinade_h > 24) {
      add(recipe, "marinade-reviewer", "warning", "marinade_h", `Volaille marinée ${recipe.marinade_h} h.`, "Réduire ou préciser saumure contrôlée au froid.");
    }
    if (["porc", "agneau"].includes(recipe.cat) && recipe.marinade_h > 24 && /\b(citron|vinaigre|acid|acide|yaourt|ananas|kiwi|papaye)\b/.test(h)) {
      add(recipe, "marinade-reviewer", "warning", "marinade_h", `Marinade acide longue (${recipe.marinade_h} h).`, "Réduire pour éviter texture farineuse/filandreuse.");
    }
  }
  if (/\b(ananas|kiwi|papaye)\b/.test(h) && /(\d+)\s*h/.test(h)) {
    add(recipe, "marinade-reviewer", "warning", "etapes", "Enzyme crue potentiellement laissée plusieurs heures.", "Limiter ananas/kiwi/papaye crus à 30 min ou cuire l'enzyme.");
  }
  const stepsText = norm(Array.isArray(recipe.etapes) ? recipe.etapes.join(" ") : "");
  const riskyReuse = /\b(badigeonn\w*|arros\w*|serv\w*)\b[^.]{0,80}\b(marinade|reste de marinade)\b|\b(gard\w*|reserve\w*|réserve\w*)\b[^.]{0,80}\breste de marinade\b|\b(marinade|reste de marinade)\b[^.]{0,80}\b(badigeonn\w*|arros\w*|serv\w*)\b/.test(stepsText);
  const safeReuse = /\b(portion propre|portion reservee|portion réservée|avant contact|sans contact|bouill|ebullition|ébullition|marinade bouillie|reservee propre|réservée propre|jetez la marinade|jeter la marinade)\b/.test(stepsText);
  if (riskyReuse && !safeReuse) {
    add(recipe, "marinade-reviewer", "issue", "etapes", "Réutilisation possible de marinade crue sans ébullition claire.", "Ajouter une ébullition franche avant usage en sauce.");
  }
}

function auditFrenchClassic(recipe) {
  const h = norm(textOf(recipe));
  if (!/france/.test(h) && !FRENCH_CLASSICS.test(recipe.nom)) return;
  if (/bourguignon/.test(h) && !/\b(paleron|macreuse|gite|gîte|joue)\b/.test(h)) {
    add(recipe, "french-chef-reviewer", "warning", "ings", "Bourguignon sans coupe canonique identifiable.", "Utiliser paleron, macreuse, gîte ou joue.");
  }
  if (/daube/.test(h) && !/\b(paleron|joue|gite|gîte)\b/.test(h)) {
    add(recipe, "french-chef-reviewer", "warning", "ings", "Daube sans coupe longue cuisson canonique identifiable.", "Utiliser paleron, joue ou gîte.");
  }
  if (/blanquette/.test(h) && !/\b(veau|epaule|épaule|tendron)\b/.test(h)) {
    add(recipe, "french-chef-reviewer", "warning", "ings", "Blanquette sans veau/épaule/tendron identifiable.", "Vérifier l'identité de la recette.");
  }
  if (/magret/.test(h) && /bbq|kansas|chimichurri/.test(h)) {
    add(recipe, "french-chef-reviewer", "improvement", "sauce", "Magret associé à une sauce non classique.", "Préférer jus miel/figue/agrumes ou sauce poivre selon recette.");
  }
  if (recipe.chef_ref?.note && String(recipe.chef_ref.note).length > 180) {
    add(recipe, "french-chef-reviewer", "improvement", "chef_ref.note", "Référence chef trop bavarde.", "Réduire à une phrase centrée sur la technique.");
  }
}

function auditEditorial(recipe) {
  if (recipe.cat === "sauces") return;
  if (recipe.astuce && String(recipe.astuce).length > 260) {
    add(recipe, "recipe-declutter", "improvement", "astuce", "Astuce longue pour un usage personnel.", "Réduire à deux phrases utiles en cuisine.");
  }
  const notes = Array.isArray(recipe.notes_securite) ? recipe.notes_securite : recipe.notes_securite ? [recipe.notes_securite] : [];
  if (notes.length > 2 || notes.some(note => String(note).length > 240)) {
    add(recipe, "recipe-declutter", "improvement", "notes_securite", "Notes sécurité longues ou nombreuses.", "Garder 1-2 points non redondants avec coeur.");
  }
  if (Array.isArray(recipe.erreurs)) {
    if (recipe.erreurs.length > 4) {
      add(recipe, "recipe-declutter", "improvement", "erreurs", "Trop d'erreurs listées.", "Garder les 3-4 erreurs vraiment spécifiques.");
    }
    for (const err of recipe.erreurs) {
      if (/ne pas bruler|ne pas brûler|ne pas trop cuire|surcuisson/i.test(err) && String(err).length < 70) {
        add(recipe, "recipe-declutter", "improvement", "erreurs", `Erreur trop générique: "${err}".`, "Remplacer par un piège propre au plat ou au kamado.");
      }
    }
  }
  if (Array.isArray(recipe.equipement)) {
    const trivial = recipe.equipement.filter(item => TRIVIAL_EQUIPMENT.test(item));
    if (trivial.length) {
      add(recipe, "recipe-declutter", "improvement", "equipement", `Équipement trivial: ${trivial.join(", ")}.`, "Garder seulement outils kamado ou non évidents.");
    }
  }
}

function auditSauces(recipe) {
  const saucesForRecipe = recipe._derived?.sauces || [];
  for (const sauce of saucesForRecipe) {
    const key = norm(sauce).replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const matched = sauceKeys.some(item => item === key || item.includes(key) || key.includes(item));
    if (!matched && saucesForRecipe.length > 1) {
      add(recipe, "kamado-expert", "improvement", "_derived.sauces", `Sauce suggérée absente du catalogue: ${sauce}.`, "Créer la base sauce ou simplifier les suggestions.");
    }
  }
}

for (const recipe of RECIPES) {
  auditTemperature(recipe);
  auditSafety(recipe);
  auditMarinades(recipe);
  auditFrenchClassic(recipe);
  auditEditorial(recipe);
  auditSauces(recipe);
}

const severityOrder = { issue: 0, warning: 1, improvement: 2 };
findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.recipe.localeCompare(b.recipe) || a.role.localeCompare(b.role));

const bySeverity = {
  issue: findings.filter(f => f.severity === "issue").length,
  warning: findings.filter(f => f.severity === "warning").length,
  improvement: findings.filter(f => f.severity === "improvement").length
};
const byRole = Object.fromEntries(
  [...new Set(findings.map(f => f.role))].sort().map(role => [role, findings.filter(f => f.role === role).length])
);
const cleanRecipes = cooking.filter(recipe => !findings.some(f => f.recipe === recipe.nom && f.severity !== "improvement")).length;
const report = {
  reviewedAt: new Date().toISOString(),
  recipesReviewed: RECIPES.length,
  cookingReviewed: cooking.length,
  references: OFFICIAL_SAFETY_REFERENCES,
  totals: {
    ...bySeverity,
    cleanCookingRecipes: cleanRecipes
  },
  byRole,
  findings
};

fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2) + "\n");

const top = findings.slice(0, 80);
const markdown = [
  "# Recipe Quality Audit",
  "",
  `Generated: ${report.reviewedAt}`,
  "",
  "## Summary",
  "",
  `- Recipes reviewed: ${report.recipesReviewed}`,
  `- Cooking recipes reviewed: ${report.cookingReviewed}`,
  `- Clean cooking recipes (no issue/warning): ${cleanRecipes}`,
  `- Issues: ${bySeverity.issue}`,
  `- Warnings: ${bySeverity.warning}`,
  `- Improvements: ${bySeverity.improvement}`,
  "",
  "## Role Counts",
  "",
  ...Object.entries(byRole).map(([role, count]) => `- ${role}: ${count}`),
  "",
  "## Top Findings",
  "",
  ...top.map(f => `- **${f.severity.toUpperCase()}** [${f.role}] ${f.recipe} \`${f.field}\`: ${f.message} ${f.suggestion || ""}`.trim()),
  "",
  top.length < findings.length ? `_${findings.length - top.length} more findings in ${path.relative(ROOT, REPORT_JSON)}._` : ""
].join("\n");

fs.writeFileSync(REPORT_MD, markdown + "\n");

console.log(JSON.stringify({
  recipesReviewed: report.recipesReviewed,
  cookingReviewed: report.cookingReviewed,
  cleanCookingRecipes: cleanRecipes,
  findings: bySeverity,
  byRole,
  report: path.relative(ROOT, REPORT_JSON),
  markdown: path.relative(ROOT, REPORT_MD)
}, null, 2));

if (bySeverity.issue > 0) {
  process.exit(1);
}

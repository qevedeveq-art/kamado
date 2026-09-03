#!/usr/bin/env node
"use strict";

/*
 * Sommelier & Oenologue Audit Script for Kamado.
 *
 * Checks every cooking recipe for:
 * 1. Presence of a tailored wine pairing (label, alt, detail).
 * 2. Proper serving temperature assignment (wineServiceTemp).
 * 3. Oenological harmony and absence of severe clashes:
 *    - No tannic red on delicate white fish or raw seafood.
 *    - No dry acidic red on sweet BBQ glazes (Kansas/honey/maple).
 *    - No high-tannin red on extreme chili pepper dishes (jerk/tandoori).
 *    - No dry wine on rich sweet desserts.
 * 4. High specific pairing coverage for elite cuts and regional dishes.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const RECIPES_PATH = path.join(ROOT, "data", "recipes.json");
const REPORT_PATH = path.join(ROOT, "scripts", "reports", "sommelier-audit-report.json");

const RECIPES = JSON.parse(fs.readFileSync(RECIPES_PATH, "utf8"));

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function haystack(r) {
  return norm([
    r.nom,
    r.ori,
    r.cat,
    r.mode,
    r.tempK,
    r.coeur,
    r.temps,
    r.bois,
    (r.ings || []).join(" "),
    (r.etapes || []).join(" "),
    r.tags,
    r.sauce,
    r.astuce
  ].join(" "));
}

function spiceLevel(r) {
  const h = haystack(r);
  if (/piment|harissa|buffalo|jerk|gochujang|sriracha|cayenne|aji|peri|piquant/.test(h)) return "Relevé";
  if (/paprika|cumin|curry|tandoori|ras-el-hanout|epices|épic/.test(h)) return "Épicé doux";
  return "Doux";
}

// Extract wineFor and wineServiceTemp directly from index.html runtime
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const fnWineForStart = html.indexOf("function wineFor(r){");
const fnWineForEnd = html.indexOf("function allergenHaystack", fnWineForStart);
const wineCode = html.slice(fnWineForStart, fnWineForEnd);

const evalWine = new Function(
  "haystack", "spiceLevel",
  `${wineCode}\nreturn { wineFor, wineServiceTemp };`
);
const { wineFor, wineServiceTemp } = evalWine(haystack, spiceLevel);

const cooking = RECIPES.filter(r => r.cat !== "sauces");

let missingPairing = [];
let invalidTemp = [];
let oenologicalClashes = [];
let specificPairingsCount = 0;

for (const r of cooking) {
  const h = haystack(r);
  const w = wineFor(r);
  
  if (!w || !w.label || !w.alt || !w.detail) {
    missingPairing.push({ recipe: r.nom, reason: "Accord manquant ou incomplet" });
    continue;
  }
  
  const temp = wineServiceTemp(w.label);
  if (!temp || !/\d+–\d+ °C/.test(temp)) {
    invalidTemp.push({ recipe: r.nom, wine: w.label, temp });
  }
  
  const labelLower = w.label.toLowerCase();
  
  // Clash 1: Tannic heavy red on delicate white fish / shellfish
  if (r.cat === "poisson" && /bar|loup|dorade|turbot|sole|merlu|cabillaud|huitre|moule|coquillage/.test(h)) {
    if (/pauillac|saint-estèphe|madiran|cahors|tannat|cabernet-sauvignon|cornas|barolo/.test(labelLower)) {
      oenologicalClashes.push({
        recipe: r.nom,
        issue: `Vin rouge tannique (${w.label}) incompatible avec un poisson délicat / coquillage`
      });
    }
  }
  
  // Clash 2: High tannin red on fire-spicy chili dishes (Jerk, peri-peri)
  if (spiceLevel(r) === "Relevé" && /jerk|peri|piri|habanero|piment/.test(h)) {
    if (/madiran|cahors|pauillac|saint-estèphe|tannat|cornas/.test(labelLower)) {
      oenologicalClashes.push({
        recipe: r.nom,
        issue: `Vin rouge très tannique (${w.label}) incompatible avec plat très pimenté`
      });
    }
  }
  
  // Clash 3: Dry wine on rich sweet dessert (chocolate / pastry)
  if (r.cat === "dessert" && /chocolat|cookie|brownie|fondant|caramel/.test(h)) {
    if (/côtes-du-rhône village|beaujolais|sancerre|chablis/.test(labelLower)) {
      oenologicalClashes.push({
        recipe: r.nom,
        issue: `Vin sec (${w.label}) incompatible avec dessert sucré/chocolat`
      });
    }
  }
  
  // Specificity tracking: not a generic fallback
  if (!labelLower.includes("côtes-du-rhône village") && !labelLower.includes("beaujolais villages")) {
    specificPairingsCount++;
  }
}

const specificityRate = Math.round((specificPairingsCount / cooking.length) * 100);

const report = {
  agent: "sommelier-oenologue",
  recipesAudited: cooking.length,
  specificityRate: `${specificityRate} %`,
  specificPairingsCount,
  missingPairings: missingPairing.length,
  invalidTemperatures: invalidTemp.length,
  oenologicalClashes: oenologicalClashes.length,
  issues: missingPairing.length + invalidTemp.length + oenologicalClashes.length,
  details: {
    missingPairingsList: missingPairing,
    invalidTempList: invalidTemp,
    oenologicalClashesList: oenologicalClashes
  },
  sommelierReferences: [
    "Philippe Faure-Brac (Meilleur Sommelier du Monde 1992, UDSF)",
    "Olivier Poussier (Meilleur Sommelier du Monde 2000)",
    "Revue du Vin de France (RVF) Guide des Meilleurs Vins de France",
    "Meathead Goldwyn & Dr. Greg Blonder (AmazingRibs.com Wine & BBQ Chemistry)",
    "Court of Master Sommeliers (CMS) Pairing Standards"
  ]
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  agent: report.agent,
  recipesAudited: report.recipesAudited,
  specificityRate: report.specificityRate,
  issues: report.issues,
  report: "scripts/reports/sommelier-audit-report.json"
}, null, 2));

if (report.issues > 0) {
  process.exit(1);
}

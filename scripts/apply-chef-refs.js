#!/usr/bin/env node
"use strict";

/*
 * Idempotent patcher qui rattache une référence de chef français à
 * chaque recette pour laquelle un chef du catalogue est *sans ambiguïté*
 * la référence technique reconnue.
 *
 * Source de vérité : index.html.
 * Catalogue :        data/chef-references.json.
 *
 * Stratégie de matching (volontairement restrictive) :
 *   1. On concatène nom + tags + ori (normalisés : lowercase + retrait des
 *      diacritiques). nom a un poids fort (les keywords qui matchent le
 *      nom peuvent l'emporter sur des matches faibles ailleurs).
 *   2. Un chef matche si au moins un de ses `keywords_match` apparaît
 *      dans le texte normalisé (recherche substring). Les recettes de
 *      catégorie `sauces` sont ignorées.
 *   3. Si exactement UN chef matche => on insère un champ `chef_ref:{...}`
 *      compressé avant la ligne `source:` de la recette. Sinon on logue
 *      AMBIGUOUS / NO_MATCH sans toucher au fichier.
 *   4. Une note manuellement rédigée (map NOTES) explique la technique
 *      précise qui justifie le rattachement. Si aucune note n'est
 *      définie pour une paire (chef, recette), on skip aussi.
 *
 * Idempotence : si la recette contient déjà `chef_ref:`, on ne fait rien.
 *
 * Après exécution : lance `node scripts/extract-data.js` pour régénérer
 * data/recipes.json.
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(ROOT, "index.html");
const CATALOG_PATH = path.join(ROOT, "data", "chef-references.json");

// ---------------------------------------------------------------------------
// Notes rédigées à la main : justification technique de chaque rattachement
// (chef_id + recipe_name → phrase courte "pourquoi c'est ce chef").
// Une paire non renseignée ici n'est pas insérée, même si le keyword matche
// (garde-fou anti-fausse-attribution).
// ---------------------------------------------------------------------------
const NOTES = {
  bocuse: {
    "Plat de côtes braisé au vin":
      "Pot-au-feu bourgeois avec plat de côtes : technique de blanchiment + bouillon clarifié qui reste la référence Bocuse pour cette pièce mijotée.",
  },
  ducasse: {
    "Épaule d'agneau confite 7 heures":
      "Épaule d'agneau confite douze heures : la cuisson lente à couvert popularisée par Ducasse (Grand Livre de Cuisine, cuisson longue basse température).",
  },
  bras: {
    "Brownie fondant en cocotte":
      "Cœur coulant en fonte : filiation directe du 'coulant au chocolat' créé par Michel Bras en 1981 — cœur cru surprise dans une pâte cuite.",
    "Brownie skillet noix de pécan":
      "Cœur coulant en skillet : structure inspirée du 'coulant au chocolat' de Michel Bras (1981), pâte extérieure cuite / cœur fondant.",
  },
  passard: {
    "Betteraves rôties en croûte de sel":
      "Betterave en croûte de sel de mer sous cendres : plat signature d'Alain Passard à l'Arpège depuis le virage légumier de 2001.",
    "Carottes glacées miso-miel":
      "Carotte glacée arrosée à sa réduction : héritière de la ligne 'légumes rôtis rendus complexes' que Passard a codifiée à l'Arpège.",
  },
  camdeborde: {
    "Magret de canard fumé-séché (charcuterie)":
      "Magret séché maison, fumage à froid, salaison précise : geste bistronomique typique du Sud-Ouest transmis par Camdeborde (formé chez Constant et Robuchon).",
  },
  darroze: {
    "Magret de canard, peau croustillante":
      "Magret rosé peau croustillante quadrillée, technique landaise : Hélène Darroze (4 générations landaises) reste la voix française la plus reconnue pour cette cuisson.",
  },
  blanc: {
    "Pintade rôtie aux marrons":
      "Volaille rôtie sur peau (démarche bressane) : Georges Blanc (3 étoiles ininterrompues depuis 1981 à Vonnas) est la référence française sur la volaille de Bresse rôtie.",
    "Chapon/dinde rôti des fêtes":
      "Grande volaille de fête rôtie : Georges Blanc reste la référence française pour la cuisson longue peau tendue d'une volaille de Bresse festive.",
  },
  marcon: {
    "Civet de sanglier fumé puis braisé":
      "Civet de sanglier au vin : plat de gibier auvergnat que Régis Marcon (3 étoiles à Saint-Bonnet-le-Froid) revendique dans sa cuisine forestière du Velay.",
    "Cailles rôties au raisin & lard":
      "Gibier à plume en cocotte, lard fumé au hêtre : technique forestière signature des Marcon (Saint-Bonnet-le-Froid).",
    "Champignons portobello farcis":
      "Gros champignons rôtis farcis : filiation directe du travail de Régis Marcon sur les champignons, Bocuse d'Or 1995 et référence mondiale sur le cèpe.",
  },
  lignac: {
    "Cookie géant en skillet":
      "Cookie géant fondant en poêle fonte : registre 'pâtisserie de bistrot familiale' que Cyril Lignac a popularisé auprès du grand public français.",
  },
  etchebest: {
    "Bavette à l'échalote":
      "Bavette à l'échalote façon bistrot : plat emblématique du répertoire bistrot que Philippe Etchebest (MOF 2000) défend comme fondamental du bistrot français.",
    "Entrecôte grillée maître d'hôtel":
      "Entrecôte saisie beurre composé : geste bistrot codifié dont Philippe Etchebest (MOF 2000) est la voix médiatique française contemporaine la plus lisible.",
  },
  guerard: {
    "Dorade en croûte de sel":
      "Poisson entier en croûte de sel : technique que Michel Guérard (3 étoiles à Eugénie-les-Bains) a portée au haut niveau dans sa Cuisine gourmande.",
    "Dorade royale en croûte de sel":
      "Dorade en croûte de sel : cuisson étouffée sous croûte que Michel Guérard a installée dans le répertoire haute cuisine française (Cuisine gourmande, 1978).",
  },
  escoffier: {
    "Rosbif rôti à l'anglaise":
      "Rôti de bœuf saignant tranché fin, jus de rôtissage : Escoffier codifie la méthode dans Le Guide culinaire (1903), toujours la base des rôtis français.",
    "Gigot d'agneau rôti rosé":
      "Gigot d'agneau rôti rosé, ail-romarin, jus de rôtissage : méthode codifiée par Escoffier dans Le Guide culinaire (1903), toujours la base pédagogique française.",
  },
  pellaprat: {
    "Tarte Tatin au kamado":
      "Tarte Tatin : Pellaprat codifie la méthode caramel-pâte inversée dans L'Art culinaire moderne (1935), version enseignée depuis au Cordon Bleu.",
    "Clafoutis aux cerises":
      "Clafoutis limousin aux cerises entières : méthode codifiée par Pellaprat dans L'Art culinaire moderne (1935), référence pédagogique française.",
  },
};

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function jsEscape(str) {
  // Échappe pour insertion dans une string JS double-quotée.
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function formatWork(work) {
  const publisher = work.publisher || "";
  const year = work.year || "";
  if (publisher && year) return `${work.title} (${publisher}, ${year})`;
  if (year) return `${work.title} (${year})`;
  return work.title;
}

function findRecipeBlock(lines, name) {
  const nomLine = `nom:"${name}",`;
  const nomIdx = lines.findIndex(l => l.trim() === nomLine);
  if (nomIdx < 0) return null;
  for (let i = nomIdx; i < Math.min(nomIdx + 80, lines.length); i++) {
    if (lines[i].startsWith("source:")) {
      return { nomIdx, sourceIdx: i };
    }
  }
  return null;
}

function blockHasChefRef(lines, block) {
  for (let i = block.nomIdx; i < block.sourceIdx; i++) {
    if (lines[i].startsWith("chef_ref:")) return true;
  }
  return false;
}

function insertChefRefLine(lines, block, chefRefLine) {
  const prev = lines[block.sourceIdx - 1];
  if (!prev.endsWith(",")) {
    lines[block.sourceIdx - 1] = prev + ",";
  }
  lines.splice(block.sourceIdx, 0, chefRefLine + ",");
}

// ---------------------------------------------------------------------------
// Chargement du catalogue et du HTML
// ---------------------------------------------------------------------------

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const chefs = catalog.chefs.filter(c => Array.isArray(c.keywords_match) && c.keywords_match.length > 0);

const html = fs.readFileSync(HTML_PATH, "utf8");
const lines = html.split("\n");

// ---------------------------------------------------------------------------
// Étape 1 : reconstruire la liste des recettes depuis index.html.
// On utilise la même stratégie que scripts/extract-data.js pour rester
// aligné avec la source de vérité.
// ---------------------------------------------------------------------------

function sliceBetween(markerStart, markerEnd, label) {
  const start = html.indexOf(markerStart);
  const end = html.indexOf(markerEnd, start);
  if (start < 0 || end < 0) {
    throw new Error(`Unable to locate ${label} markers in index.html`);
  }
  return html.slice(start, end);
}

const recipesBlock = sliceBetween("const CATS = [", "/* ================= GUIDE", "recipes");
const evalRecipes = new Function(`${recipesBlock}\nreturn { RECIPES };`);
const { RECIPES } = evalRecipes();

const cookingRecipes = RECIPES.filter(r => r.cat !== "sauces");

// ---------------------------------------------------------------------------
// Étape 2 : matching
// ---------------------------------------------------------------------------

const report = {
  applied: [],
  ambiguous: [],
  noMatch: [],
  skipped: [],
  missingNote: []
};

for (const recipe of cookingRecipes) {
  const haystack = norm([recipe.nom, recipe.tags, recipe.ori].join(" | "));
  const nameOnly = norm(recipe.nom);

  const matched = [];
  for (const chef of chefs) {
    for (const kw of chef.keywords_match) {
      const nk = norm(kw);
      if (!nk) continue;
      if (haystack.includes(nk)) {
        matched.push({ chef, keyword: nk, onName: nameOnly.includes(nk) });
        break;
      }
    }
  }

  if (matched.length === 0) {
    report.noMatch.push(recipe.nom);
    continue;
  }

  // Si plusieurs chefs matchent mais un seul le fait via le nom (poids fort),
  // on peut privilégier ce dernier. Sinon on considère ambigu.
  let picked = null;
  if (matched.length === 1) {
    picked = matched[0];
  } else {
    const onName = matched.filter(m => m.onName);
    if (onName.length === 1) picked = onName[0];
  }

  if (!picked) {
    report.ambiguous.push({
      name: recipe.nom,
      chefs: matched.map(m => m.chef.id)
    });
    continue;
  }

  const chef = picked.chef;
  const note = NOTES[chef.id] && NOTES[chef.id][recipe.nom];
  if (!note) {
    // Garde-fou : le keyword matche, mais aucune note manuelle
    // n'a été rédigée => on skip pour éviter une attribution douteuse.
    report.missingNote.push({ name: recipe.nom, chef: chef.id });
    continue;
  }

  const block = findRecipeBlock(lines, recipe.nom);
  if (!block) {
    report.skipped.push({ name: recipe.nom, reason: "block not found in index.html" });
    continue;
  }
  if (blockHasChefRef(lines, block)) {
    report.skipped.push({ name: recipe.nom, reason: "chef_ref already present" });
    continue;
  }

  const work = Array.isArray(chef.reference_works) && chef.reference_works.length
    ? chef.reference_works[0]
    : null;
  const workStr = work ? formatWork(work) : "";

  const chefRefLine =
    `chef_ref:{chef:"${jsEscape(chef.name)}",` +
    `work:"${jsEscape(workStr)}",` +
    `note:"${jsEscape(note)}"}`;

  insertChefRefLine(lines, block, chefRefLine);
  report.applied.push({ name: recipe.nom, chef: chef.id });
}

// ---------------------------------------------------------------------------
// Écriture
// ---------------------------------------------------------------------------

const patched = lines.join("\n");
if (patched !== html) {
  fs.writeFileSync(HTML_PATH, patched);
}

console.log(JSON.stringify({
  applied: report.applied.length,
  ambiguous: report.ambiguous.length,
  noMatch: report.noMatch.length,
  skipped: report.skipped.length,
  missingNote: report.missingNote.length
}, null, 2));

// Log détaillé (utile pour curation manuelle ultérieure).
for (const a of report.ambiguous) {
  console.log(`AMBIGUOUS: ${a.name} → [${a.chefs.join(", ")}]`);
}
for (const s of report.skipped) {
  console.log(`SKIPPED: ${s.name} (${s.reason})`);
}
for (const m of report.missingNote) {
  console.log(`MISSING_NOTE: ${m.name} (chef=${m.chef}, keyword match but no note defined)`);
}

// Régénération de data/recipes.json pour rester cohérent avec index.html.
try {
  const extractOut = execSync("node scripts/extract-data.js", { cwd: ROOT, encoding: "utf8" });
  console.log("\nextract-data.js OK\n" + extractOut);
} catch (err) {
  console.error("extract-data.js failed:", err.message);
  process.exitCode = 1;
}

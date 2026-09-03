#!/usr/bin/env node
"use strict";

/*
 * Chef Culinary & Allergen Audit.
 *
 * Checks every recipe for:
 * 1. Accurate 14 EU allergen detection without false positives (e.g. muscade ≠ nut).
 * 2. Food safety core temperatures (USDA / FoodSafety.gov guidelines).
 * 3. Culinary coherence (cut, technique, doneness, smoke wood pairing, repos).
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const RECIPES_PATH = path.join(ROOT, "data", "recipes.json");
const REPORT_PATH = path.join(ROOT, "scripts", "reports", "chef-audit-report.json");

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

function allergenHaystack(r) {
  return norm([
    r.nom,
    r.cat,
    (r.ings || []).join(" "),
    r.sauce
  ].filter(Boolean).join(" "));
}

function detectAllergens(r) {
  const h = allergenHaystack(r);
  const a = [];

  // Lait (exclure lait/crème de coco, beurre de cacahuète)
  const laitText = h.replace(/(?:lait|creme) de coco/g, "").replace(/beurre de (?:cacahuete|cajou|cacahouete)/g, "");
  if (/fromage|beurre|creme|yaourt|yogourt|\blait\b|mozzarella|feta|cheddar|mascarpone|parmesan|halloumi|comte\b|gruyere|gorgonzola|roquefort|chevre|pecorino|reblochon|raclette|emmental|brie\b|camembert|ricotta|burrata|paneer|ghee/.test(laitText)) {
    a.push("lait");
  }

  // Gluten (exclure pâtes aromatiques de curry/piment/soja/tomate)
  const glutenText = h.replace(/pate de (?:piment|curry|soja|arachide|sesame|tomate|miso|ail|gingembre)/g, "");
  if (/gluten|farine|\bpain\b|pita|naan|\bbun\b|\bbuns\b|baguette|\bpates?\b|chapelure|focaccia|pizza|brioche|toast|seigle|orge|avoine|\bble\b|malt|\bbiere\b|ale\b|lager|stout|guinness|worcestershire|speculoos|crouton/.test(glutenText)) {
    a.push("gluten");
  }

  // Œufs (exclure boeuf/bœuf qui contient oeuf en sous-chaîne !)
  const oeufText = h.replace(/\bb[oœ]eufs?\b/g, "").replace(/b[oœ]euf/g, "");
  if (/\b[oœ]eufs?\b|mayonnaise|aioli|bearnaise|hollandaise/.test(oeufText)) {
    a.push("œuf");
  }

  // Poisson (exclure "au lieu de", et pour sauces exclure mention poisson du nom)
  const poissonText = (r.cat === "sauces" ? h.replace(/\b(?:rub|sauce|marinade)[^,]*(?:poisson|saumon)/g, "") : h).replace(/au lieu de/g, "");
  if (r.cat === "poisson" || /saumon|thon\b|cabillaud|daurade|dorade|truite|maquereau|sardine|hareng|anchois|\bbar\b|loup de mer|turbot|\blieu\b|merlu|eglefin|\bsole\b|fletan|morue|espadon|poisson|nuoc.mam|worcestershire/.test(poissonText)) {
    a.push("poisson");
  }

  // Crustacés
  if (/crevette|gambas|homard|langouste|langoustine|crabe|ecrevisse|tourteau/.test(h)) {
    a.push("crustacés");
  }

  // Mollusques (exclure fruits à coque et à la coque)
  const molluskText = h.replace(/fruits? a coque/g, "").replace(/a la coque/g, "");
  if (/moule|huitre|saint-jacques|calamar|encornet|poulpe|seiche|coquillage|palourde|\bcoques?\b/.test(molluskText)) {
    a.push("mollusques");
  }

  // Arachides
  if (/cacahuete|arachide/.test(h)) {
    a.push("arachides");
  }

  // Fruits à coque (exclure muscade, coco, saint-jacques, veau, joue, beurre et beurre noisette)
  const nutText = h.replace(/noix de (?:muscade|coco|saint-jacques|st-jacques|veau|joue|beurre)/g, "")
                   .replace(/beurre noisette/g, "beurre")
                   .replace(r.cat === "poisson" ? /\bles noix\b/g : /$^/, "");
  if (/\bamandes?\b|\bnoisettes?\b|\bpecans?\b|\bpistaches?\b|noix de cajou|\bcajous?\b|\bmacadamias?\b|\bpignons?\b|\bnoix\b/.test(nutText)) {
    a.push("fruits à coque");
  }

  // Sésame
  if (/sesame|tahini|tahin|zaatar|gomasio/.test(h)) {
    a.push("sésame");
  }

  // Soja
  if (/soja|edamame|miso|tofu|teriyaki|tamari/.test(h)) {
    a.push("soja");
  }

  // Moutarde
  if (/moutarde/.test(h)) {
    a.push("moutarde");
  }

  // Céleri
  if (/celeri/.test(h)) {
    a.push("céleri");
  }

  return [...new Set(a)];
}

const issues = [];
const warnings = [];
const allergenStats = {};

RECIPES.forEach(r => {
  const h = allergenHaystack(r);
  const detectedAllergens = detectAllergens(r);

  detectedAllergens.forEach(all => {
    allergenStats[all] = (allergenStats[all] || 0) + 1;
  });

  // Check 1: Noix de muscade false positive guard
  if (/noix de muscade|muscade/.test(h) && !/amande|noisette|pecan|pistache|cajou|pignon/.test(h)) {
    if (detectedAllergens.includes("fruits à coque")) {
      issues.push({
        recipe: r.nom,
        type: "allergen_false_positive",
        detail: "Noix de muscade ne doit pas être étiquetée comme fruit à coque (épice ≠ allergène coque)."
      });
    }
  }

  // Check 2: Lait de coco false positive guard
  if (/lait de coco/.test(h) && !/beurre|fromage|creme|yaourt|parmesan|mozzarella|\blait\b(?! de coco)/.test(h)) {
    if (detectedAllergens.includes("lait")) {
      issues.push({
        recipe: r.nom,
        type: "allergen_false_positive",
        detail: "Lait de coco végétal ne doit pas être étiqueté comme allergène lait/lactose."
      });
    }
  }

  // Check 3: Beer gluten tagging
  if (/biere|ale\b|stout|lager|guinness/.test(h)) {
    if (!detectedAllergens.includes("gluten")) {
      issues.push({
        recipe: r.nom,
        type: "allergen_omission",
        detail: "La bière contient du gluten d'orge/malt et doit obligatoirement être étiquetée avec gluten."
      });
    }
  }

  // Check 4: Fish category allergen tagging
  if (r.cat === "poisson") {
    if (!detectedAllergens.includes("poisson") && !detectedAllergens.includes("crustacés") && !detectedAllergens.includes("mollusques")) {
      issues.push({
        recipe: r.nom,
        type: "allergen_omission",
        detail: "Recette de la catégorie poisson sans allergène poisson/crustacés/mollusques."
      });
    }
  }

  // Check 5: Boeuf must never trigger oeuf (unless true egg ingredient)
  if (r.nom.includes("Côte de bœuf") || r.nom.includes("Entrecôte") || r.nom.includes("Brisket")) {
    if (detectedAllergens.includes("œuf")) {
      issues.push({
        recipe: r.nom,
        type: "allergen_false_positive",
        detail: "Faux positif d'œuf détecté dans une découpe de bœuf pure."
      });
    }
  }

  // Check 6: Beurre noisette must never trigger fruits à coque
  if (r.nom.includes("beurre noisette") && !/amande|pecan|pistache|pignon/.test(h)) {
    if (detectedAllergens.includes("fruits à coque")) {
      issues.push({
        recipe: r.nom,
        type: "allergen_false_positive",
        detail: "Le beurre noisette (beurre bruni) ne doit pas être étiqueté comme fruit à coque."
      });
    }
  }

  // Check 5: Food safety temperatures for cooking recipes
  if (r.cat !== "sauces") {
    const coeurNumbers = [...String(r.coeur || "").matchAll(/(\d{2,3})/g)].map(m => parseInt(m[1], 10));
    const minCoeur = coeurNumbers.length ? Math.min(...coeurNumbers) : null;
    const maxCoeur = coeurNumbers.length ? Math.max(...coeurNumbers) : null;

    if (r.cat === "volaille") {
      if (minCoeur !== null && maxCoeur < 72 && !/magret/i.test(r.nom)) {
        warnings.push({
          recipe: r.nom,
          type: "food_safety_poultry",
          detail: `Volaille entière ou cuisse à cœur (${r.coeur}) inférieure aux recommandations sanitaires (74 °C conseillé par USDA/FSIS).`
        });
      }
    }

    if (r.cat === "porc" && !/pulled|effiloche|brais/i.test(h)) {
      if (minCoeur !== null && maxCoeur < 60) {
        warnings.push({
          recipe: r.nom,
          type: "food_safety_pork",
          detail: `Porc à cœur (${r.coeur}) inférieur à 60 °C (sécurité minimale 63 °C USDA).`
        });
      }
    }

    // Check 6: Rest time presence
    if (r.repos_min == null && /boeuf|porc|agneau|volaille/i.test(r.cat)) {
      warnings.push({
        recipe: r.nom,
        type: "culinary_repos_missing",
        detail: "Temps de repos omis sur une pièce de viande (essentiel pour redistribuer les sucs)."
      });
    }
  }
});

const report = {
  agent: "chef-reviewer",
  timestamp: new Date().toISOString(),
  recipesAudited: RECIPES.length,
  cookingRecipes: RECIPES.filter(r => r.cat !== "sauces").length,
  allergenDistribution: allergenStats,
  issuesCount: issues.length,
  warningsCount: warnings.length,
  issues,
  warnings
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  agent: "chef-reviewer",
  recipesAudited: RECIPES.length,
  allergenStats,
  issues: issues.length,
  warnings: warnings.length,
  reportFile: path.relative(ROOT, REPORT_PATH)
}, null, 2));

if (issues.length > 0) {
  process.exit(1);
}

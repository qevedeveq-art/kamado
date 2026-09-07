#!/usr/bin/env node
/*
 * Extracts CATS, RECIPES and the long-form guides from index.html into
 * stable JSON / Markdown artifacts under data/.
 *
 * Source of truth for the running PWA remains index.html. These extracts are
 * used by audit-data.js (and any future build pipeline). Run after every
 * recipe change:
 *
 *   node scripts/extract-data.js
 */

const fs = require("fs");
const path = require("path");
const { generateEditorialPages } = require("./generate-editorial-pages.js");

const ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(ROOT, "index.html");
const DATA_DIR = path.join(ROOT, "data");

const html = fs.readFileSync(HTML_PATH, "utf8");

function sliceBetween(markerStart, markerEnd, label) {
  const start = html.indexOf(markerStart);
  const end = html.indexOf(markerEnd, start);
  if (start < 0 || end < 0) {
    throw new Error(`Unable to locate ${label} markers in index.html`);
  }
  return html.slice(start, end);
}

const recipesBlock = sliceBetween("const CATS = [", "/* ================= GUIDE", "recipes");
const helpersBlock = sliceBetween("function norm", "/* ---- helpers analyse", "helpers");
const guideBlock = sliceBetween("const GUIDE = `", "const TEMP = `", "GUIDE");
const tempBlock = sliceBetween("const TEMP = `", "const VINS = `", "TEMP");
const vinsBlock = sliceBetween("const VINS = `", "/* ================= LOGIQUE", "VINS");

const evalRecipes = new Function(
  `${recipesBlock}\nreturn { RECIPES, CATS };`
);
const { RECIPES, CATS } = evalRecipes();

const evalHelpers = new Function(
  `${recipesBlock}\n${helpersBlock}\nreturn { saucesFor, allergens, seasonFor, spiceLevel };`
);
const helpers = evalHelpers();

function extractBacktickString(block, varName) {
  const prefix = `const ${varName} = \``;
  const start = block.indexOf(prefix);
  if (start < 0) throw new Error(`Cannot find template start for ${varName}`);
  const after = start + prefix.length;
  const end = block.indexOf("`", after);
  if (end < 0) throw new Error(`Cannot find template end for ${varName}`);
  return block.slice(after, end);
}

const guideText = extractBacktickString(guideBlock, "GUIDE");
const tempText = extractBacktickString(tempBlock, "TEMP");
const vinsText = extractBacktickString(vinsBlock, "VINS");

fs.mkdirSync(DATA_DIR, { recursive: true });

const enriched = RECIPES.map(recipe => {
  const isSauce = recipe.cat === "sauces";
  return {
    ...recipe,
    _derived: isSauce ? null : {
      spice: helpers.spiceLevel(recipe),
      season: helpers.seasonFor(recipe),
      sauces: helpers.saucesFor(recipe),
      allergens: helpers.allergens(recipe)
    }
  };
});

const recipesJsonPath = path.join(DATA_DIR, "recipes.json");
const categoriesJsonPath = path.join(DATA_DIR, "categories.json");

fs.writeFileSync(recipesJsonPath, JSON.stringify(enriched, null, 2) + "\n");
fs.writeFileSync(categoriesJsonPath, JSON.stringify(CATS, null, 2) + "\n");

fs.writeFileSync(path.join(DATA_DIR, "guide.html"), guideText);
fs.writeFileSync(path.join(DATA_DIR, "temperatures.html"), tempText);
fs.writeFileSync(path.join(DATA_DIR, "vins.html"), vinsText);

const editorial = generateEditorialPages({
  recipes: enriched,
  categories: CATS,
  guide: guideText,
  temperatures: tempText,
  wines: vinsText
});

const summary = {
  recipes: enriched.length,
  categories: CATS.length,
  guideChars: guideText.length,
  tempChars: tempText.length,
  vinsChars: vinsText.length,
  editorialPages: editorial.urls
};
console.log(JSON.stringify(summary, null, 2));

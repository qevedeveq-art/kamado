/*
 * Pure functions used by scripts/import-url.js.
 *
 * Split out so tests can import without side effects.
 */

"use strict";

const { deriveDifficulty, deriveVents, deriveCharbon, deriveRepos } = require("./derive");

// ---------- HTML → JSON-LD blocks ----------

function parseHtml(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch (_) {
      // Some sites embed comments or trailing commas — try to salvage.
      try {
        const cleaned = raw.replace(/^<!--[\s\S]*?-->/g, "").trim();
        blocks.push(JSON.parse(cleaned));
      } catch (_) {
        // skip malformed block
      }
    }
  }
  return blocks;
}

function isRecipeNode(node) {
  if (!node || typeof node !== "object") return false;
  const t = node["@type"];
  if (t === "Recipe") return true;
  if (Array.isArray(t) && t.includes("Recipe")) return true;
  return false;
}

function extractRecipe(blocks) {
  const stack = [...blocks];
  while (stack.length) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    if (isRecipeNode(node)) return node;
    if (node && typeof node === "object") {
      if (Array.isArray(node["@graph"])) stack.push(...node["@graph"]);
      for (const v of Object.values(node)) {
        if (v && typeof v === "object") stack.push(v);
      }
    }
  }
  return null;
}

// ---------- Duration & yield parsing ----------

function parseIsoDurationMinutes(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!m) return null;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  return h * 60 + min;
}

function formatDuration(totalMin) {
  if (totalMin == null || isNaN(totalMin)) return "";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} h ${m}` : `${h} h`;
}

function parseYield(val) {
  if (val == null) return "4 pers";
  const s = Array.isArray(val) ? val.join(" ") : String(val);
  const m = s.match(/(\d+)(?:\s*[-–à]\s*(\d+))?/);
  if (!m) return s.length < 20 ? s : "4 pers";
  return m[2] ? `${m[1]}–${m[2]} pers` : `${m[1]} pers`;
}

// ---------- Field extractors ----------

function textOf(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(textOf).filter(Boolean).join(" ");
  if (typeof v === "object") return textOf(v.name || v.text || v["@value"] || "");
  return String(v);
}

function ingredientsOf(node) {
  const raw = node.recipeIngredient || node.ingredients || [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(x => textOf(x).trim()).filter(Boolean);
}

function stepsOf(node) {
  const raw = node.recipeInstructions || node.instructions || [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const item of arr) {
    if (typeof item === "string") {
      out.push(cleanStep(item));
      continue;
    }
    if (item && item["@type"] === "HowToSection" && Array.isArray(item.itemListElement)) {
      for (const sub of item.itemListElement) out.push(cleanStep(textOf(sub)));
      continue;
    }
    out.push(cleanStep(textOf(item)));
  }
  return out.filter(Boolean);
}

function cleanStep(s) {
  return s.replace(/\s+/g, " ").trim();
}

function originOf(node, url) {
  const a = node.author;
  if (a) {
    const name = textOf(a);
    if (name) return name;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source externe";
  }
}

// ---------- Category inference ----------

const CATEGORY_KEYWORDS = [
  ["poisson", /\b(saumon|thon|cabillaud|truite|bar|dorade|maquereau|sardine|lotte|poisson|fish|salmon|tuna|cod|trout|crevette|gambas|coquille|calamar|poulpe|homard|langoustine|moule|huitre|shrimp|prawn|lobster|shellfish)\b/i],
  ["volaille", /\b(poulet|poularde|dinde|chapon|caille|canard|magret|chicken|turkey|duck|quail|volaille|poultry)\b/i],
  ["porc", /\b(porc|pork|jambon|ham|bacon|lard|chorizo|saucisse|sausage|pancetta|pulled pork|ribs|travers|spareribs|échine|carré de porc)\b/i],
  ["agneau", /\b(agneau|lamb|mouton|mutton|gigot|selle d'agneau|chevreuil|venison|sanglier|gibier)\b/i],
  ["boeuf", /\b(bœuf|boeuf|beef|steak|brisket|entrecôte|côte de bœuf|rumsteck|onglet|bavette|filet|hachis|hamburger|burger|tomahawk|picanha|tri-tip|ribeye|sirloin)\b/i],
  ["pizza", /\b(pizza|foccacia|focaccia|calzone|pain|bread|fougasse|naan|pita)\b/i],
  ["dessert", /\b(dessert|gâteau|cake|tarte|crumble|pancake|brownie|cookie|clafoutis|cheesecake|pain perdu|banana bread)\b/i],
  ["legumes", /\b(légume|vegetable|carotte|courge|aubergine|poivron|patate|potato|maïs|corn|salade|salad|champignon|mushroom|asperge|artichaut|chou|brocoli|cauliflower)\b/i],
  ["vegetarien", /\b(vegetarian|vegan|végé|végétarien|tofu|tempeh|halloumi|paneer|falafel)\b/i],
  ["sauces", /\b(sauce|marinade|rub|dressing|vinaigrette|mayonnaise|mayo|chimichurri|salsa|ketchup)\b/i],
  ["monde", /\b(tandoori|tikka|jerk|teriyaki|yakitori|char siu|bulgogi|kofta|shawarma|kebab|tagine|jerk|tacos|carnitas|birria|asado)\b/i]
];

function inferCategory(name, ingredients) {
  const hay = (name + " " + ingredients.join(" ")).toLowerCase();
  for (const [cat, re] of CATEGORY_KEYWORDS) {
    if (re.test(hay)) return cat;
  }
  return "monde";
}

// Conservative USDA/FoodSafety.gov-aligned defaults per category.
// The curator agent should refine these for the specific cut.
const DEFAULT_COEUR = {
  boeuf: "54–60 °C (saignant à à point) — ajuster selon la coupe",
  porc: "63 °C (rosé) ou 74 °C (à point) — 96 °C pour effiloché",
  volaille: "74 °C à cœur (sécurité USDA)",
  agneau: "55–63 °C (saignant à à point)",
  poisson: "50 °C (nacré) ou 63 °C (bien cuit) — sécurité FoodSafety.gov",
  legumes: "tendre à la sonde",
  pizza: "croûte dorée, dessous croustillant",
  monde: "adapter selon la protéine principale",
  dessert: "à ajuster selon la préparation",
  vegetarien: "tendre / doré selon l'ingrédient",
  sauces: null
};

// ---------- Map to Kamado schema ----------

function mapToKamado(ld, url) {
  const nom = textOf(ld.name).replace(/\s+/g, " ").trim();
  if (!nom) throw new Error("Recipe has no name");
  const ings = ingredientsOf(ld);
  const etapes = stepsOf(ld);
  if (ings.length === 0) throw new Error("Recipe has no ingredients");
  if (etapes.length === 0) throw new Error("Recipe has no instructions");

  const cookMin = parseIsoDurationMinutes(ld.cookTime);
  const prepMin = parseIsoDurationMinutes(ld.prepTime);
  const totalMin = parseIsoDurationMinutes(ld.totalTime) || (cookMin ?? 0) + (prepMin ?? 0) || 45;
  const cat = inferCategory(nom, ings);

  // Conservative kamado defaults — curator agent refines these.
  const isSauce = cat === "sauces";
  const defaultMode = isSauce ? "Préparation" : "Indirect";
  const defaultTempK = isSauce ? "—" : "180 °C";
  const defaultBois = isSauce ? "" : "Hêtre (fumée douce)";

  const kamadoMode = defaultMode;
  const durMin = totalMin;
  const difficulty = isSauce ? 2 : deriveDifficulty(durMin, kamadoMode);
  const vents = isSauce ? null : deriveVents(180);
  const charbon = isSauce ? null : deriveCharbon(durMin);
  const repos = deriveRepos(cat, kamadoMode, durMin);

  const recipe = {
    cat,
    nom,
    ori: `${originOf(ld, url)} · importé depuis URL`,
    pour: parseYield(ld.recipeYield),
    mode: kamadoMode,
    tempK: defaultTempK,
    coeur: DEFAULT_COEUR[cat] || DEFAULT_COEUR.monde,
    temps: formatDuration(durMin),
    bois: defaultBois || "—",
    tags: "importé",
    ings,
    etapes,
    astuce: "Recette importée automatiquement — adapter la température et le mode au kamado (voir agent kamado-recipe-curator).",
    difficulty,
    charbon_kg: charbon,
    repos_min: repos,
    vents,
    source: url,
    notes_securite: "Recette importée : vérifier les températures à cœur (viande, volaille, poisson) avant de servir. Voir FoodSafety.gov / USDA FSIS."
  };

  // Strip nulls so the curator can decide what to add explicitly.
  for (const k of Object.keys(recipe)) {
    if (recipe[k] === null || recipe[k] === "") delete recipe[k];
  }
  return recipe;
}

// ---------- Serialize as JS literal (matching index.html style) ----------

function jsString(s) {
  return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';
}

function jsValue(v) {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return "[" + v.map(jsValue).join(",") + "]";
  if (typeof v === "object") {
    const parts = Object.entries(v).map(([k, val]) => `${k}:${jsValue(val)}`);
    return "{" + parts.join(",") + "}";
  }
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  return jsString(v);
}

// Field order used by index.html so imports look native.
const FIELD_ORDER = [
  "cat", "nom", "ori", "pour", "mode", "tempK", "coeur", "temps", "bois", "tags",
  "ings", "etapes", "astuce",
  "difficulty", "charbon_kg", "marinade_h", "repos_min",
  "vents", "wrap", "brine",
  "equipement", "substitutions", "erreurs", "notes_securite",
  "phases",
  "source", "sauce"
];

function formatAsJsLiteral(recipe) {
  const keys = FIELD_ORDER.filter(k => recipe[k] !== undefined);
  const extras = Object.keys(recipe).filter(k => !FIELD_ORDER.includes(k));
  const lines = [];
  for (const k of [...keys, ...extras]) {
    lines.push(`${k}:${jsValue(recipe[k])}`);
  }
  return "{" + lines.join(",\n") + "}";
}

module.exports = {
  parseHtml,
  extractRecipe,
  parseIsoDurationMinutes,
  parseYield,
  inferCategory,
  mapToKamado,
  formatAsJsLiteral
};

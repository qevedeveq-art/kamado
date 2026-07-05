#!/usr/bin/env node
/*
 * Import a recipe from a URL into index.html.
 *
 * Strategy: fetch the page, extract every <script type="application/ld+json">,
 * pick the schema.org/Recipe object, map it onto Kamado's recipe schema with
 * sensible defaults, then inject a JS object literal just before the closing
 * `];` of the RECIPES array in index.html.
 *
 * Kamado-specific fields (mode, tempK, coeur, bois, vents, phases, notes_securite)
 * are intentionally left conservative — the kamado-recipe-curator agent enriches
 * them afterwards.
 *
 * Usage:
 *   node scripts/import-url.js <url> [--dry-run] [--html <path>]
 *
 * The --html flag reads local HTML instead of fetching (used by tests).
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { parseHtml, extractRecipe, mapToKamado, formatAsJsLiteral } = require("./import-url-lib");

const ROOT = path.resolve(__dirname, "..");
const INDEX_HTML = path.join(ROOT, "index.html");
// We match just `];` here — the previous recipe already ends with a trailing
// comma, so we insert `<literal>,\n` right before `];`. Modern JS allows a
// trailing comma before `]`, so subsequent inserts stay clean.
const CLOSING_MARKER = "\n];\n/* ================= GUIDE";

async function loadSource(argv) {
  const htmlFlag = argv.indexOf("--html");
  if (htmlFlag >= 0) {
    const p = argv[htmlFlag + 1];
    if (!p) throw new Error("--html requires a path");
    return { html: fs.readFileSync(p, "utf8"), url: `file://${path.resolve(p)}` };
  }
  const url = argv.find(a => a.startsWith("http"));
  if (!url) throw new Error("Provide a URL or --html <path>");
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "Mozilla/5.0 KamadoImporter/1.0" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return { html: await res.text(), url };
}

function recipeExists(indexHtml, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`nom:\\s*"${escaped}"`).test(indexHtml);
}

function inject(indexHtml, jsLiteral) {
  const idx = indexHtml.indexOf(CLOSING_MARKER);
  if (idx < 0) throw new Error(`Cannot locate closing marker: ${CLOSING_MARKER.trim()}`);
  // idx points to the `\n` right before `];`. Insert `<literal>,\n` there so
  // the file becomes `...,<blank>,\n<literal>,\n];\n` — an extra trailing
  // comma before `]` is valid JS and lets subsequent imports stay symmetric.
  return indexHtml.slice(0, idx + 1) + jsLiteral + ",\n" + indexHtml.slice(idx + 1);
}

async function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const { html, url } = await loadSource(argv);
  const parsed = parseHtml(html);
  const recipeLd = extractRecipe(parsed);
  if (!recipeLd) {
    throw new Error("No schema.org/Recipe found in JSON-LD blocks");
  }
  const recipe = mapToKamado(recipeLd, url);
  const literal = formatAsJsLiteral(recipe);

  if (dryRun) {
    process.stdout.write(literal + "\n");
    return { recipe, dryRun: true };
  }

  const current = fs.readFileSync(INDEX_HTML, "utf8");
  if (recipeExists(current, recipe.nom)) {
    throw new Error(`Recipe "${recipe.nom}" already exists in index.html`);
  }
  const updated = inject(current, literal);
  fs.writeFileSync(INDEX_HTML, updated);
  process.stderr.write(`Injected "${recipe.nom}" (cat=${recipe.cat}) into index.html\n`);
  process.stderr.write("Next: node scripts/extract-data.js && node scripts/audit-data.js && node --test tests/*.test.js\n");
  return { recipe, injected: true };
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(err => {
    process.stderr.write(`import-url: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { main };

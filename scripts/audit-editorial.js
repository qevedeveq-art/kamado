#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL, GUIDE_DEFINITIONS } = require("./generate-editorial-pages.js");

const ROOT = path.resolve(__dirname, "..");
const recipes = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "recipes.json"), "utf8"));
const failures = [];

function read(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`${relativePath}: missing`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function validateJsonLd(html, label) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) failures.push(`${label}: missing JSON-LD`);
  for (const block of blocks) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      failures.push(`${label}: invalid JSON-LD (${error.message})`);
    }
  }
}

const expectedUrls = new Set([
  `${SITE_URL}/`,
  `${SITE_URL}/recettes/`,
  ...recipes.map(recipe => `${SITE_URL}/recettes/${recipe.id}/`),
  `${SITE_URL}/guides/`,
  ...GUIDE_DEFINITIONS.map(guide => `${SITE_URL}/guides/${guide.id}/`)
]);

for (const recipe of recipes) {
  const relativePath = `recettes/${recipe.id}/index.html`;
  const html = read(relativePath);
  const canonical = `${SITE_URL}/recettes/${recipe.id}/`;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) failures.push(`${relativePath}: invalid canonical`);
  if (!html.includes(`../../#recette=${encodeURIComponent(recipe.id)}`)) failures.push(`${relativePath}: missing app deep link`);
  if (!html.includes("<h2>Ingrédients</h2>")) failures.push(`${relativePath}: missing ingredients`);
  if (!html.includes("<h2>Préparation et cuisson</h2>")) failures.push(`${relativePath}: missing instructions`);
  if (html.includes('"@type":"Recipe"')) failures.push(`${relativePath}: Recipe markup requires a representative dish image`);
  validateJsonLd(html, relativePath);
}

const recipeDirs = fs.existsSync(path.join(ROOT, "recettes"))
  ? fs.readdirSync(path.join(ROOT, "recettes"), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name)
  : [];
const expectedRecipeIds = new Set(recipes.map(recipe => recipe.id));
for (const id of recipeDirs) {
  if (!expectedRecipeIds.has(id)) failures.push(`recettes/${id}: stale generated page`);
}

const catalogue = read("recettes/index.html");
if ((catalogue.match(/class="recipe-card"/g) || []).length !== recipes.length) failures.push("recettes/index.html: incomplete catalogue");
if (!catalogue.includes(`<link rel="canonical" href="${SITE_URL}/recettes/">`)) failures.push("recettes/index.html: invalid canonical");
validateJsonLd(catalogue, "recettes/index.html");

const guideIndex = read("guides/index.html");
if (!guideIndex.includes(`<link rel="canonical" href="${SITE_URL}/guides/">`)) failures.push("guides/index.html: invalid canonical");
validateJsonLd(guideIndex, "guides/index.html");
for (const guide of GUIDE_DEFINITIONS) {
  const html = read(`guides/${guide.id}/index.html`);
  if (!html.includes(`<link rel="canonical" href="${SITE_URL}/guides/${guide.id}/">`)) failures.push(`guides/${guide.id}: invalid canonical`);
  if (html.includes("wineFilterInput")) failures.push(`guides/${guide.id}: contains an inactive app-only control`);
  validateJsonLd(html, `guides/${guide.id}/index.html`);
}

const sitemap = read("sitemap.xml");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]));
for (const url of expectedUrls) if (!sitemapUrls.has(url)) failures.push(`sitemap.xml: missing ${url}`);
for (const url of sitemapUrls) if (!expectedUrls.has(url)) failures.push(`sitemap.xml: unexpected ${url}`);

const robots = read("robots.txt");
if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) failures.push("robots.txt: sitemap missing");

const rootHtml = read("index.html");
[
  `<link rel="canonical" href="${SITE_URL}/">`,
  '<meta name="description"',
  '<meta property="og:title"',
  '<script type="application/ld+json" id="siteStructuredData">',
  '<script src="./scripts/editorial-search.js"></script>'
].forEach(fragment => {
  if (!rootHtml.includes(fragment)) failures.push(`index.html: missing ${fragment}`);
});

const result = {
  ok: failures.length === 0,
  recipePages: recipes.length,
  guidePages: GUIDE_DEFINITIONS.length,
  sitemapUrls: sitemapUrls.size,
  failures
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;

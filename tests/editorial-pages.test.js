"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");

test("editorial audit validates canonical recipe pages, guides and sitemap", () => {
  const result = JSON.parse(execFileSync(process.execPath, ["scripts/audit-editorial.js"], {
    cwd: ROOT,
    encoding: "utf8"
  }));
  assert.equal(result.ok, true, result.failures.join("\n"));
  assert.equal(result.recipePages, 269);
  assert.equal(result.recipePagesEn, 269);
  assert.equal(result.guidePages, 4);
  assert.equal(result.sitemapUrls, 546);
});

test("editorial catalogue remains usable without JavaScript in French and English", () => {
  const htmlFr = fs.readFileSync(path.join(ROOT, "recettes", "index.html"), "utf8");
  assert.equal((htmlFr.match(/class="recipe-card"/g) || []).length, 269);
  assert.match(htmlFr, /href="\.\/cote-de-boeuf-reverse-sear\/"/);
  assert.match(htmlFr, /<h1>Recettes kamado documentées<\/h1>/);

  const htmlEn = fs.readFileSync(path.join(ROOT, "recipes", "index.html"), "utf8");
  assert.equal((htmlEn.match(/class="recipe-card"/g) || []).length, 269);
  assert.match(htmlEn, /href="\.\/cote-de-boeuf-reverse-sear\/"/);
  assert.match(htmlEn, /<h1>Documented Kamado Recipes<\/h1>/);
});

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
  assert.equal(result.guidePages, 4);
  assert.equal(result.sitemapUrls, 276);
});

test("editorial catalogue remains usable without JavaScript", () => {
  const html = fs.readFileSync(path.join(ROOT, "recettes", "index.html"), "utf8");
  assert.equal((html.match(/class="recipe-card"/g) || []).length, 269);
  assert.match(html, /href="\.\/cote-de-boeuf-reverse-sear\/"/);
  assert.match(html, /<h1>Recettes kamado documentées<\/h1>/);
});

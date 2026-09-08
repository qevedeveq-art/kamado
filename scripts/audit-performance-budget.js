#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const limits = {
  "index.html": 900 * 1024,
  "manifest.webmanifest": 10 * 1024,
  "scripts/recipe-links.js": 10 * 1024,
  "scripts/editorial-search.js": 15 * 1024,
  "scripts/cook-engine.js": 20 * 1024,
  "scripts/local-vault.js": 15 * 1024,
  "scripts/personalization.js": 10 * 1024,
  "scripts/probe-adapter.js": 15 * 1024,
  "assets/editorial.css": 20 * 1024,
  "recettes/index.html": 500 * 1024
};

const failures = [];
const sizes = {};

for (const [relativePath, limit] of Object.entries(limits)) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relativePath}: missing`);
    continue;
  }
  const size = fs.statSync(fullPath).size;
  sizes[relativePath] = size;
  if (size > limit) failures.push(`${relativePath}: ${size} bytes exceeds ${limit}`);
}

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
if (/data:image\/(?:png|jpe?g|webp);base64/i.test(html)) {
  failures.push("index.html: embedded raster image found; use a cacheable local asset");
}
for (const field of ["id", "start_url", "scope", "name", "short_name", "description", "display"]) {
  if (!manifest[field]) failures.push(`manifest.webmanifest: missing ${field}`);
}
for (const icon of manifest.icons || []) {
  const iconPath = String(icon.src || "").replace(/^\.\//, "");
  if (!iconPath || !fs.existsSync(path.join(ROOT, iconPath))) {
    failures.push(`manifest.webmanifest: missing icon ${icon.src || "(empty)"}`);
  }
}

const recipes = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "recipes.json"), "utf8"));
let largestRecipePage = { path: "", size: 0 };
for (const recipe of recipes) {
  const relativePath = path.join("recettes", recipe.id, "index.html");
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relativePath}: missing`);
    continue;
  }
  const size = fs.statSync(fullPath).size;
  if (size > largestRecipePage.size) largestRecipePage = { path: relativePath, size };
  if (size > 60 * 1024) failures.push(`${relativePath}: ${size} bytes exceeds ${60 * 1024}`);
}
sizes.largestRecipePage = largestRecipePage;

const result = { ok: failures.length === 0, sizes, failures };
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;

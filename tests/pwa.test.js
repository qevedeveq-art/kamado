"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

test("PWA manifest has install metadata and local icons", () => {
  assert.equal(manifest.id, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.lang, "fr-FR");
  assert.equal(manifest.orientation, "any");
  assert.ok(manifest.description);
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(path.join(ROOT, icon.src.replace(/^\.\//, ""))), icon.src);
  }
  assert.ok(manifest.screenshots.some(screenshot => screenshot.form_factor === "wide"));
  for (const screenshot of manifest.screenshots) {
    assert.ok(fs.existsSync(path.join(ROOT, screenshot.src.replace(/^\.\//, ""))), screenshot.src);
  }
});

test("service worker precaches every critical local PWA asset", () => {
  [
    "./manifest.webmanifest",
    "./scripts/recipe-links.js",
    "./scripts/editorial-search.js",
    "./scripts/cook-engine.js",
    "./scripts/local-vault.js",
    "./scripts/personalization.js",
    "./icons/icon-180.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
  ].forEach(asset => assert.ok(sw.includes(`\"${asset}\"`), `missing ${asset}`));
});

test("primary recipe modal exposes dialog semantics and visible-focus support", () => {
  assert.match(html, /id="modal" role="dialog" aria-modal="true" aria-labelledby="d-title" aria-hidden="true"/);
  assert.match(html, /id="back" aria-label="Fermer la recette"/);
  assert.match(html, /:where\(button, a, input, select, textarea, \[tabindex\]\):focus-visible/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?scroll-behavior: auto/);
});

test("app shell does not depend on remote fonts", () => {
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
  assert.match(html, /--font-body:\s+-apple-system, BlinkMacSystemFont/);
});

test("performance budget audit passes", () => {
  const output = execFileSync(process.execPath, ["scripts/audit-performance-budget.js"], {
    cwd: ROOT,
    encoding: "utf8"
  });
  assert.equal(JSON.parse(output).ok, true);
});

test("Capacitor bundle includes external runtime and editorial assets", () => {
  execFileSync(process.execPath, ["scripts/prepare-mobile.js"], { cwd: ROOT, encoding: "utf8" });
  [
    "scripts/recipe-links.js",
    "scripts/editorial-search.js",
    "scripts/cook-engine.js",
    "scripts/local-vault.js",
    "scripts/personalization.js",
    "icons/icon-192.png",
    "assets/editorial.css",
    "recettes/cote-de-boeuf-reverse-sear/index.html",
    "guides/methodologie/index.html"
  ].forEach(relativePath => assert.ok(fs.existsSync(path.join(ROOT, "www", relativePath)), relativePath));
});

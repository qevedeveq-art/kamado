"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const i18n = require("../scripts/i18n.js");

test("i18n engine supports fr and en and defaults to fr", () => {
  assert.equal(i18n.DEFAULT_LANGUAGE, "fr");
  assert.deepEqual(i18n.SUPPORTED_LANGUAGES, ["fr", "en"]);
  assert.equal(i18n.resolveLanguage("en-US"), "en");
  assert.equal(i18n.resolveLanguage("FR-ca"), "fr");
  assert.equal(i18n.resolveLanguage("es-ES"), "fr"); // Fallback on unsupported
  assert.equal(i18n.resolveLanguage(null), "fr");
});

test("t() returns French strings by default and English when requested", () => {
  assert.equal(i18n.t("app.title", {}, "fr"), "Livre de recettes Kamado");
  assert.equal(i18n.t("app.title", {}, "en"), "Kamado Recipe Book");
  assert.equal(i18n.t("cockpit.title", {}, "fr"), "Cockpit Outdoor");
  assert.equal(i18n.t("cockpit.title", {}, "en"), "Outdoor Cockpit");
});

test("t() interpolates parameters properly", () => {
  const fr = i18n.t("app.recipes_count", { count: 269 }, "fr");
  const en = i18n.t("app.recipes_count", { count: 269 }, "en");
  assert.equal(fr, "269 fiches documentées");
  assert.equal(en, "269 documented recipes");
});

test("t() falls back gracefully for unknown keys", () => {
  assert.equal(i18n.t("non.existing.key", {}, "fr"), "non.existing.key");
  assert.equal(i18n.t("non.existing.key", {}, "en"), "non.existing.key");
});

test("translateCategory and translateMode work accurately across languages", () => {
  assert.equal(i18n.translateCategory("boeuf", "fr"), "Bœuf");
  assert.equal(i18n.translateCategory("boeuf", "en"), "Beef");
  assert.equal(i18n.translateCategory("volaille", "en"), "Poultry");
  assert.equal(i18n.translateCategory("poisson", "en"), "Fish & Seafood");

  assert.equal(i18n.translateMode("Direct", "fr"), "Saisie directe");
  assert.equal(i18n.translateMode("Direct", "en"), "Direct Searing");
  assert.equal(i18n.translateMode("Fumage lent", "en"), "Low & Slow Smoking");
});

test("t() translates menus, bases, filters, and modal keys", () => {
  assert.equal(i18n.t("menus.title", {}, "fr"), "🍱 Composer un menu kamado");
  assert.equal(i18n.t("menus.title", {}, "en"), "🍱 Build a Kamado Menu");
  assert.equal(i18n.t("bases.title", {}, "en"), "🧂 Essential Bases");
  assert.equal(i18n.t("filters.gear_label", {}, "en"), "Equipment");
  assert.equal(i18n.t("modal.burp_title", {}, "en"), "🛡️ Safety Reflex: The \"Burp\" (Anti-flashback)");
});

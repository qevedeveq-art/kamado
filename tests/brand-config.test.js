"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const brandConfig = require("../scripts/brand-config.js");

test("getBrandPreset returns default preset or requested valid preset", () => {
  const def = brandConfig.getBrandPreset("default");
  assert.equal(def.brandName, "Livre de recettes Kamado");
  assert.equal(def.primaryAccent, "#e75a1e");

  const kokko = brandConfig.getBrandPreset("kokko");
  assert.equal(kokko.brandName, "Kokko Cooking Copilot");
  assert.equal(kokko.primaryAccent, "#e65100");

  const fallback = brandConfig.getBrandPreset("unknown_brand");
  assert.equal(fallback.id, "default");
});

test("applyBrandPreset configures document styles and text if document is provided", () => {
  const mockStyle = {};
  const mockDoc = {
    documentElement: {
      style: {
        setProperty(k, v) { mockStyle[k] = v; }
      }
    },
    querySelector(selector) {
      if (selector === ".brand h1") return { textContent: "" };
      if (selector === ".brand small") return { textContent: "" };
      return null;
    }
  };

  const applied = brandConfig.applyBrandPreset("kokko", mockDoc);
  assert.equal(applied.id, "kokko");
  assert.equal(mockStyle["--accent"], "#e65100");
  assert.equal(mockStyle["--bg"], "#121210");
});

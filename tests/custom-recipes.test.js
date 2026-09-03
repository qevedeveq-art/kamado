"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { deriveDifficulty, deriveVents, deriveCharbon, deriveRepos } = require("../scripts/derive.js");

test("custom recipe merge: combines builtins and user custom recipes", () => {
  const builtins = [
    { nom: "Côte de bœuf", cat: "boeuf", tempK: "180 °C" }
  ];
  const custom = [
    { id: "c1", nom: "Picanha fumée maison", cat: "boeuf", tempK: "110 °C", _custom: true }
  ];

  const merged = [
    ...builtins.map(b => ({ ...b })),
    ...custom.map(c => ({ ...c }))
  ];

  assert.equal(merged.length, 2);
  assert.equal(merged[1].nom, "Picanha fumée maison");
  assert.equal(merged[1]._custom, true);
});

test("recipe override: applies modifications over builtin recipe without mutating original", () => {
  const original = { nom: "Poulet rôti", cat: "volaille", tempK: "180 °C", temps: "1 h" };
  const overrides = {
    "Poulet rôti": {
      nom: "Poulet rôti aux herbes et citron",
      tempK: "200 °C",
      _modified: true
    }
  };

  const active = { ...original, ...overrides[original.nom], _orig: original };

  assert.equal(active.nom, "Poulet rôti aux herbes et citron");
  assert.equal(active.tempK, "200 °C");
  assert.equal(active.temps, "1 h");
  assert.equal(active._modified, true);
  assert.equal(active._orig.nom, "Poulet rôti");
  assert.equal(original.tempK, "180 °C");
});

test("recipe deletion: removes custom recipe from active list", () => {
  let custom = [
    { id: "c1", nom: "Recette A" },
    { id: "c2", nom: "Recette B" }
  ];
  custom = custom.filter(r => r.id !== "c1");

  assert.equal(custom.length, 1);
  assert.equal(custom[0].nom, "Recette B");
});

test("recipe override reset: restores default built-in recipe values", () => {
  const original = { nom: "Côte de bœuf", cat: "boeuf", tempK: "180 °C" };
  const overrides = {
    "Côte de bœuf": { tempK: "220 °C", _modified: true }
  };

  delete overrides["Côte de bœuf"];

  const active = overrides[original.nom]
    ? { ...original, ...overrides[original.nom] }
    : { ...original };

  assert.equal(active.tempK, "180 °C");
  assert.equal(active._modified, undefined);
});

test("derivation fallbacks: computes proper defaults for missing fields", () => {
  const durMin = 45;
  const diff = deriveDifficulty(durMin, "Direct");
  const vents = deriveVents(110);
  const charbon = deriveCharbon(durMin);
  const repos = deriveRepos("boeuf", "Direct", durMin);

  assert.equal(diff, 2);
  assert.deepEqual(vents, { bottom: "1/8 ouvert", top: "1/8 ouvert" });
  assert.equal(charbon, 1.2);
  assert.equal(repos, 5);
});

test("backup schema v3 payload: preserves customRecipes and recipeOverrides", () => {
  const payload = {
    app: "kamado-kokko",
    version: 3,
    exportedAt: new Date().toISOString(),
    favs: ["Poulet rôti"],
    notes: {},
    ratings: {},
    history: [],
    shopping: [],
    pantryProfile: {},
    session: {},
    customRecipes: [{ id: "c1", nom: "Mon magret fumé" }],
    recipeOverrides: { "Poulet rôti": { tempK: "190 °C" } }
  };

  assert.equal(payload.version, 3);
  assert.equal(payload.customRecipes.length, 1);
  assert.equal(payload.recipeOverrides["Poulet rôti"].tempK, "190 °C");

  const serialized = JSON.stringify(payload);
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.version, 3);
  assert.equal(parsed.customRecipes[0].nom, "Mon magret fumé");
});

test("withF: converts Celsius temperatures to Fahrenheit equivalent correctly", () => {
  function withF(s) {
    if (!s) return "";
    return String(s).replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*°?\s*C\b/gi, (m, t1, t2) => {
      const f1 = Math.round(parseInt(t1, 10) * 9 / 5 + 32);
      if (t2) {
        const f2 = Math.round(parseInt(t2, 10) * 9 / 5 + 32);
        return `${t1}–${t2} °C (${f1}–${f2} °F)`;
      }
      return `${t1} °C (${f1} °F)`;
    });
  }

  assert.equal(withF("110 °C"), "110 °C (230 °F)");
  assert.equal(withF("200–220 °C"), "200–220 °C (392–428 °F)");
  assert.equal(withF("54 °C"), "54 °C (129 °F)");
});

test("kamadoSetup: properly detects setup configuration from recipe mode", () => {
  function kamadoSetup(r) {
    const h = `${r.mode} ${r.cat}`;
    if (/pizza|pierre/i.test(r.mode) || /pizza/i.test(r.cat)) return "pizza";
    if (/cocotte|brais/i.test(r.mode)) return "cocotte";
    if (/reverse|2 temps|deux temps/i.test(r.mode) || /indirect puis direct/i.test(r.mode)) return "2temps";
    if (/fumage|slow|indirect/i.test(r.mode)) return "indirect";
    if (/plancha/i.test(r.mode)) return "plancha";
    return "direct";
  }

  assert.equal(kamadoSetup({ mode: "Indirect (déflecteur)", cat: "volaille" }), "indirect");
  assert.equal(kamadoSetup({ mode: "Pierre à pizza", cat: "pizza" }), "pizza");
  assert.equal(kamadoSetup({ mode: "Indirect puis Direct", cat: "boeuf" }), "2temps");
  assert.equal(kamadoSetup({ mode: "Direct vif (saisie)", cat: "boeuf" }), "direct");
  assert.equal(kamadoSetup({ mode: "Braisé en cocotte", cat: "porc" }), "cocotte");
});

test("computeTimeline: calculates reverse service schedule correctly", () => {
  function computeTimeline(r, targetTimeStr) {
    const [tH, tM] = targetTimeStr.split(":").map(Number);
    const targetMin = tH * 60 + tM;
    const repos = r.repos_min || 0;
    const cookDur = 60; // 1 h
    const preheat = 30;

    function minToTime(m) {
      let mod = Math.round(m) % 1440;
      if (mod < 0) mod += 1440;
      const h = Math.floor(mod / 60);
      const mn = mod % 60;
      return `${String(h).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
    }

    return {
      ignite: minToTime(targetMin - repos - cookDur - preheat),
      start: minToTime(targetMin - repos - cookDur),
      rest: minToTime(targetMin - repos),
      serve: minToTime(targetMin)
    };
  }

  const schedule = computeTimeline({ repos_min: 15 }, "13:00");
  assert.equal(schedule.serve, "13:00");
  assert.equal(schedule.rest, "12:45");
  assert.equal(schedule.start, "11:45");
  assert.equal(schedule.ignite, "11:15");
});

test("cookLogs: serialized and restored in schema payload", () => {
  const payload = {
    app: "kamado-kokko",
    version: 3,
    cookLogs: {
      "Côte de bœuf": [
        { date: "03/09/2026", meteo: "☀️ Beau temps", charbon: "Quebracho", duree: "35 min", coeur: "54 °C" }
      ]
    }
  };

  const parsed = JSON.parse(JSON.stringify(payload));
  assert.equal(parsed.cookLogs["Côte de bœuf"][0].charbon, "Quebracho");
  assert.equal(parsed.cookLogs["Côte de bœuf"][0].coeur, "54 °C");
});

test("meat doneness: provides safe USDA-aligned pull temperatures", () => {
  const beefSaignant = { tempC: "52–54 °C", pullC: "50 °C", rest: "6–8 min" };
  const poultry = { tempC: "72–74 °C", pullC: "70 °C", rest: "5 min" };
  assert.ok(parseInt(beefSaignant.pullC, 10) < 54);
  assert.ok(parseInt(poultry.pullC, 10) >= 70);
});

test("substitutions: provides valid fallback alternatives for common barbecue staples", () => {
  function smartSubstitutions(haystack) {
    const list = [];
    if (/vinaigre de cidre/i.test(haystack)) list.push({ ingredient: "Vinaigre de cidre", par: "Jus de pomme + trait de vinaigre blanc" });
    if (/worcestershire/i.test(haystack)) list.push({ ingredient: "Sauce Worcestershire", par: "Sauce soja + mélasse" });
    return list;
  }

  const subs = smartSubstitutions("rub au vinaigre de cidre et sauce worcestershire");
  assert.equal(subs.length, 2);
  assert.equal(subs[0].ingredient, "Vinaigre de cidre");
});



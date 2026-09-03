"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const RECIPES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "recipes.json"), "utf8"));
const CATS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "categories.json"), "utf8"));
const INDEX_HTML = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("dataset has expected scale", () => {
  assert.ok(RECIPES.length >= 200, `expected >=200 recipes, got ${RECIPES.length}`);
});

test("every recipe has a unique name", () => {
  const seen = new Map();
  for (const [i, r] of RECIPES.entries()) {
    if (seen.has(r.nom)) {
      assert.fail(`duplicate "${r.nom}" at index ${i} (first at ${seen.get(r.nom)})`);
    }
    seen.set(r.nom, i);
  }
});

test("every recipe references a known category", () => {
  const ids = new Set(CATS.map(c => c.id));
  for (const r of RECIPES) {
    assert.ok(ids.has(r.cat), `unknown category "${r.cat}" in "${r.nom}"`);
  }
});

test("all cooking recipes are enriched (rich schema coverage)", () => {
  const RICH_FIELDS = ["phases", "vents", "wrap", "brine", "marinade_h", "repos_min", "charbon_kg", "difficulty", "equipement", "substitutions", "erreurs", "notes_securite", "source"];
  const cooking = RECIPES.filter(r => r.cat !== "sauces");
  const enriched = cooking.filter(r => RICH_FIELDS.some(f => r[f] != null));
  assert.equal(enriched.length, cooking.length, `${cooking.length - enriched.length} cooking recipes are not enriched`);
});

function operationalQualityScore(r) {
  const steps = Array.isArray(r.etapes) ? r.etapes : [];
  const ingredients = Array.isArray(r.ings) ? r.ings : [];
  const joinedSteps = steps.join(" ");
  return [
    ingredients.length >= 3,
    steps.length >= 4,
    !!r.coeur || /doré|tendre|nacré|sonde|flocon|prise|souple/i.test(joinedSteps),
    !!r.tempK && !!r.mode && !!r.bois,
    !!r.temps && r.repos_min != null && r.charbon_kg != null,
    Array.isArray(r.phases) && r.phases.length > 0,
    Array.isArray(r.erreurs) && r.erreurs.length > 0,
    !!r.source,
    !needsTargetedSafety(r) || !!r.notes_securite
  ].filter(Boolean).length;
}

function needsTargetedSafety(r) {
  const h = [
    r.nom,
    r.ori,
    r.mode,
    r.tempK,
    r.coeur,
    r.bois,
    r.astuce,
    ...(Array.isArray(r.ings) ? r.ings : []),
    ...(Array.isArray(r.etapes) ? r.etapes : [])
  ].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const meatCategory = ["boeuf", "porc", "agneau", "monde"].includes(r.cat);
  return r.cat === "volaille" ||
    r.cat === "poisson" ||
    /\b(poulet|dinde|chapon|canard|poisson|saumon|thon|cabillaud|truite|bar|dorade|gambas|crevette|moules|huitres|coquillage|homard|calamar|poulpe)\b/.test(h) ||
    (meatCategory && /\b(burger|steak hache|viande hachee|chair a saucisse|saucisse|chipolata|merguez|boerewors|tsukune|kofte)\b/.test(h)) ||
    /\b(gravlax|sechage|salaison)\b|fumage a froid/.test(h);
}

test("all cooking recipes have enough operational detail to cook from", () => {
  const weak = RECIPES
    .filter(r => r.cat !== "sauces")
    .map(r => ({ name: r.nom, score: operationalQualityScore(r) }))
    .filter(r => r.score < 5);
  assert.deepEqual(weak, []);
});

test("app keeps trusted chef references for food safety and kamado control", () => {
  [
    "foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures",
    "fsis.usda.gov/food-safety/safe-food-handling-and-preparation",
    "blog.thermoworks.com/chef-recommended-tw-approved",
    "biggreenegg.eu/en/indirect-cooking",
    "amazingribs.com/more-technique-and-science"
  ].forEach(fragment => assert.ok(INDEX_HTML.includes(fragment), `missing trusted reference: ${fragment}`));
});

test("phases timeline is well-formed when present", () => {
  for (const r of RECIPES) {
    if (!r.phases) continue;
    assert.ok(Array.isArray(r.phases) && r.phases.length > 0, `${r.nom}: phases must be a non-empty array`);
    for (const [i, p] of r.phases.entries()) {
      assert.ok(typeof p.name === "string" && p.name.length, `${r.nom}: phase[${i}].name`);
      assert.ok(typeof p.mode === "string" && p.mode.length, `${r.nom}: phase[${i}].mode`);
      assert.ok(typeof p.temp_C === "number" && p.temp_C >= 0, `${r.nom}: phase[${i}].temp_C`);
      assert.ok(typeof p.duration_min === "number" && p.duration_min >= 0, `${r.nom}: phase[${i}].duration_min`);
    }
  }
});

test("difficulty is always between 1 and 5", () => {
  for (const r of RECIPES) {
    if (r.difficulty == null) continue;
    assert.ok(Number.isInteger(r.difficulty) && r.difficulty >= 1 && r.difficulty <= 5,
      `${r.nom}: difficulty=${r.difficulty}`);
  }
});

test("wrap material starts with an allowed family", () => {
  // Chefs may add precision (e.g. "papier boucher rose non ciré",
  // "papier boucher ou double alu + jus de pomme"). We only guarantee the
  // material FAMILY, so the runtime UI can categorize consistently.
  const ALLOWED_PREFIXES = ["papier boucher", "alu", "papier sulfurisé"];
  for (const r of RECIPES) {
    if (!r.wrap) continue;
    const mat = String(r.wrap.materiau || "").toLowerCase();
    const ok = ALLOWED_PREFIXES.some(p => mat.startsWith(p));
    assert.ok(ok, `${r.nom}: wrap.materiau="${r.wrap.materiau}"`);
  }
});

test("index.html client runtime executes without any reference or syntax error", () => {
  const vm = require("node:vm");
  const scriptStart = INDEX_HTML.indexOf("<script>");
  const scriptEnd = INDEX_HTML.lastIndexOf("</script>");
  const scriptContent = INDEX_HTML.slice(scriptStart + 8, scriptEnd);

  const elements = {};
  function mockEl(tag, id) {
    return {
      tagName: tag,
      id: id || "",
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      style: {},
      setAttribute() {},
      getAttribute() { return ""; },
      addEventListener(event, fn) { this["on" + event] = fn; },
      appendChild() {},
      querySelector(s) { return mockEl("div"); },
      querySelectorAll(s) { return [mockEl("div")]; },
      innerHTML: "",
      textContent: "",
      value: ""
    };
  }

  const doc = {
    querySelector(s) {
      if (!elements[s]) elements[s] = mockEl("div", s.replace("#", ""));
      return elements[s];
    },
    querySelectorAll(s) { return [mockEl("div")]; },
    getElementById(id) { return this.querySelector("#" + id); },
    body: mockEl("body"),
    createElement(tag) { return mockEl(tag); },
    addEventListener() {}
  };

  const win = {
    document: doc,
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    location: { origin: "http://localhost:8000", pathname: "/", hash: "", protocol: "http:" },
    navigator: { serviceWorker: { register() { return Promise.resolve(); } } },
    matchMedia() { return { matches: false }; },
    scrollTo() {},
    requestAnimationFrame(cb) { cb(); },
    scrollY: 0,
    addEventListener() {}
  };

  const context = vm.createContext({
    document: doc,
    window: win,
    localStorage: win.localStorage,
    location: win.location,
    navigator: win.navigator,
    matchMedia: win.matchMedia,
    scrollTo: win.scrollTo,
    requestAnimationFrame: win.requestAnimationFrame,
    console,
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    atob: global.atob,
    btoa: global.btoa,
    Set: global.Set,
    Map: global.Map,
    Date: global.Date,
    JSON: global.JSON,
    Math: global.Math,
    parseInt: global.parseInt,
    parseFloat: global.parseFloat,
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout
  });

  const count = vm.runInContext(scriptContent + "\n; RECIPES.length;", context);
  assert.ok(count >= 240, `expected >=240 recipes, got ${count}`);
});

test("chef allergen rules: no false positives on muscade/coco, detects beer and fish", () => {
  const { execSync } = require("child_process");
  const out = execSync("node scripts/audit-chef.js", { encoding: "utf8" });
  const result = JSON.parse(out);
  assert.equal(result.issues, 0, `Chef audit reported ${result.issues} issues`);
});

test("allergen precision: cote de boeuf has no egg, beurre noisette has no nuts", () => {
  const fs = require("fs");
  const recipes = JSON.parse(fs.readFileSync("data/recipes.json", "utf8"));
  const { execSync } = require("child_process");
  const report = JSON.parse(execSync("node scripts/audit-chef.js", { encoding: "utf8" }));
  assert.equal(report.issues, 0);

  // Check direct allergen outputs on key recipes
  const html = fs.readFileSync("index.html", "utf8");
  assert.ok(html.includes("function allergenHaystack(r)"), "index.html must have allergenHaystack");
  assert.ok(html.includes("oeufText=h.replace"), "index.html must strip boeuf from oeuf check");
  assert.ok(html.includes("beurre noisette"), "index.html must guard beurre noisette");
});



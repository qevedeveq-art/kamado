"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseHtml,
  extractRecipe,
  parseIsoDurationMinutes,
  parseYield,
  inferCategory,
  mapToKamado,
  formatAsJsLiteral
} = require("../scripts/import-url-lib");

const FIXTURE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "Pulled Pork Fumé",
  author: { "@type": "Person", name: "Aaron Franklin" },
  recipeYield: "6-8",
  cookTime: "PT10H",
  prepTime: "PT30M",
  totalTime: "PT10H30M",
  recipeIngredient: [
    "1 épaule de porc (4 kg)",
    "Rub BBQ (paprika, cassonade, sel)",
    "Moutarde jaune (liant)",
    "Bois de fumage : hickory ou pommier"
  ],
  recipeInstructions: [
    { "@type": "HowToStep", text: "Enduire l'épaule de moutarde puis rub généreux." },
    { "@type": "HowToStep", text: "Fumer à 110 °C jusqu'à 74 °C à cœur (6-8 h)." },
    { "@type": "HowToStep", text: "Wrapper au papier boucher jusqu'à 96 °C (probe tender)." },
    { "@type": "HowToStep", text: "Repos glacière 1 h puis effilocher." }
  ],
  url: "https://example.com/pulled-pork"
};

function makeHtml(json) {
  return `<!DOCTYPE html><html><head>
<script type="application/ld+json">${JSON.stringify(json)}</script>
</head><body>content</body></html>`;
}

test("parseHtml extracts JSON-LD blocks", () => {
  const html = makeHtml(FIXTURE_JSONLD);
  const blocks = parseHtml(html);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]["@type"], "Recipe");
});

test("parseHtml skips malformed blocks without throwing", () => {
  const html = `
    <script type="application/ld+json">{ not valid json }</script>
    <script type="application/ld+json">${JSON.stringify(FIXTURE_JSONLD)}</script>
  `;
  const blocks = parseHtml(html);
  assert.equal(blocks.length, 1);
});

test("extractRecipe finds a Recipe inside @graph", () => {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Blog" },
      FIXTURE_JSONLD
    ]
  };
  const found = extractRecipe([graph]);
  assert.ok(found);
  assert.equal(found.name, "Pulled Pork Fumé");
});

test("extractRecipe handles @type as array", () => {
  const node = { ...FIXTURE_JSONLD, "@type": ["Recipe", "NewsArticle"] };
  const found = extractRecipe([node]);
  assert.ok(found);
});

test("parseIsoDurationMinutes handles hours + minutes", () => {
  assert.equal(parseIsoDurationMinutes("PT1H30M"), 90);
  assert.equal(parseIsoDurationMinutes("PT45M"), 45);
  assert.equal(parseIsoDurationMinutes("PT2H"), 120);
  assert.equal(parseIsoDurationMinutes(""), null);
  assert.equal(parseIsoDurationMinutes(null), null);
});

test("parseYield normalizes formats", () => {
  assert.equal(parseYield("4"), "4 pers");
  assert.equal(parseYield("6-8"), "6–8 pers");
  assert.equal(parseYield("Serves 4"), "4 pers");
  assert.equal(parseYield(null), "4 pers");
});

test("inferCategory picks meat over side dish", () => {
  assert.equal(inferCategory("Pulled pork sandwich", ["pork shoulder", "buns"]), "porc");
  assert.equal(inferCategory("Poulet rôti fermier", ["poulet fermier"]), "volaille");
  assert.equal(inferCategory("Brisket Texas", ["boeuf poitrine"]), "boeuf");
  assert.equal(inferCategory("Saumon fumé", ["filet de saumon"]), "poisson");
  assert.equal(inferCategory("Pizza margherita", ["pâte à pizza"]), "pizza");
  assert.equal(inferCategory("Random dish", ["water"]), "monde");
});

test("mapToKamado produces a schema-compatible object", () => {
  const r = mapToKamado(FIXTURE_JSONLD, "https://example.com/pulled-pork");
  assert.equal(r.cat, "porc");
  assert.equal(r.nom, "Pulled Pork Fumé");
  assert.equal(r.pour, "6–8 pers");
  assert.equal(r.temps, "10 h 30");
  assert.ok(r.ings.length >= 3, "keeps ingredients");
  assert.ok(r.etapes.length >= 4, "keeps steps");
  assert.ok(r.source.startsWith("https://"));
  assert.ok(r.difficulty >= 1 && r.difficulty <= 5);
  assert.ok(r.notes_securite.length > 0);
  assert.ok(r.charbon_kg > 0);
});

test("mapToKamado rejects recipes without ingredients", () => {
  assert.throws(
    () => mapToKamado({ ...FIXTURE_JSONLD, recipeIngredient: [] }, "https://x"),
    /ingredients/
  );
});

test("formatAsJsLiteral produces valid JS that round-trips", () => {
  const r = mapToKamado(FIXTURE_JSONLD, "https://example.com/pulled-pork");
  const literal = formatAsJsLiteral(r);
  // Must be parseable as a JS expression.
  const parsed = new Function(`return ${literal};`)();
  assert.equal(parsed.nom, r.nom);
  assert.equal(parsed.cat, r.cat);
  assert.deepEqual(parsed.ings, r.ings);
  assert.deepEqual(parsed.etapes, r.etapes);
});

test("formatAsJsLiteral escapes quotes and newlines", () => {
  const r = mapToKamado(
    {
      ...FIXTURE_JSONLD,
      recipeInstructions: [
        { "@type": "HowToStep", text: 'Il dit "salt" puis\nfumer.' }
      ]
    },
    "https://example.com/x"
  );
  const literal = formatAsJsLiteral(r);
  const parsed = new Function(`return ${literal};`)();
  assert.match(parsed.etapes[0], /"salt"/);
});

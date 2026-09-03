const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");

test("sommelier audit: ensures all cooking recipes have accurate sommelier pairings without clashes", () => {
  const out = execSync("node scripts/audit-sommelier.js", { encoding: "utf8" });
  const result = JSON.parse(out);
  assert.equal(result.issues, 0, `Sommelier audit reported ${result.issues} issues`);
  assert.ok(result.recipesAudited >= 240, `Audited at least 240 recipes, got ${result.recipesAudited}`);
});

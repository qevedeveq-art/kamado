"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { deriveDifficulty, deriveVents, deriveCharbon, deriveRepos } = require("../scripts/derive");

test("deriveDifficulty: quick direct grills are 1-2", () => {
  assert.equal(deriveDifficulty(15, "direct"), 1);
  assert.equal(deriveDifficulty(45, "direct"), 2);
});

test("deriveDifficulty: long fumage bumps to 5", () => {
  assert.equal(deriveDifficulty(720, "fumage"), 5);
  assert.equal(deriveDifficulty(400, "fumage"), 5);
});

test("deriveDifficulty: braise mode adds one level", () => {
  assert.equal(deriveDifficulty(120, "indirect"), 3);
  assert.equal(deriveDifficulty(120, "braisé"), 4);
});

test("deriveDifficulty: clamps between 1 and 5", () => {
  assert.equal(deriveDifficulty(1, "direct"), 1);
  assert.equal(deriveDifficulty(99999, "fumage"), 5);
});

test("deriveVents: low temp narrows vents", () => {
  assert.deepEqual(deriveVents(100), { bottom: "1/8 ouvert", top: "1/8 ouvert" });
  assert.deepEqual(deriveVents(130), { bottom: "1/4 ouvert", top: "1/4 ouvert" });
});

test("deriveVents: pizza-grade heat opens them fully", () => {
  assert.deepEqual(deriveVents(280), { bottom: "grand ouvert", top: "grand ouvert" });
});

test("deriveCharbon: scales with duration", () => {
  assert.equal(deriveCharbon(20), 1);
  assert.equal(deriveCharbon(90), 1.5);
  assert.equal(deriveCharbon(300), 4);
  assert.equal(deriveCharbon(600), 5);
});

test("deriveRepos: respects category overrides", () => {
  assert.equal(deriveRepos("poisson", "direct", 30), 5);
  assert.equal(deriveRepos("legumes", "direct", 30), 0);
  assert.equal(deriveRepos("vegetarien", "direct", 30), 0);
  assert.equal(deriveRepos("dessert", "indirect", 60), 30);
  assert.equal(deriveRepos("pizza", "pierre", 10), 0);
});

test("deriveRepos: long fumage/braise gets generous repos", () => {
  assert.equal(deriveRepos("boeuf", "fumage", 480), 30);
  assert.equal(deriveRepos("agneau", "braisé", 240), 30);
});

test("deriveRepos: poultry baseline", () => {
  assert.equal(deriveRepos("volaille", "indirect", 60), 15);
});

test("deriveRepos: short cooks rest 5 min by default", () => {
  assert.equal(deriveRepos("boeuf", "direct", 15), 5);
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildCookPlan,
  createCookSession,
  hydrateCookSession,
  startSessionTimer,
  pauseSessionTimer,
  advanceCookSession,
  recordCookObservation,
  evaluateCookTemperatures,
  completeCookSession
} = require("../scripts/cook-engine.js");

const RECIPE = {
  id: "cote-test",
  nom: "Côte test",
  mode: "Indirect puis Direct",
  tempK: "120 °C puis 320 °C",
  coeur: "52–54 °C (saignant)",
  bois: "Chêne",
  phases: [
    { name: "Chauffe indirecte", mode: "indirect", temp_C: 120, duration_min: 50, action: "Monter doucement à cœur." },
    { name: "Saisie directe", mode: "direct", temp_C: 320, duration_min: 8, action: "Saisir sur braises vives." }
  ],
  etapes: ["Préparer la viande.", "Cuire 50 min.", "Saisir 8 min."]
};

test("buildCookPlan prioritizes structured phases and exposes targets", () => {
  const plan = buildCookPlan(RECIPE);
  assert.equal(plan.length, 2);
  assert.deepEqual(plan[0], {
    id: "phase-1",
    title: "Chauffe indirecte",
    mode: "indirect",
    instruction: "Monter doucement à cœur.",
    targetDomeC: 120,
    targetCore: null,
    durationSec: 3000
  });
  assert.deepEqual(plan[1].targetCore, { min: 52, max: 54 });
  assert.equal(plan[1].durationSec, 480);
});

test("buildCookPlan falls back to recipe steps and parses their timer", () => {
  const plan = buildCookPlan({
    id: "fallback",
    nom: "Fallback",
    tempK: "180 °C",
    coeur: "74 °C",
    etapes: ["Installer le déflecteur.", "Cuire 1 h 15 min puis contrôler."]
  });
  assert.equal(plan.length, 2);
  assert.equal(plan[1].durationSec, 4500);
  assert.equal(plan[1].targetDomeC, 180);
  assert.deepEqual(plan[1].targetCore, { min: 74, max: 74 });
});

test("running timer resumes from its absolute deadline after reload", () => {
  const started = createCookSession(RECIPE, 1_000);
  const running = startSessionTimer(started, 2_000);
  const resumed = hydrateCookSession(running, RECIPE, 12_000);
  assert.equal(resumed.timer.running, true);
  assert.equal(resumed.timer.remainingSec, 2990);
  const paused = pauseSessionTimer(resumed, 22_000);
  assert.equal(paused.timer.running, false);
  assert.equal(paused.timer.remainingSec, 2980);
  assert.equal(paused.timer.endsAt, null);
});

test("advancing a session marks progress and resets the next phase timer", () => {
  const session = startSessionTimer(createCookSession(RECIPE, 1_000), 2_000);
  const advanced = advanceCookSession(session, RECIPE, 5_000);
  assert.equal(advanced.stepIndex, 1);
  assert.deepEqual(advanced.completedStepIds, ["phase-1"]);
  assert.equal(advanced.timer.durationSec, 480);
  assert.equal(advanced.timer.remainingSec, 480);
  assert.equal(advanced.timer.running, false);
});

test("observations generate cautious dome and core guidance", () => {
  let session = createCookSession(RECIPE, 1_000);
  session = recordCookObservation(session, { domeC: 92, coreC: 41 }, 5_000);
  const low = evaluateCookTemperatures(buildCookPlan(RECIPE)[0], session.observations[0]);
  assert.equal(low.dome.status, "low");
  assert.match(low.dome.message, /légèrement/);
  assert.equal(low.core.status, "untracked");

  session = advanceCookSession(session, RECIPE, 6_000);
  session = recordCookObservation(session, { domeC: 321, coreC: 52 }, 7_000);
  const ready = evaluateCookTemperatures(buildCookPlan(RECIPE)[1], session.observations[1]);
  assert.equal(ready.dome.status, "stable");
  assert.equal(ready.core.status, "ready");
});

test("completion produces a journal-compatible summary", () => {
  let session = createCookSession(RECIPE, 1_000);
  session = recordCookObservation(session, { domeC: 120, coreC: 48 }, 30_000);
  session = advanceCookSession(session, RECIPE, 31_000);
  session = recordCookObservation(session, { domeC: 320, coreC: 53 }, 61_000);
  const completed = completeCookSession(session, RECIPE, 121_000);
  assert.equal(completed.session.status, "completed");
  assert.equal(completed.log.coeur, "53 °C");
  assert.equal(completed.log.temp, "53 °C");
  assert.equal(completed.log.wood, "Chêne");
  assert.equal(completed.log.duration, "2 min");
  assert.match(completed.log.notes, /2 étapes/);
});

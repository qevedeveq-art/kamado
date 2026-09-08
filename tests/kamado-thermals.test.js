"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const thermals = require("../scripts/kamado-thermals.js");

test("estimateRateOfChange computes Celsius per minute correctly", () => {
  const now = 1700000000000;
  const samples = [
    { at: now, tempC: 100 },
    { at: now + 60000 * 5, tempC: 125 } // +25°C in 5 min = +5°C/min
  ];
  assert.equal(thermals.estimateRateOfChange(samples), 5);

  const flat = [
    { at: now, tempC: 70 },
    { at: now + 60000 * 10, tempC: 70.5 }
  ];
  assert.equal(thermals.estimateRateOfChange(flat), 0.05);

  assert.equal(thermals.estimateRateOfChange([]), 0);
  assert.equal(thermals.estimateRateOfChange(null), 0);
});

test("calculateAirflowAdvice detects severe overheat and issues urgent throttling", () => {
  const advice = thermals.calculateAirflowAdvice({
    currentDomeC: 160,
    targetDomeC: 110,
    ratePerMin: 1.5
  });
  assert.equal(advice.severity, "urgent");
  assert.match(advice.advice, /surchauffe sévère/i);
  assert.equal(advice.recommendedBottom, "Quasi fermé (1 mm)");
});

test("calculateAirflowAdvice anticipates thermal overshoot when climbing fast", () => {
  const advice = thermals.calculateAirflowAdvice({
    currentDomeC: 102,
    targetDomeC: 115,
    ratePerMin: 3.5 // climbing fast 13°C before target
  });
  assert.equal(advice.severity, "warning");
  assert.match(advice.advice, /montée rapide/i);
  assert.equal(advice.recommendedBottom, "1/3 ouvert");
});

test("calculateAirflowAdvice detects falling heat and suggests oxygen intake check", () => {
  const advice = thermals.calculateAirflowAdvice({
    currentDomeC: 80,
    targetDomeC: 120,
    ratePerMin: 0.1
  });
  assert.equal(advice.severity, "warning");
  assert.match(advice.advice, /chaleur insuffisante/i);
});

test("calculateAirflowAdvice confirms nominal state when on target", () => {
  const advice = thermals.calculateAirflowAdvice({
    currentDomeC: 114,
    targetDomeC: 115,
    ratePerMin: 0.1
  });
  assert.equal(advice.severity, "nominal");
  assert.match(advice.advice, /stabilisée/i);
});

test("detectStall identifies evaporative plateau between 64°C and 76°C with flat slope", () => {
  const now = 1700000000000;
  const history = [
    { at: now, tempC: 68.2 },
    { at: now + 60000 * 10, tempC: 68.4 }
  ];
  const stall = thermals.detectStall({
    currentCoreC: 69,
    coreHistory: history,
    cookingDurationMin: 180
  });
  assert.equal(stall.inStall, true);
  assert.match(stall.advice, /zone de stall/i);
  assert.match(stall.wrapRecommendation, /papier boucher/i);

  const pastStall = thermals.detectStall({ currentCoreC: 85 });
  assert.equal(pastStall.inStall, false);
  assert.match(pastStall.advice, /franchi/i);

  const preStall = thermals.detectStall({ currentCoreC: 45 });
  assert.equal(preStall.inStall, false);
});

test("calculateCarryover adjusts target pull temperature according to cooking heat and gradient", () => {
  // Direct sear: high gradient -> +5°C rise
  const sear = thermals.calculateCarryover({
    targetDoneC: 55,
    domeTempC: 280,
    cookingMode: "direct"
  });
  assert.equal(sear.targetPullC, 50);
  assert.equal(sear.estimatedRiseC, 5);
  assert.match(sear.advice, /50 °C à cœur/);

  // Low and slow: gentle gradient -> +2°C rise
  const slow = thermals.calculateCarryover({
    targetDoneC: 93,
    domeTempC: 110,
    cookingMode: "fumage"
  });
  assert.equal(slow.targetPullC, 91);
  assert.equal(slow.estimatedRiseC, 2);
});

test("evaluateThermalState produces a complete composite diagnostic", () => {
  const session = {
    targetDomeC: 120,
    targetCoreC: 93,
    mode: "fumage",
    elapsedSeconds: 7200,
    vents: { bottom: "1/3 ouvert", top: "1/4 ouvert" }
  };
  const readings = {
    dome: 118,
    core: 68,
    domeRatePerMin: 0.1,
    coreHistory: [
      { at: 1000, tempC: 67.9 },
      { at: 601000, tempC: 68.0 }
    ]
  };
  const state = thermals.evaluateThermalState(session, readings);
  assert.equal(state.status, "nominal");
  assert.equal(state.stall.inStall, true);
  assert.equal(state.carryover.targetPullC, 91);
});

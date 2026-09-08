"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  assignProbeRole,
  applyProbeReading,
  createProbeState,
  createProbeSimulator,
  getProbeSupport,
  latestReadingsForCook,
  nextSimulatorReadings,
  normalizeProbeReading,
  probeChannelKey
} = require("../scripts/probe-adapter.js");

test("capability report keeps universal fallbacks separate from Web Bluetooth", () => {
  assert.deepEqual(getProbeSupport({}), {
    manual: true,
    simulator: true,
    webBluetooth: false
  });
  assert.equal(getProbeSupport({ bluetooth: { requestDevice() {} } }).webBluetooth, true);
});

test("readings are normalized to Celsius with bounded metadata", () => {
  assert.deepEqual(normalizeProbeReading({
    sourceId: "demo",
    sourceName: "Sonde démo",
    channelId: "pit",
    role: "dome",
    value: 250,
    unit: "F",
    batteryPct: 103,
    at: 1_000
  }), {
    sourceId: "demo",
    sourceName: "Sonde démo",
    channelId: "pit",
    role: "dome",
    valueC: 121.1,
    batteryPct: 100,
    at: 1_000
  });
});

test("invalid channels, roles and unsafe temperatures are rejected", () => {
  assert.throws(() => normalizeProbeReading({ sourceId: "x", channelId: "", valueC: 20 }), /canal/i);
  assert.throws(() => normalizeProbeReading({ sourceId: "x", channelId: "1", role: "food", valueC: 20 }), /rôle/i);
  assert.throws(() => normalizeProbeReading({ sourceId: "x", channelId: "1", valueC: 501 }), /température/i);
  assert.throws(() => normalizeProbeReading({ sourceId: "x", channelId: "1", value: 300, unit: "K" }), /unité/i);
});

test("state maps channels to cook roles and reports stale readings", () => {
  let state = createProbeState();
  state = applyProbeReading(state, { sourceId: "manual", channelId: "a", valueC: 118, at: 10_000 });
  state = applyProbeReading(state, { sourceId: "manual", channelId: "b", valueC: 52, at: 11_000 });
  state = assignProbeRole(state, "manual", "a", "dome");
  state = assignProbeRole(state, "manual", "b", "core");

  assert.deepEqual(latestReadingsForCook(state, 20_000, 30_000), {
    domeC: 118,
    coreC: 52,
    staleRoles: []
  });
  assert.deepEqual(latestReadingsForCook(state, 50_001, 30_000), {
    domeC: null,
    coreC: null,
    staleRoles: ["dome", "core"]
  });
});

test("a reading-provided role is used until the user assigns another", () => {
  const state = applyProbeReading(createProbeState(), {
    sourceId: "demo",
    channelId: "ambient",
    role: "ambient",
    valueC: 22,
    at: 1_000
  });
  const key = probeChannelKey("demo", "ambient");
  assert.equal(state.assignments[key], "ambient");
  assert.equal(state.channels[key].valueC, 22);
});

test("identically named channels from different sources never collide", () => {
  let state = createProbeState();
  state = applyProbeReading(state, { sourceId: "vendor-a", channelId: "1", role: "dome", valueC: 110, at: 1_000 });
  state = applyProbeReading(state, { sourceId: "vendor-b", channelId: "1", role: "core", valueC: 48, at: 2_000 });
  assert.equal(Object.keys(state.channels).length, 2);
  assert.equal(state.channels[probeChannelKey("vendor-a", "1")].valueC, 110);
  assert.equal(state.channels[probeChannelKey("vendor-b", "1")].valueC, 48);
  assert.notEqual(probeChannelKey("vendor::a", "1"), probeChannelKey("vendor", "a::1"));
});

test("simulator produces deterministic dome and core channels", () => {
  let simulator = createProbeSimulator({ domeC: 95, coreC: 35 });
  const first = nextSimulatorReadings(simulator, 1_000);
  simulator = first.simulator;
  const second = nextSimulatorReadings(simulator, 2_000);

  assert.deepEqual(first.readings.map(reading => [reading.channelId, reading.role, reading.valueC]), [
    ["dome", "dome", 98],
    ["core", "core", 35.8]
  ]);
  assert.deepEqual(second.readings.map(reading => reading.valueC), [101, 36.6]);
  assert.equal(second.simulator.tick, 2);
});

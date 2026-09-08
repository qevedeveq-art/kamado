"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  COMBUSTION_PROBE_STATUS_CHARACTERISTIC,
  COMBUSTION_PROBE_STATUS_SERVICE,
  combustionReadingsFromStatus,
  combustionRequestOptions,
  decodeCombustionProbeStatus,
  decodeCombustionTemperatures,
  openCombustionProbeConnection
} = require("../scripts/combustion-probe.js");

const OFFICIAL_TEMPERATURE_FIXTURE = Uint8Array.from([
  0x89, 0x00, 0xDA, 0x00, 0xD7, 0x0D, 0x07,
  0x33, 0x05, 0xD5, 0x18, 0x74, 0x1A
]);

function statusPacket() {
  const packet = new Uint8Array(30);
  packet.set(OFFICIAL_TEMPERATURE_FIXTURE, 8);
  packet[21] = 0b101_110_01;
  packet[22] = 0b10_11_101_1;
  return packet;
}

test("Combustion UUIDs and Web Bluetooth filter match the published probe service", () => {
  assert.equal(COMBUSTION_PROBE_STATUS_SERVICE, "00000100-caab-3792-3d44-97ae51c1407a");
  assert.equal(COMBUSTION_PROBE_STATUS_CHARACTERISTIC, "00000101-caab-3792-3d44-97ae51c1407a");
  assert.deepEqual(combustionRequestOptions(), {
    filters: [{ services: [COMBUSTION_PROBE_STATUS_SERVICE] }]
  });
});

test("official packed-temperature fixture decodes all eight thermistors", () => {
  assert.deepEqual(decodeCombustionTemperatures(OFFICIAL_TEMPERATURE_FIXTURE), [
    -13.15, 67.2, 258.4, 160.55, 225.6, 114.5, 189.75, 22.3
  ]);
});

test("probe status resolves manufacturer-selected core, surface and ambient sensors", () => {
  const status = decodeCombustionProbeStatus(statusPacket());
  assert.equal(status.mode, "instant-read");
  assert.equal(status.probeId, 6);
  assert.equal(status.batteryLow, true);
  assert.deepEqual(status.virtualSensors, { core: 5, surface: 6, ambient: 6 });
  assert.deepEqual(status.virtualTemperaturesC, { core: 114.5, surface: 189.75, ambient: 189.75 });
});

test("decoded values become vendor-neutral readings without treating ambient as dome", () => {
  const readings = combustionReadingsFromStatus(decodeCombustionProbeStatus(statusPacket()), {
    sourceId: "device-42",
    sourceName: "CPT jaune",
    at: 5_000
  });
  assert.deepEqual(readings.map(({ channelId, role, valueC }) => ({ channelId, role, valueC })), [
    { channelId: "core", role: "core", valueC: 114.5 },
    { channelId: "surface", role: "unknown", valueC: 189.75 },
    { channelId: "ambient", role: "ambient", valueC: 189.75 }
  ]);
  assert.ok(readings.every(reading => reading.sourceId === "combustion:device-42" && reading.at === 5_000));
});

test("truncated or malformed manufacturer packets fail closed", () => {
  assert.throws(() => decodeCombustionTemperatures(new Uint8Array(12)), /13 octets/);
  assert.throws(() => decodeCombustionProbeStatus(new Uint8Array(29)), /30 octets/);
  assert.throws(() => combustionReadingsFromStatus({}, { sourceId: "x" }), /statut/i);
});

test("Web Bluetooth transport subscribes, emits decoded status and disconnects cleanly", async () => {
  let valueListener;
  let disconnected = false;
  const characteristic = {
    addEventListener(type, listener) { if (type === "characteristicvaluechanged") valueListener = listener; },
    removeEventListener(type, listener) { if (type === "characteristicvaluechanged" && valueListener === listener) valueListener = null; },
    async startNotifications() { return this; },
    async readValue() { return statusPacket(); }
  };
  const service = { async getCharacteristic(uuid) { assert.equal(uuid, COMBUSTION_PROBE_STATUS_CHARACTERISTIC); return characteristic; } };
  const device = {
    id: "official-probe",
    name: "Combustion Probe",
    gatt: {
      connected: true,
      async connect() { return { getPrimaryService: async uuid => { assert.equal(uuid, COMBUSTION_PROBE_STATUS_SERVICE); return service; } }; },
      disconnect() { disconnected = true; this.connected = false; }
    },
    addEventListener() {},
    removeEventListener() {}
  };
  const bluetooth = {
    async requestDevice(options) { assert.deepEqual(options, combustionRequestOptions()); return device; }
  };
  const statuses = [];
  const connection = await openCombustionProbeConnection(bluetooth, { onStatus: status => statuses.push(status) });
  assert.equal(statuses.length, 1);
  assert.equal(statuses[0].probeId, 6);
  valueListener({ target: { value: statusPacket() } });
  assert.equal(statuses.length, 2);
  connection.disconnect();
  assert.equal(disconnected, true);
  assert.equal(valueListener, null);
});

test("a failed GATT service discovery releases the partial connection", async () => {
  let disconnected = false;
  const device = {
    gatt: {
      connected: true,
      async connect() { return { async getPrimaryService() { throw new Error("service missing"); } }; },
      disconnect() { disconnected = true; this.connected = false; }
    }
  };
  await assert.rejects(
    openCombustionProbeConnection({ async requestDevice() { return device; } }),
    /service missing/
  );
  assert.equal(disconnected, true);
});

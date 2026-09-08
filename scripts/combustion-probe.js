(function initCombustionProbe(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoCombustionProbe = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function combustionProbeFactory() {
  "use strict";

  // Published by Combustion Inc. in its public BLE specification and MIT SDK:
  // https://github.com/combustion-inc/combustion-documentation
  // https://github.com/combustion-inc/combustion-android-ble
  const COMBUSTION_PROBE_STATUS_SERVICE = "00000100-caab-3792-3d44-97ae51c1407a";
  const COMBUSTION_PROBE_STATUS_CHARACTERISTIC = "00000101-caab-3792-3d44-97ae51c1407a";
  const TEMPERATURE_BYTES = 13;
  const MIN_STATUS_BYTES = 30;

  function asBytes(value) {
    if (value instanceof Uint8Array) return value;
    if (typeof DataView !== "undefined" && value instanceof DataView) {
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return new Uint8Array(value);
    throw new TypeError("Données BLE Combustion invalides.");
  }

  function decodeCombustionTemperatures(value) {
    const bytes = asBytes(value);
    if (bytes.byteLength !== TEMPERATURE_BYTES) throw new RangeError("Le bloc de températures Combustion doit contenir 13 octets.");
    let packed = 0n;
    for (let index = 0; index < bytes.length; index += 1) {
      packed |= BigInt(bytes[index]) << (8n * BigInt(index));
    }
    return Array.from({ length: 8 }, (_, index) => {
      const raw = Number((packed >> (13n * BigInt(index))) & 0x1FFFn);
      return Math.round((raw * 0.05 - 20) * 100) / 100;
    });
  }

  function virtualSensorIndexes(statusByte) {
    const packed = statusByte >> 1;
    const coreValue = packed & 0x07;
    return {
      core: coreValue <= 5 ? coreValue : 0,
      surface: 3 + ((packed >> 3) & 0x03),
      ambient: 4 + ((packed >> 5) & 0x03)
    };
  }

  function decodeCombustionProbeStatus(value) {
    const bytes = asBytes(value);
    if (bytes.byteLength < MIN_STATUS_BYTES) throw new RangeError("Le statut Combustion doit contenir au moins 30 octets.");
    const temperaturesC = decodeCombustionTemperatures(bytes.slice(8, 21));
    const modeAndId = bytes[21];
    const deviceStatus = bytes[22];
    const virtualSensors = virtualSensorIndexes(deviceStatus);
    const modeValue = modeAndId & 0x03;
    const mode = ["normal", "instant-read", "reserved", "error"][modeValue];
    return {
      temperaturesC,
      virtualSensors,
      virtualTemperaturesC: {
        core: temperaturesC[virtualSensors.core],
        surface: temperaturesC[virtualSensors.surface],
        ambient: temperaturesC[virtualSensors.ambient]
      },
      mode,
      probeId: ((modeAndId >> 5) & 0x07) + 1,
      batteryLow: Boolean(deviceStatus & 0x01)
    };
  }

  function safeIdentity(value, fallback) {
    return (String(value || "").trim() || fallback).slice(0, 60);
  }

  function combustionReadingsFromStatus(status, options = {}) {
    if (!status || !status.virtualTemperaturesC) throw new TypeError("Statut Combustion invalide.");
    const sourceId = `combustion:${safeIdentity(options.sourceId, "probe")}`;
    const sourceName = safeIdentity(options.sourceName, "Combustion Predictive Thermometer");
    const at = options.at == null ? Date.now() : options.at;
    return [
      { sourceId, sourceName, channelId: "core", role: "core", valueC: status.virtualTemperaturesC.core, at },
      { sourceId, sourceName, channelId: "surface", role: "unknown", valueC: status.virtualTemperaturesC.surface, at },
      { sourceId, sourceName, channelId: "ambient", role: "ambient", valueC: status.virtualTemperaturesC.ambient, at }
    ];
  }

  function combustionRequestOptions() {
    return { filters: [{ services: [COMBUSTION_PROBE_STATUS_SERVICE] }] };
  }

  async function openCombustionProbeConnection(bluetooth, handlers = {}) {
    if (!bluetooth || typeof bluetooth.requestDevice !== "function") throw new TypeError("Web Bluetooth indisponible.");
    const device = await bluetooth.requestDevice(combustionRequestOptions());
    let characteristic = null;
    let onValue = null;
    let onDisconnect = null;
    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(COMBUSTION_PROBE_STATUS_SERVICE);
      characteristic = await service.getCharacteristic(COMBUSTION_PROBE_STATUS_CHARACTERISTIC);
      const emit = value => {
        try {
          if (typeof handlers.onStatus === "function") handlers.onStatus(decodeCombustionProbeStatus(value), device);
        } catch (error) {
          if (typeof handlers.onError === "function") handlers.onError(error);
        }
      };
      onValue = event => emit(event.target.value);
      onDisconnect = () => {
        if (typeof handlers.onDisconnect === "function") handlers.onDisconnect(device);
      };
      characteristic.addEventListener("characteristicvaluechanged", onValue);
      device.addEventListener("gattserverdisconnected", onDisconnect);
      await characteristic.startNotifications();
      try { emit(await characteristic.readValue()); } catch (error) {
        if (typeof handlers.onError === "function") handlers.onError(error);
      }
    } catch (error) {
      if (characteristic && onValue) characteristic.removeEventListener("characteristicvaluechanged", onValue);
      if (onDisconnect) device.removeEventListener("gattserverdisconnected", onDisconnect);
      if (device.gatt && device.gatt.connected) device.gatt.disconnect();
      throw error;
    }
    return {
      device,
      disconnect() {
        if (characteristic && onValue) characteristic.removeEventListener("characteristicvaluechanged", onValue);
        if (onDisconnect) device.removeEventListener("gattserverdisconnected", onDisconnect);
        if (device.gatt && device.gatt.connected) device.gatt.disconnect();
      }
    };
  }

  return {
    COMBUSTION_PROBE_STATUS_SERVICE,
    COMBUSTION_PROBE_STATUS_CHARACTERISTIC,
    combustionRequestOptions,
    openCombustionProbeConnection,
    decodeCombustionTemperatures,
    decodeCombustionProbeStatus,
    combustionReadingsFromStatus
  };
});

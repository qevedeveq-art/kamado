(function initProbeAdapter(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoProbeAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function probeAdapterFactory() {
  "use strict";

  const PROBE_STATE_VERSION = 1;
  const ROLES = new Set(["dome", "core", "ambient", "unknown"]);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function boundedText(value, label) {
    const text = String(value || "").trim();
    if (!text || text.length > 80) throw new TypeError(`${label} invalide.`);
    return text;
  }

  function finiteNumber(value) {
    if (value === "" || value == null) return null;
    const number = Number(String(value).replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  function getProbeSupport(navigatorLike) {
    return {
      manual: true,
      simulator: true,
      webBluetooth: Boolean(navigatorLike && navigatorLike.bluetooth && typeof navigatorLike.bluetooth.requestDevice === "function")
    };
  }

  function probeChannelKey(sourceId, channelId) {
    return JSON.stringify([boundedText(sourceId, "Source"), boundedText(channelId, "Canal")]);
  }

  function normalizeProbeReading(input, now = Date.now()) {
    if (!input || typeof input !== "object") throw new TypeError("Relevé de sonde invalide.");
    const sourceId = boundedText(input.sourceId, "Source");
    const channelId = boundedText(input.channelId, "Canal");
    const sourceName = String(input.sourceName || sourceId).trim().slice(0, 80) || sourceId;
    const role = String(input.role || "unknown").trim().toLowerCase();
    if (!ROLES.has(role)) throw new TypeError("Rôle de sonde invalide.");

    const unit = String(input.unit || "C").trim().toUpperCase();
    if (unit !== "C" && unit !== "F") throw new TypeError("Unité de température invalide.");
    const rawValue = finiteNumber(input.valueC != null ? input.valueC : input.value);
    if (rawValue == null) throw new TypeError("Température de sonde invalide.");
    const valueC = unit === "F" ? (rawValue - 32) * 5 / 9 : rawValue;
    if (valueC < -50 || valueC > 500) throw new RangeError("Température de sonde hors limites.");

    const at = finiteNumber(input.at == null ? now : input.at);
    if (at == null || at < 0) throw new TypeError("Horodatage de sonde invalide.");
    const reading = {
      sourceId,
      sourceName,
      channelId,
      role,
      valueC: Math.round(valueC * 10) / 10,
      at: Math.round(at)
    };
    const batteryPct = finiteNumber(input.batteryPct);
    if (batteryPct != null) reading.batteryPct = Math.max(0, Math.min(100, Math.round(batteryPct)));
    return reading;
  }

  function createProbeState() {
    return { version: PROBE_STATE_VERSION, channels: {}, assignments: {} };
  }

  function hydrateProbeState(raw) {
    if (!raw || raw.version !== PROBE_STATE_VERSION || !raw.channels || !raw.assignments) return createProbeState();
    const next = createProbeState();
    for (const [channelKey, value] of Object.entries(raw.channels)) {
      try {
        const reading = normalizeProbeReading(value);
        if (probeChannelKey(reading.sourceId, reading.channelId) === channelKey) next.channels[channelKey] = reading;
      } catch (_) {}
    }
    for (const [channelKey, role] of Object.entries(raw.assignments)) {
      if (next.channels[channelKey] && ROLES.has(role)) next.assignments[channelKey] = role;
    }
    return next;
  }

  function applyProbeReading(state, input, now = Date.now()) {
    const next = hydrateProbeState(state);
    const reading = normalizeProbeReading(input, now);
    const channelKey = probeChannelKey(reading.sourceId, reading.channelId);
    next.channels[channelKey] = reading;
    if (!next.assignments[channelKey] || reading.role !== "unknown") {
      next.assignments[channelKey] = reading.role;
    }
    return next;
  }

  function assignProbeRole(state, sourceId, channelId, role) {
    const next = hydrateProbeState(state);
    const channelKey = probeChannelKey(sourceId, channelId);
    const normalizedRole = String(role || "").trim().toLowerCase();
    if (!next.channels[channelKey]) throw new TypeError("Canal de sonde inconnu.");
    if (!ROLES.has(normalizedRole)) throw new TypeError("Rôle de sonde invalide.");
    next.assignments[channelKey] = normalizedRole;
    return next;
  }

  function latestReadingsForCook(state, now = Date.now(), staleAfterMs = 30_000) {
    const current = hydrateProbeState(state);
    const latest = {};
    for (const [channelKey, reading] of Object.entries(current.channels)) {
      const role = current.assignments[channelKey] || reading.role;
      if (role !== "dome" && role !== "core") continue;
      if (!latest[role] || reading.at > latest[role].at) latest[role] = reading;
    }
    const staleRoles = [];
    const result = { domeC: null, coreC: null, staleRoles };
    for (const role of ["dome", "core"]) {
      if (!latest[role]) continue;
      if (now - latest[role].at > Math.max(1, Number(staleAfterMs) || 30_000)) staleRoles.push(role);
      else result[`${role}C`] = latest[role].valueC;
    }
    return result;
  }

  function createProbeSimulator(options = {}) {
    const domeC = finiteNumber(options.domeC);
    const coreC = finiteNumber(options.coreC);
    return {
      version: 1,
      tick: 0,
      domeC: domeC == null ? 95 : Math.max(-50, Math.min(500, domeC)),
      coreC: coreC == null ? 35 : Math.max(-50, Math.min(150, coreC))
    };
  }

  function nextSimulatorReadings(simulator, now = Date.now()) {
    const current = createProbeSimulator(simulator);
    current.tick = Math.max(0, Number(simulator && simulator.tick) || 0) + 1;
    current.domeC = Math.min(135, Math.round((current.domeC + 3) * 10) / 10);
    current.coreC = Math.min(94, Math.round((current.coreC + 0.8) * 10) / 10);
    return {
      simulator: current,
      readings: [
        normalizeProbeReading({ sourceId: "simulator", sourceName: "Simulateur Kamado", channelId: "dome", role: "dome", valueC: current.domeC, at: now }),
        normalizeProbeReading({ sourceId: "simulator", sourceName: "Simulateur Kamado", channelId: "core", role: "core", valueC: current.coreC, at: now })
      ]
    };
  }

  return {
    PROBE_STATE_VERSION,
    getProbeSupport,
    probeChannelKey,
    normalizeProbeReading,
    createProbeState,
    hydrateProbeState,
    applyProbeReading,
    assignProbeRole,
    latestReadingsForCook,
    createProbeSimulator,
    nextSimulatorReadings
  };
});

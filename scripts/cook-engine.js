(function initCookEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoCookEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function cookEngineFactory() {
  "use strict";

  const SESSION_VERSION = 2;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function finiteNumber(value) {
    if (value === "" || value == null) return null;
    const number = Number(String(value).replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  function parseTemperatureRange(value) {
    const numbers = String(value || "").match(/\d+(?:[.,]\d+)?/g) || [];
    if (!numbers.length) return null;
    const first = finiteNumber(numbers[0]);
    const second = numbers.length > 1 ? finiteNumber(numbers[1]) : first;
    if (first == null || second == null) return null;
    return { min: Math.min(first, second), max: Math.max(first, second) };
  }

  function parseDurationSeconds(value) {
    const text = String(value || "").toLowerCase().replace(/,/g, ".");
    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h(?:eure)?s?/);
    const minuteMatch = text.match(/(\d+)\s*(?:min|minutes?)/);
    if (!hourMatch && !minuteMatch) return 0;
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return Math.max(0, Math.round((hours * 60 + minutes) * 60));
  }

  function buildCookPlan(recipe) {
    const coreTarget = parseTemperatureRange(recipe && recipe.coeur);
    const phases = recipe && Array.isArray(recipe.phases) ? recipe.phases : [];
    if (phases.length) {
      return phases.map((phase, index) => ({
        id: `phase-${index + 1}`,
        title: phase.name || `Phase ${index + 1}`,
        mode: phase.mode || recipe.mode || "cuisson",
        instruction: phase.action || `Maintenir le kamado à ${phase.temp_C || recipe.tempK || "la température prévue"}.`,
        targetDomeC: finiteNumber(phase.temp_C),
        targetCore: index === phases.length - 1 ? coreTarget : null,
        durationSec: Math.max(0, Math.round((finiteNumber(phase.duration_min) || 0) * 60))
      }));
    }

    const steps = recipe && Array.isArray(recipe.etapes) && recipe.etapes.length
      ? recipe.etapes
      : ["Suivre les indications de la recette et contrôler la cuisson à la sonde."];
    const domeTarget = parseTemperatureRange(recipe && recipe.tempK);
    return steps.map((instruction, index) => ({
      id: `step-${index + 1}`,
      title: `Étape ${index + 1}`,
      mode: recipe.mode || "cuisson",
      instruction,
      targetDomeC: domeTarget ? domeTarget.min : null,
      targetCore: index === steps.length - 1 ? coreTarget : null,
      durationSec: parseDurationSeconds(instruction)
    }));
  }

  function timerForStep(step) {
    const durationSec = Math.max(0, Number(step && step.durationSec) || 0);
    return { durationSec, remainingSec: durationSec, running: false, endsAt: null };
  }

  function createCookSession(recipe, now = Date.now()) {
    const plan = buildCookPlan(recipe);
    return {
      version: SESSION_VERSION,
      recipeId: recipe.id || recipe.nom,
      recipeName: recipe.nom,
      status: "active",
      startedAt: now,
      updatedAt: now,
      stepIndex: 0,
      completedStepIds: [],
      observations: [],
      timer: timerForStep(plan[0])
    };
  }

  function syncSessionTimer(session, now = Date.now()) {
    const next = clone(session);
    if (!next.timer || !next.timer.running || !Number.isFinite(next.timer.endsAt)) return next;
    next.timer.remainingSec = Math.max(0, Math.ceil((next.timer.endsAt - now) / 1000));
    if (next.timer.remainingSec === 0) {
      next.timer.running = false;
      next.timer.endsAt = null;
    }
    next.updatedAt = now;
    return next;
  }

  function hydrateCookSession(raw, recipe, now = Date.now()) {
    if (!raw || raw.version !== SESSION_VERSION || raw.recipeId !== (recipe.id || recipe.nom) || raw.status !== "active") {
      return createCookSession(recipe, now);
    }
    const plan = buildCookPlan(recipe);
    const next = syncSessionTimer(raw, now);
    next.stepIndex = Math.max(0, Math.min(Number(next.stepIndex) || 0, plan.length - 1));
    next.completedStepIds = Array.isArray(next.completedStepIds) ? next.completedStepIds : [];
    next.observations = Array.isArray(next.observations) ? next.observations : [];
    if (!next.timer || !Number.isFinite(next.timer.durationSec)) next.timer = timerForStep(plan[next.stepIndex]);
    return next;
  }

  function startSessionTimer(session, now = Date.now()) {
    const next = syncSessionTimer(session, now);
    if (!next.timer || next.timer.remainingSec <= 0) return next;
    next.timer.running = true;
    next.timer.endsAt = now + next.timer.remainingSec * 1000;
    next.updatedAt = now;
    return next;
  }

  function pauseSessionTimer(session, now = Date.now()) {
    const next = syncSessionTimer(session, now);
    next.timer.running = false;
    next.timer.endsAt = null;
    next.updatedAt = now;
    return next;
  }

  function adjustSessionTimer(session, deltaSec, now = Date.now()) {
    const next = syncSessionTimer(session, now);
    const delta = Number(deltaSec) || 0;
    next.timer.remainingSec = Math.max(0, next.timer.remainingSec + delta);
    next.timer.durationSec = Math.max(next.timer.durationSec, next.timer.remainingSec);
    if (next.timer.running) next.timer.endsAt = now + next.timer.remainingSec * 1000;
    next.updatedAt = now;
    return next;
  }

  function resetSessionTimer(session, recipe, now = Date.now()) {
    const next = clone(session);
    const plan = buildCookPlan(recipe);
    next.timer = timerForStep(plan[next.stepIndex]);
    next.updatedAt = now;
    return next;
  }

  function setCookStep(session, recipe, nextIndex, now = Date.now()) {
    const plan = buildCookPlan(recipe);
    const currentIndex = Math.max(0, Math.min(session.stepIndex, plan.length - 1));
    const targetIndex = Math.max(0, Math.min(Number(nextIndex) || 0, plan.length - 1));
    const next = clone(session);
    if (targetIndex > currentIndex) {
      for (let index = currentIndex; index < targetIndex; index += 1) {
        if (!next.completedStepIds.includes(plan[index].id)) next.completedStepIds.push(plan[index].id);
      }
    }
    next.stepIndex = targetIndex;
    next.timer = timerForStep(plan[targetIndex]);
    next.updatedAt = now;
    return next;
  }

  function advanceCookSession(session, recipe, now = Date.now()) {
    return setCookStep(session, recipe, session.stepIndex + 1, now);
  }

  function recordCookObservation(session, values, now = Date.now()) {
    const domeC = finiteNumber(values && values.domeC);
    const coreC = finiteNumber(values && values.coreC);
    if (domeC == null && coreC == null) return clone(session);
    const next = clone(session);
    next.observations.push({ at: now, stepIndex: next.stepIndex, domeC, coreC });
    next.updatedAt = now;
    return next;
  }

  function evaluateCookTemperatures(step, observation) {
    const domeC = finiteNumber(observation && observation.domeC);
    const coreC = finiteNumber(observation && observation.coreC);
    const targetDome = finiteNumber(step && step.targetDomeC);
    const targetCore = step && step.targetCore;
    let dome = { status: "untracked", message: "Saisissez la température du dôme pour obtenir un repère." };
    if (domeC != null && targetDome != null) {
      const tolerance = Math.max(8, Math.round(targetDome * 0.06));
      if (domeC < targetDome - tolerance) {
        dome = { status: "low", message: "Température basse : ouvrez légèrement l’évent bas, puis attendez 5 minutes avant de corriger à nouveau." };
      } else if (domeC > targetDome + tolerance) {
        dome = { status: "high", message: "Température haute : réduisez légèrement l’arrivée d’air sans fermer totalement, puis laissez le kamado se stabiliser." };
      } else {
        dome = { status: "stable", message: "Dôme stable dans la zone cible. Gardez les évents inchangés." };
      }
    }

    let core = { status: "untracked", message: "Aucune cible à cœur active pour cette phase." };
    if (coreC != null && targetCore) {
      if (coreC < targetCore.min - 3) {
        core = { status: "rising", message: `Cuisson en cours : encore environ ${Math.round(targetCore.min - coreC)} °C avant la zone cible.` };
      } else if (coreC < targetCore.min) {
        core = { status: "approaching", message: "La cible approche : contrôlez plus souvent et préparez la sortie du kamado." };
      } else if (coreC <= targetCore.max + 2) {
        core = { status: "ready", message: "Zone cible atteinte selon la recette. Vérifiez le point le plus froid avant de sortir l’aliment." };
      } else {
        core = { status: "over", message: "La cible indiquée est dépassée : retirez l’aliment du feu et contrôlez sa cuisson immédiatement." };
      }
    }
    return { dome, core };
  }

  function formatElapsed(startedAt, completedAt) {
    const minutes = Math.max(1, Math.round((completedAt - startedAt) / 60000));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  function completeCookSession(session, recipe, now = Date.now()) {
    const next = pauseSessionTimer(session, now);
    next.status = "completed";
    next.completedAt = now;
    const plan = buildCookPlan(recipe);
    const latestCore = [...next.observations].reverse().find(item => item.coreC != null);
    const duration = formatElapsed(next.startedAt, now);
    const core = latestCore ? `${latestCore.coreC} °C` : "";
    const notes = `Cook Engine 2.0 · ${plan.length} étape${plan.length > 1 ? "s" : ""} · ${next.observations.length} relevé${next.observations.length > 1 ? "s" : ""}.`;
    return {
      session: next,
      log: {
        date: new Date(now).toLocaleDateString("fr-FR"),
        completedAt: new Date(now).toISOString(),
        meteo: "Session guidée",
        charbon: recipe.bois || "",
        duree: duration,
        coeur: core,
        obs: notes,
        duration,
        temp: core,
        wood: recipe.bois || "",
        notes
      }
    };
  }

  return {
    SESSION_VERSION,
    parseTemperatureRange,
    parseDurationSeconds,
    buildCookPlan,
    createCookSession,
    hydrateCookSession,
    syncSessionTimer,
    startSessionTimer,
    pauseSessionTimer,
    adjustSessionTimer,
    resetSessionTimer,
    setCookStep,
    advanceCookSession,
    recordCookObservation,
    evaluateCookTemperatures,
    completeCookSession
  };
});

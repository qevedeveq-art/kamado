(function initKamadoThermals(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoThermals = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function kamadoThermalsFactory() {
  "use strict";

  function finiteNumber(value) {
    if (value === "" || value == null) return null;
    const number = Number(String(value).replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  /**
   * Estimates rate of temperature change (°C per minute) over a sample series.
   * Samples: array of { at: timestampMs, tempC: number }
   */
  function estimateRateOfChange(samples) {
    if (!Array.isArray(samples) || samples.length < 2) return 0;
    const valid = samples
      .map(s => ({ at: finiteNumber(s.at), tempC: finiteNumber(s.tempC) }))
      .filter(s => s.at != null && s.tempC != null)
      .sort((a, b) => a.at - b.at);

    if (valid.length < 2) return 0;
    const first = valid[0];
    const last = valid[valid.length - 1];
    const durationMin = (last.at - first.at) / 60000;
    if (durationMin <= 0.1) return 0;
    const deltaC = last.tempC - first.tempC;
    return Math.round((deltaC / durationMin) * 100) / 100;
  }

  /**
   * Dynamic vent and airflow recommendations taking into account the massive
   * thermal inertia of ceramic kamados (exponential response curve).
   */
  function calculateAirflowAdvice(params) {
    const currentDomeC = finiteNumber(params && params.currentDomeC);
    const targetDomeC = finiteNumber(params && params.targetDomeC);
    const ratePerMin = finiteNumber(params && params.ratePerMin) ?? 0;
    const bottomVent = String((params && params.bottomVent) || "").trim();
    const topVent = String((params && params.topVent) || "").trim();

    if (currentDomeC == null || targetDomeC == null) {
      return {
        severity: "nominal",
        advice: "Réglez vos évents selon la fiche recette.",
        recommendedBottom: bottomVent || "1/3 ouvert",
        recommendedTop: topVent || "1/3 ouvert",
        predictedDomeIn10MinC: currentDomeC ?? targetDomeC ?? 110
      };
    }

    // Predict temperature in 10 minutes accounting for thermal inertia damping
    const damping = 0.75;
    const predictedDomeIn10MinC = Math.round((currentDomeC + ratePerMin * 10 * damping) * 10) / 10;
    const deltaToTarget = currentDomeC - targetDomeC;

    // CASE 1: CRITICAL OVERHEAT (> 25°C above target)
    if (deltaToTarget > 25) {
      return {
        severity: "urgent",
        advice: "Surchauffe sévère : fermez l'évent bas (laisser 1 mm) et réduisez la marguerite du haut à 1/4 pour étouffer l'air sans éteindre le charbon.",
        recommendedBottom: "Quasi fermé (1 mm)",
        recommendedTop: "1/4 ouvert",
        predictedDomeIn10MinC
      };
    }

    // CASE 2: OVERHEAT DRIFT (10°C to 25°C above target)
    if (deltaToTarget > 10) {
      return {
        severity: "warning",
        advice: "Température supérieure à la cible : réduisez l'évent bas d'un cran. Attention à l'inertie céramique (baisse lente de 10-15 min).",
        recommendedBottom: "1/4 ouvert",
        recommendedTop: "1/4 ouvert",
        predictedDomeIn10MinC
      };
    }

    // CASE 3: RAPID RISE APPROACHING TARGET (anticipatory throttling to avoid overshoot)
    if (deltaToTarget <= 0 && deltaToTarget >= -20 && ratePerMin > 2.5) {
      return {
        severity: "warning",
        advice: "Montée rapide vers la consigne : bridez les évents dès maintenant à leur position de croisière pour absorber l'inertie sans dépassement.",
        recommendedBottom: "1/3 ouvert",
        recommendedTop: "1/3 ouvert",
        predictedDomeIn10MinC
      };
    }

    // CASE 4: SEVERE HEAT DROP (> 25°C below target and stalled/falling)
    if (deltaToTarget < -25 && ratePerMin <= 0.2) {
      return {
        severity: "warning",
        advice: "Chaleur insuffisante : ouvrez l'évent bas à 1/2. Si la température ne remonte pas, vérifiez le lit de cendres qui étouffe le tirage.",
        recommendedBottom: "1/2 ouvert",
        recommendedTop: "1/2 ouvert",
        predictedDomeIn10MinC
      };
    }

    // CASE 5: MODERATE DEFICIT (10°C to 25°C below target)
    if (deltaToTarget < -10) {
      return {
        severity: "nominal",
        advice: "Ouvrez légèrement l'évent bas (environ 5 mm de plus) pour relancer l'apport d'oxygène.",
        recommendedBottom: "1/2 ouvert",
        recommendedTop: "1/3 ouvert",
        predictedDomeIn10MinC
      };
    }

    // CASE 6: ON TARGET (±10°C)
    return {
      severity: "nominal",
      advice: "Température stabilisée : conservez vos réglages actuels et évitez d'ouvrir le dôme.",
      recommendedBottom: bottomVent || "1/3 ouvert",
      recommendedTop: topVent || "1/3 ouvert",
      predictedDomeIn10MinC
    };
  }

  /**
   * Detects the evaporative cooling plateau ("the stall") common in low & slow
   * cooking of large cuts (brisket, pulled pork, chuck roast).
   * Typically occurs between 64°C and 76°C internal.
   */
  function detectStall(params) {
    const currentCoreC = finiteNumber(params && params.currentCoreC);
    const coreHistory = Array.isArray(params && params.coreHistory) ? params.coreHistory : [];
    const cookingDurationMin = finiteNumber(params && params.cookingDurationMin) ?? 0;

    if (currentCoreC == null) {
      return {
        inStall: false,
        stallStartC: null,
        durationMin: 0,
        advice: "En attente de relevé de sonde à cœur.",
        wrapRecommendation: null
      };
    }

    // Stall occurs between 64°C and 76°C in low & slow cooks
    const inStallTempZone = currentCoreC >= 64 && currentCoreC <= 76;
    const rateOfRise = estimateRateOfChange(coreHistory);

    // If in the zone and slope is nearly flat (< 0.25°C/min) or negative for at least 15 min
    const isPlateauing = inStallTempZone && rateOfRise < 0.25;

    if (isPlateauing) {
      return {
        inStall: true,
        stallStartC: Math.round(currentCoreC),
        rateOfRise,
        durationMin: Math.max(15, Math.min(240, Math.round(cookingDurationMin * 0.3))),
        advice: "Zone de stall atteinte (évaporation superficielle bloquant la montée). Vous pouvez laisser passer naturellement ou emballer (Texas crutch).",
        wrapRecommendation: "Emballez dans du papier boucher (ou alu) avec une noisette de beurre/bouillon pour franchir le plateau tout en préservant le bark."
      };
    }

    if (currentCoreC > 76) {
      return {
        inStall: false,
        stallStartC: null,
        rateOfRise,
        durationMin: 0,
        advice: "Le plateau de stall est franchi. Poursuivez la cuisson jusqu'à tendreté finale.",
        wrapRecommendation: null
      };
    }

    return {
      inStall: false,
      stallStartC: null,
      rateOfRise,
      durationMin: 0,
      advice: "Montée thermique normale vers le plateau de cuisson.",
      wrapRecommendation: null
    };
  }

  /**
   * Calculates post-cook carryover temperature rise based on dome intensity,
   * meat cut thickness, and target final doneness.
   */
  function calculateCarryover(params) {
    const targetDoneC = finiteNumber(params && params.targetDoneC) ?? 54;
    const domeTempC = finiteNumber(params && params.domeTempC) ?? 120;
    const meatType = String((params && params.meatType) || "beef").toLowerCase();
    const isDirectSear = domeTempC > 200 || (params && params.cookingMode && /direct|saisie|braises/i.test(params.cookingMode));

    let estimatedRiseC = 3;
    let restMin = 10;

    if (isDirectSear) {
      // High gradient between seared crust (150°C+) and core
      estimatedRiseC = 5;
      restMin = 12;
    } else if (domeTempC <= 125) {
      // Gentle thermal gradient (low & slow)
      estimatedRiseC = 2;
      restMin = 20; // Long cuts rest longer
    } else {
      // Medium roasting (140°C–190°C)
      estimatedRiseC = 4;
      restMin = 15;
    }

    if (meatType.includes("volaille") || meatType.includes("poultry")) {
      restMin = 10;
      if (estimatedRiseC > 4) estimatedRiseC = 4;
    }

    const targetPullC = Math.max(20, targetDoneC - estimatedRiseC);

    return {
      targetPullC,
      estimatedRiseC,
      restMin,
      advice: `Sortez la pièce du kamado dès ${targetPullC} °C à cœur. L'inertie thermique résiduelle (+${estimatedRiseC} °C) amènera la température finale idéale à ${targetDoneC} °C après ${restMin} min de repos sous feuille alu lâche.`
    };
  }

  /**
   * Composite thermal engine evaluation for an active cook session.
   */
  function evaluateThermalState(session, liveReadings = {}) {
    const domeTempC = liveReadings.dome != null ? finiteNumber(liveReadings.dome) : null;
    const coreTempC = liveReadings.core != null ? finiteNumber(liveReadings.core) : null;
    const targetDomeC = finiteNumber(session && session.targetDomeC) ?? 115;
    const targetCoreC = finiteNumber(session && session.targetCoreC) ?? 54;
    const ratePerMin = finiteNumber(liveReadings.domeRatePerMin) ?? 0;

    const airflow = calculateAirflowAdvice({
      currentDomeC: domeTempC,
      targetDomeC,
      ratePerMin,
      bottomVent: session && session.vents && session.vents.bottom,
      topVent: session && session.vents && session.vents.top
    });

    const stall = detectStall({
      currentCoreC: coreTempC,
      coreHistory: liveReadings.coreHistory || [],
      cookingDurationMin: session && session.elapsedSeconds ? session.elapsedSeconds / 60 : 0
    });

    const carryover = calculateCarryover({
      targetDoneC: targetCoreC,
      domeTempC: domeTempC ?? targetDomeC,
      cookingMode: session && session.mode,
      meatType: session && session.meatType
    });

    return {
      domeTempC,
      coreTempC,
      targetDomeC,
      targetCoreC,
      airflow,
      stall,
      carryover,
      status: airflow.severity === "urgent" ? "critical" : airflow.severity === "warning" ? "warning" : "nominal"
    };
  }

  return {
    estimateRateOfChange,
    calculateAirflowAdvice,
    detectStall,
    calculateCarryover,
    evaluateThermalState
  };
});

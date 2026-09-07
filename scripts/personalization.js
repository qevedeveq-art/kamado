(function initPersonalization(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoPersonalization = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function personalizationFactory() {
  "use strict";

  const EXPERIENCES = new Set(["debutant", "intermediaire", "expert"]);
  const MODES = new Set(["all", "direct", "indirect", "fumage"]);
  const SIZES = new Set(["compact", "standard", "xl"]);

  function normalizeCookingProfile(value) {
    const profile = value && typeof value === "object" ? value : {};
    return {
      experience: EXPERIENCES.has(profile.experience) ? profile.experience : "intermediaire",
      preferredMode: MODES.has(profile.preferredMode) ? profile.preferredMode : "all",
      kamadoSize: SIZES.has(profile.kamadoSize) ? profile.kamadoSize : "standard",
      personalization: profile.personalization === true
    };
  }

  function modeMatches(recipe, preferredMode) {
    const mode = String(recipe && recipe.mode || "").toLowerCase();
    if (preferredMode === "direct") return mode.includes("direct");
    if (preferredMode === "indirect") return mode.includes("indirect");
    if (preferredMode === "fumage") return /fumage|low|slow|brais|confit/.test(mode);
    return false;
  }

  function levelMatches(recipe, experience) {
    const difficulty = Math.max(1, Math.min(5, Number(recipe && recipe.difficulty) || 3));
    if (experience === "debutant") return difficulty <= 2;
    if (experience === "expert") return difficulty >= 4;
    return difficulty >= 2 && difficulty <= 3;
  }

  function scoreRecipePreference(recipe, context = {}) {
    const profile = normalizeCookingProfile(context.profile);
    if (!profile.personalization) return { score: 0, reasons: [] };
    const name = recipe && recipe.nom;
    const favorites = context.favorites instanceof Set ? context.favorites : new Set(context.favorites || []);
    const ratings = context.ratings && typeof context.ratings === "object" ? context.ratings : {};
    const history = Array.isArray(context.history) ? context.history : [];
    const reasons = [];
    let score = 0;
    if (favorites.has(name)) { score += 40; reasons.push("favori"); }
    const rating = Math.max(0, Math.min(5, Number(ratings[name]) || 0));
    if (rating) { score += rating * 6; reasons.push(`noté ${rating}/5`); }
    const recentIndex = history.indexOf(name);
    if (recentIndex >= 0) { score += Math.max(5, 20 - recentIndex * 3); reasons.push("consulté récemment"); }
    if (profile.preferredMode !== "all" && modeMatches(recipe, profile.preferredMode)) { score += 15; reasons.push("mode préféré"); }
    if (levelMatches(recipe, profile.experience)) { score += 12; reasons.push("niveau adapté"); }
    return { score, reasons };
  }

  function sortRecipesForProfile(recipes, context = {}) {
    const profile = normalizeCookingProfile(context.profile);
    const source = Array.isArray(recipes) ? recipes : [];
    if (!profile.personalization) return source.slice();
    return source.map((recipe, index) => ({ recipe, index, score: scoreRecipePreference(recipe, { ...context, profile }).score }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(item => item.recipe);
  }

  return { normalizeCookingProfile, scoreRecipePreference, sortRecipesForProfile };
});

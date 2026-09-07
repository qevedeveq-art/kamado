(function initRecipeLinks(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoRecipeLinks = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function recipeLinksFactory() {
  "use strict";

  function recipeSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  function recipeRef(recipe) {
    return String(recipe && recipe.id ? recipe.id : recipeSlug(recipe && recipe.nom));
  }

  function recipeHash(recipe) {
    return `#recette=${encodeURIComponent(recipeRef(recipe))}`;
  }

  function recipeUrl(recipe, locationLike) {
    const loc = locationLike || root.location;
    if (!loc) return recipeHash(recipe);
    return `${loc.origin}${loc.pathname}${recipeHash(recipe)}`;
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return null;
    }
  }

  function parseRecipeHash(hash) {
    const raw = String(hash || "");
    if (raw.startsWith("#recette=")) {
      const value = safeDecode(raw.slice(9));
      return value ? { kind: "id", value } : null;
    }
    if (raw.startsWith("#recipe-")) {
      const value = safeDecode(raw.slice(8));
      return value ? { kind: "legacy-name", value } : null;
    }
    return null;
  }

  function findRecipeIndex(recipes, ref) {
    if (!Array.isArray(recipes) || !ref) return -1;
    if (ref.kind === "legacy-name") {
      return recipes.findIndex(recipe => recipe && (
        recipe.nom === ref.value || recipe._orig?.nom === ref.value
      ));
    }
    if (ref.kind === "id") {
      return recipes.findIndex(recipe => recipeRef(recipe) === ref.value);
    }
    return -1;
  }

  return {
    recipeSlug,
    recipeRef,
    recipeHash,
    recipeUrl,
    parseRecipeHash,
    findRecipeIndex
  };
});

(function initEditorialSearch(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoEditorialSearch = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function editorialSearchFactory() {
  "use strict";

  const SYNONYMS = {
    ribs: ["travers", "cotes", "short ribs", "dino"],
    travers: ["ribs", "spareribs"],
    brisket: ["poitrine", "paleron", "chuck"],
    poitrine: ["brisket", "bacon", "lard"],
    effiloche: ["pulled", "pork"],
    pulled: ["effiloche", "pork"],
    steak: ["bavette", "onglet", "entrecote", "faux filet", "tomahawk"],
    cote: ["tomahawk", "cotelette"],
    burger: ["smash", "hamburger"],
    pain: ["pita", "naan", "focaccia", "campagne", "levain", "pizza"],
    pains: ["pitas", "naans", "focaccias", "pizzas"],
    volaille: ["poulet", "canard", "pintade", "dinde", "caille"],
    poisson: ["saumon", "thon", "bar", "loup", "turbot", "dorade", "cabillaud", "truite"],
    "sauce blanche": ["alabama", "mayonnaise", "toum"]
  };

  const FIELD_ALIASES = {
    cat: "category",
    categorie: "category",
    mode: "mode",
    bois: "wood",
    source: "source",
    ingredient: "ingredients",
    ingredients: "ingredients",
    temp: "temperature"
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseSearchQuery(query) {
    const parsed = { terms: [], excluded: [], filters: [] };
    const input = String(query || "");
    const tokenPattern = /(-?)(?:"([^"]+)"|(\S+))/g;
    let match;
    while ((match = tokenPattern.exec(input))) {
      const isExcluded = match[1] === "-";
      const rawValue = normalize(match[2] || match[3]);
      if (!rawValue) continue;
      const separator = rawValue.indexOf(":");
      const alias = separator > 0 ? rawValue.slice(0, separator) : "";
      const filterValue = separator > 0 ? rawValue.slice(separator + 1) : "";
      if (FIELD_ALIASES[alias] && filterValue) {
        parsed.filters.push({ field: FIELD_ALIASES[alias], value: filterValue, excluded: isExcluded });
      } else {
        parsed[isExcluded ? "excluded" : "terms"].push(rawValue);
      }
    }
    return parsed;
  }

  function listText(value) {
    if (Array.isArray(value)) return value.map(listText).join(" ");
    if (value && typeof value === "object") return Object.values(value).map(listText).join(" ");
    return value || "";
  }

  function recipeDocument(recipe) {
    return normalize([
      recipe.nom,
      recipe.ori,
      recipe.cat,
      recipe.mode,
      recipe.tempK,
      recipe.coeur,
      recipe.temps,
      recipe.bois,
      recipe.tags,
      recipe.astuce,
      recipe.source,
      listText(recipe.ings),
      listText(recipe.etapes),
      listText(recipe.equipement),
      listText(recipe.erreurs),
      listText(recipe.notes_securite),
      listText(recipe.substitutions)
    ].join(" "));
  }

  function fieldDocument(recipe, field) {
    const fields = {
      category: recipe.cat,
      mode: recipe.mode,
      wood: recipe.bois,
      source: recipe.source,
      ingredients: listText(recipe.ings),
      temperature: `${recipe.tempK || ""} ${recipe.coeur || ""}`
    };
    return normalize(fields[field]);
  }

  function matchesTerm(document, term) {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) return true;
    if (document.includes(normalizedTerm)) return true;
    const synonyms = SYNONYMS[normalizedTerm] || [];
    return synonyms.some(value => document.includes(normalize(value)));
  }

  function matchesRecipeQuery(recipe, query) {
    const parsed = typeof query === "string" ? parseSearchQuery(query) : query;
    const document = recipeDocument(recipe);
    if (!parsed.terms.every(term => matchesTerm(document, term))) return false;
    if (parsed.excluded.some(term => matchesTerm(document, term))) return false;
    return parsed.filters.every(filter => {
      const matches = matchesTerm(fieldDocument(recipe, filter.field), filter.value);
      return filter.excluded ? !matches : matches;
    });
  }

  function scoreRecipeQuery(recipe, query) {
    const parsed = typeof query === "string" ? parseSearchQuery(query) : query;
    if (!matchesRecipeQuery(recipe, parsed)) return -1;
    const name = normalize(recipe.nom);
    const origin = normalize(recipe.ori);
    const ingredients = normalize(listText(recipe.ings));
    return parsed.terms.reduce((score, term) => {
      const value = normalize(term);
      if (name === value) return score + 100;
      if (name.startsWith(value)) return score + 50;
      if (name.includes(value)) return score + 30;
      if (origin.includes(value)) return score + 12;
      if (ingredients.includes(value)) return score + 6;
      return score + 2;
    }, parsed.filters.length * 2);
  }

  return {
    normalize,
    parseSearchQuery,
    recipeDocument,
    matchesRecipeQuery,
    scoreRecipeQuery
  };
});

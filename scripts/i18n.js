"use strict";

/**
 * Kamado i18n Engine - Zero-dependency localization layer.
 * Supports French (canonical source) and English (international expansion).
 * Ready for German (de) and Dutch (nl) extensions.
 */

const SUPPORTED_LANGUAGES = ["fr", "en"];
const DEFAULT_LANGUAGE = "fr";

const DICTIONARY = {
  fr: {
    app: {
      title: "Livre de recettes Kamado",
      subtitle: "L'art de la cuisson en céramique · Guide & Recettes",
      new_recipe: "Nouvelle recette",
      new_recipe_short: "Recette",
      search_placeholder: "Recette, ingrédient, mode:fumage, -porc…",
      search_syntax: "Recherche experte : guillemets pour une expression, <b>-porc</b> pour exclure, <b>cat:</b>, <b>mode:</b>, <b>bois:</b>, <b>source:</b>, <b>ingredient:</b> ou <b>temp:</b>.",
      recipes_count: "{count} fiches documentées",
      active_cook: "Cuisson active",
      resume_session: "Reprendre la session",
      close: "Fermer",
      screen_awake: "☀️ Écran allumé",
      screen_asleep: "🌙 Écran normal"
    },
    tabs: {
      recipes: "🍽️ Recettes",
      menus: "🍱 Menus",
      bases: "🧂 Bases",
      guide: "📖 Maîtriser le Kamado",
      temp: "🌡️ Températures",
      vins: "🍷 Accords vins",
      assistant: "🧮 Assistant",
      donnees: "💾 Données"
    },
    categories: {
      all: "Tout",
      boeuf: "Bœuf",
      porc: "Porc",
      volaille: "Volaille",
      agneau: "Agneau & Gibier",
      poisson: "Poissons & Mer",
      legumes: "Légumes & Sides",
      pizza: "Pizzas & Pains",
      monde: "Cuisines du monde",
      dessert: "Desserts",
      vegetarien: "Végétarien",
      sauces: "Sauces & Marinades"
    },
    modes: {
      "Direct": "Saisie directe",
      "Indirect": "Four indirect",
      "Fumage lent": "Fumage lent",
      "Plancha": "Plancha",
      "Four à pizza": "Four à pizza",
      "Braisage cocotte": "Braisage cocotte"
    },
    cockpit: {
      title: "Cockpit Outdoor",
      target_dome: "Dôme Kamado",
      target_core: "Cœur aliment",
      target_surface: "Surface",
      target_ambient: "Ambiance",
      vents: "Évents",
      charcoal: "Charbon",
      rest: "Repos",
      pause: "Pause",
      resume: "Reprendre",
      advance: "Étape suivante",
      finish: "Terminer la cuisson",
      abandon: "Abandonner",
      probe_connected: "Sonde connectée",
      probe_disconnected: "Sonde déconnectée",
      simulate: "Simulateur",
      wake_lock_active: "Maintien de l'écran actif"
    },
    assistant: {
      sos_title: "SOS Kamado & Dépannage Express",
      rub_title: "Calculateur de Rubs & Dosage du Sel",
      journal_title: "Mon Journal de Braises",
      reverse_planning: "Rétroplanning & Gestion de Session",
      grocery_list: "Liste de courses par rayons"
    },
    vault: {
      title: "Coffre portable chiffré",
      export_encrypted: "Exporter le coffre chiffré (.kamado)",
      import_encrypted: "Importer un coffre (.kamado)",
      passphrase_label: "Phrase secrète de chiffrement",
      status_secure: "Chiffrement AES-256-GCM actif"
    }
  },
  en: {
    app: {
      title: "Kamado Recipe Book",
      subtitle: "The Art of Ceramic Cooking · Guide & Recipes",
      new_recipe: "New recipe",
      new_recipe_short: "Recipe",
      search_placeholder: "Recipe, ingredient, mode:smoke, -pork…",
      search_syntax: "Expert search: quotes for exact phrase, <b>-pork</b> to exclude, <b>cat:</b>, <b>mode:</b>, <b>wood:</b>, <b>source:</b>, <b>ingredient:</b> or <b>temp:</b>.",
      recipes_count: "{count} documented recipes",
      active_cook: "Active cook",
      resume_session: "Resume session",
      close: "Close",
      screen_awake: "☀️ Screen awake",
      screen_asleep: "🌙 Screen normal"
    },
    tabs: {
      recipes: "🍽️ Recipes",
      menus: "🍱 Menus",
      bases: "🧂 Bases",
      guide: "📖 Master Kamado",
      temp: "🌡️ Temperatures",
      vins: "🍷 Wine Pairings",
      assistant: "🧮 Assistant",
      donnees: "💾 Data"
    },
    categories: {
      all: "All",
      boeuf: "Beef",
      porc: "Pork",
      volaille: "Poultry",
      agneau: "Lamb & Game",
      poisson: "Fish & Seafood",
      legumes: "Vegetables & Sides",
      pizza: "Pizza & Breads",
      monde: "World Cuisine",
      dessert: "Desserts",
      vegetarien: "Vegetarian",
      sauces: "Sauces & Marinades"
    },
    modes: {
      "Direct": "Direct Searing",
      "Indirect": "Indirect Roasting",
      "Fumage lent": "Low & Slow Smoking",
      "Plancha": "Plancha / Griddle",
      "Four à pizza": "Pizza Oven",
      "Braisage cocotte": "Dutch Oven Braise"
    },
    cockpit: {
      title: "Outdoor Cockpit",
      target_dome: "Kamado Dome",
      target_core: "Food Core",
      target_surface: "Surface",
      target_ambient: "Ambient",
      vents: "Air Vents",
      charcoal: "Charcoal",
      rest: "Resting",
      pause: "Pause",
      resume: "Resume",
      advance: "Next Phase",
      finish: "Finish Cook",
      abandon: "Abandon",
      probe_connected: "Probe connected",
      probe_disconnected: "Probe disconnected",
      simulate: "Simulator",
      wake_lock_active: "Screen wake lock active"
    },
    assistant: {
      sos_title: "SOS Kamado & Emergency Troubleshooter",
      rub_title: "Rub Builder & Precision Salt Calculator",
      journal_title: "Ember Cook Journal",
      reverse_planning: "Reverse Cooking Timeline",
      grocery_list: "Aisle-Organized Grocery List"
    },
    vault: {
      title: "Encrypted Portable Vault",
      export_encrypted: "Export Encrypted Vault (.kamado)",
      import_encrypted: "Import Vault (.kamado)",
      passphrase_label: "Encryption Secret Passphrase",
      status_secure: "AES-256-GCM Encryption Active"
    }
  }
};

let currentLanguage = DEFAULT_LANGUAGE;

function resolveLanguage(candidate) {
  if (!candidate || typeof candidate !== "string") return DEFAULT_LANGUAGE;
  const clean = candidate.toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.includes(clean) ? clean : DEFAULT_LANGUAGE;
}

function getLanguage() {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("kamado_language");
    if (stored) return resolveLanguage(stored);
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return resolveLanguage(navigator.language);
  }
  return currentLanguage;
}

function setLanguage(lang) {
  const resolved = resolveLanguage(lang);
  currentLanguage = resolved;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("kamado_language", resolved);
    } catch {
      // storage unavailable
    }
  }
  return resolved;
}

function t(path, params = {}, lang = getLanguage()) {
  const dictionary = DICTIONARY[lang] || DICTIONARY[DEFAULT_LANGUAGE];
  const keys = String(path).split(".");
  let node = dictionary;

  for (const key of keys) {
    if (node && typeof node === "object" && key in node) {
      node = node[key];
    } else {
      // Fallback to default language
      const fallbackDict = DICTIONARY[DEFAULT_LANGUAGE];
      let fallbackNode = fallbackDict;
      for (const fKey of keys) {
        if (fallbackNode && typeof fallbackNode === "object" && fKey in fallbackNode) {
          fallbackNode = fallbackNode[fKey];
        } else {
          return path;
        }
      }
      node = fallbackNode;
      break;
    }
  }

  if (typeof node !== "string") return path;

  return node.replace(/\{(\w+)\}/g, (_, match) => (match in params ? String(params[match]) : `{${match}}`));
}

function translateCategory(categoryId, lang = getLanguage()) {
  const dict = DICTIONARY[lang] || DICTIONARY[DEFAULT_LANGUAGE];
  return (dict.categories && dict.categories[categoryId]) || categoryId;
}

function translateMode(modeName, lang = getLanguage()) {
  const dict = DICTIONARY[lang] || DICTIONARY[DEFAULT_LANGUAGE];
  return (dict.modes && dict.modes[modeName]) || modeName;
}

const api = {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  DICTIONARY,
  getLanguage,
  setLanguage,
  resolveLanguage,
  t,
  translateCategory,
  translateMode
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

if (typeof window !== "undefined") {
  window.KamadoI18n = api;
}

(function initI18n(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoI18n = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function i18nFactory() {
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
    menus: {
      title: "🍱 Composer un menu kamado",
      simple_generator: "Générateur simple",
      simple_desc: "Créez un menu cohérent avec une pièce principale, un accompagnement et un dessert cuits au kamado.",
      style_convivial: "Convivial",
      style_rapide: "Rapide",
      style_fumage: "Fumage / low & slow",
      style_vegetarien: "Végétarien",
      guests_4: "4 personnes",
      guests_6: "6 personnes",
      guests_8: "8 personnes",
      guests_format: "{count} personnes",
      generate_btn: "Générer un menu",
      copy_list_btn: "Copier la liste de courses du menu",
      add_shop_btn: "Ajouter le menu à la liste de courses",
      cook_compatibility: "Compatibilité cuisson",
      comp_single: "Menu compatible en température",
      comp_multi: "Menu à séquencer en deux températures",
      wine_card_title: "🍷 Vin conseillé — accord sur {dish}",
      wine_alt: "Alternative : {alt}",
      wine_service: "Service : {temp}",
      wine_warning: "⚠️ L'abus d'alcool est dangereux pour la santé.",
      main_dish: "Plat principal",
      side_dish: "Accompagnement",
      dessert: "Dessert",
      no_recipe: "Aucune recette disponible.",
      open_btn: "Ouvrir"
    },
    bases: {
      title: "🧂 Bases utiles",
      fav_suffix: "(Favoris)",
      desc: "Sauces, rubs et marinades conservés à part pour que l'onglet Recettes reste centré sur les cuissons kamado.",
      count_format: "{count} bases",
      empty_favs: "Aucune base en favoris."
    },
    filters: {
      mode_all: "Mode : tous",
      mode_direct: "Direct (saisie)",
      mode_indirect: "Indirect (four)",
      mode_fumage: "Fumage / mijoté",
      time_all: "Durée : toutes",
      time_express: "Express (< 30 min)",
      time_medium: "Moyen (30–120 min)",
      time_long: "Long (> 2 h)",
      diff_all: "Niveau : tous",
      diff_easy: "Facile",
      diff_intermediate: "Intermédiaire",
      diff_advanced: "Avancé",
      season_all: "Saison : toutes",
      season_spring: "Printemps",
      season_summer: "Été",
      season_autumn: "Automne",
      season_winter: "Hiver / fêtes",
      diets_label: "Régimes / Sans",
      gear_label: "Matériel",
      avail_all: "Disponible : tout",
      avail_45: "Ce soir (< 45 min)",
      avail_90: "Ce soir (< 1 h 30)",
      avail_180: "Demi-journée (< 3 h)",
      quality_all: "Qualité : toutes",
      quality_source: "Avec source",
      quality_security: "Avec sécurité",
      quality_errors: "Avec erreurs",
      quality_rich: "Très détaillées",
      sort_default: "Tri : recommandé",
      sort_time: "Durée",
      sort_diff: "Difficulté",
      sort_quality: "Qualité",
      sort_rating: "Note perso",
      sort_recent: "Récents",
      fav_btn: "Favoris",
      mine_btn: "Mes créations",
      create_btn: "➕ Créer",
      random_btn: "🎲 Au hasard"
    },
    smartbar: {
      tonight: "Ce soir",
      season: "Saison",
      pantry: "Garde-manger",
      outdoor: "Mode extérieur",
      sun: "☀️ Plein soleil",
      mine: "Mes créations",
      reset: "Réinitialiser",
      active_profile: "Profil actif",
      tip: "Astuce : combinez ingrédients, exclusions, régime, matériel et temps disponible pour trouver une cuisson réaliste."
    },
    quick_chips: {
      express: "⚡ < 30 min",
      direct: "🔥 Saisie vive",
      indirect: "🛡️ Four indirect",
      fumage: "💨 Low & Slow",
      favs: "⭐ Favoris",
      pizza: "🍕 Pizza & Pains",
      vege: "🌿 Végétarien"
    },
    stats: {
      recipes: "recettes kamado",
      express: "express",
      favs: "favoris",
      creations: "mes créations",
      rated: "notées",
      bases: "bases utiles"
    },
    collections: {
      first_fires_title: "Premiers feux",
      first_fires_desc: "Cuissons accessibles en moins de 1 h 30.",
      signatures_title: "Les signatures",
      signatures_desc: "Six recettes qui résument l’art du kamado.",
      low_slow_title: "Low & Slow",
      low_slow_desc: "Fumage propre, collagène et temps long.",
      reference_title: "Fiches de référence",
      reference_desc: "Sources, phases et points de contrôle complets."
    },
    modal: {
      fav_add: "☆ Ajouter aux favoris",
      fav_remove: "★ Favori",
      guided_cook: "Démarrer la cuisson guidée",
      resume_cook: "Reprendre la cuisson",
      edit: "✏️ Modifier",
      duplicate: "📋 Dupliquer",
      share: "📤 Partager",
      restore: "↺ Rétablir l'originale",
      delete: "🗑️ Supprimer",
      print: "Imprimer / PDF",
      my_rating: "Note perso",
      clear_rating: "Effacer",
      setup_title: "Montage Kamado :",
      burp_title: "🛡️ Réflexe Sécurité : Le « Burp » (Anti-flashback)",
      burp_desc: "À partir de 150 °C, ouvrez d'abord le dôme de 3 à 5 cm pendant 3 secondes pour réintroduire l'air sans embrasement soudain. Ne placez jamais le visage au-dessus.",
      smoke_title: "💨 Règle d'or : La Fumée Propre (« Thin Blue Smoke »)",
      smoke_desc: "N'enfournez jamais dans la fumée blanche et épaisse du démarrage. Attendez 15–20 min une fumée bleu pâle translucide et parfumée pour éviter tout goût âcre.",
      servings: "👥 Portions",
      copy_ings: "📋 Copier",
      qr_code: "📲 QR Code",
      add_list: "🛒 + Liste",
      ingredients_title: "Ingrédients",
      prep_title: "Préparation",
      reading_mode: "📖 Lecture",
      cook_mode: "👨‍🍳 Mode cuisson",
      step_hint: "Cochez les étapes au fur et à mesure · ▶ lance un minuteur · ☀️ écran maintenu allumé",
      doneness_cues: "👁 Signes de bonne cuisson.",
      paired_sauce: "🥣 Sauce associée.",
      chef_tip: "💡 Astuce du chef.",
      my_notes: "📝 Mes notes",
      notes_placeholder: "Vos réglages, vos variantes, le temps réel observé…",
      cook_journal: "📖 Journal de mes cuissons",
      log_session: "➕ Noter une session"
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
    menus: {
      title: "🍱 Build a Kamado Menu",
      simple_generator: "Simple Generator",
      simple_desc: "Create a harmonious menu with a main course, side dish, and dessert cooked on your kamado.",
      style_convivial: "Convivial",
      style_rapide: "Quick",
      style_fumage: "Smoking / low & slow",
      style_vegetarien: "Vegetarian",
      guests_4: "4 guests",
      guests_6: "6 guests",
      guests_8: "8 guests",
      guests_format: "{count} guests",
      generate_btn: "Generate a menu",
      copy_list_btn: "Copy menu grocery list",
      add_shop_btn: "Add menu to grocery list",
      cook_compatibility: "Cooking Compatibility",
      comp_single: "Temperature-compatible menu",
      comp_multi: "Sequence across two temperatures",
      wine_card_title: "🍷 Recommended Wine — pairing for {dish}",
      wine_alt: "Alternative: {alt}",
      wine_service: "Service: {temp}",
      wine_warning: "⚠️ Please enjoy alcohol responsibly.",
      main_dish: "Main Course",
      side_dish: "Side Dish",
      dessert: "Dessert",
      no_recipe: "No recipe available.",
      open_btn: "Open"
    },
    bases: {
      title: "🧂 Essential Bases",
      fav_suffix: "(Favorites)",
      desc: "Sauces, rubs, and marinades kept aside to keep the Recipes tab focused on ceramic cooks.",
      count_format: "{count} bases",
      empty_favs: "No favorite bases yet."
    },
    filters: {
      mode_all: "Method: All",
      mode_direct: "Direct (searing)",
      mode_indirect: "Indirect (roasting)",
      mode_fumage: "Smoking / braising",
      time_all: "Duration: All",
      time_express: "Express (< 30 min)",
      time_medium: "Medium (30–120 min)",
      time_long: "Long (> 2 hrs)",
      diff_all: "Level: All",
      diff_easy: "Easy",
      diff_intermediate: "Intermediate",
      diff_advanced: "Advanced",
      season_all: "Season: All",
      season_spring: "Spring",
      season_summer: "Summer",
      season_autumn: "Autumn",
      season_winter: "Winter / holidays",
      diets_label: "Diets / Free-from",
      gear_label: "Equipment",
      avail_all: "Available time: All",
      avail_45: "Tonight (< 45 min)",
      avail_90: "Tonight (< 1.5 hrs)",
      avail_180: "Half-day (< 3 hrs)",
      quality_all: "Detail level: All",
      quality_source: "With source",
      quality_security: "With safety tips",
      quality_errors: "With pitfalls",
      quality_rich: "In-depth guide",
      sort_default: "Sort: Recommended",
      sort_time: "Duration",
      sort_diff: "Difficulty",
      sort_quality: "Quality",
      sort_rating: "My rating",
      sort_recent: "Recent",
      fav_btn: "Favorites",
      mine_btn: "My recipes",
      create_btn: "➕ Create",
      random_btn: "🎲 Surprise me"
    },
    smartbar: {
      tonight: "Tonight",
      season: "Season",
      pantry: "Pantry",
      outdoor: "Outdoor mode",
      sun: "☀️ High contrast",
      mine: "My recipes",
      reset: "Reset",
      active_profile: "Active profile",
      tip: "Tip: combine ingredients, exclusions, diet, equipment, and available time to find realistic cooks."
    },
    quick_chips: {
      express: "⚡ < 30 min",
      direct: "🔥 High-heat sear",
      indirect: "🛡️ Indirect roast",
      fumage: "💨 Low & Slow",
      favs: "⭐ Favorites",
      pizza: "🍕 Pizza & Breads",
      vege: "🌿 Vegetarian"
    },
    stats: {
      recipes: "kamado recipes",
      express: "express",
      favs: "favorites",
      creations: "my creations",
      rated: "rated",
      bases: "useful bases"
    },
    collections: {
      first_fires_title: "First Fires",
      first_fires_desc: "Accessible cooks ready in under 1.5 hours.",
      signatures_title: "The Signatures",
      signatures_desc: "Six iconic recipes defining ceramic cooking.",
      low_slow_title: "Low & Slow",
      low_slow_desc: "Clean smoke, collagen breakdown and patience.",
      reference_title: "Reference Guides",
      reference_desc: "Complete sources, phases, and control points."
    },
    modal: {
      fav_add: "☆ Add to favorites",
      fav_remove: "★ Favorite",
      guided_cook: "Start guided cook",
      resume_cook: "Resume guided cook",
      edit: "✏️ Edit",
      duplicate: "📋 Duplicate",
      share: "📤 Share",
      restore: "↺ Restore original",
      delete: "🗑️ Delete",
      print: "Print / PDF",
      my_rating: "My rating",
      clear_rating: "Clear",
      setup_title: "Kamado Setup:",
      burp_title: "🛡️ Safety Reflex: The \"Burp\" (Anti-flashback)",
      burp_desc: "From 300 °F / 150 °C, crack the dome 1 to 2 inches for 3 seconds to reintroduce oxygen before opening fully. Never lean your face directly over the lid.",
      smoke_title: "💨 Golden Rule: Clean Smoke (\"Thin Blue Smoke\")",
      smoke_desc: "Never put meat in thick white startup smoke. Wait 15–20 min for translucent, sweet thin blue smoke to prevent harsh, acrid flavors.",
      servings: "👥 Servings",
      copy_ings: "📋 Copy",
      qr_code: "📲 QR Code",
      add_list: "🛒 + Grocery",
      ingredients_title: "Ingredients",
      prep_title: "Method",
      reading_mode: "📖 Reading",
      cook_mode: "👨‍🍳 Cook mode",
      step_hint: "Check off steps as you go · ▶ starts timer · ☀️ screen stays awake",
      doneness_cues: "👁 Doneness cues.",
      paired_sauce: "🥣 Paired sauce.",
      chef_tip: "💡 Chef's tip.",
      my_notes: "📝 My notes",
      notes_placeholder: "Your vent adjustments, wood choices, real observed cook time…",
      cook_journal: "📖 Cook Log",
      log_session: "➕ Log session"
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

  return {
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
});

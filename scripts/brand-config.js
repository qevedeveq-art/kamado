(function initBrandConfig(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoBrandConfig = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function brandConfigFactory() {
  "use strict";

  const BRAND_PRESETS = {
    default: {
      id: "default",
      brandName: "Livre de recettes Kamado",
      brandSubtitle: "L'art de la cuisson en céramique · Guide & Recettes",
      coverImage: "./kamado_cover.jpg",
      primaryAccent: "#e75a1e",
      secondaryAccent: "#f2a93b",
      emberColor: "#ff7b00",
      themeColor: "#161813",
      partnerUrl: "https://www.kokko.fr",
      partnerName: "Kokko Kamado"
    },
    kokko: {
      id: "kokko",
      brandName: "Kokko Cooking Copilot",
      brandSubtitle: "L'art du kamado français · Recettes & Maîtrise des braises",
      coverImage: "./kamado_kokko_cover.jpg",
      primaryAccent: "#e65100",
      secondaryAccent: "#ff9800",
      emberColor: "#ff5722",
      themeColor: "#121210",
      partnerUrl: "https://www.kokko.fr",
      partnerName: "Kokko Kamado France"
    },
    bge: {
      id: "bge",
      brandName: "EGGhead Master Companion",
      brandSubtitle: "Ultimate Cooking Experience on Ceramic",
      coverImage: "./kamado_cover.jpg",
      primaryAccent: "#2e7d32",
      secondaryAccent: "#f9a825",
      emberColor: "#1b5e20",
      themeColor: "#0f140f",
      partnerUrl: "https://www.biggreenegg.com",
      partnerName: "Big Green Egg"
    },
    kamadojoe: {
      id: "kamadojoe",
      brandName: "Joe Fire & Smoke Assistant",
      brandSubtitle: "Ignite Possibility · Divide & Conquer Mastery",
      coverImage: "./kamado_cover.jpg",
      primaryAccent: "#c62828",
      secondaryAccent: "#ff8f00",
      emberColor: "#b71c1c",
      themeColor: "#140e0e",
      partnerUrl: "https://www.kamadojoe.com",
      partnerName: "Kamado Joe"
    }
  };

  function getBrandPreset(id) {
    return BRAND_PRESETS[id] || BRAND_PRESETS.default;
  }

  function applyBrandPreset(id, targetDocument = (typeof document !== "undefined" ? document : null)) {
    const preset = getBrandPreset(id);
    if (!targetDocument) return preset;

    const root = targetDocument.documentElement;
    if (root && root.style) {
      root.style.setProperty("--accent", preset.primaryAccent);
      root.style.setProperty("--accent2", preset.secondaryAccent);
      root.style.setProperty("--ember", preset.emberColor);
      root.style.setProperty("--bg", preset.themeColor);
    }

    const titleEl = targetDocument.querySelector(".brand h1");
    if (titleEl) titleEl.textContent = preset.brandName;
    const subEl = targetDocument.querySelector(".brand small");
    if (subEl) subEl.textContent = preset.brandSubtitle;

    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("kamado_brand_preset", preset.id);
      } catch (_) {}
    }

    return preset;
  }

  return {
    BRAND_PRESETS,
    getBrandPreset,
    applyBrandPreset
  };
});

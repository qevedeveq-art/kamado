"use strict";

function deriveDifficulty(durMin, mode) {
  let d;
  if (durMin < 30) d = 1;
  else if (durMin < 60) d = 2;
  else if (durMin < 180) d = 3;
  else if (durMin < 360) d = 4;
  else d = 5;
  if (/fumage|brais/i.test(mode || "")) d = Math.min(5, d + 1);
  return Math.max(1, Math.min(5, d));
}

function deriveVents(tempC) {
  if (tempC <= 110) return { bottom: "1/8 ouvert", top: "1/8 ouvert" };
  if (tempC <= 140) return { bottom: "1/4 ouvert", top: "1/4 ouvert" };
  if (tempC <= 180) return { bottom: "1/3 ouvert", top: "1/3 ouvert" };
  if (tempC <= 230) return { bottom: "1/2 ouvert", top: "1/2 ouvert" };
  return { bottom: "grand ouvert", top: "grand ouvert" };
}

function deriveCharbon(durMin) {
  if (durMin < 30) return 1;
  if (durMin < 60) return 1.2;
  if (durMin < 120) return 1.5;
  if (durMin < 240) return 2.5;
  if (durMin < 480) return 4;
  return 5;
}

function deriveRepos(cat, mode, durMin) {
  if (cat === "poisson") return 5;
  if (cat === "legumes" || cat === "vegetarien") return 0;
  if (cat === "dessert") return 30;
  if (cat === "pizza") return 0;
  if (/fumage|brais/i.test(mode || "") && durMin > 180) return 30;
  if (cat === "volaille") return 15;
  if (durMin >= 60) return 10;
  return 5;
}

module.exports = { deriveDifficulty, deriveVents, deriveCharbon, deriveRepos };

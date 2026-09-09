#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const ICON_SRC = path.join(ROOT, "icons", "icon-512.png");
const COVER_SRC = path.join(ROOT, "kamado_cover.jpg");

function hasSips() {
  try {
    execFileSync("which", ["sips"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function resize(src, dest, width, height) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("sips", ["-z", String(height), String(width), src, "--out", dest], { stdio: "ignore" });
}

function main() {
  if (!fs.existsSync(ICON_SRC)) {
    console.error("Source icon not found:", ICON_SRC);
    process.exit(1);
  }

  if (!hasSips()) {
    console.log("sips command not found (non-macOS environment). Skipping native asset generation.");
    return;
  }

  const iosAssets = path.join(ROOT, "ios", "App", "App", "Assets.xcassets");
  const androidRes = path.join(ROOT, "android", "app", "src", "main", "res");

  // 1. iOS AppIcon
  if (fs.existsSync(iosAssets)) {
    const appIconDest = path.join(iosAssets, "AppIcon.appiconset", "AppIcon-512@2x.png");
    resize(ICON_SRC, appIconDest, 1024, 1024);
    console.log("✔ Generated iOS AppIcon (1024x1024)");

    // iOS Splash (2732x2732)
    const splashDir = path.join(iosAssets, "Splash.imageset");
    if (fs.existsSync(splashDir)) {
      for (const name of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) {
        resize(ICON_SRC, path.join(splashDir, name), 2732, 2732);
      }
      console.log("✔ Generated iOS Splash images (2732x2732)");
    }
  }

  // 2. Android Mipmap icons
  if (fs.existsSync(androidRes)) {
    const densities = [
      { dir: "mipmap-mdpi", size: 48 },
      { dir: "mipmap-hdpi", size: 72 },
      { dir: "mipmap-xhdpi", size: 96 },
      { dir: "mipmap-xxhdpi", size: 144 },
      { dir: "mipmap-xxxhdpi", size: 192 }
    ];

    for (const { dir, size } of densities) {
      const targetDir = path.join(androidRes, dir);
      if (fs.existsSync(targetDir)) {
        resize(ICON_SRC, path.join(targetDir, "ic_launcher.png"), size, size);
        resize(ICON_SRC, path.join(targetDir, "ic_launcher_round.png"), size, size);
        resize(ICON_SRC, path.join(targetDir, "ic_launcher_foreground.png"), size, size);
      }
    }
    console.log("✔ Generated Android mipmap icons (mdpi to xxxhdpi)");

    // Android drawables splash
    const drawables = [
      { dir: "drawable-port-mdpi", w: 320, h: 480 },
      { dir: "drawable-port-hdpi", w: 480, h: 800 },
      { dir: "drawable-port-xhdpi", w: 720, h: 1280 },
      { dir: "drawable-port-xxhdpi", w: 960, h: 1600 },
      { dir: "drawable-port-xxxhdpi", w: 1280, h: 1920 }
    ];

    for (const { dir, w, h } of drawables) {
      const targetDir = path.join(androidRes, dir);
      if (fs.existsSync(targetDir)) {
        resize(ICON_SRC, path.join(targetDir, "splash.png"), w, h);
      }
    }
    console.log("✔ Generated Android portrait splash drawables");
  }

  console.log("Native assets generation completed successfully.");
}

if (require.main === module) main();

module.exports = { main };

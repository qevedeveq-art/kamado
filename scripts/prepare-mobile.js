#!/usr/bin/env node
/*
 * Prepares the www/ folder for Capacitor (iOS & Android native packaging)
 * without modifying the zero-build nature of index.html.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WWW = path.join(ROOT, "www");

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  if (fs.existsSync(WWW)) {
    fs.rmSync(WWW, { recursive: true, force: true });
  }
  fs.mkdirSync(WWW, { recursive: true });

  // Core files
  const filesToCopy = [
    "index.html",
    "manifest.webmanifest",
    "kamado_kokko_cover.jpg",
    "sw.js"
  ];

  for (const file of filesToCopy) {
    const p = path.join(ROOT, file);
    if (fs.existsSync(p)) {
      fs.copyFileSync(p, path.join(WWW, file));
    }
  }

  // Data folder
  const dataDir = path.join(ROOT, "data");
  if (fs.existsSync(dataDir)) {
    copyDirSync(dataDir, path.join(WWW, "data"));
  }

  console.log("Mobile asset directory www/ prepared successfully for Capacitor.");
}

if (require.main === module) {
  main();
}

module.exports = { main };

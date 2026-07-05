#!/usr/bin/env node
/*
 * Increments the VERSION constant in sw.js so browsers evict old caches.
 *
 * Idempotent within a single git commit: if sw.js is already staged with a
 * VERSION change relative to HEAD, this exits without a second bump.
 *
 * Usage:
 *   node scripts/bump-sw-version.js         # bump only if not already bumped
 *   node scripts/bump-sw-version.js --force # bump unconditionally
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SW_PATH = path.resolve(__dirname, "..", "sw.js");
const VERSION_RE = /const VERSION = "v(\d+)";/;

function readCurrentVersion(text) {
  const m = text.match(VERSION_RE);
  if (!m) throw new Error("Cannot find `const VERSION = \"vN\";` in sw.js");
  return { text, num: parseInt(m[1], 10), match: m[0] };
}

function alreadyBumpedThisCommit() {
  try {
    execSync("git diff --cached --quiet sw.js", { cwd: path.dirname(SW_PATH) });
    // Also check unstaged
    execSync("git diff --quiet sw.js", { cwd: path.dirname(SW_PATH) });
    return false;
  } catch {
    // Any diff means it was already touched.
    try {
      const diff = execSync("git diff HEAD -- sw.js", { cwd: path.dirname(SW_PATH), encoding: "utf8" });
      return /^\+const VERSION = "v\d+";/m.test(diff);
    } catch {
      return false;
    }
  }
}

function main(argv) {
  const force = argv.includes("--force");
  const text = fs.readFileSync(SW_PATH, "utf8");
  const { num, match } = readCurrentVersion(text);

  if (!force && alreadyBumpedThisCommit()) {
    process.stderr.write(`sw.js VERSION already bumped this commit (v${num}), skipping.\n`);
    return;
  }

  const next = num + 1;
  const updated = text.replace(match, `const VERSION = "v${next}";`);
  fs.writeFileSync(SW_PATH, updated);
  process.stderr.write(`sw.js VERSION bumped v${num} → v${next}\n`);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main };

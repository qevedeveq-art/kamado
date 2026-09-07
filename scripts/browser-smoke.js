#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.KAMADO_SMOKE_PORT || "4173";
const BASE_URL = `http://127.0.0.1:${PORT}/`;

async function waitForServer(attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch (error) {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Local preview did not start at ${BASE_URL}`);
}

async function main() {
  const server = spawn("python3", ["-m", "http.server", PORT, "--bind", "127.0.0.1"], {
    cwd: ROOT,
    stdio: "ignore"
  });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ serviceWorkers: "allow" });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", error => consoleErrors.push(error.message));

    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.locator('[data-collection="signatures"]').click();
    assert.match(await page.locator("#count").textContent(), /^6 recettes · parcours Les signatures$/);
    assert.equal(await page.locator("#grid .rc").count(), 6);
    await page.locator('[data-collection="signatures"]').click();
    await page.locator("#q").fill("mode:fumage -porc");
    assert.equal(await page.evaluate(() => currentFilteredList.length > 0), true);
    assert.equal(await page.evaluate(() => currentFilteredList.every(recipe => !/porc/i.test(JSON.stringify(recipe)))), true);

    await page.goto(`${BASE_URL}recettes/cote-de-boeuf-reverse-sear/`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("h1").textContent(), "Côte de bœuf reverse-sear");
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute("href"),
      "https://qevedeveq-art.github.io/kamado/recettes/cote-de-boeuf-reverse-sear/"
    );
    assert.equal(await page.locator('a[href="../../#recette=cote-de-boeuf-reverse-sear"]').count(), 1);

    await page.goto(`${BASE_URL}#recette=cote-de-boeuf-reverse-sear`, { waitUntil: "networkidle" });
    await page.locator("#modal.open").waitFor();
    assert.equal(await page.locator("#d-title").textContent(), "Côte de bœuf reverse-sear");
    assert.equal(await page.locator("#modal").getAttribute("aria-hidden"), "false");
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), "back");

    await page.evaluate(() => { location.hash = "#recette=introuvable"; });
    await page.locator("#modal:not(.open)").waitFor();
    await page.evaluate(() => {
      location.hash = `#recipe-${encodeURIComponent("Côte de bœuf reverse-sear")}`;
    });
    await page.locator("#modal.open").waitFor();
    assert.equal(new URL(page.url()).hash, "#recette=cote-de-boeuf-reverse-sear");

    if (process.env.KAMADO_CAPTURE_SCREENSHOTS === "1") {
      const outputDir = path.join(ROOT, "assets", "screenshots");
      fs.mkdirSync(outputDir, { recursive: true });
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.screenshot({ path: path.join(outputDir, "recipe-wide.png") });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(outputDir, "recipe-mobile.png") });
      await page.setViewportSize({ width: 1280, height: 720 });
    }

    await page.locator("#sQR").click();
    await page.locator("#qrModal.open svg").waitFor();
    await page.locator("#qrCloseBtn").click();

    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#modal.open").waitFor();
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#modal.open").waitFor();
    assert.equal(await page.locator("#d-title").textContent(), "Côte de bœuf reverse-sear");
    await context.setOffline(false);

    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#modal").getAttribute("aria-hidden"), "true");
    assert.equal(new URL(page.url()).hash, "");

    await page.locator('[data-tab="donnees"]').click();
    await page.locator("#dataCode").click();
    assert.match(await page.locator("#transferCode").inputValue(), /^[A-Za-z0-9+/=_-]+$/);
    assert.deepEqual(consoleErrors, []);

    process.stdout.write("Browser smoke passed: editorial search, static recipe, deep link, QR, focus, offline reload and backup code.\n");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

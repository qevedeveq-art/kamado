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

    await page.locator("#btnOpenCockpit").click();
    await page.locator("#cockpitOverlay:not(.hide)").waitFor();
    assert.equal(await page.locator("#cockpitOverlay").getAttribute("aria-hidden"), "false");
    assert.equal(await page.locator("#cpStepTitle").textContent(), "Chauffe indirecte");
    await page.locator("#cpObservedDome").fill("90");
    await page.locator("#cpObservedCore").fill("41");
    await page.locator("#cpRecordTemps").click();
    assert.match(await page.locator("#cpGuidance").textContent(), /Température basse.+légèrement/s);
    await page.locator("#cpTimerToggle").click();
    assert.equal(await page.locator("#cpTimerToggle").textContent(), "Pause");
    await page.locator("#cpClose").click();
    assert.equal(await page.locator("#cockpitOverlay").getAttribute("aria-hidden"), "true");

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#modal.open").waitFor();
    assert.equal(await page.locator("#btnOpenCockpit").textContent(), "Reprendre la cuisson");
    assert.equal(await page.locator("#activeCookBanner:not(.hide)").count(), 1);
    await page.locator("#btnOpenCockpit").click();
    await page.locator("#cockpitOverlay:not(.hide)").waitFor();
    assert.equal(await page.locator("#cpTimerToggle").textContent(), "Pause");
    assert.equal(await page.evaluate(() => buildExportPayload().activeCookSession.recipeId), "cote-de-boeuf-reverse-sear");
    await page.locator("#cpNextStep").focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), "cpDiscard");
    await page.locator("#cpTimerToggle").click();
    await page.locator("#cpNextStep").click();
    assert.equal(await page.locator("#cpStepTitle").textContent(), "Saisie directe");
    await page.locator("#cpObservedDome").fill("320");
    await page.locator("#cpObservedCore").fill("53");
    await page.locator("#cpRecordTemps").click();
    assert.match(await page.locator("#cpGuidance").textContent(), /Zone cible atteinte/);
    await page.locator("#cpNextStep").click();
    await page.waitForFunction(() => document.querySelector("#cockpitOverlay").classList.contains("hide"));
    const cookState = await page.evaluate(() => ({
      session: JSON.parse(localStorage.getItem("kamado_active_cook_v2")),
      logs: JSON.parse(localStorage.getItem("kamado_cook_logs"))
    }));
    assert.equal(cookState.session.data, null);
    assert.equal(Object.values(cookState.logs.data).flat().some(log => /Cook Engine 2\.0/.test(log.notes || log.obs || "")), true);

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
    assert.equal(await page.locator("#profilePersonalization").isChecked(), false);
    await page.locator("#profileExperience").selectOption("expert");
    await page.locator("#profileMode").selectOption("fumage");
    await page.locator("#profilePersonalization").check();
    await page.locator("#profileSave").click();
    assert.match(await page.locator("#profileStatus").textContent(), /Profil enregistré/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("kamado_pantry_profile")).data.cookingProfile.preferredMode), "fumage");
    await page.locator('[data-tab="recettes"]').click();
    assert.ok(await page.locator("#grid .badge.personal").count() > 0);
    await page.locator('[data-tab="donnees"]').click();

    const passphrase = "braises paisibles du dimanche";
    await page.locator("#vaultPassphrase").fill(passphrase);
    await page.locator("#vaultConfirm").fill(passphrase);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#vaultExport").click();
    const vaultDownload = await downloadPromise;
    assert.match(vaultDownload.suggestedFilename(), /^kamado-coffre-\d{4}-\d{2}-\d{2}\.kamado$/);
    const vaultPath = await vaultDownload.path();
    const vaultText = fs.readFileSync(vaultPath, "utf8");
    const vault = JSON.parse(vaultText);
    assert.equal(vault.app, "kamado-vault");
    assert.equal(vault.kdf.iterations, 600000);
    assert.doesNotMatch(vaultText, /Côte de bœuf reverse-sear/);
    await page.locator("#vaultPassphrase").fill(passphrase);
    await page.locator("#vaultImport").setInputFiles(vaultPath);
    await page.locator("#vaultStatus").filter({ hasText: "Coffre importé" }).waitFor();
    assert.deepEqual(consoleErrors, []);

    process.stdout.write("Browser smoke passed: editorial search, persistent Cook Engine, encrypted local vault, personalization, QR, focus and offline reload.\n");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

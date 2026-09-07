"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  VAULT_VERSION,
  KDF_ITERATIONS,
  isVaultEnvelope,
  encryptVault,
  decryptVault
} = require("../scripts/local-vault.js");

const PASSPHRASE = "braises calmes sous la lune";
const PAYLOAD = {
  app: "kamado",
  version: 4,
  favs: ["Côte de bœuf reverse-sear"],
  notes: { "Saumon": "Très bon avec du cèdre — à refaire." }
};

test("encrypted vault round-trips a Unicode backup", async () => {
  const vault = await encryptVault(PAYLOAD, PASSPHRASE);
  assert.equal(vault.app, "kamado-vault");
  assert.equal(vault.version, VAULT_VERSION);
  assert.equal(vault.kdf.iterations, KDF_ITERATIONS);
  assert.equal(vault.kdf.hash, "SHA-256");
  assert.equal(vault.cipher.name, "AES-GCM");
  assert.equal(isVaultEnvelope(vault), true);
  assert.deepEqual(await decryptVault(vault, PASSPHRASE), PAYLOAD);
});

test("each vault uses a fresh salt and IV", async () => {
  const first = await encryptVault(PAYLOAD, PASSPHRASE);
  const second = await encryptVault(PAYLOAD, PASSPHRASE);
  assert.notEqual(first.kdf.salt, second.kdf.salt);
  assert.notEqual(first.cipher.iv, second.cipher.iv);
  assert.notEqual(first.ciphertext, second.ciphertext);
});

test("vault never exposes backup plaintext", async () => {
  const serialized = JSON.stringify(await encryptVault(PAYLOAD, PASSPHRASE));
  assert.doesNotMatch(serialized, /Côte de bœuf|Très bon avec du cèdre/);
  assert.doesNotMatch(serialized, new RegExp(PASSPHRASE));
});

test("wrong passphrase and tampered metadata are rejected", async () => {
  const vault = await encryptVault(PAYLOAD, PASSPHRASE);
  await assert.rejects(() => decryptVault(vault, "une autre phrase vraiment longue"), /impossible/i);
  const tampered = structuredClone(vault);
  tampered.createdAt = "2020-01-01T00:00:00.000Z";
  await assert.rejects(() => decryptVault(tampered, PASSPHRASE), /impossible/i);
});

test("weak passphrases and malformed vaults fail closed", async () => {
  await assert.rejects(() => encryptVault(PAYLOAD, "trop court"), /12 caractères/);
  await assert.rejects(() => encryptVault(PAYLOAD, "x".repeat(257)), /256 caractères/);
  assert.equal(isVaultEnvelope({ app: "kamado-vault", version: 99 }), false);
  await assert.rejects(() => decryptVault({ app: "kamado-vault", version: 1 }, PASSPHRASE), /invalide/i);
});

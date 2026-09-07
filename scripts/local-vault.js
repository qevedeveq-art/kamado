(function initLocalVault(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoLocalVault = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function localVaultFactory(root) {
  "use strict";

  const VAULT_APP = "kamado-vault";
  const VAULT_VERSION = 1;
  const KDF_ITERATIONS = 600_000;
  const MIN_PASSPHRASE_LENGTH = 12;
  const MAX_PASSPHRASE_LENGTH = 256;
  const MAX_CIPHERTEXT_LENGTH = 15_000_000;
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  function cryptoApi(override) {
    const api = override || (root && root.crypto);
    if (!api || !api.subtle || typeof api.getRandomValues !== "function") {
      throw new Error("Le chiffrement sécurisé Web Crypto n’est pas disponible sur cet appareil.");
    }
    return api;
  }

  function bytesToBase64Url(value) {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Coffre chiffré invalide.");
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
    let binary;
    try { binary = atob(base64); } catch (error) { throw new Error("Coffre chiffré invalide."); }
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }

  function assertPassphrase(passphrase) {
    const length = typeof passphrase === "string" ? Array.from(passphrase).length : 0;
    if (length < MIN_PASSPHRASE_LENGTH) {
      throw new Error(`La phrase secrète doit contenir au moins ${MIN_PASSPHRASE_LENGTH} caractères.`);
    }
    if (length > MAX_PASSPHRASE_LENGTH) throw new Error(`La phrase secrète ne doit pas dépasser ${MAX_PASSPHRASE_LENGTH} caractères.`);
  }

  function isVaultEnvelope(value) {
    return !!value && typeof value === "object" && !Array.isArray(value) &&
      value.app === VAULT_APP && value.version === VAULT_VERSION &&
      typeof value.createdAt === "string" && Number.isFinite(Date.parse(value.createdAt)) &&
      value.kdf && value.kdf.name === "PBKDF2" && value.kdf.hash === "SHA-256" &&
      value.kdf.iterations === KDF_ITERATIONS && typeof value.kdf.salt === "string" &&
      value.cipher && value.cipher.name === "AES-GCM" && value.cipher.tagLength === 128 &&
      typeof value.cipher.iv === "string" && typeof value.ciphertext === "string" &&
      value.ciphertext.length > 0 && value.ciphertext.length <= MAX_CIPHERTEXT_LENGTH;
  }

  function authenticatedHeader(vault) {
    return textEncoder.encode([
      vault.app,
      vault.version,
      vault.createdAt,
      vault.kdf.name,
      vault.kdf.hash,
      vault.kdf.iterations,
      vault.kdf.salt,
      vault.cipher.name,
      vault.cipher.tagLength,
      vault.cipher.iv
    ].join(":"));
  }

  async function deriveVaultKey(passphrase, salt, api) {
    const material = await api.subtle.importKey(
      "raw",
      textEncoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return api.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: KDF_ITERATIONS },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptVault(payload, passphrase, cryptoOverride) {
    assertPassphrase(passphrase);
    const api = cryptoApi(cryptoOverride);
    const serialized = JSON.stringify(payload);
    if (serialized === undefined) throw new Error("Les données à chiffrer sont invalides.");
    const salt = api.getRandomValues(new Uint8Array(16));
    const iv = api.getRandomValues(new Uint8Array(12));
    const vault = {
      app: VAULT_APP,
      version: VAULT_VERSION,
      createdAt: new Date().toISOString(),
      kdf: { name: "PBKDF2", hash: "SHA-256", iterations: KDF_ITERATIONS, salt: bytesToBase64Url(salt) },
      cipher: { name: "AES-GCM", tagLength: 128, iv: bytesToBase64Url(iv) },
      ciphertext: ""
    };
    const key = await deriveVaultKey(passphrase, salt, api);
    const ciphertext = await api.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128, additionalData: authenticatedHeader(vault) },
      key,
      textEncoder.encode(serialized)
    );
    vault.ciphertext = bytesToBase64Url(ciphertext);
    return vault;
  }

  async function decryptVault(input, passphrase, cryptoOverride) {
    assertPassphrase(passphrase);
    let vault = input;
    if (typeof input === "string") {
      try { vault = JSON.parse(input); } catch (error) { throw new Error("Coffre chiffré invalide."); }
    }
    if (!isVaultEnvelope(vault)) throw new Error("Coffre chiffré invalide.");
    const api = cryptoApi(cryptoOverride);
    try {
      const salt = base64UrlToBytes(vault.kdf.salt);
      const iv = base64UrlToBytes(vault.cipher.iv);
      if (salt.length !== 16 || iv.length !== 12) throw new Error("invalid parameters");
      const key = await deriveVaultKey(passphrase, salt, api);
      const plaintext = await api.subtle.decrypt(
        { name: "AES-GCM", iv, tagLength: 128, additionalData: authenticatedHeader(vault) },
        key,
        base64UrlToBytes(vault.ciphertext)
      );
      return JSON.parse(textDecoder.decode(plaintext));
    } catch (error) {
      throw new Error("Déchiffrement impossible : phrase secrète incorrecte ou coffre altéré.");
    }
  }

  return {
    VAULT_VERSION,
    KDF_ITERATIONS,
    MIN_PASSPHRASE_LENGTH,
    MAX_PASSPHRASE_LENGTH,
    isVaultEnvelope,
    encryptVault,
    decryptVault
  };
});

/**
 * AES-256-CBC encryption/decryption with HMAC authentication
 * and sensitive data detection utilities
 */
const crypto = require("crypto");

// ═══════════════════════════════════════════════
//  Sensitive Data Detection
// ═══════════════════════════════════════════════

const SENSITIVE_KEY_PATTERNS = [
  "API_KEY", "SECRET", "TOKEN", "PASSWORD", "PRIVATE",
  "CREDENTIAL", "AUTH", "STRIPE", "AWS", "JWT",
  "ACCESS_KEY", "PASS", "CERT", "SIGNING", "ENCRYPTION",
  "DATABASE_URL", "DB_PASSWORD", "MONGO", "REDIS",
  "SENDGRID", "TWILIO", "GITHUB", "SLACK",
];

const VALUE_PATTERNS = [
  // JWT
  /^eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  // AWS Access Key
  /^(AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA)[A-Z0-9]{16}$/,
  // Private keys
  /-----BEGIN\s+[A-Z ]+KEY-----/,
  // Stripe keys
  /^(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{20,}$/,
  // GitHub tokens
  /^(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}$/,
  // High entropy Base64-like strings (32+ chars)
  /^[A-Za-z0-9+/_=-]{32,}$/,
];

function isSensitiveKey(key) {
  const upper = key.toUpperCase();
  return SENSITIVE_KEY_PATTERNS.some((p) => upper.includes(p));
}

function isSensitiveValue(value) {
  return VALUE_PATTERNS.some((regex) => regex.test(value));
}

function isSensitive(key, value) {
  return isSensitiveKey(key) || isSensitiveValue(value);
}

function maskValue(value) {
  if (!value) return "******";
  if (value.length <= 4) return "*".repeat(value.length);
  if (value.length <= 8) return value.slice(0, 2) + "****" + value.slice(-2);
  return value.slice(0, 4) + "*".repeat(Math.min(8, value.length - 8)) + value.slice(-4);
}

// ═══════════════════════════════════════════════
//  AES-256-CBC Encryption with HMAC
// ═══════════════════════════════════════════════

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const HMAC_ALGORITHM = "sha256";

/**
 * Derive a key from a password using PBKDF2
 * @param {string} password
 * @param {Buffer} salt
 * @returns {Buffer} 32-byte key
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha512");
}

/**
 * Encrypt plaintext using AES-256-CBC with HMAC authentication
 * @param {string} plaintext
 * @param {string} password - Password or hex key
 * @returns {string} JSON string with salt, iv, hmac, and ciphertext
 */
function encryptValue(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Compute HMAC over iv + ciphertext for authentication
  const hmac = crypto.createHmac(HMAC_ALGORITHM, key);
  hmac.update(iv.toString("base64"));
  hmac.update(encrypted);
  const authTag = hmac.digest("base64");

  return JSON.stringify({
    algorithm: ALGORITHM,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    hmac: authTag,
    ciphertext: encrypted,
  });
}

/**
 * Decrypt ciphertext using AES-256-CBC with HMAC verification
 * @param {string} encryptedJson - JSON string from encryptValue
 * @param {string} password
 * @returns {string} Decrypted plaintext
 */
function decryptValue(encryptedJson, password) {
  try {
    const data = JSON.parse(encryptedJson);

    // Support both old GCM format and new CBC format
    if (data.authTag && !data.hmac) {
      return decryptLegacy(data, password);
    }

    const salt = Buffer.from(data.salt, "base64");
    const iv = Buffer.from(data.iv, "base64");
    const key = deriveKey(password, salt);

    // Verify HMAC before decryption
    const hmac = crypto.createHmac(HMAC_ALGORITHM, key);
    hmac.update(data.iv);
    hmac.update(data.ciphertext);
    const computedTag = hmac.digest("base64");

    if (!crypto.timingSafeEqual(Buffer.from(computedTag), Buffer.from(data.hmac))) {
      throw new Error("HMAC verification failed. Data may have been tampered with.");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(data.ciphertext, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    if (err.message.includes("HMAC")) throw err;
    throw new Error("Decryption failed. Incorrect password or corrupted data.");
  }
}

/**
 * Decrypt legacy GCM-encrypted data (backward compat)
 */
function decryptLegacy(data, password) {
  try {
    const salt = Buffer.from(data.salt, "base64");
    const iv = Buffer.from(data.iv, "base64");
    const authTag = Buffer.from(data.authTag, "base64");
    const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(data.encrypted || data.ciphertext, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    throw new Error("Decryption failed. Incorrect password or corrupted data.");
  }
}

/**
 * Generate a random encryption key (hex string)
 * @returns {string} 64-character hex string (256 bits)
 */
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  isSensitiveKey,
  isSensitiveValue,
  isSensitive,
  maskValue,
  encryptValue,
  decryptValue,
  generateEncryptionKey,
  deriveKey,
  ALGORITHM,
  SENSITIVE_KEY_PATTERNS,
  VALUE_PATTERNS,
};

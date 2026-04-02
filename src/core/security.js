const crypto = require("crypto");

const SENSITIVE_KEY_PATTERNS = [
  "API_KEY", "SECRET", "TOKEN", "PASSWORD", "PRIVATE", 
  "CREDENTIAL", "AUTH", "STRIPE", "AWS", "JWT", 
  "ACCESS_KEY", "PASS", "CERT"
];

const VALUE_PATTERNS = [
  // JWT
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  // AWS
  /^(AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA)[A-Z0-9]{16}$/,
  // Private keys
  /-----BEGIN [A-Z ]+KEY-----/,
  // High entropy / Base64-like long strings (basic heuristic)
  /^[A-Za-z0-9+/_=-]{32,}$/
];

function isSensitiveKey(key) {
  const upper = key.toUpperCase();
  return SENSITIVE_KEY_PATTERNS.some(p => upper.includes(p));
}

function isSensitiveValue(value) {
  return VALUE_PATTERNS.some(regex => regex.test(value));
}

function isSensitive(key, value) {
  return isSensitiveKey(key) || isSensitiveValue(value);
}

function maskValue(value) {
  if (!value) return "******";
  if (value.length <= 4) return "*".repeat(value.length);
  if (value.length <= 8) return value.slice(0, 2) + "****" + value.slice(-2);
  
  // Partial reveal for longer secrets
  return value.slice(0, 4) + "*".repeat(8) + value.slice(-4);
}

// AES-256-GCM encryption
const ALGORITHM = "aes-256-gcm";

function encryptValue(text, password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  
  return JSON.stringify({
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    authTag,
    encrypted
  });
}

function decryptValue(encryptedDataJson, password) {
  try {
    const data = JSON.parse(encryptedDataJson);
    const salt = Buffer.from(data.salt, "base64");
    const iv = Buffer.from(data.iv, "base64");
    const authTag = Buffer.from(data.authTag, "base64");
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(data.encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    throw new Error("Decryption failed. Incorrect password or corrupted data.");
  }
}

module.exports = {
  isSensitiveKey,
  isSensitiveValue,
  isSensitive,
  maskValue,
  encryptValue,
  decryptValue
};

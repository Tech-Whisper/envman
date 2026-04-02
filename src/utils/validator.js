/**
 * Input validation utilities for envman CLI
 */

const VALID_KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const RESERVED_KEYS = [
  "PATH", "HOME", "USER", "SHELL", "TERM", "LANG",
  "PWD", "OLDPWD", "HOSTNAME", "LOGNAME", "MAIL",
];

/**
 * Validate an environment variable key
 * @param {string} key - The key to validate
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateKey(key) {
  if (!key || typeof key !== "string") {
    return { valid: false, reason: "Key cannot be empty." };
  }

  const trimmed = key.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: "Key cannot be empty or whitespace." };
  }

  if (trimmed.length > 256) {
    return { valid: false, reason: "Key exceeds maximum length of 256 characters." };
  }

  if (!VALID_KEY_REGEX.test(trimmed)) {
    return {
      valid: false,
      reason: "Key must start with a letter or underscore and contain only alphanumeric characters and underscores.",
    };
  }

  return { valid: true };
}

/**
 * Check if a key is a reserved system variable
 * @param {string} key
 * @returns {boolean}
 */
function isReservedKey(key) {
  return RESERVED_KEYS.includes(key.toUpperCase());
}

/**
 * Validate a key=value input string
 * @param {string} input
 * @returns {{ valid: boolean, key?: string, value?: string, reason?: string }}
 */
function validateKeyValueInput(input) {
  if (!input || typeof input !== "string" || !input.trim()) {
    return { valid: false, reason: "Input cannot be empty. Use format: KEY=value" };
  }

  const eqIndex = input.indexOf("=");
  if (eqIndex === -1) {
    return { valid: false, reason: "Invalid format. Use: KEY=value" };
  }

  const key = input.slice(0, eqIndex).trim();
  const value = input.slice(eqIndex + 1);

  const keyValidation = validateKey(key);
  if (!keyValidation.valid) {
    return { valid: false, reason: keyValidation.reason };
  }

  return { valid: true, key, value };
}

/**
 * Validate a file path is safe
 * @param {string} filePath
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return { valid: false, reason: "File path cannot be empty." };
  }

  // Prevent path traversal
  if (filePath.includes("..")) {
    return { valid: false, reason: "Path traversal detected. Refusing to proceed." };
  }

  return { valid: true };
}

/**
 * Validate password strength for encryption
 * @param {string} password
 * @returns {{ valid: boolean, strength: string, reason?: string }}
 */
function validatePassword(password) {
  if (!password || password.length === 0) {
    return { valid: false, strength: "none", reason: "Password cannot be empty." };
  }

  if (password.length < 8) {
    return { valid: false, strength: "weak", reason: "Password must be at least 8 characters." };
  }

  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { valid: true, strength: "weak", reason: "Consider using a mix of uppercase, lowercase, numbers, and symbols." };
  }
  if (score <= 2) {
    return { valid: true, strength: "moderate" };
  }
  return { valid: true, strength: "strong" };
}

module.exports = {
  validateKey,
  validateKeyValueInput,
  validateFilePath,
  validatePassword,
  isReservedKey,
  VALID_KEY_REGEX,
  RESERVED_KEYS,
};

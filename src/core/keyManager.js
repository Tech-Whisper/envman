/**
 * AES-256 encryption key management
 * Handles key generation, storage, and retrieval via .envmanrc
 */
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const KEY_LENGTH = 32; // 256 bits
const ENVMANRC = ".envmanrc";

/**
 * Generate a new random AES-256 key
 * @returns {string} Hex-encoded key
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

/**
 * Get the global config directory path
 * @returns {string}
 */
function getGlobalConfigDir() {
  return path.join(os.homedir(), ".envman");
}

/**
 * Get the project-local config path
 * @param {string} [projectDir]
 * @returns {string}
 */
function getProjectConfigPath(projectDir) {
  return path.join(projectDir || process.cwd(), ENVMANRC);
}

/**
 * Get the global config path (for shared key)
 * @returns {string}
 */
function getGlobalConfigPath() {
  return path.join(getGlobalConfigDir(), "config.json");
}

/**
 * Save encryption key to project .envmanrc
 * @param {string} key - Hex-encoded key
 * @param {string} [projectDir]
 */
async function saveProjectKey(key, projectDir) {
  const configPath = getProjectConfigPath(projectDir);
  const config = { encryptionKey: key, createdAt: new Date().toISOString() };
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Save encryption key to global config
 * @param {string} key - Hex-encoded key
 */
async function saveGlobalKey(key) {
  const configDir = getGlobalConfigDir();
  await fs.ensureDir(configDir);
  const configPath = getGlobalConfigPath();

  let config = {};
  if (await fs.pathExists(configPath)) {
    try {
      config = await fs.readJson(configPath);
    } catch {
      config = {};
    }
  }

  config.encryptionKey = key;
  config.updatedAt = new Date().toISOString();
  await fs.writeJson(configPath, config, { spaces: 2, mode: 0o600 });
}

/**
 * Load encryption key from project .envmanrc, falling back to global
 * @param {string} [projectDir]
 * @returns {Promise<string|null>}
 */
async function loadKey(projectDir) {
  // Try project-local first
  const projectConfig = getProjectConfigPath(projectDir);
  if (await fs.pathExists(projectConfig)) {
    try {
      const config = await fs.readJson(projectConfig);
      if (config.encryptionKey) return config.encryptionKey;
    } catch {
      // Fall through
    }
  }

  // Try global config
  const globalConfig = getGlobalConfigPath();
  if (await fs.pathExists(globalConfig)) {
    try {
      const config = await fs.readJson(globalConfig);
      if (config.encryptionKey) return config.encryptionKey;
    } catch {
      // Fall through
    }
  }

  return null;
}

/**
 * Check if a key exists for this project
 * @param {string} [projectDir]
 * @returns {Promise<boolean>}
 */
async function hasKey(projectDir) {
  const key = await loadKey(projectDir);
  return key !== null;
}

/**
 * Validate that a hex key is the correct length
 * @param {string} key
 * @returns {boolean}
 */
function isValidKey(key) {
  if (!key || typeof key !== "string") return false;
  return /^[0-9a-f]{64}$/i.test(key);
}

module.exports = {
  generateKey,
  saveProjectKey,
  saveGlobalKey,
  loadKey,
  hasKey,
  isValidKey,
  getProjectConfigPath,
  getGlobalConfigPath,
  getGlobalConfigDir,
  KEY_LENGTH,
};

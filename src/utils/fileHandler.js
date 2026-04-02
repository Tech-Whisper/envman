/**
 * Cross-platform file handling utilities
 */
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

/**
 * Safely read a file, returning null if it does not exist
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
async function safeReadFile(filePath) {
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) return null;
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Safely write content to a file, creating parent dirs if needed
 * @param {string} filePath
 * @param {string} content
 */
async function safeWriteFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Safely write JSON to a file
 * @param {string} filePath
 * @param {Object} data
 */
async function safeWriteJson(filePath, data) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * Safely read JSON from a file
 * @param {string} filePath
 * @returns {Promise<Object|null>}
 */
async function safeReadJson(filePath) {
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) return null;
    return await fs.readJson(filePath);
  } catch {
    return null;
  }
}

/**
 * Get the envman config directory (cross-platform)
 * @returns {string}
 */
function getConfigDir() {
  const home = os.homedir();
  return path.join(home, ".envman");
}

/**
 * Get the project-local envman config path
 * @param {string} [projectDir]
 * @returns {string}
 */
function getProjectConfigPath(projectDir) {
  return path.join(projectDir || process.cwd(), ".envmanrc");
}

/**
 * Resolve the env file path from options
 * @param {Object} command - Commander command object
 * @returns {string}
 */
function resolveEnvPath(command) {
  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  return path.join(process.cwd(), envFilename);
}

/**
 * Resolve the env filename from options
 * @param {Object} command
 * @returns {string}
 */
function resolveEnvFilename(command) {
  return command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
}

/**
 * Check if safe mode is enabled
 * @param {Object} command
 * @returns {boolean}
 */
function isSafeMode(command) {
  return command && command.optsWithGlobals ? !!command.optsWithGlobals().safe : false;
}

/**
 * List backup files for a given env file
 * @param {string} envPath
 * @returns {Promise<string[]>}
 */
async function listBackups(envPath) {
  const dir = path.dirname(envPath);
  const basename = path.basename(envPath);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.startsWith(`${basename}.backup.`))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

module.exports = {
  safeReadFile,
  safeWriteFile,
  safeWriteJson,
  safeReadJson,
  getConfigDir,
  getProjectConfigPath,
  resolveEnvPath,
  resolveEnvFilename,
  isSafeMode,
  listBackups,
};

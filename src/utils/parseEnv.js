/**
 * Normalize line endings and ensure exactly one trailing newline
 * @param {string} content
 * @returns {string}
 */
function normalizeContent(content) {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Strip inline comments from a value, preserving quoted content
 * @param {string} value
 * @returns {string}
 */
function stripInlineComment(value) {
  const trimmed = value.trim();

  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    return value;
  }

  const commentIndex = value.indexOf(" #");
  if (commentIndex !== -1) {
    return value.slice(0, commentIndex);
  }

  return value;
}

/**
 * Parse .env content into array of {key, value} objects
 * Normalizes line endings, trims keys, preserves values
 * @param {string} content
 * @returns {Array<{key: string, value: string}>}
 */
function parseEnv(content) {
  const normalized = normalizeContent(content);
  const lines = normalized.split("\n");
  const result = [];

  for (const line of lines) {
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    const rawValue = line.slice(eqIndex + 1);
    const value = stripInlineComment(rawValue);

    result.push({ key, value });
  }

  return result;
}

/**
 * Parse .env content into key-value map
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseEnvMap(content) {
  const entries = parseEnv(content);
  const result = {};
  for (const entry of entries) {
    result[entry.key] = entry.value;
  }
  return result;
}

/**
 * Extract just the keys from .env content
 * @param {string} content
 * @returns {string[]}
 */
function parseEnvKeys(content) {
  return parseEnv(content).map(e => e.key);
}

/**
 * Ensure content ends with exactly one trailing newline
 * @param {string} content
 * @returns {string}
 */
function normalizeTrailingNewline(content) {
  return content.replace(/\n*$/, "") + "\n";
}

/**
 * Build a KEY=VALUE line string
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function buildLine(key, value) {
  return `${key}=${value}`;
}

/**
 * Find the index of a key in the lines array
 * @param {string[]} lines
 * @param {string} key
 * @returns {number}
 */
function findLineIndex(lines, key) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex !== -1 && line.slice(0, eqIndex).trim() === key) {
      return i;
    }
  }
  return -1;
}

/**
 * Read and normalize .env file content
 * @param {typeof import('fs-extra')} fs
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function readEnvFile(fs, filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  return normalizeContent(content);
}

/**
 * Write .env file with normalized trailing newline
 * @param {typeof import('fs-extra')} fs
 * @param {string} filePath
 * @param {string} content
 * @returns {Promise<void>}
 */
async function writeEnvFile(fs, filePath, content) {
  await fs.writeFile(filePath, normalizeTrailingNewline(content), "utf-8");
}

module.exports = {
  normalizeContent,
  parseEnv,
  parseEnvMap,
  parseEnvKeys,
  stripInlineComment,
  normalizeTrailingNewline,
  buildLine,
  findLineIndex,
  readEnvFile,
  writeEnvFile,
};

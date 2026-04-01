const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

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
 * Parse .env file content into key-value pairs
 * @param {string} content
 * @returns {Array<{key: string, value: string}>}
 */
function parseEnv(content) {
  const lines = content.split("\n");
  const result = [];

  for (const line of lines) {
    if (!line || line.trim() === "" || line.trim().startsWith("#")) {
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
 * Format and print env variables as a table
 * @param {Array<{key: string, value: string}>} vars
 */
function printTable(vars) {
  const keyWidth = Math.max(...vars.map(v => v.key.length), 3);
  const valueWidth = Math.max(...vars.map(v => v.value.length), 5);

  const header =
    chalk.green(
      `${"KEY".padEnd(keyWidth)} | ${"VALUE".padEnd(valueWidth)}`
    );

  console.log(header);

  for (const v of vars) {
    const row =
      `${v.key.padEnd(keyWidth)} | ${v.value.padEnd(valueWidth)}`;
    console.log(chalk.white(row));
  }

  console.log(
    chalk.yellow(`\n${vars.length} variables found`)
  );
}

/**
 * Execute list command
 */
async function listCommand() {
  const envPath = path.join(process.cwd(), ".env");

  const exists = await fs.pathExists(envPath);

  if (!exists) {
    console.error(
      chalk.red("No .env found")
    );
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");

  const vars = parseEnv(content);

  printTable(vars);
}

module.exports = {
  listCommand,
  parseEnv
};

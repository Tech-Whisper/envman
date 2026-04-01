const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Parse .env file content into key-value pairs
 * @param {string} content
 * @returns {Array<{key: string, value: string}>}
 */
function parseEnv(content) {
  const lines = content.split("\n");
  const result = [];

  const regex = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;

  for (const line of lines) {
    if (!line || line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }

    const match = line.match(regex);
    if (match) {
      const key = match[1];
      const value = match[2] || "";
      result.push({ key, value });
    }
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

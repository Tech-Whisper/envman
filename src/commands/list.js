const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnv } = require("../utils/parseEnv");

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

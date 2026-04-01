const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { normalizeContent, normalizeTrailingNewline } = require("../utils/parseEnv");

/**
 * Validate that the key is a non-empty string
 * @param {string} key
 * @returns {boolean}
 */
function isValidKey(key) {
  return typeof key === "string" && key.trim().length > 0;
}

/**
 * Execute remove command
 * @param {string} key - The env key to remove
 */
async function removeCommand(key) {
  if (!isValidKey(key)) {
    console.error(
      chalk.red("Key cannot be empty")
    );
    return;
  }

  key = key.trim();

  const envPath = path.join(process.cwd(), ".env");

  const exists = await fs.pathExists(envPath);

  if (!exists) {
    console.error(
      chalk.red("No .env found")
    );
    return;
  }

  const content = normalizeContent(await fs.readFile(envPath, "utf-8"));
  const lines = content.split("\n");

  let removeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex !== -1 && line.slice(0, eqIndex).trim() === key) {
      removeIndex = i;
      break;
    }
  }

  if (removeIndex === -1) {
    console.error(
      chalk.red(`${key} not found in .env`)
    );
    return;
  }

  lines.splice(removeIndex, 1);
  await fs.writeFile(envPath, normalizeTrailingNewline(lines.join("\n")), "utf-8");

  console.log(
    chalk.green(`Removed ${key}`)
  );
}

module.exports = {
  removeCommand,
  isValidKey,
};

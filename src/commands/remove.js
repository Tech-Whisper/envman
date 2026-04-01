const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Execute remove command
 * @param {string} key - The env key to remove
 */
async function removeCommand(key) {
  const envPath = path.join(process.cwd(), ".env");

  const exists = await fs.pathExists(envPath);

  if (!exists) {
    throw new Error("No .env found");
  }

  const content = await fs.readFile(envPath, "utf-8");
  const lines = content.split("\n");

  let found = false;

  const updatedLines = lines.filter(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=/);
    if (match && match[1] === key) {
      found = true;
      return false;
    }
    return true;
  });

  if (!found) {
    throw new Error(`Key "${key}" not found in .env`);
  }

  await fs.writeFile(envPath, updatedLines.join("\n"), "utf-8");

  console.log(
    chalk.green(`Removed ${key} from .env`)
  );
}

module.exports = {
  removeCommand
};

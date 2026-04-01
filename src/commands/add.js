const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Execute add command
 * @param {string} input - KEY=VALUE string
 */
async function addCommand(input) {
  const envPath = path.join(process.cwd(), ".env");

  const eqIndex = input.indexOf("=");

  if (eqIndex === -1) {
    console.error(
      chalk.red("Invalid format. Use: envman add KEY=value")
    );
    process.exit(1);
  }

  const key = input.slice(0, eqIndex).trim();
  const value = input.slice(eqIndex + 1).trim();

  if (!key) {
    console.error(
      chalk.red("Key cannot be empty")
    );
    process.exit(1);
  }

  const exists = await fs.pathExists(envPath);

  let content = exists
    ? await fs.readFile(envPath, "utf-8")
    : "";

  const lines = content.split("\n");
  let found = false;

  const updatedLines = lines.map(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=/);
    if (match && match[1] === key) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    if (content && !content.endsWith("\n")) {
      updatedLines.push("");
    }
    updatedLines.push(`${key}=${value}`);
  }

  await fs.writeFile(envPath, updatedLines.join("\n"), "utf-8");

  if (found) {
    console.log(
      chalk.green(`Updated ${key} in .env`)
    );
  } else {
    console.log(
      chalk.green(`Added ${key} to .env`)
    );
  }
}

module.exports = {
  addCommand
};

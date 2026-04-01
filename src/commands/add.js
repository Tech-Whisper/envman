const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");

/**
 * Parse KEY=value input string
 * @param {string} input
 * @returns {{key: string, value: string}|null}
 */
function parseInput(input) {
  if (!input || !input.trim()) {
    console.error(
      chalk.red("Invalid format. Use: envman add KEY=value")
    );
    return null;
  }

  const eqIndex = input.indexOf("=");

  if (eqIndex === -1) {
    console.error(
      chalk.red("Invalid format. Use: envman add KEY=value")
    );
    return null;
  }

  const key = input.slice(0, eqIndex).trim();
  const value = input.slice(eqIndex + 1);

  if (!key) {
    console.error(
      chalk.red("Key cannot be empty")
    );
    return null;
  }

  return { key, value };
}

/**
 * Prompt user for y/N confirmation
 * @param {string} question
 * @returns {Promise<boolean>}
 */
function askConfirmation() {
  if (global.__mockAnswer !== undefined) {
    const answer = global.__mockAnswer;
    delete global.__mockAnswer;
    const normalized = answer.trim().toLowerCase();
    return Promise.resolve(normalized === "y" || normalized === "yes");
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

/**
 * Execute add command
 * @param {string} input - KEY=VALUE string
 */
async function addCommand(input) {
  const parsed = parseInput(input);

  if (!parsed) {
    return;
  }

  const { key, value } = parsed;

  const envPath = path.join(process.cwd(), ".env");

  const exists = await fs.pathExists(envPath);

  if (!exists) {
    await fs.writeFile(envPath, `${key}=${value}\n`, "utf-8");
    console.log(chalk.green(`Added ${key}`));
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const lines = content.split("\n");

  let existingIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const match = line.match(/^([\w.-]+)\s*=/);
    if (match && match[1] === key) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex === -1) {
    const hasTrailingNewline = content.endsWith("\n");
    const lastEmptyIndex = lines.length - 1;
    if (hasTrailingNewline && lines[lastEmptyIndex] === "") {
      lines.splice(lastEmptyIndex, 0, `${key}=${value}`);
    } else {
      lines.push(`${key}=${value}`);
    }
    await fs.writeFile(envPath, lines.join("\n"), "utf-8");
    console.log(chalk.green(`Added ${key}`));
    return;
  }

  console.log(
    chalk.yellow(`${key} already exists. Overwrite? (y/N)`)
  );

  const confirmed = await askConfirmation("");

  if (!confirmed) {
    console.log(chalk.yellow("Cancelled"));
    return;
  }

  lines[existingIndex] = `${key}=${value}`;
  await fs.writeFile(envPath, lines.join("\n"), "utf-8");
  console.log(chalk.green(`Updated ${key}`));
}

module.exports = {
  addCommand,
  parseInput,
  askConfirmation,
};

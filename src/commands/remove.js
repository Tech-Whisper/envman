const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");

/**
 * Prompt user for y/N confirmation
 * @param {string} question
 * @returns {Promise<boolean>}
 */
function askConfirmation(question) {
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
 * Execute remove command
 * @param {string} key - The env key to remove
 */
async function removeCommand(key) {
  if (!key || !key.trim()) {
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
      chalk.red("No .env found. Nothing to remove")
    );
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const lines = content.split("\n");

  let removeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const match = line.match(/^([\w.-]+)\s*=/);
    if (match && match[1] === key) {
      removeIndex = i;
      break;
    }
  }

  if (removeIndex === -1) {
    console.log(
      chalk.yellow(`${key} not found`)
    );
    return;
  }

  console.log(
    chalk.yellow(`Remove ${key}? (y/N)`)
  );

  const confirmed = await askConfirmation("");

  if (!confirmed) {
    console.log(chalk.yellow("Cancelled"));
    return;
  }

  lines.splice(removeIndex, 1);
  await fs.writeFile(envPath, lines.join("\n"), "utf-8");

  console.log(
    chalk.green(`Removed ${key}`)
  );
}

module.exports = {
  removeCommand,
  askConfirmation,
};

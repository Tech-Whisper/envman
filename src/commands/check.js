const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Parse .env content into array of keys
 * @param {string} content
 * @returns {string[]}
 */
function parseEnvKeys(content) {
  const lines = content.split("\n");
  const keys = [];

  for (const line of lines) {
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex !== -1) {
      keys.push(line.slice(0, eqIndex).trim());
    }
  }

  return keys;
}

/**
 * Check if a key name indicates sensitive data
 * @param {string} key
 * @returns {boolean}
 */
function containsSensitiveKey(key) {
  const upper = key.toUpperCase();
  const sensitivePatterns = [
    "API_KEY",
    "SECRET",
    "TOKEN",
    "PASSWORD",
    "PRIVATE",
  ];

  return sensitivePatterns.some((pattern) => upper.includes(pattern));
}

/**
 * Execute check command
 */
async function checkCommand() {
  const envPath = path.join(process.cwd(), ".env");
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  const examplePath = path.join(process.cwd(), ".env.example");

  let issues = 0;

  const envExists = await fs.pathExists(envPath);
  const gitignoreExists = await fs.pathExists(gitignorePath);
  const exampleExists = await fs.pathExists(examplePath);

  if (!gitignoreExists) {
    console.error(
      chalk.red(".gitignore not found")
    );
    issues++;
  } else {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    const gitignoreLines = gitignoreContent.split("\n").map(l => l.trim());

    if (!gitignoreLines.includes(".env")) {
      console.error(
        chalk.red(".env is not listed in .gitignore")
      );
      issues++;
    }
  }

  if (envExists) {
    const envContent = await fs.readFile(envPath, "utf-8");
    const keys = parseEnvKeys(envContent);

    for (const key of keys) {
      if (containsSensitiveKey(key)) {
        console.log(
          chalk.yellow(`Sensitive key detected: ${key}`)
        );
        issues++;
      }
    }
  }

  if (!exampleExists) {
    console.log(
      chalk.yellow(".env.example not found")
    );
    issues++;
  }

  if (issues === 0) {
    console.log(
      chalk.green("All checks passed")
    );
  } else {
    console.error(
      chalk.red(`${issues} issue${issues > 1 ? "s" : ""} found`)
    );
  }
}

module.exports = {
  checkCommand,
  parseEnvKeys,
  containsSensitiveKey,
};

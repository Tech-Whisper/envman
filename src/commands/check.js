const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnvKeys, isSensitiveKey } = require("../utils/parseEnv");

/**
 * Execute check command
 * @param {Object} options Options passed from commander
 * @param {Object} command The command object
 */
async function checkCommand(options, command) {
  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const envPath = path.join(process.cwd(), envFilename);
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

    if (!gitignoreLines.includes(envFilename)) {
      console.error(
        chalk.red(`${envFilename} is not listed in .gitignore`)
      );
      issues++;
    }
  }

  if (envExists) {
    const envContent = await fs.readFile(envPath, "utf-8");
    const keys = parseEnvKeys(envContent);

    for (const key of keys) {
      if (isSensitiveKey(key)) {
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
  checkCommand
};

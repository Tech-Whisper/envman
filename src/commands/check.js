const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnvKeys, isSensitiveKey } = require("../utils/parseEnv");
const { trackUsage } = require("../core/telemetry");
const { resolveEnvPath, resolveEnvFilename } = require("../utils/fileHandler");
const logger = require("../utils/logger");

async function checkCommand(options, command) {
  await trackUsage("check");

  const envFilename = resolveEnvFilename(command);
  const envPath = resolveEnvPath(command);
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  const examplePath = path.join(process.cwd(), ".env.example");

  console.log(chalk.cyan.bold("\n  Checking .env best practices...\n"));

  let issues = 0;

  const envExists = await fs.pathExists(envPath);
  const gitignoreExists = await fs.pathExists(gitignorePath);
  const exampleExists = await fs.pathExists(examplePath);

  // Check .gitignore
  if (!gitignoreExists) {
    console.log(chalk.red("  ✗ .gitignore not found"));
    issues++;
  } else {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    const gitignoreLines = gitignoreContent.split("\n").map((l) => l.trim());
    if (!gitignoreLines.includes(envFilename) && !gitignoreLines.includes(".env")) {
      console.log(chalk.red(`  ✗ ${envFilename} is not in .gitignore`));
      issues++;
    } else {
      console.log(chalk.green(`  ✓ ${envFilename} is ignored`));
    }
  }

  // Check .envmanrc in .gitignore
  if (gitignoreExists) {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    if (!gitignoreContent.includes(".envmanrc")) {
      console.log(chalk.yellow("  ⚠ .envmanrc should be ignored"));
      issues++;
    } else {
      console.log(chalk.green("  ✓ .envmanrc is ignored"));
    }
  }

  // Check for sensitive keys
  if (envExists) {
    const envContent = await fs.readFile(envPath, "utf-8");
    const keys = parseEnvKeys(envContent);
    const sensitiveKeys = keys.filter(isSensitiveKey);

    if (sensitiveKeys.length > 0) {
      console.log(chalk.yellow(`  ⚠ ${sensitiveKeys.length} sensitive key(s):`));
      for (const k of sensitiveKeys) {
        console.log(chalk.gray(`      ${k}`));
      }
    } else {
      console.log(chalk.green("  ✓ No obviously sensitive key names"));
    }
  } else {
    console.log(chalk.yellow(`  ⚠ ${envFilename} not found`));
  }

  // Check .env.example
  if (!exampleExists) {
    console.log(chalk.yellow("  ⚠ .env.example not found"));
    issues++;
  } else {
    console.log(chalk.green("  ✓ .env.example exists"));
  }

  // Check .envman-backups
  const backupDir = path.join(process.cwd(), ".envman-backups");
  if (await fs.pathExists(backupDir)) {
    console.log(chalk.green("  ✓ Backups are set up"));
  }

  // Summary
  console.log("");
  if (issues === 0) {
    console.log(chalk.green.bold("  All checks passed.\n"));
  } else {
    console.log(chalk.yellow(`  Found ${issues} item(s) to review.\n`));
  }
}

module.exports = {
  checkCommand,
};

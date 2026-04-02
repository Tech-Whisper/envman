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

  console.log(chalk.cyan.bold("\n  🔎 Security Best Practices Check\n"));

  let issues = 0;

  const envExists = await fs.pathExists(envPath);
  const gitignoreExists = await fs.pathExists(gitignorePath);
  const exampleExists = await fs.pathExists(examplePath);

  // Check .gitignore
  if (!gitignoreExists) {
    console.log(chalk.red("  ❌ .gitignore not found — secrets may be committed!"));
    issues++;
  } else {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    const gitignoreLines = gitignoreContent.split("\n").map((l) => l.trim());
    if (!gitignoreLines.includes(envFilename) && !gitignoreLines.includes(".env")) {
      console.log(chalk.red(`  ❌ ${envFilename} is not listed in .gitignore.`));
      issues++;
    } else {
      console.log(chalk.green(`  ✅ ${envFilename} is excluded in .gitignore.`));
    }
  }

  // Check .envmanrc in .gitignore
  if (gitignoreExists) {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    if (!gitignoreContent.includes(".envmanrc")) {
      console.log(chalk.yellow("  ⚠️  .envmanrc (encryption key) is not in .gitignore."));
      issues++;
    } else {
      console.log(chalk.green("  ✅ .envmanrc is excluded in .gitignore."));
    }
  }

  // Check for sensitive keys
  if (envExists) {
    const envContent = await fs.readFile(envPath, "utf-8");
    const keys = parseEnvKeys(envContent);
    const sensitiveKeys = keys.filter(isSensitiveKey);

    if (sensitiveKeys.length > 0) {
      console.log(chalk.yellow(`  ⚠️  ${sensitiveKeys.length} sensitive key(s) detected:`));
      for (const k of sensitiveKeys) {
        console.log(chalk.yellow(`      → ${k}`));
      }
      issues += sensitiveKeys.length;
    } else {
      console.log(chalk.green("  ✅ No obviously sensitive key names detected."));
    }
  } else {
    console.log(chalk.yellow(`  ⚠️  ${envFilename} not found.`));
  }

  // Check .env.example
  if (!exampleExists) {
    console.log(chalk.yellow("  ⚠️  .env.example not found. Run envman generate."));
    issues++;
  } else {
    console.log(chalk.green("  ✅ .env.example exists for team reference."));
  }

  // Check .envman-backups
  const backupDir = path.join(process.cwd(), ".envman-backups");
  if (await fs.pathExists(backupDir)) {
    console.log(chalk.green("  ✅ Backup directory exists."));
  }

  // Summary
  console.log("");
  if (issues === 0) {
    console.log(chalk.green.bold("  ✅ All security checks passed!\n"));
  } else {
    console.log(chalk.red(`  ⛔ ${issues} issue${issues > 1 ? "s" : ""} found. Please review.\n`));
  }
}

module.exports = {
  checkCommand,
};

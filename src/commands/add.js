const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");
const { normalizeContent, normalizeTrailingNewline } = require("../utils/parseEnv");
const { createBackup, pruneBackups } = require("../core/backup");
const { trackUsage } = require("../core/telemetry");
const { validateKeyValueInput, isReservedKey } = require("../utils/validator");
const { resolveEnvPath, resolveEnvFilename, isSafeMode } = require("../utils/fileHandler");
const logger = require("../utils/logger");

function askConfirmation(prompt) {
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
    rl.question(prompt, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

async function addCommand(input, options, command) {
  await trackUsage("add");

  const validation = validateKeyValueInput(input);
  if (!validation.valid) {
    console.error(chalk.red(`❌ ${validation.reason}`));
    return;
  }

  const { key, value } = validation;

  if (isReservedKey(key)) {
    console.log(chalk.yellow(`⚠️  Warning: "${key}" is a system-reserved variable name.`));
  }

  const envFilename = resolveEnvFilename(command);
  const envPath = resolveEnvPath(command);
  const isSafe = isSafeMode(command);

  logger.verbose(`Target file: ${envFilename}`);
  logger.verbose(`Full path: ${envPath}`);

  const exists = await fs.pathExists(envPath);

  if (!exists) {
    if (isSafe) {
      console.log(chalk.yellow(`[SAFE MODE] Would create ${envFilename} and add ${key}=...`));
      return;
    }
    await fs.writeFile(envPath, `${key}=${value}\n`, "utf-8");
    console.log(chalk.green(`✅ Created ${envFilename} and added ${chalk.bold(key)}`));
    return;
  }

  const content = normalizeContent(await fs.readFile(envPath, "utf-8"));
  const lines = content.split("\n");
  const existingIndices = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    const match = line.match(/^([\w.-]+)\s*=/);
    if (match && match[1] === key) {
      existingIndices.push(i);
    }
  }

  if (existingIndices.length === 0) {
    if (isSafe) {
      console.log(chalk.yellow(`[SAFE MODE] Would add ${key} to ${envFilename}`));
      return;
    }
    await createBackup(envPath, options, command);
    const hasTrailingNewline = content.endsWith("\n");
    const lastEmptyIndex = lines.length - 1;
    if (hasTrailingNewline && lines[lastEmptyIndex] === "") {
      lines.splice(lastEmptyIndex, 0, `${key}=${value}`);
    } else {
      lines.push(`${key}=${value}`);
    }
    await fs.writeFile(envPath, normalizeTrailingNewline(lines.join("\n")), "utf-8");
    await pruneBackups(envPath);
    console.log(chalk.green(`✅ Added ${chalk.bold(key)}`));
    return;
  }

  console.log(chalk.yellow(`⚠️  ${key} already exists. Overwrite? (y/N)`));
  const confirmed = await askConfirmation("  ");
  if (!confirmed) {
    console.log(chalk.yellow("Cancelled."));
    return;
  }

  if (isSafe) {
    console.log(chalk.yellow(`[SAFE MODE] Would update ${key} in ${envFilename}`));
    return;
  }

  await createBackup(envPath, options, command);

  for (const idx of existingIndices) {
    lines[idx] = `${key}=${value}`;
  }
  await fs.writeFile(envPath, normalizeTrailingNewline(lines.join("\n")), "utf-8");
  await pruneBackups(envPath);
  console.log(chalk.green(`✅ Updated ${chalk.bold(key)}`));
}

module.exports = { addCommand, askConfirmation };

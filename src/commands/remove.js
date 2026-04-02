const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { normalizeContent, normalizeTrailingNewline } = require("../utils/parseEnv");
const { createBackup, pruneBackups } = require("../core/backup");
const { trackUsage } = require("../core/telemetry");
const { validateKey } = require("../utils/validator");
const { resolveEnvPath, resolveEnvFilename, isSafeMode } = require("../utils/fileHandler");
const logger = require("../utils/logger");

async function removeCommand(key, options, command) {
  await trackUsage("remove");

  const keyValidation = validateKey(key);
  if (!keyValidation.valid) {
    console.error(chalk.red(`❌ ${keyValidation.reason}`));
    return;
  }

  key = key.trim();

  const envFilename = resolveEnvFilename(command);
  const envPath = resolveEnvPath(command);
  const isSafe = isSafeMode(command);

  const exists = await fs.pathExists(envPath);
  if (!exists) {
    console.error(chalk.red(`❌ No ${envFilename} found.`));
    return;
  }

  const content = normalizeContent(await fs.readFile(envPath, "utf-8"));
  const lines = content.split("\n");
  let removeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex !== -1 && line.slice(0, eqIndex).trim() === key) {
      removeIndex = i;
      break;
    }
  }

  if (removeIndex === -1) {
    console.error(chalk.red(`❌ "${key}" not found in ${envFilename}.`));
    return;
  }

  if (isSafe) {
    console.log(chalk.yellow(`[SAFE MODE] Would remove "${key}" from ${envFilename}.`));
    return;
  }

  await createBackup(envPath, options, command);
  lines.splice(removeIndex, 1);
  await fs.writeFile(envPath, normalizeTrailingNewline(lines.join("\n")), "utf-8");
  await pruneBackups(envPath);

  console.log(chalk.green(`✅ Removed "${chalk.bold(key)}" from ${envFilename}.`));
}

module.exports = { removeCommand };

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnv } = require("../utils/parseEnv");
const { isSensitive, maskValue } = require("../core/security");
const { trackUsage } = require("../core/telemetry");
const { resolveEnvPath, resolveEnvFilename } = require("../utils/fileHandler");
const logger = require("../utils/logger");

function printTable(vars, showValues) {
  if (vars.length === 0) {
    console.log(chalk.yellow("  No variables found.\n"));
    return;
  }

  const maskedVars = vars.map((v) => {
    if (!showValues && isSensitive(v.key, v.value)) {
      return { key: v.key, value: maskValue(v.value), sensitive: true };
    }
    return { ...v, sensitive: false };
  });

  const keyWidth = Math.max(...maskedVars.map((v) => v.key.length), 3);
  const valueWidth = Math.min(Math.max(...maskedVars.map((v) => v.value.length), 5), 60);

  console.log(chalk.gray("  ─".repeat(Math.floor((keyWidth + valueWidth + 8) / 2))));
  console.log(chalk.bold(`  ${"KEY".padEnd(keyWidth)}  │  ${"VALUE".padEnd(valueWidth)}`));
  console.log(chalk.gray("  ─".repeat(Math.floor((keyWidth + valueWidth + 8) / 2))));

  for (const v of maskedVars) {
    const keyStr = v.sensitive ? chalk.yellow(v.key.padEnd(keyWidth)) : chalk.white(v.key.padEnd(keyWidth));
    const valStr = v.sensitive ? chalk.gray(v.value) : chalk.white(v.value);
    const icon = v.sensitive ? chalk.yellow("🔒") : " ";
    console.log(`  ${keyStr}  │  ${valStr}  ${icon}`);
  }

  console.log(chalk.gray("  ─".repeat(Math.floor((keyWidth + valueWidth + 8) / 2))));
  const sensitiveCount = maskedVars.filter((v) => v.sensitive).length;
  console.log(
    chalk.gray(`  ${vars.length} variable(s)`) +
    (sensitiveCount > 0 ? chalk.yellow(` • ${sensitiveCount} masked`) : "") +
    (!showValues && sensitiveCount > 0 ? chalk.gray(" (use --show-values to reveal)") : "")
  );
  console.log("");
}

async function listCommand(options, command) {
  await trackUsage("list");

  const envFilename = resolveEnvFilename(command);
  const envPath = resolveEnvPath(command);

  console.log(chalk.cyan.bold(`\n  📋 Environment Variables — ${envFilename}\n`));

  const exists = await fs.pathExists(envPath);
  if (!exists) {
    console.error(chalk.red(`  ❌ No ${envFilename} found. Run ${chalk.bold("envman init")} first.\n`));
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const vars = parseEnv(content);

  printTable(vars, options && options.showValues);
}

module.exports = { listCommand, printTable };

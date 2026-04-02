const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnv } = require("../utils/parseEnv");
const { isSensitive, maskValue } = require("../core/security");
const { trackUsage } = require("../core/telemetry");

function printTable(vars, showValues) {
  const maskedVars = vars.map(v => {
    if (!showValues && isSensitive(v.key, v.value)) {
      return { key: v.key, value: maskValue(v.value) };
    }
    return v;
  });

  const keyWidth = Math.max(...maskedVars.map(v => v.key.length), 3);
  const valueWidth = Math.max(...maskedVars.map(v => v.value.length), 5);

  const header = chalk.green(`${"KEY".padEnd(keyWidth)} | ${"VALUE".padEnd(valueWidth)}`);
  console.log(header);

  for (const v of maskedVars) {
    const row = `${v.key.padEnd(keyWidth)} | ${v.value.padEnd(valueWidth)}`;
    console.log(chalk.white(row));
  }
  console.log(chalk.yellow(`\n${vars.length} variables found`));
}

async function listCommand(options, command) {
  await trackUsage("list");
  
  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const envPath = path.join(process.cwd(), envFilename);

  const exists = await fs.pathExists(envPath);
  if (!exists) {
    console.error(chalk.red(`No ${envFilename} found`));
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const vars = parseEnv(content);

  printTable(vars, options && options.showValues);
}

module.exports = { listCommand, parseEnv };

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnv, isSensitiveValue } = require("../utils/parseEnv");
const { trackUsage } = require("../core/telemetry");

async function doctorCommand(options, command) {
  await trackUsage("doctor");
  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const envPath = path.join(process.cwd(), envFilename);

  console.log(chalk.cyan(`🏥 Running environment health check on ${envFilename}...\n`));

  const exists = await fs.pathExists(envPath);
  if (!exists) {
    console.error(chalk.red(`Fatal: ${envFilename} not found.`));
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const vars = parseEnv(content);
  
  let issues = 0;
  const keySet = new Set();
  const duplicates = new Set();
  
  for (const v of vars) {
    // Check duplicates
    if (keySet.has(v.key)) {
      duplicates.add(v.key);
    }
    keySet.add(v.key);

    // Check empty
    if (!v.value || v.value.trim() === "") {
      console.log(chalk.yellow(`[Empty Value] ${v.key} is defined but empty.`));
      issues++;
    }

    // Check suspicious values (e.g. localhost for production, or password=password)
    const valLower = v.value.toLowerCase();
    if (valLower === 'password' || valLower === 'admin' || valLower === '123456') {
      console.log(chalk.red(`[Suspicious Value] ${v.key} contains a dangerously weak value.`));
      issues++;
    }
  }

  for (const dup of duplicates) {
    console.log(chalk.red(`[Duplicate Key] ${dup} is defined multiple times.`));
    issues++;
  }

  if (issues === 0) {
    console.log(chalk.green(`✅ Health check passed. ${envFilename} looks pristine.`));
  } else {
    console.log(chalk.yellow(`\n⚠️  Found ${issues} issue(s). Please review your ${envFilename} file.`));
  }
}

module.exports = {
  doctorCommand
};

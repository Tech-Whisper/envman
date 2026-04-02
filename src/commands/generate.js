const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnv, isSensitiveKey, normalizeTrailingNewline } = require("../utils/parseEnv");

/**
 * Generate .env.example from an existing .env file
 * @param {Object} options Options passed to the command
 * @param {Object} command The command object
 */
async function generateCommand(options, command) {
  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const envPath = path.join(process.cwd(), envFilename);
  const targetExamplePath = path.join(process.cwd(), ".env.example");

  const exists = await fs.pathExists(envPath);

  if (!exists) {
    console.error(
      chalk.red(`No ${envFilename} found to generate example from`)
    );
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const parsed = parseEnv(content);
  const lines = [];

  for (const item of parsed) {
    if (isSensitiveKey(item.key)) {
      lines.push(`${item.key}="your_${item.key.toLowerCase()}_here"`);
    } else {
      lines.push(`${item.key}=${item.value}`);
    }
  }

  if (lines.length === 0) {
    console.log(chalk.yellow(`Nothing to generate. ${envFilename} is empty.`));
    return;
  }

  await fs.writeFile(targetExamplePath, normalizeTrailingNewline(lines.join("\n")), "utf-8");
  console.log(chalk.green(`Generated .env.example based on ${envFilename}`));
}

module.exports = {
  generateCommand
};

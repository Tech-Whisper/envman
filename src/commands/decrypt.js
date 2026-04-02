const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");
const { decryptValue } = require("../core/security");
const { trackUsage } = require("../core/telemetry");
const { resolveEnvPath, resolveEnvFilename, isSafeMode } = require("../utils/fileHandler");
const logger = require("../utils/logger");

function askPassword(prompt) {
  if (global.__mockPassword !== undefined) {
    const pw = global.__mockPassword;
    delete global.__mockPassword;
    return Promise.resolve(pw);
  }
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl._writeToOutput = function (stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write("*");
      } else {
        rl.output.write(stringToWrite);
      }
    };
    rl.question(prompt, (password) => {
      rl.close();
      console.log("");
      resolve(password);
    });
    rl.stdoutMuted = true;
  });
}

async function decryptCommand(options, command) {
  await trackUsage("decrypt");

  const envFilename = resolveEnvFilename(command);
  const sourcePath = `${resolveEnvPath(command)}.enc`;
  const targetPath = resolveEnvPath(command);

  console.log(chalk.cyan.bold("\n  🔓 Decrypt Environment File\n"));

  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    console.error(chalk.red(`  ❌ No ${path.basename(sourcePath)} found to decrypt.\n`));
    return;
  }

  const isSafe = isSafeMode(command);
  if (isSafe && (await fs.pathExists(targetPath))) {
    console.log(chalk.yellow(`  [SAFE MODE] ${envFilename} already exists. Skipping.\n`));
    return;
  }

  const password = await askPassword("  Enter decryption password: ");

  try {
    const content = await fs.readFile(sourcePath, "utf-8");
    const decryptedData = decryptValue(content, password);
    await fs.writeFile(targetPath, decryptedData, "utf-8");

    console.log(chalk.green(`  ✅ Decrypted ${path.basename(sourcePath)} → ${envFilename}`));
    console.log(chalk.gray(`     Algorithm: AES-256-CBC + HMAC-SHA256\n`));
  } catch (err) {
    console.error(chalk.red(`  ❌ ${err.message}\n`));
    logger.debug(err.stack);
  }
}

module.exports = {
  decryptCommand,
};

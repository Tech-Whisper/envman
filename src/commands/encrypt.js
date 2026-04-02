const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");
const { encryptValue } = require("../core/security");
const { createBackup } = require("../core/backup");
const { trackUsage } = require("../core/telemetry");
const { validatePassword } = require("../utils/validator");
const { resolveEnvPath, resolveEnvFilename } = require("../utils/fileHandler");
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

async function encryptCommand(options, command) {
  await trackUsage("encrypt");

  const envFilename = resolveEnvFilename(command);
  const sourcePath = resolveEnvPath(command);
  const targetPath = `${sourcePath}.enc`;

  console.log(chalk.cyan.bold("\n  🔐 Encrypt Environment File\n"));

  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    console.error(chalk.red(`  ❌ No ${envFilename} found to encrypt.\n`));
    return;
  }

  const password = await askPassword("  Enter encryption password: ");

  if (!password) {
    console.error(chalk.red("  ❌ Password cannot be empty.\n"));
    return;
  }

  const pwValidation = validatePassword(password);
  if (!pwValidation.valid) {
    console.error(chalk.red(`  ❌ ${pwValidation.reason}\n`));
    return;
  }

  if (pwValidation.strength === "weak") {
    console.log(chalk.yellow(`  ⚠️  ${pwValidation.reason}`));
  }

  // Confirm password
  const confirm = await askPassword("  Confirm password: ");
  if (password !== confirm) {
    console.error(chalk.red("  ❌ Passwords do not match.\n"));
    return;
  }

  try {
    await createBackup(sourcePath, options, command);
    const content = await fs.readFile(sourcePath, "utf-8");
    const encryptedData = encryptValue(content, password);
    await fs.writeFile(targetPath, encryptedData, "utf-8");

    const sourceSize = Buffer.byteLength(content, "utf-8");
    const encSize = Buffer.byteLength(encryptedData, "utf-8");

    console.log(chalk.green(`  ✅ Encrypted ${envFilename} → ${path.basename(targetPath)}`));
    console.log(chalk.gray(`     Original: ${sourceSize} bytes → Encrypted: ${encSize} bytes`));
    console.log(chalk.gray(`     Algorithm: AES-256-CBC + HMAC-SHA256\n`));
  } catch (err) {
    console.error(chalk.red(`  ❌ Encryption failed: ${err.message}\n`));
    logger.debug(err.stack);
  }
}

module.exports = {
  encryptCommand,
  askPassword,
};

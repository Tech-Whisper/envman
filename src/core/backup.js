const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

async function createBackup(filePath, options, command) {
  const disableBackup = command && command.optsWithGlobals ? command.optsWithGlobals().noBackup : false;
  
  if (disableBackup) {
    return;
  }

  const exists = await fs.pathExists(filePath);
  if (!exists) {
    return;
  }

  const timestamp = Date.now();
  const backupPath = `${filePath}.backup.${timestamp}`;

  try {
    await fs.copy(filePath, backupPath);
    console.log(chalk.gray(`Created backup at ${path.basename(backupPath)}`));
  } catch (err) {
    console.error(chalk.red(`Failed to create backup: ${err.message}`));
  }
}

module.exports = {
  createBackup
};

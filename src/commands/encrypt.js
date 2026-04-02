const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");
const { encryptValue } = require("../core/security");
const { trackUsage } = require("../core/telemetry");

function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let muted = false;
    rl.question(prompt, (password) => {
      rl.close();
      resolve(password);
    });
    
    // Mute the output after the prompt is written
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write("*");
      } else {
        rl.output.write(stringToWrite);
      }
    };
    
    rl.stdoutMuted = true;
  });
}

async function encryptCommand(options, command) {
  await trackUsage("encrypt");
  
  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const sourcePath = path.join(process.cwd(), envFilename);
  const targetPath = `${sourcePath}.enc`;

  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    console.error(chalk.red(`No ${envFilename} found to encrypt.`));
    return;
  }

  const content = await fs.readFile(sourcePath, "utf-8");
  
  const password = await askPassword("Enter encryption password: ");
  console.log(""); // New line after hidden input
  
  if (!password) {
    console.error(chalk.red("Password cannot be empty."));
    return;
  }
  
  try {
    const encryptedData = encryptValue(content, password);
    await fs.writeFile(targetPath, encryptedData, "utf-8");
    console.log(chalk.green(`Encrypted ${envFilename} to ${path.basename(targetPath)} successfully.`));
  } catch (err) {
    console.error(chalk.red(`Encryption failed: ${err.message}`));
  }
}

module.exports = {
  encryptCommand
};

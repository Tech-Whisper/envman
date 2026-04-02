const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");
const { decryptValue } = require("../core/security");
const { trackUsage } = require("../core/telemetry");

function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(prompt, (password) => {
      rl.close();
      resolve(password);
    });
    
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

async function decryptCommand(options, command) {
  await trackUsage("decrypt");

  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const sourcePath = `${path.join(process.cwd(), envFilename)}.enc`;
  const targetPath = path.join(process.cwd(), envFilename);

  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    console.error(chalk.red(`No ${path.basename(sourcePath)} found to decrypt.`));
    return;
  }

  let isSafe = command && command.optsWithGlobals ? command.optsWithGlobals().safe : false;
  if (isSafe && await fs.pathExists(targetPath)) {
    console.log(chalk.yellow(`Safe mode enabled. Skipping decrypt because ${envFilename} already exists.`));
    return;
  }

  const content = await fs.readFile(sourcePath, "utf-8");
  
  const password = await askPassword("Enter decryption password: ");
  console.log(""); // New line after hidden input
  
  try {
    const decryptedData = decryptValue(content, password);
    await fs.writeFile(targetPath, decryptedData, "utf-8");
    console.log(chalk.green(`Decrypted ${path.basename(sourcePath)} to ${envFilename} successfully.`));
  } catch (err) {
    console.error(chalk.red(`Decryption failed: ${err.message}`));
  }
}

module.exports = {
  decryptCommand
};

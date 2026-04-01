const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Execute check command
 * Validates .env against .env.example and reports missing/extra keys
 */
async function checkCommand() {
  const envPath = path.join(process.cwd(), ".env");
  const examplePath = path.join(process.cwd(), ".env.example");

  const envExists = await fs.pathExists(envPath);
  const exampleExists = await fs.pathExists(examplePath);

  if (!envExists) {
    console.error(
      chalk.red("No .env found")
    );
    return;
  }

  if (!exampleExists) {
    console.error(
      chalk.red("No .env.example found")
    );
    return;
  }

  const envContent = await fs.readFile(envPath, "utf-8");
  const exampleContent = await fs.readFile(examplePath, "utf-8");

  const parseKeys = (content) => {
    const lines = content.split("\n");
    const keys = new Set();
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=/);
      if (match && !line.trim().startsWith("#")) {
        keys.add(match[1]);
      }
    }
    return keys;
  };

  const envKeys = parseKeys(envContent);
  const exampleKeys = parseKeys(exampleContent);

  const missing = [...exampleKeys].filter(k => !envKeys.has(k));
  const extra = [...envKeys].filter(k => !exampleKeys.has(k));

  if (missing.length === 0 && extra.length === 0) {
    console.log(
      chalk.green(".env matches .env.example")
    );
    return;
  }

  if (missing.length > 0) {
    console.log(
      chalk.yellow(`Missing keys: ${missing.join(", ")}`)
    );
  }

  if (extra.length > 0) {
    console.log(
      chalk.yellow(`Extra keys: ${extra.join(", ")}`)
    );
  }
}

module.exports = {
  checkCommand
};

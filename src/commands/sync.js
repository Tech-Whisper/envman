const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Execute sync command
 * Syncs .env with .env.example, adding missing keys
 */
async function syncCommand() {
  const envPath = path.join(process.cwd(), ".env");
  const examplePath = path.join(process.cwd(), ".env.example");

  const envExists = await fs.pathExists(envPath);
  const exampleExists = await fs.pathExists(examplePath);

  if (!envExists) {
    console.error(
      chalk.red("No .env found. Run: envman add KEY=value")
    );
    process.exit(1);
  }

  if (!exampleExists) {
    console.error(
      chalk.red("No .env.example found")
    );
    process.exit(1);
  }

  const envContent = await fs.readFile(envPath, "utf-8");
  const exampleContent = await fs.readFile(examplePath, "utf-8");

  const parseEnv = (content) => {
    const lines = content.split("\n");
    const result = {};
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !line.trim().startsWith("#")) {
        result[match[1]] = match[2] || "";
      }
    }
    return result;
  };

  const envVars = parseEnv(envContent);
  const exampleVars = parseEnv(exampleContent);

  let added = 0;

  for (const [key, value] of Object.entries(exampleVars)) {
    if (!(key in envVars)) {
      envVars[key] = value;
      added++;
    }
  }

  const outputLines = [];
  for (const line of exampleContent.split("\n")) {
    if (line.trim().startsWith("#") || line.trim() === "") {
      outputLines.push(line);
      continue;
    }
    const match = line.match(/^\s*([\w.-]+)\s*=/);
    if (match && match[1] in envVars) {
      outputLines.push(`${match[1]}=${envVars[match[1]]}`);
    }
  }

  for (const [key, value] of Object.entries(envVars)) {
    if (!exampleContent.includes(`${key}=`)) {
      outputLines.push(`${key}=${value}`);
    }
  }

  await fs.writeFile(envPath, outputLines.join("\n"), "utf-8");

  console.log(
    chalk.green(`Synced .env with .env.example (${added} keys added)`)
  );
}

module.exports = {
  syncCommand
};

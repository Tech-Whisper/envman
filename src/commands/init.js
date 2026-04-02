const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { trackUsage } = require("../core/telemetry");

const DEFAULT_ENV_CONTENT = `PORT=3000
NODE_ENV=development
DB_URL=postgresql://user:password@localhost:5432/mydb
API_KEY=your_api_key_here
SESSION_SECRET=your_session_secret_here
`;

async function initCommand(options, command) {
  await trackUsage("init");
  const isSafe = command && command.optsWithGlobals ? command.optsWithGlobals().safe : false;

  const envPath = path.join(process.cwd(), ".env");
  const examplePath = path.join(process.cwd(), ".env.example");

  console.log(chalk.cyan("Initializing environment template...\n"));

  const envExists = await fs.pathExists(envPath);
  const exampleExists = await fs.pathExists(examplePath);

  if (envExists && exampleExists) {
    console.log(chalk.yellow("Environment files already exist. Run envman doctor to check them."));
    return;
  }

  if (isSafe && (!envExists || !exampleExists)) {
    console.log(chalk.yellow(`Safe mode enabled. Would create .env and .env.example.`));
    return;
  }

  if (!envExists) {
    await fs.writeFile(envPath, DEFAULT_ENV_CONTENT, "utf-8");
    console.log(chalk.green("Created .env boilerplate."));
  }

  if (!exampleExists) {
    await fs.writeFile(examplePath, DEFAULT_ENV_CONTENT, "utf-8");
    console.log(chalk.green("Created .env.example boilerplate."));
  }
}

module.exports = {
  initCommand
};

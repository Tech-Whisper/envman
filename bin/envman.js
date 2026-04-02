#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const { listCommand } = require("../src/commands/list");
const { addCommand } = require("../src/commands/add");
const { removeCommand } = require("../src/commands/remove");
const { syncCommand } = require("../src/commands/sync");
const { checkCommand } = require("../src/commands/check");
const { generateCommand } = require("../src/commands/generate");
const { scanCommand } = require("../src/commands/scan");
const { encryptCommand } = require("../src/commands/encrypt");
const { decryptCommand } = require("../src/commands/decrypt");
const { doctorCommand } = require("../src/commands/doctor");
const { initCommand } = require("../src/commands/init");
const { telemetryCmd } = require("../src/commands/telemetryCmd");
const { interactiveMenu } = require("../src/commands/interactive");
const logger = require("../src/utils/logger");

const program = new Command();

program
  .name("envman")
  .description(
    chalk.cyan.bold("🛡️  ENVMAN") +
    chalk.white(" — Security-First Environment Variable Management\n") +
    chalk.gray("   AES-256 encryption • Secret scanning • Health diagnostics\n") +
    chalk.gray("   Auto-backups • Safe sync • Interactive mode")
  )
  .version("3.0.0", "-v, --version")
  .option("-e, --env-file <path>", "Specify target environment file", ".env")
  .option("--safe", "Safe mode: preview actions only, no writes")
  .option("--no-backup", "Disable automatic backups before destructive actions")
  .option("--verbose", "Enable verbose output")
  .option("--debug", "Enable debug output (includes timestamps)")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
      logger.setLevel("debug");
    } else if (opts.verbose) {
      logger.setLevel("verbose");
    }
  });

// Interactive mode (default when no command given)
program
  .command("menu")
  .description("Launch interactive menu")
  .action(interactiveMenu);

// Core commands
program
  .command("init")
  .description("Initialize envman for this project")
  .action(initCommand);

program
  .command("list")
  .description("List all environment variables")
  .option("--show-values", "Reveal sensitive values")
  .action(listCommand);

program
  .command("add <input>")
  .description("Add or update a KEY=value pair")
  .action(addCommand);

program
  .command("remove <key>")
  .description("Remove an environment variable")
  .action(removeCommand);

program
  .command("sync")
  .description("Sync .env to another directory")
  .requiredOption("--to <targetPath>", "Target directory path")
  .option("--overwrite", "Overwrite existing values")
  .option("--dry-run", "Preview changes without writing")
  .action(syncCommand);

// Security commands
program
  .command("scan")
  .description("Scan project for hardcoded secrets")
  .action(scanCommand);

program
  .command("check")
  .description("Check security best practices")
  .action(checkCommand);

program
  .command("encrypt")
  .description("Encrypt the .env file with AES-256-CBC")
  .action(encryptCommand);

program
  .command("decrypt")
  .description("Decrypt an encrypted .env.enc file")
  .action(decryptCommand);

// Utility commands
program
  .command("doctor")
  .description("Run deep environment health diagnostics")
  .action(doctorCommand);

program
  .command("generate")
  .description("Generate .env.example from current .env")
  .action(generateCommand);

program
  .command("enable-telemetry")
  .description("Opt in to anonymous usage telemetry")
  .action(telemetryCmd);

// Default: show interactive menu if no args
if (process.argv.length <= 2) {
  interactiveMenu();
} else {
  program.parse(process.argv);
}

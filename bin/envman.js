#!/usr/bin/env node

const { Command } = require("commander");
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

const program = new Command();

program
  .name("envman")
  .description("SECURITY-FIRST ENVIRONMENT MANAGEMENT SYSTEM")
  .version("2.0.0")
  .option("-e, --env-file <path>", "Specify target environment file", ".env")
  .option("--safe", "Safe mode: preview actions only, disable overwrite/delete")
  .option("--no-backup", "Disable automatic timestamp backups before destructive actions");

program.command("init").description("Generate environment templates").action(initCommand);
program.command("list").description("List variables safely").option("--show-values", "Show sensitive values").action(listCommand);
program.command("add <input>").description("Add variable").action(addCommand);
program.command("remove <key>").description("Remove variable").action(removeCommand);
program.command("sync").description("Sync .env to another folder").requiredOption("--to <targetPath>").option("--overwrite", "Overwrite").option("--dry-run", "Alias for --safe").action(syncCommand);
program.command("check").description("Check security best practices").action(checkCommand);
program.command("generate").description("Safely generate .env.example").action(generateCommand);

// Elite Features
program.command("scan").description("Scan the project for leaked secrets").action(scanCommand);
program.command("encrypt").description("Encrypt the environment file securely").action(encryptCommand);
program.command("decrypt").description("Decrypt the environment file securely").action(decryptCommand);
program.command("doctor").description("Run deep project/environment health check").action(doctorCommand);
program.command("enable-telemetry").description("Opt in to anonymous telemetry").action(telemetryCmd);

program.parse(process.argv);

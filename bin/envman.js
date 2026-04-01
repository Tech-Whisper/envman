#!/usr/bin/env node

const { Command } = require("commander");
const { listCommand } = require("../src/commands/list");
const { addCommand } = require("../src/commands/add");
const { removeCommand } = require("../src/commands/remove");
const { syncCommand } = require("../src/commands/sync");
const { checkCommand } = require("../src/commands/check");

const program = new Command();

program
  .name("envman")
  .description("CLI to manage .env files")
  .version("1.0.0");

program
  .command("list")
  .description("List all environment variables")
  .action(listCommand);

program
  .command("add <input>")
  .description("Add or update an environment variable (KEY=value)")
  .action(addCommand);

program
  .command("remove <key>")
  .description("Remove an environment variable")
  .action(removeCommand);

program
  .command("sync")
  .description("Sync .env to another project folder")
  .requiredOption("--to <targetPath>", "Target folder path")
  .option("--overwrite", "Overwrite existing keys in target")
  .action((opts) => syncCommand(opts));

program
  .command("check")
  .description("Check .env against .env.example")
  .action(checkCommand);

program.parse(process.argv);

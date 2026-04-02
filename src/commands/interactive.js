/**
 * Interactive menu for envman CLI
 */
const readline = require("readline");
const chalk = require("chalk");
const { listCommand } = require("./list");
const { scanCommand } = require("./scan");
const { doctorCommand } = require("./doctor");
const { initCommand } = require("./init");
const { checkCommand } = require("./check");
const { generateCommand } = require("./generate");
const { encryptCommand } = require("./encrypt");
const { decryptCommand } = require("./decrypt");

const MENU_ITEMS = [
  { key: "1", label: "List Variables", desc: "View all environment variables", fn: listCommand },
  { key: "2", label: "Add Secret", desc: "Add a KEY=value pair", fn: null }, // Handled specially
  { key: "3", label: "Scan Secrets", desc: "Detect leaked secrets in project", fn: scanCommand },
  { key: "4", label: "Doctor", desc: "Health check on .env file", fn: doctorCommand },
  { key: "5", label: "Init Project", desc: "Initialize envman for this project", fn: initCommand },
  { key: "6", label: "Check Security", desc: "Run security best practices check", fn: checkCommand },
  { key: "7", label: "Generate Example", desc: "Create .env.example", fn: generateCommand },
  { key: "8", label: "Encrypt .env", desc: "Encrypt environment file", fn: encryptCommand },
  { key: "9", label: "Decrypt .env", desc: "Decrypt environment file", fn: decryptCommand },
  { key: "0", label: "Exit", desc: "Quit envman", fn: null },
];

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function printBanner() {
  console.log("");
  console.log(chalk.cyan.bold("  ╔═══════════════════════════════════════════════╗"));
  console.log(chalk.cyan.bold("  ║") + chalk.white.bold("   🛡️  ENVMAN — Secure Environment Manager    ") + chalk.cyan.bold("║"));
  console.log(chalk.cyan.bold("  ╚═══════════════════════════════════════════════╝"));
  console.log("");
}

function printMenu() {
  console.log(chalk.white.bold("  Commands:\n"));
  for (const item of MENU_ITEMS) {
    if (item.key === "0") {
      console.log(chalk.gray(`    ${item.key}. ${item.label}`));
    } else {
      console.log(`    ${chalk.cyan.bold(item.key)}. ${chalk.white(item.label.padEnd(20))} ${chalk.gray(item.desc)}`);
    }
  }
  console.log("");
}

async function interactiveMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printBanner();
  printMenu();

  let running = true;

  while (running) {
    const choice = await ask(rl, chalk.cyan("  [Envman]~[#]> "));
    const trimmed = choice.trim();

    if (trimmed === "0" || trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
      console.log(chalk.gray("\n  Goodbye! 👋\n"));
      running = false;
      break;
    }

    if (trimmed === "2") {
      // Special handling for add command
      const input = await ask(rl, chalk.white("  Enter KEY=value: "));
      if (input.trim()) {
        const { addCommand } = require("./add");
        await addCommand(input.trim(), {}, null);
      } else {
        console.log(chalk.yellow("  Cancelled.\n"));
      }
      continue;
    }

    const menuItem = MENU_ITEMS.find((m) => m.key === trimmed);

    if (!menuItem) {
      console.log(chalk.red("  ❌ Invalid selection. Enter a number 0-9.\n"));
      continue;
    }

    if (menuItem.fn) {
      try {
        await menuItem.fn({}, null);
      } catch (err) {
        console.error(chalk.red(`  ❌ Error: ${err.message}`));
      }
    }
  }

  rl.close();
}

module.exports = {
  interactiveMenu,
  MENU_ITEMS,
};

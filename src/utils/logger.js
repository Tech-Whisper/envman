const chalk = require("chalk");

const LOG_LEVELS = { silent: 0, error: 1, warn: 2, info: 3, verbose: 4, debug: 5 };

let currentLevel = LOG_LEVELS.info;

function setLevel(level) {
  if (typeof level === "string" && LOG_LEVELS[level] !== undefined) {
    currentLevel = LOG_LEVELS[level];
  }
}

function getTimestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function formatPrefix(label, color) {
  return color(`[${label}]`);
}

const logger = {
  error(msg, ...args) {
    if (currentLevel >= LOG_LEVELS.error) {
      console.error(`${formatPrefix("ERROR", chalk.red)} ${msg}`, ...args);
    }
  },

  warn(msg, ...args) {
    if (currentLevel >= LOG_LEVELS.warn) {
      console.warn(`${formatPrefix("WARN", chalk.yellow)} ${msg}`, ...args);
    }
  },

  info(msg, ...args) {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(`${formatPrefix("INFO", chalk.cyan)} ${msg}`, ...args);
    }
  },

  success(msg, ...args) {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(`${formatPrefix("OK", chalk.green)} ${msg}`, ...args);
    }
  },

  verbose(msg, ...args) {
    if (currentLevel >= LOG_LEVELS.verbose) {
      console.log(`${formatPrefix("VERBOSE", chalk.gray)} ${chalk.gray(msg)}`, ...args);
    }
  },

  debug(msg, ...args) {
    if (currentLevel >= LOG_LEVELS.debug) {
      console.log(`${formatPrefix("DEBUG", chalk.magenta)} ${chalk.gray(getTimestamp())} ${msg}`, ...args);
    }
  },

  table(data) {
    if (currentLevel >= LOG_LEVELS.info) {
      console.table(data);
    }
  },

  blank() {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log("");
    }
  },

  banner(text) {
    if (currentLevel >= LOG_LEVELS.info) {
      const line = chalk.cyan("═".repeat(50));
      console.log(line);
      console.log(chalk.bold.cyan(`  ${text}`));
      console.log(line);
    }
  },

  setLevel,
  LOG_LEVELS,
};

module.exports = logger;

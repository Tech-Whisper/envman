const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Ensure content ends with exactly one trailing newline
 * @param {string} content
 * @returns {string}
 */
function normalizeTrailingNewline(content) {
  return content.replace(/\n*$/, "") + "\n";
}

/**
 * Parse .env content into key-value map
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseEnv(content) {
  const lines = content.split("\n");
  const result = {};

  for (const line of lines) {
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex !== -1) {
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1);
      result[key] = value;
    }
  }

  return result;
}

/**
 * Build a KEY=VALUE line string
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function buildLine(key, value) {
  return `${key}=${value}`;
}

/**
 * Find the index of a key in the lines array
 * @param {string[]} lines
 * @param {string} key
 * @returns {number}
 */
function findLineIndex(lines, key) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex !== -1 && line.slice(0, eqIndex).trim() === key) {
      return i;
    }
  }
  return -1;
}

/**
 * Execute sync command
 * @param {{to: string, overwrite: boolean}} options
 */
async function syncCommand(options) {
  if (!options || !options.to) {
    console.error(
      chalk.red("Required: --to <targetPath>")
    );
    return;
  }

  const sourcePath = path.join(process.cwd(), ".env");
  const targetDir = path.resolve(options.to);
  const targetPath = path.join(targetDir, ".env");

  const sourceExists = await fs.pathExists(sourcePath);

  if (!sourceExists) {
    console.error(
      chalk.red("No .env found in current folder")
    );
    return;
  }

  const targetDirExists = await fs.pathExists(targetDir);

  if (!targetDirExists) {
    console.error(
      chalk.red("Target folder not found")
    );
    return;
  }

  const sourceContent = await fs.readFile(sourcePath, "utf-8");
  const sourceMap = parseEnv(sourceContent);

  const targetExists = await fs.pathExists(targetPath);
  let targetContent = "";
  let targetMap = {};
  let targetLines = [];

  if (targetExists) {
    targetContent = await fs.readFile(targetPath, "utf-8");
    targetMap = parseEnv(targetContent);
    targetLines = targetContent.split("\n");
  }

  const diffs = [];

  for (const key of Object.keys(sourceMap)) {
    if (!(key in targetMap)) {
      diffs.push({ key, action: "ADD" });
    } else if (options.overwrite) {
      diffs.push({ key, action: "OVERWRITE" });
    } else {
      diffs.push({ key, action: "SKIP" });
    }
  }

  for (const diff of diffs) {
    if (diff.action === "SKIP") {
      console.log(
        chalk.yellow(`SKIP ${diff.key} (exists)`)
      );
    } else {
      console.log(
        chalk.green(`${diff.action} ${diff.key}`)
      );
    }
  }

  if (diffs.length === 0) {
    console.log(
      chalk.yellow("No changes needed")
    );
    return;
  }

  let synced = 0;

  for (const diff of diffs) {
    if (diff.action === "SKIP") {
      continue;
    }

    const value = sourceMap[diff.key];
    const existingIndex = findLineIndex(targetLines, diff.key);

    if (existingIndex !== -1) {
      targetLines[existingIndex] = buildLine(diff.key, value);
    } else {
      const hasTrailingNewline = targetContent.endsWith("\n");
      const lastEmptyIndex = targetLines.length - 1;
      if (hasTrailingNewline && targetLines[lastEmptyIndex] === "") {
        targetLines.splice(lastEmptyIndex, 0, buildLine(diff.key, value));
      } else {
        targetLines.push(buildLine(diff.key, value));
      }
    }

    synced++;
  }

  await fs.writeFile(targetPath, normalizeTrailingNewline(targetLines.join("\n")), "utf-8");

  console.log(
    chalk.green(`Synced ${synced} variables`)
  );
}

module.exports = {
  syncCommand,
  parseEnv,
  buildLine,
  findLineIndex,
};

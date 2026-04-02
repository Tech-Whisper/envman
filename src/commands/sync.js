const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnvMap, normalizeContent, normalizeTrailingNewline, buildLine, findLineIndex } = require("../utils/parseEnv");
const { isSensitive, maskValue, encryptValue, decryptValue } = require("../core/security");
const { createBackup } = require("../core/backup");
const { trackUsage } = require("../core/telemetry");
const { resolveEnvFilename, isSafeMode } = require("../utils/fileHandler");
const { loadKey } = require("../core/keyManager");
const logger = require("../utils/logger");

async function syncCommand(options, command) {
  await trackUsage("sync");

  if (!options || !options.to) {
    console.error(chalk.red("  ❌ Required: --to <targetPath>"));
    return;
  }

  const envFilename = resolveEnvFilename(command);
  const sourcePath = path.join(process.cwd(), envFilename);
  const targetDir = path.resolve(options.to);
  const targetPath = path.join(targetDir, envFilename);
  const isSafe = isSafeMode(command) || options.dryRun;

  console.log(chalk.cyan.bold("\n  🔄 Sync Environment Variables\n"));

  const sourceExists = await fs.pathExists(sourcePath);
  if (!sourceExists) {
    console.error(chalk.red(`  ❌ No ${envFilename} found in current folder.`));
    return;
  }

  const targetDirExists = await fs.pathExists(targetDir);
  if (!targetDirExists) {
    console.error(chalk.red("  ❌ Target folder not found."));
    return;
  }

  // Verify encryption integrity if key is available
  const encKey = await loadKey();
  if (encKey) {
    logger.verbose("Encryption key found. Sync will maintain encrypted format.");
  }

  const sourceContent = normalizeContent(await fs.readFile(sourcePath, "utf-8"));
  const sourceMap = parseEnvMap(sourceContent);

  const targetExists = await fs.pathExists(targetPath);
  let targetContent = "";
  let targetMap = {};
  let targetLines = [];

  if (targetExists) {
    targetContent = normalizeContent(await fs.readFile(targetPath, "utf-8"));
    targetMap = parseEnvMap(targetContent);
    targetLines = targetContent.split("\n");
  }

  const diffs = [];

  for (const key of Object.keys(sourceMap)) {
    if (!(key in targetMap)) {
      diffs.push({ key, action: "ADD", value: sourceMap[key] });
    } else if (options.overwrite && targetMap[key] !== sourceMap[key]) {
      diffs.push({ key, action: "UPDATE", value: sourceMap[key] });
    } else {
      diffs.push({ key, action: "SKIP", value: sourceMap[key] });
    }
  }

  const changes = diffs.filter((d) => d.action !== "SKIP");

  if (changes.length === 0) {
    console.log(chalk.green("  ✅ All variables are already in sync. No changes needed.\n"));
    return;
  }

  console.log(chalk.gray(`  Source: ${sourcePath}`));
  console.log(chalk.gray(`  Target: ${targetPath}\n`));

  for (const diff of changes) {
    const displayVal = isSensitive(diff.key, diff.value) ? maskValue(diff.value) : diff.value;
    const paddedKey = diff.key.padEnd(25);

    if (diff.action === "ADD") {
      console.log(chalk.green(`  + ${paddedKey} ${displayVal}`));
    } else if (diff.action === "UPDATE") {
      console.log(chalk.blue(`  ~ ${paddedKey} ${displayVal}`));
    }
  }

  if (isSafe) {
    console.log(chalk.yellow("\n  [SAFE MODE / DRY RUN] No files were changed.\n"));
    return;
  }

  await createBackup(targetPath, options, command);

  let synced = 0;

  for (const diff of diffs) {
    if (diff.action === "SKIP") continue;

    const value = sourceMap[diff.key];
    const existingIndex = findLineIndex(targetLines, diff.key);

    if (existingIndex !== -1) {
      targetLines[existingIndex] = buildLine(diff.key, value);
    } else {
      const hasTrailingNewline = targetContent.endsWith("\n") || targetLines.length === 0;
      const lastEmptyIndex = targetLines.length - 1;
      if (targetLines.length > 0 && hasTrailingNewline && targetLines[lastEmptyIndex] === "") {
        targetLines.splice(lastEmptyIndex, 0, buildLine(diff.key, value));
      } else {
        targetLines.push(buildLine(diff.key, value));
      }
    }
    synced++;
  }

  await fs.writeFile(targetPath, normalizeTrailingNewline(targetLines.join("\n")), "utf-8");
  console.log(chalk.green(`\n  ✅ Synced ${synced} variable(s) successfully.\n`));
}

module.exports = { syncCommand };

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnvMap, normalizeContent, normalizeTrailingNewline, buildLine, findLineIndex } = require("../utils/parseEnv");
const { isSensitive, maskValue } = require("../core/security");
const { createBackup } = require("../core/backup");
const { trackUsage } = require("../core/telemetry");

async function syncCommand(options, command) {
  await trackUsage("sync");

  if (!options || !options.to) {
    console.error(chalk.red("Required: --to <targetPath>"));
    return;
  }

  const envFilename = command && command.optsWithGlobals ? command.optsWithGlobals().envFile : ".env";
  const sourcePath = path.join(process.cwd(), envFilename);
  const targetDir = path.resolve(options.to);
  const targetPath = path.join(targetDir, envFilename);

  const isSafe = (command && command.optsWithGlobals && command.optsWithGlobals().safe) || options.dryRun;

  const sourceExists = await fs.pathExists(sourcePath);
  if (!sourceExists) {
    console.error(chalk.red(`No ${envFilename} found in current folder`));
    return;
  }

  const targetDirExists = await fs.pathExists(targetDir);
  if (!targetDirExists) {
    console.error(chalk.red("Target folder not found"));
    return;
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

  if (diffs.length === 0) {
    console.log(chalk.yellow("No changes needed"));
    return;
  }

  let changesToPerform = false;

  console.log(chalk.cyan(`Syncing ${envFilename} to ${targetDir}...\n`));

  for (const diff of diffs) {
    const valObj = diff.action !== "SKIP" && isSensitive(diff.key, diff.value) 
      ? maskValue() 
      : diff.value;
    
    // Formatting align cleanly
    const paddedKey = diff.key.padEnd(25);

    if (diff.action === "SKIP") {
      // console.log(chalk.gray(`  ${paddedKey} (unchanged)`));
    } else if (diff.action === "ADD") {
      console.log(chalk.green(`+ ${paddedKey} ${valObj}`));
      changesToPerform = true;
    } else if (diff.action === "UPDATE") {
      console.log(chalk.blue(`~ ${paddedKey} ${valObj}`));
      changesToPerform = true;
    }
  }

  if (!changesToPerform) {
    console.log(chalk.yellow("\nAll variables are already mapped. No changes needed."));
    return;
  }

  if (isSafe) {
    console.log(chalk.yellow("\n[SAFE MODE] Dry run completed. No files were changed."));
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
  console.log(chalk.green(`\n✅ Synced ${synced} variables successfully.`));
}

module.exports = { syncCommand };

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { scanContent, shouldScanFile, shouldSkipDir, getSeverityLabel } = require("../core/scanCore");
const { trackUsage } = require("../core/telemetry");
const logger = require("../utils/logger");

async function scanDirectory(dir, results, stats) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      stats.dirsScanned++;
      await scanDirectory(fullPath, results, stats);
    } else if (entry.isFile() && shouldScanFile(entry.name)) {
      stats.filesScanned++;
      try {
        const content = await fs.readFile(fullPath, "utf-8");
        const findings = scanContent(content, fullPath);
        results.push(...findings);
      } catch {
        // Skip files that can't be read
        logger.verbose(`Could not read: ${fullPath}`);
      }
    }
  }
}

async function scanCommand(options, command) {
  await trackUsage("scan");

  console.log(chalk.cyan.bold("\n  🔍 Envman Secret Scanner\n"));
  console.log(chalk.gray("  Scanning project files for hardcoded secrets...\n"));

  const results = [];
  const stats = { filesScanned: 0, dirsScanned: 0 };
  const startTime = Date.now();

  await scanDirectory(process.cwd(), results, stats);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  if (results.length === 0) {
    console.log(chalk.green(`  ✅ No secrets found across ${stats.filesScanned} files.`));
    console.log(chalk.gray(`  Scanned ${stats.dirsScanned} directories in ${elapsed}s\n`));
    return;
  }

  // Group by severity
  const critical = results.filter((r) => r.severity === "critical");
  const high = results.filter((r) => r.severity === "high");
  const medium = results.filter((r) => r.severity === "medium");

  console.log(chalk.red.bold(`  ⚠️  Found ${results.length} potential secret(s):\n`));

  if (critical.length > 0) {
    console.log(chalk.red.bold("  ── CRITICAL ──"));
    for (const res of critical) {
      const rel = path.relative(process.cwd(), res.file);
      console.log(`  ${chalk.red("🔴")} ${chalk.yellow(rel)}:${chalk.white(res.line)} — ${chalk.red(res.type)}`);
    }
    console.log("");
  }

  if (high.length > 0) {
    console.log(chalk.hex("#FF8C00").bold("  ── HIGH ──"));
    for (const res of high) {
      const rel = path.relative(process.cwd(), res.file);
      console.log(`  ${chalk.hex("#FF8C00")("🟠")} ${chalk.yellow(rel)}:${chalk.white(res.line)} — ${chalk.hex("#FF8C00")(res.type)}`);
    }
    console.log("");
  }

  if (medium.length > 0) {
    console.log(chalk.yellow.bold("  ── MEDIUM ──"));
    for (const res of medium) {
      const rel = path.relative(process.cwd(), res.file);
      console.log(`  ${chalk.yellow("🟡")} ${chalk.yellow(rel)}:${chalk.white(res.line)} — ${chalk.yellow(res.type)}`);
    }
    console.log("");
  }

  console.log(chalk.gray(`  Scanned ${stats.filesScanned} files in ${stats.dirsScanned} directories (${elapsed}s)`));
  console.log(chalk.gray("  Note: Secret values are completely hidden for security.\n"));
}

module.exports = {
  scanCommand,
  scanDirectory,
};

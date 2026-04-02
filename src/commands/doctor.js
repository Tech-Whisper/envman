const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseEnv, isSensitiveKey, isSensitiveValue } = require("../utils/parseEnv");
const { listBackups } = require("../core/backup");
const { trackUsage } = require("../core/telemetry");
const { resolveEnvPath, resolveEnvFilename } = require("../utils/fileHandler");
const logger = require("../utils/logger");

const WEAK_VALUES = ["password", "admin", "123456", "secret", "test", "changeme", "default", "root", "1234", "pass"];

async function doctorCommand(options, command) {
  await trackUsage("doctor");

  const envFilename = resolveEnvFilename(command);
  const envPath = resolveEnvPath(command);

  console.log(chalk.cyan.bold("\n  🏥 Envman Doctor — Health Check\n"));
  console.log(chalk.gray(`  Analyzing ${envFilename}...\n`));

  const exists = await fs.pathExists(envPath);
  if (!exists) {
    console.error(chalk.red(`  ❌ ${envFilename} not found. Run ${chalk.bold("envman init")} first.\n`));
    return;
  }

  const content = await fs.readFile(envPath, "utf-8");
  const vars = parseEnv(content);

  let issues = 0;
  let warnings = 0;
  const keySet = new Set();
  const duplicates = new Set();
  const checks = [];

  // ── Check: File permissions ──
  try {
    const stats = await fs.stat(envPath);
    const mode = (stats.mode & 0o777).toString(8);
    if (mode !== "600" && mode !== "644" && process.platform !== "win32") {
      checks.push({ type: "warn", msg: `File permissions are ${mode} — consider restricting to 600.` });
      warnings++;
    } else {
      checks.push({ type: "pass", msg: "File permissions are acceptable." });
    }
  } catch {
    // Skip permission check on Windows
    checks.push({ type: "pass", msg: "File permissions check skipped (Windows)." });
  }

  // ── Check: .gitignore ──
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  const gitignoreExists = await fs.pathExists(gitignorePath);
  if (gitignoreExists) {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    const lines = gitignoreContent.split("\n").map((l) => l.trim());
    if (!lines.includes(".env") && !lines.includes(envFilename)) {
      checks.push({ type: "error", msg: `${envFilename} is NOT in .gitignore — secrets may be committed!` });
      issues++;
    } else {
      checks.push({ type: "pass", msg: `${envFilename} is listed in .gitignore.` });
    }
  } else {
    checks.push({ type: "error", msg: ".gitignore not found — secrets may be committed!" });
    issues++;
  }

  // ── Check: .env.example ──
  const examplePath = path.join(process.cwd(), ".env.example");
  if (!(await fs.pathExists(examplePath))) {
    checks.push({ type: "warn", msg: ".env.example not found. Run envman generate to create one." });
    warnings++;
  } else {
    checks.push({ type: "pass", msg: ".env.example exists." });
  }

  // ── Per-variable checks ──
  for (const v of vars) {
    // Duplicate check
    if (keySet.has(v.key)) {
      duplicates.add(v.key);
    }
    keySet.add(v.key);

    // Empty value check
    if (!v.value || v.value.trim() === "") {
      checks.push({ type: "warn", msg: `"${v.key}" is defined but has an empty value.` });
      warnings++;
    }

    // Weak value check
    const valLower = (v.value || "").trim().toLowerCase();
    if (WEAK_VALUES.includes(valLower)) {
      checks.push({ type: "error", msg: `"${v.key}" has a dangerously weak value: "${valLower}".` });
      issues++;
    }

    // Sensitive key without encryption check
    if (isSensitiveKey(v.key) && v.value && !v.value.startsWith("{")) {
      checks.push({ type: "warn", msg: `"${v.key}" appears sensitive but is stored in plaintext.` });
      warnings++;
    }

    // Hardcoded secret in value
    if (v.value && isSensitiveValue(v.value.trim())) {
      checks.push({ type: "warn", msg: `"${v.key}" contains a value that looks like a hardcoded secret.` });
      warnings++;
    }
  }

  // Duplicate key warnings
  for (const dup of duplicates) {
    checks.push({ type: "error", msg: `"${dup}" is defined multiple times.` });
    issues++;
  }

  // ── Check: Backups ──
  const backups = await listBackups(envPath);
  if (backups.length === 0) {
    checks.push({ type: "warn", msg: "No backups found. Backups are created automatically on changes." });
    warnings++;
  } else {
    const latest = backups[0];
    const age = Date.now() - latest.date.getTime();
    const daysOld = Math.floor(age / (1000 * 60 * 60 * 24));
    if (daysOld > 7) {
      checks.push({ type: "warn", msg: `Latest backup is ${daysOld} days old.` });
      warnings++;
    } else {
      checks.push({ type: "pass", msg: `${backups.length} backup(s) found. Latest: ${latest.name}` });
    }
  }

  // ── Print results ──
  console.log(chalk.white.bold("  Results:\n"));

  for (const check of checks) {
    switch (check.type) {
      case "pass":
        console.log(chalk.green(`  ✅ ${check.msg}`));
        break;
      case "warn":
        console.log(chalk.yellow(`  ⚠️  ${check.msg}`));
        break;
      case "error":
        console.log(chalk.red(`  ❌ ${check.msg}`));
        break;
    }
  }

  console.log("");
  console.log(chalk.gray("  ─────────────────────────────────────────"));
  console.log(
    `  Variables: ${chalk.white(vars.length)}  |  ` +
    `Issues: ${issues > 0 ? chalk.red(issues) : chalk.green(0)}  |  ` +
    `Warnings: ${warnings > 0 ? chalk.yellow(warnings) : chalk.green(0)}`
  );
  console.log(chalk.gray("  ─────────────────────────────────────────\n"));

  if (issues === 0 && warnings === 0) {
    console.log(chalk.green.bold("  🎉 Your environment is in perfect health!\n"));
  } else if (issues > 0) {
    console.log(chalk.red.bold("  ⛔ Critical issues found. Please fix them before deploying.\n"));
  } else {
    console.log(chalk.yellow.bold("  ⚡ Some warnings found. Consider addressing them.\n"));
  }
}

module.exports = {
  doctorCommand,
};

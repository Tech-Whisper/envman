const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { isSensitiveValue } = require("../core/security");
const { trackUsage } = require("../core/telemetry");

const TARGET_EXTS = [".js", ".json", ".env", ".ts", ".tsx", ".jsx", ".yml", ".yaml"];
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", "coverage", ".next"];
const IGNORE_FILES = ["package-lock.json", "package.json", "yarn.lock", "pnpm-lock.yaml"];

async function scanDirectory(dir, results, totalFiles) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue;
      await scanDirectory(path.join(dir, entry.name), results, totalFiles);
    } else if (entry.isFile() && !IGNORE_FILES.includes(entry.name)) {
      const ext = path.extname(entry.name).toLowerCase();
      if (TARGET_EXTS.includes(ext) || entry.name === ".env") {
        totalFiles.count++;
        const filePath = path.join(dir, entry.name);
        try {
          const content = await fs.readFile(filePath, "utf-8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Heuristic check to prevent outputting massive minified lines
            if (line.length > 1000) continue;

            // Extract potential string literals or simple values to test
            const potentialValues = line.split(/["'= :]/).map(s => s.trim()).filter(s => s.length > 5);

            for (const val of potentialValues) {
              if (isSensitiveValue(val)) {
                results.push({ file: filePath, line: i + 1, type: "Sensitive Value Match" });
                break; // One match per line is enough
              }
            }
          }
        } catch (err) {
          // ignore read errors
        }
      }
    }
  }
}

async function scanCommand(options) {
  await trackUsage("scan");
  console.log(chalk.cyan("Scanning project files for hardcoded secrets...\n"));
  
  const results = [];
  const totalFiles = { count: 0 };
  
  await scanDirectory(process.cwd(), results, totalFiles);
  
  if (results.length === 0) {
    console.log(chalk.green(`✅ Scan complete. 0 secrets found across ${totalFiles.count} files.`));
  } else {
    console.log(chalk.red(`⚠️  Found ${results.length} potential secret(s) in ${totalFiles.count} files:\n`));
    
    for (const res of results) {
      const relativePath = path.relative(process.cwd(), res.file);
      console.log(`${chalk.yellow(relativePath)}:${res.line} - ${chalk.red(res.type)}`);
    }
    console.log(chalk.gray("\n(Note: Secret values are completely hidden for security.)"));
  }
}

module.exports = {
  scanCommand
};

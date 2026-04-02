/**
 * Backup management with timestamped versions and optional encryption
 */
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { encryptValue } = require("./security");
const logger = require("../utils/logger");

/**
 * Create a timestamped backup of a file
 * @param {string} filePath - Path to the file to backup
 * @param {Object} [options] - Options object
 * @param {Object} [command] - Commander command object
 * @returns {Promise<string|null>} Path to the backup file, or null if skipped
 */
async function createBackup(filePath, options, command) {
  const disableBackup = command && command.optsWithGlobals ? command.optsWithGlobals().noBackup : false;

  if (disableBackup) {
    logger.verbose("Backup skipped (--no-backup flag).");
    return null;
  }

  const exists = await fs.pathExists(filePath);
  if (!exists) {
    logger.verbose(`No file to backup at ${filePath}`);
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(path.dirname(filePath), ".envman-backups");
  const backupFilename = `${path.basename(filePath)}.${timestamp}`;
  const backupPath = path.join(backupDir, backupFilename);

  try {
    await fs.ensureDir(backupDir);
    await fs.copy(filePath, backupPath);
    logger.verbose(`Backup created: ${backupFilename}`);
    console.log(chalk.gray(`  📦 Backup: ${path.relative(process.cwd(), backupPath)}`));
    return backupPath;
  } catch (err) {
    logger.error(`Failed to create backup: ${err.message}`);
    return null;
  }
}

/**
 * Create an encrypted backup of a file
 * @param {string} filePath
 * @param {string} password
 * @returns {Promise<string|null>}
 */
async function createEncryptedBackup(filePath, password) {
  const exists = await fs.pathExists(filePath);
  if (!exists) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(path.dirname(filePath), ".envman-backups");
  const backupFilename = `${path.basename(filePath)}.${timestamp}.enc`;
  const backupPath = path.join(backupDir, backupFilename);

  try {
    await fs.ensureDir(backupDir);
    const content = await fs.readFile(filePath, "utf-8");
    const encrypted = encryptValue(content, password);
    await fs.writeFile(backupPath, encrypted, "utf-8");
    logger.verbose(`Encrypted backup created: ${backupFilename}`);
    return backupPath;
  } catch (err) {
    logger.error(`Failed to create encrypted backup: ${err.message}`);
    return null;
  }
}

/**
 * List all backups for a given file
 * @param {string} filePath
 * @returns {Promise<Array<{ name: string, path: string, date: Date, encrypted: boolean }>>}
 */
async function listBackups(filePath) {
  const backupDir = path.join(path.dirname(filePath), ".envman-backups");
  const basename = path.basename(filePath);

  try {
    const exists = await fs.pathExists(backupDir);
    if (!exists) return [];

    const files = await fs.readdir(backupDir);
    const backups = files
      .filter((f) => f.startsWith(basename + "."))
      .map((f) => {
        const encrypted = f.endsWith(".enc");
        // Extract date from filename
        const dateStr = f.replace(basename + ".", "").replace(".enc", "");
        let date;
        try {
          date = new Date(dateStr.replace(/-/g, (m, offset) => {
            // Reconstruct ISO date from our dashed format
            if (offset <= 9) return "-";
            if (offset === 13 || offset === 16) return ":";
            if (offset === 10) return "T";
            return ".";
          }));
        } catch {
          date = new Date(0);
        }
        return {
          name: f,
          path: path.join(backupDir, f),
          date,
          encrypted,
        };
      })
      .sort((a, b) => b.date - a.date);

    return backups;
  } catch {
    return [];
  }
}

/**
 * Prune old backups, keeping only the most recent N
 * @param {string} filePath
 * @param {number} [keep=10]
 */
async function pruneBackups(filePath, keep = 10) {
  const backups = await listBackups(filePath);
  if (backups.length <= keep) return;

  const toRemove = backups.slice(keep);
  for (const backup of toRemove) {
    try {
      await fs.remove(backup.path);
      logger.verbose(`Pruned old backup: ${backup.name}`);
    } catch {
      // Ignore cleanup errors
    }
  }
}

module.exports = {
  createBackup,
  createEncryptedBackup,
  listBackups,
  pruneBackups,
};

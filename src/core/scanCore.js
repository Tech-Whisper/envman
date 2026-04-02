/**
 * Secret scanning engine with comprehensive pattern detection
 * Detects API keys, JWTs, AWS credentials, private keys, and other secrets
 */

/**
 * Secret patterns with type labels, regex, and severity
 */
const SECRET_PATTERNS = [
  // AWS Keys
  {
    name: "AWS Access Key ID",
    regex: /(?:^|[^A-Za-z0-9/+=])(?:AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA)[A-Z0-9]{16}(?:[^A-Za-z0-9/+=]|$)/,
    severity: "critical",
  },
  {
    name: "AWS Secret Access Key",
    regex: /(?:aws_secret_access_key|aws_secret_key|secret_key)\s*[:=]\s*[A-Za-z0-9/+=]{40}/i,
    severity: "critical",
  },
  // JWT
  {
    name: "JSON Web Token",
    regex: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/,
    severity: "high",
  },
  // Private Keys
  {
    name: "Private Key",
    regex: /-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP)\s+PRIVATE\s+KEY-----/,
    severity: "critical",
  },
  // Generic API Key patterns
  {
    name: "Generic API Key",
    regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/i,
    severity: "high",
  },
  // Generic Secret patterns
  {
    name: "Generic Secret",
    regex: /(?:secret|password|passwd|pwd|token|auth)\s*[:=]\s*['"]?([A-Za-z0-9_\-!@#$%^&*]{8,})['"]?/i,
    severity: "high",
  },
  // Stripe
  {
    name: "Stripe API Key",
    regex: /(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{20,}/,
    severity: "critical",
  },
  // GitHub Token
  {
    name: "GitHub Token",
    regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/,
    severity: "critical",
  },
  // Slack Token
  {
    name: "Slack Token",
    regex: /xox[bpors]-[A-Za-z0-9-]+/,
    severity: "high",
  },
  // Google API Key
  {
    name: "Google API Key",
    regex: /AIza[A-Za-z0-9_\\-]{35}/,
    severity: "high",
  },
  // Twilio
  {
    name: "Twilio API Key",
    regex: /SK[a-f0-9]{32}/,
    severity: "high",
  },
  // SendGrid
  {
    name: "SendGrid API Key",
    regex: /SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}/,
    severity: "high",
  },
  // Database URLs with credentials
  {
    name: "Database Connection String",
    regex: /(?:mongodb|postgres|postgresql|mysql|redis|amqp):\/\/[^\s:]+:[^\s@]+@[^\s]+/i,
    severity: "high",
  },
  // Heroku API Key
  {
    name: "Heroku API Key",
    regex: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    severity: "medium",
  },
  // Base64 encoded secrets (long enough to be meaningful)
  {
    name: "High Entropy String",
    regex: /['"][A-Za-z0-9+/]{64,}={0,2}['"]/,
    severity: "medium",
  },
];

const TARGET_EXTENSIONS = [
  ".js", ".ts", ".jsx", ".tsx", ".json", ".env",
  ".yml", ".yaml", ".toml", ".cfg", ".conf",
  ".py", ".rb", ".go", ".java", ".php",
  ".sh", ".bash", ".zsh",
];

const IGNORE_DIRS = [
  "node_modules", ".git", "dist", "build", "coverage",
  ".next", ".nuxt", ".cache", "__pycache__", "vendor",
  ".venv", "venv", ".tox", ".eggs",
];

const IGNORE_FILES = [
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "composer.lock", "Gemfile.lock", "go.sum",
];

/**
 * Scan a single line for secrets
 * @param {string} line
 * @param {number} lineNumber
 * @param {string} filePath
 * @returns {Array<{ file: string, line: number, type: string, severity: string }>}
 */
function scanLine(line, lineNumber, filePath) {
  const findings = [];

  // Skip very long lines (likely minified/bundled)
  if (line.length > 1000) return findings;

  // Skip comment-only lines
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*")) return findings;

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.regex.test(line)) {
      findings.push({
        file: filePath,
        line: lineNumber,
        type: pattern.name,
        severity: pattern.severity,
      });
      break; // One finding per line is enough
    }
  }

  return findings;
}

/**
 * Scan file content for secrets
 * @param {string} content
 * @param {string} filePath
 * @returns {Array}
 */
function scanContent(content, filePath) {
  const lines = content.split("\n");
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const lineFindings = scanLine(lines[i], i + 1, filePath);
    findings.push(...lineFindings);
  }

  return findings;
}

/**
 * Check if a file should be scanned based on extension
 * @param {string} filename
 * @returns {boolean}
 */
function shouldScanFile(filename) {
  if (IGNORE_FILES.includes(filename)) return false;
  const ext = require("path").extname(filename).toLowerCase();
  return TARGET_EXTENSIONS.includes(ext) || filename === ".env" || filename.startsWith(".env.");
}

/**
 * Check if a directory should be skipped
 * @param {string} dirName
 * @returns {boolean}
 */
function shouldSkipDir(dirName) {
  return IGNORE_DIRS.includes(dirName) || dirName.startsWith(".");
}

/**
 * Get severity color for display
 * @param {string} severity
 * @returns {string}
 */
function getSeverityLabel(severity) {
  switch (severity) {
    case "critical": return "🔴 CRITICAL";
    case "high":     return "🟠 HIGH";
    case "medium":   return "🟡 MEDIUM";
    default:         return "⚪ INFO";
  }
}

module.exports = {
  SECRET_PATTERNS,
  TARGET_EXTENSIONS,
  IGNORE_DIRS,
  IGNORE_FILES,
  scanLine,
  scanContent,
  shouldScanFile,
  shouldSkipDir,
  getSeverityLabel,
};

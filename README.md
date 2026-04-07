# envman

A CLI for safer `.env` workflows.

It helps catch common issues like accidental leaks, missing `.env.example`, and weak configs.

## What it does

- Scan code for possible hardcoded secrets
- Encrypt and decrypt `.env` files locally
- Run health checks on `.env` setup and values
- Generate `.env.example` from `.env`
- Manage environment variables (add, remove, list, sync)
- Backup automatically before making changes

## Installation

```bash
npm install -g @fronik/envman
```

Or run directly:

```bash
npx @fronik/envman
```

## Quick start

```bash
# Set up a new project
envman init

# Check for common issues
envman doctor

# Scan for hardcoded secrets
envman scan

# View variables
envman list

# Add a variable
envman add DATABASE_URL=postgres://localhost/mydb
```

## Commands

| Command | What it does |
|---------|-------------|
| `init` | Set up .env, .env.example, and encryption key |
| `list` | Show all variables (sensitive ones masked by default) |
| `add KEY=value` | Add or update a variable |
| `remove KEY` | Remove a variable |
| `sync --to <path>` | Copy variables to another .env file |
| `check` | Quick security checks on .env setup |
| `doctor` | Health check with suggestions |
| `scan` | Find possible hardcoded secrets in code |
| `encrypt` | Encrypt .env to .env.enc with a password |
| `decrypt` | Decrypt .env.enc back to .env |
| `generate` | Create .env.example from .env |
| `enable-telemetry` | Opt in to anonymous usage stats |

## Options

```bash
envman [command] --safe              # Preview mode — show what would happen
envman [command] -e path/to/.env     # Use a custom .env file
envman [command] --verbose           # More detailed output
envman [command] --no-backup         # Skip automatic backups
```

## Why this exists

I built this after accidentally committing a `.env` file with real credentials. It's designed to catch the most common mistakes before they become problems.

## What this is NOT

- **Not a replacement for dotenv** — it doesn't load env vars into Node. Use `dotenv` for that.
- **Not a production secret manager** — use proper vaults and key management for production.
- **Not guaranteed to find all secrets** — it uses pattern matching, not static analysis.

## Safety notes

- Always add `.env` to `.gitignore` — this tool can't do it for you
- Keep `.envmanrc` secret — it contains your encryption key
- Backups go to `.envman-backups/` — check before deleting them
- Secret scanning is heuristic-based — not every match is a real secret
- Use `--safe` flag to preview changes before applying them

## Contributing

Found a bug? Have a suggestion? Open an issue or PR on [GitHub](https://github.com/Tech-Whisper/envman).

## License

MIT

---

If this tool is useful to you, a star helps.

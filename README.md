# envman

A CLI for managing `.env` files safely.

## What it does

`envman` is a practical tool for working with environment variables in development. It helps you:

- **Encrypt .env files** locally with AES-256
- **Scan code for hardcoded secrets** across your project
- **Run health checks** on .env setup and values
- **Manage variables** (add, remove, list, sync)
- **Backup automatically** before making changes
- **Generate .env.example** from .env (with secrets stripped)

## Why it exists

Environment files often get neglected — keys get hardcoded, `.env` ends up in Git, or critical values get left as placeholders. This tool catches common mistakes before they become problems.

It's built for local development workflows, not as a replacement for dotenv or a production secret manager.

## Installation

```bash
npm install -g @fronik/envman
```

Or use directly:

```bash
npx @fronik/envman
```

## Quick start

```bash
# Set up a new project
envman init

# View all variables
envman list

# Add a variable
envman add DATABASE_URL=postgres://localhost/mydb

# Check your setup
envman doctor

# Scan for exposed secrets
envman scan
```

## Commands

| Command | What it does |
|---------|-----------|
| `init` | Create .env, .env.example, and set up encryption |
| `list` | Show all variables (sensitive ones are masked by default) |
| `add KEY=value` | Add or update a variable |
| `remove KEY` | Remove a variable |
| `sync --to <path>` | Copy variables to another .env file |
| `check` | Quick security checks on .env setup |
| `doctor` | Detailed health check with suggestions |
| `scan` | Find possible hardcoded secrets in code |
| `encrypt` | Encrypt .env to .env.enc with a password |
| `decrypt` | Decrypt .env.enc back to .env |
| `generate` | Create .env.example from .env |
| `enable-telemetry` | Opt in to anonymous usage stats (optional) |

## Global options

```bash
envman [command] --safe              # Preview mode — show what would happen
envman [command] -e path/to/.env     # Use a custom .env file
envman [command] --verbose           # More detailed output
envman [command] --no-backup         # Skip automatic backups
```

## Safety notes

- Always add `.env` to `.gitignore` — this tool can't do it for you
- Keep `.envmanrc` secret — it contains your encryption key
- Backups go to `.envman-backups/` — check before deleting them
- Secret scanning is heuristic-based — not all patterns are secrets
- Use `--safe` flag to preview changes first

## What this is NOT

- **Not a replacement for dotenv** — this doesn't load env vars into Node
- **Not a production secret manager** — it's for local development
- **Not a replacement for proper secrets infrastructure** — use proper vaults for production
- **Not guaranteed to find all secrets** — it uses pattern matching, not static analysis

## Contributing

Found a bug? Have a suggestion? Open an issue or PR on [GitHub](https://github.com/Tech-Whisper/envman).

## License

MIT

---

If this tool is useful to you, a star on GitHub helps a lot.

# envman

A CLI for safer `.env` workflows.

It helps catch common mistakes around `.env` files during development — like accidental leaks, weak configs, or missing `.env.example`.

It does not replace dotenv or Node's built-in env support. It focuses on preventing the kinds of mistakes that still happen around those tools.

---

## Why this exists

I accidentally exposed a secret in a project.

Even with `.gitignore`, things can still go wrong:
- values get logged during debugging  
- secrets get copied into other files  
- `.env` gets committed once and stays in history  
- configs are incomplete or inconsistent  

This tool is a small safety layer for those situations.

---

## What it does

- scan your project for possible secrets  
- check `.env` for common issues (`doctor`)  
- encrypt and decrypt `.env` files  
- generate `.env.example` from `.env`  
- manage variables from the CLI  
- help keep configs consistent across environments  

---

## What it is not

- not a replacement for dotenv  
- not a production secret manager  
- not trying to replace Node's `--env-file`  

It's meant for local development workflows.

---

## Installation

```bash
npm install -g @fronik/envman
```

Or run directly:

```bash
npx @fronik/envman
```

---

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

---

## Commands

| Command | What it does |
|---------|-------------|
| `init` | Set up `.env`, `.env.example`, and encryption key |
| `list` | Show all variables (sensitive ones masked by default) |
| `add KEY=value` | Add or update a variable |
| `remove KEY` | Remove a variable |
| `sync --to <path>` | Copy variables to another `.env` file |
| `check` | Quick checks on `.env` setup |
| `doctor` | Health check with suggestions |
| `scan` | Find possible hardcoded secrets in code |
| `encrypt` | Encrypt `.env` to `.env.enc` with a password |
| `decrypt` | Decrypt `.env.enc` back to `.env` |
| `generate` | Create `.env.example` from `.env` |
| `enable-telemetry` | Opt in to anonymous usage stats |

---

## Options

```bash
envman [command] --safe              # Preview mode — show what would happen
envman [command] -e path/to/.env     # Use a custom .env file
envman [command] --verbose           # More detailed output
envman [command] --no-backup         # Skip automatic backups
```

---

## Safety notes

- Always add `.env` to `.gitignore` — this tool can't do it for you
- Keep `.envmanrc` secret — it contains your encryption key
- Backups go to `.envman-backups/` — check before deleting them
- Secret scanning is pattern-based — not every match is a real secret
- Use `--safe` flag to preview changes before applying them

---

## Contributing

Found a bug? Have an idea? Open an issue or PR on [GitHub](https://github.com/Tech-Whisper/envman).

## License

MIT

---

If this tool is useful, a star helps.

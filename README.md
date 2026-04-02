# envman 🛡️
> A SECURITY-FIRST ENVIRONMENT MANAGEMENT SYSTEM

[![npm version](https://img.shields.io/npm/v/envman.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

`envman` is an elite configuration manager and CLI tool engineered for zero-trust environments. Unlike `dotenv` or `env-cmd`, `envman` is hyper-focused on **project security, environment file integrity, and proactive config monitoring**.

## 🔥 Core Features

- **Advanced Masking (Value-Heuristic)**: Detects not only sensitive keywords (like `SECRET` or `API_KEY`), but intelligently scans values to find leaked AWS Keys, JWTs, and RSA Private Keys. It utilizes partial-reveal string masking (`se****23`).
- **AES-256 Offline Encryption**: Need to freeze your configs locally? `envman encrypt` locks your files behind AES-256 standard encryption (`.env.enc`), requiring an interactive, non-logging password execution.
- **Deep Project Scanner**: Have a teammate who hard-coded an API key? `envman scan` recursively parses your `.js`, `.json`, and `.env` files for embedded secrets and returns surgical diagnostics.
- **Environment Doctor (`envman doctor`)**: Catch duplicates, empty keys, and dangerously weak passwords (`admin`, `123456`) instantly.
- **Auto-Backups**: Mutating your `.env`? A timestamped backup (`.env.backup.16...`) is generated silently before *any* destructive CLI execution.
- **Safe Mode**: Test sync outputs via `--safe` without risking accidental damage.
- **Smart Diff Syncing**: Visualize `.env` propagations cleanly with `+`, `~`, `-` mapping.

## 🚀 Quick Start

```bash
npm install -g @fronik/envman

# Bootstrap a fresh environment scaffolding securely
envman init
```

## 🛠️ Commands

| Command | Action |
| --- | --- |
| `envman init` | Generate pristine `.env` and `.env.example` templates |
| `envman add <KEY=value>` | Safely append or modify an environment variable |
| `envman remove <KEY>` | Strip an environment variable safely |
| `envman list` | List configuration safely (with automatic secret obscuring) |
| `envman doctor` | Deep health-check your environments (weak pass, dups, blanks) |
| `envman scan` | Audit your ENTIRE project codebase for leaked secrets |
| `envman encrypt` | Interactive AES-256 encryption lock for your `.env` files |
| `envman decrypt` | Safely restore `.env` configurations via password verification |
| `envman sync --to <path>` | Smart synchronize properties to another directory / project |
| `envman check` | Audit `.gitignore` protocols |
| `envman generate` | Safely create a templated `.env.example` from existing config |

## 🔗 Global Options

- `-e, --env-file <path>`: Target alternate files (`-e .env.production`)
- `--safe`: Run any command in a dry-run/preview execution context.
- `--no-backup`: Skip timestamp backups before mutations.

## ⚔️ envman vs dotenv / env-cmd

| Capability | dotenv / env-cmd | envman |
| --- | --- | --- |
| Load capabilities | Yes | CLI management |
| Value-based masking | No | Yes (AWS, JWT, RSA) |
| File Encryption | No | AES-256 Interactive |
| Codebase Scanning | No | Deep recursive secret scanning |
| Doctor Analysis | No | Syntax + Weak Password Checks |
| Auto-backups | No | Yes |

## 🛡️ Security Principles

1. **Zero Secret Logging**: Your keys are never printed back to your bash profile or STDOUT in full form.
2. **Zero In-Memory Keys**: Passwords required for AES encryption are streamed securely and flushed.
3. **Opt-in Telemetry**: Usage events are `0%` until you explicitly invoke `envman enable-telemetry`. Nothing invasive—ever.

---
**Prepared for production. Ready for you.**

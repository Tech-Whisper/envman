# envman

> Secure CLI tool for managing `.env` files locally.

[![npm version](https://img.shields.io/npm/v/envman.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![Downloads](https://img.shields.io/npm/dm/envman.svg)]()

## Why envman?

Standard dotenv tools just load variables. **envman** helps you **manage** them safely:

- **Secret masking** — sensitive values hidden by default
- **Cross-project sync** — copy env vars between projects with `--dry-run` preview
- **Security checks** — detect exposed keys, missing `.gitignore` entries
- **CRLF-safe** — works correctly on Windows and Unix
- **Zero dependencies at runtime** beyond core utilities

## Install

```bash
npm install -g envman
```

## Usage

### List variables

```bash
envman list              # sensitive values shown as ******
envman list --show-values # reveal all values
```

### Add or update

```bash
envman add DATABASE_URL=postgres://localhost/db
envman add API_KEY=sk-123  # prompts if key exists
```

### Remove

```bash
envman remove API_KEY
```

### Sync between projects

```bash
envman sync --to ../other-project          # preview + add only
envman sync --to ../other-project --overwrite  # replace existing
envman sync --to ../other-project --dry-run    # preview only
```

### Security check

```bash
envman check
# Checks:
# - .env listed in .gitignore
# - Sensitive key names detected
# - .env.example exists
```

## Features

| Feature | Description |
|---------|-------------|
| Secret masking | API_KEY, SECRET, TOKEN, PASSWORD, PRIVATE hidden by default |
| CRLF handling | Automatic normalization on Windows |
| Inline comments | Stripped for unquoted values, preserved in quotes |
| Duplicate handling | Replaces ALL matching keys, not just the first |
| Dry-run sync | Preview changes before writing |
| File integrity | Comments, blank lines, and order always preserved |

## License

MIT

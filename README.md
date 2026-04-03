# 🛡️ Envman — Secure Environment Manager

<p align="center">
  <img src="https://img.shields.io/npm/v/@fronik/envman?style=for-the-badge" />
  <img src="https://img.shields.io/npm/dt/@fronik/envman?style=for-the-badge" />
  <img src="https://img.shields.io/github/license/Tech-Whisper/envman?style=for-the-badge" />
  <img src="https://img.shields.io/github/stars/Tech-Whisper/envman?style=for-the-badge" />
</p>

<p align="center">
  <b>🔐 Secure • ⚡ Fast • 🧠 Smart Env Management CLI</b>
</p>

> A modern CLI to manage `.env` files with encryption, secret scanning, backups, and health checks.

---

## 🚀 Overview

Envman is a security-first CLI tool for managing `.env` files safely and efficiently.

It helps developers:
- 🔐 encrypt sensitive environment variables
- 🔍 detect exposed secrets before they leak
- 🩺 run health checks on `.env` setups
- 📦 create backups before changes
- 📄 generate `.env.example` files for safer sharing

---

## ✨ Features

- AES-256 encryption for `.env` files
- Secret scanning for API keys, tokens, and credentials
- Doctor command for environment validation
- Automatic backups before edits
- `.env.example` generation
- Interactive CLI mode
- Clean and developer-friendly workflow

---

## 🤔 Why Envman?

Managing `.env` files is usually:
- insecure
- messy
- hard to maintain
- easy to break

Envman solves this by giving you a clean workflow for security and environment management in one CLI.

---

## 📦 Installation

Install globally:

```bash
npm install -g @fronik/envman
```

Or use with npx (no install required):

```bash
npx @fronik/envman
```

---

## 📸 Screenshots

<img src="docs/init.png" width="800" />

<img src="docs/list.png" width="800" />

<img src="docs/encrypt.png" width="800" />

---

## ⚡ Quick Start

```bash
envman init
envman list
envman encrypt
envman doctor
```

---

## 📚 Commands

| Command | Description |
|---------|-------------|
| `envman init` | Initialize envman in your project |
| `envman list` | List all managed environment files |
| `envman encrypt` | Encrypt a `.env` file |
| `envman decrypt` | Decrypt an encrypted file |
| `envman doctor` | Run health checks on your setup |
| `envman scan` | Scan for exposed secrets |
| `envman backup` | Create a backup of your env files |
| `envman generate` | Generate a `.env.example` file |

---

## 🔒 Security

All encryption uses AES-256-GCM for maximum security. Secrets are never stored in plain text and all operations happen locally on your machine.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ for developers who care about security
</p>

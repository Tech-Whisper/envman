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

## 🔥 Feature Highlights

- **AES-256-GCM Encryption** — Military-grade encryption for your sensitive variables
- **Secret Scanner** — Detect exposed API keys and tokens before they leak
- **Health Diagnostics** — Doctor command validates your environment setup
- **Automatic Backups** — Every change is backed up before execution
- **`.env.example` Generator** — Share templates safely without exposing secrets
- **Cross-Platform** — Works seamlessly on macOS, Linux, and Windows

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

## 🎯 Use Cases

| Scenario | How Envman Helps |
|----------|------------------|
| **Multiple Environments** | Dev, staging, production — switch configs with one command |
| **Team Collaboration** | Share `.env.example` without exposing secrets |
| **Security Audits** | Scan for leaked credentials in your codebase |
| **CI/CD Pipelines** | Validate environment health before deployments |
| **Legacy Projects** | Gradually secure messy `.env` files with backups |

---

## 🚀 Quick Start

```bash
envman init
envman list
envman encrypt
envman doctor
```

---

## 📸 Screenshots

<img src="docs/init.png" width="800" />

<img src="docs/list.png" width="800" />

<img src="docs/encrypt.png" width="800" />

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

## 🧪 Testing

```bash
npm test
```

Tests run with Jest and include coverage reports.

---

## 🎯 Project Goals

1. **Security First** — Every feature is designed to protect sensitive data
2. **Zero Surprises** — Automatic backups before any destructive operation
3. **Developer Experience** — Clean CLI with helpful feedback and validation
4. **Reliability** — Battle-tested with comprehensive test coverage

---

## 🔒 Security

All encryption uses **AES-256-GCM** for maximum security. Secrets are never stored in plain text and all operations happen locally on your machine.

For vulnerability reports, please open a private security advisory on GitHub.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## ⭐ Show Your Support

If Envman helps you manage environments more securely, give it a ⭐ — it helps the project grow and reach more developers who care about security.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ for developers who care about security
</p>

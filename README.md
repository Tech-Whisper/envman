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

## ⚡ Why Developers Use Envman

Stop wrestling with messy `.env` files. Envman gives you a clean, secure workflow for managing environment variables.

- Centralized management across all your projects
- Never accidentally commit secrets to version control
- Validate environment setup before deployments
- Share templates with your team safely

---

## 💡 Problem vs Solution

| Problem | Solution |
|---------|----------|
| `.env` files scattered everywhere | Centralized management with `envman list` |
| Fear of committing secrets | AES-256 encryption + secret scanning |
| No backup before changes | Automatic backups before every operation |
| Unclear if env setup is correct | `envman doctor` validates everything |
| Can't share configs safely | `.env.example` generation |

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

## 🚀 Quick 10-Second Start

```bash
envman init
envman list
envman encrypt
envman doctor
```

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

## 🎯 Project Goals

1. **Security First** — Every feature is designed to protect sensitive data
2. **Zero Surprises** — Automatic backups before any destructive operation
3. **Developer Experience** — Clean CLI with helpful feedback and validation
4. **Reliability** — Battle-tested with comprehensive test coverage

---

## 🧪 Testing

```bash
npm test
```

Tests run with Jest and include coverage reports.

---

## 🗺️ Roadmap

Upcoming features planned for future releases:

- Interactive demo mode with animated GIF
- Environment validation schema support
- Import/export configurations across projects
- Enhanced CI/CD integration coverage
- Extended secret detection patterns

---

## 🔒 Why Trust Envman

- **No Cloud Dependency** — Everything runs locally on your machine
- **Local-Only Processing** — Your secrets never leave your environment
- **Encryption-First Design** — Security is built into every feature
- **Open-Source Transparency** — Audit the code yourself

---

## 👥 Built For

- **Backend Developers** — Manage complex environment configurations
- **API Developers** — Handle multiple API keys and endpoints securely
- **Security-Focused Teams** — Scan, encrypt, and validate with confidence

---

## 📌 Project Stability

- **Tested CLI** — Comprehensive test suite with Jest
- **Stable Commands** — All commands are battle-tested and versioned
- **Secure Handling** — No secrets stored in plain text

---

## 🔒 Security

All encryption uses **AES-256-GCM**. Secrets are never stored in plain text and all operations happen locally.

For vulnerability reports, please open a private security advisory on GitHub.

---

## ⚠️ README Maintenance Notes

- Screenshot images must remain in the `docs/` folder
- Image filenames must stay lowercase: `init.png`, `list.png`, `encrypt.png`
- The Installation section uses fenced code blocks — do not modify the markdown structure
- All code blocks must be properly closed with triple backticks

---

## 🤝 Contributing & Feedback

Found a bug? Have a feature request? Contributions and feedback are welcome — open an issue or submit a pull request.

---

## ⭐ Show Your Support

If Envman helps you manage environments more securely, give it a ⭐ — it helps the project grow and reach more developers.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ for developers who care about security
</p>

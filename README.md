# 🛡️ Envman — Secure Environment Manager

> A modern CLI tool to manage `.env` files with encryption, secret scanning, and automated health checks.

<p align="center">
  <img src="docs/init.png" width="800"/>
</p>

---

## 🚀 Features

* 🔐 AES-256 encryption for `.env` files
* 🔍 Detect exposed secrets (API keys, JWTs, DB URLs)
* 🩺 Doctor command for environment health checks
* 📦 Automatic backups before every change
* 📄 Generate `.env.example` safely
* 📋 Interactive CLI mode
* ⚡ Fast, lightweight, and developer-friendly

---

## 📦 Installation

```bash
npm install -g @fronik/envman
```

Or use without installing:

```bash
npx @fronik/envman
```

---

## ⚡ Quick Start

### Initialize project

```bash
envman init
```

---

### Add variables

```bash
envman add DB_PASSWORD=mySecretPass
```

---

### List variables

```bash
envman list
```

<p align="center">
  <img src="docs/list.png" width="800"/>
</p>

---

### Scan for secrets

```bash
envman scan
```

---

### Run doctor check

```bash
envman doctor
```

---

### Encrypt `.env`

```bash
envman encrypt
```

<p align="center">
  <img src="docs/encrypt.png" width="800"/>
</p>

---

### Decrypt `.env`

```bash
envman decrypt
```

---

### Generate `.env.example`

```bash
envman generate
```

---

## 📸 Demo

<p align="center">
  <img src="docs/demo.gif" width="800"/>
</p>

---

## 📂 Project Structure

```
envman/
├── bin/
├── src/
│   ├── commands/
│   ├── core/
│   └── utils/
├── docs/
├── test/
├── package.json
└── README.md
```

---

## 🔐 Security

* AES-256-CBC encryption
* Secure key storage via `.envmanrc`
* Prevents accidental exposure of secrets
* Automatic backup system

---

## 🧪 Testing

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📜 License

MIT License

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🐛 Report issues
* 🚀 Share with developers

---

<p align="center">
  Built with ❤️ by <b>Fronik</b>
</p>

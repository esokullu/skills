# JEP Guard for OpenClaw

JEP Guard adds a **responsibility layer** to your Clawbot. Every action becomes traceable, every risky operation needs your approval.

## ✨ Features

- **🛡️ High-risk command protection** - Delete/rm commands require your confirmation
- **📝 Audit log** - Every action recorded with cryptographic proof
- **🔍 One-click export** - Export evidence when something goes wrong
- **👮 Developer accountability** - Track who built the skills you install

## 📦 Installation

```bash
claw install jep-guard
```

Or install via ClawHub: [clawhub.ai/skills/jep-guard](https://clawhub.ai/skills/jep-guard)

## 🚀 Quick Start

Once installed, JEP Guard works automatically:

1. Try to delete a file: `rm important.doc`
2. JEP Guard will pop up: "⚠️ This is a high-risk operation. Allow once?"
3. Click "Allow" to proceed, or "Deny" to cancel

## 🔐 How it works

JEP Guard uses the JEP (Judgment Event Protocol) to create verifiable receipts for every action. These receipts can be exported and used as evidence if something goes wrong.

## 📄 Export audit log

```bash
claw run jep-guard export > receipts.json
```

## 🐛 Report issues

https://github.com/jep-eth/jep-claw-integration/issues

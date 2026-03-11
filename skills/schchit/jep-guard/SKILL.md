# JEP Guard

JEP Guard adds a responsibility layer to your Clawbot - prevent accidental deletions, trace every action with JEP receipts.

## Features

- 🛡️ High-risk command interception (rm, mv, cp, etc.)
- ✅ User confirmation dialog before dangerous operations
- 🔐 Temporary authorization token (5-minute expiry)
- 📝 Audit log with JEP Receipt generation
- 🔍 Export audit logs with `claw run jep-guard export`
- ⚙️ Configurable settings with `claw run jep-guard config`
- 🚀 Auto-approve frequently used commands

## Installation

```bash
claw install jep-guard
```

## Usage

Once installed, JEP Guard automatically intercepts high-risk commands:

1. Try to delete a file: `rm important.doc`
2. A dialog will ask for confirmation
3. Choose "Allow Once" or "Always Allow"

## Configuration

```bash
# View current config
claw run jep-guard config

# Toggle protection on/off
claw run jep-guard config toggle

# Export audit logs
claw run jep-guard export
```

## License

MIT-0
```

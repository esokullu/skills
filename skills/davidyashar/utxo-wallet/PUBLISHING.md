# Publishing UTXO Wallet Skill to ClawHub

## Prerequisites

- Node.js installed
- The skill folder ready at `agent-workspace/skills/utxo_wallet/`

## Step 1: Login to ClawHub (one-time)

```bash
npx clawhub login
```

This opens a browser for authentication. Your token is stored locally for future commands.

To verify you're logged in:

```bash
npx clawhub whoami
```

## Step 2: Publish the Skill

```bash
npx clawhub publish agent-workspace/skills/utxo_wallet \
  --slug utxo-wallet \
  --name "UTXO Wallet" \
  --version 1.1.0 \
  --changelog "Pre-compiled JS (no npx tsx needed), declared runtime/env/files metadata, added Security Considerations section"
```

### What gets published

```
utxo_wallet/
  SKILL.md                        ← Agent instructions (endpoints, flows, security rules)
  scripts/
    wallet-connect.ts             ← TypeScript source (for audit/verification)
    wallet-connect.js             ← Pre-compiled JS (what agents actually run)
    api-call.ts                   ← TypeScript source (for audit/verification)
    api-call.js                   ← Pre-compiled JS (what agents actually run)
```

## Step 3: Verify It's Live

```bash
npx clawhub inspect utxo-wallet
```

## Updating the Skill

When you make changes, bump the version and re-publish:

```bash
npx clawhub publish agent-workspace/skills/utxo_wallet \
  --slug utxo-wallet \
  --version 1.2.0 \
  --changelog "Description of changes"
```

Or use `sync` to auto-detect and publish changes:

```bash
npx clawhub sync
```

## How Users Install It

```bash
npx clawhub install utxo-wallet
```

This downloads `SKILL.md` + `scripts/wallet-connect.js` + `scripts/api-call.js` (and the `.ts` source files) into their workspace's `skills/utxo_wallet/` directory.

### Users update with:

```bash
npx clawhub update utxo-wallet
```

### Users can search for it:

```bash
npx clawhub search utxo
```

## What the User Needs After Installing

1. A `.wallet.json` + `.wallet.key` file pair in their `agent-workspace/` directory (created automatically by `wallet-connect.js --provision`)
2. Node.js >= 18 installed (no other dependencies needed — scripts are pre-compiled JS)
3. The `UTXO_API_BASE_URL` environment variable set (e.g., `https://utxo.fun` for mainnet)
4. Tell their OpenClaw agent: "Connect to UTXO" — the agent reads SKILL.md and runs the script

## ClawHub CLI Reference

| Command | Description |
|---------|-------------|
| `npx clawhub login` | Authenticate (opens browser) |
| `npx clawhub whoami` | Verify token |
| `npx clawhub publish <path>` | Publish a skill folder |
| `npx clawhub install <slug>` | Install a skill |
| `npx clawhub update [slug]` | Update installed skills |
| `npx clawhub uninstall <slug>` | Remove a skill |
| `npx clawhub search <query>` | Search skills |
| `npx clawhub explore` | Browse latest skills |
| `npx clawhub inspect <slug>` | View skill metadata |
| `npx clawhub list` | List installed skills |
| `npx clawhub sync` | Auto-publish new/updated local skills |

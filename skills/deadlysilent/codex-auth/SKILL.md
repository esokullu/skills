---
name: codex-auth
description: Manual Telegram slash-style command to start/finish OpenAI Codex OAuth profile auth refresh. Use for /codex_auth, /codex_auth <profile>, or callback URL paste handling.
---

Run `scripts/codex_auth.py` to generate a login URL and apply callback URL tokens to `auth-profiles.json`.

## Commands
- `/codex_auth` → selector (discovered profiles)
- `/codex_auth <profile>`
- `/codex_auth finish <profile> <callback_url>`

## How to run
Start flow:

```bash
python3 skills/codex-auth/scripts/codex_auth.py start --profile default
```

Finish flow (after browser redirect URL is pasted):

```bash
python3 skills/codex-auth/scripts/codex_auth.py finish --profile default --callback-url "http://localhost:1455/auth/callback?code=...&state=..."
```

Queue safe apply (stops/restarts gateway in background):

```bash
python3 skills/codex-auth/scripts/codex_auth.py finish --profile default --callback-url "http://localhost:1455/auth/callback?code=...&state=..." --queue-apply
python3 skills/codex-auth/scripts/codex_auth.py status
```

## Notes
- Uses the same OpenAI Codex OAuth constants/method as OpenClaw onboarding (`auth.openai.com` + localhost callback).
- Writes `~/.openclaw/agents/main/agent/auth-profiles.json` with file locking to reduce race risk while gateway is running.
- Profile IDs map as:
  - `default` -> `openai-codex:default` (or first discovered codex profile if default missing)
  - any other selector -> `openai-codex:<selector>`
- Pending auth state is stored in `/tmp/openclaw/codex-auth-pending.json`.

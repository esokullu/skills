---
name: crazyrouter-video-gen
description: AI video generation via Crazyrouter API. Supports Sora 2, Kling V2, Veo 3, Seedance, Pika, MiniMax Hailuo, Runway. Text-to-video generation. Use when user asks to generate, create, or make a video.
---

# Video Generation via Crazyrouter

Generate videos from text prompts using [Crazyrouter](https://crazyrouter.com) — one API key, multiple video AI models.

## Supported Models

| Model | ID | Description |
|-------|-----|-------------|
| Sora 2 | `sora-2` | OpenAI's video model |
| Kling V2 | `kling-v2-1` | Kuaishou's cinematic model |
| Veo 3 | `veo3` | Google's video model |
| Seedance 1.5 Pro | `doubao-seedance-1-5-pro_720p` | ByteDance |
| Pika 1.5 | `pika-1.5` | Creative video |
| MiniMax Hailuo 2.3 | `MiniMax-Hailuo-2.3` | MiniMax |
| Runway VIP | `runway-vip-video` | Professional synthesis |

## Script Directory

**Agent Execution**:
1. `SKILL_DIR` = this SKILL.md file's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

## Step 0: Check API Key ⛔ BLOCKING

```bash
echo "${CRAZYROUTER_API_KEY:-not_set}"
```

## Usage

```bash
# Generate with default model (sora-2)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat playing piano" --output cat.mp4

# With Kling V2
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Ocean waves at sunset" --output waves.mp4 --model kling-v2-1

# With Veo 3
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Timelapse of city traffic" --output city.mp4 --model veo3
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--prompt <text>` | Video description (required) | — |
| `--output <path>` | Output file path (required) | — |
| `--model <id>` | Model to use | `sora-2` |

**Note**: Video generation is async — it may take 30-120 seconds depending on model. The script will poll until complete.

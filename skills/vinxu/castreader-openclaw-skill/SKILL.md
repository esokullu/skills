---
name: castreader
description: >
  Read any web page aloud with natural AI voices. Extract article text from any URL
  and convert it to audio (MP3). Use when the user wants to:
  listen to a webpage, read an article aloud, convert URL to audio,
  text-to-speech for a link, read this page to me, listen to this article.
version: 1.7.0
metadata:
  openclaw:
    emoji: "🔊"
    requires:
      anyBins: ["node"]
    os: ["darwin", "linux", "win32"]
    homepage: https://castreader.ai/openclaw
---

# CastReader — Read Any Web Page Aloud

## There is only ONE command

```
node scripts/read-url.js <url> [paragraph-index]
```

- `paragraph-index=0`: **Extract only** — returns article info + all paragraph texts, NO audio generated
- `paragraph-index=1+`: Extract (cached) + generate audio for that one paragraph
- Default is 1 if omitted

## Two-phase interaction flow

### Phase 1: Extract + Show Info (index=0, NO audio)

When a user sends a URL, run extract-only first:

```
node scripts/read-url.js <url> 0
```

Output:
```json
{
  "title": "Article Title",
  "language": "en",
  "totalParagraphs": 12,
  "totalCharacters": 2450,
  "paragraphs": ["First paragraph...", "Second...", ...],
  "current": null,
  "hasNext": true
}
```

Then send a summary message:
```
📖 {title}
🌐 {language} · 📝 {totalParagraphs} paragraphs · 📊 {totalCharacters} chars
⏱️ Estimated reading time: ~{Math.ceil(totalCharacters / 600)} min

📋 Summary:
{Use the paragraphs array to write a 2-3 sentence summary of the article}

How would you like to listen?
```

Offer two buttons/options:
- **🔊 Read Full ({totalParagraphs} paragraphs)**
- **📝 Summary Only**

**DO NOT generate any audio in Phase 1.** Wait for user choice.

### Phase 2a: Read Full (user chose "Read Full")

Generate paragraphs one at a time. Estimate generation time: `~{Math.ceil(paragraph_char_count / 100 * 3)} seconds`.

```
node scripts/read-url.js <url> 1
```

Send the audio file with caption: `[1/{totalParagraphs}] {current.text}`

Offer buttons:
- **⏭ Next (2/{totalParagraphs})**
- **⏹ Stop**

On last paragraph (hasNext=false), do NOT show Next button. Instead show:
```
✅ All done! {totalParagraphs} paragraphs read.
```

### Phase 2b: Summary Only (user chose "Summary Only")

1. Compose a summary text (3-5 sentences) from the paragraphs array
2. Generate audio for the summary text using a temporary approach:
   - Write the summary to a temp paragraph and use the TTS command pattern
   - Or simply tell the user the summary in text (no audio needed for summary)
3. Send: `✅ Summary read complete.`

## CRITICAL: Delete previous audio before sending next

**Telegram auto-play problem**: Telegram automatically plays the next audio message in chat after one finishes. If multiple audio messages exist, playback order becomes chaotic.

**Solution**: Always keep only ONE audio message in the chat.

1. When sending paragraph 1 audio, remember its `message_id`
2. When user clicks Next → **DELETE the previous audio message first** (using deleteMessage), then generate and send the next paragraph
3. When user clicks Stop → delete the current audio message, send a text-only completion message

**This is the most important rule. If you forget to delete, the user will hear paragraphs in wrong order.**

## Important rules

- Generate ONE paragraph at a time. Never loop through all paragraphs.
- WAIT for user to request next before generating.
- ALWAYS run index=0 first to show info. Do NOT skip to index=1.
- Do NOT use built-in TTS tools. ONLY use `read-url.js`.
- Do NOT use web_fetch to get article text. ONLY use `read-url.js`.
- DELETE previous audio message before sending each new audio.

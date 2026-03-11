---
name: colors-cc
description: A native UI asset and color toolset for OpenClaw and other AI Agents. Generate SVG placeholders, theme-based palettes, and perform color conversions without hallucination.
acceptLicenseTerms: true
metadata:
  {
    "openclaw": {
      "author": "NFish"
    }
  }
---

# SKILL: ColorsCC

A high-performance, stateless Color API and toolset optimized for AI Agents.

## 🚀 Usage Rules for Agents
- **Inline Images**: Always embed SVG placeholders directly using `<img>` or Markdown `![alt](url)`.
- **URL Encoding**: The `#` character must be encoded as `%23` (e.g., `start=%23FF003C`).
- **No Fetching**: Do not attempt to download binary image data; let the user's client render the URL.

## 🛠 Capabilities

### 1. SVG Gradient Placeholders
Generate dynamic, lightweight placeholders for UI mockups.
- **Endpoint**: `https://colors-cc.top/api/placeholder`
- **Params**: `w` (width), `h` (height), `text`, `start` (hex), `end` (hex).
- **Example**: `<img src="https://colors-cc.top/api/placeholder?w=1200&h=630&text=Hero+Banner&start=%23FF003C&end=%2300B8FF">`

### 2. Random Colors
Get a random HEX and RGB color with generation timestamp.
- **Endpoint**: `GET https://colors-cc.top/api/random`

### 3. Curated Theme Palettes
Fetch high-quality color sets for design inspiration.
- **Themes**: `cyberpunk`, `vaporwave`, `retro`, `monochrome`.
- **Endpoint**: `GET https://colors-cc.top/api/palette?theme=cyberpunk`

### 4. Universal Color Converter
Stateless conversion between HEX, RGB, HSL, and CMYK.
- **Endpoint**: `GET https://colors-cc.top/api/convert?hex=%23FF003C` (supports `rgb`, `hsl`, `cmyk` as input).

### 5. CSS Color Names Directory
Mapping of standard HTML/CSS color names to their HEX values.
- **Endpoint**: `GET https://colors-cc.top/api/all-names`

## 🤖 AI Context (LLM Integration)
Agents can find full machine-readable documentation at:
- `https://colors-cc.top/llms.txt`
- `https://colors-cc.top/openapi.json`


# SKILL: ColorsCC

A high-performance, stateless Color API and toolset optimized for AI Agents.

## 🚀 Usage Rules for Agents
- **Inline Images**: Always embed SVG placeholders directly using `<img>` or Markdown `![alt](url)`.
- **URL Encoding**: The `#` character must be encoded as `%23` (e.g., `start=%23FF003C`).
- **No Fetching**: Do not attempt to download binary image data; let the user's client render the URL.

## 🛠 Capabilities

### 1. SVG Gradient Placeholders
Generate dynamic, lightweight placeholders for UI mockups.
- **Endpoint**: `https://colors-cc.top/api/placeholder`
- **Params**: `w` (width), `h` (height), `text`, `start` (hex), `end` (hex).
- **Example**: `<img src="https://colors-cc.top/api/placeholder?w=1200&h=630&text=Hero+Banner&start=%23FF003C&end=%2300B8FF">`

### 2. Random Colors
Get a random HEX and RGB color with generation timestamp.
- **Endpoint**: `GET https://colors-cc.top/api/random`

### 3. Curated Theme Palettes
Fetch high-quality color sets for design inspiration.
- **Themes**: `cyberpunk`, `vaporwave`, `retro`, `monochrome`.
- **Endpoint**: `GET https://colors-cc.top/api/palette?theme=cyberpunk`

### 4. Universal Color Converter
Stateless conversion between HEX, RGB, HSL, and CMYK.
- **Endpoint**: `GET https://colors-cc.top/api/convert?hex=%23FF003C` (supports `rgb`, `hsl`, `cmyk` as input).

### 5. CSS Color Names Directory
Mapping of standard HTML/CSS color names to their HEX values.
- **Endpoint**: `GET https://colors-cc.top/api/all-names`

## 🤖 AI Context (LLM Integration)
Agents can find full machine-readable documentation at:
- `https://colors-cc.top/llms.txt`
- `https://colors-cc.top/openapi.json`

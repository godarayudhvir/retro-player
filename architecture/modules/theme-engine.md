# Multi-Theme Engine Specification

## 1. Description
The **Multi-Theme Engine** provides a dynamic, instant visual skinning system for Retro Player. It allows players to seamlessly toggle between four distinct UI aesthetic styles inspired by iconic gaming ecosystems: **iiSU Light (Default)**, **Midnight Cyber (Dark Mode)**, **Sony XMB Wave (PlayStation Dashboard)**, and **Game Boy DMG Classic (Olive-Green Matrix)**. The active theme is persisted in `localStorage` and automatically synchronized to the root DOM document via `data-theme` attributes and CSS design tokens.

---

## 2. Detailed List of What It Does
- **4 Distinct Visual Themes**:
  - ☀️ **iiSU Light**: Crisp porcelain white cards (`#ffffff`), subtle dot matrix canvas (`#cbd5e1`), Nintendo red and blue accents.
  - 🌙 **Midnight Cyber**: Deep obsidian slate (`#090d16`), dark slate cards (`#0f172a`), neon cyan (`#06b6d4`) and magenta glow effects.
  - 🌊 **Sony XMB Wave**: Deep dark navy (`#070a14`), sleek horizontal glass ribbons, glowing electric blue highlights (`#38bdf8`), and an ambient animated wave gradient background.
  - 📟 **Game Boy DMG Classic**: Authentic monochromatic olive-green dot matrix styling (`#8b956d`, `#9bbc0f`, `#0f380f`, `#306230`), chunky pixelated borders and retro LCD styling.
- **Topbar Theme Selector Control**: Interactive theme pill in the top console status bar displaying current theme icon, short name, and tooltip.
- **Keyboard & Gamepad Hotkeys**: Pressing `T` on keyboard instantly cycles through available themes with a futuristic frequency sweep sound effect.
- **Instant Persistence**: Selected theme is saved to `localStorage` under `retro_player_theme` and applied immediately on next session load.
- **CSS Custom Property Scope**: All design tokens (`--bg-iisu`, `--bg-dots`, `--panel-bg`, `--tile-bg`, `--text-main`, `--poke-red`, etc.) adjust reactively without requiring DOM re-renders.

---

## 3. Detailed Logic Behind Everything and How It Works
- **Custom Hook ([useThemeEngine.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useThemeEngine.js))**:
  - Initializes state from `localStorage.getItem('retro_player_theme')` (defaulting to `'iisu'`).
  - Sets `data-theme` attribute on `document.documentElement` inside a `useEffect` hook.
  - Exposes `theme`, `currentThemeMeta`, `availableThemes`, `setTheme(key)`, and `cycleTheme()`.
- **CSS Design Tokens ([index.css](file:///Users/godarayudhvir/Github/retro-player/src/index.css))**:
  - Scoped via attribute selectors `html[data-theme="midnight"]`, `html[data-theme="xmb"]`, and `html[data-theme="dmg"]`.
  - Overrides background gradients, panel glassmorphism, status pill borders, cartridge tile colors, and modal overlays.
- **Audio Feedback ([useWebAudioSfx.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useWebAudioSfx.js))**:
  - Invokes `playThemeSwitch()` synthesized frequency sweep on each theme toggle.

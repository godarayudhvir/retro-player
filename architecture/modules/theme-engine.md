# Theme Engine Specification

## 1. Description
The **Theme Engine** provides the visual skinning system for Retro Player, standardizing on the canonical **Vanilla** theme. It provides a crisp, authentic porcelain-white console UI with vibrant Nintendo red and sapphire accents, persisted in `localStorage` and synchronized with document `data-theme="vanilla"` attributes and CSS design tokens.

---

## 2. Detailed List of What It Does
- **Vanilla Theme**:
  - 🍦 **Vanilla**: Crisp porcelain white cards (`#ffffff`), subtle dot matrix canvas (`#cbd5e1`), Nintendo red (`#ef4444`) and blue (`#3b82f6`) accents with high readability and authentic retro feel.
- **System Settings Integration**: Clear visual theme representation under the "Themes & Visuals" tab in System Settings.
- **Instant Persistence**: Theme configuration is saved to `localStorage` under `retro_player_theme` and synchronized automatically across sessions.
- **CSS Custom Property Scope**: Clean global design tokens (`--bg-iisu`, `--bg-dots`, `--panel-bg`, `--tile-bg`, `--text-main`, `--poke-red`, etc.) in `:root` and `[data-theme="vanilla"]`.

---

## 3. Detailed Logic Behind Everything and How It Works
- **Custom Hook ([useThemeEngine.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useThemeEngine.js))**:
  - Initializes state from `localStorage.getItem('retro_player_theme')` (defaulting to `'vanilla'`).
  - Sets `data-theme` attribute on `document.documentElement` inside a `useEffect` hook.
  - Exposes `theme`, `currentThemeMeta`, `availableThemes`, `setTheme(key)`, and `cycleTheme()`.
- **CSS Design Tokens ([index.css](file:///Users/godarayudhvir/Github/retro-player/src/index.css))**:
  - Global styles defined in `:root` and verified with `html[data-theme="vanilla"]`.
- **Audio Feedback ([useWebAudioSfx.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useWebAudioSfx.js))**:
  - Invokes `playThemeSwitch()` synthesized frequency sweep on theme interactions.

# Theme Engine Specification

## 1. Description
The **Theme Engine** provides the multi-theme console skinning and structural layout architecture for Retro Player. It supports 2 distinct console-inspired visual themes alongside dual **Light** and **Dark** mode variations for each theme, persisted instantly in `localStorage` and synchronized with document `data-theme` and `data-color-mode` DOM attributes, CSS design tokens, and dedicated view layout components.

---

## 2. Detailed List of What It Does
- **Theme Catalog (2 Console Themes & View Structures)**:
  - 🍦 **Vanilla**: Original crisp porcelain-white console UI with dot-matrix canvas, modern glassmorphism pills, and horizontal 3D cartridge shelf.
  - 📱 **DS Touch** (*inspired by [ds-es-de](https://github.com/Weestuarty-es-de/ds-es-de)*): Nintendo DS touchscreen graph paper grid with a 3-column dual-screen firmware layout (left 3-column beveled square buttons matrix; center top/bottom screen previews with synopsis; right 3D box art + metallic specs cards).
- **Light & Dark Mode Support**:
  - Every theme supports both Light and Dark mode variations.
  - Default mode is Light.
  - Remembers and restores the user's last chosen color mode automatically.
- **Theme Switcher Modal & Quick Controls**:
  - Visual Theme Switcher dialog accessible from the Topbar HUD, via keyboard shortcut (`T`), and gamepad button prompts.
  - Live preview thumbnails, color mode toggle switch, and full keyboard/gamepad navigation.
- **Instant Persistence**: Theme configuration is saved to `localStorage` under `retro_player_theme` and `retro_player_color_mode`.
- **CSS Custom Property Scope**: Scoped global design tokens in `:root`, `[data-theme="..."]`, and `[data-color-mode="..."]`.

---

## 3. Detailed Logic Behind Everything and How It Works
- **Custom Hook ([useThemeEngine.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useThemeEngine.js))**:
  - Initializes `theme` from `localStorage.getItem('retro_player_theme')` (defaulting to `'vanilla'`).
  - Initializes `colorMode` from `localStorage.getItem('retro_player_color_mode')` (defaulting to `'light'`).
  - Sets `data-theme` and `data-color-mode` attributes on `document.documentElement` inside a `useEffect` hook whenever state changes.
  - Exposes `theme`, `colorMode`, `currentThemeMeta`, `availableThemes`, `setTheme(key)`, `setColorMode(mode)`, `toggleColorMode()`, and `cycleTheme()`.
- **Theme View Orchestration ([CartridgeGrid.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/CartridgeGrid.jsx))**:
  - Dynamically routes to dedicated theme layout components:
    - [VanillaView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/theme-views/VanillaView.jsx) (Original 3D cartridge shelf)
    - [DsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/theme-views/DsView.jsx) (Dual-screen touchscreen buttons, screens, and specs)
- **Modal Component ([ThemeSwitcherModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ThemeSwitcherModal.jsx))**:
  - Displays grid of theme cards with swatch previews, active badges, and Light/Dark switch buttons.
  - Listens to Arrow keys, Enter (apply), Tab (toggle mode), and Esc (close).
- **CSS Design Tokens & View Styling ([index.css](file:///Users/godarayudhvir/Github/retro-player/src/index.css))**:
  - Global base styles defined in `:root`.
  - Color mode variables in `[data-color-mode="dark"]`.
  - Scoped structural and visual stylesheets for each layout container (`.ds-theme-container`).
- **Audio Feedback ([useWebAudioSfx.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useWebAudioSfx.js))**:
  - Invokes `playThemeSwitch()` synthesized frequency sweep on theme selection, and `playTabSwitch()` on color mode toggle.

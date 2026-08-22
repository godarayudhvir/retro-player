# Console Theme Studio Modal (`architecture/components/theme-switcher-modal.md`)

## 1. Description

The `ThemeSwitcherModal` component is the Console Theme Studio dialog for Retro Player. Accessible from the Topbar theme button, via keyboard shortcut `T`, or from the mobile topbar theme button, it allows players to switch between the 2 available console themes (Vanilla and DS Touch), toggle Light/Dark mode, and select their preferred UI Display Mode (Auto Responsive, Console/TV 10-Foot UI, or Mobile Feed). All controls are fully navigable via keyboard and gamepad.

---

## 2. Detailed List of What It Does

- **2-Theme Card Grid**:
  - Renders one card per available theme from `themeEngine.availableThemes`.
  - **Vanilla**: Crisp porcelain-white console UI with 3D cartridge shelf and dot-matrix canvas background.
  - **DS Touch**: Nintendo DS dual-screen graph paper firmware layout with beveled square button matrix and integrated game detail panel.
  - Active theme card shows a green `✓ ACTIVE` badge.
  - Arrow keys / D-pad Left/Right cycle `selectedIndex` through themes.
  - `Enter` / `A` button applies the highlighted theme via `themeEngine.setTheme(key)`.

- **Light / Dark Mode Toggle**:
  - `Sun` / `Moon` icon toggle switch (`.color-mode-toggle`).
  - `Tab` key / gamepad shoulder button toggles between `'light'` and `'dark'` via `themeEngine.toggleColorMode()`.
  - Current mode badge rendered inside the toggle row.

- **UI Display Mode Picker**:
  - 3 mode options: `'auto'` (Auto Responsive), `'console'` (Console / TV 10-Foot UI), `'mobile'` (Mobile Feed).
  - Icons: `Monitor` (auto), `Cpu` (console), `Smartphone` (mobile).
  - Selecting a mode calls `setUiMode(mode)` which persists to `localStorage` under `retro_ui_mode`.
  - This directly controls the `isMobile` flag in `useDeviceDetection`, allowing manual forced layout switching regardless of physical screen size.

- **Keyboard & Gamepad Navigation**:
  - `Escape` / `B`: Close modal.
  - `ArrowLeft` / `ArrowUp`: Select previous theme card.
  - `ArrowRight` / `ArrowDown`: Select next theme card.
  - `Enter` / `Space`: Apply selected theme.
  - `Tab`: Toggle Light/Dark color mode.

- **Audio Feedback**: `sfx.playThemeSwitch()` on theme selection; `sfx.playTabSwitch()` on color mode toggle; `sfx.playModalClose()` on dismiss.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `isOpen` (boolean): Controls modal visibility.
- `onClose` (function): Closes modal.
- `themeEngine` (Object): Theme engine instance from `useThemeEngine`. Exposes:
  - `availableThemes` (Array): `[{ key, label, description, icon }]`
  - `theme` (string): Current active theme key (`'vanilla'` | `'ds'`).
  - `colorMode` (string): Current color mode (`'light'` | `'dark'`).
  - `setTheme(key)`: Applies and persists theme.
  - `toggleColorMode()`: Flips color mode and persists.
- `uiMode` (string): Current UI Display Mode (`'auto'` | `'console'` | `'mobile'`).
- `setUiMode` (function): Updates and persists UI Display Mode to `localStorage`.
- `sfx` (Object): Web Audio synthesizer.

### Key Internal State
- `selectedIndex`: Zero-based index of the currently keyboard-highlighted theme card.

### useEffect Sync
On open, `selectedIndex` is synced to the index of the currently active theme in `availableThemes` so the highlighted card always starts on the current selection.

### Source Location
- Component: [src/components/ThemeSwitcherModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ThemeSwitcherModal.jsx)
- Theme Engine Hook: [src/hooks/useThemeEngine.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useThemeEngine.js)
- Device Detection Hook: [src/hooks/useDeviceDetection.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useDeviceDetection.js)

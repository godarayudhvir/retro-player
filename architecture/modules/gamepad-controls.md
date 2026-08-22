# Gamepad Controls & Navigation Engine (`architecture/modules/gamepad-controls.md`)

## 1. Description
The Gamepad Controls engine provides seamless navigation using standard USB/Bluetooth gamepads (Xbox, PlayStation, Switch Pro) and keyboard hotkeys throughout the console UI shell.

---

## 2. Detailed List of What It Does
- **Gamepad API Polling Loop**: Listens for `gamepadconnected` and `gamepaddisconnected` events and polls connected gamepads using `navigator.getGamepads()`.
- **Keyboard Navigation Mapping**: Supports `WASD`, `Arrow Keys`, `Enter` (select), `Escape` (back/close), and `Q`/`E` (tab switching).
- **Dynamic Input Prompts**: Toggles top bar prompts between keyboard (`Q` / `E`) and gamepad (`L` / `R` or `L1` / `R1`).
- **In-Game Input Yielding & Dynamic Virtual Control Auto-Hiding**:
  - Automatically yields all standard controller buttons and axes to the active EmulatorJS canvas/iframe when a game is running, preventing UI navigation cross-talk.
  - Dynamically detects connected physical gamepads (USB/Bluetooth) in the emulator and auto-hides on-screen virtual touch buttons (`.ejs_virtualGamepad_parent`). Disconnecting the controller dynamically restores on-screen touch controls without restarting emulation.
- **Dedicated Gamepad Exit Shortcut**: Provides a universal combo (`Select` [Button 8] + `Start` [Button 9] or `Guide/Home` [Button 16]) to safely return from the emulator to the game library.
- **Mobile View Spatial Navigation & Visual Focus Rings**:
  - Delivers complete 2D spatial navigation across `MobileAppView` (Profile Gate, Topbar icons, System Chips, Horizontal Carousels, System Drilldown grids, and the Game Detail Bottom Sheet).
  - High-visibility luminous neon focus styling (`.gamepad-focused`) and automatic smooth `scrollIntoView` ensure clear cursor tracking across all handheld and Android displays.
- **Gamepad Search Hotkey & On-Screen Virtual Keyboard**: Allows gamepad users to trigger search instantly with `Button 3 (Y / Triangle)` or `Button 8 (Select/Share)` and type queries via a glassmorphic on-screen virtual keyboard with spatial D-Pad grid navigation, `A` (select), `X` (space), `Y` (backspace), `B` (close), and `Start` (search/done).
- **Gamepad Battery Monitoring & Telemetry**: Inspects connected gamepad battery telemetry (`gamepad.battery`) to render live battery percentage, icon level (Full, Medium, Low, Critical), and charging status indicator (`⚡`) inside the Topbar gamepad widget and Settings view.
- **Low & Critical Battery In-App Banner**: Triggers tactile WebAudio warning chimes and floating console notification toasts when battery level drops below 20% (Low) or 10% (Critical) without interrupting gameplay.

---

## 3. Detailed Logic Behind Everything and How It Works

### Gamepad Polling & Focus Routing
- Polling runs inside a `requestAnimationFrame` loop in [App.jsx](file:///Users/godarayudhvir/Github/retro-player/src/App.jsx).
- Implements debounce logic using `lastInputTimeRef` (threshold: 200ms) to prevent accidental fast scrolling.
- **Battery Inspection & Alerting Engine**:
  - Managed by `useGamepadStatus.js` through a 3-second background polling cycle and `gamepadconnected` / `gamepaddisconnected` event bindings.
  - Queries `gamepad.battery` object (where supported by browser and controller driver) to extract `level` ($0.0 - 1.0$) and `charging` state ($true/false$).
  - When battery is low ($\le 20\%$) or critical ($\le 10\%$) while not charging, triggers `sfx.playBatteryLow()` synthesized double-tone chime and mounts `.gamepad-battery-alert-toast`.
  - Fallback logic automatically designates wired USB / standard gamepads without hardware battery reporting as "USB / Wireless Active" or "Gamepad Ready" without displaying broken UI tags.
- **Active Gameplay Detection**:
  - When `activeGame` is truthy, UI spatial navigation is bypassed. Standard buttons (A, B, D-Pad, Shoulder) are not consumed by the main window, allowing EmulatorJS to directly handle gameplay input inside its focused iframe.
  - If `Select` + `Start` or `Guide/Home` is detected simultaneously, `setActiveGame(null)` is executed, safely unmounting the emulator.
- **UI Shell Navigation** (when `activeGame` is null):
  - `D-Pad Left / Right`: Navigates games sequentially 1-by-1 across the single horizontal library shelf, or moves across topbar pills / modal buttons.
  - `D-Pad Up / Down`: Navigates seamlessly across UI tiers (Topbar items $\leftrightarrow$ Category Ribbon $\leftrightarrow$ Cartridge Shelf $\leftrightarrow$ Controller HUD).
  - `Full Topbar Spatial Coverage`: Complete D-Pad reachability across Profile Avatar (`profile`), BGM Play/Pause (`bgm`), BGM Next (`bgmSkip`), Online Scraper (`scraper`), UI SFX Mute/Unmute (`sfx`), Theme Switcher (`theme`), Search (`search`), PWA Install (`install`), Load Custom ROM (`loadRom`), and Settings (`settings`).
  - `Complete Modal D-Pad Nav`: In-app Game Detail Drawer (`play`, `fav`, `editMeta`, `scrape`, `close`), Profile Select Modal (`profile cards`, `add profile`, `manage`, `close`), Mii Creator Studio Wizard (`close`, `nameInput`, `random`, category tabs `tab-face`/`tab-hair`/`tab-eyes`/`tab-extras`/`tab-presets`, `save`, `cancel`), and System Settings Hub (Back button, left category sidebar with D-Pad `UP`/`DOWN`, pressing `RIGHT` or `A` enters the settings detail pane to navigate interactive settings controls/inputs/buttons, pressing `LEFT` returns to sidebar, and `B` exits) support 100% keyboard and gamepad spatial movement.
  - `Button 0 (A / Cross)`: Triggers selection, play, or action modal confirmation.
  - `Button 1 (B / Circle)`: Closes game detail drawer, modals, or returns focus to library grid.
  - `Button 2 (X / Square)`: Toggles game Favorite status instantaneously.
  - `Button 3 (Y / Triangle)` / `Button 8 (Select)`: Opens Search bar and launches On-Screen Virtual Keyboard.
  - `Button 4 / 5 (L1 / R1)`: Cycles active console system tabs left/right.
- **On-Screen Virtual Keyboard (OSK)**:
  - Accessible via `Button 3 (Y / Triangle)`, `Select`, or clicking the topbar search pill.
  - `D-Pad / Left Stick`: Navigates across the 4-row virtual key matrix (`KEYBOARD_ROWS`).
  - `Button 0 (A)`: Enters the selected virtual character.
  - `Button 2 (X)`: Inserts a space.
  - `Button 3 (Y)`: Backspaces one character.
  - `Button 1 (B)`: Closes the virtual keyboard and focuses results.
  - `Button 9 (Start)`: Confirms search and focuses the first matching game tile.

# Emulator Modal UI Component (`architecture/components/emulator-modal.md`)

## 1. Description
The Emulator Modal UI component ([EmulatorModal.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/components/EmulatorModal.jsx)) renders the full-screen retro console overlay, top HUD bar, iframe canvas stage, save file exporter trigger, and bottom control guide badges.

---

## 2. Detailed List of What It Does
- **Overlay Container**: Renders fixed overlay `.emulator-backdrop-iisu` with dark background `#000000` and `z-index: 1000`, wired with click-to-focus triggers.
- **Top HUD Header**: Shows active game title, system badge, live controller status indicator (`GAMEPAD READY` / `PRESS CONTROLLER BUTTON`), save export button (`<Download size={14} /> Export Save`), and close button (`<X size={22} />`).
- **Control Key & Gamepad Legend**: Displays quick reference badges for movement (`D-Pad / Analog / WASD`), action buttons (`A & B / Z & X`), start/select (`Start & Select / Enter & Shift`), and exit combo (`Select + Start / Esc`).

---

## 3. Detailed Logic Behind Everything and How It Works
- **Focus & Gamepad Capture**: Implements `focusEmulator()` ensuring the inner iframe and canvas retain exclusive keyboard and gamepad input capture upon loading.
- **Hardware Index Lookup Patch**: Injects `patchEmulatorGamepad()` to resolve device index lookup issues for gamepads with non-zero hardware indices (`gamepad.index >= 1`), enabling full button mapping in Control Settings and input simulation.
- **Controller Exit Bridge**: Detects exit combos (`Select + Start`, `Guide/PS`, `L3 + R3`) directly inside the active iframe and emits `postMessage('RETRO_PLAYER_EXIT_GAME')` to the host window to safely unmount the emulator.
- **Left Stick Analog Fallback**: Automatically translates `LEFT_STICK_X` and `LEFT_STICK_Y` analog movements into D-Pad directional inputs (`UP`, `DOWN`, `LEFT`, `RIGHT`) across all games.
- **Responsive NDS Layout**: Injects `desmume_screens_layout: 'left/right'` and `melonds_screen_layout: 'Left/Right'` when running Nintendo DS games on tablet and desktop viewports (`>= 768px`).
- **Save Management**: Implements `handleExportSave()` invoking `EJS_emulator.saveSaveFiles()` or `EJS_emulator.exportSave()` inside the iframe context.
- **Clean Teardown**: Implements `handleClose()` destroying the iframe reference (`win.EJS_emulator.destroy()`), revoking Object URLs for custom blobs, resetting `win.location.href = 'about:blank'`, and triggering `onClose()` callback to return to the launcher grid.

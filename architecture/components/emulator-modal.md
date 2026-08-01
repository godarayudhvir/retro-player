# Emulator Modal UI Component (`architecture/components/emulator-modal.md`)

## 1. Description
The Emulator Modal UI component ([EmulatorModal.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/components/EmulatorModal.jsx)) renders the full-screen retro console overlay, top HUD bar, iframe canvas stage, save file exporter trigger, and bottom control guide badges.

---

## 2. Detailed List of What It Does
- **Overlay Container**: Renders fixed overlay `.emulator-backdrop-iisu` with dark background `#000000` and `z-index: 1000`.
- **Top HUD Header**: Shows active game title, system badge, save export button (`<Download size={14} /> Export Save`), and close button (`<X size={22} />`).
- **Control Key Legend**: Displays quick reference badges for keyboard controls (`Arrow Keys / WASD`, `Z / X` action buttons, `Shift / Enter` select/start).

---

## 3. Detailed Logic Behind Everything and How It Works
- Implements `handleExportSave()` invoking `EJS_emulator.saveSaveFiles()` or `EJS_emulator.exportSave()` inside iframe context.
- Implements `handleClose()` destroying iframe reference, resetting `win.location.href = 'about:blank'`, and triggering `onClose()` callback to return to launcher grid.

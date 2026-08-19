# Emulator Modal UI Component (`architecture/components/emulator-modal.md`)

## 1. Description
The Emulator Modal UI component ([EmulatorModal.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/components/EmulatorModal.jsx)) renders the full-screen retro console overlay, top HUD bar, iframe canvas stage, save file exporter trigger, and bottom control guide badges.

---

## 2. Detailed List of What It Does
- **Overlay Container**: Renders fixed overlay `.emulator-backdrop-iisu` with dark background `#000000` and `z-index: 1000`, wired with click-to-focus triggers.
- **Top Responsive Header (`.emulator-topbar`)**: Shows active game title with ellipsis constraints, system badge, offline/CDN indicator, live controller status indicator, RetroArch control panel **Menu** toggle button (`<Menu size={18} />`), and exit close button (`<X size={18} />`). On mobile devices (`<= 640px`), automatically collapses verbose badges and text labels into clean icons to prevent any clipping.
- **Distraction-Free Fullscreen Stage**: Full-screen isolated canvas stage without distracting on-canvas floating buttons or bottom controls bars. RetroArch / EmulatorJS's built-in control panel is seamlessly toggled via the clean topbar Menu button.
- **Mobile Touchscreen Gamepad Viewport Optimization**: The iframe injects viewport-fit metadata (`<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`) and calculates strict 100% stage bounds (`height: 100dvh` / zero padding) ensuring virtual touch gamepad controls (D-Pad, A/B buttons) are fully rendered and reachable on mobile portrait and landscape viewports.

---

## 3. Detailed Logic Behind Everything and How It Works
- **Focus & Gamepad Capture**: Implements `focusEmulator()` ensuring the inner iframe and canvas retain exclusive keyboard and gamepad input capture upon loading.
- **Hardware Index Lookup Patch**: Injects `patchEmulatorGamepad()` to resolve device index lookup issues for gamepads with non-zero hardware indices (`gamepad.index >= 1`), enabling full button mapping in Control Settings and input simulation.
- **Controller Exit Bridge**: Detects exit combos (`Select + Start`, `Guide/PS`, `L3 + R3`) directly inside the active iframe and emits `postMessage('RETRO_PLAYER_EXIT_GAME')` to the host window to safely unmount the emulator.
- **Left Stick Analog Fallback**: Automatically translates `LEFT_STICK_X` and `LEFT_STICK_Y` analog movements into D-Pad directional inputs (`UP`, `DOWN`, `LEFT`, `RIGHT`) across all games.
- **Responsive NDS Layout**: Injects `desmume_screens_layout: 'left/right'` and `melonds_screen_layout: 'Left/Right'` when running Nintendo DS games on tablet and desktop viewports (`>= 768px`).
- **Clean Teardown & Session Blob Lifecycle**: Dynamically creates a dedicated session Object URL from `game.file` when mounting `EmulatorModal`, ensuring clean teardown (`win.EJS_emulator.destroy()`) and revoking only the active session's Object URL upon unmount without breaking React lifecycle re-mounts.

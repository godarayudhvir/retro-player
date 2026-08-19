# Main Application Shell & Orchestration (`architecture/core/app.md`)

## 1. Description
The Main Application Shell ([App.jsx](file:///Users/godarayudhvir/Github/retro-player/src/App.jsx)) serves as the central root orchestrator of **Retro Player**. Following the Phase 1 Mirai architectural decomposition, `App.jsx` coordinates specialized custom React hooks (`useWebAudioSfx`, `useGamepadStatus`, `useSaveDataManager`, `useRomManifest`, `useGamepadNavigation`) and renders modular subcomponents (`Topbar`, `SystemRibbon`, `CartridgeGrid`, `GameDetailModal`, `AboutInfoModal`, `DropzoneOverlay`, `ConsoleHud`, `OnScreenKeyboard`, `EmulatorModal`).

---

## 2. Detailed List of What It Does
- **Modular Component Orchestration**: Composes dedicated subcomponents for topbar status HUD, system category ribbon, 3D cartridge grid, game drawer modal, info dialog, and gamepad HUD.
- **Audio Synthesizer Coordination (`useWebAudioSfx`)**: Injects zero-latency synthesized tactile clicks, swooshes, modal chimes, and cartridge insertion audio throughout the UI.
- **Dynamic Controller Connection Management (`useGamepadStatus`)**: Tracks active gamepad connectivity and controller hardware ID.
- **Save Data Verification (`useSaveDataManager`)**: Detects existing save states and battery RAM in `localStorage` and `IndexedDB` for inspected games.
- **Catalog Manifest & Drop-in ROM Engine (`useRomManifest`)**: Manages library indexing from `/api/roms`, search filtering, chronological release sorting, and drag-and-drop custom ROM imports.
- **Spatial 2D Navigation Engine (`useGamepadNavigation`)**: Manages seamless spatial navigation across topbar, ribbon, grid, and modals via keyboard and HTML5 Gamepad polling.

---

## 3. Detailed Logic Behind Everything and How It Works

### Hook Composition
```
                         ┌───────────────────────┐
                         │        App.jsx        │
                         └───────────┬───────────┘
                                     │
     ┌──────────────┬────────────────┼────────────────┬──────────────┐
     ▼              ▼                ▼                ▼              ▼
[useWebAudioSfx] [useGamepadStatus] [useSaveData] [useRomManifest] [useGamepadNav]
```

### Component Hierarchy
- `<DropzoneOverlay />`: Full-viewport drag-and-drop backdrop for custom ROM loading.
- `<Topbar />`: System header, avatar, L1/R1 shoulder buttons, SFX mute toggle, search bar, and digital clock.
- `<SystemRibbon />`: Horizontal category navigation dynamically sorted by game count.
- `<CartridgeGrid />`: 3D physical cartridge tiles viewport with smooth scrolling.
- `<ConsoleHud />`: Bottom controller button hints.
- `<AboutInfoModal />`: Project overview and keyboard/gamepad controls reference table.
- `<GameDetailModal />`: Selected game drawer modal with metadata and save status.
- `<OnScreenKeyboard />`: Spatial virtual keyboard for gamepad & touchscreen search.
- `<EmulatorModal />`: Isolated iframe sandbox for EmulatorJS emulation.


# Main Application Shell & Orchestration (`architecture/core/app.md`)

## 1. Description
The Main Application Shell ([App.jsx](file:///Users/godarayudhvir/Github/retro-player/src/App.jsx)) serves as the central root orchestrator of **Retro Player**. Following the Phase 1 Mirai architectural decomposition, `App.jsx` coordinates specialized custom React hooks (`useWebAudioSfx`, `useThemeEngine`, `usePlaytimeAndFavorites`, `useGamepadStatus`, `useSaveDataManager`, `useRomManifest`, `useGamepadNavigation`) and renders modular subcomponents (`Topbar`, `SystemRibbon`, `CartridgeGrid`, `GameDetailModal`, `LoadRomModal`, `AboutInfoModal`, `DropzoneOverlay`, `ConsoleHud`, `OnScreenKeyboard`, `EmulatorModal`).

---

## 2. Detailed List of What It Does
- **Modular Component Orchestration**: Composes dedicated subcomponents for topbar status HUD, system category ribbon, 3D cartridge grid, game drawer modal, Load ROM dialog, info modal, virtual keyboard, and gamepad HUD.
- **Multi-Theme Engine Coordination (`useThemeEngine`)**: Manages real-time theme switching across 4 console aesthetics (iiSU Light, Midnight Cyber Dark, Sony XMB Wave, Game Boy DMG) and persists to localStorage.
- **Smart Collections & Playtime Analytics (`usePlaytimeAndFavorites`)**: Manages persistent favorites, chronological recently played history, active gameplay session timing, and in-app stats resetting.
- **Audio Synthesizer Coordination (`useWebAudioSfx`)**: Injects zero-latency synthesized tactile clicks, swooshes, modal chimes, and cartridge insertion audio throughout the UI.
- **Dynamic Controller Connection Management (`useGamepadStatus`)**: Tracks active gamepad connectivity and controller hardware ID.
- **Save Data Verification (`useSaveDataManager`)**: Detects existing save states and battery RAM in `localStorage` and `IndexedDB` for inspected games.
- **Catalog Manifest & Drop-in ROM Engine (`useRomManifest`)**: Manages library indexing from `/api/roms`, search filtering, chronological release sorting, and drag-and-drop custom ROM imports.
- **Spatial 2D Navigation Engine (`useGamepadNavigation`)**: Manages seamless spatial navigation across topbar, ribbon, grid, and modals via keyboard, touchscreen, and HTML5 Gamepad polling.

---

## 3. Detailed Logic Behind Everything and How It Works

### Hook Composition
```
                                ┌───────────────────────┐
                                │        App.jsx        │
                                └───────────┬───────────┘
                                            │
    ┌──────────────┬──────────────┬─────────┴────────┬──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼                  ▼              ▼              ▼              ▼
[useWebAudio] [useTheme] [usePlaytimeFav] [useGamepadStatus] [useSaveData] [useRomManifest] [useGamepadNav]
```

### Component Hierarchy
- `<DropzoneOverlay />`: Full-viewport drag-and-drop backdrop for custom ROM loading.
- `<Topbar />`: System header, avatar, theme selector, sound toggle, search bar, and digital clock.
- `<SystemRibbon />`: Horizontal category navigation with smart collections (Favorites, Recent).
- `<CartridgeGrid />`: 3D physical cartridge tiles viewport with smooth scrolling.
- `<ConsoleHud />`: Bottom controller button hints.
- `<LoadRomModal />`: Multi-theme in-app custom ROM loader with format reference chips.
- `<AboutInfoModal />`: Project overview and keyboard/gamepad controls reference table.
- `<GameDetailModal />`: Selected game drawer modal with metadata, playtime analytics, and save detection.
- `<OnScreenKeyboard />`: Spatial virtual keyboard for gamepad & touchscreen search.
- `<EmulatorModal />`: Isolated iframe sandbox for EmulatorJS emulation with topbar Menu button and elevated virtual touch controls.


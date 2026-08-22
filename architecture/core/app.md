# Main Application Shell & Orchestration (`architecture/core/app.md`)

## 1. Description
The Main Application Shell ([App.jsx](file:///Users/godarayudhvir/Github/retro-player/src/App.jsx)) serves as the central root orchestrator of **Retro Player**. It coordinates specialized custom React hooks (`useWebAudioSfx`, `useThemeEngine`, `useDeviceDetection`, `usePlaytimeAndFavorites`, `useGamepadStatus`, `useSaveDataManager`, `useRomManifest`, `useGamepadNavigation`, `useProfileManager`, `useBgmEngine`, `useMetadataScraper`, `usePwaInstall`) and conditionally renders modular subcomponents across device form factors (`Topbar`, `SystemRibbon`, `CartridgeGrid`, `MobileAppView`, `GameDetailModal`, `LoadRomModal`, `AboutInfoModal`, `ThemeSwitcherModal`, `DropzoneOverlay`, `OnScreenKeyboard`, `EmulatorModal`).

---

## 2. Detailed List of What It Does
- **Modular Component Orchestration**: Composes dedicated subcomponents for topbar status HUD, system category ribbon, 3D cartridge grid, mobile streaming view, game drawer modal, Load ROM dialog, info modal, virtual keyboard, theme studio, and emulator modal.
- **Modern Device & Viewport Detection (`useDeviceDetection`)**: Employs native W3C `window.matchMedia` listeners to monitor responsive breakpoints (`(max-width: 768px) and (orientation: portrait)`) and pointer capabilities (`(hover: none) and (pointer: coarse)`) with zero resize event layout thrashing. Supports user UI Display Mode overrides (`auto`, `console`, `mobile`).
- **Theme & Display Mode Studio (`useThemeEngine`, `ThemeSwitcherModal`)**: Manages console themes (Vanilla, DS Touch), global light/dark color modes, and interactive UI Display Mode switching (Auto, Console/TV 10-Foot UI, Mobile Feed) persisted in `localStorage`.
- **Smart Collections & Playtime Analytics (`usePlaytimeAndFavorites`)**: Manages persistent favorites, chronological recently played history, active gameplay session timing, and in-app stats resetting.
- **Audio Synthesizer Coordination (`useWebAudioSfx`)**: Injects zero-latency synthesized tactile clicks, swooshes, modal chimes, and cartridge insertion audio throughout the UI.
- **Dynamic Controller Connection Management (`useGamepadStatus`)**: Tracks active gamepad connectivity, battery percentage telemetry, and controller hardware ID.
- **Save Data Verification (`useSaveDataManager`)**: Detects existing save states and battery RAM in `localStorage` and `IndexedDB` for inspected games.
- **Catalog Manifest & Drop-in ROM Engine (`useRomManifest`)**: Manages library indexing from `/api/roms`, search filtering, chronological release sorting, and drag-and-drop custom ROM imports.
- **Spatial 2D Navigation Engine (`useGamepadNavigation`)**: Manages seamless spatial navigation across topbar, ribbon, grid, mobile chips/feed, and modals via keyboard, touchscreen, and HTML5 Gamepad polling.

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
[useDeviceDet] [useTheme] [usePlaytimeFav] [useGamepadStatus] [useSaveData] [useRomManifest] [useGamepadNav]
```

### Component Hierarchy
- `<DropzoneOverlay />`: Full-viewport drag-and-drop backdrop for custom ROM loading.
- `<MobileAppView />`: Rendered when `isMobile` is active (portrait phone screens or manual Mobile Feed override); features Netflix-style carousels, bottom sheets, and chip navigation.
- `<Topbar />`: System header, avatar, theme selector, sound toggle, search bar, and digital clock.
- `<SystemRibbon />`: Horizontal category navigation with smart collections (Favorites, Recent).
- `<CartridgeGrid />`: 3D physical cartridge tiles viewport with smooth scrolling.
- `<ThemeSwitcherModal />`: Console Theme Studio with layout selector, light/dark switch, and UI Display Mode picker.
- `<LoadRomModal />`: Multi-theme in-app custom ROM loader with format reference chips.
- `<AboutInfoModal />`: Project overview and capability details.
- `<GameDetailModal />`: Selected game drawer modal with metadata, playtime analytics, and save detection.
- `<OnScreenKeyboard />`: Spatial virtual keyboard for gamepad & touchscreen search.
- `<EmulatorModal />`: Isolated iframe sandbox for EmulatorJS emulation with modern primary pointer detection for virtual controls.

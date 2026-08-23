# Main Application Shell & Orchestration (`architecture/core/app.md`)

## 1. Description
The Main Application Shell ([App.jsx](file:///Users/godarayudhvir/Github/retro-player/src/App.jsx)) serves as the central root orchestrator of **Retro Player**. It coordinates specialized custom React hooks (`useWebAudioSfx`, `useThemeEngine`, `useDeviceDetection`, `useRomManifest`, `usePlaytimeAndFavorites`, `useGamepadStatus`, `useSaveDataManager`, `useGamepadNavigation`, `useProfileManager`, `useBgmEngine`, `useMetadataScraper`, `usePwaInstall`) and conditionally renders modular subcomponents across device form factors (`Topbar`, `SystemRibbon`, `CartridgeGrid`, `MobileAppView`, `MetadataEditModal`, `ScraperModal`, `ThemeSwitcherModal`, `LoadRomModal`, `AboutInfoModal`, `ProfileSelectModal`, `ProfileCreatorModal`, `DemoWelcomeModal`, `DropzoneOverlay`, `OnScreenKeyboard`, `EmulatorModal`, `OnboardingScreen`).

---

## 2. Detailed List of What It Does
- **Modular Component Orchestration**: Composes dedicated subcomponents for topbar status HUD, system category ribbon, DS touch dual-screen grid, mobile streaming view, Load ROM dialog, info modal, virtual keyboard, theme studio, and emulator modal.
- **Modern Device & Viewport Detection (`useDeviceDetection`)**: Employs native W3C `window.matchMedia` listeners to monitor responsive breakpoints (`(max-width: 768px) and (orientation: portrait)`) and pointer capabilities (`(hover: none) and (pointer: coarse)`) with zero resize event layout thrashing. Supports user UI Display Mode overrides (`auto`, `console`, `mobile`).
- **Theme & Display Mode Studio (`useThemeEngine`, `ThemeSwitcherModal`)**: Manages console themes (DS Touch standard default, extensible for future themes), global light/dark color modes, and interactive UI Display Mode switching (Auto, Console/TV 10-Foot UI, Mobile Feed) persisted in `localStorage`.
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
- `<MobileAppView />`: Rendered when `isMobile` is active (portrait phone screens or manual Mobile Feed override); features systems cards, DS touch buttons matrix, and full-screen detail stages.
- `<Topbar />`: System header, active profile avatar, BGM controls, theme studio launcher, scraper trigger, sound toggle, search bar, PWA install, and digital clock.
- `<SystemRibbon />`: Horizontal category navigation with smart collections (Favorites, Recent).
- `<CartridgeGrid />`: Viewport orchestrator — renders `DsView` (DS dual-screen firmware layout with integrated inline game detail).
- `<MetadataEditModal />`: Jellyfin-style manual metadata override editor for title, synopsis, cover art, and technical details.
- `<ScraperModal />`: Granular scraper scope selector (All / Single System / Multi-System / Individual Title) with force-overwrite toggle and live log panel.
- `<ThemeSwitcherModal />`: Console Theme Studio with theme catalog, light/dark switch, and UI Display Mode picker (Auto / Console / Mobile).
- `<LoadRomModal />`: In-app custom ROM loader with drag-drop dropzone and supported format reference chips.
- `<AboutInfoModal />`: Project overview and capability details.
- `<ProfileSelectModal />`: Full-screen "Who's Playing?" Netflix-style profile selector with Multiavatar avatars, add/edit/delete actions.
- `<ProfileCreatorModal />`: Multiavatar Profile Creator & Studio wizard with dice randomize, preset gallery, and accent color swatches.
- `<OnScreenKeyboard />`: Spatial virtual keyboard for gamepad & touchscreen search.
- `<OnboardingScreen />`: Full-screen 2-step onboarding walkthrough shown on first launch — outcome showcase slide + Multiavatar player passport setup.
- `<DemoWelcomeModal />`: Environment-aware GitHub Pages demo dialog rendered only in static demo deployments.
- `<EmulatorModal />`: Isolated iframe sandbox for EmulatorJS emulation with modern primary pointer detection for virtual controls.
- **Low Battery Alert Toast** (`<aside className="gamepad-battery-alert-toast">`): In-app slide-up notification banner for controller low battery / critical battery alerts. Dismissible with `X` button or `sfx.playModalClose()`.

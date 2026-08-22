# Topbar Component Specification

## 1. Description

The `Topbar` component serves as the primary console header and status HUD for Retro Player. Situated at the top of the viewport (`header.console-topbar`), it provides visual identity, active profile display, gamepad connectivity status, BGM playback controls, sound effect mute toggle, theme studio launcher, online metadata scraper trigger, interactive search filtering, custom ROM import action, PWA install prompt, and a digital clock.

---

## 2. Detailed List of What It Does

- **User Profile Badge**: Renders the active player's Multiavatar SVG avatar (`.avatar-badge`) and profile name. Clicking opens the "Who's Playing?" `ProfileSelectModal`.
- **Controller Connectivity & Battery Widget**: Displays a green `GAMEPAD READY` badge or active battery indicator (`PAD` + `BatteryIcon` + `XX%` + `⚡` charging indicator) when a physical gamepad is detected, or `NO CONTROLLER` in grey. Auto-hides on mobile touch devices.
- **BGM Controls**: Play/Pause button and Skip Track button for background music playback, wired to the `bgm` engine instance.
- **Automated Metadata Scraper Button**: Icon-only action button (`Sparkles` / `RefreshCw`) triggering `onOpenScraperModal` to open `ScraperModal`. Shows scraping progress spinner when active.
- **Theme Studio Button**: Icon-only `Palette` button that calls `onOpenThemeModal` to open `ThemeSwitcherModal`. Keyboard shortcut: `T`.
- **SFX Mute Toggle Button**: Compact icon-only button toggling between active audio and muted sound using `Volume2`/`VolumeX` icons with tooltips.
- **Search Bar & Virtual Keyboard Trigger**: Interactive search input with instant library filtering on keyup/typing, and direct on-screen virtual keyboard trigger for gamepads.
- **Custom ROM Modal Trigger (`FolderOpen`)**: Icon-only button that opens the in-app `LoadRomModal` dialog for selecting or dragging local custom ROMs.
- **PWA Install Button**: Renders a `Download` icon button when `pwa.isInstallable` is true, triggering `pwa.promptInstall()`.
- **Digital Clock**: Displays local time updated every 10 seconds.
- **Complete D-Pad & Keyboard Spatial Navigation**: Every control in the Topbar (User Profile Avatar & Name, BGM Play/Pause, BGM Skip, Scraper Trigger, Theme Studio, SFX Mute, Search Input, PWA Install, and Load ROM) is 100% accessible and navigable via D-Pad (`LEFT` / `RIGHT` / `UP` / `DOWN`) and gamepad `A` button with luminous focus highlights (`.gamepad-focused`).
- **Adaptive Layout**: Sleek, circular icon-only buttons provide a streamlined, distraction-free console topbar across desktop, tablet, and mobile views.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Data Flow
- `gamepadConnected` (boolean): Controls gamepad status badge color.
- `gamepadBattery` (Object): Exposes `{ hasBatteryInfo, batteryPercent, isCharging, gamepadId }` for live power telemetry.
- `activeProfile` (Object): Active user profile `{ id, name, avatarSeed, favoriteColor }`.
- `onOpenProfileSelect` (function): Opens the `ProfileSelectModal` when the avatar or name badge is clicked.
- `bgm` (Object): BGM engine instance — exposes `isPlaying`, `togglePlay()`, `skipTrack()`.
- `pwa` (Object): PWA install engine — exposes `isInstallable`, `promptInstall()`.
- `searchQuery` & `setSearchQuery`: Binds directly to the search input field.
- `searchInputRef` (Ref): React ref forwarded to the `<input>` element for programmatic focus.
- `setShowLoadRomModal` (function): Opens `LoadRomModal`.
- `setShowVirtualKeyboard` (function): Opens `OnScreenKeyboard`.
- `onOpenScraperModal` (function): Opens `ScraperModal`.
- `onOpenThemeModal` (function): Opens `ThemeSwitcherModal`.
- `time` (string): Formatted time string (`HH:MM`) updated every 10 seconds from `App.jsx`.
- `sfx` (Object): Invokes `sfx.playModalOpen()`, `sfx.toggleMute()`, and `sfx.isMuted`.
- `themeEngine` (Object): Provides `themeEngine.theme` for active theme-aware styling.
- `scraper` (Object): Provides `scraper.isScraping` for scraper button state.
- `focusedTarget` & `setFocusedTarget`: Spatial navigation state.

### Source Location
- Component: [src/components/Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx)


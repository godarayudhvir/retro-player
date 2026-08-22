# Topbar Component Specification

## 1. Description

The `Topbar` component serves as the primary console header and status HUD for Retro Player. Situated at the top of the viewport (`header.console-topbar`), it provides visual identity, gamepad connectivity status, sound effect mute toggles, theme cycling, interactive search filtering, custom ROM import actions, and a digital clock.

---

## 2. Detailed List of What It Does

- **Console Identity Badge**: Renders the user tag and red gamepad icon (`.avatar-badge`).
- **Controller Connectivity & Battery Widget**: Displays a green `GAMEPAD READY` badge or active battery indicator (`PAD` + `BatteryIcon` + `XX%` + `⚡` charging indicator) when a physical gamepad is detected, or `NO CONTROLLER` in grey. Auto-hides on mobile touch devices.
- **Automated Metadata Scraper Button**: Icon-only action button (`Sparkles` / `RefreshCw`) triggering library-wide metadata & box art scraping.
- **SFX Mute Toggle Button**: Compact icon-only button toggle between active audio and muted sound using `Volume2`/`VolumeX` icons with tooltips.
- **Multi-Theme Engine Button**: Compact icon-only button displaying the active theme icon (☀️, 🌙, 🌊, 📟), cycling themes on click or `T` key.
- **Search Bar & Virtual Keyboard Trigger**: Interactive search input with an adaptive keyboard badge (`⌘K` on Mac, `Ctrl+K` on Windows/Linux, or `Y` when a gamepad is connected).
- **Custom ROM Modal Trigger (`FolderOpen`)**: Icon-only button that opens the in-app `LoadRomModal` dialog for selecting or dragging local custom ROMs.
- **Digital Clock**: Displays local time updated every 10 seconds.
- **Complete D-Pad & Keyboard Spatial Navigation**: Every control in the Topbar (User Profile Avatar & Name, BGM Play/Pause, BGM Skip, Scraper Trigger, SFX Mute, Theme Switcher, Search Input, PWA Install, Load ROM, and Settings) is 100% accessible and navigable via D-Pad (`LEFT` / `RIGHT` / `UP` / `DOWN`) and gamepad `A` button with luminous focus highlights (`.gamepad-focused`).
- **Adaptive Layout**: Sleek, circular icon-only buttons provide a streamlined, distraction-free console topbar across desktop, tablet, and mobile views.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Data Flow
- `gamepadConnected` (boolean): Controls gamepad status badge color and search hotkey badge (`Y` vs `⌘K`).
- `gamepadBattery` (object): Exposes `{ hasBatteryInfo, batteryPercent, isCharging, gamepadId }` for live power telemetry.
- `searchQuery` & `setSearchQuery`: Binds directly to the search input field.
- `sfx`: Invokes `sfx.playModalOpen()`, and `sfx.toggleMute()`.
- `themeEngine`: Calls `themeEngine.cycleTheme()` and displays active theme icon.
- `scraper`: Triggers `scraper.scrapeAll()` and renders active scraping progress.

### Source Location
- Component: [src/components/Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx)

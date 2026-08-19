# Topbar Component Specification

## 1. Description

The `Topbar` component serves as the primary console header and status HUD for Retro Player. Situated at the top of the viewport (`header.console-topbar`), it provides visual identity, shoulder button triggers for console switching, gamepad connectivity status, sound effect mute toggles, interactive search filtering, custom ROM import actions, the project info trigger, and a digital clock.

---

## 2. Detailed List of What It Does

- **Console Identity Badge**: Renders the user tag and red gamepad icon (`.avatar-badge`).
- **Shoulder Button Capsule (`.topbar-center-capsule`)**:
  - `L1` (or `Q` / `L` on keyboard): Switches to previous console system.
  - `R1` (or `E` / `R` on keyboard): Switches to next console system.
- **Controller Connectivity Indicator**: Displays a green `GAMEPAD READY` badge when a physical gamepad is detected, or `NO CONTROLLER` in grey.
- **SFX Mute Toggle Button**: Quick toggle between `SFX ON` and `SFX OFF` using `Volume2`/`VolumeX` icons.
- **Search Bar & Virtual Keyboard Trigger**: Interactive search input with an adaptive keyboard badge (`⌘K` on Mac, `Ctrl+K` on Windows/Linux, or `Y` when a gamepad is connected).
- **Custom ROM Modal Trigger (`LOAD ROM`)**: Opens the in-app `LoadRomModal` dialog for selecting or dragging local custom ROMs.
- **About Info Trigger (`INFO`)**: Opens the `AboutInfoModal` dialog.
- **Digital Clock**: Displays local time updated every 10 seconds.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Data Flow
- `gamepadConnected` (boolean): Controls shoulder button labels (`L1/R1` vs `Q/E`) and gamepad status badge color.
- `activeSystem` & `systems`: Calculates next and previous system keys upon clicking shoulder buttons.
- `searchQuery` & `setSearchQuery`: Binds directly to the search input field.
- `sfx`: Invokes `sfx.playTabSwitch()`, `sfx.playModalOpen()`, and `sfx.toggleMute()`.

### Source Location
- Component: [src/components/Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx)

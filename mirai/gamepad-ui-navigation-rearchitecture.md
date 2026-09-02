# 🎮 App UI Gamepad & Keyboard Navigation Re-Architecture

> **Domain**: UI Navigation / Gamepad & Keyboard Controls  
> **Status**: 📋 Planned  
> **Priority**: 🟡 Medium  

---

## 1. Description

As Retro Player evolved with modern UI additions (Nintendo DS dual-screen layout, dynamic drawers, tabs, live scraper logs, and multi-tier filter ribbons), the legacy hardcoded index-based spatial navigation engine began breaking down. Focus frequently jumps to pseudo-locations between buttons, gets trapped in intermediate DOM states, or fails to find newly rendered dynamic action buttons.

This roadmap specification outlines the structured 3-phase initiative to:
1. **Log & Archive**: Record a complete, exhaustive catalog of all existing UI gamepad buttons and keyboard shortcuts so that every single shortcut and interaction pattern is preserved for 1:1 parity.
2. **Decommission from App UI**: Cleanly remove in-app UI gamepad and keyboard spatial navigation from the application interface, while keeping in-game emulator controls and hotkeys (like `L3`, `L3 + R3`, pause, reset) **100% untouched and functional**.
3. **Re-implement Cleanly**: Rebuild a robust, geometry-aware 2D bounding-box spatial navigation engine (`getBoundingClientRect()` nearest-neighbor projection) tailored first for Desktop UI, followed by Mobile UI.

---

## 2. Exhaustive Shortcuts & Controls Ledger (Parity Log)

This ledger captures all current keyboard shortcuts and gamepad button assignments across the entire application interface so they can be re-implemented without loss of capability:

### A. Gamepad Controls in Library / UI

| Gamepad Input | Standard / Xbox | PlayStation | Current UI Action | Target for Re-Implementation |
| :--- | :---: | :---: | :--- | :--- |
| **A Button** | `A` | `✕` Cross | Select / Confirm / Launch focused game / Trigger button | Desktop & Mobile |
| **B Button** | `B` | `○` Circle | Back / Cancel / Dismiss open modal or drawer / Revert focus | Desktop & Mobile |
| **X Button** | `X` | `□` Square | Open Metadata Scraper from main UI / Confirm & scrape in Scraper modal | Desktop & Mobile |
| **Y Button** | `Y` | `△` Triangle | Open Search On-Screen Virtual Keyboard (OSK) | Desktop & Mobile |
| **Select / Share** | `Select / Back` | `Share` | Toggle Favorite ⭐ on focused game card | Desktop & Mobile |
| **Start / Options** | `Start / Menu` | `Options` | Quick-launch focused game immediately / Complete onboarding | Desktop & Mobile |
| **L1 / Left Bumper** | `LB` | `L1` | Previous console system on ribbon / Previous tab in modal / Clear all (OSK) | Desktop & Mobile |
| **R1 / Right Bumper** | `RB` | `R1` | Next console system on ribbon / Next tab in modal / Submit (OSK) | Desktop & Mobile |
| **L3 (Thumbstick Click)**| `L3` | `L3` | Cycle cartridge tile density (`S` ➔ `M` ➔ `L` ➔ `XL` ➔ `XXL`) | Desktop |
| **R3 (Thumbstick Click)**| `R3` | `R3` | Toggle Panoramic Wide Grid Mode | Desktop |
| **D-Pad / Left Stick** | `D-Pad / Stick` | `D-Pad / Stick` | 2D Spatial direction (`UP`, `DOWN`, `LEFT`, `RIGHT`) across UI elements | Desktop & Mobile |

### B. Keyboard Shortcuts in Library / UI

| Key / Shortcut | Current UI Action | Target for Re-Implementation |
| :--- | :--- | :--- |
| **`Arrow Keys`** / **`WASD`** | 2D Spatial navigation across game cards, tabs, and buttons | Desktop |
| **`Enter`** / **`Space`** | Select / Confirm / Launch focused game card | Desktop |
| **`Escape`** / **`Backspace`** | Close open modal, dismiss drawer, or cancel action | Desktop |
| **`Cmd + K`** / **`Ctrl + K`** | Focus search input field and select existing text | Desktop |
| **`/` (Slash)** | Focus search bar or trigger virtual keyboard | Desktop |
| **`F`** | Toggle Favorite ⭐ on currently selected game card | Desktop |
| **`T`** | Toggle Theme (Dark Mode ↔ Light Mode) | Desktop |
| **`Q`** / **`PageUp`** | Switch to previous system tab / Previous modal tab | Desktop |
| **`E`** / **`PageDown`** | Switch to next system tab / Next modal tab | Desktop |
| **`M`** | Toggle Background Music (BGM) playback | Desktop |
| **`1` – `9`** | Instant switch to console system tab index | Desktop |

### C. On-Screen Virtual Keyboard (OSK) Controls

| Input | Controller Button | Keyboard Key | Action |
| :--- | :---: | :---: | :--- |
| **Navigate Keys** | `D-Pad / Left Stick` | `Arrow Keys` | Move cursor across 5-row virtual keyboard matrix |
| **Type Character** | `[A]` Button | `Enter` | Type focused character |
| **Backspace** | `[X]` Button | `Backspace` | Delete previous character |
| **Space** | `[Y]` Button | `Space` | Insert space character |
| **Clear All** | `[L1]` Left Bumper | `Ctrl + A, Del` | Clear entire search query string |
| **Submit** | `[R1]` Bumper / `Start` | `Enter` (on Enter key) | Commit search / text and return to grid |
| **Cancel** | `[B]` Button | `Escape` | Discard changes and close keyboard |

### D. In-Game Emulator Controls (STRICTLY PRESERVED — NEVER REMOVED)

The following controls belong to the active emulation runtime and **must remain 100% functional**:

| Input | Emulator Action | Status in this Refactor |
| :--- | :--- | :--- |
| **`L3 + R3` (Both Stick Clicks)** | Direct exit active game, flush battery save, and return to library | **PRESERVED** |
| **`L3` (Left Stick Click)** | Toggle in-game Topbar HUD / action menu | **PRESERVED** |
| **`Tab` or `` ` `` / `~`** | Toggle in-game Topbar HUD on keyboard | **PRESERVED** |
| **`Escape`** | Exit active game back to library on keyboard | **PRESERVED** |
| **Standard Gamepad Mapping** | `A, B, X, Y, D-Pad, Sticks, L1, R1, L2, R2, Start, Select` in core | **PRESERVED** |
| **Virtual Touch Controls** | Auto-hide on physical controller connect, auto-show on touch | **PRESERVED** |

---

## 3. Phase Plan & Implementation Progress

### Phase 1: Engine Foundation & Legacy Cleanup (✅ COMPLETED)
- **Goal**: Cleanly isolate emulator inputs from UI navigation and create modular 2D spatial utilities.
- **Accomplishments**:
  - Removed obsolete index-based UI navigation loops from `useGamepadNavigation.js`.
  - Created `src/utils/spatialNavigation.js` delivering geometric nearest-neighbor bounding-box scoring with directional bias (`UP`, `DOWN`, `LEFT`, `RIGHT`).
  - Preserved in-game emulator controls (`L3`, `L3 + R3`, audio SFX, battery telemetry) with 100% stability.

### Phase 2: Desktop Onboarding Wizard Navigation (✅ COMPLETED)
- **Goal**: Fully controllable desktop onboarding with keyboard, gamepad, and mouse.
- **Accomplishments**:
  - Phase 1 (Welcome & Platform Showcase): `Space`/`Enter` or Gamepad `A` to advance, `Esc`/`Start` to skip.
  - Phase 2 (Character Studio): Focus initializes on `Randomize`; `Q`/`L1` and `E`/`R1` bumper navigation between Archetypes and Custom tabs; 2D spatial navigation across 48 avatars, color circles, and inputs.
  - Phase 3 (DualShock Controls Visualizer): Full-height layout fitting all viewports; `Start`/`Escape` to complete.

### Phase 3: Mobile Onboarding (Screens 0–6) Navigation (✅ COMPLETED)
- **Goal**: Responsive, accessible mobile onboarding across all 7 screens with adaptive input detection.
- **Accomplishments**:
  - Tri-modal input detection: Automatic switching between Gamepad (`[ A ]`, `[ B ]`, `[ START ]`), Keyboard (`[ SPACE ]`, `[ DEL ]`, `[ ESC ]`), and Touch (zero badge clutter).
  - Screen 0 (Welcome): `Space`/`A` to Get Started, `Esc`/`Start` to Skip.
  - Screens 1–4 (Feature Showcases): `Space`/`A` Continue, `DEL`/`Backspace`/`B` Back, `Esc`/`Start` Skip, Arrow Up/Down & D-Pad vertical scroll.
  - Screen 5 (Character Studio): Starts on `Randomize`; `Q`/`L1` to Archetypes, `E`/`R1` to Custom; 2D spatial navigation across avatars and color palettes.
  - Screen 6 (You're All Set!): 2D spatial navigation between Load Custom ROM card, Explore Library button, Back, and Skip. Direct `L` (Keyboard) / `X` (Gamepad) to open Load ROM modal.

### Phase 4: Load Custom ROM & Ingestion Modal (✅ COMPLETED)
- **Goal**: Console-grade modal interaction for custom ROM loading.
- **Accomplishments**:
  - 2D spatial navigation between "Close" (✕), "Choose File(s)", "Choose ROMs Folder", and all 12 Supported Console Formats chips.
  - High-contrast visual badges: `[ A ]` (gamepad) and `[ SPACE ]` (keyboard) with bespoke blue/purple palettes.
  - Auto-scroll reset: Reaching the close button or top actions automatically smooth-scrolls modal body to top.
  - Confirmation via `Space` / `Enter` / Gamepad `A`; dismiss/exit via `Esc` / Gamepad `B`.

### Phase 5: Desktop App UI Spatial Navigation (📋 NEXT UP)
- **Goal**: Deterministic 2D spatial navigation across the main desktop application interface.
- **Scope**:
  - System Ribbon: `Q` / `E` or `[` / `]` or bumpers `L1` / `R1` to cycle consoles.
  - Cartridge Grid: D-pad / Arrow navigation across game tiles with smooth container scrolling.
  - Topbar Actions: Search, BGM music drawer, Settings, Hall of Fame.
  - Detail Drawers: Full keyboard & gamepad navigation inside game detail modal / Save Data Studio.

### Phase 6: Mobile App UI Spatial Navigation (📋 UPCOMING)
- **Goal**: Extend the spatial engine to mobile viewports (portrait feeds, bottom sheets, search overlays).
- **Scope**:
  - Horizontal system chip carousels with centered auto-scroll.
  - Mobile bottom sheets: Auto-focus primary action, D-Pad Left/Right for secondary actions.
  - Mobile search modal & filter trays.

### Phase 7: Emulator Controls & Hotkey Harmonization (📋 UPCOMING)
- **Goal**: Finalize and unify all in-game emulator controls, hotkey remapping, and gamepad configurations across all 12 emulated cores.

---

## 4. Integration & Execution Guide

1. **Keep In-Game Engine Untouched**:
   - Verify `if (stateRef.current.activeGame)` block in `useGamepadNavigation.js` remains the primary bypass route.
2. **Modular Helper Architecture**:
   - Pure DOM bounding-box calculation lives in `src/utils/spatialNavigation.js`.
3. **Declarative Markup Standard**:
   - Every focusable component MUST declare `data-nav="<zone>"` and `data-nav-id="<unique-id>"`.
4. **Validation Checklist**:
   - [x] Desktop Onboarding 100% accessible via Keyboard and Gamepad.
   - [x] Mobile Onboarding Screens 0–6 100% accessible via Keyboard and Gamepad.
   - [x] Load ROM Modal 100% accessible with auto-scroll and glitch-free badges.
   - [ ] Main Library Cartridge Grid 100% navigable with D-Pad and Arrow Keys.
   - [ ] In-game emulator controls (`L3`, `L3 + R3`, gameplay buttons) function with zero regressions.
   - [ ] Modals and drawers maintain 100% input isolation.


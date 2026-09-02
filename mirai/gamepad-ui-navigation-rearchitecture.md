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

## 3. Phase Plan & Detailed Logic

### Phase 1: Complete UI Navigation Removal
- **Goal**: Cleanly isolate emulator inputs from UI navigation.
- **Actions**:
  - Remove all UI spatial navigation loops, DOM queries (`.ds-rail-action-btn`, `.cardModal`, `.scraper-scope-tab`, `.character-studio-tab`), and synthetic keyboard event handlers that drive UI focus from `useGamepadNavigation.js`.
  - Disable legacy keyboard spatial navigation (`Arrow Keys`, `WASD`, `Q`, `E`) inside the UI shell so focus cannot jump to broken pseudo-coordinates.
  - Retain the gamepad connection status listener, battery telemetry, audio SFX triggers, and in-game controls (`activeGame` guards, `L3`, `L3 + R3`, `Escape`).

### Phase 2: Desktop UI Re-Implementation
- **Goal**: Build a deterministic 2D spatial navigation engine for desktop viewports.
- **Logic**:
  - Replace index-based guessing with **geometric bounding-box projection**:
    ```javascript
    // Calculate distance and angular alignment between current focused element and candidate elements
    const getCandidateDistance = (rectFrom, rectTo, direction) => {
      // Vector projection & nearest-neighbor collision detection
    };
    ```
  - Define clear spatial zones with explicit exit/entry ports:
    - `systemRibbon` ↔ `cartridgeGrid` ↔ `topbarIcons` ↔ `modalDialog`
  - Trap navigation strictly inside active modals and overlay drawers.

### Phase 3: Mobile UI Re-Implementation
- **Goal**: Extend the spatial engine to mobile viewports (portrait feeds, bottom sheets, search overlays).
- **Logic**:
  - Handle smooth scrolling for horizontal system chip carousels and vertical mobile cards:
    ```javascript
    candidateEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    ```
  - Mobile bottom sheets: Auto-focus the primary **Play** action, with `D-Pad Left/Right` toggling Favorite and Close.

---

## 4. Integration & Execution Guide

1. **Keep In-Game Engine Untouched**:
   - Verify `if (stateRef.current.activeGame)` block in `useGamepadNavigation.js` remains the primary bypass route.
2. **Implement New Modular Hook**:
   - Create `src/hooks/useSpatialNavigation.js` containing the pure DOM bounding-box calculation.
3. **Register Focusable Elements via Data Attributes**:
   - Use declarative markup: `data-nav="grid-card"`, `data-nav="system-tab"`, `data-nav="modal-action"` rather than fragile CSS class selectors.
4. **Validation Checklist**:
   - [ ] No ghost focus or pseudo-location outlines appear in library UI.
   - [ ] In-game emulator controls (`L3`, `L3 + R3`, gameplay buttons) function with zero regressions.
   - [ ] Modals and drawers maintain 100% input isolation.

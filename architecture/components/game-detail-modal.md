# GameDetailModal Component Specification

## 1. Description

The `GameDetailModal` component (`.info-modal-backdrop` + `.game-card-modal-content`) is an interactive drawer modal displayed when a player selects a game cartridge tile. It presents rich game metadata, 3D box artwork, release date, emulation core type, synopsis, real-time save data status, and launch action triggers.

---

## 2. Detailed List of What It Does

- **Rich Artwork & Details Presentation**: Displays game title, platform badge, release year, active EmulatorJS core, and summary description from `gameDescriptions.js`.
- **Spacious & Balanced 2-Column Layout**: 820px max-width container with 260px box art showcase, glossy borders, and ample horizontal breathing room.
- **Playtime & Session Stats Grid**: 3-column stats card showcasing total playtime duration (e.g. `1 hr 24 min`), launch session counts, and formatted last played dates.
- **⭐ Favorite Action & Badge**: Direct **Favorite ⭐** icon-only toggle button with active star fill and tooltip indicators.
- **Action Button Bar**: Balanced horizontal layout pairing the prominent **PLAY NOW** launcher button with circular icon-only buttons for **FAVORITE**, **EDIT METADATA** (Jellyfin style), and **RE-SCRAPE ART** immediately adjacent to each other.
- **Live Save Data Detection**:
  - Displays green `SAVE DATA DETECTED` badge if existing battery SRAM or state saves are discovered in `localStorage` or `IndexedDB`.
  - Displays neutral `NO SAVE DATA FOUND` badge for fresh game sessions.
- **Dynamic Action Button**: Adapts primary action label to either `CONTINUE / PLAY NOW` or `PLAY NOW`.
- **Spatial Gamepad & Keyboard Navigation**: Supports full focus navigation across Close (`X`), `Play` button, `Favorite` (`fav`), `Edit Metadata` (`editMeta`), and `Re-scrape Art` (`scrape`) via D-pad or Arrow keys, and dismisses on `Escape` or controller `B` button.
- **Mobile Responsive Breakpoints**: Gracefully shifts to a single column flow on screens `<= 640px` with a proportional 135px box art showcase, compact 3-metric analytics grid, side-by-side action bar, and vertical touch scrolling (`max-height: 88vh`) ensuring 100% visibility of all card elements on mobile devices.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `game` (Object): Game metadata object.
- `hasSaveData` (boolean): Flag from `useSaveDataManager` indicating whether prior save data exists.
- `isFavorite` (boolean): Whether the game is marked as a favorite.
- `onToggleFavorite` (function): Handler for toggling favorite state.
- `onResetStats` (function): Handler for resetting playtime and launch stats for the inspected game.
- `gameStats` (Object): Playtime metrics (`playtimeFormatted`, `launchCount`, `lastPlayedFormatted`).
- `gamepadConnected` (boolean): Whether a USB/Bluetooth controller is active.
- `focusedTarget` (Object): Target focus zone and ID.
- `onClose` (function): Dismisses the modal and returns focus to the grid.
- `onPlay` (function): Launches the active game in the `EmulatorModal` sandbox.
- `sfx` (Object): Web Audio sound synthesizer instance.

### Source Location
- Component: [src/components/GameDetailModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/GameDetailModal.jsx)

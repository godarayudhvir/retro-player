# GameDetailModal Component Specification

## 1. Description

The `GameDetailModal` component (`.info-modal-backdrop` + `.game-card-modal-wrapper` + `.game-card-modal-content`) is an interactive drawer modal displayed when a player selects a game cartridge tile. It presents rich game metadata, 3D box artwork, release date, emulation core type, synopsis, real-time save data status, launch action triggers, and seamless carousel navigation between ROMs in the active filter.

---

## 2. Detailed List of What It Does

- **Rich Artwork & Details Presentation**: Displays game title, platform badge, release year, active EmulatorJS core, and summary description from `metadata.json` / `gameDescriptions.js`.
- **Carousel Left/Right ROM Navigation**:
  - Floating circular left (`<ChevronLeft />`) and right (`<ChevronRight />`) navigation arrows allow players to browse between games in the active collection without closing and reopening the drawer.
  - Interactive tooltips (`Previous ROM: Left Arrow / Q / A / L1` and `Next ROM: Right Arrow / E / D / R1`).
  - Active position indicator pill in the header badge matrix displaying current ROM position (e.g. `4 / 27`).
- **Full Keyboard & Gamepad Control**:
  - **Keyboard**: Navigate between ROMs via **Left Arrow**, **Right Arrow**, **Q**, **E**, **A**, or **D**.
  - **Gamepad**: Navigate between ROMs via **L1 / R1** shoulder bumpers, D-Pad Left/Right, or Left Stick.
  - **Spatial Focus**: Seamless focus navigation across Left Arrow (`prevGame`), Right Arrow (`nextGame`), Close (`close`), `Play`, `Favorite` (`fav`), `Edit Metadata` (`editMeta`), and `Re-scrape Art` (`scrape`).
- **Live Save Data Detection**:
  - Displays green `SAVE DATA DETECTED` badge if existing battery SRAM or state saves are discovered in `localStorage` or `IndexedDB`.
  - Displays neutral `NO SAVE DATA FOUND` badge for fresh game sessions.
- **Dynamic Action Button**: Adapts primary action label to either `CONTINUE / PLAY NOW` or `PLAY NOW`.
- **Spacious & Balanced 2-Column Layout**: 820px max-width container with 260px box art showcase, glossy borders, and ample horizontal breathing room.
- **Playtime & Session Stats Grid**: 3-column stats card showcasing total playtime duration (e.g. `1 hr 24 min`), launch session counts, and formatted last played dates.
- **⭐ Favorite Action & Badge**: Direct **Favorite ⭐** icon-only toggle button with active star fill and tooltip indicators.
- **Action Button Bar**: Balanced horizontal layout pairing the prominent **PLAY NOW** launcher button with circular icon-only buttons for **FAVORITE**, **EDIT METADATA** (Jellyfin style), and **RE-SCRAPE ART** immediately adjacent to each other.
- **Mobile Responsive Breakpoints**: Gracefully shifts to a single column flow on screens `<= 640px` with a proportional 135px box art showcase, compact 3-metric analytics grid, side-by-side action bar, and vertical touch scrolling (`max-height: 88vh`) ensuring 100% visibility of all card elements on mobile devices.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `game` (Object): Game metadata object.
- `metadata` (Object): Active scraped/cached or local sidecar metadata.
- `hasSaveData` (boolean): Flag indicating whether prior save data exists.
- `isFavorite` (boolean): Whether the game is marked as a favorite.
- `onToggleFavorite` (function): Handler for toggling favorite state.
- `onResetStats` (function): Handler for resetting playtime and launch stats for the inspected game.
- `onPrevGame` (function): Switches to the previous ROM in the filtered collection.
- `onNextGame` (function): Switches to the next ROM in the filtered collection.
- `hasPrev` (boolean): Whether a previous game exists in the active filter.
- `hasNext` (boolean): Whether a next game exists in the active filter.
- `currentIndex` (number): 0-based index of the currently active ROM.
- `totalGames` (number): Total count of games in the active filter.
- `gameStats` (Object): Playtime metrics (`playtimeFormatted`, `launchCount`, `lastPlayedFormatted`).
- `gamepadConnected` (boolean): Whether a USB/Bluetooth controller is active.
- `focusedTarget` (Object): Target focus zone and ID.
- `onClose` (function): Dismisses the modal and returns focus to the grid.
- `onPlay` (function): Launches the active game in the `EmulatorModal` sandbox.
- `sfx` (Object): Web Audio sound synthesizer instance.

### Source Location
- Component: [src/components/GameDetailModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/GameDetailModal.jsx)

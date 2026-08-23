# GameDetailModal Component Specification

## 1. Description

The `GameDetailModal` component (`.info-modal-backdrop` + `.game-card-modal-wrapper` + `.game-card-modal-content`) is an interactive drawer modal displayed when a player selects a game cartridge tile. It presents rich game metadata, 3D box artwork, release date, emulation core type, synopsis, real-time save data status, launch action triggers, and seamless carousel navigation between ROMs in the active filter.

---

## 2. Detailed List of What It Does

- **Rich Artwork & Details Presentation**: Displays 3D game cartridge/cover showcase with physical sheen, platform badge, release year, active EmulatorJS core, and summary description from `metadata.json` / `gameDescriptions.js`.
- **Integrated Strategy Guides & Walkthroughs Hub**:
  - Seamlessly embedded Strategy & Walkthroughs tab directly in the modal (eliminating nested popup modals).
  - Lists written strategy guides (e.g. `unboundwiki.com`) and video playthroughs (e.g. YouTube playlists) with 1-click browser tab launch and toggleable mobile companion QR code.
- **Carousel Left/Right ROM Navigation**:
  - Floating circular left (`<ChevronLeft />`) and right (`<ChevronRight />`) navigation arrows allow players to browse between games in the active collection without closing and reopening the drawer.
  - Keyboard hotkeys (`Left`/`Right` arrow, `Q`/`E`, `A`/`D`) and gamepad shoulder bumpers (`L1`/`R1`).
- **Live Save Data Detection & SRAM Battery Memory Card Deck**:
  - LED status indicator for persistent battery save detection.
  - Direct actions to Import `.sav`, Export `.sav`, or Delete save data.
- **Dynamic Action Button**: Adapts primary action label to either `CONTINUE / PLAY NOW` or `PLAY NOW`.
- **Bespoke 2-Column Console Chassis**: 890px max-width container with 270px 3D cartridge showcase, glossy borders, and ample horizontal breathing room.
- **Playtime & Session Telemetry Deck**: 3-column stats card showcasing total playtime duration (with reset action), launch session counts, and formatted last played dates.
- **Action Button Stage**: Balanced horizontal layout pairing the prominent **PLAY NOW** launcher button with **Guides** tab toggle, **FAVORITE ⭐**, **EDIT INFO ✏️**, and **RE-SCRAPE ART 🔄**.
- **Mobile Responsive Breakpoints**: Gracefully shifts to a single column flow on screens `<= 640px` with proportional cartridge showcase, compact telemetry, and vertical scrolling ensuring 100% visibility on mobile devices.

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

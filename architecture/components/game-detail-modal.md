# GameDetailModal Component Specification

## 1. Description

The `GameDetailModal` component (`.info-modal-backdrop` + `.game-card-modal-content`) is an interactive drawer modal displayed when a player selects a game cartridge tile. It presents rich game metadata, 3D box artwork, release date, emulation core type, synopsis, real-time save data status, and launch action triggers.

---

## 2. Detailed List of What It Does

- **Rich Artwork & Details Presentation**: Displays game title, platform badge, release year, active EmulatorJS core, and summary description from `gameDescriptions.js`.
- **Live Save Data Detection**:
  - Displays green `SAVE DATA DETECTED` badge if existing battery SRAM or state saves are discovered in `localStorage` or `IndexedDB`.
  - Displays neutral `NO SAVE DATA FOUND` badge for fresh game sessions.
- **Dynamic Action Button**: Adapts primary action label to either `CONTINUE / PLAY NOW` or `PLAY NOW`.
- **Spatial Gamepad & Keyboard Navigation**: Supports focus navigation between Close (`X`) and Play buttons via D-pad or Arrow keys, and dismisses on `Escape` or `B` button.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `game` (Object): Game metadata object.
- `hasSaveData` (boolean): Flag from `useSaveDataManager` indicating whether prior save data exists.
- `focusedTarget` (Object): Target focus zone and ID.
- `onClose` (function): Dismisses the modal and returns focus to the grid.
- `onPlay` (function): Launches the active game in the `EmulatorModal` sandbox.

### Source Location
- Component: [src/components/GameDetailModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/GameDetailModal.jsx)

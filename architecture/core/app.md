# Main Application Shell & Orchestration (`architecture/core/app.md`)

## 1. Description
The Main Application Shell ([App.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/App.jsx)) serves as the central hub of **Retro Player**. It manages global application state, ROM catalog fetching, active system filtering, search state, gamepad navigation focus, game modal toggles, and dynamic cartridge color styling.

---

## 2. Detailed List of What It Does
- **System Top Bar**: Displays active player avatar badge, user tag, dynamic clock, search input bar, gamepad connectivity status badge, and system switching controls with shoulder button prompts.
- **Game Library Grid**: Renders responsive game cards dynamically filtered by search query and selected console tab.
- **Game Details Drawer / Modal**: Shows expanded game metadata, release date badge, game description from `gameDescriptions.js`, save data status (`IndexedDB` / `LocalStorage`), and launch button.
- **Global Input Event Hooks**: Registers keyboard (`Arrow` keys, `WASD`, `Enter`, `Escape`, `Q`, `E`) and Gamepad API polling loops for D-Pad / Stick navigation across the library UI.

---

## 3. Detailed Logic Behind Everything and How It Works

### Core Component State Hooks
- `games`: Array of indexed ROM objects fetched from `/api/roms`.
- `systems`: System metadata array including console names, cores, and counts.
- `activeSystem`: Currently selected system filter key (`'all'` or specific system key like `'gba'`, `'n64'`).
- `searchQuery`: Live search string filter.
- `activeGame`: Game object passed to `<EmulatorModal>` when emulator is running.
- `selectedGameCard`: Currently selected game card for detail inspection modal.
- `focusedTarget`: `{ zone: 'grid' | 'tabs', index: number }` for keyboard/gamepad focus navigation.

### Data Fetching & Filter Logic
- **`fetchGames()`**: Asynchronously calls `/api/roms` on mount, setting `games` and `systems`.
- **`filteredGames`**: Filters `games` where `title` or `systemName` matches `searchQuery` AND `systemKey` matches `activeSystem`, sorted chronologically by `getReleaseDate(game)`.
- **`getCartridgeColor(game)`**: Computes dynamic visual accent color based on title keywords (e.g., `#dc2626` for Red/FireRed, `#2563eb` for Blue, `#059669` for Emerald).

# Settings & Library Manager (`architecture/components/settings-modal.md`)

## 1. Description
The **Settings & Library Manager** (`SettingsModal.jsx`) is a centralized console management hub that allows players and host administrators to manage ROMs across all emulated platforms and manage the Background Music (BGM) collection directly from the UI with full upload and deletion support.

---

## 2. Detailed List of What It Does
- **ROM Management Tab**:
  - Live search and platform dropdown filters (NES, SNES, GBA, N64, PS1, Arcade, etc.).
  - Batch upload ROM files (`.nes`, `.snes`, `.gba`, `.n64`, `.nds`, `.iso`, `.cue`, `.chd`, `.zip`, etc.) to the host server disk.
  - Interactive deletion: Delete any game from host disk (`/api/delete-rom`) with confirmation guard and instant UI refresh.
  - Displays system badges, display titles, and exact disk filenames.
- **Background Music (BGM) Management Tab**:
  - Direct upload of audio tracks (`.mp3`, `.ogg`, `.wav`, `.flac`, `.m4a`, `.aac`) to the host BGM directory (`/api/upload-bgm`).
  - Interactive playback preview: Play/pause any track directly from the manager table.
  - Audio deletion: Delete any track from disk (`/api/delete-bgm`) with instant playlist refresh.
- **Topbar Integration**:
  - Compact icon button with a settings gear (`Settings`) in the topbar status group.
- **100% Gamepad & Keyboard Spatial Navigation**:
  - Full keyboard shortcuts (`Enter`, `Esc`, `Tab`, `Arrow keys`, `WASD`) and Gamepad support (D-Pad, A to select, B to close).
- **Theme Support**:
  - Styled with custom contrast overrides for all 4 themes (**iiSU Light**, **Midnight Cyber**, **Sony XMB**, and **DMG**).

---

## 3. Detailed Logic Behind Everything and How It Works

### Endpoints & Handlers
- **Upload ROM**: `POST /api/upload-rom` (`x-filename` header + raw stream buffer)
- **Delete ROM**: `POST /api/delete-rom` (`{ systemKey, filename, relativePath }`)
- **Upload BGM**: `POST /api/upload-bgm` (`x-filename` header + raw audio buffer)
- **Delete BGM**: `POST /api/delete-bgm` (`{ filename }`)
- Supported in both development mode (`vite.config.js` middlewares) and production Docker environment (`server.js`).

### Source Locations
- Component: [src/components/SettingsModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsModal.jsx)
- Topbar: [src/components/Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx)
- Spatial Engine: [src/hooks/useGamepadNavigation.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useGamepadNavigation.js)
- Server Endpoints: [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js) & [vite.config.js](file:///Users/godarayudhvir/Github/retro-player/vite.config.js)

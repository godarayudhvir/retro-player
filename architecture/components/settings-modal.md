# System Settings & Library Manager Menu (`architecture/components/settings-modal.md`)

## 1. Description
The **System Settings & Library Manager Menu** (`SettingsView.jsx`) is a full-screen Nintendo Switch-inspired console settings page with a 2-column layout (left category sidebar navigation and right interactive detail settings pane). It allows players to manage ROM files, background music playlists, visual themes, gamepad mappings, and inspect host Docker volume storage diagnostics.

---

## 2. Detailed List of What It Does
- **Switch-Style 2-Column Split View**:
  - **Left Category Sidebar**:
    1. 📦 **ROM Library & Storage**: Live title search, system dropdown filter, and dual bulk upload actions (`Upload ROMs` multi-file batch & `Upload Folder` recursive subfolder directory picker).
    2. 🎵 **Background Music (BGM)**: Audio track list, audio upload, live playback preview with play/pause buttons, and track deletion.
    3. 🎨 **Themes & Visuals**: Live theme switcher cards for **iiSU Light**, **Midnight OLED**, **Cyber Neon**, and **Sony XMB Wave**, plus real-time Web Audio SFX mute/unmute toggle.
    4. 🎮 **Controllers & Keys**: Gamepad connection indicator and full controller & keyboard shortcut mapping reference.
    5. ℹ️ **System & Diagnostics**: Real-time status of `./roms` and `./bgm` Docker volume mounts, total indexed games, and IndexedDB permanent storage state.
- **Top Header & Bottom HUD Guide**:
  - Top header with return button (`Back` / `Esc` / `B` button) and Station badge.
  - Bottom controller HUD with key prompts (`[B] Back to Games`, `[A] Select Option`, `[D-Pad] Navigation`).
- **100% Gamepad & Keyboard Spatial Navigation**:
  - Smooth 2D directional navigation, hotkey support (`Esc`, `B` button to return, `Enter`, `A` button to select).
- **Theme Support & Mobile Responsiveness**:
  - Full dark mode & dynamic theme compatibility with mobile-responsive horizontal scrolling tabs for phones and tablets.

---

## 3. Detailed Logic Behind Everything and How It Works

### Endpoints & Handlers
- **Upload ROM**: `POST /api/upload-rom` (`x-filename` header + raw stream buffer)
- **Delete ROM**: `POST /api/delete-rom` (`{ systemKey, filename, relativePath }`)
- **Upload BGM**: `POST /api/upload-bgm` (`x-filename` header + raw audio buffer)
- **Delete BGM**: `POST /api/delete-bgm` (`{ filename }`)
- Supported in both development mode (`vite.config.js` middlewares) and production Docker environment (`server.js`).

### Source Locations
- Component: [src/components/SettingsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsView.jsx)
- Topbar: [src/components/Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx)
- Spatial Engine: [src/hooks/useGamepadNavigation.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useGamepadNavigation.js)
- Server Endpoints: [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js) & [vite.config.js](file:///Users/godarayudhvir/Github/retro-player/vite.config.js)

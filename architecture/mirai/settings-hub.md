# Settings & Library Management Hub (`architecture/mirai/settings-hub.md`)

## 1. Description

The **Settings & Library Management Hub** was a full-screen console management modal (`SettingsModal.jsx`) that provided a 3-tab interface for ROM library administration, BGM track management, and storage diagnostics.

**Current Status: Removed & Archived.**
The component was deliberately removed from the live application — the UI was functional but visually inconsistent with the overall console aesthetic and did not meet the quality bar required for the user-facing shell. The source file (`SettingsModal.jsx`) has been deleted. Leftover dead state (`showSettingsModal`, `case 'settings'`) was also purged from `EmulatorModal.jsx`.

**All underlying server infrastructure remains intact** — the REST endpoints (`/api/upload-rom`, `/api/upload-bgm`, `DELETE /api/roms/:systemKey/:filename`, `DELETE /api/bgm/:filename`) and the client-side utility (`src/utils/storageCleaner.js`) are still fully operational. The system just has no UI surface to invoke them from.

**Future Goal:** Redesign and reintroduce this as a premium-grade, console-native settings experience — aesthetically integrated with the Vanilla and DS Touch themes, accessible from the Topbar, and built to the same quality standard as the rest of the shell.

---

## 2. Detailed List of What It Will Do

### Settings Tabs
A **3-tab split layout** navigable via keyboard (`Tab` / Arrow keys) and gamepad (D-pad Left/Right):

#### Tab 1 — ROM Library Manager
- **Dual Upload Modes**:
  - **Upload File(s)**: Multi-file picker accepting all known ROM extensions (`.gba`, `.nes`, `.snes`, `.nds`, `.z64`, `.md`, `.gb`, `.gbc`, `.gg`, `.iso`, `.chd`, `.cue`, `.zip`, `.a26`). POSTs each file to `/api/upload-rom`.
  - **Upload Folder (Recursive)**: `<input webkitdirectory>` walks entire directory trees and dispatches all valid ROM files individually. Essential for bulk library seeding.
- **ROM Library List**: Paginated, searchable list of every installed ROM with system badge, filename, and file size. Filterable by console system.
- **Per-ROM Delete**: Each entry has a trash button. Triggers an in-app `ConfirmModal` before executing `DELETE /api/roms/:systemKey/:filename` and refreshing the catalog.
- **Upload Progress HUD**: Inline success/failed count banner after batch operations (auto-clears after 5 seconds).

#### Tab 2 — BGM Track Manager
- **Upload Track(s)**: File picker accepting `.mp3`, `.ogg`, `.wav`, `.flac`. POSTs to `/api/upload-bgm`.
- **Track List**: Scrollable list of all installed BGM tracks with filename and delete control.
- **Per-Track Delete**: In-app `ConfirmModal` → `DELETE /api/bgm/:filename` → BGM engine rescan.

#### Tab 3 — General / Storage
- **Storage Diagnostics**: Reads `navigator.storage.estimate()` to display IndexedDB usage and quota.
- **Clear Browser Cache**: Calls `clearBrowserCacheAndData()` from `src/utils/storageCleaner.js` after `ConfirmModal` confirmation. Purges all emulator save states, favorites, playtime records, and scraper metadata cache from IndexedDB.
- **Future**: System information panel (emulator core versions, service worker cache status, last scrape timestamp).

### Design Requirements for Redesign
- Must feel native to the Vanilla and DS Touch themes — not a generic modal overlay.
- **Vanilla theme**: Full-width slide-in panel from the right edge (like a Nintendo Switch system settings), not a centered popup. Dark/light mode aware.
- **DS Touch theme**: Bottom-screen system panel with proper graph paper styling.
- All destructive actions must use the existing `ConfirmModal` pattern — zero native browser popups.
- 100% keyboard and gamepad navigable — focus ring consistent with the rest of the shell.
- Accessible from a **Settings gear icon** in the Topbar (between the scraper button and the theme studio button).
- Mobile: available as a full-screen stage within `MobileAppView` (replacing the current dead-end).

---

## 3. Detailed Logic Behind It

### Existing Infrastructure (Preserved, Ready to Use)

**Server Endpoints** (all live in `server.js` / Vite middleware):
```
POST   /api/upload-rom          — multipart, uploads ROM to /roms/<systemKey>/
POST   /api/upload-bgm          — multipart, uploads track to /bgm/
DELETE /api/roms/:systemKey/:filename
DELETE /api/bgm/:filename
GET    /api/roms                — returns full game catalog (existing hook: useRomManifest)
```

**Client Utilities**:
- `src/utils/storageCleaner.js` → `clearBrowserCacheAndData()`: Wipes all IndexedDB stores (saves, metadata cache, playtime, favorites). Ready to call directly.
- `src/utils/systemDetector.js` → `detectSystemFromExtension(filename)`: Auto-routes uploaded files to the correct system folder.

**State that needs wiring in App.jsx**:
```javascript
const [showSettingsModal, setShowSettingsModal] = useState(false);
// Pass to Topbar: onOpenSettingsModal={() => setShowSettingsModal(true)}
// Render: <SettingsModal isOpen={showSettingsModal} onClose={...} games={games} systems={systems} fetchGames={fetchGames} bgm={bgm} sfx={sfx} />
```

### Previous Implementation Reference
The deleted `SettingsModal.jsx` had:
- `activeTab` state: `'roms' | 'bgm' | 'general'`
- `romSearch`, `selectedSystemFilter`, `isUploading`, `uploadStatus`, `deletingId`, `pendingConfirm`
- `fileInputRef` / `folderInputRef` for programmatic file picker triggers
- Internal `ConfirmModal` for destructive confirmations
- Upload loop iterating over `e.target.files` dispatching sequential `fetch(POST /api/upload-rom)` per file

The core logic was sound — only the visual layer needs a full redesign pass before reintroduction.

---

## 4. Detailed Guide of How to Set It Up

### Step 1 — Create the new component
```
src/components/SettingsHub.jsx   ← renamed from SettingsModal for clarity
```
Design to theme spec above. Use the Vanilla/DS theme-aware CSS tokens already in `index.css`.

### Step 2 — Wire into App.jsx
```javascript
import SettingsHub from './components/SettingsHub';

// State
const [showSettingsHub, setShowSettingsHub] = useState(false);

// In JSX render (desktop path, after ThemeSwitcherModal)
<SettingsHub
  isOpen={showSettingsHub}
  onClose={() => { setShowSettingsHub(false); sfx.playModalClose(); }}
  games={games}
  systems={systems}
  fetchGames={fetchGames}
  bgm={bgm}
  sfx={sfx}
  focusedTarget={focusedTarget}
  setFocusedTarget={setFocusedTarget}
  gamepadConnected={gamepadConnected}
/>
```

### Step 3 — Add Topbar trigger
Add a `Settings` / `Sliders` icon button to `Topbar.jsx` that calls `onOpenSettingsHub()` prop. Register it in the gamepad spatial navigation map in `useGamepadNavigation.js`.

### Step 4 — Add to gamepad navigation
In `useGamepadNavigation.js`, register `'settingsHub'` as a topbar focus target between `'theme'` and `'scraper'`. Wire `A` button to open and `B` / `Escape` to close.

### Step 5 — Mobile integration
Inside `MobileAppView.jsx`, add a `⚙️ Settings` button to the mobile topbar action group. Render `SettingsHub` as a full-screen stage overlay when active.

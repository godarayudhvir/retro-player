# Console Settings & Library Manager Modal (`architecture/components/settings-modal.md`)

## 1. Description

The `SettingsModal` component is a full-screen Nintendo Switch-style console management hub accessible from the Topbar. It presents a 3-tab split layout — **ROMs**, **BGM**, and **General** — for library management, background music administration, and storage diagnostics. Every action is operable via keyboard and gamepad spatial navigation.

---

## 2. Detailed List of What It Does

- **3-Tab Navigation** (`activeTab`: `'roms'` | `'bgm'` | `'general'`):
  - Tab switching via arrow keys or D-pad Left/Right; active tab rendered with bold accent underline.

- **ROMs Tab (`'roms'`)**:
  - **Dual ROM Uploader**:
    - **Upload File(s)**: Hidden `<input type="file" multiple>` accepting all known ROM extensions. Uploads each file to `/api/upload-rom` via multipart `POST` and rescans the library on completion.
    - **Upload Folder (Recursive)**: Hidden `<input type="file" webkitdirectory>` allowing a full directory tree upload. Recursively walks all files and dispatches individual upload requests.
  - **ROM Library List**: Scrollable list of all installed ROMs, filterable by system (`selectedSystemFilter`) and title search query (`romSearch`). Each row shows filename and system badge.
  - **Delete ROM**: Each ROM entry exposes a trash button. Clicking triggers a `ConfirmModal` dialog before executing `DELETE /api/roms/:systemKey/:filename` and rescanning.
  - **Upload Progress**: `isUploading` state drives a progress spinner and `uploadStatus` banner (success / error counts).

- **BGM Tab (`'bgm'`)**:
  - **Upload Track(s)**: File input (`.mp3`, `.ogg`, `.wav`, `.flac`) uploading to `/api/upload-bgm`.
  - **BGM Track List**: Scrollable list of all installed background music tracks. Each entry shows the track filename and a delete button.
  - **Delete Track**: Triggers `ConfirmModal` before executing `DELETE /api/bgm/:filename`. Triggers BGM engine re-scan.

- **General Tab (`'general'`)**:
  - **Storage Diagnostics**: Displays IndexedDB and localStorage usage estimates (via `navigator.storage.estimate()`).
  - **Clear Browser Cache**: Triggers `clearBrowserCacheAndData()` from `src/utils/storageCleaner.js` with `ConfirmModal` confirmation. Purges all emulator save states, favorites, playtime, and cached metadata from IndexedDB.

- **In-App Confirmation Dialogs**: All destructive actions (ROM delete, track delete, cache clear) route through `ConfirmModal` — zero native browser `confirm()` popups.

- **100% Keyboard & Gamepad Navigation**:
  - `Escape` / `B` button closes the modal and returns focus to Topbar.
  - Tab navigation between header tabs.
  - Arrow keys navigate the ROM/BGM lists.
  - `Enter` / `A` confirms selection or triggers action buttons.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `isOpen` (boolean): Controls modal visibility.
- `onClose` (function): Closes modal and returns focus.
- `games` (Array): Full ROM catalog from `useRomManifest` — used to populate the ROM list.
- `systems` (Array): Available console systems — used to populate system filter dropdown.
- `fetchGames` (function): Refetches the ROM catalog after upload/delete operations.
- `bgm` (Object): BGM engine instance from `useBgmEngine` — exposes track list and refresh methods.
- `sfx` (Object): Web Audio synthesizer for tactile feedback.
- `focusedTarget` & `setFocusedTarget` (Object/function): Spatial navigation state.
- `gamepadConnected` (boolean): Whether a USB/Bluetooth controller is active.

### Key Internal State
- `activeTab`: `'roms'` | `'bgm'` | `'general'` — controls rendered panel.
- `romSearch`: Live text filter applied to the ROM list.
- `selectedSystemFilter`: System key filter (`'all'` or a specific console key).
- `isUploading`: Boolean upload in-progress flag.
- `uploadStatus`: `{ success: number, failed: number }` result summary after batch upload.
- `deletingId`: Tracks which ROM/BGM entry is awaiting deletion confirmation.
- `pendingConfirm`: `{ title, message, onConfirm }` — drives `ConfirmModal` display.

### Upload Flow
1. User clicks "Upload File(s)" or "Upload Folder" button.
2. `<input>` ref is triggered programmatically (`fileInputRef.current.click()`).
3. On file selection, `isUploading` set to `true`.
4. Each file dispatched to `POST /api/upload-rom` as `multipart/form-data`.
5. On completion, `fetchGames()` is called to rescan and refresh the ROM catalog.
6. `uploadStatus` banner rendered for 5 seconds then cleared.

### Source Location
- Component: [src/components/SettingsModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsModal.jsx)
- Storage Cleaner Utility: [src/utils/storageCleaner.js](file:///Users/godarayudhvir/Github/retro-player/src/utils/storageCleaner.js)

# System-by-System Save Capabilities & State Architecture

This document provides a comprehensive breakdown of **Snapshot Save States** (Quick Save/Load) and **In-Game Battery Saves** (`.sav` / SRAM / Virtual Memory Cards) across supported console platforms in Retro Player.

---

## 💾 Core Save Architecture

Retro Player maintains a dual-tier save persistence layer strictly namespaced by **Player Profile**:

```
                               ┌──────────────────────────────────────────────┐
                               │             RetroPlayerDB (IDB)              │
                               │                                              │
                               │  STORES.GAME_SAVES: save_${profileId}_${id}  │
                               │  STORES.SAVE_STATES: state_${profileId}_${id}│
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
 ┌───────────────────────────┐      Auto-Injection on Boot      ┌───────────────────────────┐
 │       Player 1 (Ash)      │ ───────────────────────────────> │  Emscripten Virtual FS    │
 │ Active Profile: prof_1    │                                  │  /saves/<rom>.srm         │
 └───────────────────────────┘                                  └─────────────┬─────────────┘
                                                                              │
 ┌───────────────────────────┐      FS Sanitization on Boot                   ▼
 │       Player 2 (Gary)     │ ───────────────────────────────> ┌───────────────────────────┐
 │ Active Profile: prof_2    │    (No save found = Clean FS)    │  Libretro Emulation Core  │
 └───────────────────────────┘                                  │  (Runs in Browser WASM)   │
                                                                └───────────────────────────┘
```

### 1. In-Game Battery Saves (`.sav` / SRAM / `.srm`)
- **Profile Scoping**: Stored under `save_${activeProfileId}_${gameId}` in `STORES.GAME_SAVES`.
- **Pre-Launch Injection**: If the active player has an existing battery save, the raw byte array is injected into the Emscripten virtual filesystem before the core starts.
- **FS Sanitization for Fresh Players**: When a player with no prior save starts the game, shared internal databases (`EJS_disableDatabases = true`) are bypassed and Emscripten FS is cleaned so the game boots directly into **"New Game"** without cross-profile save bleeding.
- **Auto-Syncing**: Any in-game save flush during gameplay or on emulator exit commits the updated SRAM back to the active player's profile in IndexedDB.
- **Dedicated Export (`.sav`)**: Dedicated button to download the in-game cartridge SRAM save file (`<Game>_Save_<Date>.sav`) to mobile or desktop devices.
- **Import Support**: Drag & drop or upload existing `.sav` / `.srm` battery saves directly into the active player's profile.

### 2. Dual-Slot Snapshot Save States (`.state`)
- **Profile Scoping**: Stored under `state_${activeProfileId}_${gameId}` in `STORES.SAVE_STATES`.
- **Slot 0 (Manual Quick Save)**: Created manually via the in-game Topbar / Sub-Toolbar (`Save` / `Load` or `F2` / `F4`). Instant save and restore.
- **Slot 1 (Automatic Resume State)**: Created automatically whenever you close the game (via topbar `✕`, controller `L3+R3`, or mobile edge swipe-back). Stored under `state_auto_${activeProfileId}_${gameId}`. On next game launch, an interactive 10-second countdown prompt offers one-click resume directly back to the exact frame where you left off.
- **450ms Graceful Exit Buffer**: Heavy WebAssembly cores (e.g. Nintendo DS DeSmuME/MelonDS, PS1) are provided a 450ms graceful buffer on exit to flush Emscripten virtual memory to IndexedDB before unmounting the iframe.
- **Mobile Swipe-Back Auto-Save**: Left-edge swipe gesture on mobile routes through the graceful exit sequence, ensuring full save state synchronization before returning to the library.
- **Auto-Resume Preference Toggle**: Players can enable or disable automatic session resume globally via the **AUTO-RESUME** micro-switch pill in the Desktop Topbar or under Preferences in the Mobile Game Details Sheet (`retro_auto_resume_enabled` in `localStorage`). When disabled, games boot fresh directly to title screens without waiting on the countdown prompt.
- **Dedicated Dual-Slot Export (`.state`)**: Exporting quick saves downloads both Slot 0 (`..._QuickSave_Slot0_...state`) and Slot 1 (`..._AutoResume_Slot1_...state`) if present.
- **Import Support**: Uploading any `.state` snapshot file targets the appropriate slot and updates all aliases.
- **Arcade/MAME Machine Handling**: Classic discrete arcade PCB hardware without snapshot support automatically hides Save/Load controls from the Game Detail tab and in-game HUDs to prevent false state traps.

### 3. Integrated Save Studio & Topbar Controls
Within both Desktop (Topbar & Nintendo DS View) and Mobile (Game Details Sheet), Save management provides:
- **💾 Auto-Resume Slider Switch**: Instant toggle on the desktop topbar to enable/disable automated session restoration with full gamepad/keyboard spatial navigation.
- **📥 Export Battery Save (.sav)**: Download in-game cartridge SRAM save file.
- **📥 Export Quick Save (.state)**: Download emulator snapshot state files (Slot 0 Quick Save and Slot 1 Auto-Resume).
- **📤 Import Save / State (.sav / .state)**: Upload `.sav` battery saves or `.state` snapshots with auto-routing.
- **🗑️ Delete All Saved Data**: Erase both in-game battery RAM and quick save states (Slot 0 + Slot 1) for a complete game reset.

---

## 🕹️ System Compatibility Matrix

| Platform | In-Game Battery Saves (`.sav` / SRAM) | Snapshot Save States (Quick Save & Auto-Resume) | Native File Extension |
| :--- | :---: | :---: | :---: |
| **Game Boy Advance (`gba`)** | ✅ Supported | ✅ Supported | `.sav` / `.srm` |
| **Game Boy Color (`gbc`)** | ✅ Supported | ✅ Supported | `.sav` / `.srm` |
| **Game Boy DMG (`gb`)** | ✅ Supported | ✅ Supported | `.sav` / `.srm` |
| **Nintendo DS (`nds`)** | ✅ Supported | ✅ Supported | `.dsv` / `.sav` |
| **Super Nintendo (`snes`)** | ✅ Supported | ✅ Supported | `.srm` / `.sav` |
| **NES (`nes`)** | ✅ Supported | ✅ Supported | `.sav` / `.srm` |
| **Nintendo 64 (`n64`)** | ✅ Supported | ✅ Supported | `.sra` / `.fla` / `.eep` |
| **Sega Genesis (`sega_genesis`)** | ✅ Supported | ✅ Supported | `.srm` / `.sav` |
| **Sega Game Gear (`game_gear`)** | ✅ Supported | ✅ Supported | `.sav` / `.srm` |
| **PlayStation 1 (`playstation`)** | ✅ Supported (Memory Card) | ✅ Supported | `.mcr` / `.sav` |
| **Atari 2600 (`atari_2600`)** | N/A (Cartridge ROM) | ✅ Supported | `.state` |
| **Arcade MAME (`arcade`)** | ✅ Supported (NVRAM) | Driver Dependent (Attract Mode Boot) | `.nv` / `.state` |

---

## 🌐 Storage by Deployment Environment

| Deployment Environment | Primary Storage Location | Persistence & Sync Mechanism | Backup Procedure |
| :--- | :--- | :--- | :--- |
| **GitHub Pages / Static Web (`*.github.io`)** | Browser `IndexedDB` (`RetroPlayerDB`) | **100% Client-Side**: Saves and states are stored directly in the user's browser sandbox on that specific device. Zero server dependency. | Open **Storage & Database Studio** in the UI to download a full `retroplayer-backup.json` snapshot, restore data, or manage local caches, or click **Export Save** on any specific game drawer for the raw `.sav` file. |
| **Docker / Self-Hosted Server** | Host Disk: `/data/retroplayer_db.json` | **Dual-Sync**: Writes to local `IndexedDB` instantly and syncs to the server API (`/api/db/*`). Saves follow user profiles across any device connected to the server. | Either copy the single `data/retroplayer_db.json` file on the host machine, or open **Storage & Database Studio** in the UI to export a `.json` snapshot. |


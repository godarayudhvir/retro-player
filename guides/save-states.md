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
- **Import / Export**: Full support for exporting `.sav` files to desktop or importing existing battery saves directly into the current profile.

### 2. Snapshot Save States (`.state` / Quick Save)
- **Profile Scoping**: Stored under `state_${activeProfileId}_${gameId}` in `STORES.SAVE_STATES`.
- **Real-Time Snapshots**: Full RAM and CPU register state capture via Quick Save (`F2` / Gamepad Quick Save) and instant restore via Quick Load (`F4` / Gamepad Quick Load).
- **Isolation**: Completely decoupled across player profiles; Player 2 cannot overwrite or load Player 1's quick save state.

---

## 🕹️ System Compatibility Matrix

| Platform | In-Game Battery Saves (`.sav` / SRAM) | Snapshot Save States (Quick Save) | Native File Extension |
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
| **Arcade MAME (`arcade`)** | ✅ Supported (NVRAM) | ✅ Supported | `.nv` / `.state` |

---

## 🌐 Storage by Deployment Environment

| Deployment Environment | Primary Storage Location | Persistence & Sync Mechanism | Backup Procedure |
| :--- | :--- | :--- | :--- |
| **GitHub Pages / Static Web (`*.github.io`)** | Browser `IndexedDB` (`RetroPlayerDB`) | **100% Client-Side**: Saves and states are stored directly in the user's browser sandbox on that specific device. Zero server dependency. | Click the **Export Save** button on any game's cartridge/drawer to download the raw `.sav` file. |
| **Docker / Self-Hosted Server** | Host Disk: `/data/retroplayer_db.json` | **Dual-Sync**: Writes to local `IndexedDB` instantly and syncs to the server API (`/api/db/*`). Saves follow user profiles across any device connected to the server. | Copy the single `retroplayer_db.json` file located in your host machine's mounted `/data` volume directory. |


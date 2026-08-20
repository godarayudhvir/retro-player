# 🎮 System-by-System Save Capabilities & State Architecture

This document provides a comprehensive breakdown of **Snapshot Save States (Quick Save/Load)** vs **In-Game Battery Saves (`.sav` / Virtual Memory Cards)** across all 12 supported console platforms in Retro Player.

---

## 📊 Emulation Core Save Capabilities Matrix

| System / Console | Emulation Core | ⚡ Quick Save States (Snapshot Freezes) | 💾 In-Game Battery Saves (`.sav` / Memory Card) | Technical Specifications & Storage Details |
| :--- | :--- | :---: | :---: | :--- |
| **Game Boy Advance (GBA)** | `mGBA` | 🟢 **100% Instant** | 🟢 **100% Persistent** | Full instantaneous RAM/VRAM serialization and Flash/EEPROM `.sav` auto-sync. |
| **Super Nintendo (SNES)** | `Snes9x` | 🟢 **100% Instant** | 🟢 **100% Persistent** | Low-latency memory snapshot and battery SRAM auto-persistence. |
| **Game Boy & GBC** | `Gambatte` | 🟢 **100% Instant** | 🟢 **100% Persistent** | Real-Time Clock (RTC) sync, fast serialization, and `.sav` auto-injection. |
| **Nintendo (NES)** | `FCEUmm` | 🟢 **100% Instant** | 🟢 **100% Persistent** | Full snapshot freeze and battery RAM persistence. |
| **Sega Genesis / Mega Drive** | `Genesis Plus GX` | 🟢 **100% Instant** | 🟢 **100% Persistent** | Complete 68000 state serialization and on-cartridge battery save auto-sync. |
| **Sega Game Gear** | `Genesis Plus GX` | 🟢 **Supported** | 🟢 **Supported** | Supported via multi-tier fallback hooks in `EmulatorModal.jsx`. |
| **Nintendo DS (NDS)** | `MelonDS` | 🟡 **Core Dependent** | 🟢 **100% Persistent** | In-game saves (save points, Pokémon Centers) persist automatically; heavy 3D titles with large dynamic memory buffers rely on battery `.sav`. |
| **Nintendo 64 (N64)** | `Mupen64Plus` | 🟡 **Core Dependent** | 🟢 **100% Persistent** | WebAssembly JIT dynamic recompiler memory heap makes snapshots variable; in-game battery saves work 100%. |
| **Sony PlayStation (PS1)** | `PCSX-ReARMed` | 🟡 **Disc Sector Dependent** | 🟢 **100% Persistent** | Virtual PS1 Memory Card (`.mcd` / `.sav`) auto-saves natively on in-game save prompts. |
| **Atari 2600** | `Stella` | 🟡 **Cartridge Dependent** | ⚪ **N/A** | Most original 1977–1982 Atari cartridges lacked save hardware entirely. |
| **Arcade (MAME)** | `MAME 2003+` | 🔴 **Unsupported by Hardware** | ⚪ **N/A** | Original coin-op arcade cabinets were designed for coin insertion and lack battery save state hardware at the board level. |

---

## 💾 How Save Architecture Works in Retro Player

### 1. In-Game Battery RAM & Memory Card Auto-Flush Engine
* **Automatic Background Extraction**: Every 10 seconds during active gameplay and upon closing the emulator, Retro Player extracts the active Emscripten virtual filesystem SRAM bytes (`gameManager.FS.readFile`).
* **Profile-Scoped Storage**: Save files are isolated per user profile in **IndexedDB** (`STORES.GAME_SAVES`) under `save_${activeProfileId}_${gameId}` and synchronized with localStorage.
* **Pre-Boot SRAM Injection**: On every game boot, existing `.sav` bytes are read from IndexedDB and pre-written into the Emscripten VFS before the core boots, ensuring that in-game menus display **CONTINUE** with zero lost progress.

---

### 2. Quick Save Snapshot States (`S` Settings HUD)
* **Instant Freeze**: Serializes the active CPU register, VRAM, and APU state into a Base64 binary payload.
* **Profile Scoping**: Snapshots are saved under `state_${activeProfileId}_${gameId}` in `STORES.SAVE_STATES`.
* **Multi-Tier Dispatch**: Tries `emu.gameManager.getState()`, `emu.saveState()`, and `emu.gameManager.functions.saveState()` with graceful fallbacks.

---

## 💡 Best Practice Recommendations
1. **For 8-Bit & 16-Bit Games (NES, SNES, GBA, GB, GBC, Sega, Game Gear)**:
   * Feel free to use both **Quick Save / Quick Load** in the settings menu and standard in-game saves interchangeably.
2. **For 3D & Disc Systems (Nintendo DS, Nintendo 64, PS1)**:
   * Always save using the **in-game save menu** (e.g. Save Point, Memory Card Slot, or Grand Prix Cup finish). Retro Player will automatically preserve your `.sav` file permanently across all sessions and device restarts.

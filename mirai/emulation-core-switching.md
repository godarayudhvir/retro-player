# Dynamic Emulation Core Switching & Per-Game Core Overrides

## 1. Description

Currently, Retro Player maps each of the 12 supported gaming systems to a single dedicated WebAssembly emulation core. While this provides instant zero-configuration compatibility, certain ROM hacks, specialized chips, and performance-constrained devices benefit greatly from alternate emulation cores (e.g., lightweight cores on low-end mobile vs high-accuracy cycle-accurate cores on desktop).

This specification defines a **Dynamic Core Switching Engine** that enables players to customize and override the active emulation core both globally per-system and per-game cartridge without restarting the application or rebuilding assets.

---

## 2. Detailed List of What It Will Do

### 2.1 Multi-Core Catalog per System
The core switcher provides curated WebAssembly core selections per platform:
* **Game Boy Advance (`gba`)**: `mGBA` (High accuracy, solar sensor, gyro) vs `VBA-Next` / `GPSP` (Ultra-low CPU overhead on low-end mobile).
* **Game Boy & Game Boy Color (`gb` / `gbc`)**: `Gambatte` (Accurate audio & colorization) vs `SameBoy` (Cycle-accurate audio & custom palettes) vs `Gearboy`.
* **Super Nintendo (`snes`)**: `Snes9x` (Broad compatibility & high performance) vs `bsnes` (Cycle-accurate chip timing) vs `Snes9x 2005` (Ultra-lightweight).
* **NES (`nes`)**: `FCEUmm` (Versatile mapper support) vs `Nestopia UE` (Cycle-accurate timing) vs `QuickNES`.
* **Nintendo 64 (`n64`)**: `Mupen64Plus-Next` (High compatibility) vs `Parallel N64` (Angrylion software rendering & low-level RSP).
* **Nintendo DS (`nds`)**: `MelonDS` (Accurate 2D/3D & mic/touch) vs `DeSmuME` (Advanced graphical enhancements & high-res render).
* **PlayStation 1 (`ps1`)**: `Beetle PSX` (Accurate CD timing & audio) vs `PCSX ReARMed` (Optimized dynarec for ARM & mobile devices).
* **Sega Genesis & Game Gear (`genesis` / `gamegear`)**: `Genesis Plus GX` (Accurate sound chips) vs `Picodrive` (Lightweight 32X/CD engine).

### 2.2 User-Facing Features & UI Integration
* **Per-Game Core Override in Game Details**: The Cartridge Details view and inline Edit Studio provide an **"Emulation Core"** dropdown allowing players to select a specific core for any individual ROM (e.g., forcing a complex ROM hack onto a cycle-accurate core).
* **Global System Defaults in Settings Hub**: The Settings Hub allows configuring the global default core per platform.
* **Core Information Badge in In-Game HUD**: The in-game diagnostic drawer displays the active core name, version, and WebAssembly build target.
* **Seamless Save State & SRAM Compatibility**: Preserves battery SRAM (`.sav` / `.srm`) compatibility across compatible core transitions.

---

## 3. Detailed Logic Behind It

### 3.1 Core Registry & State Architecture

```
+-------------------------------------------------------------------------+
|                  Core Manifest (`emulationCores.js`)                    |
|  - Available WASM binaries & JS wrappers per system                     |
|  - Capabilities: Save State Versioning, Turbo Limits, Audio Formats     |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
[Global System Preference]                     [Per-ROM Metadata Override]
(Stored in `settings.cores[sys]`)              (Stored in `game.customCore`)
            |                                               |
            +-----------------------+-----------------------+
                                    |
                                    v
                     [Active Core Resolver Service]
               1. Check `game.customCore`
               2. Fallback to `settings.cores[game.system]`
               3. Fallback to `SYSTEM_DEFINITIONS[sys].core`
                                    |
                                    v
               [EmulatorModal WASM Runtime Injection]
```

### 3.2 Dynamic EmulatorJS Core Loader
EmulatorJS loads core files from `/emulatorjs/data/cores/{core_name}.js`. The core resolver dynamically injects the appropriate `core` identifier into the EmulatorJS configuration object:

```javascript
export function resolveActiveCore(game, settings) {
  if (game?.customCore) {
    return game.customCore;
  }
  if (settings?.systemCores?.[game?.system]) {
    return settings.systemCores[game.system];
  }
  return SYSTEM_DEFINITIONS[game?.system]?.core || 'gba';
}
```

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Create Core Manifest (`src/data/emulationCoresManifest.js`)
Define all supported WASM core variants per platform with metadata tags (`accurate`, `fast`, `recommended`).

### Step 2: Update System Settings & DB Schema
Extend `settings` in IndexedDB / `data/retroplayer_db.json` with a `systemCores` dictionary mapping system keys to selected core IDs.

### Step 3: Add Core Selection Dropdown to Game Details Modal
Add an accessible, gamepad-controllable core selector dropdown to `CartridgeGrid.jsx` / `MetadataModal.jsx` to allow setting `game.customCore`.

### Step 4: Wire Resolver into `EmulatorModal.jsx`
Update `EmulatorModal.jsx` to resolve the core before initializing the Emscripten/WASM container.

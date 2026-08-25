# 🎮 ROM Management, Directory Structure & Sidecar Metadata Guide

Retro Player is designed with a **100% Bring-Your-Own-ROM (BYOR)** architecture. The application is completely decoupled from any copyrighted game software—all game discovery, parsing, and execution runs directly on the client via WebAssembly or through your own private self-hosted server mounts.

---

## 🔒 Privacy & Local Execution Model

1. **Pure Client-Side Execution**: When you load a ROM via the web UI or drag-and-drop, the binary is parsed entirely in your browser's local memory (`FileReader`). It is never uploaded to any remote server or third-party service.
2. **Zero Commercial Bundling**: The public Git repository contains zero copyrighted ROM files. Git strictly ignores all game binaries and sidecars in `public/roms/`.
3. **Local Self-Hosted Mounting**: For home servers, Docker maps your private local disk folder (`./roms:/roms`) directly into the container with automatic indexing, auto-sorting, and persistence.

---

## 🕹️ Supported Consoles & File Extensions

Retro Player supports 12 classic gaming platforms:

| Platform | System Key | Supported File Extensions | Default Core Engine |
| :--- | :--- | :--- | :--- |
| **Game Boy Advance** | `gba` | `.gba`, `.zip` | mGBA |
| **Game Boy Color** | `gbc` | `.gbc`, `.zip` | Gambatte |
| **Game Boy (DMG)** | `gb` | `.gb`, `.zip` | Gambatte |
| **Nintendo DS** | `nds` | `.nds`, `.zip` | MelonDS |
| **Super Nintendo** | `snes` | `.sfc`, `.smc`, `.zip` | Snes9x |
| **Nintendo (NES)** | `nes` | `.nes`, `.zip` | FCEUmm |
| **Nintendo 64** | `n64` | `.z64`, `.n64`, `.v64` | Mupen64Plus |
| **Sega Genesis / Mega Drive** | `sega_genesis` | `.md`, `.gen`, `.smd`, `.bin`, `.zip` | Genesis Plus GX |
| **Sega Game Gear** | `game_gear` | `.gg`, `.zip` | Genesis Plus GX |
| **Sony PlayStation (PS1)** | `playstation` | `.chd`, `.iso`, `.cue`, `.pbp` | Beetle PSX |
| **Arcade (MAME)** | `arcade` | `.zip` | MAME 2003 Plus |
| **Atari 2600** | `atari_2600` | `.a26`, `.bin`, `.zip` | Stella |

---

## 🗂️ Directory Layout & Organization

When organizing your ROM collection locally in `public/roms/` or inside a mounted Docker volume (`./roms/`), place files within their respective system folder.

Retro Player supports two flexible folder organization layouts:

### Layout A: Flat Files (Fast & Simple)

Place your ROMs and cover artwork directly into the system folder:

```text
roms/
├── gba/
│   ├── Pokemon Emerald.gba
│   ├── Pokemon Emerald.webp
│   ├── Golden Sun.gba
│   └── Golden Sun.jpg
├── snes/
│   ├── Chrono Trigger.sfc
│   └── Super Mario World.smc
└── nds/
    └── Mario Kart DS.nds
```

### Layout B: Subfolder per Game (Recommended for Sidecars & Multi-File Dumps)

Organize each game in its own dedicated subdirectory containing its ROM, cover, and metadata sidecar:

```text
roms/
├── gba/
│   └── Pokemon Unbound/
│       ├── Pokemon Unbound.gba
│       ├── cover.webp
│       └── metadata.json
├── playstation/
│   └── Castlevania - Symphony of the Night/
│       ├── Castlevania - Symphony of the Night.chd
│       ├── cover.webp
│       └── game.nfo
└── snes/
    └── Super Metroid/
        ├── Super Metroid.sfc
        └── cover.webp
```

---

## 🎨 Universal Local Sidecar Metadata & Artwork

Retro Player automatically detects and binds local artwork and companion metadata files without requiring an active internet connection.

### 1. Companion Cover Artwork

Name your box art cover using any of the following standard naming patterns:
- **Matching Base Name**: `Pokemon Emerald.gba` $\rightarrow$ `Pokemon Emerald.webp` (or `.png`, `.jpg`)
- **Cover Suffix**: `Pokemon Emerald-cover.webp` or `Pokemon Emerald_cover.png`
- **Subfolder Standard**: When a game is in its own subfolder, name the file `cover.webp`, `cover.png`, `cover.jpg`, or `boxart.png`.

### 2. Companion Metadata Sidecar (`.nfo` or `.json`)

Place a `.nfo` or `.json` file alongside the ROM to define custom metadata (title, plot summary, release year, developer, publisher, and genre):

#### XML NFO Format (`[romname].nfo` or `game.nfo` — Kodi & Jellyfin standard):
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<game>
  <title>Pokémon Unbound</title>
  <plot>An expansive custom Pokémon adventure set in the Borrius region featuring Pokémon from Gens 1-8, custom difficulty modes, and dynamic missions.</plot>
  <year>2020</year>
  <developer>Skeli &amp; Unbound Team</developer>
  <publisher>Homebrew Community</publisher>
  <genre>RPG / Romhack</genre>
</game>
```

#### JSON Format (`[romname].json` or `metadata.json` / `game.json`):
```json
{
  "title": "Pokémon Unbound",
  "description": "An expansive custom Pokémon adventure set in the Borrius region.",
  "releaseYear": "2020",
  "developer": "Skeli & Unbound Team",
  "publisher": "Homebrew Community",
  "genre": "RPG / Romhack"
}
```

---

## 🔍 In-App Scraper & Metadata Editor

1. **Automated 3D Box Art Scraper**: Press `[X]` on gamepad (or `M` on keyboard) to open the Metadata Scraper. Scrapes official 3D box art from Libretro CDN and synopses from Wikipedia in real time.
2. **In-App Manual Metadata Editor**: Open any game's detail drawer and click the **Pencil icon (Edit Metadata)** to modify titles, descriptions, release years, or upload custom cover artwork directly in the UI. Overrides persist locally to IndexedDB and sync to `data/retroplayer_db.json`.

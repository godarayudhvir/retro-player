# 🎮 ROM Management, Directory Structure & Sidecar Metadata Guide

Retro Player is designed with a **100% Bring-Your-Own-ROM (BYOR)** architecture. The application is completely decoupled from any copyrighted game software—all game discovery, parsing, and execution runs directly on the client via WebAssembly or through your own private self-hosted server mounts.

---

## 🔒 Privacy & Local Execution Model

1. **Pure Client-Side Execution**: When you load a ROM via the web UI or drag-and-drop, the binary is parsed entirely in your browser's local memory (`FileReader`). It is never uploaded to any remote server or third-party service.
2. **Zero Commercial Bundling**: The public Git repository contains zero copyrighted ROM files. Git strictly ignores all game binaries and sidecars in `public/roms/`.
3. **Local Self-Hosted Mounting**: For home servers, Docker maps your private local disk folder (`./roms:/roms`) directly into the container with automatic indexing, auto-sorting, and persistence.

---

## 🕹️ Supported Consoles & Folder Names

Retro Player supports 12 classic gaming platforms:

| Platform | Folder Name / System Key | Recognized Folder Aliases | Supported Extensions | Default Core Engine |
| :--- | :--- | :--- | :--- | :--- |
| **Arcade (MAME)** | `arcade` | `mame`, `neogeo`, `fbalpha`, `fbneo` | `.zip` | MAME 2003 Plus |
| **Atari 2600** | `atari2600` | `atari_2600`, `atari` | `.a26`, `.bin`, `.zip` | Stella |
| **Game Boy (DMG)** | `gb` | `gameboy`, `game_boy` | `.gb`, `.zip` | Gambatte |
| **Game Boy Advance** | `gba` | `gameboyadvance`, `game_boy_advance` | `.gba`, `.zip` | mGBA |
| **Game Boy Color** | `gbc` | `gameboycolor`, `game_boy_color` | `.gbc`, `.zip` | Gambatte |
| **Nintendo (NES)** | `nes` | `famicom` | `.nes`, `.zip` | FCEUmm |
| **Nintendo 64** | `n64` | `nintendo64`, `nintendo_64` | `.z64`, `.n64`, `.v64` | Mupen64Plus |
| **Nintendo DS** | `nds` | `nintendods`, `nintendo_ds`, `ds` | `.nds`, `.zip` | MelonDS |
| **Sega Game Gear** | `gamegear` | `game_gear`, `segagamegear`, `sega_game_gear`, `gg` | `.gg`, `.zip` | Genesis Plus GX |
| **Sega Genesis / Mega Drive** | `genesis` | `sega_genesis`, `segagenesis`, `megadrive`, `mega_drive`, `sega`, `md` | `.md`, `.gen`, `.smd`, `.bin`, `.zip` | Genesis Plus GX |
| **Sony PlayStation (PS1)** | `ps1` | `playstation`, `psx`, `ps` | `.chd`, `.iso`, `.cue`, `.pbp` | Beetle PSX |
| **Super Nintendo** | `snes` | `super_nintendo`, `supernintendo`, `sfc`, `super_famicom` | `.sfc`, `.smc`, `.zip` | Snes9x |

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
│   └── Pokemon Emerald.webp
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
├── ps1/
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

### 3. Automatic Companion Ingestion in "Load Custom ROM"
When dragging and dropping a ROM folder or selecting via "Choose Folder", Retro Player automatically detects and pairs existing `.webp`/`.png`/`.jpg` box art and `.json`/`.nfo` metadata sidecars:
- **Instant $O(1)$ Indexed Pairing**: Uses indexed Map lookups and asynchronous event-loop chunking to scan and pair thousands of ROMs, companion box art images, and sidecar metadata files in milliseconds without blocking the browser main thread.
- **Desktop Multi-Folder Zero-Copy Links (0 MB Duplication)**: On desktop browsers (Chrome, Edge, Brave, Opera), saving folders in Session Mode persists each directory's `FileSystemDirectoryHandle` into IndexedDB (`linked_directory_handles`). You can link multiple independent system folders (e.g. `/gba`, `/gbc`, `/snes`), manage or remove individual folders via chips, and reconnect all linked directories with 1 click on startup or after reload with zero storage duplication.
- **Mobile Permanent Library Storage**: On Android and iOS touch devices, folders are ingested directly into persistent IndexedDB storage (or server `/roms/`), ensuring games, local box art, and sidecars persist across tab reloads, browser app switching, and offline PWA mode.
- **Single ROM Quick Play**: Single ROM files can still be booted instantly into RAM across both desktop and mobile devices via one-click Quick Play without saving.

---

## 🔍 In-App Scraper & Metadata Editor

1. **Automated 3D Box Art Scraper**: Press `[X]` on gamepad (or `M` on keyboard) to open the Metadata Scraper. Scrapes official 1:1 box art from the Libretro CDN and retrieves authentic synopses, developers, and release years from dedicated video game databases in real time.
2. **In-App Manual Metadata Editor**: Open any game's detail drawer and access the **Game Details Pane** to modify titles, descriptions, release years, developers, publishers, strategy guide links, or upload/delete custom cover artwork directly in the UI. Overrides persist locally to IndexedDB, update disk sidecars, and sync to `data/retroplayer_db.json`.

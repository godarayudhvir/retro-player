# Game Catalog & ROM Discovery Indexer (`architecture/modules/game-catalog.md`)

## 1. Description
The Game Catalog module indexes local ROM files in `/public/roms` (and server `ROMS_DIR`) and handles client-side custom ROM loading, automatically detects emulation cores, maps platforms, and serves the clean ROM dataset to the frontend client without any hardcoded local covers or bundled metadata files (adhering to the ES-DE dynamic launcher architecture).

---

## 2. Detailed List of What It Does
- **12-Console ROM Directory Scanning**: Recursively scans `/public/roms` (or `ROMS_DIR`) for valid extensions across all 12 supported retro systems:
  - Game Boy Advance (`.gba`)
  - Game Boy & Game Boy Color (`.gb`, `.gbc`)
  - Super Nintendo (`.sfc`, `.smc`, `.snes`)
  - Nintendo Entertainment System (`.nes`)
  - Nintendo 64 (`.z64`, `.n64`, `.v64`)
  - Nintendo DS (`.nds`)
  - Sega Genesis / Mega Drive (`.md`, `.gen`, `.smd`)
  - Sega Game Gear (`.gg`)
  - Sony PlayStation 1 (`.cue`, `.chd`, `.iso`, `.pbp`, `.bin`)
  - Arcade MAME (`.zip`)
  - Atari 2600 (`.a26`)
- **Bundled Non-Commercial Demo Showcase (21 Titles Across 12 Consoles)**: Pre-packages a curated roster of 21 non-complete demonstration ROMs, trade show samples, Sega Channel trials, aftermarket homebrew, and prototypes in `public/roms/` across all 12 supported platforms (documented in detail in [roms.md](../../guides/roms.md)). Titles are specifically non-complete slices curated to evaluate WebAssembly core emulation performance with zero full commercial retail releases.
- **Optimized Distribution Architecture**:
  - **Curated Web Demo Tier (21 Titles)**: Whitelisted and tracked in Git across all 12 consoles (`arcade`, `atari_2600`, `game_gear`, `gb`, `gba`, `gbc`, `n64`, `nes`, `playstation`, `nds`, `sega_genesis`, `snes`), with zero heavy bloat or unnecessary ROM duplicates, fully compliant with GitHub push limits and GitHub Pages quotas.
- **Creator Compliance & Immediate Removal Policy**: Maintained under strict compliance rules where any copyright holder or creator requesting demo removal will be accommodated immediately without hesitation (see [roms.md](../../guides/roms.md)).
- **Public Domain & Homebrew Whitelist (`.gitignore`)**: Explicitly whitelists `public/roms/` demo games for the 12 systems alongside `public/bgm/` chiptune audio tracks, while keeping server ROMs (`/roms/`), battery save files (`.sav`), and persistent storage (`data/`) strictly ignored.
- **Single-File Disc Format & Streaming Architecture**: Packages PlayStation games as clean single-file `.iso` disc images (or `.chd` / `.pbp`) served with `Content-Length` and `Accept-Ranges` byte-streaming headers, eliminating loose CUE/BIN multi-file loading stalls and guaranteeing instantaneous boot in the WebAssembly core.
- **Universal Relative Subpath Resolution**: Resolves all static assets and demo ROM URLs relative to the application's base URL (`import.meta.env.BASE_URL`) via `src/utils/assetPath.js` for 100% portability across GitHub Pages subpaths and custom domain root paths.
- **Client-Side Private Custom ROM Sandbox**: Custom ROMs opened via "Load Custom ROM" or viewport drag-and-drop execute immediately in browser WebAssembly memory without sending any personal game files to the remote server.
- **Local Sidecar Metadata & Companion Artwork Discovery**: Detects adjacent companion artwork (`<romname>.webp`, `<romname>.png`, `<romname>.jpg`, `cover.*`) and companion metadata sidecars (`<romname>.nfo`, `<romname>.json`, `game.nfo`) to support custom ROM hacks and indie homebrew without relying on online scrapers.
- **Zero-Config Pure Indexing with Sidecar Enrichment**: Returns pure game descriptors with optional pre-parsed sidecar metadata and cover URLs attached, falling back cleanly to the dynamic online scraper module when sidecars are absent.
- **Sorting & Filtering**: Supplies clean title and extension metadata for category filtering, smart collections (Favorites/Recents), and search queries.

---

## 3. Detailed Logic Behind Everything and How It Works

### Matching & Indexing Algorithm
1. `vite.config.js` and `server.js` scan ROM directories and sanitize title names.
2. Constructs clean game descriptor objects:
   ```javascript
   {
     id: 'gba-goodboy-galaxy-chapter-zero',
     title: 'Goodboy Galaxy Chapter Zero',
     rawTitle: 'Goodboy Galaxy - Chapter Zero (World) (En) (v1.0.7) (Demo) (Aftermarket) (Unl)',
     filename: 'Goodboy Galaxy - Chapter Zero (World) (En) (v1.0.7) (Demo) (Aftermarket) (Unl).gba',
     systemKey: 'gba',
     systemName: 'Game Boy Advance',
     systemCore: 'gba',
     systemColor: '#3b82f6',
     systemIcon: 'assets/platforms/gba.svg',
     category: 'Handheld',
     romUrl: '/roms/gba/Goodboy%20Galaxy...gba',
     coverUrl: null // Scraped dynamically on-the-fly by metadataScraper service
   }
   ```
3. The client receives the catalog and automatically coordinates background scraping through `useMetadataScraper.js` and `metadataScraper.js`.

### Client-Side Sandbox vs. Host Library Management
1. **Live Web Demo / Custom ROMs**: When running on static hosting (GitHub Pages) or loading personal ROMs via the "Load Custom ROM" modal, ROMs run strictly in browser memory via `URL.createObjectURL(file)`.
2. **Docker Self-Hosted Mode**: When running the Node/Docker server with mounted storage volumes (`-v ./roms:/roms`, `-v ./bgm:/bgm`, `-v ./data:/data`), administrators can upload and delete library files permanently through the full-screen Settings Manager. The server supports multi-source discovery (merging user-mounted `/roms` with bundled showcase demo ROMs when `INCLUDE_DEMO_ROMS=true`) and optional auto-seeding (`AUTO_SEED_DEMOS=true`) to populate host folders on first boot.

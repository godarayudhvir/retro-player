# API Protocols & Integration Specifications (`architecture/modules/api-specifications.md`)

## 1. Description
The **API Protocols & Integration Specifications** architecture document catalogs all internal backend endpoints (`server.js` and `vite.config.js`), external public CDN/REST integrations, and native browser Web APIs utilized by **Retro Player**. It details caching behaviors, rate-limiting safeguards, and request-response contracts.

---

## 2. Detailed List of What It Does

### Internal Backend REST APIs (`server.js` / `vite.config.js`)
- **`GET /api/roms`**:
  - Automatically scans `./roms` directory across all subfolders.
  - Detects console platform from directory hierarchy and file extension.
  - Calculates per-platform `gameCount` for the system ribbon.
  - Returns `{ count: number, games: Array<Game>, systems: Array<System> }`.
- **`POST /api/upload-rom`**:
  - Handles streaming binary upload of game ROMs up to 250MB.
  - Reads `x-filename` and `x-system-key` headers and persists files to `./roms/<systemKey>/<filename>`.
- **`POST /api/delete-rom`**:
  - Receives `{ systemKey, filename, relativePath }` JSON payload.
  - Deletes the specified ROM file from host disk.
- **`GET /api/bgm`**:
  - Scans `./bgm` directory and returns all valid audio track paths and titles (`{ count: number, tracks: Array<Track> }`).
- **`POST /api/upload-bgm`**:
  - Handles streaming audio upload (`.mp3`, `.ogg`, `.wav`, `.flac`, `.m4a`, `.aac`) up to 100MB to `./bgm/<filename>`.
- **`POST /api/delete-bgm`**:
  - Receives `{ filename }` and removes audio track from host disk.
- **Static Media Routes**:
  - `/roms/*`: Serves raw binary ROM buffers to the EmulatorJS core sandbox.
  - `/bgm/*`: Streams audio tracks into HTML5 Audio player.

### External Public APIs & CDNs
- **Libretro Thumbnails CDN** (`thumbnails.libretro.com` & `raw.githubusercontent.com/libretro-thumbnails`):
  - Fetches 3D box arts, title screens, and snaps.
  - Cached permanently in IndexedDB (`RetroPlayerMetadataDB`).
- **Wikipedia REST API** (`en.wikipedia.org/api/rest_v1/page/summary/{title}`):
  - Fetches canonical plot synopses, release dates, and developers.
  - Cached in IndexedDB with negative caching for non-matching titles.
- **Google Fonts CDN** (`fonts.googleapis.com`):
  - Preconnected typography delivery for `Plus Jakarta Sans`.

### Native Browser Web APIs
- **IndexedDB API**: Centralized local database (`RetroPlayerDB` & `RetroPlayerMetadataDB`) for zero-loss offline data persistence.
- **Web Audio API (`AudioContext`)**: Zero-latency acoustic UI sound effect synthesizer.
- **HTML5 Audio API**: Background music playlist engine.
- **Gamepad API (`navigator.getGamepads`)**: 60fps input polling loop for USB/Bluetooth controllers.

---

## 3. Detailed Logic Behind Everything and How It Works

### Rate Limiting & Optimization
- **Negative Caching**: When an external API returns 404 for cover art or synopses, a record is marked in IndexedDB so no further network requests are ever triggered on subsequent reloads.
- **Batch Scraping Pacing**: Batch queries in `useMetadataScraper.js` execute sequentially with controlled inter-request delays (120ms) to prevent `429 Too Many Requests`.
- **Zero Redundant Fetch on Hard Reload**: All game metadata, avatar assets, and user statistics resolve locally in under 1ms from IndexedDB.

### Source Locations
- Express Server: [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js)
- Dev API Middleware: [vite.config.js](file:///Users/godarayudhvir/Github/retro-player/vite.config.js)
- Metadata Scraper: [src/services/metadataScraper.js](file:///Users/godarayudhvir/Github/retro-player/src/services/metadataScraper.js)
- Database Engine: [src/services/db.js](file:///Users/godarayudhvir/Github/retro-player/src/services/db.js)

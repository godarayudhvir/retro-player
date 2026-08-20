# Local ROM Sidecars & In-App Manual Metadata Editor (`architecture/mirai/local-sidecars-and-metadata-editor.md`)

## 1. Description
The **Local ROM Sidecars & In-App Manual Metadata Editor** system enables rich, accurate metadata and custom box art for ROM hacks, homebrew titles, translation patches, and unindexed retro games across all three hosting topologies (Docker self-hosted, Localhost development/production, and GitHub Pages static hosting). It combines standard companion sidecar files (`.nfo`, `.json`, `cover.webp`/`.png`/`.jpg`) discovered in ROM directories with a Jellyfin-style in-app metadata editor for manual overrides.

---

## 2. Detailed List of What It Does
- **Companion Artwork Discovery**: Automatically detects `<romname>.webp`, `<romname>.png`, `<romname>.jpg`, `<romname>-cover.*`, and `cover.*` located in the ROM directory and associates them directly with the game.
- **Kodi / Jellyfin XML NFO Parsing**: Parses standard `<game><title>...</title><plot>...</plot><year>...</year><developer>...</developer><publisher>...</publisher><genre>...</genre></game>` sidecar `.nfo` files alongside ROMs.
- **Clean JSON Sidecar Parsing**: Parses companion `.json` or `game.json` metadata files containing custom game properties.
- **Tri-Tier Hosting Compatibility**:
  - **Static GitHub Pages**: `vite.config.js` (`getRomsManifest`) discovers sidecars during `npm run build`, bundles companion artwork into `dist/`, and embeds parsed metadata directly into the pre-generated `api/roms.json` catalog.
  - **Docker / Localhost Server**: `server.js` dynamic scanner parses sidecars on-the-fly and streams companion covers with byte-range and MIME headers via `/roms/...`.
  - **Client Browser Sandbox**: IndexedDB and LocalStorage cache overrides for local ROM drag-and-drop sessions.
- **Jellyfin-Style In-App Metadata Editor**: Desktop & Tablet in-app modal allowing players to edit:
  - Game Title (display name override)
  - Synopsis / Story Overview
  - Release Year / Release Date
  - Developer & Publisher
  - Genre Tags (e.g. *Romhack*, *RPG*, *Homebrew*, *Action*)
  - Custom Cover Artwork (Image URL or local image file upload with client-side WebP compression)
- **Zero Admin Bloat on Mobile**: Keeps mobile phones ($\le$640px) focused strictly on gaming and touch controls, keeping heavy administrative overhead isolated to Desktop and Handheld modes.

---

## 3. Detailed Logic Behind Everything and How It Works

### Resolution Hierarchy (Priority Order)
When presenting a game's artwork and description in the UI, the resolution pipeline executes from highest priority to lowest fallback:

```
+---------------------------------------------------------------------------------------+
| 1. Manual User Override (In-App Editor)                                              |
|    - Stored in persistent Server DB (retroplayer_db.json) and IndexedDB               |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼ (if no manual override)
+---------------------------------------------------------------------------------------+
| 2. Local ROM Folder Sidecars (.nfo / .json / cover.webp)                             |
|    - Discovered automatically by server.js / vite.config.js                          |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼ (if no sidecar exists)
+---------------------------------------------------------------------------------------+
| 3. Automated Online Scrapers                                                          |
|    - Libretro Thumbnails CDN -> TheGamesDB -> ScreenScraper -> Wikipedia REST         |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼ (if online match fails)
+---------------------------------------------------------------------------------------+
| 4. Clean Filename Heuristic & Console Defaults                                       |
|    - Sanitized filename title, platform badge, default core description              |
+---------------------------------------------------------------------------------------+
```

### Sidecar NFO XML Schema
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<game>
  <title>Pokémon Unbound</title>
  <plot>An expansive custom Pokémon adventure set in the Borrius region featuring gen 1-8 Pokémon, difficulty modes, and custom mechanics.</plot>
  <year>2020</year>
  <developer>Skeli &amp; Unbound Team</developer>
  <publisher>Homebrew Community</publisher>
  <genre>RPG / Romhack</genre>
</game>
```

### Sidecar JSON Schema
```json
{
  "title": "Pokémon Unbound",
  "description": "An expansive custom Pokémon adventure set in the Borrius region.",
  "releaseYear": "2020",
  "developer": "Skeli & Unbound Team",
  "publisher": "Homebrew Community",
  "genre": "RPG / Romhack",
  "cover": "cover.webp"
}
```

---

## 4. Step-by-Step Implementation Blueprint

1. **Scanner Extensions (`vite.config.js` & `server.js`)**:
   - Add companion file helper `findCompanionAssets(dirPath, romBaseName, entries)`.
   - Add XML NFO parser `parseNfoContent(content)` extracting `<title>`, `<plot>`, `<description>`, `<year>`, `<developer>`, `<publisher>`, `<genre>`, `<cover>`.
   - Add JSON sidecar reader parsing companion `.json` files.
   - Attach `sidecarCoverUrl` and `sidecarMetadata` to game catalog objects.
2. **Metadata Scraper Service (`src/services/metadataScraper.js`)**:
   - Check `game.sidecarMetadata` and `game.sidecarCoverUrl` on initial load.
   - Provide `saveManualMetadata(id, data)` and `clearManualMetadata(id)`.
   - Sync manual metadata to `/api/db/game_metadata` and local IndexedDB store.
3. **In-App Modal (`src/components/MetadataEditModal.jsx`)**:
   - Responsive modal with input fields, live cover preview, image upload dropzone, and reset actions.
   - **Auto-Write to Disk**: Invokes `POST /api/metadata/save-sidecar` to physically write `.webp` and `.json` sidecars directly into `public/roms/[system]/` for immediate Git tracking on Localhost and persistent Docker volumes.
   - **Static Host Fallback & 1-Click Export**: On GitHub Pages or offline mode, falls back to IndexedDB and provides a 1-click **Export Sidecar (.json)** button.
   - 100% spatial gamepad and keyboard navigation support.
4. **Integration (`GameDetailModal.jsx`, `App.jsx`, `index.css`)**:
   - Add "Edit Metadata" action button in `GameDetailModal.jsx`.
   - Update CSS tokens and responsive modal styling.

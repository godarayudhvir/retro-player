# Automated Metadata & Cover Art Scraper Module

## 1. Description

The **Automated Metadata & Cover Art Scraper** is a high-performance, zero-latency background metadata scraping and asset enrichment engine for Retro Player. It automatically queries the official **Libretro Thumbnails** repository, Wikipedia REST APIs, and retro gaming open databases to fetch high-resolution 3D box art, in-game screenshot captures, release dates, developers, publishers, genre tags, and synopses for every ROM loaded in the user's library or added via drag-and-drop.

All scraped assets and metadata records are asynchronously cached in browser **IndexedDB** storage with a lightweight `localStorage` fallback, ensuring that network requests are executed only once and all cartridges load instantaneously with zero network overhead on subsequent application visits.

---

## 2. Detailed List of What It Does

- **Multi-System Canonical Mapping**: Translates internal console keys (`gba`, `nes`, `snes`, `n64`, `gbc`, `gb`, `nds`, `genesis`, `ps1`, etc.) into Libretro Thumbnails naming standards (e.g. `Nintendo - Game Boy Advance`, `Sony - PlayStation`).
- **Smart Title Normalization & Multi-Candidate Generation**:
  - Automatically cleans filenames by stripping ROM tags (`(USA)`, `(Europe)`, `[!]`, `(Rev 1)`) and encoding reserved filename characters (`&`, `:`, `/`, `\`, `*`, `?`, `"`, `<`, `>`, `|`) into standard Libretro underscores (`_`).
  - Generates multi-tier search candidates covering raw filenames, region-specific variations, and clean display titles.
- **Dynamic Asset & Box Art Scraper**:
  - Probes and fetches official 3D box art from `Named_Boxarts`, fallback snaps from `Named_Snaps`, and title screens from `Named_Titles`.
- **Rich Metadata Enrichment**:
  - Queries open REST APIs for official synopsis descriptions, release years, developers, publishers, and genre categorization.
  - Automatically extracts release year numbers (`199X`/`200X`) for accurate library sorting.
- **Persistent IndexedDB & LocalStorage Caching**:
  - Persists full metadata payloads and verified cover URLs in the `RetroPlayerMetadataDB` IndexedDB database under the `game_metadata` store.
  - Instantly hydrates the UI upon page load before initiating background checks.
- **Non-Blocking Background Scraper Queue**:
  - Asynchronous batch processing queue with throttling (120ms tick intervals) to avoid network congestion and API rate-limiting.
  - Live progress tracking (`current`/`total`) reflected in the Topbar status pill.
- **Tactile UI Loading & Shimmer Feedback**:
  - Displays smooth gradient shimmer loading animations on 3D cartridge labels while artwork is downloading.
  - Graceful fallback to styled platform badges and clean typography if a game has no online artwork.
- **On-Demand & Library Scrape Controls**:
  - **"Scrape Art"** button in [Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx) for batch scanning.
  - **"Re-Scrape Art"** action button in [GameDetailModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/GameDetailModal.jsx) for single-title re-fetching.

---

## 3. Detailed Logic Behind Everything and How It Works

### Core Architecture & File Structure

```
src/
├── services/
│   └── metadataScraper.js        # Core scraping service, candidate generator & IndexedDB storage
├── hooks/
│   └── useMetadataScraper.js     # React hook coordinating queue, state & background synchronization
├── components/
│   ├── Topbar.jsx                # Scraper progress pill & manual library scan trigger
│   ├── CartridgeGrid.jsx         # Viewport passing metadataMap down to tiles
│   ├── CartridgeTile.jsx         # 3D Cartridge with shimmer placeholder & scraped box art
│   └── GameDetailModal.jsx       # Drawer modal displaying developer, publisher, genre, year & synopsis
└── index.css                     # Shimmer keyframes, meta pills, scraper badges & layout styling
```

### Data Flow Pipeline

```
1. ROM List Loaded (/api/roms or Custom Drag-Drop)
       │
       ▼
2. useMetadataScraper Hook Mounts
       │
       ├──► Hydrates from IndexedDB (RetroPlayerMetadataDB.game_metadata)
       │
       ▼
3. Background Scan Triggered (Unscraped Titles)
       │
       ├──► A. Candidate Name Generator (formatLibretroName)
       │         - E.g. "Pokemon - Emerald Version (USA, Europe)" -> "Pokemon - Emerald Version (USA, Europe)"
       │         - Fallback: "Pokemon - Emerald Version", "Pokemon Emerald"
       │
       ├──► B. Query Libretro Thumbnails CDN (Named_Boxarts -> Named_Snaps -> Named_Titles)
       │
       ├──► C. Query Open Game Database / Wikipedia Summary
       │         - Extract developer, publisher, release year, genre, and synopsis
       │
       ▼
4. IndexedDB Commit & Reactive State Dispatch
       │
       ├──► CartridgeTile receives metadata.coverUrl -> Shimmer fades out -> Box art rendered
       └──► GameDetailModal displays verified tags, synopsis, and release year
```

### IndexedDB Schema Specifications

- **Database Name**: `RetroPlayerMetadataDB` (Version `1`)
- **Object Store**: `game_metadata`
- **Key Path**: `id` (e.g. `gba-pokemon-emerald-version-usa-europe`)
- **Payload Schema**:
  ```json
  {
    "id": "gba-pokemon-emerald-version-usa-europe",
    "title": "Pokemon - Emerald Version",
    "systemKey": "gba",
    "coverUrl": "https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).png",
    "hasCustomCover": true,
    "description": "Pokemon Emerald Version is a 2004 role-playing video game developed by Game Freak...",
    "releaseDate": "2004-01-01",
    "releaseYear": "2004",
    "developer": "Game Freak",
    "publisher": "The Pokémon Company / Nintendo",
    "genre": "Role-Playing",
    "source": "Wikipedia",
    "scrapedAt": "2026-08-19T11:05:00.000Z",
    "updatedAt": 1787137500000
  }
  ```

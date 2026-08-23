# Automated Metadata & Cover Art Scraper Module

## 1. Description

The **Automated Metadata & Cover Art Scraper** is a high-performance, zero-latency metadata and asset enrichment engine for Retro Player operating across two distinct layers:

1. **Local Codebase Sidecar Pipeline (Backend / IDE - Top Priority)**:
   - Powered by the `update-roms` automation skill and [update_roms.js](file:///Users/godarayudhvir/Github/retro-player/.agents/skills/update-roms/scripts/update_roms.js).
   - Ingests loose ROMs and screenshot drops in `public/roms/`, handles in-folder version upgrades with automatic purge of obsolete superseded ROMs and older covers, converts custom screenshot drops to high-performance `.webp`, and dynamically scrapes authentic metadata from online APIs/web search to generate/sync permanent `metadata.json` sidecars in the repository.
   - When local sidecars exist, they take **absolute top precedence**, loading instantaneously with 0ms network latency and bypassing browser scrapers entirely.
2. **Client-Side Online Scraper (Browser / IndexedDB - Fallback Priority)**:
   - Designed for web users accessing the app on GitHub Pages or loading ad-hoc custom ROMs in-browser without local file access.
   - Queries Libretro CDN, TheGamesDB, ScreenScraper, and Wikipedia in real-time, caching responses into browser **IndexedDB** (`RetroPlayerMetadataDB`).

---

## 2. Detailed List of What It Does

- **Multi-System Canonical Mapping**: Translates internal console keys (`gba`, `nes`, `snes`, `n64`, `gbc`, `gb`, `nds`, `genesis`, `ps1`, etc.) into Libretro Thumbnails naming standards (e.g. `Nintendo - Game Boy Advance`, `Sony - PlayStation`).
- **Smart Title Normalization & Multi-Candidate Generation**:
  - Automatically cleans filenames by stripping ROM tags (`(USA)`, `(Europe)`, `[!]`, `(Rev 1)`, `(Demo)`, `(Kiosk)`, `(Proto)`, `(Beta)`, `(Aftermarket)`, `(Unl)`, `(Digital)`, `(Kickstarter)`) and encoding reserved filename characters (`&`, `:`, `/`, `\`, `*`, `?`, `"`, `<`, `>`, `|`) into standard Libretro underscores (`_`).
  - Automatically matches demo, kiosk, beta, and prototype builds against their corresponding official commercial retail box art releases without altering original disk filenames.
  - Generates multi-tier search candidates covering raw filenames, region-specific variations (`(USA)`, `(USA, Europe)`, `(Europe)`, `(World)`, `(USA, Australia)`), multilingual tags (`(En,Fr,Es)`, `(En,Fr,De,Es,It)`, `(En,Es)`), title inversions (`Legend of Zelda, The` $\leftrightarrow$ `The Legend of Zelda`), diacritics (`Pokemon` $\leftrightarrow$ `Pokémon`), and split multi-game compilations.
- **Dynamic Asset & Box Art Scraper**:
  - Probes and fetches official 3D box art from `Named_Boxarts`, fallback snaps from `Named_Snaps`, and title screens from `Named_Titles`.
- **Rich Metadata Enrichment**:
  - Queries open REST APIs for official synopsis descriptions, release years, developers, publishers, and genre categorization.
  - Automatically extracts release year numbers (`199X`/`200X`) for accurate library sorting.
- **Persistent IndexedDB & LocalStorage Caching**:
  - Persists full metadata payloads and verified cover URLs in the `RetroPlayerMetadataDB` IndexedDB database under the `game_metadata` store.
  - Instantly hydrates the UI upon page load before initiating background checks.
- **Non-Blocking Background Scraper Queue with Stop / Cancel Support**:
  - Asynchronous batch processing queue with throttling (120ms tick intervals) to avoid network congestion and API rate-limiting.
  - Live progress tracking (`current`/`total`) reflected in the Topbar status pill.
  - Immediate cancellation capability (`stopScrape()`) via Topbar click or Settings control.
- **Persistent User Auto-Scrape Configuration & Automatic Mobile Mode**:
  - Auto-scrape on desktop application boot / reload defaults to disabled or configurable via `localStorage.getItem('retroplayer_autoscrape_enabled')`.
  - **Automatic Mobile Execution**: When on Mobile UI (`isMobile: true`), unscraped library titles automatically trigger silent background scraping and live card cover hydration without requiring user intervention or manual buttons.
  - Prevents unwanted background requests across reloads on desktop until explicitly enabled or triggered on-demand.
- **Tactile UI Loading & Shimmer Feedback**:
  - Displays smooth gradient shimmer loading animations on 3D cartridge labels while artwork is downloading.
  - Graceful fallback to styled platform badges and clean typography if a game has no online artwork.
- **Real-Time Live Activity Logs Console (Dual Viewports)**:
  - In-memory event ring buffer and reactive subscription mechanism streaming step-by-step telemetry (candidate generation, Libretro CDN probing, Wikipedia querying, database writes).
  - Available globally in [SettingsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsView.jsx) (System Diagnostics) and directly within [GameDetailModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/GameDetailModal.jsx), automatically expanding and scrolling smoothly into view when re-scraping a title.
- **Dedicated Scraper & Box Art Settings Category**:
  - Segregated out of System Diagnostics into its own top-level sidebar tab in [SettingsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsView.jsx) (`Scraper & Box Art`).
  - Direct external link buttons (`Get API Key` on [TheGamesDB.net](https://thegamesdb.net/api) and `Create Account` on [ScreenScraper.fr](https://www.screenscraper.fr/)).
  - Live activity telemetry terminal and auto-scrape on boot preferences.
- **Multi-Tier Scraper Fallback Cascade**:
  - **Tier 1 (Zero Config)**: Libretro Thumbnails CDN & GitHub Raw mirrors.
  - **Tier 2 (Custom API Key)**: **TheGamesDB.net API** (Front box art, overview, developer, publisher, release date).
  - **Tier 3 (User Credentials)**: **ScreenScraper.fr API** (Official 2D/3D box art & synopsis by platform/title).
  - **Tier 4 (Strict Last Resort)**: Wikipedia Open REST API (Lead article image, synopsis, year).
- **4-Tier Granular Scraper Scope Selection**:
  - **Single System**: Scrapes missing or all artwork strictly for one chosen console platform (e.g. SNES or GBA).
  - **Bunch of Systems (Multi-Select)**: Interactive multi-selection matrix with Select All / Clear Selection to batch-scrape multiple selected consoles.
  - **All Systems**: Full library scan across all mounted ROM platforms.
  - **Individual Title**: Searchable game picker to target any individual ROM on-demand.
- **Dedicated Scraper Target Modal (`ScraperModal.jsx`)**:
  - Console-style target selection hub accessible from the Topbar Sparkles trigger and Settings diagnostics.
  - Features force-overwrite cache options and an embedded live activity telemetry terminal.
- **On-Demand & Library Scrape Controls**:
  - **"Scrape Art / Stop Scraper"** toggle button in [Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx) that opens the target selection dialog or immediately halts an active scan.
  - **"Re-Scrape Art"** action button in [GameDetailModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/GameDetailModal.jsx) for isolated single-title re-fetching with strictly scoped in-drawer live log streaming.
  - **"Online Metadata & Box Art Scraper"** control panel in [SettingsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsView.jsx) under System & Diagnostics.

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

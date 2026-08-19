# Game Catalog & ROM Discovery Indexer (`architecture/modules/game-catalog.md`)

## 1. Description
The Game Catalog module indexes local ROM files in `/public/roms` and custom drag-and-dropped ROMs, automatically detects emulation cores, maps platforms, and serves the clean ROM dataset to the frontend client without any hardcoded local covers or bundled metadata files (adhering to the ES-DE dynamic launcher architecture).

---

## 2. Detailed List of What It Does
- **ROM Directory Scanning**: Recursively scans `/public/roms` for valid extensions (`.nes`, `.snes`, `.smc`, `.sfc`, `.gba`, `.gbc`, `.gb`, `.n64`, `.z64`, `.v64`, `.nds`, `.gen`, `.zip`, `.iso`, `.cue`, `.chd`, `.bin`).
- **Custom Local ROM Drag & Drop Parsing**: Parses custom ROM files selected via file input or dropped directly onto the window viewport. Auto-detects target system cores based on extension (`detectSystemFromExtension`) and constructs memory-backed game objects.
- **Zero-Config Pure Indexing**: Returns pure game descriptors (`id`, `title`, `filename`, `systemKey`, `systemName`, `systemCore`, `romUrl`) with `coverUrl: null`, leaving all artwork and synopsis enrichment to the dynamic online scraper module.
- **Sorting & Filtering**: Supplies clean title and extension metadata for category filtering and search queries.

---

## 3. Detailed Logic Behind Everything and How It Works

### Matching & Indexing Algorithm
1. `vite.config.js` scans ROM directories and sanitizes title names.
2. Constructs clean game descriptor objects:
   ```javascript
   {
     id: 'gba-pokemon-emerald-version-usa-europe',
     title: 'Pokemon - Emerald Version',
     rawTitle: 'Pokemon - Emerald Version (USA, Europe)',
     filename: 'Pokemon - Emerald Version (USA, Europe).zip',
     systemKey: 'gba',
     systemName: 'Game Boy Advance',
     systemCore: 'gba',
     systemColor: '#3b82f6',
     systemIcon: '/assets/platforms/gba.svg',
     category: 'Handheld',
     romUrl: '/roms/gba/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).zip',
     coverUrl: null // Scraped dynamically on-the-fly by metadataScraper service
   }
   ```
3. The client receives the catalog and automatically coordinates background scraping through `useMetadataScraper.js` and `metadataScraper.js`.

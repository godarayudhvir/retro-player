# Game Catalog & Metadata Indexer (`architecture/modules/game-catalog.md`)

## 1. Description
The Game Catalog module indexes local ROM files, matches cover art assets, provides game descriptions, parses release dates, and serves the dataset to the client UI.

---

## 2. Detailed List of What It Does
- **ROM Directory Scanning**: Recursively scans `/public/roms` for valid extensions (`.nes`, `.snes`, `.smc`, `.gba`, `.gbc`, `.gb`, `.n64`, `.z64`, `.nds`, `.md`, `.iso`, `.chd`, `.bin`).
- **Cover Artwork Matching**: Performs exact, parent folder, and fuzzy regex string matching against local artwork in `public/assets/cover` and `public/cover`.
- **Game Metadata Lookup**: Provides helper functions (`getGameDescription`, `getReleaseDate`) from [gameDescriptions.js](file:///Users/godarayudhvir/Projects/retro-player/src/gameDescriptions.js) for overview details and sorting.

---

## 3. Detailed Logic Behind Everything and How It Works

### Matching & Indexing Algorithm
1. `vite.config.js` scans ROM directories and sanitizes title names (`cleanStringForMatching`).
2. Evaluates cover directory paths for exact filename matches.
3. Constructs game metadata object:
   ```javascript
   {
     id: 'gba-pokemon-emerald',
     title: 'Pokemon Emerald Version',
     rawTitle: 'pokemon-emerald',
     filename: 'Pokemon Emerald.gba',
     systemKey: 'gba',
     systemName: 'Game Boy Advance',
     systemCore: 'gba',
     systemColor: '#3b82f6',
     systemIcon: '/assets/platforms/gba.svg',
     romUrl: '/roms/gba/Pokemon%20Emerald.gba',
     coverUrl: '/assets/cover/gba/pokemon-emerald.png'
   }
   ```
4. In [gameDescriptions.js](file:///Users/godarayudhvir/Projects/retro-player/src/gameDescriptions.js), `getGameDescription()` matches title substrings against `GAME_DESCRIPTIONS` dictionary.

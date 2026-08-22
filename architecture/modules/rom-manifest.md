# ROM Catalog Manifest & Custom ROM Engine (`architecture/modules/rom-manifest.md`)

## 1. Description

The `useRomManifest` hook manages the complete ROM library catalog — fetching, deduplicating, filtering, sorting, and exposing the game and system data that drives the entire library UI. It also handles drag-and-drop and file-picker custom ROM loading, feeding custom ROMs into the game selection flow without uploading files to the server.

---

## 2. Detailed List of What It Does

- **REST Catalog Fetch (`/api/roms`)**: On mount, fetches the complete ROM manifest from the Vite/Express server endpoint. Deduplicates entries by `game.id` or `systemKey-title` composite key.
- **System Category Derivation**: If the API returns a `systems` array, it is used directly. Otherwise, systems are derived from the deduplicated `games` array grouped by `systemKey`.
- **`filteredGames` Computation** (via `useMemo`):
  - **Favorites filter**: Returns only games whose `id` or `title` appears in the `favorites` array.
  - **Recently Played filter**: Returns games in `recentlyPlayed` array order (chronological, most recent first).
  - **System filter**: Normalizes and matches `game.systemKey` to `activeSystem` (handles aliases like `segagenesis` → `genesis`, `playstation` → `ps1`, etc.).
  - **Search filter**: Case-insensitive substring match against `game.title` and `game.systemName`.
  - **Release date sort**: All non-recent views are sorted ascending by release date via `getReleaseDate(game)`.
- **Drag-and-Drop ROM Loading**:
  - `handleDragOver`, `handleDragLeave`, `handleDrop` manage the `isDraggingOver` visual state.
  - On drop, the first file is processed via `processCustomRomFile`.
- **Custom ROM Processing (`processCustomRomFile`)**:
  - Detects system from file extension via `detectSystemFromExtension(filename)`.
  - Creates an `Object URL` (`blob:` URL) for the file for zero-upload local play.
  - Constructs a synthetic `customGame` object with `isCustomBlob: true` and passes it to `onCustomRomLoaded` callback.
  - Custom ROMs are not persisted to disk — they live in browser memory only for the session.

---

## 3. Detailed Logic Behind Everything and How It Works

### Fetch Flow
```javascript
const apiUrl = (import.meta.env.BASE_URL || './') + 'api/roms';
const res = await fetch(apiUrl);
const data = await res.json(); // { games: [], systems: [] }
```
Deduplication uses a `Set` of seen IDs:
```javascript
const seenIds = new Set();
for (const g of loadedGames) {
  const id = g.id || `${g.systemKey}-${g.title}`;
  if (!seenIds.has(id)) { seenIds.add(id); uniqueGames.push(g); }
}
```

### System Key Normalization
The `normalizeSys` function inside `filteredGames` handles legacy/variant system key aliases:
```javascript
'segagenesis' | 'megadrive' | 'sega' → 'genesis'
'playstation' | 'psx' | 'ps'         → 'ps1'
'gamegear' | 'gg'                    → 'gamegear'
'atari2600' | 'atari' | 'a2600'      → 'atari2600'
'supernintendo' | 'sfc'              → 'snes'
'gameboyadvance'                     → 'gba'
'gameboycolor'                       → 'gbc'
'gameboy'                            → 'gb'
'nintendo64'                         → 'n64'
'nintendods' | 'ds'                  → 'nds'
'mame' | 'neogeo' | 'fbalpha' | 'fbneo' → 'arcade'
```

### Custom ROM Game Object
```javascript
{
  id: `custom_${sys.key}_${sanitizedTitle}`,
  title: `${cleanTitle} (Custom)`,
  rawTitle: cleanTitle,
  filename: file.name,
  file: file,
  systemKey, systemName, systemCore, systemIcon, systemColor,
  romUrl: blobUrl,           // Object URL from URL.createObjectURL(file)
  isCustomBlob: true,
  coverUrl: sys.icon || resolveAssetPath('assets/pokeball.png')
}
```

### Exported API
```typescript
{
  games: Game[],
  systems: System[],
  activeSystem: string,
  setActiveSystem: Setter,
  searchQuery: string,
  setSearchQuery: Setter,
  loading: boolean,
  filteredGames: Game[],
  isDraggingOver: boolean,
  fetchGames: () => Promise<void>,
  processCustomRomFile: (file: File) => void,
  handleCustomRomSelect: (e: InputEvent) => void,
  handleDragOver: (e: DragEvent) => void,
  handleDragLeave: (e: DragEvent) => void,
  handleDrop: (e: DragEvent) => void
}
```

### Source Locations
- Hook: [src/hooks/useRomManifest.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useRomManifest.js)
- System Detector: [src/utils/systemDetector.js](file:///Users/godarayudhvir/Github/retro-player/src/utils/systemDetector.js)
- Asset Path Resolver: [src/utils/assetPath.js](file:///Users/godarayudhvir/Github/retro-player/src/utils/assetPath.js)
- Release Date Helper: [src/gameDescriptions.js](file:///Users/godarayudhvir/Github/retro-player/src/gameDescriptions.js)

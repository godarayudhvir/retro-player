# Cartridge Grid & Theme Router (`architecture/components/cartridge-grid.md`)

## 1. Description

The `CartridgeGrid` component (`<main className="console-viewport">`) is the primary viewport orchestrator for the desktop/TV game library. It acts as the theme-routing dispatcher — rendering the correct layout engine based on the currently active console theme — and handles all empty state scenarios for searches, Favorites, and Recently Played collections.

---

## 2. Detailed List of What It Does

- **Theme-Based Layout Routing**: Reads `themeEngine.theme` and conditionally renders the matching theme-specific view component:
  - `'vanilla'` (default): Routes to `VanillaView.jsx` — horizontal 3D cartridge shelf.
  - `'ds'`: Routes to `DsView.jsx` — Nintendo DS dual-screen firmware layout with integrated inline game detail panel.

- **Empty State Rendering**: When `filteredGames.length === 0`, renders a contextual empty state prompt:
  - **Search Empty**: `<Search>` icon, "No Matching Titles Found" with clear-filter button.
  - **Favorites Empty**: `<Star>` icon, "No Favorites Starred Yet" with "Browse All Games" button.
  - **Recently Played Empty**: `<Clock>` icon, "No Play History Recorded" with "Browse All Games" button.
  - **No ROMs Empty**: `<FolderOpen>` icon, "No ROMs Found" with drop-hint and "Rescan Channels" button (calls `fetchGames()`).

- **Props Passthrough**: Forwards all game interaction props (`onPlayGame`, `onToggleFavorite`, `onEditMetadata`, `onScrapeGame`, `onExportSave`, `onImportSave`, `onDeleteSave`, `hasSaveData`, `scraper`) to the active theme view component.

---

## 3. Detailed Logic Behind Everything and How It Works

### Theme Dispatch
```javascript
switch (currentTheme) {
  case 'ds':     return <DsView ... />;
  case 'vanilla':
  default:       return <VanillaView ... />;
}
```

### VanillaView (`src/components/theme-views/VanillaView.jsx`)
- Renders the horizontal scrollable 3D cartridge shelf.
- Passes `filteredGames`, `metadataMap`, `focusedTarget`, `handleGameSelect`, `isFavorite`, `activeSystem`, `currentSystemName` to `CartridgeTile` rows.
- `GameDetailModal` is rendered **at the App.jsx level** (not inside VanillaView) and opened via `setSelectedGameCard(game)` when a cartridge is selected.

### DsView (`src/components/theme-views/DsView.jsx`)
- Renders a 3-column console firmware layout:
  - **Left column**: Scrollable beveled square game button matrix (`ds-touch-btn` grid).
  - **Center column**: Dual-screen preview (top screen: cover art hero; bottom screen: synopsis / metadata).
  - **Right column**: 3D box art display + technical specifications card (core, system, save data).
- The game detail drawer is **embedded inline** within DsView — `GameDetailModal` is **suppressed** at the App.jsx level when the DS theme is active (`game={themeEngine?.theme === 'ds' ? null : selectedGameCard}`).
- All game actions (play, favorite, edit metadata, scrape, save import/export/delete) are available inline within the DsView panel.

### Props Interface
```typescript
CartridgeGrid({
  filteredGames: Game[],
  metadataMap: Record<string, Metadata>,
  focusedTarget: FocusTarget,
  setFocusedTarget: Setter,
  handleGameSelect: (game: Game, isNavigating?: boolean) => void,
  fetchGames: () => Promise<void>,
  loading: boolean,
  isFavorite: (id: string) => boolean,
  activeSystem: string,
  searchQuery: string,
  setActiveSystem: Setter,
  setSearchQuery: Setter,
  sfx: SfxEngine,
  themeEngine: ThemeEngine,
  getGameStats: (id: string) => GameStats,
  onResetStats: (id: string) => void,
  onPlayGame: (game: Game) => void,
  onToggleFavorite: (id: string) => void,
  onEditMetadata: (game: Game, meta: Metadata) => void,
  onScrapeGame: (game: Game) => Promise<void>,
  onExportSave: (game: Game) => void,
  onImportSave: (file: File, game: Game) => void,
  onDeleteSave: (game: Game) => void,
  hasSaveData: (game: Game) => boolean,
  scraper: ScraperEngine
})
```

### Source Locations
- Grid Router: [src/components/CartridgeGrid.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/CartridgeGrid.jsx)
- Vanilla Theme View: [src/components/theme-views/VanillaView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/theme-views/VanillaView.jsx)
- DS Touch Theme View: [src/components/theme-views/DsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/theme-views/DsView.jsx)
- Physical Cartridge Tile: [src/components/CartridgeTile.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/CartridgeTile.jsx)

# Scraper Scope Selector Modal (`architecture/components/scraper-modal.md`)

## 1. Description

The `ScraperModal` component is a granular metadata scraper scope selector dialog. Triggered from the Topbar sparkles button (`onOpenScraperModal`), it allows players to choose exactly what portion of the library to scrape for online cover art and game metadata — from a single title up to the entire library — before dispatching the scrape operation. 100% theme-adaptive and keyboard/gamepad navigable.

---

## 2. Detailed List of What It Does

- **4-Tab Scope Selection** (`activeTab`: `'all'` | `'single'` | `'multi'` | `'title'`):
  - **All Systems** (`'all'`): Targets the entire ROM library. Shows total game count. One-click scrape or overwrite trigger.
  - **Single System** (`'single'`): Dropdown of active systems with installed games. Targets all ROMs in the selected console category.
  - **Multi-System** (`'multi'`): Checkbox grid of active systems. User selects 2+ consoles to batch-scrape simultaneously.
  - **Individual Title** (`'title'`): Inline search bar filtering `games` by title or system name. Displays up to 30 results. User selects one specific ROM to scrape.

- **Force Overwrite Toggle**: `forceOverwrite` checkbox — when enabled, re-scrapes games even if they already have cached metadata (useful for refreshing stale data).

- **Live Scrape Log Panel**: Toggle button reveals a `Terminal`-style scrolling log panel showing real-time `scraper.scrapeLogs[]` output as the operation runs.

- **Target Count Badge**: Dynamically calculated count of how many ROMs will be affected by the current scope selection, displayed next to the scrape button.

- **Scrape / Stop Controls**:
  - **Scrape Now** button: Dispatches `scraper.scrapeAll(targetGames, { forceOverwrite })` for the selected scope.
  - **Stop** button: Calls `scraper.stopScraping()` to halt an in-progress operation.
  - Live progress indicator from `scraper.scrapingProgress` (`completed / total`).

- **100% Keyboard & Gamepad Navigation**: `Escape` / `B` closes. Arrow keys navigate tabs. `Enter` / `A` confirms selection.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `isOpen` (boolean): Controls modal visibility.
- `onClose` (function): Dismisses modal.
- `systems` (Array): Full system catalog — filtered to `activeSystems` (those with `gameCount > 0`).
- `games` (Array): Full ROM catalog for individual title search and count calculation.
- `scraper` (Object): Scraper engine instance from `useMetadataScraper`. Exposes:
  - `scrapeAll(games, options)`: Initiates batch scrape.
  - `scrapeSingleGame(game)`: Scrapes one title.
  - `stopScraping()`: Halts in-progress operation.
  - `isScraping` (boolean): Active scrape in progress.
  - `scrapingProgress` (Object): `{ completed, total }` progress counters.
  - `scrapeLogs` (Array): Array of log strings from the scrape session.
- `sfx` (Object): Web Audio synthesizer.
- `focusedTarget` & `setFocusedTarget`: Spatial navigation state.

### Key Internal State
- `activeTab`: Current scope mode.
- `selectedSingleSystem`: Key of the selected system for single-mode.
- `selectedMultiSystems`: Array of selected system keys for multi-mode.
- `gameSearch`: Text query for individual title filter.
- `selectedGameId`: ID of the chosen title for title-mode scrape.
- `forceOverwrite`: Whether to re-scrape already-cached titles.
- `showLogs`: Toggle for the log output panel.

### Target Game Computation
```javascript
if (activeTab === 'all')   targetGames = games;
if (activeTab === 'single') targetGames = games.filter(g => g.systemKey === selectedSingleSystem);
if (activeTab === 'multi')  targetGames = games.filter(g => selectedMultiSystems.includes(g.systemKey));
if (activeTab === 'title')  targetGames = games.filter(g => g.id === selectedGameId);
```

### Source Location
- Component: [src/components/ScraperModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ScraperModal.jsx)
- Scraper Hook: [src/hooks/useMetadataScraper.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useMetadataScraper.js)
- Scraper Service: [src/services/metadataScraper.js](file:///Users/godarayudhvir/Github/retro-player/src/services/metadataScraper.js)

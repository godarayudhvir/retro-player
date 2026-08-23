# Smart Collections & Playtime Analytics Specification

## 1. Description
The **Smart Collections & Playtime Analytics** system enhances library navigation and gaming progression tracking. Players can mark their favorite titles with a single keystroke or controller button, navigate automatically curated collections (**⭐ Favorites** and **🕒 Recently Played**), and monitor persistent gameplay analytics (total session playtime, launch counts, and last played timestamps).

---

## 2. Detailed List of What It Does
- **⭐ Favorites Management**:
  - Toggle favorite status via controller `X` button, keyboard `F` key, or the interactive drawer button in `GameDetailModal.jsx`.
  - Displays a sparkling star badge (`⭐`) on favorited 3D cartridge tiles.
  - Dedicated **⭐ Favorites** smart tab on the `SystemRibbon.jsx` with dynamic item count.
- **🕒 Recently Played History**:
  - Automatically records every launched game session into an ordered recents queue (up to 40 titles).
  - Dedicated **🕒 Recent** smart tab on the `SystemRibbon.jsx` presenting games in chronological order of last play.
- **⏱️ Playtime & Session Analytics**:
  - Live session duration tracking while playing inside `EmulatorModal.jsx`.
  - Formatted metrics in `GameDetailModal.jsx`: Total Playtime (e.g. `1 hr 24 min` / `< 1 min`), Total Sessions (`4 launches`), and Last Played timestamp.
- **Persistent Storage**: All favorites, recents, and playtime metrics are stored in `localStorage` under `retro_player_favorites`, `retro_player_recents`, and `retro_player_playtime`.
- **Acoustic Feedback**: Web Audio API arpeggio on adding favorite and gentle harmonic release tone on removing favorite.

---

## 3. Detailed Logic Behind Everything and How It Works
- **Storage Management ([usePlaytimeAndFavorites.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/usePlaytimeAndFavorites.js))**:
  - Manages `favorites` array and `recentlyPlayed` queue.
  - Manages `playtimeStats` mapping: `{ [gameId]: { totalSeconds, launchCount, lastPlayed, lastSessionSeconds } }`.
  - Exports `formatPlaytime(seconds)` and `formatLastPlayed(timestamp)` helpers.
- **Manifest Filtering ([useRomManifest.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useRomManifest.js))**:
  - When `activeSystem === 'favorites'`, filters `games.filter(g => favorites.includes(g.id || g.title))`.
  - When `activeSystem === 'recent'`, filters games present in `recentlyPlayed` and preserves recency sort order.
- **Session Duration Tracking ([EmulatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/EmulatorModal.jsx))**:
  - Implements an active seconds timer (`activeSecondsRef`) that runs only when the browser tab is focused and active (`document.visibilityState === 'visible'`). Background tab idle time is automatically paused and ignored.
  - Utilizes a single-execution guard (`sessionReportedRef`) to ensure session durations are recorded exactly once per exit without double-counting on unmount.
- **Stats Reset Capability ([DsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/theme-views/DsView.jsx))**:
  - Provides an inline reset trigger (`onResetStats`) within the Playtime card allowing users to reset stats for specific games.
- **Controller & Spatial Navigation ([useGamepadNavigation.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useGamepadNavigation.js))**:
  - Gamepad button 2 (`btnX`) and keyboard key `F` toggle favorite for the focused tile in `DsView` or mobile stages.

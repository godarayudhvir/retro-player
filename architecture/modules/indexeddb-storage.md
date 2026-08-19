# Centralized Storage & Database Architecture (`architecture/modules/indexeddb-storage.md`)

## 1. Description
The **Storage & Database Engine** (`src/services/db.js`, `server.js`, `vite.config.js`) serves as the permanent, high-performance database layer for **Retro Player**. It synchronizes all Profiles, User Data (Favorites, Recently Played history, and Playtime analytics), Settings, and Game Saves between a **Server-Side JSON Database** (`data/retroplayer_db.json`) and a client-side **IndexedDB Cache** (`RetroPlayerDB`).

---

## 2. Detailed List of What It Does
- **Server-Side Persistent Database (`/data/retroplayer_db.json`)**:
  - Automatically mounted in Docker (`-v ./data:/data`) and local disks.
  - Exposes REST endpoints (`/api/db/:store`, `/api/db/:store/:key`) for robust CRUD operations.
  - Immune to browser "Clear Site Data", incognito sessions, browser switching, and cache resets.
- **Client-Side Database (`RetroPlayerDB` & `RetroPlayerMetadataDB`)**:
  - `profiles`: User accounts, Nintendo Mii vector configurations, and signature colors (`keyPath: 'id'`).
  - `user_data`: Scoped user activity logs, persistent favorites, recents queue, and playtime sessions (`keyPath: 'key'`).
  - `app_settings`: Global console configuration, active profile ID, volume, and preferences.
  - `game_saves`: Native in-game battery SRAM (.sav) blobs.
  - `save_states`: Real-time quick state snapshot payloads (.state).
  - `game_metadata`: Server-synchronized game box art URLs, Wikipedia synopses, release years, and publisher info.
- **Dual-Layer Real-Time Sync**:
  - Authoritative persistence in **Server Database** (`/data/retroplayer_db.json`).
  - Local **IndexedDB** acts as an instant 0ms offline cache.
  - In-memory React state cache guarantees zero UI flickering during navigation.

---

## 3. Detailed Logic Behind Everything and How It Works

### Database Service API (`src/services/db.js`)
- `getDB()`: Opens or upgrades the `RetroPlayerDB` database instance.
- `dbGet(storeName, key)`: Queries `/api/db/:store/:key` for the authoritative record, updates the local IndexedDB cache, and falls back to local IndexedDB if offline.
- `dbSet(storeName, key, value)`: Asynchronously writes to both the Server DB REST API (`POST /api/db/:store`) and local IndexedDB.
- `dbDelete(storeName, key)`: Deletes the record from both the Server DB (`DELETE /api/db/:store/:key`) and local IndexedDB.
- `dbGetAll(storeName)`: Fetches the entire collection from `/api/db/:store` and synchronizes the local IndexedDB store.

### Module Integrations
- [useProfileManager.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useProfileManager.js): Reads and writes all profile configurations to `STORES.PROFILES` and active profile pointer in `STORES.SETTINGS`.
- [usePlaytimeAndFavorites.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/usePlaytimeAndFavorites.js): Reads and writes favorites (`favs_<profileId>`), recently played (`recents_<profileId>`), and playtime logs (`playtime_<profileId>`) to `STORES.USER_DATA`.
- [EmulatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/EmulatorModal.jsx): Commits battery SRAM and snapshot states to `STORES.GAME_SAVES` and `STORES.SAVE_STATES`.

### Source Locations
- Core Database Service: [src/services/db.js](file:///Users/godarayudhvir/Github/retro-player/src/services/db.js)
- Server DB REST Engine: [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js), [vite.config.js](file:///Users/godarayudhvir/Github/retro-player/vite.config.js)
- Profile Manager: [src/hooks/useProfileManager.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useProfileManager.js)
- User Analytics & Favorites: [src/hooks/usePlaytimeAndFavorites.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/usePlaytimeAndFavorites.js)

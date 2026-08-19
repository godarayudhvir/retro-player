# Centralized IndexedDB Storage Architecture (`architecture/modules/indexeddb-storage.md`)

## 1. Description
The **Centralized IndexedDB Storage Engine** (`src/services/db.js`) serves as the permanent, high-performance structured database layer for **Retro Player**. It completely replaces temporary volatile storage with dedicated database object stores for Profiles, User Data (Favorites, Recently Played history, and Playtime analytics), Settings, and Scraped Cover Art.

---

## 2. Detailed List of What It Does
- **Database Schema (`RetroPlayerDB`)**:
  - `profiles`: Primary store for user accounts, Nintendo Mii vector configurations, and signature colors (`keyPath: 'id'`).
  - `user_data`: Scoped user activity logs, persistent favorites, recents queue, and playtime sessions (`keyPath: 'key'`).
  - `app_settings`: Global console configuration, active profile ID, volume, and preferences.
- **Database Schema (`RetroPlayerMetadataDB`)**:
  - `game_metadata`: Scraped high-res 3D box art binaries, synopsis blurbs, and developer metadata from Libretro / Wikipedia.
- **Dual-Layer Cache Architecture**:
  - Authoritative persistence in **IndexedDB**.
  - Synchronous memory cache to guarantee zero-latency UI rendering during instant tab/game switches without layout flash.

---

## 3. Detailed Logic Behind Everything and How It Works

### Database Service API (`src/services/db.js`)
- `getDB()`: Opens or upgrades the `RetroPlayerDB` database instance with proper object stores.
- `dbGet(storeName, key)`: Asynchronously retrieves a record by primary key.
- `dbSet(storeName, key, value)`: Asynchronously writes or updates a record in the database.
- `dbDelete(storeName, key)`: Asynchronously deletes a record by primary key.
- `dbGetAll(storeName)`: Retrieves all records in the specified object store.

### Module Integrations
- [useProfileManager.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useProfileManager.js): Reads and writes all profile configurations to `STORES.PROFILES` and active profile pointer in `STORES.SETTINGS`.
- [usePlaytimeAndFavorites.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/usePlaytimeAndFavorites.js): Reads and writes favorites (`favs_<profileId>`), recently played (`recents_<profileId>`), and playtime logs (`playtime_<profileId>`) to `STORES.USER_DATA`.
- [metadataScraper.js](file:///Users/godarayudhvir/Github/retro-player/src/services/metadataScraper.js): Stores binary cover art in `RetroPlayerMetadataDB`.

### Source Locations
- Core Database Service: [src/services/db.js](file:///Users/godarayudhvir/Github/retro-player/src/services/db.js)
- Profile Manager: [src/hooks/useProfileManager.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useProfileManager.js)
- User Analytics & Favorites: [src/hooks/usePlaytimeAndFavorites.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/usePlaytimeAndFavorites.js)

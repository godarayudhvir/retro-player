/**
 * Centralized IndexedDB Storage Engine for Retro Player.
 * Provides permanent, high-performance database storage for Profiles, Favorites,
 * Playtime Analytics, Recents, and Settings.
 */

const DB_NAME = 'RetroPlayerDB';
const DB_VERSION = 2;

const STORES = {
  PROFILES: 'profiles',
  USER_DATA: 'user_data',       // Favorites, Recents, Playtime scoped by profile
  SETTINGS: 'app_settings',     // Global settings, theme, volume
  GAME_SAVES: 'game_saves',     // In-game battery SRAM (.sav) mapped by game.id
  SAVE_STATES: 'save_states'    // Real-time snapshot states (.state) mapped by game.id
};

let dbInstance = null;

/**
 * Open or upgrade the database instance.
 */
export function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // 1. Profiles Store: keyPath: 'id'
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
      }

      // 2. User Data Store (Favorites, Recents, Playtime): keyPath: 'key' (e.g. 'favs_prof_123')
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }

      // 3. Settings Store: keyPath: 'key'
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }

      // 4. Game Battery Saves (.sav) Store: keyPath: 'key'
      if (!db.objectStoreNames.contains(STORES.GAME_SAVES)) {
        db.createObjectStore(STORES.GAME_SAVES, { keyPath: 'key' });
      }

      // 5. Game Save States (.state) Store: keyPath: 'key'
      if (!db.objectStoreNames.contains(STORES.SAVE_STATES)) {
        db.createObjectStore(STORES.SAVE_STATES, { keyPath: 'key' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('🚨 [INDEXEDDB ERROR] Failed to open RetroPlayerDB:', e.target.error);
      resolve(null);
    };
  });
}

/**
 * Generic Get item by key from specific store.
 */
export async function dbGet(storeName, key) {
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value !== undefined ? request.result.value : request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.error(`[INDEXEDDB GET ERROR in ${storeName}]:`, e);
    return null;
  }
}

/**
 * Generic Set / Put item in specific store.
 */
export async function dbSet(storeName, key, value) {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // If object has id as primary key
      const record = typeof value === 'object' && value !== null && store.keyPath === 'id'
        ? { ...value, id: key }
        : { key, value };

      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (e) {
    console.error(`[INDEXEDDB SET ERROR in ${storeName}]:`, e);
    return false;
  }
}

/**
 * Generic Delete item from specific store.
 */
export async function dbDelete(storeName, key) {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (e) {
    console.error(`[INDEXEDDB DELETE ERROR in ${storeName}]:`, e);
    return false;
  }
}

/**
 * Get all items from a store.
 */
export async function dbGetAll(storeName) {
  try {
    const db = await getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        if (store.keyPath === 'id') {
          resolve(results);
        } else {
          resolve(results.map(r => r.value));
        }
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error(`[INDEXEDDB GET_ALL ERROR in ${storeName}]:`, e);
    return [];
  }
}

export { STORES };

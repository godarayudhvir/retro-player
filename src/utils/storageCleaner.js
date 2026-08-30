import { clearAllIndexedDbStores, closeDB } from '../services/db';

/**
 * Centralized Client-Side Browser Storage & Cache Purger
 * Safely clears browser IndexedDB, CacheStorage (Service Worker), and localStorage
 * without affecting server disk files (ROMs, covers, sidecars).
 */
export async function clearBrowserCacheAndData() {
  const results = {
    indexedDb: false,
    cacheStorage: false,
    localStorage: false,
    sessionStorage: false
  };

  // 1. Purge all object stores and close open connection
  try {
    await clearAllIndexedDbStores();
  } catch (e) {
    console.warn('⚠️ [CACHE PURGE] Error clearing IndexedDB stores:', e);
  }

  // 2. Clear CacheStorage (Service Worker asset caches)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      results.cacheStorage = true;
    } catch (e) {
      console.warn('⚠️ [CACHE PURGE] Error deleting CacheStorage:', e);
    }
  }

  // 3. Clear IndexedDB Databases
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      closeDB();
      const dbsToPurge = ['RetroPlayerDB', 'retroplayer_metadata_db', 'RetroPlayerMetadataDB', 'localforage', 'emulatorjs'];
      await Promise.all(
        dbsToPurge.map((dbName) => {
          return new Promise((resolve) => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
            req.onblocked = () => resolve(false);
            setTimeout(resolve, 300);
          });
        })
      );
      results.indexedDb = true;
    } catch (e) {
      console.warn('⚠️ [CACHE PURGE] Error deleting IndexedDB:', e);
    }
  }

  // 4. Clear LocalStorage and SessionStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear();
      results.localStorage = true;
    } catch (e) {
      console.warn('⚠️ [CACHE PURGE] Error clearing localStorage:', e);
    }

    try {
      sessionStorage.clear();
      results.sessionStorage = true;
    } catch (e) {
      console.warn('⚠️ [CACHE PURGE] Error clearing sessionStorage:', e);
    }
  }

  return results;
}

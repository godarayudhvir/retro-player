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

  // 1. Clear CacheStorage (Service Worker asset caches)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      results.cacheStorage = true;
    } catch (e) {
      console.warn('⚠️ [CACHE PURGE] Error deleting CacheStorage:', e);
    }
  }

  // 2. Clear IndexedDB Databases
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      const dbsToPurge = ['RetroPlayerDB', 'retroplayer_metadata_db', 'localforage'];
      await Promise.all(
        dbsToPurge.map((dbName) => {
          return new Promise((resolve) => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
            req.onblocked = () => resolve(false);
          });
        })
      );
      results.indexedDb = true;
    } catch (e) {
      console.warn('⚠️ [CACHE PURGE] Error deleting IndexedDB:', e);
    }
  }

  // 3. Clear LocalStorage and SessionStorage
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

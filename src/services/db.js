/**
 * Centralized IndexedDB Storage Engine for Retro Player.
 * Provides permanent, high-performance database storage for Profiles, Favorites,
 * Playtime Analytics, Recents, and Settings.
 */

const DB_NAME = 'RetroPlayerDB';
const DB_VERSION = 4;

const STORES = {
  PROFILES: 'profiles',
  USER_DATA: 'user_data',       // Favorites, Recents, Playtime scoped by profile
  SETTINGS: 'app_settings',     // Global settings, theme, volume, ui_mode, active_profile
  GAME_SAVES: 'game_saves',     // In-game battery SRAM (.sav) mapped by game.id
  SAVE_STATES: 'save_states',   // Real-time snapshot states (.state) mapped by game.id
  GAME_METADATA: 'game_metadata', // Custom / scraped metadata cached locally
  CUSTOM_ROMS: 'custom_roms'    // Persistent client-side ROM binaries for GitHub Pages / offline PWA
};

let dbInstance = null;
let isServerDbAvailable = typeof window !== 'undefined' && !window.location.hostname.endsWith('github.io');

export function checkServerDbStatus() {
  return isServerDbAvailable;
}

/**
 * Close active IndexedDB database connection.
 */
export function closeDB() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {}
    dbInstance = null;
  }
}

/**
 * Empties all object stores inside RetroPlayerDB immediately and closes the connection.
 */
export async function clearAllIndexedDbStores() {
  try {
    const db = await getDB();
    if (db) {
      const storeNames = Array.from(db.objectStoreNames);
      if (storeNames.length > 0) {
        const tx = db.transaction(storeNames, 'readwrite');
        for (const storeName of storeNames) {
          try {
            tx.objectStore(storeName).clear();
          } catch (err) {}
        }
        await new Promise((resolve) => {
          tx.oncomplete = resolve;
          tx.onerror = resolve;
          tx.onabort = resolve;
        });
      }
    }
  } catch (e) {
    console.warn('⚠️ [PURGE] Error clearing IndexedDB object stores:', e);
  }
  closeDB();
}

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

      // 6. Game Metadata Store: keyPath: 'key'
      if (!db.objectStoreNames.contains(STORES.GAME_METADATA)) {
        db.createObjectStore(STORES.GAME_METADATA, { keyPath: 'key' });
      }

      // 7. Custom ROMs Store: keyPath: 'id'
      if (!db.objectStoreNames.contains(STORES.CUSTOM_ROMS)) {
        db.createObjectStore(STORES.CUSTOM_ROMS, { keyPath: 'id' });
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
 * First checks Server DB API, caches to IndexedDB. Falls back to IndexedDB if offline.
 */
export async function dbGet(storeName, key) {
  // 1. Attempt to fetch authoritative record from Server DB API if available
  if (isServerDbAvailable) {
    try {
      const res = await fetch(`/api/db/${encodeURIComponent(storeName)}/${encodeURIComponent(key)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data !== null && json.data !== undefined) {
          // Cache to IndexedDB for offline access
          try {
            const db = await getDB();
            if (db) {
              const tx = db.transaction([storeName], 'readwrite');
              const store = tx.objectStore(storeName);
              const record = typeof json.data === 'object' && json.data !== null && store.keyPath === 'id'
                ? { ...json.data, id: key }
                : { key, value: json.data };
              store.put(record);
            }
          } catch (e) {}
          return json.data;
        }
      } else if (res.status === 404 || res.status === 405) {
        isServerDbAvailable = false;
      }
    } catch (err) {
      isServerDbAvailable = false;
    }
  }

  // 2. Offline / Local IndexedDB Fallback
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
 * Commits to Server DB API and updates IndexedDB simultaneously.
 */
export async function dbSet(storeName, key, value) {
  // 1. Commit to Server DB API if available
  if (isServerDbAvailable) {
    try {
      fetch(`/api/db/${encodeURIComponent(storeName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, id: key, value })
      }).catch(() => {
        isServerDbAvailable = false;
      });
    } catch (e) {
      isServerDbAvailable = false;
    }
  }

  // 2. Commit to local IndexedDB
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

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
 * Deletes from Server DB API and IndexedDB.
 */
export async function dbDelete(storeName, key) {
  // 1. Delete on Server DB API if available
  if (isServerDbAvailable) {
    try {
      fetch(`/api/db/${encodeURIComponent(storeName)}/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      }).catch(() => {
        isServerDbAvailable = false;
      });
    } catch (e) {
      isServerDbAvailable = false;
    }
  }

  // 2. Delete in local IndexedDB
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
 * Fetches authoritative dataset from Server DB API, syncing local IndexedDB cache.
 */
export async function dbGetAll(storeName) {
  // 1. Attempt to fetch complete collection from Server DB API if available
  if (isServerDbAvailable) {
    try {
      const res = await fetch(`/api/db/${encodeURIComponent(storeName)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const serverItems = Array.isArray(json.data) ? json.data : Object.values(json.data);
          if (serverItems.length > 0) {
            // Sync server items to IndexedDB
            try {
              const db = await getDB();
              if (db) {
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                for (const item of serverItems) {
                  const key = item.id || item.key;
                  const record = store.keyPath === 'id' ? item : { key, value: item };
                  store.put(record);
                }
              }
            } catch (e) {}
            return serverItems;
          }
        }
      } else if (res.status === 404 || res.status === 405) {
        isServerDbAvailable = false;
      }
    } catch (err) {
      isServerDbAvailable = false;
    }
  }

  // 2. Offline / Local IndexedDB Fallback
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
          resolve(results.map(r => r.value !== undefined ? r.value : r));
        }
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error(`[INDEXEDDB GET_ALL ERROR in ${storeName}]:`, e);
    return [];
  }
}

/**
 * Get all keys from a store in IndexedDB.
 */
export async function dbGetAllKeys(storeName) {
  try {
    const db = await getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error(`[INDEXEDDB GET_ALL_KEYS ERROR in ${storeName}]:`, e);
    return [];
  }
}

/**
 * Synchronize all stores from Server DB to local IndexedDB (Cold Boot Sync).
 */
export async function syncAllStoresFromBackend() {
  if (!isServerDbAvailable) return false;

  try {
    const res = await fetch('/api/db/export');
    if (!res.ok) return false;
    const json = await res.json();
    if (!json.success || !json.database) return false;

    const db = await getDB();
    if (!db) return false;

    const data = json.database;
    const storeMappings = [
      { name: STORES.PROFILES, raw: data.profiles, isArray: true },
      { name: STORES.USER_DATA, raw: data.user_data, isArray: false },
      { name: STORES.SETTINGS, raw: data.app_settings, isArray: false },
      { name: STORES.GAME_SAVES, raw: data.game_saves, isArray: false },
      { name: STORES.SAVE_STATES, raw: data.save_states, isArray: false },
      { name: STORES.GAME_METADATA, raw: data.game_metadata, isArray: false }
    ];

    for (const mapping of storeMappings) {
      if (!mapping.raw) continue;
      try {
        const tx = db.transaction([mapping.name], 'readwrite');
        const store = tx.objectStore(mapping.name);

        if (mapping.isArray && Array.isArray(mapping.raw)) {
          for (const item of mapping.raw) {
            if (item && item.id) store.put(item);
          }
        } else if (typeof mapping.raw === 'object') {
          for (const [key, value] of Object.entries(mapping.raw)) {
            store.put({ key, value });
          }
        }
      } catch (err) {
        console.warn(`[COLD BOOT SYNC] Warning syncing store ${mapping.name}:`, err);
      }
    }

    console.log('⚡ [COLD BOOT SYNC] Local IndexedDB successfully synchronized from server filesystem');
    return true;
  } catch (err) {
    console.warn('[COLD BOOT SYNC] Backend sync unavailable:', err.message);
    return false;
  }
}

/**
 * Export full database across all stores (Server DB + Local IndexedDB).
 */
export async function exportFullDatabase() {
  // 1. Try server DB endpoint first
  if (isServerDbAvailable) {
    try {
      const res = await fetch('/api/db/export');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.database) {
          return json;
        }
      }
    } catch (e) {}
  }

  // 2. Local IndexedDB fallback (GitHub Pages / Offline)
  try {
    const db = await getDB();
    if (!db) throw new Error('IndexedDB unavailable');

    const dumpStore = (storeName) => {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction([storeName], 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    };

    const rawProfiles = await dumpStore(STORES.PROFILES);
    const rawUserData = await dumpStore(STORES.USER_DATA);
    const rawSettings = await dumpStore(STORES.SETTINGS);
    const rawSaves = await dumpStore(STORES.GAME_SAVES);
    const rawStates = await dumpStore(STORES.SAVE_STATES);
    const rawMetadata = await dumpStore(STORES.GAME_METADATA);

    const convertKeyValStore = (items) => {
      const map = {};
      for (const item of items) {
        if (item && item.key) {
          map[item.key] = item.value !== undefined ? item.value : item;
        }
      }
      return map;
    };

    return {
      success: true,
      app: 'RetroPlayer',
      version: '1.0.3',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      stats: {
        profilesCount: rawProfiles.length,
        userDataCount: rawUserData.length,
        savesCount: rawSaves.length,
        statesCount: rawStates.length,
        metadataCount: rawMetadata.length
      },
      database: {
        profiles: rawProfiles,
        user_data: convertKeyValStore(rawUserData),
        game_saves: convertKeyValStore(rawSaves),
        save_states: convertKeyValStore(rawStates),
        game_metadata: convertKeyValStore(rawMetadata)
      }
    };
  } catch (err) {
    console.error('🚨 [EXPORT ERROR]:', err);
    throw err;
  }
}

/**
 * Import full database into Server DB and hydrate local IndexedDB.
 */
export async function importFullDatabase(backupPayload) {
  if (!backupPayload || typeof backupPayload !== 'object') {
    throw new Error('Invalid backup file: Missing database payload');
  }

  const database = backupPayload.database || backupPayload;

  // 1. Post to Server DB API if available
  let serverImportSuccess = false;
  if (isServerDbAvailable) {
    try {
      const res = await fetch('/api/db/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupPayload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) serverImportSuccess = true;
      }
    } catch (e) {
      console.warn('Server import failed, applying to local IndexedDB only:', e);
    }
  }

  // 2. Commit to local IndexedDB
  try {
    const db = await getDB();
    if (!db) throw new Error('IndexedDB unavailable');

    const storeMappings = [
      { name: STORES.PROFILES, raw: database.profiles, isArray: true },
      { name: STORES.USER_DATA, raw: database.user_data, isArray: false },
      { name: STORES.GAME_SAVES, raw: database.game_saves, isArray: false },
      { name: STORES.SAVE_STATES, raw: database.save_states, isArray: false },
      { name: STORES.GAME_METADATA, raw: database.game_metadata, isArray: false }
    ];

    for (const mapping of storeMappings) {
      if (!mapping.raw) continue;
      try {
        const tx = db.transaction([mapping.name], 'readwrite');
        const store = tx.objectStore(mapping.name);

        if (mapping.isArray && Array.isArray(mapping.raw)) {
          for (const item of mapping.raw) {
            if (item && item.id) store.put(item);
          }
        } else if (typeof mapping.raw === 'object') {
          for (const [key, value] of Object.entries(mapping.raw)) {
            store.put({ key, value });
          }
        }
      } catch (err) {
        console.warn(`Error writing to local store ${mapping.name}:`, err);
      }
    }

    return {
      success: true,
      serverImportSuccess,
      message: 'Database imported successfully'
    };
  } catch (err) {
    console.error('🚨 [IMPORT ERROR]:', err);
    throw err;
  }
}

/**
 * Saves a custom ROM binary + metadata record to local IndexedDB (STORES.CUSTOM_ROMS).
 * Enables permanent offline library persistence for GitHub Pages and standalone PWAs.
 */
export async function saveCustomRomToLocalDb(gameRecord, fileBlob) {
  try {
    const db = await getDB();
    if (!db) throw new Error('IndexedDB unavailable');

    const entry = {
      id: gameRecord.id,
      title: gameRecord.title,
      rawTitle: gameRecord.rawTitle || gameRecord.title,
      filename: gameRecord.filename || `${gameRecord.title}.bin`,
      systemKey: gameRecord.systemKey,
      systemName: gameRecord.systemName,
      systemCore: gameRecord.systemCore,
      systemColor: gameRecord.systemColor,
      systemIcon: gameRecord.systemIcon,
      coverUrl: gameRecord.coverUrl || null,
      fileBlob: fileBlob, // Stored as Blob in IndexedDB
      fileSize: fileBlob?.size || 0,
      addedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.CUSTOM_ROMS], 'readwrite');
      const store = tx.objectStore(STORES.CUSTOM_ROMS);
      const req = store.put(entry);
      req.onsuccess = () => resolve(entry);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('🚨 [SAVE CUSTOM ROM ERROR]:', err);
    throw err;
  }
}

/**
 * Retrieves all locally saved custom ROMs from IndexedDB and instantiates active Blob URLs.
 */
export async function getAllCustomRomsFromLocalDb() {
  try {
    const db = await getDB();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.CUSTOM_ROMS], 'readonly');
      const store = tx.objectStore(STORES.CUSTOM_ROMS);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        const games = records.map(rec => {
          let romUrl = '';
          if (rec.fileBlob) {
            try {
              romUrl = URL.createObjectURL(rec.fileBlob);
            } catch (_) {}
          }
          return {
            id: rec.id,
            title: rec.title,
            rawTitle: rec.rawTitle,
            filename: rec.filename,
            systemKey: rec.systemKey,
            systemName: rec.systemName,
            systemCore: rec.systemCore,
            systemColor: rec.systemColor,
            systemIcon: rec.systemIcon,
            coverUrl: rec.coverUrl,
            romUrl: romUrl,
            file: rec.fileBlob,
            isCustomBlob: true,
            isLocalDbRom: true,
            addedAt: rec.addedAt
          };
        });
        resolve(games);
      };

      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Could not read custom ROMs from local DB:', err);
    return [];
  }
}

/**
 * Removes a custom ROM from local IndexedDB.
 */
export async function deleteCustomRomFromLocalDb(gameId) {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.CUSTOM_ROMS], 'readwrite');
      const store = tx.objectStore(STORES.CUSTOM_ROMS);
      const req = store.delete(gameId);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('🚨 [DELETE CUSTOM ROM ERROR]:', err);
    return false;
  }
}

/**
 * Saves a desktop FileSystemDirectoryHandle to IndexedDB for zero-copy multi-folder persistence.
 */
export async function saveLinkedDirectoryHandle(dirHandle) {
  if (!dirHandle || !dirHandle.name) return false;
  try {
    const db = await getDB();
    if (!db) return false;
    const existing = await getLinkedDirectoryHandles();
    const updated = existing.filter(h => h.name !== dirHandle.name);
    updated.push(dirHandle);

    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ key: 'linked_directory_handles', value: updated });
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn('Failed to save directory handle in IndexedDB:', e);
    return false;
  }
}

/**
 * Retrieves all saved desktop FileSystemDirectoryHandles from IndexedDB.
 * @returns {Promise<Array<FileSystemDirectoryHandle>>}
 */
export async function getLinkedDirectoryHandles() {
  try {
    const db = await getDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get('linked_directory_handles');
      request.onsuccess = async () => {
        const val = request.result?.value;
        if (Array.isArray(val)) {
          resolve(val);
        } else {
          // Check legacy single-handle key
          const legacyReq = store.get('linked_directory_handle');
          legacyReq.onsuccess = () => {
            const legacyVal = legacyReq.result?.value;
            resolve(legacyVal ? [legacyVal] : []);
          };
          legacyReq.onerror = () => resolve([]);
        }
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

/**
 * Backwards-compatible single handle getter.
 */
export async function getLinkedDirectoryHandle() {
  const handles = await getLinkedDirectoryHandles();
  return handles[0] || null;
}

/**
 * Removes a specific saved directory handle by folder name, or removes all if no folderName provided.
 */
export async function removeLinkedDirectoryHandle(folderName = null) {
  try {
    const db = await getDB();
    if (!db) return false;

    if (folderName) {
      const existing = await getLinkedDirectoryHandles();
      const updated = existing.filter(h => h.name !== folderName);
      return new Promise((resolve) => {
        const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.put({ key: 'linked_directory_handles', value: updated });
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      store.delete('linked_directory_handles');
      store.delete('linked_directory_handle');
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

export { STORES };


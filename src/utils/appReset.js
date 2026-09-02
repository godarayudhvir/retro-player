import { clearAllIndexedDbStores, clearUserDataStoresPreserveRoms, closeDB } from '../services/db.js';
import { apiFetch } from './apiClient.js';

/**
 * Soft Reset Utility for Retro Player.
 * Wipes player profiles, saves, save states, history, settings, and browser caches
 * while strictly PRESERVING all in-app imported ROMs (custom_roms store).
 */
export async function resetUserDataPreserveRoms() {
  console.log('🧹 [APP RESET] Initiating soft data reset (preserving custom ROMs)...');

  // 1. Fire-and-forget backend server DB purge
  apiFetch('/api/db/reset', { method: 'POST' }).catch(() => {});

  // 2. Clear LocalStorage and SessionStorage immediately (synchronous)
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 [APP RESET] LocalStorage & SessionStorage cleared');
  } catch (e) {}

  // 3. Clear IndexedDB stores (with 600ms hard safety timeout)
  try {
    await Promise.race([
      clearUserDataStoresPreserveRoms(),
      new Promise(resolve => setTimeout(resolve, 600))
    ]);
  } catch (e) {}

  // 4. Purge CacheStorage in background
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch (e) {}
  }

  // 5. Clean, immediate reload
  window.location.href = window.location.origin + window.location.pathname;
}

/**
 * Full Client-Side Factory Reset Utility for Retro Player.
 * Wipes all browser storage, caches, service workers, and IndexedDB databases
 * without modifying any codebase or server files on disk, then cleanly reloads.
 */
export async function resetEntireApp() {
  console.log('🧹 [APP RESET] Initiating full client-side factory reset & cache purge...');

  // 1. Fire-and-forget backend server DB reset
  apiFetch('/api/db/reset', { method: 'POST' }).catch(() => {});

  // 2. Clear LocalStorage and SessionStorage immediately (synchronous)
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 [APP RESET] LocalStorage & SessionStorage cleared');
  } catch (e) {}

  // 3. Purge IndexedDB databases with explicit connection close (with 600ms safety timeout)
  try {
    await Promise.race([
      clearAllIndexedDbStores(),
      new Promise(resolve => setTimeout(resolve, 600))
    ]);
    closeDB();
  } catch (e) {}

  // 4. Unregister Service Workers in parallel
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister());
      }).catch(() => {});
    } catch (e) {}
  }

  // 5. Purge CacheStorage
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch (e) {}
  }

  // 6. Delete active databases non-blocking
  try {
    if (typeof indexedDB !== 'undefined') {
      const knownDbs = [
        'RetroPlayerDB',
        'RetroPlayerMetadataDB',
        'retroplayer_metadata_db',
        'emulatorjs',
        'localforage',
        'keyval-store',
        'workbox-expiration-cache',
        'workbox-precache-v2'
      ];
      for (const name of knownDbs) {
        try { indexedDB.deleteDatabase(name); } catch (_) {}
      }
    }
  } catch (e) {}

  // 7. Brief 150ms buffer and hard reload
  setTimeout(() => {
    window.location.href = window.location.origin + window.location.pathname;
  }, 150);
}

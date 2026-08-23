/**
 * Full Client-Side Factory Reset Utility for Retro Player.
 * Wipes all browser storage, caches, service workers, and IndexedDB databases
 * without modifying any codebase or server files on disk, then cleanly reloads.
 */
export async function resetEntireApp() {
  try {
    console.log('🧹 [APP RESET] Initiating full client-side factory reset & cache purge...');

    // 0. Clear backend server DB stores if server is active
    try {
      await fetch('/api/db/reset', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.warn('⚠️ [APP RESET] Server DB purge warn:', e);
    }

    // 1. Unregister all service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('🧹 [APP RESET] Service workers unregistered');
      } catch (e) {
        console.warn('⚠️ [APP RESET] Service worker unregister warn:', e);
      }
    }

    // 2. Delete all CacheStorage entries (PWA assets, cached ROMs, images)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('🧹 [APP RESET] CacheStorage purged');
      } catch (e) {
        console.warn('⚠️ [APP RESET] CacheStorage delete warn:', e);
      }
    }

    // 3. Clear LocalStorage and SessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 [APP RESET] LocalStorage & SessionStorage cleared');
    } catch (e) {
      console.warn('⚠️ [APP RESET] Storage clear warn:', e);
    }

    // 4. Delete all IndexedDB databases
    try {
      const knownDbs = [
        'RetroPlayerDB',
        'emulatorjs',
        'localforage',
        'keyval-store',
        'workbox-expiration-cache',
        'workbox-precache-v2',
        '/home/web_user/retroarch/userdata'
      ];

      // Dynamically discover all active IndexedDB databases in the browser
      if (typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function') {
        try {
          const dbs = await indexedDB.databases();
          for (const dbInfo of dbs) {
            if (dbInfo.name) {
              indexedDB.deleteDatabase(dbInfo.name);
            }
          }
        } catch (dbErr) {
          console.warn('⚠️ [APP RESET] Dynamic databases scan warn:', dbErr);
        }
      }

      // Explicitly delete known databases
      for (const name of knownDbs) {
        try {
          indexedDB.deleteDatabase(name);
        } catch (e) {}
      }
      console.log('🧹 [APP RESET] IndexedDB databases purged');
    } catch (e) {
      console.warn('⚠️ [APP RESET] IndexedDB purge warn:', e);
    }

    // 5. Brief 250ms buffer for browser storage engines to finalize deletions
    await new Promise(resolve => setTimeout(resolve, 250));

    // 6. Hard reload to origin for a fresh start
    window.location.href = window.location.origin + window.location.pathname;
  } catch (err) {
    console.error('🚨 [APP RESET ERROR]:', err);
    window.location.reload();
  }
}

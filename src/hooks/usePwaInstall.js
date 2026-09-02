import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React Hook for PWA installation lifecycle and Service Worker state management.
 * Handles `beforeinstallprompt` events, standalone mode detection, and manual cache updates.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('idle'); // 'idle' | 'updating' | 'updated' | 'error'
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const waitingWorkerRef = useRef(null);

  // Detect standalone display mode and register service worker
  useEffect(() => {
    // 1. Check if running in standalone window (PWA installed)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(Boolean(isStandaloneMode));
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      setIsStandalone(e.matches);
      if (e.matches) setIsInstalled(true);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    // 2. Listen for the native `beforeinstallprompt` event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser default mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 3. Listen for the `appinstalled` event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('🎉 [PWA] Retro Player successfully installed to home screen / desktop!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. Register Service Worker in production environment (Unregister in Vite dev)
    if ('serviceWorker' in navigator) {
      if (import.meta.env.DEV) {
        // Automatically unregister lingering dev service workers to prevent Vite chunk caching collisions
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
            console.log('🧹 [PWA] Development mode: Unregistered active ServiceWorker');
          }
        });
        if (typeof window !== 'undefined' && 'caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              if (key.startsWith('retro-player')) {
                caches.delete(key);
                console.log(`🧹 [PWA] Development mode: Purged cache: ${key}`);
              }
            }
          });
        }
      } else {
        const swUrl = (import.meta.env.BASE_URL || './') + 'sw.js';
        navigator.serviceWorker.register(swUrl)
          .then((registration) => {
            setSwRegistered(true);
            console.log('⚡ [PWA] ServiceWorker registered successfully with scope:', registration.scope);

            // Check if there is already a waiting worker
            if (registration.waiting) {
              waitingWorkerRef.current = registration.waiting;
              setUpdateAvailable(true);
            }

            // Listen for newly installed updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  waitingWorkerRef.current = newWorker;
                  setUpdateAvailable(true);
                  console.log('🚀 [PWA] New version ready for activation');
                }
              });
            });
          })
          .catch((err) => {
            console.warn('⚠️ [PWA] ServiceWorker registration failed:', err);
          });
      }
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger the native install prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] No deferred install prompt available.');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install prompt outcome: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (err) {
      console.error('[PWA] Error during install prompt:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Manually refresh and update offline cache
  const refreshCache = useCallback(async () => {
    if (!('caches' in window)) return false;

    setCacheStatus('updating');
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      setCacheStatus('updated');
      setTimeout(() => setCacheStatus('idle'), 3000);
      return true;
    } catch (err) {
      console.error('[PWA] Failed to refresh cache:', err);
      setCacheStatus('error');
      setTimeout(() => setCacheStatus('idle'), 3000);
      return false;
    }
  }, []);

  // Apply update immediately by activating waiting worker and reloading
  const applyUpdate = useCallback(() => {
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    }
    let refreshing = false;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  return {
    canInstall: Boolean(deferredPrompt && !isStandalone),
    isStandalone,
    isInstalled,
    swRegistered,
    cacheStatus,
    updateAvailable,
    applyUpdate,
    promptInstall,
    refreshCache
  };
}

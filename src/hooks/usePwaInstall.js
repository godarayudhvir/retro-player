import { useState, useEffect, useCallback } from 'react';

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

    // 4. Register Service Worker in production/local environment
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwRegistered(true);
          console.log('⚡ [PWA] ServiceWorker registered successfully with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('⚠️ [PWA] ServiceWorker registration failed:', err);
        });
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

  return {
    canInstall: Boolean(deferredPrompt && !isStandalone),
    isStandalone,
    isInstalled,
    swRegistered,
    cacheStatus,
    promptInstall,
    refreshCache
  };
}

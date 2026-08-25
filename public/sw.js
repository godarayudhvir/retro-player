/**
 * Retro Player - High-Performance Offline Service Worker
 * Caches core UI shell assets, Google Fonts, and offline WebAssembly emulator cores.
 * 
 * NOTE: ROMs are downloaded on-demand only and are NEVER cached in ServiceWorker storage.
 * External scraper probes (Libretro CDN, Wikipedia) are NEVER cached to prevent Chrome quota padding.
 */

const CACHE_NAME = 'retro-player-v1.0.3';

// Critical core assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32x32.png',
  './icons/favicon-16x16.png',
  './screenshots/desktop-1.webp',
  './screenshots/mobile-1.webp'
];

// File extensions identifying ROM binaries that must only be fetched on-demand
const ROM_EXT_REGEX = /\.(zip|7z|nes|sfc|smc|snes|z64|n64|v64|gba|gbc|gb|nds|bin|iso|pbp|chd|cue|md|smd|gen|gg|sms|pce|ngp|ngc|ws|wsc|a26|a78|jag|vec|lynx)$/i;

// Install Event: Pre-cache core shell assets and immediately activate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache addAll warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up stale legacy caches (wipes old v1 cache to reclaim storage) and claim active clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging legacy cache:', name);
            return caches.delete(name);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent caching strategies based on resource domain
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Bypass non-http(s) requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // RULE 1: ROM Files & ROM Directories -> Direct Network Fetch ONLY (Never stored in ServiceWorker Cache)
  if (url.pathname.includes('/roms/') || ROM_EXT_REGEX.test(url.pathname)) {
    return; // Let browser fetch directly on-demand
  }

  // RULE 2: External Scraper Probes (Libretro CDN, Wikipedia, TheGamesDB, ScreenScraper)
  // NEVER cache external cross-origin probes in SW to prevent Chromium 7MB opaque quota padding
  if (
    url.hostname.includes('thumbnails.libretro.com') ||
    url.hostname.includes('raw.githubusercontent.com') ||
    url.hostname.includes('wikipedia.org') ||
    url.hostname.includes('thegamesdb.net') ||
    url.hostname.includes('screenscraper.fr')
  ) {
    return; // Direct network fetch, metadataMap in IndexedDB handles caching
  }

  // Strategy 1: Dynamic REST API endpoints (/api/*) -> Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(JSON.stringify({ error: 'Offline network unavailable' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Strategy 2: EmulatorJS Assets, WebAssembly cores, fonts, and static assets -> Cache First, fallback to network
  if (
    url.pathname.startsWith('/emulatorjs/') ||
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.emulatorjs.org') ||
    /\.(js|css|svg|png|jpg|jpeg|webp|woff2|wasm|json)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // STRICT: Only cache standard 200 OK responses, NEVER opaque responses
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[SW] Fetch failed for asset:', url.pathname, err);
          return cachedResponse || Response.error();
        });
      })
    );
    return;
  }

  // Strategy 3: HTML navigation (SPA fallback) -> Network First, fallback to cached index.html
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html').then((cachedIndex) => {
            return cachedIndex || caches.match('./') || caches.match('/index.html') || caches.match('/');
          });
        })
    );
    return;
  }
});

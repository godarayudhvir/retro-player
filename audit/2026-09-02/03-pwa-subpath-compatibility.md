# 📱 Audit Specification 03: PWA & Subpath Compatibility

> **Audit Date**: 2026-09-02  
> **Severity**: 🟠 **HIGH**  
> **Impact**: Offline Reliability, GitHub Pages / Reverse-Proxy Hosting, PWA Installability, Service Worker Lifecycle  
> **Target Files**: `public/sw.js`, `src/components/EmulatorModal.jsx`, `src/services/db.js`, `src/hooks/usePwaInstall.js`, `src/utils/apiClient.js`

---

## 📌 1. Executive Summary

This specification resolves critical **subpath-awareness and offline caching defects** across the Service Worker, offline emulator loader, and frontend API fetch services.

While the application is designed to operate under **Tri-Environment Compatibility** (Localhost, Docker self-hosted, and GitHub Pages repository subpath), several core paths assume domain-root hosting (`/`). When deployed to a GitHub Pages subpath (e.g. `https://<user>.github.io/retro-player/`), **Service Worker caching rules fail to match**, **offline emulation fallback breaks with a 404 error**, and **API endpoints route to the wrong origin**.

---

## 🔍 2. Defect Details & Root Cause Analysis

### Defect 3.1: Service Worker Subpath Matching Failure
* **Affected File**: `public/sw.js` (lines 84, 95)
* **Code**:
  ```javascript
  // Strategy 1: Dynamic REST API endpoints
  if (url.pathname.startsWith('/api/'))
  
  // Strategy 2: EmulatorJS Assets, WebAssembly cores, fonts
  if (
    url.pathname.startsWith('/emulatorjs/') ||
    url.pathname.startsWith('/assets/') ||
    ...
  )
  ```
* **Root Cause**:
  On GitHub Pages, `url.pathname` is `/retro-player/emulatorjs/...` and `/retro-player/api/...`.
  Both `url.pathname.startsWith('/api/')` and `url.pathname.startsWith('/emulatorjs/')` return **`false`**.
* **Impact**:
  - EmulatorJS assets and WebAssembly emulator cores fail to hit the cache-first strategy on subpath hosts.
  - API requests fail to utilize network-first caching with offline IndexedDB fallback.

### Defect 3.2: Offline Emulation Fallback 404 Bug
* **Affected File**: `src/components/EmulatorModal.jsx` (lines 653, 1906, 1908)
* **Code**:
  ```javascript
  // Line 653
  const localDataPath = '/emulatorjs/data/';
  
  // Line 1906
  window.EJS_pathtodata = '/emulatorjs/data/';
  
  // Line 1908
  fallbackScript.src = '/emulatorjs/data/loader.js';
  ```
* **Root Cause**:
  Hardcoded absolute path `/emulatorjs/data/` resolves to the domain root (`https://<user>.github.io/emulatorjs/data/loader.js`), which **does not exist**.
* **Impact**: When a user attempts to play offline on GitHub Pages or any subpath deployment, the offline loader fails with a 404 error and emulation halts.

### Defect 3.3: Hardcoded Root `/api/` Fetch Routes
* **Affected Files**:
  - `src/services/db.js` (lines 313, 448, 501, 588)
  - `src/services/metadataScraper.js` (lines 189, 335, 1062)
  - `src/hooks/useRomManifest.js` (lines 138, 455, 474, 657)
  - `src/components/MobileAppView.jsx` (lines 485, 645, 718, 755)
* **Code**:
  ```javascript
  fetch('/api/db/export')
  fetch('/api/upload-rom', { ... })
  fetch('/api/delete-rom', { ... })
  ```
* **Root Cause**: All fetch calls omit `import.meta.env.BASE_URL`, routing to `https://domain.com/api/` instead of `https://domain.com/subpath/api/`.

### Defect 3.4: Precache List Bloat in Service Worker
* **Affected File**: `public/sw.js` (lines 10–23)
* **Code**:
  ```javascript
  const PRECACHE_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    ...
    './docs-screenshots/wide-grid-large.webp',
    './docs-screenshots/mobile-game-grid.webp'
  ];
  ```
* **Root Cause**: Large marketing screenshots are precached on initial installation, consuming megabytes of storage, while essential UI icons and manifest resources are not guaranteed.

### Defect 3.5: Missing In-App Service Worker Update Prompt
* **Affected File**: `src/hooks/usePwaInstall.js` (lines 60–72)
* **Root Cause**: `navigator.serviceWorker.register` does not listen for `registration.onupdatefound` or manage `waiting` workers. When a new version is published, the user continues running stale JavaScript until all browser tabs are manually closed.

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Subpath-Resilient Matching in `public/sw.js`
Update path checks to be subpath-agnostic:
```javascript
// public/sw.js

// Strategy 1: Dynamic REST API endpoints
if (url.pathname.includes('/api/')) {
  // Network-First with cache fallback
  ...
}

// Strategy 2: EmulatorJS Assets, WebAssembly cores, fonts, and static assets
if (
  url.pathname.includes('/emulatorjs/') ||
  url.pathname.includes('/assets/') ||
  url.hostname.includes('fonts.googleapis.com') ||
  url.hostname.includes('fonts.gstatic.com') ||
  url.hostname.includes('cdn.emulatorjs.org') ||
  /\.(js|css|svg|png|jpg|jpeg|webp|woff2|wasm|json)$/i.test(url.pathname)
) {
  // Cache-First with network fallback
  ...
}
```

### Step 2: Clean Up `PRECACHE_ASSETS` in `public/sw.js`
Remove heavy screenshots from initial precache:
```javascript
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
  './icons/favicon-16x16.png'
];
```

### Step 3: Fix Subpath URLs in `src/components/EmulatorModal.jsx`
Import `resolveAssetPath` and use it for all offline paths:
```javascript
import { resolveAssetPath } from '../utils/assetPath';

// Line 653:
const localDataPath = resolveAssetPath('emulatorjs/data/');

// Line 1906:
window.EJS_pathtodata = ${JSON.stringify(localDataPath)};

// Line 1908:
fallbackScript.src = ${JSON.stringify(resolveAssetPath('emulatorjs/data/loader.js'))};
```

### Step 4: Create Universal Subpath `apiFetch` Helper
Create `src/utils/apiClient.js`:
```javascript
/**
 * Subpath-aware API fetch client.
 * Ensures endpoints resolve properly under both domain root and subpath deployments.
 */
export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanEndpoint}`;
}

export async function apiFetch(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}
```
Replace raw `fetch('/api/...')` with `apiFetch('api/...')` across client services.

### Step 5: Add Update Lifecycle Handling in `src/hooks/usePwaInstall.js`
```javascript
// Listen for service worker update events
if ('serviceWorker' in navigator) {
  const swUrl = (import.meta.env.BASE_URL || './') + 'sw.js';
  navigator.serviceWorker.register(swUrl).then((registration) => {
    setSwRegistered(true);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available!
          setUpdateAvailable(true);
        }
      });
    });
  });
}
```

---

## 🧪 4. Verification & Testing Checklist

- [ ] **Subpath Cache Hit Verification**:
  - Open app under subpath URL (e.g. `http://localhost:3000/retro-player/` or test on GitHub Pages).
  - Open DevTools &rarr; Application &rarr; Cache Storage.
  - Verify `/retro-player/emulatorjs/` assets are successfully cached in `retro-player-cache-v*`.
- [ ] **Offline Emulator Launch Test**:
  - Enable Chrome DevTools "Offline" mode.
  - Launch an imported ROM.
  - Verify `emulatorjs/data/loader.js` resolves from local cache without a 404 error.
- [ ] **Precache Size Verification**:
  - Verify `docs-screenshots/wide-grid-large.webp` is not downloaded during initial Service Worker install.
- [ ] **API Route Subpath Test**:
  - Verify `/api/db/export` requests are sent to `<base_url>/api/db/export`.

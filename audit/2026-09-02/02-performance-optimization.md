# ⚡ Audit Specification 02: Performance Optimization

> **Audit Date**: 2026-09-02  
> **Severity**: 🟠 **HIGH**  
> **Impact**: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Bundle Size, CPU / Battery Life  
> **Target Files**: `src/index.css`, `index.html`, `src/App.jsx`, `vite.config.js`, `src/hooks/useGamepadNavigation.js`

---

## 📌 1. Executive Summary

This specification addresses major frontend performance bottlenecks:
1. **Critical CSS `@import` Waterfall**: A blocking `@import` on line 1 of the 580 KB `index.css` stylesheet delays Google Font fetching until CSS parsing completes.
2. **Unused Font Network Waste**: `index.html` downloads `Plus Jakarta Sans` across 6 font weights, but it is **not used anywhere** in the stylesheet or components.
3. **Monolithic Bundle**: Over 20 modals, views, and vector studios are statically bundled into the main chunk, forcing mobile and desktop users to download hundreds of kilobytes of unused JavaScript on cold boot.
4. **Unbounded rAF Gamepad Polling Loop**: Continuous 60–120 Hz `requestAnimationFrame` execution runs even when zero gamepads are plugged in.

---

## 🔍 2. Bottleneck Details & Metrics

### Bottleneck 2.1: Render-Blocking Font `@import`
* **Affected File**: `src/index.css` (line 1)
* **Code**:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap');
  ```
* **Performance Impact**:
  - The browser requests `index.css` (580 KB).
  - Only *after* `index.css` is downloaded and parsed does the browser discover the `@import` rule.
  - The browser then halts CSSOM construction and opens a second TLS connection to `fonts.googleapis.com`.
  - **Result**: Adds 200–500ms of latency to First Contentful Paint (FCP) and causes text layout shifts (FOIT/FOUT).

### Bottleneck 2.2: Unused Font Preloading Wasting Bandwidth
* **Affected File**: `index.html` (lines 50–53)
* **Code**:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  ```
* **Performance Impact**: Downloads ~120 KB of unused WOFF2 font files on every page load. Codebase grep confirms `Plus Jakarta Sans` is never referenced in any CSS rule.

### Bottleneck 2.3: Monolithic Bundle & Lack of `React.lazy()` Code Splitting
* **Affected Files**: `src/App.jsx` (lines 1–21), `vite.config.js`
* **Code**:
  ```javascript
  import Topbar from './components/Topbar';
  import SystemRibbon from './components/SystemRibbon';
  import CartridgeGrid from './components/CartridgeGrid';
  import LoadRomModal from './components/LoadRomModal';
  import AboutInfoModal from './components/AboutInfoModal';
  import DropzoneOverlay from './components/DropzoneOverlay';
  import OnScreenKeyboard from './components/OnScreenKeyboard';
  import EmulatorModal from './components/EmulatorModal';
  import ProfileSelectModal from './components/ProfileSelectModal';
  import ProfileCreatorModal from './components/ProfileCreatorModal';
  import DemoWelcomeModal from './components/DemoWelcomeModal';
  import OnboardingScreen from './components/OnboardingScreen';
  import ScraperModal from './components/ScraperModal';
  import MobileAppView from './components/MobileAppView';
  import MetadataEditModal from './components/MetadataEditModal';
  import BackupModal from './components/BackupModal';
  import KeyboardControlsModal from './components/KeyboardControlsModal';
  import TrophyCabinetModal from './components/TrophyCabinetModal';
  ```
* **Performance Impact**:
  - `EmulatorModal.jsx` is 142 KB.
  - `MobileAppView.jsx` is 165 KB (loaded even on desktop PCs).
  - `TrophyCabinetModal.jsx` is 29 KB.
  - `ScraperModal.jsx` is 25 KB.
  - `BackupModal.jsx` is 21 KB.
  - Initial JS bundle size is bloated, degrading Total Blocking Time (TBT) and time-to-interactive on low-end devices.

### Bottleneck 2.4: Continuous `requestAnimationFrame` Gamepad Polling
* **Affected File**: `src/hooks/useGamepadNavigation.js` (lines 2408–2412)
* **Code**:
  ```javascript
  animId = requestAnimationFrame(pollGamepad);
  ```
* **Performance Impact**: Runs every single frame (60 FPS on 60Hz displays, 120 FPS on ProMotion / 144Hz monitors) constantly calling `navigator.getGamepads()`, draining battery on mobile and laptops even when the user is playing purely via mouse or touch.

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Eliminate CSS `@import` and Update `index.html` Font Loading
1. **Remove line 1 from [src/index.css](file:///Users/godarayudhvir/Github/retro-player/src/index.css)**:
   ```diff
   -@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap');
   ```
2. **Update [index.html](file:///Users/godarayudhvir/Github/retro-player/index.html) `<head>`**:
   ```diff
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   -<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
   +<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet" />
   ```

### Step 2: Implement `React.lazy()` Code-Splitting in `src/App.jsx`
Convert secondary modals to dynamic imports:
```javascript
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';

// Core shell components (eagerly loaded)
import Topbar from './components/Topbar';
import SystemRibbon from './components/SystemRibbon';
import CartridgeGrid from './components/CartridgeGrid';
import DropzoneOverlay from './components/DropzoneOverlay';
import AchievementToast from './components/AchievementToast';

// Lazy-loaded secondary modals and views (loaded on demand)
const EmulatorModal = lazy(() => import('./components/EmulatorModal'));
const MobileAppView = lazy(() => import('./components/MobileAppView'));
const ScraperModal = lazy(() => import('./components/ScraperModal'));
const BackupModal = lazy(() => import('./components/BackupModal'));
const TrophyCabinetModal = lazy(() => import('./components/TrophyCabinetModal'));
const MetadataEditModal = lazy(() => import('./components/MetadataEditModal'));
const KeyboardControlsModal = lazy(() => import('./components/KeyboardControlsModal'));
const AboutInfoModal = lazy(() => import('./components/AboutInfoModal'));
const LoadRomModal = lazy(() => import('./components/LoadRomModal'));
const ProfileSelectModal = lazy(() => import('./components/ProfileSelectModal'));
const ProfileCreatorModal = lazy(() => import('./components/ProfileCreatorModal'));
const DemoWelcomeModal = lazy(() => import('./components/DemoWelcomeModal'));
const OnScreenKeyboard = lazy(() => import('./components/OnScreenKeyboard'));
const OnboardingScreen = lazy(() => import('./components/OnboardingScreen'));
```

Wrap conditionally rendered modals in `<Suspense fallback={null}>`:
```jsx
<Suspense fallback={null}>
  {activeGame && (
    <EmulatorModal
      game={activeGame}
      onClose={() => setActiveGame(null)}
      // ...props
    />
  )}
  {showTrophyModal && <TrophyCabinetModal ... />}
  {showBackupModal && <BackupModal ... />}
  {showScraperModal && <ScraperModal ... />}
</Suspense>
```

### Step 3: Configure Vendor Manual Chunks in `vite.config.js`
In `vite.config.js`:
```javascript
export default defineConfig({
  base: './',
  plugins: [react(), multiConsoleScannerPlugin()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-multiavatar': ['@multiavatar/multiavatar'],
          'vendor-qrcode': ['qrcode']
        }
      }
    }
  }
});
```

### Step 4: Guard `requestAnimationFrame` Gamepad Polling Loop
In `src/hooks/useGamepadNavigation.js`:
```javascript
useEffect(() => {
  let animId;
  let isPolling = false;

  const startPollingIfConnected = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const hasActiveGamepad = Array.from(gamepads).some(gp => gp && gp.connected);
    
    if (hasActiveGamepad && !isPolling) {
      isPolling = true;
      animId = requestAnimationFrame(pollGamepad);
    }
  };

  const handleGamepadConnected = () => {
    setGamepadConnected(true);
    if (!isPolling) {
      isPolling = true;
      animId = requestAnimationFrame(pollGamepad);
    }
  };

  const handleGamepadDisconnected = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const remaining = Array.from(gamepads).some(gp => gp && gp.connected);
    if (!remaining) {
      setGamepadConnected(false);
      isPolling = false;
      if (animId) cancelAnimationFrame(animId);
    }
  };

  window.addEventListener('gamepadconnected', handleGamepadConnected);
  window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

  // Check initial state on mount
  startPollingIfConnected();

  return () => {
    isPolling = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('gamepadconnected', handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
  };
}, [...]);
```

---

## 🧪 4. Verification & Testing Checklist

- [ ] **Network Waterfall Check**: Inspect browser Network tab on reload; verify `Fredoka` & `Nunito` start downloading in parallel with `index.html` and `index.css`, with zero `@import` waterfall.
- [ ] **Unused Font Verification**: Verify zero requests for `Plus Jakarta Sans`.
- [ ] **Bundle Chunk Verification**: Run build check (when authorized by user) to confirm separate vendor chunks (`vendor-react.js`, `vendor-multiavatar.js`, `vendor-icons.js`, `EmulatorModal.js`).
- [ ] **rAF CPU Idle Test**: Open Chrome DevTools Performance tab with no gamepad connected; verify CPU utilization drops to ~0% with no continuous rAF executions.
- [ ] **Gamepad Plug-In Test**: Plug in a controller; verify spatial navigation immediately activates without requiring page reload.

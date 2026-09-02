# ⚡ Audit Specification 02: Performance Optimization (Pending Items)

> **Audit Date**: 2026-09-02  
> **Severity**: 🟠 **HIGH**  
> **Impact**: Initial Page Load (FCP / LCP), JavaScript Execution Time, Battery & CPU Efficiency  
> **Target Files**: `src/App.jsx`, `vite.config.js`, `src/hooks/useGamepadNavigation.js`

---

## 📌 1. Executive Summary

This specification tracks remaining frontend performance optimizations. Font `@import` elimination and Google Font preconnection have been resolved. The remaining performance tasks are:
1. **Lazy loading secondary modals via `React.lazy()` and `<Suspense>` in `src/App.jsx`**.
2. **Vendor code-splitting with `manualChunks` in `vite.config.js`**.
3. **Guarding the `requestAnimationFrame` gamepad polling loop in `src/hooks/useGamepadNavigation.js`**.

---

## 🔍 2. Remaining Bottlenecks

### Bottleneck 2.1: Monolithic Bundle & Static Modal Loading
* **Affected File**: `src/App.jsx` (lines 1–25)
* **Root Cause**: Heavy modals (`EmulatorModal`, `ScraperModal`, `TrophyCabinetModal`, `BackupModal`, `MetadataEditModal`) are all imported statically at the top of `App.jsx`.
* **Impact**: The initial bundle includes all modal code, icons, and logic even though 90% of users don't open these modals during their first seconds on the site.

### Bottleneck 2.2: Continuous `requestAnimationFrame` Gamepad Polling
* **Affected File**: `src/hooks/useGamepadNavigation.js`
* **Root Cause**:
  ```javascript
  const pollGamepads = useCallback(() => {
    // Polls 60-120 times/sec even with 0 gamepads connected
    requestRef.current = requestAnimationFrame(pollGamepads);
  }, []);
  ```
* **Impact**: Runs constantly at 60–120Hz calling `navigator.getGamepads()`, draining battery on laptops and mobile devices when no gamepad is connected.

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Implement `React.lazy()` Code-Splitting in `src/App.jsx`
Convert secondary modals to dynamic imports:
```javascript
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';

// Lazy-loaded secondary modals
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

Wrap conditionally rendered modals in `<Suspense fallback={null}>`.

### Step 2: Configure Vendor Manual Chunks in `vite.config.js`
In `vite.config.js`:
```javascript
export default defineConfig({
  // ...
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-multiavatar': ['@multiavatar/multiavatar']
        }
      }
    }
  }
});
```

### Step 3: Guard `requestAnimationFrame` Polling Loop
In `src/hooks/useGamepadNavigation.js`, stop the `requestAnimationFrame` loop when no gamepads are connected, listening to `gamepadconnected` and `gamepaddisconnected` window events.

---

## 🧪 4. Verification & Testing Checklist

- [ ] **Bundle Analysis**: Verify `dist/assets/` outputs separate lazy chunks for modals.
- [ ] **Performance Profile**: In Chrome DevTools Performance tab, verify zero rAF CPU usage when 0 gamepads are connected.
- [ ] **Modal Interaction**: Verify all lazy-loaded modals open seamlessly on demand without layout flicker.

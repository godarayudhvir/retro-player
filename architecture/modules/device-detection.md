# Device Detection & UI Mode Engine (`architecture/modules/device-detection.md`)

## 1. Description

The `useDeviceDetection` hook provides modern, zero-thrash viewport detection and manual UI Display Mode override capability for Retro Player. Using native W3C `MediaQueryList` event listeners (not `resize` events), it determines whether the app should render in mobile or desktop/TV layout, and exposes a user-controllable `uiMode` override that persists across sessions.

---

## 2. Detailed List of What It Does

- **Portrait Mobile Detection**: Monitors `(max-width: 768px) and (orientation: portrait)` via `window.matchMedia` to determine if the viewport is a portrait-mode phone screen.
- **Touch Primary Detection**: Monitors `(hover: none) and (pointer: coarse)` to detect touchscreen-primary devices (phones, tablets, touchscreen PCs).
- **Manual UI Display Mode Override** (`uiMode`): Players can force a specific layout via the Theme Studio modal (`ThemeSwitcherModal`):
  - `'auto'` (default): Automatically follows media query results.
  - `'console'`: Forces Desktop/Console/TV 10-Foot UI regardless of screen size.
  - `'mobile'`: Forces the Mobile Feed layout regardless of screen size.
- **`localStorage` Persistence**: UI mode selection is persisted in `localStorage` under `retro_ui_mode` key and restored on load.
- **Zero Resize Thrashing**: Uses `MediaQueryList.addEventListener('change', ...)` instead of `window.addEventListener('resize', ...)`, preventing unnecessary rerender cycles.

---

## 3. Detailed Logic Behind Everything and How It Works

### Media Query Constants
```javascript
const MOBILE_PORTRAIT_QUERY = '(max-width: 768px) and (orientation: portrait)';
const TOUCH_PRIMARY_QUERY = '(hover: none) and (pointer: coarse)';
const UI_MODE_STORAGE_KEY = 'retro_ui_mode';
```

### Resolved `isMobile` Computation
```javascript
const isMobile = uiMode === 'mobile' ? true
               : uiMode === 'console' ? false
               : isMediaMobile; // falls back to media query result in 'auto'
```

### `setUiMode(mode)` Flow
1. Updates `uiModeState` via `setUiModeState(mode)`.
2. Persists to `localStorage.setItem('retro_ui_mode', mode)`.
3. `isMobile` is recomputed on next render, switching the layout rendered in `App.jsx`.

### Listener Registration
Uses a `try/catch` pattern for browser compatibility:
```javascript
if (mql.addEventListener) mql.addEventListener('change', handler);
else if (mql.addListener) mql.addListener(handler); // Safari < 14
```

### Exported Return Values
```typescript
{
  uiMode: 'auto' | 'console' | 'mobile',
  setUiMode: (mode: string) => void,
  isMobile: boolean,
  isMediaMobile: boolean,    // raw media query result
  isTouchPrimary: boolean    // pointer coarse detection
}
```

### Source Location
- Hook: [src/hooks/useDeviceDetection.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useDeviceDetection.js)

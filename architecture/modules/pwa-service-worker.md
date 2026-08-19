# Module: Progressive Web App (PWA) & Offline Service Worker Engine

## 1. Description

The **Progressive Web App (PWA) & Offline Service Worker Engine** transforms the **Retro Player** web application into a fully installable, standalone desktop and handheld gaming console OS. By integrating standard Web App Manifest metadata (`manifest.webmanifest`), Apple touch configurations, standalone display modes, and a dedicated multi-strategy Service Worker (`sw.js`), Retro Player can be installed directly to home screens and system desktops across macOS, Windows, Linux, Steam Deck, ASUS ROG Ally, Android, and iOS devices with zero app-store friction.

The module provides intelligent background pre-caching and runtime caching for application shell assets, Google Fonts, Web Audio synthesizer routines, and WebAssembly emulator cores (`/emulatorjs/data/*`), allowing users to launch and play classic retro games in 100% air-gapped offline environments. It also manages installation state tracking via a custom React hook (`usePwaInstall.js`), offering spatial gamepad and keyboard accessible install buttons in both the console Topbar HUD and the System Settings Diagnostics panel.

---

## 2. Detailed List of What It Does

- **PWABuilder 100% Standards Compliance**:
  - Exposes an explicit root application `id` (`/`), `lang: "en"`, and `dir: "ltr"`.
  - Configures wide (`1280x870`) and narrow (`450x800`) screenshots for desktop app stores and mobile/handheld install dialogs.
  - Multi-size raster PNG icons (`192x192`, `512x512`), Apple touch icon (`180x180`), maskable icons (`purpose: "maskable"`), and scalable SVG fallback.
  - **Direct ROM File Handlers (`file_handlers`)**: Allows native OS file managers to open `.gba`, `.nes`, `.sfc`, `.n64`, `.nds`, `.gen`, and `.zip` ROM files directly with Retro Player.
  - **Custom Protocol Handlers (`protocol_handlers`)**: Registers `web+retro:` protocol for 1-click web game launch links.
  - **Web Share Target (`share_target`)**: Handles incoming game link sharing from mobile/desktop sharing drawers.
  - **Launch Handler & Link Handling**: `launch_handler: { client_mode: "navigate-existing" }` prevents opening redundant duplicate windows.

- **Standalone OS App Installation**:
  - Exposes a standard Web App Manifest with `display: "standalone"`, `orientation: "any"`, `display_override: ["window-controls-overlay", "standalone", "minimal-ui"]`, theme branding, and responsive SVG/PNG icons.
  - Intercepts native browser `beforeinstallprompt` events to provide custom in-app install triggers without native browser popup clutter.
  - Automatically suppresses install triggers when running inside standalone PWA windows.
  - Listens to `appinstalled` lifecycle events to confirm successful installation.

- **Offline Service Worker Caching (`sw.js`)**:
  - Pre-caches core HTML shell (`/index.html`), app entrypoints, web manifest, and vector icons during installation.
  - Implements **Cache-First** strategy for static script bundles, CSS themes, Google Fonts, and local WebAssembly emulator cores (`/emulatorjs/data/*`), dynamically populating the `retro-player-v1` cache on first access.
  - Implements **Network-First** strategy with cached fallbacks for dynamic REST API endpoints (`/api/games`, `/api/bgm-tracks`).
  - Implements single-page application navigation fallbacks to `/index.html` during network disconnections.
  - Automatically purges outdated legacy caches during Service Worker activation (`self.clients.claim()`, `self.skipWaiting()`).

- **User Interface & Diagnostic Controls**:
  - Displays a dedicated, animated **"INSTALL APP"** status pill in the Topbar header ([Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx)) when installation is available.
  - Provides a comprehensive **PWA & Offline Diagnostics** card within the System Settings Menu ([SettingsView.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsView.jsx)), showing active display mode (Standalone vs Browser Tab), Service Worker status, and a **"Refresh Cache"** button to manually flush and re-cache offline assets.

- **Spatial Gamepad & Keyboard Navigation**:
  - Integrates seamlessly into the spatial 2D navigation matrix ([useGamepadNavigation.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useGamepadNavigation.js)), allowing users to navigate to and trigger the install prompt using D-Pad, Arrow keys, or the `A` button.

---

## 3. Detailed Logic Behind Everything and How It Works

### 3.1 PWA Lifecycle and Hook Architecture (`usePwaInstall.js`)

1. **Standalone Mode Detection**:
   On mount, `usePwaInstall` executes `window.matchMedia('(display-mode: standalone)').matches` and checks `window.navigator.standalone === true` (iOS Safari standalone mode). If true, it sets `isStandalone: true` and `isInstalled: true`. It also registers a `change` listener on the media query to dynamically update state if display mode alters.

2. **Capturing Install Prompts**:
   When a compatible browser fires the `beforeinstallprompt` event, the hook calls `e.preventDefault()` to prevent the browser's default mini-infobar, stores the event object in `deferredPrompt`, and sets `canInstall: true`.

3. **Triggering Installation**:
   When the user activates the install button via Topbar, Settings, or gamepad action, `promptInstall()` is invoked:
   ```javascript
   deferredPrompt.prompt();
   const { outcome } = await deferredPrompt.userChoice;
   if (outcome === 'accepted') {
     setIsInstalled(true);
   }
   setDeferredPrompt(null);
   ```

4. **Service Worker Registration**:
   If `'serviceWorker' in navigator`, the hook registers `/sw.js` with root scope (`/`). Upon successful registration, `swRegistered` is set to `true`.

### 3.2 Service Worker Request Interception & Caching Flow (`public/sw.js`)

```
+-------------------------------------------------------------------------------+
| SERVICE WORKER REQUEST INTERCEPTION FLOW                                      |
|                                                                               |
|  [Incoming HTTP Request]                                                      |
|           │                                                                   |
|           ├──► GET /api/* ────────────────► [Network First]                   |
|           │                                    │                              |
|           │                                    ├── Success ──► Return & Cache |
|           │                                    └── Fail ────► Return Cached   |
|           │                                                                   |
|           ├──► Static Asset / Wasm / Font ─► [Cache First]                    |
|           │    (/emulatorjs/*, /assets/*)      │                              |
|           │                                    ├── Cache Hit ─► Return Cache  |
|           │                                    └── Cache Miss ► Fetch & Cache |
|           │                                                                   |
|           └──► Document Navigation ────────► [Network First]                  |
|                (HTML Page Request)             │                              |
|                                                ├── Success ──► Return & Cache |
|                                                └── Offline ──► /index.html    |
+-------------------------------------------------------------------------------+
```

### 3.3 Cache Refresh Protocol

When the user clicks **"Refresh Offline Cache"** in the System Settings Diagnostics pane:
1. `refreshCache()` queries `caches.keys()` and deletes all active cache entries across `retro-player-v1`.
2. Queries `navigator.serviceWorker.getRegistrations()` and triggers `registration.update()` to fetch fresh script and asset bundles.
3. Sets `cacheStatus` to `'updated'` and fires synthesized Web Audio feedback via `sfx.playSaveDetected()`.

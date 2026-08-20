# Emulator Engine Integration (`architecture/modules/emulator.md`)

## 1. Description
The Emulator Engine integration handles running retro game ROMs directly in the browser using EmulatorJS inside an isolated `<iframe>` container embedded within [EmulatorModal.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/components/EmulatorModal.jsx).

---

## 2. Detailed List of What It Does
- **Isolated Iframe Sandbox**: Renders an isolated `<iframe>` element with full permissions (`allow="autoplay *; gamepad *; fullscreen *; cross-origin-isolated; accelerometer; gyroscope"`) and `tabindex="0"`.
- **Canvas Focus & Gamepad Routing**: Automatically grants keyboard and gamepad focus to the inner game canvas and window upon initialization (`window.EJS_ready`, `window.EJS_onGameStart`) and container interaction.
- **Host-to-Iframe Gamepad Event Forwarding & Auto-Assignment**: Automatically synchronizes connected Gamepad instances from the parent host window into the iframe context by dispatching `GamepadEvent('gamepadconnected')` events and executing `autoBindGamepadsToPlayers()` to automatically assign the active gamepad ID to Player 1 (`gamepadSelection[0]`), ensuring the Control Settings dropdown populates and input simulation is active.
- **Hardware Index Lookup Patch & Button Mapper Engine**: Injects `patchEmulatorGamepad()` to resolve an upstream EmulatorJS bug where gamepads with non-zero hardware indices (`gamepad.index >= 1`, common on macOS/Bluetooth) crashed input evaluation. Enables live button re-mapping in the Control Settings modal via gamepad inputs, Left Thumbstick to D-Pad analog mapping, in-frame exit shortcut detection (`Select + Start`, `Guide/PS`, `L3 + R3`), and routes all D-pad and action button events directly to `this.gameManager.simulateInput`.
- **Responsive Nintendo DS Screen Layout**: Automatically configures Side-by-Side (`Left/Right` / `left/right`) screen layout by default for Nintendo DS cores (`melonds` / `desmume`) when the viewport width is tablet size or above (`>= 768px`), maximizing widescreen display space.
- **Offline Core Resilience & Local Fallback**: Detects network connectivity before boot; if offline or during CDN downtime, seamlessly switches data path to local `/emulatorjs/data/`. Injects runtime fallback handlers inside the iframe to recover gracefully if CDN scripts fail.
- **HUD Network & Status Badges**: Displays live status badges for controller readiness (`● GAMEPAD READY`) and network operational mode (`ONLINE CDN` or `LOCAL OFFLINE`).
- **Session Duration Tracking**: Tracks active gameplay session duration and reports elapsed playtime seconds on modal close/unmount to persist total playtime metrics.
- **Cross-Console Core Mapping**: Dynamically injects the correct emulation core (`nes`, `snes`, `gba`, `gb` for GB/GBC, `n64`, `nds`, `segaMD`, `psx`, `arcade`) with automatic core name normalization in `EmulatorModal.jsx`.
- **Custom ROM Blob URL Support**: Accepts local uploaded files as `blob:` URLs without throwing origin resolution errors.
- **Persistent In-Game Battery SRAM & Emscripten FS Auto-Injection**: Automatically extracts, Base64-serializes, and persists in-game battery RAM (`.sav`) and snapshot states directly to RetroPlayerDB (Server Persistent DB + IndexedDB offline cache). On every session boot, existing `.sav` bytes are preloaded and injected directly into Emscripten's virtual filesystem (`gameManager.FS.writeFile`) before execution so in-game menus immediately display **CONTINUE** without lost progress.
- **Background SRAM Auto-Flush Engine**: Executes periodic in-game battery RAM extraction every 10 seconds and upon modal exit / window beforeunload, ensuring zero gameplay progress is lost.
- **Dedicated Canvas Container & UI Cleanliness**: Directly centers and styles `#ejs_screen` and `.ejs_screen` (`100%` width/height) while hiding rogue bottom menu bars and internal EmulatorJS controls.
- **Active Gameplay Scraper Pausing**: Automatically signals the metadata scraper engine (`isPlaying: true`) upon launch to suspend background network scanning, dedicating 100% of CPU and network bandwidth to 60 FPS emulation.
- **Clean Unmounting & Memory Teardown**: Destroys active emulator instances on close using `win.EJS_emulator.destroy()`, revokes Object URLs for custom blobs via `URL.revokeObjectURL(game.romUrl)`, and resets iframe URL to `about:blank`.

---

## 3. Detailed Logic Behind Everything and How It Works

### Lifecycle & Iframe Injection
1. When `<EmulatorModal game={game} gamepadConnected={gamepadConnected} onClose={handleClose} onSessionEnd={handleSessionEnd} />` mounts, a `useEffect` hook inspects `game.romUrl`. If the URL begins with `blob:`, `data:`, `http://`, or `https://`, it uses the URL directly; otherwise it constructs an absolute URL relative to `window.location.origin`.
2. Inspects `navigator.onLine` to select initial data path (`https://cdn.emulatorjs.org/stable/data/` if online, `/emulatorjs/data/` if offline).
3. Creates an `<iframe>` dynamically, setting `allow="autoplay *; gamepad *; fullscreen *; cross-origin-isolated; accelerometer; gyroscope"` and `tabIndex=0`.
4. Injects inline HTML configuring EmulatorJS variables, fallback handlers, and gamepad synchronization:
   ```javascript
   window.EJS_player = '#game';
   window.EJS_gameUrl = absoluteRomUrl;
   window.EJS_core = game.systemCore || 'nes';
   window.EJS_gameID = game.id;
   window.EJS_pathtodata = initialDataPath;
   window.EJS_startOnLoaded = true;
   window.EJS_ready = function() { window.focus(); const el = document.querySelector('canvas') || document.querySelector('#game'); el && el.focus(); syncAllGamepads(); };
   window.EJS_onGameStart = function() { window.focus(); const el = document.querySelector('canvas') || document.querySelector('#game'); el && el.focus(); syncAllGamepads(); };
   ```
5. Loads `loader.js` script with `onerror="handleLoaderFallback()"` so that runtime CDN network failures switch to `/emulatorjs/data/loader.js` automatically.
6. On cleanup/unmount or explicit close, calculates elapsed playtime seconds and triggers `onSessionEnd(gameId, elapsedSeconds)`, revokes custom Blob Object URLs, and invokes `destroy()` on `win.EJS_emulator`.

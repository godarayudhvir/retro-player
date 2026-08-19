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
- **Cross-Console Core Mapping**: Dynamically injects the correct emulation core (`nes`, `snes`, `gba`, `gbc`, `gb`, `n64`, `nds`, `segaMD`, `psx`) based on `game.systemCore`.
- **Custom ROM Blob URL Support**: Accepts local uploaded files as `blob:` URLs without throwing origin resolution errors.
- **Persistent Save Battery & IndexedDB Bindings**: Automatically persists game saves and battery RAM states to browser storage keyed by unique `game.id`.
- **Save File Exporter**: Provides an HUD action button (`Export Save`) allowing users to extract `.sav` files directly from `EJS_emulator.saveSaveFiles()` or `EJS_emulator.exportSave()`.
- **Clean Unmounting & Memory Teardown**: Destroys active emulator instances on close using `win.EJS_emulator.destroy()`, revokes Object URLs for custom blobs via `URL.revokeObjectURL(game.romUrl)`, and resets iframe URL to `about:blank`.

---

## 3. Detailed Logic Behind Everything and How It Works

### Lifecycle & Iframe Injection
1. When `<EmulatorModal game={game} gamepadConnected={gamepadConnected} onClose={handleClose} />` mounts, a `useEffect` hook inspects `game.romUrl`. If the URL begins with `blob:`, `data:`, `http://`, or `https://`, it uses the URL directly; otherwise it constructs an absolute URL relative to `window.location.origin`.
2. Creates an `<iframe>` dynamically, setting `allow="autoplay *; gamepad *; fullscreen *; cross-origin-isolated; accelerometer; gyroscope"` and `tabIndex=0`.
3. Injects inline HTML configuring EmulatorJS variables and gamepad synchronization handlers:
   ```javascript
   window.EJS_player = '#game';
   window.EJS_gameUrl = absoluteRomUrl;
   window.EJS_core = game.systemCore || 'nes';
   window.EJS_gameID = game.id;
   window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
   window.EJS_startOnLoaded = true;
   window.EJS_ready = function() { window.focus(); const el = document.querySelector('canvas') || document.querySelector('#game'); el && el.focus(); syncAllGamepads(); };
   window.EJS_onGameStart = function() { window.focus(); const el = document.querySelector('canvas') || document.querySelector('#game'); el && el.focus(); syncAllGamepads(); };
   ```
4. Loads `loader.js` script from EmulatorJS CDN and issues delayed `focus()` calls to the iframe content window.
5. On cleanup/unmount, revokes any custom Blob Object URLs (`URL.revokeObjectURL`) and invokes `destroy()` on `win.EJS_emulator` to prevent memory leaks or dangling WebGL contexts.

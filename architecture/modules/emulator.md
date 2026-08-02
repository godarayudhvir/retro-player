# Emulator Engine Integration (`architecture/modules/emulator.md`)

## 1. Description
The Emulator Engine integration handles running retro game ROMs directly in the browser using EmulatorJS inside an isolated `<iframe>` container embedded within [EmulatorModal.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/components/EmulatorModal.jsx).

---

## 2. Detailed List of What It Does
- **Isolated Iframe Sandbox**: Renders an isolated `<iframe>` element containing an HTML document with EmulatorJS global variables (`window.EJS_player`, `window.EJS_gameUrl`, `window.EJS_core`).
- **Cross-Console Core Mapping**: Dynamically injects the correct emulation core (`nes`, `snes`, `gba`, `gbc`, `gb`, `n64`, `nds`, `segaMD`, `psx`) based on `game.systemCore`.
- **Custom ROM Blob URL Support**: Accepts local uploaded files as `blob:` URLs without throwing origin resolution errors.
- **Persistent Save Battery & IndexedDB Bindings**: Automatically persists game saves and battery RAM states to browser storage keyed by unique `game.id`.
- **Save File Exporter**: Provides an HUD action button (`Export Save`) allowing users to extract `.sav` files directly from `EJS_emulator.saveSaveFiles()` or `EJS_emulator.exportSave()`.
- **Clean Unmounting & Memory Teardown**: Destroys active emulator instances on close using `win.EJS_emulator.destroy()`, revokes Object URLs for custom blobs via `URL.revokeObjectURL(game.romUrl)`, and resets iframe URL to `about:blank`.

---

## 3. Detailed Logic Behind Everything and How It Works

### Lifecycle & Iframe Injection
1. When `<EmulatorModal game={game} onClose={handleClose} />` mounts, a `useEffect` hook inspects `game.romUrl`. If the URL begins with `blob:`, `data:`, `http://`, or `https://`, it uses the URL directly; otherwise it constructs an absolute URL relative to `window.location.origin`.
2. Creates an `<iframe>` dynamically, setting `allow="autoplay; gamepad; fullscreen"`.
3. Injects inline HTML configuring EmulatorJS variables:
   ```javascript
   window.EJS_player = '#game';
   window.EJS_gameUrl = absoluteRomUrl;
   window.EJS_core = game.systemCore || 'nes';
   window.EJS_gameID = game.id;
   window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
   window.EJS_startOnLoaded = true;
   ```
4. Loads `loader.js` script from EmulatorJS CDN.
5. On cleanup/unmount, revokes any custom Blob Object URLs (`URL.revokeObjectURL`) and invokes `destroy()` on `win.EJS_emulator` to prevent memory leaks or dangling WebGL contexts.

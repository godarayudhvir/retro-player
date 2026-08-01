# Core Bootstrap & Entry Point (`architecture/core/index.md`)

## 1. Description
The Core Bootstrap system is the foundational entry point of the **Retro Player** web application. It handles initial DOM mounting, React root creation, global stylesheet loading, error boundary encapsulation, Vite dev server middleware setup, and static asset streaming (ROM binaries, cover art, and system icons).

---

## 2. Detailed List of What It Does
- **HTML Document Shell**: Provides the HTML5 entry point (`index.html`) containing font imports (`Fredoka`, `Nunito`), responsive meta tags, page title, and the `<div id="root">` mounting node.
- **React Hydration & Root Mounting**: Initializes `ReactDOM.createRoot` inside [main.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/main.jsx), wrapping the application in `<React.StrictMode>` and `<ErrorBoundary>`.
- **Static Asset & ROM Proxy Server**: Configures a custom Vite dev server plugin in [vite.config.js](file:///Users/godarayudhvir/Projects/retro-player/vite.config.js) that:
  - Intercepts requests to `/roms/*` and streams raw binary ROM files with `application/octet-stream` headers.
  - Intercepts requests to `/assets/cover/*` and `/cover/*`, serving artwork with proper image MIME types (`image/png`, `image/jpeg`, `image/webp`).
  - Scans `/public/roms` dynamically at `/api/roms` endpoint, mapping ROM extensions to system cores and auto-matching local cover art.

---

## 3. Detailed Logic Behind Everything and How It Works

### Entry Point Sequence
1. **[index.html](file:///Users/godarayudhvir/Projects/retro-player/index.html)** loads Google Fonts and defines `<div id="root"></div>`.
2. **[main.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/main.jsx)** imports `React`, `ReactDOM`, `App`, `ErrorBoundary`, and `index.css`.
3. `ReactDOM.createRoot(document.getElementById('root'))` mounts `<ErrorBoundary><App /></ErrorBoundary>` into the DOM.

### Vite Dev Server Middleware Plugin (`multiConsoleScannerPlugin`)
Defined in [vite.config.js](file:///Users/godarayudhvir/Projects/retro-player/vite.config.js):
- **System Mapping (`SYSTEM_MAP`)**: Maps console keys (`nes`, `snes`, `gba`, `gbc`, `gb`, `n64`, `nds`, `genesis`, `ps1`, `arcade`) to EmulatorJS core names, color tokens, and SVG icon paths.
- **Extension Resolver (`EXTENSION_MAP`)**: Maps file extensions (`.gba`, `.z64`, `.smc`, `.nes`, `.nds`) to system keys.
- **`/api/roms` Endpoint Handler**:
  - Recursively scans `public/roms`.
  - Cleans title strings using regex `/\(.*?\)|\[.*?\]|[^a-z0-9]/g`.
  - Searches `public/assets/cover` and `public/cover` for artwork matching ROM names.
  - Returns JSON payload containing `games` array and `systems` metadata array with game counts.

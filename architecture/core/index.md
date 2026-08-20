# Core Bootstrap & Entry Point (`architecture/core/index.md`)

## 1. Description
The Core Bootstrap system is the foundational entry point of the **Retro Player** web application. It handles initial DOM mounting, React root creation, global stylesheet loading, error boundary encapsulation, Vite dev server middleware setup, and static asset streaming (ROM binaries, cover art, and system icons).

---

## 2. Detailed List of What It Does
- **HTML Document Shell**: Provides the HTML5 entry point (`index.html`) containing font imports (`Fredoka`, `Nunito`), responsive meta tags, page title, and the `<div id="root">` mounting node.
- **React Hydration & Root Mounting**: Initializes `ReactDOM.createRoot` inside [main.jsx](file:///Users/godarayudhvir/Github/retro-player/src/main.jsx), wrapping the application in `<React.StrictMode>` and `<ErrorBoundary>`.
- **Static Asset & ROM Proxy Server**: Configures development (`vite.config.js`) and production ([server.js](file:///Users/godarayudhvir/Github/retro-player/server.js)) HTTP middleware servers that:
  - Intercept requests to `/roms/*` and stream raw binary ROM files with `application/octet-stream`, `Content-Length`, and `Accept-Ranges: bytes` headers with automatic fallback from `ROMS_DIR` to bundled demo ROMs.
  - Intercept requests to `/bgm/*` and stream audio tracks with audio MIME types, `Accept-Ranges: bytes`, and fallback to bundled 8-bit chiptune audio.
  - Dynamically scan user-mounted directories (`ROMS_DIR`, `BGM_DIR`) and merge bundled showcase demos/tracks when enabled via `INCLUDE_DEMO_ROMS` and `INCLUDE_DEMO_BGM`.
- **Docker Production Containerization**: Packages the application into a multi-stage Docker image ([Dockerfile](file:///Users/godarayudhvir/Github/retro-player/Dockerfile)) utilizing [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js) with support for:
  - Multi-volume mounts: `/roms` (custom game dumps), `/bgm` (custom soundtrack files), and `/data` (persistent JSON database for profiles, playtime, favorites, and controller mappings).
  - Environment control flags: `INCLUDE_DEMO_ROMS` (include/exclude bundled 52 showcase demos), `INCLUDE_DEMO_BGM` (include/exclude bundled chiptunes), and `AUTO_SEED_DEMOS` (seed demo ROMs & BGM to host mounted folders on first boot).
- **Universal Subpath Asset Resolution**: Implements `src/utils/assetPath.js` (`resolveAssetPath`), automatically wrapping all static icon, music, and demo ROM paths with `import.meta.env.BASE_URL` to ensure flawless rendering on both root domains and GitHub Pages subpaths (`/retro-player/`).
- **Static GitHub Pages Bundle Generation**: Configures `generateBundle` hook in `vite.config.js` to emit pre-compiled `/api/roms`, `/api/roms.json`, `/api/bgm`, and `/api/bgm.json` static endpoints during build time for serverless hosting.

---

## 3. Detailed Logic Behind Everything and How It Works

### Entry Point Sequence
1. **[index.html](file:///Users/godarayudhvir/Github/retro-player/index.html)** loads Google Fonts and defines `<div id="root"></div>`.
2. **[main.jsx](file:///Users/godarayudhvir/Github/retro-player/src/main.jsx)** imports `React`, `ReactDOM`, `App`, `ErrorBoundary`, and `index.css`.
3. `ReactDOM.createRoot(document.getElementById('root'))` mounts `<ErrorBoundary><App /></ErrorBoundary>` into the DOM.

### Universal Asset Path Resolution (`src/utils/assetPath.js`)
- `resolveAssetPath(path)` intercepts asset URLs:
  - Preserves external URLs (`http://`, `https://`), Blob URLs (`blob:`), and Base64 Data URIs (`data:`).
  - Prepends `import.meta.env.BASE_URL` (configured as `./` in Vite) to relative resources (`assets/platforms/*.svg`, `/roms/*`, `/bgm/*`).

### Server Middleware & API Plugins (`multiConsoleScannerPlugin` & `server.js`)
Defined in [vite.config.js](file:///Users/godarayudhvir/Github/retro-player/vite.config.js) (development) and [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js) (production/Docker):
- **ROM Path Resolution & Multi-Source Merging**: Resolves target directory using `process.env.ROMS_DIR || path.join(process.cwd(), 'public/roms')`. If `INCLUDE_DEMO_ROMS !== 'false'`, automatically discovers and merges bundled demo ROMs from `public/roms`.
- **12-System Mapping (`SYSTEM_MAP`)**: Maps console keys (`nes`, `snes`, `gba`, `gbc`, `gb`, `n64`, `nds`, `sega_genesis`, `game_gear`, `playstation`, `arcade`, `atari_2600`) to EmulatorJS core names, color tokens, and SVG icon paths.
- **Extension Resolver (`EXTENSION_MAP`)**: Maps file extensions (`.gba`, `.z64`, `.smc`, `.nes`, `.nds`, `.gg`, `.md`, `.gen`, `.smd`, `.iso`, `.cue`, `.chd`, `.bin`, `.pbp`, `.a26`, `.zip`) to system keys.
- **`/api/roms` Endpoint Handler**:
  - Recursively scans the user ROM directory and optional bundled demo directory.
  - Cleans title strings using regex.
  - Returns JSON payload containing `games` array and canonical `systems` metadata array with game counts for dynamic client enrichment.

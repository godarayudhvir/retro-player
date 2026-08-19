# 🎮 Retro Player

A modern, high-performance web-based retro game launcher and emulator library for classic retro console games. Built with React, Vite, and EmulatorJS, it features an intuitive console UI inspired by modern gaming handhelds with full Gamepad navigation support.

![Retro Player Interface](home.webp)

---

## ✨ Featur- 🎨 **Multi-Theme Engine**:
  - Switch on the fly between 4 distinct console themes:
    - ☀️ **iiSU Light (Default)**: Crisp porcelain white, subtle dot matrix, Nintendo red & blue accents.
    - 🌙 **Midnight Cyber (Dark Mode)**: Deep obsidian slate, dark glassmorphism, neon cyan & purple glow.
    - 🌊 **Sony XMB Wave**: PlayStation-inspired deep navy aesthetic with ambient flowing animated wave gradient.
    - 📟 **Game Boy DMG Classic**: Monochromatic olive-green retro dot-matrix styling with pixelated typography.
  - Interactive topbar theme selector and instant keyboard shortcut (`T`).
- ⭐ **Smart Collections & Playtime Analytics**:
  - ⭐ **Favorites**: Bookmark favorite titles with a single click or gamepad shortcut (`X` button / `F` key), indicated by golden star badges on cartridges.
  - 🕒 **Recently Played**: Chronologically sorted history queue of your latest gaming sessions.
  - ⏱️ **Playtime & Session Metrics**: Tracks total hours/minutes played and launch counts, displayed in the game detail drawer.
- 🛡️ **Offline Core Resilience & Local Self-Hosting**:
  - Dual-mode emulator core loader: automatically probes CDN connectivity and falls back to local `/emulatorjs/data/` for 100% air-gapped play during network outages.
  - Live HUD operational indicator (`ONLINE CDN` vs `LOCAL OFFLINE`).
- 🕹️ **Multi-System Emulator Support**:
  - Game Boy (GB)
  - Game Boy Color (GBC)
  - Game Boy Advance (GBA)
  - Nintendo Entertainment System (NES)
  - Super Nintendo (SNES)
  - Nintendo 64 (N64)
  - Nintendo DS (NDS)
  - Sega Genesis / Mega Drive
  - PlayStation (PS1 / PSX)
  - Arcade (MAME)
- 💾 **Retro Cartridge UI System**:
  - Realistic 3D-styled physical retro game cartridge tiles with embossed headers, side grips, recessed sticker labels, dynamic sheen overlays, and system brand stamps.
  - Dynamic cartridge shell color customization based on game titles and platform themes.
- 🖼️ **Dynamic Cover Art Scanner**:
  - Automatically scans and pairs ROM files (`public/roms/*`) with local cover art images (`public/cover/*` and `public/assets/cover/*`).
  - Supports fuzzy title matching for automatic cover detection.
- 🔊 **Synthesized Web Audio UI Sound Effects**:
  - Pure Web Audio API acoustic feedback with zero external MP3 assets and zero latency.
  - Tactile cursor navigation ticks, frequency swooshes on shoulder tab switching (`L1`/`R1`), modal harmonic chimes, sparkling favorite arpeggios, futuristic theme sweeps, and authentic mechanical cartridge insertion "click-clacks" with console boot chimes on game launch.
  - One-click SFX mute toggle in the top status bar.
- 🎮 **Full Gamepad & Keyboard Navigation**:
  - Navigate game tiles using DPAD/Thumbstick or Keyboard Arrow keys.
  - Cycle through console categories using `L1`/`R1` shoulder buttons (or `Q`/`E` on keyboard).
  - Quick-launch games with `A` button or `Enter`.
- 📊 **Dynamic Console Sorting**:
  - Topbar navigation ribbon automatically sorts console systems by total game count (most titles first).
- 🚀 **Zero-Config ROM Drop-in & Drag-and-Drop**:
  - Drag and drop custom ROM files anywhere onto the dashboard to play immediately.
  - Interactive "LOAD ROM" file picker to select local custom ROMs from your device (`.gba`, `.nes`, `.smc`/`.sfc`, `.z64`/`.n64`, `.nds`, `.bin`/`.chd`/`.iso`, `.zip`, `.md`/`.gen`).
  - Automatic console system core detection based on file extension with automatic Object URL memory cleanup on unmount.
  - Automatically indexes ROMs placed in designated platform folders without requiring manual metadata entry.
- 🔮 **Mirai Grand Vision & Deliverables Blueprint**:
  - Full codebase audit, architectural gap analysis, live deliverables checklist, and comprehensive feature innovation catalog across 8 domains in [mirai.md](mirai.md).
- 📚 **Comprehensive System Architecture Specs**:
  - Complete architecture specifications under `architecture/` detailing core bootstrap, modules, components, and future feature designs ("Mirai").

---

## 📁 Directory Structure

```text
retro-player/
├── architecture/         # System Architecture & Technical Specifications
│   ├── README.md         # Guidelines, folder structure rules & doc standards
│   ├── core/             # Application entry point & React shell specs
│   ├── modules/          # Emulation engine, audio SFX, theme engine, playtime/favorites & gamepad specs
│   ├── components/       # Topbar, ribbon, cartridge tile, modals & HUD specs
│   └── mirai/            # Future roadmap specifications (WebRTC Netplay, Cloud Saves)
├── mirai.md              # Master Blueprint, codebase audit, deliverables status & future catalog
├── public/
│   ├── cover/            # Custom cover art images by platform folder
│   ├── roms/             # Drop your ROM files here organized by platform
│   ├── emulatorjs/       # Local offline EmulatorJS assets & loader
│   └── assets/           # System icons and fallback UI assets
├── src/
│   ├── components/       # Modular UI Components
│   │   ├── Topbar.jsx          # Status HUD, search bar, theme toggle, sound toggle & clock
│   │   ├── LoadRomModal.jsx    # In-app Load ROM modal with drag-drop & format catalog
│   │   ├── SystemRibbon.jsx    # Dynamic console ribbon tabs & smart collections
│   │   ├── CartridgeGrid.jsx   # 3D Cartridge grid viewport
│   │   ├── CartridgeTile.jsx   # Physical 3D cartridge with sheen, grips & star badges
│   │   ├── GameDetailModal.jsx # Game drawer with playtime stats, favorites & save detection
│   │   ├── AboutInfoModal.jsx  # About dialog & controls table
│   │   ├── DropzoneOverlay.jsx # Drag-and-drop custom ROM backdrop
│   │   ├── ConsoleHud.jsx      # Bottom controller button hints
│   │   ├── EmulatorModal.jsx   # Isolated iframe EmulatorJS sandbox with offline fallback
│   │   ├── OnScreenKeyboard.jsx # On-screen virtual keyboard for gamepad & touch
│   │   └── ErrorBoundary.jsx   # Fatal runtime exception fallback component
│   ├── services/         # Background Services & Scraper Engines
│   │   └── metadataScraper.js      # Libretro Thumbnails & Open DB metadata scraper
│   ├── hooks/            # Specialized Custom React Hooks
│   │   ├── useWebAudioSfx.js       # Synthesized Web Audio UI sound effects
│   │   ├── useThemeEngine.js       # Multi-theme state and persistence engine
│   │   ├── usePlaytimeAndFavorites.js # Favorites, recents & playtime analytics
│   │   ├── useMetadataScraper.js   # Background scraping & IndexedDB caching hook
│   │   ├── useGamepadStatus.js     # HTML5 Gamepad connection tracking
│   │   ├── useSaveDataManager.js   # LocalStorage & IndexedDB save detection
│   │   ├── useRomManifest.js       # Catalog manifest & smart collections filter
│   │   └── useGamepadNavigation.js # 2D spatial navigation & gamepad polling
│   ├── utils/            # Pure Utility Functions
│   │   ├── cartridgeColors.js  # Dynamic cartridge shell color heuristics
│   │   └── systemDetector.js   # ROM extension to emulator core detection
│   ├── gameDescriptions.js     # Title metadata & release date lookup helper
│   ├── App.jsx           # Clean Root Orchestrator (< 200 lines)
│   ├── main.jsx          # React DOM root entry point
│   └── index.css         # Multi-theme styles, 3D cartridge CSS & design tokens
├── vite.config.js        # Multi-console scanner plugin & static file middlewares
└── package.json
```

---

## 📐 System Architecture Documentation (`/architecture`)

The project includes an organized [architecture/](architecture/README.md) specifications folder structured by domain scope:

- **[Guidelines & Standards](architecture/README.md)**: Rules for writing specs, sub-directory constraints, and feature proposal templates.
- **[Core Specifications](architecture/core/index.md)**: Entry point ([index.md](architecture/core/index.md)) and application shell ([app.md](architecture/core/app.md)).
- **[Functional Modules](architecture/modules/emulator.md)**: Emulator engine ([emulator.md](architecture/modules/emulator.md)), Metadata Scraper ([metadata-scraper.md](architecture/modules/metadata-scraper.md)), Web Audio SFX ([audio-sfx.md](architecture/modules/audio-sfx.md)), Multi-Theme Engine ([theme-engine.md](architecture/modules/theme-engine.md)), Playtime & Favorites ([playtime-favorites.md](architecture/modules/playtime-favorites.md)), console switcher ([console-switcher.md](architecture/modules/console-switcher.md)), game catalog scanner ([game-catalog.md](architecture/modules/game-catalog.md)), and gamepad navigation ([gamepad-controls.md](architecture/modules/gamepad-controls.md)).
- **[UI Components](architecture/components/topbar.md)**: Topbar ([topbar.md](architecture/components/topbar.md)), System Ribbon ([system-ribbon.md](architecture/components/system-ribbon.md)), Cartridge Tile ([cartridge-tile.md](architecture/components/cartridge-tile.md)), Game Detail Modal ([game-detail-modal.md](architecture/components/game-detail-modal.md)), About Modal ([about-info-modal.md](architecture/components/about-info-modal.md)), Emulator Modal ([emulator-modal.md](architecture/components/emulator-modal.md)), on-screen virtual keyboard ([on-screen-keyboard.md](architecture/components/on-screen-keyboard.md)), error boundary ([error-boundary.md](architecture/components/error-boundary.md)), and retro CSS effects ([retro-effects.md](architecture/components/retro-effects.md)).
- **[Mirai Future Features](architecture/mirai/multiplayer.md)**: Upcoming specifications for WebRTC P2P Multiplayer ([multiplayer.md](architecture/mirai/multiplayer.md)) and Cloud Save Sync ([cloud-saves.md](architecture/mirai/cloud-saves.md)), alongside the Master Blueprint in [mirai.md](mirai.md).

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended - Like Jellyfin)

Run Retro Player via Docker using the GitHub Container Registry (**GHCR**) image:

1. Ensure [Docker](https://docs.docker.com/get-docker/) and Docker Compose are installed.
2. Edit [docker-compose.yml](file:///Users/godarayudhvir/Github/retro-player/docker-compose.yml) to point to your local ROMs directory:
   ```yaml
   version: '3.8'

   services:
     retro-player:
       image: ghcr.io/godarayudhvir/retro-player:latest
       container_name: retro-player
       restart: unless-stopped
       ports:
         - "3000:3000"
       environment:
         - PORT=3000
         - ROMS_DIR=/roms
       volumes:
         # Replace /path/to/your/roms with the path to your ROMs directory
         - /path/to/your/roms:/roms:ro
   ```
3. Start the container:
   ```bash
   docker compose up -d
   ```
4. Access the web launcher at `http://localhost:3000`.

#### Or Run Directly via Docker CLI:
```bash
docker run -d \
  --name retro-player \
  -p 3000:3000 \
  -v /path/to/your/roms:/roms:ro \
  ghcr.io/godarayudhvir/retro-player:latest
```

To view logs or stop the service:
```bash
docker compose logs -f
docker compose down
```

---

### Option 2: Local Development Setup (Node.js)

#### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**

#### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd retro-player
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Or run the production build & server:
   ```bash
   npm run build
   npm start
   ```

5. Open your browser at `http://localhost:3000`.

---

## 🗂️ Adding ROMs & Automated Metadata Scraping

### Adding Games
Place your ROM files inside `public/roms/[system]/` or simply drag and drop them anywhere into the browser:
- Example: `public/roms/gba/Pokemon - Emerald Version.zip`

### Automated Online Box Art & Metadata Scraping
Retro Player follows the **ES-DE (EmulationStation-DE)** architecture with zero bundled covers or hardcoded metadata in the repository:
- When games are detected or loaded, the built-in online scraper automatically fetches official 3D box art from the **Libretro Thumbnails CDN** and synopsis/release details from **Wikipedia REST APIs**.
- All scraped assets are cached locally in your browser's **IndexedDB** for instant subsequent loading.

---

## 🎮 Controls

### UI Navigation
| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| **Navigate Grid & Menus** | Arrow Keys (`Up`, `Down`, `Left`, `Right`) / `W`, `A`, `S`, `D` | D-Pad / Left Stick |
| **Switch System / Smart Tab** | `Q` / `E` / `PageUp` / `PageDown` | `L1` / `R1` (Shoulder Buttons) |
| **Select / Launch Game** | `Enter` / `Space` | `A` Button (Button 0) |
| **Toggle Favorite ⭐** | `F` Key | `X` Button (Button 2) |
| **Switch Theme 🎨** | `T` Key | Topbar Theme Button |
| **Search / Virtual Keyboard** | `⌘K` / `Ctrl+K` | `Y` Button (Button 3) / `Select` |
| **Back / Close Modals** | `Escape` / `Backspace` | `B` Button (Button 1) |

### In-Game Emulation Controls
| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| **Directional Movement** | Arrow Keys / `W`, `A`, `S`, `D` | D-Pad / Left Stick |
| **Primary Actions (A / B)** | `Z` / `X` | `A` / `B` Buttons |
| **Start / Select** | `Enter` / `Shift` | `Start` / `Select` |
| **Exit Game to Launcher** | `Escape` | `Select` + `Start` (or Guide Button) |

---

## 🛠️ Built With

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [EmulatorJS](https://emulatorjs.org/)
- [Lucide React](https://lucide.dev/)


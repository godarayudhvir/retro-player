<div align="center">

# 🕹️ RETRO PLAYER

### *The High-Performance, Zero-Overhead Web Emulation Station*

[![Live Web Demo](https://img.shields.io/badge/Live%20Demo-godarayudhvir.github.io%2Fretro--player-emerald?style=for-the-badge&logo=githubpages&logoColor=white)](https://godarayudhvir.github.io/retro-player/)

<br />

[![GitHub Pages](https://github.com/godarayudhvir/retro-player/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/godarayudhvir/retro-player/actions/workflows/deploy-pages.yml)
[![Docker Multi-Arch Build](https://github.com/godarayudhvir/retro-player/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/godarayudhvir/retro-player/actions)
[![GitHub Container Registry](https://img.shields.io/badge/GHCR.io-retro--player-blue?logo=docker&logoColor=white)](https://github.com/godarayudhvir/retro-player/pkgs/container/retro-player)
[![PWABuilder Compliant](https://img.shields.io/badge/PWA-100%25%20PWABuilder-success?logo=pwa&logoColor=white)](https://www.pwabuilder.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![WASM Powered](https://img.shields.io/badge/Emulation-WebAssembly-654FF0?logo=webassembly&logoColor=white)](https://webassembly.org/)

<br />

**A console-grade retro game launcher and library, delivered straight to any web browser.**  
Featuring physical 3D cartridge rendering, real-time online metadata scraping, synthesized acoustic SFX, and **pure client-side WebAssembly execution**.

<br />

🎮 **[▶ PLAY LIVE DEMO IN BROWSER (NO INSTALL REQUIRED)](https://godarayudhvir.github.io/retro-player/)**

<br />

<img src="home.webp" alt="Retro Player Showcase" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

</div>

---

## ⚡ Why Retro Player? The WASM Advantage

Unlike cloud gaming services that stream heavy 25Mbps video feeds and melt your server CPU, **Retro Player uses a modern Edge-WASM architecture**:

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                     YOUR BROWSER                         │
                               │                                                          │
┌────────────────┐  ROM File   │  ┌────────────────────┐   ┌───────────────────────────┐  │
│  Host Server   │ ──────────> │  │ WebAssembly Core   │──>│ Hardware Canvas Rendering │  │
│ (Railway/NAS)  │  (Few MB)   │  │ (Runs on client)   │   │  Direct Gamepad Polling   │  │
│ ~0% CPU / RAM  │             │  └────────────────────┘   │  Web Audio Synthesizer    │  │
└────────────────┘             │                           └───────────────────────────┘  │
                               └──────────────────────────────────────────────────────────┘
```

- **🔥 Server Resource Usage is ~0%**: The host only serves static files and streams the raw ROM binary once. Even a free-tier container or Raspberry Pi can serve hundreds of concurrent players.
- **⚡ Low-Latency Local Input**: Controllers and keyboards are polled directly in the client browser with zero network streaming delay.
- **💾 Automatic Auto-Sorting Disk Persistence**: Load any ROM from your browser—it is automatically sorted and saved to your host disk (`/roms/<system>/`) for future sessions.
- **🛡️ Air-Gapped Offline Support**: Features dual-mode fallback to local core bundles when offline.

---

## ✨ Key Highlights & Features

- 🌟 **Modern Full-Screen Onboarding & Character Creation**: Outcome-first walkthrough for Desktop and Mobile with Pokémon-style Mii character passport setup and essential pro-tips.
- 👤 **Multi-User Profiles & Nintendo Mii Avatar Studio**: Create personalized Mii-style vector avatars with customizable hairstyles, expressions, and accessories; isolated game saves, playtime logs, favorites, and complete in-app player management.
- 📱 **Dedicated Netflix-Style Mobile Streaming UI**: Custom mobile experience (<= 768px) with "Who's Playing?" profile selector, mobile topbar, smooth horizontal carousels, bottom sheet details drawer, 5-row virtual keyboard, and 100% controller spatial navigation.
- 📱 **Progressive Web App (PWA) & Offline Standalone Installation**: Install Retro Player as a native desktop/handheld app across macOS, Windows, Linux, Steam Deck, Android, and iOS with landscape gaming display mode and Service Worker caching.
- 📱 **Multi-Device Responsive Matrix**: Fully responsive across Mobile Phones (<=640px), Tablets & Handhelds (Steam Deck, Nintendo Switch, iPad), Desktop PCs, and 10-Foot UI mode for Large 4K TVs. *(See [Hardware Compatibility Matrix](guides/compatibility.md))*.
- 🍎 **iOS Safari & WebKit Emulation Engine**: Optimized `srcdoc` iframe isolation, WebAudio auto-unlock on first touch, and subpath asset resolution ensuring flawless 60 FPS emulation on iPhones and iPads.
- 🎨 **4 Signature Themes**: **iiSU Light**, **Midnight Cyber**, **Sony XMB Wave**, and **Game Boy DMG** with instant live switching across all components.
- 🎵 **Background Music (BGM) Engine**: Auto-scanning and looping of BGM tracks with topbar controls, custom audio file manager, and **smart in-game auto-pause**.
- ⚙️ **Nintendo Switch Style System Settings Hub**: Full-screen 2-column console management hub with dual bulk ROM batch uploader, recursive folder directory uploader (`webkitdirectory`), BGM manager, theme previewer, and storage diagnostics.
- 🗄️ **Server-Backed Persistent Database & SRAM Injection**: Authoritative persistence in `/data/retroplayer_db.json` via REST API (`/api/db`) with auto-injection of saved battery RAM (`.sav`) into Emscripten VFS on game launch. Local **IndexedDB** (`RetroPlayerDB`) provides instant offline local caching.
- 💬 **Universal In-App Modal Dialog System**: Zero native browser popups (`alert()`, `confirm()`, `prompt()`). All confirmations utilize theme-aware, gamepad/keyboard navigable in-app modal dialogs.
- 💾 **3D Physical Cartridge Engine**: Tactile cartridges with metallic sheens, grip textures, dynamic shadows, and title color heuristics.
- 🌐 **Automated Online Metadata Scraper**: Official 3D box art from **Libretro** & synopsis info from **Wikipedia** with intelligent demo-to-retail matching, 4-tier scope selection, and IndexedDB caching.
- 🚀 **Hardware-Accelerated Web Emulation & Diagnostic HUD**: Low-latency dynamic audio sync and interactive **Diagnostic Performance HUD** (`D` hotkey).
- 🔊 **Synthesized Pure Web Audio UI SFX**: Low-latency acoustic feedback synthesizer with zero external audio assets.
- 🎮 **100% Gamepad & Keyboard Navigation**: Controller-first spatial navigation across desktop & mobile feeds, dynamic emulator touch control auto-hiding on controller detection, shoulder triggers (`L1`/`R1`), on-screen virtual keyboard (`⌘K`), live **Gamepad Battery % / Charging Telemetry Widget**, and **Low-Battery In-App Notification Alerts**. *(See [Controls & Keybindings Guide](guides/controls.md))*.
- ⏱️ **Playtime Analytics & Smart Collections**: Session durations, total hours played, **Favorites ⭐**, and **Recently Played** queue.

---

## 🕹️ Supported Consoles & Platforms

Retro Player supports **12 classic retro gaming platforms** out of the box:

| Category | Supported Consoles | Formats | Default Emulation Core |
| :--- | :--- | :--- | :--- |
| **Handhelds** | Game Boy Advance (`gba`), Game Boy Color (`gbc`), Game Boy DMG (`gb`), Sega Game Gear (`game_gear`), Nintendo DS (`nds`) | `.gba`, `.gbc`, `.gb`, `.gg`, `.nds` | mGBA, Gambatte, Genesis Plus GX, MelonDS |
| **Home Consoles** | Super Nintendo (`snes`), NES (`nes`), Nintendo 64 (`n64`), Sega Genesis (`sega_genesis`), Atari 2600 (`atari_2600`), PlayStation 1 (`playstation`) | `.sfc`, `.smc`, `.nes`, `.z64`, `.md`, `.gen`, `.a26`, `.chd`, `.iso`, `.cue` | Snes9x, FCEUmm, Mupen64Plus, Genesis Plus GX, Stella, Beetle PSX |
| **Arcade** | Arcade MAME (`arcade`) | `.zip` | MAME 2003 Plus |

---

## 🎮 Bundled Demo Showcase & Compliance

Retro Player includes a lightweight collection of **21 non-commercial demonstration ROMs and homebrew titles** across 12 console platforms to immediately verify core performance in your browser:

- 📑 **Full Demo Catalog & Inventory**: See **[guides/roms.md](guides/roms.md)** for the complete file-by-file inventory, system file sizes, and homebrew developer credits.
- 🎯 **Strictly Non-Complete Software**: All pre-installed software consists of non-commercial prototypes, trade show trials, and aftermarket homebrew demos. **Zero full retail commercial games are bundled.**
- ⚖️ **Compliance & Immediate Removal Policy**: If you are a rights holder or creator and would like any sample removed, open an issue/PR and **we will immediately comply**.
- 🔒 **100% Private Custom ROM Loading**: To play personal game dumps, use **"Load Custom ROM"** or drag-and-drop—files run 100% in local browser memory with zero network uploads.

---

## 🚀 Quick Start: Docker Compose

Deploy Retro Player in seconds with [`docker-compose.yml`](docker-compose.yml):

```bash
mkdir retro-player && cd retro-player
curl -O https://raw.githubusercontent.com/godarayudhvir/retro-player/main/docker-compose.yml
docker compose up -d
```

Open `http://localhost:3000` in your browser!

> [!TIP]
> **Docker Customization**: You can customize volumes (`./roms`, `./bgm`, `./data`) and environment flags (`INCLUDE_DEMO_ROMS`, `INCLUDE_DEMO_BGM`, `AUTO_SEED_DEMOS`) directly in [`docker-compose.yml`](docker-compose.yml). See the **[Docker Deployment Guide](guides/docker.md)** for full details.

---

## 📖 Modular Guides & Documentation

Explore dedicated, step-by-step documentation located in the [`guides/`](guides/README.md) directory:

| Guide | Description |
| :--- | :--- |
| **[🐳 Docker Deployment Guide](guides/docker.md)** | Full Docker & Docker Compose setup, CLI commands, updates, and troubleshooting. |
| **[☁️ Cloud & Self-Hosting Guide](guides/hosting.md)** | Detailed setup for Railway, Render, Fly.io, Coolify, Portainer, and NAS (Unraid/TrueNAS). |
| **[🌐 Remote Access & Anywhere Play](guides/remote-access.md)** | Access your home instance from phones/tablets via **Tailscale Mesh VPN** or **Cloudflare Tunnels**. |
| **[🎮 Controls & Keybindings Guide](guides/controls.md)** | Full gamepad button mappings, dashboard spatial navigation, virtual keyboard, and in-game controls. |
| **[💾 Save States & In-Game Save Architecture](guides/save-states.md)** | Snapshot quick saves vs in-game battery saves (`.sav`) breakdown across all 12 console platforms. |
| **[🌐 Hardware & Platform Compatibility Matrix](guides/compatibility.md)** | Browser, OS, Smart TV (LG webOS, Samsung Tizen, Fire TV), Handheld (Steam Deck), and Console compatibility breakdown. |
| **[📱 Cross-Device Experience Matrix](guides/device-experience-matrix.md)** | Feature sets, UI density, input modes, and admin capabilities compared across Mobile, Handheld, PC, and TV. |
| **[🎮 Bundled ROMs Catalog & Compliance Policy](guides/roms.md)** | Curated demo inventory, legal compliance, and local companion sidecars (`.nfo`, `.json`, `cover.webp`) guide. |

---

## 📚 Technical Architecture Specifications

Retro Player follows rigorous software engineering standards with full technical design specifications under [`architecture/`](architecture/README.md):

- **[Core Entry & Bootstrap](architecture/core/index.md)**: Entry point, React mounting, Express production server & Docker containerization.
- **[Application Shell Orchestrator](architecture/core/app.md)**: Hook lifecycle, state coordination, and modal management.
- **[PWA & Offline Service Worker](architecture/modules/pwa-service-worker.md)**: Progressive Web App, PWABuilder compliance, standalone OS install & air-gapped caching.
- **[Emulator Engine](architecture/modules/emulator.md)**: EmulatorJS iframe isolation, core fallback & battery SRAM detection.
- **[Metadata Scraper](architecture/modules/metadata-scraper.md)**: Libretro & Wikipedia dynamic scraper with IndexedDB caching.
- **[Synthesized Audio SFX](architecture/modules/audio-sfx.md)**: Pure Web Audio API acoustic synthesis.
- **[Theme Engine](architecture/modules/theme-engine.md)**: Real-time CSS tokens and instant theme persistence.
- **[Game Catalog Indexer](architecture/modules/game-catalog.md)**: Zero-config auto-scanning and persistent upload pipeline.
- **[Live Demo Welcome Modal](architecture/components/demo-welcome-modal.md)**: Environment-aware GitHub Pages demo dialog and static showcase handler.
- **[Mirai Master Vision & Roadmap](architecture/mirai/README.md)**: Deliverables checklist and multi-domain innovation roadmap.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
Made with ❤️ for classic gaming enthusiasts worldwide.
</div>

<div align="center">

<img src="public/favicon.svg" alt="Retro Player Logo" width="80" height="80" />

# RETRO PLAYER

### *The High-Performance, Zero-Overhead Web Emulation Station*

[![Live Web Demo](https://img.shields.io/badge/Live%20Demo-godarayudhvir.github.io%2Fretro--player-emerald?style=for-the-badge&logo=githubpages&logoColor=white)](https://godarayudhvir.github.io/retro-player/)
[![Version: v1.0.6](https://img.shields.io/badge/Version-v1.0.6-emerald?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/godarayudhvir/retro-player)

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
Featuring Nintendo DS dual-screen Touch architecture, integrated zero-popup Strategy Guides & inline Metadata Editor/Scraper, Multiavatar Character Creation Studio with Archetype presets, real-time online metadata scraping, synthesized acoustic SFX, and **pure client-side WebAssembly execution**.

<br />

🎮 **[▶ PLAY LIVE DEMO IN BROWSER (NO INSTALL REQUIRED)](https://godarayudhvir.github.io/retro-player/)**

<br />

<img src="home.webp" alt="Retro Player Showcase" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

</div>

---

## 📸 Screenshots

<div align="center">

### 🚀 3-Step Onboarding Walkthrough

| 1. Welcome & 12 Consoles | 2. Character Creation Studio | 3. Interactive Gamepad Visualizer |
|:---:|:---:|:---:|
| <img src="public/docs-screenshots/onboarding.webp" width="300" alt="Welcome and Onboarding Walkthrough" /> | <img src="public/docs-screenshots/character-studio.webp" width="300" alt="Character Creation Studio" /> | <img src="public/docs-screenshots/controller-visualizer.webp" width="300" alt="Interactive Gamepad Controller Visualizer" /> |

### 🎮 Nintendo DS Dual-Screen Touch Views (Grid Densities)

| Small Density (`S`) | Medium Density (`M`) | Large Density (`L`) |
|:---:|:---:|:---:|
| <img src="public/docs-screenshots/ds-view-small.webp" width="300" alt="Small Density Grid View" /> | <img src="public/docs-screenshots/ds-view-medium.webp" width="300" alt="Medium Density Grid View" /> | <img src="public/docs-screenshots/ds-view-large.webp" width="300" alt="Large Density Grid View" /> |

### 🖼️ Panoramic Wide Grid Views (S, M, L, XL, XXL)

| Small (`S`) | Medium (`M`) | Large (`L`) |
|:---:|:---:|:---:|
| <img src="public/docs-screenshots/wide-grid-small.webp" width="300" alt="Wide Grid Small Density" /> | <img src="public/docs-screenshots/wide-grid-medium.webp" width="300" alt="Wide Grid Medium Density" /> | <img src="public/docs-screenshots/wide-grid-large.webp" width="300" alt="Wide Grid Large Density" /> |

| Extra Large (`XL`) | Maximum Scale (`XXL`) |
|:---:|:---:|
| <img src="public/docs-screenshots/wide-grid-xl.webp" width="450" alt="Wide Grid Extra Large Density" /> | <img src="public/docs-screenshots/wide-grid-xxl.webp" width="450" alt="Wide Grid XXL Density" /> |

### 👤 Profile Selection & Character Creation Studio

| Who's Playing Selector | Character Archetypes | Custom Name & Color |
|:---:|:---:|:---:|
| <img src="public/docs-screenshots/profile-selector.webp" width="300" alt="Who's Playing profile selector modal" /> | <img src="public/docs-screenshots/character-archetypes.webp" width="300" alt="Character Archetypes Presets" /> | <img src="public/docs-screenshots/character-customization.webp" width="300" alt="Custom Handle and Color Palette Studio" /> |

### 🌐 Universal Metadata & Box Art Scraper Studio

| Full Library Scan | Single System Target Selector | Inline Metadata & Sidecar Editor |
|:---:|:---:|:---:|
| <img src="public/docs-screenshots/scraper-modal.webp" width="300" alt="Full Library Scraper Modal" /> | <img src="public/docs-screenshots/scraper-single-system.webp" width="300" alt="Single System Scraper Target Selector" /> | <img src="public/docs-screenshots/metadata-editor.webp" width="300" alt="Inline Metadata & Sidecar Editor" /> |

### 🗄️ Console Utilities & Storage Management

| Search Virtual Keyboard | Load Custom ROM | Storage & DB Management |
|:---:|:---:|:---:|
| <img src="public/docs-screenshots/virtual-keyboard.webp" width="300" alt="On-Screen Virtual Keyboard Search" /> | <img src="public/docs-screenshots/load-rom-modal.webp" width="300" alt="Load Custom ROM Dialog" /> | <img src="public/docs-screenshots/backup-modal.webp" width="300" alt="Storage and Database Management Modal" /> |

### 💾 Inline Save Data Studio & Auto-Resume Engine

| Inline Save Data Studio (`.sav` / `.state`) |
|:---:|
| <img src="public/docs-screenshots/save-data-studio.webp" width="700" alt="Inline Save Data Studio" /> |

| Desktop Topbar Auto-Resume Micro-Switch |
|:---:|
| <img src="public/docs-screenshots/auto-resume-toggle.webp" width="700" alt="Desktop Topbar Auto-Resume Toggle" /> |

| In-Game Auto-Resume Countdown Prompt in Action |
|:---:|
| <img src="public/docs-screenshots/auto-resume-ingame.webp" width="700" alt="In-Game Auto-Resume Prompt in Action" /> |

### 🕹️ Pre-Launch Controls (24 Views) & 12-System In-Game Emulation

| Controls Splash | Gameplay Sandbox | Controls Splash | Gameplay Sandbox |
|:---:|:---:|:---:|:---:|
| **Atari 2600 (1977)**<br /><img src="public/docs-screenshots/keyboard-controls-atari2600.webp" width="225" alt="Atari 2600 Pre-Launch Controls Modal" /> | **Pitfall! (Atari 2600)**<br /><img src="public/docs-screenshots/ingame-atari2600.webp" width="225" alt="Pitfall Atari 2600 Gameplay Sandbox" /> | **Arcade MAME (1970s–90s)**<br /><img src="public/docs-screenshots/keyboard-controls-arcade.webp" width="225" alt="Arcade MAME Pre-Launch Controls Modal" /> | **Cadillacs & Dinosaurs (Arcade)**<br /><img src="public/docs-screenshots/ingame-arcade.webp" width="225" alt="Cadillacs and Dinosaurs Arcade Gameplay Sandbox" /> |
| **Nintendo (NES - 1983)**<br /><img src="public/docs-screenshots/keyboard-controls-nes.webp" width="225" alt="Nintendo NES Pre-Launch Controls Modal" /> | **Super Mario Bros. (NES)**<br /><img src="public/docs-screenshots/ingame-nes.webp" width="225" alt="Super Mario Bros NES Gameplay Sandbox" /> | **Sega Genesis (1988)**<br /><img src="public/docs-screenshots/keyboard-controls-genesis.webp" width="225" alt="Sega Genesis Pre-Launch Controls Modal" /> | **Sonic The Hedgehog 2 (Genesis)**<br /><img src="public/docs-screenshots/ingame-genesis.webp" width="225" alt="Sonic The Hedgehog 2 Genesis Gameplay Sandbox" /> |
| **Game Boy (GB - 1989)**<br /><img src="public/docs-screenshots/keyboard-controls-gb.webp" width="225" alt="Game Boy Pre-Launch Controls Modal" /> | **Tetris (Game Boy)**<br /><img src="public/docs-screenshots/ingame-gb.webp" width="225" alt="Tetris Game Boy Gameplay Sandbox" /> | **Super Nintendo (SNES - 1990)**<br /><img src="public/docs-screenshots/keyboard-controls-modal.webp" width="225" alt="Super Nintendo Pre-Launch Controls Modal" /> | **Super Mario World (SNES)**<br /><img src="public/docs-screenshots/ingame-snes.webp" width="225" alt="Super Mario World SNES Gameplay Sandbox" /> |
| **Sega Game Gear (1990)**<br /><img src="public/docs-screenshots/keyboard-controls-gamegear.webp" width="225" alt="Sega Game Gear Pre-Launch Controls Modal" /> | **Sonic The Hedgehog (Game Gear)**<br /><img src="public/docs-screenshots/ingame-gamegear.webp" width="225" alt="Sonic The Hedgehog Game Gear Gameplay Sandbox" /> | **PlayStation 1 (PS1 - 1994)**<br /><img src="public/docs-screenshots/keyboard-controls-ps1.webp" width="225" alt="PlayStation 1 Pre-Launch Controls Modal" /> | **Gran Turismo (PS1)**<br /><img src="public/docs-screenshots/ingame-ps1.webp" width="225" alt="Gran Turismo PS1 Gameplay Sandbox" /> |
| **Nintendo 64 (N64 - 1996)**<br /><img src="public/docs-screenshots/keyboard-controls-n64.webp" width="225" alt="Nintendo 64 Pre-Launch Controls Modal" /> | **Super Mario 64 (N64)**<br /><img src="public/docs-screenshots/ingame-n64.webp" width="225" alt="Super Mario 64 N64 Gameplay Sandbox" /> | **Game Boy Color (GBC - 1998)**<br /><img src="public/docs-screenshots/keyboard-controls-gbc.webp" width="225" alt="Game Boy Color Pre-Launch Controls Modal" /> | **Pokémon Crystal (GBC)**<br /><img src="public/docs-screenshots/ingame-gbc.webp" width="225" alt="Pokemon Crystal GBC Gameplay Sandbox" /> |
| **Game Boy Advance (GBA - 2001)**<br /><img src="public/docs-screenshots/keyboard-controls-gba.webp" width="225" alt="Game Boy Advance Pre-Launch Controls Modal" /> | **Pokémon Sapphire (GBA)**<br /><img src="public/docs-screenshots/ingame-gba.webp" width="225" alt="Pokemon Sapphire GBA Gameplay Sandbox" /> | **Nintendo DS (NDS - 2004)**<br /><img src="public/docs-screenshots/keyboard-controls-nds.webp" width="225" alt="Nintendo DS Pre-Launch Controls Modal" /> | **New Super Mario Bros. (NDS)**<br /><img src="public/docs-screenshots/ingame-nds.webp" width="225" alt="New Super Mario Bros NDS Dual-Screen Sandbox" /> |

</div>

<div align="center">

### 📱 Mobile & Touch Experience

| Welcome Walkthrough | Character Studio | Console Hub | Game Library |
|:---:|:---:|:---:|:---:|
| <img src="public/docs-screenshots/mobile-onboarding.webp" width="200" alt="Mobile Onboarding" /> | <img src="public/docs-screenshots/mobile-character-studio.webp" width="200" alt="Mobile Character Studio" /> | <img src="public/docs-screenshots/mobile-console-selector.webp" width="200" alt="Mobile Console Selector" /> | <img src="public/docs-screenshots/mobile-game-grid.webp" width="200" alt="Mobile Game Grid" /> |

| Game Overview | In-Game Touch Controls | 3D Box Art Scraper | Console Utilities |
|:---:|:---:|:---:|:---:|
| <img src="public/docs-screenshots/mobile-game-detail.webp" width="200" alt="Mobile Game Detail" /> | <img src="public/docs-screenshots/mobile-ingame-portrait.webp" width="200" alt="Mobile In-Game Emulation" /> | <img src="public/docs-screenshots/mobile-scraper-modal.webp" width="200" alt="Mobile Scraper Modal" /> | <img src="public/docs-screenshots/mobile-console-utilities.webp" width="200" alt="Mobile Console Utilities" /> |

</div>

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

## Key Highlights & Features

- ⚡ **Pure Client-Side WASM Emulation**: Hardware-accelerated WebAssembly execution across 12 retro platforms with ~0% host server CPU usage.
- 🎨 **Nintendo DS Dual-Screen Touch UI**: Dynamic top-screen box art & specs, bottom touchscreen carousel, and grid density toggles (`S`–`XXL`).
- 🎮 **Universal Gamepad & Spatial Navigation**: 100% controller-driven library navigation, live DualShock visualizer, battery telemetry, and on-screen virtual keyboard.
- ⏱️ **Auto-Resume & Save State Engine**: Automatic state extraction on game exit with instant countdown auto-resume and dedicated quick save state studio.
- 💾 **Profile-Scoped Battery Saves (`.sav`)**: In-game cartridge battery saves and SRAM isolated per Multiavatar profile with auto-injection.
- 👤 **Multiavatar Character Creation Studio**: Custom retro player profiles with randomized avatar generators and 4 archetype presets.
- 🕹️ **Authentic 3D Cartridge & Jewel Cases**: Console-authentic 3D physical cartridge models and dark obsidian PS1 CD cases with dynamic tilt.
- 🗄️ **Centralized Database & 1-Click Backup**: Single JSON document database (`data/retroplayer_db.json`) on disk with 1-click backup export and restore studio.
- 🌐 **Unified Metadata & Box Art Scraper**: Automated multi-source scraper (Libretro CDN, ScreenScraper, TheGamesDB, Wikipedia) with an inline metadata editor.
- 📖 **Curated Strategy Guides & QR Companion**: Integrated written walkthroughs and video playthroughs with mobile QR code pairing for couch play.
- 📁 **Folder Batch Ingestion & Companion Asset Pairing**: Drag and drop entire multi-system ROM directories or load in-memory with zero disk copies, automatic console classification across 12 platforms, background scraping, and automatic local companion box art (`.webp`/`.png`/`.jpg`) and metadata (`.json`/`.nfo`) sidecar binding.
- 🎵 **Dynamic BGM & Synthesized SFX**: Multi-track chiptune engine with smart in-game pause and low-latency Web Audio sound effects.
- 📱 **Adaptive Cross-Device PWA**: Installable standalone app optimized for Mobile Touch Feeds, Steam Deck, Desktop, and 10-Foot TV mode.
- 📹 **60 FPS Recorder & Engine Controls**: In-browser video capture, speed turbo throttling (`1.0x`–`5.0x`), VSync, CRT/pixel shaders, and live diagnostic HUD.

---

## 🕹️ Supported Consoles & Platforms

Retro Player supports **12 classic retro gaming platforms** out of the box:

| Category | Supported Consoles | Formats | Default Emulation Core |
| :--- | :--- | :--- | :--- |
| **Handhelds** | Game Boy Advance (`gba`), Game Boy Color (`gbc`), Game Boy DMG (`gb`), Sega Game Gear (`game_gear`), Nintendo DS (`nds`) | `.gba`, `.gbc`, `.gb`, `.gg`, `.nds` | mGBA, Gambatte, Genesis Plus GX, MelonDS |
| **Home Consoles** | Super Nintendo (`snes`), NES (`nes`), Nintendo 64 (`n64`), Sega Genesis (`sega_genesis`), Atari 2600 (`atari_2600`), PlayStation 1 (`playstation`) | `.sfc`, `.smc`, `.nes`, `.z64`, `.md`, `.gen`, `.a26`, `.chd`, `.iso`, `.cue` | Snes9x, FCEUmm, Mupen64Plus, Genesis Plus GX, Stella, Beetle PSX |
| **Arcade** | Arcade MAME (`arcade`) | `.zip` | MAME 2003 Plus |

---

## 🎮 Bring-Your-Own-ROM (BYOR) Architecture & Privacy

Retro Player follows a strict **Bring-Your-Own-ROM (BYOR)** architecture designed for maximum privacy, zero server overhead, and complete copyright compliance:

- 🔒 **100% Private Client-Side Execution**: Load personal game dumps and ROM hacks via **"Load Custom ROM"** or direct drag-and-drop. Files are parsed strictly in local browser RAM with zero server uploads.
- 📁 **Local Host & Docker Storage**: Self-hosters can mount their private `./roms/` collection directly into the container with automatic console sorting, persistence, and local library scanning.
- 🎨 **Universal Local Sidecars**: Automatically detects and renders local companion covers (`cover.webp`, `cover.png`) and Kodi/Jellyfin `.nfo` or `.json` metadata files.
- 📑 **ROM Organization & Sidecar Specs**: See **[guides/roms.md](guides/roms.md)** for directory structures, naming conventions, and sidecar metadata schemas.

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
> **Docker Customization**: You can customize volumes (`./roms`, `./bgm`, `./data`) directly in [`docker-compose.yml`](docker-compose.yml). See the **[Docker Deployment Guide](guides/docker.md)** for full details.

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
| **[🎮 ROM Management & Sidecar Metadata](guides/roms.md)** | Directory organization, folder mounting, and local companion sidecars (`.nfo`, `.json`, `cover.webp`) guide. |

---

## 🛠️ Workspace Skills & Automation Tooling

Retro Player includes built-in AI agent skills and automated utility scripts under [`.agents/skills/`](.agents/skills/):

| Skill | Path | Description |
| :--- | :--- | :--- |
| **[Codebase Stats](.agents/skills/codebase-stats/SKILL.md)** | [`.agents/skills/codebase-stats/`](.agents/skills/codebase-stats/) | Analyzes and reports file extension counts, sizes, and summaries while filtering build/cache folders. |
| **[Update ROMs](.agents/skills/update-roms/SKILL.md)** | [`.agents/skills/update-roms/`](.agents/skills/update-roms/) | High-throughput parallel ROM organizer and unified multi-source scraper with layered fallback matching and WebP conversion. |
| **[ROM Cleanup](.agents/skills/rom-cleanup/SKILL.md)** | [`.agents/skills/rom-cleanup/`](.agents/skills/rom-cleanup/) | Deduplicates dated builds, prunes non-English regions, and filters obscure releases with structured keep/remove approval. |
| **[Release Version](.agents/skills/release-version/SKILL.md)** | [`.agents/skills/release-version/`](.agents/skills/release-version/) | Synchronizes app version across Service Worker caches, PWA manifest, package configs, in-app About modal, and documentation. |

---

## 🔮 Future Roadmap (Mirai)

Upcoming feature designs, technical blueprints, and step-by-step implementation guides are organized under [`mirai/`](mirai/README.md):

- **[Master Roadmap Index](mirai/README.md)**: Prioritized status index across all upcoming milestones.
- **[3D Cartridge & Media Designs](mirai/cartridge-designs-spec.md)**: Master geometric specifications for authentic physical cartridge shells.
- **[Local Directory Library Mount](mirai/local-directory-library.md)**: Direct filesystem folder mounting and client-side metadata scraping.
- **[BYOS Cloud Storage](mirai/byos-cloud-storage.md)**: Bring-Your-Own-Storage streaming (Google Drive, AWS S3, Cloudflare R2).
- **[Cross-Device Cloud Saves](mirai/cloud-saves.md)**: Cloud synchronization for quick saves and battery SRAM states.
- **[Self-Hosted User Management](mirai/self-hosted-user-management.md)**: Multi-user auth, admin dashboard, and role permissions.
- **[Organic Achievements & Trophies](mirai/organic-achievements.md)**: Universal gameplay milestones, trophies, and unlock toasts.
- **[Settings Hub Redesign](mirai/settings-hub.md)**: Enhanced console library management and diagnostic tools.
- **[WebRTC Netplay](mirai/multiplayer.md)**: Peer-to-peer online multiplayer with input rollback synchronization.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
Made with ❤️ for classic gaming enthusiasts worldwide.
</div>

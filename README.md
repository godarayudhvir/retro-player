<div align="center">

# 🕹️ RETRO PLAYER

### *The High-Performance, Zero-Overhead Web Emulation Station*

[![Docker Multi-Arch Build](https://github.com/godarayudhvir/retro-player/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/godarayudhvir/retro-player/actions)
[![GitHub Container Registry](https://img.shields.io/badge/GHCR.io-retro--player-blue?logo=docker&logoColor=white)](https://github.com/godarayudhvir/retro-player/pkgs/container/retro-player)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![WASM Powered](https://img.shields.io/badge/Emulation-WebAssembly-654FF0?logo=webassembly&logoColor=white)](https://webassembly.org/)

<br />

**A console-grade retro game launcher and library, delivered straight to any web browser.**  
Featuring physical 3D cartridge rendering, real-time online metadata scraping, synthesized acoustic SFX, and **pure client-side WebAssembly execution**.

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
│  Host Server   │ ──────────> │  │ WebAssembly Core   │──>│  60 FPS Canvas Rendering  │  │
│ (Railway/NAS)  │  (Few MB)   │  │ (Runs on client)   │   │  0ms Gamepad Polling      │  │
│ ~0% CPU / RAM  │             │  └────────────────────┘   │  Web Audio SFX Synthesizer│  │
└────────────────┘             │                           └───────────────────────────┘  │
                               └──────────────────────────────────────────────────────────┘
```

- **🔥 Server Resource Usage is ~0%**: The host only serves static files and streams the raw ROM binary once. Even a free-tier container or Raspberry Pi can serve hundreds of concurrent players.
- **⚡ 0ms Input Lag**: Controllers and keyboards are polled directly in the client browser with zero network latency.
- **💾 Automatic Auto-Sorting Disk Persistence**: Load any ROM from your browser—it is automatically sorted and saved to your host disk (`/roms/<system>/`) for future sessions.
- **🛡️ 100% Air-Gapped Offline Support**: Features dual-mode fallback to local core bundles when offline.

---

## ✨ Key Highlights

- 🎨 **4 Signature Themes**:
  - ☀️ **iiSU Light**: Crisp porcelain white with Nintendo red & cyan accents.
  - 🌙 **Midnight Cyber**: Deep obsidian glassmorphism with vivid neon glows.
  - 🌊 **Sony XMB Wave**: Ambient animated PlayStation-inspired wave gradient.
  - 📟 **Game Boy DMG Classic**: Authentic monochromatic dot-matrix LCD green.
- 💾 **3D Physical Cartridge Engine**:
  - Tactile retro game cartridges with dynamic metallic sheens, grip textures, embossed brand stamps, and smart color heuristics matched to game titles.
- 🌐 **Automated ES-DE Online Metadata Scraper**:
  - Zero bloated assets in your repo. Scrapes official 3D box art from **Libretro Thumbnails** and synopsis info from **Wikipedia** on the fly, cached in **IndexedDB**.
- 🔊 **Synthesized Pure Web Audio UI SFX**:
  - Real-time acoustic sound synthesizer. Zero external MP3 downloads. Authentic mechanical cartridge insertion click-clacks, frequency swooshes, and boot chimes.
- 🎮 **Full Gamepad & Keyboard Navigation**:
  - D-Pad/Stick navigation, shoulder triggers (`L1`/`R1` or `Q`/`E`), on-screen virtual keyboard (`⌘K`), and instant quick-launch (`A` button / `Enter`).
- ⏱️ **Playtime Analytics & Smart Collections**:
  - Track session durations, total hours played, bookmark **Favorites ⭐**, and browse your **Recently Played** queue.

---

## 🕹️ Supported Systems

| System | Platform Key | Default Core | Supported File Extensions |
| :--- | :--- | :--- | :--- |
| **Game Boy Advance** | `gba` | `gba` (mGBA) | `.gba` |
| **Game Boy / Color** | `gb`, `gbc` | `gb` (Gambatte) | `.gb`, `.gbc` |
| **Super Nintendo** | `snes` | `snes` (Snes9x) | `.sfc`, `.smc`, `.snes` |
| **Nintendo (NES)** | `nes` | `nes` (FCEUmm) | `.nes` |
| **Nintendo 64** | `n64` | `n64` (Mupen64Plus) | `.z64`, `.n64`, `.v64` |
| **Nintendo DS** | `nds` | `nds` (MelonDS / DeSmuME) | `.nds` |
| **Sega Genesis / Mega Drive** | `genesis` | `segaMD` (Genesis Plus GX) | `.gen`, `.md`, `.smd` |
| **PlayStation (PS1)** | `ps1` | `psx` (Beetle PSX) | `.chd`, `.iso`, `.cue`, `.bin` |
| **Arcade** | `arcade` | `mame2003_plus` | `.zip` |

---

## 🚀 Deployment Guide

### 1. ☁️ Railway

[Railway](https://railway.app) is one of the easiest ways to host Retro Player with persistent storage:

1. **Fork or Import** this repository into your GitHub account.
2. Go to **Railway** $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo** $\rightarrow$ select `retro-player`.
3. **Add Persistent Volume** *(crucial for saving ROMs)*:
   - Click your service $\rightarrow$ **Volumes** tab $\rightarrow$ **Add Volume**.
   - Set **Mount Path**: `/roms` (e.g. 5GB–10GB).
4. **Set Environment Variables**:
   - `PORT` = `3000`
   - `ROMS_DIR` = `/roms`
5. **Generate Public Domain**:
   - Under service **Settings** $\rightarrow$ **Networking** $\rightarrow$ click **Generate Domain**.
6. Railway automatically builds the `Dockerfile` and deploys your portal!

---

### 2. ⚡ Render

1. Log in to **[Render](https://render.com)** $\rightarrow$ click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Choose **Docker** as the Environment.
4. **Attach a Disk**:
   - Scroll to **Disks** $\rightarrow$ **Add Disk**.
   - Name: `roms-data`, Mount Path: `/roms`, Size: `10GB`.
5. Add Environment Variables:
   - `PORT`: `3000`
   - `ROMS_DIR`: `/roms`
6. Click **Create Web Service**.

---

### 3. 🎈 Fly.io

Deploy globally with Fly.io CLI in seconds:

1. Launch app configuration:
   ```bash
   fly launch --image ghcr.io/godarayudhvir/retro-player:latest
   ```
2. Create a persistent volume:
   ```bash
   fly volumes create roms_data --size 10 -r <your-region>
   ```
3. In `fly.toml`, ensure the volume and environment variables are mapped:
   ```toml
   [env]
     PORT = "3000"
     ROMS_DIR = "/roms"

   [mounts]
     source = "roms_data"
     destination = "/roms"
   ```
4. Deploy:
   ```bash
   fly deploy
   ```

---

### 4. 🔮 Coolify (Self-Hosted PaaS)

1. In your Coolify dashboard, select **Projects** $\rightarrow$ **Add Resource** $\rightarrow$ **Docker Compose** or **GitHub Repository**.
2. Set the compose configuration to use `image: ghcr.io/godarayudhvir/retro-player:latest`.
3. Under **Persistent Storage**, add a volume mapping:
   - Host path: `/data/retro-player/roms`
   - Mount path: `/roms`
4. Set Exposed Port to `3000` and deploy.

---

### 5. 🐳 Portainer / Unraid / TrueNAS / Synology

- **Image**: `ghcr.io/godarayudhvir/retro-player:latest`
- **Port Mapping**: `3000:3000` (or `8080:3000`)
- **Volume / Path Mapping**:
  - Host Path: `/mnt/user/appdata/retro-player/roms` (Unraid) or `/docker/retro-player/roms` (Synology)
  - Container Path: `/roms`
  - Mode: `Read/Write (rw)`
- **Environment Variables**:
  - `PORT=3000`
  - `ROMS_DIR=/roms`

---

### 6. 🐳 Docker Compose (Standard Linux VPS / HomeLab)

Run Retro Player locally or on your home server (Ubuntu, Debian, Raspberry Pi):

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
      # Map host roms folder directly into /roms inside the container
      - ./roms:/roms
```

#### Starting the stack:
```bash
# 1. Create directory and place your docker-compose.yml
mkdir retro-player && cd retro-player

# 2. Launch in detached mode
docker compose up -d

# 3. Access in your browser
open http://localhost:3000
```

---

### 7. 🖥️ Run with Docker CLI

```bash
docker run -d \
  --name retro-player \
  --restart unless-stopped \
  -p 3000:3000 \
  -e PORT=3000 \
  -e ROMS_DIR=/roms \
  -v $(pwd)/roms:/roms \
  ghcr.io/godarayudhvir/retro-player:latest
```

---

### 8. 💻 Local Development Setup (Node.js)

```bash
# 1. Clone the repository
git clone https://github.com/godarayudhvir/retro-player.git
cd retro-player

# 2. Install dependencies
npm install

# 3. Launch Vite dev server
npm run dev

# 4. Or build and launch production server
npm run build
npm start
```

---

## 🗂️ Organizing & Adding ROMs

### Method A: In-App Drag & Drop (Auto-Persistent)
Simply drag and drop any `.gba`, `.nes`, `.sfc`, `.z64`, `.nds` file onto the browser window.  
The backend will automatically:
1. Detect the system from the file extension.
2. Auto-create `./roms/<system>/` if it doesn't exist.
3. Save the ROM file to disk permanently.
4. Auto-fetch and cache official 3D box art and synopsis metadata.

### Method B: Direct Folder Placement
Place your ROM collection on your host machine inside `./roms/[system]/`:
```text
retro-player/
├── docker-compose.yml
└── roms/
    ├── gba/
    │   └── Pokemon Emerald.gba
    ├── snes/
    │   └── Super Mario World.sfc
    ├── n64/
    │   └── Super Mario 64.z64
    ├── nds/
    │   └── Pokemon Platinum.nds
    └── nes/
        └── Megaman 2.nes
```

---

## 🔄 Updating Your Container

#### Docker Compose:
```bash
# Pull newest image from GitHub Container Registry
docker compose pull

# Recreate container with zero downtime
docker compose up -d

# Clean up stale images
docker image prune -f
```

#### Docker CLI:
```bash
docker stop retro-player && docker rm retro-player
docker pull ghcr.io/godarayudhvir/retro-player:latest
docker run -d --name retro-player --restart unless-stopped -p 3000:3000 -v $(pwd)/roms:/roms ghcr.io/godarayudhvir/retro-player:latest
```

---

## 🛠️ Troubleshooting & Diagnostics

<details>
<summary><b>View Live Container Logs</b></summary>

```bash
docker compose logs -f
# Or via container name:
docker logs -f retro-player
```
</details>

<details>
<summary><b>Verify ROM Mount Permissions</b></summary>

If the container cannot read your ROM directory on Linux:
```bash
# Verify files inside container
docker exec -it retro-player ls -lah /roms

# Grant read/write permissions on host
chmod -R a+rwX ./roms
```
</details>

<details>
<summary><b>Complete Factory Reset</b></summary>

```bash
# Stop and remove container & networks
docker compose down -v --remove-orphans

# Remove cached images
docker rmi ghcr.io/godarayudhvir/retro-player:latest

# Re-pull and launch clean
docker compose pull
docker compose up -d --force-recreate
```
</details>

---

## 🎮 Controls Quick Reference

### Dashboard Navigation
| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| **Navigate Grid & Menus** | Arrow Keys / `W`, `A`, `S`, `D` | D-Pad / Left Stick |
| **Switch System / Tab** | `Q` / `E` / `PageUp` / `PageDown` | `L1` / `R1` (Shoulder Buttons) |
| **Select / Launch Game** | `Enter` / `Space` | `A` Button (Button 0) |
| **Toggle Favorite ⭐** | `F` Key | `X` Button (Button 2) |
| **Switch Theme 🎨** | `T` Key | Topbar Theme Button |
| **Search / Virtual Keyboard** | `⌘K` / `Ctrl+K` | `Y` Button (Button 3) / `Select` |
| **Back / Close Modals** | `Escape` / `Backspace` | `B` Button (Button 1) |

### In-Game Emulation
| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| **Directional Movement** | Arrow Keys / `W`, `A`, `S`, `D` | D-Pad / Left Stick |
| **Primary Actions (A / B)** | `Z` / `X` | `A` / `B` Buttons |
| **Start / Select** | `Enter` / `Shift` | `Start` / `Select` |
| **Exit Game to Launcher** | `Escape` | `Select` + `Start` (or Guide Button) |

---

## 📚 Technical Architecture Specifications

Retro Player follows rigorous software engineering standards with full technical design specifications under [`architecture/`](architecture/README.md):

- **[Core Entry & Bootstrap](architecture/core/index.md)**: Entry point, React mounting, Express production server & Docker containerization.
- **[Application Shell Orchestrator](architecture/core/app.md)**: Hook lifecycle, state coordination, and modal management.
- **[Emulator Engine](architecture/modules/emulator.md)**: EmulatorJS iframe isolation, core fallback & battery SRAM detection.
- **[Metadata Scraper](architecture/modules/metadata-scraper.md)**: Libretro & Wikipedia dynamic scraper with IndexedDB caching.
- **[Synthesized Audio SFX](architecture/modules/audio-sfx.md)**: Pure Web Audio API acoustic synthesis.
- **[Theme Engine](architecture/modules/theme-engine.md)**: Real-time CSS tokens and instant theme persistence.
- **[Game Catalog Indexer](architecture/modules/game-catalog.md)**: Zero-config auto-scanning and persistent upload pipeline.
- **[Mirai Master Vision](mirai.md)**: Deliverables checklist and multi-domain innovation roadmap.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
Made with ❤️ for classic gaming enthusiasts worldwide.
</div>

# 🐳 Docker & Docker Compose Deployment Guide

Complete documentation for deploying **Retro Player** using Docker and Docker Compose.

---

## ⚡ Quick Start: Docker Compose (Recommended)

1. **Download [`docker-compose.yml`](../docker-compose.yml)**:
   ```bash
   mkdir retro-player && cd retro-player
   curl -O https://raw.githubusercontent.com/godarayudhvir/retro-player/main/docker-compose.yml
   ```

2. **Launch the container**:
   ```bash
   docker compose up -d
   ```

3. **Access in browser**: `http://localhost:3000` (or `http://<server-ip>:3000`).

---

## 🍎 macOS Quick Start: OrbStack

Running on macOS (Apple Silicon or Intel)? Check out our dedicated **[macOS & OrbStack Deployment & Backend ROM Management Guide](orbstack.md)** for near-instant container startup, native VirtioFS filesystem performance, local `.orb.local` domains, and complete backend ROM management via Finder and Terminal.

---

## ⚙️ Environment Variables & Configuration

Retro Player supports configuration via environment variables in `docker-compose.yml` or `docker run`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port the server listens on inside the container. |
| `ROMS_DIR` | `/roms` | Path where mounted host ROMs, companion covers, sidecars, and uploads are stored. |
| `BGM_DIR` | `/bgm` | Path where custom background audio tracks are stored. |
| `DATA_DIR` | `/data` | Path where the central JSON document database (`retroplayer_db.json`) is stored. |
| `INCLUDE_DEMO_BGM` | `true` | Set to `true` to include bundled background audio tracks; set to `false` for purely your own audio. |
| `DISCORD_CLIENT_ID` | `1544079303598411776` | Discord Application ID for Desktop Rich Presence (RPC). |
| `APP_URL` | `http://localhost:3000` | Public URL of your Retro Player instance (used for Discord RPC "Play in Browser" button). |

---

### 🎮 Library Storage & Setup Scenarios

#### Scenario 1: Local Host Folder Mount (Recommended for HomeLabs/NAS)
- **Settings**: Mount `./roms:/roms`, `./bgm:/bgm`, and `./data:/data`.
- **UI Experience**: All profiles, in-game battery RAM (`.sav`), snapshot save states (`.state`), favorites, recents, playtime metrics, and settings are written directly to `./data/retroplayer_db.json`. Any games placed into `./roms/<system>/` (along with `<game>.webp` covers and `<game>.json` sidecars) are instantly indexed.

#### Scenario 2: Pure Client-Side Drag-and-Drop
- **Settings**: No host volume mounts needed.
- **UI Experience**: Drop `.gba`, `.sfc`, `.nes`, `.nds`, or `.zip` files directly into your browser window or use **"Load Custom ROM"**. Games execute 100% in browser RAM with saves persisted to your browser's IndexedDB and exportable to JSON at any time.

---

## 💾 Backing Up & Migrating Your Data

Retro Player provides two zero-friction backup methods:

### Method A: Host Filesystem Backup (Automated / NAS)
Simply copy the three mounted directories:
```bash
# Create a timestamped archive of all ROMs, media, and saves
tar -czvf retroplayer-backup-$(date +%F).tar.gz ./data ./roms ./bgm
```
To restore on a new server or container, extract the archive into your project directory before running `docker compose up -d`.

### Method B: In-App 1-Click Database Export & Import (Web UI)
1. In the Retro Player topbar or mobile hamburger drawer, click **Database Backup & Restore**.
2. Click **Download Backup (.json)** to save your entire database (all profiles, battery saves, save states, history, and settings).
3. To restore on any device or fresh instance, open the modal, select/drop your backup `.json` file, and click **Confirm & Restore Backup**.

---

## 🖥️ Docker CLI (Single Container)

Run directly using standard Docker CLI:

```bash
docker run -d \
  --name retro-player \
  --restart unless-stopped \
  -p 3000:3000 \
  -e PORT=3000 \
  -e ROMS_DIR=/roms \
  -e BGM_DIR=/bgm \
  -e DATA_DIR=/data \
  -e INCLUDE_DEMO_BGM=true \
  -v $(pwd)/roms:/roms \
  -v $(pwd)/bgm:/bgm \
  -v $(pwd)/data:/data \
  ghcr.io/godarayudhvir/retro-player:latest
```

---

## 🗂️ Directory & Volume Structure

Place your ROM files in system folders or drop them directly onto the web interface:

```text
retro-player/
├── docker-compose.yml
├── data/
│   └── retroplayer_db.json
├── bgm/
│   └── custom_track.mp3
└── roms/
    ├── gba/
    │   ├── Pokemon Emerald.gba
    │   ├── Pokemon Emerald.json
    │   └── Pokemon Emerald.webp
    ├── snes/
    │   ├── Super Mario World.sfc
    │   ├── Super Mario World.json
    │   └── Super Mario World.webp
    ├── n64/
    │   └── Super Mario 64.z64
    ├── nds/
    │   └── Pokemon Platinum.nds
    └── nes/
        └── Megaman 2.nes
```

---

## 🔄 Updating to the Latest Version

### Using Docker Compose:
```bash
# 1. Pull the newest image from GHCR
docker compose pull

# 2. Recreate container with zero downtime
docker compose up -d

# 3. Clean up old images
docker image prune -f
```

### Using Docker CLI:
```bash
docker stop retro-player && docker rm retro-player
docker pull ghcr.io/godarayudhvir/retro-player:latest
docker run -d --name retro-player --restart unless-stopped -p 3000:3000 -v $(pwd)/roms:/roms -v $(pwd)/bgm:/bgm -v $(pwd)/data:/data ghcr.io/godarayudhvir/retro-player:latest
```

---

## 🛠️ Diagnostics & Troubleshooting

### View Live Logs
```bash
docker compose logs -f
# Or:
docker logs -f retro-player
```

### Check Files Inside Container
```bash
docker exec -it retro-player ls -lah /roms
docker exec -it retro-player ls -lah /bgm
docker exec -it retro-player ls -lah /data
```

### Fix Linux Permissions (If Docker needs root or volume access)
If running on Linux without rootless Docker setup, ensure permissions:
```bash
# Allow running Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Fix host directory permissions for uploads
chmod -R a+rwX ./roms ./bgm ./data
```

### Clean Factory Reset
```bash
docker compose down -v --remove-orphans
docker rmi ghcr.io/godarayudhvir/retro-player:latest
docker compose pull && docker compose up -d --force-recreate
```

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

## ⚙️ Environment Variables & Configuration

Retro Player supports configuration via environment variables in `docker-compose.yml` or `docker run`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port the server listens on inside the container. |
| `ROMS_DIR` | `/roms` | Path where custom mounted ROMs and user uploads are stored. |
| `BGM_DIR` | `/bgm` | Path where custom background audio tracks are stored. |
| `DATA_DIR` | `/data` | Path where user profiles, playtime, favorites, and controller mappings are saved. |
| `INCLUDE_DEMO_ROMS` | `true` | Set to `true` to include bundled showcase demo ROMs (52 titles); set to `false` for purely your own library. |
| `INCLUDE_DEMO_BGM` | `true` | Set to `true` to include bundled 8-bit chiptune audio; set to `false` for purely your own audio. |
| `AUTO_SEED_DEMOS` | `false` | Set to `true` to automatically copy bundled demo ROMs & BGM into your mounted host folders on first launch. |

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
  -e INCLUDE_DEMO_ROMS=true \
  -e INCLUDE_DEMO_BGM=true \
  -e AUTO_SEED_DEMOS=false \
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
docker run -d --name retro-player --restart unless-stopped -p 3000:3000 -v $(pwd)/roms:/roms ghcr.io/godarayudhvir/retro-player:latest
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
```

### Fix Linux Permissions (If Docker needs root or volume access)
If running on Linux without rootless Docker setup, ensure permissions:
```bash
# Allow running Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Fix host directory permissions for uploads
chmod -R a+rwX ./roms ./bgm
```

### Clean Factory Reset
```bash
docker compose down -v --remove-orphans
docker rmi ghcr.io/godarayudhvir/retro-player:latest
docker compose pull && docker compose up -d --force-recreate
```

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

> [!TIP]
> To customize ports, volumes, or environment variables, inspect the single source of truth: [`docker-compose.yml`](../docker-compose.yml).

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
  -v $(pwd)/roms:/roms \
  ghcr.io/godarayudhvir/retro-player:latest
```

---

## 🗂️ ROM Directory Structure

Place your ROM files in system folders or drop them directly onto the web interface:

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
```

### Fix Host Permissions (Linux)
```bash
chmod -R a+rwX ./roms
```

### Clean Factory Reset
```bash
docker compose down -v --remove-orphans
docker rmi ghcr.io/godarayudhvir/retro-player:latest
docker compose pull && docker compose up -d --force-recreate
```

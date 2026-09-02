# 🍎 macOS & OrbStack Deployment Guide

A complete guide for running **Retro Player** on macOS (Apple Silicon & Intel) using **[OrbStack](https://orbstack.dev)**—the ultra-fast, lightweight Docker Desktop alternative.

---

## ⚡ Why OrbStack on macOS?

| Advantage | OrbStack | Docker Desktop |
| :--- | :--- | :--- |
| **Startup Speed** | ~2 seconds | ~15–30 seconds |
| **Battery & CPU** | Near-zero idle CPU (~0.1%) | Noticeable background battery drain |
| **Filesystem Speeds** | Native VirtioFS (instant I/O) | Slower host-to-container volume bridge |
| **Local Domains** | Automatic `http://retro-player.orb.local:3000` | Manual `localhost:3000` / IP tracking |
| **Linux Machine Setup** | **Zero setup required** (built-in Docker engine) | Heavy virtual machine management |

---

## 🚀 Quick Start (2 Minutes)

### 1. Install OrbStack (if not installed)
Install via [Homebrew](https://brew.sh):
```bash
brew install orbstack
```
*Or download the installer directly from [orbstack.dev](https://orbstack.dev).*

### 2. Download `docker-compose.yml` & Launch
```bash
# Create project folder
mkdir -p retro-player && cd retro-player

# Download Compose file
curl -O https://raw.githubusercontent.com/godarayudhvir/retro-player/main/docker-compose.yml

# Pull latest release image & start container in background
docker compose pull
docker compose up -d
```

### 3. Open in Browser
You can access your portal immediately via either:
* **Localhost**: `http://localhost:3000` *(Recommended on desktop for native zero-copy folder linking)*
* **OrbStack Local Domain / Bridge IP**: `http://retro-player.orb.local:3000` or `http://192.168.x.x:3000`

> [!NOTE]
> Modern desktop browsers restrict the File System Access API (`showDirectoryPicker`) to **Secure Contexts** (`localhost` or `HTTPS`). When opening Retro Player via `localhost:3000` or HTTPS, desktop zero-copy folder selection and collection re-linking are fully enabled. When accessing via a raw LAN IP, drag-and-drop and multi-file selection are used instead. (Mobile browsers support folder selection across all origins).

---

## 🗂️ Fast Volume Mounting (VirtioFS)

When running via Docker Compose in OrbStack, your host directories (`./roms`, `./bgm`, `./data`) are mounted directly into the container using Apple VirtioFS. This delivers native macOS read/write performance with zero container restarts.

For full directory structures, companion sidecar formats, and ROM organization, see the **[ROM Management & Sidecar Guide](roms.md)**.

---

## 🖥️ Managing the Container via OrbStack

### Using the OrbStack macOS GUI App
1. Open the **OrbStack** app from Applications or Spotlight (`Cmd + Space` $\rightarrow$ `OrbStack`).
2. Click **Containers** in the left sidebar.
3. Locate the `retro-player` compose stack:
   * **Click the dropdown chevron (`>`)** next to `retro-player` to expand the stack containers.
   * **Click the link / paperclip icon (`🔗`)** next to the running container row to immediately open `http://retro-player.orb.local:3000` in your default browser.
   * **View live metrics**: Monitor real-time CPU %, RAM usage, and network I/O.
   * **View logs**: Click the container row to inspect real-time server logs and ROM scanner output.
   * **Open Terminal**: Click the **Terminal** tab or icon to get an instant shell inside `/app`.

### Using the Terminal CLI
```bash
# View live server output and ROM indexing logs
docker compose logs -f

# Restart the server
docker compose restart

# Stop the container
docker compose down

# Update to the latest release
docker compose pull && docker compose up -d
```

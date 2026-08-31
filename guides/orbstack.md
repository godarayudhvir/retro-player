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
mkdir retro-player && cd retro-player

# Download Compose file
curl -O https://raw.githubusercontent.com/godarayudhvir/retro-player/main/docker-compose.yml

# Start the container in background
docker compose up -d
```

### 3. Open in Browser
You can access your portal immediately via either:
* **OrbStack Local Domain**: `http://retro-player.orb.local:3000`
* **Localhost**: `http://localhost:3000`

---

## 🗂️ Fast Volume Mounting (VirtioFS)

When running via Docker Compose in OrbStack, your host directories (`./roms`, `./bgm`, `./data`) are mounted directly into the container using Apple VirtioFS. This delivers native macOS read/write performance with zero container restarts.

For full directory structures, companion sidecar formats, and ROM organization, see the **[ROM Management & Sidecar Guide](roms.md)**.

---

## 🖥️ Managing the Container via OrbStack

### Using the OrbStack macOS GUI App
1. Open the **OrbStack** app from Applications or Spotlight (`Cmd + Space` $\rightarrow$ `OrbStack`).
2. Click **Containers** in the sidebar.
3. Locate `retro-player`:
   * **Click the URL** (`http://retro-player.orb.local:3000`) to open directly in your default browser.
   * **View live metrics**: Monitor real-time CPU %, RAM usage, and network I/O.
   * **View logs**: Click the container to inspect real-time server logs and ROM scanner output.
   * **Open Terminal**: Click the **Terminal** icon to get an instant shell inside `/app`.

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

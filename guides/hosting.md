# ☁️ Cloud & Self-Hosted Deployment Guide

Step-by-step instructions to host **Retro Player** on Railway, Render, Fly.io, Coolify, Portainer, and HomeLab NAS systems.

---

## 1. ☁️ Railway

[Railway](https://railway.app) offers fast, reliable container hosting with persistent NVMe volumes.

1. Go to **[Railway](https://railway.com/new)** $\rightarrow$ Click **Deploy from GitHub repo**.
2. Select `godarayudhvir/retro-player` (or your personal fork).
3. **Attach Persistent Volumes**:
   - **ROMs Volume**: Mount Path: `/roms` *(for games, covers & sidecars)*.
   - **Data Volume**: Mount Path: `/data` *(for saves, profiles & settings)*.
4. **Set Environment Variables**:
   - `PORT`: `3000`
   - `ROMS_DIR`: `/roms`
   - `DATA_DIR`: `/data`
5. **Generate Public Domain**:
   - Under **Settings** $\rightarrow$ **Networking** $\rightarrow$ **Generate Domain**.
6. Railway builds the multi-stage Dockerfile and deploys your portal!

---

## 2. ⚡ Render (1-Click Blueprint)

Deploy using Render's automated Infrastructure-as-Code Blueprint ([`render.yaml`](../render.yaml)):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/godarayudhvir/retro-player)

1. Click the **Deploy to Render** button above or connect your GitHub repository.
2. Render provisions the Docker Web Service and attaches the `/roms` 10GB persistent disk automatically.
3. Your portal is live with zero manual configuration.

---

## 3. 🎈 Fly.io

Deploy globally on Fly.io edge infrastructure:

1. **Launch configuration**:
   ```bash
   fly launch --image ghcr.io/godarayudhvir/retro-player:latest
   ```
2. **Create persistent volumes**:
   ```bash
   fly volumes create roms_data --size 10 -r <your-region>
   fly volumes create app_data --size 3 -r <your-region>
   ```
3. **Configure `fly.toml`**:
   ```toml
   [env]
     PORT = "3000"
     ROMS_DIR = "/roms"
     DATA_DIR = "/data"

   [[mounts]]
     source = "roms_data"
     destination = "/roms"

   [[mounts]]
     source = "app_data"
     destination = "/data"
   ```
4. **Deploy**:
   ```bash
   fly deploy
   ```

---

## 4. 🔮 Coolify (Self-Hosted PaaS)

1. In your Coolify dashboard, select **Projects** $\rightarrow$ **Add Resource** $\rightarrow$ **Docker Compose**.
2. Use image `ghcr.io/godarayudhvir/retro-player:latest`.
3. Under **Persistent Storage**, map:
   - Host path: `/data/retro-player/roms` $\rightarrow$ Mount path: `/roms`
   - Host path: `/data/retro-player/data` $\rightarrow$ Mount path: `/data`
   - Host path: `/data/retro-player/bgm` $\rightarrow$ Mount path: `/bgm`
4. Set Exposed Port to `3000` and deploy.

---

## 5. 🐳 Portainer / Unraid / TrueNAS / Synology

- **Image**: `ghcr.io/godarayudhvir/retro-player:latest`
- **Port Mapping**: `3000:3000` (or `8080:3000`)
- **Volume Mapping**:
  - Host Path: `/mnt/user/appdata/retro-player/roms` $\rightarrow$ `/roms` (Mode: `rw`)
  - Host Path: `/mnt/user/appdata/retro-player/data` $\rightarrow$ `/data` (Mode: `rw`)
  - Host Path: `/mnt/user/appdata/retro-player/bgm` $\rightarrow$ `/bgm` (Mode: `rw`)
- **Environment Variables**:
  - `PORT=3000`
  - `ROMS_DIR=/roms`
  - `DATA_DIR=/data`
  - `BGM_DIR=/bgm`

---

## 6. 🍎 macOS (OrbStack)

[OrbStack](https://orbstack.dev) is a lightweight macOS alternative to Docker Desktop with near-instant startup, native filesystem speeds, and local domain routing without needing a separate Linux machine.

See the dedicated **[macOS & OrbStack Deployment & Backend ROM Management Guide](orbstack.md)** for complete setup, Finder drag-and-drop workflows, and backend ROM library administration.



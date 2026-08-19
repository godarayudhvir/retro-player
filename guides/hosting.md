# ☁️ Cloud & Self-Hosted Deployment Guide

Step-by-step instructions to host **Retro Player** on Railway, Render, Fly.io, Coolify, Portainer, and HomeLab NAS systems.

---

## 1. ☁️ Railway

[Railway](https://railway.app) offers fast, reliable container hosting with persistent NVMe volumes.

1. Go to **[Railway](https://railway.com/new)** $\rightarrow$ Click **Deploy from GitHub repo**.
2. Select `godarayudhvir/retro-player` (or your personal fork).
3. **Attach a Persistent Volume** *(crucial for saving ROMs)*:
   - Click the service $\rightarrow$ Navigate to **Volumes** $\rightarrow$ **Add Volume**.
   - Set **Mount Path**: `/roms`.
4. **Set Environment Variables**:
   - `PORT`: `3000`
   - `ROMS_DIR`: `/roms`
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
2. **Create persistent volume**:
   ```bash
   fly volumes create roms_data --size 10 -r <your-region>
   ```
3. **Configure `fly.toml`**:
   ```toml
   [env]
     PORT = "3000"
     ROMS_DIR = "/roms"

   [mounts]
     source = "roms_data"
     destination = "/roms"
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
   - Host path: `/data/retro-player/roms`
   - Mount path: `/roms`
4. Set Exposed Port to `3000` and deploy.

---

## 5. 🐳 Portainer / Unraid / TrueNAS / Synology

- **Image**: `ghcr.io/godarayudhvir/retro-player:latest`
- **Port Mapping**: `3000:3000` (or `8080:3000`)
- **Volume Mapping**:
  - Host Path: `/mnt/user/appdata/retro-player/roms` (Unraid) or `/docker/retro-player/roms` (Synology)
  - Container Path: `/roms`
  - Mode: `Read/Write (rw)`
- **Environment Variables**:
  - `PORT=3000`
  - `ROMS_DIR=/roms`

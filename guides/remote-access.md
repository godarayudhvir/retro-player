# 🌐 Remote Access & Anywhere Play Guide

Access your self-hosted **Retro Player** instance securely from your iPhone, Android, tablet, or laptop from anywhere in the world.

---

## ⚡ The WebAssembly Advantage

Because Retro Player runs on WebAssembly in the client browser, remote play requires **almost zero continuous bandwidth** (just a single ~5MB ROM transfer per play session). You get full 60 FPS performance and 0ms local controller response without streaming high-bitrate video.

---

## 🔒 Option A: Tailscale (Private Mesh VPN)

Tailscale provides private, encrypted peer-to-peer WireGuard networking between your devices without exposing any ports to the public internet.

### 1. Set up Tailscale on Host Server (Ubuntu/Debian/NAS)
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### 2. Connect Your Mobile / Client Device
1. Install the Tailscale app on your iPhone, Android, or laptop.
2. Sign in with the same account.

### 3. Play from Anywhere
Open your mobile browser and navigate to your server's Tailscale IP or MagicDNS hostname:
```text
http://100.x.y.z:3000
# Or:
http://my-home-server:3000
```
Pair a Bluetooth controller (Xbox, PS5, 8BitDo) or use the virtual touch controls!

---

## 🛡️ Option B: Cloudflare Tunnel (Zero Open Ports + Custom Domain)

Expose your container to the internet over HTTPS with DDoS protection without port-forwarding on your router.

### 1. Create a Cloudflare Tunnel
- In Cloudflare Zero Trust dashboard, go to **Networks** $\rightarrow$ **Tunnels** $\rightarrow$ **Create a Tunnel** (`retro-player`).

### 2. Add to `docker-compose.yml`
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
      - ./roms:/roms

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-retro
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=eyJh... # Paste your Cloudflare Tunnel token here
```

### 3. Route Public Hostname
- In Cloudflare: Map `games.yourdomain.com` to `retro-player:3000` (HTTP).
- Access your library at `https://games.yourdomain.com`.

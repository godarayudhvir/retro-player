# 🔮 MIRAI (未来) — Master Roadmap & Specifications Index

> **"Mirai" (未来)** is the Japanese word for **"Future"**. This document serves as the central directory and status index for all upcoming architectural specifications and roadmap milestones for **Retro Player**.
> 
> Detailed technical designs are decoupled into their respective domain specification files within this directory, **sorted below from Least Code Impact (Quick Wins / UI additions) to Most Code Impact (Complex distributed systems)**.

---

## 📌 Active Specifications Index (Sorted by Code Impact: Low ➔ High)

| # | Impact | Specification | Domain | Description | Status |
| :---: | :---: | :--- | :--- | :--- | :--- |
| 1 | 🟢 Low | **[Strategy Guides & Walkthrough Links Hub](walkthrough-links-hub.md)** | Curation & Tools | Zero-overhead smart outbound links (GameFAQs, StrategyWiki, Speedrun.com) in Game Detail modal + Phone Companion QR Code for TV mode. | 📋 Planned |
| 2 | 🟢 Low-Med | **[Organic Achievements & Milestones](organic-achievements.md)** | Gamification & UX | Universal in-house organic achievements (first game played, multi-console exploration, quick quit / funny habits, marathon streaks) with toast banners, chiptune fanfare, and trophy cabinet. | 📋 Planned |
| 3 | 🟡 Medium | **[3D Cartridge & Media Design Blueprint](cartridge-designs-spec.md)** | Theme Engine | Master geometric and CSS blueprint for all 10+ authentic physical cartridge shells (NES, SNES, N64, GBA, NDS, Genesis, GB, Game Gear, Atari, PS1) for future theme designs. | 📋 Planned |
| 4 | 🟡 Medium | **[Settings & Library Management Hub](settings-hub.md)** | System Hub & Tools | Clean console-native settings redesign: ROM library administration, BGM track manager, and IndexedDB storage diagnostics (wires into existing server REST endpoints). | 📋 Planned |
| 5 | 🟡 Medium | **[Local Directory Library & Client Scraping](local-directory-library.md)** | Storage & Library | `showDirectoryPicker()` local ROM folder mount, sidecar asset ingestion (`cover.webp`/`metadata.json`), client-side scraper, and persistent IndexedDB library caching (100% GitHub Pages offline). | 📋 Planned |
| 6 | 🟠 Med-High | **[Cross-Device Cloud Save Sync](cloud-saves.md)** | Save States & Sync | Bi-directional synchronization of single Quick Save / SRAM battery saves (`.sav`) to user Google Drive, S3/R2, or Supabase with conflict resolution dialog. | 📋 Planned |
| 7 | 🟠 Med-High | **[BYOS Cloud Storage Providers](byos-cloud-storage.md)** | Cloud & Streaming | Bring-Your-Own-Storage: Google Drive (OAuth2 PKCE) and Cloudflare R2 / AWS S3 client-side bucket streaming with zero server hosting or API costs. | 📋 Planned |
| 8 | 🔴 High | **[Self-Hosted Supabase & Multi-User Admin](self-hosted-user-management.md)** | Self-Hosted / Auth | Docker Supabase multi-user auth, first-run Super Admin onboarding wizard, and user role management portal (ROMs excluded from DB). | 📋 Planned |
| 9 | 🔴 High | **[WebRTC Netplay & P2P Multiplayer](multiplayer.md)** | Multiplayer & Social | Peer-to-peer online multiplayer room creation, low-latency DataChannels, and real-time input rollback synchronization. | 📋 Planned |

---

## 🛠️ Specification Guidelines

To add or update any specification in `architecture/mirai/`, adhere to the structure defined in [architecture/README.md](../README.md):
1. **Description**: High-level problem statement and feature overview.
2. **Detailed List of What It Will Do**: Comprehensive user-facing and system capabilities.
3. **Detailed Logic Behind It**: Architecture diagram, data flows, APIs, and state handling.
4. **Detailed Guide of How to Set It Up**: Step-by-step developer integration instructions.

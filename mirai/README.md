# 🔮 MIRAI (未来) — Master Roadmap & Specifications Index

> **"Mirai" (未来)** is the Japanese word for **"Future"**. This document serves as the central directory and status index for all upcoming architectural specifications and roadmap milestones for **Retro Player**.
>
> **Nintendo DS Dual-Screen Touch Theme**: Features a top screen for game artwork, battery save indicators, and live specs, and a bottom touchscreen with search, game selection carousel, inline **Save Data Studio** (`.sav` battery RAM import/export/erasure), inline **Strategy Guides Deck** (written walkthroughs, video guides, QR codes), and unified **Edit & Scrape Studio** (cover asset manager, real-time Libretro/Wikipedia search logs terminal, sidecar export) with instant zero-click tab switching and zero modal popups. Detailed technical designs are decoupled into their respective domain specification files within this directory, **sorted below from Least Code Impact (Quick Wins / UI additions) to Most Code Impact (Complex distributed systems)**.

---

## 📌 Active Specifications Index (Sorted by Code Impact: Low ➔ High)

| # | Impact | Specification | Domain | Description | Status |
| :---: | :---: | :--- | :--- | :--- | :--- |
| 1 | 🟢 Low-Med | **[Universal Pokémon Save Achievements (Gen 1–5)](pokemon-save-achievements.md)** | Achievements / Save Inspection | Real-time byte inspector for battery SRAM/Flash (`.sav`) across Gen 1–5 (GB, GBC, GBA, NDS) unlocking universal milestones: Starter, 8 Gym Badges, Victory Road, and League Champion. | 📋 Planned |
| 2 | 🟡 Medium | **[Mobile UI Gamepad & Spatial Navigation](mobile-gamepad-navigation.md)** | Mobile UX / Controls | Purpose-built, ergonomic 2D spatial gamepad navigation engine tailored specifically for mobile feeds, bottom sheets, search overlays, and drilldowns. | 📋 Planned |
| 3 | 🟡 Medium | **[3D Cartridge & Media Design Blueprint](cartridge-designs-spec.md)** | Theme Engine | Master geometric and CSS blueprint for all 10+ authentic physical cartridge shells (NES, SNES, N64, GBA, NDS, Genesis, GB, Game Gear, Atari, PS1) for future theme designs. | 📋 Planned |
| 4 | 🟡 Medium | **[Settings & Library Management Hub](settings-hub.md)** | System Hub & Tools | Clean console-native settings redesign: ROM library administration, BGM track manager, and IndexedDB storage diagnostics (wires into existing server REST endpoints). | 📋 Planned |
| 5 | 🟡 Medium | **[Dynamic Emulation Core Switching](emulation-core-switching.md)** | Core Emulation | Per-system and per-game WebAssembly core override engine (mGBA vs VBA-M, Gambatte vs SameBoy, Snes9x vs bsnes, Beetle PSX vs PCSX ReARMed). | 📋 Planned |
| 6 | 🟠 Med-High | **[Cross-Device Cloud Save Sync](cloud-saves.md)** | Save States & Sync | Bi-directional synchronization of single Quick Save / SRAM battery saves (`.sav`) to user Google Drive, S3/R2, or Supabase with conflict resolution dialog. | 📋 Planned |
| 7 | 🟠 Med-High | **[BYOS Cloud Storage Providers](byos-cloud-storage.md)** | Cloud & Streaming | Bring-Your-Own-Storage: Google Drive (OAuth2 PKCE) and Cloudflare R2 / AWS S3 client-side bucket streaming with zero server hosting or API costs. | 📋 Planned |
| 8 | 🔴 High | **[Self-Hosted Supabase & Multi-User Admin](self-hosted-user-management.md)** | Self-Hosted / Auth | Docker Supabase multi-user auth, first-run Super Admin onboarding wizard, and user role management portal (ROMs excluded from DB). | 📋 Planned |
| 9 | 🔴 High | **[Hardware 3D WebGL2 Upscaling](hardware-3d-upscaling.md)** | Core Rendering | Hardware-accelerated WebAssembly WebGL2 multi-core pipeline (melonDS HW, Beetle PSX HW, GlideN64, PPSSPP) with internal resolution scaling and PGXP geometry. | 📋 Planned |
| 10 | 🔴 High | **[WebRTC Netplay & P2P Multiplayer](multiplayer.md)** | Multiplayer & Social | Peer-to-peer online multiplayer room creation, low-latency DataChannels, and real-time input rollback synchronization. | 📋 Planned |

---

## 🛠️ Specification Guidelines

To add or update any future feature specification in `mirai/`, structure every document with four core sections:
1. **Description**: High-level problem statement and feature overview.
2. **Detailed List of What It Will Do**: Comprehensive user-facing and system capabilities.
3. **Detailed Logic Behind It**: Architecture design, data flows, protocols, and state handling.
4. **Detailed Guide of How to Set It Up**: Step-by-step developer integration instructions.

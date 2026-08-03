# Project Roadmap & Future Deliverables

This document tracks planned features, enhancements, and roadmap items for **retro-player**.

---

## 📌 Deliverables Checklist

- [ ] **RetroAchievements Support**
  - Integrate RetroAchievements API / Libretro / Emulator core integration to fetch and trigger achievements.
  - Display achievement badges, progress popups, and user profiles/stats.

- [ ] **In-Game Gamepad Support**
  - Web Gamepad API / native controller mappings for keyboard & virtual buttons.
  - Customizable button mapping / configuration UI for physical controllers.

- [ ] **Saves Import & Export Feature**
  - Export save states (`.state`) and SRAM/battery save files (`.sav` / `.srm`).
  - Import save files into the emulator instance from local file storage or cloud sync.
  - Backup and restore manager UI for game saves.

- [ ] **Discord Rich Presence (DRP)**
  - Display current game title, system/platform, elapsed play time, and high scores on Discord profile.
  - Integration with Electron / RPC socket or backend bridge.

- [ ] **Scrapers for Cover Art, Video Previews & Metadata**
  - Automatic metadata fetching (ScreenScraper, IGDB, or OpenVGDB API).
  - High-res box art, title screens, screenshots, game descriptions, release date, developer info, and gameplay preview videos.

# Project Roadmap & Future Deliverables

This document tracks planned features, enhancements, and roadmap items for **retro-player**.

---

## 📌 Deliverables Checklist

- [ ] **RetroAchievements Support**
  - Integrate RetroAchievements API / Libretro / Emulator core integration to fetch and trigger achievements.
  - Display achievement badges, progress popups, and user profiles/stats.

- [x] **In-Game Gamepad Support & Navigation**
  - Web Gamepad API integration for UI shell navigation (D-Pad, Left Stick, Shoulder buttons).
  - Dedicated controller exit shortcuts (`Select + Start`, `Guide/PS`, `L3 + R3`).
  - Hardware index lookup patch for Bluetooth/multi-controller support.
  - Live in-game button mapping engine in EmulatorJS Control Settings.
  - Glassmorphic On-Screen Virtual Keyboard with spatial D-Pad navigation and gamepad hotkey (`Y` / `Select`).

- [x] **Saves Battery & Export Feature**
  - Live save data detection (`IndexedDB` & `LocalStorage`) in game drawer.
  - Export save states (`.state`) and SRAM/battery save files (`.sav`) via the HUD action button.
  - Persistent save battery RAM automatically bound by unique game ID.

- [ ] **Discord Rich Presence (DRP)**
  - Display current game title, system/platform, elapsed play time, and high scores on Discord profile.
  - Integration with Electron / RPC socket or backend bridge.

- [ ] **Scrapers for Cover Art, Video Previews & Metadata**
  - Automatic metadata fetching (ScreenScraper, IGDB, or OpenVGDB API).
  - High-res box art, title screens, screenshots, game descriptions, release date, developer info, and gameplay preview videos.

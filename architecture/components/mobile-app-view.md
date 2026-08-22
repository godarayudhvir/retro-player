# Mobile Experience Architecture Specification (`MobileAppView.jsx`)

## 1. Description
The `MobileAppView` component delivers a clean, focused, **5-stage progressive mobile experience** specifically tailored for smartphones and compact touch devices (<= 768px in portrait). It features a streamlined topbar with circular action buttons (Search, Theme Studio, SFX, BGM, Load ROM), authentic vector console illustrations, neatly scaled 2-column 3D physical cartridges for Vanilla theme with zero cutouts, a 3-column square touch matrix for DS Touch theme, full app-level Light/Dark mode responsiveness, and full-screen detail stages.

---

## 2. Detailed List of What It Does
- **Streamlined Mobile Topbar**:
  - **Profile Icon** (left): Active Mii avatar, opens Profile Switcher.
  - **Action Button Group** (right):
    - 🔍 **Search Button**: Toggles expandable search bar with instant query filtering.
    - 🎨 **Theme Button**: Opens Theme Studio / Switcher Modal (Vanilla & DS Touch).
    - 🔊/🔇 **SFX Button**: Toggles Web Audio synthesized tactile UI sound effects (**off by default**).
    - 🎵 **BGM Button**: Toggles retro background music playback (**off by default**).
    - 📂 **Load Button**: Minimized icon-only button triggering local file picker for custom ROMs.

- **Stage 1: Choose Profile ("Who's Playing?")**:
  - Full-screen Mii avatar profile chooser with active badges, "+ Add Player", and avatar editor triggers.
  - Seamlessly transitions to Stage 2 once a profile is active.

- **Stage 2: Choose System (Console SVG Gallery)**:
  - Quick-access smart collection pills (⭐ Favorites, 🕒 Recently Played, 📚 All Games).
  - 2-column gallery of all available platforms (GBA, SNES, NES, NDS, Genesis, PS1, Arcade, etc.) displaying authentic console vector SVGs (`assets/platforms/*.svg`), system category labels, and navigation arrows without distracting count numbers.
  - Tapping any console transitions directly to Stage 3 for that platform.

- **Stage 3: Choose Game**:
  - **Vanilla Theme**: 2-column responsive cartridge grid (`.mobile-cartridges-2col-grid`) with fluid scaling constraints per console type (`max-width: 175px-185px`, `min-width: 0`, auto heights), guaranteeing zero clipping or cutouts of SNES, GBA, NES, N64, Genesis, GB/GBC, and NDS 3D cartridge molds, plastic ribs, and drop shadows.
  - **DS Touch Theme**: 3-column square beveled touch buttons matrix (`.mobile-ds-buttons-grid` with `.ds-touch-btn`), displaying clean square cover artwork/titles and favorite stars with zero physical cartridges.
  - Real-time instant search filter across all titles.
  - Tapping any game card opens Stage 4.

- **Stage 4: Shows Game Detail (Full-Screen Immersion Stage)**:
  - "← Back to Games" top navigation.
  - High-resolution cover art / screenshot hero header with gradient overlay.
  - System badge, release year, genre, and developer pills.
  - Full synopsis overview and game storyline.
  - Live **Battery Save RAM** status badge (`💾 Battery Save RAM Detected • Ready to Resume`).
  - Playtime analytics and sessions count.
  - Primary **`▶ PLAY GAME NOW`** action button.
  - Action toolbar: ⭐ Favorite, ✏️ Edit Metadata, 🔄 Scrape Art.

- **Stage 5: Plays Game (Full-Screen Emulation)**:
  - Tapping `PLAY GAME NOW` launches `EmulatorModal` in full-screen with virtual on-screen touch gamepad controls.

---

## 3. Theming & Color Modes
- **Vanilla Theme**: Clean porcelain-white console layout with 2-column responsive 3D physical cartridge models.
- **DS Touch Theme**: Nintendo DS touchscreen graph paper grid with silver beveled touch matrix buttons and dual-screen styling.
- **Light / Dark Mode**: Full app-level synchronization applying dark slate/midnight backgrounds (`#090d16` / `#1e293b`) and high-contrast typography across all mobile stages, navigation bars, cards, and modal drawers.

# 🎮 Retro Player

A modern, high-performance web-based retro game launcher and emulator library for classic retro console games. Built with React, Vite, and EmulatorJS, it features an intuitive console UI inspired by modern gaming handhelds with full Gamepad navigation support.

![Retro Player Interface](home.webp)

---

## ✨ Features


- 🕹️ **Multi-System Emulator Support**:
  - Game Boy (GB)
  - Game Boy Color (GBC)
  - Game Boy Advance (GBA)
  - Nintendo Entertainment System (NES)
  - Super Nintendo (SNES)
  - Nintendo 64 (N64)
  - Nintendo DS (NDS)
  - Sega Genesis / Mega Drive
  - PlayStation (PS1 / PSX)
  - Arcade (MAME)
- 💾 **Retro Cartridge UI System**:
  - Realistic 3D-styled physical retro game cartridge tiles with embossed headers, side grips, recessed sticker labels, dynamic sheen overlays, and system brand stamps.
  - Dynamic cartridge shell color customization based on game titles and platform themes.
- 🖼️ **Dynamic Cover Art Scanner**:
  - Automatically scans and pairs ROM files (`public/roms/*`) with local cover art images (`public/cover/*` and `public/assets/cover/*`).
  - Supports fuzzy title matching for automatic cover detection.
- 🎮 **Full Gamepad & Keyboard Navigation**:
  - Navigate game tiles using DPAD/Thumbstick or Keyboard Arrow keys.
  - Cycle through console categories using `L1`/`R1` shoulder buttons (or `Q`/`E` on keyboard).
  - Quick-launch games with `A` button or `Enter`.
- 📊 **Dynamic Console Sorting**:
  - Topbar navigation ribbon automatically sorts console systems by total game count (most titles first).
- 🚀 **Zero-Config ROM Drop-in**:
  - Automatically indexes ROMs placed in designated platform folders without requiring manual metadata entry.
- 📚 **Comprehensive System Architecture Specs**:
  - Complete architecture specifications under `architecture/` detailing core bootstrap, modules, components, and future feature designs ("Mirai").

---

## 📁 Directory Structure

```text
retro-player/
├── architecture/         # System Architecture & Technical Specifications
│   ├── README.md         # Guidelines, folder structure rules & doc standards
│   ├── core/             # Application entry point & React shell specs
│   ├── modules/          # Emulation engine, gamepad, catalog & console switcher specs
│   ├── components/       # UI modal, error boundary, CSS effects & game card specs
│   └── mirai/            # Future roadmap specifications (WebRTC Netplay, Cloud Saves)
├── public/
│   ├── cover/            # Custom cover art images by platform folder
│   │   ├── gb/
│   │   ├── gbc/
│   │   └── gba/
│   ├── roms/             # Drop your ROM files here organized by platform
│   │   ├── gb/
│   │   ├── gbc/
│   │   └── gba/
│   └── assets/           # System icons and fallback UI assets
├── src/
│   ├── components/
│   │   ├── EmulatorModal.jsx   # EmulatorJS integration & full-screen modal
│   │   └── ErrorBoundary.jsx   # Fatal runtime exception fallback component
│   ├── gameDescriptions.js     # Title metadata & release date lookup helper
│   ├── App.jsx           # Main Console Grid UI & Gamepad controls
│   ├── main.jsx          # React DOM root entry point
│   └── index.css         # Theme styles & grid design tokens
├── vite.config.js        # Multi-console scanner plugin & static file middlewares
└── package.json
```

---

## 📐 System Architecture Documentation (`/architecture`)

The project includes an organized [architecture/](architecture/README.md) specifications folder structured by domain scope:

- **[Guidelines & Standards](architecture/README.md)**: Rules for writing specs, sub-directory constraints, and feature proposal templates.
- **[Core Specifications](architecture/core/index.md)**: Entry point ([index.md](architecture/core/index.md)) and application shell ([app.md](architecture/core/app.md)).
- **[Functional Modules](architecture/modules/emulator.md)**: Emulator engine ([emulator.md](architecture/modules/emulator.md)), console switcher ([console-switcher.md](architecture/modules/console-switcher.md)), game catalog scanner ([game-catalog.md](architecture/modules/game-catalog.md)), and gamepad navigation ([gamepad-controls.md](architecture/modules/gamepad-controls.md)).
- **[UI Components](architecture/components/emulator-modal.md)**: Modal HUD ([emulator-modal.md](architecture/components/emulator-modal.md)), error boundary ([error-boundary.md](architecture/components/error-boundary.md)), retro CSS effects ([retro-effects.md](architecture/components/retro-effects.md)), and game cards ([game-card.md](architecture/components/game-card.md)).
- **[Mirai Future Features](architecture/mirai/multiplayer.md)**: Upcoming specifications for WebRTC P2P Multiplayer ([multiplayer.md](architecture/mirai/multiplayer.md)) and Cloud Save Sync ([cloud-saves.md](architecture/mirai/cloud-saves.md)).


---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+ recommended)
- **npm** or **yarn**

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd retro-player
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`.

---

## 🗂️ Adding ROMs & Cover Art

### Adding Games
Place your ROM files inside `public/roms/[system]/`:
- Example: `public/roms/gba/Super Mario Advance.zip`

### Adding Cover Art
Place corresponding cover images (`.png`, `.jpg`, `.jpeg`, `.webp`) inside `public/cover/[system]/`:
- Example: `public/cover/gba/Super Mario Advance.jpeg`

The server scanner will automatically index and link them on page reload or when clicking **Rescan Channels**.

---

## 🎮 Controls

| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| **Navigate Tiles** | Arrow Keys (`Up`, `Down`, `Left`, `Right`) | D-Pad / Left Stick |
| **Switch System Tab** | `Q` / `E` | `L1` / `R1` |
| **Launch Game** | `Enter` | `A` Button |
| **Close Emulator** | `Escape` | `B` Button |

---

## 🛠️ Built With

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [EmulatorJS](https://emulatorjs.org/)
- [Lucide React](https://lucide.dev/)

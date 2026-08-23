# Architecture Documentation & System Specifications

All architecture documentation files located within the `architecture/` directory serve as live technical design specifications and architectural blueprints for the **Retro Player** web application. They adhere strictly to unified documentation standards and must **NOT** contain historical commit logs, past version notes, or changelogs.

---

## Directory & File Organization Rule

To maintain clean repository hygiene, documentation files in `architecture/` **MUST** be organized into dedicated subdirectories based on their domain scope. Placing loose `.md` files directly in the `architecture/` root directory (other than `README.md`) is strictly prohibited.

The canonical folder structure for the `architecture/` directory is as follows:

```
architecture/
├── README.md               # Guidelines, folder structure rules, and documentation standards
│
├── core/                   # Core Application & Bootstrap
│   ├── index.md            # Entry point, React root mounting, and Vite configuration (`main.jsx`, `index.html`, `vite.config.js`)
│   └── app.md              # Main application shell, hook orchestration, and modular layout (`src/App.jsx`)
│
├── modules/                # Core Functional Modules & Systems
│   ├── api-specifications.md # Internal REST endpoints, external CDNs & Web APIs contracts (`server.js`, `vite.config.js`)
│   ├── device-detection.md # W3C matchMedia viewport detection & UI Display Mode override engine (`useDeviceDetection.js`)
│   ├── rom-manifest.md     # ROM catalog fetch, deduplication, filtering, sorting & custom ROM loading (`useRomManifest.js`)
│   ├── indexeddb-storage.md # Centralized IndexedDB permanent storage engine (`services/db.js`)
│   ├── emulator.md         # Emulator Engine integration, offline core resilience & save state management (`EmulatorModal.jsx`, EmulatorJS)
│   ├── metadata-scraper.md # Online 3D box art & game metadata scraper with IndexedDB caching (`metadataScraper.js`, `useMetadataScraper.js`)
│   ├── audio-sfx.md        # Pure Web Audio API UI sound effects synthesizer (`useWebAudioSfx.js`)
│   ├── bgm-engine.md       # Background Music (BGM) playback, track discovery & smart in-game pause (`useBgmEngine.js`)
│   ├── user-profiles.md    # Multi-User profiles & Multiavatar studio system (`useProfileManager.js`, `MultiAvatar.jsx`, `ProfileCreatorModal.jsx`)
│   ├── theme-engine.md     # Theme engine, Vanilla console styling & CSS custom properties (`useThemeEngine.js`, `index.css`)
│   ├── playtime-favorites.md # Smart Collections (Favorites & Recents) & Playtime analytics (`usePlaytimeAndFavorites.js`)
│   ├── console-switcher.md # Console system switching, smart collections filtering & tab ribbon (`SystemRibbon.jsx`)
│   ├── game-catalog.md     # Game database catalog, ROM path mapping & game descriptions (`gameDescriptions.js`, Vite API middleware)
│   ├── gamepad-controls.md  # Dynamic input controller, keyboard & USB gamepad mapping, hotkeys & shoulder button prompts (L/R vs Q/E)
│   └── pwa-service-worker.md # Progressive Web App (PWA), standalone installation & offline caching engine (`public/sw.js`, `usePwaInstall.js`)
│
├── components/             # System Controls & UI Components
│   ├── mobile-app-view.md  # Dedicated Netflix-style mobile feed & profile gateway (`MobileAppView.jsx`)
│   ├── topbar.md           # Console header HUD, profile avatar, BGM controls, scraper, theme studio & search (`Topbar.jsx`)
│   ├── confirm-modal.md    # Universal in-app confirmation dialog replacing native alerts & confirms (`ConfirmModal.jsx`)
│   ├── load-rom-modal.md   # In-app Load Custom ROM modal with drag-drop and supported formats (`LoadRomModal.jsx`)
│   ├── system-ribbon.md    # Category tab ribbon with dynamic game count sorting (`SystemRibbon.jsx`)
│   ├── cartridge-tile.md   # Physical 3D game cartridge component with sheen and color heuristics (`CartridgeTile.jsx`)
│   ├── cartridge-grid.md   # Theme-routing viewport: VanillaView shelf or DsView dual-screen layout (`CartridgeGrid.jsx`, `theme-views/`)
│   ├── game-detail-modal.md # Game drawer modal with metadata & save data detection (`GameDetailModal.jsx`)
│   ├── metadata-edit-modal.md # Jellyfin-style manual metadata editor for ROM hacks & homebrew (`MetadataEditModal.jsx`)
│   ├── scraper-modal.md    # Granular scraper scope selector: All / Single / Multi / Title (`ScraperModal.jsx`)
│   ├── theme-switcher-modal.md # Console Theme Studio: theme grid, light/dark switch, UI Display Mode picker (`ThemeSwitcherModal.jsx`)
│   ├── about-info-modal.md # Project about dialog and full controls reference table (`AboutInfoModal.jsx`)
│   ├── emulator-modal.md   # Emulator Modal UI dialog, status displays, HUD bar & isolated iframe engine (`EmulatorModal.jsx`)
│   ├── on-screen-keyboard.md # On-Screen Virtual Keyboard for gamepad/touch search entry (`OnScreenKeyboard.jsx`)
│   ├── onboarding-screen.md  # Full-screen responsive onboarding & personalization walkthrough (`OnboardingScreen.jsx`)
│   ├── error-boundary.md   # Error Boundary fallback UI & fatal exception handling (`ErrorBoundary.jsx`)
│   ├── demo-welcome-modal.md # GitHub Pages live demo showcase welcome dialog (`DemoWelcomeModal.jsx`)
│   └── retro-effects.md    # Custom Retro CSS effects, CRT scanlines, glassmorphism, background dots & UI animations (`index.css`)
│
└── mirai/                  # Future features and upcoming roadmap specifications ("Mirai" - 未来)
    ├── README.md           # Master Roadmap & Specifications Index
    ├── local-directory-library.md # Local Directory Mount & Client-Side Scraping (100% GitHub Pages offline)
    ├── byos-cloud-storage.md # Bring-Your-Own-Storage Cloud Providers (Google Drive PKCE / AWS S3 / Cloudflare R2)
    ├── cloud-saves.md      # Cross-Device Quick Save & Battery RAM Cloud Synchronization
    ├── self-hosted-user-management.md # Self-Hosted Docker Supabase Auth & Multi-User Admin
    ├── organic-achievements.md # Universal Organic Achievements & Trophy Cabinet
    ├── walkthrough-links-hub.md # Strategy Guides & Walkthrough Links Hub + Companion QR Code
    ├── settings-hub.md     # Settings & Library Management Hub Redesign
    └── multiplayer.md      # WebRTC Peer-to-Peer Netplay & local multiplayer emulation architecture
```

> **Note**: For the overarching future vision, in-depth codebase audit, refactoring matrix, and master innovation catalog across 8 domains, see [mirai/README.md](mirai/README.md). For device tier variations (Mobile vs Handheld vs Desktop vs TV), see [guides/device-experience-matrix.md](../guides/device-experience-matrix.md). For the curated non-commercial demo catalog, file paths, and creator compliance policy, see [guides/roms.md](../guides/roms.md). For automated ROM organization, cover conversion, and metadata sidecar generation pipelines, see the [update-roms skill](../.agents/skills/update-roms/SKILL.md) and [rom-cleanup skill](../.agents/skills/rom-cleanup/SKILL.md).

---

## Required Document Structure

Every `.md` documentation file inside `core/`, `modules/`, and `components/` must be structured using the following three core sections:

### 1. Description
- High-level overview of the feature or module.
- Purpose and context within the Retro Player system.
- Primary components, UI locations, and target user interactions.

### 2. Detailed List of What It Does
- Comprehensive itemization of all capabilities and functionality provided by the feature.
- User-facing actions, UI states, badges, triggers, and visual variations.
- Integration points with other modules, emulator cores, or file resources.

### 3. Detailed Logic Behind Everything and How It Works
- Complete technical breakdown of data flow, state management, and event handling.
- Key configuration objects, state hooks, props, and ROM/save file handling.
- Precise DOM element selectors (IDs, classes), lifecycle events, and conditional evaluation paths.
- Step-by-step execution flow for all states (e.g., library browsing, emulator loading, active gameplay, error fallbacks).

---

## Future Specifications Directory (`/architecture/mirai`)

The `architecture/mirai/` directory serves as the designated workspace for documenting upcoming, planned, and future feature designs ("Mirai" - 未来).

### Required Structure for `mirai/` Specification Files

Every feature proposal inside `/architecture/mirai/` must include four mandatory sections:

1. **Description**: Clear overview of the proposed future feature, its user value, and target use cases.
2. **Detailed List of What It Will Do**: Complete breakdown of intended capabilities, user interactions, UI design specifications, and feature scope.
3. **Detailed Logic Behind It**: Comprehensive architectural design detailing planned data flows, network/storage protocols, state management, and core emulation integration mechanics.
4. **Detailed Guide of How to Set It Up**: Step-by-step setup, dependency installation, API/network setup, and execution instructions for developers implementing the feature.

---

## 📌 Deliverables Roadmap & Master Vision

For tracking deliverables, completed milestones, architectural audits, and the grand vision, refer to the master blueprint in [mirai/README.md](mirai/README.md).

---

## Writing Rules & Constraints

- **Directory Organization Rule**: All new architecture docs must be placed inside the appropriate subdirectory (`core/`, `modules/`, `components/`, or `mirai/`). Do not create loose documentation files in the `architecture/` root.
- **No Changelogs / No Historical Notes**: Never include section history like "Previously X was Y...". Document strictly how the feature works in its current state.
- **Code & Selector Precision**: Always specify exact HTML IDs, React component names, CSS utility classes, and source code locations (e.g., [App.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/App.jsx), `#game`, `.emulator-backdrop-iisu`, `.shoulder-btn`).
- **Completeness**: Avoid vague summaries or hand-waving. Detail full conditional flows, event listener lifecycles, and component state transitions.

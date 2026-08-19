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
│   └── app.md              # Main application shell, view routing, layout, and state orchestration (`src/App.jsx`)
│
├── modules/                # Core Functional Modules & Systems
│   ├── emulator.md         # Emulator Engine integration, canvas rendering, save state management & controls (`EmulatorModal.jsx`, EmulatorJS)
│   ├── console-switcher.md # Console system switching, filtering & tab navigation logic (GBA, N64, SNES, NES, NDS, PS1, Arcade, Sega)
│   ├── game-catalog.md     # Game database catalog, ROM path mapping, cover art matching & game descriptions (`gameDescriptions.js`, Vite API middleware)
│   └── gamepad-controls.md  # Dynamic input controller, keyboard & USB gamepad mapping, hotkeys & shoulder button prompts (L/R vs Q/E)
│
├── components/             # System Controls & UI Components
│   ├── emulator-modal.md   # Emulator Modal UI dialog, status displays, HUD bar & isolated iframe engine (`EmulatorModal.jsx`)
│   ├── on-screen-keyboard.md # On-Screen Virtual Keyboard for gamepad/touch search entry (`OnScreenKeyboard.jsx`)
│   ├── error-boundary.md   # Error Boundary fallback UI & fatal exception handling (`ErrorBoundary.jsx`)
│   ├── retro-effects.md    # Custom Retro CSS effects, CRT scanlines, glassmorphism, background dots & UI animations (`index.css`)
│   └── game-card.md        # Game Card UI grid component, cover art hover effects, cartridge color dynamics & quick-launch triggers (`src/App.jsx`)
│
└── mirai/                  # Future features and upcoming roadmap specifications ("Mirai" - 未来)
    ├── multiplayer.md      # WebRTC Peer-to-Peer Netplay & local multiplayer emulation architecture
    └── cloud-saves.md      # Cloud save state synchronization & cross-device backup architecture
```

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

## 📌 Deliverables Roadmap

For tracking planned deliverables (RetroAchievements, In-Game Gamepad, Saves Import/Export, Discord Rich Presence, and Metadata Scrapers), refer to [ROADMAP.md](../ROADMAP.md).

---

## Writing Rules & Constraints

- **Directory Organization Rule**: All new architecture docs must be placed inside the appropriate subdirectory (`core/`, `modules/`, `components/`, or `mirai/`). Do not create loose documentation files in the `architecture/` root.
- **No Changelogs / No Historical Notes**: Never include section history like "Previously X was Y...". Document strictly how the feature works in its current state.
- **Code & Selector Precision**: Always specify exact HTML IDs, React component names, CSS utility classes, and source code locations (e.g., [App.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/App.jsx), `#game`, `.emulator-backdrop-iisu`, `.shoulder-btn`).
- **Completeness**: Avoid vague summaries or hand-waving. Detail full conditional flows, event listener lifecycles, and component state transitions.

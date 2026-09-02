# Universal Accessibility & Multimodal Navigation Guide

Retro Player is engineered for **100% universal accessibility across all input devices**. Every screen, flow, modal dialog, and interactive component is built to be equally navigable and operable via **physical gamepads**, **hardware keyboards**, and **touch screens**, with zero dependency on mouse pointers.

---

## 1. Input Architecture & Dynamic Heuristics

Retro Player implements an adaptive tri-modal input detection engine that dynamically identifies the user's active input device and updates the user interface in real time:

```
                  ┌───────────────────────────────┐
                  │    Active Input Detection     │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Gamepad Mode   │    │  Keyboard Mode   │    │    Touch Mode    │
│  USB / Bluetooth │    │ Desktop / Laptop │    │ Phone / Tablet   │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ Shows [A] [B] [X]│    │ Shows [SPACE]    │    │ Hides all keycap │
│ L1/R1, D-Pad rings│    │ [DEL] [ESC] [Q/E]│    │ badges; clean,   │
│ & 2D spatial nav │    │ & Arrow spatial  │    │ uncluttered touch│
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Input Mode Rules:
1. **Gamepad Mode**: Activated automatically when any connected USB, Bluetooth, or 2.4GHz controller presses a button or moves an analog stick. All interactive action buttons display console-grade controller keycap badges (`[ A ]`, `[ B ]`, `[ X ]`, `[ L1 ]`, `[ R1 ]`, `[ START ]`).
2. **Keyboard Mode**: Activated on devices with fine pointer devices (desktop/laptop) or immediately when any keyboard key is pressed. Interactive buttons display keyboard shortcut badges (`[ SPACE ]`, `[ DEL ]`, `[ ESC ]`, `[ Q ]`, `[ E ]`, `[ L ]`).
3. **Touch Mode**: Activated when pointer input originates from a capacitive touchscreen. All button badges are cleanly removed from the DOM so the interface remains uncluttered, touch-friendly, and lightweight.

---

## 2. Onboarding Controls Specification (Current Implementation)

The Onboarding experience introduces players to Retro Player and configures their initial passport profile. Both desktop and mobile viewports are fully operable across all three input modes.

### A. Desktop Onboarding Wizard

| Phase | Gamepad Action | Keyboard Key | Touch / Pointer | Function |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Welcome & Overview** | `D-Pad` / `Left Stick` | `Arrow Keys` / `Tab` | Direct Tap | Move focus between "Skip to Games" and "Create Character" |
| | `[ A ]` Button | `Space` / `Enter` | Tap Button | Advance to Phase 2 ("Create Character") |
| | `START` Button | `Escape` | Tap Skip | Skip onboarding immediately and boot into the library |
| **Phase 2: Character Studio** | Focus starts on `Randomize` | Focus starts on `Randomize` | Tap Dice | Immediate roll of randomized avatar and name |
| | `L1` (Left Bumper) | `Q` | Tap Archetypes Tab | Switch to Archetypes selection deck |
| | `R1` (Right Bumper) | `E` | Tap Custom Tab | Switch to Custom Name & Color palette deck |
| | `D-Pad` / `Left Stick` | `Arrow Keys` | Tap Cards / Inputs | 2D spatial navigation across all 48 archetype cards, color circles, and name input |
| | `[ A ]` Button | `Enter` | Tap Item | Select focused avatar, pick color, or roll dice |
| | `[ A ]` on "Continue" | `Space` / `Enter` | Tap Continue | Save passport profile and advance to Phase 3 |
| **Phase 3: Interactive Visualizer** | Controller Buttons & Sticks | Keyboard Keys | Tap Virtual Controller | Live vector DualShock schematic highlights active inputs with Web Audio SFX |
| | `START` Button | `Escape` / `Space` | Tap Finish | Complete onboarding and launch into game library |

---

### B. Mobile Onboarding Wizard (Screens 0 through 6)

| Screen | Gamepad Action | Keyboard Key | Touch / Gesture | Function |
| :--- | :--- | :--- | :--- | :--- |
| **Screen 0: Welcome Poster** | `D-Pad` / `Left Stick` | `Arrow Keys` | Tap / Swipe | Move focus between Skip button and "Get Started" |
| | `[ A ]` Button | `Space` / `Enter` | Tap "Get Started" | Begin onboarding flow |
| | `START` Button | `Escape` | Tap "Skip" | Skip directly to game library |
| **Screens 1–4: Feature Showcases** | `[ A ]` Button | `Space` / `Enter` | Tap Continue | Advance to next showcase screen |
| | `[ B ]` Button | `Delete` / `Backspace` | Tap Back | Return to previous screen |
| | `START` Button | `Escape` | Tap Skip | Skip remaining tour to library |
| | `D-Pad Up/Down` / `Stick` | `Arrow Up / Down` | Vertical Swipe | Scroll long card content smoothly |
| **Screen 5: Create Character** | Focus starts on `Randomize` | Focus starts on `Randomize` | Tap Dice | Roll dice for instant avatar and name |
| | `L1` (Left Bumper) | `Q` | Tap Archetypes Tab | Switch to Archetypes tab |
| | `R1` (Right Bumper) | `E` | Tap Custom Tab | Switch to Custom tab |
| | `D-Pad` / `Left Stick` | `Arrow Keys` | Tap Elements | Full 2D spatial navigation across 48 avatars, color circles, and inputs |
| | `[ A ]` Button | `Enter` | Tap Item | Select avatar preset or pick color |
| | `[ A ]` on "Ready" | `Space` / `Enter` | Tap Ready | Advance to Screen 6 |
| | `[ B ]` Button | `Delete` / `Backspace` | Tap Back | Return to Screen 4 |
| **Screen 6: You're All Set!** | `D-Pad` / `Left Stick` | `Arrow Keys` | Direct Tap | 2D spatial navigation across "Load ROMs" card, "Explore Library", "Back", and "Skip" |
| | `[ X ]` Button | `L` Key | Tap Load Card | Direct shortcut from anywhere to open Load ROM modal |
| | `[ A ]` Button | `Space` / `Enter` | Tap Explore | Launch directly into game library |
| | `[ B ]` Button | `Delete` / `Backspace` | Tap Back | Return to Screen 5 |
| | `START` Button | `Escape` | Tap Skip | Skip to game library |

---

## 3. Modal Dialogs: Custom ROM Ingestion (`LoadRomModal`)

The **Load Custom ROM or Folder** modal dialog enforces strict input trapping and provides console-grade accessibility:

```
┌─────────────────────────────────────────────────────────────┐
│  Load Custom ROM or Folder                            [✕]   │ ◄── Auto-Scroll Reset Target
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     [Upload Icon]                     │  │
│  │             Drag & Drop ROMs or Folder here           │  │
│  │                                                       │  │
│  │     [ Choose File(s) ]      [ Choose ROMs Folder ]    │  │ ◄── 2D Spatial Primary Actions
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Pro Tip: Selecting a specific system folder loads fast...  │
│                                                             │
│  🎮 Supported Console Formats                               │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │ GBA (.gba)│ │ GB (.gb)  │ │ GBC (.gbc)│ │ NES (.nes)│   │ ◄── 12 Spatial Platform Chips
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤   │     Navigable to the bottom
│  │ SNES(.sfc)│ │ N64 (.z64)│ │ NDS (.nds)│ │ PS1 (.iso)│   │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤   │
│  │ Genesis   │ │ Game Gear │ │ Arcade    │ │ Atari 2600│   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
└─────────────────────────────────────────────────────────────┘
```

| Element / Target | Gamepad Action | Keyboard Key | Function |
| :--- | :--- | :--- | :--- |
| **Default Initial Focus** | Focus starts on `Choose File(s)` | Focus starts on `Choose File(s)` | Instant accessibility without prior mouse movement |
| **Spatial Navigation** | `D-Pad` / `Left Stick` (All Directions) | `Arrow Keys` (Up, Down, Left, Right) | Moves between Close (✕), Choose File(s), Choose ROMs Folder, and all 12 platform chips |
| **Auto-Scroll to Bottom** | `D-Pad Down` from folder button | `Arrow Down` from folder button | Moves focus into platform chips and smoothly scrolls modal body down |
| **Auto-Scroll to Top** | `D-Pad Up` to `Choose File(s)` or `[✕]` | `Arrow Up` to `Choose File(s)` or `[✕]` | Automatically resets modal body scroll position to top (0px) so the upper dropzone is fully visible |
| **Confirm Action** | `[ A ]` Button | `Space` / `Enter` | Opens native file/folder picker, or filters file picker by focused platform extension |
| **Exit / Dismiss** | `[ B ]` Button | `Escape` Key | Closes the modal from anywhere with modal close SFX |
| **Visual Indicators** | High-contrast `[ A ]` badge | High-contrast `[ SPACE ]` badge | Custom palette (`#1d4ed8` on blue / `#7e22ce` on purple) for 100% legibility |

---

## 4. Phased Accessibility Roadmap

Accessibility across Retro Player is rolled out in structured engineering phases:

### Phase 1: Onboarding & Modal Dialogs (✅ Current — Completed)
- [x] Desktop Onboarding Wizard 100% accessible via Keyboard and Gamepad.
- [x] Mobile Onboarding Screens 0 through 6 with tri-modal adaptive badges and spatial navigation.
- [x] Load ROM / Custom Ingestion Modal with 2D spatial grid, smooth scrolling, and scroll reset.
- [x] Strict modal input isolation preventing background interaction during active dialogs.

### Phase 2: Main Application UI Navigation (📋 Next Phase)
- [ ] **System Ribbon**: Bumper navigation (`L1` / `R1`) and keyboard (`[` / `]` or `Q` / `E`) to cycle active console platforms with animated slide transitions.
- [ ] **Cartridge Library Grid**: Full 2D bounding-box spatial navigation (`UP`, `DOWN`, `LEFT`, `RIGHT`) across cartridge cards with smooth container auto-scroll.
- [ ] **Topbar Controls**: Accessible access to Search (`/`), BGM Drawer (`M`), Settings Hub, and Hall of Fame (`H`).
- [ ] **Game Detail Modal & Save Data Studio**: Full keyboard and controller navigation across in-cartridge tabs (`Overview`, `Saves & SRAM`, `Walkthrough`, `Edit & Scrape`).

### Phase 3: Mobile Application UI Navigation (📋 Upcoming Phase)
- [ ] Horizontal system chip carousels with centered auto-scroll on focus.
- [ ] Mobile bottom sheets with primary action default focus and D-Pad Left/Right secondary actions.
- [ ] Search overlay and filter trays with on-screen virtual keyboard (OSK) navigation.

### Phase 4: In-Game Emulator Controls & Hotkey Harmonization (📋 Final Phase)
- [ ] Unification of emulator hotkeys across all 12 WebAssembly emulation cores.
- [ ] In-game HUD menu navigation via `L3` / `Tab`.
- [ ] Safe emergency exit combinations (`L3 + R3` / `Escape`) with auto-save SRAM flush.
- [ ] Custom controller button remapping persistence in IndexedDB.

---

## 5. Architectural Quality Standards

1. **Zero Native Browser Popups**: Native dialogs (`alert()`, `confirm()`, `prompt()`) block the browser thread and cannot be controlled via gamepads. All prompts use custom styled DOM modals with 100% spatial focus management.
2. **Deterministic Focus Visibility**: Every navigable element declares an explicit `.gamepad-focused` CSS ring with contrast-compliant luminous borders (minimum 4.5:1 WCAG contrast ratio).
3. **Declarative Markup**: All navigable elements use `data-nav="<zone>"` and `data-nav-id="<unique-id>"` attributes, decouped from presentation CSS classes.
4. **Touch Cleanliness**: Virtual badges are strictly hidden during touch sessions, keeping touch target hitboxes unobstructed and authentic.

# 🎮 Controls, Keybindings & Accessibility Guide

Retro Player is engineered from the ground up for **100% universal accessibility across all input devices**. Every screen, flow, modal dialog, and in-game menu can be navigated seamlessly via **physical gamepads**, **hardware keyboards**, and **touch screens**, with zero dependency on mouse pointers.

---

## 🕹️ Tri-Modal Input Architecture & Heuristics

Retro Player features an adaptive tri-modal input detection engine that dynamically identifies the user's active input device and updates the user interface in real time:

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
│ L1/R1, D-Pad     │    │ [DEL] [ESC] [Q/E]│    │ badges; clean,   │
│ focus rings      │    │ & Arrow spatial  │    │ uncluttered touch│
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Dynamic Input Heuristics:
1. **Gamepad Mode**: Activated automatically when any connected USB, Bluetooth, or 2.4GHz controller presses a button or moves an analog stick. All interactive action buttons display console-grade controller keycap badges (`[ A ]`, `[ B ]`, `[ X ]`, `[ L1 ]`, `[ R1 ]`, `[ START ]`).
2. **Keyboard Mode**: Activated on devices with fine pointer devices (desktop/laptop) or immediately when any keyboard key is pressed. Interactive buttons display keyboard shortcut badges (`[ SPACE ]`, `[ DEL ]`, `[ ESC ]`, `[ Q ]`, `[ E ]`, `[ L ]`).
3. **Touch Mode**: Activated when pointer input originates from a capacitive touchscreen. All button badges are cleanly removed from the DOM so the interface remains uncluttered, touch-friendly, and lightweight.

---

## 🕹️ Gamepad Button Mapping

Retro Player supports standard USB, Bluetooth, and 2.4GHz wireless controllers (Xbox, PlayStation DualShock/DualSense, Nintendo Switch Pro Controller, Steam Deck, 8BitDo, and generic D-Input/X-Input gamepads).

### Standard Layout Legend

| Standard / Xbox | PlayStation | Nintendo Switch | Primary Function |
| :---: | :---: | :---: | :--- |
| **`A`** | **`✕` Cross** | **`B`** | **Select / Confirm / Launch Game** |
| **`B`** | **`○` Circle** | **`A`** | **Back / Cancel / Close Modal** |
| **`X`** | **`□` Square** | **`Y`** | **Open Metadata Scraper** (Library) / **Start/Confirm** (Scraper) / **Backspace** (OSK) |
| **`Y`** | **`△` Triangle** | **`X`** | **Open Search Virtual Keyboard** (Library) / **Space** (OSK) |
| **`LB` / `L1`** | **`L1`** | **`L`** | **Previous System** (Ribbon) / **Previous Tab** (Modals) / **Clear All** (OSK) |
| **`RB` / `R1`** | **`R1`** | **`R`** | **Next System** (Ribbon) / **Next Tab** (Modals) / **Submit** (OSK) |
| **`D-Pad` / `Left Stick`** | **`D-Pad` / `Left Stick`** | **`D-Pad` / `Left Stick`** | **Spatial Navigation** across grid cards and UI buttons |
| **`L3` (Left Stick Click)** | **`L3`** | **`L3`** | **Cycle Tile Size Density** (`S` $\rightarrow$ `M` $\rightarrow$ `L` $\rightarrow$ `XL` $\rightarrow$ `XXL`) in Library / **Toggle In-Game Topbar HUD Menu** (In-Game) |
| **`R3` (Right Stick Click)** | **`R3`** | **`R3`** | **Toggle Panoramic Wide Grid Mode** (Library) |
| **`L3 + R3` (Both Clicks)** | **`L3 + R3`** | **`L3 + R3`** | **Direct Exit Active Game to Library** (In-Game) |
| **`Touchpad / Click`** | **`Touchpad`** | **`Touch Screen`** | **NDS Stylus & Touch Screen Input** (Nintendo DS Emulation) / Interactive Visualizer |
| **`Select` / `Share`** | **`Share` / `Select`** | **`-` Minus** | **Toggle Favorite ⭐** (Library) / Standard Game Input (In-Game) |
| **`Start` / `Menu`** | **`Options` / `Start`** | **`+` Plus** | **Quick-Launch Game** (Library) / **Submit** (OSK) / **Complete Onboarding** / Standard Game Input (In-Game) |

---

## 🚀 Onboarding & Modal Dialog Controls (Fully Implemented)

Retro Player features 100% controller, keyboard, and touch accessibility across both Desktop and Mobile Onboarding wizards and in-app modal dialogs.

### A. Desktop Onboarding Wizard
| Screen / Phase | Gamepad Action | Keyboard Key | Function |
| :--- | :--- | :--- | :--- |
| **Phase 1: Welcome & Overview** | `D-Pad` / `Left Stick` | `Arrow Keys` | Move focus between "Skip to Games" and "Create Character" |
| | `[ A ]` Button | `Space` / `Enter` | Advance to Phase 2 ("Create Character") |
| | `START` Button | `Escape` | Skip onboarding immediately and boot into library |
| **Phase 2: Character Studio** | Focus starts on `Randomize` | Focus starts on `Randomize` | Immediate roll of randomized avatar and name |
| | `L1` (Left Bumper) | `Q` | Switch to Archetypes tab |
| | `R1` (Right Bumper) | `E` | Switch to Custom Name & Color tab |
| | `D-Pad` / `Left Stick` | `Arrow Keys` | 2D spatial navigation across 48 avatars, color circles, and inputs |
| | `[ A ]` Button | `Enter` | Select archetype preset, pick color, or roll dice |
| | `[ A ]` on "Continue" | `Space` / `Enter` | Save passport profile and advance to Phase 3 |
| **Phase 3: Interactive Visualizer** | Controller Buttons & Sticks | Keyboard Keys | Live vector DualShock schematic highlights active inputs with Web Audio SFX |
| | `START` Button | `Escape` / `Space` | Complete onboarding and launch into the game library |

### B. Mobile Onboarding Wizard (Screens 0 through 6)
| Screen | Gamepad Action | Keyboard Key | Function |
| :--- | :--- | :--- | :--- |
| **Screen 0: Welcome Poster** | `[ A ]` Button | `Space` / `Enter` | Begin onboarding flow ("Get Started") |
| | `START` Button | `Escape` | Skip directly to game library |
| **Screens 1–4: Feature Showcases** | `[ A ]` Button | `Space` / `Enter` | Advance to next showcase screen ("Continue") |
| | `[ B ]` Button | `Delete` / `Backspace` | Return to previous screen ("Back") |
| | `START` Button | `Escape` | Skip remaining tour directly to library |
| | `D-Pad Up/Down` / `Stick` | `Arrow Up / Down` | Scroll long card content smoothly |
| **Screen 5: Create Character** | Focus starts on `Randomize` | Focus starts on `Randomize` | Roll dice for instant avatar and name |
| | `L1` (Left Bumper) | `Q` | Switch to Archetypes tab |
| | `R1` (Right Bumper) | `E` | Switch to Custom tab |
| | `D-Pad` / `Left Stick` | `Arrow Keys` | Full 2D spatial navigation across 48 avatars and color circles |
| | `[ A ]` on "Ready" | `Space` / `Enter` | Advance to Screen 6 |
| | `[ B ]` Button | `Delete` / `Backspace` | Return to Screen 4 |
| **Screen 6: You're All Set!** | `D-Pad` / `Left Stick` | `Arrow Keys` | Spatial navigation between Load ROMs card, Explore Library, Back, and Skip |
| | `[ X ]` Button | `L` Key | Direct shortcut from anywhere to open Load ROM modal |
| | `[ A ]` Button | `Space` / `Enter` | Launch directly into game library |
| | `[ B ]` Button | `Delete` / `Backspace` | Return to Screen 5 |

### C. Load Custom ROM or Folder Modal (`LoadRomModal`)
| Element / Action | Gamepad Action | Keyboard Key | Function |
| :--- | :--- | :--- | :--- |
| **Initial Focus** | Focus starts on `Choose File(s)` | Focus starts on `Choose File(s)` | Ready for immediate confirmation |
| **Spatial Navigation** | `D-Pad` / `Left Stick` | `Arrow Keys` | Moves between Close (✕), Choose File(s), Choose ROMs Folder, and all 12 platform chips |
| **Confirm Action** | `[ A ]` Button | `Space` / `Enter` | Trigger focused button or open platform-filtered file picker |
| **Exit / Dismiss** | `[ B ]` Button | `Escape` | Closes modal and returns to previous view with audio SFX |
| **Auto-Scroll Reset** | Navigating to `[✕]` or top buttons | Navigating to `[✕]` or top buttons | Automatically resets scroll to top (0px) so dropzone is 100% visible |

---

## 🗺️ Phased Accessibility & Navigation Roadmap

To guarantee deterministic, bug-free spatial navigation without ghost coordinates or trapped focus, application UI controls are being rolled out across structured engineering milestones:

| Phase | Domain | Status | Scope |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Onboarding & Modals** | ✅ **Completed** | Desktop Onboarding, Mobile Onboarding (Screens 0–6), and Load Custom ROM modal with tri-modal adaptive badges and auto-scroll reset. |
| **Phase 2** | **Desktop Library UI** | 📋 **Next Up** | Bounding-box 2D navigation across Cartridge Grid, System Ribbon (`Q`/`E`, `[`/`]`, `L1`/`R1`), Search (`/`), and Topbar Hub. |
| **Phase 3** | **Mobile Library UI** | 📋 **Upcoming** | System chip carousels, mobile bottom sheets, and search overlays. |
| **Phase 4** | **Emulator Harmonization**| 📋 **Upcoming** | Unifying in-game hotkeys, HUD actions (`L3`/`Tab`), and custom gamepad mapping persistence across all 12 WASM cores. |

---

## 📺 Dashboard & Cartridge Library Controls

| Gamepad Button | Keyboard Key | Action |
| :--- | :--- | :--- |
| **`D-Pad` / `Left Stick`** | **`Arrow Keys`** | Move focus between cartridge cards and topbar icons |
| **`[A]` Button** | **`Enter` / `Space`** | Launch highlighted game cartridge |
| **`START` Button** | **`Enter`** | **Quick-Launch Highlighted Game Immediately** |
| **`SELECT` Button** | **`F`** | **Toggle Favorite ⭐ on Highlighted Game** |
| **`[Y]` Button** | **`/` (Slash) or `S`** | Open Search virtual keyboard |
| **`[X]` Button** | **`M`** | Open Scraper Modal |
| **`Trophy` (Topbar)** | **`H`** | **Open Hall of Fame & Trophy Cabinet** |
| — | **`T`** | **Toggle Light / Dark Mode** |
| **`[L]` / `[R]` Bumpers** | **`[` and `]`** | Cycle active platform console on System Ribbon |
| **`[B]` Button** | **`Escape`** | Close open modals, drawers, or reset focus |

> [!NOTE]
> **Modal Input Isolation**: When an in-app modal (e.g. Load Custom ROM, Scraper, Backup & Restore, Trophy Cabinet, or About) is open, all keyboard hotkeys and gamepad spatial navigation are strictly trapped within the active dialog to prevent background UI changes or unintended game launches.

---

## 🕹️ In-Game Controls & Gestures

When a game is running in the emulator core:

| Gesture / Shortcut | Action | Description |
| :--- | :--- | :--- |
| **Auto-Hiding In-Game Toolbar** | **Fullscreen Immersion** | Slides off-screen after 3.5s of inactivity to give full 100% viewport height to the game. |
| **`⌄ MENU` Pull-Tab (Mobile / Touch)** | **Reveal In-Game Menu** | Semi-transparent floating pill at top edge. Tap to instantly slide the toolbar down. |
| **`Tab` or `` ` `` / `~` (Keyboard)** | **Toggle Topbar HUD** | Instantly toggles toolbar visibility on/off during gameplay. |
| **Mouse Hover (Top 50px)** | **Reveal In-Game Menu** | Moving the mouse cursor to the top edge of the window reveals the toolbar smoothly. |
| **`L3` (Left Stick Click)** | **Toggle Topbar HUD** | Opens the in-game action menu starting at **`Restart`**. Use D-Pad to select options. |
| **`L3 + R3` (Thumbstick Clicks)** | **Exit Game** | Flushes battery save, captures Slot 1 auto-resume state, and returns to library. |
| **Mobile Left Edge-Swipe** | **Exit Game (Mobile)** | Triggers the graceful 450ms flush & exit sequence with automatic save persistence. |
| **`[A]` Button / `Enter`** (on Resume Prompt) | **Auto-Resume** | Instantly restores Slot 1 snapshot state where you left off. |
| **`[B]` Button / `Esc`** (on Resume Prompt) | **Dismiss Prompt** | Starts the game from the intro/title screen. |
| **`[A]` Button** (in HUD) | **Activate Option** | Triggers the selected HUD action (**Restart**, **Pause**, **Mute**, **Record**, **Speed**, **Capture**, **Filter**, **Save**, **Load**, **Diagnostics**, **Exit**). |
| **`[B]` / `L3`** (in HUD) | **Resume Gameplay** | Dismisses the topbar and restores focus to gameplay. |
| **`Select` & `Start`** | **Game Inputs** | Untouched and reserved exclusively for games (e.g. Pause, Inventory, Coin insert). |

---

## 📱 Mobile On-Screen Virtual Controls

For touch-screen devices, Retro Player renders system-adaptive, zero-latency virtual gamepads:

- **Nintendo 64 (N64)**: Features dedicated ergonomic clusters elevated in the lower black letterbox area:
  - **Left Cluster**: Dual analog thumbstick and D-pad.
  - **Triggers**: Split `L` and `Z` triggers on the left bumper deck with `R` on the right bumper deck.
  - **Right Cluster**: Yellow C-buttons (`CU, CD, CL, CR`) positioned above primary `A` (blue) and `B` (green) action buttons.
- **Classic Systems (GB, GBA, NES, SNES, Genesis, PS1, NDS, Arcade)**: Standard low-profile dual/quad button ergonomics tailored for thumb reach.
- **Smart Input Detection & Auto-Hide**: Virtual on-screen touch controls automatically disappear whenever a physical gamepad/controller is connected or whenever physical keyboard keystrokes are pressed (preventing screen clutter on 2-in-1s, touchscreen laptops, and tablet keyboards). Tapping or touching the screen immediately restores the on-screen touch controls.

---

## ⌨️ On-Screen Virtual Keyboard (OSK)

When searching or typing character handles with a controller:

| Gamepad Button | Keyboard Equivalent | Function |
| :--- | :--- | :--- |
| **`D-Pad` / `Left Stick`** | **`Arrow Keys`** | Navigate keys on the virtual keyboard |
| **`[A]` Button** | **`Enter`** | Type the focused character |
| **`[X]` Button** | **`Backspace`** | Clear previous character (⌫) |
| **`[Y]` Button** | **`Space`** | Insert space (␣) |
| **`[L]` Bumper** | **`Ctrl + A, Backspace`** | Clear all text |
| **`[R]` Bumper** / **`Start`** | **`Enter` (Submit)** | Submit and save text |
| **`[B]` Button** | **`Escape`** | Cancel and restore original text |

---

## 🔍 Metadata Scraper Modal Controls

| Gamepad Button | Keyboard Equivalent | Function |
| :--- | :--- | :--- |
| **`[L]` / `[R]` Bumpers** | **`[` and `]`** | Switch between **"All Systems"** and **"Single System"** tabs |
| **`[X]` Button** | **`Enter`** | **Start Scraping** / **Confirm & Start** / **Scrape Again** |
| **`[B]` Button** | **`Escape`** | Cancel and close modal / Return from prompt |
| **`D-Pad Up / Down`** | **`Up / Down`** | Select platform chips or individual ROM items |

---

## 🏆 Trophy Cabinet & Achievements Modal Controls

| Gamepad Button | Keyboard Equivalent | Function |
| :--- | :--- | :--- |
| **`D-Pad / Left Stick`** | **`Arrow Keys`** | 2D spatial navigation across achievement cards |
| **`[L1] / [R1]` Bumpers** | **`Q / E` or `PageUp / PageDown`** | Cycle status filter (**All** $\leftrightarrow$ **Unlocked** $\leftrightarrow$ **Locked**) |
| **`[L2] / [R2]` Triggers** | **`[` and `]`** | Cycle achievement categories (Progress, Mastery, Dedication, etc.) |
| **`[B]` Button** | **`Escape`** | Close Trophy Cabinet and restore focus to Topbar Trophy icon |

---

## ⌨️ Global Keyboard Hotkeys Reference

| Key | Description |
| :--- | :--- |
| **`Arrow Keys`** | Spatial navigation across cards and buttons |
| **`Enter`** | Select / Launch / Activate |
| **`Escape`** | Close modal / Back to library |
| **`/` (Slash)** | Focus search bar or open Search OSK |
| **`F`** | Toggle Fullscreen mode |
| **`M`** | Toggle Background Music (BGM) |
| **`1` - `9`** | Quick switch console system tabs |

---

## 🕹️ Core-Specific In-Game Keyboard Controls (12 Cores)

When launching a game without a connected gamepad, Retro Player displays a **10-Second Pre-Launch Keyboard Controls Splash** indicating default EmulatorJS key bindings:

| Console Core | Movement | Face / Action Buttons | Shoulders / Triggers | Start / Select / Special |
| :--- | :--- | :--- | :--- | :--- |
| **NES** | `Arrow Keys` | `Z` (B), `X` (A) | — | `Shift` (Select), `Enter` (Start) |
| **Super Nintendo (SNES)** | `Arrow Keys` | `Z` (B), `X` (A), `A` (Y), `S` (X) | `Q` (L), `W` (R) | `Shift` (Select), `Enter` (Start) |
| **Game Boy (GB / GBC)** | `Arrow Keys` | `Z` (B), `X` (A) | — | `Shift` (Select), `Enter` (Start) |
| **Game Boy Advance (GBA)** | `Arrow Keys` | `Z` (B), `X` (A) | `Q` (L), `W` (R) | `Shift` (Select), `Enter` (Start) |
| **Nintendo DS (NDS)** | `Arrow Keys` | `Z` (B), `X` (A), `A` (Y), `S` (X) | `Q` (L), `W` (R) | `Shift` (Select), `Enter` (Start), Mouse (Touch) |
| **Nintendo 64 (N64)** | `Arrow Keys` | `X` (A), `Z` (B) | `Q` (L), `W` (R), `E` / `Space` (Z-Trigger) | `I/J/K/L` (C-Buttons), `Enter` (Start) |
| **PlayStation (PS1)** | `Arrow Keys` | `Z` (✕), `X` (○), `A` (□), `S` (△) | `Q` (L1), `W` (R1), `1` (L2), `2` (R2) | `Shift` (Select), `Enter` (Start) |
| **Sega Genesis / Mega Drive** | `Arrow Keys` | `Z` (A), `X` (B), `C` (C), `A` (X), `S` (Y), `D` (Z) | — | `Shift` (Mode), `Enter` (Start) |
| **Game Gear** | `Arrow Keys` | `Z` (Btn 1), `X` (Btn 2) | — | `Enter` (Start) |
| **Arcade (MAME)** | `Arrow Keys` | `Ctrl / Z` (1), `Alt / X` (2), `Space / C` (3), `Shift / V` (4) | — | `5/6` (Insert Coin), `1/2` (Start), `Tab` (Menu) |
| **Atari 2600** | `Arrow Keys` | `Z / Space` (Fire) | — | `F1 / Enter` (Reset), `F2` (Select) |

---

## 📳 Haptic Touch & Tactile Feedback Engine

For mobile touch and handheld PWA players, Retro Player integrates a console-grade **Haptic Feedback Engine** powered by the HTML5 Vibration API (`navigator.vibrate`):

| Interaction / Context | Haptic Pulse Profile | Purpose |
| :--- | :--- | :--- |
| **Virtual Touch Gamepad** | `8ms` Micro-Pulse | Instant physical click feedback when pressing on-screen D-Pad or A/B/X/Y buttons |
| **Tabs & Ribbon Selection** | `12ms` Crisp Pulse | Tactile confirmation on platform filters, bottom dock tabs, and search chips |
| **Drawer & Modal Navigation** | `18ms` Medium Pulse | Tactile confirmation when opening game details, save manager, or tools drawer |
| **Save Confirmation** | `[15ms, 30ms, 20ms]` Rhythm | Haptic acknowledgment upon quick saving or battery export |
| **Achievement & Milestone Toast** | `[25ms, 40ms, 25ms, 40ms, 60ms]` Fanfare | Multi-beat trophy celebration rhythm synchronized with achievement popups |

### Battery & Device Protections
- **Rate-Limiting**: Capped at `35ms` frequency to prevent motor stutter during intense gameplay.
- **Battery-Saver Awareness**: Automatically throttles/disables vibration when device battery is $\le 15\%$.
- **User Toggle**: Customizable anytime in the **Mobile Tools Drawer $\rightarrow$ Emulation Preferences & Haptics**.

---

## 🔋 Controller Battery Telemetry & Diagnostics

Retro Player includes built-in battery telemetry tracking (`src/hooks/useGamepadStatus.js`) for wireless Bluetooth and USB gamepads using the standard W3C Gamepad Battery Extension (`gamepad.battery`).

### 1. Simultaneous Charging & Gameplay
- **Yes**, modern controllers (Xbox Wireless, PlayStation DualSense / DualShock 4, Nintendo Switch Pro Controller, 8BitDo) can charge over USB cable while simultaneously transmitting input commands to the browser.
- When charging, Retro Player dynamically renders the **`⚡` Charging icon** in the topbar and automatically suppresses low-battery warning alerts.

### 2. Status Indicator States
| Status / Level | Topbar Indicator | Behavior |
| :--- | :--- | :--- |
| **Charging (⚡)** | `BatteryCharging` (Cyan / Pulse) | USB power connected; low-battery warnings suppressed. |
| **High (> 70%)** | `BatteryFull` (Green) | Healthy battery level. |
| **Medium (31% – 70%)** | `BatteryMedium` (Yellow) | Normal operation. |
| **Low (11% – 20%)** | `BatteryLow` (Orange) | Displays slide-up **Low Gamepad Battery** warning toast & plays chime. |
| **Critical ($\le$ 10%)** | `BatteryWarning` (Red Pulse) | Displays high-priority **Critical Gamepad Battery** banner & warning chime. |
| **Hardware Unsupported / Wired** | Controller Name Tooltip | Battery icon gracefully hidden; controller name and USB connection state retained. |

### 3. Developer & Troubleshooting Mock Commands
Because certain generic controllers or older browser drivers do not expose the `gamepad.battery` API property, developers and testers can verify the telemetry UI/UX in real time using DevTools Console (`F12` / `Cmd + Option + I` $\rightarrow$ **Console**):

```javascript
// Simulate High Battery (90%)
window.__mockGamepadBattery(90);

// Simulate Medium Battery (50%)
window.__mockGamepadBattery(50);

// Simulate Low Battery Warning (18% - Triggers Toast + Chime)
window.__mockGamepadBattery(18);

// Simulate Critical Battery Alert (8% - Triggers Red Banner + Chime)
window.__mockGamepadBattery(8);

// Simulate Simultaneous USB Charging (⚡ Charging icon)
window.__mockGamepadBattery({ level: 65, isCharging: true });

// Simulate Custom Controller Hardware Name
window.__mockGamepadBattery({ level: 80, isCharging: false, id: "DualSense Wireless Controller" });

// Reset / Restore Real Hardware Detection
window.__mockGamepadBattery(null);
```

---

## 🔋 Power-Efficient Gamepad Lifecycle Management

To prevent battery drain on laptops, tablets, and mobile devices, Retro Player's gamepad navigation engine incorporates an **event-driven polling lifecycle guard**:
- **Zero Idle Polling**: When zero gamepads are connected, the `requestAnimationFrame` polling loop halts completely (0Hz CPU overhead).
- **Event-Driven Wakeup**: The loop reactivates automatically via standard browser `gamepadconnected` and pointer interaction events the moment a physical controller is connected or utilized.




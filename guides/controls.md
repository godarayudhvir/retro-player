# 🎮 Controls, Keybindings & Gamepad Mapping Guide

Retro Player is designed from the ground up for **100% controller and keyboard controllability**. Every view, modal, virtual keyboard, and in-game menu can be navigated seamlessly without touching a mouse.

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
| **`Select` / `Share`** | **`Share` / `Select`** | **`-` Minus** | **Toggle Favorite ⭐** (Library) / Standard Game Input (In-Game) |
| **`Start` / `Menu`** | **`Options` / `Start`** | **`+` Plus** | **Quick-Launch Game** (Library) / **Submit** (OSK) / **Complete Onboarding** / Standard Game Input (In-Game) |

---

## 🚀 Onboarding & Interactive Controller Guide Controls

During first-time startup or when revisiting the Onboarding wizard:

| Screen / Phase | Gamepad Action | Function |
| :--- | :--- | :--- |
| **Phase 1: Welcome & Overview** | **`D-Pad / Left Stick`** | 2D spatial navigation across value pillar cards and PWA installer banner |
| | **`[A]` Button / `Enter`** | Open repository / Trigger PWA installation / Advance to next phase |
| | **`START` Button** | Skip onboarding immediately and boot into library |
| **Phase 2: Character Studio** | **`D-Pad / Left Stick`** | Navigate between archetype cards, randomizer dice, name inputs, and color circles |
| | **`[A]` Button / `Enter`** | Select archetype preset, pick color, or roll dice |
| **Phase 3: Interactive Visualizer** | **Controller Buttons & Sticks** | Live vector DualShock schematic highlights active inputs with Web Audio SFX |
| | **`START` Button** | **Exclusive button to complete onboarding and launch into the game library** |

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
| — | **`T`** | **Toggle Light / Dark Mode** |
| **`[L]` / `[R]` Bumpers** | **`[` and `]`** | Cycle active platform console on System Ribbon |
| **`[B]` Button** | **`Escape`** | Close open modals, drawers, or reset focus |

---

## 🕹️ In-Game Controls & Gestures

When a game is running in the emulator core:

| Gesture / Shortcut | Action | Description |
| :--- | :--- | :--- |
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


# 🎮 Controls, Keybindings & Gamepad Mapping Guide

Retro Player is designed with a **100% controller-first and keyboard-first architecture**. Every single view, cartridge carousel, modal, settings pane, and virtual keyboard can be operated seamlessly without touching a mouse or touchscreen.

---

## 🕹️ Dashboard & Launcher Navigation

Use these controls to browse cartridges, switch systems, manage settings, and launch games from the main dashboard:

| Action | Keyboard Key | Standard Gamepad (Xbox / DualShock / Generic) |
| :--- | :--- | :--- |
| **Navigate Grid & Menus** | `Arrow Keys` or `W`, `A`, `S`, `D` | `D-Pad` / `Left Analog Stick` |
| **Switch Console / System Tab** | `Q` / `E` or `PageUp` / `PageDown` | `L1` / `R1` (Left / Right Shoulder Bumpers) |
| **Select / Open Game / Confirm** | `Enter` or `Space` | `A` Button (Cross / Button 0) |
| **Toggle Favorite ⭐** | `F` Key | `X` Button (Square / Button 2) |
| **Global Search & Filter** | `⌘K` (macOS) / `Ctrl+K` (Win/Linux) | `Y` Button (Triangle / Button 3) or `Select` |
| **Switch Color Theme 🎨** | `T` Key | Topbar Theme Button |
| **Open System Settings Hub ⚙️** | Click Settings Icon | Navigate to Topbar Settings |
| **Diagnostic Performance HUD 📊** | `D` Key | HUD Toggle in Settings |
| **Back / Close Modals & Drawers** | `Escape` or `Backspace` | `B` Button (Circle / Button 1) |

---

## 🕹️ In-Game Emulation Controls

When a game is actively running in the emulator canvas, inputs are processed directly by the WebAssembly core with zero latency:

### Universal In-Game Mappings

| In-Game Action | Keyboard Mapping | Gamepad Mapping |
| :--- | :--- | :--- |
| **D-Pad / Directional Movement** | `Arrow Keys` or `W`, `A`, `S`, `D` | `D-Pad` / `Left Analog Stick` |
| **Primary Action (A / Cross)** | `Z` Key | `A` Button (Cross / Button 0) |
| **Secondary Action (B / Circle)** | `X` Key | `B` Button (Circle / Button 1) |
| **Tertiary Action (X / Square)** | `A` Key | `X` Button (Square / Button 2) |
| **Quaternary Action (Y / Triangle)** | `S` Key | `Y` Button (Triangle / Button 3) |
| **Shoulder Left (L1 / L)** | `Q` Key | `L1` (Left Bumper) |
| **Shoulder Right (R1 / R)** | `E` Key | `R1` (Right Bumper) |
| **Trigger Left (L2 / ZL)** | `1` Key | `L2` (Left Trigger) |
| **Trigger Right (R2 / ZR)** | `3` Key | `R2` (Right Trigger) |
| **Start / Pause** | `Enter` Key | `Start` / `Menu` Button |
| **Select / Coin** | `Shift` Key | `Select` / `View` Button |
| **Pause / Resume Emulation** | Topbar Pause Button | Topbar Pause Button |
| **Mute / Unmute Audio** | Topbar Mute Button | Topbar Mute Button |
| **60 FPS Screen Recording (with Audio)** | Topbar Record Button | Topbar Record Button |
| **Emulation Speed (1.0x - 5.0x)** | Topbar Speed Button | Topbar Speed Button |
| **Lossless PNG Screenshot** | Topbar Capture Button | Topbar Capture Button |
| **Display Filters / Shaders** | Topbar Shaders Button | Topbar Shaders Button |
| **Quick Save & Quick Load** | Topbar Save/Load Buttons | Topbar Save/Load Buttons |
| **Diagnostic Health HUD** | Topbar Diagnostics Button | Topbar Diagnostics Button |
| **Exit Game to Launcher** | `Escape` Key / Close Button | Press `Select` + `Start` simultaneously (or Guide / Home) |

---

## ⌨️ Virtual On-Screen Keyboard (`⌘K` / `Ctrl+K`)

For Smart TVs, handhelds, and gamepad-only couch setups:
1. Press `⌘K` / `Ctrl+K` or `Y` / `Select` on your gamepad to open the on-screen search widget.
2. Navigate the virtual keys with your **D-Pad** or **Arrow Keys** and press **A** / **Enter** to type search queries.
3. Games filter in real time across all systems, titles, and genres.

---

## 🎮 Supported Gamepad Controllers

Retro Player automatically detects and calibrates any standard controller adhering to the W3C Gamepad standard:
- **Xbox Wireless Controllers** (Series X|S, Xbox One, Elite Series 2 via Bluetooth or USB)
- **Sony PlayStation Controllers** (DualSense, DualShock 4 via Bluetooth or USB)
- **Nintendo Controllers** (Switch Pro Controller, Joy-Cons, NES/SNES Switch Online controllers)
- **8BitDo & Retro Bit** Bluetooth & 2.4G controllers (M30, SN30 Pro, Ultimate, Arcade Sticks)
- **Handheld Built-in Controls** (Steam Deck, ROG Ally, Lenovo Legion Go, Retroid Pocket, Odin 2)

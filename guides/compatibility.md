# Hardware & Platform Compatibility Matrix

This document outlines the hardware, operating system, and viewport resolution compatibility standards for Retro Player. Every component, modal, game canvas, and navigation system is engineered and tested to ensure universal responsiveness across all form factors.

---

## 📐 Target Viewport Resolution Matrix

Retro Player maintains strict responsive layout parity across the following canonical test resolutions:

| Device Category | Benchmark Device / Tier | CSS Viewport Resolution | Native Orientation | Key Verification & Usability Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile (Compact)** | iPhone SE / Budget Android | `375 x 667` | Portrait | Minimum mobile boundary; modal compact padding, single-column feeds, touch action reachability. |
| **Mobile (Standard)** | iPhone 14 / 15 / 16, Pixel 8 | `390 x 844` *(portrait)*<br>`844 x 390` *(landscape)* | Dynamic | Standard mobile view; on-screen virtual gamepads, bottom navigation bar, landscape in-game overlay fit. |
| **Mobile (Large / Pro Max)** | iPhone 15 Pro Max, S24 Ultra | `430 x 932` *(portrait)*<br>`932 x 430` *(landscape)* | Dynamic | High vertical real estate; fluid hero banners, quick save trays, touch button ergonomics. |
| **Tablets** | iPad 10th Gen, iPad Air | `810 x 1080` *(portrait)*<br>`1080 x 810` *(landscape)* | Dynamic | Split-pane layouts, DS dual-screen vertical stack vs side-by-side grid, sidebar collapse. |
| **Handheld Consoles** | Steam Deck, ROG Ally, Switch | `1280 x 800` / `1280 x 720` | Landscape | 100% Gamepad D-Pad/stick spatial navigation, native 16:10 / 16:9 safe margins, zero mouse dependency. |
| **Desktop / Laptop (FHD)** | Standard 1080p Monitors | `1920 x 1080` | Landscape | Multi-column game collections (4–6 columns), keyboard hotkey overlays, sidecar inspector modals. |
| **Desktop / Monitor (QHD / 2K)**| 1440p Gaming Displays | `2560 x 1440` | Landscape | High-density grid rendering, smooth carousel scaling, max-width container centering. |
| **Living Room & 4K TV** | 4K Big Picture Displays | `3840 x 2160` | Landscape | 10-foot UI couch-distance legibility, large focus outlines, full gamepad media key navigation. |

---

## 🎮 Platform & OS Compatibility

| Platform / Operating System | Supported Browsers / Runtimes | Primary Input Modes | Special Capabilities |
| :--- | :--- | :--- | :--- |
| **macOS** | Safari 16+, Chrome 110+, Firefox 115+, Edge | Keyboard, Mouse, Bluetooth Gamepad | Discord RPC (via local IPC), OS MediaSession audio controls. |
| **Windows 10 / 11** | Chrome, Edge, Firefox | Keyboard, Mouse, XInput Gamepads | Fullscreen PWA, hardware media keys, Web Audio chiptune fanfare. |
| **Linux / SteamOS** | Chromium, Firefox, Steam Deck Browser | Gamepad (Steam Controller/Deck), Keyboard | Native Steam Deck 800p optimization, offline PWA cache. |
| **iOS / iPadOS (16.4+)** | Safari, Chrome for iOS, PWA Home Screen | Multi-touch, Bluetooth MFi/Xbox/DualShock | Haptic feedback (`navigator.vibrate`), Lock Screen MediaSession widget. |
| **Android (10+)** | Chrome, Firefox Mobile, Samsung Internet | Multi-touch, USB-OTG/Bluetooth Controllers | Full vibration engine, installable standalone APK/PWA. |
| **Smart TVs & Big Picture** | LG webOS, Samsung Tizen, Android TV | Remote D-Pad, USB/Bluetooth Gamepads | Spatial D-pad navigation, high-contrast focus rings. |

---

## 🧪 Quick QA Testing Guide (DevTools)

When developing or auditing UI components:
1. Open Chrome/Edge DevTools (**`Cmd + Option + I`** or **`F12`**).
2. Toggle Device Toolbar (**`Cmd + Shift + M`**).
3. Cycle through the presets above, and test orientation switching using the **Rotate** button.
4. Verify that:
   - Modals never exceed `90vh` or get cut off vertically on landscape phones (`430px` height).
   - Gamepad navigation highlights (`.focused`) remain visible and fully functional across every resolution.
   - Text remains legible at 1080p, 1440p, and 4K without breaking container boundaries.

# 📱 Cross-Device Experience Matrix & Platform Comparison

This document outlines how **Retro Player** adapts its interface, user experience, input methods, performance optimizations, and management capabilities across four distinct hardware categories:
1. **Mobile Phones** (iOS Safari & Android PWA, $\le$ 640px)
2. **Tablets & Gaming Handhelds** (iPads, Steam Deck, ROG Ally, Odin, Switch, 641px – 1024px)
3. **Desktop PCs & Laptops** (Windows, macOS, Linux, 1025px – 1600px)
4. **Large TVs & 4K Displays** (Living Room TV, Android TV, 10-Foot Console Mode, 1601px+)

---

## 📊 Feature & Experience Comparison Matrix

| Feature / Subsystem | 📱 Mobile Phones ($\le$640px) | 🕹️ Tablets & Handhelds (641px–1024px) | 💻 Desktop PCs (1025px–1600px) | 📺 10-Foot TVs (1601px+) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Interaction** | Multi-Touch Screen & Gestures | Touch + Physical Gamepad / Joy-Cons | Mouse, Keyboard & Gamepad | Gamepad Controller (100% Spatial) |
| **Main UI Layout** | Native App Shell & Bottom Nav | Responsive Adaptive Dual-Column | High-Density Dashboard & Topbar | Oversized 10-Foot Console HUD |
| **Game Details View** | Bottom Drawer Action Sheet | Floating Modal / Side Panel | Full 3D Box Art Drawer Modal | Ultra-Wide Theater Card with SFX |
| **Emulation Controls** | Virtual Touch Gamepad Overlay (Haptic) | Physical Gamepad + Custom Remap | Full Keyboard & USB/BT Gamepads | Wireless Bluetooth/USB Gamepads |
| **Admin & File Upload** | 🚫 *Hidden* (Kept clean & lightweight) | ⚙️ Quick Rom Upload & Basic Settings | 🖥️ Full Suite (Bulk Upload, Logs, DB) | 🚫 *Hidden* (Read-only console play) |
| **Metadata Editing** | 🚫 *Hidden* (No admin overhead) | ✏️ In-App Quick Edit Modal | ✏️ Full Jellyfin-Style Metadata Editor | 🚫 *Hidden* (Consumes synced meta) |
| **Scraper Telemetry** | Background Cached Only | On-Demand Single-Game Scraper | Live Streaming Scraper Terminal | Silent Auto-Sync & Cache Loading |
| **Background Music** | Toggle Mute in User Drawer | Floating HUD BGM Controller | Topbar BGM Player & Track Uploader | Ambient BGM Console Soundtrack |
| **Shader & Display** | Fast CRT / Clean Scanlines | Crisp Pixel Shader & Scanlines | Full Advanced Shader Options | 4K Integer Scale & Bloom CRT |
| **Spatial Gamepad Nav** | Supported (when controller paired) | Native Spatial Focus Rings | Full Spatial Focus (D-Pad / Sticks) | Native 100% 10-Foot Controller Nav |

---

## 📱 1. Mobile Phones ($\le$ 640px, iOS & Android PWA)

### Philosophy: Zero Admin Bloat, Instant Touch Gaming
Mobile phones are personal gaming devices. Users want to launch the app, tap a game, and jump into gameplay in seconds. Heavy server administration, raw database viewers, live terminal logs, and bulk upload queues are intentionally hidden to keep the mobile interface lightning fast and clutter-free.

### Key Highlights:
- **Bottom Navigation Bar**: Native mobile navigation bar providing instant one-thumb access to *Library*, *Search*, *Favorites*, and *My Profile*.
- **Swipeable Action Sheets**: Tapping a game tile slides up a spring-animated bottom sheet displaying box art, release year, playtime stats, and a prominent **"PLAY NOW"** action.
- **On-Screen Multi-Touch Gamepad**:
  - Precision virtual D-Pad and analog thumbstick.
  - Action buttons with haptic feedback vibration.
  - Shoulder buttons ($L_1 / R_1 / L_2 / R_2$) and Start/Select buttons ergonomically mapped for two-thumb play.
- **Lightweight User Preferences**:
  - Theme switching (Game Boy Green, Cyberpunk, OLED Midnight, Retro Famicom, PlayStation Purple).
  - Profile Avatar creator (custom Mii avatar).
  - Web Audio UI SFX toggles and volume control.
  - Cloud save download / local save state restore.

---

## 🕹️ 2. Tablets & Handhelds (641px – 1024px, Steam Deck, iPads, Switch)

### Philosophy: Hybrid Touch & Physical Console Experience
Handhelds and tablets balance generous screen estate with physical input versatility. They support both direct touch manipulation and hardware controllers (Steam Deck controls, Joy-Cons, Bluetooth pads).

### Key Highlights:
- **Medium-Density Cartridge Grid**: 3-to-4 column responsive grid showing vibrant 3D box art and platform tags.
- **Seamless Gamepad Integration**: Instant automatic detection of hardware gamepads with spatial focus rings.
- **Side-by-Side Detail Drawers**: View game synopsis, session playtime, and save status side-by-side with cartridge selection.
- **Quick In-App Metadata Edit**: Handheld users can quickly adjust titles or custom cover art without navigating to complex desktop panels.

---

## 💻 3. Desktop PCs & Laptops (1025px – 1600px)

### Philosophy: Full Powerhouse Admin & Retro Station
Desktop workstations and laptops represent the administrative powerhouse and deep configuration hub of Retro Player.

### Key Highlights:
- **Comprehensive Administration Suite**:
  - Full-screen **Settings & Storage Manager** (`SettingsView.jsx`).
  - Drag-and-drop batch upload for ROM binaries and custom chiptune BGM tracks.
  - Library deletion and persistent file pruning.
- **Jellyfin-Style In-App Metadata Editor**:
  - Full modal editor for game titles, developer, publisher, release year, genre tags, and custom artwork.
  - Image upload with automatic client-side WebP optimization.
- **Live Scraper Telemetry Terminal**:
  - Real-time diagnostic console streaming live API requests, cache hits, and scraper responses across TheGamesDB, ScreenScraper, and Libretro CDN.
- **Keyboard Shortcuts & Hotkeys**:
  - `/` or `Ctrl+K` for instant search.
  - `F` for Quick Favorite toggle.
  - `M` for background music mute/unmute.
  - Arrow keys, `Tab`, `Enter`, and `Esc` for 100% spatial UI navigation.

---

## 📺 4. Large TVs & 4K Displays (1601px+, 10-Foot Console Mode)

### Philosophy: Authentic Living Room Console Operating System
When displayed on living room TVs, projectors, or 4K monitors, Retro Player transforms into a dedicated 10-foot operating system (reminiscent of the Nintendo Switch OS, PS5 dashboard, or Apple TV).

### Key Highlights:
- **100% Gamepad Spatial Navigation**: Designed to be operated entirely with a gamepad from the couch without touching a keyboard or mouse.
  - **D-Pad / Left Stick**: Move spatial focus.
  - **A Button (Cross)**: Select / Play game.
  - **B Button (Circle)**: Go back / Dismiss drawer.
  - **X Button (Square)**: Quick-toggle Favorite.
  - **Y Button (Triangle)**: Open Instant Search.
  - **$L_1 / R_1$**: Switch console system tabs.
- **Scaled 10-Foot Typography**: High-contrast, large-format fonts and elevated cards visible from across the room.
- **Atmospheric Background Music & UI SFX**: Seamless chiptune BGM playback and spatial audio chimes on tile movement.
- **Zero Administrative Overload**: Hides complex file inputs and administrative forms in favor of pure, uninterrupted couch play.

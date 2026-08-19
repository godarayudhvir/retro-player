# Retro Visual Effects & CSS Design System (`architecture/components/retro-effects.md`)

## 1. Description
The Retro Visual Effects and CSS Design System ([index.css](file:///Users/godarayudhvir/Projects/retro-player/src/index.css)) provides custom aesthetic styling, typography, glassmorphism containers, CRT scanlines, cartridge color accents, micro-animations, and responsive layouts.

---

## 2. Detailed List of What It Does
- **Design Tokens & Multi-Theme System**: Configures root and theme-scoped CSS variables (`--bg-iisu`, `--bg-dots`, `--panel-bg`, `--panel-border`, `--tile-bg`, `--poke-red`, `--font-iisu`) for 4 distinct aesthetic modes (iiSU Light, Midnight Cyber, Sony XMB Wave, Game Boy DMG).
- **Full-Spectrum Responsive Layout Engine**:
  - **📱 Mobile Phones (`<= 640px`)**: Compact header with icon-only status pills (40px tap targets), fluid search input, vertical multi-column cartridge scrolling grid (`repeat(auto-fill, minmax(130px, 1fr))`), hidden controller HUD, and single-column dialogs (`max-width: 95vw`).
  - **📟 Tablets & Handhelds (`641px - 1024px`)**: Scaled 2-row horizontal cartridge carousel (`minmax(165px, 190px)`), compact topbar shoulder pills, and side-by-side DS emulation layout.
  - **💻 Desktops (`1025px - 1600px`)**: 1440px max-width container, full status pills, 2-row 3D cartridge shelf with tactile sheen.
  - **📺 Large TVs & 4K Displays (`1601px+`)**: 10-foot UI mode scaling up to 2100px max-width, elevated focus rings with glowing shadows (`0 0 45px rgba(239, 68, 68, 0.85)`), larger typography (`1.15rem` base), and large cartridge shells (`minmax(230px, 260px)`).

---

## 3. Detailed Logic Behind Everything and How It Works
- Uses Google Fonts (`Fredoka`, `Nunito`).
- Card tiles utilize dynamic variables `--sys-color` and `--cart-color` set via inline React styles.
- Responsive breakpoints handle seamless adaptation across all screen form factors.

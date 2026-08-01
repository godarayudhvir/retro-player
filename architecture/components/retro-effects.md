# Retro Visual Effects & CSS Design System (`architecture/components/retro-effects.md`)

## 1. Description
The Retro Visual Effects and CSS Design System ([index.css](file:///Users/godarayudhvir/Projects/retro-player/src/index.css)) provides custom aesthetic styling, typography, glassmorphism containers, CRT scanlines, cartridge color accents, micro-animations, and responsive layouts.

---

## 2. Detailed List of What It Does
- **Design Tokens**: Configures root CSS variables (`--bg-iisu`, `--bg-dots`, `--panel-bg`, `--panel-border`, `--tile-bg`, `--poke-red`, `--font-iisu`).
- **Background Grid**: Displays radial dot background pattern using `radial-gradient`.
- **Card Hover & Scanline Effects**: Implements hover scale transitions, glassmorphism backdrops, and retro CRT scanlines overlay effects.

---

## 3. Detailed Logic Behind Everything and How It Works
- Uses Google Fonts (`Fredoka`, `Nunito`).
- Card tiles utilize dynamic variables `--sys-color` and `--cart-color` set via inline React styles.
- Responsive breakpoints adjust game card grid templates from `repeat(auto-fill, minmax(200px, 1px))` down for mobile devices.

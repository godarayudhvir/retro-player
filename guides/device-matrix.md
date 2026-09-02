# Cross-Device Experience Matrix (2026 Master Reference)

Comprehensive architectural specification for target viewports, responsive form factor tiers, CSS media query breakpoints, and device-specific UX behaviors across Retro Player.

---

## 📱 1. Mobile Phones & Foldables (`<= 640px`)

Dedicated mobile experience powered by `MobileAppView.jsx` and `MobileOnboardingScreen.jsx`:
* **UI Structure**: Single-column vertical swipe story cards, touch virtual gamepad overlay, single-row 3-column controller status HUD, and dynamic 2–4 column character archetype grid.

| Device Tier | Reference Devices | Logical Resolution (Viewport) | Aspect Ratio | Native Pixel Density |
| :--- | :--- | :--- | :--- | :--- |
| **Small / Compact** | iPhone SE (2nd/3rd gen), iPhone 8/7/6s, iPhone 12/13 mini | **`375 x 667`** (SE)<br>**`360 x 780`** (mini) | 16:9 / 19.5:9 | @2x (750 x 1334)<br>@3x (1080 x 2340) |
| **Foldable Cover Screen** | Galaxy Z Fold 5/6 (Folded), Pixel 9/10 Pro Fold (Outer) | **`344 x 882`** (Fold 6)<br>**`384 x 904`** (Pixel Fold) | 23.1:9 / 20:9 | @3x (904 x 2316)<br>@3x (1080 x 2424) |
| **Medium / Standard** | iPhone 12, 13, 14, 15, 16, iPhone 15/16 Pro, Galaxy S23/S24/S25 | **`390 x 844`** (iPhone)<br>**`393 x 852`** (Pro Dynamic Island) | 19.5:9 | @3x (1170 x 2532)<br>@3x (1179 x 2556) |
| **Large / Pro Max** | iPhone 14/15/16 Plus, iPhone 14/15/16 Pro Max, Galaxy S24/S25 Ultra | **`430 x 932`** (Plus/Max)<br>**`440 x 956`** (16 Pro Max) | 19.5:9 | @3x (1290 x 2796)<br>@3x (1320 x 2868) |

### Modern 2026 Mobile & Safe Area Rules
* **Safe Area Insets**: All modern iOS (Dynamic Island) and flagship Android devices (punch-hole cameras, bottom navigation bars) require:
  ```css
  padding-top: max(12px, env(safe-area-inset-top));
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  ```
  Ensures touch D-Pad and action buttons never clip behind home indicator bars or camera islands.
* **Controller HUD**: 3 status tiles (`Charging 100%`, `Low Battery 15%`, `READY`) align in a clean 3-column grid (`grid-template-columns: repeat(3, 1fr)`).
* **Avatar Archetype Grid**:
  - Compact (`<= 350px`): 2 Columns
  - Standard (`351px – 480px`): 3 Columns
  - Large (`481px+`): 4 Columns

---

## 📟 2. Tablets, Foldables (Inner Screen) & Gaming Handhelds (`641px – 1024px`, plus `1280 x 800`)

Desktop engine scaled down with **4-Card Grid ONLY** (2 preview screenshot frames hidden):
* **UI Structure**: Full-width 2x2 grid of value pillars (Native WASM, Universal Saves, Achievements, Universal Controls).
* **CSS Boundary**: `@media (max-width: 1024px), (max-width: 1280px) and (max-height: 850px)`

| Device Tier | Reference Devices | Portrait Viewport | Landscape Viewport | Aspect Ratio |
| :--- | :--- | :--- | :--- | :--- |
| **Foldable (Unfolded Inner)** | Galaxy Z Fold 5/6, Pixel 9/10 Pro Fold, OnePlus Open | **`768 x 1024`** (Z Fold)<br>**`884 x 1104`** (Pixel Fold) | **`1024 x 768`**<br>**`1104 x 884`** | ~4:3 / ~1:1 (Square) |
| **iPad mini** | iPad mini 6th gen, iPad mini 5 | **`744 x 1133`** (mini 6)<br>**`768 x 1024`** (mini 5) | **`1133 x 744`**<br>**`1024 x 768`** | 3:2 / 4:3 |
| **iPad (Standard)** | iPad 10.2" (7th–9th gen), iPad 10.9" (10th gen), iPad Air | **`810 x 1080`** (10.2")<br>**`820 x 1180`** (10.9") | **`1080 x 810`**<br>**`1180 x 820`** | 4:3 / ~16:10 |
| **iPad Pro** | iPad Pro 11", iPad Pro 12.9" / 13" M4 | **`834 x 1194`** (11")<br>**`1024 x 1366`** (12.9") | **`1194 x 834`**<br>**`1366 x 1024`** | ~4:3 |
| **Gaming Handhelds** | Steam Deck, ROG Ally, Legion Go, Ayn Odin 2, Retroid Pocket | — | **`1280 x 800`** (Deck)<br>**`1280 x 720`** (Ally @ 150% DPI) | 16:10 / 16:9 |

### Handheld PC DPI Scaling Factor & Ergonomics
* **Steam Deck (`1280 x 800`)**: Native 100% scale &rarr; effective browser viewport = **`1280 x 800`**.
* **ASUS ROG Ally / Ally X (`1920 x 1080`)**: Native 1080p, but Windows defaults to **150% scaling** on 7" displays &rarr; effective browser viewport = **`1280 x 720`**.
* **Lenovo Legion Go (`2560 x 1600`)**: Native QHD, but Windows defaults to **200% scaling** on 8.8" displays &rarr; effective browser viewport = **`1280 x 800`**.
* *Architecture Alignment*: Because of OS-level DPI scaling, **all modern PC handhelds naturally resolve into `1280 x 720` or `1280 x 800`**, triggering the compact 4-card grid with zero vertical scroll.

### Responsive Rules for Tablets & Handhelds
* **Portrait Mode (`810 x 1080`, `768 x 1024`)**: Cards stretch vertically to fill the tall viewport naturally; Card 4 keyboard keycaps and D-pad labels remain unclipped.
* **Landscape Handhelds (`1080 x 810`, `1280 x 800`)**: Compact card padding (`0.55rem 0.75rem`), save buttons (`28px`), and pill heights (`48px`) guarantee **zero vertical scroll** and **zero cutoff** above the bottom action bar.

---

## 🖥️ 3. Desktop PCs & Laptops (`1025px – 1600px` & `2560 x 1440`)

Full **2-Column Showcase**:
* **Left Column**: Title, description, and 4 value pillar cards (2x2 grid).
* **Right Column**: Dual live screenshot frames (Dual-Screen Console Firmware and Pokémon Sapphire in-game emulation).

| Resolution Tier | Common Displays & Hardware | Viewport Resolution | Notes |
| :--- | :--- | :--- | :--- |
| **768p / 900p Laptops** | Budget laptops, older MacBook Air | **`1366 x 768`**<br>**`1440 x 900`** | Compact height scaling, no card overflow |
| **1080p Full HD** | Standard PC monitors, gaming laptops, FHD iMac | **`1920 x 1080`** | Golden reference desktop layout (`1.25fr 1fr; gap: 1.25rem`) |
| **1440p / 2K / QHD** | 27" QHD gaming displays, Studio Display scaled | **`2560 x 1440`** | Expanded typography (`1.85rem` title), `26px` console SVGs, `78px` status pills |
| **1600p Retina** | MacBook Pro 14" / 16" (native retina viewports) | **`1728 x 1117`** (16" Pro)<br>**`1512 x 982`** (14" Pro) | Crisp high-DPI font smoothing, centered 2-column showcase |

---

## 📺 4. TVs & Ultra-wide Displays (`1601px+` & `3840 x 2160+`)

Full **10-Foot Couch-Distance Legibility Overhaul** with 100% spatial gamepad navigation:
* **UI Structure**: Expanded 2-column layout with 1.8x–2x scaled typography, high-contrast outlines, and couch-distance visibility.
* **CSS Boundary**: `@media (min-width: 2561px)`

| Resolution Tier | Common Displays & Hardware | Viewport Resolution | Notes |
| :--- | :--- | :--- | :--- |
| **Ultra-Wide (UW-QHD)** | 34" Curved, 49" Super Ultra-wide monitors | **`3440 x 1440`** (21:9)<br>**`5120 x 1440`** (32:9) | Centered 96vw max-width containment |
| **4K Ultra HD TV** | 55" / 65" / 75" Living Room TVs, Apple TV 4K, Smart TVs | **`3840 x 2160`** | Header title `3.2rem`, card titles `2.2rem`, `92px` status tiles, `38px` console SVGs |
| **8K Ultra HD TV** | Next-gen 8K displays, Samsung Neo QLED | **`7680 x 4320`** | Scaled via modern viewport units (`vw`/`rem`) |

### Smart TV Gamepad & Living Room Browser Compatibility
* **Target TV Browsers**: LG webOS Browser, Samsung Tizen Browser, Google TV / Android TV Chromium, and Apple TV via AirPlay/WebXR.
* **10-Foot Couch Distance Rules**:
  - Minimum typography: `1.55rem` body text, `2.2rem` card titles, `3.2rem` headers.
  - Interactive targets: Minimum `48px` button height and `92px` status tile height.
  - 100% spatial navigation via Bluetooth gamepads (Xbox, PlayStation DualSense, Switch Pro) with high-contrast active focus rings (`var(--accent, #3b82f6)`).

---

## 📐 Quick Reference Breakpoint Cheatsheet

```css
/* 1. Mobile Phones & Foldables (<= 640px) */
@media (max-width: 640px) { ... }

/* 2. Tablets, Handhelds & Foldables Unfolded (641px - 1024px, plus Deck/Ally <=1280x850) */
@media (max-width: 1024px), (max-width: 1280px) and (max-height: 850px) { ... }

/* 3. iPad / Tablets in Portrait Mode (810x1080) */
@media (max-width: 900px) and (min-height: 900px) { ... }

/* 4. Desktop Full HD & Laptops (1025px - 1920px) */
@media (min-width: 1025px) { ... }

/* 5. 1440p / 2K QHD (1921px - 2560px) */
@media (min-width: 1921px) and (max-width: 2560px) { ... }

/* 6. 4K & 8K Ultra HD TVs (2561px+) */
@media (min-width: 2561px) { ... }
```

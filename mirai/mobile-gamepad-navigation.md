# 📱 Mobile UI Gamepad & Spatial Navigation Architecture

> **Domain**: Mobile UX / Gamepad Controls  
> **Status**: 📋 Planned  
> **Priority**: 🟡 Medium  

---

## 1. Description

Retro Player currently features 100% native USB/Bluetooth gamepad support during active gameplay across all platforms (iOS Safari, Android Chrome, Handhelds). While desktop and TV environments feature deep 2D spatial navigation across every grid, topbar, modal, and drawer, the mobile view currently relies strictly on native touch interactions (touch scrolling, pull-down sheets, edge swipes).

This specification outlines the technical blueprint to build a clean, accurate, and ergonomic gamepad spatial navigation engine tailored specifically for the mobile feed layout, bottom sheets, search overlays, and drilldown catalog views.

---

## 2. Detailed List of What It Will Do

1. **Mobile Feed 2D Navigation**:
   - Seamless D-Pad / Left Stick horizontal scrolling across console system chips.
   - Vertical D-Pad transitions between recent games, favorites, and system carousel rows.
   - Smooth horizontal panning within individual game card rows with auto-centering.

2. **Drawer & Bottom Sheet Controls**:
   - Opening a game detail sheet focuses the **`[A] Play`** action by default.
   - `D-Pad Left/Right` toggles between **`Favorite ⭐`**, **`Play ▶`**, and **`Close ✕`**.
   - `[B]` Button or `[Start]` closes the drawer and restores focus to the previously selected card in the feed.

3. **Mobile On-Screen Keyboard (OSK)**:
   - Controller-driven virtual keyboard navigation for searching titles and editing handles on mobile without requiring the native OS keyboard to pop up.

4. **Context Isolation**:
   - Zero input bleed between mobile UI navigation and the in-game emulation core.
   - Clear visual focus rings adapted for mobile touch dimensions.

---

## 3. Detailed Logic Behind It

```
               ┌───────────────────────────────┐
               │    Gamepad Polling Engine     │
               └──────────────┬────────────────┘
                              │
               ┌──────────────▼────────────────┐
               │ Is Game Running in Emulator?  │
               └──────┬─────────────────┬──────┘
                  YES │                 │ NO
                      ▼                 ▼
        ┌───────────────────┐     ┌──────────────────────┐
        │ Route directly to │     │ Is Mobile Viewport?  │
        │ WASM Core Engine  │     └──────┬────────┬──────┘
        └───────────────────┘        YES │        │ NO
                                         ▼        ▼
                      ┌────────────────────┐   ┌────────────────────┐
                      │ Mobile Spatial Nav │   │ Desktop Console    │
                      │ Engine (Feed/Sheet)│   │ Spatial Nav Engine │
                      └────────────────────┘   └────────────────────┘
```

1. **Spatial Coordinates Map**:
   - Maintain a normalized 2D virtual coordinate grid `(rowIndex, colIndex)` matching the virtualized streaming rows rendered by `MobileFeed.jsx`.
2. **Scroll Synchronization**:
   - On D-pad navigation, dispatch smooth scroll behaviors targeting the active DOM element container (`scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`).
3. **Modal & Sheet Trap**:
   - When a drawer opens, constrain gamepad navigation to `{ zone: 'mobileSheet', id: 'play' | 'fav' | 'close' }` and suppress feed movement underneath.

---

## 4. Detailed Guide of How to Set It Up

1. **Implement `useMobileGamepadNavigation` Hook**:
   - Create a dedicated hook in `src/hooks/useMobileGamepadNavigation.js` decoupled from desktop console logic.
2. **Wire Mobile Target Zones**:
   - Attach `data-mobile-zone` attributes to `mobile-chip`, `mobile-game-card`, and `mobile-sheet-action` elements.
3. **Connect to `useGamepadNavigation.js`**:
   - Delegate mobile navigation when `isMobile === true` to the new modular mobile engine.

# SystemRibbon Component Specification

## 1. Description

The `SystemRibbon` component (`nav.system-ribbon`) provides a horizontal category navigation bar for switching between console platforms (GB, GBC, GBA, NES, SNES, N64, NDS, Genesis, PS1, Arcade) and "All Games".

---

## 2. Detailed List of What It Does

- **Dynamic Game Count Sorting**: Filters console categories to those with at least 1 registered ROM, and sorts tabs in descending order of total game count (most titles first).
- **All Games Tab**: Always displayed first with the total library count.
- **Active Tab Highlighting**: Highlights active system tab with `.active` and `.gamepad-focused` classes.
- **Smooth Auto-Scrolling**: Automatically scrolls the active console category into the center of the ribbon using `.scrollIntoView({ inline: 'center' })`.
- **Audio Feedback**: Triggers `sfx.playTabSwitch()` on tab selection.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Lifecycle
- `systems` (Array): Array of system descriptor objects containing `key`, `name`, `icon`, and `gameCount`.
- `activeSystem` (string): Active system key (`all`, `gba`, `nes`, etc.).
- `useEffect`: Watches `activeSystem` and runs `ribbonRef.current?.querySelector('.system-tab.active')?.scrollIntoView(...)`.

### Source Location
- Component: [src/components/SystemRibbon.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SystemRibbon.jsx)

# Console Switcher & Filter System (`architecture/modules/console-switcher.md`)

## 1. Description
The Console Switcher system provides dynamic console filtering, system tab navigation, shoulder button cycling, and retro platform badge rendering across the application header and library grid.

---

## 2. Detailed List of What It Does
- **System & Smart Collections Filtering**: Filters the game catalog by smart collections (**⭐ Favorites**, **🕒 Recently Played**) as well as console platforms (All Systems, Game Boy Advance, Nintendo 64, Super Nintendo, NES, Nintendo DS, PlayStation, Arcade).
- **Shoulder Button Prompts**: Displays contextual shoulder button hints (`[Q]` / `[E]` for keyboard users vs `[L]` / `[R]` when a USB gamepad is connected).
- **Auto-Scrolling Tabs**: Automatically scrolls the active system tab into view centered on screen when active system state changes.
- **Dynamic Badge Styling**: Renders platform SVG icons (`/assets/platforms/*.svg`), gold star badges for favorites, and custom HSL accent colors for each console type.

---

## 3. Detailed Logic Behind Everything and How It Works

### Tab Switching Mechanics
- Active tab state `activeSystem` updates via `setActiveSystem(systemKey)`.
- Key bindings:
  - `Q` / `L1`: Cycle to previous system tab in `['all', 'favorites', 'recent', ...sortedSystems]`.
  - `E` / `R1`: Cycle to next system tab in `['all', 'favorites', 'recent', ...sortedSystems]`.
- Smooth scrolling effect triggered via `useEffect`:
  ```javascript
  const activeTab = document.querySelector('.system-tab.active');
  if (activeTab) {
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  ```

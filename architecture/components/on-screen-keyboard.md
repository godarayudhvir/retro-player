# On-Screen Virtual Keyboard UI Component (`architecture/components/on-screen-keyboard.md`)

## 1. Description
The On-Screen Virtual Keyboard UI component ([OnScreenKeyboard.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/OnScreenKeyboard.jsx)) provides a dedicated, accessible, glassmorphic virtual keyboard interface for searching the retro game library using gamepads (Xbox, PlayStation, Switch Pro) and touchscreens.

---

## 2. Detailed List of What It Does
- **Glassmorphic Modal Overlay**: Renders a fixed backdrop overlay (`.osk-overlay`) with backdrop blur (`16px`) and subtle retro gradient modal frame.
- **Search Header & Results Counter**: Displays active library query status with real-time match counts (`12 games found`) and close trigger.
- **Live Search Query Display Bar**: Renders currently typed text with an animated retro blinking cursor and instant clear button.
- **Controller Shortcut Legend**: Displays colored shortcut badges for quick gamepad actions:
  - `A` (Select Key)
  - `X` (Space Shortcut)
  - `Y` (Backspace Shortcut)
  - `START` (Search & Focus Grid Results)
  - `B` (Close Keyboard)
- **4-Row Virtual Key Matrix**: Organizes alphanumeric characters and special keys in a 2D layout (`KEYBOARD_ROWS`):
  - Row 0: `1 2 3 4 5 6 7 8 9 0 ⌫`
  - Row 1: `Q W E R T Y U I O P -`
  - Row 2: `A S D F G H J K L ' CLEAR`
  - Row 3: `Z X C V B N M . SPACE DONE`
- **Spatial Focus Glow & Animations**: Highlights the currently selected key with glowing red gradient and pulsate micro-animations (`.osk-key-focused`).

---

## 3. Detailed Logic Behind Everything and How It Works

### Spatial Navigation & Input Handling
1. **Gamepad Trigger**: Pressing `Button 3 (Y / Triangle)` or `Button 8 (Select/Share)` on a connected gamepad from anywhere in the console library toggles `showVirtualKeyboard = true` and focuses the virtual keyboard at `{ row: 1, col: 0 }` (`'Q'`).
2. **D-Pad / Analog Stick Navigation**:
   - `UP / DOWN`: Increments or decrements `oskPos.row`, clamping within `[0, KEYBOARD_ROWS.length - 1]` and adjusting `col` to the maximum column length of the target row.
   - `LEFT / RIGHT`: Cycles `oskPos.col` horizontally with row wrap-around.
3. **Key Execution (`handleVirtualKey`)**:
   - Standard Character: Appends key character to `searchQuery`, immediately filtering `filteredGames` in the background.
   - `⌫` (Backspace): Truncates last character (`searchQuery.slice(0, -1)`).
   - `SPACE`: Appends space character (`' '`).
   - `CLEAR`: Resets `searchQuery` to `''`.
   - `DONE` / `SEARCH`: Closes virtual keyboard (`showVirtualKeyboard = false`) and focuses the first filtered game tile in the grid.
4. **Touch & Mouse Fallback**:
   - Every virtual key contains an `onClick` handler allowing touchscreen and mouse users to tap or click keys directly.

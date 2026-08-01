# Gamepad Controls & Navigation Engine (`architecture/modules/gamepad-controls.md`)

## 1. Description
The Gamepad Controls engine provides seamless navigation using standard USB/Bluetooth gamepads (Xbox, PlayStation, Switch Pro) and keyboard hotkeys throughout the console UI shell.

---

## 2. Detailed List of What It Does
- **Gamepad API Polling Loop**: Listens for `gamepadconnected` and `gamepaddisconnected` events and polls connected gamepads using `navigator.getGamepads()`.
- **Keyboard Navigation Mapping**: Supports `WASD`, `Arrow Keys`, `Enter` (select), `Escape` (back/close), and `Q`/`E` (tab switching).
- **Dynamic Input Prompts**: Toggles top bar prompts between keyboard (`Q` / `E`) and gamepad (`L` / `R` or `L1` / `R1`).

---

## 3. Detailed Logic Behind Everything and How It Works

### Gamepad Polling & Focus Routing
- Polling runs inside a `requestAnimationFrame` loop in [App.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/App.jsx).
- Implements debounce logic using `lastInputTimeRef` (threshold: 180ms) to prevent accidental fast scrolling.
- Updates `focusedTarget`:
  - `D-Pad Left / Right`: Navigates grid columns or system tabs.
  - `D-Pad Up / Down`: Navigates grid rows or switches zone between `tabs` and `grid`.
  - `Button 0 (A / Cross)`: Triggers game card selection or system tab activation.
  - `Button 1 (B / Circle)`: Closes game detail drawer or modal.

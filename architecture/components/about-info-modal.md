# AboutInfoModal Component Specification

## 1. Description

The `AboutInfoModal` component provides an informational dialog about Retro Player, featuring project capabilities, multi-system support, synthesized audio feedback features, zero-config ROM drop-in, and an interactive keyboard and gamepad control reference table.

---

## 2. Detailed List of What It Does

- **Project Summary & Feature Highlights**: Displays supported systems, audio engine capabilities, cover scanner mechanics, and dynamic sorting.
- **Controls Reference Table**:
  - Tile Navigation (Arrow Keys / WASD vs D-Pad / Left Stick).
  - System Switching (Q / E / PageUp / PageDn vs L1 / R1).
  - Selection / Launch (Enter / Space vs A Button).
  - Search / Virtual Keyboard (⌘K / Ctrl+K vs Y Button / Select).
  - Back / Close (Escape / Backspace vs B Button).
  - Emulator Exit (Escape vs Select + Start / Guide).
- **Gamepad Navigation**: Supports focus navigation between Close (`X`) and `Got It!` acknowledgment buttons.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Events
- `isOpen` (boolean): Conditional visibility flag.
- `focusedTarget` (Object): Active spatial focus indicator.
- `onClose` (function): Triggers dialog exit and audio chime.

### Source Location
- Component: [src/components/AboutInfoModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/AboutInfoModal.jsx)

# AboutInfoModal Component Specification

## 1. Description

The `AboutInfoModal` component provides an informational dialog about Retro Player, featuring project capabilities, multi-system support, synthesized audio feedback features, zero-config ROM drop-in, and core engine specifications.

---

## 2. Detailed List of What It Does

- **Project Summary & Feature Highlights**: Displays supported systems, audio engine capabilities, cover scanner mechanics, and dynamic sorting.
- **System Specifications**: Highlights 12-platform WASM emulation, Web Audio synthesizer, and online scraper features.
- **Gamepad Navigation**: Supports focus navigation between Close (`X`) and `Got It!` acknowledgment buttons.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Events
- `isOpen` (boolean): Conditional visibility flag.
- `focusedTarget` (Object): Active spatial focus indicator.
- `onClose` (function): Triggers dialog exit and audio chime.

### Source Location
- Component: [src/components/AboutInfoModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/AboutInfoModal.jsx)

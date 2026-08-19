# Project Rules & Guidelines

1. Whenever a feature, module, or core app update is made, always update [README.md](file:///Users/godarayudhvir/Github/retro-player/README.md) and [architecture/README.md](file:///Users/godarayudhvir/Github/retro-player/architecture/README.md) and proceed following the guidelines defined in [architecture/README.md](file:///Users/godarayudhvir/Github/retro-player/architecture/README.md).
2. Never use automated browser testing tools like Playwright or subagent browser execution for testing. The user will handle all manual browser testing personally.
3. Ensure the entire application (every view, modal, wizard, button, and interactive component) is 100% navigable and controllable via both keyboard navigation (Arrow keys, Enter, Esc, Tab, Hotkeys) and USB/Bluetooth gamepads (D-Pad, Analog sticks, A/B/X/Y, L1/R1, Start/Select).
4. Never use native browser dialog popups (`window.alert`, `window.confirm`, `window.prompt`). Always build and use themed in-app modal dialogs, status banners, or confirmation dialogs with full keyboard and gamepad spatial navigation.
5. All views, components, modals, wizards, cards, ribbons, drawers, and menus must be 100% responsive and tested across all screen viewports: Mobile phones (< 640px), Tablets (640px - 1024px), Laptops/PCs (1024px - 1920px), and Large Displays/4K TV screens (> 1920px), utilizing fluid layouts, responsive typography, and media queries without content overflow or clipping.


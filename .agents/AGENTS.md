# Project Rules & Guidelines

1. Whenever a feature, module, or core app update is made, always update [README.md](file:///Users/godarayudhvir/Github/retro-player/README.md) and [architecture/README.md](file:///Users/godarayudhvir/Github/retro-player/architecture/README.md) and proceed following the guidelines defined in [architecture/README.md](file:///Users/godarayudhvir/Github/retro-player/architecture/README.md).
2. Never use automated browser testing tools like Playwright or subagent browser execution for testing. The user will handle all manual browser testing personally.
3. Ensure the entire application (every view, modal, wizard, button, and interactive component) is 100% navigable and controllable via both keyboard navigation (Arrow keys, Enter, Esc, Tab, Hotkeys) and USB/Bluetooth gamepads (D-Pad, Analog sticks, A/B/X/Y, L1/R1, Start/Select).
4. Never use native browser dialog popups (`alert()`, `confirm()`, `prompt()`). All user confirmations, alerts, warnings, and prompts MUST use custom styled in-app modal dialogs or status banners that match the console theme and support 100% keyboard and gamepad spatial navigation.


# LoadRomModal Component Specification

## 1. Description

The `LoadRomModal` component (`.info-modal-backdrop` + `.load-rom-modal`) provides a dedicated in-app modal dialog for loading local retro ROM files. Opening when the player clicks **LOAD ROM** in the topbar (or triggers it via gamepad/keyboard spatial navigation), it presents an interactive drag-and-drop dropzone, a file browser trigger, a visual catalog of supported console formats with official platform icons, and privacy guarantees.

---

## 2. Detailed List of What It Does

- **In-App Modal Shell**: Styled with glassmorphic backdrop (`.modal-backdrop.load-rom-backdrop`), pop-in animation, and dedicated theme-reactive classes (`.load-rom-modal-content`).
- **Full Theme Engine Fidelity**: Natively styled and overridden across all 4 system themes:
  - **iiSU Light**: Porcelain glass container with soft blue border and sky blue dropzone.
  - **Midnight Cyber**: `#0f172a` midnight panel with neon cyan borders, cyan dropzone glow, and cyan action buttons.
  - **Sony XMB Wave**: Deep indigo/obsidian panel `#0a1124` with translucent blue laser glow and silver accents.
  - **Game Boy DMG**: Retro olive LCD container `#8bac0f` with dark green `#0f380f` borders and monochrome pixel chip cards.
- **Interactive Modal Dropzone (`.load-rom-dropzone`)**:
  - Handles drag-over hover glow effects (`.drag-active`).
  - Supports direct file dropping onto the modal.
  - Clicking anywhere in the dropzone or clicking "Choose File" triggers the browser file picker.
- **Visual Supported Systems Catalog (`.load-rom-platforms-grid`)**:
  - Renders platform chips (`.load-rom-platform-chip`) with official SVG icons and supported extensions (GBA, GB, GBC, NES, SNES, N64, NDS, PS1, Sega Genesis, Arcade).
- **Client-Side Privacy Guarantee (`.load-rom-privacy-banner`)**:
  - Explicit notification assuring the user that ROMs run 100% locally in WebAssembly memory and are never uploaded to a remote server.
- **Gamepad & Keyboard Navigation**:
  - `Escape` or `B` button closes the modal.
  - Arrow keys / D-pad navigate between Cancel and Browse buttons.
- **Seamless Game Detail Transition**:
  - Upon selecting or dropping a file, `LoadRomModal` closes and automatically opens `GameDetailModal` for that game, detecting platform metadata and checking for existing save data before launching.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Lifecycle
- `isOpen` (boolean): Controls modal visibility.
- `focusedTarget` (Object): Active spatial focus coordinate.
- `onClose` (function): Closes modal and returns focus to topbar.
- `onFileLoaded` (function): Processes the selected `File` object through `processCustomRomFile(file)`.
- `sfx`: Audio synthesizer reference for modal opening and closing chimes.

### Source Location
- Component: [src/components/LoadRomModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/LoadRomModal.jsx)

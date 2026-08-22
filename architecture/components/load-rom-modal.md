# LoadRomModal Component Specification

## 1. Description

The `LoadRomModal` component (`.info-modal-backdrop` + `.load-rom-modal`) provides a dedicated in-app modal dialog for loading local retro ROM files. Opening when the player clicks **LOAD ROM** in the topbar (or triggers it via gamepad/keyboard spatial navigation), it presents an interactive drag-and-drop dropzone, a file browser trigger, a visual catalog of supported console formats with official platform icons, and privacy guarantees.

---

## 2. Detailed List of What It Does

- **In-App Modal Shell**: Styled with glassmorphic backdrop (`.modal-backdrop.load-rom-backdrop`), pop-in animation, and dedicated theme-reactive classes (`.load-rom-modal-content`).
- **Full Theme Engine Fidelity**: Natively styled across both console themes and both color modes:
  - **Vanilla Light**: Porcelain glass container with soft blue border and sky blue dropzone.
  - **Vanilla Dark**: Deep slate `#0f172a` panel with muted borders and dark dropzone.
  - **DS Touch Light**: Graph paper–style container with beveled borders matching the DS firmware aesthetic.
  - **DS Touch Dark**: Dark graph paper container with high-contrast accent borders.
- **Interactive Modal Dropzone (`.load-rom-dropzone`)**:
  - Handles drag-over hover glow effects (`.drag-active`).
  - Supports direct file dropping onto the modal.
  - Clicking anywhere in the dropzone or clicking "Choose File" triggers the browser file picker.
- **Visual Supported Systems Catalog (`.load-rom-platforms-grid`)**:
  - Renders platform chips (`.load-rom-platform-chip`) with official SVG icons and supported extensions (GBA, GB, GBC, NES, SNES, N64, NDS, PS1, Sega Genesis, Arcade).
- **100% Private Client-Side Play Guarantee (`.load-rom-privacy-banner`)**:
  - Informs the user that loaded custom ROMs execute directly in client WebAssembly memory and local IndexedDB cache without uploading files to the host server, ensuring absolute privacy for custom testing.
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
- `onClose` (function): Closes modal and returns focus to topbar (triggering modal close SFX at the root level).
- `onFileLoaded` (function): Processes the selected `File` object through `processCustomRomFile(file)`.

### Source Location
- Component: [src/components/LoadRomModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/LoadRomModal.jsx)

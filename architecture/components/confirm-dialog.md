# Confirmation Dialog (`architecture/components/confirm-dialog.md`)

## 1. Description
The **Confirmation Dialog** (`ConfirmDialog.jsx`) is a reusable, themed modal dialog component designed to replace all native browser popups (`window.confirm`, `window.alert`, `window.prompt`). It guarantees consistent visual design across all console themes and 100% accessibility with spatial keyboard and gamepad navigation.

---

## 2. Detailed List of What It Does
- **Themed Modal Backdrop & Container**:
  - High-blur glassmorphic overlay (`confirm-dialog-backdrop`) preventing click-through to underlying layers.
  - Scale-up transition animation (`confirm-dialog-container`).
- **Contextual Action Buttons**:
  - Cancel button (`confirm-btn-cancel`) mapped to `B` (Gamepad) and `Escape` (Keyboard).
  - Destructive Danger button (`confirm-btn-action danger`) with red glow or Primary action button (`confirm-btn-action primary`) with blue glow.
- **Audio SFX Synthesizer Integration**:
  - Emits UI open audio (`playModalOpen`) and modal close sounds (`playModalClose`) upon user interaction.
- **Full Theme Support**:
  - Adapts to all console themes (**iiSU Light**, **Midnight Cyber**, **Sony XMB**, and **DMG Game Boy**).

---

## 3. Detailed Logic Behind Everything and How It Works

### Props Contract
- `isOpen` (`boolean`): Controls modal rendering.
- `title` (`string`): Dialog heading (e.g., `"Delete ROM from Disk?"`, `"Delete Profile?"`).
- `message` (`string`): Explanatory confirmation text.
- `confirmText` (`string`): Label for confirm button (e.g., `"Delete"`, `"Confirm"`).
- `cancelText` (`string`): Label for cancellation button (e.g., `"Cancel"`).
- `isDanger` (`boolean`): When `true`, displays warning triangle and danger gradient.
- `onConfirm` (`function`): Callback executed when confirmed.
- `onCancel` (`function`): Callback executed when cancelled or background clicked.
- `sfx` (`object`): Web Audio SFX sound engine hook.

### Source Locations
- Component: [src/components/ConfirmDialog.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ConfirmDialog.jsx)
- Usage in Settings: [src/components/SettingsModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsModal.jsx)
- Usage in Profiles: [src/components/ProfileSelectModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ProfileSelectModal.jsx)
- CSS Styles: [src/index.css](file:///Users/godarayudhvir/Github/retro-player/src/index.css)

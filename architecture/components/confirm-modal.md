# Universal Confirmation Modal (`architecture/components/confirm-modal.md`)

## 1. Description
The **Universal Confirmation Modal** (`ConfirmModal.jsx`) is a specialized in-app dialog component that completely replaces native browser dialogs (`window.alert()`, `window.confirm()`, and `window.prompt()`). It provides a seamless console-grade confirmation prompt with glassmorphic backdrop, theme-aware color styling, and full keyboard/gamepad accessibility.

---

## 2. Detailed List of What It Does
- **100% In-App Dialog**: Replaces un-stylable native browser popups with an animated glassmorphic modal.
- **Destructive vs Primary Actions**: Dynamic red/blue styling depending on action severity (`isDestructive` prop).
- **Keyboard & Gamepad Spatial Navigation**:
  - Auto-focuses the confirm action button on mount.
  - Pressing `Enter` or Gamepad `A` confirms the action with acoustic audio feedback (`sfx.playMenuConfirm()`).
  - Pressing `Escape`, `Backspace`, or Gamepad `B` cancels the prompt smoothly.
- **Used Across Entire Application**:
  - Profile Deletion in [ProfileSelectModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ProfileSelectModal.jsx).
  - ROM Deletion from host disk in [SettingsModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsModal.jsx).
  - Background Music (BGM) Track Deletion in [SettingsModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/SettingsModal.jsx).

---

## 3. Detailed Logic Behind Everything and How It Works

### Props Contract
- `isOpen` (*boolean*): Controls dialog visibility.
- `title` (*string*): Dialog headline (e.g. "Delete Profile?").
- `message` (*string*): Descriptive warning text detailing the exact consequences of the action.
- `confirmLabel` (*string*): Text for confirm button (e.g. "Delete Profile", "Delete ROM").
- `cancelLabel` (*string*): Text for cancel button (default: "Cancel").
- `isDestructive` (*boolean*): When `true`, renders red gradient with trash icon.
- `onConfirm` (*function*): Execution callback when confirmed.
- `onCancel` (*function*): Dismissal callback when cancelled.
- `sfx` (*object*): Web Audio synthesized UI SFX engine.

### Source Locations
- Component: [src/components/ConfirmModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ConfirmModal.jsx)
- Styles: [src/index.css](file:///Users/godarayudhvir/Github/retro-player/src/index.css)

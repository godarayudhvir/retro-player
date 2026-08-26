/**
 * Core-Adaptive Keyboard Mapping Definitions for all 12 supported platforms in Retro Player / EmulatorJS.
 */

export const CORE_KEYBOARD_MAPPINGS = {
  nes: {
    systemKey: 'nes',
    systemName: 'Nintendo Entertainment System',
    color: '#ef4444',
    dpad: 'Arrow Keys (Up, Down, Left, Right)',
    actions: [
      { key: 'Z', label: 'B Button', desc: 'Primary Action / Attack / Run' },
      { key: 'X', label: 'A Button', desc: 'Jump / Confirm' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Mode / Item Select' },
      { key: 'Enter', label: 'Start', desc: 'Pause / Game Start' }
    ],
    tips: 'Use Arrow Keys for movement and Z / X for actions.'
  },
  snes: {
    systemKey: 'snes',
    systemName: 'Super Nintendo',
    color: '#8b5cf6',
    dpad: 'Arrow Keys (Up, Down, Left, Right)',
    actions: [
      { key: 'Z', label: 'B Button', desc: 'Action / Jump' },
      { key: 'X', label: 'A Button', desc: 'Action / Confirm' },
      { key: 'A', label: 'Y Button', desc: 'Secondary Action / Run' },
      { key: 'S', label: 'X Button', desc: 'Special Action / Menu' }
    ],
    shoulders: [
      { key: 'Q', label: 'L Shoulder', desc: 'Left Bumper' },
      { key: 'W', label: 'R Shoulder', desc: 'Right Bumper' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Select / Inventory' },
      { key: 'Enter', label: 'Start', desc: 'Pause / Game Start' }
    ],
    tips: 'Four face buttons (A, S, Z, X) and shoulders (Q, W).'
  },
  gb: {
    systemKey: 'gb',
    systemName: 'Game Boy',
    color: '#94a3b8',
    dpad: 'Arrow Keys (Up, Down, Left, Right)',
    actions: [
      { key: 'Z', label: 'B Button', desc: 'Cancel / Secondary' },
      { key: 'X', label: 'A Button', desc: 'Confirm / Jump' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Select' },
      { key: 'Enter', label: 'Start', desc: 'Start / Pause' }
    ],
    tips: 'Classic Game Boy dual-button setup.'
  },
  gbc: {
    systemKey: 'gbc',
    systemName: 'Game Boy Color',
    color: '#8b5cf6',
    dpad: 'Arrow Keys (Up, Down, Left, Right)',
    actions: [
      { key: 'Z', label: 'B Button', desc: 'Cancel / Secondary' },
      { key: 'X', label: 'A Button', desc: 'Confirm / Jump' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Select' },
      { key: 'Enter', label: 'Start', desc: 'Start / Pause' }
    ],
    tips: 'Game Boy Color dual-button setup.'
  },
  gba: {
    systemKey: 'gba',
    systemName: 'Game Boy Advance',
    color: '#6366f1',
    dpad: 'Arrow Keys (Up, Down, Left, Right)',
    actions: [
      { key: 'Z', label: 'B Button', desc: 'Cancel / Attack / Run' },
      { key: 'X', label: 'A Button', desc: 'Confirm / Jump' }
    ],
    shoulders: [
      { key: 'Q', label: 'L Shoulder', desc: 'Left Bumper' },
      { key: 'W', label: 'R Shoulder', desc: 'Right Bumper' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Select' },
      { key: 'Enter', label: 'Start', desc: 'Start / Pause' }
    ],
    tips: 'GBA has L & R shoulder triggers on Q and W.'
  },
  nds: {
    systemKey: 'nds',
    systemName: 'Nintendo DS',
    color: '#06b6d4',
    dpad: 'Arrow Keys (Up, Down, Left, Right)',
    actions: [
      { key: 'Z', label: 'B Button', desc: 'Face B' },
      { key: 'X', label: 'A Button', desc: 'Face A' },
      { key: 'A', label: 'Y Button', desc: 'Face Y' },
      { key: 'S', label: 'X Button', desc: 'Face X' }
    ],
    shoulders: [
      { key: 'Q', label: 'L Trigger', desc: 'Left Shoulder' },
      { key: 'W', label: 'R Trigger', desc: 'Right Shoulder' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Select' },
      { key: 'Enter', label: 'Start', desc: 'Start' },
      { key: 'Mouse Click', label: 'Touch Stylus', desc: 'Interact with touchscreen' }
    ],
    tips: 'Use mouse pointer to interact with the touch screen.'
  },
  n64: {
    systemKey: 'n64',
    systemName: 'Nintendo 64',
    color: '#f59e0b',
    dpad: 'Arrow Keys (Analog Stick Navigation)',
    actions: [
      { key: 'X', label: 'A Button (Blue)', desc: 'Jump / Primary Action' },
      { key: 'Z', label: 'B Button (Green)', desc: 'Attack / Cancel' }
    ],
    shoulders: [
      { key: 'Q', label: 'L Shoulder', desc: 'Left Bumper' },
      { key: 'W', label: 'R Shoulder', desc: 'Right Bumper' },
      { key: 'E / Space', label: 'Z-Trigger', desc: 'Z Index Trigger (Crouch / Shoot)' }
    ],
    special: [
      { key: 'I / K', label: 'C-Up / C-Down', desc: 'Camera / Item Up-Down' },
      { key: 'J / L', label: 'C-Left / C-Right', desc: 'Camera / Item Left-Right' }
    ],
    systemButtons: [
      { key: 'Enter', label: 'Start', desc: 'Pause Menu' }
    ],
    tips: 'Use I/J/K/L for C-Buttons and E/Space for the Z-Trigger.'
  },
  psx: {
    systemKey: 'ps1',
    systemName: 'PlayStation',
    color: '#6366f1',
    dpad: 'Arrow Keys (D-Pad)',
    actions: [
      { key: 'Z', label: '✕ Cross', desc: 'Select / Confirm / Jump' },
      { key: 'X', label: '○ Circle', desc: 'Back / Cancel / Attack' },
      { key: 'A', label: '□ Square', desc: 'Action / Punch / Brake' },
      { key: 'S', label: '△ Triangle', desc: 'Menu / Camera / Heavy Attack' }
    ],
    shoulders: [
      { key: 'Q', label: 'L1 Bumper', desc: 'Left Bumper' },
      { key: 'W', label: 'R1 Bumper', desc: 'Right Bumper' },
      { key: '1', label: 'L2 Trigger', desc: 'Left Trigger' },
      { key: '2', label: 'R2 Trigger', desc: 'Right Trigger' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Select', desc: 'Select / Map' },
      { key: 'Enter', label: 'Start', desc: 'Start / Pause' }
    ],
    tips: 'Full PlayStation 4-face and shoulder setup with Q/W/1/2.'
  },
  segaMD: {
    systemKey: 'genesis',
    systemName: 'Sega Genesis / Mega Drive',
    color: '#ec4899',
    dpad: 'Arrow Keys (D-Pad)',
    actions: [
      { key: 'Z', label: 'A Button', desc: 'Special / Dash / Magic' },
      { key: 'X', label: 'B Button', desc: 'Attack / Confirm' },
      { key: 'C', label: 'C Button', desc: 'Jump / Action' },
      { key: 'A', label: 'X Button (6-Btn)', desc: 'Secondary Attack' },
      { key: 'S', label: 'Y Button (6-Btn)', desc: 'Secondary Action' },
      { key: 'D', label: 'Z Button (6-Btn)', desc: 'Extra Action' }
    ],
    systemButtons: [
      { key: 'Shift', label: 'Mode', desc: 'Mode Button' },
      { key: 'Enter', label: 'Start', desc: 'Start / Pause' }
    ],
    tips: 'Supports standard 3-button (Z, X, C) and 6-button arcade layouts.'
  },
  segaGG: {
    systemKey: 'gamegear',
    systemName: 'Game Gear',
    color: '#14b8a6',
    dpad: 'Arrow Keys (D-Pad)',
    actions: [
      { key: 'Z', label: 'Button 1', desc: 'Action 1 / Cancel' },
      { key: 'X', label: 'Button 2', desc: 'Action 2 / Jump' }
    ],
    systemButtons: [
      { key: 'Enter', label: 'Start', desc: 'Start / Pause' }
    ],
    tips: 'Classic Game Gear handheld setup.'
  },
  mame2003_plus: {
    systemKey: 'arcade',
    systemName: 'Arcade (MAME)',
    color: '#f43f5e',
    dpad: 'Arrow Keys (Joystick)',
    actions: [
      { key: 'Ctrl / Z', label: 'Button 1', desc: 'Primary Action / Shoot' },
      { key: 'Alt / X', label: 'Button 2', desc: 'Jump / Bomb' },
      { key: 'Space / C', label: 'Button 3', desc: 'Special / Block' },
      { key: 'Shift / V', label: 'Button 4', desc: 'Extra Action' }
    ],
    systemButtons: [
      { key: '5 or 6', label: 'Insert Coin', desc: 'Add Credits (P1/P2)' },
      { key: '1 or 2', label: 'Start Player', desc: 'Start Game (P1/P2)' },
      { key: 'Tab', label: 'MAME Menu', desc: 'DIP switches & internal settings' }
    ],
    tips: 'Press 5 to Insert Coin, then 1 to Start!'
  },
  atari2600: {
    systemKey: 'atari2600',
    systemName: 'Atari 2600',
    color: '#d97706',
    dpad: 'Arrow Keys (Joystick Direction)',
    actions: [
      { key: 'Z / Space', label: 'Fire Button', desc: 'Primary Action / Fire' }
    ],
    systemButtons: [
      { key: 'F1 / Enter', label: 'Game Reset', desc: 'Reset / Start Game' },
      { key: 'F2', label: 'Game Select', desc: 'Select Game Variation' }
    ],
    tips: 'Single joystick with Z/Space to fire and Enter to start.'
  }
};

/**
 * Normalizes system core or system key into a keyboard mappings object.
 */
export function getKeyboardControlsForCore(core, systemKey) {
  let c = (core || '').toLowerCase();
  if (c === 'gbc') c = 'gbc';
  if (c === 'playstation' || c === 'ps1') c = 'psx';
  if (c === 'genesis' || c === 'megadrive' || c === 'sega' || c === 'segamd') c = 'segaMD';
  if (c === 'gamegear' || c === 'game_gear' || c === 'segagg') c = 'segaGG';
  if (c === 'arcade' || c === 'mame') c = 'mame2003_plus';
  if (c === 'atari' || c === 'atari_2600') c = 'atari2600';

  if (CORE_KEYBOARD_MAPPINGS[c]) {
    return CORE_KEYBOARD_MAPPINGS[c];
  }

  const k = (systemKey || '').toLowerCase();
  if (CORE_KEYBOARD_MAPPINGS[k]) {
    return CORE_KEYBOARD_MAPPINGS[k];
  }

  // Fallback to NES / Standard
  return CORE_KEYBOARD_MAPPINGS.nes;
}

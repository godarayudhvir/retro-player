# 📳 Haptic Touch Engine & Tactile Feedback Specification

## 1. Description
Provides a console-grade, hardware-accelerated tactile feedback engine using the browser Vibration API (`navigator.vibrate`) across mobile web and PWA touch interfaces. The Haptic Engine bridges web touch interactions and native handheld gaming consoles (Nintendo Switch HD Rumble, Nintendo 3DS tactile clicks, PlayStation DualSense micro-impulses), delivering subtle, millisecond-precision haptic pulses when navigating menus, launching games, unlocking achievements, and pressing virtual touch gamepad controls.

---

## 2. Detailed List of What It Will Do

- **Navigation & Menu Haptics**:
  - **Tab Switch (`10ms` Light Pulse)**: Subtle vibration when switching tabs in the bottom navigation dock (Library, Favorites, Recent, Trophies, Tools).
  - **Tile Selection (`12ms` Pulse)**: Tactile confirmation when tapping console cards or game cartridge tiles.
  - **Drawer & Modal Slide (`15ms` Pulse)**: Haptic acknowledgment when opening or closing sheets and modal dialogs.
- **In-Game Virtual Gamepad Haptics**:
  - **Face Buttons (`8ms` Micro-Pulse)**: Ultra-short haptic pulse on pressing D-Pad directions or A/B/X/Y/L/R touch controls in the mobile emulator overlay.
  - **Hold & Release Feedback**: Optional distinct pulse upon releasing charged actions or fast-forward buttons.
- **Achievement & Milestone Unlock Fanfare**:
  - **Trophy Pattern (`[25ms, 40ms, 25ms, 40ms, 60ms]`)**: Distinctive rhythm pattern fired in sync with achievement unlock toast notifications.
  - **Gym Badge Earned Pattern**: Special fanfare vibration sequence when a Pokémon Gym Badge or Elite Four victory is recognized.
- **User Preference & Battery Optimization**:
  - **Haptic Toggle Switch**: In-app setting under Mobile Tools Drawer / Settings to toggle haptics ON/OFF.
  - **Battery Saver Awareness**: Automatically disables or reduces pulse intensity when the device battery is critical (`<= 15%`).
  - **Graceful Fallback**: Zero runtime exceptions on desktop or iOS Safari versions without `navigator.vibrate` support.

---

## 3. Detailed Logic Behind It

```
┌─────────────────────────────────────────────────────────────┐
│                 HapticFeedback Service                      │
│            (src/services/hapticsService.js)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  Hardware & API Check        │    │  User Preference & Battery   │
│  • 'vibrate' in navigator    │    │  • localStorage: haptics_on  │
│  • iOS WebKit detection      │    │  • Battery API <= 15%        │
└──────────────┬───────────────┘    └──────────────┬───────────────┘
               │                                   │
               └─────────────────┬─────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 Haptic Intensity Profiles                   │
│                                                             │
│  • light():      navigator.vibrate(8)   (Virtual buttons)   │
│  • selection():  navigator.vibrate(12)  (Tabs & tiles)      │
│  • medium():     navigator.vibrate(18)  (Drawer / modals)   │
│  • success():    navigator.vibrate([15, 30, 20])            │
│  • trophy():     navigator.vibrate([25, 40, 25, 40, 60])    │
│  • error():      navigator.vibrate([30, 50, 30])            │
└─────────────────────────────────────────────────────────────┘
```

### Flow & Edge Cases:
1. **User Interaction Gate**: Browsers require a user gesture (touch event) prior to allowing `navigator.vibrate`. The service only triggers inside active pointer/touch event handlers.
2. **iOS Safari Considerations**: iOS Safari does not support `navigator.vibrate` on standard web views. The engine wraps calls in `if (typeof navigator !== 'undefined' && 'vibrate' in navigator)` and silently falls back to Web Audio sound effects (`sfx.play()`) on non-supported platforms.
3. **Throttling Engine**: Rapid touch streams (e.g. holding virtual D-pad) throttle pulse requests to a maximum frequency of `35ms` to prevent motor stutter and battery drain.

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Create Haptics Service Utility
Create `src/services/hapticsService.js`:
```javascript
class HapticFeedbackService {
  constructor() {
    this.isEnabled = this.getStoredPreference();
    this.lastPulseTime = 0;
    this.throttleMs = 35;
  }

  getStoredPreference() {
    try {
      const stored = localStorage.getItem('retro_haptics_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  }

  setPreference(enabled) {
    this.isEnabled = Boolean(enabled);
    try {
      localStorage.setItem('retro_haptics_enabled', this.isEnabled ? 'true' : 'false');
    } catch {}
  }

  pulse(pattern) {
    if (!this.isEnabled) return;
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

    const now = performance.now();
    if (now - this.lastPulseTime < this.throttleMs && !Array.isArray(pattern)) return;
    this.lastPulseTime = now;

    try {
      navigator.vibrate(pattern);
    } catch {}
  }

  // Predefined Presets
  light() { this.pulse(8); }
  selection() { this.pulse(12); }
  medium() { this.pulse(18); }
  success() { this.pulse([15, 30, 20]); }
  trophy() { this.pulse([25, 40, 25, 40, 60]); }
  error() { this.pulse([30, 50, 30]); }
}

export const haptics = new HapticFeedbackService();
```

### Step 2: Wire Haptics into Mobile Navigation & Touch Controls
In `src/components/MobileAppView.jsx`:
```javascript
import { haptics } from '../services/hapticsService';

// On tab switches
onClick={() => {
  setSelectedSystem(sys);
  sfx?.playTabSwitch?.();
  haptics.selection();
}}

// On game selection
onClick={() => {
  setSelectedGameForDetails(game);
  sfx?.playTileNav?.();
  haptics.medium();
}}
```

### Step 3: Wire Haptics into Virtual Gamepad Overlay
In `src/components/EmulatorModal.jsx` (touch button handlers):
```javascript
const handleTouchStart = (button) => {
  simulateGamepadInput(button, 1);
  haptics.light();
};
```

### Step 4: Wire Haptics into Achievement Toast Notification
In `src/hooks/useAchievements.js`:
```javascript
triggerToast(entry) {
  haptics.trophy();
  // ... show toast
}
```

/**
 * HapticFeedbackService
 * Console-grade, hardware-accelerated tactile feedback engine using navigator.vibrate.
 * Provides micro-tactile impulses (Variant A) with rate limiting, battery-saver awareness,
 * and graceful fallback for desktop and iOS Safari webviews.
 */
class HapticFeedbackService {
  constructor() {
    this.isEnabled = this.getStoredPreference();
    this.lastPulseTime = 0;
    this.throttleMs = 35;
    this.isBatteryCritical = false;

    // Monitor battery level if Battery Status API is available
    if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
      navigator.getBattery().then((battery) => {
        this.updateBatteryStatus(battery);
        battery.addEventListener('levelchange', () => this.updateBatteryStatus(battery));
        battery.addEventListener('chargingchange', () => this.updateBatteryStatus(battery));
      }).catch(() => {});
    }
  }

  updateBatteryStatus(battery) {
    // Suppress haptics if battery is 15% or lower and not charging
    this.isBatteryCritical = Boolean(battery && battery.level <= 0.15 && !battery.charging);
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
      window.dispatchEvent(new CustomEvent('retro_haptics_changed', { detail: { enabled: this.isEnabled } }));
    } catch {}
  }

  pulse(pattern) {
    if (!this.isEnabled || this.isBatteryCritical) return;
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

    const now = performance.now();
    // Allow multi-pulse arrays (fanfares) through; throttle rapid single pulses
    if (now - this.lastPulseTime < this.throttleMs && !Array.isArray(pattern)) return;
    this.lastPulseTime = now;

    try {
      navigator.vibrate(pattern);
    } catch {}
  }

  // Variant A: Micro-Tactile Presets
  /** 8ms micro-pulse for virtual gamepad buttons and D-Pad touches */
  light() {
    this.pulse(8);
  }

  /** 12ms crisp pulse for carousel ticks, tab switches, and system filter pills */
  selection() {
    this.pulse(12);
  }

  /** 18ms tactile acknowledgment for opening sheets, drawers, or launching cartridge details */
  medium() {
    this.pulse(18);
  }

  /** Multi-step pulse [15, 30, 20] for successful quick save or battery export */
  success() {
    this.pulse([15, 30, 20]);
  }

  /** Fanfare rhythm [25, 40, 25, 40, 60] for achievement & milestone unlocks */
  trophy() {
    this.pulse([25, 40, 25, 40, 60]);
  }

  /** Double bump [30, 50, 30] for errors or invalid actions */
  error() {
    this.pulse([30, 50, 30]);
  }
}

export const haptics = new HapticFeedbackService();

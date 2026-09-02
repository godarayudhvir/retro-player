import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to track HTML5 Gamepad connection state, hardware identity, and battery telemetry.
 * Supports standard gamepad.battery API as well as fallback status and low-battery warnings.
 *
 * @param {Object} options
 * @param {Function} [options.onLowBattery] - Optional callback triggered on low battery thresholds (<=20%, <=10%)
 * @param {Object} [options.sfx] - Optional SFX audio player for chime alerts
 */
export function useGamepadStatus(options = {}) {
  const { onLowBattery, sfx } = options;

  const [gamepadConnected, setGamepadConnected] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const pads = navigator.getGamepads();
      for (let i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) return true;
      }
    }
    return false;
  });

  const [gamepadId, setGamepadId] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(null); // null if unavailable, 0 to 1 (e.g. 0.85 = 85%)
  const [isCharging, setIsCharging] = useState(false);
  const [hasBatteryInfo, setHasBatteryInfo] = useState(false);
  const [lowBatteryAlert, setLowBatteryAlert] = useState(null); // { levelPercent, isCritical, timestamp }

  // Track warned states to avoid repeating chime spam
  const warnedRef = useRef({ low20: false, crit10: false });
  const onLowBatteryRef = useRef(onLowBattery);
  const sfxRef = useRef(sfx);

  useEffect(() => {
    onLowBatteryRef.current = onLowBattery;
    sfxRef.current = sfx;
  }, [onLowBattery, sfx]);

  // Inspect and extract battery telemetry from the primary active connected gamepad
  const inspectGamepadBattery = useCallback(() => {
    if (typeof window !== 'undefined' && window.__mockGamepadBatteryData) return;
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let foundPad = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) {
        foundPad = pads[i];
        break;
      }
    }

    if (!foundPad) {
      setGamepadConnected(false);
      setGamepadId('');
      setBatteryLevel(null);
      setIsCharging(false);
      setHasBatteryInfo(false);
      warnedRef.current = { low20: false, crit10: false };
      return;
    }

    setGamepadConnected(true);
    setGamepadId(foundPad.id || 'Standard Gamepad');

    // Standard HTML5 Gamepad Battery Extension (gamepad.battery)
    // Some browsers expose pad.battery as a BatteryManager or plain object { level: 0..1, charging: boolean }
    const padBattery = foundPad.battery || (foundPad.details && foundPad.details.battery);

    if (padBattery && typeof padBattery.level === 'number' && !isNaN(padBattery.level)) {
      const level = Math.max(0, Math.min(1, padBattery.level));
      const charging = Boolean(padBattery.charging);
      const levelPercent = Math.round(level * 100);

      setBatteryLevel(level);
      setIsCharging(charging);
      setHasBatteryInfo(true);

      // Low Battery Threshold Evaluation (when not actively plugged in and charging)
      if (!charging) {
        if (level <= 0.10 && !warnedRef.current.crit10) {
          warnedRef.current.crit10 = true;
          warnedRef.current.low20 = true;
          const alertData = {
            levelPercent,
            isCritical: true,
            message: `Gamepad battery is critically low (${levelPercent}%)! Connect USB charger now.`,
            timestamp: Date.now()
          };
          setLowBatteryAlert(alertData);
          sfxRef.current?.playBatteryLow?.();
          onLowBatteryRef.current?.(alertData);
        } else if (level <= 0.20 && level > 0.10 && !warnedRef.current.low20) {
          warnedRef.current.low20 = true;
          const alertData = {
            levelPercent,
            isCritical: false,
            message: `Gamepad battery low (${levelPercent}%). Consider plugging in soon.`,
            timestamp: Date.now()
          };
          setLowBatteryAlert(alertData);
          sfxRef.current?.playBatteryLow?.();
          onLowBatteryRef.current?.(alertData);
        }
      } else {
        // Reset warning flags if user plugged in and started charging
        warnedRef.current = { low20: false, crit10: false };
      }
    } else {
      // Hardware does not expose battery API (e.g., standard wired USB controller)
      setBatteryLevel(null);
      setIsCharging(false);
      setHasBatteryInfo(false);
    }
  }, []);

  // Event Listeners for connect/disconnect + Polling Interval for battery level changes
  useEffect(() => {
    const handleConnect = (e) => {
      const id = e.gamepad?.id || 'Standard Gamepad';
      console.log(`🎮 [GAMEPAD CONNECTED] Controller detected: "${id}"`);
      inspectGamepadBattery();
    };

    const handleDisconnect = (e) => {
      const id = e.gamepad?.id || 'Gamepad';
      console.log(`🔌 [GAMEPAD DISCONNECTED] Controller removed: "${id}"`);
      inspectGamepadBattery();
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // Initial check
    inspectGamepadBattery();

    // Poll battery telemetry every 3 seconds while active
    const interval = setInterval(inspectGamepadBattery, 3000);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      clearInterval(interval);
    };
  }, [inspectGamepadBattery]);

  // Dev testing helper exposed to window for manual UI & telemetry verification
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__mockGamepadBattery = (mockData) => {
      if (mockData === null || mockData === undefined) {
        console.log('🔄 [GAMEPAD TELEMETRY] Restoring real hardware battery inspection.');
        window.__mockGamepadBatteryData = null;
        inspectGamepadBattery();
        return;
      }

      const levelNum = typeof mockData === 'number' ? mockData : (mockData.level ?? 85);
      const level = Math.max(0, Math.min(1, levelNum > 1 ? levelNum / 100 : levelNum));
      const charging = Boolean(mockData.charging || mockData.isCharging);
      const padId = mockData.id || mockData.gamepadId || 'Wireless Controller (Simulated)';
      const levelPercent = Math.round(level * 100);

      window.__mockGamepadBatteryData = { level, charging, padId };
      setGamepadConnected(true);
      setGamepadId(padId);
      setBatteryLevel(level);
      setIsCharging(charging);
      setHasBatteryInfo(true);

      if (!charging) {
        if (level <= 0.10) {
          const alertData = {
            levelPercent,
            isCritical: true,
            message: `Gamepad battery is critically low (${levelPercent}%)! Connect USB charger now.`,
            timestamp: Date.now()
          };
          setLowBatteryAlert(alertData);
          sfxRef.current?.playBatteryLow?.();
          onLowBatteryRef.current?.(alertData);
        } else if (level <= 0.20) {
          const alertData = {
            levelPercent,
            isCritical: false,
            message: `Gamepad battery low (${levelPercent}%). Consider plugging in soon.`,
            timestamp: Date.now()
          };
          setLowBatteryAlert(alertData);
          sfxRef.current?.playBatteryLow?.();
          onLowBatteryRef.current?.(alertData);
        } else {
          setLowBatteryAlert(null);
        }
      } else {
        setLowBatteryAlert(null);
      }

      console.log(`🔋 [GAMEPAD TELEMETRY SIMULATED] Level: ${levelPercent}%, Charging: ${charging}, Controller: "${padId}"`);
    };

    return () => {
      delete window.__mockGamepadBattery;
      delete window.__mockGamepadBatteryData;
    };
  }, [inspectGamepadBattery]);

  // Auto-dismiss low battery alert after 6 seconds to avoid blocking viewport
  useEffect(() => {
    if (!lowBatteryAlert) return;
    const timer = setTimeout(() => {
      setLowBatteryAlert(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [lowBatteryAlert]);

  // Method to dismiss an active low battery alert notification
  const dismissBatteryAlert = useCallback(() => {
    setLowBatteryAlert(null);
  }, []);

  return {
    gamepadConnected,
    gamepadId,
    batteryLevel,
    batteryPercent: batteryLevel !== null ? Math.round(batteryLevel * 100) : null,
    isCharging,
    hasBatteryInfo,
    lowBatteryAlert,
    dismissBatteryAlert,
    setGamepadConnected
  };
}

import { useState, useEffect } from 'react';

/**
 * Hook to track HTML5 Gamepad connection state and identity.
 */
export function useGamepadStatus() {
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

  useEffect(() => {
    const handleConnect = (e) => {
      const id = e.gamepad?.id || 'Standard Gamepad';
      console.log(`🎮 [GAMEPAD CONNECTED] Controller detected: "${id}"`);
      setGamepadConnected(true);
      setGamepadId(id);
    };

    const handleDisconnect = (e) => {
      const id = e.gamepad?.id || 'Gamepad';
      console.log(`🔌 [GAMEPAD DISCONNECTED] Controller removed: "${id}"`);
      
      // Check if any other gamepad is still connected
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      let anyConnected = false;
      let remainingId = '';
      for (let i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) {
          anyConnected = true;
          remainingId = pads[i].id;
          break;
        }
      }
      setGamepadConnected(anyConnected);
      setGamepadId(remainingId);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

  return { gamepadConnected, gamepadId, setGamepadConnected };
}

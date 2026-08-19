import React from 'react';

/**
 * Console Bottom Controller HUD displaying interactive shoulder system switcher capsule
 * and active gamepad or keyboard control hints.
 */
export default function ConsoleHud({
  gamepadConnected,
  activeSystem,
  systems,
  setActiveSystem,
  focusedTarget,
  setFocusedTarget,
  sfx
}) {
  const handlePrevSystem = () => {
    if (!systems || !setActiveSystem) return;
    const availableKeys = ['all', ...systems.filter(s => s.gameCount > 0).sort((a, b) => b.gameCount - a.gameCount).map(s => s.key)];
    const prevIdx = (availableKeys.indexOf(activeSystem) - 1 + availableKeys.length) % availableKeys.length;
    setActiveSystem(availableKeys[prevIdx]);
    setFocusedTarget?.({ zone: 'ribbon', index: prevIdx });
    sfx?.playTabSwitch?.();
  };

  const handleNextSystem = () => {
    if (!systems || !setActiveSystem) return;
    const availableKeys = ['all', ...systems.filter(s => s.gameCount > 0).sort((a, b) => b.gameCount - a.gameCount).map(s => s.key)];
    const nextIdx = (availableKeys.indexOf(activeSystem) + 1) % availableKeys.length;
    setActiveSystem(availableKeys[nextIdx]);
    setFocusedTarget?.({ zone: 'ribbon', index: nextIdx });
    sfx?.playTabSwitch?.();
  };

  return (
    <footer className="console-hud">
      {/* Interactive Shoulder Switcher Capsule */}
      <div className="footer-shoulder-capsule">
        <button 
          className="shoulder-btn left-shoulder" 
          onClick={handlePrevSystem}
          title="Previous System (L1 / Q)"
          aria-label="Previous System"
        >
          <span className="shoulder-trigger">L1</span>
          <span className="shoulder-key-tag">{gamepadConnected ? 'L' : 'Q'}</span>
        </button>

        <span className="footer-capsule-label">SYSTEM</span>

        <button 
          className="shoulder-btn right-shoulder" 
          onClick={handleNextSystem}
          title="Next System (R1 / E)"
          aria-label="Next System"
        >
          <span className="shoulder-key-tag">{gamepadConnected ? 'R' : 'E'}</span>
          <span className="shoulder-trigger">R1</span>
        </button>
      </div>

      <div className="hud-button-group">
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'D-PAD / STICK' : 'ARROWS / WASD'}</div>
          <span>Navigate</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'A' : 'ENTER'}</div>
          <span>Select / Play</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'X' : 'F'}</div>
          <span>Favorite ⭐</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'Y' : '⌘K / T'}</div>
          <span>Search / Theme</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'B' : 'ESC'}</div>
          <span>Back</span>
        </div>
      </div>
    </footer>
  );
}

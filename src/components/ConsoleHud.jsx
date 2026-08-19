import React from 'react';

/**
 * Console Bottom Controller HUD displaying active gamepad or keyboard control hints.
 */
export default function ConsoleHud({ gamepadConnected }) {
  return (
    <footer className="console-hud">
      <div className="hud-button-group">
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'LB / RB' : 'Q / E'}</div>
          <span>Switch System</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'D-PAD / STICK' : 'ARROWS / WASD'}</div>
          <span>Navigate</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'A BUTTON' : 'ENTER / SPACE'}</div>
          <span>Launch Game</span>
        </div>
        <div className="hud-btn">
          <div className="button-icon-circle">{gamepadConnected ? 'B BUTTON' : 'ESC / BACKSPACE'}</div>
          <span>Back</span>
        </div>
      </div>
    </footer>
  );
}

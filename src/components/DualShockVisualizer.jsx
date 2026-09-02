import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Radio, Sparkles } from 'lucide-react';

/**
 * Diagram-Integrated DualShock 4 Controller Visualizer
 * - Vector callout leader lines pointing directly from buttons to clean callout tags (left & right sides).
 * - Real-time Gamepad API button and stick detection with glowing active states.
 * - Zero-latency synthesized Web Audio SFX clicks/ticks on button presses.
 * - Interactive: hover or click any callout or button to focus and inspect.
 */

export const DUALSHOCK_ACTIONS = {
  // Left side mappings
  l2: {
    id: 'l2',
    label: 'L2 (LT)',
    action: 'Analog Trigger',
    desc: 'Analog trigger input for supported games (N64 Z/L, PS1 L2).',
    accent: '#6366f1'
  },
  l1: {
    id: 'l1',
    label: 'L1 (LB)',
    action: 'Previous System',
    desc: 'Cycle left to previous console ribbon (GBA, SNES, N64...).',
    accent: '#8b5cf6'
  },
  touchpad: {
    id: 'touchpad',
    label: 'TOUCHPAD / CLICK',
    action: 'NDS Stylus & Touch',
    desc: 'Acts as Nintendo DS interactive touchscreen stylus and menu cursor.',
    accent: '#06b6d4'
  },
  share: {
    id: 'share',
    label: 'SHARE / SELECT',
    action: 'Toggle Favorite ⭐',
    desc: 'Bookmarks highlighted game into your Favorites collection.',
    accent: '#f59e0b'
  },
  dpad: {
    id: 'dpad',
    label: 'D-PAD',
    action: 'Spatial Navigation',
    desc: 'Navigate cartridges, menus, and on-screen keyboard keys.',
    accent: '#3b82f6'
  },
  l3: {
    id: 'l3',
    label: 'L3 STICK CLICK',
    action: 'Card Density / HUD',
    desc: 'Cycle tile size (S→XXL) in library, or open in-game HUD.',
    accent: '#f59e0b'
  },

  // Right side mappings
  r2: {
    id: 'r2',
    label: 'R2 (RT)',
    action: 'Analog Trigger',
    desc: 'Analog trigger input for supported games (N64 R, PS1 R2).',
    accent: '#6366f1'
  },
  r1: {
    id: 'r1',
    label: 'R1 (RB)',
    action: 'Next System / Tab',
    desc: 'Cycle right to next console ribbon or submit in OSK.',
    accent: '#8b5cf6'
  },
  options: {
    id: 'options',
    label: 'OPTIONS / START',
    action: 'Quick-Launch Game',
    desc: 'Instantly launch highlighted cartridge without opening details.',
    accent: '#10b981'
  },
  triangle: {
    id: 'triangle',
    label: '△ TRIANGLE (Y)',
    action: 'Search Virtual OSK',
    desc: 'Opens full-screen Gamepad Search Keyboard.',
    accent: '#10b981'
  },
  circle: {
    id: 'circle',
    label: '○ CIRCLE (B)',
    action: 'Back / Cancel',
    desc: 'Dismiss modals, return home, or cancel dialog prompts.',
    accent: '#ef4444'
  },
  cross: {
    id: 'cross',
    label: '✕ CROSS (A)',
    action: 'Select / Confirm',
    desc: 'Launch selected game or activate focused button.',
    accent: '#3b82f6'
  },
  square: {
    id: 'square',
    label: '□ SQUARE (X)',
    action: 'Boxart Scraper',
    desc: 'Opens metadata scraper or deletes character in OSK.',
    accent: '#ec4899'
  },
  r3: {
    id: 'r3',
    label: 'R3 STICK CLICK',
    action: 'Wide View Mode',
    desc: 'Toggle wide panoramic cartridge library presentation mode.',
    accent: '#06b6d4'
  },
  combo: {
    id: 'combo',
    label: 'L3 + R3',
    action: 'Direct Exit & Save',
    desc: 'Flushes battery SRAM, captures Slot 1 resume snapshot, returns home.',
    accent: '#dc2626'
  }
};

export default function DualShockVisualizer({
  sfx,
  gamepadConnected = false,
  focusedTarget,
  setFocusedTarget
}) {
  const [pressedButtons, setPressedButtons] = useState({});
  const [analogAxes, setAnalogAxes] = useState({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const [gamepadInfo, setGamepadInfo] = useState({ id: 'DualShock 4 / Standard Gamepad' });
  const [activeActionId, setActiveActionId] = useState('cross');
  const prevPressedRef = useRef({});

  // Real-time Gamepad API Polling
  useEffect(() => {
    let animId;
    const DEADZONE = 0.25;

    const pollInputs = () => {
      const gamepads = (navigator.getGamepads ? navigator.getGamepads() : []);
      const gp = Array.from(gamepads).find(g => g && g.connected);

      if (gp && gp.buttons) {
        setGamepadInfo({
          id: gp.id?.replace(/\s*\([^)]*\)/g, '').slice(0, 32) || 'DualShock 4 Wireless Controller'
        });

        const b = gp.buttons;
        const lx = gp.axes[0] || 0;
        const ly = gp.axes[1] || 0;
        const rx = gp.axes[2] || 0;
        const ry = gp.axes[3] || 0;

        const currentPressed = {
          cross: Boolean(b[0]?.pressed),
          circle: Boolean(b[1]?.pressed),
          square: Boolean(b[2]?.pressed),
          triangle: Boolean(b[3]?.pressed),
          l1: Boolean(b[4]?.pressed),
          r1: Boolean(b[5]?.pressed),
          l2: Boolean(b[6]?.pressed || (b[6]?.value && b[6].value > 0.15)),
          r2: Boolean(b[7]?.pressed || (b[7]?.value && b[7].value > 0.15)),
          share: Boolean(b[8]?.pressed),
          options: Boolean(b[9]?.pressed),
          l3: Boolean(b[10]?.pressed),
          r3: Boolean(b[11]?.pressed),
          dpad: Boolean(b[12]?.pressed || b[13]?.pressed || b[14]?.pressed || b[15]?.pressed),
          dpad_up: Boolean(b[12]?.pressed),
          dpad_down: Boolean(b[13]?.pressed),
          dpad_left: Boolean(b[14]?.pressed),
          dpad_right: Boolean(b[15]?.pressed),
          touchpad: Boolean(b[17]?.pressed)
        };

        if (currentPressed.l3 && currentPressed.r3) {
          currentPressed.combo = true;
        }

        // Trigger Audio Feedback & selection update on button edge
        Object.entries(currentPressed).forEach(([key, isPressed]) => {
          if (isPressed && !prevPressedRef.current[key]) {
            const mappedKey = key.startsWith('dpad_') ? 'dpad' : key;
            setActiveActionId(mappedKey);
            if (sfx) {
              if (key === 'cross' || key === 'options') sfx.playKeyTick?.();
              else if (key === 'circle') sfx.playModalClose?.();
              else if (key === 'share') sfx.playFavoriteToggle?.(true);
              else if (key === 'l1' || key === 'r1') sfx.playTabSwitch?.();
              else sfx.playTileNav?.();
            }
          }
        });

        prevPressedRef.current = currentPressed;
        setPressedButtons(currentPressed);
        setAnalogAxes({
          lx: Math.abs(lx) > DEADZONE ? lx : 0,
          ly: Math.abs(ly) > DEADZONE ? ly : 0,
          rx: Math.abs(rx) > DEADZONE ? rx : 0,
          ry: Math.abs(ry) > DEADZONE ? ry : 0
        });
      } else {
        setPressedButtons({});
        setAnalogAxes({ lx: 0, ly: 0, rx: 0, ry: 0 });
      }

      animId = requestAnimationFrame(pollInputs);
    };

    animId = requestAnimationFrame(pollInputs);
    return () => cancelAnimationFrame(animId);
  }, [sfx]);

  const activeAction = DUALSHOCK_ACTIONS[activeActionId] || DUALSHOCK_ACTIONS.cross;

  const leftStickOffset = {
    x: (analogAxes.lx * 8).toFixed(1),
    y: (analogAxes.ly * 8).toFixed(1)
  };

  const rightStickOffset = {
    x: (analogAxes.rx * 8).toFixed(1),
    y: (analogAxes.ry * 8).toFixed(1)
  };

  const handleSelectKey = (key) => {
    setActiveActionId(key);
    sfx?.playTileNav?.();
  };

  return (
    <div className="diagram-tester-card animate-fade-in">
      {/* SVG Diagram Canvas with Embedded Leader Lines & Callout Labels */}
      <div className="diagram-canvas-container">
        <svg
          viewBox="0 0 1060 480"
          className="diagram-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* =========================================================
              LEFT SIDE LEADER LINES & CALLOUTS (Spread Out & Enlarged)
             ========================================================= */}
          
          {/* L2 (LT) */}
          <g
            className={`diagram-callout ${pressedButtons.l2 ? 'is-pressed' : ''} ${activeActionId === 'l2' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('l2')}
          >
            <polyline points="290,35 200,35 150,35" className="diagram-line" />
            <circle cx="290" cy="35" r="4" className="diagram-anchor-dot" />
            <g transform="translate(10, 18)">
              <rect width="138" height="34" rx="6" className="diagram-pill-bg" />
              <text x="69" y="15" className="diagram-pill-key">L2 TRIGGER</text>
              <text x="69" y="27" className="diagram-pill-action">Analog Action</text>
            </g>
          </g>

          {/* L1 (LB) */}
          <g
            className={`diagram-callout ${pressedButtons.l1 ? 'is-pressed' : ''} ${activeActionId === 'l1' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('l1')}
          >
            <polyline points="360,68 260,82 150,82" className="diagram-line" />
            <circle cx="360" cy="68" r="4" className="diagram-anchor-dot" />
            <g transform="translate(10, 65)">
              <rect width="138" height="34" rx="6" className="diagram-pill-bg" />
              <text x="69" y="15" className="diagram-pill-key">L1 BUMPER</text>
              <text x="69" y="27" className="diagram-pill-action">Prev System</text>
            </g>
          </g>

          {/* TOUCHPAD / NDS STYLUS */}
          <g
            className={`diagram-callout ${pressedButtons.touchpad ? 'is-pressed' : ''} ${activeActionId === 'touchpad' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('touchpad')}
          >
            <polyline points="475,130 300,129 150,129" className="diagram-line" />
            <circle cx="475" cy="130" r="4" className="diagram-anchor-dot" />
            <g transform="translate(10, 112)">
              <rect width="138" height="34" rx="6" className="diagram-pill-bg" />
              <text x="69" y="15" className="diagram-pill-key" style={{ fill: '#06b6d4' }}>TOUCHPAD</text>
              <text x="69" y="27" className="diagram-pill-action">NDS Touch Stylus ✍️</text>
            </g>
          </g>

          {/* SHARE */}
          <g
            className={`diagram-callout ${pressedButtons.share ? 'is-pressed' : ''} ${activeActionId === 'share' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('share')}
          >
            <polyline points="418,140 290,176 150,176" className="diagram-line" />
            <circle cx="418" cy="140" r="4" className="diagram-anchor-dot" />
            <g transform="translate(10, 159)">
              <rect width="138" height="34" rx="6" className="diagram-pill-bg" />
              <text x="69" y="15" className="diagram-pill-key">SHARE / SELECT</text>
              <text x="69" y="27" className="diagram-pill-action">Favorite ⭐</text>
            </g>
          </g>

          {/* D-PAD */}
          <g
            className={`diagram-callout ${pressedButtons.dpad ? 'is-pressed' : ''} ${activeActionId === 'dpad' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('dpad')}
          >
            <polyline points="370,195 260,223 150,223" className="diagram-line" />
            <circle cx="370" cy="195" r="4" className="diagram-anchor-dot" />
            <g transform="translate(10, 206)">
              <rect width="138" height="34" rx="6" className="diagram-pill-bg" />
              <text x="69" y="15" className="diagram-pill-key">D-PAD (ARROWS)</text>
              <text x="69" y="27" className="diagram-pill-action">Spatial Navigation</text>
            </g>
          </g>

          {/* L3 STICK */}
          <g
            className={`diagram-callout ${pressedButtons.l3 ? 'is-pressed' : ''} ${activeActionId === 'l3' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('l3')}
          >
            <polyline points="440,285 300,290 150,290" className="diagram-line" />
            <circle cx="440" cy="285" r="4" className="diagram-anchor-dot" />
            <g transform="translate(10, 273)">
              <rect width="138" height="34" rx="6" className="diagram-pill-bg" />
              <text x="69" y="15" className="diagram-pill-key">L3 STICK CLICK</text>
              <text x="69" y="27" className="diagram-pill-action">Density / HUD</text>
            </g>
          </g>

          {/* =========================================================
              RIGHT SIDE LEADER LINES & CALLOUTS (Spread Out & Enlarged)
             ========================================================= */}
          
          {/* R2 (RT) */}
          <g
            className={`diagram-callout ${pressedButtons.r2 ? 'is-pressed' : ''} ${activeActionId === 'r2' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('r2')}
          >
            <polyline points="790,35 860,35 910,45" className="diagram-line" />
            <circle cx="790" cy="35" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 26)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key">R2 TRIGGER</text>
              <text x="70" y="27" className="diagram-pill-action">Analog Action</text>
            </g>
          </g>

          {/* R1 (RB) */}
          <g
            className={`diagram-callout ${pressedButtons.r1 ? 'is-pressed' : ''} ${activeActionId === 'r1' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('r1')}
          >
            <polyline points="720,68 820,85 910,85" className="diagram-line" />
            <circle cx="720" cy="68" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 68)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key">R1 BUMPER</text>
              <text x="70" y="27" className="diagram-pill-action">Next System / Tab</text>
            </g>
          </g>

          {/* OPTIONS */}
          <g
            className={`diagram-callout ${pressedButtons.options ? 'is-pressed' : ''} ${activeActionId === 'options' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('options')}
          >
            <polyline points="662,125 780,135 910,135" className="diagram-line" />
            <circle cx="662" cy="125" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 118)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key">OPTIONS / START</text>
              <text x="70" y="27" className="diagram-pill-action">Quick-Launch</text>
            </g>
          </g>

          {/* TRIANGLE */}
          <g
            className={`diagram-callout ${pressedButtons.triangle ? 'is-pressed' : ''} ${activeActionId === 'triangle' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('triangle')}
          >
            <polyline points="710,140 800,175 910,175" className="diagram-line" />
            <circle cx="710" cy="140" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 158)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key" style={{ fill: '#10b981' }}>△ TRIANGLE (Y)</text>
              <text x="70" y="27" className="diagram-pill-action">Search Keyboard</text>
            </g>
          </g>

          {/* CIRCLE (B) */}
          <g
            className={`diagram-callout ${pressedButtons.circle ? 'is-pressed' : ''} ${activeActionId === 'circle' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('circle')}
          >
            <polyline points="722,172 810,215 910,215" className="diagram-line" />
            <circle cx="722" cy="172" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 198)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key" style={{ fill: '#ef4444' }}>○ CIRCLE (B)</text>
              <text x="70" y="27" className="diagram-pill-action">Back / Cancel</text>
            </g>
          </g>

          {/* CROSS (A) */}
          <g
            className={`diagram-callout ${pressedButtons.cross ? 'is-pressed' : ''} ${activeActionId === 'cross' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('cross')}
          >
            <polyline points="692,202 800,255 910,255" className="diagram-line" />
            <circle cx="692" cy="202" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 238)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key" style={{ fill: '#3b82f6' }}>✕ CROSS (A)</text>
              <text x="70" y="27" className="diagram-pill-action">Select / Confirm</text>
            </g>
          </g>

          {/* SQUARE */}
          <g
            className={`diagram-callout ${pressedButtons.square ? 'is-pressed' : ''} ${activeActionId === 'square' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('square')}
          >
            <polyline points="662,172 780,295 910,295" className="diagram-line" />
            <circle cx="662" cy="172" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 278)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key" style={{ fill: '#ec4899' }}>□ SQUARE (X)</text>
              <text x="70" y="27" className="diagram-pill-action">Boxart Scraper</text>
            </g>
          </g>

          {/* R3 STICK */}
          <g
            className={`diagram-callout ${pressedButtons.r3 ? 'is-pressed' : ''} ${activeActionId === 'r3' ? 'is-active' : ''}`}
            onClick={() => handleSelectKey('r3')}
          >
            <polyline points="640,285 760,335 910,335" className="diagram-line" />
            <circle cx="640" cy="285" r="4" className="diagram-anchor-dot" />
            <g transform="translate(910, 318)">
              <rect width="140" height="34" rx="6" className="diagram-pill-bg" />
              <text x="70" y="15" className="diagram-pill-key">R3 STICK CLICK</text>
              <text x="70" y="27" className="diagram-pill-action">Wide Grid View</text>
            </g>
          </g>

          {/* =========================================================
              CENTER CONTROLLER BODY (Joypad.ai Vector Geometry)
             ========================================================= */}
          
          <g transform="translate(200, 15)">
            {/* L2 / R2 Triggers */}
            <path
              d="M 175 48 C 175 22, 230 20, 242 42 L 235 70 C 215 62, 185 64, 175 48 Z"
              className={`ctrl-part ctrl-trigger ${pressedButtons.l2 ? 'is-pressed' : ''} ${activeActionId === 'l2' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('l2')}
            />
            <text x="210" y="44" className="ctrl-trigger-text">L2</text>

            <path
              d="M 505 48 C 505 22, 450 20, 438 42 L 445 70 C 465 62, 495 64, 505 48 Z"
              className={`ctrl-part ctrl-trigger ${pressedButtons.r2 ? 'is-pressed' : ''} ${activeActionId === 'r2' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('r2')}
            />
            <text x="470" y="44" className="ctrl-trigger-text">R2</text>

            {/* Controller Outer Shell Outline */}
            <path
              d="M 170 78 C 240 68, 440 68, 510 78 C 555 88, 595 130, 580 190 C 560 235, 520 258, 470 258 C 420 258, 395 295, 340 295 C 285 295, 260 258, 210 258 C 160 258, 120 235, 100 190 C 85 130, 125 88, 170 78 Z"
              className="ctrl-shell-body"
            />

            {/* Left & Right Grip Horns */}
            <path
              d="M 100 150 C 70 190, 45 270, 70 355 C 85 400, 130 410, 160 375 C 185 345, 205 280, 215 235 Z"
              className="ctrl-shell-grip"
            />
            <path
              d="M 580 150 C 610 190, 635 270, 610 355 C 595 400, 550 410, 520 375 C 495 345, 475 280, 465 235 Z"
              className="ctrl-shell-grip"
            />

            {/* L1 / R1 Bumpers */}
            <path
              d="M 155 76 C 155 58, 235 55, 245 74 L 240 92 C 215 84, 170 84, 155 76 Z"
              className={`ctrl-part ctrl-bumper ${pressedButtons.l1 ? 'is-pressed' : ''} ${activeActionId === 'l1' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('l1')}
            />
            <text x="195" y="80" className="ctrl-bumper-text">L1</text>

            <path
              d="M 525 76 C 525 58, 445 55, 435 74 L 440 92 C 465 84, 510 84, 525 76 Z"
              className={`ctrl-part ctrl-bumper ${pressedButtons.r1 ? 'is-pressed' : ''} ${activeActionId === 'r1' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('r1')}
            />
            <text x="485" y="80" className="ctrl-bumper-text">R1</text>

            {/* Center Touchpad */}
            <rect
              x="250"
              y="76"
              width="180"
              height="90"
              rx="6"
              className={`ctrl-part ctrl-touchpad ${pressedButtons.touchpad ? 'is-pressed' : ''} ${activeActionId === 'touchpad' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('touchpad')}
            />

            {/* Share & Options Buttons */}
            <rect
              x="225"
              y="105"
              width="12"
              height="26"
              rx="6"
              className={`ctrl-part ctrl-meta-btn ${pressedButtons.share ? 'is-pressed' : ''} ${activeActionId === 'share' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('share')}
            />

            <rect
              x="443"
              y="105"
              width="12"
              height="26"
              rx="6"
              className={`ctrl-part ctrl-meta-btn ${pressedButtons.options ? 'is-pressed' : ''} ${activeActionId === 'options' ? 'is-active' : ''}`}
              onClick={() => handleSelectKey('options')}
            />

            {/* D-Pad Cluster */}
            <g className={`ctrl-dpad-cluster ${activeActionId === 'dpad' ? 'is-active' : ''}`} transform="translate(135, 125)">
              {/* Up */}
              <g
                className={`ctrl-part ctrl-dpad-arm ${pressedButtons.dpad_up ? 'is-pressed' : ''} ${activeActionId === 'dpad' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('dpad')}
              >
                <path d="M 36 6 L 60 6 C 64 6, 66 8, 66 12 L 66 36 L 30 36 L 30 12 C 30 8, 32 6, 36 6 Z" />
                <polygon points="48,14 41,24 55,24" className="dpad-arrow-glyph" />
              </g>
              {/* Down */}
              <g
                className={`ctrl-part ctrl-dpad-arm ${pressedButtons.dpad_down ? 'is-pressed' : ''} ${activeActionId === 'dpad' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('dpad')}
              >
                <path d="M 30 60 L 66 60 L 66 84 C 66 88, 64 90, 60 90 L 36 90 C 32 90, 30 88, 30 84 Z" />
                <polygon points="48,82 41,72 55,72" className="dpad-arrow-glyph" />
              </g>
              {/* Left */}
              <g
                className={`ctrl-part ctrl-dpad-arm ${pressedButtons.dpad_left ? 'is-pressed' : ''} ${activeActionId === 'dpad' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('dpad')}
              >
                <path d="M 6 36 C 6 32, 8 30, 12 30 L 36 30 L 36 66 L 12 66 C 8 66, 6 64, 6 60 Z" />
                <polygon points="14,48 24,41 24,55" className="dpad-arrow-glyph" />
              </g>
              {/* Right */}
              <g
                className={`ctrl-part ctrl-dpad-arm ${pressedButtons.dpad_right ? 'is-pressed' : ''} ${activeActionId === 'dpad' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('dpad')}
              >
                <path d="M 60 30 L 84 30 C 88 30, 90 32, 90 36 L 90 60 C 90 64, 88 66, 84 66 L 60 66 Z" />
                <polygon points="82,48 72,41 72,55" className="dpad-arrow-glyph" />
              </g>
              <rect x="34" y="34" width="28" height="28" className={`ctrl-dpad-center ${activeActionId === 'dpad' ? 'is-active' : ''} ${pressedButtons.dpad ? 'is-pressed' : ''}`} />
            </g>

            {/* Action Face Buttons Cluster (Vibrant PlayStation Icons) */}
            <g className="ctrl-action-cluster" transform="translate(485, 125)">
              {/* Triangle (Green) */}
              <g
                className={`ctrl-part ctrl-action-btn ${pressedButtons.triangle ? 'is-pressed' : ''} ${activeActionId === 'triangle' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('triangle')}
              >
                <circle cx="48" cy="18" r="17" />
                <polygon points="48,9 39,24 57,24" className="glyph-triangle" />
              </g>

              {/* Circle (Red) */}
              <g
                className={`ctrl-part ctrl-action-btn ${pressedButtons.circle ? 'is-pressed' : ''} ${activeActionId === 'circle' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('circle')}
              >
                <circle cx="78" cy="48" r="17" />
                <circle cx="78" cy="48" r="7.5" className="glyph-circle" />
              </g>

              {/* Cross (Blue) */}
              <g
                className={`ctrl-part ctrl-action-btn ${pressedButtons.cross ? 'is-pressed' : ''} ${activeActionId === 'cross' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('cross')}
              >
                <circle cx="48" cy="78" r="17" />
                <line x1="41" y1="71" x2="55" y2="85" className="glyph-cross" />
                <line x1="55" y1="71" x2="41" y2="85" className="glyph-cross" />
              </g>

              {/* Square (Pink) */}
              <g
                className={`ctrl-part ctrl-action-btn ${pressedButtons.square ? 'is-pressed' : ''} ${activeActionId === 'square' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('square')}
              >
                <circle cx="18" cy="48" r="17" />
                <rect x="11.5" y="41.5" width="13" height="13" rx="1.5" className="glyph-square" />
              </g>
            </g>

            {/* Dual Analog Thumbsticks */}
            <g className="ctrl-sticks">
              {/* Left Stick (L3) */}
              <g
                className={`ctrl-part ctrl-stick-group ${pressedButtons.l3 ? 'is-pressed' : ''} ${activeActionId === 'l3' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('l3')}
              >
                <circle cx="250" cy="255" r="42" className="ctrl-stick-base" />
                <g transform={`translate(${leftStickOffset.x}, ${leftStickOffset.y})`}>
                  <circle cx="250" cy="255" r="32" className="ctrl-stick-pad" />
                  <circle cx="250" cy="255" r="22" className="ctrl-stick-inner" />
                  <text x="250" y="259" className="ctrl-stick-text">L3</text>
                </g>
              </g>

              {/* PS Home Button in Middle */}
              <circle cx="340" cy="235" r="11" className="ctrl-home-btn" />

              {/* Right Stick (R3) */}
              <g
                className={`ctrl-part ctrl-stick-group ${pressedButtons.r3 ? 'is-pressed' : ''} ${activeActionId === 'r3' ? 'is-active' : ''}`}
                onClick={() => handleSelectKey('r3')}
              >
                <circle cx="430" cy="255" r="42" className="ctrl-stick-base" />
                <g transform={`translate(${rightStickOffset.x}, ${rightStickOffset.y})`}>
                  <circle cx="430" cy="255" r="32" className="ctrl-stick-pad" />
                  <circle cx="430" cy="255" r="22" className="ctrl-stick-inner" />
                  <text x="430" y="259" className="ctrl-stick-text">R3</text>
                </g>
              </g>
            </g>

            {/* L3 + R3 Combo Shortcut Tag */}
            <g
              className={`ctrl-part ctrl-combo-tag ${pressedButtons.combo ? 'is-pressed' : ''} ${activeActionId === 'combo' ? 'is-active' : ''}`}
              transform="translate(340, 325)"
              onClick={() => handleSelectKey('combo')}
            >
              <rect x="-70" y="-12" width="140" height="24" rx="12" />
              <text x="0" y="4" textAnchor="middle">L3 + R3 EXIT GAME</text>
            </g>
          </g>
        </svg>
      </div>

      {/* Selected Action Functional Description Card */}
      <div className="diagram-detail-card" style={{ '--detail-accent': activeAction.accent }}>
        <div className="detail-header">
          <span className="detail-pill">{activeAction.label}</span>
          <span className="detail-action">{activeAction.action}</span>
        </div>
        <p className="detail-desc">{activeAction.desc}</p>
      </div>
    </div>
  );
}

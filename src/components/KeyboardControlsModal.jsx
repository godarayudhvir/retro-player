import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, X, Play, ShieldAlert, Check, Gamepad2, Info } from 'lucide-react';
import { getKeyboardControlsForCore } from '../utils/keyboardControls';

/**
 * Pre-Launch Keyboard Controls Splash Modal
 * Shown when gamepad is not detected before gameplay starts.
 * Supports:
 * - 10-second countdown timer with auto-dismiss.
 * - Done / Play Now button via Mouse, Keyboard (Enter, Space, Esc), or Gamepad (A).
 * - "Don't show this again" persistent preference.
 * - 100% responsive and spatial navigation compliant.
 */
export default function KeyboardControlsModal({
  game,
  core,
  systemKey,
  onDismiss,
  onCancel,
  sfx
}) {
  const [countdown, setCountdown] = useState(10);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const dismissedRef = useRef(false);

  const controls = getKeyboardControlsForCore(core, systemKey || game?.systemKey);
  const currentSysKey = controls.systemKey || systemKey || game?.systemKey || 'default';

  const handleDone = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    sfx?.playGameLaunch?.();

    if (dontShowAgain) {
      try {
        localStorage.setItem(`retro_skip_keyboard_controls_prompt_${currentSysKey}`, 'true');
      } catch (e) {}
    }

    onDismiss();
  };

  const handleCloseOnly = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    sfx?.playModalClose?.();

    if (onCancel) {
      onCancel();
    } else {
      onDismiss();
    }
  };

  // 10s Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dontShowAgain]);

  // Keyboard & Gamepad Listeners to dismiss or interact
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Enter', 'Space'].includes(e.code) || ['Enter', 'Space'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handleDone();
      } else if (e.code === 'Escape' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseOnly();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    // Gamepad check - if user touches any button or plugs in gamepad, launch game
    let animId;
    const pollGamepad = () => {
      const gamepads = (navigator.getGamepads ? navigator.getGamepads() : []);
      const gp = Array.from(gamepads).find(g => g && g.connected);
      if (gp && gp.buttons) {
        const anyPressed = gp.buttons.some(b => b && (b.pressed || b.value > 0.5));
        if (anyPressed) {
          handleDone();
          return;
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };
    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      cancelAnimationFrame(animId);
    };
  }, [dontShowAgain]);

  return (
    <div 
      className="keyboard-controls-modal-backdrop" 
      onClick={handleCloseOnly}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kc-modal-title"
    >
      <div 
        className="keyboard-controls-modal-card animate-scale-in" 
        onClick={e => e.stopPropagation()}
        style={{ '--system-accent': controls.color || '#6366f1' }}
      >
        {/* Header Ribbon */}
        <div className="kc-modal-header">
          <div className="kc-header-left">
            <div className="kc-icon-badge">
              <Keyboard size={18} color="var(--poke-red, #e11d48)" />
            </div>
            <div>
              <div className="kc-platform-tag">
                {controls.systemName}
              </div>
              <h2 id="kc-modal-title" className="kc-title">
                Default Keyboard Controls
              </h2>
            </div>
          </div>
          <button 
            type="button" 
            className="kc-close-btn"
            onClick={handleCloseOnly}
            aria-label="Dismiss controls"
            title="Cancel (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="kc-notice-banner">
          <Info size={16} className="kc-notice-icon" />
          <span>
            No gamepad detected. You can control <strong>{game?.title || 'Game'}</strong> using these keyboard keys:
          </span>
        </div>

        {/* Controls Layout Grid */}
        <div className="kc-mappings-grid">
          {/* Movement / D-Pad */}
          <div className="kc-section-block">
            <div className="kc-section-label">MOVEMENT / DIRECTION</div>
            <div className="kc-row">
              <div className="kc-keycap-group">
                <span className="kc-keycap">▲</span>
                <span className="kc-keycap">▼</span>
                <span className="kc-keycap">◄</span>
                <span className="kc-keycap">►</span>
              </div>
              <div className="kc-key-info">
                <span className="kc-key-title">Arrow Keys</span>
                <span className="kc-key-desc">D-Pad / Analog Navigation</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="kc-section-block">
            <div className="kc-section-label">ACTION BUTTONS</div>
            <div className="kc-keys-list">
              {controls.actions.map((act, idx) => (
                <div key={idx} className="kc-row">
                  <span className="kc-keycap is-action">{act.key}</span>
                  <div className="kc-key-info">
                    <span className="kc-key-title">{act.label}</span>
                    <span className="kc-key-desc">{act.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shoulders / Triggers (if applicable) */}
          {controls.shoulders && controls.shoulders.length > 0 && (
            <div className="kc-section-block">
              <div className="kc-section-label">SHOULDERS & TRIGGERS</div>
              <div className="kc-keys-list">
                {controls.shoulders.map((sh, idx) => (
                  <div key={idx} className="kc-row">
                    <span className="kc-keycap is-shoulder">{sh.key}</span>
                    <div className="kc-key-info">
                      <span className="kc-key-title">{sh.label}</span>
                      <span className="kc-key-desc">{sh.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special / C-Buttons (if applicable) */}
          {controls.special && controls.special.length > 0 && (
            <div className="kc-section-block">
              <div className="kc-section-label">SPECIAL / C-BUTTONS</div>
              <div className="kc-keys-list">
                {controls.special.map((sp, idx) => (
                  <div key={idx} className="kc-row">
                    <span className="kc-keycap is-special">{sp.key}</span>
                    <div className="kc-key-info">
                      <span className="kc-key-title">{sp.label}</span>
                      <span className="kc-key-desc">{sp.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Buttons (Start / Select / Coin) */}
          <div className="kc-section-block">
            <div className="kc-section-label">SYSTEM / UTILITY</div>
            <div className="kc-keys-list">
              {controls.systemButtons.map((sys, idx) => (
                <div key={idx} className="kc-row">
                  <span className="kc-keycap is-system">{sys.key}</span>
                  <div className="kc-key-info">
                    <span className="kc-key-title">{sys.label}</span>
                    <span className="kc-key-desc">{sys.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions & Timer */}
        <div className="kc-modal-footer">
          <label className="kc-checkbox-label">
            <input 
              type="checkbox" 
              checked={dontShowAgain} 
              onChange={e => setDontShowAgain(e.target.checked)} 
            />
            <span>Don't show controls again for <strong>{controls.systemName}</strong></span>
          </label>

          <div className="kc-footer-right">
            <button 
              type="button" 
              className="kc-play-btn"
              onClick={handleDone}
              autoFocus
            >
              <Play size={16} fill="currentColor" />
              <span>Start Game ({countdown}s)</span>
            </button>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="kc-timer-bar-wrap">
          <div 
            className="kc-timer-bar-fill" 
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

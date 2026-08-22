import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sun, Moon, Check, X, Monitor, Smartphone, Cpu } from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * ThemeSwitcherModal: Visual console re-theming, Light/Dark mode picker & UI Display Mode Selector.
 * 100% accessible via Keyboard and Gamepad.
 */
export default function ThemeSwitcherModal({
  isOpen,
  onClose,
  themeEngine,
  uiMode = 'auto',
  setUiMode,
  sfx
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef(null);

  const availableThemes = themeEngine?.availableThemes || [];
  const currentTheme = themeEngine?.theme || 'vanilla';
  const colorMode = themeEngine?.colorMode || 'light';

  // Sync selected index with active theme on open
  useEffect(() => {
    if (isOpen) {
      const idx = availableThemes.findIndex(t => t.key === currentTheme);
      setSelectedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, currentTheme, availableThemes]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sfx?.playModalClose?.();
        onClose();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev + 1) % availableThemes.length;
          sfx?.playTileNav?.();
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev - 1 + availableThemes.length) % availableThemes.length;
          sfx?.playTileNav?.();
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const selected = availableThemes[selectedIndex];
        if (selected) {
          themeEngine?.setTheme?.(selected.key);
          sfx?.playThemeSwitch?.();
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        themeEngine?.toggleColorMode?.();
        sfx?.playTabSwitch?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, availableThemes, themeEngine, sfx, onClose]);

  if (!isOpen) return null;

  return (
    <div className="theme-modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="theme-switcher-modal-content" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* Mobile Sheet Drag Handle Bar */}
        <div className="theme-sheet-handle-bar"></div>

        {/* Modal Header */}
        <div className="theme-switcher-header">
          <div className="theme-switcher-title">
            <Palette size={22} className="theme-header-icon" />
            <div>
              <h2>Console Theme Studio</h2>
              <p>Select visual layout theme, color mode & display mode</p>
            </div>
          </div>

          <div className="theme-switcher-actions">
            {/* UI Display Mode Picker */}
            {setUiMode && (
              <div className="theme-mode-toggle-group ui-mode-toggle-group" title="Select UI Layout Mode">
                <button
                  type="button"
                  className={`theme-mode-btn ${uiMode === 'auto' ? 'is-active' : ''}`}
                  onClick={() => {
                    setUiMode('auto');
                    sfx?.playTabSwitch?.();
                  }}
                  title="Auto: Responsively adapt to screen & orientation"
                  aria-label="Auto Responsive Display Mode"
                >
                  <Cpu size={14} />
                  <span>Auto</span>
                </button>
                <button
                  type="button"
                  className={`theme-mode-btn ${uiMode === 'console' ? 'is-active' : ''}`}
                  onClick={() => {
                    setUiMode('console');
                    sfx?.playTabSwitch?.();
                  }}
                  title="Console / TV Mode: 10-Foot UI shelf layout"
                  aria-label="Console 10-Foot Display Mode"
                >
                  <Monitor size={14} />
                  <span>Console / TV</span>
                </button>
                <button
                  type="button"
                  className={`theme-mode-btn ${uiMode === 'mobile' ? 'is-active' : ''}`}
                  onClick={() => {
                    setUiMode('mobile');
                    sfx?.playTabSwitch?.();
                  }}
                  title="Mobile Touch Mode: Vertical stream feed layout"
                  aria-label="Mobile Touch Display Mode"
                >
                  <Smartphone size={14} />
                  <span>Mobile Feed</span>
                </button>
              </div>
            )}

            {/* Light / Dark Mode Toggle */}
            <div className="theme-mode-toggle-group">
              <button
                type="button"
                className={`theme-mode-btn ${colorMode === 'light' ? 'is-active' : ''}`}
                onClick={() => {
                  themeEngine?.setColorMode?.('light');
                  sfx?.playTabSwitch?.();
                }}
                title="Switch to Light Mode"
                aria-label="Light Mode"
              >
                <Sun size={15} />
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`theme-mode-btn ${colorMode === 'dark' ? 'is-active' : ''}`}
                onClick={() => {
                  themeEngine?.setColorMode?.('dark');
                  sfx?.playTabSwitch?.();
                }}
                title="Switch to Dark Mode"
                aria-label="Dark Mode"
              >
                <Moon size={15} />
                <span>Dark</span>
              </button>
            </div>

            {/* Close Button */}
            <button 
              className="theme-close-btn"
              onClick={() => {
                sfx?.playModalClose?.();
                onClose();
              }}
              title="Close (Esc)"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Themes Grid */}
        <div className="theme-card-grid">
          {availableThemes.map((t, idx) => {
            const isSelected = selectedIndex === idx;
            const isCurrent = currentTheme === t.key;

            return (
              <div
                key={t.key}
                className={`theme-preset-card ${isCurrent ? 'is-active-theme' : ''} ${isSelected ? 'is-keyboard-focus' : ''}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  themeEngine?.setTheme?.(t.key);
                  sfx?.playThemeSwitch?.();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className={`theme-card-preview-strip preview-${t.key} preview-mode-${colorMode}`}>
                  {t.icon && (t.icon.endsWith('.svg') || t.icon.includes('/')) ? (
                    <img 
                      src={resolveAssetPath(t.icon)} 
                      alt={t.name} 
                      className="theme-preview-svg-icon" 
                    />
                  ) : (
                    <span className="theme-preview-icon">{t.icon}</span>
                  )}
                  <div className="theme-mini-swatches">
                    <span className="theme-mini-swatch swatch-accent" style={{ backgroundColor: t.accentColor }}></span>
                  </div>
                </div>

                <div className="theme-card-meta">
                  <div className="theme-card-title-row">
                    <span className="theme-name">{t.name}</span>
                    {isCurrent && (
                      <span className="theme-active-badge">
                        <Check size={12} /> ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="theme-description">{t.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

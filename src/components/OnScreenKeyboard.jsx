import React, { useState } from 'react';
import { Search, Delete, Space, Check, Trash2, ArrowBigUp, User, Sparkles } from 'lucide-react';

export const KEYBOARD_ROWS_LOWER = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', "'"],
  ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.'],
  ['CLEAR', 'SPACE', 'DONE']
];

export const KEYBOARD_ROWS_UPPER = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '-'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', "'"],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '.'],
  ['CLEAR', 'SPACE', 'DONE']
];

export const KEYBOARD_ROWS = KEYBOARD_ROWS_UPPER;

/**
 * Ergonomic 5-Row Glassmorphic Virtual On-Screen Keyboard.
 * 100% responsive across mobile phones, tablets, and desktop TV UI modes.
 */
export default function OnScreenKeyboard({
  isOpen,
  searchQuery = '',
  onSearchChange,
  onSubmit,
  onCancel,
  onClose,
  focusedPos = { row: 0, col: 0 },
  onKeyClick,
  resultsCount = 0,
  gamepadConnected = false,
  title = 'SEARCH LIBRARY',
  subtitle = null,
  placeholder = 'Type text...',
  actionLabel = 'SUBMIT',
  icon: HeaderIcon,
  isMobile = false
}) {
  const [isUppercase, setIsUppercase] = useState(false);

  // Never show on screen keyboard on mobile devices, and only show if gamepad is connected
  if (!isOpen || isMobile || !gamepadConnected) return null;

  const handleCancel = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(searchQuery);
    else if (onClose) onClose();
  };

  const ActiveIcon = HeaderIcon || (title.toLowerCase().includes('name') ? User : (title.toLowerCase().includes('seed') ? Sparkles : Search));
  const currentRows = isUppercase ? KEYBOARD_ROWS_UPPER : KEYBOARD_ROWS_LOWER;

  const handleVirtualKey = (key) => {
    if (key === '⌫') {
      onSearchChange((searchQuery || '').slice(0, -1));
    } else if (key === 'SPACE') {
      onSearchChange((searchQuery || '') + ' ');
    } else if (key === 'CLEAR') {
      onSearchChange('');
    } else if (key === 'SHIFT') {
      setIsUppercase(prev => !prev);
    } else if (key === 'DONE') {
      handleSubmit();
    } else {
      onSearchChange((searchQuery || '') + key);
    }
  };

  const displaySubtitle = subtitle !== null ? subtitle : (resultsCount === 1 ? '1 game found' : `${resultsCount} games found`);

  return (
    <div
      className="osk-overlay animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div className="osk-modal animate-slide-up" role="dialog" aria-modal="true" aria-label="On Screen Keyboard">
        {/* Header HUD Bar */}
        <div className="osk-header">
          <div className="osk-title-group">
            <div className="osk-icon-badge">
              <ActiveIcon size={18} color="#3b82f6" />
            </div>
            <div>
              <h3 className="osk-title">{title}</h3>
              {displaySubtitle ? <p className="osk-subtitle">{displaySubtitle}</p> : null}
            </div>
          </div>

          {gamepadConnected && (
            <button type="button" className="osk-header-gamepad-pill" onClick={handleCancel} title="Cancel & Dismiss (B / Esc)">
              <span className="osk-btn-badge badge-b">B</span>
              <span className="osk-header-pill-text">Back</span>
            </button>
          )}
        </div>

        {/* Live Query Display Bar */}
        <div className="osk-query-bar">
          <ActiveIcon size={18} color="#3b82f6" className="osk-query-icon" />
          <div className="osk-query-display">
            {searchQuery ? (
              <span className="osk-query-text">{searchQuery}</span>
            ) : (
              <span className="osk-query-placeholder">{placeholder}</span>
            )}
            <span className="osk-blinking-cursor"></span>
          </div>
        </div>

        {/* Virtual Key Grid: 5 Rows */}
        <div className="osk-grid">
          {currentRows.map((row, rIdx) => {
            const isBottomActionRow = rIdx === 4;

            return (
              <div 
                key={`row-${rIdx}`} 
                className={`osk-row ${isBottomActionRow ? 'osk-row-actions' : ''}`}
              >
                {row.map((key, cIdx) => {
                  const isFocused = focusedPos.row === rIdx && focusedPos.col === cIdx;
                  const isSpecial = ['⌫', 'CLEAR', 'SPACE', 'DONE', 'SHIFT'].includes(key);

                  let specialClass = '';
                  if (key === 'SPACE') specialClass = 'osk-key-space';
                  else if (key === 'DONE') specialClass = 'osk-key-done';
                  else if (key === 'CLEAR') specialClass = 'osk-key-clear';
                  else if (key === '⌫') specialClass = 'osk-key-backspace';
                  else if (key === 'SHIFT') specialClass = `osk-key-shift ${isUppercase ? 'is-active' : ''}`;

                  return (
                    <button
                      key={`key-${rIdx}-${cIdx}`}
                      className={`osk-key ${isSpecial ? 'osk-key-special' : ''} ${specialClass} ${isFocused ? 'osk-key-focused' : ''}`}
                      onClick={() => {
                        if (onKeyClick) onKeyClick(rIdx, cIdx);
                        handleVirtualKey(key);
                      }}
                      type="button"
                    >
                      {key === '⌫' ? (
                        <span className="osk-key-label">
                          <Delete size={17} />
                          {gamepadConnected && <span className="osk-btn-badge badge-x">X</span>}
                        </span>
                      ) : key === 'SHIFT' ? (
                        <span className="osk-key-label"><ArrowBigUp size={16} fill={isUppercase ? "currentColor" : "none"} /> {isUppercase ? 'CAPS' : 'caps'}</span>
                      ) : key === 'SPACE' ? (
                        <span className="osk-key-label">
                          {gamepadConnected && <span className="osk-btn-badge badge-y">Y</span>}
                          <Space size={16} />
                          <span>SPACE</span>
                        </span>
                      ) : key === 'CLEAR' ? (
                        <span className="osk-key-label">
                          {gamepadConnected && <span className="osk-btn-badge badge-bumper">L</span>}
                          <Trash2 size={15} />
                          <span>CLEAR</span>
                        </span>
                      ) : key === 'DONE' ? (
                        <span className="osk-key-label">
                          {gamepadConnected && <span className="osk-btn-badge badge-bumper">R</span>}
                          <Check size={16} />
                          <span>SUBMIT</span>
                        </span>
                      ) : (
                        <span className="osk-key-label">{key}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Gamepad Quick Shortcuts Footer HUD */}
        {gamepadConnected && (
          <div className="osk-footer-hud">
            <div className="osk-hud-item">
              <span className="osk-btn-badge badge-bumper">L</span>
              <span>Clear</span>
            </div>
            <span className="osk-hud-dot">•</span>
            <div className="osk-hud-item">
              <span className="osk-btn-badge badge-bumper">R</span>
              <span>Submit</span>
            </div>
            <span className="osk-hud-dot">•</span>
            <div className="osk-hud-item">
              <span className="osk-btn-badge badge-x">X</span>
              <span>Backspace</span>
            </div>
            <span className="osk-hud-dot">•</span>
            <div className="osk-hud-item">
              <span className="osk-btn-badge badge-y">Y</span>
              <span>Space</span>
            </div>
            <span className="osk-hud-dot">•</span>
            <div className="osk-hud-item">
              <span className="osk-btn-badge badge-b">B</span>
              <span>Back</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

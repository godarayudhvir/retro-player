import React from 'react';
import { Search, Delete, Space, X, Check, Trash2 } from 'lucide-react';

export const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '-'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.'],
  ['CLEAR', 'SPACE', 'DONE']
];

/**
 * Ergonomic 5-Row Glassmorphic Virtual On-Screen Keyboard.
 * 100% responsive across mobile phones, tablets, and desktop TV UI modes.
 */
export default function OnScreenKeyboard({
  isOpen,
  searchQuery,
  onSearchChange,
  onClose,
  focusedPos = { row: 0, col: 0 },
  onKeyClick,
  resultsCount = 0,
  gamepadConnected = false
}) {
  if (!isOpen) return null;

  const handleVirtualKey = (key) => {
    if (key === '⌫') {
      onSearchChange(searchQuery.slice(0, -1));
    } else if (key === 'SPACE') {
      onSearchChange(searchQuery + ' ');
    } else if (key === 'CLEAR') {
      onSearchChange('');
    } else if (key === 'DONE') {
      onClose();
    } else {
      onSearchChange(searchQuery + key);
    }
  };

  return (
    <div
      className="osk-overlay animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="osk-modal animate-slide-up" role="dialog" aria-modal="true" aria-label="On Screen Keyboard">
        {/* Header HUD Bar */}
        <div className="osk-header">
          <div className="osk-title-group">
            <div className="osk-icon-badge">
              <Search size={18} color="#3b82f6" />
            </div>
            <div>
              <h3 className="osk-title">SEARCH LIBRARY</h3>
              <p className="osk-subtitle">
                {resultsCount === 1 ? '1 game found' : `${resultsCount} games found`}
              </p>
            </div>
          </div>

          <button
            className="osk-close-btn"
            onClick={onClose}
            title="Close Search Keyboard (B / Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Search Query Display Bar */}
        <div className="osk-query-bar">
          <Search size={18} color="#3b82f6" className="osk-query-icon" />
          <div className="osk-query-display">
            {searchQuery ? (
              <span className="osk-query-text">{searchQuery}</span>
            ) : (
              <span className="osk-query-placeholder">Type game or system name...</span>
            )}
            <span className="osk-blinking-cursor"></span>
          </div>
          {searchQuery && (
            <button
              className="osk-query-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Virtual Key Grid: 5 Rows */}
        <div className="osk-grid">
          {KEYBOARD_ROWS.map((row, rIdx) => {
            const isBottomActionRow = rIdx === 4;

            return (
              <div 
                key={`row-${rIdx}`} 
                className={`osk-row ${isBottomActionRow ? 'osk-row-actions' : ''}`}
              >
                {row.map((key, cIdx) => {
                  const isFocused = focusedPos.row === rIdx && focusedPos.col === cIdx;
                  const isSpecial = ['⌫', 'CLEAR', 'SPACE', 'DONE'].includes(key);

                  let specialClass = '';
                  if (key === 'SPACE') specialClass = 'osk-key-space';
                  else if (key === 'DONE') specialClass = 'osk-key-done';
                  else if (key === 'CLEAR') specialClass = 'osk-key-clear';
                  else if (key === '⌫') specialClass = 'osk-key-backspace';

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
                        <span className="osk-key-label"><Delete size={17} /></span>
                      ) : key === 'SPACE' ? (
                        <span className="osk-key-label"><Space size={17} /> SPACE</span>
                      ) : key === 'CLEAR' ? (
                        <span className="osk-key-label"><Trash2 size={15} /> CLEAR</span>
                      ) : key === 'DONE' ? (
                        <span className="osk-key-label"><Check size={17} /> SEARCH</span>
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
      </div>
    </div>
  );
}

import React from 'react';
import { Search, Delete, Space, X, Check } from 'lucide-react';

export const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '-'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', "'", 'CLEAR'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', 'SPACE', 'DONE']
];

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
      className="osk-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="osk-modal" role="dialog" aria-modal="true" aria-label="On Screen Keyboard">
        {/* Header HUD Bar */}
        <div className="osk-header">
          <div className="osk-title-group">
            <div className="osk-icon-badge">
              <Search size={18} color="#ef4444" />
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
          <Search size={20} color="#ef4444" className="osk-query-icon" />
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

        {/* Controller Shortcut Hints Bar */}
        {gamepadConnected && (
          <div className="osk-hints-bar">
            <div className="osk-hint-pill">
              <span className="osk-hint-key">A</span>
              <span>Select Key</span>
            </div>
            <div className="osk-hint-pill">
              <span className="osk-hint-key osk-key-x">X</span>
              <span>Space</span>
            </div>
            <div className="osk-hint-pill">
              <span className="osk-hint-key osk-key-y">Y</span>
              <span>Backspace</span>
            </div>
            <div className="osk-hint-pill">
              <span className="osk-hint-key osk-key-start">START</span>
              <span>Done</span>
            </div>
            <div className="osk-hint-pill">
              <span className="osk-hint-key osk-key-b">B</span>
              <span>Close</span>
            </div>
          </div>
        )}

        {/* Virtual Key Grid */}
        <div className="osk-grid">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="osk-row">
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
                      <span className="osk-key-label"><Delete size={18} /></span>
                    ) : key === 'SPACE' ? (
                      <span className="osk-key-label"><Space size={18} /> SPACE</span>
                    ) : key === 'DONE' ? (
                      <span className="osk-key-label"><Check size={18} /> SEARCH</span>
                    ) : (
                      <span className="osk-key-label">{key}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

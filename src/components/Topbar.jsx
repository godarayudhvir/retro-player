import React from 'react';
import { Search, FolderOpen, Wifi, Info, Gamepad2, Volume2, VolumeX } from 'lucide-react';

/**
 * Topbar console header with status indicators, shoulder tabs, search input, custom ROM loader, info modal trigger, and digital clock.
 */
export default function Topbar({
  gamepadConnected,
  activeSystem,
  systems,
  setActiveSystem,
  focusedTarget,
  setFocusedTarget,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  setShowLoadRomModal,
  setShowInfoModal,
  setShowVirtualKeyboard,
  time,
  sfx
}) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform);

  const handlePrevSystem = () => {
    const availableKeys = ['all', ...systems.filter(s => s.gameCount > 0).sort((a, b) => b.gameCount - a.gameCount).map(s => s.key)];
    const prevIdx = (availableKeys.indexOf(activeSystem) - 1 + availableKeys.length) % availableKeys.length;
    setActiveSystem(availableKeys[prevIdx]);
    setFocusedTarget({ zone: 'ribbon', index: prevIdx });
    sfx?.playTabSwitch?.();
  };

  const handleNextSystem = () => {
    const availableKeys = ['all', ...systems.filter(s => s.gameCount > 0).sort((a, b) => b.gameCount - a.gameCount).map(s => s.key)];
    const nextIdx = (availableKeys.indexOf(activeSystem) + 1) % availableKeys.length;
    setActiveSystem(availableKeys[nextIdx]);
    setFocusedTarget({ zone: 'ribbon', index: nextIdx });
    sfx?.playTabSwitch?.();
  };

  return (
    <header className="console-topbar">
      <div className="topbar-left">
        <div className="avatar-badge">
          <Gamepad2 size={24} color="#ef4444" />
        </div>
        <span className="user-tag">RETRO PLAYER</span>
      </div>

      <div className="topbar-center-capsule">
        <button 
          className="shoulder-btn left-shoulder" 
          onClick={handlePrevSystem}
          title="Previous System (L / Q)"
        >
          <span className="shoulder-trigger">L1</span>
          <span className="shoulder-key-tag">{gamepadConnected ? 'L' : 'Q'}</span>
        </button>

        <div className="shoulder-divider" />

        <button 
          className="shoulder-btn right-shoulder" 
          onClick={handleNextSystem}
          title="Next System (R / E)"
        >
          <span className="shoulder-key-tag">{gamepadConnected ? 'R' : 'E'}</span>
          <span className="shoulder-trigger">R1</span>
        </button>
      </div>

      <div className="topbar-right">
        {/* Gamepad Connection Status */}
        <div className="status-pill" style={{ color: gamepadConnected ? '#10b981' : '#64748b' }}>
          <Wifi size={16} />
          <span>{gamepadConnected ? 'GAMEPAD READY' : 'NO CONTROLLER'}</span>
        </div>

        {/* SFX Audio Mute/Unmute Toggle */}
        {sfx && (
          <button
            className="status-pill"
            onClick={sfx.toggleMute}
            title={sfx.isMuted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'inherit',
              color: sfx.isMuted ? '#94a3b8' : '#3b82f6'
            }}
          >
            {sfx.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{sfx.isMuted ? 'SFX OFF' : 'SFX ON'}</span>
          </button>
        )}

        {/* Search Input & Virtual Keyboard Trigger */}
        <div
          className={`status-pill ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'search' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowVirtualKeyboard(true);
            sfx?.playModalOpen?.();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <Search size={16} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setFocusedTarget({ zone: 'topbar', id: 'search' });
              if (gamepadConnected) {
                setShowVirtualKeyboard(true);
                sfx?.playModalOpen?.();
              }
            }}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '0.85rem',
              width: '100px',
              color: 'inherit'
            }}
          />
          <kbd className="lr-badge" style={{ fontSize: '0.7rem', padding: '2px 6px', pointerEvents: 'none', userSelect: 'none', background: gamepadConnected ? '#f59e0b' : undefined, color: gamepadConnected ? '#ffffff' : undefined }}>
            {gamepadConnected ? 'Y' : (isMac ? '⌘K' : 'Ctrl+K')}
          </kbd>
        </div>

        {/* Load Custom ROM */}
        <button
          className={`status-pill info-btn ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'loadRom' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowLoadRomModal(true);
            setFocusedTarget({ zone: 'loadRomModal', id: 'browse' });
            sfx?.playModalOpen?.();
          }}
          title="Open Load Custom ROM dialog"
          style={{
            cursor: 'pointer',
            border: '2px solid #3b82f6',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FolderOpen size={16} color="#60a5fa" />
          <span>LOAD ROM</span>
        </button>

        {/* About & Info Dialog Trigger */}
        <button
          className={`status-pill info-btn ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'info' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowInfoModal(true);
            setFocusedTarget({ zone: 'infoModal', id: 'ack' });
            sfx?.playModalOpen?.();
          }}
          title="About Project"
          style={{
            cursor: 'pointer',
            border: '2px solid #ffffff',
            background: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease'
          }}
        >
          <Info size={16} color="#ef4444" />
          <span>INFO</span>
        </button>

        {/* Real-time Clock */}
        <div className="status-pill">
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
}

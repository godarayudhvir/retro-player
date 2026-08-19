import React from 'react';
import { Search, FolderOpen, Gamepad2, Volume2, VolumeX, Sparkles, RefreshCw, Music, SkipForward, Settings } from 'lucide-react';
import MiiAvatar from './MiiAvatar';

/**
 * Topbar console header with active Mii profile avatar, BGM music player, status indicators,
 * settings trigger, search input, custom ROM loader, and digital clock.
 */
export default function Topbar({
  gamepadConnected,
  activeProfile,
  onOpenProfileSelect,
  bgm,
  focusedTarget,
  setFocusedTarget,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  setShowLoadRomModal,
  setShowSettingsModal,
  setShowVirtualKeyboard,
  time,
  sfx,
  themeEngine,
  scraper
}) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform);

  return (
    <header className="console-topbar">
      <div className="topbar-left">
        <div 
          className="avatar-badge profile-avatar-trigger"
          onClick={() => {
            onOpenProfileSelect?.();
            sfx?.playModalOpen?.();
          }}
          title={`Profile: ${activeProfile?.name || 'Player 1'} (Click to switch)`}
          aria-label="Switch User Profile"
        >
          {activeProfile?.miiData ? (
            <MiiAvatar miiData={activeProfile.miiData} size={36} />
          ) : (
            <Gamepad2 size={24} color="#ef4444" />
          )}
        </div>
        <span 
          className="user-tag profile-name-tag"
          onClick={() => {
            onOpenProfileSelect?.();
            sfx?.playModalOpen?.();
          }}
          title="Switch User Profile"
        >
          {activeProfile?.name || 'RETRO PLAYER'}
        </span>
      </div>

      <div className="topbar-right">
        {/* Background Music (BGM) Player */}
        {bgm && bgm.tracks && bgm.tracks.length > 0 && (
          <div className="bgm-control-group">
            <button
              className={`status-pill status-bgm ${bgm.isPlaying ? 'is-bgm-playing' : ''}`}
              onClick={() => {
                bgm.togglePlay();
                sfx?.playTileNav?.();
              }}
              title={bgm.currentTrack 
                ? `BGM: ${bgm.currentTrack.title} (${bgm.isPlaying ? 'Playing - Click to Pause' : 'Paused - Click to Play'})`
                : "Toggle Background Music"
              }
              aria-label="Toggle Background Music"
            >
              <Music size={18} color={bgm.isPlaying ? '#10b981' : '#64748b'} className={bgm.isPlaying ? 'pulse-icon' : ''} />
            </button>

            {bgm.isPlaying && (
              <button
                className="status-pill status-bgm-skip"
                onClick={() => {
                  bgm.nextTrack();
                  sfx?.playTabSwitch?.();
                }}
                title="Next BGM Track"
                aria-label="Next BGM Track"
              >
                <SkipForward size={14} color="#94a3b8" />
              </button>
            )}
          </div>
        )}

        {/* Gamepad Connection Status */}
        <div 
          className="status-pill status-gamepad" 
          style={{ color: gamepadConnected ? '#10b981' : '#64748b' }}
          title={gamepadConnected ? "Gamepad Connected & Ready" : "No Gamepad Detected (Plug in USB or pair Bluetooth controller)"}
        >
          <Gamepad2 size={18} />
          <span className="pill-text">{gamepadConnected ? 'GAMEPAD READY' : 'NO CONTROLLER'}</span>
        </div>

        {/* Metadata Scraper Status / Trigger */}
        {scraper && (
          <button
            className={`status-pill status-scraper ${scraper.isScraping ? 'is-active-scraping' : ''}`}
            onClick={() => {
              scraper.scrapeAll(undefined, true);
              sfx?.playThemeSwitch?.();
            }}
            title={scraper.isScraping 
              ? `Scraping art... (${scraper.scrapeProgress.current}/${scraper.scrapeProgress.total})` 
              : "Scrape Online Art & Metadata for Library"
            }
            aria-label="Scrape Online Art & Metadata"
          >
            {scraper.isScraping ? (
              <>
                <RefreshCw size={18} className="spin" color="#3b82f6" />
                <span className="pill-text scrape-badge">{scraper.scrapeProgress.current}/{scraper.scrapeProgress.total}</span>
              </>
            ) : (
              <Sparkles size={18} color="#f59e0b" />
            )}
          </button>
        )}

        {/* SFX Audio Mute/Unmute Toggle */}
        {sfx && (
          <button
            className="status-pill status-sfx"
            onClick={sfx.toggleMute}
            title={sfx.isMuted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
            aria-label={sfx.isMuted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
          >
            {sfx.isMuted ? <VolumeX size={18} color="#94a3b8" /> : <Volume2 size={18} color="#3b82f6" />}
          </button>
        )}

        {/* Multi-Theme Selector Pill */}
        {themeEngine && (
          <button
            className="status-pill theme-toggle-btn"
            onClick={() => {
              themeEngine.cycleTheme();
              sfx?.playThemeSwitch?.();
            }}
            title={`Current Theme: ${themeEngine.currentThemeMeta.name} (Press 'T' to switch)`}
            aria-label={`Switch Theme. Current: ${themeEngine.currentThemeMeta.name}`}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{themeEngine.currentThemeMeta.icon}</span>
          </button>
        )}

        {/* Search Input & Virtual Keyboard Trigger */}
        <div
          className={`status-pill status-search ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'search' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowVirtualKeyboard(true);
            sfx?.playModalOpen?.();
          }}
        >
          <Search size={16} color="#64748b" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            className="search-input-field"
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
              color: 'inherit'
            }}
          />
          <kbd className="lr-badge pill-badge" style={{ fontSize: '0.7rem', padding: '2px 6px', pointerEvents: 'none', userSelect: 'none', background: gamepadConnected ? '#f59e0b' : undefined, color: gamepadConnected ? '#ffffff' : undefined }}>
            {gamepadConnected ? 'Y' : (isMac ? '⌘K' : 'Ctrl+K')}
          </kbd>
        </div>

        {/* Load Custom ROM */}
        <button
          className={`status-pill status-loadrom ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'loadRom' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowLoadRomModal(true);
            setFocusedTarget({ zone: 'loadRomModal', id: 'browse' });
            sfx?.playModalOpen?.();
          }}
          title="Open Load Custom ROM dialog"
          aria-label="Load Custom ROM"
        >
          <FolderOpen size={18} color="#3b82f6" />
        </button>

        {/* Console Settings & Library Manager Trigger */}
        <button
          className={`status-pill status-settings ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'settings' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowSettingsModal?.(true);
            setFocusedTarget?.({ zone: 'settingsModal', id: 'tab' });
            sfx?.playModalOpen?.();
          }}
          title="Console Settings & Library Manager (Manage ROMs & BGM)"
          aria-label="Console Settings"
        >
          <Settings size={18} color="#64748b" />
        </button>

        {/* Real-time Clock */}
        <div className="status-pill status-clock">
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
}

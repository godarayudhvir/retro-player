import React from 'react';
import { 
  Search, 
  FolderOpen, 
  Gamepad2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Square, 
  Music, 
  SkipForward, 
  Settings, 
  Download,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap
} from 'lucide-react';
import MiiAvatar from './MiiAvatar';

/**
 * Topbar console header with active Mii profile avatar, BGM music player, status indicators,
 * settings trigger, PWA install button, search input, custom ROM loader, and digital clock.
 */
export default function Topbar({
  gamepadConnected,
  gamepadBattery,
  activeProfile,
  onOpenProfileSelect,
  bgm,
  pwa,
  focusedTarget,
  setFocusedTarget,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  setShowLoadRomModal,
  setShowSettingsModal,
  setShowVirtualKeyboard,
  onOpenScraperModal,
  time,
  sfx,
  themeEngine,
  scraper
}) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform);

  // Helper to render accurate battery icon and theme styling
  const renderBatteryIcon = () => {
    if (!gamepadBattery || !gamepadBattery.hasBatteryInfo) return null;
    const { batteryPercent, isCharging } = gamepadBattery;

    if (isCharging) {
      return <BatteryCharging size={16} className="battery-icon is-charging" />;
    }
    if (batteryPercent > 70) {
      return <BatteryFull size={16} className="battery-icon is-full" />;
    }
    if (batteryPercent > 30) {
      return <BatteryMedium size={16} className="battery-icon is-medium" />;
    }
    if (batteryPercent > 10) {
      return <BatteryLow size={16} className="battery-icon is-low" />;
    }
    return <BatteryWarning size={16} className="battery-icon is-critical" />;
  };

  // Helper for title tooltip
  const getGamepadTooltip = () => {
    if (!gamepadConnected) {
      return "No Gamepad Detected (Plug in USB or pair Bluetooth controller)";
    }
    if (gamepadBattery?.hasBatteryInfo) {
      const { batteryPercent, isCharging } = gamepadBattery;
      return `Gamepad Connected: ${gamepadBattery.gamepadId || 'Controller'} • Battery: ${batteryPercent}% ${isCharging ? '(Charging ⚡)' : ''}`;
    }
    return `Gamepad Connected: ${gamepadBattery?.gamepadId || 'Ready'} • USB / Wireless Active`;
  };

  // Battery status color styling
  const getGamepadColor = () => {
    if (!gamepadConnected) return '#64748b';
    if (gamepadBattery?.hasBatteryInfo) {
      const { batteryPercent, isCharging } = gamepadBattery;
      if (isCharging) return '#10b981';
      if (batteryPercent <= 10) return '#ef4444';
      if (batteryPercent <= 20) return '#f59e0b';
      return '#10b981';
    }
    return '#10b981';
  };

  return (
    <header className="console-topbar">
      <div className="topbar-left">
        <div 
          className={`avatar-badge profile-avatar-trigger ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'profile' ? 'gamepad-focused' : ''}`}
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
          className={`user-tag profile-name-tag ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'profile' ? 'gamepad-focused' : ''}`}
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
              className={`status-pill status-bgm ${bgm.isPlaying ? 'is-bgm-playing' : ''} ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'bgm' ? 'gamepad-focused' : ''}`}
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
                className={`status-pill status-bgm-skip ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'bgmSkip' ? 'gamepad-focused' : ''}`}
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

        {/* Gamepad Connection & Battery Status Pill */}
        <div 
          className={`status-pill status-gamepad ${gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 20 && !gamepadBattery.isCharging ? 'is-battery-low' : ''}`} 
          style={{ color: getGamepadColor() }}
          title={getGamepadTooltip()}
        >
          <Gamepad2 size={18} />
          <span className="pill-text">
            {gamepadConnected ? (
              gamepadBattery?.hasBatteryInfo ? (
                <>
                  <span className="gamepad-label">PAD</span>
                  <span className="battery-badge">
                    {renderBatteryIcon()}
                    <span className="battery-percent-text">{gamepadBattery.batteryPercent}%</span>
                    {gamepadBattery.isCharging && <span className="charging-tag">⚡</span>}
                  </span>
                </>
              ) : (
                'GAMEPAD READY'
              )
            ) : (
              'NO CONTROLLER'
            )}
          </span>
        </div>

        {/* Metadata Scraper Status / Trigger / Stop Button */}
        {scraper && (
          <button
            className={`status-pill status-scraper ${scraper.isScraping ? 'is-active-scraping is-stoppable' : ''} ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'scraper' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              if (scraper.isScraping) {
                scraper.stopScrape();
                sfx?.playModalClose?.();
              } else if (onOpenScraperModal) {
                onOpenScraperModal();
                sfx?.playModalOpen?.();
              } else {
                scraper.scrapeAll(undefined, true);
                sfx?.playThemeSwitch?.();
              }
            }}
            title={scraper.isScraping 
              ? `Scraping art... (${scraper.scrapeProgress.current}/${scraper.scrapeProgress.total}) — Click to STOP` 
              : "Choose Scraper Target Scope (System / Bunch / All / Single)"
            }
            aria-label={scraper.isScraping ? "Stop Metadata Scraper" : "Choose Scraper Target Scope"}
          >
            {scraper.isScraping ? (
              <>
                <Square size={14} className="stop-icon" fill="currentColor" />
                <span className="pill-text scrape-badge">{scraper.scrapeProgress.current}/{scraper.scrapeProgress.total}</span>
                <span className="scraper-stop-hover-text">STOP</span>
              </>
            ) : (
              <Sparkles size={18} color="#f59e0b" />
            )}
          </button>
        )}

        {/* SFX Audio Mute/Unmute Toggle */}
        {sfx && (
          <button
            className={`status-pill status-sfx ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'sfx' ? 'gamepad-focused' : ''}`}
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
            className={`status-pill theme-toggle-btn ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'theme' ? 'gamepad-focused' : ''}`}
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

        {/* Search Input Widget */}
        <div
          className={`status-pill status-search ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'search' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            if (searchInputRef?.current) {
              searchInputRef.current.focus();
            }
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

        {/* PWA Standalone App Install Button */}
        {pwa?.canInstall && (
          <button
            className={`status-pill status-install-pwa ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'install' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              pwa.promptInstall();
              sfx?.playThemeSwitch?.();
            }}
            title="Install Retro Player as a Standalone Desktop / Handheld App"
            aria-label="Install Retro Player App"
          >
            <Download size={16} />
            <span className="pill-text">INSTALL APP</span>
          </button>
        )}

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

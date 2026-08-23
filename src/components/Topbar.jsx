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
  Download,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Topbar console header with active profile avatar, BGM music player, status indicators,
 * PWA install button, search input, custom ROM loader, and digital clock.
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
  setShowVirtualKeyboard,
  onOpenScraperModal,
  onOpenThemeModal,
  time,
  sfx,
  themeEngine,
  scraper
}) {
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
        <button
          type="button" 
          className={`topbar-profile-pill ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'profile' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            onOpenProfileSelect?.();
            sfx?.playModalOpen?.();
          }}
          title={`Profile: ${activeProfile?.name || 'Player 1'} (Click to switch)`}
          aria-label={`Switch User Profile (Current: ${activeProfile?.name || 'Player 1'})`}
        >
          <div 
            className="topbar-profile-avatar"
            style={{ 
              borderColor: activeProfile?.favoriteColor || '#ef4444',
              boxShadow: `0 2px 8px ${(activeProfile?.favoriteColor || '#ef4444')}40`
            }}
          >
            <MultiAvatar 
              seed={activeProfile?.avatarSeed || activeProfile?.name || 'Player 1'} 
              size={32} 
            />
          </div>
          <span className="topbar-profile-name">
            {activeProfile?.name || 'Player 1'}
          </span>
        </button>
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
            className={`status-pill status-scraper-pill ${scraper.isScraping ? 'is-active-scraping is-stoppable' : ''} ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'scraper' ? 'gamepad-focused' : ''}`}
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
              : "Choose Scraper Target Scope (All Systems / Single System)"
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
              <div className="status-scraper-inner">
                {gamepadConnected && <span className="osk-btn-badge badge-x topbar-keycap">X</span>}
                <Sparkles size={16} color="#f59e0b" />
                <span className="pill-text status-scraper-label">SCRAPER</span>
              </div>
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
        {themeEngine && themeEngine.availableThemes?.length > 1 && (
          <button
            className={`status-pill theme-toggle-btn ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'theme' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              if (onOpenThemeModal) {
                onOpenThemeModal();
                sfx?.playModalOpen?.();
              } else {
                themeEngine.cycleTheme();
                sfx?.playThemeSwitch?.();
              }
            }}
            title={`Theme Studio: ${themeEngine.currentThemeMeta.name} (${themeEngine.colorMode === 'dark' ? 'Dark' : 'Light'})`}
            aria-label={`Theme Studio: Current ${themeEngine.currentThemeMeta.name}`}
          >
            {themeEngine.currentThemeMeta.icon && (themeEngine.currentThemeMeta.icon.endsWith('.svg') || themeEngine.currentThemeMeta.icon.includes('/')) ? (
              <img 
                src={resolveAssetPath(themeEngine.currentThemeMeta.icon)} 
                alt={themeEngine.currentThemeMeta.name} 
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{themeEngine.currentThemeMeta.icon}</span>
            )}
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
          {gamepadConnected ? (
            <span className="osk-btn-badge badge-y topbar-keycap">Y</span>
          ) : (
            <Search size={16} color="#64748b" />
          )}
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

        {/* Real-time Clock */}
        <div className="status-pill status-clock">
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
}

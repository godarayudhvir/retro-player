import React, { useState, useEffect } from 'react';
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
  Save,
  Zap,
  Info,
  Database,
  Sun,
  Moon,
  Trophy
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { resolveAssetPath } from '../utils/assetPath';
import { haptics } from '../services/hapticsService';

/**
 * Topbar console header with active profile avatar, BGM music player, status indicators,
 * Auto-Resume slider switch, Dark/Light theme switcher, search input, custom ROM loader, and digital clock.
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
  onOpenAboutModal,
  onOpenBackupModal,
  onOpenTrophyModal,
  time,
  sfx,
  themeEngine,
  scraper,
  achievementsEngine
}) {
  // Auto-Resume on Game Launch Toggle (Persistent localStorage sync)
  const [isAutoResumeEnabled, setIsAutoResumeEnabled] = useState(() => {
    try {
      return localStorage.getItem('retro_auto_resume_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'retro_auto_resume_enabled') {
        setIsAutoResumeEnabled(e.newValue !== 'false');
      }
    };
    const handleCustomEvent = () => {
      try {
        setIsAutoResumeEnabled(localStorage.getItem('retro_auto_resume_enabled') !== 'false');
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('retro_auto_resume_changed', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('retro_auto_resume_changed', handleCustomEvent);
    };
  }, []);

  const handleToggleAutoResume = () => {
    const nextVal = !isAutoResumeEnabled;
    setIsAutoResumeEnabled(nextVal);
    try {
      localStorage.setItem('retro_auto_resume_enabled', nextVal ? 'true' : 'false');
      window.dispatchEvent(new Event('retro_auto_resume_changed'));
    } catch (e) {}
    sfx?.playTabSwitch?.();
  };

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

  return (
    <header className="console-topbar">
      <div className="topbar-left">
        <button
          type="button" 
          className={`topbar-profile-pill ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'profile' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            onOpenProfileSelect?.();
            sfx?.playModalOpen?.();
            haptics.medium();
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
                if (!bgm.isPlaying && bgm.currentTrack) {
                  achievementsEngine?.triggerBgmTrackPlayed?.(bgm.currentTrack.title || bgm.currentTrack.url);
                }
                sfx?.playTileNav?.();
                haptics.selection();
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
                  if (bgm.currentTrack) {
                    achievementsEngine?.triggerBgmTrackPlayed?.(bgm.currentTrack.title || bgm.currentTrack.url);
                  }
                  sfx?.playTabSwitch?.();
                  haptics.selection();
                }}
                title="Next BGM Track"
                aria-label="Next BGM Track"
              >
                <SkipForward size={14} color="#94a3b8" />
              </button>
            )}
          </div>
        )}

        {/* Gamepad Connection & Battery Status Pill (Shown only when connected) */}
        {gamepadConnected && (
          <div 
            className={`status-pill status-gamepad is-connected ${gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 10 && !gamepadBattery.isCharging ? 'is-battery-critical' : gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 20 && !gamepadBattery.isCharging ? 'is-battery-low' : ''}`} 
            title={getGamepadTooltip()}
            aria-label={getGamepadTooltip()}
          >
            <Gamepad2 size={18} />
            {gamepadBattery?.hasBatteryInfo && (
              <span className="battery-badge">
                {renderBatteryIcon()}
                <span className="battery-percent-text">{gamepadBattery.batteryPercent}%</span>
                {gamepadBattery.isCharging && <span className="charging-tag">⚡</span>}
              </span>
            )}
          </div>
        )}

        {/* Metadata Scraper Status / Trigger / Stop Button */}
        {scraper && (
          <button
            className={`status-pill status-scraper-pill ${scraper.isScraping ? 'is-active-scraping is-stoppable' : ''} ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'scraper' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              if (scraper.isScraping) {
                scraper.stopScrape();
                sfx?.playModalClose?.();
                haptics.medium();
              } else if (onOpenScraperModal) {
                onOpenScraperModal();
                sfx?.playModalOpen?.();
                haptics.medium();
              } else {
                scraper.scrapeAll(undefined, true);
                sfx?.playThemeSwitch?.();
                haptics.selection();
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
            onClick={() => {
              sfx.toggleMute();
              haptics.selection();
            }}
            title={sfx.isMuted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
            aria-label={sfx.isMuted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
          >
            {sfx.isMuted ? <VolumeX size={18} color="#94a3b8" /> : <Volume2 size={18} color="#3b82f6" />}
          </button>
        )}

        {/* Auto-Resume on Launch Toggle Switch */}
        <button
          type="button"
          className={`status-pill status-autoresume ${isAutoResumeEnabled ? 'is-enabled' : 'is-disabled'} ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'autoresume' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            handleToggleAutoResume();
            haptics.selection();
          }}
          title={`Auto-Resume on Launch: ${isAutoResumeEnabled ? 'ENABLED (Will prompt to restore last session)' : 'DISABLED (Always boot fresh game title)'}`}
          aria-label="Toggle Auto-Resume on Launch"
        >
          <div className="status-autoresume-inner">
            <Save size={16} color={isAutoResumeEnabled ? '#10b981' : '#64748b'} />
            <span className="pill-text status-autoresume-label">AUTO-RESUME</span>
            <span className={`topbar-mini-switch ${isAutoResumeEnabled ? 'active' : ''}`}>
              <span className="topbar-mini-knob" />
            </span>
          </div>
        </button>

        {/* Search Input Widget */}
        <div
          className={`status-pill status-search ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'search' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            haptics.selection();
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

        {/* Dark / Light Color Mode Toggle */}
        {themeEngine && (
          <button
            type="button"
            className={`status-pill status-colormode-toggle ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'colormode' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              themeEngine.toggleColorMode?.();
              achievementsEngine?.triggerThemeToggled?.();
              sfx?.playThemeSwitch?.();
              haptics.selection();
            }}
            title={`Switch to ${themeEngine.colorMode === 'dark' ? 'Light' : 'Dark'} Mode (Current: ${themeEngine.colorMode === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'})`}
            aria-label={`Toggle Color Mode (Current: ${themeEngine.colorMode === 'dark' ? 'Dark' : 'Light'})`}
          >
            {themeEngine.colorMode === 'dark' ? (
              <Moon size={17} color="#fbbf24" fill="rgba(251, 191, 36, 0.2)" />
            ) : (
              <Sun size={17} color="#f59e0b" fill="rgba(245, 158, 11, 0.2)" />
            )}
          </button>
        )}

        {/* Load Custom ROM */}
        <button
          className="status-pill status-loadrom"
          onClick={() => {
            setShowLoadRomModal(true);
            sfx?.playModalOpen?.();
            haptics.medium();
          }}
          title="Open Load Custom ROM dialog"
          aria-label="Load Custom ROM"
        >
          <FolderOpen size={18} color="#3b82f6" />
        </button>

        {/* Storage & Database Management Studio (Backup, Restore & Reset) */}
        <button
          className="status-pill status-backup-app"
          onClick={() => {
            onOpenBackupModal?.();
            sfx?.playModalOpen?.();
            haptics.medium();
          }}
          title="Storage & Database Studio (Backup, Restore & Reset Storage)"
          aria-label="Storage and Database Studio"
        >
          <Database size={17} color="#2563eb" />
        </button>

        {/* Hall of Fame & Trophy Cabinet */}
        <button
          type="button"
          className={`status-pill status-trophies ${focusedTarget?.zone === 'topbar' && focusedTarget?.id === 'trophy' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            onOpenTrophyModal?.();
            sfx?.playModalOpen?.();
            haptics.medium();
          }}
          title={`Trophy Cabinet & Milestones (${achievementsEngine?.totalEarnedPoints || 0} G Earned)`}
          aria-label="Trophy Cabinet and Milestones"
        >
          <Trophy size={18} color="#f59e0b" />
        </button>

        {/* About & System Info (v1.0.6) */}
        <button
          className="status-pill status-info-app"
          onClick={() => {
            onOpenAboutModal?.();
            sfx?.playModalOpen?.();
          }}
          title="About Retro Player & System Capabilities"
          aria-label="About Retro Player"
        >
          <Info size={17} color="#059669" />
        </button>

        {/* Real-time Clock */}
        <div className="status-pill status-clock">
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
}

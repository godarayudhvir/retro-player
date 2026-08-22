import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Topbar from './components/Topbar';
import SystemRibbon from './components/SystemRibbon';
import CartridgeGrid from './components/CartridgeGrid';
import GameDetailModal from './components/GameDetailModal';
import LoadRomModal from './components/LoadRomModal';
import AboutInfoModal from './components/AboutInfoModal';
import DropzoneOverlay from './components/DropzoneOverlay';
import ConsoleHud from './components/ConsoleHud';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import EmulatorModal from './components/EmulatorModal';
import ProfileSelectModal from './components/ProfileSelectModal';
import MiiCreatorModal from './components/MiiCreatorModal';
import SettingsView from './components/SettingsView';
import DemoWelcomeModal from './components/DemoWelcomeModal';
import OnboardingScreen from './components/OnboardingScreen';
import ScraperModal from './components/ScraperModal';
import MobileAppView from './components/MobileAppView';
import MetadataEditModal from './components/MetadataEditModal';

import { useWebAudioSfx } from './hooks/useWebAudioSfx';
import { useGamepadStatus } from './hooks/useGamepadStatus';
import { useSaveDataManager } from './hooks/useSaveDataManager';
import { useRomManifest } from './hooks/useRomManifest';
import { useGamepadNavigation } from './hooks/useGamepadNavigation';
import { usePlaytimeAndFavorites } from './hooks/usePlaytimeAndFavorites';
import { useThemeEngine } from './hooks/useThemeEngine';
import { useMetadataScraper } from './hooks/useMetadataScraper';
import { useProfileManager } from './hooks/useProfileManager';
import { useBgmEngine } from './hooks/useBgmEngine';
import { usePwaInstall } from './hooks/usePwaInstall';
import { BatteryWarning, Zap, X } from 'lucide-react';

/**
 * Root Application Orchestrator for Retro Player.
 * Coordinates modular UI components, profiles, Mii avatars, BGM audio, themes, settings, PWA, and emulation.
 */
export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [selectedGameCard, setSelectedGameCard] = useState(null);
  const [focusedTarget, setFocusedTarget] = useState({ zone: 'grid', index: 0 });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLoadRomModal, setShowLoadRomModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [showProfileSelectModal, setShowProfileSelectModal] = useState(false);
  const [showMiiCreatorModal, setShowMiiCreatorModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editingMetadataGame, setEditingMetadataGame] = useState(null);
  const [oskPos, setOskPos] = useState({ row: 1, col: 0 });
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [hasChosenProfileThisSession, setHasChosenProfileThisSession] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [selectedMobileSystem, setSelectedMobileSystem] = useState(null);
  const [selectedMobileGameForDetails, setSelectedMobileGameForDetails] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem('retro_onboarding_completed') !== 'true';
    } catch {
      return false;
    }
  });

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchInputRef = useRef(null);

  // Hook 1: Profile Manager & Mii Avatars
  const {
    profiles,
    activeProfile,
    activeProfileId,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile
  } = useProfileManager();

  // Hook 2: Web Audio UI Sound Effects Synthesizer
  const sfx = useWebAudioSfx();

  // Hook 3: Multi-Theme Engine
  const themeEngine = useThemeEngine();

  // Hook 4: Background Music (BGM) Engine with smart in-game pause
  const bgm = useBgmEngine({ activeGame });

  // Hook 5: Favorites, Recently Played, and Playtime Analytics (Scoped per Active Profile)
  const {
    favorites,
    recentlyPlayed,
    isFavorite,
    toggleFavorite,
    recordGameLaunch,
    recordGameSession,
    resetGameStats,
    getGameStats
  } = usePlaytimeAndFavorites(activeProfileId);

  // Hook 6: Gamepad Connection Tracking & Battery Telemetry
  const gamepadStatus = useGamepadStatus({ sfx });
  const { gamepadConnected, setGamepadConnected } = gamepadStatus;

  // Hook 7: Save Data & Battery SRAM Inspection
  const { hasSaveData, checkSaveData } = useSaveDataManager();

  // Selection Handler for opening Game Detail Drawer Modal
  const handleGameSelect = useCallback(async (game, isNavigating = false) => {
    setSelectedGameCard(game);
    if (!isNavigating) {
      sfx.playModalOpen();
    } else {
      sfx.playTileNav();
    }
    const saveExists = await checkSaveData(game, activeProfileId);
    if (saveExists) {
      sfx.playSaveDetected();
    }
  }, [checkSaveData, activeProfileId, sfx]);

  // Hook 6: ROM Catalog Manifest & Drag-Drop Loading (opens GameDetailModal)
  const handleCustomRomLoaded = useCallback((customGame) => {
    handleGameSelect(customGame);
    setFocusedTarget({ zone: 'cardModal', id: 'play' });
  }, [handleGameSelect]);

  const {
    games,
    systems,
    activeSystem,
    setActiveSystem,
    searchQuery,
    setSearchQuery,
    loading,
    filteredGames,
    isDraggingOver,
    fetchGames,
    processCustomRomFile,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useRomManifest(handleCustomRomLoaded, { favorites, recentlyPlayed });

  // Hook 7: Automated Online Metadata & Cover Art Scraper
  const scraper = useMetadataScraper(games, { isMobile, isPlaying: !!activeGame });

  // Calculate active index and prev/next handlers for Detailed View Carousel
  const currentFilteredIndex = useMemo(() => {
    if (!selectedGameCard || !filteredGames || filteredGames.length === 0) return -1;
    return filteredGames.findIndex(g => (g.id && g.id === selectedGameCard.id) || g.title === selectedGameCard.title);
  }, [selectedGameCard, filteredGames]);

  const handlePrevGame = useCallback(() => {
    if (!filteredGames || filteredGames.length <= 1 || currentFilteredIndex === -1) return;
    const prevIdx = (currentFilteredIndex - 1 + filteredGames.length) % filteredGames.length;
    const nextGame = filteredGames[prevIdx];
    handleGameSelect(nextGame, true);
  }, [filteredGames, currentFilteredIndex, handleGameSelect]);

  const handleNextGame = useCallback(() => {
    if (!filteredGames || filteredGames.length <= 1 || currentFilteredIndex === -1) return;
    const nextIdx = (currentFilteredIndex + 1) % filteredGames.length;
    const nextGame = filteredGames[nextIdx];
    handleGameSelect(nextGame, true);
  }, [filteredGames, currentFilteredIndex, handleGameSelect]);

  // Hook 8: Progressive Web App (PWA) & Service Worker Cache Engine
  const pwa = usePwaInstall();

  // Hook 9: Unified Spatial Navigation Engine (Keyboard + Gamepad + Audio)
  useGamepadNavigation({
    focusedTarget,
    setFocusedTarget,
    showInfoModal,
    setShowInfoModal,
    showLoadRomModal,
    setShowLoadRomModal,
    showSettingsModal,
    setShowSettingsModal,
    showScraperModal,
    setShowScraperModal,
    showProfileSelectModal,
    setShowProfileSelectModal,
    showMiiCreatorModal,
    setShowMiiCreatorModal,
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    oskPos,
    setOskPos,
    selectedGameCard,
    setSelectedGameCard,
    activeGame,
    setActiveGame,
    activeSystem,
    setActiveSystem,
    bgm,
    filteredGames,
    systems,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    gamepadConnected,
    setGamepadConnected,
    sfx,
    handleGameSelect,
    onPrevGame: handlePrevGame,
    onNextGame: handleNextGame,
    fetchGames,
    toggleFavorite,
    themeEngine,
    pwa,
    onOpenScraperModal: () => setShowScraperModal(true),
    // Mobile coordination
    isMobile,
    selectedMobileGameForDetails,
    setSelectedMobileGameForDetails,
    hasChosenProfileThisSession,
    setHasChosenProfileThisSession,
    showProfileSwitcher,
    setShowProfileSwitcher,
    selectedMobileSystem,
    setSelectedMobileSystem,
    profiles,
    activeProfileId,
    onSelectProfile: switchProfile,
    onCreateNewProfile: () => {
      setEditingProfile(null);
      setShowMiiCreatorModal(true);
    },
    onPlayGame: (game) => {
      recordGameLaunch(game);
      sfx.playGameLaunch();
      setActiveGame(game);
    },
    games
  });

  // Digital clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Global unhandled runtime error logging
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('🚨 [GLOBAL UNHANDLED RUNTIME ERROR]:', event.error || event.message, 'At:', event.filename, 'Line:', event.lineno);
    };
    const handleUnhandledRejection = (event) => {
      console.error('🚨 [UNHANDLED PROMISE REJECTION]:', event.reason);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Auto-scroll focused element into view
  useEffect(() => {
    const focusedEl = document.querySelector('.gamepad-focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedTarget]);

  const selectedGameMetadata = selectedGameCard
    ? (scraper.metadataMap[selectedGameCard.id] || scraper.metadataMap[`${selectedGameCard.systemKey}-${selectedGameCard.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')])
    : null;

  return (
    <div 
      className={`console-container ${isMobile ? 'mobile-mode-active' : ''} ${isDraggingOver ? 'drag-over-active' : ''}`}
      data-theme={isMobile ? 'classic-light' : themeEngine.theme}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop ROM Overlay */}
      <DropzoneOverlay isDraggingOver={isDraggingOver} />

      {/* MOBILE-SPECIFIC DEDICATED NETFLIX-STYLE VIEW (Zero side-effects on Desktop/PC/TV) */}
      {isMobile ? (
        <MobileAppView
          games={games}
          systems={systems}
          activeProfile={activeProfile}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={switchProfile}
          onCreateNewProfile={() => {
            setEditingProfile(null);
            setShowMiiCreatorModal(true);
          }}
          onEditProfile={(prof) => {
            setEditingProfile(prof);
            setShowMiiCreatorModal(true);
          }}
          onDeleteProfile={deleteProfile}
          favorites={favorites}
          recentlyPlayed={recentlyPlayed}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          getGameStats={getGameStats}
          onPlayGame={(game) => {
            recordGameLaunch(game);
            sfx.playGameLaunch();
            setActiveGame(game);
          }}
          metadataMap={scraper.metadataMap}
          onCustomRomLoad={processCustomRomFile}
          sfx={sfx}
          focusedTarget={focusedTarget}
          setFocusedTarget={setFocusedTarget}
          selectedGameForDetails={selectedMobileGameForDetails}
          setSelectedGameForDetails={setSelectedMobileGameForDetails}
          hasChosenProfileThisSession={hasChosenProfileThisSession}
          setHasChosenProfileThisSession={setHasChosenProfileThisSession}
          showProfileSwitcher={showProfileSwitcher}
          setShowProfileSwitcher={setShowProfileSwitcher}
          selectedSystem={selectedMobileSystem}
          setSelectedSystem={setSelectedMobileSystem}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          bgm={bgm}
        />
      ) : (
        <>
          {/* Top Console Status Bar */}
          <Topbar
            gamepadConnected={gamepadConnected}
            gamepadBattery={gamepadStatus}
            activeProfile={activeProfile}
            onOpenProfileSelect={() => setShowProfileSelectModal(true)}
            bgm={bgm}
            pwa={pwa}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchInputRef={searchInputRef}
            setShowLoadRomModal={setShowLoadRomModal}
            setShowSettingsModal={setShowSettingsModal}
            setShowVirtualKeyboard={setShowVirtualKeyboard}
            onOpenScraperModal={() => setShowScraperModal(true)}
            time={time}
            sfx={sfx}
            themeEngine={themeEngine}
            scraper={scraper}
          />

          {/* System Selection Ribbon */}
          <SystemRibbon
            systems={systems}
            activeSystem={activeSystem}
            setActiveSystem={setActiveSystem}
            totalGamesCount={games.length}
            favoritesCount={favorites.length}
            recentCount={recentlyPlayed.length}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            sfx={sfx}
          />

          {/* 3D Cartridge Grid Viewport */}
          <CartridgeGrid
            filteredGames={filteredGames}
            metadataMap={scraper.metadataMap}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            handleGameSelect={handleGameSelect}
            fetchGames={fetchGames}
            loading={loading}
            isFavorite={isFavorite}
            activeSystem={activeSystem}
            searchQuery={searchQuery}
            setActiveSystem={setActiveSystem}
            setSearchQuery={setSearchQuery}
            sfx={sfx}
          />

          {/* Bottom Controller HUD */}
          <ConsoleHud
            gamepadConnected={gamepadConnected}
            activeSystem={activeSystem}
            systems={systems}
            setActiveSystem={setActiveSystem}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            sfx={sfx}
          />
        </>
      )}

      {/* Load Custom ROM In-App Modal Dialog */}
      <LoadRomModal
        isOpen={showLoadRomModal}
        focusedTarget={focusedTarget}
        onClose={() => {
          setShowLoadRomModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'loadRom' });
          sfx.playModalClose();
        }}
        onFileLoaded={(file) => {
          processCustomRomFile(file);
        }}
      />

      {/* About Project Info Dialog */}
      <AboutInfoModal
        isOpen={showInfoModal}
        focusedTarget={focusedTarget}
        onClose={() => {
          setShowInfoModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'info' });
          sfx.playModalClose();
        }}
      />

      {/* Game Detail Drawer Modal */}
      <GameDetailModal
        game={selectedGameCard}
        metadata={selectedGameMetadata}
        hasSaveData={hasSaveData}
        isFavorite={isFavorite(selectedGameCard?.id || selectedGameCard?.title)}
        onToggleFavorite={toggleFavorite}
        onResetStats={resetGameStats}
        onScrapeGame={scraper.scrapeSingleGame}
        onEditMetadata={(game, meta) => setEditingMetadataGame({ game, metadata: meta })}
        onPrevGame={handlePrevGame}
        onNextGame={handleNextGame}
        hasPrev={filteredGames && filteredGames.length > 1}
        hasNext={filteredGames && filteredGames.length > 1}
        currentIndex={currentFilteredIndex}
        totalGames={filteredGames?.length || 0}
        isScraping={scraper.isScraping}
        scraper={scraper}
        gameStats={getGameStats(selectedGameCard?.id || selectedGameCard?.title)}
        gamepadConnected={gamepadConnected}
        focusedTarget={focusedTarget}
        onClose={() => {
          setSelectedGameCard(null);
          setFocusedTarget({ zone: 'grid', index: focusedTarget?.index || 0 });
          sfx.playModalClose();
        }}
        onPlay={() => {
          const gameToLaunch = selectedGameCard;
          setSelectedGameCard(null);
          recordGameLaunch(gameToLaunch);
          sfx.playGameLaunch();
          setActiveGame(gameToLaunch);
        }}
        sfx={sfx}
      />

      {/* In-App Jellyfin-Style Metadata Editor */}
      <MetadataEditModal
        isOpen={!!editingMetadataGame}
        game={editingMetadataGame?.game}
        metadata={editingMetadataGame?.metadata}
        onSaveSuccess={(updatedRecord) => {
          if (updatedRecord) {
            scraper.updateLocalMetadata?.(updatedRecord.id, updatedRecord);
          } else {
            scraper.refreshCache?.();
          }
        }}
        onClose={() => {
          setEditingMetadataGame(null);
          sfx.playModalClose();
        }}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        sfx={sfx}
      />

      {/* On-Screen Virtual Keyboard for Gamepad / Touch */}
      <OnScreenKeyboard
        isOpen={showVirtualKeyboard}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={() => {
          setShowVirtualKeyboard(false);
          setFocusedTarget({ zone: 'grid', index: 0 });
          sfx.playModalClose();
        }}
        focusedPos={oskPos}
        onKeyClick={(r, c) => {
          setOskPos({ row: r, col: c });
          sfx.playKeyTick();
        }}
        resultsCount={filteredGames.length}
        gamepadConnected={gamepadConnected}
      />

      {/* User Profile Selector Modal */}
      <ProfileSelectModal
        isOpen={showProfileSelectModal}
        profiles={profiles}
        activeProfileId={activeProfileId}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        onSelectProfile={(id) => {
          switchProfile(id);
          setShowProfileSelectModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
        }}
        onCreateNewProfile={() => {
          setEditingProfile(null);
          setShowProfileSelectModal(false);
          setShowMiiCreatorModal(true);
        }}
        onEditProfile={(profile) => {
          setEditingProfile(profile);
          setShowProfileSelectModal(false);
          setShowMiiCreatorModal(true);
        }}
        onDeleteProfile={(id) => {
          deleteProfile(id);
        }}
        onClose={() => {
          setShowProfileSelectModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
          sfx.playModalClose();
        }}
        sfx={sfx}
      />

      {/* Nintendo Mii Profile & Avatar Studio Wizard Modal */}
      <MiiCreatorModal
        isOpen={showMiiCreatorModal}
        initialProfile={editingProfile}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        onSave={(data) => {
          if (editingProfile) {
            updateProfile(editingProfile.id, data);
          } else {
            createProfile(data.name, data.miiData, data.favoriteColor);
          }
          setShowMiiCreatorModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
        }}
        onClose={() => {
          setShowMiiCreatorModal(false);
          setEditingProfile(null);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
          sfx.playModalClose();
        }}
        sfx={sfx}
      />

      {/* Full-Screen Nintendo Switch Style System Settings Menu Page */}
      <SettingsView
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'settings' });
          sfx.playModalClose();
        }}
        games={games}
        systems={systems}
        fetchGames={fetchGames}
        bgm={bgm}
        pwa={pwa}
        sfx={sfx}
        themeEngine={themeEngine}
        scraper={scraper}
        onOpenScraperModal={() => setShowScraperModal(true)}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        gamepadConnected={gamepadConnected}
        gamepadBattery={gamepadStatus}
      />

      {/* Granular Scraper Scope Selector Modal */}
      <ScraperModal
        isOpen={showScraperModal}
        onClose={() => {
          setShowScraperModal(false);
          sfx.playModalClose();
        }}
        systems={systems}
        games={games}
        scraper={scraper}
        sfx={sfx}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
      />

      {/* Active Game Emulator Sandbox */}
      {activeGame && (
        <EmulatorModal
          game={activeGame}
          gamepadConnected={gamepadConnected}
          activeProfileId={activeProfileId}
          sfx={sfx}
          onClose={() => setActiveGame(null)}
          onSessionEnd={(gameId, elapsedSeconds) => {
            recordGameSession(gameId, elapsedSeconds);
          }}
        />
      )}

      {/* Modern Full-Screen Responsive Onboarding Experience (Desktop & Mobile) */}
      {showOnboarding && (
        <OnboardingScreen
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          activeProfile={activeProfile}
          onSaveCreatedProfile={(name, miiData, favoriteColor) => {
            if (activeProfile?.id) {
              updateProfile(activeProfile.id, { name, miiData, favoriteColor });
            } else {
              createProfile(name, miiData, favoriteColor);
            }
          }}
          sfx={sfx}
          pwa={pwa}
        />
      )}

      {/* Gamepad Low Battery Alert In-App Banner */}
      {gamepadStatus.lowBatteryAlert && (
        <aside 
          className={`gamepad-battery-alert-toast ${gamepadStatus.lowBatteryAlert.isCritical ? 'is-critical' : 'is-warning'} animate-slide-up`}
          role="alert"
          aria-live="assertive"
        >
          <div className="alert-icon-wrap">
            <BatteryWarning size={24} className="pulse-battery-alert" />
          </div>
          <div className="alert-content">
            <div className="alert-title">
              <strong>{gamepadStatus.lowBatteryAlert.isCritical ? 'CRITICAL GAMEPAD BATTERY' : 'LOW GAMEPAD BATTERY'}</strong>
              <span className="alert-pct-badge">{gamepadStatus.lowBatteryAlert.levelPercent}%</span>
            </div>
            <p className="alert-message">{gamepadStatus.lowBatteryAlert.message}</p>
          </div>
          <button 
            className="alert-dismiss-btn"
            onClick={() => {
              gamepadStatus.dismissBatteryAlert();
              sfx?.playModalClose?.();
            }}
            title="Dismiss Battery Alert (B / Esc)"
            aria-label="Dismiss Battery Alert"
          >
            <X size={18} />
          </button>
        </aside>
      )}
    </div>
  );
}

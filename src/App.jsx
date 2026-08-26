import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Topbar from './components/Topbar';
import SystemRibbon from './components/SystemRibbon';
import CartridgeGrid from './components/CartridgeGrid';
import LoadRomModal from './components/LoadRomModal';
import AboutInfoModal from './components/AboutInfoModal';
import DropzoneOverlay from './components/DropzoneOverlay';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import EmulatorModal from './components/EmulatorModal';
import ProfileSelectModal from './components/ProfileSelectModal';
import ProfileCreatorModal from './components/ProfileCreatorModal';
import DemoWelcomeModal from './components/DemoWelcomeModal';
import OnboardingScreen from './components/OnboardingScreen';
import ScraperModal from './components/ScraperModal';
import MobileAppView from './components/MobileAppView';
import MetadataEditModal from './components/MetadataEditModal';
import ThemeSwitcherModal from './components/ThemeSwitcherModal';
import BackupModal from './components/BackupModal';

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
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useMobileHistoryNavigation } from './hooks/useMobileHistoryNavigation';
import { syncAllStoresFromBackend } from './services/db';
import { BatteryWarning, Zap, X } from 'lucide-react';

/**
 * Root Application Orchestrator for Retro Player.
 * Coordinates modular UI components, profiles, Multiavatar avatars, BGM audio, themes, PWA, and emulation.
 */
export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [focusedTarget, setFocusedTarget] = useState({ zone: 'grid', index: 0 });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLoadRomModal, setShowLoadRomModal] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [oskConfig, setOskConfig] = useState({
    title: 'SEARCH LIBRARY',
    subtitle: null,
    placeholder: 'Type game or system name...',
    actionLabel: 'SEARCH',
    target: 'search', // 'search', 'playerName', 'avatarSeed', 'scraperTitle'
    initialValue: ''
  });
  const [showProfileSelectModal, setShowProfileSelectModal] = useState(false);
  const [showProfileCreatorModal, setShowProfileCreatorModal] = useState(false);
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

  // Modern W3C matchMedia viewport and UI mode tracking
  const { uiMode, setUiMode, isMobile } = useDeviceDetection();

  const searchInputRef = useRef(null);

  // Hook 1: Profile Manager & Multiavatar Avatars
  const {
    profiles,
    activeProfile,
    activeProfileId,
    getNextPlayerName,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile
  } = useProfileManager();

  // Hook 2: Web Audio UI Sound Effects Synthesizer
  const sfx = useWebAudioSfx();

  // Hook 3: Multi-Theme Engine
  const themeEngine = useThemeEngine();

  // Startup Database Cold Boot Synchronization
  useEffect(() => {
    syncAllStoresFromBackend();
  }, []);

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

  // Hook 7: Save Data & Battery SRAM Inspection and Management
  const {
    hasSaveData,
    checkSaveData,
    exportSaveFile,
    exportBatterySave,
    exportQuickSave,
    importSaveFile,
    deleteSaveFile
  } = useSaveDataManager();

  // Selection Handler for game tile navigation & save detection
  const handleCheckSaveData = useCallback(async (game) => {
    if (!game) return false;
    return checkSaveData(game, activeProfileId);
  }, [checkSaveData, activeProfileId]);

  const handleGameSelect = useCallback(async (game) => {
    sfx.playTileNav();
    const saveExists = await handleCheckSaveData(game);
    if (saveExists) {
      sfx.playSaveDetected();
    }
  }, [handleCheckSaveData, sfx]);

  const [loadRomInitialFile, setLoadRomInitialFile] = useState(null);

  // Custom ROM Quick Play: RAM-only direct play without DB storage or library searching
  const handleCustomRomLoaded = useCallback((customGame) => {
    if (customGame) {
      recordGameLaunch(customGame);
      sfx.playGameLaunch();
      setActiveGame(customGame);
    }
  }, [recordGameLaunch, sfx]);

  // Drag & Drop / External File Hook: open the Ingestion Review Modal
  const handleFileDropped = useCallback((file) => {
    if (file) {
      setLoadRomInitialFile(file);
      setShowLoadRomModal(true);
      sfx.playTileNav();
    }
  }, [sfx]);

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
    uploadRomAndScrape,
    deleteGame,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useRomManifest(handleCustomRomLoaded, { 
    favorites, 
    recentlyPlayed, 
    onFileDropped: handleFileDropped 
  });

  // Automated Online Metadata & Cover Art Scraper
  const scraper = useMetadataScraper(games, { isMobile, isPlaying: !!activeGame });

  // Progressive Web App (PWA) & Service Worker Cache Engine
  const pwa = usePwaInstall();

  // Hook 9: Unified Spatial Navigation Engine (Keyboard + Gamepad + Audio)
  useGamepadNavigation({
    focusedTarget,
    setFocusedTarget,
    showInfoModal,
    setShowInfoModal,
    showLoadRomModal,
    setShowLoadRomModal,
    showScraperModal,
    setShowScraperModal,
    showThemeModal,
    setShowThemeModal,
    showBackupModal,
    setShowBackupModal,
    showProfileSelectModal,
    setShowProfileSelectModal,
    showProfileCreatorModal,
    setShowProfileCreatorModal,
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    oskConfig,
    setOskConfig,
    oskPos,
    setOskPos,
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
      setShowProfileCreatorModal(true);
    },
    onPlayGame: (game) => {
      recordGameLaunch(game);
      sfx.playGameLaunch();
      const gameIdx = filteredGames.findIndex(g => (g.id && g.id === game?.id) || g.title === game?.title);
      if (gameIdx >= 0) {
        setFocusedTarget(isMobile ? { zone: 'mobileChips', index: gameIdx } : { zone: 'grid', index: gameIdx });
      }
      setActiveGame(game);
    },
    showOnboarding,
    setShowOnboarding,
    games
  });

  // Hook 10: PWA & Mobile History Navigation & Swipe-Back Gestures
  useMobileHistoryNavigation({
    activeGame,
    setActiveGame,
    selectedMobileGameForDetails,
    setSelectedMobileGameForDetails,
    selectedMobileSystem,
    setSelectedMobileSystem,
    showProfileSwitcher,
    setShowProfileSwitcher,
    showOnboarding,
    setShowOnboarding,
    showInfoModal,
    setShowInfoModal,
    showLoadRomModal,
    setShowLoadRomModal,
    showScraperModal,
    setShowScraperModal,
    showThemeModal,
    setShowThemeModal,
    showBackupModal,
    setShowBackupModal,
    showProfileSelectModal,
    setShowProfileSelectModal,
    showProfileCreatorModal,
    setShowProfileCreatorModal,
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    isMobile,
    sfx
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

  // Auto-scroll focused element into view (disabled inside onboarding on mobile to prevent viewport jumping)
  useEffect(() => {
    if (focusedTarget?.zone === 'onboarding') return;
    const focusedEl = document.querySelector('.gamepad-focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedTarget]);

  return (
    <div 
      className={`console-container ${isMobile ? 'mobile-mode-active' : ''} ${isDraggingOver ? 'drag-over-active' : ''}`}
      data-theme={themeEngine.theme}
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
            setShowProfileCreatorModal(true);
          }}
          onEditProfile={(prof) => {
            setEditingProfile(prof);
            setShowProfileCreatorModal(true);
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
          themeEngine={themeEngine}
          onOpenThemeModal={() => setShowThemeModal(true)}
          onEditMetadata={(game, meta) => setEditingMetadataGame({ game, metadata: meta })}
          onScrapeGame={scraper.scrapeSingleGame}
          onExportSave={(game) => exportSaveFile(game, activeProfileId)}
          onExportBatterySave={(game) => exportBatterySave(game, activeProfileId)}
          onExportQuickSave={(game) => exportQuickSave(game, activeProfileId)}
          onImportSave={(file, game) => importSaveFile(file, game, activeProfileId)}
          onDeleteSave={(game) => deleteSaveFile(game, activeProfileId)}
          checkSaveData={handleCheckSaveData}
          onResetStats={resetGameStats}
          hasSaveData={hasSaveData}
          scraper={scraper}
          pwa={pwa}
          gamepadConnected={gamepadConnected}
          gamepadBattery={gamepadStatus}
          time={time}
          onOpenScraperModal={() => setShowScraperModal(true)}
          onOpenAboutModal={() => setShowInfoModal(true)}
          onOpenBackupModal={() => setShowBackupModal(true)}
          setShowLoadRomModal={setShowLoadRomModal}
          setShowVirtualKeyboard={setShowVirtualKeyboard}
          onDeleteGame={deleteGame}
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
            setShowVirtualKeyboard={setShowVirtualKeyboard}
            onOpenScraperModal={() => setShowScraperModal(true)}
            onOpenThemeModal={() => setShowThemeModal(true)}
            onOpenAboutModal={() => setShowInfoModal(true)}
            onOpenBackupModal={() => setShowBackupModal(true)}
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
            gamepadConnected={gamepadConnected}
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
            themeEngine={themeEngine}
            getGameStats={getGameStats}
            onResetStats={resetGameStats}
            onPlayGame={(game) => {
              recordGameLaunch(game);
              sfx.playGameLaunch();
              setActiveGame(game);
            }}
            onToggleFavorite={toggleFavorite}
            onEditMetadata={(game, meta) => setEditingMetadataGame({ game, metadata: meta })}
            onScrapeGame={scraper.scrapeSingleGame}
            onExportSave={(game) => exportSaveFile(game, activeProfileId)}
            onExportBatterySave={(game) => exportBatterySave(game, activeProfileId)}
            onExportQuickSave={(game) => exportQuickSave(game, activeProfileId)}
            onImportSave={(file, game) => importSaveFile(file, game, activeProfileId)}
            onDeleteSave={(game) => deleteSaveFile(game, activeProfileId)}
            onDeleteGame={deleteGame}
            hasSaveData={hasSaveData}
            scraper={scraper}
            gamepadConnected={gamepadConnected}
            setShowLoadRomModal={setShowLoadRomModal}
          />
        </>
      )}

      {/* Load Custom ROM In-App Modal Dialog */}
      <LoadRomModal
        isOpen={showLoadRomModal}
        initialFile={loadRomInitialFile}
        focusedTarget={focusedTarget}
        onClose={() => {
          setShowLoadRomModal(false);
          setLoadRomInitialFile(null);
          setFocusedTarget({ zone: 'topbar', id: 'loadRom' });
          sfx.playModalClose();
        }}
        onQuickPlay={(file) => {
          // Direct Play: RAM only, no DB save, no search filtering
          processCustomRomFile(file);
        }}
        onUploadToLibrary={async (file, systemKey, onProgress) => {
          // Ingest: Upload/save to server/IndexedDB, scrape 3D box art, refresh library
          const game = await uploadRomAndScrape(file, systemKey, onProgress);
          if (game && scraper?.scrapeSingleGame) {
            await scraper.scrapeSingleGame(game);
          }
          if (game) {
            const rawBase = file.name.replace(/\.[^/.]+$/, "");
            const cleanSearch = game.title
              || rawBase.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
              || rawBase;
            setActiveSystem(game.systemKey || 'all');
            setSearchQuery(cleanSearch);
            sfx.playNavSelect();
          }
        }}
        sfx={sfx}
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
        title={oskConfig?.title || 'SEARCH LIBRARY'}
        subtitle={oskConfig?.subtitle}
        placeholder={oskConfig?.placeholder || 'Type text...'}
        actionLabel={oskConfig?.actionLabel || 'SUBMIT'}
        icon={oskConfig?.icon}
        searchQuery={
          oskConfig?.target === 'search'
            ? searchQuery
            : (oskConfig?.currentValue !== undefined ? oskConfig.currentValue : '')
        }
        onSearchChange={(val) => {
          if (oskConfig?.target === 'search') {
            setSearchQuery(val);
          } else {
            setOskConfig(prev => ({ ...prev, currentValue: val }));
            if (oskConfig?.onChange) oskConfig.onChange(val);
          }
        }}
        onSubmit={(finalVal) => {
          setShowVirtualKeyboard(false);
          const valueToCommit = finalVal !== undefined ? finalVal : (oskConfig?.currentValue || '');
          if (oskConfig?.onSubmit) {
            oskConfig.onSubmit(valueToCommit);
          } else if (oskConfig?.target !== 'search' && oskConfig?.onChange) {
            oskConfig.onChange(valueToCommit);
          }
          if (oskConfig?.onCloseTarget) {
            setFocusedTarget(oskConfig.onCloseTarget);
          } else if (oskConfig?.target === 'search') {
            setFocusedTarget({ zone: 'grid', index: 0 });
          }
          sfx.playMenuConfirm();
        }}
        onCancel={() => {
          setShowVirtualKeyboard(false);
          const initialVal = oskConfig?.initialValue !== undefined ? oskConfig.initialValue : '';
          if (oskConfig?.target === 'search') {
            setSearchQuery(initialVal);
          } else if (oskConfig?.onCancel) {
            oskConfig.onCancel(initialVal);
          } else if (oskConfig?.onChange) {
            oskConfig.onChange(initialVal);
          }
          if (oskConfig?.onCloseTarget) {
            setFocusedTarget(oskConfig.onCloseTarget);
          } else if (oskConfig?.target === 'search') {
            setFocusedTarget({ zone: 'grid', index: 0 });
          }
          sfx.playModalClose();
        }}
        onClose={() => {
          setShowVirtualKeyboard(false);
          const initialVal = oskConfig?.initialValue !== undefined ? oskConfig.initialValue : '';
          if (oskConfig?.target === 'search') {
            setSearchQuery(initialVal);
          } else if (oskConfig?.onCancel) {
            oskConfig.onCancel(initialVal);
          } else if (oskConfig?.onChange) {
            oskConfig.onChange(initialVal);
          }
          if (oskConfig?.onCloseTarget) {
            setFocusedTarget(oskConfig.onCloseTarget);
          } else if (oskConfig?.target === 'search') {
            setFocusedTarget({ zone: 'grid', index: 0 });
          }
          sfx.playModalClose();
        }}
        focusedPos={oskPos}
        onKeyClick={(r, c) => {
          setOskPos({ row: r, col: c });
          sfx.playKeyTick();
        }}
        resultsCount={filteredGames.length}
        gamepadConnected={gamepadConnected}
        isMobile={isMobile}
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
          setShowProfileCreatorModal(true);
        }}
        onEditProfile={(profile) => {
          setEditingProfile(profile);
          setShowProfileSelectModal(false);
          setShowProfileCreatorModal(true);
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

      {/* Multiavatar Profile Creator & Studio Wizard Modal */}
      <ProfileCreatorModal
        isOpen={showProfileCreatorModal}
        initialProfile={editingProfile}
        suggestedName={getNextPlayerName ? getNextPlayerName() : 'Player'}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        canDelete={Boolean(editingProfile && profiles.length > 1 && editingProfile.id !== 'prof_default')}
        onDelete={(id) => {
          deleteProfile(id);
          setShowProfileCreatorModal(false);
          setEditingProfile(null);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
        }}
        onSave={(data) => {
          if (editingProfile) {
            updateProfile(editingProfile.id, data);
          } else {
            createProfile(data.name, data.avatarSeed, data.favoriteColor);
          }
          setShowProfileCreatorModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
        }}
        onClose={() => {
          setShowProfileCreatorModal(false);
          setEditingProfile(null);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
          sfx.playModalClose();
        }}
        sfx={sfx}
        gamepadConnected={gamepadConnected}
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
        isMobile={isMobile}
        gamepadConnected={gamepadConnected}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
      />

      {/* Console Theme Studio & Light/Dark Switcher Modal */}
      <ThemeSwitcherModal
        isOpen={showThemeModal}
        onClose={() => {
          setShowThemeModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'theme' });
          sfx.playModalClose();
        }}
        themeEngine={themeEngine}
        uiMode={uiMode}
        setUiMode={setUiMode}
        sfx={sfx}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
      />

      {/* Database Backup & Restore Studio Modal */}
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => {
          setShowBackupModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'backup' });
          sfx.playModalClose();
        }}
        sfx={sfx}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        onDataRestored={() => window.location.reload()}
      />

      {/* Active Game Emulator Sandbox */}
      {activeGame && (
        <EmulatorModal
          game={activeGame}
          gamepadConnected={gamepadConnected}
          activeProfileId={activeProfileId}
          sfx={sfx}
          focusedTarget={focusedTarget}
          setFocusedTarget={setFocusedTarget}
          onClose={() => {
            const playedGame = activeGame;
            setActiveGame(null);
            if (playedGame) {
              const gameIdx = filteredGames.findIndex(g => (g.id && g.id === playedGame.id) || g.title === playedGame.title);
              if (gameIdx >= 0) {
                setFocusedTarget(isMobile ? { zone: 'mobileChips', index: gameIdx } : { zone: 'grid', index: gameIdx });
              }
            }
          }}
          onSessionEnd={(gameId, elapsedSeconds) => {
            recordGameSession(gameId, elapsedSeconds);
          }}
        />
      )}

      {/* Modern Full-Screen Responsive Onboarding Experience (Desktop & Mobile) */}
      {showOnboarding && (
        <OnboardingScreen
          isOpen={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false);
            setFocusedTarget({ zone: 'grid', index: 0 });
          }}
          activeProfile={activeProfile}
          onSaveCreatedProfile={(name, avatarSeed, favoriteColor) => {
            const targetId = activeProfile?.id || 'prof_default';
            updateProfile(targetId, { name, avatarSeed, favoriteColor });
          }}
          sfx={sfx}
          pwa={pwa}
          gamepadConnected={gamepadConnected}
          focusedTarget={focusedTarget}
          setFocusedTarget={setFocusedTarget}
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
            title="Dismiss Battery Alert"
            aria-label="Dismiss Battery Alert"
          >
            <X size={18} />
          </button>
        </aside>
      )}
    </div>
  );
}

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
import BackupModal from './components/BackupModal';
import KeyboardControlsModal from './components/KeyboardControlsModal';
import AchievementToast from './components/AchievementToast';
import TrophyCabinetModal from './components/TrophyCabinetModal';

import { useAchievements } from './hooks/useAchievements';

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
import { useGamePresence } from './hooks/useGamePresence';
import { syncAllStoresFromBackend, getLinkedDirectoryHandles, removeLinkedDirectoryHandle } from './services/db';
import { scanDirectoryHandle, extractRomsFromInput } from './utils/folderScanner';
import { BatteryWarning, Zap, X } from 'lucide-react';

/**
 * Root Application Orchestrator for Retro Player.
 * Coordinates modular UI components, profiles, Multiavatar avatars, BGM audio, themes, PWA, and emulation.
 */
export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [pendingGameForLaunch, setPendingGameForLaunch] = useState(null);
  const [focusedTarget, setFocusedTarget] = useState({ zone: 'grid', index: 0 });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLoadRomModal, setShowLoadRomModal] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [targetTrophyId, setTargetTrophyId] = useState(null);
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
      handleRequestLaunchGame(customGame);
    }
  }, []);

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
    loadBatchCustomRoms,
    uploadRomAndScrape,
    batchUploadRoms,
    deleteGame,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useRomManifest(handleCustomRomLoaded, { 
    favorites, 
    recentlyPlayed, 
    onFileDropped: handleFileDropped 
  });

  // Hook 8: Universal Organic Achievements & Milestones Engine
  const achievementsEngine = useAchievements({
    activeProfileId,
    sfx,
    mountedGames: games,
    isPlaying: Boolean(activeGame)
  });

  const achievementsEngineRef = useRef(achievementsEngine);
  achievementsEngineRef.current = achievementsEngine;

  // Automatically record BGM track listen progress whenever a track plays
  const currentBgmTrackKey = bgm?.isPlaying && bgm?.currentTrack ? (bgm.currentTrack.title || bgm.currentTrack.url) : null;
  useEffect(() => {
    if (currentBgmTrackKey) {
      achievementsEngineRef.current?.triggerBgmTrackPlayed?.(currentBgmTrackKey);
    }
  }, [currentBgmTrackKey]);

  // Game Launch Orchestration: Check if keyboard splash prompt should show on UI before booting into emulator
  const handleLaunchGameImmediately = useCallback((game) => {
    if (!game) return;
    recordGameLaunch(game);
    achievementsEngine?.triggerGameLaunch?.(game);
    sfx.playGameLaunch();
    setActiveGame(game);
    setPendingGameForLaunch(null);
  }, [recordGameLaunch, achievementsEngine, sfx]);

  const handleRequestLaunchGame = useCallback((game) => {
    if (!game) return;
    const isMobileTouch = (typeof window !== 'undefined') && (
      (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) ||
      (('ontouchstart' in window) && window.innerWidth <= 768) ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
    );
    const sysKey = (game?.systemKey || game?.systemCore || 'default').toLowerCase();
    let skipPrompt = false;
    try {
      skipPrompt = localStorage.getItem(`retro_skip_keyboard_controls_prompt_${sysKey}`) === 'true' ||
                   localStorage.getItem('retro_skip_keyboard_controls_prompt') === 'true';
    } catch (e) {}

    if (isMobileTouch || gamepadConnected || skipPrompt) {
      handleLaunchGameImmediately(game);
    } else {
      (sfx?.playMenuConfirm || sfx?.playModalOpen || sfx?.playTileNav)?.();
      setPendingGameForLaunch(game);
    }
  }, [gamepadConnected, handleLaunchGameImmediately, sfx]);

  // Automated Online Metadata & Cover Art Scraper
  const scraper = useMetadataScraper(games, { isMobile, isPlaying: !!activeGame });

  // Dynamic Browser Tab Title: Show current game name when playing
  useEffect(() => {
    if (activeGame) {
      const gameTitle = activeGame.title || activeGame.name || 'Game';
      document.title = `▶ Playing ${gameTitle} • Retro Player`;
    } else {
      document.title = 'Retro Player';
    }
  }, [activeGame]);

  // Multi-Platform Game Presence & OS MediaSession Integration
  useGamePresence(activeGame);

  // Persistent Desktop Zero-Copy Linked Directory Handles
  const [linkedDirectoryHandles, setLinkedDirectoryHandles] = useState([]);
  const [isReconnectingHandle, setIsReconnectingHandle] = useState(false);

  // Check for desktop linked directory handles on startup
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined' && window.showDirectoryPicker) {
      getLinkedDirectoryHandles().then(async (handles) => {
        if (!handles || handles.length === 0) return;
        setLinkedDirectoryHandles(handles);

        // Check permissions and auto-mount granted handles
        const grantedHandles = [];
        for (const h of handles) {
          try {
            const perm = await h.queryPermission({ mode: 'read' });
            if (perm === 'granted') grantedHandles.push(h);
          } catch (_) {}
        }

        if (grantedHandles.length > 0) {
          console.log(`⚡ [AUTO-RECONNECT] Auto-loading ${grantedHandles.length} pre-authorized linked folder(s)...`);
          setIsReconnectingHandle(true);
          const allExtractedFiles = [];
          for (const gh of grantedHandles) {
            try {
              const rawFiles = await scanDirectoryHandle(gh, gh.name);
              if (rawFiles && rawFiles.length > 0) {
                const extracted = await extractRomsFromInput(rawFiles);
                if (extracted.files && extracted.files.length > 0) {
                  allExtractedFiles.push(...extracted.files);
                }
              }
            } catch (e) {
              console.warn(`Failed to auto-scan ${gh.name}:`, e);
            }
          }
          if (allExtractedFiles.length > 0) {
            await loadBatchCustomRoms(allExtractedFiles);
          }
          setIsReconnectingHandle(false);
        }
      }).catch(() => {});
    }
  }, [isMobile, loadBatchCustomRoms]);

  const handleReconnectLinkedFolders = useCallback(async (targetHandles = null) => {
    const handles = targetHandles || linkedDirectoryHandles;
    if (!handles || handles.length === 0) return;
    try {
      setIsReconnectingHandle(true);
      const allExtractedFiles = [];

      for (const handle of handles) {
        try {
          const perm = await handle.requestPermission({ mode: 'read' });
          if (perm === 'granted') {
            const rawFiles = await scanDirectoryHandle(handle, handle.name);
            if (rawFiles && rawFiles.length > 0) {
              const extracted = await extractRomsFromInput(rawFiles);
              if (extracted.files && extracted.files.length > 0) {
                allExtractedFiles.push(...extracted.files);
              }
            }
          }
        } catch (e) {
          console.warn(`Permission request failed for ${handle.name}:`, e);
        }
      }

      if (allExtractedFiles.length > 0) {
        sfx.playNavSelect();
        await loadBatchCustomRoms(allExtractedFiles);
        sfx.playThemeSwitch();
      }
      setIsReconnectingHandle(false);
    } catch (err) {
      console.error('Failed to reconnect linked folders:', err);
      setIsReconnectingHandle(false);
    }
  }, [linkedDirectoryHandles, loadBatchCustomRoms, sfx]);

  const handleRemoveLinkedFolder = useCallback(async (folderName) => {
    await removeLinkedDirectoryHandle(folderName);
    const updated = await getLinkedDirectoryHandles();
    setLinkedDirectoryHandles(updated);
    sfx?.playMenuBack?.();
  }, [sfx]);

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
    showBackupModal,
    setShowBackupModal,
    showTrophyModal,
    setShowTrophyModal,
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
    onOpenTrophyModal: () => setShowTrophyModal(true),
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
      const gameIdx = filteredGames.findIndex(g => (g.id && g.id === game?.id) || g.title === game?.title);
      if (gameIdx >= 0) {
        setFocusedTarget(isMobile ? { zone: 'mobileChips', index: gameIdx } : { zone: 'grid', index: gameIdx });
      }
      handleRequestLaunchGame(game);
    },
    showOnboarding,
    setShowOnboarding,
    games,
    achievementsEngine
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
    showBackupModal,
    setShowBackupModal,
    showTrophyModal,
    setShowTrophyModal,
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
          onPlayGame={handleRequestLaunchGame}
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
          onEditMetadata={(game, meta) => setEditingMetadataGame({ game, metadata: meta })}
          onScrapeGame={scraper.scrapeSingleGame}
          onExportSave={(game) => exportSaveFile(game, activeProfileId)}
          onExportBatterySave={async (game) => {
            const ok = await exportBatterySave(game, activeProfileId);
            if (ok) achievementsEngine?.triggerBatteryExport?.(game);
            return ok;
          }}
          onExportQuickSave={(game) => exportQuickSave(game, activeProfileId)}
          onImportSave={async (file, game) => {
            const ok = await importSaveFile(file, game, activeProfileId);
            if (ok) {
              achievementsEngine?.triggerBatteryImport?.(game);
              try {
                const arrayBuffer = await file.arrayBuffer();
                const u8 = new Uint8Array(arrayBuffer);
                achievementsEngine?.evaluatePokemonSave?.(game, u8);
              } catch (e) {}
            }
            return ok;
          }}
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
          onOpenTrophyModal={() => setShowTrophyModal(true)}
          setShowLoadRomModal={setShowLoadRomModal}
          setShowVirtualKeyboard={setShowVirtualKeyboard}
          onDeleteGame={deleteGame}
          achievementsEngine={achievementsEngine}
          themeEngine={themeEngine}
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
            onOpenAboutModal={() => setShowInfoModal(true)}
            onOpenBackupModal={() => setShowBackupModal(true)}
            onOpenTrophyModal={() => setShowTrophyModal(true)}
            time={time}
            sfx={sfx}
            themeEngine={themeEngine}
            scraper={scraper}
            achievementsEngine={achievementsEngine}
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
            onPlayGame={handleRequestLaunchGame}
            onToggleFavorite={toggleFavorite}
            onEditMetadata={(game, meta) => setEditingMetadataGame({ game, metadata: meta })}
            onScrapeGame={scraper.scrapeSingleGame}
            onExportSave={(game) => exportSaveFile(game, activeProfileId)}
            onExportBatterySave={async (game) => {
              const ok = await exportBatterySave(game, activeProfileId);
              if (ok) achievementsEngine?.triggerBatteryExport?.(game);
              return ok;
            }}
            onExportQuickSave={(game) => exportQuickSave(game, activeProfileId)}
            onImportSave={async (file, game) => {
              const ok = await importSaveFile(file, game, activeProfileId);
              if (ok) {
                achievementsEngine?.triggerBatteryImport?.(game);
                try {
                  const arrayBuffer = await file.arrayBuffer();
                  const u8 = new Uint8Array(arrayBuffer);
                  achievementsEngine?.evaluatePokemonSave?.(game, u8);
                } catch (e) {}
              }
              return ok;
            }}
            onDeleteSave={async (game) => {
              const ok = await deleteSaveFile(game, activeProfileId);
              if (ok) {
                achievementsEngine?.resetPokemonMilestones?.(game);
              }
              return ok;
            }}
            onDeleteGame={deleteGame}
            hasSaveData={hasSaveData}
            scraper={scraper}
            gamepadConnected={gamepadConnected}
            setShowLoadRomModal={setShowLoadRomModal}
            linkedDirectoryHandles={linkedDirectoryHandles}
            onReconnectLinkedFolders={handleReconnectLinkedFolders}
            isReconnectingLinkedFolders={isReconnectingHandle}
            achievementsEngine={achievementsEngine}
          />
        </>
      )}

      {/* Load Custom ROM In-App Modal Dialog */}
      <LoadRomModal
        isOpen={showLoadRomModal}
        initialFile={loadRomInitialFile}
        focusedTarget={focusedTarget}
        isMobile={isMobile}
        savedLinkedHandles={linkedDirectoryHandles}
        onReconnectLinkedFolders={handleReconnectLinkedFolders}
        onRemoveLinkedFolder={handleRemoveLinkedFolder}
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
        onLoadFolderSession={async (files, { scrapeInBackground, folderName, onProgress }) => {
          // In-Memory Session: Load ROMs into memory without disk copying
          const loadedGames = await loadBatchCustomRoms(files, onProgress);
          if (scrapeInBackground && loadedGames.length > 0 && scraper?.scrapeAll) {
            // Asynchronous background scraping without blocking the user
            scraper.scrapeAll(loadedGames, false, { 
              targetScope: 'folder_session', 
              scopeName: folderName || 'Session Folder' 
            });
          }
          sfx.playNavSelect();
        }}
        onIngestFolderToLibrary={async (files, { scrapeInBackground, folderName, onProgress }) => {
          // Permanent Ingest: Save ROMs to storage, optionally scrape in background
          const uploadedGames = await batchUploadRoms(files, onProgress);
          if (scrapeInBackground && uploadedGames.length > 0 && scraper?.scrapeAll) {
            // Asynchronous background scraping without blocking the user
            scraper.scrapeAll(uploadedGames, false, { 
              targetScope: 'folder_ingest', 
              scopeName: folderName || 'Imported Folder' 
            });
          }
          sfx.playThemeSwitch();
        }}
        sfx={sfx}
      />

      {/* About Project Info Dialog */}
      <AboutInfoModal
        isOpen={showInfoModal}
        focusedTarget={focusedTarget}
        sfx={sfx}
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
          achievementsEngine?.triggerAvatarUpdated?.();
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
        achievementsEngine={achievementsEngine}
        onDataRestored={() => window.location.reload()}
      />

      {/* Pre-Launch Keyboard Controls Splash Modal (Rendered on App UI before mounting Emulator) */}
      {pendingGameForLaunch && (
        <KeyboardControlsModal
          game={pendingGameForLaunch}
          core={pendingGameForLaunch?.systemCore}
          systemKey={pendingGameForLaunch?.systemKey}
          sfx={sfx}
          onDismiss={() => {
            const gameToBoot = pendingGameForLaunch;
            handleLaunchGameImmediately(gameToBoot);
          }}
          onCancel={() => {
            setPendingGameForLaunch(null);
          }}
        />
      )}

      {/* Active Game Emulator Sandbox */}
      {activeGame && (
        <EmulatorModal
          game={activeGame}
          gamepadConnected={gamepadConnected}
          activeProfileId={activeProfileId}
          sfx={sfx}
          focusedTarget={focusedTarget}
          setFocusedTarget={setFocusedTarget}
          achievementsEngine={achievementsEngine}
          onClose={() => {
            const playedGame = activeGame;
            setActiveGame(null);
            // Reset DS view layout & density back to default dual-screen mode
            try {
              localStorage.setItem('retro_ds_wide_grid', 'false');
              localStorage.setItem('retro_ds_grid_density', '3');
              window.dispatchEvent(new Event('retro_ds_view_reset'));
            } catch (e) {}
            if (playedGame) {
              const gameIdx = filteredGames.findIndex(g => (g.id && g.id === playedGame.id) || g.title === playedGame.title);
              if (gameIdx >= 0) {
                setFocusedTarget(isMobile ? { zone: 'mobileChips', index: gameIdx } : { zone: 'grid', index: gameIdx });
              }
            }
          }}
          onSessionEnd={(gameId, elapsedSeconds, gameObj) => {
            recordGameSession(gameId, elapsedSeconds);
            const targetGame = gameObj || activeGame || (gameId ? { id: gameId, title: gameId } : null);
            achievementsEngine?.triggerGameExit?.(targetGame, elapsedSeconds);
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

      {/* In-App Achievement & Milestone Unlock Toast Notification HUD */}
      <AchievementToast
        toast={achievementsEngine.activeToast}
        onDismiss={achievementsEngine.dismissToast}
        onOpenCabinet={(trophyId) => {
          setTargetTrophyId(trophyId || null);
          setShowTrophyModal(true);
        }}
      />

      {/* Interactive Trophy Cabinet & Hall of Fame Modal */}
      <TrophyCabinetModal
        isOpen={showTrophyModal}
        onClose={() => {
          setShowTrophyModal(false);
          setTargetTrophyId(null);
          setFocusedTarget({ zone: 'topbar', id: 'trophy' });
          sfx?.playModalClose?.();
        }}
        initialAchievementId={targetTrophyId}
        activeProfile={activeProfile}
        achievementsEngine={achievementsEngine}
        sfx={sfx}
      />
    </div>
  );
}

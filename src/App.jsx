import React, { useState, useEffect, useRef, useCallback } from 'react';
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

import { useWebAudioSfx } from './hooks/useWebAudioSfx';
import { useGamepadStatus } from './hooks/useGamepadStatus';
import { useSaveDataManager } from './hooks/useSaveDataManager';
import { useRomManifest } from './hooks/useRomManifest';
import { useGamepadNavigation } from './hooks/useGamepadNavigation';
import { usePlaytimeAndFavorites } from './hooks/usePlaytimeAndFavorites';
import { useThemeEngine } from './hooks/useThemeEngine';
import { useMetadataScraper } from './hooks/useMetadataScraper';

/**
 * Root Application Orchestrator for Retro Player.
 * Coordinates modular UI components, custom hooks, spatial navigation, audio synthesis, themes, metadata scraper, and emulation.
 */
export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [selectedGameCard, setSelectedGameCard] = useState(null);
  const [focusedTarget, setFocusedTarget] = useState({ zone: 'grid', index: 0 });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLoadRomModal, setShowLoadRomModal] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [oskPos, setOskPos] = useState({ row: 1, col: 0 });
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const searchInputRef = useRef(null);

  // Hook 1: Web Audio UI Sound Effects Synthesizer
  const sfx = useWebAudioSfx();

  // Hook 2: Multi-Theme Engine
  const themeEngine = useThemeEngine();

  // Hook 3: Favorites, Recently Played, and Playtime Analytics
  const {
    favorites,
    recentlyPlayed,
    isFavorite,
    toggleFavorite,
    recordGameLaunch,
    recordGameSession,
    resetGameStats,
    getGameStats
  } = usePlaytimeAndFavorites();

  // Hook 4: Gamepad Connection Tracking
  const { gamepadConnected, setGamepadConnected } = useGamepadStatus();

  // Hook 5: Save Data & Battery SRAM Inspection
  const { hasSaveData, checkSaveData } = useSaveDataManager();

  // Selection Handler for opening Game Detail Drawer Modal
  const handleGameSelect = useCallback(async (game) => {
    setSelectedGameCard(game);
    sfx.playModalOpen();
    const saveExists = await checkSaveData(game);
    if (saveExists) {
      sfx.playSaveDetected();
    }
  }, [checkSaveData, sfx]);

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
  const scraper = useMetadataScraper(games);

  // Hook 8: Unified Spatial Navigation Engine (Keyboard + Gamepad + Audio)
  useGamepadNavigation({
    focusedTarget,
    setFocusedTarget,
    showInfoModal,
    setShowInfoModal,
    showLoadRomModal,
    setShowLoadRomModal,
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
    themeEngine
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
    if (focusedTarget.zone === 'grid') {
      const focusedTile = document.querySelector('.game-tile.gamepad-focused');
      if (focusedTile) {
        focusedTile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else if (focusedTarget.zone === 'ribbon') {
      const focusedTab = document.querySelector('.system-tab.gamepad-focused');
      if (focusedTab) {
        focusedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [focusedTarget]);

  const selectedGameMetadata = selectedGameCard
    ? (scraper.metadataMap[selectedGameCard.id] || scraper.metadataMap[`${selectedGameCard.systemKey}-${selectedGameCard.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')])
    : null;

  return (
    <div 
      className={`console-container ${isDraggingOver ? 'drag-over-active' : ''}`}
      data-theme={themeEngine.theme}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop ROM Overlay */}
      <DropzoneOverlay isDraggingOver={isDraggingOver} />

      {/* Top Console Status Bar */}
      <Topbar
        gamepadConnected={gamepadConnected}
        activeSystem={activeSystem}
        systems={systems}
        setActiveSystem={setActiveSystem}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        setShowLoadRomModal={setShowLoadRomModal}
        setShowVirtualKeyboard={setShowVirtualKeyboard}
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
        sfx={sfx}
      />

      {/* Bottom Controller HUD */}
      <ConsoleHud gamepadConnected={gamepadConnected} />

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
        isScraping={scraper.isScraping}
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

      {/* Active Game Emulator Sandbox */}
      {activeGame && (
        <EmulatorModal
          game={activeGame}
          gamepadConnected={gamepadConnected}
          onClose={() => setActiveGame(null)}
          onSessionEnd={(gameId, elapsedSeconds) => {
            recordGameSession(gameId, elapsedSeconds);
          }}
        />
      )}
    </div>
  );
}

import React from 'react';
import { FolderOpen, RefreshCw, Star, Clock, Search, Sparkles } from 'lucide-react';
import VanillaView from './theme-views/VanillaView';
import DsView from './theme-views/DsView';

/**
 * Viewport rendering the theme-specific layout architecture or tailored empty state prompts.
 * Routes dynamically to Vanilla, Adroit, Canvas, DS Touch, Modern, or PlayStation-X layouts.
 */
export default function CartridgeGrid({
  filteredGames = [],
  metadataMap = {},
  focusedTarget,
  setFocusedTarget,
  handleGameSelect,
  fetchGames,
  loading,
  isFavorite,
  activeSystem,
  searchQuery,
  setActiveSystem,
  setSearchQuery,
  sfx,
  themeEngine,
  getGameStats,
  onPlayGame,
  onToggleFavorite,
  onEditMetadata,
  onScrapeGame,
  hasSaveData,
  scraper
}) {
  const currentSystemName =
    activeSystem === 'all'
      ? 'All Games'
      : activeSystem === 'favorites'
      ? 'Favorites'
      : activeSystem === 'recent'
      ? 'Recently Played'
      : filteredGames[0]?.systemName || activeSystem.toUpperCase();

  const currentTheme = themeEngine?.theme || 'vanilla';

  const renderEmptyState = () => {
    if (searchQuery && searchQuery.trim().length > 0) {
      return (
        <div className="console-empty">
          <div className="empty-icon-circle">
            <Search size={36} color="#64748b" />
          </div>
          <h3>No Matching Titles Found</h3>
          <p>
            No games found matching "<strong>{searchQuery}</strong>". Try clearing your search query or looking in another system.
          </p>
          <button
            className="nes-btn is-primary"
            onClick={() => setSearchQuery('')}
            style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
          >
            Clear Search Filter
          </button>
        </div>
      );
    }

    if (activeSystem === 'favorites') {
      return (
        <div className="console-empty">
          <div className="empty-icon-circle">
            <Star size={36} color="#f59e0b" />
          </div>
          <h3>No Favorites Starred Yet</h3>
          <p>
            Press <strong>F</strong> on keyboard or <strong>Y-Button</strong> on your gamepad while browsing cartridges to pin your all-time favorites here.
          </p>
          <button
            className="nes-btn is-primary"
            onClick={() => setActiveSystem('all')}
            style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
          >
            Browse All Games
          </button>
        </div>
      );
    }

    if (activeSystem === 'recent') {
      return (
        <div className="console-empty">
          <div className="empty-icon-circle">
            <Clock size={36} color="#3b82f6" />
          </div>
          <h3>No Play History Recorded</h3>
          <p>
            Games you launch will automatically appear here with recorded playtime, sessions, and battery save states.
          </p>
          <button
            className="nes-btn is-primary"
            onClick={() => setActiveSystem('all')}
            style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
          >
            Browse All Games
          </button>
        </div>
      );
    }

    return (
      <div className="console-empty">
        <div className="empty-icon-circle">
          <FolderOpen size={36} color="#64748b" />
        </div>
        <h3>No ROMs Found</h3>
        <p>
          No ROM files found in this category. Drop <code>.gba</code>, <code>.nes</code>, <code>.gbc</code>, <code>.nds</code>, or <code>.zip</code> ROMs directly into this window to load them.
        </p>
        <button
          className="nes-btn is-primary"
          onClick={fetchGames}
          style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Rescan Channels
        </button>
      </div>
    );
  };

  const renderThemeLayout = () => {
    switch (currentTheme) {
      case 'ds':
        return (
          <DsView
            filteredGames={filteredGames}
            metadataMap={metadataMap}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            handleGameSelect={handleGameSelect}
            isFavorite={isFavorite}
            getGameStats={getGameStats}
            onPlayGame={onPlayGame}
            onToggleFavorite={onToggleFavorite}
            onEditMetadata={onEditMetadata}
            onScrapeGame={onScrapeGame}
            hasSaveData={hasSaveData}
            scraper={scraper}
            sfx={sfx}
          />
        );
      case 'vanilla':
      default:
        return (
          <VanillaView
            filteredGames={filteredGames}
            metadataMap={metadataMap}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            handleGameSelect={handleGameSelect}
            isFavorite={isFavorite}
            activeSystem={activeSystem}
            currentSystemName={currentSystemName}
          />
        );
    }
  };

  return (
    <main className="console-viewport">
      {filteredGames.length > 0 ? renderThemeLayout() : renderEmptyState()}
    </main>
  );
}

import React from 'react';
import { FolderOpen, RefreshCw, Star, Clock, Search } from 'lucide-react';
import DsView from './theme-views/DsView';

/**
 * Viewport rendering the theme-specific layout architecture or tailored empty state prompts.
 * Routes dynamically based on the active console theme.
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
  onResetStats,
  onPlayGame,
  onToggleFavorite,
  onEditMetadata,
  onScrapeGame,
  onExportSave,
  onImportSave,
  onDeleteSave,
  onDeleteGame,
  hasSaveData,
  scraper,
  gamepadConnected = false,
  setShowLoadRomModal
}) {
  const currentTheme = themeEngine?.theme || 'ds';

  const renderEmptyState = () => {
    if (searchQuery && searchQuery.trim().length > 0) {
      return (
        <div className="console-empty-card">
          <div className="empty-icon-capsule search-capsule-icon">
            <Search size={38} className="empty-pulsing-icon" />
          </div>
          <h3 className="empty-title">No Matching Titles Found</h3>
          <p className="empty-subtitle">
            No games found matching "<strong>{searchQuery}</strong>". Try clearing your search keyword or switching console categories.
          </p>
          <div className="empty-action-group">
            <button
              type="button"
              className={`empty-primary-btn ${focusedTarget?.zone === 'emptyGrid' && focusedTarget?.id === 'clearSearch' ? 'gamepad-focused' : ''}`}
              onClick={() => {
                setSearchQuery('');
                sfx?.playNavSelect?.();
              }}
            >
              <span>Clear Search Filter</span>
            </button>
          </div>
        </div>
      );
    }

    if (activeSystem === 'favorites') {
      return (
        <div className="console-empty-card">
          <div className="empty-icon-capsule favorite-capsule-icon">
            <Star size={38} fill="#f59e0b" color="#f59e0b" className="empty-pulsing-icon" />
          </div>
          <h3 className="empty-title">No Favorites Starred Yet</h3>
          <p className="empty-subtitle">
            Star your top titles while browsing the cartridge shelf to build your quick-access favorites showcase.
          </p>
          <div className="empty-action-group">
            <button
              type="button"
              className="empty-primary-btn"
              onClick={() => {
                setActiveSystem('all');
                sfx?.playTabSwitch?.();
              }}
            >
              <span>Browse All Games</span>
            </button>
          </div>
        </div>
      );
    }

    if (activeSystem === 'recent') {
      return (
        <div className="console-empty-card">
          <div className="empty-icon-capsule recent-capsule-icon">
            <Clock size={38} color="#3b82f6" className="empty-pulsing-icon" />
          </div>
          <h3 className="empty-title">No Play History Recorded</h3>
          <p className="empty-subtitle">
            Titles you launch will automatically track session times, hours played, and battery save states here.
          </p>
          <div className="empty-action-group">
            <button
              type="button"
              className="empty-primary-btn"
              onClick={() => {
                setActiveSystem('all');
                sfx?.playTabSwitch?.();
              }}
            >
              <span>Browse All Games</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="console-empty-card">
        <div className="empty-icon-capsule folder-capsule-icon">
          <FolderOpen size={38} color="#64748b" className="empty-pulsing-icon" />
        </div>
        <h3 className="empty-title">No ROMs Found</h3>
        <p className="empty-subtitle">
          No ROM files found in this category. Drag and drop <code>.gba</code>, <code>.nes</code>, <code>.gbc</code>, <code>.nds</code>, or <code>.zip</code> ROMs directly to play immediately.
        </p>
        <div className="empty-action-group">
          <button
            type="button"
            className={`empty-primary-btn ${focusedTarget?.zone === 'emptyGrid' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              setShowLoadRomModal?.(true);
              setFocusedTarget?.({ zone: 'loadRomModal', id: 'browse' });
              sfx?.playModalOpen?.();
            }}
          >
            <FolderOpen size={16} />
            <span>Load ROM</span>
          </button>
        </div>
      </div>
    );
  };

  const renderThemeLayout = () => {
    switch (currentTheme) {
      case 'ds':
      default:
        return (
          <DsView
            filteredGames={filteredGames}
            metadataMap={metadataMap}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
            handleGameSelect={handleGameSelect}
            isFavorite={isFavorite}
            getGameStats={getGameStats}
            onResetStats={onResetStats}
            onPlayGame={onPlayGame}
            onToggleFavorite={onToggleFavorite}
            onEditMetadata={onEditMetadata}
            onScrapeGame={onScrapeGame}
            onExportSave={onExportSave}
            onImportSave={onImportSave}
            onDeleteSave={onDeleteSave}
            onDeleteGame={onDeleteGame}
            hasSaveData={hasSaveData}
            scraper={scraper}
            sfx={sfx}
            gamepadConnected={gamepadConnected}
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

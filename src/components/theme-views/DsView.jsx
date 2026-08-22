import React, { useRef, useEffect, useState } from 'react';
import { Play, Star, Pencil, RefreshCw, Clock, Gamepad2, Save, Users, Calendar, Code, CheckCircle2, Sparkles } from 'lucide-react';
import { resolveAssetPath } from '../../utils/assetPath';

/**
 * DsView: Nintendo DS / DSi Dual-Screen Touchscreen Firmware Layout.
 * 
 * Features:
 * - Left Side: 3-column beveled square buttons matrix with red focus box
 * - Center: Dual Screen Frame (Top: Snapshot Display; Bottom: Rich Synopsis & Save Status)
 * - Right Side: Integrated Direct Action Stage (Big Play Now button, Favorite, Edit, Re-scrape, Stats & Specs)
 *   -> Completely eliminates duplicate box art and redundant popup modals!
 */
export default function DsView({
  filteredGames = [],
  metadataMap = {},
  focusedTarget,
  setFocusedTarget,
  handleGameSelect,
  isFavorite,
  getGameStats,
  onPlayGame,
  onToggleFavorite,
  onEditMetadata,
  onScrapeGame,
  hasSaveData,
  scraper,
  sfx
}) {
  const focusedIndex = focusedTarget.zone === 'grid' ? (focusedTarget.index || 0) : 0;
  const selectedGame = filteredGames[focusedIndex] || filteredGames[0];
  const selectedMeta = selectedGame ? (
    metadataMap[selectedGame.id] ||
    metadataMap[`${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')]
  ) : null;
  const selectedStats = selectedGame && getGameStats ? getGameStats(selectedGame.id || selectedGame.title) : null;
  const selectedFav = selectedGame && isFavorite ? isFavorite(selectedGame.id || selectedGame.title) : false;

  const rawCover = selectedMeta?.coverUrl || (selectedGame?.coverUrl && !selectedGame?.coverUrl.endsWith('.svg') ? selectedGame.coverUrl : null);
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const rawScreenshot = selectedMeta?.screenshotUrl;
  const screenshotSrc = rawScreenshot ? resolveAssetPath(rawScreenshot) : null;

  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const activeBtnRef = useRef(null);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedIndex]);

  const handleManualScrape = async () => {
    if (onScrapeGame && selectedGame) {
      setIsLocalScraping(true);
      sfx?.playThemeSwitch?.();
      await onScrapeGame(selectedGame, true);
      setIsLocalScraping(false);
    }
  };

  return (
    <div className="ds-theme-container">
      {/* Left Column: 3-Column Beveled Touchscreen Buttons Matrix */}
      <div className="ds-buttons-pane">
        <div className="ds-buttons-grid">
          {filteredGames.map((game, idx) => {
            const isFocused = focusedTarget.zone === 'grid' && focusedTarget.index === idx;
            const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
            const meta =
              metadataMap[game.id] ||
              metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
            const rawThumb = meta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
            const thumbSrc = rawThumb ? resolveAssetPath(rawThumb) : null;

            return (
              <button
                key={game.id || idx}
                ref={isFocused ? activeBtnRef : null}
                type="button"
                className={`ds-touch-btn ${isFocused ? 'ds-btn-focused' : ''} ${isFav ? 'is-fav' : ''}`}
                onClick={() => {
                  setFocusedTarget({ zone: 'grid', index: idx });
                  if (handleGameSelect) {
                    handleGameSelect(game);
                  }
                }}
                onDoubleClick={() => {
                  if (onPlayGame) {
                    onPlayGame(game);
                  }
                }}
                title={game.title}
              >
                {thumbSrc ? (
                  <img src={thumbSrc} alt={game.title} className="ds-btn-thumb" loading="lazy" />
                ) : (
                  <span className="ds-btn-text">{game.title}</span>
                )}
                {isFav && (
                  <span className="ds-fav-dot">★</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Column: Dual Screens (Top: Snapshot Preview; Bottom: Synopsis & Save Data) */}
      <div className="ds-center-pane">
        {/* Top Screen: Gameplay Snapshot */}
        <div className="ds-screen-frame top-screen">
          {screenshotSrc ? (
            <img src={screenshotSrc} alt="Gameplay Snapshot" className="ds-screen-img" />
          ) : coverSrc ? (
            <img src={coverSrc} alt="Game Cover" className="ds-screen-img cover-fit" />
          ) : (
            <div className="ds-screen-placeholder">
              <Gamepad2 size={42} color="#64748b" />
              <span>{selectedGame?.title || 'Nintendo DS'}</span>
            </div>
          )}
        </div>

        {/* Bottom Screen: Rich Description & Status Panel */}
        <div className="ds-screen-frame bottom-screen">
          <div className="ds-synopsis-content">
            <div className="ds-bottom-header-row">
              <h4 className="ds-synopsis-title">{selectedGame?.title}</h4>
            </div>

            <div className="ds-meta-pills-row">
              <span className="ds-pill-tag system-tag">
                {selectedGame?.systemName || selectedGame?.systemKey?.toUpperCase()}
              </span>
              {selectedMeta?.genre && (
                <span className="ds-pill-tag">{selectedMeta.genre}</span>
              )}
              {selectedMeta?.developer && (
                <span className="ds-pill-tag">{selectedMeta.developer}</span>
              )}
            </div>

            <p className="ds-synopsis-text">
              {selectedMeta?.description || 'Touch to launch emulation, inspect metadata, or manage battery save RAM directly.'}
            </p>

            {/* Save Data Status Notification inside the screen */}
            {hasSaveData ? (
              <div className="ds-save-status-badge has-save">
                <Save size={13} color="#10b981" />
                <span>Battery Save RAM Detected • Ready to Resume</span>
              </div>
            ) : (
              <div className="ds-save-status-badge">
                <CheckCircle2 size={13} color="#64748b" />
                <span>Ready to Launch</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Direct Integrated Action Stage & Specs */}
      <div className="ds-right-pane">
        {/* Primary Big Nintendo Launch Button */}
        <button
          type="button"
          className="ds-play-now-btn"
          onClick={() => {
            if (onPlayGame && selectedGame) {
              onPlayGame(selectedGame);
            }
          }}
          title="Play Game Immediately"
        >
          <Play size={20} fill="#ffffff" />
          <span>PLAY NOW</span>
        </button>

        {/* Action Toolbar: Favorite, Edit, Scrape */}
        <div className="ds-action-toolbar">
          <button
            type="button"
            className={`ds-tool-btn ${selectedFav ? 'is-favorited' : ''}`}
            onClick={() => {
              if (onToggleFavorite && selectedGame) {
                onToggleFavorite(selectedGame);
                sfx?.playTileNav?.();
              }
            }}
            title={selectedFav ? 'Remove Favorite' : 'Add to Favorites'}
          >
            <Star size={16} fill={selectedFav ? '#f59e0b' : 'none'} color={selectedFav ? '#d97706' : 'currentColor'} />
            <span>{selectedFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            type="button"
            className="ds-tool-btn"
            onClick={() => {
              if (onEditMetadata && selectedGame) {
                onEditMetadata(selectedGame, selectedMeta);
                sfx?.playModalOpen?.();
              }
            }}
            title="Edit Game Metadata"
          >
            <Pencil size={15} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className={`ds-tool-btn ${isLocalScraping ? 'is-scraping' : ''}`}
            onClick={handleManualScrape}
            disabled={isLocalScraping}
            title="Fetch Live Box Art & Metadata"
          >
            <RefreshCw size={15} className={isLocalScraping ? 'spin' : ''} />
            <span>Scrape</span>
          </button>
        </div>

        {/* Playtime Stats Card */}
        <div className="ds-stats-card">
          <div className="ds-stats-row">
            <div className="ds-stat-item">
              <span className="ds-stat-label"><Clock size={12} /> Playtime</span>
              <span className="ds-stat-val">{selectedStats?.playtimeFormatted || '< 1 min'}</span>
            </div>
            <div className="ds-stat-item">
              <span className="ds-stat-label"><Gamepad2 size={12} /> Sessions</span>
              <span className="ds-stat-val">{selectedStats?.launchCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Specs Details Card */}
        <div className="ds-specs-group">
          <div className="ds-spec-card">
            <Code size={13} color="#64748b" />
            <span>{selectedMeta?.developer || selectedGame?.developer || 'Studio'}</span>
          </div>

          <div className="ds-spec-row-2">
            <div className="ds-spec-card">
              <Calendar size={13} color="#64748b" />
              <span>{selectedMeta?.releaseDate || selectedGame?.releaseYear || 'Classic'}</span>
            </div>
            <div className="ds-spec-card">
              <Users size={13} color="#64748b" />
              <span>{selectedMeta?.players || '1-2P'}</span>
            </div>
          </div>

          <div className="ds-system-badge-card">
            {selectedGame?.systemName || selectedGame?.systemKey?.toUpperCase() || 'NINTENDO DS'}
          </div>
        </div>
      </div>
    </div>
  );
}

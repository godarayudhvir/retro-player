import React, { useState } from 'react';
import { X, Play, Save, Cpu, Calendar, CheckCircle2, Star, Clock, History, RotateCcw, RefreshCw, Tag, ShieldCheck } from 'lucide-react';
import { getGameDescription, getReleaseDate } from '../gameDescriptions';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Game Detail Drawer Modal presenting rich scraped metadata, release dates, developer, publisher, genre tags,
 * live save data status, playtime stats, and on-demand online scraping actions.
 */
export default function GameDetailModal({
  game,
  metadata,
  hasSaveData,
  isFavorite = false,
  onToggleFavorite,
  onResetStats,
  onScrapeGame,
  isScraping = false,
  gameStats = { playtimeFormatted: '< 1 min', launchCount: 0, lastPlayedFormatted: 'Never' },
  gamepadConnected = false,
  focusedTarget,
  onClose,
  onPlay,
  sfx
}) {
  if (!game) return null;

  const [imgError, setImgError] = useState(false);
  const [isLocalScraping, setIsLocalScraping] = useState(false);

  const meta = metadata || {};
  const coverSrc = meta.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
  const description = meta.description || getGameDescription(game);
  const releaseYear = meta.releaseYear || meta.releaseDate?.split('-')[0] || (getReleaseDate(game) !== '2000-01-01' ? getReleaseDate(game).split('-')[0] : 'Classic');
  const developer = meta.developer || game.systemName || 'Classic';
  const publisher = meta.publisher || game.systemName || 'Classic';
  const genre = meta.genre || 'Retro Classic';

  const handleManualScrape = async () => {
    if (onScrapeGame) {
      setIsLocalScraping(true);
      sfx?.playThemeSwitch?.();
      await onScrapeGame(game, true);
      setIsLocalScraping(false);
      setImgError(false);
    }
  };

  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className="game-card-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className={`game-card-close ${focusedTarget.zone === 'cardModal' && focusedTarget.id === 'close' ? 'gamepad-focused' : ''}`}
          onClick={onClose}
          title="Close (ESC / B)"
        >
          <X size={20} />
        </button>

        <div className="game-card-grid">
          <div className="game-card-cover-wrapper">
            {coverSrc && !imgError ? (
              <img
                src={coverSrc}
                alt={game.title}
                className="game-card-cover-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="tile-fallback" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '1.5rem', textAlign: 'center', background: 'var(--panel-bg, #f8fafc)' }}>
                <span className="fallback-console-pill" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>{game.systemName}</span>
                <span className="fallback-game-title" style={{ fontSize: '1rem', color: 'var(--text-main, #1e293b)' }}>{game.title}</span>
              </div>
            )}

            {isFavorite && (
              <div className="drawer-favorite-badge" title="Favorited Game">
                <Star size={16} fill="#fbbf24" color="#d97706" />
                <span>FAVORITE</span>
              </div>
            )}
          </div>

          <div className="game-card-details">
            <div className="game-card-header-badge">
              <span className="game-card-sys-tag" style={{ '--sys-color': game.systemColor || '#ef4444' }}>
                {game.systemIcon && (
                  <img src={resolveAssetPath(game.systemIcon)} alt="" className="tile-sys-badge-icon" />
                )}
                <span>{game.systemName}</span>
              </span>
              <span className="game-card-core-tag">
                <Calendar size={14} /> {releaseYear}
              </span>
              <span className="game-card-core-tag">
                <Cpu size={14} /> {game.systemCore?.toUpperCase() || 'EMULATORJS'}
              </span>
              {meta.source && (
                <span className="game-card-core-tag scraper-verified-tag" title={`Enriched via ${meta.source}`}>
                  <ShieldCheck size={14} color="#10b981" /> {meta.source}
                </span>
              )}
            </div>

            <h2 className="game-card-title">{game.title}</h2>

            {/* Extra Metadata Row */}
            <div className="game-card-meta-row">
              <span className="meta-pill">
                <Tag size={12} /> {genre}
              </span>
              {developer && (
                <span className="meta-pill">
                  <strong>Dev:</strong> {developer}
                </span>
              )}
              {publisher && publisher !== developer && (
                <span className="meta-pill">
                  <strong>Pub:</strong> {publisher}
                </span>
              )}
            </div>

            <p className="game-card-description">{description}</p>

            {/* Playtime & Session Analytics Card */}
            <div className="game-card-stats-grid">
              <div className="stat-card">
                <Clock size={15} color="#3b82f6" />
                <div className="stat-info">
                  <div className="stat-label-row">
                    <span className="stat-label">PLAYTIME</span>
                    {onResetStats && (gameStats.totalSeconds > 0 || gameStats.launchCount > 0) && (
                      <button
                        className="stat-reset-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetStats(game.id || game.title);
                        }}
                        title="Reset Playtime Stats"
                      >
                        <RotateCcw size={10} /> Reset
                      </button>
                    )}
                  </div>
                  <span className="stat-value">{gameStats.playtimeFormatted}</span>
                </div>
              </div>
              <div className="stat-card">
                <History size={15} color="#10b981" />
                <div className="stat-info">
                  <span className="stat-label">SESSIONS</span>
                  <span className="stat-value">{gameStats.launchCount}</span>
                </div>
              </div>
              <div className="stat-card">
                <Calendar size={15} color="#f59e0b" />
                <div className="stat-info">
                  <span className="stat-label">LAST PLAYED</span>
                  <span className="stat-value">{gameStats.lastPlayedFormatted}</span>
                </div>
              </div>
            </div>

            {/* Save State Detector Badge */}
            <div className="save-status-container">
              {hasSaveData ? (
                <div className="save-badge has-save">
                  <Save size={16} />
                  <div className="save-text">
                    <strong>SAVE DATA DETECTED</strong>
                    <span>Saved battery RAM / state ready to resume</span>
                  </div>
                  <CheckCircle2 size={18} color="#10b981" />
                </div>
              ) : (
                <div className="save-badge no-save">
                  <Save size={16} />
                  <div className="save-text">
                    <strong>NO SAVE DATA FOUND</strong>
                    <span>Start fresh session (Auto-saves on play)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="game-card-actions">
              <button
                className={`play-now-btn ${focusedTarget.zone === 'cardModal' && focusedTarget.id === 'play' ? 'gamepad-focused' : ''}`}
                onClick={onPlay}
              >
                <Play size={20} fill="#ffffff" />
                <span>{hasSaveData ? 'CONTINUE / PLAY NOW' : 'PLAY NOW'}</span>
              </button>

              <button
                className={`favorite-toggle-btn icon-only ${isFavorite ? 'active' : ''} ${focusedTarget.zone === 'cardModal' && focusedTarget.id === 'fav' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  if (onToggleFavorite) {
                    const nextState = onToggleFavorite(game);
                    sfx?.playFavoriteToggle?.(nextState);
                  }
                }}
                title={isFavorite ? "Remove from Favorites (X on Gamepad / F on Keyboard)" : "Add to Favorites (X on Gamepad / F on Keyboard)"}
                aria-label={isFavorite ? "Favorited" : "Add Favorite"}
              >
                <Star size={20} fill={isFavorite ? '#fbbf24' : 'none'} color={isFavorite ? '#f59e0b' : 'currentColor'} />
              </button>

              {/* Scrape Online Metadata Button */}
              <button
                className="scraper-refresh-btn icon-only"
                onClick={handleManualScrape}
                disabled={isLocalScraping || isScraping}
                title="Re-scrape 3D Box Art & Online Overview"
                aria-label="Re-scrape Art & Metadata"
              >
                <RefreshCw size={18} className={isLocalScraping ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

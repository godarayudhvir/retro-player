import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Save, Cpu, Calendar, CheckCircle2, Star, Clock, History, RotateCcw, RefreshCw, Tag, Terminal, ChevronDown, ChevronUp, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGameDescription, getReleaseDate } from '../gameDescriptions';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Game Detail Drawer Modal presenting rich scraped metadata, release dates, developer, publisher, genre tags,
 * live save data status, playtime stats, carousel left/right ROM navigation, and on-demand online scraping actions.
 */
export default function GameDetailModal({
  game,
  metadata,
  hasSaveData,
  isFavorite = false,
  onToggleFavorite,
  onResetStats,
  onScrapeGame,
  onEditMetadata,
  onPrevGame,
  onNextGame,
  hasPrev = false,
  hasNext = false,
  currentIndex = -1,
  totalGames = 0,
  isScraping = false,
  scraper,
  gameStats = { playtimeFormatted: '< 1 min', launchCount: 0, lastPlayedFormatted: 'Never' },
  gamepadConnected = false,
  focusedTarget,
  onClose,
  onPlay,
  sfx
}) {
  const [imgError, setImgError] = useState(false);
  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const logsContainerRef = useRef(null);

  // Reset img error and local state when game changes
  useEffect(() => {
    setImgError(false);
    setIsLocalScraping(false);
  }, [game?.id, game?.title, game?.coverUrl]);

  // Keyboard Arrow Left/Right / Q/E/A/D navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') {
        if (hasPrev && onPrevGame) {
          e.preventDefault();
          onPrevGame();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'e' || e.key === 'E' || e.key === 'd' || e.key === 'D') {
        if (hasNext && onNextGame) {
          e.preventDefault();
          onNextGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, onPrevGame, onNextGame]);

  // Automatically scroll to logs when opened or when re-scraping
  useEffect(() => {
    if (showLogs && logsContainerRef.current) {
      logsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showLogs]);

  if (!game) return null;

  const meta = metadata || {};
  const rawCover = meta.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const description = meta.description || game.sidecarMetadata?.description || getGameDescription(game);
  const releaseYear = meta.releaseYear || game.sidecarMetadata?.releaseYear || meta.releaseDate?.split('-')[0] || (getReleaseDate(game) !== '2000-01-01' ? getReleaseDate(game).split('-')[0] : 'Classic');
  const developer = meta.developer || game.sidecarMetadata?.developer || game.systemName || 'Classic';
  const publisher = meta.publisher || game.sidecarMetadata?.publisher || game.systemName || 'Classic';
  const genre = meta.genre || game.sidecarMetadata?.genre || 'Retro Classic';

  const handleManualScrape = async () => {
    if (onScrapeGame) {
      setShowLogs(true);
      setIsLocalScraping(true);
      sfx?.playThemeSwitch?.();
      await onScrapeGame(game, true);
      setIsLocalScraping(false);
      setImgError(false);
    }
  };

  return (
    <div className="info-modal-backdrop game-card-backdrop" onClick={onClose}>
      <div className="game-card-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Left Floating ROM Nav Arrow */}
        {hasPrev && (
          <button
            className={`game-card-nav-arrow nav-arrow-left ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'prevGame' ? 'gamepad-focused' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              sfx?.playTileNav?.();
              onPrevGame?.();
            }}
            title="Previous ROM"
            aria-label="Previous ROM"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div className="game-card-modal-content">
          <button
            className={`game-card-close ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            title="Close"
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
                className={`play-now-btn ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'play' ? 'gamepad-focused' : ''}`}
                onClick={onPlay}
              >
                <Play size={20} fill="#ffffff" />
                <span>{hasSaveData ? 'CONTINUE / PLAY NOW' : 'PLAY NOW'}</span>
              </button>

              <button
                className={`favorite-toggle-btn icon-only ${isFavorite ? 'active' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'fav' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  if (onToggleFavorite) {
                    const nextState = onToggleFavorite(game);
                    sfx?.playFavoriteToggle?.(nextState);
                  }
                }}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                aria-label={isFavorite ? "Favorited" : "Add Favorite"}
              >
                <Star size={20} fill={isFavorite ? '#fbbf24' : 'none'} color={isFavorite ? '#f59e0b' : 'currentColor'} />
              </button>

              {/* Edit Metadata Button (Jellyfin Style) */}
              <button
                className={`edit-metadata-btn icon-only ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'editMeta' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  sfx?.playThemeSwitch?.();
                  if (onEditMetadata) onEditMetadata(game, meta);
                }}
                title="Edit Game Metadata & Cover Art (Jellyfin Style)"
                aria-label="Edit Metadata"
              >
                <Pencil size={18} />
              </button>

              {/* Scrape Online Metadata Button */}
              <button
                className={`scraper-refresh-btn icon-only ${showLogs ? 'active-logs' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'scrape' ? 'gamepad-focused' : ''}`}
                onClick={handleManualScrape}
                disabled={isLocalScraping || isScraping}
                title="Re-scrape 3D Box Art & Online Overview"
                aria-label="Re-scrape Art & Metadata"
              >
                <RefreshCw size={18} className={isLocalScraping ? 'spin' : ''} />
              </button>
            </div>

            {/* Expandable Scraper Activity Logs Section */}
            {(showLogs || isLocalScraping) && (
              <div ref={logsContainerRef} className="game-detail-logs-section animate-fade-in">
                <div className="game-detail-logs-header">
                  <div className="logs-header-left">
                    <Terminal size={14} color="#3b82f6" />
                    <span>Scraper Activity Logs</span>
                    {isLocalScraping && <span className="logs-live-badge">SCANNING...</span>}
                  </div>
                  <button 
                    className="logs-toggle-btn"
                    onClick={() => setShowLogs(!showLogs)}
                    title="Toggle Log View"
                  >
                    <span>{showLogs ? 'Hide Logs' : 'Show Logs'}</span>
                    {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {showLogs && (
                  <div className="scraper-terminal-view detail-modal-terminal">
                    {(() => {
                      const gameLogs = (scraper?.logs || []).filter(l => 
                        l.title === game.title || 
                        l.gameId === game.id || 
                        (l.message && l.message.includes(`"${game.title}"`))
                      );

                      if (gameLogs.length === 0) {
                        return (
                          <div className="scraper-log-empty">
                            <span>{isLocalScraping ? `Scraping assets for "${game.title}"...` : `No logs recorded yet for "${game.title}". Click the refresh button to re-scrape.`}</span>
                          </div>
                        );
                      }

                      return (
                        <div className="scraper-logs-list">
                          {gameLogs.map((log) => (
                            <div key={log.id} className={`scraper-log-row log-${log.type}`}>
                              <span className="log-time">[{log.time}]</span>
                              <span className="log-msg">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Floating ROM Nav Arrow */}
      {hasNext && (
        <button
          className={`game-card-nav-arrow nav-arrow-right ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'nextGame' ? 'gamepad-focused' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            sfx?.playTileNav?.();
            onNextGame?.();
          }}
          title="Next ROM"
          aria-label="Next ROM"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  </div>
);
}

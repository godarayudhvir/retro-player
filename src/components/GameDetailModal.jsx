import React from 'react';
import { X, Play, Save, Cpu, Calendar, CheckCircle2, Star, Clock, History, RotateCcw } from 'lucide-react';
import { getGameDescription, getReleaseDate } from '../gameDescriptions';

/**
 * Game Detail Drawer Modal presenting rich metadata, release dates, core tags, live save data status, playtime stats, and launch actions.
 */
export default function GameDetailModal({
  game,
  hasSaveData,
  isFavorite = false,
  onToggleFavorite,
  onResetStats,
  gameStats = { playtimeFormatted: '< 1 min', launchCount: 0, lastPlayedFormatted: 'Never' },
  gamepadConnected = false,
  focusedTarget,
  onClose,
  onPlay,
  sfx
}) {
  if (!game) return null;

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
            <img
              src={game.coverUrl}
              alt={game.title}
              className="game-card-cover-img"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="tile-fallback" style={{ display: 'none', width: '100%', height: '100%' }}>
              <img src={game.systemIcon || "/assets/pokeball.png"} alt="" style={{ width: '60px', height: '60px' }} />
            </div>
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
                  <img src={game.systemIcon} alt="" className="tile-sys-badge-icon" />
                )}
                <span>{game.systemName}</span>
              </span>
              <span className="game-card-core-tag">
                <Calendar size={14} /> {getReleaseDate(game)}
              </span>
              <span className="game-card-core-tag">
                <Cpu size={14} /> {game.systemCore?.toUpperCase() || 'EMULATORJS'}
              </span>
            </div>

            <h2 className="game-card-title">{game.title}</h2>
            <p className="game-card-description">{getGameDescription(game)}</p>

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
                className={`favorite-toggle-btn ${isFavorite ? 'active' : ''} ${focusedTarget.zone === 'cardModal' && focusedTarget.id === 'fav' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  if (onToggleFavorite) {
                    const nextState = onToggleFavorite(game);
                    sfx?.playFavoriteToggle?.(nextState);
                  }
                }}
                title="Toggle Favorite (X on Gamepad / F on Keyboard)"
              >
                <Star size={18} fill={isFavorite ? '#fbbf24' : 'none'} color={isFavorite ? '#f59e0b' : 'currentColor'} />
                <span>{isFavorite ? 'FAVORITED' : 'ADD FAVORITE'}</span>
                <kbd className="lr-badge" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                  {gamepadConnected ? 'X' : 'F'}
                </kbd>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

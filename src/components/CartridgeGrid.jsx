import React from 'react';
import { FolderOpen, RefreshCw, Star, Clock, Search, Sparkles } from 'lucide-react';
import CartridgeTile from './CartridgeTile';

/**
 * Viewport rendering the 3D cartridge tiles grid or tailored, professional empty state prompts.
 * Designed with a full-bleed ambient canvas layout inspired by Apple Arcade and modern console showcases.
 */
export default function CartridgeGrid({
  filteredGames,
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
  sfx
}) {
  const currentSystemName =
    activeSystem === 'all'
      ? 'All Games'
      : activeSystem === 'favorites'
      ? 'Favorites'
      : activeSystem === 'recent'
      ? 'Recently Played'
      : filteredGames[0]?.systemName || activeSystem.toUpperCase();

  const handleRandomPick = () => {
    if (!filteredGames || filteredGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredGames.length);
    setFocusedTarget({ zone: 'grid', index: randomIndex });
    sfx?.playTileNav?.();
    handleGameSelect(filteredGames[randomIndex]);
  };

  const renderEmptyState = () => {
    if (searchQuery && searchQuery.trim().length > 0) {
      return (
        <div className="console-empty">
          <div className="empty-icon-circle">
            <Search size={36} color="#64748b" />
          </div>
          <h3>No Matching Titles Found</h3>
          <p>
            No games match &ldquo;<strong style={{ color: 'var(--text-main)' }}>{searchQuery}</strong>&rdquo;.
            <br />
            Try checking for spelling or search by platform name.
          </p>
          <button
            className={`system-tab active ${focusedTarget.zone === 'grid' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              setSearchQuery?.('');
              sfx?.playTileNav?.();
            }}
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
          <div className="empty-icon-circle favorite-circle">
            <Star size={38} fill="#f59e0b" color="#f59e0b" />
          </div>
          <h3>Your Favorites Collection is Empty</h3>
          <p>
            Mark games with a star to quickly access your favorite adventures here.
            <br />
            Select any title in the library and press <kbd className="lr-badge" style={{ verticalAlign: 'middle', margin: '0 4px' }}>⭐ Favorite</kbd> (or press <strong>F</strong> / <strong>X</strong> on controller).
          </p>
          <button
            className={`system-tab active ${focusedTarget.zone === 'grid' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              setActiveSystem?.('all');
              setFocusedTarget?.({ zone: 'ribbon', index: 0 });
              sfx?.playTabSwitch?.();
            }}
            style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
          >
            <Sparkles size={16} /> Browse All Games
          </button>
        </div>
      );
    }

    if (activeSystem === 'recent') {
      return (
        <div className="console-empty">
          <div className="empty-icon-circle recent-circle">
            <Clock size={38} color="#10b981" />
          </div>
          <h3>No Recently Played Games</h3>
          <p>
            Jump into any game to have your playtime sessions and saves automatically tracked here.
            <br />
            Pick a title from the catalog and start playing!
          </p>
          <button
            className={`system-tab active ${focusedTarget.zone === 'grid' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              setActiveSystem?.('all');
              setFocusedTarget?.({ zone: 'ribbon', index: 0 });
              sfx?.playTabSwitch?.();
            }}
            style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
          >
            <Sparkles size={16} /> Discover Games to Play
          </button>
        </div>
      );
    }

    return (
      <div className="console-empty">
        <div className="empty-icon-circle">
          <FolderOpen size={38} color="#94a3b8" />
        </div>
        <h3>No Titles Registered</h3>
        <p>
          Drop your ROM files into <span className="code-block">public/roms/[system]</span> or use the Load ROM button.
          <br />
          The scraper will automatically fetch authentic 3D box art & metadata!
        </p>
        <button
          className={`system-tab active ${focusedTarget.zone === 'grid' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            fetchGames?.();
            sfx?.playTileNav?.();
          }}
          style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Rescan Channels
        </button>
      </div>
    );
  };

  return (
    <main className="console-viewport">
      {filteredGames.length > 0 ? (
        <div className="console-viewport-inner">
          {/* Ambient Channel Showcase Header */}
          <div className="channel-spotlight-bar">
            <div className="channel-meta-badge">
              <span className="channel-title-text">{currentSystemName}</span>
              <span className="channel-count-pill">
                {filteredGames.length} {filteredGames.length === 1 ? 'Title' : 'Titles'}
              </span>
            </div>

            {filteredGames.length > 1 && (
              <button
                className="channel-random-btn"
                title="Pick a random game from this collection"
                onClick={handleRandomPick}
              >
                <Sparkles size={14} className="sparkle-anim" />
                <span>Surprise Me</span>
              </button>
            )}
          </div>

          {/* Full-Bleed Ambient Tiles Grid */}
          <div className="tiles-grid">
            {filteredGames.map((game, index) => {
              const isFocused = focusedTarget.zone === 'grid' && focusedTarget.index === index;
              const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
              const meta =
                metadataMap[game.id] ||
                metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];

              return (
                <CartridgeTile
                  key={game.id}
                  game={game}
                  metadata={meta}
                  isFocused={isFocused}
                  isFavorite={isFav}
                  coverOnly={activeSystem === 'all'}
                  onClick={() => {
                    setFocusedTarget({ zone: 'grid', index });
                    handleGameSelect(game);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        renderEmptyState()
      )}
    </main>
  );
}

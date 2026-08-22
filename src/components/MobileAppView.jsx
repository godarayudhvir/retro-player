import React, { useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  FolderOpen, 
  Play, 
  Star, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  X, 
  Plus, 
  Calendar, 
  Cpu,
  Edit3,
  Trash2,
  Music,
  SkipForward
} from 'lucide-react';
import MiiAvatar from './MiiAvatar';
import { getReleaseDate, getGameDescription } from '../gameDescriptions';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Dedicated Netflix / Streaming-Style Mobile View for Retro Player.
 * Exclusively active on mobile devices with full gamepad, spatial navigation, and user management integration.
 */
export default function MobileAppView({
  games = [],
  systems = [],
  activeProfile,
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  onEditProfile,
  onDeleteProfile,
  favorites = [],
  recentlyPlayed = [],
  isFavorite,
  toggleFavorite,
  getGameStats,
  onPlayGame,
  metadataMap = {},
  onCustomRomLoad,
  sfx,
  focusedTarget = { zone: 'mobileChips', index: 0 },
  setFocusedTarget,
  selectedGameForDetails,
  setSelectedGameForDetails,
  hasChosenProfileThisSession,
  setHasChosenProfileThisSession,
  showProfileSwitcher,
  setShowProfileSwitcher,
  selectedSystem,
  setSelectedSystem,
  searchQuery = '',
  setSearchQuery,
  bgm
}) {
  const fileInputRef = useRef(null);

  // Auto scroll focused element into view
  useEffect(() => {
    const focusedEl = document.querySelector('.gamepad-focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedTarget]);

  // Group games by platform / system
  const systemGamesMap = useMemo(() => {
    const map = {};
    games.forEach(g => {
      if (!g.systemKey) return;
      if (!map[g.systemKey]) map[g.systemKey] = [];
      map[g.systemKey].push(g);
    });
    return map;
  }, [games]);

  // Filtered games for global search
  const searchedGames = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return games.filter(g => 
      g.title.toLowerCase().includes(q) || 
      (g.systemName && g.systemName.toLowerCase().includes(q))
    );
  }, [games, searchQuery]);

  // Favorite games list
  const favoriteGames = useMemo(() => {
    return games.filter(g => favorites.includes(g.id || g.title));
  }, [games, favorites]);

  // Recently played games list
  const recentGames = useMemo(() => {
    const recentIds = recentlyPlayed.map(r => r.id || r.title);
    return games
      .filter(g => recentIds.includes(g.id || g.title))
      .sort((a, b) => {
        const idxA = recentIds.indexOf(a.id || a.title);
        const idxB = recentIds.indexOf(b.id || b.title);
        return idxA - idxB;
      });
  }, [games, recentlyPlayed]);

  // Active system drilldown games
  const activeSystemGames = useMemo(() => {
    if (!selectedSystem) return [];
    return games.filter(g => g.systemKey === selectedSystem.key);
  }, [games, selectedSystem]);

  // Handle custom ROM file upload
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onCustomRomLoad) {
      onCustomRomLoad(file);
      sfx?.playGameLaunch?.();
    }
    e.target.value = '';
  };

  // 1. Initial Netflix-Style Profile Gate Screen (or Profile Switcher Modal)
  if (!hasChosenProfileThisSession || showProfileSwitcher) {
    return (
      <div className="mobile-profile-gate animate-fade-in">
        <div className="mobile-profile-gate-header">
          <div className="mobile-app-brand">
            <span className="mobile-brand-retro">RETRO</span>
            <span className="mobile-brand-player">PLAYER</span>
          </div>
          {showProfileSwitcher && (
            <button 
              className={`mobile-gate-close-btn ${focusedTarget?.zone === 'mobileProfileGate' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
              onClick={() => {
                setShowProfileSwitcher(false);
                setFocusedTarget?.({ zone: 'mobileTopbar', id: 'profile' });
              }}
              aria-label="Close Profile Switcher"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mobile-profile-gate-body">
          <h1 className="mobile-profile-gate-title">Who&apos;s Playing?</h1>
          <p className="mobile-profile-gate-desc">
            Choose your profile to access your game saves, favorite retro titles, and playtime records.
          </p>

          <div className="mobile-profile-grid">
            {profiles.map((p, idx) => {
              const isCurrent = p.id === activeProfileId;
              const isFocused = focusedTarget?.zone === 'mobileProfileGate' && focusedTarget?.index === idx;
              return (
                <div
                  key={p.id}
                  className={`mobile-profile-item ${isCurrent ? 'is-active' : ''} ${isFocused ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    onSelectProfile?.(p.id);
                    setHasChosenProfileThisSession(true);
                    setShowProfileSwitcher(false);
                    setFocusedTarget?.({ zone: 'mobileChips', index: 0 });
                    sfx?.playTileNav?.();
                  }}
                >
                  <div 
                    className="mobile-profile-avatar-wrap"
                    style={{ borderColor: p.favoriteColor || '#3b82f6' }}
                  >
                    <MiiAvatar miiData={p.miiData || {}} size={80} />
                  </div>
                  <span className="mobile-profile-name">{p.name}</span>

                  {/* Profile Management Actions */}
                  <div className="mobile-profile-card-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="mobile-prof-btn"
                      onClick={() => onEditProfile?.(p)}
                      title={`Edit ${p.name}'s Mii Avatar`}
                    >
                      <Edit3 size={13} />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        className="mobile-prof-btn is-delete"
                        onClick={() => onDeleteProfile?.(p.id)}
                        title={`Delete ${p.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Create Profile Card */}
            <div
              className={`mobile-profile-item mobile-add-profile ${focusedTarget?.zone === 'mobileProfileGate' && focusedTarget?.index === profiles.length ? 'gamepad-focused' : ''}`}
              onClick={() => {
                onCreateNewProfile?.();
                setHasChosenProfileThisSession(true);
                setShowProfileSwitcher(false);
                sfx?.playModalOpen?.();
              }}
            >
              <div className="mobile-profile-avatar-wrap add-circle">
                <Plus size={36} color="#64748b" />
              </div>
              <span className="mobile-profile-name">Add Player</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper renderer for game item card in mobile carousels or grids
  const renderGameCard = (game, isFocused = false) => {
    const meta = metadataMap[game.id] || metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
    const rawCover = meta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
    const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
    const isFav = isFavorite ? isFavorite(game.id || game.title) : false;

    return (
      <div 
        key={game.id} 
        className={`mobile-game-card ${isFocused ? 'gamepad-focused' : ''}`}
        onClick={() => {
          setSelectedGameForDetails(game);
          setFocusedTarget?.({ zone: 'mobileSheet', id: 'play' });
          sfx?.playModalOpen?.();
        }}
      >
        <div className="mobile-card-cover-wrap">
          {coverSrc ? (
            <img src={coverSrc} alt={game.title} className="mobile-card-cover-img" loading="lazy" />
          ) : (
            <div className="mobile-card-fallback-cover" style={{ background: game.systemColor || '#3b82f6' }}>
              <span className="mobile-card-fallback-pill">{game.systemName}</span>
              <span className="mobile-card-fallback-title">{game.title}</span>
            </div>
          )}
          {isFav && (
            <div className="mobile-card-fav-star">
              <Star size={12} fill="#fbbf24" color="#d97706" />
            </div>
          )}
        </div>
        <span className="mobile-card-title">{game.title}</span>
        <span className="mobile-card-sys">{game.systemName}</span>
      </div>
    );
  };

  // Selected game metadata details for modal
  const selectedMeta = selectedGameForDetails 
    ? (metadataMap[selectedGameForDetails.id] || metadataMap[`${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')]) 
    : null;

  // Active Feed Row builder for 2D spatial mapping
  const feedRows = [];
  if (recentGames.length > 0) {
    feedRows.push({ key: 'recent', title: 'Recently Played', games: recentGames, type: 'recent' });
  }
  if (favoriteGames.length > 0) {
    feedRows.push({ key: 'favs', title: 'Your Favorites', games: favoriteGames, type: 'favs' });
  }
  systems.forEach(sys => {
    const sysGames = systemGamesMap[sys.key] || [];
    if (sysGames.length > 0) {
      feedRows.push({ key: sys.key, title: sys.name, sys, games: sysGames.slice(0, 12), type: 'system' });
    }
  });

  return (
    <div className="mobile-app-root">
      {/* Hidden File Input for Custom ROM Loader */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileInputChange} 
        accept=".zip,.7z,.nes,.sfc,.smc,.snes,.z64,.n64,.v64,.gba,.gbc,.gb,.nds,.bin,.iso,.pbp,.chd,.cue,.md,.smd,.gen,.gg,.sms,.pce,.ngp,.ngc,.ws,.wsc,.a26,.a78,.jag,.vec,.lynx"
      />

      {/* Mobile Topbar: Profile Icon --- Search Widget --- Load Button */}
      <header className="mobile-topbar">
        {/* Profile Avatar (Left) */}
        <div 
          className={`mobile-topbar-profile ${focusedTarget?.zone === 'mobileTopbar' && focusedTarget?.id === 'profile' ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setShowProfileSwitcher(true);
            setFocusedTarget?.({ zone: 'mobileProfileGate', index: 0 });
            sfx?.playModalOpen?.();
          }}
          title="Switch Profile"
        >
          <MiiAvatar miiData={activeProfile?.miiData || {}} size={36} />
        </div>

        {/* Search Input Widget (Center) */}
        <div className={`mobile-search-widget ${focusedTarget?.zone === 'mobileTopbar' && focusedTarget?.id === 'search' ? 'gamepad-focused' : ''}`}>
          <Search size={16} className="mobile-search-icon" />
          <input 
            type="text"
            className="mobile-search-input"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setFocusedTarget?.({ zone: 'mobileTopbar', id: 'search' })}
          />
          {searchQuery && (
            <button 
              className="mobile-search-clear" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* BGM Toggle Button (Right) */}
        {bgm && (
          <button 
            className={`mobile-topbar-bgm-btn ${bgm.isPlaying ? 'is-playing' : ''} ${focusedTarget?.zone === 'mobileTopbar' && focusedTarget?.id === 'bgm' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              bgm.togglePlay();
              sfx?.playTileNav?.();
            }}
            title={bgm.currentTrack ? `BGM: ${bgm.currentTrack.title} (${bgm.isPlaying ? 'Playing' : 'Paused'})` : "Toggle BGM"}
            aria-label="Toggle Background Music"
          >
            <Music size={17} color={bgm.isPlaying ? '#10b981' : '#64748b'} className={bgm.isPlaying ? 'pulse-icon' : ''} />
          </button>
        )}

        {/* Load Custom ROM Button (Right) */}
        <button 
          className={`mobile-topbar-load-btn ${focusedTarget?.zone === 'mobileTopbar' && focusedTarget?.id === 'load' ? 'gamepad-focused' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          title="Load Custom ROM"
          aria-label="Load Custom ROM"
        >
          <FolderOpen size={18} />
          <span>Load</span>
        </button>
      </header>

      {/* Main Mobile Feed Body */}
      <main className="mobile-main-feed">
        {/* State A: Global Search Results Active */}
        {searchQuery.trim().length > 0 ? (
          <div className="mobile-section-container">
            <h2 className="mobile-section-title">
              Search Results ({searchedGames.length})
            </h2>
            {searchedGames.length > 0 ? (
              <div className="mobile-games-grid">
                {searchedGames.map((game, idx) => {
                  const isFocused = focusedTarget?.zone === 'mobileSearchGrid' && focusedTarget?.index === idx;
                  return renderGameCard(game, isFocused);
                })}
              </div>
            ) : (
              <div className="mobile-empty-state">
                <p>No games found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        ) : selectedSystem ? (
          /* State B: Drilled Down into a Specific System (Systems -> System A -> ROMs) */
          <div className="mobile-section-container animate-fade-in">
            <div className="mobile-drilldown-header">
              <button 
                className={`mobile-back-btn ${focusedTarget?.zone === 'mobileDrilldown' && focusedTarget?.id === 'back' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  setSelectedSystem(null);
                  setFocusedTarget?.({ zone: 'mobileChips', index: 0 });
                  sfx?.playTabSwitch?.();
                }}
              >
                <ArrowLeft size={18} />
                <span>All Systems</span>
              </button>
              <div className="mobile-drilldown-title">
                {selectedSystem.icon && (
                  <img src={resolveAssetPath(selectedSystem.icon)} alt="" className="mobile-system-badge-icon" />
                )}
                <h2>{selectedSystem.name} ({activeSystemGames.length})</h2>
              </div>
            </div>

            <div className="mobile-games-grid">
              {activeSystemGames.map((game, idx) => {
                const isFocused = focusedTarget?.zone === 'mobileDrilldown' && focusedTarget?.index === idx;
                return renderGameCard(game, isFocused);
              })}
            </div>
          </div>
        ) : (
          /* State C: Main Streaming-Style Home Feed (Recents, Favorites, Systems, Rows per System) */
          <>
            {/* 1. Systems Grid / Chip Selector */}
            <section className="mobile-feed-row">
              <div className="mobile-feed-row-header">
                <div className="mobile-row-title-wrap">
                  <Sparkles size={16} color="#3b82f6" />
                  <h3>Platforms &amp; Systems</h3>
                </div>
              </div>
              <div className="mobile-systems-chip-list">
                {systems.map((sys, idx) => {
                  const isFocused = focusedTarget?.zone === 'mobileChips' && focusedTarget?.index === idx;
                  return (
                    <button 
                      key={sys.key}
                      className={`mobile-system-chip ${isFocused ? 'gamepad-focused' : ''}`}
                      style={{ '--sys-accent': sys.color || '#3b82f6' }}
                      onClick={() => {
                        setSelectedSystem(sys);
                        setFocusedTarget?.({ zone: 'mobileDrilldown', index: 0 });
                        sfx?.playTabSwitch?.();
                      }}
                    >
                      {sys.icon && <img src={resolveAssetPath(sys.icon)} alt="" className="mobile-chip-icon" />}
                      <span className="mobile-chip-name">{sys.name}</span>
                      <span className="mobile-chip-count">{sys.gameCount || 0}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Dynamic Mobile Feed Rows (Recent, Favorites, Per-System Carousels) */}
            {feedRows.map((row, rIdx) => {
              return (
                <section key={row.key} className="mobile-feed-row">
                  <div 
                    className={`mobile-feed-row-header ${row.type === 'system' ? 'is-clickable' : ''}`}
                    onClick={() => {
                      if (row.type === 'system') {
                        setSelectedSystem(row.sys);
                        setFocusedTarget?.({ zone: 'mobileDrilldown', index: 0 });
                        sfx?.playTabSwitch?.();
                      }
                    }}
                  >
                    <div className="mobile-row-title-wrap">
                      {row.type === 'recent' && <Clock size={16} color="#10b981" />}
                      {row.type === 'favs' && <Star size={16} fill="#f59e0b" color="#f59e0b" />}
                      {row.type === 'system' && row.sys?.icon && (
                        <img src={resolveAssetPath(row.sys.icon)} alt="" className="mobile-feed-row-icon" />
                      )}
                      <h3>{row.title}</h3>
                      <span className="mobile-row-badge">{row.games.length}</span>
                    </div>
                    {row.type === 'system' && (
                      <div className="mobile-see-all-link">
                        <span>See All</span>
                        <ChevronRight size={15} />
                      </div>
                    )}
                  </div>

                  <div className="mobile-horizontal-carousel">
                    {row.games.map((game, cIdx) => {
                      const isFocused = focusedTarget?.zone === 'mobileFeed' && focusedTarget?.rowIndex === rIdx && focusedTarget?.colIndex === cIdx;
                      return renderGameCard(game, isFocused);
                    })}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>

      {/* Streamlined Game Detail Drawer / Bottom Sheet */}
      {selectedGameForDetails && (
        <div 
          className="mobile-sheet-backdrop animate-fade-in"
          onClick={() => {
            setSelectedGameForDetails(null);
            setFocusedTarget?.({ zone: 'mobileChips', index: 0 });
          }}
        >
          <div 
            className="mobile-sheet-content animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="mobile-sheet-handle-bar" />

            <button 
              className={`mobile-sheet-close ${focusedTarget?.zone === 'mobileSheet' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
              onClick={() => {
                setSelectedGameForDetails(null);
                setFocusedTarget?.({ zone: 'mobileChips', index: 0 });
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Game Info Overview */}
            <div className="mobile-sheet-body">
              <div className="mobile-sheet-top-row">
                <div className="mobile-sheet-cover-wrap">
                  {selectedMeta?.coverUrl || (selectedGameForDetails.coverUrl && !selectedGameForDetails.coverUrl.endsWith('.svg')) ? (
                    <img 
                      src={resolveAssetPath(selectedMeta?.coverUrl || selectedGameForDetails.coverUrl)} 
                      alt={selectedGameForDetails.title} 
                      className="mobile-sheet-cover-img"
                    />
                  ) : (
                    <div className="mobile-sheet-fallback-cover" style={{ background: selectedGameForDetails.systemColor || '#3b82f6' }}>
                      <span>{selectedGameForDetails.systemName}</span>
                    </div>
                  )}
                </div>

                <div className="mobile-sheet-meta-info">
                  <div className="mobile-sheet-sys-pill" style={{ background: selectedGameForDetails.systemColor || '#3b82f6' }}>
                    {selectedGameForDetails.systemName}
                  </div>
                  <h2 className="mobile-sheet-title">{selectedGameForDetails.title}</h2>
                  <div className="mobile-sheet-badges">
                    <span className="mobile-badge-item">
                      <Calendar size={12} />
                      {selectedMeta?.releaseYear || selectedGameForDetails.sidecarMetadata?.releaseYear || selectedMeta?.releaseDate?.split('-')[0] || (getReleaseDate(selectedGameForDetails) !== '2000-01-01' ? getReleaseDate(selectedGameForDetails).split('-')[0] : 'Classic')}
                    </span>
                    <span className="mobile-badge-item">
                      <Cpu size={12} />
                      {selectedGameForDetails.systemCore?.toUpperCase() || 'EMULATORJS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Prominently displayed right under the title */}
              <div className="mobile-sheet-actions">
                <button 
                  className={`mobile-action-play-btn ${focusedTarget?.zone === 'mobileSheet' && focusedTarget?.id === 'play' ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    const gameToLaunch = selectedGameForDetails;
                    setSelectedGameForDetails(null);
                    sfx?.playGameLaunch?.();
                    onPlayGame?.(gameToLaunch);
                  }}
                >
                  <Play size={18} fill="#ffffff" />
                  <span>Play Game</span>
                </button>

                <button 
                  className={`mobile-action-fav-btn ${isFavorite?.(selectedGameForDetails.id || selectedGameForDetails.title) ? 'is-favorited' : ''} ${focusedTarget?.zone === 'mobileSheet' && focusedTarget?.id === 'fav' ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    if (toggleFavorite) {
                      const nextState = toggleFavorite(selectedGameForDetails);
                      sfx?.playFavoriteToggle?.(nextState);
                    }
                  }}
                >
                  <Star 
                    size={18} 
                    fill={isFavorite?.(selectedGameForDetails.id || selectedGameForDetails.title) ? '#fbbf24' : 'none'} 
                    color={isFavorite?.(selectedGameForDetails.id || selectedGameForDetails.title) ? '#d97706' : '#64748b'} 
                  />
                  <span>{isFavorite?.(selectedGameForDetails.id || selectedGameForDetails.title) ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>

              {/* Game Synopsis */}
              <p className="mobile-sheet-description">
                {selectedMeta?.description || selectedGameForDetails.sidecarMetadata?.description || getGameDescription(selectedGameForDetails)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

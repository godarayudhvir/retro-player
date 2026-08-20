import React, { useState, useMemo, useRef } from 'react';
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
  Cpu 
} from 'lucide-react';
import MiiAvatar from './MiiAvatar';
import { getReleaseDate, getGameDescription } from '../gameDescriptions';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Dedicated Netflix / Streaming-Style Mobile View for Retro Player.
 * Exclusively active on mobile devices with zero side-effects on tablet, PC, or TV modes.
 */
export default function MobileAppView({
  games = [],
  systems = [],
  activeProfile,
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  favorites = [],
  recentlyPlayed = [],
  isFavorite,
  toggleFavorite,
  getGameStats,
  onPlayGame,
  metadataMap = {},
  onCustomRomLoad,
  sfx
}) {
  const [hasChosenProfileThisSession, setHasChosenProfileThisSession] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameForDetails, setSelectedGameForDetails] = useState(null);
  const fileInputRef = useRef(null);

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
              className="mobile-gate-close-btn" 
              onClick={() => setShowProfileSwitcher(false)}
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
            {profiles.map((p) => {
              const isCurrent = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  className={`mobile-profile-item ${isCurrent ? 'is-active' : ''}`}
                  onClick={() => {
                    onSelectProfile?.(p.id);
                    setHasChosenProfileThisSession(true);
                    setShowProfileSwitcher(false);
                    sfx?.playTileNav?.();
                  }}
                >
                  <div 
                    className="mobile-profile-avatar-wrap"
                    style={{ borderColor: p.favoriteColor || '#ef4444' }}
                  >
                    <MiiAvatar miiData={p.miiData || {}} size={80} />
                  </div>
                  <span className="mobile-profile-name">{p.name}</span>
                </div>
              );
            })}

            {/* Create Profile Card */}
            <div
              className="mobile-profile-item mobile-add-profile"
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
  const renderGameCard = (game) => {
    const meta = metadataMap[game.id] || metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
    const rawCover = meta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
    const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
    const isFav = isFavorite ? isFavorite(game.id || game.title) : false;

    return (
      <div 
        key={game.id} 
        className="mobile-game-card"
        onClick={() => {
          setSelectedGameForDetails(game);
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
          className="mobile-topbar-profile"
          onClick={() => {
            setShowProfileSwitcher(true);
            sfx?.playModalOpen?.();
          }}
          title="Switch Profile"
        >
          <MiiAvatar miiData={activeProfile?.miiData || {}} size={36} />
        </div>

        {/* Search Input Widget (Center) */}
        <div className="mobile-search-widget">
          <Search size={16} className="mobile-search-icon" />
          <input 
            type="text"
            className="mobile-search-input"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Load Custom ROM Button (Right) */}
        <button 
          className="mobile-topbar-load-btn"
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
                {searchedGames.map(renderGameCard)}
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
                className="mobile-back-btn" 
                onClick={() => {
                  setSelectedSystem(null);
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
              {activeSystemGames.map(renderGameCard)}
            </div>
          </div>
        ) : (
          /* State C: Main Streaming-Style Home Feed (Recents, Favorites, Systems, Rows per System) */
          <>
            {/* 1. Recently Played Horizontal Carousel */}
            {recentGames.length > 0 && (
              <section className="mobile-feed-row">
                <div className="mobile-feed-row-header">
                  <div className="mobile-row-title-wrap">
                    <Clock size={16} color="#10b981" />
                    <h3>Recently Played</h3>
                  </div>
                </div>
                <div className="mobile-horizontal-carousel">
                  {recentGames.map(renderGameCard)}
                </div>
              </section>
            )}

            {/* 2. Favorites Horizontal Carousel */}
            {favoriteGames.length > 0 && (
              <section className="mobile-feed-row">
                <div className="mobile-feed-row-header">
                  <div className="mobile-row-title-wrap">
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <h3>Your Favorites</h3>
                  </div>
                </div>
                <div className="mobile-horizontal-carousel">
                  {favoriteGames.map(renderGameCard)}
                </div>
              </section>
            )}

            {/* 3. Systems Grid / Chip Selector */}
            <section className="mobile-feed-row">
              <div className="mobile-feed-row-header">
                <div className="mobile-row-title-wrap">
                  <Sparkles size={16} color="#ef4444" />
                  <h3>Platforms &amp; Systems</h3>
                </div>
              </div>
              <div className="mobile-systems-chip-list">
                {systems.map(sys => (
                  <button 
                    key={sys.key}
                    className="mobile-system-chip"
                    style={{ '--sys-accent': sys.color || '#ef4444' }}
                    onClick={() => {
                      setSelectedSystem(sys);
                      sfx?.playTabSwitch?.();
                    }}
                  >
                    {sys.icon && <img src={resolveAssetPath(sys.icon)} alt="" className="mobile-chip-icon" />}
                    <span className="mobile-chip-name">{sys.name}</span>
                    <span className="mobile-chip-count">{sys.gameCount || 0}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 4. Individual System Game Horizontal Carousels */}
            {systems.map(sys => {
              const sysGames = systemGamesMap[sys.key] || [];
              if (sysGames.length === 0) return null;

              return (
                <section key={sys.key} className="mobile-feed-row">
                  <div 
                    className="mobile-feed-row-header is-clickable"
                    onClick={() => {
                      setSelectedSystem(sys);
                      sfx?.playTabSwitch?.();
                    }}
                  >
                    <div className="mobile-row-title-wrap">
                      {sys.icon && (
                        <img src={resolveAssetPath(sys.icon)} alt="" className="mobile-feed-row-icon" />
                      )}
                      <h3>{sys.name}</h3>
                      <span className="mobile-row-badge">{sysGames.length}</span>
                    </div>
                    <div className="mobile-see-all-link">
                      <span>See All</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>

                  <div className="mobile-horizontal-carousel">
                    {sysGames.slice(0, 12).map(renderGameCard)}
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
          onClick={() => setSelectedGameForDetails(null)}
        >
          <div 
            className="mobile-sheet-content animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="mobile-sheet-handle-bar" />

            <button 
              className="mobile-sheet-close"
              onClick={() => setSelectedGameForDetails(null)}
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
                  <div className="mobile-sheet-sys-pill" style={{ background: selectedGameForDetails.systemColor || '#ef4444' }}>
                    {selectedGameForDetails.systemName}
                  </div>
                  <h2 className="mobile-sheet-title">{selectedGameForDetails.title}</h2>
                  <div className="mobile-sheet-badges">
                    <span className="mobile-badge-item">
                      <Calendar size={12} />
                      {selectedMeta?.releaseYear || selectedMeta?.releaseDate?.split('-')[0] || (getReleaseDate(selectedGameForDetails) !== '2000-01-01' ? getReleaseDate(selectedGameForDetails).split('-')[0] : 'Classic')}
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
                  className="mobile-action-play-btn"
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
                  className={`mobile-action-fav-btn ${isFavorite?.(selectedGameForDetails.id || selectedGameForDetails.title) ? 'is-favorited' : ''}`}
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
                {selectedMeta?.description || getGameDescription(selectedGameForDetails)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

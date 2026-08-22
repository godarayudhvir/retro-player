import React, { useMemo, useRef, useState, useEffect } from 'react';
import { 
  Search, 
  FolderOpen, 
  Play, 
  Star, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  X, 
  Plus, 
  Calendar, 
  Cpu,
  Edit3, 
  Trash2, 
  Music, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Pencil, 
  Gamepad2, 
  ChevronRight,
  Layers,
  Volume2,
  VolumeX,
  Palette
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import CartridgeTile from './CartridgeTile';
import { getReleaseDate, getGameDescription } from '../gameDescriptions';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * MobileAppView: Stage-Based Mobile Experience for Retro Player.
 * 
 * 5 Seamless Stages:
 * - Stage 1: Choose Profile ("Who's Playing?" Multiavatar profile selector)
 * - Stage 2: Choose System (Beautiful Console Cards displaying authentic console SVGs, total titles, categories)
 * - Stage 3: Choose Game (Clean 2/3-column box art grid with quick search filter)
 * - Stage 4: Shows Game Detail (Full-screen detail view with cover, synopsis, stats, and save data status)
 * - Stage 5: Plays Game (Launches emulation in full-screen touch mode)
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
  focusedTarget = { zone: 'mobileSystems', index: 0 },
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
  bgm,
  themeEngine,
  onOpenThemeModal,
  onEditMetadata,
  onScrapeGame,
  hasSaveData,
  scraper
}) {
  const fileInputRef = useRef(null);
  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Filtered games for current view
  const currentGamesList = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return games.filter(g => 
        g.title.toLowerCase().includes(q) || 
        (g.systemName && g.systemName.toLowerCase().includes(q))
      );
    }

    if (!selectedSystem) return [];

    if (selectedSystem.key === 'favorites') {
      return favoriteGames;
    }
    if (selectedSystem.key === 'recent') {
      return recentGames;
    }
    if (selectedSystem.key === 'all') {
      return games;
    }

    return systemGamesMap[selectedSystem.key] || [];
  }, [selectedSystem, searchQuery, games, favoriteGames, recentGames, systemGamesMap]);

  // Selected game metadata details
  const selectedMeta = selectedGameForDetails 
    ? (metadataMap[selectedGameForDetails.id] || metadataMap[`${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')]) 
    : null;
  const selectedStats = selectedGameForDetails && getGameStats ? getGameStats(selectedGameForDetails.id || selectedGameForDetails.title) : null;
  const isSelectedFav = selectedGameForDetails && isFavorite ? isFavorite(selectedGameForDetails.id || selectedGameForDetails.title) : false;

  // Manual scrape handler
  const handleManualScrape = async () => {
    if (onScrapeGame && selectedGameForDetails) {
      setIsLocalScraping(true);
      sfx?.playThemeSwitch?.();
      await onScrapeGame(selectedGameForDetails, true);
      setIsLocalScraping(false);
    }
  };

  // Handle custom ROM file upload
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onCustomRomLoad) {
      onCustomRomLoad(file);
      sfx?.playGameLaunch?.();
    }
  };

  // Determine current active stage
  // Stage 1: Profile Selection
  // Stage 4: Game Detail
  // Stage 3: Game Selection (inside a system or search)
  // Stage 2: System Selection
  const isStageProfile = (!hasChosenProfileThisSession && profiles.length > 1) || showProfileSwitcher;
  const isStageDetail = !isStageProfile && !!selectedGameForDetails;
  const isStageGames = !isStageProfile && !isStageDetail && (!!selectedSystem || searchQuery.trim().length > 0);
  const isStageSystems = !isStageProfile && !isStageDetail && !isStageGames;

  // =========================================================================
  // STAGE 1: CHOOSE PROFILE ("Who's Playing?")
  // =========================================================================
  if (isStageProfile) {
    return (
      <div className="mobile-app-root stage-profile-root">
        <div className="mobile-profile-gate">
          <div className="mobile-profile-gate-header">
            <div className="mobile-app-brand">
              <span className="mobile-brand-retro">RETRO</span>
              <span className="mobile-brand-player">PLAYER</span>
            </div>
            {hasChosenProfileThisSession && (
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
            <div className="mobile-stage-badge">STAGE 1</div>
            <h1 className="mobile-profile-gate-title">Who&apos;s Playing?</h1>
            <p className="mobile-profile-gate-desc">
              Choose your profile to access your saves, favorite titles, and records.
            </p>

            <div className="mobile-profile-grid">
              {profiles.map((p, idx) => {
                const isActive = p.id === activeProfileId;
                return (
                  <div
                    key={p.id}
                    className={`mobile-profile-item ${isActive ? 'is-active-profile' : ''}`}
                    onClick={() => {
                      onSelectProfile?.(p.id);
                      setHasChosenProfileThisSession(true);
                      setShowProfileSwitcher(false);
                      sfx?.playProfileSelect?.();
                    }}
                  >
                    <div className="mobile-profile-avatar-wrap">
                      <MultiAvatar seed={p.avatarSeed || p.name || 'Player'} size={68} />
                    </div>
                    <span className="mobile-profile-name">{p.name}</span>

                    <div className="mobile-profile-actions-mini" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="mobile-prof-btn"
                        onClick={() => onEditProfile?.(p)}
                        title={`Edit ${p.name}'s Avatar`}
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

              {/* Add Profile Card */}
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
                  <Plus size={32} color="#64748b" />
                </div>
                <span className="mobile-profile-name">Add Player</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 4: SHOWS GAME DETAIL
  // =========================================================================
  if (isStageDetail) {
    const rawCover = selectedMeta?.coverUrl || (selectedGameForDetails.coverUrl && !selectedGameForDetails.coverUrl.endsWith('.svg') ? selectedGameForDetails.coverUrl : null);
    const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
    const rawScreenshot = selectedMeta?.screenshotUrl;
    const screenshotSrc = rawScreenshot ? resolveAssetPath(rawScreenshot) : null;
    const description = selectedMeta?.description || selectedGameForDetails.sidecarMetadata?.description || getGameDescription(selectedGameForDetails);
    const releaseYear = selectedMeta?.releaseYear || selectedMeta?.releaseDate?.split('-')[0] || (getReleaseDate(selectedGameForDetails) !== '2000-01-01' ? getReleaseDate(selectedGameForDetails).split('-')[0] : 'Classic');
    const developer = selectedMeta?.developer || selectedGameForDetails.systemName || 'Classic';
    const genre = selectedMeta?.genre || 'Retro Classic';

    return (
      <div className="mobile-app-root stage-detail-root">
        {/* Detail Top Navigation Bar */}
        <header className="mobile-detail-nav">
          <button 
            type="button"
            className="mobile-detail-back-btn"
            onClick={() => {
              setSelectedGameForDetails(null);
              sfx?.playTileNav?.();
            }}
          >
            <ArrowLeft size={18} />
            <span>{selectedSystem?.name || 'Back to Games'}</span>
          </button>
          <span className="mobile-stage-badge">STAGE 4</span>
        </header>

        {/* Game Detail Body */}
        <main className="mobile-detail-body">
          {/* Big Visual Cover / Screenshot Hero */}
          <div className="mobile-detail-hero">
            {screenshotSrc ? (
              <img src={screenshotSrc} alt="Gameplay Snapshot" className="mobile-detail-hero-img" />
            ) : coverSrc ? (
              <img src={coverSrc} alt={selectedGameForDetails.title} className="mobile-detail-hero-img cover-fit" />
            ) : (
              <div className="mobile-detail-hero-placeholder" style={{ background: selectedGameForDetails.systemColor || '#ef4444' }}>
                <Gamepad2 size={48} color="#ffffff" />
                <span>{selectedGameForDetails.systemName}</span>
              </div>
            )}
            <div className="mobile-detail-hero-gradient"></div>
            
            {/* System Badge on Hero */}
            <div className="mobile-detail-sys-badge" style={{ backgroundColor: selectedGameForDetails.systemColor || '#ef4444' }}>
              {selectedGameForDetails.systemName}
            </div>
          </div>

          {/* Title & Metadata Pills */}
          <div className="mobile-detail-header-block">
            <h1 className="mobile-detail-title">{selectedGameForDetails.title}</h1>
            <div className="mobile-detail-pills-row">
              <span className="mobile-meta-pill"><Calendar size={12} /> {releaseYear}</span>
              <span className="mobile-meta-pill"><Cpu size={12} /> {genre}</span>
              <span className="mobile-meta-pill">Dev: {developer}</span>
            </div>
          </div>

          {/* STAGE 5 LAUNCH: Big Primary Action Button */}
          <div className="mobile-detail-cta-block">
            <button
              type="button"
              className="mobile-detail-play-btn"
              onClick={() => {
                const gameToPlay = selectedGameForDetails;
                if (onPlayGame) {
                  onPlayGame(gameToPlay);
                }
              }}
            >
              <Play size={22} fill="#ffffff" />
              <span>PLAY GAME NOW</span>
            </button>

            {/* Action Bar: Favorite, Edit, Scrape */}
            <div className="mobile-detail-actions-row">
              <button
                type="button"
                className={`mobile-detail-tool-btn ${isSelectedFav ? 'is-fav' : ''}`}
                onClick={() => {
                  if (toggleFavorite) {
                    toggleFavorite(selectedGameForDetails);
                    sfx?.playFavoriteToggle?.(!isSelectedFav);
                  }
                }}
              >
                <Star size={16} fill={isSelectedFav ? '#fbbf24' : 'none'} color={isSelectedFav ? '#d97706' : 'currentColor'} />
                <span>{isSelectedFav ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                type="button"
                className="mobile-detail-tool-btn"
                onClick={() => {
                  if (onEditMetadata) {
                    onEditMetadata(selectedGameForDetails, selectedMeta);
                    sfx?.playModalOpen?.();
                  }
                }}
              >
                <Pencil size={15} />
                <span>Edit Info</span>
              </button>

              <button
                type="button"
                className={`mobile-detail-tool-btn ${isLocalScraping ? 'is-scraping' : ''}`}
                onClick={handleManualScrape}
                disabled={isLocalScraping}
              >
                <RefreshCw size={15} className={isLocalScraping ? 'spin' : ''} />
                <span>Scrape Art</span>
              </button>
            </div>
          </div>

          {/* Save State & Battery RAM Status */}
          <div className="mobile-detail-save-card">
            {hasSaveData ? (
              <div className="mobile-save-status has-save">
                <Save size={16} color="#10b981" />
                <div className="mobile-save-info">
                  <strong>BATTERY SAVE RAM DETECTED</strong>
                  <span>State ready to resume instantly</span>
                </div>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
            ) : (
              <div className="mobile-save-status no-save">
                <CheckCircle2 size={16} color="#64748b" />
                <div className="mobile-save-info">
                  <strong>READY TO LAUNCH</strong>
                  <span>Auto-saves battery RAM upon playing</span>
                </div>
              </div>
            )}
          </div>

          {/* Synopsis Description */}
          <div className="mobile-detail-synopsis-card">
            <h3>Synopsis &amp; Game Overview</h3>
            <p>{description}</p>
          </div>

          {/* Playtime Analytics */}
          <div className="mobile-detail-stats-card">
            <div className="mobile-stat-box">
              <span className="mobile-stat-lbl"><Clock size={12} /> Playtime</span>
              <span className="mobile-stat-val">{selectedStats?.playtimeFormatted || '< 1 min'}</span>
            </div>
            <div className="mobile-stat-box">
              <span className="mobile-stat-lbl"><Gamepad2 size={12} /> Sessions</span>
              <span className="mobile-stat-val">{selectedStats?.launchCount || 0} launches</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: CHOOSE GAME
  // =========================================================================
  if (isStageGames) {
    const systemTitle = searchQuery.trim().length > 0 
      ? `Search: "${searchQuery}"`
      : selectedSystem?.name || 'All Games';

    return (
      <div className="mobile-app-root stage-games-root">
        {/* Topbar Navigation */}
        <header className="mobile-games-nav">
          <button 
            type="button"
            className="mobile-games-back-btn"
            onClick={() => {
              if (searchQuery.trim().length > 0) {
                setSearchQuery('');
              } else {
                setSelectedSystem(null);
              }
              sfx?.playTileNav?.();
            }}
          >
            <ArrowLeft size={18} />
            <span>Consoles</span>
          </button>
          
          <div className="mobile-games-nav-center">
            {selectedSystem?.icon && (
              <img src={resolveAssetPath(selectedSystem.icon)} alt="" className="mobile-games-nav-sys-icon" />
            )}
            <span className="mobile-games-nav-title">{systemTitle}</span>
          </div>

          <span className="mobile-stage-badge">STAGE 3</span>
        </header>

        {/* Game Content Grid */}
        <main className="mobile-games-grid-body">
          {currentGamesList.length > 0 ? (
            themeEngine?.theme === 'ds' ? (
              /* DS Touch Theme: 3-Column Square Beveled Touch Button Matrix */
              <div className="mobile-ds-buttons-grid">
                {currentGamesList.map((game, idx) => {
                  const meta = metadataMap[game.id] || metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
                  const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
                  const rawThumb = meta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
                  const thumbSrc = rawThumb ? resolveAssetPath(rawThumb) : null;

                  return (
                    <button
                      key={game.id || idx}
                      type="button"
                      className={`ds-touch-btn ${isFav ? 'is-fav' : ''}`}
                      onClick={() => {
                        setSelectedGameForDetails(game);
                        sfx?.playTileNav?.();
                      }}
                      title={game.title}
                    >
                      {thumbSrc ? (
                        <img src={thumbSrc} alt={game.title} className="ds-btn-thumb" loading="lazy" />
                      ) : (
                        <span className="ds-btn-text">{game.title}</span>
                      )}
                      {isFav && <span className="ds-fav-dot">★</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Vanilla Theme: 2-Column Responsive Physical Cartridges Grid */
              <div className="mobile-cartridges-2col-grid">
                {currentGamesList.map((game, idx) => {
                  const meta = metadataMap[game.id] || metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
                  const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
                  const isCoverOnly = !selectedSystem || selectedSystem.key === 'all' || selectedSystem.key === 'favorites' || selectedSystem.key === 'recent';

                  return (
                    <div key={game.id || idx} className="mobile-cartridge-tile-cell">
                      <CartridgeTile
                        game={game}
                        metadata={meta}
                        isFocused={false}
                        isFavorite={isFav}
                        coverOnly={isCoverOnly}
                        onClick={() => {
                          setSelectedGameForDetails(game);
                          sfx?.playTileNav?.();
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="mobile-empty-catalog">
              <FolderOpen size={48} color="#64748b" />
              <h3>No Games Found</h3>
              <p>No ROM files found in this category.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: CHOOSE SYSTEM (Beautiful Vector System Cards)
  // =========================================================================
  return (
    <div className="mobile-app-root stage-systems-root">
      {/* Hidden File Input for Custom ROM Loader */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileInputChange} 
        accept=".zip,.7z,.nes,.sfc,.smc,.snes,.z64,.n64,.v64,.gba,.gbc,.gb,.nds,.bin,.iso,.pbp,.chd,.cue,.md,.smd,.gen,.gg,.sms,.pce,.ngp,.ngc,.ws,.wsc,.a26,.a78,.jag,.vec,.lynx"
      />

      {/* Mobile Topbar: Profile --- Action Buttons Group */}
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
          <MultiAvatar seed={activeProfile?.avatarSeed || activeProfile?.name || 'Player'} size={36} />
        </div>

        {/* Right Icon Actions Group */}
        <div className="mobile-topbar-actions-group">
          {/* 1. Search Icon Button */}
          <button 
            type="button"
            className={`mobile-topbar-action-btn ${isSearchOpen || searchQuery ? 'is-active' : ''}`}
            onClick={() => {
              setIsSearchOpen(prev => !prev);
              sfx?.playTileNav?.();
            }}
            title="Search Library"
            aria-label="Search Library"
          >
            <Search size={18} />
          </button>

          {/* 2. Theme Switcher Button */}
          {themeEngine && (
            <button 
              type="button"
              className="mobile-topbar-action-btn theme-action-btn"
              onClick={() => {
                if (onOpenThemeModal) {
                  onOpenThemeModal();
                  sfx?.playModalOpen?.();
                } else {
                  themeEngine.cycleTheme();
                  sfx?.playThemeSwitch?.();
                }
              }}
              title={`Theme Studio: ${themeEngine.currentThemeMeta?.name}`}
              aria-label="Theme Studio"
            >
              {themeEngine.currentThemeMeta?.icon && (themeEngine.currentThemeMeta.icon.endsWith('.svg') || themeEngine.currentThemeMeta.icon.includes('/')) ? (
                <img 
                  src={resolveAssetPath(themeEngine.currentThemeMeta.icon)} 
                  alt="" 
                  style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                />
              ) : (
                <Palette size={18} />
              )}
            </button>
          )}

          {/* 3. SFX Toggle Button (Off by default) */}
          {sfx && (
            <button 
              type="button"
              className={`mobile-topbar-action-btn ${!sfx.isMuted ? 'is-active' : ''}`}
              onClick={() => {
                sfx.toggleMute();
              }}
              title={sfx.isMuted ? "Sound Effects (Off) • Tap to Turn On" : "Sound Effects (On) • Tap to Turn Off"}
              aria-label="Toggle Sound Effects"
            >
              {sfx.isMuted ? <VolumeX size={18} color="#64748b" /> : <Volume2 size={18} color="#3b82f6" />}
            </button>
          )}

          {/* 4. BGM Toggle Button (Off by default) */}
          {bgm && (
            <button 
              type="button"
              className={`mobile-topbar-action-btn ${bgm.isPlaying ? 'is-active is-playing' : ''}`}
              onClick={() => {
                bgm.togglePlay();
                sfx?.playTileNav?.();
              }}
              title={bgm.currentTrack ? `BGM: ${bgm.currentTrack.title} (${bgm.isPlaying ? 'Playing' : 'Paused'})` : "Toggle BGM"}
              aria-label="Toggle Background Music"
            >
              <Music size={18} color={bgm.isPlaying ? '#10b981' : '#64748b'} className={bgm.isPlaying ? 'pulse-icon' : ''} />
            </button>
          )}

          {/* 5. Load Custom ROM Button (Minimized icon-only, no label) */}
          <button 
            type="button"
            className="mobile-topbar-action-btn load-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Load Custom ROM"
            aria-label="Load Custom ROM"
          >
            <FolderOpen size={18} />
          </button>
        </div>
      </header>

      {/* Expandable Search Bar Below Topbar */}
      {isSearchOpen && (
        <div className="mobile-expandable-search-bar animate-fade-in">
          <div className="mobile-search-widget">
            <Search size={16} className="mobile-search-icon" />
            <input 
              type="text"
              className="mobile-search-input"
              placeholder="Search all games..."
              value={searchQuery}
              autoFocus
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button"
                className="mobile-search-clear" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Systems Stage Body */}
      <main className="mobile-systems-body">
        {/* Stage Header Banner */}
        <div className="mobile-systems-header">
          <div className="mobile-systems-header-left">
            <span className="mobile-stage-badge">STAGE 2</span>
            <h2 className="mobile-systems-title">Choose System</h2>
          </div>
        </div>

        {/* Quick Access Smart Categories */}
        <div className="mobile-quick-categories-row">
          <button
            type="button"
            className="mobile-quick-cat-card is-all"
            onClick={() => {
              setSelectedSystem({ key: 'all', name: 'All Games', icon: 'assets/platforms/gba.svg' });
              sfx?.playTabSwitch?.();
            }}
          >
            <Layers size={20} color="#ef4444" />
            <div className="mobile-quick-cat-text">
              <strong>All Games</strong>
            </div>
            <ChevronRight size={16} className="mobile-quick-arrow" />
          </button>

          {favoriteGames.length > 0 && (
            <button
              type="button"
              className="mobile-quick-cat-card is-fav"
              onClick={() => {
                setSelectedSystem({ key: 'favorites', name: 'Favorites', icon: null });
                sfx?.playTabSwitch?.();
              }}
            >
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
              <div className="mobile-quick-cat-text">
                <strong>Favorites</strong>
              </div>
              <ChevronRight size={16} className="mobile-quick-arrow" />
            </button>
          )}

          {recentGames.length > 0 && (
            <button
              type="button"
              className="mobile-quick-cat-card is-recent"
              onClick={() => {
                setSelectedSystem({ key: 'recent', name: 'Recently Played', icon: null });
                sfx?.playTabSwitch?.();
              }}
            >
              <Clock size={20} color="#10b981" />
              <div className="mobile-quick-cat-text">
                <strong>Recent</strong>
              </div>
              <ChevronRight size={16} className="mobile-quick-arrow" />
            </button>
          )}
        </div>

        {/* Beautiful Console SVG Cards Grid */}
        <div className="mobile-console-cards-grid">
          {systems.map((sys) => {
            return (
              <div
                key={sys.key}
                className="mobile-console-card"
                style={{ '--sys-accent': sys.color || '#ef4444' }}
                onClick={() => {
                  setSelectedSystem(sys);
                  sfx?.playTabSwitch?.();
                }}
              >
                {/* Visual SVG Console Header */}
                <div className="mobile-console-art-wrap">
                  {sys.icon ? (
                    <img 
                      src={resolveAssetPath(sys.icon)} 
                      alt={sys.name} 
                      className="mobile-console-svg-img" 
                    />
                  ) : (
                    <Gamepad2 size={48} color={sys.color || '#64748b'} />
                  )}
                </div>

                {/* Info Footer */}
                <div className="mobile-console-card-footer">
                  <div className="mobile-console-text-wrap">
                    <span className="mobile-console-name">{sys.name}</span>
                    <span className="mobile-console-category">{sys.category || 'Console'}</span>
                  </div>
                  <ChevronRight size={16} style={{ color: sys.color || '#64748b', opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

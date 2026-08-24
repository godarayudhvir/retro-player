import React, { useMemo, useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Star, 
  Pencil, 
  RefreshCw, 
  Clock, 
  History, 
  Calendar, 
  Cpu, 
  Tag, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  BookOpen, 
  Tv, 
  ExternalLink, 
  Smartphone, 
  Globe, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Image, 
  FileText, 
  Search, 
  FolderOpen, 
  Gamepad2, 
  Layers, 
  Volume2, 
  VolumeX, 
  Palette, 
  X, 
  Menu,
  Plus, 
  ChevronRight, 
  Music, 
  SkipForward, 
  BatteryCharging, 
  BatteryFull, 
  BatteryMedium, 
  BatteryLow, 
  BatteryWarning, 
  Square,
  Edit3,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import MultiAvatar from './MultiAvatar';
import ConfirmModal from './ConfirmModal';
import { resolveAssetPath } from '../utils/assetPath';
import { getReleaseDate, getGameDescription } from '../gameDescriptions';
import { saveCachedMetadata } from '../services/metadataScraper';
import { resetEntireApp } from '../utils/appReset';

/**
 * MobileAppView: Authentic Nintendo DS Touch Theme Mobile Experience.
 * 
 * 5 Seamless Stages with 100% Desktop Parity:
 * - Stage 1: Choose Profile ("Who's Playing?" Multiavatar profile selector)
 * - Stage 2: Choose System (DS Console Cards with authentic console SVGs, total titles, categories)
 * - Stage 3: Choose Game (3-Column square beveled DS touch buttons matrix)
 * - Stage 4: Shows Game Detail (DS Dual-Screen layout with Cover Top Screen, Synopsis Bottom Screen,
 *            Big Nintendo Play Button, and integrated Direct Touch tabs for Favorite, Save RAM Studio,
 *            Strategy Guides QR Companion, Metadata Editor, and Online Scraper Studio)
 * - Stage 5: Plays Game (Launches full emulation sandbox with responsive mobile touch controls)
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
  onExportSave,
  onImportSave,
  onDeleteSave,
  onResetStats,
  hasSaveData,
  scraper,
  pwa,
  gamepadConnected = false,
  gamepadBattery,
  time,
  onOpenScraperModal,
  onOpenAboutModal,
  showResetConfirm: externalShowResetConfirm,
  setShowResetConfirm: externalSetShowResetConfirm,
  setShowLoadRomModal,
  setShowVirtualKeyboard
}) {
  const fileInputRef = useRef(null);
  const saveFileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const logsEndRef = useRef(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [internalShowResetConfirm, setInternalShowResetConfirm] = useState(false);
  const showResetConfirm = externalShowResetConfirm !== undefined ? externalShowResetConfirm : internalShowResetConfirm;
  const setShowResetConfirm = externalSetShowResetConfirm || setInternalShowResetConfirm;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveActionStatus, setSaveActionStatus] = useState('');

  // DS Detail Tabs: 'overview' | 'save' | 'guides' | 'manage'
  const [dsTab, setDsTab] = useState('overview');
  const [isLocalScraping, setIsLocalScraping] = useState(false);

  // Strategy Guides QR Companion State
  const [activeQrType, setActiveQrType] = useState(null); // 'written' | 'video' | null
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Metadata Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editDeveloper, setEditDeveloper] = useState('');
  const [editPublisher, setEditPublisher] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWrittenGuide, setEditWrittenGuide] = useState('');
  const [editVideoGuide, setEditVideoGuide] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editSaveStatus, setEditSaveStatus] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const rawCover = selectedMeta?.coverUrl || (selectedGameForDetails?.coverUrl && !selectedGameForDetails?.coverUrl.endsWith('.svg') ? selectedGameForDetails.coverUrl : null);
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const rawScreenshot = selectedMeta?.screenshotUrl;
  const screenshotSrc = rawScreenshot ? resolveAssetPath(rawScreenshot) : null;
  const description = selectedMeta?.description || selectedGameForDetails?.sidecarMetadata?.description || (selectedGameForDetails ? getGameDescription(selectedGameForDetails) : '');
  const releaseYear = selectedMeta?.releaseYear || selectedMeta?.releaseDate?.split('-')[0] || (selectedGameForDetails && getReleaseDate(selectedGameForDetails) !== '2000-01-01' ? getReleaseDate(selectedGameForDetails).split('-')[0] : 'Classic');
  const developer = selectedMeta?.developer || selectedGameForDetails?.sidecarMetadata?.developer || selectedGameForDetails?.systemName || 'Classic';
  const publisher = selectedMeta?.publisher || selectedGameForDetails?.sidecarMetadata?.publisher || developer || 'Classic';
  const genre = selectedMeta?.genre || selectedGameForDetails?.sidecarMetadata?.genre || 'Retro Classic';

  const walkthrough = selectedGameForDetails?.sidecarMetadata?.walkthrough || selectedMeta?.walkthrough || {};
  const writtenGuideUrl = walkthrough.written || selectedMeta?.writtenWalkthroughUrl || null;
  const videoGuideUrl = walkthrough.video || selectedMeta?.videoWalkthroughUrl || null;
  const hasGuides = Boolean(writtenGuideUrl || videoGuideUrl);

  // Reset tab on switching game
  useEffect(() => {
    setDsTab('overview');
    setActiveQrType(null);
    setQrDataUrl('');
    setCopiedLink(false);
    setEditSaveStatus('');
  }, [selectedGameForDetails?.id, selectedGameForDetails?.title]);

  // Synchronize form fields with active selected game
  useEffect(() => {
    if (!selectedGameForDetails) return;
    setEditTitle(selectedMeta?.title || selectedGameForDetails.title || '');
    setEditYear(selectedMeta?.releaseYear || (releaseYear !== 'Classic' ? releaseYear : ''));
    setEditGenre(selectedMeta?.genre || (genre !== 'Retro Classic' ? genre : ''));
    setEditDeveloper(selectedMeta?.developer || developer || '');
    setEditPublisher(selectedMeta?.publisher || publisher || '');
    setEditDescription(selectedMeta?.description || description || '');
    setEditWrittenGuide(walkthrough.written || selectedMeta?.writtenWalkthroughUrl || '');
    setEditVideoGuide(walkthrough.video || selectedMeta?.videoWalkthroughUrl || '');
    setEditCoverUrl(selectedMeta?.coverUrl || (selectedGameForDetails.coverUrl && !selectedGameForDetails.coverUrl.endsWith('.svg') ? selectedGameForDetails.coverUrl : ''));
  }, [selectedGameForDetails?.id, selectedGameForDetails?.title, selectedMeta, releaseYear, genre, developer, publisher, description]);

  // Handle custom ROM file upload
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onCustomRomLoad) {
      onCustomRomLoad(file);
      sfx?.playGameLaunch?.();
    }
  };

  // Manual re-scrape handler
  const handleManualScrape = async () => {
    if (!selectedGameForDetails) return;
    setIsLocalScraping(true);
    sfx?.playThemeSwitch?.();
    let result = null;
    if (onScrapeGame) {
      result = await onScrapeGame(selectedGameForDetails, true);
    } else if (scraper?.scrapeSingleGame) {
      result = await scraper.scrapeSingleGame(selectedGameForDetails, true);
    }
    if (result) {
      setEditTitle(result.title || selectedGameForDetails.title);
      setEditYear(result.releaseYear || 'Classic');
      setEditGenre(result.genre || 'Retro Classic');
      setEditDeveloper(result.developer || 'Classic');
      setEditPublisher(result.publisher || 'Classic');
      setEditDescription(result.description || '');
      if (result.coverUrl) {
        setEditCoverUrl(result.coverUrl);
      }
    }
    setIsLocalScraping(false);
  };

  // Save metadata edit handler
  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!selectedGameForDetails || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const id = selectedGameForDetails.id || `${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const updatedData = {
        id,
        title: editTitle.trim() || selectedGameForDetails.title,
        systemKey: selectedGameForDetails.systemKey,
        releaseYear: editYear.trim() || 'Classic',
        releaseDate: editYear.trim() ? `${editYear.trim()}-01-01` : '2000-01-01',
        genre: editGenre.trim() || 'Retro Classic',
        developer: editDeveloper.trim() || selectedGameForDetails.systemName || 'Classic',
        publisher: editPublisher.trim() || selectedGameForDetails.systemName || 'Classic',
        description: editDescription.trim() || `Experience ${selectedGameForDetails.title} on ${selectedGameForDetails.systemName}.`,
        coverUrl: editCoverUrl.trim() || null,
        hasCustomCover: Boolean(editCoverUrl.trim()),
        walkthrough: {
          written: editWrittenGuide.trim() || undefined,
          video: editVideoGuide.trim() || undefined
        },
        writtenWalkthroughUrl: editWrittenGuide.trim() || undefined,
        videoWalkthroughUrl: editVideoGuide.trim() || undefined,
        isManualOverride: true,
        source: 'Manual Edit',
        scrapedAt: new Date().toISOString()
      };

      await saveCachedMetadata(id, updatedData);
      scraper?.updateLocalMetadata?.(id, updatedData);
      sfx?.playMenuConfirm?.();
      setEditSaveStatus('Saved to Browser Storage!');
      setTimeout(() => {
        setEditSaveStatus('');
        setDsTab('overview');
      }, 1100);
    } catch (err) {
      console.error('Failed to save metadata:', err);
      setEditSaveStatus('Save Failed');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Export metadata.json sidecar handler
  const handleExportSidecar = () => {
    if (!selectedGameForDetails) return;
    const sidecarData = {
      title: editTitle.trim() || selectedGameForDetails.title,
      releaseYear: editYear.trim() || (releaseYear !== 'Classic' ? releaseYear : '2000'),
      genre: editGenre.trim() || genre || 'Retro Classic',
      developer: editDeveloper.trim() || developer || selectedGameForDetails.systemName || 'Classic',
      publisher: editPublisher.trim() || publisher || selectedGameForDetails.systemName || 'Classic',
      description: editDescription.trim() || description || `Experience ${selectedGameForDetails.title} on ${selectedGameForDetails.systemName}.`,
      walkthrough: {
        written: editWrittenGuide.trim() || undefined,
        video: editVideoGuide.trim() || undefined
      },
      source: 'Retro Player Export'
    };

    const blob = new Blob([JSON.stringify(sidecarData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sfx?.playNotification?.();
  };

  // Upload custom cover image handler
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && selectedGameForDetails) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          setEditCoverUrl(dataUrl);
          const id = selectedGameForDetails.id || `${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const currentMeta = selectedMeta || {};
          const updated = {
            ...currentMeta,
            id,
            title: editTitle.trim() || currentMeta.title || selectedGameForDetails.title,
            systemKey: selectedGameForDetails.systemKey,
            coverUrl: dataUrl,
            hasCustomCover: true,
            isManualOverride: true,
            scrapedAt: new Date().toISOString()
          };
          await saveCachedMetadata(id, updated);
          scraper?.updateLocalMetadata?.(id, updated);
          sfx?.playNotification?.();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Toggle QR Code Companion handler
  const handleToggleQr = (type, url) => {
    if (activeQrType === type) {
      setActiveQrType(null);
      setQrDataUrl('');
    } else {
      setActiveQrType(type);
      setCopiedLink(false);
      sfx?.playTileNav?.();
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error('DS QR Generation Failed', err));
    }
  };

  // Copy guide link handler
  const handleCopyLink = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      sfx?.playNotification?.();
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (_) {
      return 'web guide';
    }
  };

  // Helper to render accurate battery icon and telemetry
  const renderBatteryIcon = () => {
    if (!gamepadBattery || !gamepadBattery.hasBatteryInfo) return null;
    const { batteryPercent, isCharging } = gamepadBattery;

    if (isCharging) {
      return <BatteryCharging size={14} className="battery-icon is-charging" />;
    }
    if (batteryPercent > 70) {
      return <BatteryFull size={14} className="battery-icon is-full" />;
    }
    if (batteryPercent > 30) {
      return <BatteryMedium size={14} className="battery-icon is-medium" />;
    }
    if (batteryPercent > 10) {
      return <BatteryLow size={14} className="battery-icon is-low" />;
    }
    return <BatteryWarning size={14} className="battery-icon is-critical" />;
  };

  const getGamepadTooltip = () => {
    if (!gamepadConnected) {
      return "No Gamepad Detected (Plug in USB or pair Bluetooth controller)";
    }
    if (gamepadBattery?.hasBatteryInfo) {
      const { batteryPercent, isCharging } = gamepadBattery;
      return `Gamepad: ${gamepadBattery.gamepadId || 'Controller'} • Battery: ${batteryPercent}% ${isCharging ? '(Charging ⚡)' : ''}`;
    }
    return `Gamepad Connected: ${gamepadBattery?.gamepadId || 'Ready'} • USB / Wireless Active`;
  };

  const getGamepadColor = () => {
    if (!gamepadConnected) return '#64748b';
    if (gamepadBattery?.hasBatteryInfo) {
      const { batteryPercent, isCharging } = gamepadBattery;
      if (isCharging) return '#10b981';
      if (batteryPercent <= 10) return '#ef4444';
      if (batteryPercent <= 20) return '#f59e0b';
      return '#10b981';
    }
    return '#10b981';
  };

  // Active Stage Detection:
  // Stage 1: Profile Selection
  // Stage 4: Game Detail
  // Stage 3: Game Selection
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
              <img src={resolveAssetPath('favicon.svg')} alt="Retro Player Logo" className="mobile-brand-logo" />
              <span className="mobile-brand-retro">RETRO</span>
              <span className="mobile-brand-player">PLAYER</span>
            </div>
            {hasChosenProfileThisSession && (
              <button 
                className="mobile-gate-close-btn"
                onClick={() => setShowProfileSwitcher(false)}
                aria-label="Close Profile Switcher"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mobile-profile-gate-body">
            <h1 className="mobile-profile-gate-title">Who&apos;s Playing?</h1>
            <p className="mobile-profile-gate-desc">
              Choose your profile to access your saves, favorite titles, and records.
            </p>

            <div className="mobile-profile-grid">
              {profiles.map((p) => {
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
                    <div 
                      className="mobile-profile-avatar-wrap"
                      style={{ borderColor: p.favoriteColor || '#e11d48' }}
                    >
                      <MultiAvatar seed={p.avatarSeed || p.name || 'Player'} size={68} />
                    </div>
                    <span className="mobile-profile-name">{p.name}</span>

                    <div className="mobile-profile-actions-mini" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="mobile-prof-btn"
                        onClick={() => onEditProfile?.(p)}
                        title={`Edit ${p.name}'s Avatar`}
                        aria-label={`Edit ${p.name}'s Avatar`}
                      >
                        <Edit3 size={13} />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          className="mobile-prof-btn is-delete"
                          onClick={() => onDeleteProfile?.(p.id)}
                          title={`Delete ${p.name}`}
                          aria-label={`Delete ${p.name}`}
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
  // STAGE 4: SHOWS GAME DETAIL (Nintendo DS Dual-Screen Touch Architecture)
  // =========================================================================
  if (isStageDetail) {
    const gameLogs = (scraper?.logs || []).filter(l => 
      l.meta?.title === selectedGameForDetails.title || 
      l.meta?.gameId === selectedGameForDetails.id || 
      (selectedGameForDetails.title && l.message?.toLowerCase().includes(selectedGameForDetails.title.toLowerCase()))
    );

    const supportsBattery = selectedGameForDetails?.supportsBatterySaves !== false && 
      selectedGameForDetails?.systemKey !== 'arcade' && 
      selectedGameForDetails?.systemKey !== 'atari2600' && 
      !selectedGameForDetails?.systemName?.toLowerCase().includes('arcade') && 
      !selectedGameForDetails?.systemName?.toLowerCase().includes('atari 2600');

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
            <ArrowLeft size={16} />
            <span>{selectedSystem?.name || 'Consoles'}</span>
          </button>
        </header>

        {/* Game Detail Body */}
        <main className="mobile-detail-body">
          {/* Top Screen Frame: Snapshot / Box Art in DS Bezel */}
          <div className="ds-screen-frame top-screen mobile-ds-top-screen">
            {screenshotSrc ? (
              <img src={screenshotSrc} alt="Gameplay Snapshot" className="ds-screen-img" />
            ) : coverSrc ? (
              <img src={coverSrc} alt={selectedGameForDetails.title} className="ds-screen-img cover-fit" />
            ) : (
              <div className="ds-screen-placeholder">
                <Gamepad2 size={42} color="#94a3b8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}>{selectedGameForDetails.title}</span>
              </div>
            )}
          </div>

          {/* Title & Metadata Block */}
          <div className="ds-game-title-card mobile-ds-title-card">
            <h1 className="ds-game-header-title">{selectedGameForDetails.title}</h1>
          </div>

          <div className="mobile-detail-pills-row">
            <span className="mobile-meta-pill"><Calendar size={12} /> {releaseYear}</span>
            <span className="mobile-meta-pill"><Cpu size={12} /> {genre}</span>
            <span className="mobile-meta-pill">Dev: {developer}</span>
          </div>

          {/* STAGE 5 LAUNCH: Big Primary Nintendo DS Play Button */}
          <div className="mobile-detail-cta-block">
            <button
              type="button"
              className="ds-play-now-btn mobile-ds-play-btn"
              onClick={() => {
                if (onPlayGame) {
                  onPlayGame(selectedGameForDetails);
                }
              }}
            >
              <Play size={20} fill="#ffffff" />
              <span>{hasSaveData ? 'CONTINUE / PLAY NOW' : 'PLAY GAME NOW'}</span>
            </button>
          </div>

          {/* DS Touch Action Toolbar */}
          <div className="ds-action-toolbar mobile-ds-action-toolbar">
            {/* Favorite Button */}
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ${isSelectedFav ? 'is-favorited' : ''}`}
              onClick={() => {
                if (toggleFavorite) {
                  toggleFavorite(selectedGameForDetails);
                  sfx?.playFavoriteToggle?.(!isSelectedFav);
                }
              }}
              title={isSelectedFav ? 'Favorited' : 'Favorite'}
              aria-label={isSelectedFav ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Star size={16} fill={isSelectedFav ? '#f59e0b' : 'none'} color={isSelectedFav ? '#d97706' : 'currentColor'} />
            </button>

            {/* Save RAM Touch Tab */}
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ds-save-tab-btn ${dsTab === 'save' ? 'is-active' : ''}`}
              onClick={() => {
                setDsTab(dsTab === 'save' ? 'overview' : 'save');
                sfx?.playTabSwitch?.();
              }}
              title="In-Game Save Data & Battery RAM (.sav)"
              aria-label="Save Data"
            >
              <Save size={16} color={dsTab === 'save' ? '#ffffff' : '#10b981'} />
            </button>

            {/* Guides Touch Tab */}
            {hasGuides && (
              <button
                type="button"
                className={`ds-tool-btn ds-icon-btn ds-guide-btn ${dsTab === 'guides' ? 'is-active' : ''}`}
                onClick={() => {
                  setDsTab(dsTab === 'guides' ? 'overview' : 'guides');
                  sfx?.playTabSwitch?.();
                }}
                title="Strategy Guides & Walkthroughs"
                aria-label="Strategy Guides"
              >
                <BookOpen size={16} color={dsTab === 'guides' ? '#ffffff' : '#3b82f6'} />
              </button>
            )}

            {/* Edit & Scrape Touch Tab */}
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ds-edit-tab-btn ${dsTab === 'manage' ? 'is-active' : ''}`}
              onClick={() => {
                setDsTab(dsTab === 'manage' ? 'overview' : 'manage');
                sfx?.playTabSwitch?.();
              }}
              title="Edit Game Metadata & Scraper Studio"
              aria-label="Edit & Scrape"
            >
              <Pencil size={16} color={dsTab === 'manage' ? '#ffffff' : 'currentColor'} />
            </button>
          </div>

          {/* =========================================================================
              VIEW 1: OVERVIEW (Playtime Analytics & Hardware Specs)
              ========================================================================= */}
          {dsTab === 'overview' && (
            <div className="ds-tab-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Playtime Stats Card */}
              <div className="ds-stats-card">
                <div className="ds-stats-row-3">
                  <div className="ds-stat-item">
                    <div className="ds-stat-label">
                      <Clock size={12} color="#3b82f6" />
                      <span>Playtime</span>
                    </div>
                    <div className="ds-stat-val-group">
                      <span className="ds-stat-val">{selectedStats?.playtimeFormatted || '< 1 min'}</span>
                      {onResetStats && (selectedStats?.totalSeconds > 0 || selectedStats?.launchCount > 0) && (
                        <button
                          className="ds-stat-reset-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetStats(selectedGameForDetails);
                            sfx?.playDelete?.();
                          }}
                          title="Reset Playtime Stats"
                          aria-label="Reset Playtime Stats"
                        >
                          <RotateCcw size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="ds-stat-divider" />

                  <div className="ds-stat-item">
                    <div className="ds-stat-label">
                      <History size={12} color="#10b981" />
                      <span>Sessions</span>
                    </div>
                    <span className="ds-stat-val">{selectedStats?.launchCount || 0}</span>
                  </div>

                  <div className="ds-stat-divider" />

                  <div className="ds-stat-item">
                    <div className="ds-stat-label">
                      <Calendar size={12} color="#f59e0b" />
                      <span>Last Played</span>
                    </div>
                    <span className="ds-stat-val ds-stat-date">{selectedStats?.lastPlayedFormatted || 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Screen Frame: Synopsis & Game Overview */}
              <div className="ds-screen-frame bottom-screen mobile-ds-bottom-screen">
                <div className="ds-synopsis-content">
                  <strong style={{ fontSize: '0.8rem', color: 'var(--poke-red, #e11d48)' }}>Synopsis &amp; Game Overview</strong>
                  <p className="ds-synopsis-text">{description}</p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: IN-GAME SAVE & BATTERY RAM STUDIO (.SAV)
              ========================================================================= */}
          {dsTab === 'save' && (
            <div className="ds-tab-pane ds-save-studio animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <input
                type="file"
                ref={saveFileInputRef}
                accept=".sav,.srm,.state,.ram,.mcr,application/octet-stream"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && onImportSave && selectedGameForDetails) {
                    setSaveActionStatus('Importing save...');
                    const success = await onImportSave(file, selectedGameForDetails);
                    if (success) {
                      sfx?.playMenuConfirm?.();
                      setSaveActionStatus('Save file imported successfully!');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    } else {
                      setSaveActionStatus('Failed to import save file.');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    }
                  }
                  e.target.value = '';
                }}
              />

              {saveActionStatus && (
                <div className="ds-save-status-toast animate-fade-in">
                  <span>{saveActionStatus}</span>
                </div>
              )}

              {/* Status Header Badge */}
              <div className={`ds-save-status-badge ${hasSaveData ? 'has-save' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} color={hasSaveData ? '#10b981' : '#64748b'} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{hasSaveData ? 'BATTERY SAVE DETECTED' : 'NO SAVE DATA FOUND'}</strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                      {!supportsBattery ? 'Arcade session loop (Quick Saves supported)' : (hasSaveData ? 'Saved battery RAM ready' : 'Auto-saves or import .sav')}
                    </span>
                  </div>
                </div>
                {hasSaveData && <CheckCircle2 size={16} color="#10b981" />}
              </div>

              {/* Save Action Tiles */}
              <div className="ds-save-tiles-group">
                {/* Export Tile */}
                <button
                  type="button"
                  className={`ds-save-action-tile ${!hasSaveData ? 'is-disabled' : ''}`}
                  disabled={!hasSaveData}
                  onClick={async () => {
                    if (onExportSave && selectedGameForDetails && hasSaveData) {
                      setSaveActionStatus('Exporting save...');
                      const success = await onExportSave(selectedGameForDetails);
                      if (success) {
                        sfx?.playNotification?.();
                        setSaveActionStatus('Downloaded .sav battery save file!');
                        setTimeout(() => setSaveActionStatus(''), 4000);
                      }
                    }
                  }}
                >
                  <div className="ds-save-tile-icon export">
                    <Download size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Export Save (.sav)</div>
                    <div className="ds-save-tile-sub">Download in-game save to your device</div>
                  </div>
                </button>

                {/* Import Tile */}
                <button
                  type="button"
                  className="ds-save-action-tile"
                  onClick={() => saveFileInputRef.current?.click()}
                >
                  <div className="ds-save-tile-icon import">
                    <Upload size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Import Save (.sav)</div>
                    <div className="ds-save-tile-sub">Upload an existing .sav battery save</div>
                  </div>
                </button>

                {/* Delete Tile */}
                <button
                  type="button"
                  className={`ds-save-action-tile is-delete ${!hasSaveData ? 'is-disabled' : ''}`}
                  disabled={!hasSaveData}
                  onClick={() => {
                    if (hasSaveData) {
                      setShowDeleteConfirm(true);
                      sfx?.playTileNav?.();
                    }
                  }}
                >
                  <div className="ds-save-tile-icon delete">
                    <Trash2 size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Delete In-Game Save</div>
                    <div className="ds-save-tile-sub">Erase saved data to restart the game fresh</div>
                  </div>
                </button>
              </div>

              {/* Delete Save Confirmation Modal */}
              <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Delete Save Data?"
                message={`Are you sure you want to permanently erase the saved battery RAM and save states for "${selectedGameForDetails?.title}"? This action cannot be undone.`}
                confirmLabel="Delete Save"
                cancelLabel="Cancel"
                isDestructive={true}
                onConfirm={async () => {
                  setShowDeleteConfirm(false);
                  if (onDeleteSave && selectedGameForDetails) {
                    await onDeleteSave(selectedGameForDetails);
                    sfx?.playDelete?.();
                    setSaveActionStatus('Save data & states erased!');
                    setTimeout(() => setSaveActionStatus(''), 4000);
                  }
                }}
                onCancel={() => setShowDeleteConfirm(false)}
                sfx={sfx}
              />
            </div>
          )}

          {/* =========================================================================
              VIEW 3: STRATEGY GUIDES & WALKTHROUGHS QR COMPANION
              ========================================================================= */}
          {dsTab === 'guides' && (
            <div className="ds-tab-pane ds-guides-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="ds-guides-touch-list">
                {/* Channel 1: Written Strategy Guide */}
                {writtenGuideUrl && (
                  <div className={`ds-guide-card ${activeQrType === 'written' ? 'is-qr-open' : ''}`}>
                    <div className="ds-guide-card-top">
                      <div className="ds-guide-icon written">
                        <BookOpen size={16} />
                      </div>
                      <div className="ds-guide-info">
                        <div className="ds-guide-name-row">
                          <strong>Written Guide</strong>
                          <span className="ds-domain-tag">{getDomain(writtenGuideUrl)}</span>
                        </div>
                        <span className="ds-guide-sub">Walkthrough &amp; maps</span>
                      </div>
                      <div className="ds-guide-actions">
                        <button
                          type="button"
                          className="ds-guide-act-btn primary"
                          onClick={() => window.open(writtenGuideUrl, '_blank', 'noopener,noreferrer')}
                        >
                          <Globe size={12} />
                          <span>Open</span>
                        </button>
                        <button
                          type="button"
                          className={`ds-guide-act-btn qr ${activeQrType === 'written' ? 'active' : ''}`}
                          onClick={() => handleToggleQr('written', writtenGuideUrl)}
                        >
                          <Smartphone size={12} />
                          <span>QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline QR Frame */}
                    {activeQrType === 'written' && (
                      <div className="ds-inline-qr-box animate-fade-in">
                        <div className="ds-qr-frame">
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Guide QR" className="ds-qr-img" />
                          ) : (
                            <span style={{ fontSize: '0.65rem' }}>Loading QR...</span>
                          )}
                        </div>
                        <div className="ds-qr-info">
                          <span className="ds-qr-hint">Scan with secondary device to read</span>
                          <button
                            type="button"
                            className="ds-copy-btn"
                            onClick={() => handleCopyLink(writtenGuideUrl)}
                          >
                            {copiedLink ? <Check size={12} color="#10b981" /> : <ExternalLink size={12} />}
                            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Channel 2: Video Longplay */}
                {videoGuideUrl && (
                  <div className={`ds-guide-card ${activeQrType === 'video' ? 'is-qr-open' : ''}`}>
                    <div className="ds-guide-card-top">
                      <div className="ds-guide-icon video">
                        <Tv size={16} />
                      </div>
                      <div className="ds-guide-info">
                        <div className="ds-guide-name-row">
                          <strong>Video Longplay</strong>
                          <span className="ds-domain-tag">{getDomain(videoGuideUrl)}</span>
                        </div>
                        <span className="ds-guide-sub">Full video playlist</span>
                      </div>
                      <div className="ds-guide-actions">
                        <button
                          type="button"
                          className="ds-guide-act-btn video-act"
                          onClick={() => window.open(videoGuideUrl, '_blank', 'noopener,noreferrer')}
                        >
                          <Globe size={12} />
                          <span>Watch</span>
                        </button>
                        <button
                          type="button"
                          className={`ds-guide-act-btn qr ${activeQrType === 'video' ? 'active' : ''}`}
                          onClick={() => handleToggleQr('video', videoGuideUrl)}
                        >
                          <Smartphone size={12} />
                          <span>QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline QR Frame */}
                    {activeQrType === 'video' && (
                      <div className="ds-inline-qr-box animate-fade-in">
                        <div className="ds-qr-frame">
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Video QR" className="ds-qr-img" />
                          ) : (
                            <span style={{ fontSize: '0.65rem' }}>Loading QR...</span>
                          )}
                        </div>
                        <div className="ds-qr-info">
                          <span className="ds-qr-hint">Scan with secondary device to watch</span>
                          <button
                            type="button"
                            className="ds-copy-btn"
                            onClick={() => handleCopyLink(videoGuideUrl)}
                          >
                            {copiedLink ? <Check size={12} color="#10b981" /> : <ExternalLink size={12} />}
                            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden Cover Image Upload Input */}
          <input
            type="file"
            ref={coverImageInputRef}
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={handleCoverUpload}
          />

          {/* =========================================================================
              VIEW 4: METADATA CUSTOMIZER & ONLINE SCRAPER STUDIO
              ========================================================================= */}
          {dsTab === 'manage' && (
            <div className="ds-tab-pane ds-manage-pane animate-fade-in">
              <form onSubmit={handleSaveEdit} className="ds-inline-form-card">
                {/* Header Identity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={14} color="#f59e0b" />
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{selectedGameForDetails.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-sub)' }}>{selectedGameForDetails.systemName}</span>
                </div>

                {/* Section 1: Cover Artwork Studio */}
                <div className="ds-scrape-asset-card" style={{ padding: '0.45rem 0.55rem', background: 'rgba(100, 116, 139, 0.06)', borderRadius: '4px', border: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Image size={13} color="#3b82f6" />
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Cover Artwork</span>
                    </div>
                    {coverSrc ? (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={11} /> Box Art Available
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b' }}>
                        No Box Art on Remote DBs
                      </span>
                    )}
                  </div>

                  {coverSrc ? (
                    <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
                      <img 
                        src={coverSrc} 
                        alt="Game Cover" 
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1.5px solid var(--panel-border)' }} 
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {selectedMeta?.hasCustomCover ? 'Custom / Uploaded Cover' : (selectedGameForDetails.hasSidecar ? 'Local Companion Sidecar' : 'Libretro CDN / ScreenScraper')}
                        </span>
                        <button
                          type="button"
                          className="ds-inline-btn-secondary"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.64rem', width: 'fit-content' }}
                          onClick={() => coverImageInputRef.current?.click()}
                        >
                          <Upload size={10} />
                          <span>Replace Cover</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <p style={{ fontSize: '0.66rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35 }}>
                        Searched Libretro CDN, TheGamesDB &amp; Wikipedia (No official box art found on remote servers).
                      </p>
                      <button
                        type="button"
                        className="ds-inline-btn-secondary"
                        style={{ width: 'fit-content', padding: '0.25rem 0.55rem', fontSize: '0.66rem' }}
                        onClick={() => coverImageInputRef.current?.click()}
                      >
                        <Upload size={11} />
                        <span>Upload Custom Cover</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 2: Online Scraper & Live Terminal Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={11} color="#64748b" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Online DB Search Logs</span>
                    </div>

                    <button
                      type="button"
                      className="ds-inline-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                      onClick={handleManualScrape}
                      disabled={isLocalScraping}
                      title="Force live online re-scrape against Libretro CDN, ScreenScraper & Wikipedia"
                    >
                      <RefreshCw size={10} className={isLocalScraping ? 'spin' : ''} />
                      <span>{isLocalScraping ? 'Searching DBs...' : 'Re-Fetch Online Data'}</span>
                    </button>
                  </div>

                  <div className="ds-scraper-terminal-logs">
                    {gameLogs.length > 0 ? (
                      gameLogs.map((log, idx) => (
                        <div key={log.id || idx} className={`ds-log-line log-${log.type}`}>
                          <span className="log-time">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'LOG'}</span>
                          <span className="log-msg">{log.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="ds-log-line log-info">
                        <span className="log-msg">{isLocalScraping ? 'Starting network queries...' : 'Ready to search online databases. Tap "Re-Fetch Online Data" to query.'}</span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>

                {/* Section 3: Metadata Form Fields */}
                <div className="ds-field-group">
                  <label className="ds-field-label">Display Title</label>
                  <input
                    type="text"
                    className="ds-field-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Super Mario World"
                  />
                </div>

                <div className="ds-field-row-2">
                  <div className="ds-field-group">
                    <label className="ds-field-label">Release Year</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      placeholder="e.g. 1996"
                    />
                  </div>
                  <div className="ds-field-group">
                    <label className="ds-field-label">Genre</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editGenre}
                      onChange={(e) => setEditGenre(e.target.value)}
                      placeholder="e.g. Platformer"
                    />
                  </div>
                </div>

                <div className="ds-field-row-2">
                  <div className="ds-field-group">
                    <label className="ds-field-label">Developer</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editDeveloper}
                      onChange={(e) => setEditDeveloper(e.target.value)}
                      placeholder="e.g. Nintendo"
                    />
                  </div>
                  <div className="ds-field-group">
                    <label className="ds-field-label">Publisher</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editPublisher}
                      onChange={(e) => setEditPublisher(e.target.value)}
                      placeholder="e.g. Nintendo"
                    />
                  </div>
                </div>

                <div className="ds-field-group">
                  <label className="ds-field-label">Plot Synopsis / Overview</label>
                  <textarea
                    className="ds-field-textarea"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter game storyline, overview, or synopsis..."
                  />
                </div>

                <div className="ds-field-group">
                  <label className="ds-field-label">Cover Image URL</label>
                  <input
                    type="text"
                    className="ds-field-input"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="ds-field-row-2">
                  <div className="ds-field-group">
                    <label className="ds-field-label">Written Guide URL</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editWrittenGuide}
                      onChange={(e) => setEditWrittenGuide(e.target.value)}
                      placeholder="https://strategywiki.org/..."
                    />
                  </div>
                  <div className="ds-field-group">
                    <label className="ds-field-label">Video Guide URL</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editVideoGuide}
                      onChange={(e) => setEditVideoGuide(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                {/* Section 4: Action Buttons */}
                <div className="ds-inline-actions" style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '0.45rem', marginTop: '0.3rem' }}>
                  <button
                    type="button"
                    className="ds-inline-btn-secondary"
                    onClick={handleExportSidecar}
                    title="Export local metadata.json sidecar file"
                  >
                    <Download size={12} />
                    <span>Export Sidecar</span>
                  </button>

                  <button
                    type="submit"
                    className="ds-inline-btn-primary"
                    disabled={isSavingEdit}
                  >
                    <Check size={13} />
                    <span>{editSaveStatus || (isSavingEdit ? 'Saving...' : 'Save Changes')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: CHOOSE GAME (3-Column Square Beveled DS Button Grid)
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
            <ArrowLeft size={16} />
            <span>Consoles</span>
          </button>
          
          <div className="mobile-games-nav-center">
            {selectedSystem?.icon && (
              <img src={resolveAssetPath(selectedSystem.icon)} alt="" className="mobile-games-nav-sys-icon" />
            )}
            <span className="mobile-games-nav-title">{systemTitle}</span>
          </div>
        </header>

        {/* Game Content Grid */}
        <main className="mobile-games-grid-body">
          {currentGamesList.length > 0 ? (
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
            <div className="mobile-empty-catalog">
              <FolderOpen size={48} color="#64748b" />
              <h3>No Games Found</h3>
              <p>No ROM files found matching this filter.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: CHOOSE SYSTEM (DS Touch Console Cards Grid & Full Parity Topbar)
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

      {/* Mobile Topbar: Brand & Profile --- Complete Parity Action Buttons Group */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-left-group">
          {/* Active Profile Avatar Pill */}
          <div 
            className="mobile-topbar-profile"
            style={{ borderColor: activeProfile?.favoriteColor || '#e11d48' }}
            onClick={() => {
              setShowProfileSwitcher(true);
              sfx?.playModalOpen?.();
            }}
            title={`Profile: ${activeProfile?.name || 'Player'} (Tap to switch)`}
          >
            <MultiAvatar seed={activeProfile?.avatarSeed || activeProfile?.name || 'Player'} size={32} />
          </div>
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
            <Search size={16} />
          </button>

          {/* 2. BGM Toggle Button & Skip Button */}
          {bgm && (
            <div className="mobile-bgm-group" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
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
                <Music size={16} color={bgm.isPlaying ? '#10b981' : '#64748b'} className={bgm.isPlaying ? 'pulse-icon' : ''} />
              </button>

              {bgm.isPlaying && (
                <button
                  type="button"
                  className="mobile-topbar-action-btn mobile-bgm-skip-btn"
                  onClick={() => {
                    bgm.nextTrack();
                    sfx?.playTabSwitch?.();
                  }}
                  title="Next BGM Track"
                  aria-label="Next BGM Track"
                  style={{ width: '28px', height: '28px' }}
                >
                  <SkipForward size={12} color="#94a3b8" />
                </button>
              )}
            </div>
          )}

          {/* 3. SFX Toggle Button */}
          {sfx && (
            <button 
              type="button"
              className={`mobile-topbar-action-btn ${!sfx.isMuted ? 'is-active' : ''}`}
              onClick={() => {
                sfx.toggleMute();
              }}
              title={sfx.isMuted ? "Sound Effects (Off)" : "Sound Effects (On)"}
              aria-label="Toggle Sound Effects"
            >
              {sfx.isMuted ? <VolumeX size={16} color="#64748b" /> : <Volume2 size={16} color="#3b82f6" />}
            </button>
          )}

          {/* 4. Gamepad & Battery Telemetry Pill */}
          <div 
            className={`mobile-topbar-action-btn mobile-gamepad-pill ${gamepadConnected ? 'is-connected' : ''} ${gamepadConnected && gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 10 && !gamepadBattery.isCharging ? 'is-battery-critical' : gamepadConnected && gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 20 && !gamepadBattery.isCharging ? 'is-battery-low' : ''}`}
            title={getGamepadTooltip()}
          >
            <Gamepad2 size={16} />
            {gamepadBattery?.hasBatteryInfo && (
              <span className="mobile-battery-indicator">
                {renderBatteryIcon()}
                <span style={{ fontSize: '0.66rem', fontWeight: 900 }}>{gamepadBattery.batteryPercent}%</span>
              </span>
            )}
          </div>

          {/* 5. Load Custom ROM Button */}
          <button 
            type="button"
            className="mobile-topbar-action-btn load-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Load Custom ROM"
            aria-label="Load Custom ROM"
          >
            <FolderOpen size={16} color="#3b82f6" />
          </button>

          {/* 6. Hamburger Menu Button (Scraper & Factory Reset inside) */}
          <button 
            type="button"
            className={`mobile-topbar-action-btn mobile-menu-trigger-btn ${isHamburgerOpen ? 'is-active' : ''}`}
            onClick={() => {
              setIsHamburgerOpen(prev => !prev);
              sfx?.playTileNav?.();
            }}
            title="Console Utilities & Menu"
            aria-label="Open Utilities Menu"
            style={{ position: 'relative' }}
          >
            {isHamburgerOpen ? <X size={16} /> : <Menu size={16} />}
            {scraper?.isScraping && (
              <span className="mobile-scraper-indicator-dot" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Hamburger Utilities Menu Drawer */}
      {isHamburgerOpen && (
        <div className="mobile-menu-backdrop animate-fade-in" onClick={() => setIsHamburgerOpen(false)}>
          <div className="mobile-menu-drawer animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="mobile-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="mobile-stage-badge" style={{ margin: 0 }}>TOOLS</span>
                <strong style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}>Console Utilities</strong>
              </div>
              <button 
                type="button" 
                className="mobile-gate-close-btn" 
                onClick={() => { setIsHamburgerOpen(false); sfx?.playModalClose?.(); }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="mobile-menu-content">
              {/* Tool 1: Metadata Scraper Studio */}
              {scraper && (
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                      <Sparkles size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Metadata Scraper Studio</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        {scraper.isScraping ? `Scraping in progress: ${scraper.scrapeProgress.current} / ${scraper.scrapeProgress.total} games...` : 'Fetch official covers, metadata & game synopses from Libretro & Wikipedia'}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-menu-card-actions">
                    {scraper.isScraping ? (
                      <button
                        type="button"
                        className="mobile-menu-btn is-danger"
                        onClick={() => {
                          scraper.stopScrape();
                          sfx?.playModalClose?.();
                        }}
                      >
                        <Square size={13} fill="currentColor" />
                        <span>Stop Scraping</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mobile-menu-btn is-primary"
                        onClick={() => {
                          setIsHamburgerOpen(false);
                          if (onOpenScraperModal) {
                            onOpenScraperModal();
                          } else {
                            scraper.scrapeAll(undefined, true);
                          }
                          sfx?.playModalOpen?.();
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Open Scraper Studio</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tool 2: PWA App Install (if available) */}
              {pwa?.canInstall && (
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Download size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Install Web App (PWA)</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>Install to home screen for fullscreen offline play</span>
                    </div>
                  </div>

                  <div className="mobile-menu-card-actions">
                    <button
                      type="button"
                      className="mobile-menu-btn is-success"
                      onClick={() => {
                        setIsHamburgerOpen(false);
                        pwa.promptInstall();
                        sfx?.playThemeSwitch?.();
                      }}
                    >
                      <Download size={14} />
                      <span>Install Retro Player</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tool 3: About & System Info */}
              <div className="mobile-menu-card">
                <div className="mobile-menu-card-header">
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                    <Info size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>About Retro Player</strong>
                      <span className="info-version-badge" style={{ fontSize: '0.68rem', padding: '0.12rem 0.5rem' }}>v1.0.1</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                      Emulation engines, input mappings, and system specifications
                    </span>
                  </div>
                </div>

                <div className="mobile-menu-card-actions">
                  <button
                    type="button"
                    className="mobile-menu-btn is-primary"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      onOpenAboutModal?.();
                      sfx?.playModalOpen?.();
                    }}
                  >
                    <Info size={14} />
                    <span>System Specifications</span>
                  </button>
                </div>
              </div>

              {/* Tool 4: Factory Reset & Wipe Storage */}
              <div className="mobile-menu-card is-danger-card">
                <div className="mobile-menu-card-header">
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                    <RotateCcw size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ef4444' }}>Factory Reset &amp; Clear Data</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>Wipe all local battery saves, custom profiles, and cached media</span>
                  </div>
                </div>

                <div className="mobile-menu-card-actions">
                  <button
                    type="button"
                    className="mobile-menu-btn is-danger"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      setShowResetConfirm(true);
                      sfx?.playModalOpen?.();
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Reset Application</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <h2 className="mobile-systems-title">Choose System</h2>
          </div>
          <div className="mobile-total-games-badge">
            <Gamepad2 size={13} />
            <span>{games.length} Titles</span>
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
            <Layers size={18} color="#e11d48" />
            <div className="mobile-quick-cat-text">
              <strong>All Games</strong>
              <span>{games.length} Titles</span>
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
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <div className="mobile-quick-cat-text">
                <strong>Favorites</strong>
                <span>{favoriteGames.length} Titles</span>
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
              <Clock size={18} color="#10b981" />
              <div className="mobile-quick-cat-text">
                <strong>Recent</strong>
                <span>{recentGames.length} Titles</span>
              </div>
              <ChevronRight size={16} className="mobile-quick-arrow" />
            </button>
          )}
        </div>

        {/* DS Touch Console Cards Grid */}
        <div className="mobile-console-cards-grid">
          {systems.map((sys) => {
            const count = systemGamesMap[sys.key]?.length || 0;
            return (
              <div
                key={sys.key}
                className="mobile-console-card"
                style={{ '--sys-accent': sys.color || '#e11d48' }}
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
                    <Gamepad2 size={42} color={sys.color || '#64748b'} />
                  )}
                </div>

                {/* Info Footer */}
                <div className="mobile-console-card-footer">
                  <div className="mobile-console-text-wrap">
                    <span className="mobile-console-name">{sys.name}</span>
                    <span className="mobile-console-category">{sys.category || 'Console'}</span>
                  </div>
                  <span className="mobile-console-count-pill">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Factory Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Application & Clear Cache?"
        message="This will permanently wipe all browser storage, cached metadata, box art, battery saves, save states, profiles, and service worker caches, then cleanly reload the application. No codebase or server files on disk will be touched."
        confirmLabel="Reset & Reload"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          setShowResetConfirm(false);
          sfx?.playDelete?.();
          await resetEntireApp();
        }}
        onCancel={() => {
          setShowResetConfirm(false);
          sfx?.playModalClose?.();
        }}
        sfx={sfx}
      />
    </div>
  );
}

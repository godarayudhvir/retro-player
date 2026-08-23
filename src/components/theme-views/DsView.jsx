import React, { useRef, useEffect, useState } from 'react';
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
  FileText
} from 'lucide-react';
import QRCode from 'qrcode';
import { resolveAssetPath } from '../../utils/assetPath';
import { getGameDescription, getReleaseDate } from '../../gameDescriptions';
import { saveCachedMetadata } from '../../services/metadataScraper';
import ConfirmModal from '../ConfirmModal';

/**
 * DsView: Nintendo DS / DSi Dual-Screen Touchscreen Firmware Layout.
 * 
 * Features:
 * - Left Side: 3-column beveled square buttons matrix with red focus box
 * - Center: Dual Screen Frame (Top: Snapshot Display; Bottom: Rich Synopsis & Play Button)
 * - Right Side: Integrated Direct Touch Action Stage (Favorite, Guides, Edit, Scrape, Save RAM, Specs)
 * - Zero Popup Dialogs: Strategy guides, metadata editor, and live scraper are fully integrated into the DS right touch panel!
 */
export default function DsView({
  filteredGames = [],
  metadataMap = {},
  focusedTarget,
  setFocusedTarget,
  handleGameSelect,
  isFavorite,
  getGameStats,
  onResetStats,
  onPlayGame,
  onToggleFavorite,
  onEditMetadata,
  onScrapeGame,
  onExportSave,
  onImportSave,
  onDeleteSave,
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

  const meta = selectedMeta || {};
  const rawCover = meta.coverUrl || (selectedGame?.coverUrl && !selectedGame?.coverUrl.endsWith('.svg') ? selectedGame.coverUrl : null);
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const rawScreenshot = meta.screenshotUrl;
  const screenshotSrc = rawScreenshot ? resolveAssetPath(rawScreenshot) : null;

  const description = meta.description || selectedGame?.sidecarMetadata?.description || (selectedGame ? getGameDescription(selectedGame) : '');
  const releaseYear = meta.releaseYear || selectedGame?.sidecarMetadata?.releaseYear || meta.releaseDate?.split('-')[0] || (selectedGame && getReleaseDate(selectedGame) !== '2000-01-01' ? getReleaseDate(selectedGame).split('-')[0] : 'Classic');
  const developer = meta.developer || selectedGame?.sidecarMetadata?.developer || null;
  const publisher = meta.publisher || selectedGame?.sidecarMetadata?.publisher || null;
  const genre = meta.genre || selectedGame?.sidecarMetadata?.genre || 'Retro Classic';

  const [dsTab, setDsTab] = useState('overview'); // 'overview' | 'guides' | 'edit' | 'scrape'
  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveActionStatus, setSaveActionStatus] = useState('');
  
  // Inline DS Strategy Guides QR Companion State
  const [activeQrType, setActiveQrType] = useState(null); // 'written' | 'video' | null
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Inline DS Metadata Editor Form State
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

  const fileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const activeBtnRef = useRef(null);
  const logsEndRef = useRef(null);

  // Walkthrough links from local sidecar metadata or metadataMap
  const walkthrough = selectedGame?.sidecarMetadata?.walkthrough || meta.walkthrough || {};
  const writtenGuideUrl = walkthrough.written || meta.writtenWalkthroughUrl || null;
  const videoGuideUrl = walkthrough.video || meta.videoWalkthroughUrl || null;
  const hasGuides = Boolean(writtenGuideUrl || videoGuideUrl);

  useEffect(() => {
    setDsTab('overview');
    setActiveQrType(null);
    setQrDataUrl('');
    setCopiedLink(false);
    setEditSaveStatus('');
  }, [selectedGame?.id, selectedGame?.title]);

  // Synchronize inline edit form values with currently selected game/meta
  useEffect(() => {
    if (!selectedGame) return;
    setEditTitle(selectedMeta?.title || selectedGame?.title || '');
    setEditYear(selectedMeta?.releaseYear || selectedGame?.sidecarMetadata?.releaseYear || (releaseYear !== 'Classic' ? releaseYear : ''));
    setEditGenre(selectedMeta?.genre || selectedGame?.sidecarMetadata?.genre || (genre !== 'Retro Classic' ? genre : ''));
    setEditDeveloper(selectedMeta?.developer || selectedGame?.sidecarMetadata?.developer || developer || '');
    setEditPublisher(selectedMeta?.publisher || selectedGame?.sidecarMetadata?.publisher || publisher || '');
    setEditDescription(selectedMeta?.description || selectedGame?.sidecarMetadata?.description || description || '');
    setEditWrittenGuide(walkthrough.written || selectedMeta?.writtenWalkthroughUrl || '');
    setEditVideoGuide(walkthrough.video || selectedMeta?.videoWalkthroughUrl || '');
    setEditCoverUrl(selectedMeta?.coverUrl || (selectedGame?.coverUrl && !selectedGame?.coverUrl.endsWith('.svg') ? selectedGame.coverUrl : ''));
  }, [selectedGame?.id, selectedGame?.title, selectedMeta, releaseYear, genre, developer, publisher, description]);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedIndex]);

  const handleManualScrape = async () => {
    if (!selectedGame) return;
    setIsLocalScraping(true);
    sfx?.playThemeSwitch?.();
    let result = null;
    if (onScrapeGame) {
      result = await onScrapeGame(selectedGame, true);
    } else if (scraper?.scrapeSingleGame) {
      result = await scraper.scrapeSingleGame(selectedGame, true);
    }
    if (result) {
      setEditTitle(result.title || selectedGame.title);
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

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!selectedGame || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const id = selectedGame.id || `${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const updatedData = {
        id,
        title: editTitle.trim() || selectedGame.title,
        systemKey: selectedGame.systemKey,
        releaseYear: editYear.trim() || 'Classic',
        releaseDate: editYear.trim() ? `${editYear.trim()}-01-01` : '2000-01-01',
        genre: editGenre.trim() || 'Retro Classic',
        developer: editDeveloper.trim() || selectedGame.systemName || 'Classic',
        publisher: editPublisher.trim() || selectedGame.systemName || 'Classic',
        description: editDescription.trim() || `Experience ${selectedGame.title} on ${selectedGame.systemName}.`,
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

  const handleExportSidecar = () => {
    if (!selectedGame) return;
    const sidecarData = {
      title: editTitle.trim() || selectedGame.title,
      releaseYear: editYear.trim() || (releaseYear !== 'Classic' ? releaseYear : '2000'),
      genre: editGenre.trim() || genre || 'Retro Classic',
      developer: editDeveloper.trim() || developer || selectedGame.systemName || 'Classic',
      publisher: editPublisher.trim() || publisher || selectedGame.systemName || 'Classic',
      description: editDescription.trim() || description || `Experience ${selectedGame.title} on ${selectedGame.systemName}.`,
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

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && selectedGame) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          setEditCoverUrl(dataUrl);
          const id = selectedGame.id || `${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const currentMeta = selectedMeta || {};
          const updated = {
            ...currentMeta,
            id,
            title: editTitle.trim() || currentMeta.title || selectedGame.title,
            systemKey: selectedGame.systemKey,
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

  return (
    <div className="ds-theme-container">
      {/* Left Column: 3-Column Beveled Touchscreen Buttons Matrix */}
      <div className="ds-buttons-pane">
        <div className="ds-buttons-grid">
          {filteredGames.map((game, idx) => {
            const isFocused = focusedTarget.zone === 'grid' && focusedTarget.index === idx;
            const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
            const gameMeta =
              metadataMap[game.id] ||
              metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
            const rawThumb = gameMeta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
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

      {/* Center Column: Dual Screens (Title Card, Cover Top Screen, Desc & Play Button Bottom Screen) */}
      <div className="ds-center-pane">
        {/* Hardware-Grade DS Title Banner Card */}
        <div className="ds-game-title-card">
          <h2 className="ds-game-header-title">
            {selectedGame?.title}
          </h2>
        </div>

        {/* Top Screen: Cover or Gameplay Snapshot */}
        <div className="ds-screen-frame top-screen">
          {coverSrc ? (
            <img src={coverSrc} alt="Game Cover" className="ds-screen-img cover-fit" />
          ) : screenshotSrc ? (
            <img src={screenshotSrc} alt="Gameplay Snapshot" className="ds-screen-img" />
          ) : (
            <div className="ds-screen-placeholder">
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#94a3b8' }}>{selectedGame?.title || 'Nintendo DS'}</span>
            </div>
          )}
        </div>

        {/* Bottom Screen: Description & Big Nintendo Play Button */}
        <div className="ds-screen-frame bottom-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.6rem' }}>
          <div className="ds-synopsis-content" style={{ overflowY: 'auto', flex: 1 }}>
            <p className="ds-synopsis-text">
              {description || 'Touch to launch emulation, inspect metadata, or manage battery save RAM directly.'}
            </p>
          </div>

          {/* Primary Big Nintendo Launch Button */}
          <button
            type="button"
            className="ds-play-now-btn"
            onClick={() => {
              if (onPlayGame && selectedGame) {
                onPlayGame(selectedGame);
              }
            }}
            title={hasSaveData ? 'Continue Game from Saved State' : 'Play Game Immediately'}
            style={{ width: '100%', margin: '0' }}
          >
            <Play size={18} fill="#ffffff" />
            <span>{hasSaveData ? 'CONTINUE / PLAY NOW' : 'PLAY NOW'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Direct Integrated Action Stage, Metadata Badges & Specs */}
      <div className="ds-right-pane">
        {/* Balanced Action Toolbar: Favorite, Guides, Edit, Scrape */}
        <div className="ds-action-toolbar">
          <button
            type="button"
            className={`ds-tool-btn ${selectedFav ? 'is-favorited' : ''}`}
            onClick={() => {
              if (onToggleFavorite && selectedGame) {
                const nextState = onToggleFavorite(selectedGame);
                sfx?.playFavoriteToggle?.(nextState);
              }
            }}
            title={selectedFav ? 'Remove Favorite' : 'Add to Favorites'}
          >
            <Star size={14} fill={selectedFav ? '#f59e0b' : 'none'} color={selectedFav ? '#d97706' : 'currentColor'} />
            <span>{selectedFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          {/* Guides Touch Button (Toggles between Overview and Strategy Guides inside DS pane) */}
          {hasGuides && (
            <button
              type="button"
              className={`ds-tool-btn ds-guide-btn ${dsTab === 'guides' ? 'is-active' : ''}`}
              onClick={() => {
                setDsTab(dsTab === 'guides' ? 'overview' : 'guides');
                sfx?.playTabSwitch?.();
              }}
              title="Toggle Strategy Guides"
            >
              <BookOpen size={14} color="#3b82f6" />
              <span>Guides</span>
            </button>
          )}

          {/* Unified Edit & Scrape Touch Button */}
          <button
            type="button"
            className={`ds-tool-btn ${dsTab === 'manage' ? 'is-active' : ''}`}
            onClick={() => {
              setDsTab(dsTab === 'manage' ? 'overview' : 'manage');
              sfx?.playTabSwitch?.();
            }}
            title="Edit Game Metadata & Scrape Online Studio"
          >
            <Pencil size={14} />
            <span>Edit &amp; Scrape</span>
          </button>
        </div>

        {/* =========================================================================
            VIEW 1: OVERVIEW (Save Data Deck, Playtime Stats, Specs)
            ========================================================================= */}
        {dsTab === 'overview' && (
          <div className="ds-tab-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Save Data Status Notification Banner & 3 Square Action Boxes */}
            {(() => {
              const supportsBattery = selectedGame?.supportsBatterySaves !== false && selectedGame?.systemKey !== 'arcade' && selectedGame?.systemKey !== 'atari2600' && !selectedGame?.systemName?.toLowerCase().includes('arcade') && !selectedGame?.systemName?.toLowerCase().includes('atari 2600');

              if (!supportsBattery) {
                return (
                  <div className="ds-save-section" style={{ display: 'flex', alignItems: 'stretch', gap: '0.4rem', width: '100%' }}>
                    <div className="ds-save-status-badge" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', opacity: 0.75 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Save size={15} color="#94a3b8" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <strong style={{ fontSize: '0.72rem', color: '#64748b' }}>NO BATTERY SAVE REQUIRED</strong>
                          <span style={{ fontSize: '0.64rem', color: '#94a3b8' }}>Arcade session loop (Quick Saves supported)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="ds-save-section" style={{ display: 'flex', alignItems: 'stretch', gap: '0.4rem', width: '100%' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".sav,.srm,.state,.ram,.mcr,application/octet-stream"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && onImportSave && selectedGame) {
                        setSaveActionStatus('Importing...');
                        const success = await onImportSave(file, selectedGame);
                        if (success) {
                          sfx?.playMenuConfirm?.();
                          setSaveActionStatus('Imported!');
                          setTimeout(() => setSaveActionStatus(''), 3000);
                        } else {
                          setSaveActionStatus('Failed');
                          setTimeout(() => setSaveActionStatus(''), 3000);
                        }
                      }
                      e.target.value = '';
                    }}
                  />

                  {/* Main Status Badge on Left */}
                  <div className={`ds-save-status-badge ${hasSaveData ? 'has-save' : ''}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Save size={15} color={hasSaveData ? '#10b981' : '#64748b'} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <strong style={{ fontSize: '0.74rem' }}>{hasSaveData ? 'SAVE DATA DETECTED' : 'NO SAVE DATA FOUND'}</strong>
                        <span style={{ fontSize: '0.66rem', fontWeight: 500 }}>{saveActionStatus || (hasSaveData ? 'Saved battery RAM / state ready' : 'Start fresh or import .sav')}</span>
                      </div>
                    </div>
                    {hasSaveData && <CheckCircle2 size={15} color="#10b981" />}
                  </div>

                  {/* 3 Square Action Boxes */}
                  <div className="save-square-actions" style={{ display: 'flex', gap: '0.3rem' }}>
                    {/* Import */}
                    <button
                      type="button"
                      className="ds-save-square-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      title="Import .sav file"
                      aria-label="Import .sav file"
                    >
                      <Upload size={14} />
                      <span>Import</span>
                    </button>

                    {/* Export */}
                    <button
                      type="button"
                      className={`ds-save-square-btn ${!hasSaveData ? 'is-disabled' : ''}`}
                      disabled={!hasSaveData}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (hasSaveData && onExportSave && selectedGame) {
                          setSaveActionStatus('Exporting...');
                          const success = await onExportSave(selectedGame);
                          if (success) {
                            sfx?.playNotification?.();
                            setSaveActionStatus('Downloaded!');
                            setTimeout(() => setSaveActionStatus(''), 3000);
                          }
                        }
                      }}
                      title={hasSaveData ? 'Export .sav file' : 'No save data to export'}
                      aria-label="Export .sav file"
                    >
                      <Download size={14} />
                      <span>Export</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className={`ds-save-square-btn is-delete ${!hasSaveData ? 'is-disabled' : ''}`}
                      disabled={!hasSaveData}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasSaveData) {
                          setShowDeleteConfirm(true);
                          sfx?.playTileNav?.();
                        }
                      }}
                      title={hasSaveData ? 'Delete save data' : 'No save data to delete'}
                      aria-label="Delete save data"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Playtime & Session Analytics Card */}
            <div className="ds-stats-card">
              <div className="ds-stats-row-3">
                <div className="ds-stat-item">
                  <div className="ds-stat-label-header">
                    <span className="ds-stat-label"><Clock size={11} color="#3b82f6" /> Playtime</span>
                    {onResetStats && (selectedStats?.totalSeconds > 0 || selectedStats?.launchCount > 0) && (
                      <button
                        className="stat-reset-btn"
                        style={{ fontSize: '0.6rem', padding: '1px 4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetStats(selectedGame?.id || selectedGame?.title);
                        }}
                        title="Reset Playtime Stats"
                      >
                        <RotateCcw size={8} /> Reset
                      </button>
                    )}
                  </div>
                  <span className="ds-stat-val">{selectedStats?.playtimeFormatted || '< 1 min'}</span>
                </div>

                <div className="ds-stat-item">
                  <span className="ds-stat-label"><History size={11} color="#10b981" /> Sessions</span>
                  <span className="ds-stat-val">{selectedStats?.launchCount || 0}</span>
                </div>

                <div className="ds-stat-item">
                  <span className="ds-stat-label"><Calendar size={11} color="#f59e0b" /> Last Played</span>
                  <span className="ds-stat-val" style={{ fontSize: '0.78rem' }}>{selectedStats?.lastPlayedFormatted || 'Never'}</span>
                </div>
              </div>
            </div>

            {/* Specs Details Card */}
            <div className="ds-specs-group">
              {genre && (
                <div className="ds-spec-card">
                  <Tag size={12} color="#64748b" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Genre:</span>
                  <strong>{genre}</strong>
                </div>
              )}

              {developer && (
                <div className="ds-spec-card">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Developer:</span>
                  <strong>{developer}</strong>
                </div>
              )}

              {publisher && publisher !== developer && (
                <div className="ds-spec-card">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Publisher:</span>
                  <strong>{publisher}</strong>
                </div>
              )}

              <div className="ds-spec-row-2">
                <div className="ds-spec-card">
                  <Calendar size={12} color="#64748b" />
                  <span>{releaseYear}</span>
                </div>
                <div className="ds-spec-card">
                  <Cpu size={12} color="#64748b" />
                  <span>{selectedGame?.systemCore?.toUpperCase() || 'EMULATORJS'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: NINTENDO DS INTEGRATED STRATEGY GUIDES DECK (NO POPUP)
            ========================================================================= */}
        {dsTab === 'guides' && (
          <div className="ds-tab-pane ds-guides-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="ds-guides-header-bar">
              <button
                type="button"
                className="ds-back-tab-btn"
                onClick={() => {
                  setDsTab('overview');
                  sfx?.playTileNav?.();
                }}
              >
                <ArrowLeft size={13} />
                <span>Back to Info</span>
              </button>
              <span className="ds-guides-title-tag">STRATEGY &amp; GUIDES</span>
            </div>

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

                  {/* Inline DS QR Frame */}
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
                        <span className="ds-qr-hint">Scan with phone camera to read</span>
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

              {/* Channel 2: Video Walkthrough */}
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

                  {/* Inline DS QR Frame */}
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
                        <span className="ds-qr-hint">Scan with phone camera to watch</span>
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

        {/* Hidden permanent Cover Image Uploader input (always mounted) */}
        <input
          type="file"
          ref={coverImageInputRef}
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleCoverUpload}
        />

        {/* =========================================================================
            VIEW 3: UNIFIED NINTENDO DS GAME CUSTOMIZER & SCRAPER STUDIO DECK
            ========================================================================= */}
        {dsTab === 'manage' && (() => {
          const gameLogs = (scraper?.logs || []).filter(l => 
            l.meta?.title === selectedGame?.title || 
            l.meta?.gameId === selectedGame?.id || 
            (selectedGame?.title && l.message?.toLowerCase().includes(selectedGame.title.toLowerCase()))
          );

          return (
            <div className="ds-tab-pane ds-manage-pane animate-fade-in">
              {/* Header Bar */}
              <div className="ds-guides-header-bar">
                <button
                  type="button"
                  className="ds-back-tab-btn"
                  onClick={() => {
                    setDsTab('overview');
                    sfx?.playTileNav?.();
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>Back to Info</span>
                </button>
                <span className="ds-guides-title-tag">EDIT &amp; SCRAPE STUDIO</span>
              </div>

              <form onSubmit={handleSaveEdit} className="ds-inline-form-card">
                {/* Header Game Identity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={15} color="#f59e0b" />
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{selectedGame?.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-sub)' }}>{selectedGame?.systemName}</span>
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
                          {selectedMeta?.hasCustomCover ? 'Custom / Uploaded Cover' : (selectedGame?.hasSidecar ? 'Local Companion Sidecar' : 'Libretro CDN / ScreenScraper')}
                        </span>
                        <div style={{ display: 'flex', gap: '0.45rem' }}>
                          <button
                            type="button"
                            className="ds-inline-btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.64rem' }}
                            onClick={() => coverImageInputRef.current?.click()}
                          >
                            <Upload size={10} />
                            <span>Replace Cover</span>
                          </button>
                        </div>
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
                        <span className="log-msg">{isLocalScraping ? 'Starting network queries...' : 'Ready to search online databases. Click "Re-Fetch Online Data" to query.'}</span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>

                {/* Section 3: Game Metadata Form Fields */}
                <div className="ds-field-group">
                  <label className="ds-field-label">Display Title</label>
                  <input
                    type="text"
                    className="ds-field-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Super Mario Bros"
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

                {/* Plot Synopsis / Overview */}
                <div className="ds-field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="ds-field-label">Plot Synopsis / Overview</label>
                    <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700 }}>
                      Source: {selectedMeta?.source || (selectedGame?.hasSidecar ? 'Local Sidecar' : 'Scraped Cache')}
                    </span>
                  </div>
                  <textarea
                    className="ds-field-textarea"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter game storyline, overview, or synopsis..."
                  />
                </div>

                {/* Custom Cover URL */}
                <div className="ds-field-group">
                  <label className="ds-field-label">Cover Artwork Image URL</label>
                  <input
                    type="text"
                    className="ds-field-input"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                {/* Strategy Guide URLs */}
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
                    <label className="ds-field-label">Video Walkthrough URL</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editVideoGuide}
                      onChange={(e) => setEditVideoGuide(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
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
                    <span>Export Sidecar (.json)</span>
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
          );
        })()}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`Delete Save Data?`}
        message={`Are you sure you want to permanently erase the saved battery RAM and save states for "${selectedGame?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Save"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          if (onDeleteSave && selectedGame) {
            await onDeleteSave(selectedGame);
            sfx?.playDelete?.();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        sfx={sfx}
      />
    </div>
  );
}

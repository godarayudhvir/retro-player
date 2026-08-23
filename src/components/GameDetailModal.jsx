import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Save, 
  Cpu, 
  Calendar, 
  CheckCircle2, 
  Star, 
  Clock, 
  History, 
  RotateCcw, 
  RefreshCw, 
  Tag, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
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
  Layers,
  HardDrive
} from 'lucide-react';
import QRCode from 'qrcode';
import { getGameDescription, getReleaseDate } from '../gameDescriptions';
import { resolveAssetPath } from '../utils/assetPath';
import ConfirmModal from './ConfirmModal';

/**
 * Completely Redesigned Console-Grade Game Detail Modal (Vanilla Theme)
 * Features:
 * - Deluxe 3D Cartridge / Box Art showcase with physical depth and dynamic system color accents
 * - Fully integrated inline Strategy Guides & Walkthroughs Hub (no nested popup modals)
 * - Built-in Phone Companion QR generator with 1-click link copying
 * - Telemetry & In-Game SRAM Battery Save Memory Card suite
 * - 100% spatial gamepad and keyboard navigation (Left/Right, Q/E, A/D, Escape)
 */
export default function GameDetailModal({
  game,
  metadata,
  hasSaveData,
  activeProfileId = 'prof_default',
  isFavorite = false,
  onToggleFavorite,
  onResetStats,
  onScrapeGame,
  onEditMetadata,
  onExportSave,
  onImportSave,
  onDeleteSave,
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'guides' | 'logs'
  const [imgError, setImgError] = useState(false);
  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveActionStatus, setSaveActionStatus] = useState('');
  
  // Inline QR Code State for Strategy Guides
  const [activeQrType, setActiveQrType] = useState(null); // 'written' | 'video' | null
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef(null);
  const logsContainerRef = useRef(null);

  // Reset state on game change
  useEffect(() => {
    setActiveTab('overview');
    setImgError(false);
    setIsLocalScraping(false);
    setActiveQrType(null);
    setQrDataUrl('');
    setCopiedLink(false);
  }, [game?.id, game?.title, game?.coverUrl]);

  // Keyboard navigation for carousel and tab switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') {
        if (activeTab === 'guides' && activeQrType) {
          e.preventDefault();
          setActiveQrType(null);
          sfx?.playTileNav?.();
          return;
        }
        if (hasPrev && onPrevGame) {
          e.preventDefault();
          onPrevGame();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'e' || e.key === 'E' || e.key === 'd' || e.key === 'D') {
        if (hasNext && onNextGame) {
          e.preventDefault();
          onNextGame();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (activeQrType) {
          setActiveQrType(null);
          sfx?.playTileNav?.();
        } else if (activeTab !== 'overview') {
          setActiveTab('overview');
          sfx?.playTileNav?.();
        } else {
          onClose?.();
          sfx?.playModalClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, onPrevGame, onNextGame, activeTab, activeQrType, onClose, sfx]);

  if (!game) return null;

  const meta = metadata || {};
  const rawCover = meta.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const description = meta.description || game.sidecarMetadata?.description || getGameDescription(game);
  const releaseYear = meta.releaseYear || game.sidecarMetadata?.releaseYear || meta.releaseDate?.split('-')[0] || (getReleaseDate(game) !== '2000-01-01' ? getReleaseDate(game).split('-')[0] : 'Classic');
  const developer = meta.developer || game.sidecarMetadata?.developer || game.systemName || 'Classic';
  const publisher = meta.publisher || game.sidecarMetadata?.publisher || game.systemName || 'Classic';
  const genre = meta.genre || game.sidecarMetadata?.genre || 'Retro Classic';

  // Walkthrough links
  const walkthrough = game.sidecarMetadata?.walkthrough || meta.walkthrough || {};
  const writtenGuideUrl = walkthrough.written || meta.writtenWalkthroughUrl || null;
  const videoGuideUrl = walkthrough.video || meta.videoWalkthroughUrl || null;
  const hasGuides = Boolean(writtenGuideUrl || videoGuideUrl);
  const guidesCount = (writtenGuideUrl ? 1 : 0) + (videoGuideUrl ? 1 : 0);

  // Generate QR Code on demand
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
        .catch((err) => console.error('QR Generation Failed', err));
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

  const handleManualScrape = async () => {
    if (onScrapeGame) {
      setActiveTab('logs');
      setIsLocalScraping(true);
      sfx?.playThemeSwitch?.();
      await onScrapeGame(game, true);
      setIsLocalScraping(false);
      setImgError(false);
    }
  };

  const systemColor = game.systemColor || '#ef4444';

  return (
    <div className="vanilla-detail-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="vanilla-detail-dialog animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ '--system-theme-color': systemColor }}
      >
        {/* Left ROM Carousel Arrow */}
        {hasPrev && (
          <button
            className={`vanilla-carousel-arrow arrow-left ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'prevGame' ? 'gamepad-focused' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              sfx?.playTileNav?.();
              onPrevGame?.();
            }}
            title="Previous ROM (Left Arrow / Q)"
            aria-label="Previous ROM"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right ROM Carousel Arrow */}
        {hasNext && (
          <button
            className={`vanilla-carousel-arrow arrow-right ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'nextGame' ? 'gamepad-focused' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              sfx?.playTileNav?.();
              onNextGame?.();
            }}
            title="Next ROM (Right Arrow / E)"
            aria-label="Next ROM"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Modal Close Button */}
        <button
          className="vanilla-detail-close-btn"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Main 2-Column Console Layout */}
        <div className="vanilla-detail-chassis">
          
          {/* =========================================================================
              LEFT PILLAR: 3D Physical Cartridge / Artwork Showcase
              ========================================================================= */}
          <div className="vanilla-detail-art-col">
            <div className="vanilla-cartridge-frame">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className="vanilla-cartridge-cover-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="vanilla-cartridge-fallback">
                  {game.systemIcon && (
                    <img src={resolveAssetPath(game.systemIcon)} alt="" className="vanilla-fallback-icon" />
                  )}
                  <span className="vanilla-fallback-sys">{game.systemName}</span>
                  <span className="vanilla-fallback-name">{game.title}</span>
                </div>
              )}

              {/* Physical Cartridge Gloss Sheen Overlay */}
              <div className="vanilla-cartridge-sheen" />

              {/* Favorite Ribbon */}
              {isFavorite && (
                <div className="vanilla-favorite-ribbon" title="Favorited Game">
                  <Star size={13} fill="#fbbf24" color="#d97706" />
                  <span>FAVORITE</span>
                </div>
              )}
            </div>

            {/* Quick System Tag Below Box Art */}
            <div className="vanilla-art-meta-tag">
              <span className="vanilla-sys-badge" style={{ backgroundColor: systemColor }}>
                {game.systemName}
              </span>
              <span className="vanilla-format-badge">
                {game.filename ? game.filename.split('.').pop()?.toUpperCase() : 'ROM'}
              </span>
            </div>
          </div>

          {/* =========================================================================
              RIGHT PILLAR: Console Hub & Interactive Content Deck
              ========================================================================= */}
          <div className="vanilla-detail-info-col">
            
            {/* Header Metadata Chips */}
            <div className="vanilla-header-chips">
              <span className="vanilla-chip year-chip">
                <Calendar size={13} /> {releaseYear}
              </span>
              <span className="vanilla-chip genre-chip">
                <Tag size={13} /> {genre}
              </span>
              <span className="vanilla-chip core-chip">
                <Cpu size={13} /> {game.systemCore?.toUpperCase() || 'EMULATORJS'}
              </span>
            </div>

            {/* Big Bold Game Title */}
            <h1 className="vanilla-game-title">{game.title}</h1>

            {/* Developer & Publisher Line */}
            <div className="vanilla-credits-line">
              <span className="credit-item"><strong>Developer:</strong> {developer}</span>
              {publisher && publisher !== developer && (
                <span className="credit-item"><strong>Publisher:</strong> {publisher}</span>
              )}
            </div>

            {/* Navigation Tabs Header (Overview | Strategy Guides | Scraper Logs) */}
            <div className="vanilla-tabs-nav">
              <button
                type="button"
                className={`vanilla-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveTab('overview');
                  sfx?.playTabSwitch?.();
                }}
              >
                <span>Overview</span>
              </button>

              {hasGuides && (
                <button
                  type="button"
                  className={`vanilla-tab-btn ${activeTab === 'guides' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveTab('guides');
                    sfx?.playTabSwitch?.();
                  }}
                >
                  <BookOpen size={14} />
                  <span>Strategy &amp; Guides</span>
                </button>
              )}

              {(scraper?.logs?.length > 0 || isLocalScraping) && (
                <button
                  type="button"
                  className={`vanilla-tab-btn ${activeTab === 'logs' ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveTab('logs');
                    sfx?.playTabSwitch?.();
                  }}
                >
                  <Terminal size={14} />
                  <span>Scraper Logs</span>
                </button>
              )}
            </div>

            {/* =========================================================================
                TAB 1: OVERVIEW (Synopsis, Telemetry Stats, Memory Card Save Suite)
                ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="vanilla-tab-content animate-fade-in">
                {/* Synopsis Description */}
                <p className="vanilla-synopsis-text">{description}</p>

                {/* 3-Metric Console Telemetry Deck */}
                <div className="vanilla-telemetry-grid">
                  <div className="vanilla-telemetry-card">
                    <div className="telemetry-icon-box" style={{ color: '#3b82f6' }}>
                      <Clock size={16} />
                    </div>
                    <div className="telemetry-info">
                      <div className="telemetry-header-row">
                        <span className="telemetry-lbl">PLAYTIME</span>
                        {onResetStats && (gameStats.totalSeconds > 0 || gameStats.launchCount > 0) && (
                          <button
                            type="button"
                            className="telemetry-reset-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onResetStats(game.id || game.title);
                              sfx?.playDelete?.();
                            }}
                            title="Reset Playtime"
                          >
                            <RotateCcw size={10} />
                          </button>
                        )}
                      </div>
                      <strong className="telemetry-val">{gameStats.playtimeFormatted || '< 1 min'}</strong>
                    </div>
                  </div>

                  <div className="vanilla-telemetry-card">
                    <div className="telemetry-icon-box" style={{ color: '#10b981' }}>
                      <History size={16} />
                    </div>
                    <div className="telemetry-info">
                      <span className="telemetry-lbl">SESSIONS</span>
                      <strong className="telemetry-val">{gameStats.launchCount || 0} launches</strong>
                    </div>
                  </div>

                  <div className="vanilla-telemetry-card">
                    <div className="telemetry-icon-box" style={{ color: '#f59e0b' }}>
                      <Calendar size={16} />
                    </div>
                    <div className="telemetry-info">
                      <span className="telemetry-lbl">LAST ACTIVE</span>
                      <strong className="telemetry-val">{gameStats.lastPlayedFormatted || 'Never'}</strong>
                    </div>
                  </div>
                </div>

                {/* In-Game Battery Save Memory Card Suite */}
                {(() => {
                  const supportsBattery = game?.supportsBatterySaves !== false && game?.systemKey !== 'arcade' && game?.systemKey !== 'atari2600' && !game?.systemName?.toLowerCase().includes('arcade') && !game?.systemName?.toLowerCase().includes('atari 2600');

                  if (!supportsBattery) {
                    return (
                      <div className="vanilla-memory-card no-battery">
                        <HardDrive size={16} color="#94a3b8" />
                        <div className="memory-card-info">
                          <strong>SESSION LOOP (NO BATTERY SRAM REQUIRED)</strong>
                          <span>Quick saves &amp; live snapshots supported in-game</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="vanilla-memory-card-wrapper">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".sav,.srm,.state,.ram,.mcr,application/octet-stream"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && onImportSave) {
                            setSaveActionStatus('Importing save...');
                            const success = await onImportSave(file, game);
                            if (success) {
                              sfx?.playMenuConfirm?.();
                              setSaveActionStatus('Save imported!');
                              setTimeout(() => setSaveActionStatus(''), 3000);
                            } else {
                              setSaveActionStatus('Import failed');
                              setTimeout(() => setSaveActionStatus(''), 3000);
                            }
                          }
                          e.target.value = '';
                        }}
                      />

                      <div className={`vanilla-memory-status ${hasSaveData ? 'is-saved' : 'is-fresh'}`}>
                        <div className="memory-status-left">
                          <div className="memory-led" />
                          <div className="memory-status-text">
                            <strong>{hasSaveData ? 'BATTERY SAVE DETECTED' : 'NO BATTERY SAVE FOUND'}</strong>
                            <span>{saveActionStatus || (hasSaveData ? 'Persistent SRAM ready to resume' : 'Start fresh session or import existing .sav')}</span>
                          </div>
                        </div>
                        {hasSaveData && <CheckCircle2 size={16} color="#10b981" />}
                      </div>

                      <div className="vanilla-memory-actions">
                        <button
                          type="button"
                          className="memory-action-btn"
                          onClick={() => fileInputRef.current?.click()}
                          title="Import .sav file"
                        >
                          <Upload size={13} />
                          <span>Import</span>
                        </button>

                        <button
                          type="button"
                          className={`memory-action-btn ${!hasSaveData ? 'is-disabled' : ''}`}
                          disabled={!hasSaveData}
                          onClick={async () => {
                            if (hasSaveData && onExportSave) {
                              setSaveActionStatus('Exporting save...');
                              const success = await onExportSave(game);
                              if (success) {
                                sfx?.playNotification?.();
                                setSaveActionStatus('Save downloaded!');
                                setTimeout(() => setSaveActionStatus(''), 3000);
                              }
                            }
                          }}
                          title={hasSaveData ? 'Export .sav file' : 'No save data to export'}
                        >
                          <Download size={13} />
                          <span>Export</span>
                        </button>

                        <button
                          type="button"
                          className={`memory-action-btn is-delete ${!hasSaveData ? 'is-disabled' : ''}`}
                          disabled={!hasSaveData}
                          onClick={() => {
                            if (hasSaveData) {
                              setShowDeleteConfirm(true);
                              sfx?.playTileNav?.();
                            }
                          }}
                          title={hasSaveData ? 'Delete save data' : 'No save data to delete'}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* =========================================================================
                TAB 2: INTEGRATED STRATEGY GUIDES & WALKTHROUGHS HUB
                ========================================================================= */}
            {activeTab === 'guides' && (
              <div className="vanilla-tab-content vanilla-guides-hub-panel animate-fade-in">
                <div className="guides-channel-list">
                  {/* Channel 1: Written Strategy Guide */}
                  {writtenGuideUrl && (
                    <div className={`guide-item-card ${activeQrType === 'written' ? 'qr-expanded' : ''}`}>
                      <div className="guide-item-main">
                        <div className="guide-item-icon-box written">
                          <BookOpen size={18} />
                        </div>
                        <div className="guide-item-meta">
                          <div className="guide-item-title-row">
                            <strong className="guide-item-title">Written Strategy Guide</strong>
                            <span className="guide-domain-tag">{getDomain(writtenGuideUrl)}</span>
                          </div>
                          <span className="guide-item-desc">Step-by-step walkthroughs, maps &amp; checklists</span>
                        </div>
                        <div className="guide-item-actions">
                          <button
                            type="button"
                            className="guide-primary-btn"
                            onClick={() => window.open(writtenGuideUrl, '_blank', 'noopener,noreferrer')}
                            title="Open Guide in Browser Tab"
                          >
                            <Globe size={13} />
                            <span>Open Guide</span>
                            <ExternalLink size={12} />
                          </button>
                          <button
                            type="button"
                            className={`guide-qr-toggle-btn ${activeQrType === 'written' ? 'is-active' : ''}`}
                            onClick={() => handleToggleQr('written', writtenGuideUrl)}
                            title="Show Mobile Companion QR Code"
                          >
                            <Smartphone size={13} />
                            <span>{activeQrType === 'written' ? 'Hide QR' : 'Phone QR'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Inline QR Companion Frame */}
                      {activeQrType === 'written' && (
                        <div className="guide-inline-qr-drawer animate-fade-in">
                          <div className="inline-qr-box">
                            {qrDataUrl ? (
                              <img src={qrDataUrl} alt="Strategy Guide QR" className="inline-qr-img" />
                            ) : (
                              <div className="inline-qr-loading">Generating QR...</div>
                            )}
                          </div>
                          <div className="inline-qr-meta">
                            <span className="inline-qr-heading">📱 READ ON MOBILE COMPANION</span>
                            <p>Scan this QR code with your phone's camera to read the guide while playing on PC or TV.</p>
                            <button
                              type="button"
                              className="inline-copy-btn"
                              onClick={() => handleCopyLink(writtenGuideUrl)}
                            >
                              {copiedLink ? <Check size={13} color="#10b981" /> : <ExternalLink size={13} />}
                              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Channel 2: Video Walkthrough */}
                  {videoGuideUrl && (
                    <div className={`guide-item-card ${activeQrType === 'video' ? 'qr-expanded' : ''}`}>
                      <div className="guide-item-main">
                        <div className="guide-item-icon-box video">
                          <Tv size={18} />
                        </div>
                        <div className="guide-item-meta">
                          <div className="guide-item-title-row">
                            <strong className="guide-item-title">Video Playthrough &amp; Longplay</strong>
                            <span className="guide-domain-tag">{getDomain(videoGuideUrl)}</span>
                          </div>
                          <span className="guide-item-desc">Full video walkthrough playlist &amp; secret guides</span>
                        </div>
                        <div className="guide-item-actions">
                          <button
                            type="button"
                            className="guide-primary-btn video"
                            onClick={() => window.open(videoGuideUrl, '_blank', 'noopener,noreferrer')}
                            title="Watch Video Playthrough in New Tab"
                          >
                            <Globe size={13} />
                            <span>Watch Video</span>
                            <ExternalLink size={12} />
                          </button>
                          <button
                            type="button"
                            className={`guide-qr-toggle-btn ${activeQrType === 'video' ? 'is-active' : ''}`}
                            onClick={() => handleToggleQr('video', videoGuideUrl)}
                            title="Show Mobile Companion QR Code"
                          >
                            <Smartphone size={13} />
                            <span>{activeQrType === 'video' ? 'Hide QR' : 'Phone QR'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Inline QR Companion Frame */}
                      {activeQrType === 'video' && (
                        <div className="guide-inline-qr-drawer animate-fade-in">
                          <div className="inline-qr-box">
                            {qrDataUrl ? (
                              <img src={qrDataUrl} alt="Video Walkthrough QR" className="inline-qr-img" />
                            ) : (
                              <div className="inline-qr-loading">Generating QR...</div>
                            )}
                          </div>
                          <div className="inline-qr-meta">
                            <span className="inline-qr-heading">📱 WATCH ON MOBILE COMPANION</span>
                            <p>Scan this QR code with your phone's camera to watch the video walkthrough while playing on PC or TV.</p>
                            <button
                              type="button"
                              className="inline-copy-btn"
                              onClick={() => handleCopyLink(videoGuideUrl)}
                            >
                              {copiedLink ? <Check size={13} color="#10b981" /> : <ExternalLink size={13} />}
                              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: SCRAPER LOGS TERMINAL
                ========================================================================= */}
            {activeTab === 'logs' && (
              <div className="vanilla-tab-content vanilla-logs-terminal-panel animate-fade-in">
                <div className="terminal-header-strip">
                  <div className="terminal-title">
                    <Terminal size={14} color="#3b82f6" />
                    <span>Real-Time Scraper Console</span>
                  </div>
                  {isLocalScraping && <span className="terminal-scanning-pill">SCRAPING...</span>}
                </div>
                <div className="terminal-logs-window" ref={logsContainerRef}>
                  {(() => {
                    const gameLogs = (scraper?.logs || []).filter(l => 
                      l.title === game.title || 
                      l.gameId === game.id || 
                      (l.message && l.message.includes(`"${game.title}"`))
                    );

                    if (gameLogs.length === 0) {
                      return (
                        <div className="terminal-empty-msg">
                          <span>{isLocalScraping ? `Scraping artwork & metadata for "${game.title}"...` : `No scraper activity logs recorded yet. Click Re-scrape to fetch latest metadata.`}</span>
                        </div>
                      );
                    }

                    return gameLogs.map((log) => (
                      <div key={log.id} className={`terminal-log-row log-${log.type}`}>
                        <span className="terminal-log-time">[{log.time}]</span>
                        <span className="terminal-log-text">{log.message}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* =========================================================================
                BOTTOM CONSOLE ACTION TOOLBAR
                ========================================================================= */}
            <div className="vanilla-detail-actions-stage">
              {/* Primary Action Button (Play Now / Resume) */}
              <button
                type="button"
                className={`vanilla-play-btn ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'play' ? 'gamepad-focused' : ''}`}
                onClick={onPlay}
              >
                <Play size={20} fill="#ffffff" />
                <span>{hasSaveData ? 'CONTINUE / PLAY NOW' : 'PLAY NOW'}</span>
              </button>

              {/* Favorite Toggle Button */}
              <button
                type="button"
                className={`vanilla-tool-btn ${isFavorite ? 'is-fav' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'fav' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  if (onToggleFavorite) {
                    const nextState = onToggleFavorite(game);
                    sfx?.playFavoriteToggle?.(nextState);
                  }
                }}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Star size={18} fill={isFavorite ? '#fbbf24' : 'none'} color={isFavorite ? '#f59e0b' : 'currentColor'} />
              </button>

              {/* Edit Metadata Button (Jellyfin Style) */}
              <button
                type="button"
                className={`vanilla-tool-btn ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'editMeta' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  sfx?.playThemeSwitch?.();
                  if (onEditMetadata) onEditMetadata(game, meta);
                }}
                title="Edit Game Metadata & Cover Art"
              >
                <Pencil size={17} />
              </button>

              {/* Scrape Online Metadata Button */}
              <button
                type="button"
                className={`vanilla-tool-btn ${isLocalScraping || isScraping ? 'is-spinning' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'scrape' ? 'gamepad-focused' : ''}`}
                onClick={handleManualScrape}
                disabled={isLocalScraping || isScraping}
                title="Re-scrape 3D Box Art & Online Overview"
              >
                <RefreshCw size={17} className={isLocalScraping ? 'spin' : ''} />
              </button>
            </div>

          </div>
        </div>

        {/* Delete Save Confirmation Dialog */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title={`Delete Save Data?`}
          message={`Are you sure you want to permanently erase the saved battery RAM and save states for "${game.title}"? This action cannot be undone.`}
          confirmLabel="Delete Save"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={async () => {
            setShowDeleteConfirm(false);
            if (onDeleteSave) {
              await onDeleteSave(game);
              sfx?.playDelete?.();
            }
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          sfx={sfx}
        />
      </div>
    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { Play, Star, Pencil, RefreshCw, Clock, History, Calendar, Cpu, Tag, Save, CheckCircle2, RotateCcw, Download, Upload, Trash2, BookOpen, Tv } from 'lucide-react';
import { resolveAssetPath } from '../../utils/assetPath';
import { getGameDescription, getReleaseDate } from '../../gameDescriptions';
import ConfirmModal from '../ConfirmModal';
import GuideModal from '../GuideModal';

/**
 * DsView: Nintendo DS / DSi Dual-Screen Touchscreen Firmware Layout.
 * 
 * Features:
 * - Left Side: 3-column beveled square buttons matrix with red focus box
 * - Center: Dual Screen Frame (Top: Snapshot Display; Bottom: Rich Synopsis & Save Status)
 * - Right Side: Integrated Direct Action Stage (Play Now button, Favorite, Edit, Re-scrape, Stats & Specs)
 * - 100% consistent information headers, metadata badges, analytics, and actions with Vanilla theme.
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

  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveActionStatus, setSaveActionStatus] = useState('');
  const [activeGuide, setActiveGuide] = useState(null); // { type: 'written' | 'video', url: string }
  const fileInputRef = useRef(null);
  const activeBtnRef = useRef(null);

  // Walkthrough links from local sidecar metadata or metadataMap
  const walkthrough = selectedGame?.sidecarMetadata?.walkthrough || meta.walkthrough || {};
  const writtenGuideUrl = walkthrough.written || meta.writtenWalkthroughUrl || null;
  const videoGuideUrl = walkthrough.video || meta.videoWalkthroughUrl || null;

  useEffect(() => {
    setActiveGuide(null);
  }, [selectedGame?.id, selectedGame?.title]);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedIndex]);

  const handleManualScrape = async () => {
    if (onScrapeGame && selectedGame) {
      setIsLocalScraping(true);
      sfx?.playThemeSwitch?.();
      await onScrapeGame(selectedGame, true);
      setIsLocalScraping(false);
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
        {/* Action Toolbar: Favorite, Edit, Scrape, Walkthroughs */}
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
            <Star size={15} fill={selectedFav ? '#f59e0b' : 'none'} color={selectedFav ? '#d97706' : 'currentColor'} />
            <span>{selectedFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          {/* Written Walkthrough Touch Button */}
          {writtenGuideUrl && (
            <button
              type="button"
              className="ds-tool-btn ds-guide-btn"
              onClick={() => {
                sfx?.playTileNav?.();
                setActiveGuide({ type: 'written', url: writtenGuideUrl });
              }}
              title="Read Written Strategy Guide"
            >
              <BookOpen size={14} color="#3b82f6" />
              <span>Guide</span>
            </button>
          )}

          {/* Video Walkthrough Touch Button */}
          {videoGuideUrl && (
            <button
              type="button"
              className="ds-tool-btn ds-guide-btn"
              onClick={() => {
                sfx?.playTileNav?.();
                setActiveGuide({ type: 'video', url: videoGuideUrl });
              }}
              title="Watch Video Playthrough"
            >
              <Tv size={14} color="#10b981" />
              <span>Video</span>
            </button>
          )}

          <button
            type="button"
            className="ds-tool-btn"
            onClick={() => {
              if (onEditMetadata && selectedGame) {
                onEditMetadata(selectedGame, selectedMeta);
                sfx?.playModalOpen?.();
              }
            }}
            title="Edit Game Metadata"
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className={`ds-tool-btn ${isLocalScraping ? 'is-scraping' : ''}`}
            onClick={handleManualScrape}
            disabled={isLocalScraping}
            title="Fetch Live Box Art & Metadata"
          >
            <RefreshCw size={14} className={isLocalScraping ? 'spin' : ''} />
            <span>Scrape</span>
          </button>
        </div>

        {/* DS In-App Guide Choice & QR Modal */}
        <GuideModal
          isOpen={!!activeGuide}
          gameTitle={selectedGame?.title}
          guideType={activeGuide?.type || 'written'}
          guideUrl={activeGuide?.url}
          onClose={() => setActiveGuide(null)}
          sfx={sfx}
        />

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

        {/* Playtime & Session Analytics Card matching Vanilla's 3-column stats */}
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
    </div>
  );
}

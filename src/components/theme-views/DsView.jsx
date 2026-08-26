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
  FileText,
  Grid,
  LayoutGrid,
  Maximize2,
  Minimize2,
  SlidersHorizontal
} from 'lucide-react';
import QRCode from 'qrcode';
import { resolveAssetPath } from '../../utils/assetPath';
import { getGameDescription, getReleaseDate } from '../../gameDescriptions';
import { saveCachedMetadata } from '../../services/metadataScraper';
import { convertRemoteImageToWebpDataUrl } from '../../utils/imageConverter';
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
  onExportBatterySave,
  onExportQuickSave,
  onImportSave,
  onDeleteSave,
  onDeleteGame,
  hasSaveData,
  scraper,
  sfx,
  gamepadConnected = false
}) {
  const lastGridIndexRef = useRef(0);
  const fileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const sidecarInputRef = useRef(null);
  const activeBtnRef = useRef(null);
  const logsEndRef = useRef(null);

  const [dsTab, setDsTab] = useState('overview'); // 'overview' | 'guides' | 'edit' | 'scrape'
  const [isLocalScraping, setIsLocalScraping] = useState(false);
  const [saveActionStatus, setSaveActionStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Density & View Expansion State (stored in localStorage)
  const [gridDensity, setGridDensity] = useState(() => {
    try {
      return localStorage.getItem('retro_ds_grid_density') || '3';
    } catch {
      return '3';
    }
  });
  const [isWideGrid, setIsWideGrid] = useState(() => {
    try {
      return localStorage.getItem('retro_ds_wide_grid') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleDensity = () => {
    setGridDensity(prev => {
      let next;
      if (isWideGrid) {
        // Wide Mode sequence: S -> M -> L -> XL -> XXL -> S
        const order = ['5', '4', '3', 'xl', 'xxl'];
        const curIdx = order.indexOf(prev);
        next = curIdx >= 0 ? order[(curIdx + 1) % order.length] : '4';
      } else {
        // Split Dual-Screen Mode sequence: S ('5') -> M ('4') -> L ('3') -> S
        next = prev === '5' ? '4' : prev === '4' ? '3' : '5';
      }
      try {
        localStorage.setItem('retro_ds_grid_density', next);
      } catch {}
      sfx?.playTileNav?.();
      return next;
    });
  };

  const handleToggleWideGrid = () => {
    setIsWideGrid(prev => {
      const next = !prev;
      try {
        localStorage.setItem('retro_ds_wide_grid', String(next));
      } catch {}
      sfx?.playTabSwitch?.();
      return next;
    });
  };
  
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

  if (focusedTarget?.zone === 'grid' && typeof focusedTarget.index === 'number') {
    lastGridIndexRef.current = focusedTarget.index;
  }
  const focusedIndex = lastGridIndexRef.current >= 0 && lastGridIndexRef.current < filteredGames.length ? lastGridIndexRef.current : 0;
  const selectedGame = filteredGames[focusedIndex] || filteredGames[0];
  const selectedMeta = selectedGame ? (
    metadataMap[selectedGame.id] ||
    metadataMap[`${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')]
  ) : null;
  const selectedStats = selectedGame && getGameStats ? getGameStats(selectedGame.id || selectedGame.title) : null;
  const selectedFav = selectedGame && isFavorite ? isFavorite(selectedGame.id || selectedGame.title) : false;

  const meta = selectedMeta || {};
  const rawCover = (dsTab === 'manage' && editCoverUrl) ? editCoverUrl : (meta.coverUrl || (selectedGame?.coverUrl && !selectedGame?.coverUrl.endsWith('.svg') ? selectedGame.coverUrl : null));
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const rawScreenshot = meta.screenshotUrl;
  const screenshotSrc = rawScreenshot ? resolveAssetPath(rawScreenshot) : null;

  const description = meta.description || selectedGame?.sidecarMetadata?.description || (selectedGame ? getGameDescription(selectedGame) : '');
  const releaseYear = meta.releaseYear || selectedGame?.sidecarMetadata?.releaseYear || meta.releaseDate?.split('-')[0] || (selectedGame && getReleaseDate(selectedGame) !== '2000-01-01' ? getReleaseDate(selectedGame).split('-')[0] : null);
  
  const rawDeveloper = meta.developer || selectedGame?.sidecarMetadata?.developer || null;
  const rawPublisher = meta.publisher || selectedGame?.sidecarMetadata?.publisher || null;
  const rawGenre = meta.genre || selectedGame?.sidecarMetadata?.genre || null;

  const isDummyName = (str) => !str || str === 'Classic' || str === selectedGame?.systemName || str === selectedGame?.systemKey || str === 'Game Boy' || str === 'Game Boy Advance' || str === 'Game Boy Color' || str === 'Nintendo DS' || str === 'Super Nintendo' || str === 'Nintendo (NES)' || str === 'Nintendo 64' || str === 'Sega Genesis' || str === 'Sega Game Gear' || str === 'Sony PlayStation' || str === 'Arcade' || str === 'Atari 2600';
  const developer = isDummyName(rawDeveloper) ? null : rawDeveloper;
  const publisher = isDummyName(rawPublisher) ? null : rawPublisher;
  const genre = (!rawGenre || rawGenre === 'Retro Classic') ? null : rawGenre;

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

  // Instant gamepad tab switching: change active panel automatically as focus lands on toolbar buttons
  useEffect(() => {
    if (focusedTarget?.zone !== 'cardModal') return;
    if (focusedTarget.id === 'fav') {
      setDsTab('overview');
    } else if (focusedTarget.id === 'save') {
      setDsTab('save');
    } else if (focusedTarget.id === 'guides') {
      setDsTab('guides');
    } else if (focusedTarget.id === 'edit') {
      setDsTab('manage');
    }
  }, [focusedTarget?.zone, focusedTarget?.id]);

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
      let finalCoverUrl = editCoverUrl.trim() || null;
      let diskSaved = false;

      const walkthroughObj = (editWrittenGuide.trim() || editVideoGuide.trim()) ? {
        ...(editWrittenGuide.trim() ? { written: editWrittenGuide.trim() } : {}),
        ...(editVideoGuide.trim() ? { video: editVideoGuide.trim() } : {})
      } : undefined;

      // Convert remote URLs to WebP Data URL for disk persistence
      let payloadCoverDataUrl = editCoverUrl.startsWith('data:image/') ? editCoverUrl : null;
      if (!payloadCoverDataUrl && editCoverUrl && (editCoverUrl.startsWith('http://') || editCoverUrl.startsWith('https://'))) {
        try {
          const converted = await convertRemoteImageToWebpDataUrl(editCoverUrl);
          if (converted && converted.startsWith('data:image/')) {
            payloadCoverDataUrl = converted;
          }
        } catch (_) {}
      }

      // Try saving directly to disk backend via /api/metadata/save-sidecar
      try {
        const res = await fetch('/api/metadata/save-sidecar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: id,
            systemKey: selectedGame.systemKey,
            romPath: selectedGame.romUrl || selectedGame.url,
            title: editTitle.trim() || selectedGame.title,
            description: editDescription.trim(),
            releaseYear: editYear.trim(),
            developer: editDeveloper.trim() || selectedGame.systemName,
            publisher: editPublisher.trim() || selectedGame.systemName,
            genre: editGenre.trim() || 'Retro Classic',
            walkthrough: walkthroughObj,
            coverDataUrl: payloadCoverDataUrl,
            coverUrl: !payloadCoverDataUrl ? editCoverUrl : null
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            diskSaved = true;
            if (result.savedCoverUrl) {
              finalCoverUrl = result.savedCoverUrl;
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend disk write unavailable, saving to IndexedDB:', backendErr);
      }

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
        coverUrl: finalCoverUrl,
        hasCustomCover: Boolean(finalCoverUrl),
        walkthrough: walkthroughObj,
        writtenWalkthroughUrl: editWrittenGuide.trim() || undefined,
        videoWalkthroughUrl: editVideoGuide.trim() || undefined,
        isManualOverride: true,
        source: diskSaved ? 'Local Sidecar (Disk)' : 'Manual Edit',
        scrapedAt: new Date().toISOString()
      };

      await saveCachedMetadata(id, updatedData);
      scraper?.updateLocalMetadata?.(id, updatedData);
      sfx?.playMenuConfirm?.();
      setEditSaveStatus(diskSaved ? 'Saved to Server Disk & Sidecar!' : 'Saved to Browser Storage!');
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

  const handleImportSidecar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result || '{}');
        if (json.title) setEditTitle(json.title);
        if (json.year || json.releaseYear) setEditYear(json.year || json.releaseYear);
        if (json.genre) setEditGenre(json.genre);
        if (json.developer) setEditDeveloper(json.developer);
        if (json.publisher) setEditPublisher(json.publisher);
        if (json.description) setEditDescription(json.description);
        if (json.cover) setEditCoverUrl(json.cover);
        if (json.walkthrough?.written || json.writtenWalkthroughUrl) setEditWrittenGuide(json.walkthrough?.written || json.writtenWalkthroughUrl);
        if (json.walkthrough?.video || json.videoWalkthroughUrl) setEditVideoGuide(json.walkthrough?.video || json.videoWalkthroughUrl);
        sfx?.playNotification?.();
        setEditSaveStatus('Imported Sidecar Data!');
        setTimeout(() => setEditSaveStatus(''), 2500);
      } catch (err) {
        console.error('Failed to parse sidecar JSON:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmDeleteGame = async () => {
    if (!selectedGame || !onDeleteGame) return;
    setIsDeleting(true);
    try {
      const success = await onDeleteGame(selectedGame);
      if (success) {
        sfx?.playMenuConfirm?.();
        setShowDeleteConfirm(false);
        setDsTab('overview');
      }
    } catch (err) {
      console.error('Failed to delete game:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGame) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;

      // 1. Instantly update local preview
      setEditCoverUrl(dataUrl);

      const id = selectedGame.id || `${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const currentMeta = selectedMeta || {};
      let finalCover = dataUrl;
      let diskSaved = false;

      // 2. Persist directly to host disk sidecar
      try {
        const res = await fetch('/api/metadata/save-sidecar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: id,
            systemKey: selectedGame.systemKey,
            romPath: selectedGame.romUrl || selectedGame.url,
            title: editTitle.trim() || currentMeta.title || selectedGame.title,
            description: editDescription.trim(),
            releaseYear: editYear.trim(),
            developer: editDeveloper.trim() || selectedGame.systemName,
            publisher: editPublisher.trim() || selectedGame.systemName,
            genre: editGenre.trim() || 'Retro Classic',
            coverDataUrl: dataUrl
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            diskSaved = true;
            if (resData.savedCoverUrl) {
              finalCover = `${resData.savedCoverUrl}?t=${Date.now()}`;
              setEditCoverUrl(finalCover);
            }
          }
        }
      } catch (err) {
        console.warn('Cover upload backend write err:', err);
      }

      // 3. Save to database and cache
      const updated = {
        ...currentMeta,
        id,
        title: editTitle.trim() || currentMeta.title || selectedGame.title,
        systemKey: selectedGame.systemKey,
        coverUrl: finalCover,
        hasCustomCover: true,
        isManualOverride: true,
        source: diskSaved ? 'Local Sidecar (Disk)' : 'Manual Edit',
        scrapedAt: new Date().toISOString()
      };
      await saveCachedMetadata(id, updated);
      scraper?.updateLocalMetadata?.(id, updated);
      sfx?.playNotification?.();
      setEditSaveStatus(diskSaved ? 'Cover Uploaded & Saved!' : 'Cover Saved in Browser!');
      setTimeout(() => setEditSaveStatus(''), 2000);
    };

    reader.onerror = (err) => {
      console.error('Failed reading selected image file:', err);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteCover = async () => {
    if (!selectedGame) return;
    setEditCoverUrl('');
    const id = selectedGame.id || `${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const updatedData = {
      ...(selectedMeta || {}),
      id,
      title: editTitle.trim() || selectedGame.title,
      systemKey: selectedGame.systemKey,
      coverUrl: null,
      hasCustomCover: false,
      isManualOverride: true,
      scrapedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/metadata/save-sidecar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          title: editTitle.trim() || selectedGame.title,
          systemKey: selectedGame.systemKey,
          romPath: selectedGame.romUrl,
          deleteCover: true
        })
      }).catch(() => {});
    } catch (_) {}

    await saveCachedMetadata(id, updatedData);
    scraper?.updateLocalMetadata?.(id, updatedData);
    sfx?.playDelete?.();
    setEditSaveStatus('Cover Deleted!');
    setTimeout(() => setEditSaveStatus(''), 2000);
  };

  const handleDeleteMetadata = async () => {
    if (!selectedGame) return;
    const id = selectedGame.id || `${selectedGame.systemKey}-${selectedGame.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // 1. Reset all fields to clean defaults
    setEditTitle(selectedGame.rawTitle || selectedGame.title);
    setEditYear('');
    setEditGenre('');
    setEditDeveloper('');
    setEditPublisher('');
    setEditDescription('');
    setEditCoverUrl('');
    setEditWrittenGuide('');
    setEditVideoGuide('');
    
    // 2. Delete sidecar on backend disk
    try {
      await fetch('/api/metadata/delete-sidecar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          systemKey: selectedGame.systemKey,
          romPath: selectedGame.romUrl,
          title: selectedGame.title
        })
      }).catch(() => {});
    } catch (_) {}

    // 3. Clear IndexedDB / Server DB and update local cache
    await deleteManualMetadata(id);
    scraper?.updateLocalMetadata?.(id, null);
    scraper?.clearLogs?.();
    sfx?.playDelete?.();
    setEditSaveStatus('Metadata Deleted & Reset!');
    setTimeout(() => setEditSaveStatus(''), 2000);
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
    <div className={`ds-theme-container ${isWideGrid ? 'ds-wide-grid-layout' : ''}`}>
      {/* Left Column: ROMs Matrix with Density & Panoramic View Switcher */}
      <div className="ds-buttons-pane">
        {/* ROM Rail Top Header Control Bar */}
        <div className="ds-rail-header">
          <span className="ds-rail-count-badge">
            {filteredGames.length} {filteredGames.length === 1 ? 'Game' : 'Games'}
          </span>
          <div className="ds-rail-controls">
            <button
              type="button"
              className={`ds-rail-action-btn ${focusedTarget?.zone === 'railHeader' && focusedTarget?.id === 'size' ? 'gamepad-focused' : ''}`}
              onClick={handleToggleDensity}
              title={`Tile Size: ${
                gridDensity === '5' ? 'Small (S)' :
                gridDensity === '4' ? 'Medium (M)' :
                gridDensity === '3' ? 'Large (L)' :
                gridDensity === 'xl' ? 'Extra Large (XL)' :
                gridDensity === 'xxl' ? 'Giant (XXL)' : 'Medium (M)'
              } - Click to cycle (Shortcut: L3)`}
              aria-label="Toggle Tile Size"
            >
              <SlidersHorizontal size={13} />
              <span>
                {
                  gridDensity === '5' ? 'S' :
                  gridDensity === '4' ? 'M' :
                  gridDensity === '3' ? 'L' :
                  gridDensity === 'xl' ? 'XL' :
                  gridDensity === 'xxl' ? 'XXL' : 'M'
                }
              </span>
            </button>
            <button
              type="button"
              className={`ds-rail-action-btn ${isWideGrid ? 'is-active-wide' : ''} ${focusedTarget?.zone === 'railHeader' && focusedTarget?.id === 'wide' ? 'gamepad-focused' : ''}`}
              onClick={handleToggleWideGrid}
              title={`${isWideGrid ? 'Collapse to Split Dual-Screen Mode' : 'Expand to Full-Width ROMs Wall'} (Shortcut: R3)`}
              aria-label="Toggle Full-Width ROMs Wall"
            >
              {isWideGrid ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isWideGrid ? 'Dual Screen' : 'Wide Grid'}</span>
            </button>
          </div>
        </div>

        <div className="ds-buttons-scroll-area">
          <div className={`ds-buttons-grid ds-density-${gridDensity} ${isWideGrid ? 'is-wide' : ''}`}>
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
                    if (isWideGrid) {
                      setIsWideGrid(false);
                      try {
                        localStorage.setItem('retro_ds_wide_grid', 'false');
                      } catch {}
                      sfx?.playTabSwitch?.();
                    }
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
            className={`ds-play-now-btn ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'play' ? 'gamepad-focused' : ''}`}
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
        {/* Balanced Action Toolbar: Favorite, Save Data, Guides, Edit & Scrape */}
        <div className="ds-action-toolbar">
          {/* Favorite */}
          <button
            type="button"
            className={`ds-tool-btn ds-icon-btn ${selectedFav ? 'is-favorited' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'fav' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              if (onToggleFavorite && selectedGame) {
                const nextState = onToggleFavorite(selectedGame);
                sfx?.playFavoriteToggle?.(nextState);
              }
            }}
            title={selectedFav ? 'Favorited (Click to remove / SELECT)' : 'Add to Favorites (SELECT)'}
            aria-label={selectedFav ? 'Remove Favorite' : 'Add to Favorites'}
          >
            <Star size={16} fill={selectedFav ? '#f59e0b' : 'none'} color={selectedFav ? '#d97706' : 'currentColor'} />
          </button>

          {/* Dedicated In-Game Save Data Touch Tab (Hidden for Arcade / MAME machines) */}
          {selectedGame && !['arcade', 'mame', 'cps1', 'cps2', 'cps3', 'neogeo'].includes(selectedGame.systemKey?.toLowerCase()) && !['arcade', 'mame', 'cps1', 'cps2', 'cps3', 'neogeo'].includes(selectedGame.systemCore?.toLowerCase()) && (
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ds-save-tab-btn ${dsTab === 'save' ? 'is-active' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'save' ? 'gamepad-focused' : ''}`}
              onClick={() => {
                setDsTab(dsTab === 'save' ? 'overview' : 'save');
                sfx?.playTabSwitch?.();
              }}
              title="In-Game Save Data & Battery RAM (.sav)"
              aria-label="Save Data"
            >
              <Save size={16} color={dsTab === 'save' ? '#ffffff' : '#10b981'} />
            </button>
          )}

          {/* Guides Touch Button (Toggles between Overview and Strategy Guides inside DS pane) */}
          {hasGuides && (
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ds-guide-btn ${dsTab === 'guides' ? 'is-active' : ''} ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'guides' ? 'gamepad-focused' : ''}`}
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

          {/* Unified Edit & Scrape Touch Button */}
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
            VIEW 1: OVERVIEW (Playtime Stats, Specs)
            ========================================================================= */}
        {dsTab === 'overview' && (
          <div className="ds-tab-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Playtime & Session Analytics Card */}
            <div className="ds-stats-card">
              <div className="ds-stats-row-3">
                <div className="ds-stat-item">
                  <div className="ds-stat-label">
                    <Clock size={12} color="#3b82f6" />
                    <span>Playtime</span>
                  </div>
                  <div className="ds-stat-val-group">
                    <span className="ds-stat-val">{selectedStats?.playtimeFormatted || '< 1 min'}</span>
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

            {/* Specs Details Card */}
            {(genre || developer || publisher || releaseYear) ? (
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
                  {releaseYear && (
                    <div className="ds-spec-card">
                      <Calendar size={12} color="#64748b" />
                      <span>{releaseYear}</span>
                    </div>
                  )}
                  <div className="ds-spec-card" style={!releaseYear ? { gridColumn: 'span 2' } : {}}>
                    <Cpu size={12} color="#64748b" />
                    <span>{selectedGame?.systemCore?.toUpperCase() || 'EMULATORJS'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ds-spec-card" style={{ marginTop: '0.2rem' }}>
                <Cpu size={12} color="#64748b" />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Core:</span>
                <strong>{selectedGame?.systemCore?.toUpperCase() || 'EMULATORJS'}</strong>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: IN-GAME SAVE & BATTERY RAM STUDIO (.SAV)
            ========================================================================= */}
        {dsTab === 'save' && (
          <div className="ds-tab-pane ds-save-studio animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".sav,.srm,.state,.ram,.mcr,application/octet-stream"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && onImportSave && selectedGame) {
                  setSaveActionStatus('Importing save...');
                  const success = await onImportSave(file, selectedGame);
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

            <div className="ds-save-tiles-group">
              {/* Export Battery Save (.sav) */}
              <button
                type="button"
                className={`ds-save-action-tile ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'save-export-battery' ? 'gamepad-focused' : ''}`}
                onClick={async () => {
                  if (selectedGame) {
                    setSaveActionStatus('Exporting battery save (.sav)...');
                    const fn = onExportBatterySave || onExportSave;
                    const success = await fn(selectedGame);
                    if (success) {
                      sfx?.playNotification?.();
                      setSaveActionStatus('Downloaded .sav battery save file!');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    } else {
                      setSaveActionStatus('No in-game battery save found. Save in-game first!');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    }
                  }
                }}
              >
                <div className="ds-save-tile-icon export">
                  <Download size={16} />
                </div>
                <div className="ds-save-tile-content">
                  <div className="ds-save-tile-title">Export Battery Save (.sav)</div>
                  <div className="ds-save-tile-sub">Download in-game cartridge SRAM save file</div>
                </div>
              </button>

              {/* Export Quick Save (.state) */}
              <button
                type="button"
                className={`ds-save-action-tile ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'save-export-quick' ? 'gamepad-focused' : ''}`}
                onClick={async () => {
                  if (selectedGame) {
                    setSaveActionStatus('Exporting quick save (.state)...');
                    const fn = onExportQuickSave || onExportSave;
                    const success = await fn(selectedGame);
                    if (success) {
                      sfx?.playNotification?.();
                      setSaveActionStatus('Downloaded .state quick save snapshot!');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    } else {
                      setSaveActionStatus('No quick save snapshot found. Press Quick Save first!');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    }
                  }
                }}
              >
                <div className="ds-save-tile-icon export" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Download size={16} />
                </div>
                <div className="ds-save-tile-content">
                  <div className="ds-save-tile-title">Export Quick Save (.state)</div>
                  <div className="ds-save-tile-sub">Download emulator snapshot state file</div>
                </div>
              </button>

              {/* Import Tile */}
              <button
                type="button"
                className={`ds-save-action-tile ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'save-import' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <div className="ds-save-tile-icon import">
                  <Upload size={16} />
                </div>
                <div className="ds-save-tile-content">
                  <div className="ds-save-tile-title">Import Save / State (.sav / .state)</div>
                  <div className="ds-save-tile-sub">Upload an existing .sav battery save or .state snapshot</div>
                </div>
              </button>

              {/* Delete Tile */}
              <button
                type="button"
                className={`ds-save-action-tile is-delete ${focusedTarget?.zone === 'cardModal' && focusedTarget?.id === 'save-delete' ? 'gamepad-focused' : ''}`}
                onClick={async () => {
                  if (onDeleteSave && selectedGame) {
                    setSaveActionStatus('Deleting save data...');
                    await onDeleteSave(selectedGame);
                    sfx?.playDelete?.();
                    setSaveActionStatus('Save data & quick saves erased!');
                    setTimeout(() => setSaveActionStatus(''), 4000);
                  }
                }}
              >
                <div className="ds-save-tile-icon delete">
                  <Trash2 size={16} />
                </div>
                <div className="ds-save-tile-content">
                  <div className="ds-save-tile-title">Delete All Saved Data</div>
                  <div className="ds-save-tile-sub">Erase in-game saves & quick save states</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: NINTENDO DS INTEGRATED STRATEGY GUIDES DECK (NO POPUP)
            ========================================================================= */}
        {dsTab === 'guides' && (
          <div className="ds-tab-pane ds-guides-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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

        {/* Hidden permanent Sidecar JSON Uploader input */}
        <input
          type="file"
          ref={sidecarInputRef}
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleImportSidecar}
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

                          <button
                            type="button"
                            className="ds-inline-btn-danger"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.64rem' }}
                            onClick={handleDeleteCover}
                            title="Delete Box Art cover"
                          >
                            <Trash2 size={10} />
                            <span>Delete Cover</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <p style={{ fontSize: '0.66rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35 }}>
                        Searched Libretro CDN &amp; TheGamesDB (No official box art found on remote servers).
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

                {/* Section 2: Top Actions (Save Changes & Delete Game) */}
                <div style={{ display: 'flex', gap: '0.45rem', width: '100%' }}>
                  <button
                    type="submit"
                    className="ds-inline-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit ? <RefreshCw size={13} className="spin" /> : <Save size={13} />}
                    <span>{editSaveStatus || (isSavingEdit ? 'Saving...' : 'Save Changes')}</span>
                  </button>

                  <button
                    type="button"
                    className="ds-inline-btn-danger"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      sfx?.playModalOpen?.();
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Game</span>
                  </button>
                </div>

                {/* Section 3: Online Scraper & Live Terminal Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={11} color="#64748b" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Metadata / Cover Search</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="ds-inline-btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                        onClick={handleManualScrape}
                        disabled={isLocalScraping}
                        title="Search online databases (Libretro CDN & Game DB)"
                      >
                        <RefreshCw size={10} className={isLocalScraping ? 'spin' : ''} />
                        <span>{isLocalScraping ? 'Scraping...' : 'Scrape'}</span>
                      </button>

                      <button
                        type="button"
                        className="ds-inline-btn-danger"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.65rem' }}
                        onClick={handleDeleteMetadata}
                        title="Delete metadata sidecar, reset all fields below, and clear search logs"
                      >
                        <Trash2 size={10} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {(isLocalScraping || gameLogs.length > 0) && (
                    <div className="ds-scraper-terminal-logs animate-fade-in">
                      {gameLogs.length > 0 ? (
                        gameLogs.map((log, idx) => (
                          <div key={log.id || idx} className={`ds-log-line log-${log.type}`}>
                            <span className="log-time">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'LOG'}</span>
                            <span className="log-msg">{log.message}</span>
                          </div>
                        ))
                      ) : (
                        <div className="ds-log-line log-info">
                          <span className="log-msg">Starting online database queries...</span>
                        </div>
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  )}
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

                {/* Section 4: Sidecar JSON Import & Export Actions */}
                <div className="ds-inline-actions" style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '0.45rem', marginTop: '0.3rem', display: 'flex', gap: '0.45rem' }}>
                  <button
                    type="button"
                    className="ds-inline-btn-secondary"
                    onClick={() => sidecarInputRef.current?.click()}
                    title="Import metadata.json sidecar file"
                    style={{ flex: 1 }}
                  >
                    <Upload size={12} />
                    <span>Import Sidecar</span>
                  </button>

                  <button
                    type="button"
                    className="ds-inline-btn-secondary"
                    onClick={handleExportSidecar}
                    title="Export local metadata.json sidecar file"
                    style={{ flex: 1 }}
                  >
                    <Download size={12} />
                    <span>Export Sidecar</span>
                  </button>
                </div>
              </form>
            </div>
          );
        })()}
      </div>

      {/* In-App Delete Game Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Game?"
        message={`Are you sure you want to delete "${selectedGame?.title}"? This will permanently remove the ROM and metadata sidecars from your collection.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Game'}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDeleteGame}
        onCancel={() => setShowDeleteConfirm(false)}
        sfx={sfx}
      />
    </div>
  );
}

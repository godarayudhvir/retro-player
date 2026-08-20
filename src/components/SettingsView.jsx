import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Disc, 
  Music, 
  Upload, 
  Trash2, 
  Search, 
  RefreshCw, 
  FolderPlus, 
  Gamepad2, 
  HardDrive, 
  Check, 
  AlertCircle,
  Play,
  Volume2,
  Palette,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Monitor,
  X,
  Download,
  Smartphone,
  Zap,
  Sparkles,
  Square,
  Terminal,
  FileText,
  ExternalLink
} from 'lucide-react';
import { detectSystemFromExtension } from '../utils/systemDetector';
import ConfirmModal from './ConfirmModal';

/**
 * Nintendo Switch Style Full-Screen System Settings Menu Page.
 * Features a clean 2-column layout with left category sidebar navigation,
 * and comprehensive detail settings panes for ROM management, Audio, Themes,
 * Gamepad mappings, PWA & offline status, and Docker volume storage diagnostics.
 */
export default function SettingsView({
  isOpen,
  onClose,
  games = [],
  systems = [],
  fetchGames,
  bgm,
  pwa,
  sfx,
  themeEngine,
  scraper,
  onOpenScraperModal,
  focusedTarget,
  setFocusedTarget,
  gamepadConnected,
  gamepadBattery
}) {
  const [activeCategory, setActiveCategory] = useState('roms'); // 'roms', 'bgm', 'theme', 'controls', 'system'
  const [romSearch, setRomSearch] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);

  const isGitHubPagesDemo = typeof window !== 'undefined' && (
    window.location.hostname.endsWith('github.io') ||
    window.location.search.includes('demo=true')
  );

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const bgmInputRef = useRef(null);

  const SUPPORTED_ROM_EXTS = new Set([
    'nes', 'snes', 'smc', 'sfc', 'gba', 'gbc', 'gb', 
    'n64', 'z64', 'v64', 'nds', 'gen', 'smd', 'md', 
    'zip', 'iso', 'cue', 'chd', 'bin'
  ]);

  if (!isOpen) return null;

  // Filter games based on search and system
  const filteredGames = games.filter(g => {
    const matchesSearch = !romSearch.trim() || 
      g.title?.toLowerCase().includes(romSearch.toLowerCase()) || 
      g.filename?.toLowerCase().includes(romSearch.toLowerCase());
    const matchesSystem = selectedSystemFilter === 'all' || g.systemKey === selectedSystemFilter;
    return matchesSearch && matchesSystem;
  });

  // Handle ROM Upload (supports multi-file and recursive folder selection)
  const handleRomUpload = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    // Filter to only supported ROM files (excluding hidden and macOS metadata files)
    const files = rawFiles.filter(file => {
      const fileName = file.name || '';
      if (fileName.startsWith('.') || fileName.startsWith('._')) return false;
      const ext = fileName.split('.').pop()?.toLowerCase();
      return ext && SUPPORTED_ROM_EXTS.has(ext);
    });

    if (files.length === 0) {
      setUploadStatus({ type: 'error', message: 'No supported ROM files found in selection.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
      setTimeout(() => setUploadStatus(null), 4000);
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: `Uploading 1 of ${files.length} ROM(s)...` });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatus({ type: 'info', message: `Uploading ${i + 1} of ${files.length}: ${file.name}...` });
      try {
        const sys = detectSystemFromExtension(file.name);
        const response = await fetch('/api/upload-rom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-filename': encodeURIComponent(file.name),
            'x-system-key': sys.key
          },
          body: file
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Failed uploading ROM:', err);
        failCount++;
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setUploadStatus({ 
        type: 'success', 
        message: failCount > 0 
          ? `Uploaded ${successCount} of ${files.length} ROM(s) (${failCount} failed).`
          : `Successfully uploaded all ${successCount} ROM(s)!` 
      });
      sfx?.playSaveDetected?.();
      fetchGames?.();
    } else {
      setUploadStatus({ type: 'error', message: `Failed to upload files.` });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Handle BGM Track Upload
  const handleBgmUpload = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    const files = rawFiles.filter(file => {
      const name = file.name || '';
      return !name.startsWith('.') && !name.startsWith('._');
    });

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: `Uploading ${files.length} audio track(s)...` });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const response = await fetch('/api/upload-bgm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-filename': encodeURIComponent(file.name)
          },
          body: file
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Failed uploading BGM:', err);
        failCount++;
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setUploadStatus({ type: 'success', message: `Successfully uploaded ${successCount} audio track(s)!` });
      sfx?.playSaveDetected?.();
      bgm?.refreshTracks?.();
    } else {
      setUploadStatus({ type: 'error', message: `Failed to upload audio files.` });
    }

    if (bgmInputRef.current) bgmInputRef.current.value = '';
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Trigger ROM Deletion
  const promptDeleteRom = (game) => {
    setPendingConfirm({
      title: 'Delete ROM from Host Disk?',
      message: `Are you sure you want to delete "${game.title}" (${game.filename})? This will permanently remove the ROM file from the host server.`,
      confirmLabel: 'Delete Game',
      onConfirm: async () => {
        setPendingConfirm(null);
        setDeletingId(game.id);
        try {
          const res = await fetch('/api/delete-rom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemKey: game.systemKey,
              filename: game.filename,
              relativePath: game.relativePath
            })
          });

          if (res.ok) {
            setUploadStatus({ type: 'success', message: `Successfully deleted "${game.title}".` });
            sfx?.playModalClose?.();
            fetchGames?.();
          } else {
            setUploadStatus({ type: 'error', message: `Failed to delete "${game.title}". File not found or permission denied.` });
          }
        } catch (e) {
          console.error('Error deleting ROM:', e);
          setUploadStatus({ type: 'error', message: `Network error deleting "${game.title}".` });
        } finally {
          setDeletingId(null);
          setTimeout(() => setUploadStatus(null), 4000);
        }
      }
    });
  };

  // Trigger BGM Deletion
  const promptDeleteBgm = (track) => {
    setPendingConfirm({
      title: 'Delete Audio Track?',
      message: `Are you sure you want to delete "${track.title}" (${track.filename}) from host background music storage?`,
      confirmLabel: 'Delete Track',
      onConfirm: async () => {
        setPendingConfirm(null);
        setDeletingId(track.id);
        try {
          const res = await fetch('/api/delete-bgm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: track.filename })
          });

          if (res.ok) {
            setUploadStatus({ type: 'success', message: `Deleted track "${track.title}".` });
            sfx?.playModalClose?.();
            bgm?.refreshTracks?.();
          } else {
            setUploadStatus({ type: 'error', message: `Failed to delete track "${track.title}".` });
          }
        } catch (e) {
          console.error('Error deleting BGM:', e);
          setUploadStatus({ type: 'error', message: `Network error deleting track "${track.title}".` });
        } finally {
          setDeletingId(null);
          setTimeout(() => setUploadStatus(null), 4000);
        }
      }
    });
  };

  const navCategories = [
    { id: 'roms', label: 'ROM Library & Storage', icon: <Disc size={20} />, count: games.length },
    { id: 'scraper', label: 'Scraper & Box Art', icon: <Sparkles size={20} />, count: Object.keys(scraper?.metadataMap || {}).length },
    { id: 'bgm', label: 'Background Music (BGM)', icon: <Music size={20} />, count: bgm?.tracks?.length || 0 },
    { id: 'theme', label: 'Themes & Visuals', icon: <Palette size={20} /> },
    { id: 'controls', label: 'Controllers & Keys', icon: <Gamepad2 size={20} /> },
    { id: 'system', label: 'System & Diagnostics', icon: <HardDrive size={20} /> }
  ];

  return (
    <div className="settings-page-wrapper animate-fade-in">
      <div className="settings-page-container">
        
        {/* Top Switch-Style System Header */}
        <header className="settings-page-header">
          <div className="settings-header-left">
            <button 
              className="settings-back-btn" 
              onClick={onClose}
              title="Return to Main Console View (Esc / B)"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="settings-page-title-group">
              <Settings size={26} className="settings-title-icon" color="#ef4444" />
              <h1>System Settings</h1>
            </div>
          </div>

          <div className="settings-header-right">
            <div className="settings-header-badge">
              <Monitor size={16} />
              <span>Retro Player Station</span>
            </div>
          </div>
        </header>

        {/* Status Notification Banner */}
        {uploadStatus && (
          <div className={`settings-status-banner ${uploadStatus.type} animate-fade-in`}>
            {uploadStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{uploadStatus.message}</span>
          </div>
        )}

        {/* Main 2-Column Split Viewport */}
        <div className="settings-main-split">
          
          {/* Left Category Sidebar */}
          <aside className="settings-sidebar">
            <nav className="settings-nav-list" aria-label="Settings Categories">
              {navCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    className={`settings-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      sfx?.playTabSwitch?.();
                    }}
                  >
                    <div className="nav-item-content">
                      <span className="nav-item-icon">{cat.icon}</span>
                      <span className="nav-item-label">{cat.label}</span>
                    </div>
                    {cat.count !== undefined && (
                      <span className="nav-item-badge">{cat.count}</span>
                    )}
                    <ChevronRight size={16} className="nav-item-chevron" />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Detail Pane */}
          <main className="settings-detail-pane">
            
            {/* Category 1: ROM Library & Storage */}
            {activeCategory === 'roms' && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-section-header">
                  <div>
                    <h2>ROM Library & File Management</h2>
                    <p className="settings-section-desc">
                      Upload, inspect, and delete game ROMs stored across console folders on the host disk.
                    </p>
                  </div>

                  {/* Dual Bulk Upload Actions */}
                  <div className="settings-upload-wrapper">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".nes,.snes,.smc,.sfc,.gba,.gbc,.gb,.n64,.z64,.v64,.nds,.gen,.smd,.md,.zip,.iso,.cue,.chd,.bin"
                      onChange={handleRomUpload}
                      style={{ display: 'none' }}
                    />
                    <input
                      ref={folderInputRef}
                      type="file"
                      multiple
                      webkitdirectory="true"
                      directory="true"
                      onChange={handleRomUpload}
                      style={{ display: 'none' }}
                    />

                    <button
                      className="settings-action-btn primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      title="Select multiple ROM files"
                    >
                      {isUploading ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
                      <span>Upload ROMs</span>
                    </button>

                    <button
                      className="settings-action-btn folder-btn"
                      onClick={() => folderInputRef.current?.click()}
                      disabled={isUploading}
                      title="Select an entire folder with nested subfolders"
                    >
                      <FolderPlus size={16} />
                      <span>Upload Folder</span>
                    </button>
                  </div>
                </div>

                {isGitHubPagesDemo && (
                  <div className="demo-modal-notice-box" style={{ marginBottom: '1.25rem' }}>
                    <div className="demo-notice-header">
                      <HardDrive size={18} color="#f59e0b" />
                      <strong>Static Demo Mode Notice</strong>
                    </div>
                    <p>
                      Server disk file uploads are disabled on GitHub Pages static hosting. To test personal ROMs on this demo, use <strong>"Load Custom ROM"</strong> in the topbar or drag & drop games onto the screen to run them in your browser memory.
                    </p>
                  </div>
                )}

                {/* Filter Toolbar */}
                <div className="settings-filter-bar">
                  <div className="settings-search-box">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search by title or filename..."
                      value={romSearch}
                      onChange={(e) => setRomSearch(e.target.value)}
                    />
                    {romSearch && (
                      <button onClick={() => setRomSearch('')} className="clear-search-btn">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedSystemFilter}
                    onChange={(e) => setSelectedSystemFilter(e.target.value)}
                    className="settings-select"
                  >
                    <option value="all">All Systems ({games.length})</option>
                    {systems.map(sys => (
                      <option key={sys.key} value={sys.key}>
                        {sys.name} ({sys.gameCount || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* ROM List View */}
                <div className="settings-list-scroll">
                  {filteredGames.length === 0 ? (
                    <div className="settings-empty-state">
                      <Disc size={44} color="#94a3b8" />
                      <p>No ROMs match the filter criteria</p>
                    </div>
                  ) : (
                    <div className="settings-items-grid">
                      {filteredGames.map((game) => (
                        <div key={game.id} className="settings-item-row">
                          <div className="settings-item-left">
                            <span 
                              className="settings-system-badge" 
                              style={{ backgroundColor: game.systemColor || '#ef4444' }}
                            >
                              {game.systemName}
                            </span>
                            <div className="settings-item-info">
                              <span className="settings-item-title">{game.title}</span>
                              <span className="settings-item-file">{game.filename}</span>
                            </div>
                          </div>

                          <div className="settings-item-actions">
                            <button
                              className="settings-delete-btn"
                              onClick={() => promptDeleteRom(game)}
                              disabled={deletingId === game.id}
                              title={`Delete ${game.title} from disk`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category 2: Scraper & Box Art Management */}
            {activeCategory === 'scraper' && scraper && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-section-header">
                  <div>
                    <h2>Online Metadata & 3D Box Art Scraper</h2>
                    <p className="settings-section-desc">
                      Configure authentic Libretro box art, custom API providers, accounts, and live scraper telemetry.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {scraper.isScraping ? (
                      <button
                        className="settings-action-btn"
                        style={{ background: '#ef4444', color: '#fff', borderColor: '#dc2626' }}
                        onClick={() => {
                          scraper.stopScrape();
                          sfx?.playModalClose?.();
                        }}
                      >
                        <Square size={14} fill="currentColor" />
                        <span>Stop Scraper</span>
                      </button>
                    ) : (
                      <button
                        className="settings-action-btn primary"
                        onClick={() => {
                          if (onOpenScraperModal) {
                            onOpenScraperModal();
                            sfx?.playModalOpen?.();
                          } else {
                            scraper.scrapeAll(undefined, true);
                            sfx?.playThemeSwitch?.();
                          }
                        }}
                      >
                        <Sparkles size={16} />
                        <span>Choose Scrape Targets</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status & Options Overview Card */}
                <div className="settings-diag-card" style={{ marginBottom: '1.25rem' }}>
                  <div className="diag-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                    <Sparkles size={24} color="#f59e0b" />
                  </div>
                  <div className="diag-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4>Scraper Engine Status</h4>
                        <p style={{ margin: '2px 0 0 0' }}>
                          {scraper.isScraping ? (
                            <span style={{ color: '#3b82f6', fontWeight: 700 }}>
                              ● Scanning in progress ({scraper.scrapeProgress.current}/{scraper.scrapeProgress.total} titles)
                            </span>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>
                              ● Ready & Indexed ({Object.keys(scraper.metadataMap || {}).length} games cached in IndexedDB)
                            </span>
                          )}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-sub, #64748b)', fontWeight: 600 }}>Auto-Scrape on Boot:</span>
                        <button
                          className={`settings-toggle-switch ${scraper.autoScrapeEnabled ? 'active' : ''}`}
                          style={{ margin: 0, padding: '4px 14px', fontSize: '0.75rem' }}
                          onClick={() => {
                            scraper.toggleAutoScrape();
                            sfx?.playThemeSwitch?.();
                          }}
                          title={scraper.autoScrapeEnabled ? "Disable automatic background scraping on startup" : "Enable automatic background scraping on startup"}
                        >
                          {scraper.autoScrapeEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom API Keys & Accounts Provider Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  
                  {/* Provider 1: TheGamesDB.net */}
                  <div className="settings-diag-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          TheGamesDB.net
                          <span style={{ fontSize: '0.68rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '1px 6px', borderRadius: '6px', fontWeight: 800 }}>API KEY</span>
                        </h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-sub, #64748b)' }}>
                          Provides official high-res front box arts, publishers, developers, and release dates.
                        </p>
                      </div>
                      <a
                        href="https://thegamesdb.net/api"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="settings-action-btn folder-btn"
                        style={{ padding: '4px 10px', fontSize: '0.72rem', height: 'auto', textDecoration: 'none' }}
                        title="Get an API key on TheGamesDB.net"
                      >
                        <span>Get API Key</span>
                        <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                      </a>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '4px' }}>
                        Your TheGamesDB API Key:
                      </label>
                      <input
                        type="password"
                        placeholder="Paste your API key here..."
                        defaultValue={scraper.getApiKey?.(scraper.SCRAPER_KEYS.THEGAMESDB_API_KEY) || ''}
                        onChange={(e) => scraper.setApiKey?.(scraper.SCRAPER_KEYS.THEGAMESDB_API_KEY, e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: '0.8rem', borderRadius: '8px', border: '1.5px solid rgba(203, 213, 225, 0.9)', background: 'var(--panel-bg, #ffffff)', color: 'var(--text-main, #0f172a)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Provider 2: ScreenScraper.fr */}
                  <div className="settings-diag-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          ScreenScraper.fr
                          <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '6px', fontWeight: 800 }}>USER ACCOUNT</span>
                        </h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-sub, #64748b)' }}>
                          Primary scraper database used by ES-DE & RetroPie with 20,000+ daily free quota.
                        </p>
                      </div>
                      <a
                        href="https://www.screenscraper.fr/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="settings-action-btn folder-btn"
                        style={{ padding: '4px 10px', fontSize: '0.72rem', height: 'auto', textDecoration: 'none' }}
                        title="Register a free ScreenScraper account"
                      >
                        <span>Create Account</span>
                        <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                      </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '4px' }}>
                          Username (SSID):
                        </label>
                        <input
                          type="text"
                          placeholder="ScreenScraper username..."
                          defaultValue={scraper.getApiKey?.(scraper.SCRAPER_KEYS.SCREENSCRAPER_USER) || ''}
                          onChange={(e) => scraper.setApiKey?.(scraper.SCRAPER_KEYS.SCREENSCRAPER_USER, e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.8rem', borderRadius: '8px', border: '1.5px solid rgba(203, 213, 225, 0.9)', background: 'var(--panel-bg, #ffffff)', color: 'var(--text-main, #0f172a)', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '4px' }}>
                          Password:
                        </label>
                        <input
                          type="password"
                          placeholder="Password..."
                          defaultValue={scraper.getApiKey?.(scraper.SCRAPER_KEYS.SCREENSCRAPER_PASS) || ''}
                          onChange={(e) => scraper.setApiKey?.(scraper.SCRAPER_KEYS.SCREENSCRAPER_PASS, e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.8rem', borderRadius: '8px', border: '1.5px solid rgba(203, 213, 225, 0.9)', background: 'var(--panel-bg, #ffffff)', color: 'var(--text-main, #0f172a)', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Real-Time Live Scraper Activity Log Console */}
                <div className="scraper-logs-container">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                      <Terminal size={16} color="#3b82f6" />
                      <span>Live Scraper Activity Logs</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-sub, #64748b)', fontWeight: 500 }}>({scraper.logs?.length || 0} events)</span>
                    </div>
                    {scraper.logs?.length > 0 && (
                      <button
                        className="settings-action-btn folder-btn"
                        style={{ padding: '2px 8px', fontSize: '0.7rem', height: 'auto' }}
                        onClick={() => {
                          scraper.clearLogs?.();
                          sfx?.playTabSwitch?.();
                        }}
                        title="Clear log output"
                      >
                        <span>Clear Logs</span>
                      </button>
                    )}
                  </div>

                  <div className="scraper-terminal-view">
                    {(!scraper.logs || scraper.logs.length === 0) ? (
                      <div className="scraper-log-empty">
                        <span>No activity yet. Click "Choose Scrape Targets" or re-scrape any single game in its info drawer to stream live telemetry here.</span>
                      </div>
                    ) : (
                      <div className="scraper-logs-list">
                        {scraper.logs.map((log) => (
                          <div key={log.id} className={`scraper-log-row log-${log.type}`}>
                            <span className="log-time">[{log.time}]</span>
                            <span className="log-msg">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Category 2: Background Music (BGM) */}
            {activeCategory === 'bgm' && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-section-header">
                  <div>
                    <h2>Background Music (BGM) Engine</h2>
                    <p className="settings-section-desc">
                      Stream and manage ambient console music tracks. Automatically pauses when entering any game.
                    </p>
                  </div>

                  <div className="settings-upload-wrapper">
                    <input
                      ref={bgmInputRef}
                      type="file"
                      multiple
                      accept=".mp3,.ogg,.wav,.flac,.m4a,.aac"
                      onChange={handleBgmUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="settings-action-btn primary"
                      onClick={() => bgmInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
                      <span>Upload Music</span>
                    </button>
                  </div>
                </div>

                <div className="settings-list-scroll">
                  {(!bgm?.tracks || bgm.tracks.length === 0) ? (
                    <div className="settings-empty-state">
                      <Music size={44} color="#94a3b8" />
                      <p>No background music tracks found in host storage</p>
                    </div>
                  ) : (
                    <div className="settings-items-grid">
                      {bgm.tracks.map((track, idx) => {
                        const isCurrent = bgm.currentTrackIndex === idx;

                        return (
                          <div key={track.id || idx} className={`settings-item-row ${isCurrent ? 'is-playing-track' : ''}`}>
                            <div className="settings-item-left">
                              <button
                                className={`settings-play-track-btn ${isCurrent && bgm.isPlaying ? 'active' : ''}`}
                                onClick={() => {
                                  if (isCurrent) {
                                    bgm.togglePlay();
                                  } else {
                                    bgm.playTrack(idx);
                                  }
                                  sfx?.playTileNav?.();
                                }}
                                title={isCurrent && bgm.isPlaying ? "Pause Track" : "Play Track"}
                              >
                                {isCurrent && bgm.isPlaying ? <Volume2 size={16} color="#10b981" /> : <Play size={16} />}
                              </button>
                              <div className="settings-item-info">
                                <span className="settings-item-title">{track.title}</span>
                                <span className="settings-item-file">{track.filename}</span>
                              </div>
                            </div>

                            <div className="settings-item-actions">
                              <button
                                className="settings-delete-btn"
                                onClick={() => promptDeleteBgm(track)}
                                disabled={deletingId === track.id}
                                title={`Delete ${track.title} from disk`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category 3: Themes & Visuals */}
            {activeCategory === 'theme' && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-section-header">
                  <div>
                    <h2>Themes & Display Aesthetics</h2>
                    <p className="settings-section-desc">
                      Customize the visual console styling, dark modes, and scanline rendering effects.
                    </p>
                  </div>
                </div>

                <div className="settings-themes-grid">
                  {[
                    { 
                      key: 'iisu', 
                      name: 'iiSU Light', 
                      desc: 'Crisp porcelain-white console UI with vibrant Nintendo red and sapphire accents', 
                      icon: '☀️', 
                      bg: '#f8fafc',
                      accent: '#ef4444',
                      mockup: 'light'
                    },
                    { 
                      key: 'midnight', 
                      name: 'Midnight Cyber', 
                      desc: 'Deep obsidian dark mode with electric cyan glow and high-contrast OLED slate', 
                      icon: '🌙', 
                      bg: '#090d16',
                      accent: '#06b6d4',
                      mockup: 'dark'
                    },
                    { 
                      key: 'xmb', 
                      name: 'Sony XMB Wave', 
                      desc: 'PlayStation console aesthetic with deep cosmic indigo and dynamic flowing aura', 
                      icon: '🌊', 
                      bg: '#070a14',
                      accent: '#38bdf8',
                      mockup: 'xmb'
                    },
                    { 
                      key: 'dmg', 
                      name: 'Game Boy DMG', 
                      desc: 'Legendary 1989 monochrome dot matrix retro aesthetic with authentic olive phosphor', 
                      icon: '📟', 
                      bg: '#8b956d',
                      accent: '#0f380f',
                      mockup: 'dmg'
                    }
                  ].map((t) => {
                    const isSelected = (themeEngine?.theme || 'iisu') === t.key;
                    return (
                      <div
                        key={t.key}
                        className={`settings-theme-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          themeEngine?.setTheme?.(t.key);
                          sfx?.playThemeSwitch?.();
                        }}
                      >
                        <div 
                          className={`theme-card-preview theme-mockup-${t.mockup}`}
                          style={{ borderColor: isSelected ? t.accent : 'transparent' }}
                        >
                          {/* Mini Console UI Mockup Preview */}
                          <div className="theme-preview-ui-bar">
                            <div className="theme-preview-dot" style={{ background: t.accent }}></div>
                            <div className="theme-preview-line"></div>
                            <div className="theme-preview-pill"></div>
                          </div>
                          <div className="theme-preview-cards-row">
                            <div className="theme-preview-card mini-1"></div>
                            <div className="theme-preview-card mini-2"></div>
                            <div className="theme-preview-card mini-3"></div>
                          </div>

                          <span className="theme-card-icon">{t.icon}</span>
                          
                          {isSelected && (
                            <div className="theme-card-active-tag" style={{ background: t.accent }}>
                              <Check size={14} strokeWidth={3} />
                              <span>Active</span>
                            </div>
                          )}
                        </div>

                        <div className="theme-card-info">
                          <div className="theme-info-header">
                            <h3>{t.name}</h3>
                            <span className="theme-key-badge">{t.key.toUpperCase()}</span>
                          </div>
                          <p>{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Audio SFX Settings */}
                <div className="settings-card-row">
                  <div className="settings-card-row-info">
                    <h3>Synthesized Audio SFX</h3>
                    <p>Tactile UI sound effects synthesized in real time with Web Audio API.</p>
                  </div>
                  <button
                    className={`settings-toggle-switch ${!sfx?.isMuted ? 'active' : ''}`}
                    onClick={() => {
                      sfx?.toggleMute?.();
                      sfx?.playThemeSwitch?.();
                    }}
                  >
                    {!sfx?.isMuted ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>
              </div>
            )}

            {/* Category 4: Controls & Gamepad */}
            {activeCategory === 'controls' && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-section-header">
                  <div>
                    <h2>Controllers & Key Mappings</h2>
                    <p className="settings-section-desc">
                      Input configuration reference for USB/Bluetooth gamepads and keyboard spatial navigation.
                    </p>
                  </div>

                  <div className="settings-gamepad-telemetry">
                    <div className="settings-gamepad-badge">
                      <Gamepad2 size={20} color={gamepadConnected ? '#10b981' : '#64748b'} />
                      <span>{gamepadConnected ? 'Controller Connected' : 'Keyboard Active'}</span>
                    </div>

                    {gamepadConnected && (
                      <div className="gamepad-telemetry-pill">
                        {gamepadBattery?.hasBatteryInfo ? (
                          <span className="telemetry-battery">
                            🔋 <strong>{gamepadBattery.batteryPercent}%</strong> {gamepadBattery.isCharging ? '(Charging ⚡)' : 'Battery'}
                          </span>
                        ) : (
                          <span className="telemetry-wired">⚡ USB / Wireless Ready</span>
                        )}
                        {gamepadBattery?.gamepadId && (
                          <span className="telemetry-id" title={gamepadBattery.gamepadId}>
                            🎮 {gamepadBattery.gamepadId.substring(0, 24)}{gamepadBattery.gamepadId.length > 24 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="settings-controls-table-wrapper">
                  <table className="settings-controls-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Keyboard</th>
                        <th>Gamepad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Navigate Menu & Tiles</td>
                        <td><kbd>Arrow Keys</kbd> / <kbd>WASD</kbd></td>
                        <td><kbd>D-Pad</kbd> / <kbd>Left Stick</kbd></td>
                      </tr>
                      <tr>
                        <td>Select / Play Title</td>
                        <td><kbd>Enter</kbd> / <kbd>Space</kbd></td>
                        <td><kbd>A</kbd> Button</td>
                      </tr>
                      <tr>
                        <td>Back / Close Dialog</td>
                        <td><kbd>Esc</kbd> / <kbd>Backspace</kbd></td>
                        <td><kbd>B</kbd> Button</td>
                      </tr>
                      <tr>
                        <td>Toggle Favorite</td>
                        <td><kbd>F</kbd></td>
                        <td><kbd>X</kbd> Button</td>
                      </tr>
                      <tr>
                        <td>Cycle Consoles / Systems</td>
                        <td><kbd>Q</kbd> / <kbd>E</kbd></td>
                        <td><kbd>L1</kbd> / <kbd>R1</kbd></td>
                      </tr>
                      <tr>
                        <td>Quick Search</td>
                        <td><kbd>Ctrl+K</kbd> / <kbd>⌘K</kbd></td>
                        <td><kbd>Y</kbd> Button</td>
                      </tr>
                      <tr>
                        <td>Cycle Themes</td>
                        <td><kbd>T</kbd></td>
                        <td>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Category 5: System & Diagnostics */}
            {activeCategory === 'system' && (
              <div className="settings-pane-section animate-fade-in">
                <div className="settings-section-header">
                  <div>
                    <h2>System Diagnostics & Docker Storage</h2>
                    <p className="settings-section-desc">
                      Host persistence paths, emulation runtime engine, and active browser IndexedDB state.
                    </p>
                  </div>
                </div>

                <div className="settings-diagnostics-grid">
                  <div className="settings-diag-card">
                    <div className="diag-icon-box">
                      <HardDrive size={24} color="#3b82f6" />
                    </div>
                    <div className="diag-info">
                      <h4>ROM Host Mount</h4>
                      <p><code>./roms</code> (Auto-sorted by system)</p>
                      <span className="diag-status ok">Mounted & Writable</span>
                    </div>
                  </div>

                  <div className="settings-diag-card">
                    <div className="diag-icon-box">
                      <Music size={24} color="#10b981" />
                    </div>
                    <div className="diag-info">
                      <h4>BGM Host Mount</h4>
                      <p><code>./bgm</code> (Audio playlist folder)</p>
                      <span className="diag-status ok">Mounted & Writable</span>
                    </div>
                  </div>

                  <div className="settings-diag-card">
                    <div className="diag-icon-box">
                      <ShieldCheck size={24} color="#f59e0b" />
                    </div>
                    <div className="diag-info">
                      <h4>IndexedDB Storage</h4>
                      <p><code>RetroPlayerDB</code></p>
                      <span className="diag-status ok">Permanent Storage Active</span>
                    </div>
                  </div>

                  <div className="settings-diag-card">
                    <div className="diag-icon-box">
                      <Disc size={24} color="#8b5cf6" />
                    </div>
                    <div className="diag-info">
                      <h4>Installed Games</h4>
                      <p>{games.length} total ROMs indexed</p>
                      <span className="diag-status ok">{systems.filter(s => s.gameCount > 0).length} Active Systems</span>
                    </div>
                  </div>

                  <div className="settings-diag-card">
                    <div className="diag-icon-box">
                      <Smartphone size={24} color="#10b981" />
                    </div>
                    <div className="diag-info">
                      <h4>PWA Application Mode</h4>
                      <p>{pwa?.isStandalone ? 'Installed Standalone Native App' : 'Browser Web Tab Mode'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className={`diag-status ${pwa?.isStandalone ? 'ok' : 'info'}`}>
                          {pwa?.isStandalone ? 'Standalone Active' : (pwa?.canInstall ? 'Ready to Install' : 'Browser Mode')}
                        </span>
                        {pwa?.canInstall && (
                          <button
                            className="settings-action-btn primary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto' }}
                            onClick={() => {
                              pwa.promptInstall();
                              sfx?.playThemeSwitch?.();
                            }}
                          >
                            <Download size={13} />
                            <span>Install App</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="settings-diag-card">
                    <div className="diag-icon-box">
                      <Zap size={24} color="#06b6d4" />
                    </div>
                    <div className="diag-info">
                      <h4>Offline Service Worker</h4>
                      <p>{pwa?.swRegistered ? 'Active Service Worker (retro-player-v1)' : 'Service Worker Initializing...'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className={`diag-status ${pwa?.swRegistered ? 'ok' : 'warn'}`}>
                          {pwa?.swRegistered ? 'Offline Cores Ready' : 'Registering...'}
                        </span>
                        <button
                          className="settings-action-btn folder-btn"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto' }}
                          disabled={pwa?.cacheStatus === 'updating'}
                          onClick={async () => {
                            const ok = await pwa?.refreshCache?.();
                            if (ok) {
                              sfx?.playSaveDetected?.();
                            }
                          }}
                          title="Purge and re-cache all offline shell assets"
                        >
                          <RefreshCw size={13} className={pwa?.cacheStatus === 'updating' ? 'spin' : ''} />
                          <span>{pwa?.cacheStatus === 'updating' ? 'Updating...' : (pwa?.cacheStatus === 'updated' ? 'Cache Updated!' : 'Refresh Cache')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Nintendo Switch Bottom HUD Guide */}
        <footer className="settings-page-footer">
          <div className="settings-footer-left">
            <Gamepad2 size={18} />
            <span>Navigation: Use Arrow Keys or Gamepad D-Pad</span>
          </div>

          <div className="settings-footer-right">
            <div className="settings-hint-item">
              <kbd className="settings-key-badge">B</kbd>
              <span>Back to Games</span>
            </div>
            <div className="settings-hint-item">
              <kbd className="settings-key-badge">A</kbd>
              <span>Select Option</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Universal In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingConfirm}
        title={pendingConfirm?.title}
        message={pendingConfirm?.message}
        confirmLabel={pendingConfirm?.confirmLabel || 'Delete'}
        onConfirm={pendingConfirm?.onConfirm}
        onCancel={() => setPendingConfirm(null)}
        sfx={sfx}
      />
    </div>
  );
}

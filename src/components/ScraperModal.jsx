import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Square, 
  Check, 
  CheckCircle2,
  Layers, 
  Disc, 
  Terminal,
  Database,
  Image,
  RotateCcw,
  CheckCheck,
  Zap,
  ArrowLeft,
  Play
} from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Universal Scraper Scope & Target Selector Modal Dialog.
 * Supports:
 * 1. Scope selection (All Systems vs Single System)
 * 2. In-modal Scan Mode Confirmation Prompt (Smart Scan vs Force Re-fetch)
 * 3. Real-time scanning progress bar with live active title telemetry
 * 4. Comprehensive Scraper Completion Report card with post-run terminal logs
 * 
 * 100% Theme Adaptive & Keyboard/Gamepad Navigable.
 */
export default function ScraperModal({
  isOpen,
  onClose,
  systems = [],
  games = [],
  scraper,
  sfx,
  gamepadConnected = false,
  focusedTarget,
  setFocusedTarget
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'single'
  const [selectedSingleSystem, setSelectedSingleSystem] = useState('');
  const [showModePrompt, setShowModePrompt] = useState(false);
  const [scanMode, setScanMode] = useState('smart'); // 'smart', 'force'
  const [showLogs, setShowLogs] = useState(false);
  const logsEndRef = useRef(null);

  // Auto-scroll logs to bottom when new logs arrive and log panel is open
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showLogs, scraper?.logs?.length]);

  // Active systems with games installed
  const activeSystems = useMemo(() => {
    return systems.filter(s => s.gameCount > 0);
  }, [systems]);

  // Set default selected single system when modal opens
  useEffect(() => {
    if (activeSystems.length > 0 && !selectedSingleSystem) {
      setSelectedSingleSystem(activeSystems[0].key);
    }
  }, [activeSystems, selectedSingleSystem]);

  // Reset summary and mode prompt when user switches tab or selected system
  const handleTabChange = (tab) => {
    if (scraper?.isScraping) return;
    setActiveTab(tab);
    setShowModePrompt(false);
    scraper?.clearScrapeSummary?.();
    sfx?.playTabSwitch?.();
  };

  const handleSelectSystem = (sysKey) => {
    if (scraper?.isScraping) return;
    setSelectedSingleSystem(sysKey);
    setShowModePrompt(false);
    scraper?.clearScrapeSummary?.();
    sfx?.playTabSwitch?.();
  };

  // Calculate target game count for current mode
  const targetCount = useMemo(() => {
    if (activeTab === 'all') return games.length;
    if (activeTab === 'single') {
      return games.filter(g => g.systemKey === selectedSingleSystem).length;
    }
    return 0;
  }, [activeTab, games, selectedSingleSystem]);

  const selectedSystemObj = useMemo(() => {
    return activeSystems.find(s => s.key === selectedSingleSystem) || null;
  }, [activeSystems, selectedSingleSystem]);

  if (!isOpen) return null;

  // Open the scan mode confirmation prompt
  const handleOpenPrompt = () => {
    if (targetCount === 0 || scraper?.isScraping) return;
    sfx?.playThemeSwitch?.();
    setShowModePrompt(true);
    setFocusedTarget?.({ zone: 'scraperModal', id: 'mode-smart' });
  };

  // Start the actual scrape run with chosen mode
  const handleConfirmScan = async () => {
    if (!scraper || scraper.isScraping) return;
    sfx?.playThemeSwitch?.();
    setShowModePrompt(false);

    const forceOverwrite = (scanMode === 'force');
    let result = null;
    if (activeTab === 'all') {
      result = await scraper.scrapeAll(undefined, forceOverwrite, { targetScope: 'all', scopeName: 'All Systems' });
    } else if (activeTab === 'single') {
      if (selectedSingleSystem) {
        result = await scraper.scrapeSystem(selectedSingleSystem, forceOverwrite);
      }
    }

    if (result) {
      sfx?.playGameSave?.();
      setFocusedTarget?.({ zone: 'scraperModal', id: 'done' });
    }
  };

  const handleScrapeAgain = () => {
    scraper?.clearScrapeSummary?.();
    setShowLogs(false);
    setShowModePrompt(false);
    sfx?.playTabSwitch?.();
    setFocusedTarget?.({ zone: 'scraperModal', id: 'start' });
  };

  const handleClose = () => {
    if (scraper?.isScraping) return;
    setShowModePrompt(false);
    setShowLogs(false);
    onClose();
  };

  const isScraping = Boolean(scraper?.isScraping);
  const summary = scraper?.lastScrapeSummary || null;
  const progressCurrent = scraper?.scrapeProgress?.current || 0;
  const progressTotal = scraper?.scrapeProgress?.total || targetCount || 1;
  const progressPct = Math.min(100, Math.round((progressCurrent / Math.max(1, progressTotal)) * 100));

  return (
    <div className="info-modal-backdrop animate-fade-in" onClick={isScraping ? undefined : handleClose}>
      <div className="scraper-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <header className="scraper-modal-header">
          <div className="scraper-modal-title-group">
            <div className="scraper-icon-bubble">
              <Sparkles size={22} color="#f59e0b" />
            </div>
            <div>
              <h2>Metadata & 3D Box Art Scraper</h2>
              <p>
                {isScraping 
                  ? 'Library scan and metadata retrieval in progress' 
                  : summary 
                    ? 'Scan completed — telemetry summary' 
                    : showModePrompt
                      ? 'Confirm scan strategy & caching mode'
                      : 'Choose library scan target or single system scope'}
              </p>
            </div>
          </div>
        </header>

        {/* Scope Mode Selector Tabs (Visible when not actively scraping, no prompt, and no summary showing) */}
        {!isScraping && !summary && !showModePrompt && (
          <div className="scraper-scope-tabs" role="tablist">
            <button
              className={`scraper-scope-tab ${activeTab === 'all' ? 'active' : ''} ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'tab-all' ? 'gamepad-focused' : ''}`}
              onClick={() => handleTabChange('all')}
              role="tab"
              aria-selected={activeTab === 'all'}
            >
              {gamepadConnected && <span className="tab-bumper-key">L</span>}
              <Layers size={16} />
              <span>All Systems ({games.length})</span>
            </button>

            <button
              className={`scraper-scope-tab ${activeTab === 'single' ? 'active' : ''} ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'tab-single' ? 'gamepad-focused' : ''}`}
              onClick={() => handleTabChange('single')}
              role="tab"
              aria-selected={activeTab === 'single'}
            >
              {gamepadConnected && <span className="tab-bumper-key">R</span>}
              <Disc size={16} />
              <span>Single System</span>
            </button>
          </div>
        )}

        {/* Scope Detail Content Pane */}
        <div className="scraper-modal-body">
          
          {/* STATE 1: ACTIVE LIVE SCANNING PROGRESS VIEW */}
          {isScraping && (
            <div className="scraper-live-scan-pane animate-fade-in">
              <div className="scraper-progress-card">
                <div className="scraper-progress-top">
                  <div className="scraper-progress-label-group">
                    <RefreshCw size={18} className="spin text-blue" />
                    <span className="scraper-progress-title">Scanning Game Library...</span>
                  </div>
                  <span className="scraper-progress-counter">{progressCurrent} / {progressTotal} ({progressPct}%)</span>
                </div>

                {/* Animated Progress Bar */}
                <div className="scraper-progress-bar-track">
                  <div 
                    className="scraper-progress-bar-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Current Active Title Telemetry */}
                <div className="scraper-progress-current-info">
                  <span className="scraper-scan-badge">CURRENT TITLE</span>
                  <p className="scraper-scan-title-name">
                    {scraper?.currentScrapeTitle || 'Resolving title...'}
                  </p>
                  {scraper?.currentScrapeSystem && (
                    <span className="scraper-scan-system-tag">{scraper.currentScrapeSystem}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: SCRAPE COMPLETION REPORT CARD (WITH POST-RUN DETAILED LOGS) */}
          {!isScraping && summary && (
            <div className="scraper-completion-pane animate-fade-in">
              <div className={`scraper-completion-header ${summary.status === 'stopped' ? 'is-stopped' : 'is-success'}`}>
                <div className="completion-icon-bubble">
                  {summary.status === 'stopped' ? (
                    <Square size={24} color="#ef4444" fill="currentColor" />
                  ) : (
                    <CheckCircle2 size={26} color="#10b981" />
                  )}
                </div>
                <div className="completion-title-group">
                  <h3>{summary.status === 'stopped' ? 'Scraping Stopped' : 'Scraping Completed Successfully!'}</h3>
                  <p>
                    Processed <strong>{summary.total} title{summary.total === 1 ? '' : 's'}</strong> across <strong>{summary.scopeName}</strong>.
                  </p>
                </div>
              </div>

              {/* Completion Metrics Grid */}
              <div className="scraper-summary-metrics-grid">
                <div className="summary-metric-card">
                  <div className="metric-icon-wrap bg-blue">
                    <Layers size={18} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-number">{summary.total}</span>
                    <span className="metric-label">Total Scanned</span>
                  </div>
                </div>

                <div className="summary-metric-card">
                  <div className="metric-icon-wrap bg-green">
                    <CheckCheck size={18} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-number">{summary.scraped}</span>
                    <span className="metric-label">Newly Updated</span>
                  </div>
                </div>

                <div className="summary-metric-card">
                  <div className="metric-icon-wrap bg-amber">
                    <Database size={18} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-number">{summary.alreadyCached}</span>
                    <span className="metric-label">Already Cached</span>
                  </div>
                </div>

                <div className="summary-metric-card">
                  <div className="metric-icon-wrap bg-purple">
                    <Image size={18} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-number">{summary.coversFound}</span>
                    <span className="metric-label">Box Art Verified</span>
                  </div>
                </div>
              </div>

              <div className="scraper-completion-notice">
                <p>
                  All metadata synopses and authentic 3D box art covers are stored directly inside local IndexedDB storage for zero-lag offline navigation.
                </p>
              </div>

              {/* Post-Run Logs Toggle & Terminal Console */}
              <div className="scraper-post-run-logs-section">
                <div className="scraper-post-run-logs-header">
                  <div className="logs-header-title-group">
                    <span className="logs-header-title">Diagnostic Telemetry</span>
                    {gamepadConnected && (
                      <span className="scraper-bumper-hint-badge">
                        {showLogs ? '🎮 [L] Scroll Up • [R] Scroll Down' : '🎮 Press [L] to View Logs'}
                      </span>
                    )}
                  </div>
                  <button
                    className={`scraper-toggle-logs-btn ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'toggle-logs' ? 'gamepad-focused' : ''}`}
                    onClick={() => {
                      setShowLogs(!showLogs);
                      sfx?.playTileNav?.();
                    }}
                  >
                    <Terminal size={14} />
                    <span>{showLogs ? 'Hide Detailed Logs' : 'View Detailed Logs'}</span>
                  </button>
                </div>

                {showLogs && (
                  <div className="scraper-terminal-view modal-embedded-terminal animate-fade-in">
                    {(!scraper?.logs || scraper.logs.length === 0) ? (
                      <div className="scraper-log-empty">
                        <span>No telemetry logs recorded.</span>
                      </div>
                    ) : (
                      <div className="scraper-logs-list">
                        {scraper.logs.slice(-60).map((log) => (
                          <div key={log.id} className={`scraper-log-row log-${log.type}`}>
                            <span className="log-time">[{log.time}]</span>
                            <span className="log-msg">{log.message}</span>
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE 3: SCAN MODE PROMPT STEP (WHEN START IS CLICKED) */}
          {!isScraping && !summary && showModePrompt && (
            <div className="scraper-mode-prompt-pane animate-fade-in">
              <div className="scraper-mode-prompt-header">
                <h3>Select Scraping Strategy</h3>
                <p>
                  Targeting <strong>{targetCount} title{targetCount === 1 ? '' : 's'}</strong> in <strong>{activeTab === 'all' ? 'All Systems' : (selectedSystemObj?.name || 'Single System')}</strong>.
                </p>
              </div>

              <div className="scraper-mode-cards-grid">
                {/* Mode 1: Smart Scan */}
                <button
                  className={`scraper-mode-card ${scanMode === 'smart' ? 'selected' : ''} ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'mode-smart' ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    setScanMode('smart');
                    sfx?.playTabSwitch?.();
                  }}
                >
                  <div className="mode-card-top">
                    <div className="mode-icon-bubble bg-green">
                      <Zap size={20} />
                    </div>
                    <span className="mode-badge recommended">Recommended</span>
                  </div>
                  <div className="mode-card-body">
                    <h4 className="mode-card-title">Smart Scan (Fast)</h4>
                    <p className="mode-card-desc">
                      Fills in missing synopsis and 3D box art covers. Keeps your existing verified IndexedDB cache intact without unnecessary network calls.
                    </p>
                  </div>
                  {scanMode === 'smart' && <Check size={18} className="mode-card-check" />}
                </button>

                {/* Mode 2: Force Re-fetch */}
                <button
                  className={`scraper-mode-card ${scanMode === 'force' ? 'selected' : ''} ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'mode-force' ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    setScanMode('force');
                    sfx?.playTabSwitch?.();
                  }}
                >
                  <div className="mode-card-top">
                    <div className="mode-icon-bubble bg-amber">
                      <RefreshCw size={20} />
                    </div>
                    <span className="mode-badge overwrite">Full Overwrite</span>
                  </div>
                  <div className="mode-card-body">
                    <h4 className="mode-card-title">Force Re-fetch</h4>
                    <p className="mode-card-desc">
                      Forces a fresh scan from remote Libretro CDN and Wikipedia APIs to update your IndexedDB cache, while safely preserving local companion covers and metadata in <code>/roms/</code>.
                    </p>
                  </div>
                  {scanMode === 'force' && <Check size={18} className="mode-card-check" />}
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: PRE-SCAN CONFIGURATION VIEW */}
          {!isScraping && !summary && !showModePrompt && (
            <>
              {/* TAB 1: ALL SYSTEMS */}
              {activeTab === 'all' && (
                <div className="scraper-tab-pane animate-fade-in">
                  <div className="scraper-scope-banner">
                    <Layers size={32} color="#3b82f6" />
                    <div>
                      <h4>Full Library Scan</h4>
                      <p>Scan authentic Libretro 3D box art and Wikipedia metadata across all <strong>{games.length} titles</strong> in all <strong>{activeSystems.length} active platforms</strong>.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SINGLE SYSTEM */}
              {activeTab === 'single' && (
                <div className="scraper-tab-pane animate-fade-in">
                  <p className="scraper-sub-label">Select a Console Platform to scrape:</p>
                  <div className="scraper-systems-grid">
                    {activeSystems.map((sys, sysIdx) => {
                      const isSelected = selectedSingleSystem === sys.key;
                      const isFocused = focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === `content-${sysIdx}`;
                      return (
                        <button
                          key={sys.key}
                          className={`scraper-sys-chip ${isSelected ? 'selected' : ''} ${isFocused ? 'gamepad-focused' : ''}`}
                          onClick={() => handleSelectSystem(sys.key)}
                        >
                          {sys.icon && <img src={resolveAssetPath(sys.icon)} alt="" className="sys-chip-icon" />}
                          <div className="sys-chip-text">
                            <span className="sys-chip-name">{sys.name}</span>
                            <span className="sys-chip-count">{sys.gameCount} games</span>
                          </div>
                          {isSelected && <Check size={16} className="sys-chip-check" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Action Footer */}
        <footer className="scraper-modal-footer">
          <div className="scraper-footer-status">
            {isScraping ? (
              <span className="status-badge scraping">
                <RefreshCw size={14} className="spin" /> Scraping in progress ({progressCurrent}/{progressTotal})...
              </span>
            ) : summary ? (
              <span className="status-badge ready">
                <CheckCircle2 size={14} /> Scan finished — library verified
              </span>
            ) : showModePrompt ? (
              <span className="status-badge ready">
                ● Selected mode: <strong>{scanMode === 'smart' ? 'Smart Scan' : 'Force Re-fetch'}</strong>
              </span>
            ) : (
              <span className="status-badge ready">
                ● Ready to scrape <strong>{targetCount} game{targetCount === 1 ? '' : 's'}</strong>
              </span>
            )}
          </div>

          <div className="scraper-footer-actions">
            {/* 1. When Completed */}
            {!isScraping && summary ? (
              <>
                <button 
                  className={`settings-action-btn folder-btn ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'scrape-again' ? 'gamepad-focused' : ''}`}
                  onClick={handleScrapeAgain}
                >
                  {gamepadConnected && <span className="osk-btn-badge badge-x">X</span>}
                  <RotateCcw size={15} />
                  <span>Scrape Again</span>
                </button>
                <button
                  className={`settings-action-btn primary ${focusedTarget?.zone === 'scraperModal' && (focusedTarget?.id === 'done' || focusedTarget?.id === 'start') ? 'gamepad-focused' : ''}`}
                  onClick={handleClose}
                >
                  {gamepadConnected && <span className="osk-btn-badge badge-b">B</span>}
                  <Check size={16} />
                  <span>Done</span>
                </button>
              </>
            ) : isScraping ? (
              /* 2. When Scraping */
              <button 
                className={`settings-action-btn ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'stop' ? 'gamepad-focused' : ''}`}
                style={{ background: '#ef4444', color: '#fff', borderColor: '#dc2626' }}
                onClick={() => {
                  scraper.stopScrape();
                  sfx?.playModalClose?.();
                }}
              >
                <Square size={14} fill="currentColor" />
                <span>Stop Scraper</span>
              </button>
            ) : showModePrompt ? (
              /* 3. When in Scan Mode Prompt */
              <>
                <button 
                  className={`settings-action-btn folder-btn ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'prompt-back' ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    setShowModePrompt(false);
                    sfx?.playModalClose?.();
                    setFocusedTarget?.({ zone: 'scraperModal', id: 'start' });
                  }}
                >
                  {gamepadConnected && <span className="osk-btn-badge badge-b">B</span>}
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <button
                  className={`settings-action-btn primary ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'prompt-confirm' ? 'gamepad-focused' : ''}`}
                  onClick={handleConfirmScan}
                >
                  {gamepadConnected && <span className="osk-btn-badge badge-x">X</span>}
                  <Play size={15} fill="currentColor" />
                  <span>Confirm & Start</span>
                </button>
              </>
            ) : (
              /* 4. When Ready (Initial Scope Selection) */
              <>
                <button 
                  className={`settings-action-btn folder-btn ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`} 
                  onClick={handleClose}
                >
                  {gamepadConnected && <span className="osk-btn-badge badge-b">B</span>}
                  <span>Cancel</span>
                </button>
                <button
                  className={`settings-action-btn primary ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'start' ? 'gamepad-focused' : ''}`}
                  disabled={targetCount === 0}
                  onClick={handleOpenPrompt}
                >
                  {gamepadConnected && <span className="osk-btn-badge badge-x">X</span>}
                  <Sparkles size={16} />
                  <span>Start Scraping ({targetCount})</span>
                </button>
              </>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
}

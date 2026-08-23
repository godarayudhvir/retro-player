import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Square, 
  Check, 
  Layers, 
  Disc, 
  Terminal
} from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Universal Scraper Scope & Target Selector Modal Dialog.
 * Allows choosing between:
 * 1. All Systems (Entire Library)
 * 2. Single System
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
  focusedTarget,
  setFocusedTarget
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'single'
  const [selectedSingleSystem, setSelectedSingleSystem] = useState('');
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

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

  // Calculate target game count for current mode
  const targetCount = useMemo(() => {
    if (activeTab === 'all') return games.length;
    if (activeTab === 'single') {
      return games.filter(g => g.systemKey === selectedSingleSystem).length;
    }
    return 0;
  }, [activeTab, games, selectedSingleSystem]);

  if (!isOpen) return null;

  // Execution triggers
  const handleStartScrape = async () => {
    if (!scraper) return;
    sfx?.playThemeSwitch?.();

    if (activeTab === 'all') {
      await scraper.scrapeAll(undefined, forceOverwrite);
    } else if (activeTab === 'single') {
      if (selectedSingleSystem) {
        await scraper.scrapeSystem(selectedSingleSystem, forceOverwrite);
      }
    }
  };

  return (
    <div className="info-modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="scraper-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <header className="scraper-modal-header">
          <div className="scraper-modal-title-group">
            <div className="scraper-icon-bubble">
              <Sparkles size={22} color="#f59e0b" />
            </div>
            <div>
              <h2>Metadata & 3D Box Art Scraper</h2>
              <p>Choose library scan target or single system scope</p>
            </div>
          </div>

          <button 
            className="info-close-btn" 
            onClick={onClose} 
            title="Close (Esc / B)"
            aria-label="Close Dialog"
            id="scraper-close-btn"
          >
            <X size={20} />
          </button>
        </header>

        {/* Scope Mode Selector Tabs */}
        <div className="scraper-scope-tabs" role="tablist">
          <button
            className={`scraper-scope-tab ${activeTab === 'all' ? 'active' : ''} ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'tab-all' ? 'gamepad-focused' : ''}`}
            onClick={() => { setActiveTab('all'); sfx?.playTabSwitch?.(); }}
            role="tab"
            aria-selected={activeTab === 'all'}
          >
            <Layers size={16} />
            <span>All Systems ({games.length})</span>
          </button>

          <button
            className={`scraper-scope-tab ${activeTab === 'single' ? 'active' : ''} ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'tab-single' ? 'gamepad-focused' : ''}`}
            onClick={() => { setActiveTab('single'); sfx?.playTabSwitch?.(); }}
            role="tab"
            aria-selected={activeTab === 'single'}
          >
            <Disc size={16} />
            <span>Single System</span>
          </button>
        </div>

        {/* Scope Detail Content Pane */}
        <div className="scraper-modal-body">
          
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
                      onClick={() => {
                        setSelectedSingleSystem(sys.key);
                        sfx?.playTabSwitch?.();
                      }}
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

          {/* Options & Force Overwrite Toggle */}
          <div className="scraper-options-row">
            <label className="scraper-checkbox-label">
              <input
                type="checkbox"
                checked={forceOverwrite}
                onChange={(e) => setForceOverwrite(e.target.checked)}
              />
              <span>Force Re-fetch (Overwrite Existing IndexedDB Cache)</span>
            </label>

            <button
              className="scraper-toggle-logs-btn"
              onClick={() => setShowLogs(!showLogs)}
            >
              <Terminal size={14} />
              <span>{showLogs ? 'Hide Live Logs' : 'Show Live Logs'}</span>
            </button>
          </div>

          {/* Collapsible Live Telemetry Logs Console */}
          {showLogs && (
            <div className="scraper-terminal-view modal-embedded-terminal animate-fade-in">
              {(!scraper?.logs || scraper.logs.length === 0) ? (
                <div className="scraper-log-empty">
                  <span>No live scraper events recorded yet. Start a scan above to stream telemetry.</span>
                </div>
              ) : (
                <div className="scraper-logs-list">
                  {scraper.logs.slice(-50).map((log) => (
                    <div key={log.id} className={`scraper-log-row log-${log.type}`}>
                      <span className="log-time">[{log.time}]</span>
                      <span className="log-msg">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <footer className="scraper-modal-footer">
          <div className="scraper-footer-status">
            {scraper?.isScraping ? (
              <span className="status-badge scraping">
                <RefreshCw size={14} className="spin" /> Scraping in progress ({scraper.scrapeProgress.current}/{scraper.scrapeProgress.total})...
              </span>
            ) : (
              <span className="status-badge ready">
                ● Ready to scrape <strong>{targetCount} game{targetCount === 1 ? '' : 's'}</strong>
              </span>
            )}
          </div>

          <div className="scraper-footer-actions">
            <button className={`settings-action-btn folder-btn ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`} onClick={onClose}>
              <span>Cancel</span>
            </button>

            {scraper?.isScraping ? (
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
            ) : (
              <button
                className={`settings-action-btn primary ${focusedTarget?.zone === 'scraperModal' && focusedTarget?.id === 'start' ? 'gamepad-focused' : ''}`}
                disabled={targetCount === 0}
                onClick={handleStartScrape}
              >
                <Sparkles size={16} />
                <span>Start Scraping ({targetCount})</span>
              </button>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
}

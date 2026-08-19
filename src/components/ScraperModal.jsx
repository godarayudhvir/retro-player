import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Square, 
  Search, 
  Check, 
  Layers, 
  Disc, 
  CheckSquare, 
  Square as EmptySquare, 
  Terminal, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Universal Scraper Scope & Target Selector Modal Dialog.
 * Allows choosing between:
 * 1. Single System
 * 2. Bunch / Multi-Selection of Systems
 * 3. All Systems (Entire Library)
 * 4. Individual Title Quick-Picker
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
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'single', 'multi', 'title'
  const [selectedSingleSystem, setSelectedSingleSystem] = useState('');
  const [selectedMultiSystems, setSelectedMultiSystems] = useState([]);
  const [gameSearch, setGameSearch] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const searchInputRef = useRef(null);

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

  // Filtered games for individual title search
  const filteredGames = useMemo(() => {
    if (!gameSearch.trim()) return games.slice(0, 30);
    const q = gameSearch.toLowerCase().trim();
    return games.filter(g => 
      g.title.toLowerCase().includes(q) || 
      (g.systemName && g.systemName.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [games, gameSearch]);

  // Calculate target game count for current mode
  const targetCount = useMemo(() => {
    if (activeTab === 'all') return games.length;
    if (activeTab === 'single') {
      return games.filter(g => g.systemKey === selectedSingleSystem).length;
    }
    if (activeTab === 'multi') {
      return games.filter(g => selectedMultiSystems.includes(g.systemKey)).length;
    }
    if (activeTab === 'title') {
      return selectedGameId ? 1 : 0;
    }
    return 0;
  }, [activeTab, games, selectedSingleSystem, selectedMultiSystems, selectedGameId]);

  if (!isOpen) return null;

  // Toggle a system in the multi-select bunch
  const toggleMultiSystem = (sysKey) => {
    setSelectedMultiSystems(prev => 
      prev.includes(sysKey) 
        ? prev.filter(k => k !== sysKey) 
        : [...prev, sysKey]
    );
    sfx?.playTabSwitch?.();
  };

  const selectAllMultiSystems = () => {
    setSelectedMultiSystems(activeSystems.map(s => s.key));
    sfx?.playTabSwitch?.();
  };

  const clearAllMultiSystems = () => {
    setSelectedMultiSystems([]);
    sfx?.playTabSwitch?.();
  };

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
    } else if (activeTab === 'multi') {
      if (selectedMultiSystems.length > 0) {
        await scraper.scrapeSystems(selectedMultiSystems, forceOverwrite);
      }
    } else if (activeTab === 'title') {
      const targetGame = games.find(g => g.id === selectedGameId || g.title === selectedGameId);
      if (targetGame) {
        await scraper.scrapeSingleGame(targetGame, forceOverwrite);
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
              <p>Choose library scan target, system scope, or individual titles</p>
            </div>
          </div>

          <button 
            className="info-close-btn" 
            onClick={onClose} 
            title="Close (Esc / B)"
            aria-label="Close Dialog"
          >
            <X size={20} />
          </button>
        </header>

        {/* Scope Mode Selector Tabs */}
        <div className="scraper-scope-tabs" role="tablist">
          <button
            className={`scraper-scope-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); sfx?.playTabSwitch?.(); }}
            role="tab"
            aria-selected={activeTab === 'all'}
          >
            <Layers size={16} />
            <span>All Systems ({games.length})</span>
          </button>

          <button
            className={`scraper-scope-tab ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => { setActiveTab('single'); sfx?.playTabSwitch?.(); }}
            role="tab"
            aria-selected={activeTab === 'single'}
          >
            <Disc size={16} />
            <span>Single System</span>
          </button>

          <button
            className={`scraper-scope-tab ${activeTab === 'multi' ? 'active' : ''}`}
            onClick={() => { setActiveTab('multi'); sfx?.playTabSwitch?.(); }}
            role="tab"
            aria-selected={activeTab === 'multi'}
          >
            <CheckSquare size={16} />
            <span>Bunch of Systems ({selectedMultiSystems.length})</span>
          </button>

          <button
            className={`scraper-scope-tab ${activeTab === 'title' ? 'active' : ''}`}
            onClick={() => { setActiveTab('title'); sfx?.playTabSwitch?.(); }}
            role="tab"
            aria-selected={activeTab === 'title'}
          >
            <Search size={16} />
            <span>Individual Title</span>
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
                {activeSystems.map((sys) => {
                  const isSelected = selectedSingleSystem === sys.key;
                  return (
                    <button
                      key={sys.key}
                      className={`scraper-sys-chip ${isSelected ? 'selected' : ''}`}
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

          {/* TAB 3: BUNCH OF SYSTEMS (MULTI-SELECT) */}
          {activeTab === 'multi' && (
            <div className="scraper-tab-pane animate-fade-in">
              <div className="scraper-multi-header">
                <p className="scraper-sub-label">Select which systems to include in batch:</p>
                <div className="scraper-multi-actions">
                  <button className="scraper-pill-btn" onClick={selectAllMultiSystems}>Select All</button>
                  <button className="scraper-pill-btn" onClick={clearAllMultiSystems}>Clear Selection</button>
                </div>
              </div>

              <div className="scraper-systems-grid">
                {activeSystems.map((sys) => {
                  const isSelected = selectedMultiSystems.includes(sys.key);
                  return (
                    <button
                      key={sys.key}
                      className={`scraper-sys-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleMultiSystem(sys.key)}
                    >
                      <span className="sys-checkbox-icon">
                        {isSelected ? <CheckSquare size={16} color="#3b82f6" /> : <EmptySquare size={16} color="#94a3b8" />}
                      </span>
                      {sys.icon && <img src={resolveAssetPath(sys.icon)} alt="" className="sys-chip-icon" />}
                      <div className="sys-chip-text">
                        <span className="sys-chip-name">{sys.name}</span>
                        <span className="sys-chip-count">{sys.gameCount} games</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INDIVIDUAL TITLE SEARCH */}
          {activeTab === 'title' && (
            <div className="scraper-tab-pane animate-fade-in">
              <div className="scraper-game-search-box">
                <Search size={18} color="#64748b" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for game title (e.g. Zelda, Mario, Metroid)..."
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  className="scraper-game-search-input"
                />
                {gameSearch && (
                  <button className="scraper-clear-search-btn" onClick={() => setGameSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="scraper-game-picker-list">
                {filteredGames.length === 0 ? (
                  <div className="scraper-empty-picker">
                    <span>No games matching "{gameSearch}" found.</span>
                  </div>
                ) : (
                  filteredGames.map((g) => {
                    const isSelected = (selectedGameId === g.id || selectedGameId === g.title);
                    return (
                      <button
                        key={g.id || g.title}
                        className={`scraper-game-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedGameId(g.id || g.title);
                          sfx?.playTabSwitch?.();
                        }}
                      >
                        <div className="scraper-game-item-info">
                          <span className="scraper-game-sys-badge" style={{ background: g.systemColor || '#ef4444' }}>
                            {g.systemName || g.systemKey}
                          </span>
                          <span className="scraper-game-title-text">{g.title}</span>
                        </div>
                        {isSelected && <Check size={16} color="#3b82f6" />}
                      </button>
                    );
                  })
                )}
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
            <button className="settings-action-btn folder-btn" onClick={onClose}>
              <span>Cancel</span>
            </button>

            {scraper?.isScraping ? (
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

import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, FolderOpen, Wifi, Info, X, Play, Save, Cpu, Sparkles, CheckCircle2, Calendar, Gamepad2 } from 'lucide-react';
import EmulatorModal from './components/EmulatorModal';
import { getGameDescription, getReleaseDate } from './gameDescriptions';

function getCartridgeColor(game) {
  if (!game) return '#64748b';
  const title = (game.title || '').toLowerCase();
  
  if (title.includes('red') || title.includes('firered')) return '#dc2626';
  if (title.includes('blue')) return '#2563eb';
  if (title.includes('yellow')) return '#eab308';
  if (title.includes('gold') || title.includes('heartgold')) return '#d97706';
  if (title.includes('silver') || title.includes('soulsilver')) return '#78716c';
  if (title.includes('crystal')) return '#06b6d4';
  if (title.includes('ruby')) return '#e11d48';
  if (title.includes('sapphire')) return '#1d4ed8';
  if (title.includes('emerald')) return '#059669';
  if (title.includes('leafgreen') || title.includes('green')) return '#16a34a';
  if (title.includes('diamond')) return '#0284c7';
  if (title.includes('pearl')) return '#db2777';
  if (title.includes('platinum')) return '#475569';
  if (title.includes('black')) return '#1e293b';
  if (title.includes('white')) return '#94a3b8';

  return game.systemColor || '#64748b';
}

export default function App() {
  const [games, setGames] = useState([]);
  const [systems, setSystems] = useState([]);
  const [activeSystem, setActiveSystem] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);
  const [selectedGameCard, setSelectedGameCard] = useState(null);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [focusedTarget, setFocusedTarget] = useState({ zone: 'grid', index: 0 });
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stateRef = useRef({
    activeSystem: 'all',
    focusedTarget: { zone: 'grid', index: 0 },
    activeGame: null,
    games: [],
    systems: []
  });

  const lastInputTimeRef = useRef(0);
  const prevButtonsRef = useRef({});

  // Global error logger
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('🚨 [GLOBAL UNHANDLED RUNTIME ERROR]:', event.error || event.message, 'At:', event.filename, 'Line:', event.lineno);
    };

    const handleUnhandledRejection = (event) => {
      console.error('🚨 [UNHANDLED PROMISE REJECTION]:', event.reason);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    console.log('📡 [CLIENT FETCH] Requesting ROM manifest from /api/roms...');
    try {
      const res = await fetch('/api/roms');
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [CLIENT FETCH SUCCESS] Indexed ${data.games?.length || 0} games across ${data.systems?.length || 0} systems.`);
        setGames(data.games || []);
        setSystems(data.systems || []);
      } else {
        console.error(`🚨 [CLIENT FETCH API ERROR] Server responded with HTTP status ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.error('🚨 [CLIENT FETCH NETWORK ERROR] Failed fetching games from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const filteredGames = games
    .filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            game.systemName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSystem = activeSystem === 'all' || game.systemKey === activeSystem;
      return matchesSearch && matchesSystem;
    })
    .sort((a, b) => {
      const dateA = getReleaseDate(a);
      const dateB = getReleaseDate(b);
      return dateA.localeCompare(dateB);
    });

  useEffect(() => {
    stateRef.current = {
      activeSystem,
      focusedTarget,
      activeGame,
      selectedGameCard,
      showInfoModal,
      filteredGames,
      systems
    };
  }, [activeSystem, focusedTarget, activeGame, selectedGameCard, showInfoModal, filteredGames, systems]);

  useEffect(() => {
    const activeTab = document.querySelector('.system-tab.active');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSystem]);

  const checkSaveData = async (game) => {
    if (!game) return false;
    try {
      const gameId = (game.id || '').toLowerCase();
      const rawTitle = (game.rawTitle || '').toLowerCase();
      const filename = (game.filename || '').toLowerCase();

      // Check LocalStorage keys specifically for this game
      const keys = Object.keys(localStorage);
      const hasLs = keys.some(k => {
        const lowerK = k.toLowerCase();
        return (gameId && lowerK.includes(gameId)) ||
               (rawTitle && lowerK.includes(rawTitle)) ||
               (filename && lowerK.includes(filename));
      });
      if (hasLs) return true;

      // Check IndexedDB database names specifically for this game
      if (window.indexedDB && indexedDB.databases) {
        const dbs = await indexedDB.databases();
        const hasDb = dbs.some(db => {
          if (!db.name) return false;
          const dbName = db.name.toLowerCase();
          return (gameId && dbName.includes(gameId)) ||
                 (rawTitle && dbName.includes(rawTitle));
        });
        if (hasDb) return true;
      }
    } catch (err) {
      console.warn('⚠️ [SAVE CHECK WARN] Failed inspecting save storage:', err);
    }
    return false;
  };

  const handleGameSelect = async (game) => {
    setSelectedGameCard(game);
    const saveExists = await checkSaveData(game);
    setHasSaveData(saveExists);
  };

  // Unified Spatial Navigation Engine across topbar, ribbon, grid, HUD, & modals
  const navigateSpatial = (dir) => {
    const { showInfoModal, selectedGameCard, activeGame, filteredGames, systems, activeSystem, focusedTarget } = stateRef.current;

    // 1. Info Modal Navigation
    if (showInfoModal) {
      if (dir === 'BACK') {
        setShowInfoModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'info' });
        return;
      }
      if (dir === 'LEFT' || dir === 'UP') {
        setFocusedTarget({ zone: 'infoModal', id: 'close' });
      } else if (dir === 'RIGHT' || dir === 'DOWN') {
        setFocusedTarget({ zone: 'infoModal', id: 'ack' });
      } else if (dir === 'SELECT') {
        setShowInfoModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'info' });
      }
      return;
    }

    // 2. Selected Game Card Modal Navigation
    if (selectedGameCard) {
      if (dir === 'BACK') {
        setSelectedGameCard(null);
        setFocusedTarget({ zone: 'grid', index: focusedTarget?.index || 0 });
        return;
      }
      if (dir === 'UP' || dir === 'LEFT') {
        setFocusedTarget({ zone: 'cardModal', id: 'close' });
      } else if (dir === 'DOWN' || dir === 'RIGHT') {
        setFocusedTarget({ zone: 'cardModal', id: 'play' });
      } else if (dir === 'SELECT') {
        if (focusedTarget?.id === 'close') {
          setSelectedGameCard(null);
          setFocusedTarget({ zone: 'grid', index: focusedTarget?.index || 0 });
        } else {
          const gameToPlay = selectedGameCard;
          setSelectedGameCard(null);
          setActiveGame(gameToPlay);
        }
      }
      return;
    }

    // 3. Active Game (Emulator)
    if (activeGame) {
      if (dir === 'BACK') {
        setActiveGame(null);
        setFocusedTarget({ zone: 'grid', index: focusedTarget?.index || 0 });
      }
      return;
    }

    // 4. Main View Navigation
    const activeSysList = systems.filter(s => s.gameCount > 0);
    const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
    const allTabs = [{ key: 'all' }, ...sortedSystems];

    const curZone = focusedTarget?.zone || 'grid';
    const curIndex = focusedTarget?.index || 0;
    const curId = focusedTarget?.id;

    if (dir === 'BACK') {
      if (curZone !== 'grid') {
        setFocusedTarget({ zone: 'grid', index: 0 });
      }
      return;
    }

    if (dir === 'SELECT') {
      if (curZone === 'topbar') {
        if (curId === 'search') {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
        } else if (curId === 'info') {
          setShowInfoModal(true);
          setFocusedTarget({ zone: 'infoModal', id: 'ack' });
        }
      } else if (curZone === 'ribbon') {
        if (allTabs[curIndex]) {
          setActiveSystem(allTabs[curIndex].key);
          setFocusedTarget({ zone: 'grid', index: 0 });
        }
      } else if (curZone === 'grid') {
        if (filteredGames[curIndex]) {
          handleGameSelect(filteredGames[curIndex]);
          setFocusedTarget({ zone: 'cardModal', id: 'play' });
        } else if (filteredGames.length === 0) {
          fetchGames();
        }
      } else if (curZone === 'hud') {
        fetchGames();
      }
      return;
    }

    // Directional (UP, DOWN, LEFT, RIGHT)
    if (curZone === 'topbar') {
      if (dir === 'LEFT') {
        setFocusedTarget({ zone: 'topbar', id: 'search' });
      } else if (dir === 'RIGHT') {
        setFocusedTarget({ zone: 'topbar', id: 'info' });
      } else if (dir === 'DOWN') {
        const sysIdx = allTabs.findIndex(t => t.key === activeSystem);
        setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
      }
    } else if (curZone === 'ribbon') {
      if (dir === 'LEFT') {
        const nextIdx = Math.max(0, curIndex - 1);
        setActiveSystem(allTabs[nextIdx].key);
        setFocusedTarget({ zone: 'ribbon', index: nextIdx });
      } else if (dir === 'RIGHT') {
        const nextIdx = Math.min(allTabs.length - 1, curIndex + 1);
        setActiveSystem(allTabs[nextIdx].key);
        setFocusedTarget({ zone: 'ribbon', index: nextIdx });
      } else if (dir === 'UP') {
        setFocusedTarget({ zone: 'topbar', id: curIndex < allTabs.length / 2 ? 'search' : 'info' });
      } else if (dir === 'DOWN') {
        setFocusedTarget({ zone: 'grid', index: 0 });
      }
    } else if (curZone === 'grid') {
      if (filteredGames.length === 0) {
        if (dir === 'UP') {
          const sysIdx = allTabs.findIndex(t => t.key === activeSystem);
          setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
        } else if (dir === 'DOWN') {
          setFocusedTarget({ zone: 'hud', id: 'rescan' });
        }
        return;
      }

      if (dir === 'RIGHT') {
        const nextIdx = Math.min(curIndex + 2, filteredGames.length - 1);
        setFocusedTarget({ zone: 'grid', index: nextIdx });
      } else if (dir === 'LEFT') {
        const nextIdx = Math.max(0, curIndex - 2);
        setFocusedTarget({ zone: 'grid', index: nextIdx });
      } else if (dir === 'UP') {
        if (curIndex % 2 === 1) {
          setFocusedTarget({ zone: 'grid', index: curIndex - 1 });
        } else {
          const sysIdx = allTabs.findIndex(t => t.key === activeSystem);
          setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
        }
      } else if (dir === 'DOWN') {
        if (curIndex % 2 === 0 && curIndex + 1 < filteredGames.length) {
          setFocusedTarget({ zone: 'grid', index: curIndex + 1 });
        } else {
          setFocusedTarget({ zone: 'hud', id: 'rescan' });
        }
      }
    } else if (curZone === 'hud') {
      if (dir === 'UP') {
        const lastIdx = Math.max(0, filteredGames.length - 1);
        setFocusedTarget({ zone: 'grid', index: lastIdx });
      }
    }
  };

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K search shortcut
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setFocusedTarget({ zone: 'topbar', id: 'search' });
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          searchInputRef.current.blur();
          if (e.key === 'ArrowDown') {
            navigateSpatial('DOWN');
          }
        }
        return;
      }

      if (document.activeElement.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          navigateSpatial('RIGHT');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          navigateSpatial('LEFT');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          navigateSpatial('DOWN');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          navigateSpatial('UP');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          navigateSpatial('SELECT');
          break;
        case 'Escape':
        case 'Esc':
        case 'Backspace':
          e.preventDefault();
          navigateSpatial('BACK');
          break;
        case 'q':
        case 'Q':
        case 'PageUp':
          e.preventDefault();
          {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx - 1 + allSysKeys.length) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
          }
          break;
        case 'e':
        case 'E':
        case 'PageDown':
          e.preventDefault();
          {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx + 1) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // HTML5 Gamepad Polling Engine
  const gamepadConnectedRef = useRef(false);
  useEffect(() => {
    let animId;

    const handleConnect = (e) => {
      console.log(`🎮 [GAMEPAD CONNECTED] Controller detected: "${e.gamepad?.id || 'Standard Gamepad'}"`);
      gamepadConnectedRef.current = true;
      setGamepadConnected(true);
    };

    const handleDisconnect = (e) => {
      console.log(`🔌 [GAMEPAD DISCONNECTED] Controller removed: "${e.gamepad?.id || 'Gamepad'}"`);
      gamepadConnectedRef.current = false;
      setGamepadConnected(false);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let gp = null;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
          gp = gamepads[i];
          break;
        }
      }

      if (gp) {
        if (!gamepadConnectedRef.current) {
          gamepadConnectedRef.current = true;
          setGamepadConnected(true);
        }

        const now = Date.now();
        const COOLDOWN = 200;

        const b = gp.buttons;
        const axes = gp.axes;

        const dpadUp = b[12]?.pressed || axes[1] < -0.55;
        const dpadDown = b[13]?.pressed || axes[1] > 0.55;
        const dpadLeft = b[14]?.pressed || axes[0] < -0.55;
        const dpadRight = b[15]?.pressed || axes[0] > 0.55;
        
        const btnA = b[0]?.pressed;
        const btnB = b[1]?.pressed;
        
        const shoulderL = b[4]?.pressed || b[6]?.pressed || b[4]?.value > 0.5;
        const shoulderR = b[5]?.pressed || b[7]?.pressed || b[5]?.value > 0.5;

        if (now - lastInputTimeRef.current > COOLDOWN) {
          let moved = false;

          if (dpadRight) {
            navigateSpatial('RIGHT');
            moved = true;
          } else if (dpadLeft) {
            navigateSpatial('LEFT');
            moved = true;
          } else if (dpadDown) {
            navigateSpatial('DOWN');
            moved = true;
          } else if (dpadUp) {
            navigateSpatial('UP');
            moved = true;
          } else if (btnA && !prevButtonsRef.current.btnA) {
            navigateSpatial('SELECT');
            moved = true;
          } else if (btnB && !prevButtonsRef.current.btnB) {
            navigateSpatial('BACK');
            moved = true;
          } else if (shoulderL && !prevButtonsRef.current.shoulderL) {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx - 1 + allSysKeys.length) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
            moved = true;
          } else if (shoulderR && !prevButtonsRef.current.shoulderR) {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx + 1) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
            moved = true;
          }

          if (moved) {
            lastInputTimeRef.current = now;
          }
        }

        prevButtonsRef.current = { shoulderL, shoulderR, btnA, btnB };
      } else {
        if (gamepadConnectedRef.current) {
          gamepadConnectedRef.current = false;
          setGamepadConnected(false);
        }
      }

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Auto-scroll focused element into view
  useEffect(() => {
    if (focusedTarget.zone === 'grid') {
      const focusedTile = document.querySelector('.game-tile.gamepad-focused');
      if (focusedTile) {
        focusedTile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else if (focusedTarget.zone === 'ribbon') {
      const focusedTab = document.querySelector('.system-tab.gamepad-focused');
      if (focusedTab) {
        focusedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [focusedTarget]);

  const selectedSystemInfo = systems.find(s => s.key === activeSystem);

  return (
    <div className="console-container">
      {/* Console Top Status Bar */}
      <header className="console-topbar">
        <div className="topbar-left">
          <div className="avatar-badge">
            <Gamepad2 size={24} color="#ef4444" />
          </div>
          <span className="user-tag">RETRO PLAYER</span>
        </div>

        <div className="topbar-center-capsule">
          <button 
            className="shoulder-btn left-shoulder" 
            onClick={() => {
              const availableKeys = ['all', ...systems.filter(s => s.gameCount > 0).sort((a, b) => b.gameCount - a.gameCount).map(s => s.key)];
              const prevIdx = (availableKeys.indexOf(activeSystem) - 1 + availableKeys.length) % availableKeys.length;
              setActiveSystem(availableKeys[prevIdx]);
              setFocusedTarget({ zone: 'ribbon', index: prevIdx });
            }}
            title="Previous System (L / Q)"
          >
            <span className="shoulder-trigger">L1</span>
            <span className="shoulder-key-tag">{gamepadConnected ? 'L' : 'Q'}</span>
          </button>

          <div className="shoulder-divider" />

          <button 
            className="shoulder-btn right-shoulder" 
            onClick={() => {
              const availableKeys = ['all', ...systems.filter(s => s.gameCount > 0).sort((a, b) => b.gameCount - a.gameCount).map(s => s.key)];
              const nextIdx = (availableKeys.indexOf(activeSystem) + 1) % availableKeys.length;
              setActiveSystem(availableKeys[nextIdx]);
              setFocusedTarget({ zone: 'ribbon', index: nextIdx });
            }}
            title="Next System (R / E)"
          >
            <span className="shoulder-key-tag">{gamepadConnected ? 'R' : 'E'}</span>
            <span className="shoulder-trigger">R1</span>
          </button>
        </div>

        <div className="topbar-right">
          <div className="status-pill" style={{ color: gamepadConnected ? '#10b981' : '#64748b' }}>
            <Wifi size={16} />
            <span>{gamepadConnected ? 'GAMEPAD READY' : 'NO CONTROLLER'}</span>
          </div>

          <div className={`status-pill ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'search' ? 'gamepad-focused' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setFocusedTarget({ zone: 'topbar', id: 'search' })}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.85rem',
                width: '100px',
                color: 'inherit'
              }}
            />
            <kbd className="lr-badge" style={{ fontSize: '0.7rem', padding: '2px 6px', pointerEvents: 'none', userSelect: 'none' }}>
              {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform) ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </div>

          <button
            className={`status-pill info-btn ${focusedTarget.zone === 'topbar' && focusedTarget.id === 'info' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              setShowInfoModal(true);
              setFocusedTarget({ zone: 'infoModal', id: 'ack' });
            }}
            title="About Project"
            style={{
              cursor: 'pointer',
              border: '2px solid #ffffff',
              background: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease'
            }}
          >
            <Info size={16} color="#ef4444" />
            <span>INFO</span>
          </button>

          <div className="status-pill">
            <span>{time}</span>
          </div>
        </div>
      </header>

      {/* System Selection Ribbon */}
      <nav className="system-ribbon">
        <button
          className={`system-tab ${activeSystem === 'all' ? 'active' : ''} ${focusedTarget.zone === 'ribbon' && focusedTarget.index === 0 ? 'gamepad-focused' : ''}`}
          onClick={() => { setActiveSystem('all'); setFocusedTarget({ zone: 'ribbon', index: 0 }); }}
        >
          <span>All Games</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({games.length})</span>
        </button>

        {[...systems]
          .filter((sys) => sys.gameCount > 0)
          .sort((a, b) => b.gameCount - a.gameCount)
          .map((sys, idx) => (
            <button
              key={sys.key}
              className={`system-tab ${activeSystem === sys.key ? 'active' : ''} ${focusedTarget.zone === 'ribbon' && focusedTarget.index === idx + 1 ? 'gamepad-focused' : ''}`}
              onClick={() => { setActiveSystem(sys.key); setFocusedTarget({ zone: 'ribbon', index: idx + 1 }); }}
            >
              {sys.icon && <img src={sys.icon} alt="" className="tab-icon" />}
              <span>{sys.name}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({sys.gameCount})</span>
            </button>
          ))}
      </nav>

      {/* iiSU Main Tile Grid Viewport */}
      <main className="console-viewport">
        {filteredGames.length > 0 ? (
          <div className="tiles-grid">
            {filteredGames.map((game, index) => (
              <div
                key={game.id}
                className={`game-tile cartridge-shell ${focusedTarget.zone === 'grid' && focusedTarget.index === index ? 'gamepad-focused' : ''}`}
                onClick={() => { setFocusedTarget({ zone: 'grid', index }); handleGameSelect(game); }}
                title={game.title}
                style={{ '--cart-color': getCartridgeColor(game) }}
              >
                {/* Top Cartridge Header with Recessed Oval Stadium Capsule */}
                <div className="cartridge-header">
                  <div className="cartridge-grips left" />
                  <div className="cartridge-recessed-pill">
                    <span className="cartridge-brand-text">{game.systemName || 'GAME BOY'}</span>
                  </div>
                  <div className="cartridge-grips right" />
                </div>

                {/* Recessed Sticker Label Area */}
                <div className="cartridge-sticker-area">
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="tile-img cartridge-label-img"
                    onError={(e) => {
                      console.warn(`⚠️ [COVER LOAD ERROR] Cover image failed to load for game "${game.title}":`, game.coverUrl);
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="cartridge-label-sheen" />
                  <div className="tile-fallback" style={{ display: 'none' }}>
                    {game.systemIcon ? (
                      <img src={game.systemIcon} alt="" className="fallback-sys-icon" />
                    ) : (
                      <img src="/assets/pokeball.png" alt="" style={{ width: '40px', height: '40px', opacity: 0.7 }} />
                    )}
                  </div>
                </div>

                {/* Bottom Cartridge Notch Arrow */}
                <div className="cartridge-footer">
                  <div className="cartridge-arrow-down" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="console-empty">
            <FolderOpen size={56} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3>No Titles Registered</h3>
            <p>
              Drop your ROM files into <span className="code-block">public/roms/[system]</span>
              <br />
              Add custom channel artwork into <span className="code-block">public/assets/cover/[system]</span>
            </p>
            <button
              className={`system-tab active ${focusedTarget.zone === 'grid' ? 'gamepad-focused' : ''}`}
              onClick={fetchGames}
              style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Rescan Channels
            </button>
          </div>
        )}
      </main>

      {/* Console Bottom Controller HUD */}
      <footer className="console-hud">
        <div className="hud-button-group">
          <div className="hud-btn">
            <div className="button-icon-circle">{gamepadConnected ? 'LB / RB' : 'Q / E'}</div>
            <span>Switch System</span>
          </div>
          <div className="hud-btn">
            <div className="button-icon-circle">{gamepadConnected ? 'D-PAD / STICK' : 'ARROWS / WASD'}</div>
            <span>Navigate</span>
          </div>
          <div className="hud-btn">
            <div className="button-icon-circle">{gamepadConnected ? 'A BUTTON' : 'ENTER / SPACE'}</div>
            <span>Launch Game</span>
          </div>
          <div className="hud-btn">
            <div className="button-icon-circle">{gamepadConnected ? 'B BUTTON' : 'ESC / BACKSPACE'}</div>
            <span>Back</span>
          </div>
        </div>
      </footer>

      {/* About Project Info Modal */}
      {showInfoModal && (
        <div className="info-modal-backdrop" onClick={() => setShowInfoModal(false)}>
          <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Gamepad2 size={28} color="#ef4444" />
                <h2>Retro Player</h2>
              </div>
              <button
                className={`info-close-btn ${focusedTarget.zone === 'infoModal' && focusedTarget.id === 'close' ? 'gamepad-focused' : ''}`}
                onClick={() => setShowInfoModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="info-modal-body">
              <p className="info-tagline">
                A modern, high-performance web-based retro game launcher and emulator library for classic retro console games.
              </p>

              <div className="info-section">
                <h3>✨ Key Features</h3>
                <ul>
                  <li><strong>🕹️ Multi-System Emulation:</strong> GB, GBC, GBA, NES, SNES, N64, NDS, Genesis, PS1, & Arcade via EmulatorJS.</li>
                  <li><strong>🖼️ Dynamic Cover Scanner:</strong> Auto-pairs ROMs in <code>public/roms/</code> with covers in <code>public/cover/</code>.</li>
                  <li><strong>🎮 Handheld Gamepad Navigation:</strong> Full DPAD, thumbstick, and shoulder button cycling support.</li>
                  <li><strong>📊 Dynamic System Ribbon:</strong> Consoles with the most games appear first automatically.</li>
                  <li><strong>🚀 Zero-Config Setup:</strong> Drop ROMs in platform folders to instantly index games.</li>
                </ul>
              </div>

              <div className="info-section">
                <h3>🎮 Handheld & Keyboard Controls</h3>
                <table className="info-controls-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Keyboard</th>
                      <th>Gamepad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Navigate Tiles</td>
                      <td>Arrow Keys / WASD</td>
                      <td>D-Pad / Left Stick</td>
                    </tr>
                    <tr>
                      <td>Switch System</td>
                      <td>Q / E</td>
                      <td>L1 / R1</td>
                    </tr>
                    <tr>
                      <td>Launch Game</td>
                      <td>Enter / Space</td>
                      <td>A Button</td>
                    </tr>
                    <tr>
                      <td>Close Emulator</td>
                      <td>Escape</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="info-modal-footer">
              <button
                className={`info-ack-btn ${focusedTarget.zone === 'infoModal' && focusedTarget.id === 'ack' ? 'gamepad-focused' : ''}`}
                onClick={() => setShowInfoModal(false)}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Detail Info Card Modal */}
      {selectedGameCard && (
        <div className="info-modal-backdrop" onClick={() => setSelectedGameCard(null)}>
          <div className="game-card-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className={`game-card-close ${focusedTarget.zone === 'cardModal' && focusedTarget.id === 'close' ? 'gamepad-focused' : ''}`}
              onClick={() => setSelectedGameCard(null)}
            >
              <X size={20} />
            </button>

            <div className="game-card-grid">
              <div className="game-card-cover-wrapper">
                <img
                  src={selectedGameCard.coverUrl}
                  alt={selectedGameCard.title}
                  className="game-card-cover-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="tile-fallback" style={{ display: 'none', width: '100%', height: '100%' }}>
                  <img src={selectedGameCard.systemIcon || "/assets/pokeball.png"} alt="" style={{ width: '60px', height: '60px' }} />
                </div>
              </div>

              <div className="game-card-details">
                <div className="game-card-header-badge">
                  <span className="game-card-sys-tag" style={{ '--sys-color': selectedGameCard.systemColor || '#ef4444' }}>
                    {selectedGameCard.systemIcon && (
                      <img src={selectedGameCard.systemIcon} alt="" className="tile-sys-badge-icon" />
                    )}
                    <span>{selectedGameCard.systemName}</span>
                  </span>
                  <span className="game-card-core-tag">
                    <Calendar size={14} /> {getReleaseDate(selectedGameCard)}
                  </span>
                  <span className="game-card-core-tag">
                    <Cpu size={14} /> {selectedGameCard.systemCore?.toUpperCase() || 'EMULATORJS'}
                  </span>
                </div>

                <h2 className="game-card-title">{selectedGameCard.title}</h2>
                <p className="game-card-description">{getGameDescription(selectedGameCard)}</p>

                {/* Save State Detector Badge */}
                <div className="save-status-container">
                  {hasSaveData ? (
                    <div className="save-badge has-save">
                      <Save size={16} />
                      <div className="save-text">
                        <strong>SAVE DATA DETECTED</strong>
                        <span>Saved battery RAM / state ready to resume</span>
                      </div>
                      <CheckCircle2 size={18} color="#10b981" />
                    </div>
                  ) : (
                    <div className="save-badge no-save">
                      <Save size={16} />
                      <div className="save-text">
                        <strong>NO SAVE DATA FOUND</strong>
                        <span>Start fresh session (Auto-saves on play)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="game-card-actions">
                  <button
                    className={`play-now-btn ${focusedTarget.zone === 'cardModal' && focusedTarget.id === 'play' ? 'gamepad-focused' : ''}`}
                    onClick={() => {
                      const gameToLaunch = selectedGameCard;
                      setSelectedGameCard(null);
                      setActiveGame(gameToLaunch);
                    }}
                  >
                    <Play size={20} fill="#ffffff" />
                    <span>{hasSaveData ? 'CONTINUE / PLAY NOW' : 'PLAY NOW'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emulator Modal */}
      {activeGame && (
        <EmulatorModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
        />
      )}
    </div>
  );
}

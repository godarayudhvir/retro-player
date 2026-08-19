import { useEffect, useRef, useCallback } from 'react';
import { KEYBOARD_ROWS } from '../components/OnScreenKeyboard';

/**
 * Unified 2D Spatial Navigation and Gamepad Input Polling Engine.
 * Handles keyboard shortcuts, Gamepad polling, virtual keyboard navigation, and SFX cues.
 */
export function useGamepadNavigation({
  focusedTarget,
  setFocusedTarget,
  showInfoModal,
  setShowInfoModal,
  showLoadRomModal,
  setShowLoadRomModal,
  showSettingsModal,
  setShowSettingsModal,
  showVirtualKeyboard,
  setShowVirtualKeyboard,
  oskPos,
  setOskPos,
  selectedGameCard,
  setSelectedGameCard,
  activeGame,
  setActiveGame,
  activeSystem,
  setActiveSystem,
  filteredGames,
  systems,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  gamepadConnected,
  setGamepadConnected,
  sfx,
  handleGameSelect,
  fetchGames,
  toggleFavorite,
  themeEngine,
  pwa
}) {
  const stateRef = useRef({});
  const lastInputTimeRef = useRef(0);
  const prevButtonsRef = useRef({});
  const gamepadConnectedRef = useRef(gamepadConnected);

  // Keep stateRef fresh on every render for requestAnimationFrame and event listeners
  useEffect(() => {
    stateRef.current = {
      activeSystem,
      focusedTarget,
      activeGame,
      selectedGameCard,
      showInfoModal,
      showLoadRomModal,
      showSettingsModal,
      showVirtualKeyboard,
      oskPos,
      filteredGames,
      systems,
      searchQuery,
      gamepadConnected,
      toggleFavorite,
      themeEngine,
      pwa
    };
  }, [
    activeSystem,
    focusedTarget,
    activeGame,
    selectedGameCard,
    showInfoModal,
    showLoadRomModal,
    showSettingsModal,
    showVirtualKeyboard,
    oskPos,
    filteredGames,
    systems,
    searchQuery,
    gamepadConnected,
    toggleFavorite,
    themeEngine,
    pwa
  ]);

  // Spatial navigation engine
  const navigateSpatial = useCallback((dir) => {
    const {
      showInfoModal: isInfoOpen,
      showLoadRomModal: isLoadRomOpen,
      showVirtualKeyboard: isOskOpen,
      selectedGameCard: curCard,
      activeGame: curActiveGame,
      filteredGames: curGames,
      systems: curSystems,
      activeSystem: curActiveSys,
      focusedTarget: curTarget,
      oskPos: curOskPos
    } = stateRef.current;

    // 0. On-Screen Virtual Keyboard Navigation
    if (isOskOpen) {
      if (dir === 'BACK') {
        setShowVirtualKeyboard(false);
        setFocusedTarget({ zone: 'grid', index: 0 });
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'UP') {
        setOskPos(prev => {
          const newRow = Math.max(0, prev.row - 1);
          const maxCols = KEYBOARD_ROWS[newRow].length;
          return { row: newRow, col: Math.min(prev.col, maxCols - 1) };
        });
        sfx?.playTileNav?.();
      } else if (dir === 'DOWN') {
        setOskPos(prev => {
          const newRow = Math.min(KEYBOARD_ROWS.length - 1, prev.row + 1);
          const maxCols = KEYBOARD_ROWS[newRow].length;
          return { row: newRow, col: Math.min(prev.col, maxCols - 1) };
        });
        sfx?.playTileNav?.();
      } else if (dir === 'LEFT') {
        setOskPos(prev => {
          const maxCols = KEYBOARD_ROWS[prev.row].length;
          const newCol = (prev.col - 1 + maxCols) % maxCols;
          return { row: prev.row, col: newCol };
        });
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT') {
        setOskPos(prev => {
          const maxCols = KEYBOARD_ROWS[prev.row].length;
          const newCol = (prev.col + 1) % maxCols;
          return { row: prev.row, col: newCol };
        });
        sfx?.playTileNav?.();
      } else if (dir === 'SELECT') {
        const key = KEYBOARD_ROWS[curOskPos.row]?.[curOskPos.col];
        if (key === '⌫') {
          setSearchQuery(q => q.slice(0, -1));
          sfx?.playKeyTick?.();
        } else if (key === 'SPACE') {
          setSearchQuery(q => q + ' ');
          sfx?.playKeyTick?.();
        } else if (key === 'CLEAR') {
          setSearchQuery('');
          sfx?.playKeyTick?.();
        } else if (key === 'DONE') {
          setShowVirtualKeyboard(false);
          setFocusedTarget({ zone: 'grid', index: 0 });
          sfx?.playModalClose?.();
        } else if (key) {
          setSearchQuery(q => q + key);
          sfx?.playKeyTick?.();
        }
      }
      return;
    }

    // 1. Info Modal Navigation
    if (isInfoOpen) {
      if (dir === 'BACK') {
        setShowInfoModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'info' });
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'LEFT' || dir === 'UP') {
        setFocusedTarget({ zone: 'infoModal', id: 'close' });
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT' || dir === 'DOWN') {
        setFocusedTarget({ zone: 'infoModal', id: 'ack' });
        sfx?.playTileNav?.();
      } else if (dir === 'SELECT') {
        setShowInfoModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'info' });
        sfx?.playModalClose?.();
      }
      return;
    }

    // 2. Load ROM Modal Navigation
    if (isLoadRomOpen) {
      if (dir === 'BACK') {
        setShowLoadRomModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'loadRom' });
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'LEFT' || dir === 'UP') {
        setFocusedTarget({ zone: 'loadRomModal', id: 'cancel' });
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT' || dir === 'DOWN') {
        setFocusedTarget({ zone: 'loadRomModal', id: 'browse' });
        sfx?.playTileNav?.();
      } else if (dir === 'SELECT') {
        if (curTarget?.id === 'cancel' || curTarget?.id === 'close') {
          setShowLoadRomModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'loadRom' });
          sfx?.playModalClose?.();
        } else {
          // Trigger file picker in modal
          const inputEl = document.querySelector('.modal-dropzone input[type="file"]');
          if (inputEl) {
            inputEl.click();
          }
        }
      }
      return;
    }

    // 2.5 Demo Welcome Modal Navigation
    if (curTarget?.zone === 'demoModal') {
      if (dir === 'BACK') {
        const dismissBtn = document.querySelector('.demo-modal-btn-primary');
        if (dismissBtn) dismissBtn.click();
        return;
      }
      if (dir === 'LEFT' || dir === 'UP') {
        setFocusedTarget({ zone: 'demoModal', id: 'github' });
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT' || dir === 'DOWN') {
        setFocusedTarget({ zone: 'demoModal', id: 'dismiss' });
        sfx?.playTileNav?.();
      } else if (dir === 'SELECT') {
        if (curTarget?.id === 'github') {
          window.open('https://github.com/godarayudhvir/retro-player', '_blank');
        } else {
          const dismissBtn = document.querySelector('.demo-modal-btn-primary');
          if (dismissBtn) dismissBtn.click();
        }
      }
      return;
    }

    // 2b. Settings & Library Manager Modal Navigation
    if (stateRef.current.showSettingsModal) {
      if (dir === 'BACK') {
        setShowSettingsModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'settings' });
        sfx?.playModalClose?.();
        return;
      }
      return;
    }

    // 3. Selected Game Card Drawer Navigation
    if (curCard) {
      if (dir === 'BACK') {
        setSelectedGameCard(null);
        setFocusedTarget({ zone: 'grid', index: curTarget?.index || 0 });
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'UP') {
        setFocusedTarget({ zone: 'cardModal', id: 'close' });
        sfx?.playTileNav?.();
      } else if (dir === 'DOWN') {
        setFocusedTarget({ zone: 'cardModal', id: 'play' });
        sfx?.playTileNav?.();
      } else if (dir === 'LEFT') {
        if (curTarget?.id === 'fav') {
          setFocusedTarget({ zone: 'cardModal', id: 'play' });
          sfx?.playTileNav?.();
        } else {
          setFocusedTarget({ zone: 'cardModal', id: 'close' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'RIGHT') {
        if (curTarget?.id === 'play') {
          setFocusedTarget({ zone: 'cardModal', id: 'fav' });
          sfx?.playTileNav?.();
        } else {
          setFocusedTarget({ zone: 'cardModal', id: 'play' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'SELECT') {
        if (curTarget?.id === 'close') {
          setSelectedGameCard(null);
          setFocusedTarget({ zone: 'grid', index: curTarget?.index || 0 });
          sfx?.playModalClose?.();
        } else if (curTarget?.id === 'fav') {
          if (stateRef.current.toggleFavorite) {
            const nextState = stateRef.current.toggleFavorite(curCard);
            sfx?.playFavoriteToggle?.(nextState);
          }
        } else {
          const gameToPlay = curCard;
          setSelectedGameCard(null);
          sfx?.playGameLaunch?.();
          setActiveGame(gameToPlay);
        }
      }
      return;
    }

    // 4. Active Game (In-Emulator)
    if (curActiveGame) {
      if (dir === 'BACK') {
        setActiveGame(null);
        setFocusedTarget({ zone: 'grid', index: curTarget?.index || 0 });
      }
      return;
    }

    // 5. Main Console Dashboard Navigation
    const activeSysList = curSystems.filter(s => s.gameCount > 0);
    const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
    const allTabs = [{ key: 'all' }, { key: 'favorites' }, { key: 'recent' }, ...sortedSystems];

    const curZone = curTarget?.zone || 'grid';
    const curIndex = curTarget?.index || 0;
    const curId = curTarget?.id;

    if (dir === 'BACK') {
      if (curZone !== 'grid') {
        setFocusedTarget({ zone: 'grid', index: 0 });
        sfx?.playTileNav?.();
      }
      return;
    }

    if (dir === 'SELECT') {
      if (curZone === 'topbar') {
        if (curId === 'search') {
          setShowVirtualKeyboard(true);
          setOskPos({ row: 1, col: 0 });
          sfx?.playModalOpen?.();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
        } else if (curId === 'install') {
          if (stateRef.current.pwa?.promptInstall) {
            stateRef.current.pwa.promptInstall();
            sfx?.playThemeSwitch?.();
          }
        } else if (curId === 'loadRom') {
          setShowLoadRomModal(true);
          setFocusedTarget({ zone: 'loadRomModal', id: 'browse' });
          sfx?.playModalOpen?.();
        } else if (curId === 'settings') {
          setShowSettingsModal?.(true);
          setFocusedTarget?.({ zone: 'settingsModal', id: 'tab' });
          sfx?.playModalOpen?.();
        } else if (curId === 'info') {
          setShowInfoModal(true);
          setFocusedTarget({ zone: 'infoModal', id: 'ack' });
          sfx?.playModalOpen?.();
        }
      } else if (curZone === 'ribbon') {
        if (allTabs[curIndex]) {
          setActiveSystem(allTabs[curIndex].key);
          setFocusedTarget({ zone: 'grid', index: 0 });
          sfx?.playTabSwitch?.();
        }
      } else if (curZone === 'grid') {
        if (curGames[curIndex]) {
          handleGameSelect(curGames[curIndex]);
          setFocusedTarget({ zone: 'cardModal', id: 'play' });
        } else if (curGames.length === 0) {
          fetchGames();
          sfx?.playTileNav?.();
        }
      } else if (curZone === 'hud') {
        fetchGames();
        sfx?.playTileNav?.();
      }
      return;
    }

    // Directional Spatial Movements (UP, DOWN, LEFT, RIGHT)
    if (curZone === 'topbar') {
      const topbarItems = ['search'];
      if (stateRef.current.pwa?.canInstall) {
        topbarItems.push('install');
      }
      topbarItems.push('loadRom', 'settings');

      if (dir === 'LEFT') {
        const curIdx = topbarItems.indexOf(curTarget?.id || 'search');
        const prevIdx = Math.max(0, curIdx - 1);
        setFocusedTarget({ zone: 'topbar', id: topbarItems[prevIdx] });
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT') {
        const curIdx = topbarItems.indexOf(curTarget?.id || 'search');
        const nextIdx = Math.min(topbarItems.length - 1, curIdx + 1);
        setFocusedTarget({ zone: 'topbar', id: topbarItems[nextIdx] });
        sfx?.playTileNav?.();
      } else if (dir === 'DOWN') {
        const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
        setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
        sfx?.playTileNav?.();
      }
    } else if (curZone === 'ribbon') {
      if (dir === 'LEFT') {
        const nextIdx = Math.max(0, curIndex - 1);
        setActiveSystem(allTabs[nextIdx].key);
        setFocusedTarget({ zone: 'ribbon', index: nextIdx });
        sfx?.playTabSwitch?.();
      } else if (dir === 'RIGHT') {
        const nextIdx = Math.min(allTabs.length - 1, curIndex + 1);
        setActiveSystem(allTabs[nextIdx].key);
        setFocusedTarget({ zone: 'ribbon', index: nextIdx });
        sfx?.playTabSwitch?.();
      } else if (dir === 'UP') {
        setFocusedTarget({ zone: 'topbar', id: curIndex < allTabs.length / 2 ? 'search' : 'loadRom' });
        sfx?.playTileNav?.();
      } else if (dir === 'DOWN') {
        setFocusedTarget({ zone: 'grid', index: 0 });
        sfx?.playTileNav?.();
      }
    } else if (curZone === 'grid') {
      if (curGames.length === 0) {
        if (dir === 'UP') {
          const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
          setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          setFocusedTarget({ zone: 'hud', id: 'rescan' });
          sfx?.playTileNav?.();
        }
        return;
      }

      if (dir === 'RIGHT') {
        const nextIdx = Math.min(curIndex + 2, curGames.length - 1);
        setFocusedTarget({ zone: 'grid', index: nextIdx });
        sfx?.playTileNav?.();
      } else if (dir === 'LEFT') {
        const nextIdx = Math.max(0, curIndex - 2);
        setFocusedTarget({ zone: 'grid', index: nextIdx });
        sfx?.playTileNav?.();
      } else if (dir === 'UP') {
        if (curIndex % 2 === 1) {
          setFocusedTarget({ zone: 'grid', index: curIndex - 1 });
          sfx?.playTileNav?.();
        } else {
          const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
          setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (curIndex % 2 === 0 && curIndex + 1 < curGames.length) {
          setFocusedTarget({ zone: 'grid', index: curIndex + 1 });
          sfx?.playTileNav?.();
        } else {
          setFocusedTarget({ zone: 'hud', id: 'rescan' });
          sfx?.playTileNav?.();
        }
      }
    } else if (curZone === 'hud') {
      if (dir === 'UP') {
        const lastIdx = Math.max(0, curGames.length - 1);
        setFocusedTarget({ zone: 'grid', index: lastIdx });
        sfx?.playTileNav?.();
      }
    }
  }, [
    setShowVirtualKeyboard,
    setFocusedTarget,
    setShowInfoModal,
    setSelectedGameCard,
    setActiveGame,
    setActiveSystem,
    setSearchQuery,
    setOskPos,
    searchInputRef,
    sfx,
    handleGameSelect,
    fetchGames
  ]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K search shortcut
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setFocusedTarget({ zone: 'topbar', id: 'search' });
        sfx?.playModalOpen?.();
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

      if (document.activeElement?.tagName === 'INPUT') return;

      // Yield keyboard inputs during active emulation session except ESC exit
      if (stateRef.current.activeGame) {
        if (e.key === 'Escape' || e.key === 'Esc') {
          e.preventDefault();
          setActiveGame(null);
          setFocusedTarget({ zone: 'grid', index: stateRef.current.focusedTarget?.index || 0 });
        }
        return;
      }

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
        case 'f':
        case 'F':
          e.preventDefault();
          if (stateRef.current.selectedGameCard) {
            if (stateRef.current.toggleFavorite) {
              const nextState = stateRef.current.toggleFavorite(stateRef.current.selectedGameCard);
              sfx?.playFavoriteToggle?.(nextState);
            }
          } else if (stateRef.current.focusedTarget?.zone === 'grid') {
            const game = stateRef.current.filteredGames[stateRef.current.focusedTarget?.index || 0];
            if (game && stateRef.current.toggleFavorite) {
              const nextState = stateRef.current.toggleFavorite(game);
              sfx?.playFavoriteToggle?.(nextState);
            }
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          if (stateRef.current.themeEngine?.cycleTheme) {
            stateRef.current.themeEngine.cycleTheme();
            sfx?.playThemeSwitch?.();
          }
          break;
        case 'q':
        case 'Q':
        case 'PageUp':
          e.preventDefault();
          {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', 'favorites', 'recent', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx - 1 + allSysKeys.length) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
            sfx?.playTabSwitch?.();
          }
          break;
        case 'e':
        case 'E':
        case 'PageDown':
          e.preventDefault();
          {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', 'favorites', 'recent', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx + 1) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
            sfx?.playTabSwitch?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateSpatial, setActiveGame, setActiveSystem, setFocusedTarget, searchInputRef, sfx]);

  // HTML5 Gamepad polling engine
  useEffect(() => {
    let animId;

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

        // When a game is active in the emulator, yield gamepad inputs to EmulatorJS!
        // The iframe handles in-game inputs and posts RETRO_PLAYER_EXIT_GAME on exit combo.
        // Throttle parent poll to 250ms to yield 100% of thread & GPU to WebAssembly core.
        if (stateRef.current.activeGame) {
          const b = gp.buttons;
          const selectBtn = b[8]?.pressed;
          const startBtn = b[9]?.pressed;
          const guideBtn = b[16]?.pressed;
          const isExitCombo = (selectBtn && startBtn) || guideBtn;

          if (isExitCombo && !prevButtonsRef.current.exitCombo) {
            console.log('🎮 [GAMEPAD] Controller exit combo triggered. Exiting active game to library.');
            setActiveGame(null);
            setFocusedTarget({ zone: 'grid', index: stateRef.current.focusedTarget?.index || 0 });
          }
          prevButtonsRef.current = { exitCombo: isExitCombo };
          setTimeout(() => {
            animId = requestAnimationFrame(pollGamepad);
          }, 250);
          return;
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
        const btnX = b[2]?.pressed;
        const btnY = b[3]?.pressed;
        const btnSelect = b[8]?.pressed;
        const btnStart = b[9]?.pressed;

        const shoulderL = b[4]?.pressed || b[6]?.pressed || b[4]?.value > 0.5;
        const shoulderR = b[5]?.pressed || b[7]?.pressed || b[5]?.value > 0.5;

        // Controller Hotkey: Y / Triangle or Select toggles Search / Virtual Keyboard
        if (!stateRef.current.activeGame && !stateRef.current.selectedGameCard && !stateRef.current.showInfoModal) {
          if ((btnY && !prevButtonsRef.current.btnY) || (btnSelect && !prevButtonsRef.current.btnSelect)) {
            setShowVirtualKeyboard(prev => {
              const next = !prev;
              if (next) sfx?.playModalOpen?.();
              else sfx?.playModalClose?.();
              return next;
            });
            setOskPos({ row: 1, col: 0 });
            lastInputTimeRef.current = now;
            prevButtonsRef.current = { ...prevButtonsRef.current, btnY, btnSelect, btnA, btnB, btnX, btnStart, shoulderL, shoulderR };
            animId = requestAnimationFrame(pollGamepad);
            return;
          }
        }

        // When On-Screen Keyboard is active:
        if (stateRef.current.showVirtualKeyboard) {
          if (btnX && !prevButtonsRef.current.btnX) { // X button -> Space
            setSearchQuery(q => q + ' ');
            sfx?.playKeyTick?.();
            lastInputTimeRef.current = now;
          } else if (btnStart && !prevButtonsRef.current.btnStart) { // Start button -> Done
            setShowVirtualKeyboard(false);
            setFocusedTarget({ zone: 'grid', index: 0 });
            sfx?.playModalClose?.();
            lastInputTimeRef.current = now;
          }
        } else if (!stateRef.current.activeGame && !stateRef.current.showInfoModal && !stateRef.current.showLoadRomModal) {
          // X button toggles Favorite on focused game in modal or grid
          if (btnX && !prevButtonsRef.current.btnX) {
            if (stateRef.current.selectedGameCard) {
              if (stateRef.current.toggleFavorite) {
                const nextState = stateRef.current.toggleFavorite(stateRef.current.selectedGameCard);
                sfx?.playFavoriteToggle?.(nextState);
              }
            } else if (stateRef.current.focusedTarget?.zone === 'grid') {
              const game = stateRef.current.filteredGames[stateRef.current.focusedTarget?.index || 0];
              if (game && stateRef.current.toggleFavorite) {
                const nextState = stateRef.current.toggleFavorite(game);
                sfx?.playFavoriteToggle?.(nextState);
              }
            }
            lastInputTimeRef.current = now;
          }
        }

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
            sfx?.playTabSwitch?.();
            moved = true;
          } else if (shoulderR && !prevButtonsRef.current.shoulderR) {
            const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
            const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
            const allSysKeys = ['all', ...sortedSystems.map(s => s.key)];
            const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
            const nextSysIdx = (curSysIdx + 1) % allSysKeys.length;
            setActiveSystem(allSysKeys[nextSysIdx]);
            setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
            sfx?.playTabSwitch?.();
            moved = true;
          }

          if (moved) {
            lastInputTimeRef.current = now;
          }
        }

        prevButtonsRef.current = { shoulderL, shoulderR, btnA, btnB, btnX, btnY, btnSelect, btnStart };
      } else {
        if (gamepadConnectedRef.current) {
          gamepadConnectedRef.current = false;
          setGamepadConnected(false);
        }
      }

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [
    navigateSpatial,
    setActiveGame,
    setActiveSystem,
    setFocusedTarget,
    setShowVirtualKeyboard,
    setOskPos,
    setSearchQuery,
    setGamepadConnected,
    sfx
  ]);

  return { navigateSpatial };
}

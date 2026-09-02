import { useEffect, useRef, useCallback } from 'react';

/**
 * Gamepad Telemetry & In-Game Emulation Control Hook.
 * (Phase 1 Re-Architecture: App UI spatial loops decommissioned; in-game emulator controls 100% preserved).
 */
export function useGamepadNavigation({
  focusedTarget,
  setFocusedTarget,
  showInfoModal,
  setShowInfoModal,
  showLoadRomModal,
  setShowLoadRomModal,
  showScraperModal,
  setShowScraperModal,
  showBackupModal,
  setShowBackupModal,
  showTrophyModal,
  setShowTrophyModal,
  showProfileSelectModal,
  setShowProfileSelectModal,
  showProfileCreatorModal,
  setShowProfileCreatorModal,
  showMiiCreatorModal,
  setShowMiiCreatorModal,
  showVirtualKeyboard,
  setShowVirtualKeyboard,
  oskConfig,
  setOskConfig,
  oskPos,
  setOskPos,
  activeGame,
  setActiveGame,
  activeSystem,
  setActiveSystem,
  bgm,
  filteredGames = [],
  systems = [],
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
  pwa,
  onOpenScraperModal,
  onOpenTrophyModal,
  isMobile = false,
  selectedMobileGameForDetails = null,
  setSelectedMobileGameForDetails,
  hasChosenProfileThisSession = false,
  setHasChosenProfileThisSession,
  showProfileSwitcher = false,
  setShowProfileSwitcher,
  selectedMobileSystem = null,
  setSelectedMobileSystem,
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  onPlayGame,
  showOnboarding = false,
  setShowOnboarding,
  games = [],
  achievementsEngine
}) {
  const stateRef = useRef({});
  const lastInputTimeRef = useRef(0);
  const prevButtonsRef = useRef({});
  const gamepadConnectedRef = useRef(gamepadConnected);

  // Keep stateRef synchronized on every render for requestAnimationFrame and event listeners
  useEffect(() => {
    stateRef.current = {
      activeSystem,
      focusedTarget,
      activeGame,
      showInfoModal,
      showLoadRomModal,
      showScraperModal,
      showBackupModal,
      showTrophyModal,
      showVirtualKeyboard,
      oskConfig,
      showOnboarding,
      filteredGames,
      systems,
      searchQuery,
      gamepadConnected,
      isMobile,
      selectedMobileGameForDetails,
      games
    };
  }, [
    activeSystem,
    focusedTarget,
    activeGame,
    showInfoModal,
    showLoadRomModal,
    showScraperModal,
    showBackupModal,
    showTrophyModal,
    showVirtualKeyboard,
    oskConfig,
    showOnboarding,
    filteredGames,
    systems,
    searchQuery,
    gamepadConnected,
    isMobile,
    selectedMobileGameForDetails,
    games
  ]);

  // In-Game Topbar HUD Navigation (Strictly active during active emulation sessions)
  const navigateInGame = useCallback((dir) => {
    const curTarget = stateRef.current.focusedTarget;
    const curIsMobile = stateRef.current.isMobile;

    if (curTarget?.zone === 'inGameBar') {
      const topbarBtns = curIsMobile
        ? ['diagnostics', 'close']
        : ['restart', 'pause', 'mute', 'record', 'speed', 'screenshot', 'shader', 'save', 'load', 'diagnostics', 'close'];
      const curId = curTarget?.id || 'close';
      const curIdx = topbarBtns.indexOf(curId) >= 0 ? topbarBtns.indexOf(curId) : topbarBtns.length - 1;

      if (dir === 'BACK') {
        setFocusedTarget({ zone: 'gameplay', id: 'canvas' });
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'LEFT') {
        const nextIdx = (curIdx - 1 + topbarBtns.length) % topbarBtns.length;
        setFocusedTarget({ zone: 'inGameBar', id: topbarBtns[nextIdx] });
        sfx?.playTileNav?.();
        return;
      }
      if (dir === 'RIGHT') {
        const nextIdx = (curIdx + 1) % topbarBtns.length;
        setFocusedTarget({ zone: 'inGameBar', id: topbarBtns[nextIdx] });
        sfx?.playTileNav?.();
        return;
      }
      if (dir === 'SELECT') {
        if (curId === 'close' || curId === 'exit') {
          const curActive = stateRef.current.activeGame;
          const curGames = stateRef.current.filteredGames || [];
          const gameIdx = curActive ? curGames.findIndex(g => (g.id && g.id === curActive.id) || g.title === curActive.title) : -1;
          const fallbackIdx = typeof stateRef.current.focusedTarget?.index === 'number' ? stateRef.current.focusedTarget.index : 0;
          const targetIndex = gameIdx >= 0 ? gameIdx : fallbackIdx;
          setActiveGame(null);
          setFocusedTarget(curIsMobile ? { zone: 'mobileChips', index: targetIndex } : { zone: 'grid', index: targetIndex });
          sfx?.playModalClose?.();
        } else {
          const el = document.getElementById('ingame-' + curId);
          if (el) el.click();
          sfx?.playMenuConfirm?.();
        }
        return;
      }
    }

    if (curTarget?.zone === 'inGameSubBar') {
      const subBtns = ['restart', 'pause', 'mute', 'record', 'speed', 'screenshot', 'shader', 'save', 'load', 'diagnostics'];
      const curId = curTarget?.id || 'restart';
      const curIdx = subBtns.indexOf(curId) >= 0 ? subBtns.indexOf(curId) : 0;

      if (dir === 'BACK') {
        const menuBtn = document.getElementById('ingame-menu');
        if (menuBtn) menuBtn.click();
        setFocusedTarget({ zone: 'gameplay', id: 'canvas' });
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'LEFT') {
        const nextIdx = (curIdx - 1 + subBtns.length) % subBtns.length;
        setFocusedTarget({ zone: 'inGameSubBar', id: subBtns[nextIdx] });
        sfx?.playTileNav?.();
        return;
      }
      if (dir === 'RIGHT') {
        const nextIdx = (curIdx + 1) % subBtns.length;
        setFocusedTarget({ zone: 'inGameSubBar', id: subBtns[nextIdx] });
        sfx?.playTileNav?.();
        return;
      }
      if (dir === 'SELECT') {
        const el = document.getElementById('ingame-sub-' + curId);
        if (el) el.click();
        sfx?.playMenuConfirm?.();
        return;
      }
    }
  }, [setActiveGame, setFocusedTarget, sfx]);

  // Keyboard handler: Preserves active emulation session ESC exit; UI spatial shortcuts decommissioned in Phase 1
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Yield keyboard inputs during active emulation session except ESC exit
      if (stateRef.current.activeGame) {
        if (e.key === 'Escape' || e.key === 'Esc') {
          e.preventDefault();
          const curActive = stateRef.current.activeGame;
          const curGames = stateRef.current.filteredGames || [];
          const gameIdx = curActive ? curGames.findIndex(g => (g.id && g.id === curActive.id) || g.title === curActive.title) : -1;
          const fallbackIdx = typeof stateRef.current.focusedTarget?.index === 'number' ? stateRef.current.focusedTarget.index : 0;
          const targetIndex = gameIdx >= 0 ? gameIdx : fallbackIdx;
          setActiveGame(null);
          setFocusedTarget(stateRef.current.isMobile ? { zone: 'mobileChips', index: targetIndex } : { zone: 'grid', index: targetIndex });
        }
        return;
      }
      // UI keyboard spatial navigation decommissioned in Phase 1
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveGame, setFocusedTarget]);

  // HTML5 Gamepad polling engine (Event-driven & power-efficient: pauses when 0 gamepads connected)
  useEffect(() => {
    let animId = null;
    let isPolling = false;
    const STICK_DEADZONE = 0.45;

    const hasConnectedGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) return true;
      }
      return false;
    };

    const startPolling = () => {
      if (!isPolling) {
        isPolling = true;
        animId = requestAnimationFrame(pollGamepad);
      }
    };

    const stopPolling = () => {
      isPolling = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const pollGamepad = (timestamp) => {
      if (!isPolling) return;
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

        // Active Emulation Session Controls (Strictly preserved)
        if (stateRef.current.activeGame) {
          const b = gp.buttons;
          const l3Btn = b[10]?.pressed; // Left stick click (L3)
          const r3Btn = b[11]?.pressed; // Right stick click (R3)
          const now = (typeof timestamp === 'number') ? timestamp : performance.now();
          const COOLDOWN = 180;

          // 1. L3 + R3 directly exits active game back to cartridge library
          const isDirectExit = l3Btn && r3Btn;
          if (isDirectExit && !prevButtonsRef.current.directExit) {
            console.log('🎮 [GAMEPAD] L3 + R3 pressed. Exiting active game to library.');
            const curActive = stateRef.current.activeGame;
            const curGames = stateRef.current.filteredGames || [];
            const gameIdx = curActive ? curGames.findIndex(g => (g.id && g.id === curActive.id) || g.title === curActive.title) : -1;
            const fallbackIdx = typeof stateRef.current.focusedTarget?.index === 'number' ? stateRef.current.focusedTarget.index : 0;
            const targetIndex = gameIdx >= 0 ? gameIdx : fallbackIdx;
            setActiveGame(null);
            setFocusedTarget(stateRef.current.isMobile ? { zone: 'mobileChips', index: targetIndex } : { zone: 'grid', index: targetIndex });
            sfx?.playModalClose?.();
            prevButtonsRef.current = { directExit: true, l3Single: false };
            setTimeout(() => {
              animId = requestAnimationFrame(pollGamepad);
            }, 250);
            return;
          }

          // 2. Single L3 toggles in-game Topbar HUD focus
          const isL3Single = l3Btn && !r3Btn;
          if (isL3Single && !prevButtonsRef.current.l3Single) {
            const curZone = stateRef.current.focusedTarget?.zone;
            if (curZone === 'inGameBar' || curZone === 'inGameSubBar') {
              if (curZone === 'inGameSubBar') {
                const menuBtn = document.getElementById('ingame-menu');
                if (menuBtn) menuBtn.click();
              }
              setFocusedTarget({ zone: 'gameplay', id: 'canvas' });
              sfx?.playModalClose?.();
            } else if (stateRef.current.isMobile) {
              const menuBtn = document.getElementById('ingame-menu');
              if (menuBtn) menuBtn.click();
              setTimeout(() => {
                setFocusedTarget({ zone: 'inGameSubBar', id: 'restart' });
              }, 80);
              sfx?.playModalOpen?.();
            } else {
              setFocusedTarget({ zone: 'inGameBar', id: 'restart' });
              sfx?.playModalOpen?.();
            }
            lastInputTimeRef.current = now;
          }

          // 3. If inGameBar or inGameSubBar is focused, navigate HUD controls
          const activeInGameZone = stateRef.current.focusedTarget?.zone;
          if (activeInGameZone === 'inGameBar' || activeInGameZone === 'inGameSubBar') {
            const btnA = b[0]?.pressed;
            const btnB = b[1]?.pressed;
            const dpadLeft = b[14]?.pressed || (gp.axes[0] < -STICK_DEADZONE);
            const dpadRight = b[15]?.pressed || (gp.axes[0] > STICK_DEADZONE);

            if (now - lastInputTimeRef.current > COOLDOWN) {
              if (btnB && !prevButtonsRef.current.btnB) {
                navigateInGame('BACK');
                lastInputTimeRef.current = now;
              } else if (btnA && !prevButtonsRef.current.btnA) {
                navigateInGame('SELECT');
                lastInputTimeRef.current = now;
              } else if (dpadLeft) {
                navigateInGame('LEFT');
                lastInputTimeRef.current = now;
              } else if (dpadRight) {
                navigateInGame('RIGHT');
                lastInputTimeRef.current = now;
              }
            }
          }

          prevButtonsRef.current = { 
            directExit: isDirectExit, 
            l3Single: isL3Single,
            btnA: b[0]?.pressed,
            btnB: b[1]?.pressed,
            btnSelect: b[8]?.pressed,
            btnStart: b[9]?.pressed,
            btnY: b[3]?.pressed,
            btnX: b[2]?.pressed
          };
          setTimeout(() => {
            animId = requestAnimationFrame(pollGamepad);
          }, 150);
          return;
        }

        // Out of game: Telemetry and connection tracking only (UI spatial navigation decommissioned in Phase 1)
        if (gamepadConnectedRef.current) {
          achievementsEngine?.triggerPhysicalGamepadUsed?.();
        }

        prevButtonsRef.current = {};
      } else {
        if (gamepadConnectedRef.current) {
          gamepadConnectedRef.current = false;
          setGamepadConnected(false);
        }
        stopPolling();
        return;
      }

      if (isPolling) {
        animId = requestAnimationFrame(pollGamepad);
      }
    };

    const handleGamepadConnected = () => {
      startPolling();
    };

    const handleGamepadDisconnected = () => {
      if (!hasConnectedGamepad()) {
        if (gamepadConnectedRef.current) {
          gamepadConnectedRef.current = false;
          setGamepadConnected(false);
        }
        stopPolling();
      }
    };

    const handleUserInteraction = () => {
      if (!isPolling && hasConnectedGamepad()) {
        startPolling();
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    window.addEventListener('pointerdown', handleUserInteraction);

    if (hasConnectedGamepad()) {
      startPolling();
    }

    return () => {
      stopPolling();
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      window.removeEventListener('pointerdown', handleUserInteraction);
    };
  }, [
    navigateInGame,
    setActiveGame,
    setFocusedTarget,
    setGamepadConnected,
    sfx,
    achievementsEngine
  ]);

  return { navigateSpatial: () => {} };
}

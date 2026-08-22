import { useEffect, useRef, useCallback } from 'react';
import { KEYBOARD_ROWS } from '../components/OnScreenKeyboard';

/**
 * Unified 2D Spatial Navigation and Gamepad Input Polling Engine.
 * Handles desktop grid, Netflix-style mobile feed, profile gates, virtual keyboard navigation, and SFX cues.
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
  showThemeModal,
  setShowThemeModal,
  showProfileSelectModal,
  setShowProfileSelectModal,
  showProfileCreatorModal,
  setShowProfileCreatorModal,
  showMiiCreatorModal,
  setShowMiiCreatorModal,
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
  systems = [],
  searchQuery,
  setSearchQuery,
  searchInputRef,
  gamepadConnected,
  setGamepadConnected,
  sfx,
  handleGameSelect,
  onPrevGame,
  onNextGame,
  fetchGames,
  toggleFavorite,
  themeEngine,
  pwa,
  bgm,
  onOpenScraperModal,
  // Mobile-specific orchestration
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
  games = []
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
      showScraperModal,
      showThemeModal,
      setShowThemeModal,
      showProfileSelectModal,
      showProfileCreatorModal: showProfileCreatorModal || showMiiCreatorModal,
      showVirtualKeyboard,
      oskPos,
      filteredGames,
      systems,
      searchQuery,
      gamepadConnected,
      toggleFavorite,
      themeEngine,
      pwa,
      bgm,
      onOpenScraperModal,
      onPrevGame,
      onNextGame,
      isMobile,
      selectedMobileGameForDetails,
      hasChosenProfileThisSession,
      showProfileSwitcher,
      selectedMobileSystem,
      profiles,
      activeProfileId,
      games
    };
  }, [
    activeSystem,
    focusedTarget,
    activeGame,
    selectedGameCard,
    showInfoModal,
    showLoadRomModal,
    showScraperModal,
    showThemeModal,
    showProfileSelectModal,
    showProfileCreatorModal,
    showMiiCreatorModal,
    showVirtualKeyboard,
    oskPos,
    filteredGames,
    systems,
    searchQuery,
    gamepadConnected,
    toggleFavorite,
    themeEngine,
    pwa,
    bgm,
    onOpenScraperModal,
    isMobile,
    selectedMobileGameForDetails,
    hasChosenProfileThisSession,
    showProfileSwitcher,
    selectedMobileSystem,
    profiles,
    activeProfileId,
    games
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
      oskPos: curOskPos,
      isMobile: curIsMobile,
      selectedMobileGameForDetails: curMobileGame,
      hasChosenProfileThisSession: curHasProfile,
      showProfileSwitcher: curShowProfSwitch,
      selectedMobileSystem: curMobileSys,
      profiles: curProfiles,
      games: allGames,
      searchQuery: curQuery
    } = stateRef.current;

    // 0. On-Screen Virtual Keyboard Navigation (5-Row Matrix)
    if (isOskOpen) {
      if (dir === 'BACK') {
        setShowVirtualKeyboard(false);
        if (curIsMobile) {
          setFocusedTarget(curQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileTopbar', id: 'search' });
        } else {
          setFocusedTarget({ zone: 'grid', index: 0 });
        }
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
          if (curIsMobile) {
            setFocusedTarget(curQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
          } else {
            setFocusedTarget({ zone: 'grid', index: 0 });
          }
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
          const inputEl = document.querySelector('.modal-dropzone input[type="file"]');
          if (inputEl) inputEl.click();
        }
      }
      return;
    }

    // 2.2 Profile Select Modal Navigation (Desktop)
    const { showProfileSelectModal: isProfileOpen, profiles: curDeskProfiles } = stateRef.current;
    if (isProfileOpen) {
      const totalCards = (curDeskProfiles?.length || 0) + 1; // profiles + add card
      const curIndex = curTarget?.zone === 'profileModal' && typeof curTarget.index === 'number' ? curTarget.index : 0;
      const curId = curTarget?.id;

      if (dir === 'BACK') {
        setShowProfileSelectModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'profile' });
        sfx?.playModalClose?.();
        return;
      }

      if (dir === 'UP') {
        if (curId === 'manage') {
          setFocusedTarget({ zone: 'profileModal', index: Math.min(curDeskProfiles?.length || 0, curIndex) });
          sfx?.playTileNav?.();
        } else if (curId === 'close') {
          // Stay at top
        } else {
          setFocusedTarget({ zone: 'profileModal', id: 'close' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (curId === 'close') {
          setFocusedTarget({ zone: 'profileModal', index: 0 });
          sfx?.playTileNav?.();
        } else if (curId !== 'manage') {
          setFocusedTarget({ zone: 'profileModal', id: 'manage' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'LEFT') {
        if (!curId) {
          const nextIdx = Math.max(0, curIndex - 1);
          setFocusedTarget({ zone: 'profileModal', index: nextIdx });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'RIGHT') {
        if (!curId) {
          const nextIdx = Math.min(totalCards - 1, curIndex + 1);
          setFocusedTarget({ zone: 'profileModal', index: nextIdx });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'SELECT') {
        if (curId === 'close') {
          setShowProfileSelectModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
          sfx?.playModalClose?.();
        } else if (curId === 'manage') {
          const manageBtn = document.querySelector('.profile-manage-toggle-btn');
          if (manageBtn) manageBtn.click();
        } else {
          if (curIndex < (curDeskProfiles?.length || 0)) {
            const chosenProf = curDeskProfiles[curIndex];
            if (chosenProf && onSelectProfile) {
              onSelectProfile(chosenProf.id);
            }
            setShowProfileSelectModal(false);
            setFocusedTarget({ zone: 'topbar', id: 'profile' });
            sfx?.playTileNav?.();
          } else {
            if (onCreateNewProfile) onCreateNewProfile();
            setShowProfileSelectModal(false);
            sfx?.playModalOpen?.();
          }
        }
      }
      return;
    }

    // 2.3 Profile Creator Modal Navigation (Desktop & Mobile)
    const isCreatorOpen = stateRef.current.showProfileCreatorModal || stateRef.current.showMiiCreatorModal;
    if (isCreatorOpen) {
      const curId = curTarget?.id || 'nameInput';
      const setCreatorClose = setShowProfileCreatorModal || setShowMiiCreatorModal;

      if (dir === 'BACK') {
        setCreatorClose?.(false);
        setFocusedTarget({ zone: 'topbar', id: 'profile' });
        sfx?.playModalClose?.();
        return;
      }

      if (dir === 'UP') {
        if (curId === 'close') {
          // Top limit
        } else if (curId === 'nameInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'close' });
          sfx?.playTileNav?.();
        } else if (curId === 'seedInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'nameInput' });
          sfx?.playTileNav?.();
        } else if (curId === 'random') {
          setFocusedTarget({ zone: 'profileModal', id: 'close' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          setFocusedTarget({ zone: 'profileModal', id: 'seedInput' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          setFocusedTarget({ zone: 'profileModal', id: 'preset_0' });
          sfx?.playTileNav?.();
        } else if (curId === 'save' || curId === 'cancel') {
          setFocusedTarget({ zone: 'profileModal', id: 'color_0' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (curId === 'close') {
          setFocusedTarget({ zone: 'profileModal', id: 'nameInput' });
          sfx?.playTileNav?.();
        } else if (curId === 'nameInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'seedInput' });
          sfx?.playTileNav?.();
        } else if (curId === 'seedInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'preset_0' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          setFocusedTarget({ zone: 'profileModal', id: 'color_0' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          setFocusedTarget({ zone: 'profileModal', id: 'save' });
          sfx?.playTileNav?.();
        } else if (curId === 'random') {
          setFocusedTarget({ zone: 'profileModal', id: 'cancel' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'LEFT') {
        if (curId === 'save') {
          setFocusedTarget({ zone: 'profileModal', id: 'cancel' });
          sfx?.playTileNav?.();
        } else if (curId === 'nameInput' || curId === 'seedInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'random' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10);
          if (pIdx > 0) {
            setFocusedTarget({ zone: 'profileModal', id: `preset_${pIdx - 1}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'random' });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10);
          if (cIdx > 0) {
            setFocusedTarget({ zone: 'profileModal', id: `color_${cIdx - 1}` });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'RIGHT') {
        if (curId === 'cancel') {
          setFocusedTarget({ zone: 'profileModal', id: 'save' });
          sfx?.playTileNav?.();
        } else if (curId === 'random') {
          setFocusedTarget({ zone: 'profileModal', id: 'nameInput' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10);
          setFocusedTarget({ zone: 'profileModal', id: `preset_${pIdx + 1}` });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10);
          setFocusedTarget({ zone: 'profileModal', id: `color_${cIdx + 1}` });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'SELECT') {
        if (curId === 'close' || curId === 'cancel') {
          setCreatorClose?.(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
          sfx?.playModalClose?.();
        } else if (curId === 'random') {
          const randBtn = document.querySelector('.avatar-random-btn');
          if (randBtn) randBtn.click();
        } else if (curId === 'save') {
          const saveBtn = document.querySelector('.profile-btn-primary');
          if (saveBtn) saveBtn.click();
        } else if (curId === 'nameInput') {
          const inputEl = document.getElementById('player-name-input');
          if (inputEl) {
            inputEl.focus();
            inputEl.select();
          }
        } else if (curId === 'seedInput') {
          const seedEl = document.getElementById('avatar-seed-input');
          if (seedEl) {
            seedEl.focus();
            seedEl.select();
          }
        }
      }
      return;
    }

    // 2.4 Active Game in-emulator yield
    if (curActiveGame) {
      if (dir === 'BACK') {
        setActiveGame(null);
        setFocusedTarget(curIsMobile ? { zone: 'mobileChips', index: 0 } : { zone: 'grid', index: curTarget?.index || 0 });
      }
      return;
    }

    // ==========================================
    // 3. DEDICATED MOBILE VIEW SPATIAL NAVIGATION
    // ==========================================
    if (curIsMobile) {
      // 3.0 Mobile Search Results Active Grid Navigation
      if (curQuery?.trim()) {
        const q = curQuery.toLowerCase().trim();
        const searched = allGames.filter(g => 
          g.title.toLowerCase().includes(q) || 
          (g.systemName && g.systemName.toLowerCase().includes(q))
        );

        if (curTarget?.zone === 'mobileSearchGrid') {
          const curIdx = curTarget?.index || 0;
          if (dir === 'BACK') {
            setSearchQuery('');
            setFocusedTarget({ zone: 'mobileChips', index: 0 });
            sfx?.playTabSwitch?.();
            return;
          }
          if (dir === 'UP') {
            if (curIdx < 2) {
              setFocusedTarget({ zone: 'mobileTopbar', id: 'search' });
              sfx?.playTileNav?.();
            } else {
              setFocusedTarget({ zone: 'mobileSearchGrid', index: Math.max(0, curIdx - 2) });
              sfx?.playTileNav?.();
            }
          } else if (dir === 'DOWN') {
            const nextIdx = Math.min(searched.length - 1, curIdx + 2);
            setFocusedTarget({ zone: 'mobileSearchGrid', index: nextIdx });
            sfx?.playTileNav?.();
          } else if (dir === 'LEFT') {
            const nextIdx = Math.max(0, curIdx - 1);
            setFocusedTarget({ zone: 'mobileSearchGrid', index: nextIdx });
            sfx?.playTileNav?.();
          } else if (dir === 'RIGHT') {
            const nextIdx = Math.min(searched.length - 1, curIdx + 1);
            setFocusedTarget({ zone: 'mobileSearchGrid', index: nextIdx });
            sfx?.playTileNav?.();
          } else if (dir === 'SELECT') {
            if (searched[curIdx]) {
              setSelectedMobileGameForDetails(searched[curIdx]);
              setFocusedTarget({ zone: 'mobileSheet', id: 'play' });
              sfx?.playModalOpen?.();
            }
          }
          return;
        }
      }

      // 3.1 Mobile Profile Gate / Profile Switcher Screen
      if (!curHasProfile || curShowProfSwitch) {
        const totalItems = (curProfiles?.length || 0) + 1;
        const curIdx = curTarget?.zone === 'mobileProfileGate' ? (curTarget?.index || 0) : 0;

        if (dir === 'BACK' && curShowProfSwitch) {
          setShowProfileSwitcher(false);
          setFocusedTarget({ zone: 'mobileTopbar', id: 'profile' });
          sfx?.playModalClose?.();
          return;
        }

        if (dir === 'LEFT') {
          const nextIdx = Math.max(0, curIdx - 1);
          setFocusedTarget({ zone: 'mobileProfileGate', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'RIGHT') {
          const nextIdx = Math.min(totalItems - 1, curIdx + 1);
          setFocusedTarget({ zone: 'mobileProfileGate', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'UP') {
          const nextIdx = Math.max(0, curIdx - 2);
          setFocusedTarget({ zone: 'mobileProfileGate', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          const nextIdx = Math.min(totalItems - 1, curIdx + 2);
          setFocusedTarget({ zone: 'mobileProfileGate', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'SELECT') {
          if (curIdx < (curProfiles?.length || 0)) {
            const chosenProf = curProfiles[curIdx];
            if (chosenProf && onSelectProfile) {
              onSelectProfile(chosenProf.id);
            }
            setHasChosenProfileThisSession(true);
            setShowProfileSwitcher(false);
            setFocusedTarget({ zone: 'mobileChips', index: 0 });
            sfx?.playTileNav?.();
          } else {
            // Add Player Card
            if (onCreateNewProfile) onCreateNewProfile();
            setHasChosenProfileThisSession(true);
            setShowProfileSwitcher(false);
            sfx?.playModalOpen?.();
          }
        }
        return;
      }

      // 3.2 Mobile Game Detail Drawer / Bottom Sheet
      if (curMobileGame) {
        const curBtn = curTarget?.zone === 'mobileSheet' ? (curTarget?.id || 'play') : 'play';
        if (dir === 'BACK') {
          setSelectedMobileGameForDetails(null);
          setFocusedTarget(curQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
          sfx?.playModalClose?.();
          return;
        }
        if (dir === 'LEFT') {
          if (curBtn === 'fav') {
            setFocusedTarget({ zone: 'mobileSheet', id: 'play' });
            sfx?.playTileNav?.();
          } else if (curBtn === 'play') {
            setFocusedTarget({ zone: 'mobileSheet', id: 'close' });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'RIGHT') {
          if (curBtn === 'close') {
            setFocusedTarget({ zone: 'mobileSheet', id: 'play' });
            sfx?.playTileNav?.();
          } else if (curBtn === 'play') {
            setFocusedTarget({ zone: 'mobileSheet', id: 'fav' });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'UP') {
          setFocusedTarget({ zone: 'mobileSheet', id: 'close' });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          setFocusedTarget({ zone: 'mobileSheet', id: 'play' });
          sfx?.playTileNav?.();
        } else if (dir === 'SELECT') {
          if (curBtn === 'play') {
            const gameToLaunch = curMobileGame;
            setSelectedMobileGameForDetails(null);
            sfx?.playGameLaunch?.();
            if (onPlayGame) onPlayGame(gameToLaunch);
          } else if (curBtn === 'fav') {
            if (toggleFavorite) {
              const nextState = toggleFavorite(curMobileGame);
              sfx?.playFavoriteToggle?.(nextState);
            }
          } else if (curBtn === 'close') {
            setSelectedMobileGameForDetails(null);
            setFocusedTarget(curQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
            sfx?.playModalClose?.();
          }
        }
        return;
      }

      // 3.3 Mobile System Drilldown View
      if (curMobileSys) {
        const sysGames = allGames.filter(g => g.systemKey === curMobileSys.key);
        const curZone = curTarget?.zone || 'mobileDrilldown';
        const curIdx = curTarget?.index || 0;
        const curId = curTarget?.id;

        if (dir === 'BACK') {
          setSelectedMobileSystem(null);
          setFocusedTarget({ zone: 'mobileChips', index: 0 });
          sfx?.playTabSwitch?.();
          return;
        }

        if (dir === 'UP') {
          if (curId === 'back') {
            // Top
          } else if (curIdx < 3) {
            setFocusedTarget({ zone: 'mobileDrilldown', id: 'back' });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'mobileDrilldown', index: Math.max(0, curIdx - 3) });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'DOWN') {
          if (curId === 'back') {
            setFocusedTarget({ zone: 'mobileDrilldown', index: 0 });
            sfx?.playTileNav?.();
          } else {
            const nextIdx = Math.min(sysGames.length - 1, curIdx + 3);
            setFocusedTarget({ zone: 'mobileDrilldown', index: nextIdx });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'LEFT') {
          if (curId !== 'back') {
            const nextIdx = Math.max(0, curIdx - 1);
            setFocusedTarget({ zone: 'mobileDrilldown', index: nextIdx });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'RIGHT') {
          if (curId === 'back') {
            if (sysGames.length > 0) {
              setFocusedTarget({ zone: 'mobileDrilldown', index: 0 });
              sfx?.playTileNav?.();
            }
          } else {
            const nextIdx = Math.min(sysGames.length - 1, curIdx + 1);
            setFocusedTarget({ zone: 'mobileDrilldown', index: nextIdx });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'SELECT') {
          if (curId === 'back') {
            setSelectedMobileSystem(null);
            setFocusedTarget({ zone: 'mobileChips', index: 0 });
            sfx?.playTabSwitch?.();
          } else if (sysGames[curIdx]) {
            setSelectedMobileGameForDetails(sysGames[curIdx]);
            setFocusedTarget({ zone: 'mobileSheet', id: 'play' });
            sfx?.playModalOpen?.();
          }
        }
        return;
      }

      // 3.4 Mobile Main Streaming-Style Feed
      const sysCount = curSystems?.length || 0;
      const curZone = curTarget?.zone || 'mobileChips';
      const curIdx = curTarget?.index || 0;
      const curRow = curTarget?.rowIndex || 0;
      const curCol = curTarget?.colIndex || 0;
      const curId = curTarget?.id || 'profile';

      // Build rows definition
      const systemGamesMap = {};
      allGames.forEach(g => {
        if (!g.systemKey) return;
        if (!systemGamesMap[g.systemKey]) systemGamesMap[g.systemKey] = [];
        systemGamesMap[g.systemKey].push(g);
      });
      const recentIds = (stateRef.current.pwa?.recentIds) || [];
      const recentGames = allGames.filter(g => recentIds.includes(g.id || g.title));
      const favoriteGames = allGames.filter(g => (stateRef.current.toggleFavorite ? false : false));

      const feedRows = [];
      if (recentGames.length > 0) feedRows.push({ key: 'recent', games: recentGames, type: 'recent' });
      if (favoriteGames.length > 0) feedRows.push({ key: 'favs', games: favoriteGames, type: 'favs' });
      curSystems.forEach(sys => {
        const sg = systemGamesMap[sys.key] || [];
        if (sg.length > 0) feedRows.push({ key: sys.key, sys, games: sg.slice(0, 12), type: 'system' });
      });

      if (curZone === 'mobileTopbar') {
        const topbarItems = ['profile', 'search', 'load'];
        if (dir === 'LEFT') {
          const idx = topbarItems.indexOf(curId);
          const nextIdx = Math.max(0, idx - 1);
          setFocusedTarget({ zone: 'mobileTopbar', id: topbarItems[nextIdx] });
          sfx?.playTileNav?.();
        } else if (dir === 'RIGHT') {
          const idx = topbarItems.indexOf(curId);
          const nextIdx = Math.min(topbarItems.length - 1, idx + 1);
          setFocusedTarget({ zone: 'mobileTopbar', id: topbarItems[nextIdx] });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          if (curQuery?.trim()) {
            setFocusedTarget({ zone: 'mobileSearchGrid', index: 0 });
          } else {
            setFocusedTarget({ zone: 'mobileChips', index: 0 });
          }
          sfx?.playTileNav?.();
        } else if (dir === 'SELECT') {
          if (curId === 'profile') {
            setShowProfileSwitcher(true);
            setFocusedTarget({ zone: 'mobileProfileGate', index: 0 });
            sfx?.playModalOpen?.();
          } else if (curId === 'search') {
            if (stateRef.current.gamepadConnected) {
              setShowVirtualKeyboard(true);
              setOskPos({ row: 0, col: 0 });
              sfx?.playModalOpen?.();
            } else {
              const inp = document.querySelector('.mobile-search-input');
              if (inp) inp.focus();
            }
          } else if (curId === 'load') {
            const fileInp = document.querySelector('.mobile-app-root input[type="file"]');
            if (fileInp) fileInp.click();
          }
        }
      } else if (curZone === 'mobileChips') {
        if (dir === 'LEFT') {
          const nextIdx = Math.max(0, curIdx - 1);
          setFocusedTarget({ zone: 'mobileChips', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'RIGHT') {
          const nextIdx = Math.min(sysCount - 1, curIdx + 1);
          setFocusedTarget({ zone: 'mobileChips', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'UP') {
          setFocusedTarget({ zone: 'mobileTopbar', id: 'search' });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          if (feedRows.length > 0) {
            setFocusedTarget({ zone: 'mobileFeed', rowIndex: 0, colIndex: 0 });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'SELECT') {
          if (curSystems[curIdx]) {
            setSelectedMobileSystem(curSystems[curIdx]);
            setFocusedTarget({ zone: 'mobileDrilldown', index: 0 });
            sfx?.playTabSwitch?.();
          }
        }
      } else if (curZone === 'mobileFeed') {
        const activeRowObj = feedRows[curRow];
        const rowLen = activeRowObj?.games?.length || 0;

        if (dir === 'LEFT') {
          const nextCol = Math.max(0, curCol - 1);
          setFocusedTarget({ zone: 'mobileFeed', rowIndex: curRow, colIndex: nextCol });
          sfx?.playTileNav?.();
        } else if (dir === 'RIGHT') {
          const nextCol = Math.min(rowLen - 1, curCol + 1);
          setFocusedTarget({ zone: 'mobileFeed', rowIndex: curRow, colIndex: nextCol });
          sfx?.playTileNav?.();
        } else if (dir === 'UP') {
          if (curRow === 0) {
            setFocusedTarget({ zone: 'mobileChips', index: 0 });
            sfx?.playTileNav?.();
          } else {
            const nextRow = curRow - 1;
            const nextRowLen = feedRows[nextRow]?.games?.length || 1;
            setFocusedTarget({ zone: 'mobileFeed', rowIndex: nextRow, colIndex: Math.min(curCol, nextRowLen - 1) });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'DOWN') {
          if (curRow < feedRows.length - 1) {
            const nextRow = curRow + 1;
            const nextRowLen = feedRows[nextRow]?.games?.length || 1;
            setFocusedTarget({ zone: 'mobileFeed', rowIndex: nextRow, colIndex: Math.min(curCol, nextRowLen - 1) });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'SELECT') {
          const game = activeRowObj?.games?.[curCol];
          if (game) {
            setSelectedMobileGameForDetails(game);
            setFocusedTarget({ zone: 'mobileSheet', id: 'play' });
            sfx?.playModalOpen?.();
          }
        }
      }
      return;
    }

    // ==========================================
    // 4. DESKTOP CONSOLE SPATIAL NAVIGATION
    // ==========================================
    // 4.1 Selected Game Card Drawer Navigation
    if (curCard) {
      const cardButtons = ['prevGame', 'play', 'fav', 'editMeta', 'scrape', 'nextGame'];
      const curId = curTarget?.id || 'play';
      const curIdx = cardButtons.indexOf(curId);

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
        if (curId === 'prevGame') {
          stateRef.current.onPrevGame?.();
        } else if (curId === 'close') {
          setFocusedTarget({ zone: 'cardModal', id: 'prevGame' });
          sfx?.playTileNav?.();
        } else if (curIdx > 0) {
          const nextIdx = curIdx - 1;
          setFocusedTarget({ zone: 'cardModal', id: cardButtons[nextIdx] });
          sfx?.playTileNav?.();
        } else {
          stateRef.current.onPrevGame?.();
        }
      } else if (dir === 'RIGHT') {
        if (curId === 'nextGame') {
          stateRef.current.onNextGame?.();
        } else if (curId === 'close') {
          setFocusedTarget({ zone: 'cardModal', id: 'play' });
          sfx?.playTileNav?.();
        } else if (curIdx >= 0 && curIdx < cardButtons.length - 1) {
          const nextIdx = curIdx + 1;
          setFocusedTarget({ zone: 'cardModal', id: cardButtons[nextIdx] });
          sfx?.playTileNav?.();
        } else {
          stateRef.current.onNextGame?.();
        }
      } else if (dir === 'SELECT') {
        if (curId === 'prevGame') {
          stateRef.current.onPrevGame?.();
        } else if (curId === 'nextGame') {
          stateRef.current.onNextGame?.();
        } else if (curId === 'close') {
          setSelectedGameCard(null);
          setFocusedTarget({ zone: 'grid', index: curTarget?.index || 0 });
          sfx?.playModalClose?.();
        } else if (curId === 'fav') {
          if (stateRef.current.toggleFavorite) {
            const nextState = stateRef.current.toggleFavorite(curCard);
            sfx?.playFavoriteToggle?.(nextState);
          }
        } else if (curId === 'editMeta') {
          const editBtn = document.querySelector('.edit-metadata-btn');
          if (editBtn) editBtn.click();
        } else if (curId === 'scrape') {
          const scrapeBtn = document.querySelector('.scraper-refresh-btn');
          if (scrapeBtn) scrapeBtn.click();
        } else if (curId === 'play') {
          const playBtn = document.querySelector('.play-now-btn');
          if (playBtn) playBtn.click();
        }
      }
      return;
    }

    // 4.2 Main Desktop Dashboard Navigation
    const activeSysList = curSystems.filter(s => s.gameCount > 0);
    const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
    const allTabs = [{ key: 'all' }, { key: 'favorites' }, { key: 'recent' }, ...sortedSystems];

    const curZone = curTarget?.zone || 'grid';
    const curIndex = curTarget?.index || 0;
    const curId = curTarget?.id;

    // Helper to get active desktop topbar items
    const getDesktopTopbarItems = () => {
      const items = ['profile'];
      if (stateRef.current.bgm?.tracks?.length > 0) {
        items.push('bgm');
        if (stateRef.current.bgm.isPlaying) {
          items.push('bgmSkip');
        }
      }
      if (stateRef.current.onOpenScraperModal) items.push('scraper');
      items.push('sfx');
      if (stateRef.current.themeEngine?.availableThemes?.length > 1) {
        items.push('theme');
      }
      items.push('search');
      if (stateRef.current.pwa?.canInstall) items.push('install');
      items.push('loadRom');
      return items;
    };

    if (dir === 'BACK') {
      if (curZone !== 'grid') {
        setFocusedTarget({ zone: 'grid', index: 0 });
        sfx?.playTileNav?.();
      }
      return;
    }

    if (dir === 'SELECT') {
      if (curZone === 'topbar') {
        if (curId === 'profile') {
          setShowProfileSelectModal?.(true);
          setFocusedTarget({ zone: 'profileModal', index: 0 });
          sfx?.playModalOpen?.();
        } else if (curId === 'bgm') {
          stateRef.current.bgm?.togglePlay?.();
          sfx?.playTileNav?.();
        } else if (curId === 'bgmSkip') {
          stateRef.current.bgm?.nextTrack?.();
          sfx?.playTabSwitch?.();
        } else if (curId === 'scraper') {
          if (stateRef.current.onOpenScraperModal) {
            stateRef.current.onOpenScraperModal();
            sfx?.playModalOpen?.();
          }
        } else if (curId === 'sfx') {
          sfx?.toggleMute?.();
        } else if (curId === 'theme') {
          if (stateRef.current.setShowThemeModal) {
            stateRef.current.setShowThemeModal(true);
            sfx?.playModalOpen?.();
          } else {
            stateRef.current.themeEngine?.cycleTheme?.();
            sfx?.playThemeSwitch?.();
          }
        } else if (curId === 'search') {
          if (stateRef.current.gamepadConnected) {
            setShowVirtualKeyboard(true);
            setOskPos({ row: 0, col: 0 });
            sfx?.playModalOpen?.();
          } else {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
              searchInputRef.current.select();
            }
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

    // Desktop Spatial Movements (UP, DOWN, LEFT, RIGHT)
    if (curZone === 'topbar') {
      const topbarItems = getDesktopTopbarItems();
      const curItemId = curTarget?.id || 'profile';
      const curIdx = topbarItems.indexOf(curItemId) >= 0 ? topbarItems.indexOf(curItemId) : 0;

      if (dir === 'LEFT') {
        const prevIdx = Math.max(0, curIdx - 1);
        setFocusedTarget({ zone: 'topbar', id: topbarItems[prevIdx] });
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT') {
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
        setFocusedTarget({ zone: 'topbar', id: curIndex === 0 ? 'profile' : (curIndex < allTabs.length / 2 ? 'search' : 'loadRom') });
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
        }
        return;
      }

      const curTheme = stateRef.current.themeEngine?.theme || 'vanilla';

      // 1. Nintendo DS Touch Dual-Screen (3-Column Buttons Grid)
      if (curTheme === 'ds') {
        let cols = 3;
        const gridEl = document.querySelector('.ds-buttons-grid');
        if (gridEl) {
          try {
            const computed = window.getComputedStyle(gridEl);
            const gridTemplateCols = computed.getPropertyValue('grid-template-columns');
            if (gridTemplateCols) {
              const count = gridTemplateCols.split(' ').filter(Boolean).length;
              if (count > 0) cols = count;
            }
          } catch {}
        }

        if (dir === 'RIGHT') {
          const nextIdx = Math.min(curIndex + 1, curGames.length - 1);
          setFocusedTarget({ zone: 'grid', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'LEFT') {
          const prevIdx = Math.max(0, curIndex - 1);
          setFocusedTarget({ zone: 'grid', index: prevIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          if (curIndex + cols < curGames.length) {
            setFocusedTarget({ zone: 'grid', index: curIndex + cols });
            sfx?.playTileNav?.();
          } else if (curIndex < curGames.length - 1) {
            setFocusedTarget({ zone: 'grid', index: curGames.length - 1 });
            sfx?.playTileNav?.();
          }
        } else if (dir === 'UP') {
          if (curIndex - cols >= 0) {
            setFocusedTarget({ zone: 'grid', index: curIndex - cols });
            sfx?.playTileNav?.();
          } else {
            const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
            setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
            sfx?.playTileNav?.();
          }
        }
      } 
      // 2. Horizontal Shelf Theme (Vanilla)
      else {
        if (dir === 'RIGHT') {
          const nextIdx = Math.min(curIndex + 1, curGames.length - 1);
          setFocusedTarget({ zone: 'grid', index: nextIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'LEFT') {
          const prevIdx = Math.max(0, curIndex - 1);
          setFocusedTarget({ zone: 'grid', index: prevIdx });
          sfx?.playTileNav?.();
        } else if (dir === 'UP') {
          const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
          setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          const nextIdx = Math.min(curIndex + 1, curGames.length - 1);
          setFocusedTarget({ zone: 'grid', index: nextIdx });
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
    fetchGames,
    setSelectedMobileGameForDetails,
    setHasChosenProfileThisSession,
    setShowProfileSwitcher,
    setSelectedMobileSystem,
    onSelectProfile,
    onCreateNewProfile,
    onPlayGame,
    toggleFavorite
  ]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K search shortcut
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setFocusedTarget(stateRef.current.isMobile ? { zone: 'mobileTopbar', id: 'search' } : { zone: 'topbar', id: 'search' });
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
          setFocusedTarget(stateRef.current.isMobile ? { zone: 'mobileChips', index: 0 } : { zone: 'grid', index: stateRef.current.focusedTarget?.index || 0 });
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
          } else if (stateRef.current.selectedMobileGameForDetails) {
            if (stateRef.current.toggleFavorite) {
              const nextState = stateRef.current.toggleFavorite(stateRef.current.selectedMobileGameForDetails);
              sfx?.playFavoriteToggle?.(nextState);
            }
          } else if (stateRef.current.isMobile) {
            const curMobileGame = stateRef.current.mobileGamesList?.[stateRef.current.focusedTarget?.index || 0] || stateRef.current.filteredGames?.[stateRef.current.focusedTarget?.index || 0];
            if (curMobileGame && stateRef.current.toggleFavorite) {
              const nextState = stateRef.current.toggleFavorite(curMobileGame);
              sfx?.playFavoriteToggle?.(nextState);
            }
          } else {
            const curGame = stateRef.current.filteredGames?.[stateRef.current.focusedTarget?.index || 0];
            if (curGame && stateRef.current.toggleFavorite) {
              const nextState = stateRef.current.toggleFavorite(curGame);
              sfx?.playFavoriteToggle?.(nextState);
            }
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          if (stateRef.current.setShowThemeModal) {
            stateRef.current.setShowThemeModal(true);
            sfx?.playModalOpen?.();
          } else if (stateRef.current.themeEngine?.cycleTheme) {
            stateRef.current.themeEngine.cycleTheme();
            sfx?.playThemeSwitch?.();
          }
          break;
        case 'q':
        case 'Q':
        case 'PageUp':
          e.preventDefault();
          if (!stateRef.current.isMobile) {
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
          if (!stateRef.current.isMobile) {
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
    const STICK_DEADZONE = 0.45;

    const pollGamepad = (timestamp) => {
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
        if (stateRef.current.activeGame) {
          const b = gp.buttons;
          const selectBtn = b[8]?.pressed;
          const startBtn = b[9]?.pressed;
          const l3Btn = b[10]?.pressed; // Left stick click (L3)
          const r3Btn = b[11]?.pressed; // Right stick click (R3)
          const guideBtn = b[16]?.pressed;
          const isExitCombo = (selectBtn && startBtn) || (l3Btn && r3Btn) || guideBtn;

          if (isExitCombo && !prevButtonsRef.current.exitCombo) {
            console.log('🎮 [GAMEPAD] Controller exit combo triggered. Exiting active game to library.');
            setActiveGame(null);
            setFocusedTarget(stateRef.current.isMobile ? { zone: 'mobileChips', index: 0 } : { zone: 'grid', index: stateRef.current.focusedTarget?.index || 0 });
          }
          prevButtonsRef.current = { exitCombo: isExitCombo };
          setTimeout(() => {
            animId = requestAnimationFrame(pollGamepad);
          }, 250);
          return;
        }

        const b = gp.buttons;
        const now = (typeof timestamp === 'number') ? timestamp : performance.now();
        const COOLDOWN = 180;

        // Detect all standard buttons
        const btnA = b[0]?.pressed;      // A / Cross (Select / Confirm)
        const btnB = b[1]?.pressed;      // B / Circle (Back / Cancel)
        const btnX = b[2]?.pressed;      // X / Square (Favorite / Space)
        const btnY = b[3]?.pressed;      // Y / Triangle (Search / OSK)
        const shoulderL = b[4]?.pressed; // L1 / Left Bumper (Prev System / Prev Game)
        const shoulderR = b[5]?.pressed; // R1 / Right Bumper (Next System / Next Game)
        const btnSelect = b[8]?.pressed; // Select / Back (Search)
        const btnStart = b[9]?.pressed;  // Start / Menu

        // D-Pad + Analog Stick Thresholds
        const dpadUp = b[12]?.pressed || (gp.axes[1] < -STICK_DEADZONE);
        const dpadDown = b[13]?.pressed || (gp.axes[1] > STICK_DEADZONE);
        const dpadLeft = b[14]?.pressed || (gp.axes[0] < -STICK_DEADZONE);
        const dpadRight = b[15]?.pressed || (gp.axes[0] > STICK_DEADZONE);

        // Instant Action Triggers (Bypasses cooldown timer for zero latency feel)
        
        // Y button or Select opens/toggles Search OSK when not in game
        if (!stateRef.current.activeGame && !stateRef.current.showInfoModal && !stateRef.current.showLoadRomModal) {
          if ((btnY && !prevButtonsRef.current.btnY) || (btnSelect && !prevButtonsRef.current.btnSelect)) {
            setShowVirtualKeyboard(prev => {
              const next = !prev;
              if (next) sfx?.playModalOpen?.();
              else sfx?.playModalClose?.();
              return next;
            });
            setOskPos({ row: 0, col: 0 });
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
            if (stateRef.current.isMobile) {
              setFocusedTarget(stateRef.current.searchQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
            } else {
              setFocusedTarget({ zone: 'grid', index: 0 });
            }
            sfx?.playModalClose?.();
            lastInputTimeRef.current = now;
          }
        } else if (!stateRef.current.activeGame && !stateRef.current.showInfoModal && !stateRef.current.showLoadRomModal) {
          // X button (Button 2 / Square / X) toggles Favorite on focused game or modal card
          if (btnX && !prevButtonsRef.current.btnX) {
            let targetGame = null;
            if (stateRef.current.selectedMobileGameForDetails) {
              targetGame = stateRef.current.selectedMobileGameForDetails;
            } else if (stateRef.current.selectedGameCard) {
              targetGame = stateRef.current.selectedGameCard;
            } else if (stateRef.current.isMobile) {
              const mList = stateRef.current.mobileGamesList || stateRef.current.filteredGames || [];
              const mIdx = stateRef.current.focusedTarget?.index || 0;
              targetGame = mList[mIdx] || mList[0] || null;
            } else {
              const gList = stateRef.current.filteredGames || [];
              const gIdx = stateRef.current.focusedTarget?.zone === 'grid' ? (stateRef.current.focusedTarget?.index || 0) : 0;
              targetGame = gList[gIdx] || gList[0] || null;
            }
            if (targetGame && stateRef.current.toggleFavorite) {
              const nextState = stateRef.current.toggleFavorite(targetGame);
              sfx?.playFavoriteToggle?.(nextState);
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
            if (stateRef.current.selectedGameCard) {
              stateRef.current.onPrevGame?.();
            } else if (!stateRef.current.isMobile) {
              const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
              const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
              const allSysKeys = ['all', 'favorites', 'recent', ...sortedSystems.map(s => s.key)];
              const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
              const nextSysIdx = (curSysIdx - 1 + allSysKeys.length) % allSysKeys.length;
              setActiveSystem(allSysKeys[nextSysIdx]);
              setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
              sfx?.playTabSwitch?.();
            } else {
              setFocusedTarget(prev => ({ zone: 'mobileChips', index: Math.max(0, (prev.index || 0) - 1) }));
              sfx?.playTabSwitch?.();
            }
            moved = true;
          } else if (shoulderR && !prevButtonsRef.current.shoulderR) {
            if (stateRef.current.selectedGameCard) {
              stateRef.current.onNextGame?.();
            } else if (!stateRef.current.isMobile) {
              const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
              const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
              const allSysKeys = ['all', 'favorites', 'recent', ...sortedSystems.map(s => s.key)];
              const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
              const nextSysIdx = (curSysIdx + 1) % allSysKeys.length;
              setActiveSystem(allSysKeys[nextSysIdx]);
              setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
              sfx?.playTabSwitch?.();
            } else {
              setFocusedTarget(prev => ({ zone: 'mobileChips', index: Math.min((stateRef.current.systems?.length || 1) - 1, (prev.index || 0) + 1) }));
              sfx?.playTabSwitch?.();
            }
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

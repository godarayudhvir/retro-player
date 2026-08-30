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
  showBackupModal,
  setShowBackupModal,
  showResetConfirm,
  setShowResetConfirm,
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
  filteredGames,
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
  showOnboarding = false,
  setShowOnboarding,
  games = [],
  achievementsEngine
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
      showInfoModal,
      showLoadRomModal,
      showScraperModal,
      showBackupModal,
      setShowBackupModal,
      showResetConfirm,
      setShowResetConfirm,
      showProfileSelectModal,
      showProfileCreatorModal: showProfileCreatorModal || showMiiCreatorModal,
      showVirtualKeyboard,
      oskConfig,
      setOskConfig,
      showOnboarding,
      setShowOnboarding,
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
      onPlayGame,
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
    showResetConfirm,
    showProfileSelectModal,
    showProfileCreatorModal,
    showMiiCreatorModal,
    showVirtualKeyboard,
    oskConfig,
    setOskConfig,
    showOnboarding,
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
    onPlayGame,
    games
  ]);

  // Spatial navigation engine
  const navigateSpatial = useCallback((dir) => {
    const {
      showInfoModal: isInfoOpen,
      showLoadRomModal: isLoadRomOpen,
      showVirtualKeyboard: isOskOpen,
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

    // On mobile devices, gamepad input is reserved strictly for in-game play
    if (curIsMobile && !curActiveGame) {
      return;
    }

    // 0. On-Screen Virtual Keyboard Navigation (5-Row Matrix - HIGHEST PRIORITY MODAL GUARD)
    if (isOskOpen) {
      const curConfig = stateRef.current.oskConfig || { target: 'search' };

      if (dir === 'BACK') {
        setShowVirtualKeyboard(false);
        const initialVal = curConfig.initialValue !== undefined ? curConfig.initialValue : '';
        if (curConfig.target === 'search') {
          setSearchQuery(initialVal);
        } else if (curConfig.onCancel) {
          curConfig.onCancel(initialVal);
        } else if (curConfig.onChange) {
          curConfig.onChange(initialVal);
        }
        if (curConfig.onCloseTarget) {
          setFocusedTarget(curConfig.onCloseTarget);
        } else if (curIsMobile) {
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
        const keyBtn = document.querySelector('.osk-key-focused');
        if (keyBtn) {
          keyBtn.click();
          sfx?.playKeyTick?.();
        } else {
          const key = KEYBOARD_ROWS[curOskPos.row]?.[curOskPos.col];

          const updateVal = (updater) => {
            if (curConfig.target === 'search') {
              setSearchQuery(updater);
            } else {
              const currentStr = curConfig.currentValue || '';
              const nextStr = updater(currentStr);
              setOskConfig(prev => ({ ...prev, currentValue: nextStr }));
              if (curConfig.onChange) curConfig.onChange(nextStr);
            }
          };

          if (key === '⌫') {
            updateVal(q => q.slice(0, -1));
            sfx?.playKeyTick?.();
          } else if (key === 'SPACE') {
            updateVal(q => q + ' ');
            sfx?.playKeyTick?.();
          } else if (key === 'CLEAR') {
            updateVal(() => '');
            sfx?.playKeyTick?.();
          } else if (key === 'DONE') {
            setShowVirtualKeyboard(false);
            const valToCommit = curConfig.currentValue !== undefined ? curConfig.currentValue : '';
            if (curConfig.onSubmit) {
              curConfig.onSubmit(valToCommit);
            } else if (curConfig.target !== 'search' && curConfig.onChange) {
              curConfig.onChange(valToCommit);
            }
            if (curConfig.onCloseTarget) {
              setFocusedTarget(curConfig.onCloseTarget);
            } else if (curIsMobile) {
              setFocusedTarget(curQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
            } else {
              setFocusedTarget({ zone: 'grid', index: 0 });
            }
            sfx?.playMenuConfirm?.();
          } else if (key) {
            updateVal(q => q + key);
            sfx?.playKeyTick?.();
          }
        }
      }
      return;
    }

    // 0.05 About & Controls Reference Modal Navigation Guard
    if (isInfoOpen) {
      if (dir === 'BACK' || dir === 'SELECT') {
        setShowInfoModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'info' });
        sfx?.playModalClose?.();
        return;
      }
      return;
    }

    // -0.5 Full-Screen Onboarding Navigation
    const { showOnboarding: isOnboardingOpen, setShowOnboarding: setOnboardClose } = stateRef.current;
    if (isOnboardingOpen) {
      const isCharacterStudioActive = Boolean(document.querySelector('.character-studio-container'));
      const isDualShockActive = Boolean(document.querySelector('.diagram-tester-card'));
      const defaultId = isCharacterStudioActive ? 'random' : (isDualShockActive ? 'next' : 'pillar_0');
      const curId = curTarget?.zone === 'onboarding' ? (curTarget?.id || defaultId) : defaultId;

      if (dir === 'BACK') {
        // Disabled in onboarding: users can still navigate to the on-screen "Back" button via D-pad and press Select (A)
        return;
      }

      if (dir === 'UP') {
        if (curId === 'next' || curId === 'back') {
          if (isCharacterStudioActive) {
            setFocusedTarget({ zone: 'onboarding', id: 'preset_4' });
          } else if (isDualShockActive) {
            const chips = document.querySelectorAll('.diagram-callout');
            if (chips.length > 0) {
              const lastChip = chips[chips.length - 1];
              lastChip?.click();
            }
            setFocusedTarget({ zone: 'onboarding', id: 'ds_chips' });
          } else {
            // Slide 0: from footer up to PWA CTA or bottom pillars
            const pwaCta = document.querySelector('.onboarding-pwa-cta-container');
            if (pwaCta) {
              setFocusedTarget({ zone: 'onboarding', id: 'pwa_cta' });
            } else {
              setFocusedTarget({ zone: 'onboarding', id: 'pillar_2' });
            }
          }
          sfx?.playTileNav?.();
        } else if (curId === 'pwa_cta') {
          setFocusedTarget({ zone: 'onboarding', id: 'pillar_2' });
          sfx?.playTileNav?.();
        } else if (curId === 'ds_chips') {
          setFocusedTarget({ zone: 'onboarding', id: 'skip' });
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_2' || curId === 'pillar_3') {
          // Row 2 up to Row 1
          setFocusedTarget({ zone: 'onboarding', id: curId === 'pillar_3' ? 'pillar_1' : 'pillar_0' });
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_0' || curId === 'pillar_1') {
          // Row 1 up to skip
          setFocusedTarget({ zone: 'onboarding', id: 'skip' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          if (pIdx >= 2) {
            setFocusedTarget({ zone: 'onboarding', id: `preset_${pIdx - 2}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'onboarding', id: 'category-heroes' });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('category-')) {
          setFocusedTarget({ zone: 'onboarding', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab' || curId === 'customTab' || curId === 'random') {
          setFocusedTarget({ zone: 'onboarding', id: 'skip' });
          sfx?.playTileNav?.();
        } else if (curId === 'nameInput') {
          setFocusedTarget({ zone: 'onboarding', id: 'customTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'seedInput') {
          setFocusedTarget({ zone: 'onboarding', id: 'nameInput' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          setFocusedTarget({ zone: 'onboarding', id: 'seedInput' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (curId === 'skip') {
          if (isCharacterStudioActive) {
            setFocusedTarget({ zone: 'onboarding', id: 'archetypeTab' });
          } else if (isDualShockActive) {
            setFocusedTarget({ zone: 'onboarding', id: 'ds_chips' });
          } else {
            // Slide 0: from skip down to first row of pillars
            setFocusedTarget({ zone: 'onboarding', id: 'pillar_0' });
          }
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_0' || curId === 'pillar_1') {
          // Row 1 down to Row 2
          setFocusedTarget({ zone: 'onboarding', id: curId === 'pillar_1' ? 'pillar_3' : 'pillar_2' });
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_2' || curId === 'pillar_3') {
          const pwaCta = document.querySelector('.onboarding-pwa-cta-container');
          if (pwaCta) {
            setFocusedTarget({ zone: 'onboarding', id: 'pwa_cta' });
          } else {
            setFocusedTarget({ zone: 'onboarding', id: 'next' });
          }
          sfx?.playTileNav?.();
        } else if (curId === 'pwa_cta') {
          setFocusedTarget({ zone: 'onboarding', id: 'next' });
          sfx?.playTileNav?.();
        } else if (curId === 'ds_chips') {
          setFocusedTarget({ zone: 'onboarding', id: 'next' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab' || curId === 'customTab') {
          if (curId === 'customTab') {
            setFocusedTarget({ zone: 'onboarding', id: 'nameInput' });
          } else {
            setFocusedTarget({ zone: 'onboarding', id: 'category-heroes' });
          }
          sfx?.playTileNav?.();
        } else if (curId.startsWith('category-')) {
          setFocusedTarget({ zone: 'onboarding', id: 'preset_0' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          const presetCards = document.querySelectorAll('.archetype-card-chip');
          if (pIdx + 2 < presetCards.length) {
            setFocusedTarget({ zone: 'onboarding', id: `preset_${pIdx + 2}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'onboarding', id: 'next' });
            sfx?.playTileNav?.();
          }
        } else if (curId === 'random' || curId.startsWith('color_')) {
          setFocusedTarget({ zone: 'onboarding', id: 'next' });
          sfx?.playTileNav?.();
        } else if (curId === 'nameInput') {
          setFocusedTarget({ zone: 'onboarding', id: 'seedInput' });
          sfx?.playTileNav?.();
        } else if (curId === 'seedInput') {
          setFocusedTarget({ zone: 'onboarding', id: 'color_0' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'LEFT') {
        if (curId === 'next') {
          const backBtn = document.querySelector('.onboarding-back-btn');
          if (backBtn) {
            setFocusedTarget({ zone: 'onboarding', id: 'back' });
            sfx?.playTileNav?.();
          }
        } else if (curId === 'pillar_1') {
          setFocusedTarget({ zone: 'onboarding', id: 'pillar_0' });
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_3') {
          setFocusedTarget({ zone: 'onboarding', id: 'pillar_2' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab') {
          setFocusedTarget({ zone: 'onboarding', id: 'random' });
          sfx?.playTileNav?.();
        } else if (curId === 'customTab') {
          setFocusedTarget({ zone: 'onboarding', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('category-')) {
          const catKeys = ['category-heroes', 'category-cyber', 'category-rpg', 'category-arcade'];
          const idx = catKeys.indexOf(curId);
          if (idx > 0) {
            setFocusedTarget({ zone: 'onboarding', id: catKeys[idx - 1] });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'onboarding', id: 'random' });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          if (pIdx > 0) {
            setFocusedTarget({ zone: 'onboarding', id: `preset_${pIdx - 1}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'onboarding', id: 'random' });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10) || 0;
          if (cIdx > 0) {
            setFocusedTarget({ zone: 'onboarding', id: `color_${cIdx - 1}` });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'RIGHT') {
        if (curId === 'back') {
          setFocusedTarget({ zone: 'onboarding', id: 'next' });
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_0') {
          setFocusedTarget({ zone: 'onboarding', id: 'pillar_1' });
          sfx?.playTileNav?.();
        } else if (curId === 'pillar_2') {
          setFocusedTarget({ zone: 'onboarding', id: 'pillar_3' });
          sfx?.playTileNav?.();
        } else if (curId === 'random') {
          setFocusedTarget({ zone: 'onboarding', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab') {
          setFocusedTarget({ zone: 'onboarding', id: 'customTab' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('category-')) {
          const catKeys = ['category-heroes', 'category-cyber', 'category-rpg', 'category-arcade'];
          const idx = catKeys.indexOf(curId);
          if (idx < catKeys.length - 1) {
            setFocusedTarget({ zone: 'onboarding', id: catKeys[idx + 1] });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          const presetCards = document.querySelectorAll('.archetype-card-chip');
          if (pIdx < presetCards.length - 1) {
            setFocusedTarget({ zone: 'onboarding', id: `preset_${pIdx + 1}` });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10) || 0;
          const colorDots = document.querySelectorAll('.character-color-circle');
          if (cIdx < colorDots.length - 1) {
            setFocusedTarget({ zone: 'onboarding', id: `color_${cIdx + 1}` });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'SELECT') {
        if (curId === 'skip') {
          const skipBtn = document.querySelector('.onboarding-skip-btn');
          if (skipBtn) skipBtn.click();
        } else if (curId === 'back') {
          const backBtn = document.querySelector('.onboarding-back-btn');
          if (backBtn) backBtn.click();
        } else if (curId === 'next') {
          // On Phase 3 (DualShock visualizer), only the physical START button or clicking the START button launches into the app
          const nextBtn = document.querySelector('.onboarding-primary-btn');
          const isPhase3 = Boolean(document.querySelector('.diagram-tester-card'));
          if (nextBtn && !isPhase3) {
            nextBtn.click();
          }
        } else if (curId === 'pillar_1') {
          const githubCard = document.querySelector('.onboarding-github-card');
          if (githubCard) githubCard.click();
        } else if (curId === 'pillar_pwa' || curId === 'pwa_cta') {
          const pwaBtn = document.querySelector('.onboarding-install-card-btn');
          const appleBtn = document.querySelector('.apple-copy-btn');
          if (pwaBtn) pwaBtn.click();
          else if (appleBtn) appleBtn.click();
        } else if (curId === 'random') {
          const randBtn = document.querySelector('.avatar-random-btn');
          if (randBtn) randBtn.click();
        } else if (curId === 'archetypeTab') {
          const tabs = document.querySelectorAll('.character-studio-tab');
          if (tabs[0]) tabs[0].click();
        } else if (curId === 'customTab') {
          const tabs = document.querySelectorAll('.character-studio-tab');
          if (tabs[1]) tabs[1].click();
        } else if (curId.startsWith('category-')) {
          const catId = curId.replace('category-', '');
          const catBtn = document.querySelector(`.archetype-category-btn[data-category-id="${catId}"]`) ||
                         document.querySelector(`.archetype-category-btn.${catId}`) ||
                         Array.from(document.querySelectorAll('.archetype-category-btn')).find(b => b.textContent.toLowerCase().includes(catId));
          if (catBtn) catBtn.click();
          sfx?.playTabSwitch?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          const presetCards = document.querySelectorAll('.archetype-card-chip');
          if (presetCards[pIdx]) presetCards[pIdx].click();
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10) || 0;
          const colorDots = document.querySelectorAll('.character-color-circle');
          if (colorDots[cIdx]) colorDots[cIdx].click();
        } else if (curId === 'nameInput') {
          const inputEl = document.getElementById('player-name-input');
          const currentVal = inputEl ? inputEl.value : '';
          if (stateRef.current.gamepadConnected && !stateRef.current.isMobile && stateRef.current.setOskConfig) {
            stateRef.current.setOskConfig({
              title: 'PLAYER NAME',
              subtitle: 'Type your handle or gamer tag',
              placeholder: 'Enter player handle...',
              actionLabel: 'SUBMIT',
              target: 'playerName',
              initialValue: currentVal,
              currentValue: currentVal,
              onCloseTarget: { zone: 'onboarding', id: 'nameInput' },
              onChange: (val) => {
                if (inputEl) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(inputEl, val);
                  } else {
                    inputEl.value = val;
                  }
                  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            });
            setShowVirtualKeyboard(true);
            setOskPos({ row: 0, col: 0 });
            sfx?.playModalOpen?.();
          } else if (inputEl) {
            inputEl.focus();
            inputEl.select();
          }
        } else if (curId === 'seedInput') {
          const seedEl = document.getElementById('avatar-seed-input');
          const currentVal = seedEl ? seedEl.value : '';
          if (stateRef.current.gamepadConnected && !stateRef.current.isMobile && stateRef.current.setOskConfig) {
            stateRef.current.setOskConfig({
              title: 'CUSTOM AVATAR SEED',
              subtitle: 'Type any word, name, or code to generate unique avatar',
              placeholder: 'Type any word or code...',
              actionLabel: 'SUBMIT',
              target: 'avatarSeed',
              initialValue: currentVal,
              currentValue: currentVal,
              onCloseTarget: { zone: 'onboarding', id: 'seedInput' },
              onChange: (val) => {
                if (seedEl) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(seedEl, val);
                  } else {
                    seedEl.value = val;
                  }
                  seedEl.dispatchEvent(new Event('input', { bubbles: true }));
                  seedEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            });
            setShowVirtualKeyboard(true);
            setOskPos({ row: 0, col: 0 });
            sfx?.playModalOpen?.();
          } else if (seedEl) {
            seedEl.focus();
            seedEl.select();
          }
        }
      }
      return;
    }

    // 2.1a Scraper Modal Navigation
    const { showScraperModal: isScraperOpen } = stateRef.current;
    if (isScraperOpen) {
      const scraperTabs = ['tab-all', 'tab-single'];
      const scraperFooter = ['cancel', 'start', 'scrape-again', 'done', 'stop', 'prompt-back', 'prompt-confirm'];
      const curId = curTarget?.zone === 'scraperModal' ? (curTarget?.id || 'tab-all') : 'tab-all';

      if (dir === 'BACK') {
        const modePromptEl = document.querySelector('.scraper-mode-prompt-pane');
        if (modePromptEl) {
          const backBtn = document.querySelector('.scraper-footer-actions .folder-btn');
          if (backBtn) backBtn.click();
          setFocusedTarget({ zone: 'scraperModal', id: 'start' });
          sfx?.playModalClose?.();
          return;
        }
        setShowScraperModal(false);
        setFocusedTarget({ zone: 'topbar', id: 'scraper' });
        sfx?.playModalClose?.();
        return;
      }

      if (dir === 'UP') {
        if (curId === 'prompt-back' || curId === 'prompt-confirm') {
          setFocusedTarget({ zone: 'scraperModal', id: 'mode-smart' });
          sfx?.playTileNav?.();
        } else if (curId === 'done' || curId === 'scrape-again') {
          const logsToggle = document.querySelector('.scraper-toggle-logs-btn');
          if (logsToggle) {
            setFocusedTarget({ zone: 'scraperModal', id: 'toggle-logs' });
            sfx?.playTileNav?.();
          }
        } else if (scraperFooter.includes(curId)) {
          const contentItems = document.querySelectorAll('.scraper-sys-chip');
          if (contentItems.length > 0) {
            setFocusedTarget({ zone: 'scraperModal', id: 'content-0' });
          } else {
            setFocusedTarget({ zone: 'scraperModal', id: 'tab-all' });
          }
          sfx?.playTileNav?.();
        } else if (curId.startsWith('content-')) {
          setFocusedTarget({ zone: 'scraperModal', id: 'tab-all' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (curId === 'mode-smart' || curId === 'mode-force') {
          setFocusedTarget({ zone: 'scraperModal', id: 'prompt-confirm' });
          sfx?.playTileNav?.();
        } else if (curId === 'toggle-logs') {
          setFocusedTarget({ zone: 'scraperModal', id: 'done' });
          sfx?.playTileNav?.();
        } else if (scraperTabs.includes(curId)) {
          const contentItems = document.querySelectorAll('.scraper-sys-chip');
          if (contentItems.length > 0) {
            setFocusedTarget({ zone: 'scraperModal', id: 'content-0' });
          } else {
            setFocusedTarget({ zone: 'scraperModal', id: 'cancel' });
          }
          sfx?.playTileNav?.();
        } else if (curId.startsWith('content-')) {
          setFocusedTarget({ zone: 'scraperModal', id: 'cancel' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'LEFT') {
        if (scraperTabs.includes(curId)) {
          const idx = scraperTabs.indexOf(curId);
          const next = Math.max(0, idx - 1);
          setFocusedTarget({ zone: 'scraperModal', id: scraperTabs[next] });
          sfx?.playTabSwitch?.();
        } else if (curId === 'mode-force') {
          setFocusedTarget({ zone: 'scraperModal', id: 'mode-smart' });
          sfx?.playTileNav?.();
        } else if (curId === 'prompt-confirm') {
          setFocusedTarget({ zone: 'scraperModal', id: 'prompt-back' });
          sfx?.playTileNav?.();
        } else if (curId === 'done') {
          setFocusedTarget({ zone: 'scraperModal', id: 'scrape-again' });
          sfx?.playTileNav?.();
        } else if (curId === 'start') {
          setFocusedTarget({ zone: 'scraperModal', id: 'cancel' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('content-')) {
          const cIdx = parseInt(curId.replace('content-', ''), 10) || 0;
          if (cIdx > 0) {
            setFocusedTarget({ zone: 'scraperModal', id: `content-${cIdx - 1}` });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'RIGHT') {
        if (scraperTabs.includes(curId)) {
          const idx = scraperTabs.indexOf(curId);
          const next = Math.min(scraperTabs.length - 1, idx + 1);
          setFocusedTarget({ zone: 'scraperModal', id: scraperTabs[next] });
          sfx?.playTabSwitch?.();
        } else if (curId === 'mode-smart') {
          setFocusedTarget({ zone: 'scraperModal', id: 'mode-force' });
          sfx?.playTileNav?.();
        } else if (curId === 'prompt-back') {
          setFocusedTarget({ zone: 'scraperModal', id: 'prompt-confirm' });
          sfx?.playTileNav?.();
        } else if (curId === 'scrape-again') {
          setFocusedTarget({ zone: 'scraperModal', id: 'done' });
          sfx?.playTileNav?.();
        } else if (curId === 'cancel') {
          setFocusedTarget({ zone: 'scraperModal', id: 'start' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('content-')) {
          const cIdx = parseInt(curId.replace('content-', ''), 10) || 0;
          const contentItems = document.querySelectorAll('.scraper-sys-chip');
          if (cIdx < contentItems.length - 1) {
            setFocusedTarget({ zone: 'scraperModal', id: `content-${cIdx + 1}` });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'SELECT') {
        if (curId === 'close' || curId === 'cancel' || curId === 'done') {
          setShowScraperModal(false);
          setFocusedTarget({ zone: 'topbar', id: 'scraper' });
          sfx?.playModalClose?.();
        } else if (curId === 'prompt-back') {
          const backBtn = document.querySelector('.scraper-footer-actions .folder-btn');
          if (backBtn) backBtn.click();
        } else if (curId === 'prompt-confirm') {
          const confirmBtn = document.querySelector('.scraper-footer-actions .settings-action-btn.primary');
          if (confirmBtn) confirmBtn.click();
        } else if (curId === 'mode-smart' || curId === 'mode-force') {
          const card = document.querySelector(curId === 'mode-smart' ? '.scraper-mode-card:nth-child(1)' : '.scraper-mode-card:nth-child(2)');
          if (card) card.click();
        } else if (curId === 'toggle-logs') {
          const logsToggle = document.querySelector('.scraper-toggle-logs-btn');
          if (logsToggle) logsToggle.click();
        } else if (curId === 'scrape-again') {
          const againBtn = document.querySelector('.scraper-footer-actions .folder-btn');
          if (againBtn) againBtn.click();
          setFocusedTarget({ zone: 'scraperModal', id: 'start' });
          sfx?.playTabSwitch?.();
        } else if (curId === 'stop') {
          const stopBtn = document.querySelector('.scraper-footer-actions .settings-action-btn');
          if (stopBtn) stopBtn.click();
          sfx?.playModalClose?.();
        } else if (curId === 'start') {
          const startBtn = document.querySelector('.settings-action-btn.primary');
          if (startBtn && !startBtn.disabled) startBtn.click();
          sfx?.playThemeSwitch?.();
        } else if (scraperTabs.includes(curId)) {
          const allTabEls = document.querySelectorAll('.scraper-scope-tab');
          const tabIdx = scraperTabs.indexOf(curId);
          if (allTabEls[tabIdx]) allTabEls[tabIdx].click();
          sfx?.playTabSwitch?.();
        } else if (curId.startsWith('content-')) {
          const cIdx = parseInt(curId.replace('content-', ''), 10) || 0;
          const contentItems = document.querySelectorAll('.scraper-sys-chip');
          if (contentItems[cIdx]) contentItems[cIdx].click();
          sfx?.playTileNav?.();
        }
      }
      return;
    }

    // 2.1c Metadata Edit Modal Navigation
    const isMetaEditOpen = curTarget?.zone === 'metaEditModal' || document.querySelector('.meta-edit-modal-backdrop');
    if (isMetaEditOpen && curTarget?.zone === 'metaEditModal') {
      const curId = curTarget?.id || 'close';
      if (dir === 'BACK') {
        const closeBtn = document.querySelector('.meta-edit-close-btn');
        if (closeBtn) closeBtn.click();
        sfx?.playModalClose?.();
        return;
      }
      if (dir === 'LEFT' || dir === 'UP') {
        if (curId === 'save') {
          setFocusedTarget({ zone: 'metaEditModal', id: 'cancel' });
        } else {
          setFocusedTarget({ zone: 'metaEditModal', id: 'close' });
        }
        sfx?.playTileNav?.();
      } else if (dir === 'RIGHT' || dir === 'DOWN') {
        if (curId === 'close' || curId === 'cancel') {
          setFocusedTarget({ zone: 'metaEditModal', id: 'save' });
        } else {
          setFocusedTarget({ zone: 'metaEditModal', id: 'cancel' });
        }
        sfx?.playTileNav?.();
      } else if (dir === 'SELECT') {
        if (curId === 'close' || curId === 'cancel') {
          const closeBtn = document.querySelector('.meta-edit-close-btn');
          if (closeBtn) closeBtn.click();
          sfx?.playModalClose?.();
        } else if (curId === 'save') {
          const saveBtn = document.querySelector('.meta-edit-save-btn');
          if (saveBtn) saveBtn.click();
          sfx?.playMenuConfirm?.();
        }
      }
      return;
    }

    // 2.3 Profile Creator Modal Navigation (Placed BEFORE Profile Select to avoid collision)
    const isCreatorOpen = stateRef.current.showProfileCreatorModal || stateRef.current.showMiiCreatorModal;
    if (isCreatorOpen) {
      const curId = curTarget?.zone === 'profileModal' ? (curTarget?.id || 'preset_0') : 'preset_0';
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
        } else if (curId === 'save' || curId === 'cancel') {
          setFocusedTarget({ zone: 'profileModal', id: 'preset_4' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          if (pIdx >= 2) {
            setFocusedTarget({ zone: 'profileModal', id: `preset_${pIdx - 2}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'category-heroes' });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('category-')) {
          setFocusedTarget({ zone: 'profileModal', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab' || curId === 'customTab' || curId === 'random') {
          setFocusedTarget({ zone: 'profileModal', id: 'close' });
          sfx?.playTileNav?.();
        } else if (curId === 'nameInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'customTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'seedInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'nameInput' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          setFocusedTarget({ zone: 'profileModal', id: 'seedInput' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (curId === 'close') {
          setFocusedTarget({ zone: 'profileModal', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab' || curId === 'customTab') {
          if (curId === 'customTab') {
            setFocusedTarget({ zone: 'profileModal', id: 'nameInput' });
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'category-heroes' });
          }
          sfx?.playTileNav?.();
        } else if (curId.startsWith('category-')) {
          setFocusedTarget({ zone: 'profileModal', id: 'preset_0' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          const presetCards = document.querySelectorAll('.archetype-card-chip');
          if (pIdx + 2 < presetCards.length) {
            setFocusedTarget({ zone: 'profileModal', id: `preset_${pIdx + 2}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'save' });
            sfx?.playTileNav?.();
          }
        } else if (curId === 'random') {
          const hasDelete = Boolean(document.querySelector('.profile-btn-danger'));
          setFocusedTarget({ zone: 'profileModal', id: hasDelete ? 'delete' : 'cancel' });
          sfx?.playTileNav?.();
        } else if (curId === 'nameInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'seedInput' });
          sfx?.playTileNav?.();
        } else if (curId === 'seedInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'color_0' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          setFocusedTarget({ zone: 'profileModal', id: 'save' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'LEFT') {
        if (curId === 'save') {
          setFocusedTarget({ zone: 'profileModal', id: 'cancel' });
          sfx?.playTileNav?.();
        } else if (curId === 'cancel') {
          const hasDelete = Boolean(document.querySelector('.profile-btn-danger'));
          if (hasDelete) {
            setFocusedTarget({ zone: 'profileModal', id: 'delete' });
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'random' });
          }
          sfx?.playTileNav?.();
        } else if (curId === 'delete') {
          setFocusedTarget({ zone: 'profileModal', id: 'random' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab') {
          setFocusedTarget({ zone: 'profileModal', id: 'random' });
          sfx?.playTileNav?.();
        } else if (curId === 'customTab') {
          setFocusedTarget({ zone: 'profileModal', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('category-')) {
          const catKeys = ['category-heroes', 'category-cyber', 'category-rpg', 'category-arcade'];
          const idx = catKeys.indexOf(curId);
          if (idx > 0) {
            setFocusedTarget({ zone: 'profileModal', id: catKeys[idx - 1] });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'random' });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          if (pIdx % 2 === 1) {
            setFocusedTarget({ zone: 'profileModal', id: `preset_${pIdx - 1}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'random' });
            sfx?.playTileNav?.();
          }
        } else if (curId === 'nameInput' || curId === 'seedInput') {
          setFocusedTarget({ zone: 'profileModal', id: 'random' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10) || 0;
          if (cIdx > 0) {
            setFocusedTarget({ zone: 'profileModal', id: `color_${cIdx - 1}` });
            sfx?.playTileNav?.();
          } else {
            setFocusedTarget({ zone: 'profileModal', id: 'random' });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'RIGHT') {
        if (curId === 'delete') {
          setFocusedTarget({ zone: 'profileModal', id: 'cancel' });
          sfx?.playTileNav?.();
        } else if (curId === 'cancel') {
          setFocusedTarget({ zone: 'profileModal', id: 'save' });
          sfx?.playTileNav?.();
        } else if (curId === 'random') {
          setFocusedTarget({ zone: 'profileModal', id: 'archetypeTab' });
          sfx?.playTileNav?.();
        } else if (curId === 'archetypeTab') {
          setFocusedTarget({ zone: 'profileModal', id: 'customTab' });
          sfx?.playTileNav?.();
        } else if (curId.startsWith('category-')) {
          const catKeys = ['category-heroes', 'category-cyber', 'category-rpg', 'category-arcade'];
          const idx = catKeys.indexOf(curId);
          if (idx < catKeys.length - 1) {
            setFocusedTarget({ zone: 'profileModal', id: catKeys[idx + 1] });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          const presetCards = document.querySelectorAll('.archetype-card-chip');
          if (pIdx % 2 === 0 && pIdx + 1 < 6) {
            setFocusedTarget({ zone: 'profileModal', id: `preset_${pIdx + 1}` });
            sfx?.playTileNav?.();
          }
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10) || 0;
          if (cIdx < 7) {
            setFocusedTarget({ zone: 'profileModal', id: `color_${cIdx + 1}` });
            sfx?.playTileNav?.();
          }
        }
      } else if (dir === 'SELECT') {
        if (curId === 'close' || curId === 'cancel') {
          setCreatorClose?.(false);
          setFocusedTarget({ zone: 'topbar', id: 'profile' });
          sfx?.playModalClose?.();
        } else if (curId === 'delete') {
          const delBtn = document.querySelector('.profile-btn-danger');
          if (delBtn) delBtn.click();
          sfx?.playTileNav?.();
        } else if (curId === 'random') {
          const randBtn = document.querySelector('.avatar-random-btn');
          if (randBtn) randBtn.click();
        } else if (curId === 'save') {
          const saveBtn = document.querySelector('.profile-btn-primary');
          if (saveBtn) saveBtn.click();
        } else if (curId === 'archetypeTab') {
          const tabs = document.querySelectorAll('.character-studio-tab');
          if (tabs[0]) tabs[0].click();
        } else if (curId === 'customTab') {
          const tabs = document.querySelectorAll('.character-studio-tab');
          if (tabs[1]) tabs[1].click();
        } else if (curId.startsWith('category-')) {
          const catId = curId.replace('category-', '');
          const catBtn = document.querySelector(`.archetype-category-btn[data-category-id="${catId}"]`) ||
                         document.querySelector(`.archetype-category-btn.${catId}`) ||
                         Array.from(document.querySelectorAll('.archetype-category-btn')).find(b => b.textContent.toLowerCase().includes(catId));
          if (catBtn) catBtn.click();
          sfx?.playTabSwitch?.();
        } else if (curId.startsWith('preset_')) {
          const pIdx = parseInt(curId.replace('preset_', ''), 10) || 0;
          const presetCards = document.querySelectorAll('.archetype-card-chip');
          if (presetCards[pIdx]) presetCards[pIdx].click();
        } else if (curId.startsWith('color_')) {
          const cIdx = parseInt(curId.replace('color_', ''), 10) || 0;
          const colorDots = document.querySelectorAll('.character-color-circle');
          if (colorDots[cIdx]) colorDots[cIdx].click();
        } else if (curId === 'nameInput') {
          const inputEl = document.getElementById('player-name-input');
          const currentVal = inputEl ? inputEl.value : '';
          if (stateRef.current.gamepadConnected && !stateRef.current.isMobile && stateRef.current.setOskConfig) {
            stateRef.current.setOskConfig({
              title: 'PLAYER NAME',
              subtitle: 'Type your handle or gamer tag',
              placeholder: 'Enter player handle...',
              actionLabel: 'SUBMIT',
              target: 'playerName',
              initialValue: currentVal,
              currentValue: currentVal,
              onCloseTarget: { zone: 'profileModal', id: 'nameInput' },
              onChange: (val) => {
                if (inputEl) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(inputEl, val);
                  } else {
                    inputEl.value = val;
                  }
                  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            });
            setShowVirtualKeyboard(true);
            setOskPos({ row: 0, col: 0 });
            sfx?.playModalOpen?.();
          } else if (inputEl) {
            inputEl.focus();
            inputEl.select();
          }
        } else if (curId === 'seedInput') {
          const seedEl = document.getElementById('avatar-seed-input');
          const currentVal = seedEl ? seedEl.value : '';
          if (stateRef.current.gamepadConnected && !stateRef.current.isMobile && stateRef.current.setOskConfig) {
            stateRef.current.setOskConfig({
              title: 'CUSTOM AVATAR SEED',
              subtitle: 'Type any word, name, or code to generate unique avatar',
              placeholder: 'Type any word or code...',
              actionLabel: 'SUBMIT',
              target: 'avatarSeed',
              initialValue: currentVal,
              currentValue: currentVal,
              onCloseTarget: { zone: 'profileModal', id: 'seedInput' },
              onChange: (val) => {
                if (seedEl) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(seedEl, val);
                  } else {
                    seedEl.value = val;
                  }
                  seedEl.dispatchEvent(new Event('input', { bubbles: true }));
                  seedEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            });
            setShowVirtualKeyboard(true);
            setOskPos({ row: 0, col: 0 });
            sfx?.playModalOpen?.();
          } else if (seedEl) {
            seedEl.focus();
            seedEl.select();
          }
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
          const allCards = document.querySelectorAll('.profile-card');
          if (allCards[curIndex]) {
            allCards[curIndex].click();
            sfx?.playTileNav?.();
          }
        }
      }
      return;
    }

    // 2.4 In-Game Topbar HUD Navigation
    if (curTarget?.zone === 'inGameBar') {
      // On mobile (≤820px), individual action buttons are hidden — only diagnostics and close are visible
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
          const fallbackIdx = stateRef.current.focusedTarget?.index || 0;
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
      return;
    }

    // 2.4b Mobile Sub-Toolbar Navigation (opened via L3 on mobile)
    if (curTarget?.zone === 'inGameSubBar') {
      const subBtns = ['restart', 'pause', 'mute', 'record', 'speed', 'screenshot', 'shader', 'save', 'load', 'diagnostics'];
      const curId = curTarget?.id || 'restart';
      const curIdx = subBtns.indexOf(curId) >= 0 ? subBtns.indexOf(curId) : 0;

      if (dir === 'BACK') {
        // Close the sub-toolbar and return to gameplay
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
      return;
    }

    // 2.4b Active Game in-emulator yield
    if (curActiveGame) {
      if (dir === 'BACK') {
        setActiveGame(null);
        setFocusedTarget(curIsMobile ? { zone: 'mobileChips', index: 0 } : { zone: 'grid', index: curTarget?.index || 0 });
      }
      return;
    }

    // Mobile UI uses native touch gestures for feeds, bottom sheets, and drilldowns.
    // Gamepad controller input on mobile is reserved strictly for in-game emulation.
    if (curIsMobile) {
      return;
    }

    // 4. DESKTOP CONSOLE SPATIAL NAVIGATION
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
      items.push('autoresume');
      items.push('search');
      if (stateRef.current.themeEngine) {
        items.push('colormode');
      }
      items.push('trophy');
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
        } else if (curId === 'autoresume') {
          try {
            const curVal = localStorage.getItem('retro_auto_resume_enabled') !== 'false';
            const nextVal = !curVal;
            localStorage.setItem('retro_auto_resume_enabled', nextVal ? 'true' : 'false');
            window.dispatchEvent(new Event('retro_auto_resume_changed'));
          } catch (e) {}
          sfx?.playTabSwitch?.();
        } else if (curId === 'colormode') {
          stateRef.current.themeEngine?.toggleColorMode?.();
          sfx?.playThemeSwitch?.();
        } else if (curId === 'trophy') {
          if (stateRef.current.onOpenTrophyModal) {
            stateRef.current.onOpenTrophyModal();
            sfx?.playModalOpen?.();
          }
        } else if (curId === 'search') {
          if (stateRef.current.gamepadConnected) {
            if (stateRef.current.setOskConfig) {
              stateRef.current.setOskConfig({
                title: 'SEARCH LIBRARY',
                subtitle: null,
                placeholder: 'Type game or system name...',
                actionLabel: 'SEARCH',
                target: 'search',
                initialValue: '',
                onCloseTarget: { zone: 'topbar', id: 'search' }
              });
            }
            setShowVirtualKeyboard(true);
            setOskPos({ row: 0, col: 0 });
            sfx?.playModalOpen?.();
          } else {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
              searchInputRef.current.select();
            }
          }
        }
      } else if (curZone === 'ribbon') {
        if (allTabs[curIndex]) {
          setActiveSystem(allTabs[curIndex].key);
          setFocusedTarget({ zone: 'grid', index: 0 });
          sfx?.playTabSwitch?.();
        }
      } else if (curZone === 'grid') {
        if (curGames[curIndex]) {
          const wideContainer = document.querySelector('.ds-wide-grid-layout');
          if (wideContainer) {
            const wideBtn = document.querySelector('.ds-rail-action-btn:last-of-type');
            if (wideBtn) wideBtn.click();
          }
          handleGameSelect(curGames[curIndex]);
          setFocusedTarget({ zone: 'cardModal', id: 'play' });
          sfx?.playTileNav?.();
        } else if (curGames.length === 0) {
          if (curQuery?.trim()) {
            setSearchQuery('');
            setFocusedTarget({ zone: 'grid', index: 0 });
            sfx?.playNavSelect?.();
          } else {
            fetchGames();
            sfx?.playTileNav?.();
          }
        }
      } else if (curZone === 'emptyGrid') {
        if (curQuery?.trim()) {
          setSearchQuery('');
          setFocusedTarget({ zone: 'grid', index: 0 });
          sfx?.playNavSelect?.();
        } else {
          const emptyBtn = document.querySelector('.empty-primary-btn');
          if (emptyBtn) emptyBtn.click();
          setFocusedTarget({ zone: 'grid', index: 0 });
          sfx?.playNavSelect?.();
        }
      } else if (curZone === 'cardModal') {
        // Card detail panel: play, fav, guides, edit
        const curId = curTarget?.id || 'play';
        if (curId === 'close') {
          const closeBtn = document.querySelector('.meta-edit-close-btn');
          if (closeBtn) closeBtn.click();
          sfx?.playModalClose?.();
        } else if (curId === 'play') {
          const playBtn = document.querySelector('.ds-play-now-btn');
          if (playBtn) playBtn.click();
          sfx?.playGameLaunch?.();
        } else if (curId === 'fav') {
          const favBtn = document.querySelector('.ds-tool-btn.is-favorited, .ds-action-toolbar .ds-tool-btn:first-child');
          if (favBtn) favBtn.click();
          sfx?.playFavoriteToggle?.(true);
        } else if (curId === 'save') {
          const saveBtn = document.querySelector('.ds-save-tab-btn');
          if (saveBtn) saveBtn.click();
          sfx?.playTabSwitch?.();
        } else if (curId === 'guides') {
          const guidesBtn = document.querySelector('.ds-guide-btn');
          if (guidesBtn) guidesBtn.click();
          sfx?.playTabSwitch?.();
        } else if (curId === 'save-export') {
          const exportBtn = document.querySelector('.ds-save-action-tile:nth-child(1)');
          if (exportBtn) exportBtn.click();
        } else if (curId === 'save-import') {
          const importBtn = document.querySelector('.ds-save-action-tile:nth-child(2)');
          if (importBtn) importBtn.click();
        } else if (curId === 'save-delete') {
          const deleteBtn = document.querySelector('.ds-save-action-tile.is-delete');
          if (deleteBtn) deleteBtn.click();
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
        setFocusedTarget({ zone: 'topbar', id: curIndex === 0 ? 'profile' : 'search' });
        sfx?.playTileNav?.();
      } else if (dir === 'DOWN') {
        const hasRailHeader = Boolean(document.querySelector('.ds-rail-header'));
        if (hasRailHeader) {
          setFocusedTarget({ zone: 'railHeader', id: 'size' });
        } else {
          setFocusedTarget({ zone: 'grid', index: 0 });
        }
        sfx?.playTileNav?.();
      }
    } else if (curZone === 'railHeader') {
      const curId = curTarget?.id || 'size';
      if (dir === 'LEFT') {
        if (curId === 'wide') {
          setFocusedTarget({ zone: 'railHeader', id: 'size' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'RIGHT') {
        if (curId === 'size') {
          setFocusedTarget({ zone: 'railHeader', id: 'wide' });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'UP') {
        const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
        setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
        sfx?.playTileNav?.();
      } else if (dir === 'DOWN') {
        setFocusedTarget({ zone: 'grid', index: 0 });
        sfx?.playTileNav?.();
      } else if (dir === 'SELECT') {
        if (curId === 'size') {
          const btn = document.querySelector('.ds-rail-action-btn:first-of-type');
          if (btn) btn.click();
        } else if (curId === 'wide') {
          const btn = document.querySelector('.ds-rail-action-btn:last-of-type');
          if (btn) btn.click();
        }
      }
    } else if (curZone === 'cardModal') {
      // Navigation within the DS game detail card panel
      const curId = curTarget?.id || 'play';
      const hasGuides = Boolean(document.querySelector('.ds-guide-btn'));
      // Tab order: fav -> save -> (guides) (top toolbar), play (bottom)
      const toolbarItems = hasGuides ? ['fav', 'save', 'guides'] : ['fav', 'save'];
      const isSavePaneOpen = Boolean(document.querySelector('.ds-save-studio'));
      const saveTiles = ['save-export', 'save-import', 'save-delete'];

      if (dir === 'BACK') {
        setFocusedTarget({ zone: 'grid', index: curIndex });
        sfx?.playTileNav?.();
      } else if (dir === 'UP') {
        if (curId === 'play') {
          if (isSavePaneOpen) {
            setFocusedTarget({ zone: 'cardModal', id: 'save-delete' });
          } else {
            setFocusedTarget({ zone: 'cardModal', id: 'fav' });
          }
          sfx?.playTileNav?.();
        } else if (saveTiles.includes(curId)) {
          const sIdx = saveTiles.indexOf(curId);
          if (sIdx > 0) {
            setFocusedTarget({ zone: 'cardModal', id: saveTiles[sIdx - 1] });
          } else {
            setFocusedTarget({ zone: 'cardModal', id: 'save' });
          }
          sfx?.playTileNav?.();
        } else {
          // Move to grid zone when pressing up from toolbar
          setFocusedTarget({ zone: 'grid', index: curIndex });
          sfx?.playTileNav?.();
        }
      } else if (dir === 'DOWN') {
        if (toolbarItems.includes(curId)) {
          if (curId === 'save' && isSavePaneOpen) {
            setFocusedTarget({ zone: 'cardModal', id: 'save-export' });
          } else {
            setFocusedTarget({ zone: 'cardModal', id: 'play' });
          }
          sfx?.playTileNav?.();
        } else if (saveTiles.includes(curId)) {
          const sIdx = saveTiles.indexOf(curId);
          if (sIdx < saveTiles.length - 1) {
            setFocusedTarget({ zone: 'cardModal', id: saveTiles[sIdx + 1] });
          } else {
            setFocusedTarget({ zone: 'cardModal', id: 'play' });
          }
          sfx?.playTileNav?.();
        }
      } else if (dir === 'LEFT') {
        if (toolbarItems.includes(curId)) {
          const idx = toolbarItems.indexOf(curId);
          const next = Math.max(0, idx - 1);
          setFocusedTarget({ zone: 'cardModal', id: toolbarItems[next] });
          sfx?.playTabSwitch?.();
        }
      } else if (dir === 'RIGHT') {
        if (toolbarItems.includes(curId)) {
          const idx = toolbarItems.indexOf(curId);
          const next = Math.min(toolbarItems.length - 1, idx + 1);
          setFocusedTarget({ zone: 'cardModal', id: toolbarItems[next] });
          sfx?.playTabSwitch?.();
        } else if (curId === 'play') {
          setFocusedTarget({ zone: 'cardModal', id: 'fav' });
          sfx?.playTileNav?.();
        }
      }
    } else if (curZone === 'emptyGrid') {
      if (dir === 'UP') {
        const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
        setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
        sfx?.playTileNav?.();
      }
    } else if (curZone === 'grid') {
      if (curGames.length === 0) {
        if (dir === 'UP') {
          const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
          setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
          sfx?.playTileNav?.();
        } else if (dir === 'DOWN') {
          setFocusedTarget({ zone: 'emptyGrid', id: curQuery ? 'clearSearch' : 'loadRom' });
          sfx?.playTileNav?.();
        }
        return;
      }

      let cols = 3;
      const gridEl = document.querySelector('.ds-buttons-grid') || document.querySelector('.mobile-ds-buttons-grid');
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
          const hasRailHeader = Boolean(document.querySelector('.ds-rail-header'));
          if (hasRailHeader) {
            setFocusedTarget({ zone: 'railHeader', id: 'size' });
          } else {
            const sysIdx = allTabs.findIndex(t => t.key === curActiveSys);
            setFocusedTarget({ zone: 'ribbon', index: sysIdx >= 0 ? sysIdx : 0 });
          }
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
          if (stateRef.current.selectedMobileGameForDetails) {
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
          if (stateRef.current.themeEngine?.toggleColorMode) {
            stateRef.current.themeEngine.toggleColorMode();
            sfx?.playThemeSwitch?.();
          }
          break;
        case 'q':
        case 'Q':
        case 'PageUp':
          e.preventDefault();
          if (stateRef.current.showScraperModal) {
            const scraperTabs = ['tab-all', 'tab-single', 'tab-multi', 'tab-title'];
            const curId = stateRef.current.focusedTarget?.zone === 'scraperModal' ? (stateRef.current.focusedTarget?.id || 'tab-all') : 'tab-all';
            const curIdx = scraperTabs.indexOf(curId) >= 0 ? scraperTabs.indexOf(curId) : 0;
            const nextIdx = (curIdx - 1 + scraperTabs.length) % scraperTabs.length;
            const allTabEls = document.querySelectorAll('.scraper-scope-tab');
            if (allTabEls[nextIdx]) allTabEls[nextIdx].click();
            setFocusedTarget({ zone: 'scraperModal', id: scraperTabs[nextIdx] });
            sfx?.playTabSwitch?.();
          } else if (!stateRef.current.isMobile) {
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
          if (stateRef.current.showScraperModal) {
            const scraperTabs = ['tab-all', 'tab-single', 'tab-multi', 'tab-title'];
            const curId = stateRef.current.focusedTarget?.zone === 'scraperModal' ? (stateRef.current.focusedTarget?.id || 'tab-all') : 'tab-all';
            const curIdx = scraperTabs.indexOf(curId) >= 0 ? scraperTabs.indexOf(curId) : 0;
            const nextIdx = (curIdx + 1) % scraperTabs.length;
            const allTabEls = document.querySelectorAll('.scraper-scope-tab');
            if (allTabEls[nextIdx]) allTabEls[nextIdx].click();
            setFocusedTarget({ zone: 'scraperModal', id: scraperTabs[nextIdx] });
            sfx?.playTabSwitch?.();
          } else if (!stateRef.current.isMobile) {
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

        // When a game is active in the emulator
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

          // 2. Single L3 (when R3 is NOT pressed) toggles in-game Topbar HUD focus
          const isL3Single = l3Btn && !r3Btn;
          if (isL3Single && !prevButtonsRef.current.l3Single) {
            const curZone = stateRef.current.focusedTarget?.zone;
            if (curZone === 'inGameBar' || curZone === 'inGameSubBar') {
              // Close sub-toolbar if it was opened via gamepad
              if (curZone === 'inGameSubBar') {
                const menuBtn = document.getElementById('ingame-menu');
                if (menuBtn) menuBtn.click();
              }
              setFocusedTarget({ zone: 'gameplay', id: 'canvas' });
              sfx?.playModalClose?.();
            } else if (stateRef.current.isMobile) {
              // On mobile: auto-open the sub-toolbar and focus first item
              const menuBtn = document.getElementById('ingame-menu');
              if (menuBtn) menuBtn.click();
              // Small delay to let React re-render the sub-toolbar before focusing
              setTimeout(() => {
                setFocusedTarget({ zone: 'inGameSubBar', id: 'restart' });
              }, 80);
              sfx?.playModalOpen?.();
            } else {
              // Desktop: focus the topbar HUD, landing on restart
              setFocusedTarget({ zone: 'inGameBar', id: 'restart' });
              sfx?.playModalOpen?.();
            }
            lastInputTimeRef.current = now;
          }

          // 3. If inGameBar or inGameSubBar is focused, navigate the topbar/sub-toolbar controls
          const activeInGameZone = stateRef.current.focusedTarget?.zone;
          if (activeInGameZone === 'inGameBar' || activeInGameZone === 'inGameSubBar') {
            const btnA = b[0]?.pressed;
            const btnB = b[1]?.pressed;
            const dpadLeft = b[14]?.pressed || (gp.axes[0] < -STICK_DEADZONE);
            const dpadRight = b[15]?.pressed || (gp.axes[0] > STICK_DEADZONE);

            if (now - lastInputTimeRef.current > COOLDOWN) {
              if (btnB && !prevButtonsRef.current.btnB) {
                navigateSpatial('BACK');
                lastInputTimeRef.current = now;
              } else if (btnA && !prevButtonsRef.current.btnA) {
                navigateSpatial('SELECT');
                lastInputTimeRef.current = now;
              } else if (dpadLeft) {
                navigateSpatial('LEFT');
                lastInputTimeRef.current = now;
              } else if (dpadRight) {
                navigateSpatial('RIGHT');
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
        const btnSelect = b[8]?.pressed; // Select / Back
        const btnStart = b[9]?.pressed;  // Start / Menu
        const btnL3 = b[10]?.pressed;    // L3 / Left Stick Click (Cycle Tile Size Density)
        const btnR3 = b[11]?.pressed;    // R3 / Right Stick Click (Toggle Panoramic Wide Grid)

        // D-Pad + Analog Stick Thresholds
        const dpadUp = b[12]?.pressed || (gp.axes[1] < -STICK_DEADZONE);
        const dpadDown = b[13]?.pressed || (gp.axes[1] > STICK_DEADZONE);
        const dpadLeft = b[14]?.pressed || (gp.axes[0] < -STICK_DEADZONE);
        const dpadRight = b[15]?.pressed || (gp.axes[0] > STICK_DEADZONE);

        // On mobile devices, gamepad input is reserved strictly for in-game play
        if (stateRef.current.isMobile && !stateRef.current.activeGame) {
          prevButtonsRef.current = {
            btnY, btnSelect, btnA, btnB, btnX, btnStart, shoulderL, shoulderR,
            dpadUp, dpadDown, dpadLeft, dpadRight
          };
          animId = requestAnimationFrame(pollGamepad);
          return;
        }

        // Y button opens/toggles Search OSK when not in game and when OSK is not already open
        if (!stateRef.current.isMobile && !stateRef.current.activeGame && !stateRef.current.showOnboarding && !stateRef.current.showInfoModal && !stateRef.current.showLoadRomModal && !stateRef.current.showVirtualKeyboard) {
          if (btnY && !prevButtonsRef.current.btnY) {
            if (stateRef.current.setOskConfig) {
              stateRef.current.setOskConfig({
                title: 'SEARCH LIBRARY',
                subtitle: null,
                placeholder: 'Type game or system name...',
                actionLabel: 'SUBMIT',
                target: 'search',
                initialValue: '',
                onCloseTarget: { zone: 'grid', index: 0 }
              });
            }
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
          const curConfig = stateRef.current.oskConfig || { target: 'search' };

          const updateOskText = (updater) => {
            if (curConfig.target === 'search') {
              setSearchQuery(updater);
            } else {
              const currentStr = curConfig.currentValue || '';
              const nextStr = updater(currentStr);
              if (stateRef.current.setOskConfig) stateRef.current.setOskConfig(prev => ({ ...prev, currentValue: nextStr }));
              if (curConfig.onChange) curConfig.onChange(nextStr);
            }
          };

          const cancelOsk = () => {
            setShowVirtualKeyboard(false);
            const initialVal = curConfig.initialValue !== undefined ? curConfig.initialValue : '';
            if (curConfig.target === 'search') {
              setSearchQuery(initialVal);
            } else if (curConfig.onCancel) {
              curConfig.onCancel(initialVal);
            } else if (curConfig.onChange) {
              curConfig.onChange(initialVal);
            }
            if (curConfig.onCloseTarget) {
              setFocusedTarget(curConfig.onCloseTarget);
            } else if (stateRef.current.isMobile) {
              setFocusedTarget(stateRef.current.searchQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
            } else {
              setFocusedTarget({ zone: 'grid', index: 0 });
            }
            sfx?.playModalClose?.();
            lastInputTimeRef.current = now;
          };

          const submitOsk = () => {
            setShowVirtualKeyboard(false);
            const valToCommit = curConfig.currentValue !== undefined ? curConfig.currentValue : '';
            if (curConfig.onSubmit) {
              curConfig.onSubmit(valToCommit);
            } else if (curConfig.target !== 'search' && curConfig.onChange) {
              curConfig.onChange(valToCommit);
            }
            if (curConfig.onCloseTarget) {
              setFocusedTarget(curConfig.onCloseTarget);
            } else if (stateRef.current.isMobile) {
              setFocusedTarget(stateRef.current.searchQuery?.trim() ? { zone: 'mobileSearchGrid', index: 0 } : { zone: 'mobileChips', index: 0 });
            } else {
              setFocusedTarget({ zone: 'grid', index: 0 });
            }
            sfx?.playMenuConfirm?.();
            lastInputTimeRef.current = now;
          };

          // 1. [L] Button (L1 Left Bumper) -> CLEAR ALL
          if (shoulderL && !prevButtonsRef.current.shoulderL) {
            updateOskText(() => '');
            sfx?.playMenuConfirm?.();
            lastInputTimeRef.current = now;
          }
          // 2. [R] Button (R1 Right Bumper) / START -> SUBMIT
          else if ((shoulderR && !prevButtonsRef.current.shoulderR) || (btnStart && !prevButtonsRef.current.btnStart)) {
            submitOsk();
          }
          // 3. [X] Button (Square / X) -> CLEAR CHARACTER (Backspace / ⌫)
          else if (btnX && !prevButtonsRef.current.btnX) {
            updateOskText(q => (q || '').slice(0, -1));
            sfx?.playKeyTick?.();
            lastInputTimeRef.current = now;
          }
          // 4. [Y] Button (Triangle / Y) -> SPACE
          else if (btnY && !prevButtonsRef.current.btnY) {
            updateOskText(q => (q || '') + ' ');
            sfx?.playKeyTick?.();
            lastInputTimeRef.current = now;
          }
          // 5. [B] Button (Circle / B) -> CANCEL / DISMISS / REVERT
          else if (btnB && !prevButtonsRef.current.btnB) {
            cancelOsk();
          }
        } else if (stateRef.current.showOnboarding) {
          // In Onboarding: Start button on any step triggers launch/skip into library
          if (btnStart && !prevButtonsRef.current.btnStart) {
            const skipBtn = document.querySelector('.onboarding-skip-btn');
            const finishBtn = document.querySelector('.onboarding-primary-btn');
            if (skipBtn) {
              skipBtn.click();
            } else if (finishBtn) {
              finishBtn.click();
            }
            lastInputTimeRef.current = now;
          }
        } else if (!stateRef.current.activeGame && !stateRef.current.showVirtualKeyboard && !stateRef.current.showOnboarding) {
          // 1. X button (Button 2 / Square / X) -> Opens Metadata Scraper from main UI, or triggers start/confirm/scrape-again inside scraper modal
          if (btnX && !prevButtonsRef.current.btnX) {
            if (stateRef.current.showScraperModal) {
              if (document.querySelector('.scraper-completion-pane')) {
                const btn = document.querySelector('.scraper-footer-actions .settings-action-btn.folder-btn');
                if (btn) btn.click();
              } else {
                const btn = document.querySelector('.scraper-footer-actions .settings-action-btn.primary');
                if (btn) btn.click();
              }
              sfx?.playThemeSwitch?.();
            } else if (!stateRef.current.showLoadRomModal && !stateRef.current.showProfileSelectModal && !stateRef.current.showProfileCreatorModal) {
              setShowScraperModal(true);
              setFocusedTarget({ zone: 'scraperModal', id: 'tab-all' });
              sfx?.playModalOpen?.();
            }
            lastInputTimeRef.current = now;
          }

          // 2. SELECT button (Button 8 / Share / Minus) -> Toggles Favorite ⭐ on focused game
          if (btnSelect && !prevButtonsRef.current.btnSelect) {
            if (stateRef.current.showInfoModal) {
              if (stateRef.current.toggleFavorite) {
                const nextState = stateRef.current.toggleFavorite(stateRef.current.showInfoModal);
                sfx?.playFavoriteToggle?.(nextState);
              }
            } else if (stateRef.current.selectedMobileGameForDetails) {
              if (stateRef.current.toggleFavorite) {
                const nextState = stateRef.current.toggleFavorite(stateRef.current.selectedMobileGameForDetails);
                sfx?.playFavoriteToggle?.(nextState);
              }
            } else if (stateRef.current.focusedTarget?.zone === 'grid') {
              const curGame = stateRef.current.filteredGames?.[stateRef.current.focusedTarget?.index || 0];
              if (curGame && stateRef.current.toggleFavorite) {
                const nextState = stateRef.current.toggleFavorite(curGame);
                sfx?.playFavoriteToggle?.(nextState);
              }
            } else if (stateRef.current.focusedTarget?.zone === 'mobileChips') {
              const curMobileGame = stateRef.current.mobileGamesList?.[stateRef.current.focusedTarget?.index || 0] || stateRef.current.filteredGames?.[stateRef.current.focusedTarget?.index || 0];
              if (curMobileGame && stateRef.current.toggleFavorite) {
                const nextState = stateRef.current.toggleFavorite(curMobileGame);
                sfx?.playFavoriteToggle?.(nextState);
              }
            }
            lastInputTimeRef.current = now;
          }

          // 3. START button (Button 9 / Options / Menu / Plus) -> Immediately quick-launches highlighted game
          if (btnStart && !prevButtonsRef.current.btnStart) {
            if (!stateRef.current.showLoadRomModal && !stateRef.current.showProfileSelectModal && !stateRef.current.showProfileCreatorModal && !stateRef.current.showScraperModal) {
              if (stateRef.current.selectedMobileGameForDetails && stateRef.current.onPlayGame) {
                stateRef.current.onPlayGame(stateRef.current.selectedMobileGameForDetails);
                sfx?.playGameLaunch?.();
              } else if (stateRef.current.focusedTarget?.zone === 'grid' || stateRef.current.focusedTarget?.zone === 'cardModal') {
                const curGame = stateRef.current.filteredGames?.[stateRef.current.focusedTarget?.index || 0] || stateRef.current.filteredGames?.[0];
                if (curGame && stateRef.current.onPlayGame) {
                  stateRef.current.onPlayGame(curGame);
                  sfx?.playGameLaunch?.();
                }
              } else if (stateRef.current.focusedTarget?.zone === 'mobileChips') {
                const curMobileGame = stateRef.current.mobileGamesList?.[stateRef.current.focusedTarget?.index || 0] || stateRef.current.filteredGames?.[stateRef.current.focusedTarget?.index || 0];
                if (curMobileGame && stateRef.current.onPlayGame) {
                  stateRef.current.onPlayGame(curMobileGame);
                  sfx?.playGameLaunch?.();
                }
              }
            }
            lastInputTimeRef.current = now;
          }

          // 4. L3 button (Button 10 / Left Thumbstick Click) -> Cycle Tile Size Density (S -> M -> L -> XL -> XXL)
          if (btnL3 && !prevButtonsRef.current.btnL3) {
            const sizeBtn = document.querySelector('.ds-rail-action-btn:first-of-type');
            if (sizeBtn) {
              sizeBtn.click();
            }
            lastInputTimeRef.current = now;
          }

          // 5. R3 button (Button 11 / Right Thumbstick Click) -> Toggle Panoramic Wide Grid Mode
          if (btnR3 && !prevButtonsRef.current.btnR3) {
            const wideBtn = document.querySelector('.ds-rail-action-btn:last-of-type');
            if (wideBtn) {
              wideBtn.click();
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
          } else if (shoulderL && !prevButtonsRef.current.shoulderL && !stateRef.current.showVirtualKeyboard) {
            if (stateRef.current.showScraperModal) {
              const summaryEl = document.querySelector('.scraper-completion-pane');
              if (summaryEl) {
                const terminalEl = document.querySelector('.scraper-terminal-view');
                const toggleLogsBtn = document.querySelector('.scraper-toggle-logs-btn');
                if (!terminalEl && toggleLogsBtn) {
                  // Toggle logs open
                  toggleLogsBtn.click();
                  setFocusedTarget({ zone: 'scraperModal', id: 'toggle-logs' });
                  sfx?.playTileNav?.();
                } else if (terminalEl) {
                  // Scroll Up
                  terminalEl.scrollBy({ top: -100, behavior: 'smooth' });
                  sfx?.playTileNav?.();
                }
              } else {
                const allTabEls = document.querySelectorAll('.scraper-scope-tab');
                if (allTabEls[0]) allTabEls[0].click();
                setFocusedTarget({ zone: 'scraperModal', id: 'tab-all' });
                sfx?.playTabSwitch?.();
              }
            } else if (stateRef.current.showProfileCreatorModal || stateRef.current.showMiiCreatorModal || (stateRef.current.showOnboarding && document.querySelector('.character-studio-container'))) {
              const zone = stateRef.current.showOnboarding ? 'onboarding' : 'profileModal';
              const tabs = document.querySelectorAll('.character-studio-tab');
              if (tabs[0]) tabs[0].click();
              setFocusedTarget({ zone, id: 'archetypeTab' });
              sfx?.playTabSwitch?.();
            } else if (!stateRef.current.isMobile && !stateRef.current.showOnboarding) {
              const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
              const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
              const allSysKeys = ['all', 'favorites', 'recent', ...sortedSystems.map(s => s.key)];
              const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
              const nextSysIdx = (curSysIdx - 1 + allSysKeys.length) % allSysKeys.length;
              setActiveSystem(allSysKeys[nextSysIdx]);
              setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
              sfx?.playTabSwitch?.();
            } else if (stateRef.current.isMobile && !stateRef.current.showOnboarding) {
              setFocusedTarget(prev => ({ zone: 'mobileChips', index: Math.max(0, (prev.index || 0) - 1) }));
              sfx?.playTabSwitch?.();
            }
            moved = true;
          } else if (shoulderR && !prevButtonsRef.current.shoulderR && !stateRef.current.showVirtualKeyboard) {
            if (stateRef.current.showScraperModal) {
              const summaryEl = document.querySelector('.scraper-completion-pane');
              if (summaryEl) {
                const terminalEl = document.querySelector('.scraper-terminal-view');
                if (terminalEl) {
                  // Scroll Down
                  terminalEl.scrollBy({ top: 100, behavior: 'smooth' });
                  sfx?.playTileNav?.();
                }
              } else {
                const allTabEls = document.querySelectorAll('.scraper-scope-tab');
                if (allTabEls[1]) allTabEls[1].click();
                setFocusedTarget({ zone: 'scraperModal', id: 'tab-single' });
                sfx?.playTabSwitch?.();
              }
            } else if (stateRef.current.showProfileCreatorModal || stateRef.current.showMiiCreatorModal || (stateRef.current.showOnboarding && document.querySelector('.character-studio-container'))) {
              const zone = stateRef.current.showOnboarding ? 'onboarding' : 'profileModal';
              const tabs = document.querySelectorAll('.character-studio-tab');
              if (tabs[1]) tabs[1].click();
              setFocusedTarget({ zone, id: 'customTab' });
              sfx?.playTabSwitch?.();
            } else if (!stateRef.current.isMobile && !stateRef.current.showOnboarding) {
              const activeSysList = stateRef.current.systems.filter(s => s.gameCount > 0);
              const sortedSystems = [...activeSysList].sort((a, b) => b.gameCount - a.gameCount);
              const allSysKeys = ['all', 'favorites', 'recent', ...sortedSystems.map(s => s.key)];
              const curSysIdx = allSysKeys.indexOf(stateRef.current.activeSystem);
              const nextSysIdx = (curSysIdx + 1) % allSysKeys.length;
              setActiveSystem(allSysKeys[nextSysIdx]);
              setFocusedTarget({ zone: 'ribbon', index: nextSysIdx });
              sfx?.playTabSwitch?.();
            } else if (stateRef.current.isMobile && !stateRef.current.showOnboarding) {
              setFocusedTarget(prev => ({ zone: 'mobileChips', index: Math.min((stateRef.current.systems?.length || 1) - 1, (prev.index || 0) + 1) }));
              sfx?.playTabSwitch?.();
            }
            moved = true;
          }

          if (gamepadConnectedRef.current) {
            achievementsEngine?.triggerPhysicalGamepadUsed?.();
          }
        }

        prevButtonsRef.current = { shoulderL, shoulderR, btnA, btnB, btnX, btnY, btnSelect, btnStart, btnL3, btnR3 };
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

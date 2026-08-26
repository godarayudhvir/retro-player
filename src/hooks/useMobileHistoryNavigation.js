import { useEffect, useRef, useCallback } from 'react';

/**
 * useMobileHistoryNavigation
 * 
 * Orchestrates browser history states (`pushState` / `popstate`) and edge-swipe touch gestures
 * for single-page PWA and mobile environments.
 * 
 * Prevents accidental app exit when swiping back or pressing Android hardware back,
 * mapping back navigation gracefully across the UI hierarchy:
 * 
 * Modals -> In-Game Emulator -> Game Detail Sheet -> System ROMs Grid -> Systems Selection -> Profiles / Onboarding
 */
export function useMobileHistoryNavigation({
  activeGame,
  setActiveGame,
  selectedMobileGameForDetails,
  setSelectedMobileGameForDetails,
  selectedMobileSystem,
  setSelectedMobileSystem,
  showProfileSwitcher,
  setShowProfileSwitcher,
  showOnboarding,
  setShowOnboarding,
  showInfoModal,
  setShowInfoModal,
  showLoadRomModal,
  setShowLoadRomModal,
  showScraperModal,
  setShowScraperModal,
  showThemeModal,
  setShowThemeModal,
  showBackupModal,
  setShowBackupModal,
  showProfileSelectModal,
  setShowProfileSelectModal,
  showProfileCreatorModal,
  setShowProfileCreatorModal,
  showVirtualKeyboard,
  setShowVirtualKeyboard,
  isMobile,
  sfx
}) {
  const isNavigatingRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Initialize base root history state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const currentState = window.history.state;
      if (!currentState || !currentState.retroApp) {
        window.history.replaceState({ retroApp: true, stage: 'root', depth: 0 }, document.title);
      }
    } catch (e) {
      console.warn('History state init error:', e);
    }
  }, []);

  // Compute current highest-priority active modal or layer
  const getActiveLayer = useCallback(() => {
    if (showOnboarding) return { type: 'modal', name: 'onboarding' };
    if (showProfileCreatorModal) return { type: 'modal', name: 'profileCreator' };
    if (showProfileSelectModal) return { type: 'modal', name: 'profileSelect' };
    if (showVirtualKeyboard) return { type: 'modal', name: 'virtualKeyboard' };
    if (showLoadRomModal) return { type: 'modal', name: 'loadRom' };
    if (showScraperModal) return { type: 'modal', name: 'scraper' };
    if (showThemeModal) return { type: 'modal', name: 'theme' };
    if (showBackupModal) return { type: 'modal', name: 'backup' };
    if (showInfoModal) return { type: 'modal', name: 'info' };
    if (showProfileSwitcher) return { type: 'layer', name: 'profileSwitcher' };
    if (activeGame) return { type: 'stage', name: 'emulator', item: activeGame };
    if (selectedMobileGameForDetails) return { type: 'stage', name: 'gameDetail', item: selectedMobileGameForDetails };
    if (selectedMobileSystem) return { type: 'stage', name: 'system', item: selectedMobileSystem };
    return { type: 'stage', name: 'root' };
  }, [
    showOnboarding,
    showProfileCreatorModal,
    showProfileSelectModal,
    showVirtualKeyboard,
    showLoadRomModal,
    showScraperModal,
    showThemeModal,
    showBackupModal,
    showInfoModal,
    showProfileSwitcher,
    activeGame,
    selectedMobileGameForDetails,
    selectedMobileSystem
  ]);

  // Synchronize forward transitions with pushState
  const currentLayerRef = useRef(getActiveLayer());
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const newLayer = getActiveLayer();
    const prevLayer = currentLayerRef.current;
    currentLayerRef.current = newLayer;

    // If change was caused by popstate listener, skip pushing
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    // Determine if we moved deeper into the navigation tree
    const isForward = 
      (prevLayer.name === 'root' && newLayer.name !== 'root') ||
      (prevLayer.name === 'system' && (newLayer.name === 'gameDetail' || newLayer.name === 'emulator' || newLayer.type === 'modal')) ||
      (prevLayer.name === 'gameDetail' && (newLayer.name === 'emulator' || newLayer.type === 'modal')) ||
      (prevLayer.type !== 'modal' && newLayer.type === 'modal');

    if (isForward) {
      try {
        const depth = (window.history.state?.depth || 0) + 1;
        window.history.pushState({ retroApp: true, layer: newLayer.name, depth }, document.title);
      } catch (e) {
        console.warn('History pushState error:', e);
      }
    }
  }, [getActiveLayer]);

  // Back action handler: pops current top-level UI layer
  const handleNavigateBack = useCallback(() => {
    if (showOnboarding) {
      setShowOnboarding(false);
      return true;
    }
    if (showProfileCreatorModal) {
      setShowProfileCreatorModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showProfileSelectModal) {
      setShowProfileSelectModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showVirtualKeyboard) {
      setShowVirtualKeyboard(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showLoadRomModal) {
      setShowLoadRomModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showScraperModal) {
      setShowScraperModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showThemeModal) {
      setShowThemeModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showBackupModal) {
      setShowBackupModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showInfoModal) {
      setShowInfoModal(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (showProfileSwitcher) {
      setShowProfileSwitcher(false);
      sfx?.playNavBack?.();
      return true;
    }
    if (activeGame) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('RETRO_PLAYER_REQUEST_EXIT'));
      }
      sfx?.playNavBack?.();
      return true;
    }
    if (selectedMobileGameForDetails) {
      setSelectedMobileGameForDetails(null);
      sfx?.playNavBack?.();
      return true;
    }
    if (selectedMobileSystem) {
      setSelectedMobileSystem(null);
      sfx?.playNavBack?.();
      return true;
    }
    return false;
  }, [
    showOnboarding,
    showProfileCreatorModal,
    showProfileSelectModal,
    showVirtualKeyboard,
    showLoadRomModal,
    showScraperModal,
    showThemeModal,
    showBackupModal,
    showInfoModal,
    showProfileSwitcher,
    activeGame,
    selectedMobileGameForDetails,
    selectedMobileSystem,
    setShowOnboarding,
    setShowProfileCreatorModal,
    setShowProfileSelectModal,
    setShowVirtualKeyboard,
    setShowLoadRomModal,
    setShowScraperModal,
    setShowThemeModal,
    setShowBackupModal,
    setShowInfoModal,
    setShowProfileSwitcher,
    setActiveGame,
    setSelectedMobileGameForDetails,
    setSelectedMobileSystem,
    sfx
  ]);

  // Listen for browser popstate (iOS back swipe, Android back button, Browser back)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPopState = (event) => {
      isNavigatingRef.current = true;
      const handled = handleNavigateBack();
      // If we are at root and nothing left to pop, ensure we keep the root state intact
      if (!handled && (!event.state || !event.state.retroApp)) {
        try {
          window.history.replaceState({ retroApp: true, stage: 'root', depth: 0 }, document.title);
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleNavigateBack]);

  // Touch Edge-Swipe Gesture Detector (left edge swipe -> back)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Only initiate gesture if touch starts within 35px of left screen edge
      if (touch.clientX <= 35) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      } else {
        touchStartRef.current = { x: -1, y: -1, time: 0 };
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartRef.current.x < 0) return;
      if (e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;

      touchStartRef.current = { x: -1, y: -1, time: 0 };

      // Swipe requirements:
      // 1. Moved at least 50px right
      // 2. Horizontal movement is at least 1.4x larger than vertical movement
      // 3. Completed within 600ms
      if (deltaX >= 50 && deltaX > deltaY * 1.4 && deltaTime <= 600) {
        // Trigger browser back which in turn triggers popstate
        if (window.history.state && window.history.state.depth > 0) {
          window.history.back();
        } else {
          handleNavigateBack();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNavigateBack]);

  return { handleNavigateBack };
}

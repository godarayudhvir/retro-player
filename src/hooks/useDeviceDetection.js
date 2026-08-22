import { useState, useEffect, useCallback } from 'react';

const MOBILE_PORTRAIT_QUERY = '(max-width: 768px) and (orientation: portrait)';
const TOUCH_PRIMARY_QUERY = '(hover: none) and (pointer: coarse)';
const UI_MODE_STORAGE_KEY = 'retro_ui_mode'; // 'auto' | 'console' | 'mobile'

/**
 * Custom hook for modern device, viewport, and primary-touch detection.
 * Utilizes native W3C MediaQueryList listeners to prevent resize layout thrashing.
 * Supports manual UI Display Mode overrides (Auto, Console / TV 10-Foot Mode, Mobile Touch Mode).
 */
export function useDeviceDetection() {
  const [uiMode, setUiModeState] = useState(() => {
    try {
      if (typeof window === 'undefined') return 'auto';
      return localStorage.getItem(UI_MODE_STORAGE_KEY) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [isMediaMobile, setIsMediaMobile] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(MOBILE_PORTRAIT_QUERY).matches;
  });

  const [isTouchPrimary, setIsTouchPrimary] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return (
      window.matchMedia(TOUCH_PRIMARY_QUERY).matches ||
      (('ontouchstart' in window) && window.innerWidth <= 768)
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mobileMql = window.matchMedia(MOBILE_PORTRAIT_QUERY);
    const touchMql = window.matchMedia(TOUCH_PRIMARY_QUERY);

    const handleMobileChange = (e) => {
      setIsMediaMobile(e.matches);
    };

    const handleTouchChange = (e) => {
      setIsTouchPrimary(
        e.matches || (('ontouchstart' in window) && window.innerWidth <= 768)
      );
    };

    // Modern MediaQueryList addEventListener with fallback for older browsers
    if (mobileMql.addEventListener) {
      mobileMql.addEventListener('change', handleMobileChange);
      touchMql.addEventListener('change', handleTouchChange);
    } else if (mobileMql.addListener) {
      mobileMql.addListener(handleMobileChange);
      touchMql.addListener(handleTouchChange);
    }

    return () => {
      if (mobileMql.removeEventListener) {
        mobileMql.removeEventListener('change', handleMobileChange);
        touchMql.removeEventListener('change', handleTouchChange);
      } else if (mobileMql.removeListener) {
        mobileMql.removeListener(handleMobileChange);
        touchMql.removeListener(handleTouchChange);
      }
    };
  }, []);

  const setUiMode = useCallback((mode) => {
    setUiModeState(mode);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(UI_MODE_STORAGE_KEY, mode);
      }
    } catch (e) {
      console.error('Failed to save UI mode preference:', e);
    }
  }, []);

  // Compute resolved isMobile boolean based on override or responsive media match
  const isMobile = uiMode === 'mobile' ? true : (uiMode === 'console' ? false : isMediaMobile);

  return {
    uiMode,
    setUiMode,
    isMobile,
    isMediaMobile,
    isTouchPrimary
  };
}

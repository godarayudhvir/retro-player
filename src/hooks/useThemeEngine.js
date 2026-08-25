import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, STORES } from '../services/db';

const THEME_STORAGE_KEY = 'retro_player_theme';
const COLOR_MODE_STORAGE_KEY = 'retro_player_color_mode';

export const THEMES = [
  {
    key: 'ds',
    name: 'DS Touch',
    shortName: 'DS TOUCH',
    icon: 'assets/platforms/nds.svg',
    description: 'Nintendo DS touchscreen graph paper with beveled silver tiles',
    accentColor: '#e11d48'
  }
];

/**
 * Hook to manage console visual themes and Light/Dark modes with instant persistence
 * and data-theme / data-color-mode DOM synchronization.
 */
export function useThemeEngine() {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && THEMES.some(t => t.key === stored)) {
        return stored;
      }
    } catch (e) {
      console.error('Failed to load theme from localStorage:', e);
    }
    return 'ds';
  });

  const [colorMode, setColorModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch (e) {
      console.error('Failed to load color mode from localStorage:', e);
    }
    return 'light';
  });

  // Async load from database on startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await dbGet(STORES.SETTINGS, 'theme_config');
        if (saved && isMounted) {
          if (saved.theme && THEMES.some(t => t.key === saved.theme)) {
            setThemeState(saved.theme);
          }
          if (saved.colorMode === 'light' || saved.colorMode === 'dark') {
            setColorModeState(saved.colorMode);
          }
        }
      } catch (e) {}
    })();
    return () => { isMounted = false; };
  }, []);

  // Synchronize document data-theme and data-color-mode attributes
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-color-mode', colorMode);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
      dbSet(STORES.SETTINGS, 'theme_config', { theme, colorMode });
    } catch (e) {
      console.error('Failed to persist theme & color mode:', e);
    }
  }, [theme, colorMode]);

  const setTheme = useCallback((themeKey) => {
    if (THEMES.some(t => t.key === themeKey)) {
      setThemeState(themeKey);
    }
  }, []);

  const setColorMode = useCallback((mode) => {
    if (mode === 'light' || mode === 'dark') {
      setColorModeState(mode);
    }
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const currentIndex = THEMES.findIndex(t => t.key === current);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      return THEMES[nextIndex].key;
    });
  }, []);

  const currentThemeMeta = THEMES.find(t => t.key === theme) || THEMES[0];

  return {
    theme,
    colorMode,
    currentThemeMeta,
    availableThemes: THEMES,
    setTheme,
    setColorMode,
    toggleColorMode,
    cycleTheme
  };
}

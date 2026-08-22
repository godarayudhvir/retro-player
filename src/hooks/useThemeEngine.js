import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'retro_player_theme';

export const THEMES = [
  {
    key: 'vanilla',
    name: 'Vanilla',
    shortName: 'VANILLA',
    icon: '🍦',
    description: 'Clean porcelain-white console UI with vibrant accents'
  }
];

/**
 * Hook to manage console visual themes with instant persistence and data-theme DOM synchronization.
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
    return 'vanilla';
  });

  // Synchronize document data-theme attribute
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to persist theme:', e);
    }
  }, [theme]);

  const setTheme = useCallback((themeKey) => {
    if (THEMES.some(t => t.key === themeKey)) {
      setThemeState(themeKey);
    }
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
    currentThemeMeta,
    availableThemes: THEMES,
    setTheme,
    cycleTheme
  };
}

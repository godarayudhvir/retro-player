import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'retro_player_theme';

export const THEMES = [
  {
    key: 'iisu',
    name: 'iiSU Light',
    shortName: 'LIGHT',
    icon: '☀️',
    description: 'Crisp porcelain white with Nintendo accents'
  },
  {
    key: 'midnight',
    name: 'Midnight Cyber',
    shortName: 'DARK',
    icon: '🌙',
    description: 'Deep obsidian slate with neon cyan glow'
  },
  {
    key: 'xmb',
    name: 'Sony XMB Wave',
    shortName: 'XMB',
    icon: '🌊',
    description: 'PlayStation dashboard with flowing wave aura'
  },
  {
    key: 'dmg',
    name: 'Game Boy DMG',
    shortName: 'DMG',
    icon: '📟',
    description: 'Classic monochromatic olive-green dot matrix'
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
    return 'iisu';
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

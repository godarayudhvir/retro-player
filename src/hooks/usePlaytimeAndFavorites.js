import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, STORES } from '../services/db';

const FAVORITES_KEY = 'retro_player_favorites';
const RECENTS_KEY = 'retro_player_recents';
const PLAYTIME_KEY = 'retro_player_playtime';

/**
 * Format total seconds into human-readable duration (e.g. "1 hr 45 min", "24 min", or "< 1 min").
 */
function formatPlaytime(seconds = 0) {
  if (!seconds || seconds < 60) return '< 1 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

/**
 * Format timestamp into relative or friendly date string.
 */
function formatLastPlayed(timestamp) {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Hook to manage persistent Favorites, Recently Played queue, and Playtime analytics in IndexedDB.
 * Supports isolated storage keys scoped per user profile.
 */
export function usePlaytimeAndFavorites(activeProfileId = 'default') {
  const favKey = `${FAVORITES_KEY}_${activeProfileId}`;
  const recentsKey = `${RECENTS_KEY}_${activeProfileId}`;
  const playtimeKey = `${PLAYTIME_KEY}_${activeProfileId}`;

  // Favorites collection (array of game IDs)
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(favKey);
      if (stored) return JSON.parse(stored);
      if (activeProfileId === 'prof_default' || activeProfileId === 'default') {
        const legacy = localStorage.getItem(FAVORITES_KEY);
        return legacy ? JSON.parse(legacy) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Recently Played collection (array of game summary objects)
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const stored = localStorage.getItem(recentsKey);
      if (stored) return JSON.parse(stored);
      if (activeProfileId === 'prof_default' || activeProfileId === 'default') {
        const legacy = localStorage.getItem(RECENTS_KEY);
        return legacy ? JSON.parse(legacy) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Playtime analytics map
  const [playtimeStats, setPlaytimeStats] = useState(() => {
    try {
      const stored = localStorage.getItem(playtimeKey);
      if (stored) return JSON.parse(stored);
      if (activeProfileId === 'prof_default' || activeProfileId === 'default') {
        const legacy = localStorage.getItem(PLAYTIME_KEY);
        return legacy ? JSON.parse(legacy) : {};
      }
      return {};
    } catch {
      return {};
    }
  });

  // Authoritative load from IndexedDB on activeProfileId change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const dbFavs = await dbGet(STORES.USER_DATA, `favs_${activeProfileId}`);
        if (isMounted && Array.isArray(dbFavs)) {
          setFavorites(dbFavs);
          try { localStorage.setItem(favKey, JSON.stringify(dbFavs)); } catch {}
        }

        const dbRecents = await dbGet(STORES.USER_DATA, `recents_${activeProfileId}`);
        if (isMounted && Array.isArray(dbRecents)) {
          setRecentlyPlayed(dbRecents);
          try { localStorage.setItem(recentsKey, JSON.stringify(dbRecents)); } catch {}
        }

        const dbPlaytime = await dbGet(STORES.USER_DATA, `playtime_${activeProfileId}`);
        if (isMounted && dbPlaytime && typeof dbPlaytime === 'object') {
          setPlaytimeStats(dbPlaytime);
          try { localStorage.setItem(playtimeKey, JSON.stringify(dbPlaytime)); } catch {}
        }
      } catch (e) {
        console.error('Failed loading profile data from IndexedDB:', e);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [activeProfileId, favKey, recentsKey, playtimeKey]);

  // Persist Favorites for active profile into IndexedDB & Cache
  useEffect(() => {
    try { localStorage.setItem(favKey, JSON.stringify(favorites)); } catch {}
    dbSet(STORES.USER_DATA, `favs_${activeProfileId}`, favorites);
  }, [favorites, favKey, activeProfileId]);

  // Persist Recently Played for active profile into IndexedDB & Cache
  useEffect(() => {
    try { localStorage.setItem(recentsKey, JSON.stringify(recentlyPlayed)); } catch {}
    dbSet(STORES.USER_DATA, `recents_${activeProfileId}`, recentlyPlayed);
  }, [recentlyPlayed, recentsKey, activeProfileId]);

  // Persist Playtime Stats for active profile into IndexedDB & Cache
  useEffect(() => {
    try { localStorage.setItem(playtimeKey, JSON.stringify(playtimeStats)); } catch {}
    dbSet(STORES.USER_DATA, `playtime_${activeProfileId}`, playtimeStats);
  }, [playtimeStats, playtimeKey, activeProfileId]);

  /**
   * Check if a game is favorited.
   */
  const isFavorite = useCallback((gameId) => {
    if (!gameId) return false;
    return favorites.includes(gameId);
  }, [favorites]);

  /**
   * Toggle favorite status for a given game.
   */
  const toggleFavorite = useCallback((game) => {
    if (!game) return false;
    const gameId = game.id || game.title;
    let nextState = false;

    setFavorites((prev) => {
      if (prev.includes(gameId)) {
        nextState = false;
        return prev.filter((id) => id !== gameId);
      } else {
        nextState = true;
        return [gameId, ...prev];
      }
    });

    return nextState;
  }, []);

  /**
   * Record when a game session is launched (updates recents and launch count).
   */
  const recordGameLaunch = useCallback((game) => {
    if (!game) return;
    const gameId = game.id || game.title;
    const now = Date.now();

    // 1. Update Recently Played queue
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((item) => (item.id || item.title) !== gameId);
      const recentEntry = {
        id: game.id || gameId,
        title: game.title,
        systemKey: game.systemKey,
        systemName: game.systemName,
        systemIcon: game.systemIcon,
        systemCore: game.systemCore,
        coverUrl: game.coverUrl,
        romUrl: game.romUrl,
        lastPlayed: now
      };
      return [recentEntry, ...filtered].slice(0, 40); // Keep max 40 items
    });

    // 2. Increment launch count in playtime stats
    setPlaytimeStats((prev) => {
      const current = prev[gameId] || {
        totalSeconds: 0,
        launchCount: 0,
        lastPlayed: now,
        lastSessionSeconds: 0
      };
      return {
        ...prev,
        [gameId]: {
          ...current,
          launchCount: (current.launchCount || 0) + 1,
          lastPlayed: now
        }
      };
    });
  }, []);

  /**
   * Record active gameplay duration upon exiting or pausing session.
   */
  const recordGameSession = useCallback((gameId, durationSeconds) => {
    if (!gameId || !durationSeconds || durationSeconds <= 0) return;
    const now = Date.now();

    setPlaytimeStats((prev) => {
      const current = prev[gameId] || {
        totalSeconds: 0,
        launchCount: 1,
        lastPlayed: now,
        lastSessionSeconds: 0
      };
      return {
        ...prev,
        [gameId]: {
          ...current,
          totalSeconds: (current.totalSeconds || 0) + Math.round(durationSeconds),
          lastSessionSeconds: Math.round(durationSeconds),
          lastPlayed: now
        }
      };
    });
  }, []);

  /**
   * Retrieve formatted statistics for a specific game.
   */
  const getGameStats = useCallback((gameId) => {
    if (!gameId) {
      return {
        totalSeconds: 0,
        playtimeFormatted: '< 1 min',
        launchCount: 0,
        lastPlayed: null,
        lastPlayedFormatted: 'Never'
      };
    }

    const stats = playtimeStats[gameId] || {
      totalSeconds: 0,
      launchCount: 0,
      lastPlayed: null
    };

    return {
      totalSeconds: stats.totalSeconds || 0,
      playtimeFormatted: formatPlaytime(stats.totalSeconds || 0),
      launchCount: stats.launchCount || 0,
      lastPlayed: stats.lastPlayed,
      lastPlayedFormatted: formatLastPlayed(stats.lastPlayed)
    };
  }, [playtimeStats]);

  /**
   * Reset stats for a specific game.
   */
  const resetGameStats = useCallback((gameId) => {
    if (!gameId) return;
    setPlaytimeStats((prev) => {
      const next = { ...prev };
      delete next[gameId];
      return next;
    });
  }, []);

  /**
   * Clear all stored playtime analytics.
   */
  const resetAllStats = useCallback(() => {
    setPlaytimeStats({});
    try {
      localStorage.removeItem(PLAYTIME_KEY);
    } catch (e) {}
  }, []);

  return {
    favorites,
    recentlyPlayed,
    playtimeStats,
    isFavorite,
    toggleFavorite,
    recordGameLaunch,
    recordGameSession,
    resetGameStats,
    resetAllStats,
    getGameStats
  };
}

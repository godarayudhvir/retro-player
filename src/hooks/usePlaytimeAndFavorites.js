import { useState, useEffect, useCallback } from 'react';

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
 * Hook to manage persistent Favorites, Recently Played queue, and Playtime analytics.
 */
export function usePlaytimeAndFavorites() {
  // Favorites collection (array of game IDs)
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load favorites from localStorage:', e);
      return [];
    }
  });

  // Recently Played collection (array of game summary objects)
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const stored = localStorage.getItem(RECENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load recents from localStorage:', e);
      return [];
    }
  });

  // Playtime analytics map ({ [gameId]: { totalSeconds, launchCount, lastPlayed, lastSessionSeconds } })
  const [playtimeStats, setPlaytimeStats] = useState(() => {
    try {
      const stored = localStorage.getItem(PLAYTIME_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Failed to load playtime stats from localStorage:', e);
      return {};
    }
  });

  // Persist Favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to persist favorites:', e);
    }
  }, [favorites]);

  // Persist Recently Played
  useEffect(() => {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(recentlyPlayed));
    } catch (e) {
      console.error('Failed to persist recents:', e);
    }
  }, [recentlyPlayed]);

  // Persist Playtime Stats
  useEffect(() => {
    try {
      localStorage.setItem(PLAYTIME_KEY, JSON.stringify(playtimeStats));
    } catch (e) {
      console.error('Failed to persist playtime stats:', e);
    }
  }, [playtimeStats]);

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

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ACHIEVEMENTS_MANIFEST, ACHIEVEMENT_TIERS, TOTAL_ACHIEVEMENT_POINTS } from '../data/achievementsManifest';
import { dbGet, dbSet, STORES } from '../services/db';

const STORAGE_PREFIX = 'achievements_';

/**
 * Format local date as YYYY-MM-DD according to player's browser local timezone.
 */
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate consecutive daily active streak from sorted YYYY-MM-DD string array.
 */
function calculateConsecutiveStreak(dateStrings = []) {
  if (!dateStrings || dateStrings.length === 0) return 0;
  
  const uniqueSortedDates = Array.from(new Set(dateStrings)).sort().reverse();
  const todayStr = getLocalDateString(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // Must have been active today or yesterday to maintain active streak
  if (uniqueSortedDates[0] !== todayStr && uniqueSortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(uniqueSortedDates[0] + 'T12:00:00');

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const prevDate = new Date(uniqueSortedDates[i] + 'T12:00:00');
    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if the active dates include both Saturday and Sunday of the most recent weekend.
 */
function checkWeekendPlayed(dateStrings = []) {
  if (!dateStrings || dateStrings.length === 0) return false;
  const recent = dateStrings.slice(-14);
  const daysOfWeek = recent.map(d => new Date(d + 'T12:00:00').getDay());
  return daysOfWeek.includes(0) && daysOfWeek.includes(6); // 0 = Sunday, 6 = Saturday
}

/**
 * Universal Organic Achievements & Milestones Hook.
 * Scoped per profile and synced with IndexedDB.
 */
export function useAchievements({ activeProfileId = 'default', sfx, mountedGames = [], isPlaying = false }) {
  const [unlocked, setUnlocked] = useState({});
  const unlockedRef = useRef({});
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  const [stats, setStats] = useState({
    totalLaunches: 0,
    recentLaunches: [],
    systemsPlayed: [],
    totalPlaytimeSeconds: 0,
    bgmTracksListened: [],
    avatarChangeCount: 0,
    themeToggleCount: 0,
    activeDates: [],
    perGameStats: {}
  });

  const [activeToast, setActiveToast] = useState(null);
  const toastQueueRef = useRef([]);
  const isToastingRef = useRef(false);
  const toastTimerRef = useRef(null);
  const sfxRef = useRef(sfx);
  sfxRef.current = sfx;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const sessionUnlocksRef = useRef([]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  // Key for active profile
  const dbKey = `${STORAGE_PREFIX}${activeProfileId || 'default'}`;

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    let isMounted = true;
    async function loadAchievements() {
      try {
        const saved = await dbGet(STORES.USER_DATA, dbKey);
        if (saved && isMounted) {
          const loadedUnlocked = saved.unlocked || {};
          setUnlocked(loadedUnlocked);
          unlockedRef.current = loadedUnlocked;

          console.log(`🏆 [ACHIEVEMENTS INIT] Loaded ${Object.keys(loadedUnlocked).length} unlocked trophies from storage for profile "${activeProfileId || 'default'}"`);

          setStats(prev => ({
            ...prev,
            ...(saved.stats || {}),
            perGameStats: { ...(prev.perGameStats || {}), ...(saved.stats?.perGameStats || {}) }
          }));
        } else if (isMounted) {
          console.log(`🏆 [ACHIEVEMENTS INIT] Clean profile state for "${activeProfileId || 'default'}" (0 unlocked)`);
        }
      } catch (err) {
        console.warn('⚠️ [ACHIEVEMENTS] Failed to load from IndexedDB:', err);
      }
    }
    loadAchievements();
    return () => { isMounted = false; };
  }, [dbKey, activeProfileId]);

  // 2. Persist to IndexedDB whenever unlocked or stats change
  const persistState = useCallback(async (newUnlocked, newStats) => {
    try {
      await dbSet(STORES.USER_DATA, dbKey, {
        unlocked: newUnlocked,
        stats: newStats,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.warn('⚠️ [ACHIEVEMENTS] Failed to persist to IndexedDB:', err);
    }
  }, [dbKey]);

  // 3. Process Toast Queue (Strict Single-Timer Execution)
  const processNextToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    if (toastQueueRef.current.length === 0) {
      isToastingRef.current = false;
      setActiveToast(null);
      return;
    }

    isToastingRef.current = true;
    const nextAch = toastQueueRef.current.shift();
    console.log(`🏆 [ACHIEVEMENTS TOAST ACTIVE] Pop-up active for "${nextAch.title}" (+${nextAch.tier} tier)`);
    setActiveToast({ ...nextAch });

    // Play chiptune fanfare
    try {
      sfxRef.current?.playAchievementUnlock?.();
    } catch (e) {
      console.warn('SFX fanfare error:', e);
    }

    // Auto dismiss after 4.5 seconds
    toastTimerRef.current = setTimeout(() => {
      processNextToast();
    }, 4500);
  }, []);

  const triggerToast = useCallback((achMeta) => {
    if (!achMeta || !achMeta.id) return;
    // Check if already in queue or currently active
    if (toastQueueRef.current.some(x => x.id === achMeta.id)) return;

    console.log(`🏆 [ACHIEVEMENTS TOAST QUEUED] Added to toast queue: "${achMeta.title}"`);
    toastQueueRef.current.push(achMeta);
    if (!isToastingRef.current) {
      processNextToast();
    }
  }, [processNextToast]);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    processNextToast();
  }, [processNextToast]);

  // 4. Core Unlock Method
  const unlockAchievement = useCallback((achievementId, gameContext = null) => {
    if (!achievementId) return;
    // Immediate synchronous guard against duplicate unlock execution
    if (unlockedRef.current[achievementId]) return;

    const manifestItem = ACHIEVEMENTS_MANIFEST.find(a => a.id === achievementId);
    if (!manifestItem) return;

    const newUnlockEntry = {
      id: achievementId,
      title: manifestItem.title,
      description: manifestItem.description,
      tier: manifestItem.tier,
      category: manifestItem.category,
      icon: manifestItem.icon,
      unlockedAt: new Date().toISOString(),
      gameId: gameContext?.id || gameContext?.title || null,
      gameTitle: gameContext?.title || null,
      systemKey: gameContext?.systemKey || null
    };

    // Mark in ref immediately to block re-entrant calls in the same tick
    unlockedRef.current[achievementId] = newUnlockEntry;

    console.log(`🏆 [ACHIEVEMENT UNLOCKED] 🎉 "${manifestItem.title}" (${achievementId}) | Defer In-Game: ${isPlayingRef.current}`);

    // Update state
    setUnlocked(prevUnlocked => ({
      ...prevUnlocked,
      [achievementId]: newUnlockEntry
    }));

    // Trigger toast or buffer for session exit OUTSIDE setState reducer
    if (isPlayingRef.current) {
      if (!sessionUnlocksRef.current.some(x => x.id === achievementId)) {
        console.log(`🏆 [ACHIEVEMENT DEFERRED] Buffered for session exit: "${manifestItem.title}"`);
        sessionUnlocksRef.current.push(newUnlockEntry);
      }
    } else {
      triggerToast(newUnlockEntry);
    }

    // Persist to storage OUTSIDE setState reducer
    setStats(latestStats => {
      persistState({ ...unlockedRef.current, [achievementId]: newUnlockEntry }, latestStats);
      return latestStats;
    });
  }, [triggerToast, persistState]);

  // 5. Evaluate Habits, Time of Day & Calendar Streaks (Local Time)
  const evaluateLocalHabitsAndStreaks = useCallback((targetStats) => {
    const now = new Date();
    const localHour = now.getHours();
    const localMin = now.getMinutes();
    const todayStr = getLocalDateString(now);

    // Night Owl: 1:00 AM to 4:30 AM local time
    if (localHour >= 1 && (localHour < 4 || (localHour === 4 && localMin <= 30))) {
      unlockAchievement('night_owl');
    }

    // Early Bird: 5:00 AM to 8:00 AM local time
    if (localHour >= 5 && localHour < 8) {
      unlockAchievement('early_bird');
    }

    // Update active dates calendar
    const activeDates = Array.from(new Set([...(targetStats.activeDates || []), todayStr])).sort();
    
    // Weekend Warrior: Sat & Sun of same weekend
    if (checkWeekendPlayed(activeDates)) {
      unlockAchievement('weekend_warrior');
    }

    // Streaks calculation
    const streak = calculateConsecutiveStreak(activeDates);
    if (streak >= 3) {
      unlockAchievement('daily_streak_3');
    }
    if (streak >= 7) {
      unlockAchievement('weekly_streak_7');
    }

    return activeDates;
  }, [unlockAchievement]);

  // Check mounted library size
  useEffect(() => {
    if (!mountedGames || mountedGames.length === 0) return;
    if (mountedGames.length >= 25) {
      unlockAchievement('cartridge_collector');
    }
    if (mountedGames.length >= 100) {
      unlockAchievement('grand_archivist');
    }
  }, [mountedGames?.length, unlockAchievement]);

  // ---------------------------------------------------------------------------
  // PUBLIC EVENT TRIGGERS
  // ---------------------------------------------------------------------------

  /**
   * Called when any game is launched.
   */
  const triggerGameLaunch = useCallback((game) => {
    if (!game) return;
    isPlayingRef.current = true;
    const gameKey = game.id || game.title;
    const now = Date.now();

    setStats(prev => {
      const nextLaunches = prev.totalLaunches + 1;
      const systems = Array.from(new Set([...(prev.systemsPlayed || []), game.systemKey || 'unknown']));
      
      console.log(`🏆 [ACHIEVEMENTS LAUNCH] Booting: "${game?.title}" (Launch #${nextLaunches}) | Total Systems: ${systems.length}`);

      // Keep last 10 launches for rapid swap evaluation
      const recentLaunches = [...(prev.recentLaunches || []), { timestamp: now, gameId: gameKey }].slice(-10);

      const perGame = { ...(prev.perGameStats || {}) };
      const currentPerGame = perGame[gameKey] || { launches: 0, playtimeSeconds: 0 };
      perGame[gameKey] = {
        ...currentPerGame,
        launches: (currentPerGame.launches || 0) + 1,
        lastLaunched: now
      };

      const updatedStats = {
        ...prev,
        totalLaunches: nextLaunches,
        systemsPlayed: systems,
        recentLaunches,
        perGameStats: perGame
      };

      // 1. Insert Coin (First Launch)
      if (nextLaunches >= 1) {
        unlockAchievement('first_launch', game);
      }

      // 2. Console Hopper (3 distinct systems)
      if (systems.length >= 3) {
        unlockAchievement('console_hopper');
      }

      // 3. Generation Traveler (8-bit + 16-bit + 32/64-bit)
      const has8Bit = systems.some(s => ['nes', 'gb', 'gbc', 'atari2600', 'gg'].includes(s?.toLowerCase()));
      const has16Bit = systems.some(s => ['snes', 'genesis', 'megadrive'].includes(s?.toLowerCase()));
      const has32Or64Bit = systems.some(s => ['n64', 'ps1', 'psx', 'nds', 'gba'].includes(s?.toLowerCase()));
      if (has8Bit && has16Bit && has32Or64Bit) {
        unlockAchievement('gen_traveler');
      }

      // 4. Indecisive Swapper (3 distinct launches within 3 minutes = 180s)
      if (recentLaunches.length >= 3) {
        const last3 = recentLaunches.slice(-3);
        const uniqueTitles = new Set(last3.map(l => l.gameId));
        if (uniqueTitles.size >= 3 && (last3[2].timestamp - last3[0].timestamp <= 180000)) {
          unlockAchievement('indecisive_swapper');
        }
      }

      // 5. Library Tourist (5 launches in session)
      if (recentLaunches.length >= 5) {
        unlockAchievement('library_tourist');
      }

      // 6. Local time habits & streaks
      updatedStats.activeDates = evaluateLocalHabitsAndStreaks(updatedStats);

      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, evaluateLocalHabitsAndStreaks, persistState, unlocked]);

  /**
   * Called when emulator exits.
   */
  const triggerGameExit = useCallback((game, sessionDurationSeconds = 0) => {
    isPlayingRef.current = false;
    const gameObj = (typeof game === 'string') ? { id: game, title: game } : game;
    const gameKey = gameObj?.id || gameObj?.title || 'session_game';

    console.log(`🏆 [ACHIEVEMENTS EXIT] Exited: "${gameKey}" | Session duration: ${sessionDurationSeconds}s | Buffered Unlocks: ${sessionUnlocksRef.current.length}`);

    setStats(prev => {
      const nextTotalPlaytime = (prev.totalPlaytimeSeconds || 0) + sessionDurationSeconds;
      const perGame = { ...(prev.perGameStats || {}) };
      const currentPerGame = perGame[gameKey] || { launches: 0, playtimeSeconds: 0 };
      const nextGamePlaytime = (currentPerGame.playtimeSeconds || 0) + sessionDurationSeconds;

      perGame[gameKey] = {
        ...currentPerGame,
        playtimeSeconds: nextGamePlaytime
      };

      const updatedStats = {
        ...prev,
        totalPlaytimeSeconds: nextTotalPlaytime,
        perGameStats: perGame
      };

      // 1. Instant Regret / Rage Quit (< 45s on exit)
      if (sessionDurationSeconds > 3 && sessionDurationSeconds < 45) {
        unlockAchievement('rage_quit', gameObj);
      }

      // 2. Warming Up (15 minutes cumulative across library)
      if (nextTotalPlaytime >= 900) {
        unlockAchievement('warming_up');
      }

      // 3. Marathon Runner (1 hour continuous session)
      if (sessionDurationSeconds >= 3600) {
        unlockAchievement('marathon_runner', gameObj);
      }

      // 4. Ironman Endurance (2.5 hours continuous session)
      if (sessionDurationSeconds >= 9000) {
        unlockAchievement('ironman_endurance', gameObj);
      }

      // 5. Loyal Companion (5 hours total on single game)
      if (nextGamePlaytime >= 18000) {
        unlockAchievement('loyal_companion', gameObj);
      }

      // 6. Century Club (50 hours total)
      if (nextTotalPlaytime >= 180000) {
        unlockAchievement('century_club');
      }

      // 7. Flush all deferred session unlocks sequentially upon returning to library
      if (sessionUnlocksRef.current.length > 0) {
        const deferred = [...sessionUnlocksRef.current];
        sessionUnlocksRef.current = [];
        console.log(`🏆 [ACHIEVEMENTS FLUSH] Toasting ${deferred.length} deferred unlocks from session!`);
        setTimeout(() => {
          deferred.forEach(entry => {
            if (entry && !toastQueueRef.current.some(x => x.id === entry.id)) {
              toastQueueRef.current.push(entry);
            }
          });
          if (!isToastingRef.current) {
            processNextToast();
          }
        }, 300);
      }

      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked, processNextToast]);

  /**
   * Quick Save executed.
   */
  const triggerQuickSave = useCallback((game) => {
    unlockAchievement('safety_net', game);
    if (!game) return;
    const gameKey = game.id || game.title;

    setStats(prev => {
      const perGame = { ...(prev.perGameStats || {}) };
      const current = perGame[gameKey] || { quickSaves: 0 };
      const nextQuickSaves = (current.quickSaves || 0) + 1;
      perGame[gameKey] = { ...current, quickSaves: nextQuickSaves };

      if (nextQuickSaves >= 10) {
        unlockAchievement('save_scummer', game);
      }

      const updatedStats = { ...prev, perGameStats: perGame };
      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked]);

  /**
   * Quick Load executed.
   */
  const triggerQuickLoad = useCallback((game) => {
    unlockAchievement('time_traveler', game);
    if (!game) return;
    const gameKey = game.id || game.title;

    setStats(prev => {
      const perGame = { ...(prev.perGameStats || {}) };
      const current = perGame[gameKey] || {};
      perGame[gameKey] = { ...current, usedLoadState: true };

      // Multi-Timeline Master check (Auto Resume + Load State in same game)
      if (current.usedAutoResume) {
        unlockAchievement('timeline_master', game);
      }

      const updatedStats = { ...prev, perGameStats: perGame };
      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked]);

  /**
   * Auto Resume triggered.
   */
  const triggerAutoResume = useCallback((game) => {
    if (!game) return;
    const gameKey = game.id || game.title;

    setStats(prev => {
      const perGame = { ...(prev.perGameStats || {}) };
      const current = perGame[gameKey] || {};
      perGame[gameKey] = { ...current, usedAutoResume: true };

      // Multi-Timeline Master check (Auto Resume + Load State in same game)
      if (current.usedLoadState) {
        unlockAchievement('timeline_master', game);
      }

      const updatedStats = { ...prev, perGameStats: perGame };
      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked]);

  /**
   * Authentic Battery SRAM Export (.sav).
   */
  const triggerBatteryExport = useCallback((game) => {
    unlockAchievement('cartridge_keeper', game);
  }, [unlockAchievement]);

  /**
   * Authentic Battery SRAM Import (.sav).
   */
  const triggerBatteryImport = useCallback((game) => {
    unlockAchievement('memory_rebirth', game);
  }, [unlockAchievement]);

  /**
   * Screenshot captured.
   */
  const triggerScreenshot = useCallback((game) => {
    unlockAchievement('memory_keeper', game);
  }, [unlockAchievement]);

  /**
   * Video clip recorded.
   */
  const triggerVideoRecording = useCallback((game) => {
    unlockAchievement('clip_master', game);
  }, [unlockAchievement]);

  /**
   * Read Strategy Guide for > 60s.
   */
  const triggerStrategyGuideRead = useCallback((game, durationSeconds) => {
    if (durationSeconds >= 60) {
      unlockAchievement('strategy_scholar', game);
    }
  }, [unlockAchievement]);

  /**
   * Scraped / customized game cover art.
   */
  const triggerScrapeUpdate = useCallback((game) => {
    unlockAchievement('cover_connoisseur', game);
  }, [unlockAchievement]);

  /**
   * Physical hardware gamepad axis/button pressed.
   */
  const triggerPhysicalGamepadUsed = useCallback(() => {
    unlockAchievement('certified_tactile');
  }, [unlockAchievement]);

  /**
   * CRT scanline shader toggled ON.
   */
  const triggerCrtToggled = useCallback((isCrtActive) => {
    if (isCrtActive) {
      unlockAchievement('retro_purist');
    }
  }, [unlockAchievement]);

  /**
   * BGM track played.
   */
  const triggerBgmTrackPlayed = useCallback((trackFilename) => {
    if (!trackFilename) return;
    setStats(prev => {
      const tracks = Array.from(new Set([...(prev.bgmTracksListened || []), trackFilename]));
      if (tracks.length >= 3) {
        unlockAchievement('audiophile');
      }
      const updatedStats = { ...prev, bgmTracksListened: tracks };
      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked]);

  /**
   * Avatar customized in Multiavatar studio.
   */
  const triggerAvatarUpdated = useCallback(() => {
    setStats(prev => {
      const nextCount = (prev.avatarChangeCount || 0) + 1;
      if (nextCount >= 3) {
        unlockAchievement('identity_crisis');
      }
      const updatedStats = { ...prev, avatarChangeCount: nextCount };
      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked]);

  /**
   * Dark/Light mode theme switched.
   */
  const triggerThemeToggled = useCallback(() => {
    setStats(prev => {
      const nextCount = (prev.themeToggleCount || 0) + 1;
      if (nextCount >= 5) {
        unlockAchievement('chameleon');
      }
      const updatedStats = { ...prev, themeToggleCount: nextCount };
      persistState(unlocked, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, unlocked]);

  /**
   * Database JSON snapshot backup exported.
   */
  const triggerDatabaseBackup = useCallback(() => {
    unlockAchievement('vault_custodian');
  }, [unlockAchievement]);

  /**
   * 1500+ button mash inputs.
   */
  const triggerInputMash = useCallback((game, inputCount) => {
    if (inputCount >= 1500) {
      unlockAchievement('button_masher', game);
    }
  }, [unlockAchievement]);

  /**
   * Fast-forward for > 45 seconds.
   */
  const triggerFastForward = useCallback((durationSeconds) => {
    if (durationSeconds >= 45) {
      unlockAchievement('need_for_speed');
    }
  }, [unlockAchievement]);

  /**
   * Pause for > 10 minutes (600s).
   */
  const triggerPause = useCallback((durationSeconds) => {
    if (durationSeconds >= 600) {
      unlockAchievement('pause_for_thought');
    }
  }, [unlockAchievement]);

  /**
   * Idle browse in menu with BGM for > 5 minutes (300s).
   */
  const triggerBrowseIdle = useCallback((durationSeconds) => {
    if (durationSeconds >= 300) {
      unlockAchievement('window_shopper');
    }
  }, [unlockAchievement]);

  // ---------------------------------------------------------------------------
  // PER-ROM MILESTONES GETTER
  // ---------------------------------------------------------------------------
  const getGameMilestones = useCallback((gameId) => {
    if (!gameId) return [];
    return Object.values(unlocked).filter(u => u.gameId === gameId);
  }, [unlocked]);

  // Total points earned
  const totalEarnedPoints = useMemo(() => {
    return Object.entries(unlocked).reduce((acc, [key, u]) => {
      let tierStr = u?.tier;
      if (!tierStr) {
        const manifestItem = ACHIEVEMENTS_MANIFEST.find(m => m.id === key);
        tierStr = manifestItem?.tier || 'bronze';
      }
      const tierKey = String(tierStr).toUpperCase();
      const tierObj = ACHIEVEMENT_TIERS[tierKey] || ACHIEVEMENT_TIERS.BRONZE;
      return acc + (tierObj.points || 10);
    }, 0);
  }, [unlocked]);

  const completionPercentage = useMemo(() => {
    const totalCount = ACHIEVEMENTS_MANIFEST.length;
    if (totalCount === 0) return 0;
    const unlockedCount = Object.keys(unlocked).length;
    return Math.min(100, Math.round((unlockedCount / totalCount) * 100));
  }, [unlocked]);

  return {
    unlocked,
    stats,
    totalEarnedPoints,
    totalPossiblePoints: TOTAL_ACHIEVEMENT_POINTS,
    completionPercentage,
    activeToast,
    dismissToast,
    getGameMilestones,
    triggerGameLaunch,
    triggerGameExit,
    triggerQuickSave,
    triggerQuickLoad,
    triggerAutoResume,
    triggerBatteryExport,
    triggerBatteryImport,
    triggerScreenshot,
    triggerVideoRecording,
    triggerStrategyGuideRead,
    triggerScrapeUpdate,
    triggerBgmTrackPlayed,
    triggerAvatarUpdated,
    triggerThemeToggled,
    triggerCrtToggled,
    triggerPhysicalGamepadUsed,
    triggerDatabaseBackup,
    triggerInputMash,
    triggerFastForward,
    triggerPause,
    triggerBrowseIdle
  };
}

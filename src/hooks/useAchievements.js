import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ACHIEVEMENTS_MANIFEST, ACHIEVEMENT_TIERS, TOTAL_ACHIEVEMENT_POINTS, getPokemonMilestonesForGame, getPokemonBadgesForGame, getPokemonKantoBadgesForGame, isJohtoPokemonGame } from '../data/achievementsManifest.js';
import { parsePokemonSave, isPokemonRom } from '../services/pokemonSaveParser.js';
import { dbGet, dbSet, STORES } from '../services/db.js';
import { haptics } from '../services/hapticsService.js';

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

  // 1. Initial Load from IndexedDB upon activeProfileId change
  useEffect(() => {
    let isMounted = true;
    // Immediately reset in-memory state on profile switch to avoid stale crossover
    setUnlocked({});
    unlockedRef.current = {};
    setStats({
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

    async function loadAchievements() {
      try {
        const saved = await dbGet(STORES.USER_DATA, dbKey);
        if (saved && isMounted) {
          const loadedUnlocked = saved.unlocked || {};
          setUnlocked(loadedUnlocked);
          unlockedRef.current = loadedUnlocked;

          console.log(`🏆 [ACHIEVEMENTS INIT] Loaded ${Object.keys(loadedUnlocked).length} unlocked trophies from storage for profile "${activeProfileId || 'default'}"`);

          setStats({
            totalLaunches: saved.stats?.totalLaunches || 0,
            recentLaunches: saved.stats?.recentLaunches || [],
            systemsPlayed: saved.stats?.systemsPlayed || [],
            totalPlaytimeSeconds: saved.stats?.totalPlaytimeSeconds || 0,
            bgmTracksListened: saved.stats?.bgmTracksListened || [],
            avatarChangeCount: saved.stats?.avatarChangeCount || 0,
            themeToggleCount: saved.stats?.themeToggleCount || 0,
            activeDates: saved.stats?.activeDates || [],
            perGameStats: saved.stats?.perGameStats || {}
          });
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

    // Play chiptune fanfare & haptic vibration
    try {
      sfxRef.current?.playAchievementUnlock?.();
      haptics.trophy();
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

    let manifestItem = ACHIEVEMENTS_MANIFEST.find(a => a.id === achievementId);
    if (!manifestItem) {
      if (achievementId.startsWith('poke_badge_kanto_')) {
        const badgeNum = parseInt(achievementId.replace('poke_badge_kanto_', ''), 10);
        const kantoBadges = getPokemonKantoBadgesForGame(gameContext);
        const badge = kantoBadges[badgeNum - 1];
        if (badge) {
          manifestItem = {
            id: achievementId,
            title: `Kanto ${badge.name}`,
            description: `Defeat Kanto Gym Leader ${badge.leader} in ${badge.city} (${badge.type} Type).`,
            category: 'pokemon',
            type: 'league',
            icon: 'Shield',
            image: badge.image,
            isPerRom: true
          };
        }
      } else if (achievementId.startsWith('poke_badge_')) {
        const badgeNum = parseInt(achievementId.replace('poke_badge_', ''), 10);
        const badges = getPokemonBadgesForGame(gameContext);
        const badge = badges[badgeNum - 1];
        if (badge) {
          manifestItem = {
            id: achievementId,
            title: badge.name,
            description: `Defeat Gym Leader ${badge.leader} in ${badge.city} (${badge.type} Type).`,
            category: 'pokemon',
            type: 'league',
            icon: 'Shield',
            image: badge.image,
            isPerRom: true
          };
        }
      } else {
        const pokeList = getPokemonMilestonesForGame(gameContext);
        manifestItem = pokeList.find(a => a.id === achievementId);
      }
    }
    if (!manifestItem) return;

    const isPerRom = Boolean(manifestItem.isPerRom || achievementId.startsWith('poke_') || manifestItem.category === 'pokemon');
    const targetGameId = gameContext?.id || gameContext?.title || null;
    const storeKey = isPerRom && targetGameId ? `${achievementId}__${targetGameId}` : achievementId;

    // Immediate synchronous guard against duplicate unlock execution
    if (unlockedRef.current[storeKey]) return;

    const newUnlockEntry = {
      id: achievementId,
      key: storeKey,
      title: manifestItem.title,
      description: manifestItem.description,
      tier: manifestItem.tier || null,
      type: manifestItem.type || null,
      category: manifestItem.category,
      icon: manifestItem.icon,
      image: manifestItem.image || null,
      unlockedAt: new Date().toISOString(),
      gameId: gameContext?.id || gameContext?.title || null,
      gameTitle: gameContext?.title || null,
      systemKey: gameContext?.systemKey || null,
      isPerRom
    };

    // Mark in ref immediately to block re-entrant calls in the same tick
    unlockedRef.current[storeKey] = newUnlockEntry;

    console.log(`🏆 [ACHIEVEMENT UNLOCKED] 🎉 "${manifestItem.title}" (${storeKey}) | Defer In-Game: ${isPlayingRef.current}`);

    // Update state
    setUnlocked(prevUnlocked => ({
      ...prevUnlocked,
      [storeKey]: newUnlockEntry
    }));

    // Trigger toast or buffer for session exit OUTSIDE setState reducer
    if (isPlayingRef.current) {
      if (!sessionUnlocksRef.current.some(x => x.key === storeKey || (x.id === achievementId && x.gameId === targetGameId))) {
        console.log(`🏆 [ACHIEVEMENT DEFERRED] Buffered for session exit: "${manifestItem.title}"`);
        sessionUnlocksRef.current.push(newUnlockEntry);
      }
    } else {
      triggerToast(newUnlockEntry);
    }

    // Persist to storage OUTSIDE setState reducer
    setStats(latestStats => {
      persistState({ ...unlockedRef.current, [storeKey]: newUnlockEntry }, latestStats);
      return latestStats;
    });
  }, [triggerToast, persistState]);

  // 5. Evaluate Habits, Time of Day & Calendar Streaks (Local Time)
  const evaluateLocalHabitsAndStreaks = useCallback((targetStats) => {
    const now = new Date();
    const localHour = now.getHours();
    const localMin = now.getMinutes();
    const todayStr = getLocalDateString(now);

    // Night Owl: 11:00 PM to 4:00 AM local time (23:00 to 03:59)
    if (localHour >= 23 || localHour < 4) {
      unlockAchievement('night_owl');
    }

    // Early Bird: 5:00 AM to 8:00 AM local time (05:00 to 07:59)
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

      // 2.5 Full Spectrum (Play game on every supported system present in mounted library, min 3 systems)
      if (mountedGames && mountedGames.length > 0) {
        const availableLibrarySystems = Array.from(new Set(mountedGames.map(g => g.systemKey).filter(Boolean)));
        if (availableLibrarySystems.length >= 3 && availableLibrarySystems.every(sys => systems.includes(sys))) {
          unlockAchievement('full_spectrum');
        }
      }

      // 3. Generation Traveler (8-bit + 16-bit + 32/64-bit)
      const has8Bit = systems.some(s => ['nes', 'gb', 'gbc', 'atari2600', 'gg'].includes(s?.toLowerCase()));
      const has16Bit = systems.some(s => ['snes', 'genesis', 'megadrive'].includes(s?.toLowerCase()));
      const has32Or64Bit = systems.some(s => ['n64', 'ps1', 'psx', 'nds', 'gba'].includes(s?.toLowerCase()));
      if (has8Bit && has16Bit && has32Or64Bit) {
        unlockAchievement('gen_traveler');
      }

      // 4. Local time habits & streaks
      updatedStats.activeDates = evaluateLocalHabitsAndStreaks(updatedStats);

      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, evaluateLocalHabitsAndStreaks, persistState, mountedGames]);

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

      // 4. Ironman Endurance (7 hours continuous session = 25200s)
      if (sessionDurationSeconds >= 25200) {
        unlockAchievement('ironman_endurance', gameObj);
      }

      // 5. Loyal Companion (2 hours total on single game = 7200s)
      if (nextGamePlaytime >= 7200) {
        unlockAchievement('loyal_companion', gameObj);
      }

      // 6. Flush all deferred session unlocks sequentially upon returning to library
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

      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState, processNextToast]);

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
      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState]);

  /**
   * Quick Load executed.
   */
  const triggerQuickLoad = useCallback((game) => {
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
      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState]);

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
      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState]);

  /**
   * Authentic Battery SRAM Export (.sav).
   */
  const triggerBatteryExport = useCallback((game) => {
    // Registered battery export hook
  }, []);

  /**
   * Authentic Battery SRAM Import (.sav).
   */
  const triggerBatteryImport = useCallback((game) => {
    // Registered battery import hook
  }, []);

  /**
   * Screenshot captured.
   */
  const triggerScreenshot = useCallback((game) => {
    // Registered screenshot hook
  }, []);

  /**
   * Video clip recorded.
   */
  const triggerVideoRecording = useCallback((game) => {
    // Registered video recording hook
  }, []);

  /**
   * Read Strategy Guide / Opened Walkthrough.
   */
  const triggerStrategyGuideRead = useCallback((game, durationSeconds = 60) => {
    // Registered guide read hook
  }, []);

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
      const existing = prev.bgmTracksListened || [];
      if (existing.includes(trackFilename)) {
        return prev;
      }
      const tracks = [...existing, trackFilename];
      if (tracks.length >= 3) {
        unlockAchievement('audiophile');
      }
      const updatedStats = { ...prev, bgmTracksListened: tracks };
      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState]);

  /**
   * Avatar customized in Multiavatar studio.
   */
  const triggerAvatarUpdated = useCallback(() => {
    setStats(prev => {
      const nextCount = (prev.avatarChangeCount || 0) + 1;
      const updatedStats = { ...prev, avatarChangeCount: nextCount };
      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [persistState]);

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
      persistState(unlockedRef.current, updatedStats);
      return updatedStats;
    });
  }, [unlockAchievement, persistState]);

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
   * Pause hook.
   */
  const triggerPause = useCallback((durationSeconds) => {
    // Registered pause hook
  }, []);

  /**
   * Idle browse in menu with BGM for > 5 minutes (300s).
   */
  const triggerBrowseIdle = useCallback((durationSeconds) => {
    if (durationSeconds >= 300) {
      unlockAchievement('window_shopper');
    }
  }, [unlockAchievement]);

  /**
   * Resets all per-cartridge Pokémon milestones for a specific game (e.g. when deleting save data or booting fresh 0-state).
   */
  const resetPokemonMilestones = useCallback((game) => {
    if (!game) return;
    const targetGameId = game.id || game.title;
    const targetGameTitle = game.title;

    setUnlocked(prevUnlocked => {
      const nextUnlocked = {};
      let changed = false;

      Object.entries(prevUnlocked).forEach(([key, val]) => {
        const isTarget = (val.gameId === targetGameId || val.gameTitle === targetGameTitle || (targetGameId && key.endsWith(`__${targetGameId}`)) || (targetGameTitle && key.endsWith(`__${targetGameTitle}`))) &&
                         (key.startsWith('poke_') || val.category === 'pokemon' || val.isPerRom);
        if (!isTarget) {
          nextUnlocked[key] = val;
        } else {
          changed = true;
        }
      });

      if (changed) {
        unlockedRef.current = nextUnlocked;
        setStats(latestStats => {
          persistState(nextUnlocked, latestStats);
          return latestStats;
        });
      }

      return changed ? nextUnlocked : prevUnlocked;
    });
  }, [persistState]);

  /**
   * Evaluates a binary Pokémon save file from SRAM or Flash memory (.sav) and unlocks
   * regional gym badges, starter milestones, and Hall of Fame achievements across Gen 1 - Gen 5.
   */
  const evaluatePokemonSave = useCallback((game, sramBuffer) => {
    if (!game || !sramBuffer) return null;
    try {
      const summary = parsePokemonSave(sramBuffer, game);
      if (!summary || !summary.isPokemon) return null;

      // If this is a pristine new save (0 party, 0 caught, 0 badges, no starter), reset any stale cartridge milestones
      if (summary.partyCount === 0 && (summary.pokedexCaught || 0) === 0 && (summary.badgeCount || 0) === 0 && !summary.hasStarter) {
        resetPokemonMilestones(game);
        return summary;
      }

      // 1. Starter & Core Feats
      if (summary.hasStarter) unlockAchievement('poke_journey_begun', game);
      if (summary.hasFirstCatch) unlockAchievement('poke_first_catch', game);
      if (summary.hasFullParty) unlockAchievement('poke_full_party', game);
      if (summary.hasLevel100) unlockAchievement('poke_level_100', game);
      if (summary.hasShiny) unlockAchievement('poke_star_trainer', game);
      if (summary.hasPokerus) unlockAchievement('poke_microscopic_miracle', game);
      if (summary.hasLegendary) unlockAchievement('poke_myth_and_legend', game);
      if (summary.fossils?.hasAnyFossil || summary.hasFossil) unlockAchievement('poke_fossil_revival', game);
      if (summary.isHighRoller) unlockAchievement('poke_high_roller', game);

      // 2. Key Items
      if (summary.keyItems?.bicycle) unlockAchievement('poke_pedal_to_metal', game);
      if (summary.keyItems?.oldRod || summary.keyItems?.goodRod) unlockAchievement('poke_gone_fishin', game);
      if (summary.keyItems?.superRod) unlockAchievement('poke_master_angler', game);
      if (summary.keyItems?.itemfinder) unlockAchievement('poke_treasure_hunter', game);
      if (summary.keyItems?.pokeFlute) unlockAchievement('poke_wake_up_call', game);
      if (summary.keyItems?.scope) unlockAchievement('poke_revealer_of_mysteries', game);
      if (summary.keyItems?.expShare) unlockAchievement('poke_shared_growth', game);
      if (summary.keyItems?.townMap) unlockAchievement('poke_digital_cartographer', game);
      if (summary.keyItems?.masterBall) unlockAchievement('poke_master_ball', game);

      // 3. Hidden Machines (HM01 - HM08)
      if (summary.hms?.hm01) unlockAchievement('poke_hm01', game);
      if (summary.hms?.hm02) unlockAchievement('poke_hm02', game);
      if (summary.hms?.hm03) unlockAchievement('poke_hm03', game);
      if (summary.hms?.hm04) unlockAchievement('poke_hm04', game);
      if (summary.hms?.hm05) unlockAchievement('poke_hm05', game);
      if (summary.hms?.hm06) unlockAchievement('poke_hm06', game);
      if (summary.hms?.hm07) unlockAchievement('poke_hm07', game);
      if (summary.hms?.hm08) unlockAchievement('poke_hm08', game);
      if (summary.hms?.hasAllHMs) unlockAchievement('poke_hms_master', game);

      // 4. Gym Badges (1 to 8 & Gen 2 / HGSS Dual 16 Badges)
      if (summary.badges?.[0]) unlockAchievement('poke_badge_1', game);
      if (summary.badges?.[1]) unlockAchievement('poke_badge_2', game);
      if (summary.badges?.[2]) unlockAchievement('poke_badge_3', game);
      if (summary.badges?.[3]) unlockAchievement('poke_badge_4', game);
      if (summary.badges?.[4]) unlockAchievement('poke_badge_5', game);
      if (summary.badges?.[5]) unlockAchievement('poke_badge_6', game);
      if (summary.badges?.[6]) unlockAchievement('poke_badge_7', game);
      if (summary.badges?.[7]) unlockAchievement('poke_badge_8', game);

      // Kanto Return Badges (9 to 16 in Gen 2 / HGSS)
      if (summary.kantoBadges) {
        if (summary.kantoBadges[0]) unlockAchievement('poke_badge_kanto_1', game);
        if (summary.kantoBadges[1]) unlockAchievement('poke_badge_kanto_2', game);
        if (summary.kantoBadges[2]) unlockAchievement('poke_badge_kanto_3', game);
        if (summary.kantoBadges[3]) unlockAchievement('poke_badge_kanto_4', game);
        if (summary.kantoBadges[4]) unlockAchievement('poke_badge_kanto_5', game);
        if (summary.kantoBadges[5]) unlockAchievement('poke_badge_kanto_6', game);
        if (summary.kantoBadges[6]) unlockAchievement('poke_badge_kanto_7', game);
        if (summary.kantoBadges[7]) unlockAchievement('poke_badge_kanto_8', game);
      }

      if (summary.hasAllBadges || summary.badgeCount >= 8) unlockAchievement('poke_eight_badges', game);
      if (summary.has16Badges || summary.totalBadgeCount >= 16) unlockAchievement('poke_sixteen_badges', game);

      // 5. Hall of Fame / Champion
      if (summary.isChampion || summary.hallOfFameCount > 0) {
        unlockAchievement('poke_hall_of_fame', game);
      }

      // 6. Gen 1 Specific Feats & Legendaries
      if (summary.legendaries?.articuno) unlockAchievement('poke_articuno', game);
      if (summary.legendaries?.zapdos) unlockAchievement('poke_zapdos', game);
      if (summary.legendaries?.moltres) unlockAchievement('poke_moltres', game);
      if (summary.legendaries?.hasAllBirds) unlockAchievement('poke_legendary_birds', game);
      if (summary.legendaries?.mewtwo) unlockAchievement('poke_mewtwo', game);
      if (summary.events?.snorlaxCleared) unlockAchievement('poke_snorlax_cleared', game);
      if (summary.events?.ghostMarowakCalmed) unlockAchievement('poke_ghost_marowak', game);
      if (summary.events?.silphCoLiberated) unlockAchievement('poke_silph_co', game);
      if (summary.events?.fightingDojoWon) unlockAchievement('poke_fighting_dojo', game);
      if (summary.events?.saffronGuardQuenched) unlockAchievement('poke_saffron_guard', game);
      if (summary.events?.ssAnneDeparted) unlockAchievement('poke_ss_anne_departed', game);
      if (summary.events?.nuggetBridgeCleared) unlockAchievement('poke_nugget_bridge', game);
      if (summary.events?.mrFujiRescued) unlockAchievement('poke_rescued_mr_fuji', game);
      if (summary.hasPikaFriend) unlockAchievement('poke_yellow_soulmates', game);
      if (summary.hasStarterTrio) unlockAchievement('poke_yellow_starter_trio', game);
      if (summary.hasDefeatedRocketDuo) unlockAchievement('poke_yellow_rocket_duo', game);

      // 7. Gen 2 Specific Feats & Legendaries
      if (summary.events?.sudowoodoCleared) unlockAchievement('poke_sudowoodo_cleared', game);
      if (summary.events?.lakeOfRage) unlockAchievement('poke_lake_of_rage', game);
      if (summary.events?.goldenrodLiberated) unlockAchievement('poke_goldenrod_liberation', game);
      if (summary.events?.sproutTower) unlockAchievement('poke_sprout_tower', game);
      if (summary.events?.moomooFarm) unlockAchievement('poke_moomoo_farm', game);
      if (summary.events?.bugContest) unlockAchievement('poke_bug_contest', game);
      if (summary.events?.championRed) unlockAchievement('poke_champion_red', game);
      if (summary.legendaries?.hasBeasts || summary.legendaries?.raikou || summary.legendaries?.entei || summary.legendaries?.suicune) {
        unlockAchievement('poke_legendary_beasts', game);
      }
      if (summary.legendaries?.hasTowerDuo || summary.legendaries?.hoOh || summary.legendaries?.lugia) {
        unlockAchievement('poke_tower_duo', game);
      }
      if (summary.hasCrystalSuicune || summary.events?.crystalSuicune) unlockAchievement('poke_crystal_suicune', game);
      if (summary.hasUnownDex || summary.events?.crystalUnown) unlockAchievement('poke_crystal_unown', game);

      // 8. Gen 3 Specific Feats & Legendaries (Hoenn & Kanto Remakes)
      if (summary.events?.devonGoods) unlockAchievement('poke_devon_goods', game);
      if (summary.events?.trickHouse) unlockAchievement('poke_trick_house', game);
      if (summary.events?.teamMagma) unlockAchievement('poke_team_magma', game);
      if (summary.events?.teamAqua) unlockAchievement('poke_team_aqua', game);
      if (summary.events?.teamMagmaAqua) unlockAchievement('poke_team_magma_aqua', game);
      if (summary.events?.mirageTower) unlockAchievement('poke_mirage_tower', game);
      if (summary.events?.abandonedShip) unlockAchievement('poke_abandoned_ship', game);
      if (summary.events?.cataclysmAwakening) unlockAchievement('poke_cataclysm_awakening', game);
      if (summary.events?.emeraldRayquazaSoothe) unlockAchievement('poke_emerald_rayquaza_soothe', game);
      if (summary.legendaries?.groudon) unlockAchievement('poke_groudon', game);
      if (summary.legendaries?.kyogre) unlockAchievement('poke_kyogre', game);
      if (summary.legendaries?.rayquaza) unlockAchievement('poke_rayquaza', game);
      if (summary.legendaries?.weatherTrio || summary.legendaries?.hasWeatherTrio) unlockAchievement('poke_weather_trio', game);
      if (summary.legendaries?.regiTrio || summary.legendaries?.hasRegis) unlockAchievement('poke_regi_trio', game);
      if (summary.legendaries?.eonRoamer || summary.legendaries?.hasEon) unlockAchievement('poke_eon_roamer', game);
      if (summary.events?.battleFrontier) unlockAchievement('poke_battle_frontier', game);
      if (summary.events?.seviiLostelle) unlockAchievement('poke_sevii_lostelle', game);
      if (summary.events?.rubySapphirePlates) unlockAchievement('poke_ruby_sapphire_plates', game);
      if (summary.events?.rocketWarehouse) unlockAchievement('poke_rocket_warehouse', game);
      if (summary.legendaries?.roamingBeast || summary.legendaries?.hasBeasts) unlockAchievement('poke_roaming_beast', game);

      // 9. Gen 4 Specific Feats & Legendaries (Sinnoh & HGSS)
      if (summary.events?.valleyWindworks) unlockAchievement('poke_valley_windworks', game);
      if (summary.events?.galacticHq) unlockAchievement('poke_galactic_hq', game);
      if (summary.events?.spearPillar) unlockAchievement('poke_spear_pillar', game);
      if (summary.legendaries?.dialga) unlockAchievement('poke_dialga', game);
      if (summary.legendaries?.palkia) unlockAchievement('poke_palkia', game);
      if (summary.events?.distortionWorld) unlockAchievement('poke_distortion_world', game);
      if (summary.legendaries?.giratina) unlockAchievement('poke_giratina_origin', game);
      if (summary.legendaries?.creationDuo || (summary.legendaries?.dialga && summary.legendaries?.palkia)) unlockAchievement('poke_creation_duo', game);
      if (summary.legendaries?.lakeGuardians || summary.legendaries?.hasLakeGuardians) unlockAchievement('poke_lake_guardians', game);
      if (summary.legendaries?.heatran) unlockAchievement('poke_heatran', game);
      if (summary.legendaries?.cresselia) unlockAchievement('poke_cresselia', game);
      if (summary.events?.kimonoTrial) unlockAchievement('poke_kimono_trial', game);
      if (summary.legendaries?.hoOh) unlockAchievement('poke_ho_oh', game);
      if (summary.legendaries?.lugia) unlockAchievement('poke_lugia', game);
      if (summary.events?.suicuneTracking || summary.legendaries?.suicune) unlockAchievement('poke_suicune_tracking', game);
      if (summary.events?.pokeathlonChampion) unlockAchievement('poke_pokeathlon_champion', game);

      // 10. Gen 5 Specific Feats & Legendaries (Unova & B2W2)
      if (summary.events?.dreamyard) unlockAchievement('poke_dreamyard', game);
      if (summary.events?.relicCastle) unlockAchievement('poke_relic_castle', game);
      if (summary.events?.opelucidGym) unlockAchievement('poke_opelucid_gym', game);
      if (summary.events?.nsCastle) unlockAchievement('poke_ns_castle', game);
      if (summary.legendaries?.reshiram) unlockAchievement('poke_reshiram', game);
      if (summary.legendaries?.zekrom) unlockAchievement('poke_zekrom', game);
      if (summary.events?.defeatN) unlockAchievement('poke_defeat_n', game);
      if (summary.events?.plasmaGhetsis) unlockAchievement('poke_plasma_ghetsis', game);
      if (summary.legendaries?.swordsOfJustice || summary.legendaries?.hasSwordsOfJustice) unlockAchievement('poke_swords_of_justice', game);
      if (summary.legendaries?.kyurem) unlockAchievement('poke_kyurem', game);
      if (summary.events?.floccesyRanch) unlockAchievement('poke_floccesy_ranch', game);
      if (summary.events?.pokestarStudios) unlockAchievement('poke_pokestar_studios', game);
      if (summary.events?.pwtChampion) unlockAchievement('poke_pwt_champion', game);
      if (summary.events?.plasmaFrigate) unlockAchievement('poke_plasma_frigate', game);
      if (summary.events?.colressDefeated) unlockAchievement('poke_colress_defeated', game);
      if (summary.events?.kyuremFusion || summary.legendaries?.kyuremFusion) unlockAchievement('poke_kyurem_fusion', game);
      if (summary.events?.ghetsisB2W2) unlockAchievement('poke_ghetsis_b2w2', game);
      if (summary.legendaries?.zekromReshiramB2W2 || (summary.legendaries?.zekrom || summary.legendaries?.reshiram)) unlockAchievement('poke_zekrom_reshiram_b2w2', game);
      if (summary.events?.dnaSplicers || summary.keyItems?.dnaSplicers) unlockAchievement('poke_dna_splicers', game);

      // 11. Pokédex Scaling
      const dex = summary.pokedexCaught || 0;
      if (dex >= 10) unlockAchievement('poke_dex_10', game);
      if (dex >= 25) unlockAchievement('poke_dex_25', game);
      if (dex >= 50) unlockAchievement('poke_dex_50', game);
      if (dex >= 100) unlockAchievement('poke_dex_100', game);

      return summary;
    } catch (err) {
      console.warn('[useAchievements] Failed to evaluate Pokémon save buffer:', err);
      return null;
    }
  }, [unlockAchievement, resetPokemonMilestones]);

  // ---------------------------------------------------------------------------
  // PER-ROM MILESTONES GETTER (Universal platform achievements only)
  // ---------------------------------------------------------------------------
  const getGameMilestones = useCallback((gameId) => {
    if (!gameId) return [];
    return Object.values(unlocked).filter(
      u => u.gameId === gameId && !u.id?.startsWith('poke_') && u.category !== 'pokemon'
    );
  }, [unlocked]);

  // Total points earned (Strictly universal milestones from ACHIEVEMENTS_MANIFEST, 300G max)
  const totalEarnedPoints = useMemo(() => {
    return Object.entries(unlocked).reduce((acc, [key, u]) => {
      // Exclude per-cartridge / Pokemon milestones from Gamerscore
      if (key.startsWith('poke_') || u?.category === 'pokemon') return acc;
      
      const manifestItem = ACHIEVEMENTS_MANIFEST.find(m => m.id === key || m.id === u?.id);
      if (!manifestItem) return acc;

      const tierStr = manifestItem.tier || 'bronze';
      const tierKey = String(tierStr).toUpperCase();
      const tierObj = ACHIEVEMENT_TIERS[tierKey] || ACHIEVEMENT_TIERS.BRONZE;
      return acc + (tierObj.points || 5);
    }, 0);
  }, [unlocked]);

  const completionPercentage = useMemo(() => {
    const totalCount = ACHIEVEMENTS_MANIFEST.length;
    if (totalCount === 0) return 0;
    const universalUnlockedCount = ACHIEVEMENTS_MANIFEST.filter(item => {
      return Object.entries(unlocked).some(([k, u]) => k === item.id || k.startsWith(`${item.id}__`) || u?.id === item.id);
    }).length;
    return Math.min(100, Math.round((universalUnlockedCount / totalCount) * 100));
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
    triggerBgmTrackPlayed,
    triggerAvatarUpdated,
    triggerThemeToggled,
    triggerCrtToggled,
    triggerPhysicalGamepadUsed,
    triggerDatabaseBackup,
    triggerBackupExported: triggerDatabaseBackup,
    triggerInputMash,
    triggerFastForward,
    triggerPause,
    triggerBrowseIdle,
    evaluatePokemonSave,
    resetPokemonMilestones
  };
}

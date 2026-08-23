import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, dbDelete, dbGetAll, dbGetAllKeys, STORES } from '../services/db';

const PROFILES_KEY = 'retro_player_profiles';
const ACTIVE_PROFILE_ID_KEY = 'retro_player_active_profile_id';

// Curated avatar presets with themed seeds for Multiavatar (https://multiavatar.com/)
export const AVATAR_PRESETS = [
  { id: 'retro', name: 'Retro Gamer', avatarSeed: 'RetroGamer', favoriteColor: '#ef4444' },
  { id: 'mario', name: 'Mario', avatarSeed: 'SuperMario', favoriteColor: '#ef4444' },
  { id: 'zelda', name: 'Zelda', avatarSeed: 'PrincessZelda', favoriteColor: '#ec4899' },
  { id: 'link', name: 'Link', avatarSeed: 'HeroOfTime', favoriteColor: '#84cc16' },
  { id: 'samus', name: 'Samus', avatarSeed: 'MetroidSamus', favoriteColor: '#f97316' },
  { id: 'sonic', name: 'Sonic', avatarSeed: 'SonicSpeed', favoriteColor: '#3b82f6' },
  { id: 'pixel', name: 'Pixel Knight', avatarSeed: 'PixelKnight', favoriteColor: '#6366f1' },
  { id: 'cyber', name: 'Cyber Ninja', avatarSeed: 'CyberNinja', favoriteColor: '#10b981' },
  { id: 'cosmic', name: 'Cosmic Pilot', avatarSeed: 'CosmicPilot', favoriteColor: '#06b6d4' },
  { id: 'chrono', name: 'Chrono Mage', avatarSeed: 'ChronoMage', favoriteColor: '#a855f7' }
];

export const RANDOM_SEEDS = [
  'RetroGamer', 'PixelKnight', 'CyberNinja', 'CosmicPilot', 'NeonSamurai',
  'SuperMario', 'HeroOfTime', 'StarVoyager', 'ChronoMage', 'ArcadeMaster',
  'VoxelHero', 'SpaceCadet', 'HyperSonic', 'ShadowRogue', 'MegaBuster'
];

export const DEFAULT_MASTER_PROFILE = {
  id: 'prof_default',
  name: 'Player 1',
  avatarSeed: 'Player 1',
  favoriteColor: '#ef4444',
  created: 1
};

// Normalize profile objects for backward compatibility
function normalizeProfile(p) {
  if (!p) return DEFAULT_MASTER_PROFILE;
  return {
    ...p,
    avatarSeed: p.avatarSeed || p.name || 'Player 1',
    favoriteColor: p.favoriteColor || p.miiData?.favoriteColor || '#ef4444'
  };
}

/**
 * Hook for managing user profiles, Multiavatar avatars, profile switching, and profile-scoped storage in IndexedDB.
 */
export function useProfileManager() {
  // Profiles state initialized from fast cache with instant IndexedDB sync
  const [profiles, setProfiles] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProfile);
        }
      }
    } catch {}
    return [DEFAULT_MASTER_PROFILE];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      const storedId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
      if (storedId) return storedId;
    } catch {}
    return 'prof_default';
  });

  // Load authoritative data from IndexedDB on startup
  useEffect(() => {
    async function loadFromDB() {
      try {
        const dbProfiles = await dbGetAll(STORES.PROFILES);
        if (Array.isArray(dbProfiles) && dbProfiles.length > 0) {
          let normalized = dbProfiles.map(normalizeProfile);

          // Deduplicate by ID
          const seen = new Set();
          normalized = normalized.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });

          // If there are multiple duplicate "Player 1" profiles from previous onboarding, consolidate into one
          const player1Profiles = normalized.filter(p => (p.name || '').trim().toLowerCase() === 'player 1');
          if (player1Profiles.length > 1) {
            const chosen = player1Profiles.find(p => p.id === activeProfileId)
              || player1Profiles.find(p => p.id !== 'prof_default')
              || player1Profiles[0];

            for (const p of player1Profiles) {
              if (p.id !== 'prof_default') {
                await dbDelete(STORES.PROFILES, p.id);
              }
            }
            const consolidated = {
              ...chosen,
              id: 'prof_default'
            };
            await dbSet(STORES.PROFILES, 'prof_default', consolidated);
            normalized = [
              consolidated,
              ...normalized.filter(p => (p.name || '').trim().toLowerCase() !== 'player 1')
            ];
          }

          setProfiles(normalized);
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(normalized));
          } catch {}
        } else {
          // Seed master profile into IndexedDB if empty
          await dbSet(STORES.PROFILES, DEFAULT_MASTER_PROFILE.id, DEFAULT_MASTER_PROFILE);
        }

        const savedActiveId = await dbGet(STORES.SETTINGS, ACTIVE_PROFILE_ID_KEY);
        if (savedActiveId) {
          setActiveProfileId(savedActiveId);
          try {
            localStorage.setItem(ACTIVE_PROFILE_ID_KEY, savedActiveId);
          } catch {}
        }
      } catch (e) {
        console.error('Failed to load profiles from IndexedDB:', e);
      }
    }
    loadFromDB();
  }, []);

  // Ensure activeProfileId always resolves to an existing profile
  useEffect(() => {
    if (profiles.length > 0 && !profiles.some(p => p.id === activeProfileId)) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || DEFAULT_MASTER_PROFILE;

  /**
   * Helper to compute next sequential player name (e.g. Player 2, Player 3)
   */
  const getNextPlayerName = useCallback(() => {
    const existingPlayerNumbers = profiles
      .map(p => {
        const match = (p.name || '').match(/^Player\s+(\d+)$/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(n => n !== null);

    if (existingPlayerNumbers.length === 0) {
      return `Player ${profiles.length + 1}`;
    }
    const maxNumber = Math.max(...existingPlayerNumbers, profiles.length);
    return `Player ${maxNumber + 1}`;
  }, [profiles]);

  /**
   * Create a new user profile in IndexedDB.
   */
  const createProfile = useCallback(async (name, avatarSeed, favoriteColor) => {
    const defaultName = getNextPlayerName();
    const cleanName = (name && name.trim()) ? name.trim() : defaultName;
    const cleanSeed = (avatarSeed && avatarSeed.trim()) ? avatarSeed.trim() : cleanName;
    const newProfile = {
      id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      avatarSeed: cleanSeed,
      favoriteColor: favoriteColor || '#ef4444',
      created: Date.now()
    };

    // Update state
    setProfiles(prev => {
      const updated = [...prev, newProfile];
      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveProfileId(newProfile.id);

    try {
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, newProfile.id);
    } catch {}

    // Persist permanently in IndexedDB
    await dbSet(STORES.PROFILES, newProfile.id, newProfile);
    await dbSet(STORES.SETTINGS, ACTIVE_PROFILE_ID_KEY, newProfile.id);

    return newProfile;
  }, [getNextPlayerName]);

  /**
   * Update an existing user profile in IndexedDB.
   */
  const updateProfile = useCallback(async (profileId, updates) => {
    let updatedProfile = null;

    setProfiles(prev => {
      const updated = prev.map(p => {
        if (p.id === profileId) {
          updatedProfile = {
            ...p,
            ...updates,
            name: updates.name !== undefined ? updates.name.trim() : p.name,
            avatarSeed: updates.avatarSeed !== undefined ? updates.avatarSeed.trim() : (updates.name ? updates.name.trim() : p.avatarSeed),
            favoriteColor: updates.favoriteColor || p.favoriteColor
          };
          return updatedProfile;
        }
        return p;
      });

      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (updatedProfile) {
      await dbSet(STORES.PROFILES, profileId, updatedProfile);
    }
  }, []);

  /**
   * Delete a profile from IndexedDB.
   */
  const deleteProfile = useCallback(async (profileId) => {
    let nextActiveId = null;

    setProfiles(prev => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter(p => p.id !== profileId);
      if (activeProfileId === profileId && filtered.length > 0) {
        nextActiveId = filtered[0].id;
      }
      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });

    if (nextActiveId) {
      setActiveProfileId(nextActiveId);
      try {
        localStorage.setItem(ACTIVE_PROFILE_ID_KEY, nextActiveId);
      } catch {}
      await dbSet(STORES.SETTINGS, ACTIVE_PROFILE_ID_KEY, nextActiveId);
    }

    // 1. Delete profile and user data entries
    await dbDelete(STORES.PROFILES, profileId);
    await dbDelete(STORES.USER_DATA, `favs_${profileId}`);
    await dbDelete(STORES.USER_DATA, `recents_${profileId}`);
    await dbDelete(STORES.USER_DATA, `playtime_${profileId}`);

    // 2. Sweep and delete all battery RAM saves and save states belonging to this profile
    try {
      const saveKeys = await dbGetAllKeys(STORES.GAME_SAVES);
      for (const k of saveKeys) {
        if (typeof k === 'string' && k.startsWith(`save_${profileId}_`)) {
          await dbDelete(STORES.GAME_SAVES, k);
        }
      }

      const stateKeys = await dbGetAllKeys(STORES.SAVE_STATES);
      for (const k of stateKeys) {
        if (typeof k === 'string' && k.startsWith(`state_${profileId}_`)) {
          await dbDelete(STORES.SAVE_STATES, k);
        }
      }
    } catch (e) {
      console.warn('Error purging profile save states:', e);
    }

    // 3. Clear all LocalStorage keys associated with this profile
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes(`_${profileId}`) ||
          key.startsWith(`save_${profileId}_`) ||
          key.startsWith(`state_${profileId}_`)
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, [activeProfileId]);

  /**
   * Switch active profile in IndexedDB.
   */
  const switchProfile = useCallback(async (profileId) => {
    if (profiles.some(p => p.id === profileId)) {
      setActiveProfileId(profileId);
      try {
        localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileId);
      } catch {}
      await dbSet(STORES.SETTINGS, ACTIVE_PROFILE_ID_KEY, profileId);
    }
  }, [profiles]);

  return {
    profiles,
    activeProfile,
    activeProfileId,
    getNextPlayerName,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile
  };
}

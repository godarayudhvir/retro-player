import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, dbDelete, dbGetAll, STORES } from '../services/db';

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
          const normalized = dbProfiles.map(normalizeProfile);
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
   * Create a new user profile in IndexedDB.
   */
  const createProfile = useCallback(async (name, avatarSeed, favoriteColor) => {
    const cleanName = (name || 'Player').trim();
    const cleanSeed = (avatarSeed || cleanName).trim() || 'Player';
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
  }, []);

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
    setProfiles(prev => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter(p => p.id !== profileId);
      if (activeProfileId === profileId && filtered.length > 0) {
        setActiveProfileId(filtered[0].id);
        dbSet(STORES.SETTINGS, ACTIVE_PROFILE_ID_KEY, filtered[0].id);
      }
      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });

    await dbDelete(STORES.PROFILES, profileId);
    await dbDelete(STORES.USER_DATA, `favs_${profileId}`);
    await dbDelete(STORES.USER_DATA, `recents_${profileId}`);
    await dbDelete(STORES.USER_DATA, `playtime_${profileId}`);
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
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile
  };
}

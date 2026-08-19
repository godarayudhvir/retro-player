import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, dbDelete, dbGetAll, STORES } from '../services/db';

const PROFILES_KEY = 'retro_player_profiles';
const ACTIVE_PROFILE_ID_KEY = 'retro_player_active_profile_id';

// Default starter Mii character presets
export const MII_PRESETS = [
  {
    id: 'mario',
    name: 'Mario',
    favoriteColor: '#ef4444',
    miiData: {
      gender: 'male',
      faceShape: 0,
      skinColor: '#fed7aa',
      hairStyle: 3,
      hairColor: '#451a03',
      eyeType: 0,
      eyeColor: '#1e293b',
      eyebrowType: 1,
      noseType: 1,
      mouthType: 0,
      glasses: 0,
      mustache: 1,
      favoriteColor: '#ef4444'
    }
  },
  {
    id: 'luigi',
    name: 'Luigi',
    favoriteColor: '#10b981',
    miiData: {
      gender: 'male',
      faceShape: 1,
      skinColor: '#fed7aa',
      hairStyle: 3,
      hairColor: '#451a03',
      eyeType: 0,
      eyeColor: '#1e293b',
      eyebrowType: 1,
      noseType: 0,
      mouthType: 0,
      glasses: 0,
      mustache: 1,
      favoriteColor: '#10b981'
    }
  },
  {
    id: 'peach',
    name: 'Peach',
    favoriteColor: '#ec4899',
    miiData: {
      gender: 'female',
      faceShape: 0,
      skinColor: '#fef08a',
      hairStyle: 2,
      hairColor: '#f59e0b',
      eyeType: 1,
      eyeColor: '#0284c7',
      eyebrowType: 0,
      noseType: 0,
      mouthType: 0,
      glasses: 0,
      mustache: 0,
      favoriteColor: '#ec4899'
    }
  },
  {
    id: 'link',
    name: 'Link',
    favoriteColor: '#84cc16',
    miiData: {
      gender: 'male',
      faceShape: 1,
      skinColor: '#fde047',
      hairStyle: 1,
      hairColor: '#ca8a04',
      eyeType: 0,
      eyeColor: '#0284c7',
      eyebrowType: 0,
      noseType: 2,
      mouthType: 2,
      glasses: 0,
      mustache: 0,
      favoriteColor: '#84cc16'
    }
  }
];

export const INITIAL_MII_DATA = {
  gender: 'male',
  faceShape: 0,
  skinColor: '#fed7aa',
  hairStyle: 0,
  hairColor: '#451a03',
  eyeType: 0,
  eyeColor: '#1e293b',
  eyebrowType: 0,
  noseType: 0,
  mouthType: 0,
  glasses: 0,
  mustache: 0,
  favoriteColor: '#ef4444'
};

const DEFAULT_MASTER_PROFILE = {
  id: 'prof_default',
  name: 'Player 1',
  favoriteColor: '#ef4444',
  miiData: { ...INITIAL_MII_DATA },
  created: 1
};

/**
 * Hook for managing user profiles, Mii avatars, profile switching, and profile-scoped storage in IndexedDB.
 */
export function useProfileManager() {
  // Profiles state initialized from fast cache with instant IndexedDB sync
  const [profiles, setProfiles] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
          setProfiles(dbProfiles);
          try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(dbProfiles));
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
  const createProfile = useCallback(async (name, miiData, favoriteColor) => {
    const newProfile = {
      id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: (name || 'Player').trim(),
      favoriteColor: favoriteColor || miiData?.favoriteColor || '#ef4444',
      miiData: { ...miiData, favoriteColor: favoriteColor || miiData?.favoriteColor || '#ef4444' },
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
            miiData: updates.miiData ? { ...p.miiData, ...updates.miiData } : p.miiData
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

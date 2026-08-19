import { useState, useEffect, useCallback } from 'react';

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

/**
 * Hook for managing user profiles, Mii avatars, profile switching, and profile-scoped storage.
 */
export function useProfileManager() {
  const [profiles, setProfiles] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
    // Initialize with Master Player 1 profile
    return [
      {
        id: 'prof_default',
        name: 'Player 1',
        favoriteColor: '#ef4444',
        miiData: { ...INITIAL_MII_DATA },
        created: Date.now()
      }
    ];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      const storedId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
      if (storedId) return storedId;
    } catch {}
    return 'prof_default';
  });

  // Ensure activeProfileId always resolves to an existing profile
  useEffect(() => {
    if (profiles.length > 0 && !profiles.some(p => p.id === activeProfileId)) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId]);

  // Persist Profiles
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to persist profiles:', e);
    }
  }, [profiles]);

  // Persist Active Profile ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, activeProfileId);
    } catch (e) {
      console.error('Failed to persist active profile ID:', e);
    }
  }, [activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
    id: 'prof_default',
    name: 'Player 1',
    favoriteColor: '#ef4444',
    miiData: INITIAL_MII_DATA
  };

  /**
   * Create a new user profile.
   */
  const createProfile = useCallback((name, miiData, favoriteColor) => {
    const newProfile = {
      id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: (name || 'Player').trim(),
      favoriteColor: favoriteColor || miiData?.favoriteColor || '#ef4444',
      miiData: { ...miiData, favoriteColor: favoriteColor || miiData?.favoriteColor || '#ef4444' },
      created: Date.now()
    };

    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  }, []);

  /**
   * Update an existing user profile.
   */
  const updateProfile = useCallback((profileId, updates) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          ...updates,
          miiData: updates.miiData ? { ...p.miiData, ...updates.miiData } : p.miiData
        };
      }
      return p;
    }));
  }, []);

  /**
   * Delete a profile (cannot delete if it's the only remaining profile).
   */
  const deleteProfile = useCallback((profileId) => {
    setProfiles(prev => {
      if (prev.length <= 1) return prev; // Keep at least one profile
      const filtered = prev.filter(p => p.id !== profileId);
      if (activeProfileId === profileId && filtered.length > 0) {
        setActiveProfileId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeProfileId]);

  /**
   * Switch active profile.
   */
  const switchProfile = useCallback((profileId) => {
    if (profiles.some(p => p.id === profileId)) {
      setActiveProfileId(profileId);
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

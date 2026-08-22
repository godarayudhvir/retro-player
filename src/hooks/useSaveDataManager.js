import { useState, useCallback } from 'react';
import { dbGet, dbSet, dbDelete, dbGetAll, STORES } from '../services/db';
import { detectSystemFromExtension } from '../utils/systemDetector';

/**
 * Hook to inspect and verify existing save states and battery RAM in LocalStorage and IndexedDB.
 */
export function useSaveDataManager() {
  const [hasSaveData, setHasSaveData] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(false);

  const checkSaveData = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) {
      setHasSaveData(false);
      return false;
    }

    setIsCheckingSave(true);
    try {
      const identifiers = [
        game.id,
        game.slug,
        game.rawTitle,
        game.filename,
        game.title
      ].filter(Boolean);

      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const profilePrefixes = isMasterProfile
        ? [activeProfileId, 'prof_default', 'default', '']
        : [activeProfileId];

      // 1. Direct Key Lookup across valid profile scope
      for (const id of identifiers) {
        for (const prof of profilePrefixes) {
          const saveKey = prof ? `save_${prof}_${id}` : `save_${id}`;
          const stateKey = prof ? `state_${prof}_${id}` : `state_${id}`;

          // IndexedDB checks
          const dbSave = await dbGet(STORES.GAME_SAVES, saveKey);
          if (dbSave && dbSave.data && (typeof dbSave.data === 'string' ? dbSave.data.length > 0 : Object.keys(dbSave.data).length > 0)) {
            setHasSaveData(true);
            setIsCheckingSave(false);
            return true;
          }

          const dbState = await dbGet(STORES.SAVE_STATES, stateKey);
          if (dbState && dbState.data && (typeof dbState.data === 'string' ? dbState.data.length > 0 : Object.keys(dbState.data).length > 0)) {
            setHasSaveData(true);
            setIsCheckingSave(false);
            return true;
          }

          // LocalStorage fallback checks
          try {
            const lsSave = localStorage.getItem(saveKey);
            if (lsSave) {
              const parsed = JSON.parse(lsSave);
              if (parsed && parsed.data && (typeof parsed.data === 'string' ? parsed.data.length > 0 : Object.keys(parsed.data).length > 0)) {
                setHasSaveData(true);
                setIsCheckingSave(false);
                return true;
              }
            }

            const lsState = localStorage.getItem(stateKey);
            if (lsState) {
              const parsed = JSON.parse(lsState);
              if (parsed && parsed.data && (typeof parsed.data === 'string' ? parsed.data.length > 0 : Object.keys(parsed.data).length > 0)) {
                setHasSaveData(true);
                setIsCheckingSave(false);
                return true;
              }
            }
          } catch (e) {}
        }
      }

      // 2. Comprehensive Store Scan strictly matching activeProfileId
      try {
        const allSaves = await dbGetAll(STORES.GAME_SAVES);
        const matchSave = (allSaves || []).find(item => {
          if (!item) return false;
          // Verify profile ownership
          if (item.profileId && item.profileId !== activeProfileId) {
            if (!isMasterProfile || (item.profileId !== 'prof_default' && item.profileId !== 'default')) {
              return false;
            }
          }
          const key = (item.id || item.key || '').toLowerCase();
          const gId = (item.gameId || '').toLowerCase();
          const idMatches = identifiers.some(id => {
            const target = id.toLowerCase();
            return gId === target || key.includes(target);
          });
          if (!idMatches) return false;

          // Key prefix check if profileId is missing from item
          if (!item.profileId) {
            if (isMasterProfile) return true;
            return key.includes(`_${activeProfileId.toLowerCase()}_`);
          }
          return true;
        });

        if (matchSave && matchSave.data) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }

        const allStates = await dbGetAll(STORES.SAVE_STATES);
        const matchState = (allStates || []).find(item => {
          if (!item) return false;
          // Verify profile ownership
          if (item.profileId && item.profileId !== activeProfileId) {
            if (!isMasterProfile || (item.profileId !== 'prof_default' && item.profileId !== 'default')) {
              return false;
            }
          }
          const key = (item.id || item.key || '').toLowerCase();
          const gId = (item.gameId || '').toLowerCase();
          const idMatches = identifiers.some(id => {
            const target = id.toLowerCase();
            return gId === target || key.includes(target);
          });
          if (!idMatches) return false;

          // Key prefix check if profileId is missing from item
          if (!item.profileId) {
            if (isMasterProfile) return true;
            return key.includes(`_${activeProfileId.toLowerCase()}_`);
          }
          return true;
        });

        if (matchState && matchState.data) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }
      } catch (scanErr) {
        console.warn('Scan store check error:', scanErr);
      }
    } catch (err) {
      console.warn('⚠️ [SAVE CHECK WARN] Failed inspecting save storage:', err);
    }

    setHasSaveData(false);
    setIsCheckingSave(false);
    return false;
  }, []);

  /**
   * Export the active profile's in-game battery RAM as a downloadable .sav file
   */
  const exportSaveFile = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    try {
      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const scopedKey = `save_${activeProfileId}_${game.id || game.title}`;
      const legacyKey = `save_${game.id || game.title}`;

      let dbSave = await dbGet(STORES.GAME_SAVES, scopedKey);
      if (!dbSave && isMasterProfile) {
        dbSave = await dbGet(STORES.GAME_SAVES, legacyKey);
      }

      let base64Data = dbSave?.data || null;
      if (!base64Data) {
        const lsSave = localStorage.getItem(scopedKey) || (isMasterProfile ? localStorage.getItem(legacyKey) : null);
        if (lsSave) {
          const parsed = JSON.parse(lsSave);
          base64Data = parsed?.data || null;
        }
      }

      if (!base64Data) {
        // Search by scan if direct lookup missed
        const allSaves = await dbGetAll(STORES.GAME_SAVES);
        const match = (allSaves || []).find(item => {
          if (!item) return false;
          if (item.profileId && item.profileId !== activeProfileId) {
            if (!isMasterProfile || (item.profileId !== 'prof_default' && item.profileId !== 'default')) return false;
          }
          const key = (item.id || item.key || '').toLowerCase();
          const target = (game.id || game.title || '').toLowerCase();
          return key.includes(target);
        });
        if (match && match.data) {
          base64Data = match.data;
        }
      }

      if (base64Data) {
        const rawBase64 = typeof base64Data === 'string' ? base64Data : (base64Data.save || '');
        const binary = atob(rawBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Formatted clean filename with system-appropriate extension (.sav, .srm, .mcr)
        const sysInfo = detectSystemFromExtension(game.filename || game.slug || game.title || '');
        const saveExt = sysInfo?.saveExt || 'sav';
        const normalized = (game.title || 'RetroGame')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9\s-_]/g, ' ')
          .trim()
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_');
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const timeStamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const fileName = `${normalized}_Save_${timeStamp}.${saveExt}`;

        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('⚠️ [SAVE EXPORT ERROR]:', err);
      return false;
    }
  }, []);

  /**
   * Import an uploaded .sav file into the active profile's IndexedDB and localStorage
   */
  const importSaveFile = useCallback(async (file, game, activeProfileId = 'prof_default') => {
    if (!file || !game) return false;
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);

      const scopedKey = `save_${activeProfileId}_${game.id || game.title}`;
      const payload = {
        id: scopedKey,
        gameId: game.id || game.title,
        profileId: activeProfileId,
        timestamp: Date.now(),
        data: b64
      };

      await dbSet(STORES.GAME_SAVES, scopedKey, payload);
      try {
        localStorage.setItem(scopedKey, JSON.stringify(payload));
      } catch (e) {}

      setHasSaveData(true);
      return true;
    } catch (err) {
      console.warn('⚠️ [SAVE IMPORT ERROR]:', err);
      return false;
    }
  }, []);

  /**
   * Delete in-game battery RAM and save states for the current game strictly in the active profile
   */
  const deleteSaveFile = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    try {
      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const scopedSaveKey = `save_${activeProfileId}_${game.id || game.title}`;
      const legacySaveKey = `save_${game.id || game.title}`;
      const scopedStateKey = `state_${activeProfileId}_${game.id || game.title}`;
      const legacyStateKey = `state_${game.id || game.title}`;

      await dbDelete(STORES.GAME_SAVES, scopedSaveKey);
      await dbDelete(STORES.SAVE_STATES, scopedStateKey);

      if (isMasterProfile) {
        await dbDelete(STORES.GAME_SAVES, legacySaveKey);
        await dbDelete(STORES.SAVE_STATES, legacyStateKey);
      }

      try {
        localStorage.removeItem(scopedSaveKey);
        localStorage.removeItem(scopedStateKey);
        if (isMasterProfile) {
          localStorage.removeItem(legacySaveKey);
          localStorage.removeItem(legacyStateKey);
        }
      } catch (e) {}

      setHasSaveData(false);
      return true;
    } catch (err) {
      console.warn('⚠️ [SAVE DELETE ERROR]:', err);
      return false;
    }
  }, []);

  return {
    hasSaveData,
    isCheckingSave,
    checkSaveData,
    exportSaveFile,
    importSaveFile,
    deleteSaveFile,
    setHasSaveData
  };
}

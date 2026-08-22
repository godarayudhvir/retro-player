import { useState, useCallback } from 'react';
import { dbGet, dbGetAll, STORES } from '../services/db';

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

      const profilePrefixes = [
        activeProfileId,
        'prof_default',
        'default',
        ''
      ];

      // 1. Direct Key Lookup across profile scopes
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

      // 2. Comprehensive Store Scan for matching gameId
      try {
        const allSaves = await dbGetAll(STORES.GAME_SAVES);
        const matchSave = (allSaves || []).find(item => {
          if (!item) return false;
          const key = (item.id || item.key || '').toLowerCase();
          const gId = (item.gameId || '').toLowerCase();
          return identifiers.some(id => {
            const target = id.toLowerCase();
            return gId === target || key.includes(target);
          });
        });

        if (matchSave && matchSave.data) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }

        const allStates = await dbGetAll(STORES.SAVE_STATES);
        const matchState = (allStates || []).find(item => {
          if (!item) return false;
          const key = (item.id || item.key || '').toLowerCase();
          const gId = (item.gameId || '').toLowerCase();
          return identifiers.some(id => {
            const target = id.toLowerCase();
            return gId === target || key.includes(target);
          });
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

  return { hasSaveData, isCheckingSave, checkSaveData, setHasSaveData };
}

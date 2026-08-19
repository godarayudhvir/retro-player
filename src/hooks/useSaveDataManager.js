import { useState, useCallback } from 'react';
import { dbGet, STORES } from '../services/db';

/**
 * Hook to inspect and verify existing save states and battery RAM in LocalStorage and IndexedDB.
 */
export function useSaveDataManager() {
  const [hasSaveData, setHasSaveData] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(false);

  const checkSaveData = useCallback(async (game) => {
    if (!game) {
      setHasSaveData(false);
      return false;
    }

    setIsCheckingSave(true);
    try {
      const gameId = (game.id || '').toLowerCase();
      const rawTitle = (game.rawTitle || '').toLowerCase();
      const filename = (game.filename || '').toLowerCase();

      // 1. Check RetroPlayerDB primary stores (Battery Saves and Snapshot States)
      if (game.id) {
        const dbSave = await dbGet(STORES.GAME_SAVES, `save_${game.id}`);
        if (dbSave && dbSave.data && (typeof dbSave.data === 'string' ? dbSave.data.length > 0 : Object.keys(dbSave.data).length > 0)) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }

        const dbState = await dbGet(STORES.SAVE_STATES, `state_${game.id}`);
        if (dbState && dbState.data && (typeof dbState.data === 'string' ? dbState.data.length > 0 : Object.keys(dbState.data).length > 0)) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }

        // 2. Strict LocalStorage fallback check for this exact game save/state key
        try {
          const lsSave = localStorage.getItem(`save_${game.id}`);
          if (lsSave) {
            const parsed = JSON.parse(lsSave);
            if (parsed && parsed.data && (typeof parsed.data === 'string' ? parsed.data.length > 0 : Object.keys(parsed.data).length > 0)) {
              setHasSaveData(true);
              setIsCheckingSave(false);
              return true;
            }
          }

          const lsState = localStorage.getItem(`state_${game.id}`);
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
    } catch (err) {
      console.warn('⚠️ [SAVE CHECK WARN] Failed inspecting save storage:', err);
    }

    setHasSaveData(false);
    setIsCheckingSave(false);
    return false;
  }, []);

  return { hasSaveData, isCheckingSave, checkSaveData, setHasSaveData };
}

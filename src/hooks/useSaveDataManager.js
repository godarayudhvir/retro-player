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
        if (dbSave) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }

        const dbState = await dbGet(STORES.SAVE_STATES, `state_${game.id}`);
        if (dbState) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }
      }

      // 2. Check LocalStorage keys specifically for this game
      const keys = Object.keys(localStorage);
      const hasLs = keys.some(k => {
        const lowerK = k.toLowerCase();
        return (gameId && lowerK.includes(gameId)) ||
               (rawTitle && lowerK.includes(rawTitle)) ||
               (filename && lowerK.includes(filename));
      });

      if (hasLs) {
        setHasSaveData(true);
        setIsCheckingSave(false);
        return true;
      }

      // 3. Check IndexedDB database names specifically for this game
      if (typeof window !== 'undefined' && window.indexedDB && indexedDB.databases) {
        const dbs = await indexedDB.databases();
        const hasDb = dbs.some(db => {
          if (!db.name) return false;
          const dbName = db.name.toLowerCase();
          return (gameId && dbName.includes(gameId)) ||
                 (rawTitle && dbName.includes(rawTitle));
        });

        if (hasDb) {
          setHasSaveData(true);
          setIsCheckingSave(false);
          return true;
        }
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

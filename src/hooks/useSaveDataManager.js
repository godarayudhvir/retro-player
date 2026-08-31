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
            if (!dbSave.profileId || dbSave.profileId === activeProfileId || (isMasterProfile && (dbSave.profileId === 'prof_default' || dbSave.profileId === 'default'))) {
              setHasSaveData(true);
              setIsCheckingSave(false);
              return true;
            }
          }

          const dbState = await dbGet(STORES.SAVE_STATES, stateKey);
          if (dbState && dbState.data && (typeof dbState.data === 'string' ? dbState.data.length > 0 : Object.keys(dbState.data).length > 0)) {
            if (!dbState.profileId || dbState.profileId === activeProfileId || (isMasterProfile && (dbState.profileId === 'prof_default' || dbState.profileId === 'default'))) {
              setHasSaveData(true);
              setIsCheckingSave(false);
              return true;
            }
          }

          // LocalStorage fallback checks
          try {
            const lsSave = localStorage.getItem(saveKey);
            if (lsSave) {
              const parsed = JSON.parse(lsSave);
              if (parsed && parsed.data && (typeof parsed.data === 'string' ? parsed.data.length > 0 : Object.keys(parsed.data).length > 0)) {
                if (!parsed.profileId || parsed.profileId === activeProfileId || (isMasterProfile && (parsed.profileId === 'prof_default' || parsed.profileId === 'default'))) {
                  setHasSaveData(true);
                  setIsCheckingSave(false);
                  return true;
                }
              }
            }

            const lsState = localStorage.getItem(stateKey);
            if (lsState) {
              const parsed = JSON.parse(lsState);
              if (parsed && parsed.data && (typeof parsed.data === 'string' ? parsed.data.length > 0 : Object.keys(parsed.data).length > 0)) {
                if (!parsed.profileId || parsed.profileId === activeProfileId || (isMasterProfile && (parsed.profileId === 'prof_default' || parsed.profileId === 'default'))) {
                  setHasSaveData(true);
                  setIsCheckingSave(false);
                  return true;
                }
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
   * Helper to trigger a reliable browser file download from base64 data
   */
  const triggerDownload = (base64Data, fileName) => {
    try {
      const rawBase64 = typeof base64Data === 'string' ? base64Data : (base64Data?.save || base64Data?.data || '');
      if (!rawBase64) return false;
      const binary = atob(rawBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {}
      }, 15000);
      return true;
    } catch (err) {
      console.warn('⚠️ [DOWNLOAD TRIGGER ERROR]:', err);
      return false;
    }
  };

  /**
   * Export in-game battery RAM (.sav)
   */
  const exportBatterySave = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    try {
      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const profilePrefixes = isMasterProfile
        ? [activeProfileId, 'prof_default', 'default', '']
        : [activeProfileId];

      const identifiers = [
        game.id,
        game.slug,
        game.rawTitle,
        game.filename,
        game.title
      ].filter(Boolean);

      let batteryBase64 = null;

      // 1. Direct key search across profile prefixes & identifiers
      for (const id of identifiers) {
        for (const prof of profilePrefixes) {
          const saveKey = prof ? `save_${prof}_${id}` : `save_${id}`;
          const dbSave = await dbGet(STORES.GAME_SAVES, saveKey);
          if (dbSave && dbSave.data) {
            if (!dbSave.profileId || dbSave.profileId === activeProfileId || (isMasterProfile && (dbSave.profileId === 'prof_default' || dbSave.profileId === 'default'))) {
              batteryBase64 = typeof dbSave.data === 'string' ? dbSave.data : (dbSave.data.save || dbSave.data.data || null);
              break;
            }
          }
          try {
            const lsSave = localStorage.getItem(saveKey);
            if (lsSave) {
              const parsed = JSON.parse(lsSave);
              if (parsed && parsed.data) {
                if (!parsed.profileId || parsed.profileId === activeProfileId || (isMasterProfile && (parsed.profileId === 'prof_default' || parsed.profileId === 'default'))) {
                  batteryBase64 = typeof parsed.data === 'string' ? parsed.data : (parsed.data.save || parsed.data.data || null);
                  break;
                }
              }
            }
          } catch (e) {}
        }
        if (batteryBase64) break;
      }

      // 2. Comprehensive Store Scan fallback
      if (!batteryBase64) {
        try {
          const allSaves = await dbGetAll(STORES.GAME_SAVES);
          const match = (allSaves || []).find(item => {
            if (!item) return false;
            if (item.profileId && item.profileId !== activeProfileId) {
              if (!isMasterProfile || (item.profileId !== 'prof_default' && item.profileId !== 'default')) return false;
            }
            const key = (item.id || item.key || '').toLowerCase();
            const gId = (item.gameId || '').toLowerCase();
            return identifiers.some(id => {
              const target = id.toLowerCase();
              return gId === target || key.includes(target);
            });
          });
          if (match && match.data) {
            batteryBase64 = typeof match.data === 'string' ? match.data : (match.data.save || match.data.data || null);
          }
        } catch (e) {}
      }

      if (!batteryBase64) return false;

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
      const savFileName = `${normalized}_Save_${timeStamp}.${saveExt}`;

      return triggerDownload(batteryBase64, savFileName);
    } catch (err) {
      console.warn('⚠️ [BATTERY SAVE EXPORT ERROR]:', err);
      return false;
    }
  }, []);

  /**
   * Export Slot 1 Auto-Resume snapshot (.state)
   */
  const exportAutoResumeSave = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    try {
      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const profilePrefixes = isMasterProfile
        ? [activeProfileId, 'prof_default', 'default', '']
        : [activeProfileId];

      const identifiers = [
        game.id,
        game.slug,
        game.rawTitle,
        game.filename,
        game.title
      ].filter(Boolean);

      let autoBase64 = null;

      for (const id of identifiers) {
        for (const prof of profilePrefixes) {
          const autoKey = prof ? `state_auto_${prof}_${id}` : `state_auto_${id}`;
          const dbState = await dbGet(STORES.SAVE_STATES, autoKey);
          if (dbState && dbState.data) {
            if (!dbState.profileId || dbState.profileId === activeProfileId || (isMasterProfile && (dbState.profileId === 'prof_default' || dbState.profileId === 'default'))) {
              autoBase64 = typeof dbState.data === 'string' ? dbState.data : (dbState.data.save || dbState.data.data || null);
              break;
            }
          }
          try {
            const lsState = localStorage.getItem(autoKey);
            if (lsState) {
              const parsed = JSON.parse(lsState);
              if (parsed && parsed.data) {
                if (!parsed.profileId || parsed.profileId === activeProfileId || (isMasterProfile && (parsed.profileId === 'prof_default' || parsed.profileId === 'default'))) {
                  autoBase64 = typeof parsed.data === 'string' ? parsed.data : (parsed.data.save || parsed.data.data || null);
                  break;
                }
              }
            }
          } catch (e) {}
        }
        if (autoBase64) break;
      }

      if (!autoBase64) return false;

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
      const stateFileName = `${normalized}_AutoResume_Slot1_${timeStamp}.state`;

      return triggerDownload(autoBase64, stateFileName);
    } catch (err) {
      console.warn('⚠️ [AUTO RESUME EXPORT ERROR]:', err);
      return false;
    }
  }, []);

  /**
   * Export quick save snapshot (.state) - exports Slot 0 and Slot 1 if both exist
   */
  const exportQuickSave = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    try {
      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const profilePrefixes = isMasterProfile
        ? [activeProfileId, 'prof_default', 'default', '']
        : [activeProfileId];

      const identifiers = [
        game.id,
        game.slug,
        game.rawTitle,
        game.filename,
        game.title
      ].filter(Boolean);

      let stateBase64 = null;

      // 1. Direct key search for Slot 0 (Manual Quick Save)
      for (const id of identifiers) {
        for (const prof of profilePrefixes) {
          const stateKey = prof ? `state_${prof}_${id}` : `state_${id}`;
          const dbState = await dbGet(STORES.SAVE_STATES, stateKey);
          if (dbState && dbState.data) {
            if (!dbState.profileId || dbState.profileId === activeProfileId || (isMasterProfile && (dbState.profileId === 'prof_default' || dbState.profileId === 'default'))) {
              stateBase64 = typeof dbState.data === 'string' ? dbState.data : (dbState.data.save || dbState.data.data || null);
              break;
            }
          }
          try {
            const lsState = localStorage.getItem(stateKey);
            if (lsState) {
              const parsed = JSON.parse(lsState);
              if (parsed && parsed.data) {
                if (!parsed.profileId || parsed.profileId === activeProfileId || (isMasterProfile && (parsed.profileId === 'prof_default' || parsed.profileId === 'default'))) {
                  stateBase64 = typeof parsed.data === 'string' ? parsed.data : (parsed.data.save || parsed.data.data || null);
                  break;
                }
              }
            }
          } catch (e) {}
        }
        if (stateBase64) break;
      }

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

      let downloadedSlot0 = false;
      if (stateBase64) {
        const stateFileName = `${normalized}_QuickSave_Slot0_${timeStamp}.state`;
        downloadedSlot0 = triggerDownload(stateBase64, stateFileName);
      }

      // Also check and export Slot 1 Auto-Resume snapshot if it exists
      const okAuto = await exportAutoResumeSave(game, activeProfileId);

      return downloadedSlot0 || okAuto;
    } catch (err) {
      console.warn('⚠️ [QUICK SAVE EXPORT ERROR]:', err);
      return false;
    }
  }, [exportAutoResumeSave]);

  /**
   * Export both in-game battery RAM (.sav) and all quick save snapshots (.state)
   */
  const exportSaveFile = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    const okBattery = await exportBatterySave(game, activeProfileId);
    let okState = false;
    if (okBattery) {
      setTimeout(async () => {
        await exportQuickSave(game, activeProfileId);
      }, 400);
    } else {
      okState = await exportQuickSave(game, activeProfileId);
    }
    return okBattery || okState;
  }, [exportBatterySave, exportQuickSave]);

  /**
   * Import an uploaded .sav (battery save) or .state (quick save snapshot)
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

      const fileNameLower = (file.name || '').toLowerCase();
      const isStateFile = fileNameLower.endsWith('.state');

      const isAutoResume = fileNameLower.includes('autoresume') || fileNameLower.includes('slot1');
      const identifiers = [
        game.id,
        game.slug,
        game.rawTitle,
        game.filename,
        game.title
      ].filter(Boolean);

      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const targetId = game.id || game.title;

      if (isStateFile) {
        // Quick Save State Snapshot: overwrite Slot 0 or Slot 1 specifically, plus legacy keys
        const prefix = isAutoResume ? 'state_auto' : 'state';
        const primaryKey = `${prefix}_${activeProfileId}_${targetId}`;
        const payload = {
          id: primaryKey,
          gameId: targetId,
          profileId: activeProfileId,
          timestamp: Date.now(),
          data: b64,
          isAutoResume: isAutoResume
        };

        await dbSet(STORES.SAVE_STATES, primaryKey, payload);
        try { localStorage.setItem(primaryKey, JSON.stringify(payload)); } catch (e) {}

        // Overwrite aliases to guarantee seamless immediate pickup
        for (const id of identifiers) {
          const scopedKey = `${prefix}_${activeProfileId}_${id}`;
          await dbSet(STORES.SAVE_STATES, scopedKey, payload);
          try { localStorage.setItem(scopedKey, JSON.stringify(payload)); } catch (e) {}
          if (isMasterProfile) {
            const legacyKey = `${prefix}_${id}`;
            await dbSet(STORES.SAVE_STATES, legacyKey, payload);
            try { localStorage.setItem(legacyKey, JSON.stringify(payload)); } catch (e) {}
          }
        }
      } else {
        // In-game Battery RAM (.sav, .srm, .ram, .mcr): overwrite scoped and legacy keys
        const primaryKey = `save_${activeProfileId}_${targetId}`;
        const payload = {
          id: primaryKey,
          gameId: targetId,
          profileId: activeProfileId,
          timestamp: Date.now(),
          data: b64
        };

        await dbSet(STORES.GAME_SAVES, primaryKey, payload);
        try { localStorage.setItem(primaryKey, JSON.stringify(payload)); } catch (e) {}

        // Overwrite aliases
        for (const id of identifiers) {
          const scopedKey = `save_${activeProfileId}_${id}`;
          await dbSet(STORES.GAME_SAVES, scopedKey, payload);
          try { localStorage.setItem(scopedKey, JSON.stringify(payload)); } catch (e) {}
          if (isMasterProfile) {
            const legacyKey = `save_${id}`;
            await dbSet(STORES.GAME_SAVES, legacyKey, payload);
            try { localStorage.setItem(legacyKey, JSON.stringify(payload)); } catch (e) {}
          }
        }

        // Purge Emscripten IDBFS caches so the newly imported battery save is loaded fresh without stale memory FS override
        const idbfsDbs = [
          '/home/web_user/retroarch/userdata',
          '/home/web_user/retroarch',
          '/home/web_user',
          '/retroarch',
          '/data',
          '/saves',
          'emulatorjs',
          'retroarch'
        ];
        for (const d of idbfsDbs) {
          try {
            if (typeof indexedDB !== 'undefined' && typeof indexedDB.deleteDatabase === 'function') {
              indexedDB.deleteDatabase(d);
            }
          } catch (e) {}
        }
      }

      setHasSaveData(true);
      return true;
    } catch (err) {
      console.warn('⚠️ [SAVE IMPORT ERROR]:', err);
      return false;
    }
  }, []);

  /**
   * Delete in-game battery RAM and quick save states for the current game in the active profile
   */
  const deleteSaveFile = useCallback(async (game, activeProfileId = 'prof_default') => {
    if (!game) return false;
    try {
      const isMasterProfile = activeProfileId === 'prof_default' || activeProfileId === 'default';
      const profilePrefixes = isMasterProfile
        ? [activeProfileId, 'prof_default', 'default', '']
        : [activeProfileId];

      const identifiers = [
        game.id,
        game.slug,
        game.rawTitle,
        game.filename,
        game.title
      ].filter(Boolean);

      // 1. Direct keys delete across all identifiers and profile prefixes
      for (const id of identifiers) {
        for (const prof of profilePrefixes) {
          const saveKey = prof ? `save_${prof}_${id}` : `save_${id}`;
          const stateKey = prof ? `state_${prof}_${id}` : `state_${id}`;
          const autoKey = prof ? `state_auto_${prof}_${id}` : `state_auto_${id}`;

          await dbDelete(STORES.GAME_SAVES, saveKey);
          await dbDelete(STORES.SAVE_STATES, stateKey);
          await dbDelete(STORES.SAVE_STATES, autoKey);

          try {
            localStorage.removeItem(saveKey);
            localStorage.removeItem(stateKey);
            localStorage.removeItem(autoKey);
          } catch (e) {}
        }
      }

      // 2. Scan and delete any matching records in DB for this profile
      try {
        const allSaves = await dbGetAll(STORES.GAME_SAVES);
        for (const item of (allSaves || [])) {
          if (!item) continue;
          const actualItem = item.value !== undefined ? item.value : item;
          if (actualItem.profileId && actualItem.profileId !== activeProfileId) {
            if (!isMasterProfile || (actualItem.profileId !== 'prof_default' && actualItem.profileId !== 'default')) continue;
          }
          const rawKey = item.key || item.id || actualItem.id || actualItem.key || '';
          const gId = (actualItem.gameId || '');
          const idMatches = identifiers.some(id => {
            const target = id.toLowerCase();
            return gId.toLowerCase() === target || String(rawKey).toLowerCase().includes(target);
          });
          if (idMatches) {
            if (rawKey) {
              await dbDelete(STORES.GAME_SAVES, rawKey);
              try { localStorage.removeItem(rawKey); } catch (e) {}
            }
          }
        }

        const allStates = await dbGetAll(STORES.SAVE_STATES);
        for (const item of (allStates || [])) {
          if (!item) continue;
          const actualItem = item.value !== undefined ? item.value : item;
          if (actualItem.profileId && actualItem.profileId !== activeProfileId) {
            if (!isMasterProfile || (actualItem.profileId !== 'prof_default' && actualItem.profileId !== 'default')) continue;
          }
          const rawKey = item.key || item.id || actualItem.id || actualItem.key || '';
          const gId = (actualItem.gameId || '');
          const idMatches = identifiers.some(id => {
            const target = id.toLowerCase();
            return gId.toLowerCase() === target || String(rawKey).toLowerCase().includes(target);
          });
          if (idMatches) {
            if (rawKey) {
              await dbDelete(STORES.SAVE_STATES, rawKey);
              try { localStorage.removeItem(rawKey); } catch (e) {}
            }
          }
        }
      } catch (scanErr) {
        console.warn('⚠️ [SAVE SCAN PURGE ERROR]:', scanErr);
      }

      // 3. Purge Emscripten IDBFS databases to prevent virtual FS resurrection
      const idbfsDbs = [
        '/home/web_user/retroarch/userdata',
        '/home/web_user/retroarch',
        '/home/web_user',
        '/retroarch',
        '/data',
        '/saves',
        'emulatorjs',
        'retroarch'
      ];
      for (const d of idbfsDbs) {
        try {
          if (typeof indexedDB !== 'undefined' && typeof indexedDB.deleteDatabase === 'function') {
            indexedDB.deleteDatabase(d);
          }
        } catch (e) {}
      }

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
    exportBatterySave,
    exportQuickSave,
    importSaveFile,
    deleteSaveFile,
    setHasSaveData
  };
}

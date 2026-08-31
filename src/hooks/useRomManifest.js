import { useState, useEffect, useMemo, useCallback } from 'react';
import { getReleaseDate } from '../gameDescriptions';
import { detectSystemFromExtension } from '../utils/systemDetector';
import { resolveAssetPath } from '../utils/assetPath';
import { scrapeGame, deleteManualMetadata, saveCachedMetadata } from '../services/metadataScraper';
import { 
  checkServerDbStatus, 
  saveCustomRomToLocalDb, 
  getAllCustomRomsFromLocalDb, 
  deleteCustomRomFromLocalDb 
} from '../services/db';

/**
 * Hook to manage ROM catalog manifest, search filtering, system categories, and custom ROM uploads.
 */
export function useRomManifest(onCustomRomLoaded, options = {}) {
  const { favorites = [], recentlyPlayed = [], onFileDropped = null } = options;
  const [games, setGames] = useState([]);
  const [systems, setSystems] = useState([]);
  const [activeSystem, setActiveSystem] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const apiUrl = (import.meta.env.BASE_URL || './') + 'api/roms';
    console.log(`📡 [CLIENT FETCH] Requesting ROM manifest from ${apiUrl}...`);
    try {
      let loadedGames = [];

      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          loadedGames = data.games || [];
        }
      } catch (networkErr) {
        console.warn('Backend /api/roms fetch error (static/offline mode):', networkErr);
      }

      // Also retrieve locally stored custom ROMs from IndexedDB (for GitHub Pages & standalone PWAs)
      const localCustomGames = await getAllCustomRomsFromLocalDb();
      if (localCustomGames && localCustomGames.length > 0) {
        loadedGames = [...loadedGames, ...localCustomGames];
      }

      const uniqueGames = [];
      const seenIds = new Set();
      for (const g of loadedGames) {
        const id = g.id || `${g.systemKey}-${g.title}`;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          uniqueGames.push(g);
        }
      }
      console.log(`✅ [CLIENT FETCH SUCCESS] Indexed ${uniqueGames.length} unique games (including ${localCustomGames.length} local IndexedDB ROMs).`);
      setGames(uniqueGames);

      // Recalculate systems with accurate game counts
      const sysMap = {};
      uniqueGames.forEach(g => {
        if (!g.systemKey) return;
        if (!sysMap[g.systemKey]) {
          sysMap[g.systemKey] = {
            key: g.systemKey,
            name: g.systemName || g.systemKey.toUpperCase(),
            core: g.systemCore,
            color: g.systemColor,
            icon: g.systemIcon,
            gameCount: 0
          };
        }
        sysMap[g.systemKey].gameCount++;
      });
      setSystems(Object.values(sysMap));
    } catch (err) {
      console.error('🚨 [CLIENT FETCH ERROR] Failed indexing games:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const processCustomRomFile = useCallback(async (file) => {
    if (!file) return;
    console.log(`📁 [CUSTOM ROM LOADED] File: "${file.name}" | Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    const sys = detectSystemFromExtension(file.name);
    const blobUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

    let customGame = {
      id: `custom_${sys.key}_${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      title: `${cleanTitle} (Custom)`,
      rawTitle: cleanTitle,
      filename: file.name,
      file: file,
      systemKey: sys.key,
      systemName: sys.name,
      systemCore: sys.core,
      systemIcon: sys.icon,
      systemColor: sys.color,
      romUrl: blobUrl,
      isCustomBlob: true,
      coverUrl: sys.icon || resolveAssetPath('assets/platforms/custom.svg')
    };

    if (onCustomRomLoaded) {
      onCustomRomLoaded(customGame);
    }
  }, [onCustomRomLoaded]);

  const uploadRomAndScrape = useCallback(async (file, systemKey, onProgress) => {
    if (!file) return null;
    try {
      const isServer = checkServerDbStatus();
      const safeSystemKey = systemKey || detectSystemFromExtension(file.name)?.key || 'nes';
      const sys = detectSystemFromExtension(file.name);
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const rawTitle = file.name.replace(/\.[^/.]+$/, "");

      let targetGame = null;

      if (isServer) {
        // 1. Docker / Localhost Server Flow
        if (onProgress) onProgress({ step: 'uploading', message: `Saving "${file.name}" to server library...` });

        try {
          const res = await fetch('/api/upload-rom', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'x-filename': encodeURIComponent(file.name),
              'x-system-key': safeSystemKey
            },
            body: file
          });

          if (!res.ok) {
            const errorJson = await res.json().catch(() => ({}));
            throw new Error(errorJson.error || `Upload failed (HTTP ${res.status})`);
          }

          const json = await res.json();
          if (!json.success || !json.game) {
            throw new Error('Server did not return game record');
          }

          targetGame = json.game;
        } catch (serverErr) {
          console.warn('⚠️ [SERVER UPLOAD FALLBACK] Server upload endpoint unavailable, falling back to local IndexedDB storage:', serverErr);
          if (onProgress) onProgress({ step: 'saving_local', message: `Saving "${file.name}" to browser storage...` });

          const gameId = `local_${safeSystemKey}_${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const blobUrl = URL.createObjectURL(file);

          targetGame = {
            id: gameId,
            title: cleanTitle || rawTitle,
            rawTitle: rawTitle,
            filename: file.name,
            systemKey: safeSystemKey,
            systemName: sys.name,
            systemCore: sys.core,
            systemColor: sys.color,
            systemIcon: sys.icon,
            romUrl: blobUrl,
            coverUrl: sys.icon,
            isCustomBlob: true,
            isLocalDbRom: true
          };

          await saveCustomRomToLocalDb(targetGame, file);
        }
      } else {
        // 2. Client-Side IndexedDB Flow (GitHub Pages / Offline PWA)
        if (onProgress) onProgress({ step: 'saving_local', message: `Saving "${file.name}" to browser storage...` });

        const gameId = `local_${safeSystemKey}_${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const blobUrl = URL.createObjectURL(file);

        targetGame = {
          id: gameId,
          title: cleanTitle || rawTitle,
          rawTitle: rawTitle,
          filename: file.name,
          systemKey: safeSystemKey,
          systemName: sys.name,
          systemCore: sys.core,
          systemColor: sys.color,
          systemIcon: sys.icon,
          romUrl: blobUrl,
          coverUrl: sys.icon,
          isCustomBlob: true,
          isLocalDbRom: true
        };

        await saveCustomRomToLocalDb(targetGame, file);
      }

      if (onProgress) onProgress({ step: 'scraping', message: `Scraping 3D box art & metadata for "${targetGame.title}"...` });

      // Automatically scrape metadata and save sidecars / cache
      try {
        await scrapeGame(targetGame, true);
      } catch (scrapeErr) {
        console.warn('Auto-scrape warning for uploaded ROM:', scrapeErr);
      }

      if (onProgress) onProgress({ step: 'refreshing', message: 'Updating game library...' });

      // Reload games manifest
      await fetchGames();

      if (onProgress) onProgress({ step: 'done', message: `Successfully added "${targetGame.title}" to library!` });
      return targetGame;
    } catch (err) {
      console.error('🚨 [ROM UPLOAD ERROR]:', err);
      throw err;
    }
  }, [fetchGames]);

  // Load a batch of ROMs into the active session in-memory without copying/saving
  const loadBatchCustomRoms = useCallback(async (files = [], onProgress = null) => {
    if (!files || files.length === 0) return [];
    console.log(`📁 [BATCH IN-MEMORY LOAD] Loading ${files.length} custom ROMs into session...`);

    const customGames = [];
    const totalFiles = files.length;
    const CHUNK_SIZE = 50;

    for (let idx = 0; idx < totalFiles; idx++) {
      const file = files[idx];
      const pathToCheck = file.webkitRelativePath || file.relativePath || file.name;
      const sys = detectSystemFromExtension(pathToCheck);
      const blobUrl = URL.createObjectURL(file);
      const rawTitle = file.name.replace(/\.[^/.]+$/, "");
      const cleanTitle = rawTitle
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || rawTitle;

      const gameId = `custom_${sys.key}_${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // 1. Process paired local cover if available
      let coverUrl = sys.icon || resolveAssetPath('assets/platforms/custom.svg');
      let hasCustomCover = false;
      if (file.companionCoverFile) {
        try {
          coverUrl = URL.createObjectURL(file.companionCoverFile);
          hasCustomCover = true;
        } catch (_) {}
      }

      // 2. Process paired local sidecar metadata if available
      let parsedSidecar = null;
      if (file.companionMetaFile) {
        try {
          const text = await file.companionMetaFile.text();
          if (file.companionMetaFile.name.endsWith('.json')) {
            parsedSidecar = JSON.parse(text);
          } else if (file.companionMetaFile.name.endsWith('.nfo')) {
            const titleMatch = text.match(/<title>(.*?)<\/title>/i);
            const descMatch = text.match(/<plot>(.*?)<\/plot>/i) || text.match(/<description>(.*?)<\/description>/i);
            const yearMatch = text.match(/<year>(.*?)<\/year>/i) || text.match(/<releasedate>(.*?)<\/releasedate>/i);
            const devMatch = text.match(/<developer>(.*?)<\/developer>/i);
            const pubMatch = text.match(/<publisher>(.*?)<\/publisher>/i);
            const genreMatch = text.match(/<genre>(.*?)<\/genre>/i);
            parsedSidecar = {
              title: titleMatch ? titleMatch[1] : cleanTitle,
              description: descMatch ? descMatch[1] : undefined,
              releaseYear: yearMatch ? yearMatch[1] : undefined,
              developer: devMatch ? devMatch[1] : undefined,
              publisher: pubMatch ? pubMatch[1] : undefined,
              genre: genreMatch ? genreMatch[1] : undefined
            };
          }
        } catch (err) {
          console.warn('Failed to parse sidecar metadata for:', file.name, err);
        }
      }

      const gameRecord = {
        id: gameId,
        title: parsedSidecar?.title || cleanTitle,
        rawTitle: rawTitle,
        filename: file.name,
        file: file,
        systemKey: sys.key,
        systemName: sys.name,
        systemCore: sys.core,
        systemIcon: sys.icon,
        systemColor: sys.color,
        romUrl: blobUrl,
        isCustomBlob: true,
        coverUrl: coverUrl,
        hasCustomCover: hasCustomCover,
        sidecarMetadata: parsedSidecar || undefined
      };

      // Save to local metadata cache so game details and cover render instantly without scraping
      if (hasCustomCover || parsedSidecar) {
        const metaRecord = {
          id: gameId,
          title: gameRecord.title,
          systemKey: sys.key,
          coverUrl: hasCustomCover ? coverUrl : null,
          hasCustomCover: hasCustomCover,
          description: parsedSidecar?.description || `Experience ${cleanTitle} on ${sys.name}.`,
          releaseYear: parsedSidecar?.releaseYear || parsedSidecar?.year || null,
          developer: parsedSidecar?.developer || null,
          publisher: parsedSidecar?.publisher || null,
          genre: parsedSidecar?.genre || null,
          source: 'Local Sidecar',
          hasSidecar: Boolean(parsedSidecar),
          scrapedAt: new Date().toISOString()
        };
        saveCachedMetadata(gameId, metaRecord).catch(() => {});
      }

      customGames.push(gameRecord);

      if (idx > 0 && idx % CHUNK_SIZE === 0) {
        if (onProgress) {
          onProgress({
            step: 'loading',
            current: idx + 1,
            total: totalFiles,
            message: `Loading ${idx + 1}/${totalFiles} ROMs into session...`
          });
        }
        await new Promise(r => setTimeout(r, 0));
      }
    }

    setGames(prev => {
      const existingIds = new Set(prev.map(g => g.id));
      const newItems = customGames.filter(g => !existingIds.has(g.id));
      const combined = [...newItems, ...prev];

      // Update systems counts
      const sysMap = {};
      combined.forEach(g => {
        if (!g.systemKey) return;
        if (!sysMap[g.systemKey]) {
          sysMap[g.systemKey] = {
            key: g.systemKey,
            name: g.systemName || g.systemKey.toUpperCase(),
            core: g.systemCore,
            color: g.systemColor,
            icon: g.systemIcon,
            gameCount: 0
          };
        }
        sysMap[g.systemKey].gameCount++;
      });
      setSystems(Object.values(sysMap));
      return combined;
    });

    return customGames;
  }, []);

  // Helper to read File as Base64 Data URL
  const readFileAsDataUrl = (file) => {
    return new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Batch upload/save ROMs to permanent storage (Server / IndexedDB) along with companion covers & sidecars
  const batchUploadRoms = useCallback(async (files = [], onProgress) => {
    if (!files || files.length === 0) return [];
    const isServer = checkServerDbStatus();
    const total = files.length;
    const uploadedGames = [];

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const pathToCheck = file.webkitRelativePath || file.relativePath || file.name;
      const sys = detectSystemFromExtension(pathToCheck);
      const safeSystemKey = sys.key || 'nes';
      const rawTitle = file.name.replace(/\.[^/.]+$/, "");
      const cleanTitle = rawTitle
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || rawTitle;

      if (onProgress) {
        onProgress({
          step: 'saving',
          current: i + 1,
          total,
          filename: file.name,
          message: `Saving (${i + 1}/${total}): ${cleanTitle}...`
        });
      }

      try {
        let targetGame = null;

        // Parse companion sidecar if available
        let parsedSidecar = null;
        if (file.companionMetaFile) {
          try {
            const text = await file.companionMetaFile.text();
            if (file.companionMetaFile.name.endsWith('.json')) {
              parsedSidecar = JSON.parse(text);
            } else if (file.companionMetaFile.name.endsWith('.nfo')) {
              const titleMatch = text.match(/<title>(.*?)<\/title>/i);
              const descMatch = text.match(/<plot>(.*?)<\/plot>/i) || text.match(/<description>(.*?)<\/description>/i);
              const yearMatch = text.match(/<year>(.*?)<\/year>/i) || text.match(/<releasedate>(.*?)<\/releasedate>/i);
              const devMatch = text.match(/<developer>(.*?)<\/developer>/i);
              const pubMatch = text.match(/<publisher>(.*?)<\/publisher>/i);
              const genreMatch = text.match(/<genre>(.*?)<\/genre>/i);
              parsedSidecar = {
                title: titleMatch ? titleMatch[1] : cleanTitle,
                description: descMatch ? descMatch[1] : undefined,
                releaseYear: yearMatch ? yearMatch[1] : undefined,
                developer: devMatch ? devMatch[1] : undefined,
                publisher: pubMatch ? pubMatch[1] : undefined,
                genre: genreMatch ? genreMatch[1] : undefined
              };
            }
          } catch (_) {}
        }

        // Convert companion cover to Data URL if available
        let coverDataUrl = null;
        if (file.companionCoverFile) {
          coverDataUrl = await readFileAsDataUrl(file.companionCoverFile);
        }

        if (isServer) {
          const res = await fetch('/api/upload-rom', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'x-filename': encodeURIComponent(file.name),
              'x-system-key': safeSystemKey
            },
            body: file
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.game) {
              targetGame = json.game;
              uploadedGames.push(targetGame);

              // If companion cover or sidecar exists, write to server disk
              if (coverDataUrl || parsedSidecar) {
                try {
                  await fetch('/api/metadata/save-sidecar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      gameId: targetGame.id,
                      systemKey: safeSystemKey,
                      romPath: targetGame.romUrl || targetGame.url,
                      title: parsedSidecar?.title || cleanTitle,
                      description: parsedSidecar?.description,
                      releaseYear: parsedSidecar?.releaseYear,
                      developer: parsedSidecar?.developer,
                      publisher: parsedSidecar?.publisher,
                      genre: parsedSidecar?.genre,
                      coverDataUrl: coverDataUrl
                    })
                  });
                } catch (sidecarErr) {
                  console.warn('Failed saving companion sidecar to server:', sidecarErr);
                }
              }
            }
          }
        } else {
          const gameId = `local_${safeSystemKey}_${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const blobUrl = URL.createObjectURL(file);
          const gameRecord = {
            id: gameId,
            title: parsedSidecar?.title || cleanTitle,
            rawTitle: rawTitle,
            filename: file.name,
            systemKey: safeSystemKey,
            systemName: sys.name,
            systemCore: sys.core,
            systemColor: sys.color,
            systemIcon: sys.icon,
            romUrl: blobUrl,
            coverUrl: coverDataUrl || sys.icon,
            isCustomBlob: true,
            isLocalDbRom: true,
            sidecarMetadata: parsedSidecar || undefined
          };

          await saveCustomRomToLocalDb(gameRecord, file);
          uploadedGames.push(gameRecord);

          if (coverDataUrl || parsedSidecar) {
            const metaRecord = {
              id: gameId,
              title: gameRecord.title,
              systemKey: safeSystemKey,
              coverUrl: coverDataUrl || null,
              hasCustomCover: Boolean(coverDataUrl),
              description: parsedSidecar?.description || `Experience ${cleanTitle} on ${sys.name}.`,
              releaseYear: parsedSidecar?.releaseYear || null,
              developer: parsedSidecar?.developer || null,
              publisher: parsedSidecar?.publisher || null,
              genre: parsedSidecar?.genre || null,
              source: 'Local Sidecar',
              hasSidecar: Boolean(parsedSidecar),
              scrapedAt: new Date().toISOString()
            };
            saveCachedMetadata(gameId, metaRecord).catch(() => {});
          }
        }
      } catch (err) {
        console.error(`🚨 [BATCH UPLOAD ERROR] File "${file.name}":`, err);
      }
    }

    if (onProgress) {
      onProgress({
        step: 'refreshing',
        current: total,
        total,
        message: 'Updating library index...'
      });
    }

    await fetchGames();
    return uploadedGames;
  }, [fetchGames]);

  const handleCustomRomSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processCustomRomFile(file);
    }
    e.target.value = '';
  }, [processCustomRomFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (onFileDropped) {
      onFileDropped(e.dataTransfer || e.dataTransfer?.files?.[0]);
    } else if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processCustomRomFile(e.dataTransfer.files[0]);
    }
  }, [onFileDropped, processCustomRomFile]);

  const filteredGames = useMemo(() => {
    let result = games;

    // Apply activeSystem category
    if (activeSystem === 'favorites') {
      result = result.filter(game => favorites.includes(game.id || game.title));
    } else if (activeSystem === 'recent') {
      // Map and order by recentlyPlayed array
      const recentIds = recentlyPlayed.map(r => r.id || r.title);
      result = result
        .filter(game => recentIds.includes(game.id || game.title))
        .sort((a, b) => {
          const idxA = recentIds.indexOf(a.id || a.title);
          const idxB = recentIds.indexOf(b.id || b.title);
          return idxA - idxB;
        });
    } else if (activeSystem !== 'all') {
      const normalizeSys = (k) => {
        if (!k) return '';
        const lower = k.toLowerCase().replace(/[-_]/g, '');
        if (lower === 'segagenesis' || lower === 'megadrive' || lower === 'sega') return 'genesis';
        if (lower === 'playstation' || lower === 'psx' || lower === 'ps') return 'ps1';
        if (lower === 'gamegear' || lower === 'gg') return 'gamegear';
        if (lower === 'atari2600' || lower === 'atari' || lower === 'a2600') return 'atari2600';
        if (lower === 'supernintendo' || lower === 'sfc') return 'snes';
        if (lower === 'famicom') return 'nes';
        if (lower === 'gameboyadvance') return 'gba';
        if (lower === 'gameboycolor') return 'gbc';
        if (lower === 'gameboy') return 'gb';
        if (lower === 'nintendo64') return 'n64';
        if (lower === 'nintendods' || lower === 'ds') return 'nds';
        if (lower === 'mame' || lower === 'neogeo' || lower === 'fbalpha' || lower === 'fbneo') return 'arcade';
        return lower;
      };
      const targetSys = normalizeSys(activeSystem);
      result = result.filter(game => {
        const gSys = normalizeSys(game.systemKey);
        return gSys === targetSys || game.systemKey === activeSystem;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(game => {
        return game.title.toLowerCase().includes(q) ||
               (game.systemName && game.systemName.toLowerCase().includes(q));
      });
    }

    // Default release date sort if not recent tab
    if (activeSystem !== 'recent') {
      result = [...result].sort((a, b) => {
        const dateA = getReleaseDate(a);
        const dateB = getReleaseDate(b);
        return dateA.localeCompare(dateB);
      });
    }

    return result;
  }, [games, searchQuery, activeSystem, favorites, recentlyPlayed]);

  const deleteGame = useCallback(async (game) => {
    if (!game) return false;
    try {
      if (game.isCustom) {
        await deleteCustomRomFromLocalDb(game.id);
      } else {
        await fetch('/api/delete-rom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemKey: game.systemKey,
            filename: game.filename,
            relativePath: game.romUrl || game.url
          })
        }).catch(() => {});
      }
      await deleteManualMetadata(game.id);
      await fetchGames();
      return true;
    } catch (err) {
      console.error('Failed to delete game:', err);
      return false;
    }
  }, [fetchGames]);

  return {
    games,
    systems,
    activeSystem,
    setActiveSystem,
    searchQuery,
    setSearchQuery,
    loading,
    filteredGames,
    isDraggingOver,
    fetchGames,
    processCustomRomFile,
    loadBatchCustomRoms,
    uploadRomAndScrape,
    batchUploadRoms,
    deleteGame,
    deleteCustomRom: deleteCustomRomFromLocalDb,
    handleCustomRomSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}


import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllCachedMetadata,
  saveCachedMetadata,
  scrapeGame,
  clearAllCachedMetadata,
  subscribeScraperLogs,
  addScraperLog,
  clearScraperLogs,
  SCRAPER_KEYS,
  getScraperApiKey,
  setScraperApiKey
} from '../services/metadataScraper';

const AUTO_SCRAPE_STORAGE_KEY = 'retroplayer_autoscrape_enabled';

/**
 * Custom React hook to coordinate online metadata and cover art scraping,
 * state synchronization with IndexedDB, and library-wide progress tracking.
 */
export function useMetadataScraper(games = [], options = {}) {
  const { isMobile = false, isPlaying = false } = options;
  const [metadataMap, setMetadataMap] = useState({});
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState({ current: 0, total: 0 });
  const [currentScrapeTitle, setCurrentScrapeTitle] = useState('');
  const [currentScrapeSystem, setCurrentScrapeSystem] = useState('');
  const [lastScrapeSummary, setLastScrapeSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [autoScrapeEnabled, setAutoScrapeEnabledState] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTO_SCRAPE_STORAGE_KEY);
      return stored !== null ? stored === 'true' : false; // Default to false to prevent unsolicited background scraping
    } catch (_) {
      return false;
    }
  });

  const isMountedRef = useRef(true);
  const activeScrapeQueueRef = useRef(false);
  const cancelRequestedRef = useRef(false);

  // Subscribe to real-time scraper logging
  useEffect(() => {
    const unsubscribe = subscribeScraperLogs((newLogs) => {
      if (isMountedRef.current) {
        setLogs(newLogs);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update auto-scrape preference
  const setAutoScrapeEnabled = useCallback((enabled) => {
    try {
      localStorage.setItem(AUTO_SCRAPE_STORAGE_KEY, String(enabled));
    } catch (_) {}
    setAutoScrapeEnabledState(enabled);
  }, []);

  const toggleAutoScrape = useCallback(() => {
    setAutoScrapeEnabled(!autoScrapeEnabled);
  }, [autoScrapeEnabled, setAutoScrapeEnabled]);

  // Load existing cache on mount and merge local sidecar files
  useEffect(() => {
    async function loadCache() {
      const cached = (await getAllCachedMetadata()) || {};
      const merged = { ...cached };

      if (games && games.length > 0) {
        games.forEach(g => {
          const id = g.id || `${g.systemKey}-${g.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const hasLocalSidecar = g.hasSidecar || g.sidecarMetadata || (g.coverUrl && !g.coverUrl.endsWith('.svg'));
          // Local sidecar takes precedence unless user created an explicit manual override
          if (hasLocalSidecar && (!merged[id] || (!merged[id].isManualOverride && merged[id].source !== 'Manual Override'))) {
            const sidecar = g.sidecarMetadata || {};
            const sidecarCover = (g.coverUrl && !g.coverUrl.endsWith('.svg')) ? g.coverUrl : null;
            const updatedMeta = {
              id,
              title: sidecar.title || g.title,
              systemKey: g.systemKey,
              coverUrl: sidecarCover || null,
              hasCustomCover: !!sidecarCover,
              description: sidecar.description || `Experience ${g.title} on ${g.systemName}.`,
              releaseDate: sidecar.releaseYear ? `${sidecar.releaseYear}-01-01` : '2000-01-01',
              releaseYear: sidecar.releaseYear || 'Classic',
              developer: sidecar.developer || g.systemName || 'Classic',
              publisher: sidecar.publisher || g.systemName || 'Classic',
              genre: sidecar.genre || 'Retro Classic',
              walkthrough: sidecar.walkthrough || undefined,
              writtenWalkthroughUrl: sidecar.walkthrough?.written || undefined,
              videoWalkthroughUrl: sidecar.walkthrough?.video || undefined,
              source: sidecar.source || 'Local Sidecar',
              hasSidecar: true,
              scrapedAt: new Date().toISOString()
            };
            merged[id] = updatedMeta;
            // Persist companion cover updates into IndexedDB cache
            if (sidecarCover && (!cached[id] || cached[id].coverUrl !== sidecarCover)) {
              saveCachedMetadata(id, updatedMeta).catch(() => {});
            }
          }
        });
      }

      if (isMountedRef.current) {
        setMetadataMap(merged);
      }
    }
    loadCache();
  }, [games]);

  // Stop / Cancel active scraping
  const stopScrape = useCallback(() => {
    if (activeScrapeQueueRef.current || isScraping) {
      console.log('🛑 [SCRAPER] User requested scrape cancellation.');
      cancelRequestedRef.current = true;
      activeScrapeQueueRef.current = false;
      setIsScraping(false);
    }
  }, [isScraping]);

  // Clear or reset summary
  const clearScrapeSummary = useCallback(() => {
    setLastScrapeSummary(null);
  }, []);

  // Scrape single game on-demand
  const scrapeSingleGame = useCallback(async (game, force = false) => {
    if (!game) return null;
    const result = await scrapeGame(game, force);
    if (result && isMountedRef.current) {
      setMetadataMap(prev => ({
        ...prev,
        [result.id]: result
      }));
    }
    return result;
  }, []);

  // Scrape missing metadata for all games in the library
  const scrapeAll = useCallback(async (gameList = games, force = false, scopeInfo = { targetScope: 'all', scopeName: 'All Systems' }) => {
    if (!gameList || gameList.length === 0 || activeScrapeQueueRef.current) return;

    cancelRequestedRef.current = false;
    activeScrapeQueueRef.current = true;
    setIsScraping(true);
    setScrapeProgress({ current: 0, total: gameList.length });
    setCurrentScrapeTitle(gameList[0]?.title || '');
    setCurrentScrapeSystem(gameList[0]?.systemName || '');

    let newlyScrapedCount = 0;
    let alreadyCachedCount = 0;
    let coversFoundCount = 0;
    let errorCount = 0;

    addScraperLog(`🚀 Starting metadata scan for ${gameList.length} titles (${scopeInfo.scopeName})...`, 'scan');
    console.log(`🚀 [BATCH SCRAPER] Starting metadata scan for ${gameList.length} titles (${scopeInfo.scopeName})...`);

    for (let i = 0; i < gameList.length; i++) {
      if (!isMountedRef.current || cancelRequestedRef.current) {
        addScraperLog(`🛑 [STOPPED] Scan halted at ${i}/${gameList.length} titles.`, 'warning');
        console.log('🛑 [BATCH SCRAPER] Scan aborted by user or unmount.');
        break;
      }
      const game = gameList[i];
      const id = game.id || `${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const isFullyLocal = Boolean((game.hasSidecar || game.sidecarMetadata) && (game.coverUrl && !game.coverUrl.endsWith('.svg')));

      if (isMountedRef.current) {
        setCurrentScrapeTitle(game.title);
        setCurrentScrapeSystem(game.systemName || game.systemKey);
      }

      const hadExistingMetadata = Boolean(metadataMap[id] || isFullyLocal);

      try {
        if (force || !hadExistingMetadata) {
          const meta = await scrapeGame(game, force);
          if (cancelRequestedRef.current) break;
          if (meta) {
            newlyScrapedCount++;
            if (meta.coverUrl && !meta.coverUrl.endsWith('.svg')) {
              coversFoundCount++;
            }
            if (isMountedRef.current) {
              setMetadataMap(prev => ({
                ...prev,
                [meta.id]: meta
              }));
            }
          } else {
            errorCount++;
          }
        } else {
          alreadyCachedCount++;
          addScraperLog(`📦 [CACHE] Verified "${game.title}" (${game.systemName || game.systemKey}) from IndexedDB`, 'info', { gameId: id, title: game.title, systemKey: game.systemKey });
          const existing = metadataMap[id];
          if (existing?.coverUrl && !existing.coverUrl.endsWith('.svg')) {
            coversFoundCount++;
          } else if (game.coverUrl && !game.coverUrl.endsWith('.svg')) {
            coversFoundCount++;
          }
        }
      } catch (err) {
        console.error('Error scraping game:', game.title, err);
        addScraperLog(`⚠️ [ERROR] Failed lookup for "${game.title}": ${err?.message || 'Network issue'}`, 'error', { gameId: id, title: game.title, systemKey: game.systemKey });
        errorCount++;
      }

      if (isMountedRef.current && !cancelRequestedRef.current) {
        setScrapeProgress({ current: i + 1, total: gameList.length });
      }

      if (cancelRequestedRef.current) break;

      // Pacing between titles
      await new Promise(r => setTimeout(r, 25));
    }

    const wasCancelled = cancelRequestedRef.current;
    const summary = {
      total: gameList.length,
      scraped: newlyScrapedCount,
      alreadyCached: alreadyCachedCount,
      coversFound: coversFoundCount,
      errors: errorCount,
      targetScope: scopeInfo.targetScope || 'all',
      scopeName: scopeInfo.scopeName || 'All Systems',
      status: wasCancelled ? 'stopped' : 'completed',
      timestamp: Date.now()
    };

    if (isMountedRef.current) {
      setLastScrapeSummary(summary);
      setIsScraping(false);
      setCurrentScrapeTitle('');
      setCurrentScrapeSystem('');
      activeScrapeQueueRef.current = false;
    }

    if (!wasCancelled) {
      addScraperLog(`✅ [COMPLETE] Scan finished: ${summary.total} processed (${summary.scraped} newly updated, ${summary.alreadyCached} verified from cache, ${summary.coversFound} covers verified)`, 'success');
    }
    console.log(`✅ [BATCH SCRAPER] Finished library scan process:`, summary);
    return summary;
  }, [games, metadataMap]);

  // Scrape a specific single console system
  const scrapeSystem = useCallback(async (systemKey, force = false) => {
    if (!systemKey || !games) return;
    const systemGames = games.filter(g => g.systemKey === systemKey);
    const scopeName = systemGames[0]?.systemName || systemKey.toUpperCase();
    console.log(`🎯 [SCRAPER] Scrape requested for single system: ${systemKey} (${systemGames.length} games)`);
    return await scrapeAll(systemGames, force, { targetScope: systemKey, scopeName });
  }, [games, scrapeAll]);

  // Scrape a bunch / multi-selection of console systems
  const scrapeSystems = useCallback(async (systemKeys = [], force = false) => {
    if (!systemKeys || systemKeys.length === 0 || !games) return;
    const selectedGames = games.filter(g => systemKeys.includes(g.systemKey));
    console.log(`🎯 [SCRAPER] Scrape requested for ${systemKeys.length} systems (${selectedGames.length} games)`);
    return await scrapeAll(selectedGames, force, { targetScope: 'multi', scopeName: `${systemKeys.length} Systems` });
  }, [games, scrapeAll]);

  // Auto-scrape missing games in the background:
  // Strictly respects user toggle (disabled by default, never runs without user opt-in, paused during active gameplay)
  useEffect(() => {
    if (isPlaying) return; // Never auto-scrape during active gameplay
    const shouldAutoScrape = Boolean(autoScrapeEnabled);
    if (shouldAutoScrape && games && games.length > 0 && !activeScrapeQueueRef.current && !cancelRequestedRef.current) {
      // Find games that have not been scraped yet and do NOT have local sidecars or local covers
      const unscraped = games.filter(g => {
        const id = g.id || `${g.systemKey}-${g.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const hasLocalSidecar = g.hasSidecar || g.sidecarMetadata || (g.coverUrl && !g.coverUrl.endsWith('.svg'));
        return !metadataMap[id] && !hasLocalSidecar;
      });

      if (unscraped.length > 0) {
        scrapeAll(unscraped, false, { targetScope: 'unscraped', scopeName: 'Missing Titles' });
      }
    }
  }, [autoScrapeEnabled, isPlaying, games, metadataMap, scrapeAll]);

  // Clear cache and reset
  const clearCache = useCallback(async () => {
    await clearAllCachedMetadata();
    if (isMountedRef.current) {
      setMetadataMap({});
      setLastScrapeSummary(null);
    }
  }, []);

  // Direct update local metadata map
  const updateLocalMetadata = useCallback((id, data) => {
    if (!id || !isMountedRef.current) return;
    setMetadataMap(prev => ({
      ...prev,
      [id]: data
    }));
  }, []);

  // Reload cache from storage
  const refreshCache = useCallback(async () => {
    const cached = await getAllCachedMetadata();
    if (isMountedRef.current) {
      setMetadataMap(cached || {});
    }
  }, []);

  return {
    metadataMap,
    isScraping,
    scrapeProgress,
    currentScrapeTitle,
    currentScrapeSystem,
    lastScrapeSummary,
    clearScrapeSummary,
    logs,
    clearLogs: clearScraperLogs,
    autoScrapeEnabled,
    setAutoScrapeEnabled,
    toggleAutoScrape,
    stopScrape,
    scrapeSingleGame,
    scrapeSystem,
    scrapeSystems,
    scrapeAll,
    clearCache,
    updateLocalMetadata,
    refreshCache,
    SCRAPER_KEYS,
    getApiKey: getScraperApiKey,
    setApiKey: setScraperApiKey
  };
}

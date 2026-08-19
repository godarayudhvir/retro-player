import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllCachedMetadata,
  scrapeGame,
  clearAllCachedMetadata
} from '../services/metadataScraper';

/**
 * Custom React hook to coordinate online metadata and cover art scraping,
 * state synchronization with IndexedDB, and library-wide progress tracking.
 */
export function useMetadataScraper(games = []) {
  const [metadataMap, setMetadataMap] = useState({});
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState({ current: 0, total: 0 });
  const isMountedRef = useRef(true);
  const activeScrapeQueueRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load existing cache on mount
  useEffect(() => {
    async function loadCache() {
      const cached = await getAllCachedMetadata();
      if (isMountedRef.current) {
        setMetadataMap(cached || {});
      }
    }
    loadCache();
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
  const scrapeAll = useCallback(async (gameList = games, force = false) => {
    if (!gameList || gameList.length === 0 || activeScrapeQueueRef.current) return;

    activeScrapeQueueRef.current = true;
    setIsScraping(true);
    setScrapeProgress({ current: 0, total: gameList.length });

    console.log(`🚀 [BATCH SCRAPER] Starting metadata scan for ${gameList.length} titles...`);

    for (let i = 0; i < gameList.length; i++) {
      if (!isMountedRef.current) break;
      const game = gameList[i];
      const id = game.id || `${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

      if (force || !metadataMap[id]) {
        const meta = await scrapeGame(game, force);
        if (meta && isMountedRef.current) {
          setMetadataMap(prev => ({
            ...prev,
            [meta.id]: meta
          }));
        }
      }

      if (isMountedRef.current) {
        setScrapeProgress({ current: i + 1, total: gameList.length });
      }

      // Small delay between queries to respect rate limits
      await new Promise(r => setTimeout(r, 120));
    }

    if (isMountedRef.current) {
      setIsScraping(false);
      activeScrapeQueueRef.current = false;
    }
    console.log(`✅ [BATCH SCRAPER] Completed library scan.`);
  }, [games, metadataMap]);

  // Auto-scrape missing games in the background whenever games list updates
  useEffect(() => {
    if (games && games.length > 0 && !activeScrapeQueueRef.current) {
      // Find games that have not been scraped yet
      const unscraped = games.filter(g => {
        const id = g.id || `${g.systemKey}-${g.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return !metadataMap[id];
      });

      if (unscraped.length > 0) {
        // Run background batch scrape
        scrapeAll(unscraped, false);
      }
    }
  }, [games, metadataMap, scrapeAll]);

  // Clear cache and reset
  const clearCache = useCallback(async () => {
    await clearAllCachedMetadata();
    if (isMountedRef.current) {
      setMetadataMap({});
    }
  }, []);

  return {
    metadataMap,
    isScraping,
    scrapeProgress,
    scrapeSingleGame,
    scrapeAll,
    clearCache
  };
}

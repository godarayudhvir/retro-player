/**
 * Automated Metadata & Cover Art Scraper Service
 * Connects directly to Libretro Thumbnails CDN and Open APIs (Wikipedia REST)
 * with IndexedDB caching and intelligent candidate matching.
 * Zero hardcoded game metadata in the repository.
 */

const DB_NAME = 'RetroPlayerMetadataDB';
const DB_VERSION = 3; // Bumped to 3 to invalidate old null cover cache
const STORE_NAME = 'game_metadata';

// In-memory real-time Scraper Log buffer & listeners
const scraperLogs = [];
const logListeners = new Set();

// Storage keys for custom Scraper API keys (TheGamesDB, ScreenScraper)
export const SCRAPER_KEYS = {
  THEGAMESDB_API_KEY: 'retroplayer_thegamesdb_key',
  SCREENSCRAPER_USER: 'retroplayer_screenscraper_user',
  SCREENSCRAPER_PASS: 'retroplayer_screenscraper_pass'
};

export function getScraperApiKey(keyName) {
  try {
    return localStorage.getItem(keyName) || '';
  } catch (_) {
    return '';
  }
}

export function setScraperApiKey(keyName, val) {
  try {
    if (val) {
      localStorage.setItem(keyName, val.trim());
    } else {
      localStorage.removeItem(keyName);
    }
  } catch (_) {}
}

export function subscribeScraperLogs(listener) {
  logListeners.add(listener);
  listener([...scraperLogs]);
  return () => logListeners.delete(listener);
}

export function addScraperLog(message, type = 'info', meta = {}) {
  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
    message,
    type, // 'info', 'success', 'warning', 'error', 'scan'
    gameId: meta.gameId || null,
    title: meta.title || null,
    systemKey: meta.systemKey || null
  };
  scraperLogs.push(logEntry);
  if (scraperLogs.length > 300) {
    scraperLogs.shift();
  }
  logListeners.forEach(fn => fn([...scraperLogs]));
}

export function clearScraperLogs() {
  scraperLogs.length = 0;
  logListeners.forEach(fn => fn([]));
}

// Map internal system keys to TheGamesDB platform IDs
const THEGAMESDB_PLATFORM_MAP = {
  nes: 7,
  snes: 6,
  gba: 5,
  gbc: 41,
  gb: 4,
  n64: 3,
  nds: 8,
  genesis: 18,
  megadrive: 18,
  ps1: 10,
  psx: 10,
  arcade: 23,
  gamegear: 20,
  atari2600: 22
};

// Map internal system keys to ScreenScraper platform IDs
const SCREENSCRAPER_PLATFORM_MAP = {
  nes: 3,
  snes: 4,
  gba: 12,
  gbc: 11,
  gb: 9,
  n64: 14,
  nds: 15,
  genesis: 1,
  megadrive: 1,
  ps1: 57,
  psx: 57,
  arcade: 75,
  gamegear: 21,
  atari2600: 26
};

// Map internal system keys to Libretro Thumbnails repository system directory names
const LIBRETRO_SYSTEM_MAP = {
  nes: 'Nintendo - Nintendo Entertainment System',
  snes: 'Nintendo - Super Nintendo Entertainment System',
  gba: 'Nintendo - Game Boy Advance',
  gbc: 'Nintendo - Game Boy Color',
  gb: 'Nintendo - Game Boy',
  n64: 'Nintendo - Nintendo 64',
  nds: 'Nintendo - Nintendo DS',
  genesis: 'Sega - Mega Drive - Genesis',
  megadrive: 'Sega - Mega Drive - Genesis',
  ps1: 'Sony - PlayStation',
  psx: 'Sony - PlayStation',
  arcade: 'FBNeo - Arcade Games',
  gamegear: 'Sega - Game Gear',
  atari2600: 'Atari - 2600'
};

// Open IndexedDB instance
function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('⚠️ [METADATA DB] Failed to open IndexedDB:', request.error);
      resolve(null);
    };
  });
}

let isServerDbAvailable = typeof window !== 'undefined' && !window.location.hostname.endsWith('github.io');

// Fetch metadata from server database (/api/db/game_metadata)
async function fetchServerMetadata() {
  if (!isServerDbAvailable) return null;
  try {
    const res = await fetch('/api/db/game_metadata');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data;
      }
    } else if (res.status === 404 || res.status === 405) {
      isServerDbAvailable = false;
    }
  } catch (_) {
    isServerDbAvailable = false;
  }
  return null;
}

// Get cached metadata from IndexedDB or server DB fallback
async function getCachedMetadata(id) {
  try {
    // 1. Try local IndexedDB
    const db = await openDB();
    if (db) {
      const item = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (item) {
        if (item.coverUrl && item.coverUrl.endsWith('.svg')) item.coverUrl = null;
        return item;
      }
    } else {
      const local = localStorage.getItem(`rp_meta_${id}`);
      if (local) {
        const item = JSON.parse(local);
        if (item.coverUrl && item.coverUrl.endsWith('.svg')) item.coverUrl = null;
        return item;
      }
    }

    // 2. Fallback to server DB
    if (isServerDbAvailable) {
      try {
        const res = await fetch(`/api/db/game_metadata/${encodeURIComponent(id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            const item = json.data;
            if (item.coverUrl && item.coverUrl.endsWith('.svg')) item.coverUrl = null;
            // Seed local IndexedDB
            if (db) {
              const tx = db.transaction(STORE_NAME, 'readwrite');
              tx.objectStore(STORE_NAME).put(item);
            }
            return item;
          }
        } else if (res.status === 404 || res.status === 405) {
          isServerDbAvailable = false;
        }
      } catch (_) {
        isServerDbAvailable = false;
      }
    }

    return null;
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE READ] Error:', err);
    return null;
  }
}

// Get all cached metadata (merges server DB and local IndexedDB)
export async function getAllCachedMetadata() {
  const result = {};

  // 1. First load from authoritative server database
  const serverData = await fetchServerMetadata();
  if (serverData && typeof serverData === 'object') {
    Object.keys(serverData).forEach(id => {
      const item = serverData[id];
      if (item && item.id) {
        if (item.coverUrl && item.coverUrl.endsWith('.svg')) item.coverUrl = null;
        result[item.id] = item;
      }
    });
  }

  // 2. Hydrate from / seed with local IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const localItems = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      localItems.forEach(item => {
        if (item && item.id) {
          if (item.coverUrl && item.coverUrl.endsWith('.svg')) item.coverUrl = null;
          if (!result[item.id]) {
            result[item.id] = item;
          }
        }
      });

      // Populate local DB with any server records that were missing locally
      if (Object.keys(result).length > 0) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        Object.values(result).forEach(rec => {
          store.put(rec);
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE GET ALL] Local DB Error:', err);
  }

  return result;
}

// Save metadata to IndexedDB, localStorage, and persistent Server DB
export async function saveCachedMetadata(id, data) {
  try {
    const record = { id, ...data, updatedAt: Date.now() };

    // 1. Local IndexedDB
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
    }

    // 2. LocalStorage
    try {
      localStorage.setItem(`rp_meta_${id}`, JSON.stringify(record));
    } catch (_) {}

    // 3. Persistent Server Database (/api/db/game_metadata) if available
    if (isServerDbAvailable) {
      try {
        fetch('/api/db/game_metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: id, value: record })
        }).catch(() => {
          isServerDbAvailable = false;
        });
      } catch (_) {
        isServerDbAvailable = false;
      }
    }

    return record;
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE SAVE] Error:', err);
  }
}

// Save user manual metadata override (Jellyfin Style)
export async function saveManualMetadata(id, customData) {
  const existing = (await getCachedMetadata(id)) || {};
  const record = {
    ...existing,
    ...customData,
    id,
    isManualOverride: true,
    source: 'Manual Override',
    updatedAt: Date.now()
  };
  await saveCachedMetadata(id, record);
  addScraperLog(`✏️ Saved manual metadata override for "${record.title || id}"`, 'success', {
    gameId: id,
    title: record.title,
    systemKey: record.systemKey
  });
  return record;
}

// Revert manual override
export async function deleteManualMetadata(id) {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    }
    try {
      localStorage.removeItem(`rp_meta_${id}`);
    } catch (_) {}
    if (isServerDbAvailable) {
      try {
        fetch(`/api/db/game_metadata/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
      } catch (_) {}
    }
    addScraperLog(`🔄 Reverted custom metadata for game ID "${id}"`, 'info', { gameId: id });
    return true;
  } catch (err) {
    console.warn('⚠️ [METADATA REVERT ERROR]:', err);
    return false;
  }
}

// Clear all cached metadata
export async function clearAllCachedMetadata() {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    }
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rp_meta_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE CLEAR] Error:', err);
  }
}

/**
 * Format string for Libretro Thumbnails naming standards
 * (Replaces &, :, /, \, *, ?, ", <, >, | with _)
 */
function formatLibretroName(str) {
  if (!str) return '';
  return str
    .replace(/[&:/\\*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate extensive candidate filenames for thumbnail scraping
 * Dynamically resolves demo/kiosk/aftermarket ROMs to their official retail box art.
 */
function generateThumbnailCandidates(game) {
  const candidates = [];
  const raw = game.rawTitle || game.title || '';
  const fileNoExt = (game.filename || '').replace(/\.[^/.]+$/, '');
  const cleanDisplay = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

  const baseSet = new Set();

  function addBaseVariants(str) {
    if (!str) return;
    const clean = str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    baseSet.add(clean);

    // Pokemon <-> Pokémon
    if (clean.includes('Pokemon')) baseSet.add(clean.replace(/Pokemon/g, 'Pokémon'));
    if (clean.includes('Pokémon')) baseSet.add(clean.replace(/Pokémon/g, 'Pokemon'));

    // The ... <-> ..., The
    if (clean.startsWith('The ')) {
      baseSet.add(clean.replace(/^The (.+)$/, '$1, The'));
    }
    if (clean.endsWith(', The')) {
      baseSet.add('The ' + clean.replace(/, The$/, ''));
    }

    // Split multi-game kiosk bundles like "Pokemon - Diamond Version + Pokemon - Pearl Version"
    if (clean.includes(' + ')) {
      clean.split(' + ').forEach(part => addBaseVariants(part.trim()));
    }
  }

  // 1. Add clean display title and variants
  addBaseVariants(cleanDisplay);

  // 2. Add raw title stripped of all tags in parentheses
  const rawStripped = raw
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();
  addBaseVariants(rawStripped);

  // 3. Add filename stripped of all tags in parentheses
  const fileStripped = fileNoExt
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();
  addBaseVariants(fileStripped);

  // 4. Exact raw strings (if the database happens to have exact demo name)
  if (fileNoExt) candidates.push(formatLibretroName(fileNoExt));
  if (raw) candidates.push(formatLibretroName(raw));

  // 5. Region / Language / Flag variants for every base variant (top most common first)
  const regionTags = [
    '',
    ' (USA)',
    ' (USA, Europe)',
    ' (Europe)',
    ' (World)',
    ' (Japan, USA)',
    ' (Japan)',
    ' (USA) (Demo)',
    ' (USA) (Proto)'
  ];

  for (const base of baseSet) {
    for (const reg of regionTags) {
      candidates.push(formatLibretroName(`${base}${reg}`));
    }
  }

  return Array.from(new Set(candidates)).filter(Boolean);
}

/**
 * Test if an image exists and loads with a fast timeout
 */
function probeImageUrl(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let finished = false;
    const img = new Image();
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        img.src = '';
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(true);
      }
    };
    img.onerror = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(false);
      }
    };
    img.src = url;
  });
}

/**
 * Scrapes TheGamesDB.net API if user provided an API key in Settings
 */
async function scrapeTheGamesDB(game) {
  const apiKey = getScraperApiKey(SCRAPER_KEYS.THEGAMESDB_API_KEY);
  if (!apiKey) return null;

  try {
    const cleanTitle = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
    const platformId = THEGAMESDB_PLATFORM_MAP[game.systemKey];
    addScraperLog(`🎮 Querying TheGamesDB for "${cleanTitle}"...`, 'scan', { gameId: game.id, title: game.title, systemKey: game.systemKey });

    let endpoint = `Games/ByGameName?apikey=${encodeURIComponent(apiKey)}&name=${encodeURIComponent(cleanTitle)}`;
    if (platformId) endpoint += `&filter%5Bplatform%5D=${platformId}`;

    // Route through local proxy to bypass browser CORS headers
    const proxyUrl = `/api/proxy-thegamesdb?endpoint=${encodeURIComponent(endpoint)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) {
      addScraperLog(`⚠️ TheGamesDB API returned HTTP ${res.status}`, 'warning', { gameId: game.id, title: game.title, systemKey: game.systemKey });
      return null;
    }

    const data = await res.json();
    const gamesList = data.data?.games || [];
    if (gamesList.length === 0) {
      addScraperLog(`ℹ️ No match found on TheGamesDB for "${cleanTitle}"`, 'info', { gameId: game.id, title: game.title, systemKey: game.systemKey });
      return null;
    }

    // Strict validation: Don't take gamesList[0] blindly (e.g., "Bike Race '98" should not match "Bass Rush")
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanNorm = normalize(cleanTitle);

    let gameEntry = gamesList.find(g => {
      const gNorm = normalize(g.game_title || g.title);
      return gNorm === cleanNorm || gNorm.startsWith(cleanNorm) || cleanNorm.startsWith(gNorm);
    });

    // If no exact/token match exists, check token overlap
    if (!gameEntry) {
      const tokens = cleanTitle.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      if (tokens.length > 0) {
        gameEntry = gamesList.find(g => {
          const gLower = (g.game_title || g.title || '').toLowerCase();
          return tokens.every(t => gLower.includes(t));
        });
      }
    }

    if (!gameEntry) {
      addScraperLog(`ℹ️ TheGamesDB results did not accurately match "${cleanTitle}"`, 'info', { gameId: game.id, title: game.title, systemKey: game.systemKey });
      return null;
    }

    let boxArtUrl = null;

    // Fetch images if gameId found
    if (gameEntry.id) {
      const imgEndpoint = `Games/Images?apikey=${encodeURIComponent(apiKey)}&games_id=${gameEntry.id}`;
      const imgProxyUrl = `/api/proxy-thegamesdb?endpoint=${encodeURIComponent(imgEndpoint)}`;
      const imgRes = await fetch(imgProxyUrl);
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        const baseImgUrl = imgData.data?.base_url?.original || imgData.data?.base_url?.medium || 'https://cdn.thegamesdb.net/images/original/';
        const boxarts = imgData.data?.images?.[gameEntry.id] || [];
        const frontBox = boxarts.find(img => img.type === 'boxart' && img.side === 'front') || boxarts[0];
        if (frontBox?.filename) {
          boxArtUrl = `${baseImgUrl}${frontBox.filename}`;
        }
      }
    }

    addScraperLog(`✨ [THEGAMESDB] Found "${gameEntry.game_title || game.title}" (${gameEntry.release_date?.substring(0, 4) || 'Classic'})`, 'success', { gameId: game.id, title: game.title, systemKey: game.systemKey });

    return {
      coverUrl: boxArtUrl,
      description: gameEntry.overview || null,
      releaseDate: gameEntry.release_date || null,
      releaseYear: gameEntry.release_date ? gameEntry.release_date.substring(0, 4) : null,
      developer: gameEntry.developers?.[0] || null,
      publisher: gameEntry.publishers?.[0] || null,
      genre: gameEntry.genres?.[0] || 'Retro Classic',
      source: 'TheGamesDB'
    };
  } catch (err) {
    console.warn('[TheGamesDB Fetch Error]', err);
    addScraperLog(`⚠️ TheGamesDB error: ${err.message}`, 'warning', { gameId: game.id, title: game.title, systemKey: game.systemKey });
    return null;
  }
}

/**
 * Scrapes ScreenScraper.fr API if user provided credentials in Settings
 */
async function scrapeScreenScraper(game) {
  const ssid = getScraperApiKey(SCRAPER_KEYS.SCREENSCRAPER_USER);
  const sspassword = getScraperApiKey(SCRAPER_KEYS.SCREENSCRAPER_PASS);
  if (!ssid || !sspassword) return null;

  try {
    const cleanTitle = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
    const systemId = SCREENSCRAPER_PLATFORM_MAP[game.systemKey] || 0;
    addScraperLog(`🇫🇷 Querying ScreenScraper for "${cleanTitle}"...`, 'scan', { gameId: game.id, title: game.title, systemKey: game.systemKey });

    const queryParams = `devid=retroplayer&devpassword=retroplayer&softname=RetroPlayerWeb&ssid=${encodeURIComponent(ssid)}&sspassword=${encodeURIComponent(sspassword)}&output=json&systemeid=${systemId}&romnom=${encodeURIComponent(game.title)}`;
    const proxyUrl = `/api/proxy-screenscraper?query=${encodeURIComponent(queryParams)}`;

    const res = await fetch(proxyUrl);
    if (!res.ok) {
      addScraperLog(`⚠️ ScreenScraper API returned HTTP ${res.status}`, 'warning', { gameId: game.id, title: game.title, systemKey: game.systemKey });
      return null;
    }

    const data = await res.json();
    const jeu = data.response?.jeu;
    if (!jeu) {
      addScraperLog(`ℹ️ No match found on ScreenScraper for "${cleanTitle}"`, 'info', { gameId: game.id, title: game.title, systemKey: game.systemKey });
      return null;
    }

    // Extract cover boxart
    const medias = jeu.medias || [];
    const boxartMedia = medias.find(m => m.type === 'box-2D' || m.type === 'box-3D') || medias[0];
    const coverUrl = boxartMedia?.url || null;

    const synopsis = jeu.synopsis?.find(s => s.langue === 'en')?.texte || jeu.synopsis?.[0]?.texte || null;
    const releaseDate = jeu.dates?.find(d => d.region === 'us' || d.region === 'wor')?.date || jeu.dates?.[0]?.date || null;
    const releaseYear = releaseDate ? releaseDate.substring(0, 4) : null;

    addScraperLog(`✨ [SCREENSCRAPER] Found "${jeu.noms?.[0]?.nom || game.title}" (${releaseYear || 'Classic'})`, 'success', { gameId: game.id, title: game.title, systemKey: game.systemKey });

    return {
      coverUrl,
      description: synopsis,
      releaseDate,
      releaseYear,
      developer: jeu.developpeur?.nom || null,
      publisher: jeu.editeur?.nom || null,
      genre: jeu.genres?.[0]?.noms?.find(n => n.langue === 'en')?.nom || 'Retro Classic',
      source: 'ScreenScraper'
    };
  } catch (err) {
    console.warn('[ScreenScraper Fetch Error]', err);
    addScraperLog(`⚠️ ScreenScraper error: ${err.message}`, 'warning', { gameId: game.id, title: game.title, systemKey: game.systemKey });
    return null;
  }
}

/**
 * Scrapes Official Box Art with Priority Order:
 * 1. TheGamesDB (if API key provided)
 * 2. ScreenScraper.fr (if credentials provided)
 * 3. Libretro Thumbnails CDN & GitHub Raw mirrors
 * 4. Wikipedia Lead Image (fallback in scrapeGame)
 */
async function scrapeCoverArt(game) {
  // Priority 1: TheGamesDB.net (User API Key)
  const tgdbRes = await scrapeTheGamesDB(game);
  if (tgdbRes?.coverUrl) {
    addScraperLog(`✨ Box art selected from TheGamesDB for "${game.title}"`, 'success', { gameId: game.id, title: game.title, systemKey: game.systemKey });
    return tgdbRes.coverUrl;
  }

  // Priority 2: ScreenScraper.fr (User Credentials)
  const ssRes = await scrapeScreenScraper(game);
  if (ssRes?.coverUrl) {
    addScraperLog(`✨ Box art selected from ScreenScraper for "${game.title}"`, 'success', { gameId: game.id, title: game.title, systemKey: game.systemKey });
    return ssRes.coverUrl;
  }

  // Priority 3: Libretro Thumbnails CDN & GitHub Raw Mirrors
  const sysDir = LIBRETRO_SYSTEM_MAP[game.systemKey];
  if (!sysDir) return null;

  const candidates = generateThumbnailCandidates(game);
  const types = ['Named_Boxarts', 'Named_Titles', 'Named_Snaps'];
  const githubRepoName = sysDir.replace(/\s+/g, '_');

  // Build ordered list of URLs to test
  const testUrls = [];
  for (const candidate of candidates) {
    const encodedCandidate = encodeURIComponent(candidate);
    for (const type of types) {
      testUrls.push({
        url: `https://thumbnails.libretro.com/${encodeURIComponent(sysDir)}/${type}/${encodedCandidate}.png`,
        candidate,
        source: 'Libretro CDN'
      });
      testUrls.push({
        url: `https://raw.githubusercontent.com/libretro-thumbnails/${githubRepoName}/master/${type}/${encodedCandidate}.png`,
        candidate,
        source: 'GitHub mirror'
      });
    }
  }

  // Probe in concurrent chunks of 8 for ultra-fast throughput without network congestion
  const CHUNK_SIZE = 8;
  for (let i = 0; i < testUrls.length; i += CHUNK_SIZE) {
    const chunk = testUrls.slice(i, i + CHUNK_SIZE);
    const probeResults = await Promise.all(
      chunk.map(async (item) => {
        const works = await probeImageUrl(item.url, 1500);
        return works ? item : null;
      })
    );

    const match = probeResults.find(Boolean);
    if (match) {
      console.log(`✨ [BOX ART FOUND] "${game.title}" -> ${match.url}`);
      addScraperLog(`✨ Box art found on ${match.source} for "${game.title}" (${match.candidate}.png)`, 'success', { gameId: game.id, title: game.title, systemKey: game.systemKey });
      return match.url;
    }
  }

  addScraperLog(`ℹ️ No official box art in TheGamesDB / ScreenScraper / Libretro for "${game.title}"`, 'info', { gameId: game.id, title: game.title, systemKey: game.systemKey });
  return null;
}

/**
 * Scrapes specific game metadata from Wikipedia Open REST APIs (Strict Last Resort)
 */
async function scrapeWikipediaLastResort(game) {
  const cleanTitle = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  const systemName = game.systemName || '';

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`"${cleanTitle}" video game`)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const results = searchData.query?.search || [];

      // Filter out broad overview franchise pages
      let targetResult = results.find(r => {
        const titleLower = r.title.toLowerCase();
        const cleanLower = cleanTitle.toLowerCase();
        if (titleLower === 'pokémon' || titleLower === 'pokemon' || titleLower.startsWith('list of')) return false;
        const tokens = cleanLower.split(/\s+/).filter(t => t.length > 2 && t !== 'version' && t !== 'the' && t !== 'game');
        return tokens.every(token => titleLower.includes(token));
      });

      if (!targetResult) {
        targetResult = results.find(r => !['pokémon', 'pokemon'].includes(r.title.toLowerCase()) && !r.title.toLowerCase().startsWith('list of')) || results[0];
      }

      if (targetResult && targetResult.title) {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetResult.title)}`;
        const summaryRes = await fetch(summaryUrl);

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.extract && summaryData.type !== 'disambiguation') {
            const yearMatch = summaryData.extract.match(/\b(198\d|199\d|200\d|201\d|202\d)\b/);
            const releaseYear = yearMatch ? yearMatch[1] : null;

            // Wikipedia lead image as last resort cover
            const wikiCover = summaryData.thumbnail?.source || summaryData.originalimage?.source || null;

            addScraperLog(`📖 [LAST RESORT] Fetched Wikipedia summary & year (${releaseYear || 'Classic'}) for "${game.title}"`, 'info', { gameId: game.id, title: game.title, systemKey: game.systemKey });

            return {
              description: summaryData.extract,
              coverUrl: wikiCover,
              releaseDate: releaseYear ? `${releaseYear}-01-01` : null,
              releaseYear: releaseYear || null,
              developer: summaryData.description || `${systemName} Classic`,
              publisher: systemName,
              genre: 'Retro Classic',
              source: 'Wikipedia (Last Resort)'
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ [METADATA SCRAPER] Wikipedia last-resort fetch error for "${cleanTitle}":`, err);
  }

  // Dynamic fallback
  return {
    description: `Experience the classic adventure of ${cleanTitle} for ${systemName}. Relive nostalgic challenges and timeless retro gameplay.`,
    coverUrl: null,
    releaseDate: null,
    releaseYear: null,
    developer: systemName,
    publisher: systemName,
    genre: 'Retro Classic',
    source: 'Dynamic Overview'
  };
}

/**
 * Scrapes metadata with Priority Order:
 * 1. TheGamesDB (Gaming DB)
 * 2. ScreenScraper.fr (Gaming DB)
 * 3. Wikipedia Open REST API (Strict Last Resort)
 */
async function scrapeGameDetails(game) {
  // 1. TheGamesDB (Gaming DB)
  const tgdbRes = await scrapeTheGamesDB(game);
  if (tgdbRes && tgdbRes.description) return tgdbRes;

  // 2. ScreenScraper.fr (Gaming DB)
  const ssRes = await scrapeScreenScraper(game);
  if (ssRes && ssRes.description) return ssRes;

  // 3. Wikipedia Open REST API (Strict Last Resort)
  return await scrapeWikipediaLastResort(game);
}

/**
 * Main Scrape Method for a Single Game
 */
export async function scrapeGame(game, force = false) {
  if (!game) return null;
  const id = game.id || `${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const hasLocalSidecar = game.hasSidecar || game.sidecarMetadata || (game.coverUrl && !game.coverUrl.endsWith('.svg'));

  const cached = await getCachedMetadata(id);
  if (cached) {
    // 1. If user has manually edited metadata, preserve it unless force re-scrape is explicitly requested
    if (cached.isManualOverride && !force) {
      addScraperLog(`✏️ Loaded "${cached.title || game.title}" from manual override`, 'info', { gameId: id, title: game.title, systemKey: game.systemKey });
      return cached;
    }
    // If we have a local companion sidecar/cover on disk, local files ALWAYS take precedence over previous online scraped cache
    if (!hasLocalSidecar && !force) {
      addScraperLog(`📦 Loaded "${game.title}" from IndexedDB cache`, 'info', { gameId: id, title: game.title, systemKey: game.systemKey });
      return cached;
    }
  }

  // 2. Local Sidecar Priority: If local files / sidecar exist, local files ALWAYS override online scrapers and ZERO online network calls are made.
  if (hasLocalSidecar && (!cached || !cached.isManualOverride || !force)) {
    const sidecar = game.sidecarMetadata || {};
    const sidecarCover = (game.coverUrl && !game.coverUrl.endsWith('.svg')) ? game.coverUrl : null;
    const metadata = {
      id,
      title: sidecar.title || game.title,
      systemKey: game.systemKey,
      coverUrl: sidecarCover || null,
      hasCustomCover: !!sidecarCover,
      description: sidecar.description || `Experience ${game.title} on ${game.systemName}.`,
      releaseDate: sidecar.releaseYear ? `${sidecar.releaseYear}-01-01` : '2000-01-01',
      releaseYear: sidecar.releaseYear || 'Classic',
      developer: sidecar.developer || game.systemName || 'Classic',
      publisher: sidecar.publisher || game.systemName || 'Classic',
      genre: sidecar.genre || 'Retro Classic',
      walkthrough: sidecar.walkthrough || undefined,
      writtenWalkthroughUrl: sidecar.walkthrough?.written || undefined,
      videoWalkthroughUrl: sidecar.walkthrough?.video || undefined,
      source: sidecar.source || 'Local Sidecar',
      hasSidecar: true,
      scrapedAt: new Date().toISOString()
    };
    await saveCachedMetadata(id, metadata);
    addScraperLog(`📁 [LOCAL SIDECAR] Used local companion sidecar for "${game.title}" (Skipped online scraping)`, 'success', { gameId: id, title: game.title, systemKey: game.systemKey });
    return metadata;
  }

  // 3. Online Scraping (Only performed when NO local sidecar is available)
  addScraperLog(`🔍 Scraping assets for "${game.title}" [${game.systemName || game.systemKey}]...`, 'scan', { gameId: id, title: game.title, systemKey: game.systemKey });
  console.log(`🔍 [ONLINE SCRAPER] Querying assets for "${game.title}" (${game.systemName})...`);

  // Step 1: Query Primary Game Databases (Libretro, TheGamesDB, ScreenScraper)
  const coverUrl = await scrapeCoverArt(game);
  let details = await scrapeGameDetails(game);

  // Final resolved cover (Libretro Boxart -> TheGamesDB -> ScreenScraper -> Last Resort Wikipedia)
  const finalCoverUrl = coverUrl || details?.coverUrl || null;

  const metadata = {
    id,
    title: game.title,
    systemKey: game.systemKey,
    coverUrl: finalCoverUrl, // NEVER assign systemIcon SVG as coverUrl!
    hasCustomCover: !!finalCoverUrl,
    description: details?.description || `Experience ${game.title} on ${game.systemName}.`,
    releaseDate: details?.releaseDate || '2000-01-01',
    releaseYear: details?.releaseYear || '2000',
    developer: details?.developer || game.systemName || 'Classic',
    publisher: details?.publisher || game.systemName || 'Classic',
    genre: details?.genre || 'Retro Classic',
    source: details?.source || 'Online Scraper',
    scrapedAt: new Date().toISOString()
  };

  await saveCachedMetadata(id, metadata);
  addScraperLog(`✅ Saved metadata & art for "${game.title}" to database`, 'success', { gameId: id, title: game.title, systemKey: game.systemKey });
  return metadata;
}

/**
 * Automated Metadata & Cover Art Scraper Service
 * Connects directly to Libretro Thumbnails CDN and Open APIs (Wikipedia REST)
 * with IndexedDB caching and intelligent candidate matching.
 * Zero hardcoded game metadata in the repository.
 */

const DB_NAME = 'RetroPlayerMetadataDB';
const DB_VERSION = 3; // Bumped to 3 to invalidate old null cover cache
const STORE_NAME = 'game_metadata';

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

// Fetch metadata from server database (/api/db/game_metadata)
async function fetchServerMetadata() {
  try {
    const res = await fetch('/api/db/game_metadata');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data;
      }
    }
  } catch (_) {}
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
      }
    } catch (_) {}

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
async function saveCachedMetadata(id, data) {
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

    // 3. Persistent Server Database (/api/db/game_metadata)
    try {
      fetch('/api/db/game_metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: id, value: record })
      }).catch(() => {});
    } catch (_) {}

    return record;
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE SAVE] Error:', err);
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

  // 5. Region / Language / Flag variants for every base variant
  const regionTags = [
    '',
    ' (USA)',
    ' (USA, Europe)',
    ' (Europe)',
    ' (World)',
    ' (USA, Australia)',
    ' (USA) (En,Fr,Es)',
    ' (USA) (En,Fr,De,Es,It)',
    ' (USA, Europe) (En,Fr,De,Es,It)',
    ' (USA) (En,Es)',
    ' (USA) (Demo) (Kiosk)',
    ' (USA) (Demo)',
    ' (USA) (Proto)',
    ' (USA) (Rev 1)',
    ' (USA) (Rev A)',
    ' (USA) (Canceled)',
    ' (Japan, USA)',
    ' (Japan)'
  ];

  for (const base of baseSet) {
    for (const reg of regionTags) {
      candidates.push(formatLibretroName(`${base}${reg}`));
    }
  }

  return Array.from(new Set(candidates)).filter(Boolean);
}

/**
 * Test if an image exists and loads
 */
function probeImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Scrapes Official Box Art from Libretro Thumbnails CDN & GitHub Raw mirrors
 */
async function scrapeCoverArt(game) {
  const sysDir = LIBRETRO_SYSTEM_MAP[game.systemKey];
  if (!sysDir) return null;

  const candidates = generateThumbnailCandidates(game);
  const types = ['Named_Boxarts', 'Named_Snaps', 'Named_Titles'];
  const githubRepoName = sysDir.replace(/\s+/g, '_');

  for (const candidate of candidates) {
    const encodedCandidate = encodeURIComponent(candidate);

    for (const type of types) {
      // Endpoint 1: thumbnails.libretro.com CDN
      const cdnUrl = `https://thumbnails.libretro.com/${encodeURIComponent(sysDir)}/${type}/${encodedCandidate}.png`;
      // Endpoint 2: raw.githubusercontent.com
      const githubUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${githubRepoName}/master/${type}/${encodedCandidate}.png`;

      // Try CDN first
      const cdnWorks = await probeImageUrl(cdnUrl);
      if (cdnWorks) {
        console.log(`✨ [BOX ART FOUND] "${game.title}" -> ${cdnUrl}`);
        return cdnUrl;
      }

      // Try GitHub mirror
      const ghWorks = await probeImageUrl(githubUrl);
      if (ghWorks) {
        console.log(`✨ [BOX ART FOUND] "${game.title}" -> ${githubUrl}`);
        return githubUrl;
      }
    }
  }

  return null;
}

/**
 * Scrapes specific game metadata from Wikipedia Open REST APIs
 * Uses title matching to prevent generic franchise/series article false matches.
 */
async function scrapeGameDetails(game) {
  const cleanTitle = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  const systemName = game.systemName || '';

  try {
    // 1. Search Wikipedia specifically for the exact game title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`"${cleanTitle}" video game`)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const results = searchData.query?.search || [];

      // Filter out broad overview franchise pages (e.g. title is just "Pokémon" or "Super Mario")
      let targetResult = results.find(r => {
        const titleLower = r.title.toLowerCase();
        const cleanLower = cleanTitle.toLowerCase();
        // Skip general franchise pages or lists
        if (titleLower === 'pokémon' || titleLower === 'pokemon' || titleLower.startsWith('list of')) return false;
        // Match specific title tokens
        const tokens = cleanLower.split(/\s+/).filter(t => t.length > 2 && t !== 'version' && t !== 'the' && t !== 'game');
        return tokens.every(token => titleLower.includes(token));
      });

      // If no token match, take first non-generic result
      if (!targetResult) {
        targetResult = results.find(r => !['pokémon', 'pokemon'].includes(r.title.toLowerCase()) && !r.title.toLowerCase().startsWith('list of')) || results[0];
      }

      if (targetResult && targetResult.title) {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetResult.title)}`;
        const summaryRes = await fetch(summaryUrl);

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.extract && summaryData.type !== 'disambiguation') {
            // Find release year in extract
            const yearMatch = summaryData.extract.match(/\b(198\d|199\d|200\d|201\d|202\d)\b/);
            const releaseYear = yearMatch ? yearMatch[1] : null;

            return {
              description: summaryData.extract,
              releaseDate: releaseYear ? `${releaseYear}-01-01` : null,
              releaseYear: releaseYear || null,
              developer: summaryData.description || `${systemName} Classic`,
              publisher: systemName,
              genre: 'Retro Classic',
              source: 'Wikipedia'
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ [METADATA SCRAPER] Online fetch error for "${cleanTitle}":`, err);
  }

  // Dynamic fallback (NO hardcoded titles in app)
  return {
    description: `Experience the classic adventure of ${cleanTitle} for ${systemName}. Relive nostalgic challenges and timeless retro gameplay.`,
    releaseDate: null,
    releaseYear: null,
    developer: systemName,
    publisher: systemName,
    genre: 'Retro Classic',
    source: 'Dynamic Overview'
  };
}

/**
 * Main Scrape Method for a Single Game
 */
export async function scrapeGame(game, force = false) {
  if (!game) return null;
  const id = game.id || `${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (!force) {
    const cached = await getCachedMetadata(id);
    if (cached) {
      return cached;
    }
  }

  console.log(`🔍 [ONLINE SCRAPER] Querying assets for "${game.title}" (${game.systemName})...`);

  const [coverUrl, details] = await Promise.all([
    scrapeCoverArt(game),
    scrapeGameDetails(game)
  ]);

  const metadata = {
    id,
    title: game.title,
    systemKey: game.systemKey,
    coverUrl: coverUrl || null, // NEVER assign systemIcon SVG as coverUrl!
    hasCustomCover: !!coverUrl,
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
  return metadata;
}

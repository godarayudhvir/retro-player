/**
 * Automated Metadata & Cover Art Scraper Service
 * Connects directly to Libretro Thumbnails CDN and Open APIs (Wikipedia REST)
 * with IndexedDB caching and intelligent candidate matching.
 * Zero hardcoded game metadata in the repository.
 */

const DB_NAME = 'RetroPlayerMetadataDB';
const DB_VERSION = 2; // Bumped to 2 to invalidate previous bad cache
const STORE_NAME = 'game_metadata';

// Map internal system keys to Libretro Thumbnails repository system directory names
export const LIBRETRO_SYSTEM_MAP = {
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

// Get cached metadata from IndexedDB
export async function getCachedMetadata(id) {
  try {
    const db = await openDB();
    if (!db) {
      const local = localStorage.getItem(`rp_meta_${id}`);
      return local ? JSON.parse(local) : null;
    }
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const item = req.result;
        // Invalidate any legacy bad entries that saved console SVGs as coverUrl
        if (item && item.coverUrl && item.coverUrl.endsWith('.svg')) {
          item.coverUrl = null;
        }
        resolve(item || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE READ] Error:', err);
    return null;
  }
}

// Get all cached metadata
export async function getAllCachedMetadata() {
  try {
    const db = await openDB();
    if (!db) return {};
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const result = {};
        (req.result || []).forEach(item => {
          if (item && item.id) {
            if (item.coverUrl && item.coverUrl.endsWith('.svg')) {
              item.coverUrl = null;
            }
            result[item.id] = item;
          }
        });
        resolve(result);
      };
      req.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('⚠️ [METADATA CACHE GET ALL] Error:', err);
    return {};
  }
}

// Save metadata to IndexedDB & localStorage fallback
export async function saveCachedMetadata(id, data) {
  try {
    const record = { id, ...data, updatedAt: Date.now() };
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
    }
    try {
      localStorage.setItem(`rp_meta_${id}`, JSON.stringify(record));
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
export function formatLibretroName(str) {
  if (!str) return '';
  return str
    .replace(/[&:/\\*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate extensive candidate filenames for thumbnail scraping
 */
export function generateThumbnailCandidates(game) {
  const candidates = [];
  const raw = game.rawTitle || game.title || '';
  const fileNoExt = (game.filename || '').replace(/\.[^/.]+$/, '');
  const cleanDisplay = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

  // 1. Exact raw filename without extension
  if (fileNoExt) {
    candidates.push(formatLibretroName(fileNoExt));
    // Strip (Rev X), (v1.X), (NDSi Enhanced)
    const strippedRev = fileNoExt.replace(/\(Rev\s*\d+\)/i, '').replace(/\(v\d+.*?\)/i, '').replace(/\(NDSi Enhanced\)/i, '').replace(/\s+/g, ' ').trim();
    if (strippedRev !== fileNoExt) candidates.push(formatLibretroName(strippedRev));
  }

  // 2. Raw Title
  if (raw) {
    candidates.push(formatLibretroName(raw));
    const rawStripped = raw.replace(/\(Rev\s*\d+\)/i, '').replace(/\(v\d+.*?\)/i, '').replace(/\(NDSi Enhanced\)/i, '').replace(/\s+/g, ' ').trim();
    if (rawStripped !== raw) candidates.push(formatLibretroName(rawStripped));
  }

  // 3. Clean Display Title with standard regions
  if (cleanDisplay) {
    candidates.push(formatLibretroName(cleanDisplay));
    candidates.push(formatLibretroName(`${cleanDisplay} (USA, Europe)`));
    candidates.push(formatLibretroName(`${cleanDisplay} (USA)`));
    candidates.push(formatLibretroName(`${cleanDisplay} (Europe)`));
    candidates.push(formatLibretroName(`${cleanDisplay} (Japan)`));
    candidates.push(formatLibretroName(`${cleanDisplay} (World)`));

    // Also with hyphens / accents (e.g. Pokemon vs Pokémon)
    if (cleanDisplay.includes('Pokemon')) {
      const accented = cleanDisplay.replace(/Pokemon/g, 'Pokémon');
      candidates.push(formatLibretroName(accented));
      candidates.push(formatLibretroName(`${accented} (USA, Europe)`));
      candidates.push(formatLibretroName(`${accented} (USA)`));
      candidates.push(formatLibretroName(`${accented} (Europe)`));
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
export async function scrapeCoverArt(game) {
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
export async function scrapeGameDetails(game) {
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

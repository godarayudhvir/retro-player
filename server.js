import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ROMS_DIR = process.env.ROMS_DIR || path.join(__dirname, 'public/roms');
const BGM_DIR = process.env.BGM_DIR || path.join(__dirname, 'public/bgm');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'retroplayer_db.json');
const DIST_DIR = path.join(__dirname, 'dist');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// System definition mapping matching vite.config.js
const SYSTEM_MAP = {
  nes: { name: 'NES', core: 'nes', color: '#e63946', category: 'Console', icon: 'assets/platforms/nes.svg' },
  snes: { name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },
  gba: { name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: 'assets/platforms/gba.svg' },
  gbc: { name: 'Game Boy Color', core: 'gb', color: '#10b981', category: 'Handheld', icon: 'assets/platforms/gbc.svg' },
  gb: { name: 'Game Boy', core: 'gb', color: '#84cc16', category: 'Handheld', icon: 'assets/platforms/gb.svg' },
  n64: { name: 'Nintendo 64', core: 'n64', color: '#f59e0b', category: 'Console', icon: 'assets/platforms/n64.svg' },
  nds: { name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: 'assets/platforms/nds.svg' },
  genesis: { name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  megadrive: { name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  ps1: { name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },
  psx: { name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },
  arcade: { name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },
  gamegear: { name: 'Game Gear', core: 'segaGG', color: '#14b8a6', category: 'Handheld', icon: 'assets/platforms/gamegear.svg' },
  atari2600: { name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: 'assets/platforms/atari2600.svg' }
};

const EXTENSION_MAP = {
  '.nes': 'nes',
  '.snes': 'snes',
  '.smc': 'snes',
  '.sfc': 'snes',
  '.gba': 'gba',
  '.gbc': 'gbc',
  '.gb': 'gb',
  '.n64': 'n64',
  '.z64': 'n64',
  '.v64': 'n64',
  '.nds': 'nds',
  '.gen': 'genesis',
  '.iso': 'ps1',
  '.cue': 'ps1',
  '.chd': 'ps1'
};

const VALID_EXTENSIONS = ['.nes', '.snes', '.smc', '.sfc', '.gba', '.gbc', '.gb', '.n64', '.z64', '.v64', '.nds', '.gen', '.zip', '.iso', '.cue', '.chd', '.bin'];
const VALID_AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];

// Serve raw ROM binaries with CORS & octet-stream headers
app.use('/roms', (req, res, next) => {
  try {
    const relativePath = decodeURIComponent(req.url.split('?')[0]);
    const fullRomPath = path.join(ROMS_DIR, relativePath);

    if (fs.existsSync(fullRomPath) && fs.statSync(fullRomPath).isFile()) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const stream = fs.createReadStream(fullRomPath);
      stream.pipe(res);
      return;
    } else {
      console.warn(`[ROM SERVER WARN] ROM not found: ${fullRomPath}`);
    }
  } catch (e) {
    console.error('[ROM SERVER ERROR] Error serving ROM:', e);
  }
  next();
});

// Serve Background Music (BGM) audio files
app.use('/bgm', (req, res, next) => {
  try {
    const relativePath = decodeURIComponent(req.url.split('?')[0]);
    const fullBgmPath = path.join(BGM_DIR, relativePath);

    if (fs.existsSync(fullBgmPath) && fs.statSync(fullBgmPath).isFile()) {
      const ext = path.extname(fullBgmPath).toLowerCase();
      const mimeMap = {
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.flac': 'audio/flac',
        '.aac': 'audio/aac'
      };
      res.setHeader('Content-Type', mimeMap[ext] || 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Accept-Ranges', 'bytes');
      const stream = fs.createReadStream(fullBgmPath);
      stream.pipe(res);
      return;
    }
  } catch (e) {
    console.error('[BGM SERVER ERROR] Error serving BGM track:', e);
  }
  next();
});

// Dynamic BGM Scanning API endpoint
app.get('/api/bgm', (req, res) => {
  console.log(`[API BGM SCANNER] Scanning audio tracks in: ${BGM_DIR}`);
  const tracks = [];

  if (fs.existsSync(BGM_DIR)) {
    try {
      const entries = fs.readdirSync(BGM_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (VALID_AUDIO_EXTENSIONS.includes(ext)) {
            const rawTitle = path.parse(entry.name).name;
            const cleanTitle = rawTitle
              .replace(/[-_]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            tracks.push({
              id: `bgm-${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              title: cleanTitle.toUpperCase() || rawTitle,
              filename: entry.name,
              url: `/bgm/${encodeURIComponent(entry.name)}`
            });
          }
        }
      }
    } catch (e) {
      console.error('[API BGM ERROR] Failed reading BGM directory:', e);
    }
  }

  res.json({
    count: tracks.length,
    tracks: tracks.sort((a, b) => a.title.localeCompare(b.title))
  });
});

// Dynamic ROM Scanning API endpoint
app.get('/api/roms', (req, res) => {
  console.log(`[API SCANNER] Scanning ROMs in directory: ${ROMS_DIR}`);
  const games = [];

  function scanDirectory(dirPath, systemSubdir = '') {
    if (!fs.existsSync(dirPath)) {
      console.warn(`[API SCANNER WARN] ROM directory does not exist: ${dirPath}`);
      return;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;

        const fullPath = path.join(dirPath, entry.name);
        const currentSubdir = systemSubdir ? `${systemSubdir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scanDirectory(fullPath, currentSubdir);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          if (VALID_EXTENSIONS.includes(ext)) {
            const nameWithoutExt = path.parse(entry.name).name;
            const pathParts = systemSubdir.split('/');
            let systemKey = null;

            if (pathParts.length > 0 && SYSTEM_MAP[pathParts[0].toLowerCase()]) {
              systemKey = pathParts[0].toLowerCase();
            } else {
              systemKey = EXTENSION_MAP[ext] || 'nes';
            }

            const cleanDisplayTitle = nameWithoutExt
              .replace(/\(.*?\)/g, '')
              .replace(/\[.*?\]/g, '')
              .replace(/[-_]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            const systemInfo = SYSTEM_MAP[systemKey] || SYSTEM_MAP['nes'];

            games.push({
              id: `${systemKey}-${nameWithoutExt}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              title: cleanDisplayTitle || nameWithoutExt,
              rawTitle: nameWithoutExt,
              filename: entry.name,
              systemKey,
              systemName: systemInfo.name,
              systemCore: systemInfo.core,
              systemColor: systemInfo.color,
              systemIcon: systemInfo.icon,
              category: systemInfo.category,
              romUrl: `/roms/${systemSubdir ? `${systemSubdir}` : `${encodeURIComponent(entry.name)}`}`,
              coverUrl: null
            });
          }
        }
      }
    } catch (err) {
      console.error(`[API SCANNER ERROR] Error scanning ${dirPath}:`, err);
    }
  }

  scanDirectory(ROMS_DIR);
  res.json({
    count: games.length,
    games,
    systems: Object.keys(SYSTEM_MAP).map(key => ({
      key,
      ...SYSTEM_MAP[key],
      gameCount: games.filter(g => g.systemKey === key).length
    }))
  });
});

// Dynamic Local ROM File Upload Endpoint
app.post('/api/upload-rom', express.raw({ type: 'application/octet-stream', limit: '250mb' }), (req, res) => {
  try {
    const filenameHeader = req.headers['x-filename'];
    const systemKeyHeader = req.headers['x-system-key'];

    if (!filenameHeader || !req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'Missing required file data or x-filename header' });
    }

    const safeFilename = path.basename(decodeURIComponent(filenameHeader));
    const ext = path.extname(safeFilename).toLowerCase();

    let systemKey = (systemKeyHeader || '').toLowerCase();
    if (!systemKey || !SYSTEM_MAP[systemKey]) {
      systemKey = EXTENSION_MAP[ext] || 'nes';
    }

    const targetSystemDir = path.join(ROMS_DIR, systemKey);
    if (!fs.existsSync(targetSystemDir)) {
      fs.mkdirSync(targetSystemDir, { recursive: true });
    }

    const targetFilePath = path.join(targetSystemDir, safeFilename);
    console.log(`📥 [API UPLOADER] Saving ROM: ${safeFilename} to ${targetFilePath} (${req.body.length} bytes)`);

    const writeStream = fs.createWriteStream(targetFilePath);
    writeStream.write(req.body);
    writeStream.end();

    writeStream.on('finish', () => {
      console.log(`✅ [API UPLOADER SUCCESS] Successfully wrote: ${safeFilename}`);
      
      const systemInfo = SYSTEM_MAP[systemKey] || SYSTEM_MAP['nes'];
      const rawTitle = path.parse(safeFilename).name;
      const cleanDisplayTitle = rawTitle.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      const romUrl = `/roms/${systemKey}/${encodeURIComponent(safeFilename)}`;

      const gameRecord = {
        id: `${systemKey}-${rawTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: cleanDisplayTitle || rawTitle,
        rawTitle: rawTitle,
        filename: safeFilename,
        systemKey,
        systemName: systemInfo.name,
        systemCore: systemInfo.core,
        systemColor: systemInfo.color,
        systemIcon: systemInfo.icon,
        category: systemInfo.category,
        romUrl,
        coverUrl: null
      };

      res.status(200).json({ success: true, game: gameRecord });
    });

    writeStream.on('error', (err) => {
      console.error(`🚨 [API UPLOADER ERROR] Failed writing ROM file "${safeFilename}":`, err);
      res.status(500).json({ error: 'Failed to write ROM file to disk' });
    });
  } catch (err) {
    console.error('🚨 [API UPLOADER ERROR] Exception during upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Local BGM Track Upload Endpoint
app.post('/api/upload-bgm', express.raw({ type: 'application/octet-stream', limit: '100mb' }), (req, res) => {
  try {
    const filenameHeader = req.headers['x-filename'];

    if (!filenameHeader || !req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'Missing required audio data or x-filename header' });
    }

    const safeFilename = path.basename(decodeURIComponent(filenameHeader));
    const ext = path.extname(safeFilename).toLowerCase();

    if (!VALID_AUDIO_EXTENSIONS.includes(ext)) {
      return res.status(400).json({ error: `Unsupported audio format. Supported: ${VALID_AUDIO_EXTENSIONS.join(', ')}` });
    }

    if (!fs.existsSync(BGM_DIR)) {
      fs.mkdirSync(BGM_DIR, { recursive: true });
    }

    const targetFilePath = path.join(BGM_DIR, safeFilename);
    console.log(`🎵 [API BGM UPLOADER] Saving audio: ${safeFilename} to ${targetFilePath} (${req.body.length} bytes)`);

    const writeStream = fs.createWriteStream(targetFilePath);
    writeStream.write(req.body);
    writeStream.end();

    writeStream.on('finish', () => {
      console.log(`✅ [API BGM UPLOADER SUCCESS] Successfully saved track: ${safeFilename}`);
      const rawTitle = path.parse(safeFilename).name;
      const cleanTitle = rawTitle.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

      res.status(200).json({
        success: true,
        track: {
          id: `bgm-${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          title: cleanTitle.toUpperCase() || rawTitle,
          filename: safeFilename,
          url: `/bgm/${encodeURIComponent(safeFilename)}`
        }
      });
    });

    writeStream.on('error', (err) => {
      console.error(`🚨 [API BGM UPLOADER ERROR] Failed writing audio file "${safeFilename}":`, err);
      res.status(500).json({ error: 'Failed to write audio track to disk' });
    });
  } catch (err) {
    console.error('🚨 [API BGM UPLOADER ERROR] Exception during upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete ROM endpoint
app.post('/api/delete-rom', express.json(), (req, res) => {
  try {
    const { systemKey, filename, relativePath } = req.body || {};
    let targetPath = null;

    if (relativePath) {
      const decodedRel = decodeURIComponent(relativePath);
      const candidate = path.join(ROMS_DIR, decodedRel);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        targetPath = candidate;
      }
    }

    if (!targetPath && systemKey && filename) {
      const decodedName = decodeURIComponent(filename);
      const candidate = path.join(ROMS_DIR, systemKey, path.basename(decodedName));
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        targetPath = candidate;
      }
    }

    if (!targetPath && filename) {
      const decodedName = decodeURIComponent(filename);
      const candidate = path.join(ROMS_DIR, path.basename(decodedName));
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        targetPath = candidate;
      }
    }

    // Fallback: Recursively search for matching filename in ROMS_DIR
    if (!targetPath && filename) {
      const safeTargetName = path.basename(decodeURIComponent(filename)).toLowerCase();
      function findFile(dir) {
        if (!fs.existsSync(dir)) return null;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const found = findFile(full);
            if (found) return found;
          } else if (entry.isFile() && entry.name.toLowerCase() === safeTargetName) {
            return full;
          }
        }
        return null;
      }
      targetPath = findFile(ROMS_DIR);
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      console.warn(`[ROM DELETE WARN] File not found: ${filename || relativePath} in ${ROMS_DIR}`);
      return res.status(404).json({ error: 'ROM file not found on disk' });
    }

    fs.unlinkSync(targetPath);
    console.log(`🗑️ [API ROM DELETE] Successfully deleted ROM: ${targetPath}`);
    res.json({ success: true, message: 'ROM deleted successfully' });
  } catch (err) {
    console.error('🚨 [API ROM DELETE ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete BGM track endpoint
app.post('/api/delete-bgm', express.json(), (req, res) => {
  try {
    const { filename } = req.body || {};
    if (!filename) {
      return res.status(400).json({ error: 'Missing filename parameter' });
    }

    const safeFilename = path.basename(filename);
    const targetPath = path.join(BGM_DIR, safeFilename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Audio track not found on disk' });
    }

    fs.unlinkSync(targetPath);
    console.log(`🗑️ [API BGM DELETE] Successfully deleted track: ${targetPath}`);
    res.json({ success: true, message: 'Audio track deleted successfully' });
  } catch (err) {
    console.error('🚨 [API BGM DELETE ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});

// Database Persistence Engine (JSON Document Store on Server Disk)
function readServerDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data || '{}');
    }
  } catch (err) {
    console.error('🚨 [SERVER DB READ ERROR]:', err);
  }
  return { profiles: [], user_data: {}, app_settings: {}, game_saves: {}, save_states: {} };
}

function writeServerDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('🚨 [SERVER DB WRITE ERROR]:', err);
    return false;
  }
}

// 1. GET all records in a store
app.get('/api/db/:store', (req, res) => {
  const store = req.params.store;
  const db = readServerDB();
  const storeData = db[store] || (store === 'profiles' ? [] : {});
  res.json({ success: true, store, data: storeData });
});

// 2. GET single record in a store
app.get('/api/db/:store/:key', (req, res) => {
  const { store, key } = req.params;
  const db = readServerDB();
  const storeData = db[store] || (store === 'profiles' ? [] : {});

  let result = null;
  if (Array.isArray(storeData)) {
    result = storeData.find(item => item.id === key) || null;
  } else {
    result = storeData[key] || null;
  }

  res.json({ success: true, store, key, data: result });
});

// 3. POST / PUT single record in a store
app.post('/api/db/:store', express.json({ limit: '50mb' }), (req, res) => {
  const store = req.params.store;
  const { key, id, value } = req.body || {};
  const effectiveKey = key || id;

  if (!effectiveKey) {
    return res.status(400).json({ error: 'Missing required key or id field in body' });
  }

  const db = readServerDB();
  if (!db[store]) {
    db[store] = (store === 'profiles' ? [] : {});
  }

  const recordValue = value !== undefined ? value : req.body;

  if (Array.isArray(db[store])) {
    const idx = db[store].findIndex(item => item.id === effectiveKey);
    const itemToSave = typeof recordValue === 'object' && recordValue !== null ? { ...recordValue, id: effectiveKey } : { id: effectiveKey, value: recordValue };
    if (idx >= 0) {
      db[store][idx] = itemToSave;
    } else {
      db[store].push(itemToSave);
    }
  } else {
    db[store][effectiveKey] = recordValue;
  }

  writeServerDB(db);
  console.log(`💾 [SERVER DB SAVED] Store: "${store}" | Key: "${effectiveKey}"`);
  res.json({ success: true, store, key: effectiveKey });
});

// 4. DELETE record in a store
app.delete('/api/db/:store/:key', (req, res) => {
  const { store, key } = req.params;
  const db = readServerDB();

  if (db[store]) {
    if (Array.isArray(db[store])) {
      db[store] = db[store].filter(item => item.id !== key);
    } else {
      delete db[store][key];
    }
    writeServerDB(db);
    console.log(`🗑️ [SERVER DB DELETED] Store: "${store}" | Key: "${key}"`);
  }

  res.json({ success: true, store, key });
});

// Serve static frontend build
app.use(express.static(DIST_DIR));

// Fallback to index.html for SPA client routing (Express v5 compatible)
app.use((req, res) => {
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Application build not found. Please run `npm run build` first.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [RETRO PLAYER SERVER] Running at http://0.0.0.0:${PORT}`);
  console.log(`📂 [ROMS DIRECTORY] ${ROMS_DIR}`);
  console.log(`🎵 [BGM DIRECTORY] ${BGM_DIR}`);
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Supported System Mappings with RomM SVG icon references
const SYSTEM_MAP = {
  nes: { name: 'NES', core: 'nes', color: '#e63946', category: 'Console', icon: '/assets/platforms/nes.svg' },
  snes: { name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: '/assets/platforms/snes.svg' },
  gba: { name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: '/assets/platforms/gba.svg' },
  gbc: { name: 'Game Boy Color', core: 'gb', color: '#10b981', category: 'Handheld', icon: '/assets/platforms/gbc.svg' },
  gb: { name: 'Game Boy', core: 'gb', color: '#84cc16', category: 'Handheld', icon: '/assets/platforms/gb.svg' },
  n64: { name: 'Nintendo 64', core: 'n64', color: '#f59e0b', category: 'Console', icon: '/assets/platforms/n64.svg' },
  nds: { name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: '/assets/platforms/nds.svg' },
  genesis: { name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: '/assets/platforms/genesis.svg' },
  megadrive: { name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: '/assets/platforms/genesis.svg' },
  ps1: { name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: '/assets/platforms/psx.svg' },
  psx: { name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: '/assets/platforms/psx.svg' },
  arcade: { name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: '/assets/platforms/arcade.svg' },
  gamegear: { name: 'Game Gear', core: 'segaGG', color: '#14b8a6', category: 'Handheld', icon: '/assets/platforms/gamegear.svg' },
  atari2600: { name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: '/assets/platforms/atari2600.svg' }
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


function getBgmManifest(bgmBaseDir, validAudioExts) {
  const tracks = [];
  if (fs.existsSync(bgmBaseDir)) {
    try {
      const entries = fs.readdirSync(bgmBaseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (validAudioExts.includes(ext)) {
            const rawTitle = path.parse(entry.name).name;
            const cleanTitle = rawTitle.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
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
  return {
    count: tracks.length,
    tracks: tracks.sort((a, b) => a.title.localeCompare(b.title))
  };
}

function getRomsManifest(romsBaseDir) {
  const games = [];

  function scanDirectory(dirPath, systemSubdir = '') {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry.name);
      const currentSubdir = systemSubdir ? `${systemSubdir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        scanDirectory(fullPath, currentSubdir);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const validExts = ['.nes', '.snes', '.smc', '.sfc', '.gba', '.gbc', '.gb', '.n64', '.z64', '.v64', '.nds', '.gen', '.zip', '.iso', '.cue', '.chd', '.bin'];

        if (validExts.includes(ext)) {
          const nameWithoutExt = path.parse(entry.name).name;
          const pathParts = systemSubdir.split('/');
          const topFolderKey = pathParts[0].toLowerCase();
          const parentFolderKey = pathParts.length > 1 ? pathParts[pathParts.length - 1] : '';

          const extSystemKey = EXTENSION_MAP[ext];
          const systemKey = SYSTEM_MAP[topFolderKey] ? topFolderKey : (extSystemKey || 'nes');
          const systemInfo = SYSTEM_MAP[systemKey] || SYSTEM_MAP['nes'];

          const pathSegments = currentSubdir.split('/').map(segment => encodeURIComponent(segment));
          const romUrl = `/roms/${pathSegments.join('/')}`;

          const rawTitle = (nameWithoutExt.toLowerCase() === 'game' || nameWithoutExt.toLowerCase() === 'rom') && parentFolderKey
            ? parentFolderKey
            : nameWithoutExt;

          const cleanDisplayTitle = rawTitle.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

          games.push({
            id: `${systemKey}-${rawTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            title: cleanDisplayTitle || rawTitle,
            rawTitle: rawTitle,
            filename: entry.name,
            systemKey,
            systemName: systemInfo.name,
            systemCore: systemInfo.core,
            systemColor: systemInfo.color,
            systemIcon: systemInfo.icon,
            category: systemInfo.category,
            romUrl,
            coverUrl: null,
          });
        }
      }
    }
  }

  scanDirectory(romsBaseDir);

  return {
    games,
    systems: Object.keys(SYSTEM_MAP).map(key => ({
      key,
      ...SYSTEM_MAP[key],
      gameCount: games.filter(g => g.systemKey === key).length
    }))
  };
}

function multiConsoleScannerPlugin() {
  const romsBaseDir = process.env.ROMS_DIR ? path.resolve(process.env.ROMS_DIR) : path.resolve(process.cwd(), 'public/roms');
  const bgmBaseDir = process.env.BGM_DIR ? path.resolve(process.env.BGM_DIR) : path.resolve(process.cwd(), 'public/bgm');
  const validAudioExts = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];

  return {
    name: 'multi-console-scanner-plugin',
    generateBundle() {
      // Emit static JSON files for /api/roms and /api/bgm so static hosts (GitHub Pages) serve catalog seamlessly
      const romsData = getRomsManifest(romsBaseDir);
      this.emitFile({
        type: 'asset',
        fileName: 'api/roms',
        source: JSON.stringify(romsData)
      });
      this.emitFile({
        type: 'asset',
        fileName: 'api/roms.json',
        source: JSON.stringify(romsData)
      });

      const bgmData = getBgmManifest(bgmBaseDir, validAudioExts);
      this.emitFile({
        type: 'asset',
        fileName: 'api/bgm',
        source: JSON.stringify(bgmData)
      });
      this.emitFile({
        type: 'asset',
        fileName: 'api/bgm.json',
        source: JSON.stringify(bgmData)
      });
    },
    configureServer(server) {
      // Direct raw binary static file handler for /roms/ files
      server.middlewares.use('/roms', (req, res, next) => {
        try {
          const relativePath = decodeURIComponent(req.url.split('?')[0]);
          const fullRomPath = path.join(romsBaseDir, relativePath);

          if (fs.existsSync(fullRomPath) && fs.statSync(fullRomPath).isFile()) {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = fs.createReadStream(fullRomPath);
            stream.pipe(res);
            return;
          } else {
            console.warn(`[ROM SERVER WARN] ROM file not found at path: ${fullRomPath}`);
          }
        } catch (e) {
          console.error('[ROM SERVER ERROR] Failed serving ROM:', e);
        }
        next();
      });

      // Direct static file handler for /bgm/ files
      server.middlewares.use('/bgm', (req, res, next) => {
        try {
          const relativePath = decodeURIComponent(req.url.split('?')[0]);
          const fullBgmPath = path.join(bgmBaseDir, relativePath);

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
          console.error('[BGM SERVER ERROR] Failed serving BGM track:', e);
        }
        next();
      });

      // API Endpoint for BGM list
      server.middlewares.use('/api/bgm', (req, res) => {
        const bgmData = getBgmManifest(bgmBaseDir, validAudioExts);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(bgmData));
      });

      // API Endpoint for ROM list
      server.middlewares.use('/api/roms', (req, res) => {
        const romsData = getRomsManifest(romsBaseDir);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(romsData));
      });

      // API Endpoint for Uploading ROMs in development
      server.middlewares.use('/api/upload-rom', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const filename = decodeURIComponent(req.headers['x-filename'] || '');
        if (!filename) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing x-filename header' }));
          return;
        }

        const ext = path.extname(filename).toLowerCase();
        const systemKey = EXTENSION_MAP[ext] || 'nes';
        const targetDir = path.join(romsBaseDir, systemKey);

        try {
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const safeFilename = path.basename(filename);
          const targetFilePath = path.join(targetDir, safeFilename);

          console.log(`📥 [DEV UPLOADER] Receiving ROM "${safeFilename}" -> Saving to: ${targetFilePath}`);

          const writeStream = fs.createWriteStream(targetFilePath);

          req.pipe(writeStream);

          writeStream.on('finish', () => {
            console.log(`✅ [DEV UPLOADER SUCCESS] Successfully saved "${safeFilename}" to ${targetDir}`);
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

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, game: gameRecord }));
          });

          writeStream.on('error', (err) => {
            console.error(`🚨 [DEV UPLOADER ERROR] Failed writing ROM file "${safeFilename}":`, err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to write ROM file to disk' }));
          });
        } catch (err) {
          console.error('🚨 [DEV UPLOADER ERROR] Exception during upload:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // API Endpoint for Uploading BGM Audio in development
      server.middlewares.use('/api/upload-bgm', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const filename = decodeURIComponent(req.headers['x-filename'] || '');
        if (!filename) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing x-filename header' }));
          return;
        }

        try {
          if (!fs.existsSync(bgmBaseDir)) {
            fs.mkdirSync(bgmBaseDir, { recursive: true });
          }

          const safeFilename = path.basename(filename);
          const targetFilePath = path.join(bgmBaseDir, safeFilename);

          console.log(`🎵 [DEV BGM UPLOADER] Receiving audio "${safeFilename}" -> Saving to: ${targetFilePath}`);

          const writeStream = fs.createWriteStream(targetFilePath);
          req.pipe(writeStream);

          writeStream.on('finish', () => {
            console.log(`✅ [DEV BGM UPLOADER SUCCESS] Successfully saved "${safeFilename}"`);
            const rawTitle = path.parse(safeFilename).name;
            const cleanTitle = rawTitle.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              track: {
                id: `bgm-${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                title: cleanTitle.toUpperCase() || rawTitle,
                filename: safeFilename,
                url: `/bgm/${encodeURIComponent(safeFilename)}`
              }
            }));
          });

          writeStream.on('error', (err) => {
            console.error(`🚨 [DEV BGM UPLOADER ERROR] Failed writing audio file "${safeFilename}":`, err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to write audio file to disk' }));
          });
        } catch (err) {
          console.error('🚨 [DEV BGM UPLOADER ERROR] Exception during upload:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // API Endpoint for Deleting ROMs in development
      server.middlewares.use('/api/delete-rom', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const { systemKey, filename, relativePath } = data;
            let targetPath = null;

            if (relativePath) {
              const decodedRel = decodeURIComponent(relativePath);
              const candidate = path.join(romsBaseDir, decodedRel);
              if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                targetPath = candidate;
              }
            }

            if (!targetPath && systemKey && filename) {
              const decodedName = decodeURIComponent(filename);
              const candidate = path.join(romsBaseDir, systemKey, path.basename(decodedName));
              if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                targetPath = candidate;
              }
            }

            if (!targetPath && filename) {
              const decodedName = decodeURIComponent(filename);
              const candidate = path.join(romsBaseDir, path.basename(decodedName));
              if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                targetPath = candidate;
              }
            }

            // Fallback: Recursively search for matching filename in romsBaseDir
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
              targetPath = findFile(romsBaseDir);
            }

            if (!targetPath || !fs.existsSync(targetPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'ROM file not found on disk' }));
              return;
            }

            fs.unlinkSync(targetPath);
            console.log(`🗑️ [DEV ROM DELETE] Deleted ROM: ${targetPath}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'ROM deleted successfully' }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // API Endpoint for Deleting BGM in development
      server.middlewares.use('/api/delete-bgm', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const { filename } = data;

            if (!filename) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing filename' }));
              return;
            }

            const targetPath = path.join(bgmBaseDir, path.basename(filename));

            if (!fs.existsSync(targetPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Audio track not found on disk' }));
              return;
            }

            fs.unlinkSync(targetPath);
            console.log(`🗑️ [DEV BGM DELETE] Deleted track: ${targetPath}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Audio track deleted successfully' }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // API Database Persistence Engine in Development
      const dataBaseDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), 'data');
      const dbFilePath = path.join(dataBaseDir, 'retroplayer_db.json');
      if (!fs.existsSync(dataBaseDir)) {
        fs.mkdirSync(dataBaseDir, { recursive: true });
      }

      function readDevDB() {
        try {
          if (fs.existsSync(dbFilePath)) {
            const data = fs.readFileSync(dbFilePath, 'utf-8');
            return JSON.parse(data || '{}');
          }
        } catch (err) {
          console.error('🚨 [DEV DB READ ERROR]:', err);
        }
        return { profiles: [], user_data: {}, app_settings: {}, game_saves: {}, save_states: {} };
      }

      function writeDevDB(db) {
        try {
          fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
          return true;
        } catch (err) {
          console.error('🚨 [DEV DB WRITE ERROR]:', err);
          return false;
        }
      }

      server.middlewares.use('/api/db', (req, res) => {
        const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
        const store = urlParts[0];
        const key = urlParts[1];

        if (!store) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing store name' }));
          return;
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const db = readDevDB();
          const storeData = db[store] || (store === 'profiles' ? [] : {});
          if (key) {
            let result = null;
            if (Array.isArray(storeData)) {
              result = storeData.find(item => item.id === key) || null;
            } else {
              result = storeData[key] || null;
            }
            res.end(JSON.stringify({ success: true, store, key, data: result }));
          } else {
            res.end(JSON.stringify({ success: true, store, data: storeData }));
          }
          return;
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { key: reqKey, id: reqId, value } = payload;
              const effectiveKey = key || reqKey || reqId;

              if (!effectiveKey) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing key or id' }));
                return;
              }

              const db = readDevDB();
              if (!db[store]) {
                db[store] = (store === 'profiles' ? [] : {});
              }

              const recordValue = value !== undefined ? value : payload;

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

              writeDevDB(db);
              console.log(`💾 [DEV DB SAVED] Store: "${store}" | Key: "${effectiveKey}"`);
              res.end(JSON.stringify({ success: true, store, key: effectiveKey }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          if (!key) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing key to delete' }));
            return;
          }
          const db = readDevDB();
          if (db[store]) {
            if (Array.isArray(db[store])) {
              db[store] = db[store].filter(item => item.id !== key);
            } else {
              delete db[store][key];
            }
            writeDevDB(db);
            console.log(`🗑️ [DEV DB DELETED] Store: "${store}" | Key: "${key}"`);
          }
          res.end(JSON.stringify({ success: true, store, key }));
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), multiConsoleScannerPlugin()],
  server: {
    port: 3000,
    open: true
  }
});

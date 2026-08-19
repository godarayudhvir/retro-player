import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ROMS_DIR = process.env.ROMS_DIR || path.join(__dirname, 'public/roms');
const DIST_DIR = path.join(__dirname, 'dist');

// System definition mapping matching vite.config.js
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

const VALID_EXTENSIONS = ['.nes', '.snes', '.smc', '.sfc', '.gba', '.gbc', '.gb', '.n64', '.z64', '.v64', '.nds', '.gen', '.zip', '.iso', '.cue', '.chd', '.bin'];

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
              coverUrl: null
            });
          }
        }
      }
    } catch (err) {
      console.error(`[API SCANNER ERROR] Error reading directory ${dirPath}:`, err);
    }
  }

  scanDirectory(ROMS_DIR);
  console.log(`[API SCANNER COMPLETED] Total games indexed: ${games.length}`);

  res.setHeader('Content-Type', 'application/json');
  res.json({
    games,
    systems: Object.keys(SYSTEM_MAP).map(key => ({
      key,
      ...SYSTEM_MAP[key],
      gameCount: games.filter(g => g.systemKey === key).length
    }))
  });
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
});

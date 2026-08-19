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


function multiConsoleScannerPlugin() {
  const romsBaseDir = process.env.ROMS_DIR ? path.resolve(process.env.ROMS_DIR) : path.resolve(process.cwd(), 'public/roms');

  return {
    name: 'multi-console-scanner-plugin',
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

      // API Endpoint for ROM list
      server.middlewares.use('/api/roms', (req, res) => {
        console.log(`[API SCANNER] Running full directory scan on ${romsBaseDir}...`);
        const games = [];

        function scanDirectory(dirPath, systemSubdir = '') {
          if (!fs.existsSync(dirPath)) {
            console.warn(`[API SCANNER WARN] ROM directory does not exist: ${dirPath}`);
            return;
          }

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
                  coverUrl: null, // Scraped dynamically by metadataScraper service
                });
              }
            }
          }
        }

        scanDirectory(romsBaseDir);
        console.log(`[API SCANNER COMPLETED] Total games indexed: ${games.length}`);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          games,
          systems: Object.keys(SYSTEM_MAP).map(key => ({
            key,
            ...SYSTEM_MAP[key],
            gameCount: games.filter(g => g.systemKey === key).length
          }))
        }));
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
    }
  };
}

export default defineConfig({
  plugins: [react(), multiConsoleScannerPlugin()],
  server: {
    port: 3000,
    open: true
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Supported System Mappings with RomM SVG icon references
const SYSTEM_MAP = {
  nes: { name: 'NES', core: 'nes', color: '#e63946', category: 'Console', icon: '/assets/platforms/nes.svg' },
  snes: { name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: '/assets/platforms/snes.svg' },
  gba: { name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: '/assets/platforms/gba.svg' },
  gbc: { name: 'Game Boy Color', core: 'gbc', color: '#10b981', category: 'Handheld', icon: '/assets/platforms/gbc.svg' },
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
  '.md': 'genesis',
  '.gen': 'genesis',
  '.iso': 'ps1',
  '.cue': 'ps1',
  '.chd': 'ps1'
};

function cleanStringForMatching(str) {
  return str.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function multiConsoleScannerPlugin() {
  return {
    name: 'multi-console-scanner-plugin',
    configureServer(server) {
      // Direct raw binary static file handler for /roms/ files
      server.middlewares.use('/roms', (req, res, next) => {
        try {
          const relativePath = decodeURIComponent(req.url.split('?')[0]);
          const fullRomPath = path.join(process.cwd(), 'public/roms', relativePath);

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

      // Direct image file handler for /assets/cover/ files
      server.middlewares.use('/assets/cover', (req, res, next) => {
        try {
          const relativePath = decodeURIComponent(req.url.split('?')[0]);
          const fullCoverPath = path.join(process.cwd(), 'public/assets/cover', relativePath);

          if (fs.existsSync(fullCoverPath) && fs.statSync(fullCoverPath).isFile()) {
            const ext = path.extname(fullCoverPath).toLowerCase();
            const mimeTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'image/png');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = fs.createReadStream(fullCoverPath);
            stream.pipe(res);
            return;
          } else {
            console.warn(`[COVER SERVER WARN] Cover image not found at path: ${fullCoverPath}`);
          }
        } catch (e) {
          console.error('[COVER SERVER ERROR] Failed serving Cover:', e);
        }
        next();
      });

      // Direct image file handler for /cover/ files
      server.middlewares.use('/cover', (req, res, next) => {
        try {
          const relativePath = decodeURIComponent(req.url.split('?')[0]);
          const fullCoverPath = path.join(process.cwd(), 'public/cover', relativePath);

          if (fs.existsSync(fullCoverPath) && fs.statSync(fullCoverPath).isFile()) {
            const ext = path.extname(fullCoverPath).toLowerCase();
            const mimeTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'image/png');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = fs.createReadStream(fullCoverPath);
            stream.pipe(res);
            return;
          } else {
            console.warn(`[COVER SERVER WARN] Cover image not found at path: ${fullCoverPath}`);
          }
        } catch (e) {
          console.error('[COVER SERVER ERROR] Failed serving Cover:', e);
        }
        next();
      });

      // API Endpoint for ROM list
      server.middlewares.use('/api/roms', (req, res) => {
        console.log('[API SCANNER] Running full directory scan on /public/roms...');
        const romsBaseDir = path.resolve(process.cwd(), 'public/roms');
        
        const coverBaseDirs = [
          path.resolve(process.cwd(), 'public/assets/cover'),
          path.resolve(process.cwd(), 'public/cover')
        ];

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
              const validExts = ['.nes', '.snes', '.smc', '.sfc', '.gba', '.gbc', '.gb', '.n64', '.z64', '.v64', '.nds', '.md', '.gen', '.zip', '.iso', '.cue', '.chd', '.bin'];
              
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

                let matchedCoverUrl = null;

                const romClean = cleanStringForMatching(nameWithoutExt);
                const parentClean = cleanStringForMatching(parentFolderKey);

                // Fuzzy match local cover images
                for (const coverBaseDir of coverBaseDirs) {
                  if (matchedCoverUrl) break;

                  const potentialCoverDirs = [
                    path.join(coverBaseDir, systemSubdir),
                    path.join(coverBaseDir, topFolderKey, parentFolderKey),
                    path.join(coverBaseDir, topFolderKey),
                    coverBaseDir
                  ];

                  for (const cDir of potentialCoverDirs) {
                    if (fs.existsSync(cDir)) {
                      const coverFiles = fs.readdirSync(cDir).filter(f => !f.startsWith('.') && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(f));
                      
                      // Find exact match first, then parent match, then partial match
                      const exactFound = coverFiles.find(c => cleanStringForMatching(path.parse(c).name) === romClean);
                      const parentFound = !exactFound && parentClean ? coverFiles.find(c => cleanStringForMatching(path.parse(c).name) === parentClean) : null;
                      const partialFound = !exactFound && !parentFound ? coverFiles.find(c => {
                        const coverClean = cleanStringForMatching(path.parse(c).name);
                        return (romClean.length > 4 && coverClean.includes(romClean)) ||
                               (romClean.length > 4 && romClean.includes(coverClean));
                      }) : null;

                      const found = exactFound || parentFound || partialFound;

                      if (found) {
                        const isAssetsCover = coverBaseDir.includes('assets');
                        const prefix = isAssetsCover ? '/assets/cover/' : '/cover/';
                        const relCoverDir = path.relative(coverBaseDir, path.join(cDir, found));
                        const relCoverSegments = relCoverDir.split('/').map(segment => encodeURIComponent(segment));
                        matchedCoverUrl = `${prefix}${relCoverSegments.join('/')}`;
                        break;
                      }
                    }
                  }
                }

                if (!matchedCoverUrl) {
                  console.warn(`[COVER MATCH MISS] No local cover artwork found for game: "${entry.name}" (System: ${systemKey})`);
                } else {
                  console.log(`[COVER MATCH SUCCESS] Game "${entry.name}" -> ${matchedCoverUrl}`);
                }

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
                  coverUrl: matchedCoverUrl,
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

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Supported System Mappings with RomM SVG icon references
const SYSTEM_MAP = {
  // NES
  nes: { key: 'nes', name: 'NES', core: 'nes', color: '#e63946', category: 'Console', icon: 'assets/platforms/nes.svg' },
  famicom: { key: 'nes', name: 'NES', core: 'nes', color: '#e63946', category: 'Console', icon: 'assets/platforms/nes.svg' },

  // SNES
  snes: { key: 'snes', name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },
  super_nintendo: { key: 'snes', name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },
  supernintendo: { key: 'snes', name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },
  sfc: { key: 'snes', name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },
  super_famicom: { key: 'snes', name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },

  // GBA
  gba: { key: 'gba', name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: 'assets/platforms/gba.svg' },
  gameboyadvance: { key: 'gba', name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: 'assets/platforms/gba.svg' },
  game_boy_advance: { key: 'gba', name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: 'assets/platforms/gba.svg' },

  // GBC
  gbc: { key: 'gbc', name: 'Game Boy Color', core: 'gb', color: '#10b981', category: 'Handheld', icon: 'assets/platforms/gbc.svg' },
  gameboycolor: { key: 'gbc', name: 'Game Boy Color', core: 'gb', color: '#10b981', category: 'Handheld', icon: 'assets/platforms/gbc.svg' },
  game_boy_color: { key: 'gbc', name: 'Game Boy Color', core: 'gb', color: '#10b981', category: 'Handheld', icon: 'assets/platforms/gbc.svg' },

  // GB
  gb: { key: 'gb', name: 'Game Boy', core: 'gb', color: '#84cc16', category: 'Handheld', icon: 'assets/platforms/gb.svg' },
  gameboy: { key: 'gb', name: 'Game Boy', core: 'gb', color: '#84cc16', category: 'Handheld', icon: 'assets/platforms/gb.svg' },
  game_boy: { key: 'gb', name: 'Game Boy', core: 'gb', color: '#84cc16', category: 'Handheld', icon: 'assets/platforms/gb.svg' },

  // N64
  n64: { key: 'n64', name: 'Nintendo 64', core: 'n64', color: '#f59e0b', category: 'Console', icon: 'assets/platforms/n64.svg' },
  nintendo64: { key: 'n64', name: 'Nintendo 64', core: 'n64', color: '#f59e0b', category: 'Console', icon: 'assets/platforms/n64.svg' },
  nintendo_64: { key: 'n64', name: 'Nintendo 64', core: 'n64', color: '#f59e0b', category: 'Console', icon: 'assets/platforms/n64.svg' },

  // NDS
  nds: { key: 'nds', name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: 'assets/platforms/nds.svg' },
  nintendods: { key: 'nds', name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: 'assets/platforms/nds.svg' },
  nintendo_ds: { key: 'nds', name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: 'assets/platforms/nds.svg' },
  ds: { key: 'nds', name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: 'assets/platforms/nds.svg' },

  // Sega Genesis / Mega Drive
  genesis: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  sega_genesis: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  segagenesis: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  megadrive: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  mega_drive: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  sega: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
  md: { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },

  // PlayStation
  ps1: { key: 'ps1', name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },
  playstation: { key: 'ps1', name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },
  psx: { key: 'ps1', name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },
  ps: { key: 'ps1', name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },

  // Arcade
  arcade: { key: 'arcade', name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },
  mame: { key: 'arcade', name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },
  neogeo: { key: 'arcade', name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },
  fbalpha: { key: 'arcade', name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },
  fbneo: { key: 'arcade', name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },

  // Game Gear
  gamegear: { key: 'gamegear', name: 'Game Gear', core: 'segaGG', color: '#14b8a6', category: 'Handheld', icon: 'assets/platforms/gamegear.svg' },
  game_gear: { key: 'gamegear', name: 'Game Gear', core: 'segaGG', color: '#14b8a6', category: 'Handheld', icon: 'assets/platforms/gamegear.svg' },
  gg: { key: 'gamegear', name: 'Game Gear', core: 'segaGG', color: '#14b8a6', category: 'Handheld', icon: 'assets/platforms/gamegear.svg' },

  // Atari 2600
  atari2600: { key: 'atari2600', name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: 'assets/platforms/atari2600.svg' },
  atari_2600: { key: 'atari2600', name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: 'assets/platforms/atari2600.svg' },
  atari: { key: 'atari2600', name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: 'assets/platforms/atari2600.svg' },
  a2600: { key: 'atari2600', name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: 'assets/platforms/atari2600.svg' }
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
  '.md': 'genesis',
  '.smd': 'genesis',
  '.gg': 'gamegear',
  '.iso': 'ps1',
  '.cue': 'ps1',
  '.chd': 'ps1',
  '.pbp': 'ps1',
  '.bin': 'ps1',
  '.a26': 'atari2600',
  '.7z': 'atari2600',
  '.zip': 'arcade'
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

function parseCompanionMetadata(dirPath, baseName, entries) {
  const nfoCandidates = [
    `${baseName}.nfo`,
    `${baseName}.xml`,
    'game.nfo',
    'metadata.nfo'
  ];
  const jsonCandidates = [
    `${baseName}.json`,
    'game.json',
    'metadata.json'
  ];

  const entryNames = new Set(entries.map(e => e.name));

  for (const nfoName of nfoCandidates) {
    if (entryNames.has(nfoName)) {
      try {
        const content = fs.readFileSync(path.join(dirPath, nfoName), 'utf-8');
        const getTag = (tag) => {
          const match = content.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
          return match ? match[1].trim() : null;
        };
        const title = getTag('title') || getTag('name');
        const description = getTag('plot') || getTag('description') || getTag('overview') || getTag('synopsis');
        const year = getTag('year') || (getTag('releasedate') ? getTag('releasedate').split('-')[0] : null);
        const developer = getTag('developer') || getTag('dev');
        const publisher = getTag('publisher') || getTag('pub');
        const genre = getTag('genre') || getTag('category');
        const cover = getTag('cover') || getTag('image') || getTag('boxart');

        if (title || description || year || developer || publisher || genre || cover) {
          return {
            title: title || null,
            description: description || null,
            releaseYear: year || null,
            developer: developer || null,
            publisher: publisher || null,
            genre: genre || null,
            cover: cover || null,
            source: 'Local Sidecar (NFO)'
          };
        }
      } catch (err) {
        console.warn(`[SIDECAR WARN] Failed parsing NFO ${nfoName}:`, err.message);
      }
    }
  }

  for (const jsonName of jsonCandidates) {
    if (entryNames.has(jsonName)) {
      try {
        const content = fs.readFileSync(path.join(dirPath, jsonName), 'utf-8');
        const data = JSON.parse(content);
        if (data && typeof data === 'object') {
          return {
            title: data.title || data.name || null,
            description: data.description || data.plot || data.overview || data.synopsis || null,
            releaseYear: data.releaseYear || (data.year ? String(data.year) : null) || (data.releaseDate ? String(data.releaseDate).split('-')[0] : null) || null,
            developer: data.developer || data.dev || null,
            publisher: data.publisher || data.pub || null,
            genre: data.genre || data.category || null,
            cover: data.cover || data.image || data.boxart || null,
            walkthrough: data.walkthrough || (data.writtenWalkthrough || data.videoWalkthrough ? { written: data.writtenWalkthrough, video: data.videoWalkthrough } : null),
            source: 'Local Sidecar (JSON)'
          };
        }
      } catch (err) {
        console.warn(`[SIDECAR WARN] Failed parsing JSON ${jsonName}:`, err.message);
      }
    }
  }

  return null;
}

function findCompanionCover(baseName, currentSubdir, entries, sidecarMeta) {
  const entryNames = new Set(entries.map(e => e.name));
  const exts = ['.webp', '.png', '.jpg', '.jpeg'];
  const candidates = [];

  if (sidecarMeta && sidecarMeta.cover) {
    candidates.push(sidecarMeta.cover);
  }

  for (const ext of exts) {
    candidates.push(`${baseName}${ext}`);
    candidates.push(`${baseName}-cover${ext}`);
    candidates.push(`${baseName}_cover${ext}`);
    candidates.push(`${baseName}.boxart${ext}`);
    candidates.push(`cover${ext}`);
    candidates.push(`boxart${ext}`);
    candidates.push(`folder${ext}`);
  }

  for (const c of candidates) {
    if (entryNames.has(c)) {
      const parts = currentSubdir ? currentSubdir.split('/') : [];
      parts.pop(); // Remove filename
      parts.push(c);
      const encodedSegments = parts.map(seg => encodeURIComponent(seg));
      return `/roms/${encodedSegments.join('/')}`;
    }
  }

  return null;
}

function getRomsManifest(romsBaseDir) {
  const gameMap = new Map();

  function scanDirectory(dirPath, systemSubdir = '') {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    // Pre-check for CUE files so we don't index standalone BIN files that belong to a CUE sheet
    const hasCue = entries.some(e => e.isFile() && path.extname(e.name).toLowerCase() === '.cue');

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry.name);
      const currentSubdir = systemSubdir ? `${systemSubdir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        scanDirectory(fullPath, currentSubdir);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const validExts = [
          '.nes', '.snes', '.smc', '.sfc', '.gba', '.gbc', '.gb',
          '.n64', '.z64', '.v64', '.nds', '.gen', '.md', '.smd',
          '.gg', '.zip', '.iso', '.cue', '.chd', '.pbp', '.bin', '.a26'
        ];

        // Skip .bin file if a .cue sheet exists in the same folder
        if (ext === '.bin' && hasCue) {
          continue;
        }

        if (validExts.includes(ext)) {
          const nameWithoutExt = path.parse(entry.name).name;
          const pathParts = systemSubdir ? systemSubdir.split('/') : [];
          const topFolderKey = pathParts.length > 0 ? pathParts[0].toLowerCase().replace(/[-_]/g, '') : '';
          const rawTopFolder = pathParts.length > 0 ? pathParts[0].toLowerCase() : '';
          const parentFolderKey = pathParts.length > 1 ? pathParts[pathParts.length - 1] : '';

          const extSystemKey = EXTENSION_MAP[ext];
          // Try exact match or normalized match in SYSTEM_MAP, then fallback to extension detector
          const systemMeta = SYSTEM_MAP[rawTopFolder] || SYSTEM_MAP[topFolderKey] || (extSystemKey ? SYSTEM_MAP[extSystemKey] : SYSTEM_MAP['nes']);
          const canonicalKey = systemMeta?.key || (extSystemKey || 'nes');
          const systemInfo = SYSTEM_MAP[canonicalKey] || SYSTEM_MAP['nes'];

          const pathSegments = currentSubdir.split('/').map(segment => encodeURIComponent(segment));
          const romUrl = `/roms/${pathSegments.join('/')}`;

          const rawTitle = (nameWithoutExt.toLowerCase() === 'game' || nameWithoutExt.toLowerCase() === 'rom') && parentFolderKey
            ? parentFolderKey
            : nameWithoutExt;

          const cleanDisplayTitle = rawTitle
            .replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          const sidecarMeta = parseCompanionMetadata(dirPath, nameWithoutExt, entries);
          const companionCover = findCompanionCover(nameWithoutExt, currentSubdir, entries, sidecarMeta);
          const gameId = `${canonicalKey}-${rawTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

          const gameObj = {
            id: gameId,
            title: sidecarMeta?.title || cleanDisplayTitle || rawTitle,
            rawTitle: rawTitle,
            filename: entry.name,
            systemKey: canonicalKey,
            systemName: systemInfo.name,
            systemCore: systemInfo.core,
            systemColor: systemInfo.color,
            systemIcon: systemInfo.icon,
            category: systemInfo.category,
            romUrl,
            coverUrl: companionCover || null,
            sidecarMetadata: sidecarMeta || null,
            hasSidecar: !!(sidecarMeta || companionCover)
          };

          // If entry already exists, prioritize the one with companion cover/sidecar metadata
          if (gameMap.has(gameId)) {
            const existing = gameMap.get(gameId);
            if (!existing.hasSidecar && gameObj.hasSidecar) {
              gameMap.set(gameId, gameObj);
            }
          } else {
            gameMap.set(gameId, gameObj);
          }
        }
      }
    }
  }

  scanDirectory(romsBaseDir);

  const games = Array.from(gameMap.values());

  // Group unique canonical systems with gameCount
  const canonicalSystems = [
    { key: 'nes', name: 'NES', core: 'nes', color: '#e63946', category: 'Console', icon: 'assets/platforms/nes.svg' },
    { key: 'snes', name: 'Super Nintendo', core: 'snes', color: '#8b5cf6', category: 'Console', icon: 'assets/platforms/snes.svg' },
    { key: 'gba', name: 'Game Boy Advance', core: 'gba', color: '#3b82f6', category: 'Handheld', icon: 'assets/platforms/gba.svg' },
    { key: 'gbc', name: 'Game Boy Color', core: 'gb', color: '#10b981', category: 'Handheld', icon: 'assets/platforms/gbc.svg' },
    { key: 'gb', name: 'Game Boy', core: 'gb', color: '#84cc16', category: 'Handheld', icon: 'assets/platforms/gb.svg' },
    { key: 'n64', name: 'Nintendo 64', core: 'n64', color: '#f59e0b', category: 'Console', icon: 'assets/platforms/n64.svg' },
    { key: 'nds', name: 'Nintendo DS', core: 'nds', color: '#06b6d4', category: 'Handheld', icon: 'assets/platforms/nds.svg' },
    { key: 'genesis', name: 'Sega Genesis', core: 'segaMD', color: '#ec4899', category: 'Console', icon: 'assets/platforms/genesis.svg' },
    { key: 'ps1', name: 'PlayStation', core: 'psx', color: '#6366f1', category: 'Console', icon: 'assets/platforms/psx.svg' },
    { key: 'arcade', name: 'Arcade (MAME)', core: 'arcade', color: '#f43f5e', category: 'Arcade', icon: 'assets/platforms/arcade.svg' },
    { key: 'gamegear', name: 'Game Gear', core: 'segaGG', color: '#14b8a6', category: 'Handheld', icon: 'assets/platforms/gamegear.svg' },
    { key: 'atari2600', name: 'Atari 2600', core: 'atari2600', color: '#d97706', category: 'Console', icon: 'assets/platforms/atari2600.svg' }
  ];

  return {
    games,
    systems: canonicalSystems.map(sys => ({
      ...sys,
      gameCount: games.filter(g => g.systemKey === sys.key).length
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
            const stat = fs.statSync(fullRomPath);
            const ext = path.extname(fullRomPath).toLowerCase();
            const mimeMap = {
              '.webp': 'image/webp',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
              '.json': 'application/json',
              '.nfo': 'text/plain',
              '.xml': 'application/xml'
            };
            res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Accept-Ranges', 'bytes');
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
            const cleanDisplayTitle = rawTitle
              .replace(/\(.*?\)/g, '')
              .replace(/\[.*?\]/g, '')
              .replace(/_/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
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

        res.setHeader('Content-Type', 'application/json');

        if (store === 'reset' || (!store && req.method === 'DELETE')) {
          const freshDb = {
            profiles: [],
            user_data: {},
            game_saves: {},
            save_states: {},
            game_metadata: {}
          };
          writeDevDB(freshDb);
          console.log('🧹 [DEV DB FACTORY RESET] Cleared all server DB stores (user_data, game_saves, save_states, profiles, game_metadata)');
          res.end(JSON.stringify({ success: true, message: 'Server database reset successfully' }));
          return;
        }

        if (!store) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing store name' }));
          return;
        }

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

      // Save companion sidecar metadata & cover image directly to disk
      server.middlewares.use('/api/metadata/save-sidecar', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { gameId, systemKey, romPath, title, description, developer, publisher, year, genre, players, coverDataUrl } = data;

            let targetDir = path.resolve(process.cwd(), 'public/roms', systemKey || '');
            let baseFileName = 'game';

            if (romPath) {
              const decodedPath = decodeURIComponent(romPath).replace(/^\/roms\//, '');
              const fullRomPath = path.resolve(process.cwd(), 'public/roms', decodedPath);
              if (fs.existsSync(fullRomPath)) {
                targetDir = path.dirname(fullRomPath);
                baseFileName = path.parse(fullRomPath).name;
              } else {
                baseFileName = path.parse(decodedPath).name || (title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'game');
              }
            } else if (title) {
              baseFileName = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
            }

            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }

            let savedCoverRelativeUrl = null;

            if (coverDataUrl && coverDataUrl.startsWith('data:image/')) {
              const mimeMatch = coverDataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
              const ext = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1]) : 'webp';
              const base64Data = coverDataUrl.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
              const imageBuffer = Buffer.from(base64Data, 'base64');
              const coverFileName = `${baseFileName}.${ext}`;
              const coverFilePath = path.join(targetDir, coverFileName);

              fs.writeFileSync(coverFilePath, imageBuffer);
              const relToPublic = path.relative(path.resolve(process.cwd(), 'public'), coverFilePath);
              savedCoverRelativeUrl = `/${relToPublic.split(path.sep).join('/')}`;
              console.log(`💾 [SIDECAR COVER SAVED] -> ${coverFilePath}`);
            }

            const sidecarJson = {
              title: title || baseFileName,
              description: description || '',
              developer: developer || '',
              publisher: publisher || '',
              year: year || '',
              genre: genre || '',
              players: players || 1,
              systemKey: systemKey || '',
              cover: savedCoverRelativeUrl || data.coverUrl || '',
              updatedAt: new Date().toISOString()
            };

            const sidecarPath = path.join(targetDir, `${baseFileName}.json`);
            fs.writeFileSync(sidecarPath, JSON.stringify(sidecarJson, null, 2), 'utf-8');
            console.log(`💾 [SIDECAR JSON SAVED] -> ${sidecarPath}`);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              savedCoverUrl: savedCoverRelativeUrl,
              sidecarPath: sidecarPath,
              sidecarJson
            }));
          } catch (err) {
            console.error('[SIDE CAR SAVE ERROR]', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // Proxy for TheGamesDB.net (Bypasses Browser CORS restrictions)
      server.middlewares.use('/api/proxy-thegamesdb', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const targetPath = urlObj.searchParams.get('endpoint');
          if (!targetPath) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing endpoint parameter' }));
            return;
          }
          const targetUrl = `https://api.thegamesdb.net/v1/${targetPath}`;
          https.get(targetUrl, {
            headers: { 'User-Agent': 'RetroPlayer/1.0 (Web; Node)' }
          }, (upstreamRes) => {
            res.statusCode = upstreamRes.statusCode || 200;
            res.setHeader('Content-Type', 'application/json');
            upstreamRes.pipe(res);
          }).on('error', (e) => {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: e.message }));
          });
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // Proxy for ScreenScraper.fr (Bypasses Browser CORS restrictions)
      server.middlewares.use('/api/proxy-screenscraper', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const query = urlObj.searchParams.get('query') || '';
          const targetUrl = `https://www.screenscraper.fr/api2/jeuInfos.php?${query}`;
          https.get(targetUrl, {
            headers: { 'User-Agent': 'RetroPlayer/1.0 (Web; Node)' }
          }, (upstreamRes) => {
            res.statusCode = upstreamRes.statusCode || 200;
            res.setHeader('Content-Type', 'application/json');
            upstreamRes.pipe(res);
          }).on('error', (e) => {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: e.message }));
          });
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
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

import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
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
const BUNDLED_ROMS_DIR = path.join(__dirname, 'public/roms');
const BUNDLED_BGM_DIR = path.join(__dirname, 'public/bgm');

// Configuration flags for demo assets & auto-seeding
const INCLUDE_DEMO_ROMS = (process.env.INCLUDE_DEMO_ROMS || 'true').toLowerCase() !== 'false';
const INCLUDE_DEMO_BGM = (process.env.INCLUDE_DEMO_BGM || 'true').toLowerCase() !== 'false';
const AUTO_SEED_DEMOS = (process.env.AUTO_SEED_DEMOS || 'false').toLowerCase() === 'true';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ROMS_DIR)) {
  fs.mkdirSync(ROMS_DIR, { recursive: true });
}
if (!fs.existsSync(BGM_DIR)) {
  fs.mkdirSync(BGM_DIR, { recursive: true });
}

// Helper to copy directory recursively for auto-seeding
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile() && !fs.existsSync(destPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        console.warn(`[AUTO-SEED WARN] Failed copying ${entry.name}:`, err.message);
      }
    }
  }
}

if (AUTO_SEED_DEMOS) {
  if (path.resolve(ROMS_DIR) !== path.resolve(BUNDLED_ROMS_DIR) && fs.existsSync(BUNDLED_ROMS_DIR)) {
    console.log(`🌱 [AUTO-SEED] Seeding bundled demo ROMs into: ${ROMS_DIR}`);
    copyDirRecursive(BUNDLED_ROMS_DIR, ROMS_DIR);
  }
  if (path.resolve(BGM_DIR) !== path.resolve(BUNDLED_BGM_DIR) && fs.existsSync(BUNDLED_BGM_DIR)) {
    console.log(`🌱 [AUTO-SEED] Seeding bundled BGM tracks into: ${BGM_DIR}`);
    copyDirRecursive(BUNDLED_BGM_DIR, BGM_DIR);
  }
}

// System definition mapping with canonical keys and platform aliases
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

const VALID_EXTENSIONS = [
  '.nes', '.snes', '.smc', '.sfc', '.gba', '.gbc', '.gb',
  '.n64', '.z64', '.v64', '.nds', '.gen', '.md', '.smd',
  '.gg', '.zip', '.iso', '.cue', '.chd', '.pbp', '.bin', '.a26'
];
const VALID_AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];

// Serve raw ROM binaries with CORS & octet-stream headers (with fallback to bundled demos)
app.use('/roms', (req, res, next) => {
  try {
    const relativePath = decodeURIComponent(req.url.split('?')[0]);
    let targetPath = path.join(ROMS_DIR, relativePath);

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      if (INCLUDE_DEMO_ROMS && path.resolve(ROMS_DIR) !== path.resolve(BUNDLED_ROMS_DIR)) {
        const bundledPath = path.join(BUNDLED_ROMS_DIR, relativePath);
        if (fs.existsSync(bundledPath) && fs.statSync(bundledPath).isFile()) {
          targetPath = bundledPath;
        }
      }
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      const stat = fs.statSync(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
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
      const stream = fs.createReadStream(targetPath);
      stream.pipe(res);
      return;
    } else {
      console.warn(`[ROM SERVER WARN] ROM not found: ${targetPath}`);
    }
  } catch (e) {
    console.error('[ROM SERVER ERROR] Error serving ROM:', e);
  }
  next();
});

// Serve Background Music (BGM) audio files (with fallback to bundled tracks)
app.use('/bgm', (req, res, next) => {
  try {
    const relativePath = decodeURIComponent(req.url.split('?')[0]);
    let targetPath = path.join(BGM_DIR, relativePath);

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      if (INCLUDE_DEMO_BGM && path.resolve(BGM_DIR) !== path.resolve(BUNDLED_BGM_DIR)) {
        const bundledPath = path.join(BUNDLED_BGM_DIR, relativePath);
        if (fs.existsSync(bundledPath) && fs.statSync(bundledPath).isFile()) {
          targetPath = bundledPath;
        }
      }
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      const ext = path.extname(targetPath).toLowerCase();
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
      const stream = fs.createReadStream(targetPath);
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
  const trackMap = new Map();

  function scanBgmDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
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
            const id = `bgm-${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            if (!trackMap.has(id)) {
              trackMap.set(id, {
                id,
                title: cleanTitle.toUpperCase() || rawTitle,
                filename: entry.name,
                url: `/bgm/${encodeURIComponent(entry.name)}`
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('[API BGM ERROR] Failed reading BGM directory:', e);
    }
  }

  scanBgmDir(BGM_DIR);
  if (INCLUDE_DEMO_BGM && path.resolve(BGM_DIR) !== path.resolve(BUNDLED_BGM_DIR)) {
    scanBgmDir(BUNDLED_BGM_DIR);
  }

  const tracks = Array.from(trackMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  res.json({
    count: tracks.length,
    tracks
  });
});

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

// Dynamic ROM Scanning API endpoint
app.get('/api/roms', (req, res) => {
  console.log(`[API SCANNER] Scanning ROMs in directory: ${ROMS_DIR}`);
  const gameMap = new Map();

  function scanDirectory(dirPath, systemSubdir = '') {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const hasCue = entries.some(e => e.isFile() && path.extname(e.name).toLowerCase() === '.cue');

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;

        const fullPath = path.join(dirPath, entry.name);
        const currentSubdir = systemSubdir ? `${systemSubdir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scanDirectory(fullPath, currentSubdir);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          if (ext === '.bin' && hasCue) continue;

          if (VALID_EXTENSIONS.includes(ext)) {
            const nameWithoutExt = path.parse(entry.name).name;
            const pathParts = systemSubdir ? systemSubdir.split('/') : [];
            const topFolderKey = pathParts.length > 0 ? pathParts[0].toLowerCase().replace(/[-_]/g, '') : '';
            const rawTopFolder = pathParts.length > 0 ? pathParts[0].toLowerCase() : '';
            const parentFolderKey = pathParts.length > 1 ? pathParts[pathParts.length - 1] : '';

            const extSystemKey = EXTENSION_MAP[ext];
            const systemMeta = SYSTEM_MAP[rawTopFolder] || SYSTEM_MAP[topFolderKey] || (extSystemKey ? SYSTEM_MAP[extSystemKey] : SYSTEM_MAP['nes']);
            const canonicalKey = systemMeta?.key || (extSystemKey || 'nes');
            const systemInfo = SYSTEM_MAP[canonicalKey] || SYSTEM_MAP['nes'];

            const rawTitle = (nameWithoutExt.toLowerCase() === 'game' || nameWithoutExt.toLowerCase() === 'rom') && parentFolderKey
              ? parentFolderKey
              : nameWithoutExt;

            const cleanDisplayTitle = rawTitle
              .replace(/\(.*?\)/g, '')
              .replace(/\[.*?\]/g, '')
              .replace(/_/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            const gameId = `${canonicalKey}-${rawTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const sidecarMeta = parseCompanionMetadata(dirPath, nameWithoutExt, entries);
            const companionCover = findCompanionCover(nameWithoutExt, currentSubdir, entries, sidecarMeta);

            const pathSegments = currentSubdir.split('/').map(segment => encodeURIComponent(segment));
            const romUrl = `/roms/${pathSegments.join('/')}`;

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
              hasSidecar: !!sidecarMeta,
              hasCover: !!companionCover
            };

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
    } catch (err) {
      console.error(`[API SCANNER ERROR] Error scanning ${dirPath}:`, err);
    }
  }

  scanDirectory(ROMS_DIR);
  if (INCLUDE_DEMO_ROMS && path.resolve(ROMS_DIR) !== path.resolve(BUNDLED_ROMS_DIR)) {
    scanDirectory(BUNDLED_ROMS_DIR);
  }

  const games = Array.from(gameMap.values());
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

  res.json({
    count: games.length,
    games,
    systems: canonicalSystems.map(sys => ({
      ...sys,
      gameCount: games.filter(g => g.systemKey === sys.key).length
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
    const rawTitle = path.parse(safeFilename).name;

    let systemKey = (systemKeyHeader || '').toLowerCase();
    if (!systemKey || !SYSTEM_MAP[systemKey]) {
      systemKey = EXTENSION_MAP[ext] || 'nes';
    }

    const systemInfo = SYSTEM_MAP[systemKey] || SYSTEM_MAP['nes'];
    const canonicalKey = systemInfo.key || 'nes';
    const targetGameDir = path.join(ROMS_DIR, canonicalKey, rawTitle);
    if (!fs.existsSync(targetGameDir)) {
      fs.mkdirSync(targetGameDir, { recursive: true });
    }

    const targetFilePath = path.join(targetGameDir, safeFilename);
    console.log(`📥 [API UPLOADER] Saving ROM: ${safeFilename} to ${targetFilePath} (${req.body.length} bytes)`);

    const writeStream = fs.createWriteStream(targetFilePath);
    writeStream.write(req.body);
    writeStream.end();

    writeStream.on('finish', () => {
      console.log(`✅ [API UPLOADER SUCCESS] Successfully wrote: ${safeFilename}`);
      
      const cleanDisplayTitle = rawTitle
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const romUrl = `/roms/${canonicalKey}/${encodeURIComponent(rawTitle)}/${encodeURIComponent(safeFilename)}`;

      // Check if companion box art exists, if not, query Libretro CDN
      const libretroSystemName = {
        nes: 'Nintendo - Nintendo Entertainment System',
        snes: 'Nintendo - Super Nintendo Entertainment System',
        gba: 'Nintendo - Game Boy Advance',
        gbc: 'Nintendo - Game Boy Color',
        gb: 'Nintendo - Game Boy',
        n64: 'Nintendo - Nintendo 64',
        nds: 'Nintendo - Nintendo DS',
        genesis: 'Sega - Mega Drive - Genesis',
        megadrive: 'Sega - Mega Drive - Genesis',
        sega_genesis: 'Sega - Mega Drive - Genesis',
        playstation: 'Sony - PlayStation',
        ps1: 'Sony - PlayStation',
        psx: 'Sony - PlayStation',
        arcade: 'FBNeo - Arcade Games',
        gamegear: 'Sega - Game Gear',
        game_gear: 'Sega - Game Gear',
        atari2600: 'Atari - 2600',
        atari_2600: 'Atari - 2600'
      }[canonicalKey] || libretroSystemNameMap[systemKey];

      const existingCovers = fs.readdirSync(targetGameDir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));
      
      const finalizeUpload = (coverUrl = null) => {
        const gameRecord = {
          id: `${canonicalKey}-${rawTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          title: cleanDisplayTitle || rawTitle,
          rawTitle: rawTitle,
          filename: safeFilename,
          systemKey: canonicalKey,
          systemName: systemInfo.name,
          systemCore: systemInfo.core,
          systemColor: systemInfo.color,
          systemIcon: systemInfo.icon,
          category: systemInfo.category,
          romUrl,
          coverUrl: coverUrl || (existingCovers.length > 0 ? `/roms/${canonicalKey}/${encodeURIComponent(rawTitle)}/${encodeURIComponent(existingCovers[0])}` : null)
        };
        res.status(200).json({ success: true, game: gameRecord });
      };

      if (existingCovers.length === 0 && libretroSystemName) {
        // Attempt to fetch box art from Libretro CDN
        const formatName = (str) => str.replace(/&/g, '_').replace(/[:/\\*?"<>|]/g, '_').trim();
        const candidateNames = [
          rawTitle,
          formatName(rawTitle),
          cleanDisplayTitle,
          `${cleanDisplayTitle} (USA)`,
          `${cleanDisplayTitle} (USA, Europe)`,
          `${cleanDisplayTitle} (World)`
        ];

        const tryDownload = async () => {
          for (const cand of candidateNames) {
            if (!cand) continue;
            const destCoverPath = path.join(targetGameDir, `${rawTitle}.png`);
            const encodedSys = encodeURIComponent(libretroSystemName);
            const encodedName = encodeURIComponent(cand);
            const cdnUrl = `https://thumbnails.libretro.com/${encodedSys}/Named_Boxarts/${encodedName}.png`;
            
            try {
              const ok = await new Promise((resolve) => {
                https.get(cdnUrl, { headers: { 'User-Agent': 'RetroPlayerMetadataBot/2.0' }, timeout: 4000 }, (r) => {
                  if (r.statusCode === 200) {
                    const fileStream = fs.createWriteStream(destCoverPath);
                    r.pipe(fileStream);
                    fileStream.on('finish', () => { fileStream.close(); resolve(true); });
                    fileStream.on('error', () => resolve(false));
                  } else {
                    resolve(false);
                  }
                }).on('error', () => resolve(false));
              });

              if (ok && fs.existsSync(destCoverPath) && fs.statSync(destCoverPath).size > 0) {
                console.log(`🖼️ [API UPLOADER] Fetched companion cover for "${rawTitle}" from Libretro CDN`);
                return `/roms/${systemKey}/${encodeURIComponent(rawTitle)}/${encodeURIComponent(path.basename(destCoverPath))}`;
              }
            } catch (_) {}
          }
          return null;
        };

        tryDownload().then((fetchedCover) => {
          finalizeUpload(fetchedCover);
        });
      } else {
        finalizeUpload();
      }
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

    const parentDir = path.dirname(targetPath);
    const systemDir = systemKey ? path.join(ROMS_DIR, systemKey) : null;
    const isDedicatedFolder = parentDir !== ROMS_DIR && (!systemDir || parentDir !== systemDir);

    if (isDedicatedFolder && fs.existsSync(parentDir)) {
      fs.rmSync(parentDir, { recursive: true, force: true });
      console.log(`🗑️ [API ROM DELETE] Successfully deleted entire game directory: ${parentDir}`);
    } else {
      const baseName = path.parse(targetPath).name;
      const companionExts = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.json', '.nfo'];
      for (const ext of companionExts) {
        const companionPath = path.join(parentDir, `${baseName}${ext}`);
        if (fs.existsSync(companionPath)) {
          try { fs.unlinkSync(companionPath); } catch (_) {}
        }
      }
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      console.log(`🗑️ [API ROM DELETE] Successfully deleted ROM and companion sidecars: ${targetPath}`);
    }

    res.json({ success: true, message: 'Game deleted successfully' });
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

// 0. RESET all records across all stores
app.post('/api/db/reset', (req, res) => {
  const freshDb = {
    profiles: [],
    user_data: {},
    app_settings: {},
    game_saves: {},
    save_states: {},
    game_metadata: {}
  };
  writeServerDB(freshDb);
  console.log('🧹 [SERVER DB FACTORY RESET] Cleared all server DB stores (user_data, game_saves, save_states, profiles, app_settings, game_metadata)');
  res.json({ success: true, message: 'Server database reset successfully' });
});

app.delete('/api/db', (req, res) => {
  const freshDb = {
    profiles: [],
    user_data: {},
    app_settings: {},
    game_saves: {},
    save_states: {},
    game_metadata: {}
  };
  writeServerDB(freshDb);
  console.log('🧹 [SERVER DB FACTORY RESET] Cleared all server DB stores (user_data, game_saves, save_states, profiles, app_settings, game_metadata)');
  res.json({ success: true, message: 'Server database reset successfully' });
});

// 0.1 EXPORT full database payload
app.get('/api/db/export', (req, res) => {
  const db = readServerDB();
  const exportPayload = {
    app: 'RetroPlayer',
    version: '1.0.3',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    stats: {
      profilesCount: Array.isArray(db.profiles) ? db.profiles.length : Object.keys(db.profiles || {}).length,
      userDataCount: Object.keys(db.user_data || {}).length,
      savesCount: Object.keys(db.game_saves || {}).length,
      statesCount: Object.keys(db.save_states || {}).length,
      metadataCount: Object.keys(db.game_metadata || {}).length
    },
    database: {
      profiles: db.profiles || [],
      user_data: db.user_data || {},
      game_saves: db.game_saves || {},
      save_states: db.save_states || {},
      game_metadata: db.game_metadata || {}
    }
  };
  res.json({ success: true, ...exportPayload });
});

// 0.2 IMPORT full database payload
app.post('/api/db/import', express.json({ limit: '100mb' }), (req, res) => {
  try {
    const importPayload = req.body || {};
    const database = importPayload.database || importPayload;

    if (!database || typeof database !== 'object') {
      return res.status(400).json({ error: 'Invalid database payload structure' });
    }

    const currentDb = readServerDB();
    const mergedDb = {
      profiles: Array.isArray(database.profiles) ? database.profiles : (currentDb.profiles || []),
      user_data: typeof database.user_data === 'object' ? { ...currentDb.user_data, ...database.user_data } : (currentDb.user_data || {}),
      game_saves: typeof database.game_saves === 'object' ? { ...currentDb.game_saves, ...database.game_saves } : (currentDb.game_saves || {}),
      save_states: typeof database.save_states === 'object' ? { ...currentDb.save_states, ...database.save_states } : (currentDb.save_states || {}),
      game_metadata: typeof database.game_metadata === 'object' ? { ...currentDb.game_metadata, ...database.game_metadata } : (currentDb.game_metadata || {})
    };

    const writeSuccess = writeServerDB(mergedDb);
    if (!writeSuccess) {
      return res.status(500).json({ error: 'Failed to write imported database to disk' });
    }

    console.log('📥 [SERVER DB IMPORT] Successfully imported database payload to filesystem');
    res.json({
      success: true,
      message: 'Database imported successfully',
      stats: {
        profilesCount: Array.isArray(mergedDb.profiles) ? mergedDb.profiles.length : 0,
        userDataCount: Object.keys(mergedDb.user_data).length,
        savesCount: Object.keys(mergedDb.game_saves).length,
        statesCount: Object.keys(mergedDb.save_states).length
      }
    });
  } catch (err) {
    console.error('🚨 [SERVER DB IMPORT ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});

// 0.3 RESET server database
app.all('/api/db/reset', (req, res) => {
  const freshDb = {
    profiles: [],
    user_data: {},
    app_settings: {},
    game_saves: {},
    save_states: {},
    game_metadata: {}
  };
  writeServerDB(freshDb);
  console.log('🧹 [SERVER DB FACTORY RESET] Cleared all server DB stores (profiles, user_data, app_settings, game_saves, save_states, game_metadata)');
  res.json({ success: true, message: 'Server database reset successfully' });
});

// 1. GET all records in a store
app.get('/api/db/:store', (req, res) => {
  const store = req.params.store;
  if (store === 'reset') {
    const freshDb = {
      profiles: [],
      user_data: {},
      app_settings: {},
      game_saves: {},
      save_states: {},
      game_metadata: {}
    };
    writeServerDB(freshDb);
    return res.json({ success: true, message: 'Server database reset successfully' });
  }
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

// 5. POST Save companion sidecar metadata & cover artwork to disk
app.post('/api/metadata/save-sidecar', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const data = req.body || {};
    const { gameId, systemKey, romPath, title, description, developer, publisher, year, releaseYear, genre, players, coverDataUrl } = data;
    const effectiveYear = (releaseYear || year || '').toString();

    let targetDir = path.resolve(ROMS_DIR, systemKey || '');
    let baseFileName = 'game';

    if (romPath) {
      const decodedPath = decodeURIComponent(romPath).replace(/^\/roms\//, '');
      const fullRomPath = path.resolve(ROMS_DIR, decodedPath);
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

    if (data.deleteCover) {
      const coverExts = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.bmp'];
      for (const ext of coverExts) {
        const coverPath = path.join(targetDir, `${baseFileName}${ext}`);
        if (fs.existsSync(coverPath)) {
          try { fs.unlinkSync(coverPath); } catch (_) {}
        }
        const genericPath = path.join(targetDir, `cover${ext}`);
        if (fs.existsSync(genericPath)) {
          try { fs.unlinkSync(genericPath); } catch (_) {}
        }
      }
      savedCoverRelativeUrl = '';
      console.log(`🧹 [COVER DELETED FROM DISK] -> in ${targetDir}`);
    } else if (coverDataUrl && coverDataUrl.startsWith('data:image/')) {
      const match = coverDataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
      let ext = '.webp';
      if (match && match[1]) {
        const mimeSub = match[1].toLowerCase();
        if (mimeSub === 'png') ext = '.png';
        else if (mimeSub === 'jpeg' || mimeSub === 'jpg') ext = '.jpg';
        else if (mimeSub === 'webp') ext = '.webp';
      }
      const base64Data = coverDataUrl.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const coverFileName = `${baseFileName}${ext}`;
      const coverFilePath = path.join(targetDir, coverFileName);

      fs.writeFileSync(coverFilePath, imageBuffer);
      const relToPublic = path.relative(path.resolve(__dirname, 'public'), coverFilePath);
      savedCoverRelativeUrl = `/${relToPublic.split(path.sep).join('/')}`;
      console.log(`💾 [SERVER COVER SAVED] -> ${coverFilePath}`);
    } else if (data.coverUrl && (data.coverUrl.startsWith('http://') || data.coverUrl.startsWith('https://'))) {
      try {
        const remoteRes = await fetch(data.coverUrl);
        if (remoteRes.ok) {
          const arrayBuffer = await remoteRes.arrayBuffer();
          const imageBuffer = Buffer.from(arrayBuffer);

          let ext = '.png';
          const lowerUrl = data.coverUrl.toLowerCase();
          if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) ext = '.jpg';
          else if (lowerUrl.includes('.webp')) ext = '.webp';
          else if (lowerUrl.includes('.png')) ext = '.png';
          else {
            const ct = remoteRes.headers.get('content-type') || '';
            if (ct.includes('jpeg')) ext = '.jpg';
            else if (ct.includes('webp')) ext = '.webp';
            else if (ct.includes('png')) ext = '.png';
          }

          const coverFileName = `${baseFileName}${ext}`;
          const coverFilePath = path.join(targetDir, coverFileName);

          fs.writeFileSync(coverFilePath, imageBuffer);
          const relToPublic = path.relative(path.resolve(__dirname, 'public'), coverFilePath);
          savedCoverRelativeUrl = `/${relToPublic.split(path.sep).join('/')}`;
          console.log(`💾 [REMOTE COVER DOWNLOADED & SAVED] -> ${coverFilePath}`);
        }
      } catch (dlErr) {
        console.warn(`[REMOTE COVER FETCH FAILED]: ${data.coverUrl}`, dlErr.message);
      }
    }

    const sidecarJson = {
      title: title || baseFileName,
      description: description || '',
      developer: developer || '',
      publisher: publisher || '',
      releaseYear: effectiveYear,
      year: effectiveYear,
      genre: genre || '',
      players: players || 1,
      systemKey: systemKey || '',
      cover: savedCoverRelativeUrl || data.coverUrl || '',
      walkthrough: data.walkthrough || undefined,
      updatedAt: new Date().toISOString()
    };

    if (!sidecarJson.walkthrough) {
      delete sidecarJson.walkthrough;
    }

    const sidecarPath = path.join(targetDir, `${baseFileName}.json`);
    fs.writeFileSync(sidecarPath, JSON.stringify(sidecarJson, null, 2), 'utf-8');
    console.log(`💾 [SERVER SIDECAR JSON SAVED] -> ${sidecarPath}`);

    res.json({
      success: true,
      savedCoverUrl: savedCoverRelativeUrl,
      sidecarPath: sidecarPath,
      sidecarJson
    });
  } catch (err) {
    console.error('[SERVER SIDE CAR SAVE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. POST Delete companion sidecar metadata from disk
app.post('/api/metadata/delete-sidecar', express.json(), (req, res) => {
  try {
    const data = req.body || {};
    const { systemKey, romPath, title } = data;

    let targetDir = path.resolve(ROMS_DIR, systemKey || '');
    let baseFileName = 'game';

    if (romPath) {
      const decodedPath = decodeURIComponent(romPath).replace(/^\/roms\//, '');
      const fullRomPath = path.resolve(ROMS_DIR, decodedPath);
      if (fs.existsSync(fullRomPath)) {
        targetDir = path.dirname(fullRomPath);
        baseFileName = path.parse(fullRomPath).name;
      } else {
        baseFileName = path.parse(decodedPath).name || (title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'game');
      }
    } else if (title) {
      baseFileName = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    const sidecarPath = path.join(targetDir, `${baseFileName}.json`);
    if (fs.existsSync(sidecarPath)) {
      try { fs.unlinkSync(sidecarPath); } catch (_) {}
    }
    const legacyPath = path.join(targetDir, 'metadata.json');
    if (fs.existsSync(legacyPath)) {
      try { fs.unlinkSync(legacyPath); } catch (_) {}
    }

    console.log(`🧹 [SERVER SIDECAR JSON DELETED] -> from ${targetDir}`);
    res.json({ success: true, message: 'Sidecar JSON deleted from disk' });
  } catch (err) {
    console.error('[SERVER SIDE CAR DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy for TheGamesDB.net
app.get('/api/proxy-thegamesdb', (req, res) => {
  try {
    const targetPath = req.query.endpoint;
    if (!targetPath) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }
    const targetUrl = `https://api.thegamesdb.net/v1/${targetPath}`;
    https.get(targetUrl, {
      headers: { 'User-Agent': 'RetroPlayer/1.0 (Web; Node)' }
    }, (upstreamRes) => {
      res.status(upstreamRes.statusCode || 200);
      res.setHeader('Content-Type', 'application/json');
      upstreamRes.pipe(res);
    }).on('error', (e) => {
      res.status(502).json({ error: e.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy for ScreenScraper.fr
app.get('/api/proxy-screenscraper', (req, res) => {
  try {
    const query = req.query.query || '';
    const targetUrl = `https://www.screenscraper.fr/api2/jeuInfos.php?${query}`;
    https.get(targetUrl, {
      headers: { 'User-Agent': 'RetroPlayer/1.0 (Web; Node)' }
    }, (upstreamRes) => {
      res.status(upstreamRes.statusCode || 200);
      res.setHeader('Content-Type', 'application/json');
      upstreamRes.pipe(res);
    }).on('error', (e) => {
      res.status(502).json({ error: e.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy for Keyless Video Game Database (RAWG.io)
app.get('/api/proxy-rawg', (req, res) => {
  try {
    const targetPath = req.query.endpoint;
    if (!targetPath) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }
    const defaultKey = 'c542e67aec3a4340908f9de9e86038af';
    const sep = targetPath.includes('?') ? '&' : '?';
    const finalPath = targetPath.includes('key=') ? targetPath : `${targetPath}${sep}key=${defaultKey}`;
    const targetUrl = `https://api.rawg.io/api/${finalPath}`;
    https.get(targetUrl, {
      headers: { 'User-Agent': 'RetroPlayer/2.0 (Web; VideoGameDatabaseBot)' }
    }, (upstreamRes) => {
      res.status(upstreamRes.statusCode || 200);
      res.setHeader('Content-Type', 'application/json');
      upstreamRes.pipe(res);
    }).on('error', (e) => {
      res.status(502).json({ error: e.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  console.log(`💾 [DATA DIRECTORY] ${DATA_DIR}`);
  console.log(`🎮 [DEMO ROMS ENABLED] ${INCLUDE_DEMO_ROMS}`);
  console.log(`🎶 [DEMO BGM ENABLED] ${INCLUDE_DEMO_BGM}`);
  console.log(`🌱 [AUTO SEED DEMOS] ${AUTO_SEED_DEMOS}`);
});

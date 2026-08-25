#!/usr/bin/env node

/**
 * Update ROMs Automation Script (Libretro CDN Sourced)
 *
 * Streamlined, authentic local ROM library management pipeline:
 * 1. Organizes loose ROMs dropped in root or system folders into canonical folders (<system>/<Clean Title>/<Clean Title>.<ext>).
 * 2. Ingests loose screenshots/cover art drops (.png, .jpg, .jpeg, .webp), matches them to games via fuzzy normalization,
 *    and converts them to high-performance `<Clean Title>.webp` alongside the ROM.
 * 3. Exclusively queries official Libretro CDN Thumbnail repositories (Named_Boxarts & Named_Titles)
 *    to download authentic 1:1 box art covers with zero Wikipedia or unverified web noise.
 * 4. Generates clean local companion `metadata.json` sidecars directly in the codebase.
 *
 * Usage:
 *   node update_roms.js [options]
 *
 * Options:
 *   --dir <path>         Target ROMs directory (default: ./public/roms)
 *   --system <key>       Limit to a specific system (e.g. gba, snes, nes)
 *   --organize           Organize loose ROMs into standardized subfolders & normalize names
 *   --convert-covers     Convert PNG/JPG covers to WebP (<Title>.webp)
 *   --fetch-metadata     Fetch Libretro box art & generate metadata.json sidecars
 *   --all                Perform all operations (organize, convert-covers, fetch-metadata)
 *   --force              Overwrite existing metadata.json sidecars & re-download covers
 *   --dry-run            Show proposed changes without writing to disk
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported Extension Mappings
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
  '.gen': 'sega_genesis',
  '.md': 'sega_genesis',
  '.smd': 'sega_genesis',
  '.gg': 'game_gear',
  '.iso': 'playstation',
  '.cue': 'playstation',
  '.chd': 'playstation',
  '.pbp': 'playstation',
  '.bin': 'playstation',
  '.a26': 'atari_2600',
  '.7z': 'atari_2600',
  '.zip': 'arcade'
};

const SYSTEM_NAMES = {
  nes: 'Nintendo Entertainment System',
  snes: 'Super Nintendo',
  gba: 'Game Boy Advance',
  gbc: 'Game Boy Color',
  gb: 'Game Boy',
  n64: 'Nintendo 64',
  nds: 'Nintendo DS',
  sega_genesis: 'Sega Genesis',
  playstation: 'PlayStation',
  arcade: 'Arcade (MAME)',
  game_gear: 'Game Gear',
  atari_2600: 'Atari 2600'
};

// Libretro GitHub Thumbnail repository system folder names
const LIBRETRO_SYSTEM_MAP = {
  nes: 'Nintendo - Nintendo Entertainment System',
  snes: 'Nintendo - Super Nintendo Entertainment System',
  gba: 'Nintendo - Game Boy Advance',
  gbc: 'Nintendo - Game Boy Color',
  gb: 'Nintendo - Game Boy',
  n64: 'Nintendo - Nintendo 64',
  nds: 'Nintendo - Nintendo DS',
  sega_genesis: 'Sega - Mega Drive - Genesis',
  playstation: 'Sony - PlayStation',
  arcade: 'FBNeo - Arcade Games',
  game_gear: 'Sega - Game Gear',
  atari_2600: 'Atari - 2600'
};

// Parse CLI flags
const args = process.argv.slice(2);
let targetDir = path.resolve(process.cwd(), 'public/roms');
let systemFilter = null;
let doOrganize = false;
let doConvertCovers = false;
let doFetchMetadata = false;
let doForce = false;
let isDryRun = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--dir' && args[i + 1]) {
    targetDir = path.resolve(process.cwd(), args[++i]);
  } else if (arg === '--system' && args[i + 1]) {
    systemFilter = args[++i].toLowerCase();
  } else if (arg === '--organize') {
    doOrganize = true;
  } else if (arg === '--convert-covers') {
    doConvertCovers = true;
  } else if (arg === '--fetch-metadata') {
    doFetchMetadata = true;
  } else if (arg === '--force') {
    doForce = true;
  } else if (arg === '--all') {
    doOrganize = true;
    doConvertCovers = true;
    doFetchMetadata = true;
  } else if (arg === '--dry-run') {
    isDryRun = true;
  }
}

if (!doOrganize && !doConvertCovers && !doFetchMetadata) {
  doOrganize = true;
  doConvertCovers = true;
  doFetchMetadata = true;
}

console.log(`\n🎮 [UPDATE-ROMS] Target Directory: ${targetDir}`);
console.log(`⚙️  [MODE] Source: Libretro CDN Only | Organize: ${doOrganize} | Convert Covers: ${doConvertCovers} | Fetch Metadata: ${doFetchMetadata} | Force Overwrite: ${doForce} | Dry Run: ${isDryRun}\n`);

// Helper to sanitize title and fix inverted names
function sanitizeTitle(raw) {
  let clean = raw
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Invert "Title, The" -> "The Title"
  if (clean.includes(', The')) {
    clean = 'The ' + clean.replace(', The', '').trim();
  }
  return clean;
}

// Normalize string for fuzzy title matching
function normalizeTitleForMatching(str) {
  return str
    .toLowerCase()
    .replace(/_screenshot.*$/gi, '')
    .replace(/screenshot.*$/gi, '')
    .replace(/_v(\d+)_(\d+)/gi, ' v$1.$2')
    .replace(/_v(\d+)/gi, ' v$1')
    .replace(/[^a-z0-9]/g, '');
}

// Download file from URL
function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'RetroPlayerMetadataBot/2.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.abort();
      resolve(false);
    });
  });
}

// Convert image to WebP using sips (macOS built-in) or sharp/cwebp
function convertImageToWebp(srcPath, destPath) {
  if (path.extname(srcPath).toLowerCase() === '.webp' && srcPath === destPath) {
    return true;
  }

  // macOS built-in sips / cwebp
  try {
    if (process.platform === 'darwin') {
      execSync(`sips -s format webp "${srcPath}" --out "${destPath}"`, { stdio: 'pipe' });
      return true;
    } else {
      execSync(`cwebp -q 85 "${srcPath}" -o "${destPath}"`, { stdio: 'pipe' });
      return true;
    }
  } catch (err) {
    try {
      execSync(`convert "${srcPath}" -quality 85 "${destPath}"`, { stdio: 'pipe' });
      return true;
    } catch (e) {
      console.warn(`[CONVERT WARN] Could not convert ${srcPath} to WebP:`, e.message);
      return false;
    }
  }
}

// Query Libretro Thumbnail CDN for exact matching Boxart or Title screen (Prioritized)
async function checkLibretroCover(systemKey, rawTitle) {
  const libretroSystem = LIBRETRO_SYSTEM_MAP[systemKey];
  if (!libretroSystem) return null;

  const cleanTitle = sanitizeTitle(rawTitle);

  // Candidate title names to try on Libretro CDN
  const candidateNames = [
    rawTitle,
    rawTitle.replace(/\s*\(Demo\).*/i, '').trim(),
    cleanTitle
  ];

  for (const titleCandidate of candidateNames) {
    const candidateUrls = [
      `http://thumbnails.libretro.com/${encodeURIComponent(libretroSystem)}/Named_Boxarts/${encodeURIComponent(titleCandidate)}.png`,
      `http://thumbnails.libretro.com/${encodeURIComponent(libretroSystem)}/Named_Titles/${encodeURIComponent(titleCandidate)}.png`,
      `https://raw.githubusercontent.com/libretro-thumbnails/${encodeURIComponent(libretroSystem.replace(/\s+/g, '_'))}/master/Named_Boxarts/${encodeURIComponent(titleCandidate)}.png`,
      `https://raw.githubusercontent.com/libretro-thumbnails/${encodeURIComponent(libretroSystem.replace(/\s+/g, '_'))}/master/Named_Titles/${encodeURIComponent(titleCandidate)}.png`
    ];

    for (const u of candidateUrls) {
      const exists = await new Promise(resolve => {
        const client = u.startsWith('https') ? https : http;
        const req = client.request(u, { method: 'HEAD', headers: { 'User-Agent': 'RetroPlayerMetadataBot/2.0' } }, res => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(4000, () => {
          req.abort();
          resolve(false);
        });
        req.end();
      });
      if (exists) return u;
    }
  }
  return null;
}

function matchImageToGame(imageName, allGames) {
  const normFile = normalizeTitleForMatching(path.parse(imageName).name);
  if (!normFile) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const g of allGames) {
    const normGame = normalizeTitleForMatching(g.folderName);
    const normCleanGame = normalizeTitleForMatching(sanitizeTitle(g.folderName));

    if (normGame === normFile || normCleanGame === normFile) {
      return g;
    }
    if (normGame.includes(normFile) || normFile.includes(normGame) ||
        normCleanGame.includes(normFile) || normFile.includes(normCleanGame)) {
      const matchLen = normCleanGame.length > 0 ? normCleanGame.length : normGame.length;
      const score = Math.min(matchLen, normFile.length) / Math.max(matchLen, normFile.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = g;
      }
    }
  }

  if (bestScore >= 0.2) {
    return bestMatch;
  }
  return null;
}

// Main processing loop
async function processRoms() {
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Target directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  // 1. Organize loose ROM files sitting at root directory or staging folders (e.g. /new, /staging, /drops)
  if (doOrganize) {
    const rootEntries = fs.readdirSync(targetDir, { withFileTypes: true });

    // Ingest loose ROM files sitting directly at root
    for (const entry of rootEntries) {
      if (entry.isFile() && !entry.name.startsWith('.')) {
        const ext = path.extname(entry.name).toLowerCase();
        const sysKey = EXTENSION_MAP[ext];
        if (sysKey) {
          const baseName = path.parse(entry.name).name;
          const targetSysFolder = path.join(targetDir, sysKey);
          const targetGameFolder = path.join(targetSysFolder, baseName);

          console.log(`📦 Organizing loose root ROM: "${entry.name}" -> "${sysKey}/${baseName}/${entry.name}"`);
          if (!isDryRun) {
            if (!fs.existsSync(targetGameFolder)) {
              fs.mkdirSync(targetGameFolder, { recursive: true });
            }
            fs.renameSync(path.join(targetDir, entry.name), path.join(targetGameFolder, entry.name));
          }
        }
      }
    }

    // Scan non-system staging folders (e.g. "new", "staging", "drops", "temp")
    const stagingFolders = rootEntries.filter(e => e.isDirectory() && !e.name.startsWith('.') && !SYSTEM_NAMES[e.name]);
    for (const stg of stagingFolders) {
      const stgPath = path.join(targetDir, stg.name);
      console.log(`📦 Scanning staging directory: "${stg.name}"`);

      // Collect all files in staging folder recursively
      const collectFiles = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
          if (item.name.startsWith('.')) continue;
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            results = results.concat(collectFiles(fullPath));
          } else {
            results.push({ name: item.name, fullPath });
          }
        }
        return results;
      };

      const stagingFiles = collectFiles(stgPath);
      const stagingRoms = stagingFiles.filter(f => EXTENSION_MAP[path.extname(f.name).toLowerCase()]);
      const stagingImages = stagingFiles.filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f.name).toLowerCase()));

      for (const rom of stagingRoms) {
        const ext = path.extname(rom.name).toLowerCase();
        const sysKey = EXTENSION_MAP[ext];
        const rawBase = path.parse(rom.name).name;
        const cleanTitle = sanitizeTitle(rawBase);
        const targetSysFolder = path.join(targetDir, sysKey);
        const targetGameFolder = path.join(targetSysFolder, rawBase);

        console.log(`🚀 Routing staging ROM: "${rom.name}" -> "${sysKey}/${rawBase}/${rom.name}"`);
        if (!isDryRun) {
          if (!fs.existsSync(targetGameFolder)) {
            fs.mkdirSync(targetGameFolder, { recursive: true });
          }
          const targetRomPath = path.join(targetGameFolder, rom.name);
          fs.copyFileSync(rom.fullPath, targetRomPath);

          // Find companion staging screenshot/cover
          const matchedImg = stagingImages.find(img => {
            const normImg = normalizeTitleForMatching(path.parse(img.name).name);
            const normRom = normalizeTitleForMatching(rawBase);
            return normImg.includes(normRom) || normRom.includes(normImg);
          });

          if (matchedImg) {
            const destWebp = path.join(targetGameFolder, `${rawBase}.webp`);
            console.log(`🖼️  Converting staging cover: "${matchedImg.name}" -> "${rawBase}.webp"`);
            convertImageToWebp(matchedImg.fullPath, destWebp);
          }
        }
      }

      // Cleanup staging directory after organizing
      if (!isDryRun) {
        try {
          fs.rmSync(stgPath, { recursive: true, force: true });
          console.log(`🧹 Cleaned up staging directory: "${stg.name}"`);
        } catch (e) {
          console.warn(`[WARN] Could not delete staging dir:`, e.message);
        }
      }
    }
  }

  // Get all active console system folders in targetDir
  const systemDirs = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && (SYSTEM_NAMES[d.name] || EXTENSION_MAP[`.${d.name}`]));

  // Index all existing games across systems for fuzzy loose cover matching
  const allKnownGames = [];
  for (const sDir of systemDirs) {
    const sPath = path.join(targetDir, sDir.name);
    const subfolders = fs.readdirSync(sPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));

    for (const sub of subfolders) {
      allKnownGames.push({
        system: sDir.name,
        folderName: sub.name,
        dirPath: path.join(sPath, sub.name)
      });
    }
  }

  // Ingest loose cover / screenshot image files sitting at targetDir root or system directories
  if (doConvertCovers || doOrganize) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const looseRootImages = fs.readdirSync(targetDir, { withFileTypes: true })
      .filter(f => f.isFile() && imageExtensions.includes(path.extname(f.name).toLowerCase()) && !f.name.startsWith('.'));

    for (const img of looseRootImages) {
      const matchedGame = matchImageToGame(img.name, allKnownGames);
      if (matchedGame) {
        const srcPath = path.join(targetDir, img.name);
        const destWebp = path.join(matchedGame.dirPath, `${matchedGame.folderName}.webp`);
        console.log(`🖼️  Ingesting loose screenshot/cover: "${img.name}" -> "${matchedGame.system}/${matchedGame.folderName}/${matchedGame.folderName}.webp"`);
        if (!isDryRun) {
          const ok = convertImageToWebp(srcPath, destWebp);
          if (ok) {
            fs.unlinkSync(srcPath);
          }
        }
      }
    }

    for (const sDir of systemDirs) {
      const sPath = path.join(targetDir, sDir.name);
      const looseSysImages = fs.readdirSync(sPath, { withFileTypes: true })
        .filter(f => f.isFile() && imageExtensions.includes(path.extname(f.name).toLowerCase()) && !f.name.startsWith('.'));

      for (const img of looseSysImages) {
        const matchedGame = matchImageToGame(img.name, allKnownGames.filter(g => g.system === sDir.name));
        if (matchedGame) {
          const srcPath = path.join(sPath, img.name);
          const destWebp = path.join(matchedGame.dirPath, `${matchedGame.folderName}.webp`);
          console.log(`🖼️  Ingesting system loose cover: "${img.name}" -> "${matchedGame.system}/${matchedGame.folderName}/${matchedGame.folderName}.webp"`);
          if (!isDryRun) {
            const ok = convertImageToWebp(srcPath, destWebp);
            if (ok) {
              fs.unlinkSync(srcPath);
            }
          }
        }
      }
    }
  }

  // Iterate each system and process canonical game directories
  for (const sysDir of systemDirs) {
    const sysFolderName = sysDir.name;
    if (systemFilter && sysFolderName.toLowerCase() !== systemFilter) {
      continue;
    }

    const sysPath = path.join(targetDir, sysFolderName);
    console.log(`\n📁 [PROCESSING SYSTEM] ${sysFolderName.toUpperCase()}`);

    const currentSubfolders = fs.readdirSync(sysPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));

    for (const sub of currentSubfolders) {
      const subPath = path.join(sysPath, sub.name);
      const subEntries = fs.readdirSync(subPath, { withFileTypes: true });

      const romFiles = subEntries.filter(e => e.isFile() && EXTENSION_MAP[path.extname(e.name).toLowerCase()]);
      if (romFiles.length === 0) continue;

      let activeRom = romFiles[0];
      if (romFiles.length > 1) {
        console.log(`    ⚠️  Found multiple ROM versions in "${sub.name}". Selecting latest version...`);
        const extractVersionScore = (name) => {
          const vMatch = name.match(/v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/i);
          if (vMatch) {
            const v1 = parseInt(vMatch[1] || '0', 10);
            const v2 = parseInt(vMatch[2] || '0', 10);
            const v3 = parseInt(vMatch[3] || '0', 10);
            const v4 = parseInt(vMatch[4] || '0', 10);
            return v1 * 1000000 + v2 * 10000 + v3 * 100 + v4;
          }
          const dMatch = name.match(/\b(19\d{2}|20\d{2})(?:-(\d{2}))?(?:-(\d{2}))?\b/);
          if (dMatch) {
            return parseInt(dMatch[1] + (dMatch[2] || '01') + (dMatch[3] || '01'), 10);
          }
          return 0;
        };

        romFiles.sort((a, b) => extractVersionScore(b.name) - extractVersionScore(a.name));
        activeRom = romFiles[0];
        const superseded = romFiles.slice(1);

        for (const old of superseded) {
          console.log(`    🗑️  Purging superseded older ROM: "${old.name}"`);
          if (!isDryRun) {
            const oldPath = path.join(subPath, old.name);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            const oldWebp = path.join(subPath, `${path.parse(old.name).name}.webp`);
            if (fs.existsSync(oldWebp)) fs.unlinkSync(oldWebp);
          }
        }
      }

      // Normalize active ROM filename
      const rawActiveName = path.parse(activeRom.name).name;
      const normalizedBaseName = rawActiveName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[’']/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      const romExt = path.extname(activeRom.name).toLowerCase();
      let currentSubPath = subPath;
      let activeRomBase = normalizedBaseName;

      // Rename ROM file if filename contained non-normalized characters
      if (activeRom.name !== `${normalizedBaseName}${romExt}`) {
        console.log(`    🏷️  Normalizing ROM filename: "${activeRom.name}" -> "${normalizedBaseName}${romExt}"`);
        if (!isDryRun) {
          const srcRom = path.join(currentSubPath, activeRom.name);
          const dstRom = path.join(currentSubPath, `${normalizedBaseName}${romExt}`);
          fs.renameSync(srcRom, dstRom);
          activeRom.name = `${normalizedBaseName}${romExt}`;
        }
      }

      // Fix folder / ROM filename mismatch
      if (doOrganize && sub.name !== normalizedBaseName) {
        console.log(`    📁 Renaming folder to match active ROM: "${sub.name}" -> "${normalizedBaseName}"`);
        if (!isDryRun) {
          const targetNewFolderPath = path.join(sysPath, normalizedBaseName);
          if (fs.existsSync(targetNewFolderPath) && targetNewFolderPath !== currentSubPath) {
            console.warn(`    ⚠️ Target folder already exists: ${targetNewFolderPath}`);
          } else {
            fs.renameSync(currentSubPath, targetNewFolderPath);
            currentSubPath = targetNewFolderPath;
          }
        }
      }

      console.log(`  🎮 Active Game: "${normalizedBaseName}"`);

      // Ingest / Convert PNG/JPG/custom screenshots in subfolder to standardized <Clean Title>.webp
      if (doConvertCovers) {
        const refreshedEntries = fs.existsSync(currentSubPath) ? fs.readdirSync(currentSubPath, { withFileTypes: true }) : [];
        const imageFiles = refreshedEntries.filter(e => e.isFile() && ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(e.name).toLowerCase()));
        const targetWebpPath = path.join(currentSubPath, `${activeRomBase}.webp`);

        for (const img of imageFiles) {
          if (img.name === `${activeRomBase}.webp`) continue;

          const srcImgPath = path.join(currentSubPath, img.name);
          console.log(`    🖼️  Converting & replacing cover "${img.name}" -> "${activeRomBase}.webp"`);
          if (!isDryRun) {
            if (fs.existsSync(targetWebpPath) && targetWebpPath !== srcImgPath) {
              fs.unlinkSync(targetWebpPath);
            }
            const ok = convertImageToWebp(srcImgPath, targetWebpPath);
            if (ok && srcImgPath !== targetWebpPath && fs.existsSync(srcImgPath)) {
              fs.unlinkSync(srcImgPath);
            }
          }
        }
      }

      // Fetch Libretro CDN cover & generate clean metadata.json sidecar
      if (doFetchMetadata) {
        const metaPath = path.join(currentSubPath, 'metadata.json');
        const webpPath = path.join(currentSubPath, `${activeRomBase}.webp`);
        const hasLocalMeta = fs.existsSync(metaPath);
        const hasLocalCover = fs.existsSync(webpPath);

        const sysKey = EXTENSION_MAP[romExt] || sysFolderName;
        const sysName = SYSTEM_NAMES[sysKey] || sysFolderName;
        const cleanTitle = sanitizeTitle(activeRomBase);

        // Extract year from filename if present
        const yearMatch = activeRomBase.match(/\b(19\d{2}|20\d{2})\b/);
        const releaseYear = yearMatch ? yearMatch[1] : 'Classic';

        // 1. Download Libretro cover if no local cover exists or force overwrite is on
        if ((!hasLocalCover || doForce) && !isDryRun) {
          const libretroCoverUrl = await checkLibretroCover(sysKey, activeRomBase);
          if (libretroCoverUrl) {
            const tempPng = path.join(currentSubPath, `temp_boxart.png`);
            const downloaded = await downloadFile(libretroCoverUrl, tempPng);
            if (downloaded) {
              convertImageToWebp(tempPng, webpPath);
              if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng);
              console.log(`    ✅ Downloaded authentic Libretro CDN box art to WebP`);
            }
          }
        }

        // 2. Create clean sidecar if missing or forced (Title strictly uses the exact filename)
        if (!hasLocalMeta || doForce) {
          const metadataObj = {
            title: activeRomBase,
            description: `Authentic ${sysName} release of ${activeRomBase}.`,
            releaseYear: releaseYear,
            developer: sysName,
            publisher: sysName,
            genre: 'Retro Classic'
          };

          if (!isDryRun) {
            fs.writeFileSync(metaPath, JSON.stringify(metadataObj, null, 2));
            console.log(`    ✅ Generated clean metadata.json (Title: "${activeRomBase}")`);
          }
        }
      }
    }
  }

  console.log(`\n✨ [UPDATE-ROMS] Finished Libretro ROM processing successfully.\n`);
}

processRoms();

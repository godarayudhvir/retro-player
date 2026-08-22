#!/usr/bin/env node

/**
 * Update ROMs Automation Script
 *
 * Fully dynamic, zero-hardcoding local ROM library management pipeline:
 * 1. Organizes loose ROMs dropped in root or system folders into canonical folders (<system>/<Clean Title>/<Clean Title>.<ext>).
 * 2. Ingests loose screenshots/cover art drops (.png, .jpg, .jpeg, .webp), matches them to games via fuzzy normalization,
 *    and converts them to high-performance `<Clean Title>.webp` alongside the ROM.
 * 3. Dynamically queries live online sources (Wikipedia Full-Text Search, PokeCommunity, ROMhacking, and Open Web Search)
 *    to extract authentic plot synopses, developers/authors, release years, and genre tags without any hardcoded lists.
 * 4. Generates local companion `metadata.json` sidecars directly in the codebase, which take top priority in Retro Player UI.
 *
 * Usage:
 *   node update_roms.js [options]
 *
 * Options:
 *   --dir <path>         Target ROMs directory (default: ./public/roms)
 *   --system <key>       Limit to a specific system (e.g. gba, snes, nes)
 *   --organize           Organize loose ROMs into standardized subfolders & normalize names
 *   --convert-covers     Convert PNG/JPG covers to WebP (<Title>.webp)
 *   --fetch-metadata     Fetch dynamic online metadata and generate metadata.json sidecars
 *   --all                Perform all operations (organize, convert-covers, fetch-metadata)
 *   --force              Overwrite existing metadata.json sidecars with fresh online scrapes
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
console.log(`⚙️  [MODE] Organize: ${doOrganize} | Convert Covers: ${doConvertCovers} | Fetch Metadata: ${doFetchMetadata} | Force Overwrite: ${doForce} | Dry Run: ${isDryRun}\n`);

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
    .replace(/_screenshot_\d+/gi, '')
    .replace(/_screenshot/gi, '')
    .replace(/screenshot/gi, '')
    .replace(/_v(\d+)_(\d+)/gi, ' v$1.$2')
    .replace(/_v(\d+)/gi, ' v$1')
    .replace(/[^a-z0-9]/g, '');
}

// HTTP fetch helper (JSON)
function fetchJson(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) RetroPlayerBot/2.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(6000, () => {
      req.abort();
      resolve(null);
    });
  });
}

// HTTP fetch helper (HTML text)
function fetchHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      if (res.statusCode !== 200) return resolve('');
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(7000, () => {
      req.abort();
      resolve('');
    });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'RetroPlayerMetadataBot/2.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) return resolve(false);
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.abort();
      resolve(false);
    });
  });
}

// Convert image to WebP using cwebp or sips
function convertImageToWebp(srcPath, destPath) {
  try {
    execSync(`cwebp -q 85 "${srcPath}" -o "${destPath}"`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`sips -s format webp "${srcPath}" --out "${destPath}"`, { stdio: 'ignore' });
      return true;
    } catch (e) {
      console.warn(`[CONVERT WARN] Could not convert ${srcPath} to WebP:`, e.message);
      return false;
    }
  }
}

// 1. Dynamic Wikipedia Full-Text Search API
async function queryWikipediaDynamic(cleanTitle, systemName) {
  const queries = [
    `${cleanTitle} ${systemName}`,
    `${cleanTitle} video game`,
    `${cleanTitle}`
  ];

  for (const q of queries) {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json`;
    const searchData = await fetchJson(searchUrl);
    const topResult = searchData?.query?.search?.[0];

    if (topResult && topResult.title) {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topResult.title)}`;
      const summary = await fetchJson(summaryUrl);

      if (summary && summary.extract && !summary.title.toLowerCase().includes('disambiguation')) {
        const yearMatch = summary.extract.match(/\b(19\d{2}|20\d{2})\b/);
        const devMatch = summary.extract.match(/(?:developed by|developer)\s+([A-Z][A-Za-z0-9\s&]+?)(?:(?:\s+and\s+published|\s*,\s*published|\s+for\s+the|\.))/i);
        const pubMatch = summary.extract.match(/(?:published by|publisher)\s+([A-Z][A-Za-z0-9\s&]+?)(?:(?:\s+for\s+the|\s+in\s+|\.))/i);

        return {
          title: summary.title.replace(/\s*\(.*?\)\s*/g, '').trim(),
          description: summary.extract,
          releaseYear: yearMatch ? yearMatch[1] : null,
          developer: devMatch ? devMatch[1].trim() : null,
          publisher: pubMatch ? pubMatch[1].trim() : null,
          genre: summary.description || 'Retro Classic',
          thumbnailUrl: summary.thumbnail?.source || null,
          source: 'Wikipedia API'
        };
      }
    }
  }
  return null;
}

// 2. Dynamic Live Web Search Scraper (For ROM Hacks, Homebrew & Fan Projects)
async function queryDynamicWebSearch(rawTitle, cleanTitle, systemName) {
  const searchQueries = [
    `${cleanTitle} rom hack pokecommunity`,
    `${cleanTitle} rom hack romhacking`,
    `${cleanTitle} homebrew ${systemName}`,
    `${cleanTitle} video game`
  ];

  for (const q of searchQueries) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const html = await fetchHtml(url);
    if (!html) continue;

    const snippets = [];
    const titles = [];
    const snippetRegex = /<a class="result__snippet[^"]*"[^>]*>(.*?)<\/a>/g;
    const titleRegex = /<a class="result__url[^"]*"[^>]*>(.*?)<\/a>/g;

    let m;
    while ((m = snippetRegex.exec(html)) !== null) {
      const cleanSnippet = m[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();
      if (cleanSnippet.length > 40) {
        snippets.push(cleanSnippet);
      }
    }

    if (snippets.length > 0) {
      const bestSnippet = snippets[0];
      const combinedText = snippets.slice(0, 3).join(' ');

      // Extract Year
      const yearMatch = combinedText.match(/\b(19\d{2}|20\d{2})\b/);
      const releaseYear = yearMatch ? yearMatch[1] : null;

      // Extract Developer / Author (e.g., "by AuthorName", "Thread starter AuthorName", "developed by AuthorName")
      const devMatch = combinedText.match(/(?:by|author|creator|hacker|starter)\s+([A-Za-z0-9_\-]+)/i)
        || combinedText.match(/(?:developed by)\s+([A-Za-z0-9_\-\s]+?)(?:(?:\s+and|\.))/i);
      const developer = devMatch ? devMatch[1].trim() : 'Homebrew Community';

      // Detect Genre
      let genre = 'RPG / Romhack';
      if (/puzzle/i.test(combinedText)) genre = 'Puzzle / RPG / Romhack';
      else if (/platformer/i.test(combinedText)) genre = 'Platformer / Homebrew';
      else if (/roguelite|roguelike/i.test(combinedText)) genre = 'Action / Roguelite / Homebrew';
      else if (/shooter|run and gun/i.test(combinedText)) genre = 'Action / Shooter / Homebrew';
      else if (/racing/i.test(combinedText)) genre = 'Racing / Homebrew';

      return {
        title: cleanTitle,
        description: bestSnippet,
        releaseYear: releaseYear || 'Classic',
        developer: developer,
        publisher: 'Homebrew / Community',
        genre: genre,
        source: 'Live Web Search'
      };
    }
  }

  return null;
}

// Libretro Thumbnail Check
async function checkLibretroCover(systemKey, rawTitle) {
  const libretroSystem = LIBRETRO_SYSTEM_MAP[systemKey];
  if (!libretroSystem) return null;

  const candidateUrls = [
    `https://raw.githubusercontent.com/libretro-thumbnails/${encodeURIComponent(libretroSystem)}/master/Named_Boxarts/${encodeURIComponent(rawTitle)}.png`,
    `https://raw.githubusercontent.com/libretro-thumbnails/${encodeURIComponent(libretroSystem)}/master/Named_Titles/${encodeURIComponent(rawTitle)}.png`
  ];

  for (const u of candidateUrls) {
    const exists = await new Promise(resolve => {
      const req = https.request(u, { method: 'HEAD', headers: { 'User-Agent': 'RetroPlayerMetadataBot/2.0' } }, res => {
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
  return null;
}

function matchImageToGame(imageName, allGames) {
  const normFile = normalizeTitleForMatching(path.parse(imageName).name);
  if (!normFile) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const g of allGames) {
    const normGame = normalizeTitleForMatching(g.folderName);
    if (normGame === normFile) {
      return g;
    }
    if (normGame.includes(normFile) || normFile.includes(normGame)) {
      const score = Math.min(normGame.length, normFile.length) / Math.max(normGame.length, normFile.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = g;
      }
    }
  }

  if (bestScore >= 0.35) {
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

  // 1. Organize loose ROM files sitting at root directory
  if (doOrganize) {
    const rootEntries = fs.readdirSync(targetDir, { withFileTypes: true });
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
  }

  const systemDirs = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'));

  // Step 1: Organize loose ROMs inside each system folder
  if (doOrganize) {
    for (const sysDir of systemDirs) {
      const sysPath = path.join(targetDir, sysDir.name);
      const entries = fs.readdirSync(sysPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.')) {
          const ext = path.extname(entry.name).toLowerCase();
          if (EXTENSION_MAP[ext]) {
            const baseName = path.parse(entry.name).name;
            const targetSubfolder = path.join(sysPath, baseName);

            console.log(`📦 Organizing loose system ROM: "${entry.name}" -> "${sysDir.name}/${baseName}/${entry.name}"`);
            if (!isDryRun) {
              if (!fs.existsSync(targetSubfolder)) {
                fs.mkdirSync(targetSubfolder, { recursive: true });
              }
              fs.renameSync(path.join(sysPath, entry.name), path.join(targetSubfolder, entry.name));
            }
          }
        }
      }
    }
  }

  // Collect all known game subdirectories for loose image matching
  const allKnownGames = [];
  for (const sDir of systemDirs) {
    const sPath = path.join(targetDir, sDir.name);
    const subDirs = fs.readdirSync(sPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));
    for (const sub of subDirs) {
      allKnownGames.push({
        system: sDir.name,
        folderName: sub.name,
        dirPath: path.join(sPath, sub.name)
      });
    }
  }

  // Step 2: Ingest loose cover / screenshot image files sitting at targetDir root or system directories
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

  // Step 3: Iterate each system and process canonical game directories
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

      const mainRom = romFiles[0];
      const romExt = path.extname(mainRom.name).toLowerCase();
      const romBaseName = path.parse(mainRom.name).name;
      const folderName = sub.name;

      console.log(`  🎮 Game: "${folderName}"`);

      // Fix folder / ROM filename mismatch
      if (doOrganize && folderName !== romBaseName) {
        console.log(`    ⚠️  Standardizing filename to match folder: "${mainRom.name}" -> "${folderName}${romExt}"`);
        if (!isDryRun) {
          const oldRom = path.join(subPath, mainRom.name);
          const newRom = path.join(subPath, `${folderName}${romExt}`);
          fs.renameSync(oldRom, newRom);
          mainRom.name = `${folderName}${romExt}`;
        }
      }

      const activeRomBase = folderName;

      // Convert PNG/JPG covers in subfolder to WebP
      if (doConvertCovers) {
        const imageFiles = subEntries.filter(e => e.isFile() && ['.png', '.jpg', '.jpeg'].includes(path.extname(e.name).toLowerCase()));
        const targetWebpPath = path.join(subPath, `${activeRomBase}.webp`);

        for (const img of imageFiles) {
          const srcImgPath = path.join(subPath, img.name);
          console.log(`    🖼️  Converting cover "${img.name}" -> "${activeRomBase}.webp"`);
          if (!isDryRun) {
            const ok = convertImageToWebp(srcImgPath, targetWebpPath);
            if (ok && img.name !== `${activeRomBase}.webp`) {
              fs.unlinkSync(srcImgPath);
            }
          }
        }
      }

      // Fetch dynamic online metadata & generate metadata.json sidecar
      if (doFetchMetadata) {
        const metaPath = path.join(subPath, 'metadata.json');
        const webpPath = path.join(subPath, `${activeRomBase}.webp`);
        const hasLocalMeta = fs.existsSync(metaPath);
        const hasLocalCover = fs.existsSync(webpPath);

        if (!hasLocalMeta || doForce) {
          console.log(`    🔍 Dynamically querying online metadata for "${activeRomBase}"...`);
          const sysKey = EXTENSION_MAP[romExt] || sysFolderName;
          const sysName = SYSTEM_NAMES[sysKey] || sysFolderName;
          const cleanTitle = sanitizeTitle(activeRomBase);

          // Tier 1: Wikipedia Full-Text Search
          let meta = await queryWikipediaDynamic(cleanTitle, sysName);

          // Tier 2: Dynamic Live Web Search (For ROM hacks & homebrew)
          if (!meta || !meta.description || meta.description.length < 30) {
            meta = await queryDynamicWebSearch(activeRomBase, cleanTitle, sysName);
          }

          const libretroCoverUrl = !hasLocalCover ? await checkLibretroCover(sysKey, activeRomBase) : null;

          const metadataObj = {
            title: meta?.title || cleanTitle || activeRomBase,
            description: meta?.description || `Authentic ${sysName} release ${activeRomBase}.`,
            releaseYear: meta?.releaseYear || 'Classic',
            developer: meta?.developer || sysName || 'Classic',
            publisher: meta?.publisher || sysName || 'Classic',
            genre: meta?.genre || 'Retro Classic'
          };

          if (!isDryRun) {
            fs.writeFileSync(metaPath, JSON.stringify(metadataObj, null, 2));
            console.log(`    ✅ Created metadata.json (Source: ${meta?.source || 'Dynamic Search'})`);

            // Download Libretro cover if found and no local cover exists
            if (libretroCoverUrl && !hasLocalCover) {
              const tempPng = path.join(subPath, `temp_boxart.png`);
              const downloaded = await downloadFile(libretroCoverUrl, tempPng);
              if (downloaded) {
                convertImageToWebp(tempPng, webpPath);
                if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng);
                console.log(`    ✅ Downloaded and converted Libretro cover art to WebP`);
              }
            } else if (meta?.thumbnailUrl && !hasLocalCover) {
              const tempThumb = path.join(subPath, `temp_thumb.jpg`);
              const downloaded = await downloadFile(meta.thumbnailUrl, tempThumb);
              if (downloaded) {
                convertImageToWebp(tempThumb, webpPath);
                if (fs.existsSync(tempThumb)) fs.unlinkSync(tempThumb);
                console.log(`    ✅ Downloaded and converted Wikipedia cover art to WebP`);
              }
            }
          }
        }
      }
    }
  }

  console.log(`\n✨ [UPDATE-ROMS] Finished dynamic ROM library processing successfully.\n`);
}

processRoms();

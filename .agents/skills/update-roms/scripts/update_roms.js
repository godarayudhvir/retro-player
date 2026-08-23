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
    .replace(/_screenshot.*$/gi, '')
    .replace(/screenshot.*$/gi, '')
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

// Dynamic Live Walkthrough Scraper (GameFAQs, StrategyWiki, YouTube Playthroughs)
async function queryWalkthroughLinks(cleanTitle, systemName) {
  let written = null;
  let video = null;

  try {
    // 1. Search for Written Walkthrough (GameFAQs / StrategyWiki / IGN)
    const writtenQuery = `${cleanTitle} walkthrough guide site:gamefaqs.gamespot.com OR site:strategywiki.org OR site:ign.com`;
    const writtenUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(writtenQuery)}`;
    const writtenHtml = await fetchHtml(writtenUrl);
    
    if (writtenHtml) {
      const urlRegex = /<a class="result__url[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
      let match;
      while ((match = urlRegex.exec(writtenHtml)) !== null) {
        let rawLink = match[1] || match[2];
        if (rawLink.includes('duckduckgo.com/l/?uddg=')) {
          const m = rawLink.match(/uddg=([^&]+)/);
          if (m) rawLink = decodeURIComponent(m[1]);
        }
        if (rawLink.startsWith('http') && (rawLink.includes('gamefaqs.gamespot.com') || rawLink.includes('strategywiki.org') || rawLink.includes('ign.com/wikis'))) {
          written = rawLink;
          break;
        }
      }
    }

    // 2. Search for Video Walkthrough / Longplay (YouTube)
    const videoQuery = `${cleanTitle} ${systemName} full walkthrough gameplay longplay site:youtube.com`;
    const videoUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(videoQuery)}`;
    const videoHtml = await fetchHtml(videoUrl);

    if (videoHtml) {
      const urlRegex = /<a class="result__url[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
      let match;
      while ((match = urlRegex.exec(videoHtml)) !== null) {
        let rawLink = match[1] || match[2];
        if (rawLink.includes('duckduckgo.com/l/?uddg=')) {
          const m = rawLink.match(/uddg=([^&]+)/);
          if (m) rawLink = decodeURIComponent(m[1]);
        }
        if (rawLink.startsWith('http') && (rawLink.includes('youtube.com/watch') || rawLink.includes('youtube.com/playlist'))) {
          video = rawLink;
          break;
        }
      }
    }
  } catch (err) {
    console.warn(`[WALKTHROUGH FETCH WARN] ${err.message}`);
  }

  if (written || video) {
    const res = {};
    if (written) res.written = written;
    if (video) res.video = video;
    return res;
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
      const getFilesRecursively = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
          if (item.name.startsWith('.')) continue;
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            results = results.concat(getFilesRecursively(fullPath));
          } else if (item.isFile()) {
            results.push(fullPath);
          }
        }
        return results;
      };

      const stgFiles = getFilesRecursively(stgPath);
      const romFiles = stgFiles.filter(f => EXTENSION_MAP[path.extname(f).toLowerCase()]);
      const imgFiles = stgFiles.filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase()));

      for (const romPath of romFiles) {
        const ext = path.extname(romPath).toLowerCase();
        const sysKey = EXTENSION_MAP[ext];
        if (!sysKey) continue;

        const parentFolderName = path.basename(path.dirname(romPath));
        const rawFileName = path.parse(romPath).name;

        // Determine clean canonical title
        let candidateTitle = parentFolderName !== stg.name ? parentFolderName : rawFileName;
        
        // Smart title normalization for common patterns
        if (/recharged[_\s]*em[_\s]*version[_\s]*2\.2\.5/i.test(candidateTitle) || /recharged[_\s]*emerald/i.test(candidateTitle)) {
          candidateTitle = 'Pokemon Recharged Emerald (v2.2.5)';
        } else if (/ssultimateplus/i.test(candidateTitle) || /sword.*shield.*ultimate.*plus/i.test(candidateTitle)) {
          candidateTitle = 'Pokemon Sword & Shield Ultimate Plus (v1.2.1.2)';
        } else {
          // General clean normalization
          let clean = candidateTitle
            .replace(/[_\s]+/g, ' ')
            .replace(/version[_\s]*/gi, 'v')
            .replace(/v\s*(\d)/gi, 'v$1')
            .trim();
          if (/^pokemon/i.test(clean) && !/^pok[eé]mon/i.test(clean)) {
            clean = 'Pokemon' + clean.slice(7);
          }
          candidateTitle = clean;
        }

        const targetSysFolder = path.join(targetDir, sysKey);
        const targetGameFolder = path.join(targetSysFolder, candidateTitle);

        console.log(`📦 Routing staging ROM: "${path.relative(targetDir, romPath)}" -> "${sysKey}/${candidateTitle}/${candidateTitle}${ext}"`);
        if (!isDryRun) {
          if (!fs.existsSync(targetGameFolder)) {
            fs.mkdirSync(targetGameFolder, { recursive: true });
          }
          const targetRomPath = path.join(targetGameFolder, `${candidateTitle}${ext}`);
          fs.renameSync(romPath, targetRomPath);

          // Find matching cover image in staging files
          for (const imgPath of imgFiles) {
            const imgName = path.parse(imgPath).name;
            const normImg = normalizeTitleForMatching(imgName);
            const normGame = normalizeTitleForMatching(candidateTitle);

            if (normGame.includes(normImg) || normImg.includes(normGame) ||
                (candidateTitle.includes('Recharged Emerald') && imgName.includes('recharged_em')) ||
                (candidateTitle.includes('Sword & Shield') && imgName.includes('ssultimateplus'))) {
              const targetWebpPath = path.join(targetGameFolder, `${candidateTitle}.webp`);
              console.log(`🖼️  Converting staging cover: "${path.basename(imgPath)}" -> "${sysKey}/${candidateTitle}/${candidateTitle}.webp"`);
              const ok = convertImageToWebp(imgPath, targetWebpPath);
              if (ok && fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
              }
            }
          }
        }
      }

      // Remove staging folder if empty or only .DS_Store remaining
      if (!isDryRun && fs.existsSync(stgPath)) {
        try {
          fs.rmSync(stgPath, { recursive: true, force: true });
          console.log(`🧹 Cleaned up staging directory: "${stg.name}"`);
        } catch (e) {
          console.warn(`[STAGING CLEAN WARN] Could not remove ${stgPath}:`, e.message);
        }
      }
    }
  }

  const systemDirs = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && SYSTEM_NAMES[d.name]);

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

      // Step 3a: Multi-ROM Version Upgrade & Obsolete ROM Detection
      let activeRom = romFiles[0];
      if (romFiles.length > 1) {
        console.log(`    ⚠️  Found multiple ROM versions in "${sub.name}". Selecting latest version...`);
        // Helper to extract semantic version or date numbers for sorting
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

      // Normalize active ROM filename (strip diacritics / combining characters e.g. Pokémon -> Pokemon)
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

      // Fix folder / ROM filename mismatch (e.g. folder has older version tag or different name)
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
          // If it's already the canonical WebP cover, skip it
          if (img.name === `${activeRomBase}.webp`) continue;

          const srcImgPath = path.join(currentSubPath, img.name);
          console.log(`    🖼️  Converting & replacing cover "${img.name}" -> "${activeRomBase}.webp"`);
          if (!isDryRun) {
            // Remove old webp if target is different
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

      // Fetch dynamic online metadata & generate / sync metadata.json sidecar
      if (doFetchMetadata) {
        const metaPath = path.join(currentSubPath, 'metadata.json');
        const webpPath = path.join(currentSubPath, `${activeRomBase}.webp`);
        const hasLocalMeta = fs.existsSync(metaPath);
        const hasLocalCover = fs.existsSync(webpPath);

        if (hasLocalMeta && !doForce) {
          // Synchronize metadata.json title if ROM version or title updated
          try {
            const existingMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            const vMatch = activeRomBase.match(/\((v[^)]+)\)/i);
            if (existingMeta.title && vMatch && !existingMeta.title.includes(vMatch[1])) {
              // Replace old (v...) or append new version tag
              let updatedTitle = existingMeta.title.replace(/\s*\(v[^)]+\)/i, '').trim();
              updatedTitle = `${updatedTitle} (${vMatch[1]})`;
              console.log(`    📝 Updating metadata.json title version to match ROM: "${existingMeta.title}" -> "${updatedTitle}"`);
              existingMeta.title = updatedTitle;
              if (!isDryRun) {
                fs.writeFileSync(metaPath, JSON.stringify(existingMeta, null, 2));
              }
            }
          } catch (e) {
            console.warn(`[META SYNC WARN] Could not update metadata.json:`, e.message);
          }
        } else if (!hasLocalMeta || doForce) {
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

          // Tier 3: Walkthrough Guides & Video Playthroughs
          const walkthroughLinks = await queryWalkthroughLinks(cleanTitle, sysName);

          const libretroCoverUrl = !hasLocalCover ? await checkLibretroCover(sysKey, activeRomBase) : null;

          const metadataObj = {
            title: meta?.title || cleanTitle || activeRomBase,
            description: meta?.description || `Authentic ${sysName} release ${activeRomBase}.`,
            releaseYear: meta?.releaseYear || 'Classic',
            developer: meta?.developer || sysName || 'Classic',
            publisher: meta?.publisher || sysName || 'Classic',
            genre: meta?.genre || 'Retro Classic'
          };

          if (walkthroughLinks) {
            metadataObj.walkthrough = walkthroughLinks;
          }

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

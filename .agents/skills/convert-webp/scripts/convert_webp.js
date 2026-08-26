#!/usr/bin/env node

/**
 * Convert WebP Automation Script
 *
 * Scans directories for image files (.png, .jpg, .jpeg), converts them to
 * high-performance .webp format using `cwebp` (or `sips`), verifies successful
 * creation, and safely deletes original source files.
 *
 * Usage:
 *   node convert_webp.js [options]
 *
 * Options:
 *   --dir <path>         Target directory (default: ./public/roms)
 *   --system <name>      Target a specific system subfolder (e.g. gba, snes, nes)
 *   --quality <number>   WebP compression quality (default: 85)
 *   --keep-originals     Keep original images instead of deleting them
 *   --dry-run            Simulate operations without writing or deleting files
 */

import fs from 'fs';
import path from 'path';
import { execFileSync, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags
const args = process.argv.slice(2);
let targetDir = path.resolve(process.cwd(), 'public/roms');
let quality = 85;
let keepOriginals = false;
let isDryRun = false;
let systemFilter = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--dir' && args[i + 1]) {
    targetDir = path.resolve(process.cwd(), args[++i]);
  } else if (arg === '--system' && args[i + 1]) {
    systemFilter = args[++i].toLowerCase();
  } else if (arg === '--quality' && args[i + 1]) {
    quality = parseInt(args[++i], 10) || 85;
  } else if (arg === '--keep-originals') {
    keepOriginals = true;
  } else if (arg === '--dry-run') {
    isDryRun = true;
  }
}

if (systemFilter) {
  targetDir = path.join(targetDir, systemFilter);
}

console.log(`\n🖼️  [CONVERT-WEBP] Target Directory: ${targetDir}`);
console.log(`⚙️  [SETTINGS] Quality: ${quality}% | Delete Originals: ${!keepOriginals} | Dry Run: ${isDryRun}\n`);

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Error: Directory not found: ${targetDir}`);
  process.exit(1);
}

// Determine available converter binary
let converter = 'cwebp';
try {
  execSync('which cwebp', { stdio: 'ignore' });
} catch {
  try {
    execSync('which sips', { stdio: 'ignore' });
    converter = 'sips';
  } catch {
    console.error('❌ Error: Neither `cwebp` nor macOS `sips` is installed on your system.');
    process.exit(1);
  }
}

console.log(`⚡ Using converter engine: ${converter}\n`);

// Helper to recursively find all PNG / JPG / JPEG files
function findImages(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(findImages(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

const imageFiles = findImages(targetDir);
console.log(`🔍 Found ${imageFiles.length} image files to convert.\n`);

if (imageFiles.length === 0) {
  console.log('✅ No PNG/JPG images found to convert.');
  process.exit(0);
}

let convertedCount = 0;
let deletedCount = 0;
let totalBytesSaved = 0;
let errors = [];

for (let i = 0; i < imageFiles.length; i++) {
  const srcPath = imageFiles[i];
  const dir = path.dirname(srcPath);
  const ext = path.extname(srcPath);
  const baseName = path.basename(srcPath, ext);
  const destPath = path.join(dir, `${baseName}.webp`);

  const srcStat = fs.statSync(srcPath);
  const srcSize = srcStat.size;

  if (isDryRun) {
    console.log(`[DRY RUN] Would convert "${path.basename(srcPath)}" -> "${baseName}.webp" (${(srcSize / 1024).toFixed(1)} KB)`);
    continue;
  }

  try {
    if (converter === 'cwebp') {
      execFileSync('cwebp', ['-q', String(quality), srcPath, '-o', destPath], { stdio: 'ignore' });
    } else {
      execFileSync('sips', ['-s', 'format', 'webp', srcPath, '--out', destPath], { stdio: 'ignore' });
    }

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      const destSize = fs.statSync(destPath).size;
      convertedCount++;
      const saved = srcSize - destSize;
      totalBytesSaved += saved;

      if (!keepOriginals) {
        fs.unlinkSync(srcPath);
        deletedCount++;
      }

      console.log(`✅ [${i + 1}/${imageFiles.length}] Converted: "${baseName}.webp" (${(srcSize / 1024).toFixed(1)} KB -> ${(destSize / 1024).toFixed(1)} KB)`);
    } else {
      throw new Error('Converted WebP file was not created or has 0 bytes.');
    }
  } catch (err) {
    console.error(`❌ Error converting "${srcPath}":`, err.message);
    errors.push({ file: srcPath, error: err.message });
  }
}

console.log('\n' + '='.repeat(50));
console.log('🏁 [SUMMARY]');
console.log(`  - Converted to WebP: ${convertedCount}`);
console.log(`  - Original Files Deleted: ${deletedCount}`);
console.log(`  - Total Storage Saved: ${(totalBytesSaved / (1024 * 1024)).toFixed(2)} MB`);
if (errors.length > 0) {
  console.log(`  - Failed: ${errors.length}`);
}
console.log('='.repeat(50) + '\n');

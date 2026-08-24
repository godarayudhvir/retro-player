#!/usr/bin/env node

/**
 * bump_version.js
 * 
 * Automates bumping application version across all project files:
 * - package.json & package-lock.json
 * - public/sw.js (Service Worker cache key)
 * - public/manifest.webmanifest (PWA manifest version)
 * - src/components/AboutInfoModal.jsx (In-app version tag)
 * - public/llms.txt (AI documentation context)
 * - README.md (Version status badge)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../');

// Parse target version argument
const rawArg = process.argv[2];
if (!rawArg) {
  console.error('Error: Version argument required (e.g. node bump_version.js 1.0.0 or node bump_version.js v1.0)');
  process.exit(1);
}

// Clean version to standard semver (e.g. "v1.0" -> "1.0.0", "1.2" -> "1.2.0")
let cleanVer = rawArg.trim().replace(/^v/i, '');
const parts = cleanVer.split('.');
while (parts.length < 3) {
  parts.push('0');
}
cleanVer = parts.slice(0, 3).join('.');
const tagVer = `v${cleanVer}`;

console.log(`\n📦 Bumping Retro Player to version: ${cleanVer} (${tagVer})\n`);

let updatedCount = 0;

// 1. package.json
const pkgPath = path.join(ROOT_DIR, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = cleanVer;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package.json -> ${cleanVer}`);
  updatedCount++;
}

// 2. package-lock.json
const pkgLockPath = path.join(ROOT_DIR, 'package-lock.json');
if (fs.existsSync(pkgLockPath)) {
  const pkgLock = JSON.parse(fs.readFileSync(pkgLockPath, 'utf8'));
  pkgLock.version = cleanVer;
  if (pkgLock.packages && pkgLock.packages['']) {
    pkgLock.packages[''].version = cleanVer;
  }
  fs.writeFileSync(pkgLockPath, JSON.stringify(pkgLock, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package-lock.json -> ${cleanVer}`);
  updatedCount++;
}

// 3. public/sw.js (Service Worker Cache Name)
const swPath = path.join(ROOT_DIR, 'public/sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  const cacheRegex = /const CACHE_NAME = ['"][^'"]+['"];/;
  const newCacheLine = `const CACHE_NAME = 'retro-player-${tagVer}';`;
  if (cacheRegex.test(swContent)) {
    swContent = swContent.replace(cacheRegex, newCacheLine);
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log(`✅ Updated public/sw.js CACHE_NAME -> retro-player-${tagVer}`);
    updatedCount++;
  }
}

// 4. public/manifest.webmanifest (PWA Manifest)
const manifestPath = path.join(ROOT_DIR, 'public/manifest.webmanifest');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = cleanVer;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated public/manifest.webmanifest version -> ${cleanVer}`);
  updatedCount++;
}

// 5. src/components/AboutInfoModal.jsx
const aboutModalPath = path.join(ROOT_DIR, 'src/components/AboutInfoModal.jsx');
if (fs.existsSync(aboutModalPath)) {
  let modalContent = fs.readFileSync(aboutModalPath, 'utf8');
  // Look for version span or header
  if (modalContent.includes('className="info-version-badge"')) {
    modalContent = modalContent.replace(
      /<span className="info-version-badge">[^<]+<\/span>/,
      `<span className="info-version-badge">${tagVer}</span>`
    );
  } else {
    modalContent = modalContent.replace(
      /<h2>Retro Player<\/h2>/,
      `<h2>Retro Player</h2>\n            <span className="info-version-badge">${tagVer}</span>`
    );
  }
  fs.writeFileSync(aboutModalPath, modalContent, 'utf8');
  console.log(`✅ Updated src/components/AboutInfoModal.jsx -> ${tagVer}`);
  updatedCount++;
}

// 6. public/llms.txt
const llmsPath = path.join(ROOT_DIR, 'public/llms.txt');
if (fs.existsSync(llmsPath)) {
  let llmsContent = fs.readFileSync(llmsPath, 'utf8');
  if (!llmsContent.includes(`(Release ${tagVer})`)) {
    llmsContent = llmsContent.replace(
      /# Retro Player.*?\n/i,
      `# Retro Player (${tagVer})\n`
    );
    fs.writeFileSync(llmsPath, llmsContent, 'utf8');
    console.log(`✅ Updated public/llms.txt -> ${tagVer}`);
    updatedCount++;
  }
}

// 7. README.md (Version status badge)
const readmePath = path.join(ROOT_DIR, 'README.md');
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  const badgeRegex = /\[!\[Version[^\]]*\]\(https:\/\/img\.shields\.io\/badge\/Version-[^)]+\)\]\([^)]+\)/i;
  const newBadge = `[![Version: ${tagVer}](https://img.shields.io/badge/Version-${tagVer.replace('-', '--')}-emerald?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/godarayudhvir/retro-player)`;

  if (badgeRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(badgeRegex, newBadge);
  } else {
    // Insert after Live Demo badge
    readmeContent = readmeContent.replace(
      /(\[!\[Live Web Demo\][^\n]+\n)/,
      `$1${newBadge}\n`
    );
  }
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log(`✅ Updated README.md version badge -> ${tagVer}`);
  updatedCount++;
}

console.log(`\n🎉 Successfully synchronized ${updatedCount} files to ${tagVer}!\n`);

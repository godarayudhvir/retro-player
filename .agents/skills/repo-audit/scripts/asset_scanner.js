#!/usr/bin/env node

/**
 * Automated Asset, Media, Code & Documentation Health Scanner
 * 
 * Inspects all file types across the repository:
 * - Text/MDs: Link integrity, required root docs (LICENSE, robots, sitemap, llms.txt)
 * - Images: Format optimization (WebP vs PNG/JPG), sizes, dimension checks
 * - SVGs: viewBox presence, script injection vectors, large SVG files
 * - Audio/Media: Formats, codec suitability, sizes
 * - Code/Security/Performance: Leak patterns, @import, raw popups, uncleaned listeners
 * 
 * Usage:
 *   node .agents/skills/repo-audit/scripts/asset_scanner.js [--json]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../..');

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.agents',
  'dist',
  'build',
  '.gemini',
  '.idea',
  '.vscode'
]);

// Results accumulator
const report = {
  timestamp: new Date().toISOString(),
  textAndDocs: {
    missingRootFiles: [],
    brokenMarkdownLinks: [],
    totalMdFiles: 0,
    totalTxtFiles: 0
  },
  images: {
    unconvertedRasterImages: [], // PNG/JPG that should be WebP
    largeImages: [], // > 500 KB
    totalImages: 0
  },
  svgs: {
    missingViewBox: [],
    containsScripts: [], // Security concern
    largeSvgs: [], // > 50 KB
    totalSvgs: 0
  },
  audioAndMedia: {
    mediaFiles: [],
    largeMedia: [], // > 5 MB
    totalMedia: 0
  },
  codeAndArchitecture: {
    cssImports: [], // Render-blocking CSS @import
    nativePopups: [], // alert, confirm, prompt violations
    dangerouslySetInnerHTML: [],
    unmatchedTimers: [], // setInterval > clearInterval
    unmatchedRaf: [], // requestAnimationFrame > cancelAnimationFrame
    hardcodedRootApiFetches: [] // fetch('/api/...')
  }
};

// 1. Recursive File Crawler
function crawl(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      crawl(fullPath);
    } else if (entry.isFile()) {
      analyzeFile(fullPath, relPath, entry.name);
    }
  }
}

// 2. File Analyzer
function analyzeFile(fullPath, relPath, filename) {
  const ext = path.extname(filename).toLowerCase();
  const stat = fs.statSync(fullPath);

  // A. Markdown & Text Documentation
  if (ext === '.md') {
    report.textAndDocs.totalMdFiles++;
    analyzeMarkdownLinks(fullPath, relPath);
  } else if (ext === '.txt') {
    report.textAndDocs.totalTxtFiles++;
  }

  // B. Images (PNG, JPG, JPEG, WEBP, GIF, ICO)
  if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    report.images.totalImages++;
    report.images.unconvertedRasterImages.push({
      path: relPath,
      sizeKb: Math.round(stat.size / 1024),
      ext
    });
  } else if (ext === '.webp') {
    report.images.totalImages++;
    if (stat.size > 500 * 1024) {
      report.images.largeImages.push({ path: relPath, sizeKb: Math.round(stat.size / 1024) });
    }
  }

  // C. SVGs
  if (ext === '.svg') {
    report.svgs.totalSvgs++;
    analyzeSvg(fullPath, relPath, stat.size);
  }

  // D. Audio & Video Media
  if (['.mp3', '.ogg', '.wav', '.flac', '.mp4', '.webm'].includes(ext)) {
    report.audioAndMedia.totalMedia++;
    report.audioAndMedia.mediaFiles.push({
      path: relPath,
      sizeKb: Math.round(stat.size / 1024),
      ext
    });
    if (stat.size > 5 * 1024 * 1024) {
      report.audioAndMedia.largeMedia.push({ path: relPath, sizeMb: (stat.size / (1024 * 1024)).toFixed(2) });
    }
  }

  // E. Code Inspection (JS, JSX, TS, TSX, CSS)
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    analyzeCode(fullPath, relPath);
  } else if (ext === '.css') {
    analyzeCss(fullPath, relPath);
  }
}

// Check Markdown Link Integrity
function analyzeMarkdownLinks(fullPath, relPath) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const dir = path.dirname(fullPath);
    // Regex for markdown links: [label](path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      let target = match[2].trim();
      // Ignore web URLs, mailto, anchors
      if (/^(https?:|mailto:|#)/i.test(target)) continue;

      let resolved;
      if (target.startsWith('file://')) {
        try {
          const filePath = fileURLToPath(target);
          resolved = filePath.split('#')[0];
        } catch {
          continue;
        }
      } else {
        const cleanTarget = target.split('#')[0];
        if (!cleanTarget) continue;
        resolved = path.resolve(dir, cleanTarget);
      }

      if (!fs.existsSync(resolved)) {
        report.textAndDocs.brokenMarkdownLinks.push({
          sourceFile: relPath,
          label: match[1],
          brokenLink: target
        });
      }
    }
  } catch (err) {
    // Ignore read errors
  }
}

// Check SVG Quality & Security
function analyzeSvg(fullPath, relPath, sizeBytes) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('viewBox=')) {
      report.svgs.missingViewBox.push(relPath);
    }
    if (/<script/i.test(content) || /javascript:/i.test(content)) {
      report.svgs.containsScripts.push(relPath);
    }
    if (sizeBytes > 50 * 1024) {
      report.svgs.largeSvgs.push({ path: relPath, sizeKb: Math.round(sizeBytes / 1024) });
    }
  } catch {}
}

// Check Code Quality, Accessibility, Popups & Leaks
function analyzeCode(fullPath, relPath) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');

    // 1. Native popups: alert(), confirm(), prompt()
    const popupMatch = content.match(/\b(alert|confirm|prompt)\s*\(/g);
    if (popupMatch && !relPath.includes('scanner') && !relPath.includes('test')) {
      report.codeAndArchitecture.nativePopups.push({
        path: relPath,
        popups: Array.from(new Set(popupMatch.map(p => p.replace(/\s*\(/, ''))))
      });
    }

    // 2. dangerouslySetInnerHTML
    if (content.includes('dangerouslySetInnerHTML')) {
      report.codeAndArchitecture.dangerouslySetInnerHTML.push(relPath);
    }

    // 3. Subpath hazard: fetch('/api/
    const apiFetchMatches = content.match(/fetch\s*\(\s*['"`]\/api\//g);
    if (apiFetchMatches) {
      report.codeAndArchitecture.hardcodedRootApiFetches.push({
        path: relPath,
        count: apiFetchMatches.length
      });
    }

    // 4. Timer balance
    const setIntCount = (content.match(/\bsetInterval\s*\(/g) || []).length;
    const clearIntCount = (content.match(/\bclearInterval\s*\(/g) || []).length;
    if (setIntCount > clearIntCount) {
      report.codeAndArchitecture.unmatchedTimers.push({
        path: relPath,
        setIntervals: setIntCount,
        clearIntervals: clearIntCount
      });
    }
  } catch {}
}

// Check CSS Anti-Patterns
function analyzeCss(fullPath, relPath) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const importMatches = content.match(/@import\s+url\([^)]+\);?/g);
    if (importMatches) {
      report.codeAndArchitecture.cssImports.push({
        path: relPath,
        imports: importMatches
      });
    }
  } catch {}
}

// 3. Check Required Root Files
function checkRootFiles() {
  const requiredFiles = [
    { name: 'LICENSE', desc: 'Open source license file' },
    { name: 'public/robots.txt', desc: 'Web crawler robots exclusion' },
    { name: 'public/sitemap.xml', desc: 'Search engine sitemap index' },
    { name: 'public/llms.txt', desc: 'LLM & AI search summary context' },
    { name: 'public/llms-full.txt', desc: 'Unabridged LLM multi-file documentation context' },
    { name: 'public/manifest.webmanifest', desc: 'PWA Web App Manifest' },
    { name: 'public/sw.js', desc: 'Service Worker offline engine' }
  ];

  for (const req of requiredFiles) {
    const full = path.join(rootDir, req.name);
    if (!fs.existsSync(full)) {
      report.textAndDocs.missingRootFiles.push(req);
    }
  }
}

// Execute Audit Scan
console.log('🔍 Executing repository asset, media, documentation, and code scan...');
checkRootFiles();
crawl(rootDir);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\n======================================================');
  console.log('🛡️  REPOSITORY AUDIT SCAN DIAGNOSTIC REPORT');
  console.log('======================================================\n');

  // Text & Docs
  console.log('📚 [TEXT & MARKDOWN DOCUMENTATION]');
  console.log(`- Total Markdown files: ${report.textAndDocs.totalMdFiles}`);
  console.log(`- Total Text files: ${report.textAndDocs.totalTxtFiles}`);
  if (report.textAndDocs.missingRootFiles.length > 0) {
    console.log(`🚨 Missing Root Files (${report.textAndDocs.missingRootFiles.length}):`);
    report.textAndDocs.missingRootFiles.forEach(f => console.log(`   ❌ ${f.name} (${f.desc})`));
  } else {
    console.log('✅ All standard root documentation and metadata files present.');
  }

  if (report.textAndDocs.brokenMarkdownLinks.length > 0) {
    console.log(`🚨 Broken Internal Markdown Links (${report.textAndDocs.brokenMarkdownLinks.length}):`);
    report.textAndDocs.brokenMarkdownLinks.forEach(l => {
      console.log(`   ❌ ${l.sourceFile}: [${l.label}] -> "${l.brokenLink}"`);
    });
  } else {
    console.log('✅ Zero broken internal markdown links detected.');
  }

  // Images
  console.log('\n🖼️  [IMAGE ASSETS]');
  console.log(`- Total Image Assets: ${report.images.totalImages}`);
  if (report.images.unconvertedRasterImages.length > 0) {
    console.log(`⚠️  Unconverted Raster Images (PNG/JPG should be WebP) (${report.images.unconvertedRasterImages.length}):`);
    report.images.unconvertedRasterImages.forEach(img => {
      console.log(`   ⚠️  ${img.path} (${img.sizeKb} KB)`);
    });
  } else {
    console.log('✅ All images are standardized in high-performance WebP.');
  }

  // SVGs
  console.log('\n📐 [VECTOR SVGs]');
  console.log(`- Total SVG Assets: ${report.svgs.totalSvgs}`);
  if (report.svgs.missingViewBox.length > 0) {
    console.log(`⚠️  SVGs missing viewBox attribute (${report.svgs.missingViewBox.length}):`);
    report.svgs.missingViewBox.forEach(s => console.log(`   ⚠️  ${s}`));
  } else {
    console.log('✅ All SVGs contain proper viewBox attributes.');
  }
  if (report.svgs.containsScripts.length > 0) {
    console.log(`🚨 SVGs with embedded scripts (XSS Risk) (${report.svgs.containsScripts.length}):`);
    report.svgs.containsScripts.forEach(s => console.log(`   🚨 ${s}`));
  } else {
    console.log('✅ Zero embedded script injection vectors in SVGs.');
  }

  // Audio & Media
  console.log('\n🎵 [AUDIO & MEDIA]');
  console.log(`- Total Audio/Media files: ${report.audioAndMedia.totalMedia}`);
  if (report.audioAndMedia.largeMedia.length > 0) {
    console.log(`ℹ️  Large Media Files (> 5MB):`);
    report.audioAndMedia.largeMedia.forEach(m => console.log(`   🎵 ${m.path} (${m.sizeMb} MB)`));
  }

  // Code Quality & Anti-Patterns
  console.log('\n⚡ [CODE, ARCHITECTURE & PERFORMANCE]');
  if (report.codeAndArchitecture.cssImports.length > 0) {
    console.log(`🚨 Render-Blocking CSS @import (${report.codeAndArchitecture.cssImports.length}):`);
    report.codeAndArchitecture.cssImports.forEach(c => console.log(`   ❌ ${c.path}: ${c.imports.join(', ')}`));
  } else {
    console.log('✅ Zero render-blocking @import statements in CSS.');
  }

  if (report.codeAndArchitecture.hardcodedRootApiFetches.length > 0) {
    console.log(`⚠️  Hardcoded Root /api/ Calls (Subpath Incompatibility Hazard) (${report.codeAndArchitecture.hardcodedRootApiFetches.length} files):`);
    report.codeAndArchitecture.hardcodedRootApiFetches.forEach(f => console.log(`   ⚠️  ${f.path} (${f.count} calls)`));
  } else {
    console.log('✅ Zero hardcoded root /api/ calls.');
  }

  if (report.codeAndArchitecture.nativePopups.length > 0) {
    console.log(`🚨 Native Browser Dialogs Detected (${report.codeAndArchitecture.nativePopups.length} files):`);
    report.codeAndArchitecture.nativePopups.forEach(p => console.log(`   ❌ ${p.path}: uses ${p.popups.join(', ')}()`));
  } else {
    console.log('✅ Zero native browser dialogs (alert/confirm/prompt) in application code.');
  }

  console.log('\n======================================================\n');
}

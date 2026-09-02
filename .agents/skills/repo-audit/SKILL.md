---
name: repo-audit
description: >-
  Performs a comprehensive, full-system audit of a repository across all file types and system layers:
  text & root files (txt), markdown documentation (md), images, videos & audio media, binary assets,
  vector graphics (svg), code architecture, security, performance, optimisation, accessibility (a11y),
  UI craftsmanship, and UX navigation, generating a date-organized audit/YYYY-MM-DD/ workspace with
  executive scorecards, decoupled domain action specifications, and interactive task ledgers.
---

# 🛡️ Repository Audit Skill (`repo-audit`)

Use this skill whenever the user asks to **audit the repository**, conduct a full-system health check, or evaluate specific technical dimensions (e.g. *"audit entire repository for docs, security, perform, seo, ago, pwa"*, *"audit all txt/mds/images/videos/assets/svgs/code/security/perf/a11y/ui/ux"*, *"audit codebase and organize into audit folder"*).

---

## 🏛️ What This Skill Does

This skill executes an exhaustive, multi-domain investigation across **every file type and architectural subsystem** in the repository. It organizes all findings into a structured, date-based **`audit/<YYYY-MM-DD>/`** folder (mirroring the craftsmanship and structure of **`mirai/`**):

```text
audit/
├── README.md                                  # Master index of all repository audits & health assessments
└── <YYYY-MM-DD>/                              # Date-organized audit suite
    ├── README.md                              # Executive summary, scorecard, and master interactive checklist
    ├── 01-security-hardening.md               # 🚨 Path traversal, SSRF, CORS, headers, Docker root
    ├── 02-performance-optimization.md         # 🟠 Font waterfalls, bundle splitting, React.lazy, rAF
    ├── 03-pwa-subpath-compatibility.md         # 🟠 Service worker subpaths, offline fallbacks, /api/ client
    ├── 04-ui-ux-accessibility.md              # 🟡 Spatial navigation, responsiveness, contrast, a11y
    ├── 05-seo-and-crawler-readiness.md         # 🟡 Canonical URL, Schema.org JSON-LD, SPA noscript, sitemap
    ├── 06-ago-and-ai-search-optimization.md   # 🟡 llms-full.txt, AI discovery tags, W3C manifest store parity
    └── 07-documentation-and-roadmap-sync.md   # 🟢 Broken links, LICENSE, guides/ and mirai/ status sync
```

---

## 🔍 Comprehensive Multi-Domain Audit Protocols

The agent systematically inspects all 11 core categories using automated tooling and code analysis:

### 1. 📄 Text & Root Metadata Files (`.txt`, `.json`, `.webmanifest`, `.env`)
* **`LICENSE`**: Verify presence of root `LICENSE` matching badges in `README.md`.
* **`public/robots.txt`**: Check crawler directives, sitemap URL declaration, and dedicated generative AI bot rules (`GPTBot`, `ClaudeBot`, `PerplexityBot`).
* **`public/sitemap.xml`**: Verify modern timestamps, valid XML schema, and complete URL coverage across docs and pages.
* **`public/llms.txt` & `public/llms-full.txt`**: Ensure both summary index and unabridged multi-file LLM context documents are up to date.
* **`package.json`**: Inspect scripts, dependency constraints, license field, and repository URLs.
* **Environment Secrets**: Ensure `.env` is omitted from version control and excluded in container builds (`.dockerignore`).

### 2. 📚 Markdown Documentation (`.md`)
* **Link Integrity**: Scan every internal markdown link (`[label](path.md)`) to verify target files and anchors exist on disk with zero 404 errors.
* **Documentation Parity**: Cross-reference master tables in `guides/README.md` and `mirai/README.md` against actual files in their directories.
* **Backlog Rules**: Enforce that completed features are moved out of `mirai/` and documented in `guides/` or `README.md`.
* **Release Badges**: Verify version numbers match across README status badges and manifest files.

### 3. 🖼️ Image Assets (`.webp`, `.png`, `.jpg`, `.jpeg`, `.ico`, `.gif`)
* **Format Modernization**: Ensure all cover artwork, showcase images, and screenshots use high-performance **WebP** instead of uncompressed PNG/JPG.
* **Resolution & Aspect Ratios**: Verify Open Graph social images match 1200x630, PWA showcase screenshots match canonical aspect ratios, and cartridge covers maintain authentic dimensions.
* **Loading Attributes**: Check that non-hero images in HTML and React utilize `loading="lazy"` and `decoding="async"`.
* **Asset Bloat**: Flag any oversized images (> 500 KB) that require compression.

### 4. 📐 Vector Graphics (`.svg`)
* **ViewBox Attribute Verification**: Inspect all SVG files and components to ensure `viewBox` is present for responsive scaling without clipping.
* **XSS Injection Security**: Scan SVG content for malicious embedded `<script>` tags, `javascript:` event handlers, or foreign objects, especially when rendered via `dangerouslySetInnerHTML`.
* **Vector Optimization**: Verify SVGs are minified and clean without redundant editor metadata.

### 5. 🎵 Audio & Video Media (`.mp3`, `.ogg`, `.wav`, `.mp4`, `.webm`)
* **Codec Compatibility**: Ensure audio assets support universal playback across iOS Safari, Android, and desktop browsers (e.g. MP3 + OGG fallback).
* **Audio Lifecycle & Memory Leaks**: Verify that Web Audio API contexts (`AudioContext`) are properly suspended when games pause or exit, and ensure volume nodes do not leak.
* **File Sizes**: Audit audio bitrates to prevent unnecessary payload bloat.

### 6. 📦 Binary & System Assets (`.wasm`, `.woff2`, `.json`, `.sav`, `.state`)
* **WebAssembly Cores**: Ensure emulator WASM binaries load reliably with proper MIME types (`application/wasm`) and CORS isolation headers (`COOP`/`COEP`).
* **Font Delivery**: Ensure font files (`.woff2`) are modern, preconnected, and avoid render-blocking CSS `@import` waterfalls.
* **Companion Sidecars**: Verify ROM sidecar files (`.json`, `.nfo`) adhere to standard metadata schemas.

### 7. 💻 Code Architecture, Quality & Memory Leaks
* **Memory Leaks & Timer Cleanup**: Check that all `setInterval` calls have matching `clearInterval`, and `addEventListener` calls have matching `removeEventListener` in cleanup returns.
* **Animation Loops**: Verify `requestAnimationFrame` loops (e.g. gamepad navigation) are throttled or suspended when devices are disconnected.
* **Dead Code & Unused Imports**: Grep for unused component imports, orphaned variables, and debugging statements (`console.log` spam).
* **Tri-Environment Compatibility**: Verify zero hardcoded root paths (`/api/...` or `/emulatorjs/...`) that break when hosted on repository subpaths (GitHub Pages) vs domain root (Localhost/Docker).

### 8. 🔒 Security & Attack Surface
* **Path Traversal & Arbitrary Deletions**: Audit all backend endpoints handling file uploads or deletions (`/api/delete-rom`, `/api/delete-bgm`, `/api/metadata/*`). Enforce strict `safeResolve` path boundary checks.
* **Server-Side Request Forgery (SSRF)**: Audit scrapers and reverse proxies. Validate all target URLs against a strict upstream hostname allowlist.
* **Secrets & Hardcoded Keys**: Verify no third-party API keys or tokens exist in client source code.
* **HTTP Security Headers**: Enforce CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy`.
* **Container Isolation**: Ensure Docker runner stages switch to a non-root user (`USER node`).
* **Dependency Vulnerabilities**: Run `npm audit` to capture moderate, high, and critical CVEs.

### 9. ⚡ Performance & Resource Efficiency
* **CSS Waterfall Elimination**: Remove render-blocking `@import` statements from stylesheets.
* **Bundle Splitting & Lazy Loading**: Split monolithic React bundles using `React.lazy()` and `<Suspense>` for secondary modals and views.
* **Rollup Manual Chunks**: Configure vendor chunk separation in `vite.config.js` for heavy libraries (`react`, `lucide-react`, `@multiavatar/multiavatar`).

### 10. ♿ Accessibility (a11y) & Inclusivity
* **WCAG 2.1 AA Compliance**: Verify color contrast on text, buttons, and HUD status pills meets the 4.5:1 ratio.
* **Focus Visibility**: Ensure all interactive elements display crisp, visible focus indicators during keyboard/gamepad navigation.
* **Semantic ARIA**: Verify appropriate `aria-label`, `role`, and `tabIndex` attributes are applied.
* **Touch Target Sizing**: Ensure touch buttons on mobile viewports meet minimum dimensions (>= 44x44px).

### 11. 🎮 UI & UX Craftsmanship
* **100% Keyboard & Gamepad Spatial Navigation**: Guarantee every screen, modal, and action is controllable via D-Pad/Arrow keys, Action buttons, Enter, and Esc.
* **Zero Native Browser Dialogs**: Strictly ban `alert()`, `confirm()`, and `prompt()`. All prompts must use custom in-app console-themed dialogs.
* **Responsive Layout Matrix**: Test against `guides/device-matrix.md` tiers (compact mobile, foldables, handhelds 1280x800, desktop, 4K/8K TVs).
* **Safe Area Insets**: Ensure `env(safe-area-inset-*)` padding protects UI elements from mobile camera notches and bottom gesture bars.

---

## 🚀 Step-by-Step Execution Workflow

### Step 1: Run Automated Asset & Code Scanner
Execute the repository scanner script to gather baseline diagnostics:

```bash
node .agents/skills/repo-audit/scripts/asset_scanner.js
```
*(Optionally export JSON: `node .agents/skills/repo-audit/scripts/asset_scanner.js --json`)*

This script automatically scans:
- Missing root files (`LICENSE`, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`)
- Broken markdown links across all `.md` files
- Unconverted raster images (PNG/JPG that should be WebP)
- SVG quality, missing `viewBox`, and script injection vectors
- Audio and media file sizes
- Render-blocking CSS `@import` statements
- Native browser dialog violations (`alert`, `confirm`, `prompt`)
- Hardcoded root `/api/` fetch calls

### Step 2: Scaffold Dated Audit Workspace
Run the scaffolder to create `audit/<YYYY-MM-DD>/` and update the master index:

```bash
node .agents/skills/repo-audit/scripts/init_audit.js [YYYY-MM-DD]
```

### Step 3: Run Dependency Security Check
Run `npm audit` to capture package vulnerabilities:
```bash
npm audit
```

### Step 4: Author Decoupled Action Specifications
Write domain markdown files inside `audit/<YYYY-MM-DD>/`:
* `01-security-hardening.md`
* `02-performance-optimization.md`
* `03-pwa-subpath-compatibility.md`
* `04-ui-ux-accessibility.md`
* `05-seo-and-crawler-readiness.md`
* `06-ago-and-ai-search-optimization.md`
* `07-documentation-and-roadmap-sync.md`

Every document must contain:
1. **Executive Summary & Severity Rating**
2. **Defect Details & Root Cause Analysis** (with code excerpts and exact line numbers)
3. **Concrete Implementation Plan & Code Diffs**
4. **Verification & Testing Checklist**

### Step 5: Publish Executive Scorecard (`audit/<YYYY-MM-DD>/README.md`)
Assemble the master scorecard with letter grades, severity badges, a Mermaid execution order graph, and global `- [ ]` interactive checkboxes.

### Step 6: Present Findings & Await User Approval
Present the audit scorecard and specification links to the user. **Never execute modifying code edits without the user's explicit permission** (per Project Rule 6).

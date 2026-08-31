---
name: release-version
description: >-
  Automates bumping application and release versions across all project files
  (package.json, Service Worker cache key in sw.js, PWA manifest, in-app About modal,
  public/llms.txt, and README.md badges) and prepares/executes structured release git commits.
---

# Release Version Skill

Use this skill whenever the user asks to release a new version or commit a version bump (e.g. *"commit v1.0"*, *"bump to v1.1"*, *"release v2.0"*).

---

## 🏛️ What This Skill Does

When a version release is triggered, this skill updates all version touchpoints simultaneously:

| Component | Target File | Action |
| :--- | :--- | :--- |
| **Package Manifests** | `package.json` & `package-lock.json` | Updates `"version": "x.y.z"` |
| **Service Worker Cache** | `public/sw.js` | Updates `CACHE_NAME = 'retro-player-vx.y.z'` (Forces clean client HTTP asset refresh) |
| **PWA Web Manifest** | `public/manifest.webmanifest` | Updates `"version": "x.y.z"` |
| **In-App About Modal** | `src/components/AboutInfoModal.jsx` | Updates the displayed `vx.y.z` version badge |
| **In-App Mobile View** | `src/components/MobileAppView.jsx` | Updates all displayed `vx.y.z` version badges |
| **AI LLM Context** | `public/llms.txt` | Updates release version header |
| **Cover Showcase Images** | `home.webp` -> `public/og-image.webp` & `public/screenshots/desktop-1.webp` | Syncs latest README cover image to SEO Open Graph and PWA installation screenshots |
| **Project Documentation** | `README.md` | Updates release status badge & documentation highlights |

> [!NOTE]
> Service Worker cache invalidation (`CACHE_NAME`) exclusively refreshes static web assets (HTML, CSS, JS, WASM binaries). It **never** touches or deletes player databases (`IndexedDB` / `localStorage` save states, `.sav` battery saves, profiles, or scraped cover art).

---

## 🚀 Execution Instructions

### 1. Run Version Synchronization Script

```bash
node .agents/skills/release-version/scripts/bump_version.js <version>
```
*Example:*
```bash
node .agents/skills/release-version/scripts/bump_version.js 1.1.0
```

### 2. Verify Zero Leftover Stale Versions
Run ripgrep / grep across the repository to guarantee all components are 100% updated:
```bash
# Verify no stale versions remain in source files
git grep -n "v<old-version>" src/ public/
```

### 3. Update Documentation (`README.md`)
Ensure [README.md](file:///Users/godarayudhvir/Github/retro-player/README.md) accurately reflects the changes being committed and includes the updated version status badge.

### 4. Stage & Commit
Format the commit message with a concise title and comprehensive multi-line details:
```bash
git add .
git commit -m "release: v<version>" \
  -m "- Synchronized application version to v<version> across package.json, PWA manifest, and in-app views" \
  -m "- Updated Service Worker cache name to retro-player-v<version> for seamless offline asset refresh" \
  -m "- Updated in-app About modals and documentation badges"
```

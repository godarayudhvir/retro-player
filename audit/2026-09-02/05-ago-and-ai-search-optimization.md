# 🤖 Audit Specification 05: AGO & AI Search Optimization

> **Audit Date**: 2026-09-02  
> **Severity**: 🟡 **MEDIUM**  
> **Impact**: Generative AI Search Discovery (Perplexity, ChatGPT, Claude), LLM Ingestion, App Store Optimization (ASO/PWA)  
> **Target Files**: `public/llms-full.txt`, `public/manifest.webmanifest`, `public/robots.txt`, `index.html`

---

## 📌 1. Executive Summary

This specification focuses on two critical modern discoverability vectors:
1. **AGO / AEO (Answer Engine & Generative Engine Optimization)**: Ensuring generative AI models (ChatGPT Search, Perplexity AI, Claude) can ingest, understand, and cite Retro Player accurately by providing structured machine-readable context files (`llms.txt` and `llms-full.txt`) and discovery tags.
2. **ASO (App Store Optimization for PWA)**: Ensuring the Web App Manifest complies with W3C standards and PWABuilder requirements for one-click submission to the Microsoft Store and Google Play Store, while resolving subpath scope collisions.

---

## 🔍 2. Defect Details & Root Cause Analysis

### Defect 5.1: Missing `public/llms-full.txt` (AEO Standard)
* **Affected File**: `public/llms-full.txt` (Missing)
* **Root Cause**: While [public/llms.txt](file:///Users/godarayudhvir/Github/retro-player/public/llms.txt) exists as a summary index, modern AI search agents and LLM tooling follow the [llmstxt.org specification](https://llmstxt.org/) which specifies a companion `llms-full.txt` file containing the complete, unabridged technical documentation concatenated into a single machine-readable document.
* **Impact**: AI search engines crawling the site cannot ingest the full architectural context in one single retrieval call, resulting in incomplete citations or hallucinated descriptions.

### Defect 5.2: Missing AI Context Discovery Link in `index.html`
* **Affected File**: `index.html`
* **Root Cause**: `<head>` lacks discovery metadata pointing to `llms.txt`.
* **Impact**: LLM web crawlers analyzing `index.html` do not receive an explicit pointer indicating that an LLM-optimized summary is available at `./llms.txt`.

### Defect 5.3: W3C Manifest `id` Subpath Collision (ASO / PWABuilder)
* **Affected File**: `public/manifest.webmanifest` (line 4)
* **Code**:
  ```json
  "id": "/",
  "start_url": "./",
  ```
* **Root Cause**: The W3C Manifest specification states that the `id` member is the unique identity of the application. An `id` of `/` resolves to `https://<user>.github.io/`, causing identity collisions with any other applications hosted on the same GitHub Pages domain and triggering packaging errors in PWABuilder for the Microsoft Store.
* **Remediation**: Change `"id": "./"` or `"id": "retro-player"`.

### Defect 5.4: Missing Internationalization & Store Categorization Fields
* **Affected File**: `public/manifest.webmanifest`
* **Root Cause**: The manifest lacks `lang: "en"`, `dir: "ltr"`, and formal App Store classifications.
* **Impact**: Reduced install conversion and automated store validation warnings.

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Create `public/llms-full.txt`
Compile a comprehensive, single-file Markdown document containing:
- Complete system overview, architecture, and supported console cores.
- Save persistence logic (SRAM vs snapshot states).
- Controls and gamepad mappings.
- Pokémon Save Inspector specs (Gen 1–5).
- Docker deployment and self-hosting instructions.
- Audio and BGM virtual hierarchy.

### Step 2: Add AI Discovery Tag in `index.html`
Add inside `<head>`:
```html
<link rel="alternate" type="text/markdown" href="./llms.txt" title="LLMs Text Summary" />
<link rel="alternate" type="text/markdown" href="./llms-full.txt" title="Full System Documentation for LLMs" />
```

### Step 3: Update `public/manifest.webmanifest`
```diff
 {
   "name": "Retro Player — The High-Performance, Zero-Overhead Web Emulation Station",
   "short_name": "Retro Player",
   "description": "High-performance, zero-overhead web emulation station supporting 12 classic console platforms with native WebAssembly speed, universal save state persistence, and full gamepad spatial navigation.",
-  "id": "/",
+  "id": "./",
   "start_url": "./",
   "scope": "./",
   "display": "standalone",
   "orientation": "any",
+  "lang": "en",
+  "dir": "ltr",
   "theme_color": "#12131a",
   "background_color": "#0d0e12",
   "categories": [
     "games",
     "entertainment",
     "utilities"
   ],
```

### Step 4: Update `public/robots.txt` for AI Crawlers
```text
User-agent: *
Allow: /

# Dedicated discovery for Generative AI search crawlers
User-agent: GPTBot
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: ClaudeBot
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: PerplexityBot
Allow: /llms.txt
Allow: /llms-full.txt

Sitemap: https://godarayudhvir.github.io/retro-player/sitemap.xml
```

---

## 🧪 4. Verification & Testing Checklist

- [ ] **AEO Link Resolution**: Verify `curl -I http://localhost:3000/llms-full.txt` returns HTTP 200 with Markdown content.
- [ ] **Manifest Validation**: Run manifest through the official [W3C Manifest Validator](https://manifest-validator.appspot.com/) and [PWABuilder](https://www.pwabuilder.com/) to confirm 100% store readiness score.
- [ ] **Subpath Scope Test**: Confirm PWA install prompt properly registers under subpath `./` scope without domain root conflict.

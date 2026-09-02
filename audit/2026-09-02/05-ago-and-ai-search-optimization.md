# 🤖 Audit Specification 05: AGO & AI Search Optimization (Pending Items)

> **Audit Date**: 2026-09-02  
> **Severity**: 🟡 **MEDIUM**  
> **Impact**: Generative AI Search Discovery (Perplexity, ChatGPT, Claude), LLM Ingestion, App Store Optimization (ASO/PWA)  
> **Target Files**: `public/llms-full.txt`, `public/manifest.webmanifest`, `public/robots.txt`

---

## 📌 1. Executive Summary

This specification tracks remaining Answer Engine Optimization (AEO/AGO) and App Store Optimization (ASO) tasks:
1. **Generating `public/llms-full.txt`** for unabridged LLM and AI agent ingestion.
2. **Standardizing `public/manifest.webmanifest`** (`"id": "./"`, `lang`, `dir`) to prevent GitHub Pages subpath collisions and fulfill PWABuilder store specifications.
3. **Updating `public/robots.txt`** with explicit crawler directives for GPTBot, ClaudeBot, and PerplexityBot.

---

## 🔍 2. Remaining Defects

### Defect 5.1: Missing `public/llms-full.txt` (AEO Standard)
* **Affected File**: `public/llms-full.txt` (Missing)
* **Root Cause**: While `public/llms.txt` exists as a concise index, modern AI search engines require an unabridged single-file technical context file (`llms-full.txt`).

### Defect 5.2: W3C Manifest `id` Subpath Collision (ASO / PWABuilder)
* **Affected File**: `public/manifest.webmanifest`
* **Root Cause**: `"id": "/"` causes scope collisions when deployed to subpaths (`/<repo>/`) and triggers store packaging errors.
* **Remediation**: Update `"id": "./"`, and add `"lang": "en"`, `"dir": "ltr"`.

### Defect 5.3: Dedicated AI Search Bot Directives in `robots.txt`
* **Affected File**: `public/robots.txt`
* **Remediation**: Explicitly allow AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`) access to `llms.txt` and `llms-full.txt`.

---

## 🛠️ 3. Concrete Implementation Plan

### Step 1: Create `public/llms-full.txt`
Compile a comprehensive, single-file Markdown document containing unabridged system specs, emulator cores, save state persistence, gamepad mappings, and Docker instructions.

### Step 2: Update `public/manifest.webmanifest`
Change `"id": "./"` and add internationalization attributes.

### Step 3: Update `public/robots.txt`
Add explicit access declarations for GPTBot, ClaudeBot, and PerplexityBot.

---

## 🧪 4. Verification & Testing Checklist

- [ ] **AEO Link Resolution**: Verify `curl -I http://localhost:3000/llms-full.txt` returns HTTP 200 with Markdown content.
- [ ] **Manifest Validation**: Run manifest through PWABuilder to confirm 100% store readiness.
- [ ] **Subpath Scope Test**: Confirm PWA install prompt properly registers under subpath `./` scope without domain root conflict.

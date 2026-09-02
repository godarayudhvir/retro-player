# 🔍 Audit Specification 04: SEO & Crawler Readiness

> **Audit Date**: 2026-09-02  
> **Severity**: 🟡 **MEDIUM**  
> **Impact**: Search Ranking, Social Previews, Rich Snippets, Crawler Indexation  
> **Target Files**: `index.html`, `public/sitemap.xml`, `public/robots.txt`

---

## 📌 1. Executive Summary

This specification focuses on standardizing **Search Engine Optimization (SEO)**, metadata discovery, and web crawler compatibility for Retro Player.

Currently, while basic OpenGraph and Twitter cards are defined, the site lacks a **canonical URL tag**, **Schema.org JSON-LD structured data**, an **HTML `<noscript>` semantic crawler fallback**, and has a **static `sitemap.xml` with outdated timestamps and incomplete URL listings**.

---

## 🔍 2. Defect Details & Root Cause Analysis

### Defect 4.1: Missing Canonical Tag in `index.html`
* **Affected File**: `index.html`
* **Root Cause**: The HTML `<head>` lacks a `<link rel="canonical">` tag.
* **Impact**: When users or bots access the site with URL parameters (e.g. `?open=settings`, `?rom=...`, `index.html`, or IP-based hosting), search engines may index multiple copies of the same page, diluting domain authority and causing duplicate content penalties.

### Defect 4.2: Missing Schema.org JSON-LD Structured Data
* **Affected File**: `index.html`
* **Root Cause**: No `<script type="application/ld+json">` tag is present.
* **Impact**: Google and Bing cannot extract rich software application entities (app name, operating system, category, rating, free price tier) for rich search result cards and knowledge panels.

### Defect 4.3: Empty `<div id="root">` Without Crawler Fallback
* **Affected File**: `index.html` (lines 55–58)
* **Code**:
  ```html
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
  ```
* **Root Cause**: Standard web crawlers that do not execute client-side JavaScript (or have strict render budgets) receive a completely empty document with zero semantic headings or text content.
* **Impact**: Decreased organic discovery and poor accessibility for text-only readers.

### Defect 4.4: Stale & Incomplete `sitemap.xml`
* **Affected File**: `public/sitemap.xml`
* **Root Cause**: All `<lastmod>` timestamps are fixed to `2026-08-24`, and only 3 URLs are listed (`/`, `/llms.txt`, `/manifest.webmanifest`). None of the comprehensive documentation guides in `guides/` are indexed.

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Add Canonical Tag to `index.html`
Add inside `<head>`:
```html
<link rel="canonical" href="https://godarayudhvir.github.io/retro-player/" />
```

### Step 2: Add Schema.org JSON-LD Structured Data to `index.html`
Add inside `<head>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Retro Player",
  "url": "https://godarayudhvir.github.io/retro-player/",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires WebAssembly and Web Audio API support",
  "description": "High-performance, zero-overhead web emulation station supporting 12 classic console platforms with native WebAssembly speed, universal save state persistence, and full gamepad spatial navigation.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Yudhvir Godara",
    "url": "https://github.com/godarayudhvir"
  }
}
</script>
```

### Step 3: Add `<noscript>` Crawler Fallback in `index.html`
Add immediately after `<div id="root"></div>`:
```html
<noscript>
  <div style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1e293b;">
    <h1>Retro Player — Web Emulation Station</h1>
    <p>
      Retro Player is a high-performance web emulation station supporting 12 classic gaming systems (NES, SNES, Game Boy, Game Boy Color, Game Boy Advance, Sega Genesis, Game Gear, Master System, Nintendo 64, PlayStation, Nintendo DS, and Arcade) directly in the browser via WebAssembly.
    </p>
    <h2>Core Capabilities</h2>
    <ul>
      <li><strong>12 Console Emulators:</strong> Native WebAssembly cores with zero server-side rendering latency.</li>
      <li><strong>Save Persistence:</strong> Battery SRAM (.sav) and instant Quick Save snapshot states stored permanently in IndexedDB.</li>
      <li><strong>Universal Gamepad Engine:</strong> 100% spatial UI navigation and gameplay support for Xbox, PlayStation, Switch, and 8BitDo controllers.</li>
      <li><strong>PWA & Offline Play:</strong> Installable to desktop and mobile home screens with offline ROM caching.</li>
    </ul>
    <h2>Documentation & Source Code</h2>
    <p>
      Explore the documentation guides on <a href="https://github.com/godarayudhvir/retro-player">GitHub Repository</a>.
    </p>
  </div>
</noscript>
```

### Step 4: Refresh `public/sitemap.xml`
Update timestamps and add direct references:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://godarayudhvir.github.io/retro-player/</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://godarayudhvir.github.io/retro-player/llms.txt</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://godarayudhvir.github.io/retro-player/llms-full.txt</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://godarayudhvir.github.io/retro-player/manifest.webmanifest</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

## 🧪 4. Verification & Testing Checklist

- [ ] **Rich Results Test**: Validate Schema.org payload using the [Google Rich Results Test](https://search.google.com/test/rich-results) tool.
- [ ] **Canonical Tag Verification**: Inspect page source; confirm `<link rel="canonical">` points to the primary URL.
- [ ] **Noscript Crawl Test**: Disable JavaScript in browser settings and load the page; verify semantic text and heading hierarchy render correctly.
- [ ] **Sitemap XML Validation**: Validate `sitemap.xml` syntax against standard schema validators.

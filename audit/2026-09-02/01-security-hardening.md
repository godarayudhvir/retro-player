# 🔒 Audit Specification 01: Security Hardening (Pending Items)

> **Audit Date**: 2026-09-02  
> **Severity**: 🚨 **HIGH**  
> **Impact**: Host Security, Network Safety, Cross-Origin Mutating API Protection  
> **Target Files**: `server.js`, `vite.config.js`

---

## 📌 1. Executive Summary

This specification tracks remaining security hardening tasks for Retro Player backend services. Path traversal guards, HTTP security headers, Docker non-root user isolation, and `.dockerignore` protections have been resolved. The remaining security items are:
1. **SSRF mitigation via upstream domain allowlisting in `/api/scrape-proxy`**.
2. **Restricting permissive wildcard CORS on mutating state endpoints**.

---

## 🔍 2. Remaining Vulnerabilities

### Vulnerability 1.1: Server-Side Request Forgery (SSRF) in `/api/scrape-proxy`
* **Severity**: 🚨 **High** (CVSS: 8.2)
* **Affected Files & Lines**:
  - `server.js` (lines ~1250–1310)
  - `vite.config.js` (lines ~850–910)
* **Root Cause**:
  The proxy receives an `endpoint` query parameter from the client and appends it to external endpoints without validating that the target is strictly on allowed domains or preventing protocol manipulation / internal subnet probing.
* **Exploit Scenario**: An attacker could use the server as an HTTP proxy to scan internal networks (e.g. `http://169.254.169.254/latest/meta-data/` on cloud VPS or internal Docker subnets `http://172.17.0.1/`).

### Vulnerability 1.2: Permissive Wildcard CORS on Mutating State Endpoints
* **Severity**: 🟡 **Medium** (CVSS: 5.0)
* **Affected Files & Lines**: `server.js` (line ~70)
* **Root Cause**: `res.setHeader('Access-Control-Allow-Origin', '*')` is applied globally. Mutating database operations (`/api/db/batch-delete`, `/api/db/reset`) accept requests from any origin, opening users to CSRF-style drive-by attacks if they visit an untrusted website while running Retro Player locally.

---

## 🛠️ 3. Implementation Plan & Code Diffs

### Step 1: Implement Upstream Domain Whitelisting on Scrape Proxy
In `server.js` and `vite.config.js`:
```javascript
const ALLOWED_SCRAPE_HOSTS = new Set([
  'api.rawg.io',
  'thumbnails.libretro.com',
  'raw.githubusercontent.com',
  'en.wikipedia.org'
]);

function isAllowedUpstreamUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    return ALLOWED_SCRAPE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}
```
Reject any proxy request whose resolved URL does not match `isAllowedUpstreamUrl()`.

### Step 2: Restrict Wildcard CORS for Mutating API Endpoints
Restrict `Access-Control-Allow-Origin` for `/api/db/*`, `/api/upload-rom`, `/api/delete-rom`, and `/api/metadata/*` to same-origin or localhost, rather than wildcard `*`.

---

## 🧪 4. Verification & Testing Checklist

- [ ] **SSRF Proxy Test**:
  ```bash
  curl "http://localhost:3000/api/scrape-proxy?url=http://169.254.169.254/latest/meta-data/"
  ```
  Expected: HTTP 403 Forbidden with `"Upstream host not permitted"`.
- [ ] **Allowed Proxy Request**:
  Verify legitimate requests to `api.rawg.io` or `thumbnails.libretro.com` succeed normally through the proxy.

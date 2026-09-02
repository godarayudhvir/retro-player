# 🔒 Audit Specification 01: Security Hardening

> **Audit Date**: 2026-09-02  
> **Severity**: 🚨 **CRITICAL**  
> **Impact**: Data Integrity, Host Security, Container Isolation, Network Safety  
> **Target Files**: `server.js`, `vite.config.js`, `Dockerfile`, `.dockerignore`, `src/services/metadataScraper.js`

---

## 📌 1. Executive Summary

This specification addresses high-priority vulnerabilities identified in the server backend, dev server middleware, container definitions, and frontend scraper service.

The most critical finding is **unrestricted path traversal in file deletion and write endpoints**, which allows an unauthenticated client to delete or overwrite arbitrary files on the server or host machine. Other key findings include **SSRF via unvalidated upstream proxy targets**, **missing HTTP security headers**, **overly permissive wildcard CORS policies**, and **running as root in Docker**.

---

## 🔍 2. Vulnerability Details & Root Cause Analysis

### Vulnerability 1.1: Path Traversal & Arbitrary File Deletion / Write
* **Severity**: 🚨 **Critical** (CVSS: 9.1)
* **Affected Files & Lines**:
  - `server.js` (lines ~705–728 `/api/delete-rom`, lines ~800–820 `/api/delete-bgm`, lines ~1120–1175 `/api/metadata/save-sidecar`, lines ~1185–1210 `/api/metadata/delete-sidecar`)
  - `vite.config.js` (lines ~360–380, lines ~420–440, lines ~720–775, lines ~780–805)
* **Root Cause**:
  In `server.js`:
  ```javascript
  const sysDir = path.join(ROMS_DIR, systemKey);
  const filePath = path.join(sysDir, filename);
  await fs.unlink(filePath);
  ```
  If an attacker sends a POST request with:
  ```json
  {
    "systemKey": "gba",
    "filename": "../../../server.js"
  }
  ```
  `path.join()` resolves this to the project root and permanently unlinks `server.js` or any other file accessible to the Node process.
* **Exploit Scenario**: An attacker or rogue client script can delete the application's source code, operating system configuration, or database files.

### Vulnerability 1.2: Server-Side Request Forgery (SSRF) in `/api/scrape-proxy`
* **Severity**: 🚨 **High** (CVSS: 8.2)
* **Affected Files & Lines**:
  - `server.js` (lines ~1250–1310)
  - `vite.config.js` (lines ~850–910)
* **Root Cause**:
  The proxy receives an `endpoint` query parameter from the client and appends it to external endpoints without validating that the target is strictly on allowed domains or preventing protocol manipulation / internal subnet probing.
* **Exploit Scenario**: An attacker could use the server as an HTTP proxy to scan internal networks (e.g. `http://169.254.169.254/latest/meta-data/` on cloud VPS or internal Docker subnets `http://172.17.0.1/`).

### Vulnerability 1.3: Missing HTTP Security Headers in Express
* **Severity**: 🟡 **Medium** (CVSS: 5.3)
* **Affected Files & Lines**: `server.js` (lines ~50–90)
* **Root Cause**: The Express server does not emit essential defense-in-depth headers:
  - `Content-Security-Policy` (CSP)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Vulnerability 1.4: Permissive Wildcard CORS on Mutating State Endpoints
* **Severity**: 🟡 **Medium** (CVSS: 5.0)
* **Affected Files & Lines**: `server.js` (line ~70)
* **Root Cause**: `res.setHeader('Access-Control-Allow-Origin', '*')` is applied globally. Mutating database operations (`/api/db/batch-delete`, `/api/db/reset`) accept requests from any origin, opening users to CSRF-style drive-by attacks if they visit an untrusted website while running Retro Player locally.

### Vulnerability 1.5: Container Runs as Root & Secret Leakage in `.dockerignore`
* **Severity**: 🟠 **High** (CVSS: 7.2)
* **Affected Files & Lines**:
  - `Dockerfile` (lines 14–41)
  - `.dockerignore` (lines 1–9)
* **Root Cause**:
  - `Dockerfile` has no `USER node` directive in the `runner` stage. Processes execute as root.
  - `.dockerignore` does NOT exclude `.env`, `test_save_states/`, or `marketing/`. Running `docker build` locally copies `.env` secrets into the image layer history.

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Implement Centralized Path Boundary Guard (`safeResolve`)
Create or export a safe path resolution utility in `server.js` and `vite.config.js`:

```javascript
/**
 * Resolves a file path strictly within a parent directory boundary.
 * Prevents directory traversal attacks via '..' or absolute paths.
 * 
 * @param {string} baseDir - Trusted parent directory
 * @param {string} relativePath - Untrusted user input
 * @returns {string} - Validated absolute path
 * @throws {Error} - If traversal outside baseDir is attempted
 */
function safeResolve(baseDir, relativePath) {
  if (!relativePath || typeof relativePath !== 'string') {
    throw new Error('Invalid path argument');
  }
  // Remove null bytes
  const sanitized = relativePath.replace(/\0/g, '');
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, sanitized);

  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error('Access denied: Path traversal detected');
  }
  return resolvedTarget;
}
```

Apply `safeResolve` across:
1. `POST /api/delete-rom`:
   ```javascript
   const sysDir = safeResolve(ROMS_DIR, systemKey);
   const targetFile = safeResolve(sysDir, filename);
   ```
2. `POST /api/delete-bgm`:
   ```javascript
   const targetFile = safeResolve(BGM_DIR, filename);
   ```
3. `POST /api/metadata/save-sidecar` & `delete-sidecar`:
   ```javascript
   const sysDir = safeResolve(ROMS_DIR, systemKey);
   const sidecarPath = safeResolve(sysDir, `${baseName}.json`);
   ```

### Step 2: Implement Upstream Domain Whitelisting on Scrape Proxy
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

### Step 3: Add HTTP Security Headers in Express
In `server.js`, inject security headers before route definitions:
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Allow EmulatorJS web workers, wasm, and local data blobs
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});
```

### Step 4: Restrict Wildcard CORS for Mutating API Endpoints
Restrict `Access-Control-Allow-Origin` for `/api/db/*`, `/api/upload-rom`, `/api/delete-rom`, and `/api/metadata/*` to same-origin or localhost, rather than wildcard `*`.

### Step 5: Update `Dockerfile` to Non-Root User
In `Dockerfile`:
```dockerfile
# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV ROMS_DIR=/roms
ENV BGM_DIR=/bgm
ENV DATA_DIR=/data

# Create directory structure and set ownership to node user
RUN mkdir -p /roms /bgm /data /app/dist /app/public && \
    chown -R node:node /roms /bgm /data /app

# Install only production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server.js ./server.js
COPY --chown=node:node --from=builder /app/src/server ./src/server
COPY --chown=node:node --from=builder /app/public ./public

USER node

VOLUME ["/roms", "/bgm", "/data"]
EXPOSE 3000
CMD ["node", "server.js"]
```

### Step 6: Update `.dockerignore`
Add sensitive and local files to `.dockerignore`:
```text
.env
.env.*
test_save_states
marketing
*.log
```

---

## 🧪 4. Verification & Testing Checklist

- [ ] **Path Traversal Test**: Send test request with `curl`:
  ```bash
  curl -X POST http://localhost:3000/api/delete-rom \
    -H "Content-Type: application/json" \
    -d '{"systemKey":"gba","filename":"../../package.json"}'
  ```
  Expected: HTTP 400 or 403 error with `"Access denied"` message; `package.json` must remain intact.
- [ ] **SSRF Proxy Test**:
  ```bash
  curl "http://localhost:3000/api/scrape-proxy?url=http://169.254.169.254/latest/meta-data/"
  ```
  Expected: HTTP 403 Forbidden with `"Upstream host not permitted"`.
- [ ] **Header Inspection Test**:
  ```bash
  curl -I http://localhost:3000/
  ```
  Verify `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` are returned.
- [ ] **Docker Root User Verification**:
  ```bash
  docker run --rm <image-name> whoami
  ```
  Expected output: `node` (not `root`).

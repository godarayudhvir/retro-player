#!/usr/bin/env node

/**
 * Repository Audit Initializer & Scaffolder
 * 
 * Creates a date-organized audit folder structure under audit/<YYYY-MM-DD>/
 * and updates the master audit/README.md index.
 * 
 * Usage:
 *   node .agents/skills/repo-audit/scripts/init_audit.js [YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../..');
const auditRootDir = path.join(rootDir, 'audit');

// 1. Determine Target Date (YYYY-MM-DD)
let targetDate = process.argv[2];
if (!targetDate) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  targetDate = `${year}-${month}-${day}`;
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
  console.error(`🚨 Error: Invalid date format "${targetDate}". Expected YYYY-MM-DD.`);
  process.exit(1);
}

const targetAuditDir = path.join(auditRootDir, targetDate);

console.log(`🛡️ Initializing repository audit for: ${targetDate}`);
console.log(`📁 Target Directory: ${targetAuditDir}`);

// 2. Ensure Directories Exist
if (!fs.existsSync(auditRootDir)) {
  fs.mkdirSync(auditRootDir, { recursive: true });
}

if (!fs.existsSync(targetAuditDir)) {
  fs.mkdirSync(targetAuditDir, { recursive: true });
  console.log(`✨ Created folder: audit/${targetDate}/`);
} else {
  console.log(`ℹ️ Folder audit/${targetDate}/ already exists.`);
}

// 3. Ensure Master audit/README.md Exists
const masterIndexPath = path.join(auditRootDir, 'README.md');
if (!fs.existsSync(masterIndexPath)) {
  const masterTemplate = `# 🛡️ Retro Player — Repository Audits Master Index

> Central directory and status tracking index for all architectural, security, performance, UI/UX, accessibility, SEO, AI search, and PWA audits.
> 
> Organized in chronological, date-based batches so each audit can be inspected, prioritized, and tackled step-by-step.

---

## 📌 Audits Directory Index

| Date | Title | Focus Areas | Findings | Status | Directory |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **\`${targetDate}\`** | **Full-System Repository Audit** | Security, Performance, PWA, SEO, AGO, UI/UX, Accessibility | Initializing | 📋 In Progress | **[${targetDate} Audit Hub](${targetDate}/README.md)** |

---

## 🎯 Audit Philosophy & Workflow

Just like the **[\`mirai/\`](../mirai/README.md)** directory maintains future roadmap blueprints and feature designs, the **\`audit/\`** directory maintains point-in-time system health assessments and actionable remediation specifications.

### How to Tackle an Audit Batch
1. **Open the Date-Based Hub**: Navigate to the dated folder (e.g. [\`audit/${targetDate}/README.md\`](${targetDate}/README.md)) to view the master scorecard, severity matrix, and remediation order.
2. **Tackle Specifications in Priority Order**:
   - 🚨 **Priority 1 — Security Hardening**: Eliminate path traversal, arbitrary file writes/deletions, SSRF, and root container risks.
   - 🟠 **Priority 2 — Performance Optimization**: Eliminate render-blocking font waterfalls, enable bundle code-splitting, and optimize frame loops.
   - 🟠 **Priority 3 — PWA & Subpath Compatibility**: Resolve service worker subpath matching, offline emulator fallbacks, and API fetch routing.
   - 🟡 **Priority 4 — SEO & Crawler Readiness**: Canonical links, Schema.org JSON-LD, SPA \`<noscript>\` fallback, and sitemap.
   - 🟡 **Priority 5 — AGO / AI Engine Optimization**: \`llms-full.txt\`, AI discovery tags, and W3C app store manifest parity.
   - 🟢 **Priority 6 — Documentation & Roadmap Sync**: Broken links, missing license, table discrepancies, and mirai synchronization.
3. **Track Progress with Interactive Ledgers**: Each specification includes interactive \`- [ ]\` checkboxes to track completion.
`;
  fs.writeFileSync(masterIndexPath, masterTemplate, 'utf8');
  console.log(`✨ Created master index: audit/README.md`);
} else {
  // Check if date is in master index table, prepend row if missing
  let indexContent = fs.readFileSync(masterIndexPath, 'utf8');
  if (!indexContent.includes(`**\`${targetDate}\`**`)) {
    const tableMarker = '| :---: | :--- | :--- | :---: | :---: | :---: |\n';
    const newRow = `| **\`${targetDate}\`** | **Full-System Repository Audit** | Security, Performance, PWA, SEO, AGO, UI/UX, Accessibility | In Progress | 📋 Active | **[${targetDate} Audit Hub](${targetDate}/README.md)** |\n`;
    if (indexContent.includes(tableMarker)) {
      indexContent = indexContent.replace(tableMarker, tableMarker + newRow);
      fs.writeFileSync(masterIndexPath, indexContent, 'utf8');
      console.log(`📝 Added ${targetDate} to audit/README.md table.`);
    }
  }
}

console.log(`✅ Audit workspace scaffolded successfully.`);

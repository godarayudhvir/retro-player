# Strategy Guides & Walkthrough Links Hub (`architecture/mirai/walkthrough-links-hub.md`)

## 1. Description

The **Strategy Guides & Walkthrough Links Hub** provides zero-overhead, direct access to curated community guides, speedrun leaderboards, maps, and walkthrough repositories directly from the game detail drawer (`GameDetailModal.jsx`).

Rather than hosting heavy PDF manual viewers or embedding laggy in-app browsers, Retro Player generates smart, direct outbound links to leading gaming resources (GameFAQs, StrategyWiki, Speedrun.com, RetroAchievements, and Ign Walkthroughs) tailored specifically to the selected title and platform.

---

## 2. Detailed List of What It Will Do

### User Experience
- **"Guides & Walkthroughs" Action Row in Game Detail Modal**:
  - Adds dedicated quick-launch buttons with official platform and portal icons.
- **Smart Direct Resource Links**:
  - **GameFAQs**: Pre-formatted search link: `https://gamefaqs.gamespot.com/search?game=${encodeURIComponent(cleanTitle)}`.
  - **StrategyWiki**: Direct wiki page lookup: `https://strategywiki.org/wiki/${encodeURIComponent(cleanTitle.replace(/ /g, '_'))}`.
  - **Speedrun.com**: World record speedrun boards: `https://www.speedrun.com/search?q=${encodeURIComponent(cleanTitle)}`.
  - **VGCartography / Game Maps**: Map archives for sprawling RPGs and platformers.
- **Controller-Friendly QR Code Modal**:
  - When playing on a TV or handheld in 10-Foot UI mode where opening external browser tabs is inconvenient, clicking "Mobile Companion Guide" displays an on-screen QR code so the player can scan and view the walkthrough instantly on their smartphone.

---

## 3. Detailed Logic Behind It

### Technical Implementation

1. **Title Sanitizer & Query Normalizer**:
   - Strips ROM tags (`(USA)`, `[!]`, `(Rev 1)`) to ensure clean URL querying.
2. **QR Code Generator Engine**:
   - Uses lightweight client-side QR generator (`qrcode` npm or canvas SVG rendering) to encode the target walkthrough URL into an in-app popup dialog.
3. **Safety & Privacy**:
   - Outbound links use `rel="noopener noreferrer"` and `target="_blank"`.

---

## 4. Detailed Guide of How to Set It Up

1. **Create Guides Helper (`src/utils/guideLinks.js`)**:
   - Functions: `getGameFaqsUrl(title, system)`, `getStrategyWikiUrl(title)`, `getSpeedrunUrl(title)`.
2. **Update `GameDetailModal.jsx`**:
   - Add "Guides & Walkthroughs" button group and "Scan on Phone" QR modal.

# Strategy Guides & Walkthroughs Hub (`architecture/mirai/walkthrough-links-hub.md`)

## 1. Description

The **Strategy Guides & Walkthroughs Hub** provides authentic, curated access to written walkthroughs (GameFAQs, StrategyWiki, IGN) and video walkthroughs (YouTube playlists, Longplays) directly from the game detail modal (`GameDetailModal.jsx`).

Rather than relying on automated search link generators that often lead to broken queries or missing pages, Retro Player uses **verified, curated walkthrough links (written & video) stored directly in each game's `metadata.json` sidecar**. When a user selects a walkthrough, they are seamlessly offered the choice to **redirect in a new browser tab** or **scan a QR code** to read/watch the guide on their smartphone while playing on PC, handheld, or TV.

---

## 2. Detailed List of What It Will Do

### User Experience
- **Dedicated Walkthrough Buttons in Game Detail Modal**:
  - Displays **"Written Walkthrough"** (📖) and **"Video Walkthrough"** (📺) actions if links are configured in `metadata.json`.
  - Seamlessly styled across all console themes, including **Nintendo DS Touch theme & retro vibe** (stylus-friendly touch targets, dual-screen aesthetic accents, tactile sound/click feedback).
- **Interactive Action Choice Popover (Redirect or QR Scan)**:
  - When the player clicks either "Written" or "Video" guide, an in-app console-styled modal dialog offers:
    1. 🌐 **Open in Browser** (Direct redirect in new tab: `target="_blank" rel="noopener noreferrer"`).
    2. 📱 **Scan QR on Mobile** (Displays an on-screen QR code for phone companion scanning without leaving fullscreen or TV mode).
- **Full Controller & Keyboard Spatial Navigation**:
  - 100% controllable via D-Pad, Thumbsticks, Face Buttons (A to confirm, B to close/back), Arrow Keys, Enter, and Esc.
- **Sidecar Metadata Integration**:
  - Direct read from `metadata.json`:
    ```json
    {
      "walkthrough": {
        "written": "https://gamefaqs.gamespot.com/gba/...",
        "video": "https://www.youtube.com/watch?v=..."
      }
    }
    ```
- **Update ROMs Skill Integration**:
  - The `update-roms` skill queries online databases and search results to find curated written guides (GameFAQs, StrategyWiki) and verified video walkthroughs/longplays, writing them to `metadata.json`.

---

## 3. Detailed Logic Behind It

### Technical Implementation

1. **Metadata Sidecar Schema**:
   - `metadata.json` contains optional `walkthrough` object:
     - `walkthrough.written`: URL string to authoritative written guide.
     - `walkthrough.video`: URL string to video walkthrough / longplay.
2. **Game Detail Modal & Theme Compatibility**:
   - Renders walkthrough button row in `GameDetailModal.jsx`.
   - Adopts console-specific styling tokens, ensuring Nintendo DS touch theme styling (matte dual-tone chassis, touch-friendly rounded buttons, high-contrast text).
3. **Walkthrough Choice & QR Code Modal (`GuideModal.jsx`)**:
   - Displays guide type badge (Written / Video) and game title.
   - Generates crisp client-side QR code using SVG/Canvas.
   - Includes "Open in Browser" button and "Scan with Camera" visual frame.
4. **Safety & Accessibility**:
   - Zero native popups (`alert`, `confirm`).
   - Clean keyboard/gamepad focus traps with smooth escape handling.

---

## 4. Detailed Guide of How to Set It Up

1. **Update `metadata.json` Schema & `update-roms` Skill**:
   - Enhance `.agents/skills/update-roms/scripts/update_roms.js` to search and append `walkthrough.written` and `walkthrough.video`.
2. **Create `GuideModal.jsx`**:
   - Component offering "Open Link" vs "Scan QR Code" with gamepad and DS touch support.
3. **Integrate into `GameDetailModal.jsx`**:
   - Mount walkthrough actions when `game.metadata?.walkthrough` properties exist.


# Strategy Guides & Walkthroughs Hub (`mirai/walkthrough-links-hub.md`)

## 1. Description

The **Strategy Guides & Walkthroughs Hub** provides authentic, curated access to written walkthroughs (GameFAQs, StrategyWiki, IGN) and video walkthroughs (YouTube playlists, Longplays) directly from the game detail modal (`GameDetailModal.jsx`).

Rather than relying on automated search link generators that often lead to broken queries or missing pages, Retro Player uses **verified, curated walkthrough links (written & video) stored directly in each game's `metadata.json` sidecar**. When a user selects a walkthrough, they are seamlessly offered the choice to **redirect in a new browser tab** or **scan a QR code** to read/watch the guide on their smartphone while playing on PC, handheld, or TV.

---

## 2. Detailed List of What It Will Do

### User Experience
- **Zero-Popup Inline Strategy Guides Hub**:
  - In **Vanilla Theme** (`GameDetailModal.jsx`), Strategy Guides are seamlessly integrated into the drawer's top navigation tab strip (`Strategy & Guides`), eliminating nested popups and double-backdrop clipping.
  - In **Nintendo DS Touch Theme** (`DsView.jsx`), tapping the `Guides` touch button seamlessly displays the Strategy Guides touch deck directly within the bottom touch screen with authentic DS stylus navigation (`Back to Info`, `Open Guide`, and inline pixel-framed `Phone QR` view) without any popups.
- **Inline Phone Companion QR Code View**:
  - Displays a crisp client-side QR code directly inline for phone companion scanning to read or watch guides on your smartphone while playing on PC, handheld, or TV without leaving fullscreen mode.
- **Full Controller & Keyboard Spatial Navigation**:
  - 100% controllable via D-Pad, Thumbsticks, Face Buttons (A to confirm, B to close/back), Arrow Keys, Enter, and Esc.
- **Sidecar Metadata & Manual UI Editor Integration**:
  - Direct read from `metadata.json`:
    ```json
    {
      "walkthrough": {
        "written": "https://unboundwiki.com/walkthrough/",
        "video": "https://www.youtube.com/watch?v=..."
      }
    }
    ```
- **Manual Curation & In-App Metadata Editor**:
  - Walkthrough links are purely curated manually by users/developers via the in-app Metadata Editor (`MetadataEditModal.jsx`) or directly in companion `metadata.json` sidecars (never auto-scraped online).

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

## 4. Detailed Guide of How to Set It Up

1. **`metadata.json` Schema & In-App Manual Metadata Editor**:
   - `metadata.json` sidecar supports optional `walkthrough: { written, video }` fields.
   - `MetadataEditModal.jsx` provides manual inputs for Written Walkthrough URL and Video Walkthrough URL to easily curate links directly in the UI.
2. **Create `GuideModal.jsx`**:
   - Component offering "Open Link" vs "Scan QR Code" with gamepad and DS touch support.
3. **Integrate into `GameDetailModal.jsx` & `DsView.jsx`**:
   - Mount walkthrough actions when `game.metadata?.walkthrough` properties exist.


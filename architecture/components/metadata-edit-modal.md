# Jellyfin-Style Metadata Editor Modal (`architecture/components/metadata-edit-modal.md`)

## 1. Description

The `MetadataEditModal` component is an in-app Jellyfin-style manual metadata editor. It allows players to manually override game title, synopsis, release year, genre, developer, publisher, and cover art for any ROM in the library — useful for ROM hacks, homebrew titles, regional variants, and custom dumps that the automated scraper cannot match. Saves are persisted to the server sidecar via REST API and immediately reflected in `IndexedDB` cache.

---

## 2. Detailed List of What It Does

- **Editable Metadata Fields**:
  - **Title**: Text input overriding the game title.
  - **Description / Synopsis**: Textarea for game plot summary or description.
  - **Release Year**: Numeric input for the publication year.
  - **Genre**: Text input for game genre classification.
  - **Developer**: Text input for the development studio name.
  - **Publisher**: Text input for the publisher name.
  - **Written Walkthrough URL**: Direct URL link for written strategy guides and walkthroughs (e.g. Unbound Wiki, StrategyWiki, GameFAQs).
  - **Video Walkthrough URL**: Direct URL link for video playthroughs and longplays (e.g. YouTube).

- **Cover Art Override**:
  - **URL Input**: Direct URL field to specify a remote cover image.
  - **Local Upload**: File picker accepting PNG, WebP, JPG. Client-side canvas resizes and compresses the image (max 600×600px) and encodes it as a Base64 data URL for immediate preview and storage.
  - **Live Preview**: Real-time cover art preview rendered inline. Broken image triggers `previewError` state and hides the preview.

- **Save to Server Sidecar**: `saveManualMetadata(game.id, payload)` via `POST /api/metadata/save-sidecar` (from `src/services/metadataScraper.js`). On success, triggers `onSaveSuccess(updatedRecord)` to update the live in-memory metadata map via `scraper.updateLocalMetadata`.

- **Reset to Scraped Data**: "Reset" button calls `deleteManualMetadata(game.id)` to remove the manual override sidecar, restoring the next auto-scraped or cached record.

- **Save Status Banner**: Inline `saveStatus` banner renders `{ type: 'success' | 'error', message }` feedback without native alert popups.

- **100% Keyboard & Gamepad Navigation**: `Escape` / `B` closes. Tab navigates between fields. `Enter` saves. Arrow keys operate buttons.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & State
- `isOpen` (boolean): Controls modal visibility.
- `game` (Object): The active game object. If `null`, modal returns `null` early.
- `metadata` (Object): Current scraped/cached metadata record for the game.
- `onSaveSuccess` (function): Called with `updatedRecord` after successful save.
- `onClose` (function): Dismisses modal and restores focus.
- `focusedTarget` & `setFocusedTarget`: Spatial navigation state.
- `sfx` (Object): Web Audio synthesizer.

### Key Internal State
- `title`, `description`, `releaseYear`, `developer`, `publisher`, `genre`, `writtenWalkthrough`, `videoWalkthrough`, `coverUrl`: Controlled form field states, initialized from `metadata` on open and re-synced whenever `game` or `metadata` change via `useEffect`.
- `isSaving`: Boolean submit in-progress flag.
- `saveStatus`: `{ type: 'success' | 'error', message: string }` feedback state.
- `previewError`: Boolean — set to `true` when the cover art `<img>` `onError` fires.

### Image Upload & Compression Flow
1. User selects a local file via `fileInputRef.current.click()`.
2. `FileReader.readAsDataURL(file)` loads the image bytes.
3. Image is drawn onto a `<canvas>` element, scaled down to max 600×600px maintaining aspect ratio.
4. `canvas.toDataURL('image/webp', 0.85)` encodes as Base64 WebP data URL.
5. `setCoverUrl(dataUrl)` updates the field and preview immediately.

### Save Payload
```javascript
{
  title,
  description,
  releaseYear,
  developer,
  publisher,
  genre,
  coverUrl,
  walkthrough: {
    written: writtenWalkthrough,
    video: videoWalkthrough
  }
}
```
Sent via `POST /api/metadata/save-sidecar` and cached in IndexedDB.

### Source Locations
- Component: [src/components/MetadataEditModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/MetadataEditModal.jsx)
- Save/Delete Functions: [src/services/metadataScraper.js](file:///Users/godarayudhvir/Github/retro-player/src/services/metadataScraper.js) → `saveManualMetadata`, `deleteManualMetadata`

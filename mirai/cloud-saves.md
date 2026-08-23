# Cloud Save State Sync Architecture (`mirai/cloud-saves.md`)

## 1. Description

The **Cloud Save State Sync** specification outlines the cross-device save synchronization and backup storage architecture for Retro Player.

This system allows players to preserve their game progress across devices (PC, Mobile Phone, Tablet, TV, Steam Deck). Battery RAM (`.sav`) and emulator save states (`.state`) are automatically compressed, hashed, and synchronized to user-owned cloud endpoints (**Google Drive**, **Cloudflare R2 / AWS S3**, or **Supabase Backend**).

---

## 2. Detailed List of What It Will Do

### User-Facing Capabilities
- **Automatic Background Cloud Sync**:
  - Automatically commits battery RAM (`.sav`) and quick save states upon exiting any game or returning to the home menu.
- **Cross-Device Continuity**:
  - Start playing a game on a desktop computer, save progress, and seamlessly resume from the exact same in-game save on a mobile phone or handheld device.
- **Interactive Save Conflict Resolver**:
  - If a newer save state is detected in the cloud compared to the local browser copy, the app presents a clean, gamepad-navigable conflict dialog displaying save timestamps, playtime differences, and snapshot previews.
- **Selective Provider Linking**:
  - Supports linking to personal **Google Drive** (via OAuth2 PKCE), **Cloudflare R2 / AWS S3** bucket, or a **Supabase** cloud database.

---

## 3. Detailed Logic Behind It

### Flow Architecture

```mermaid
graph TD
    A[Emulator Session Active] --> B[User Exits Game / Closes Modal]
    
    B --> C[Extract Battery RAM (.sav) & Save State (.state)]
    C --> D[GZIP Compress Binary Array]
    D --> E[Compute SHA-256 Checksum]
    
    E --> F{Sync Target}
    F -->|Google Drive| G[Upload to RetroPlayer_Saves Folder]
    F -->|S3 / R2 Bucket| H[PutObject /saves/userId/gameId.sav]
    F -->|Supabase| I[Commit to /saves Bucket + Update Metadata Row]
    
    G --> J[Commit Timestamp & State to IndexedDB]
    H --> J
    I --> J
```

### Technical Implementation

1. **Extraction & Compression**:
   - Captures `EJS_emulator.gameManager.getState()` and SRAM buffers from `EmulatorModal.jsx`.
   - Uses `fflate.gzipSync` to compress binary payloads by up to 70-90% before transmission.
2. **Conflict Resolution Strategy**:
   - Local timestamp vs Remote timestamp comparison.
   - If timestamp delta $> 5000\text{ms}$ and checksum mismatch, prompt user via `SaveConflictModal.jsx` before overwriting local data.
3. **IndexedDB Local Store Synchronization (`services/db.js`)**:
   - Store: `game_saves_manifest`
     - Fields: `gameId`, `systemKey`, `saveType`, `lastSyncedAt`, `checksum`, `cloudProvider`.

---

## 4. Detailed Guide of How to Set It Up

1. **Create Save Sync Service (`src/services/saveSyncService.js`)**:
   - Orchestrates compression, hashing, provider dispatch, and conflict detection.
2. **Hook Into Game Teardown**:
   - In `EmulatorModal.jsx`, intercept modal close and tab unload (`beforeunload`) to ensure SRAM is flushed and queued for sync.
3. **Add Conflict Dialog**:
   - Implement `src/components/SaveConflictModal.jsx` conforming to the console styling guidelines with full gamepad/keyboard navigation.

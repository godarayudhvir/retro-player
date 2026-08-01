# Cloud Save State Sync Architecture (`architecture/mirai/cloud-saves.md`)

## 1. Description
The Cloud Save State Sync specification documents the upcoming cross-device save synchronization and backup storage architecture for Retro Player.

---

## 2. Detailed List of What It Will Do
- **Automatic Cloud Backup**: Backup SRAM battery saves and emulator save states automatically upon closing a game session.
- **Cross-Device Sync**: Synchronize save files across desktop browsers, mobile devices, and handheld consoles via user cloud storage (Google Drive, Dropbox, or custom S3 backend).
- **Conflict Resolution UI**: Interactive save file conflict prompt allowing users to choose between cloud save timestamp vs local save state.

---

## 3. Detailed Logic Behind It
- **Save State Extraction**: Listen to `handleClose()` or `EJS_onSaveState` events in [EmulatorModal.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/components/EmulatorModal.jsx).
- **Blob Encryption & Upload**: Compress save state binary arrays using GZIP, compute SHA-256 hash, and upload to target cloud storage endpoint.

---

## 4. Detailed Guide of How to Set It Up
1. Configure OAuth2 authentication provider (e.g., Supabase / Firebase / Google Drive API).
2. Integrate storage adapter module in `/src/services/cloudStorage.js`.
3. Add save sync toggle settings in top navigation bar.

# Background Music (BGM) Engine & Audio Systems (`architecture/modules/bgm-engine.md`)

## 1. Description
The **Background Music (BGM) Engine** provides audio atmosphere across the Retro Player console UI by scanning, streaming, and playing curated chiptune and retro background tracks from `public/bgm/` or an external Docker volume mount point.

---

## 2. Detailed List of What It Does
- **Dynamic BGM Track Discovery (`/api/bgm`)**:
  - Automatically indexes audio files (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.flac`, `.aac`) in the configured BGM folder.
  - Generates clean track titles and streamable media URLs.
- **Smart In-Game Auto-Pause**:
  - Automatically pauses background music when a game launches in `EmulatorModal.jsx` to prevent clashing with in-game music and sound effects.
  - Automatically resumes playback when exiting the emulator back to the main console library.
- **Topbar Audio Controls**:
  - Compact icon button (`Music`) indicating active playback state with pulsing animation when playing.
  - Quick track skipping button (`SkipForward`) to advance through playlists.
  - Full title tooltip showing current track name.
- **Playlist Cycling & Auto-Advance**:
  - Automatically advances to the next track when the current song completes (`ended` event listener).
- **Persistent Volume & Preferences**:
  - Persists track index, volume, and mute states in `localStorage` under `retro_bgm_track_index`, `retro_bgm_volume`, and `retro_bgm_muted`.
- **Gitignore & Copyright Protection**:
  - Audio files and directories (`bgm/`, `**/bgm/`, `public/bgm/`, `*.mp3`, `*.ogg`, `*.wav`, `*.flac`) are strictly ignored from source control.
- **Docker & Volume Management**:
  - Configured with `BGM_DIR=/bgm` environment variable and `./bgm:/bgm` volume mount in `docker-compose.yml` and `Dockerfile`, allowing users to mount their own background music collections.

---

## 3. Detailed Logic Behind Everything and How It Works

### Hook Management (`useBgmEngine.js`)
- `tracks`: Array of scanned track descriptor objects `{ id, title, filename, url }`.
- `currentTrackIndex`: Zero-based index into the playlist array.
- `isPlaying`, `isMuted`, `volume`: Reactive playback state.
- `togglePlay()`: Starts or pauses playback.
- `nextTrack()` / `prevTrack()`: Cycles track index circularly.
- `setBgmVolume(val)`: Sets normalized volume (0.0 to 1.0) and updates active `Audio` element.

### Server & Express Middlewares (`server.js` & `vite.config.js`)
- `/api/bgm`: Scans `BGM_DIR` directory for valid audio extensions and returns JSON list of tracks.
- `/bgm/:trackFile`: Streams raw audio binary with `Accept-Ranges: bytes`, `Content-Type: audio/mpeg` (or appropriate MIME type), and CORS headers.

### Source Locations
- Hook: [src/hooks/useBgmEngine.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useBgmEngine.js)
- Server Handler: [server.js](file:///Users/godarayudhvir/Github/retro-player/server.js)
- Vite Dev Handler: [vite.config.js](file:///Users/godarayudhvir/Github/retro-player/vite.config.js)

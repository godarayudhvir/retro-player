# 🎵 Background Music (BGM) Engine & Audio Architecture

**Retro Player** includes a built-in, console-grade **Background Music (BGM) Engine** designed to recreate authentic retro console lobby atmospheres (like the Wii Shop Channel, PS3 XMB, and Dreamcast bios) while browsing cartridge libraries, managing saves, and exploring achievement showcases.

---

## 🏗️ Architecture Overview

The BGM system uses a **dual-layer virtual hierarchy** ensuring that default retro tracks are always available out of the box, while allowing complete customization without cluttering or modifying your host filesystems.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BGM ENGINE PIPELINE                             │
├───────────────────────────────────────┬────────────────────────────────┤
│           User Volume (/bgm)          │    Bundled Tracks (/app/public/bgm)│
│  - Custom .mp3, .m4a, .ogg, .flac, etc│  - track2.m4a (CHILL LOBBY)    │
│  - Takes precedence on naming collision│ - track3.m4a (PIXEL GROOVE)   │
│  - Persisted across container updates │  - track4.m4a (RETRO WAVES)    │
│                                       │  - track5.m4a (MIDNIGHT SYNTH) │
│                                       │  - track6.m4a (ARCADE DREAMS)  │
└───────────────────┬───────────────────┴────────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Backend Dynamic Scanner (/api/bgm)         │
       │   - Merges directories (if INCLUDE_DEMO_BGM=true)      │
       │   - Parses filenames into clean uppercase titles       │
       │   - Generates unique slugged track IDs & stream URLs   │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             Frontend Client Engine (useBgmEngine)      │
       │   - Smart in-game auto-pause / auto-resume             │
       │   - IndexedDB & LocalStorage volume/mute persistence   │
       │   - OS MediaSession lockscreen & hardware keys sync   │
       │   - Organic gamification & achievements integration   │
       └────────────────────────────────────────────────────────┘
```

---

## 🎧 Supported Audio Formats

The backend dynamically detects, validates, and streams all standard audio codecs:

| Extension | Audio Format | MIME Type | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| **`.m4a`** | MPEG-4 AAC / ALAC | `audio/mp4` | High fidelity with ultra-low file size (Default bundled tracks) |
| **`.mp3`** | MPEG Layer-3 | `audio/mpeg` | Universal compatibility across all legacy retro tracks |
| **`.ogg`** | Ogg Vorbis | `audio/ogg` | Open-source gaming audio format |
| **`.wav`** | Linear PCM Waveform | `audio/wav` | Uncompressed studio audio / raw chiptune dumps |
| **`.flac`** | Free Lossless Audio Codec | `audio/flac` | Bit-perfect audiophile sound quality |
| **`.aac`** | Advanced Audio Coding | `audio/aac` | Low-bitrate streaming audio |

---

## 🏷️ Automatic Title Formatting & Dynamic Scanning

When files are placed into the BGM folder, the scanner parses the filename dynamically on request without requiring a server reboot:

1. **Title Cleanup**: Hyphens (`-`) and underscores (`_`) are replaced with clean spaces, and extra whitespace is stripped.
2. **Capitalization**: Titles are rendered in clean uppercase for authentic arcade display aesthetics.
3. **ID Generation**: Generates deterministic, collision-resistant IDs prefixed with `bgm-`.
4. **Byte-Range Streaming**: Serves files with `Accept-Ranges: bytes` headers for instant scrubbing and seamless seek operations.

### Filename Parsing Examples

| Original Filename | Generated In-App Title | Generated Track ID |
| :--- | :--- | :--- |
| `pokemon_gym_leader_battle.m4a` | **`POKEMON GYM LEADER BATTLE`** | `bgm-pokemon-gym-leader-battle` |
| `castlevania-vampire-killer.mp3` | **`CASTLEVANIA VAMPIRE KILLER`** | `bgm-castlevania-vampire-killer` |
| `zelda_fairy_fountain.ogg` | **`ZELDA FAIRY FOUNTAIN`** | `bgm-zelda-fairy-fountain` |
| `chrono_trigger_corridors_of_time.flac` | **`CHRONO TRIGGER CORRIDORS OF TIME`** | `bgm-chrono-trigger-corridors-of-time` |

---

## ⚙️ Configuration & Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `BGM_DIR` | `/bgm` *(Docker)* <br>`public/bgm` *(Local)* | Directory path where user-provided custom background audio tracks reside. |
| `INCLUDE_DEMO_BGM` | `true` | When `true`, automatically merges the built-in demo tracks with your custom folder. Set to `false` for exclusively custom tracks. |

### Docker Compose Example
```yaml
services:
  retro-player:
    image: retro-player:latest
    container_name: retro-player
    ports:
      - "3000:3000"
    environment:
      - INCLUDE_DEMO_BGM=true # Set to false to hide bundled tracks
    volumes:
      - ./roms:/roms
      - ./bgm:/bgm           # Drop your custom music files here
      - ./data:/data
    restart: unless-stopped
```

---

## 🕹️ Client Engine Features (`useBgmEngine`)

### 1. Smart Gameplay Auto-Pause
* **Active Game Detection**: When a cartridge is launched, the BGM engine automatically fades and pauses background music so that the emulator core's native chiptune audio plays with zero interference.
* **Seamless Resume**: When returning to the library menu, BGM automatically resumes where it left off.

### 2. Multi-Tier Volume & State Persistence
* Track index, mute status, and volume level are saved across reloads using **IndexedDB** (`STORES.SETTINGS` $\rightarrow$ `bgm_config`) with instant **LocalStorage** fallback.

### 3. Universal Remote & Hardware Controls
* **OS MediaSession Sync**: Integrates with macOS Control Center, iOS Lock Screen, Android Media Notifications, and Windows Media Overlay to allow track skipping, play/pause, and volume adjustments from keyboard multimedia keys or mobile widgets.

### 4. Organic Gamification & Trophies
The BGM engine directly triggers achievements:
* 🏆 **Lobby Chillout**: Idle in the cartridge library for over 5 minutes with BGM playing.
* 🏆 **Soundtrack Explorer**: Listen to at least 3 distinct chiptune BGM tracks.

---

## 🌐 Tri-Environment Compatibility

The BGM engine is engineered with strict compatibility across all 3 deployment environments:

1. **Docker / Self-Hosted Runtime**:
   - `server.js` serves streaming audio from `/bgm` and `/app/public/bgm`.
   - `/api/bgm` exposes the dynamic scanner.
   - `/api/upload-bgm` and `/api/delete-bgm` manage file lifecycle via authenticated API routes.
2. **Local Development (`npm run dev`)**:
   - `vite.config.js` mirrors all BGM endpoints (`/bgm`, `/api/bgm`, `/api/upload-bgm`, `/api/delete-bgm`) via `server.middlewares`.
3. **Static Hosting / GitHub Pages**:
   - Bundled Vite build generates static `/api/bgm` and `/api/bgm.json` manifests.
   - Client engine includes built-in fallback tracks (`DEFAULT_BGM_TRACKS`) ensuring zero broken audio playback even on serverless CDNs.

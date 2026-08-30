# 🎮 Rich Presence & Multi-Platform Game Activity (Discord RPC, OS MediaSession, OBS & Webhooks)

## 1. Description
Provides seamless, real-time rich presence broadcasting across multiple gaming, social, and operating system ecosystems whenever a user launches or plays a game in Retro Player.

This bridges the gap between web/browser-based emulation and native desktop console experiences by synchronizing active gameplay titles, retro platform tags, elapsed playtime timers, and high-resolution cover art to:
1. **Discord Rich Presence (RPC)**: Native activity status on Discord Desktop (`Playing Pokémon FireRed Version • Game Boy Advance`).
2. **OS MediaSession API**: Native OS Lock Screen and Control Center integration on macOS, Windows 11, iOS, Android, and Apple Watch with system-level play/pause controls.
3. **Local Broadcast & Webhook Feed (`/api/presence`)**: Real-time REST and WebSocket endpoint for OBS streaming overlays, Stream Deck plugins, and Home Assistant smart lighting automations.
4. **Instant Social Share & Copyable Status**: One-click formatted gaming cards for Steam, Telegram, WhatsApp, and social bios.

---

## 2. Detailed List of What It Will Do

### A. Discord Rich Presence (RPC)
- **Application Identification**: Displays `Retro Player` as the verified active game application on Discord profiles.
- **Game & Platform Details**:
  - `Details`: Current Game Name (e.g. *Super Mario World*, *Pokémon Emerald*, *Castlevania: Symphony of the Night*).
  - `State`: System / Platform Name + In-Game Milestones (e.g. *Super Nintendo • 40 Stars* or *Game Boy Advance • Pallet Town*).
- **Elapsed Playtime Timer**: Starts a live session timer (`00:14:22 elapsed`) on game launch and clears upon exit.
- **Dynamic Asset Art**:
  - **Large Image**: High-resolution box art cover fetched from local metadata sidecar or Libretro CDN.
  - **Small Image**: Authentic retro console badge (NES, SNES, N64, GB, GBC, GBA, NDS, PS1, Genesis).

### B. OS Native MediaSession Integration (macOS, Windows, iOS, Android)
- **Lock Screen & Media Controls**:
  - Automatically feeds `navigator.mediaSession.metadata` on game launch.
  - Shows game title as Track Title, console system as Artist/Album, and high-res cover art in system media popups (macOS Control Center, Windows 11 Action Center, iOS Lock Screen, Android Notification Shade).
- **Hardware Media Keys**:
  - Pressing keyboard/controller Play/Pause media keys pauses or resumes emulation seamlessly.

### C. Live Stream & Home Automation Broadcast (`/api/presence`)
- **Real-Time Endpoint**:
  - `server.js` exposes `GET /api/presence` and `WS /api/presence/live`.
  - Emits JSON payloads with `gameTitle`, `systemKey`, `coverUrl`, `sessionStartTime`, `isPaused`, and `activeProfileName`.
- **OBS / Twitch Overlay Widget**:
  - Lightweight transparent HTML widget (`/widgets/now-playing.html`) for streamers displaying dynamic retro cartridge animations and game names.

---

## 3. Detailed Logic Behind It

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│             Retro Player Web App (Frontend)            │
│  - useGamePresence Hook (Watches activeGame & state)  │
│  - navigator.mediaSession (OS Control Center / Lock)   │
└──────────────────────────┬─────────────────────────────┘
                           │ (HTTP POST / WebSocket Event)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Retro Player Server (Node.js)              │
│  - server.js /api/presence Endpoint                    │
│  - Local Discord IPC Socket Client (`/tmp/discord-ipc`)│
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│ Discord Desktop  │               │ OBS / Stream Deck│
│ Rich Presence    │               │ Local Webhooks   │
└──────────────────┘               └──────────────────┘
```

### Data Flow & Payload Specification
1. **Frontend Dispatch**:
   - In `App.jsx` / `EmulatorModal.jsx`, when `activeGame` transitions:
     ```js
     fetch('/api/presence', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         action: activeGame ? 'PLAYING' : 'IDLE',
         gameTitle: activeGame?.title,
         systemKey: activeGame?.systemKey,
         coverUrl: activeGame?.coverUrl,
         startTimestamp: Date.now()
       })
     });
     ```
2. **Discord IPC Connection**:
   - `server.js` maintains a local Unix Domain Socket / Named Pipe connection to the local Discord client (`/tmp/discord-ipc-0` on macOS/Linux or `\\?\pipe\discord-ipc-0` on Windows).
   - Sends standard Discord Rich Presence payloads with Discord Application Client ID.
3. **Session Teardown**:
   - Exiting the emulator sends `action: 'IDLE'`, clearing Discord Rich Presence and removing active MediaSession controls.

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Frontend MediaSession Hook
Create `src/hooks/useGamePresence.js` to handle browser OS-level media session synchronization:
```js
export function useGamePresence(activeGame, isPaused, togglePause) {
  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeGame) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeGame.title || activeGame.name,
      artist: activeGame.systemKey?.toUpperCase() || 'Retro Console',
      album: 'Retro Player',
      artwork: activeGame.coverUrl ? [{ src: activeGame.coverUrl, sizes: '512x512', type: 'image/png' }] : []
    });

    navigator.mediaSession.setActionHandler('play', () => togglePause(false));
    navigator.mediaSession.setActionHandler('pause', () => togglePause(true));

    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [activeGame, isPaused, togglePause]);
}
```

### Step 2: Discord Application Registration
1. Register a free Application on the [Discord Developer Portal](https://discord.com/developers/applications) named `Retro Player`.
2. Upload retro console icons (NES, SNES, N64, GBA, NDS, PS1, Genesis, GB) as rich presence art assets.

### Step 3: Server Discord IPC Socket Integration
In `server.js`, integrate a lightweight Discord IPC socket client (e.g. `@xhayper/discord-rpc` or pure standard IPC socket) to listen for `/api/presence` updates from the client and broadcast to the local Discord client.

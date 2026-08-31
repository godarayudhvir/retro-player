# 🎮 Rich Presence, OS Media Controls & Broadcast Feeds

Retro Player features real-time, multi-platform gaming activity broadcasting across desktop gaming ecosystems, operating systems, and live streaming overlays whenever you launch and play any retro title.

---

## 1. 🖥️ Discord Desktop Rich Presence (RPC)

Whenever you launch a game on your desktop PC (macOS, Windows, or Linux), Retro Player connects directly to your running Discord desktop client using a zero-dependency local IPC domain socket (`/tmp/discord-ipc-0` on Unix/macOS or `\\\\?\\pipe\\discord-ipc-0` on Windows).

```
┌────────────────────────────────────────────────────────┐
│  👤 UserProfile                                        │
│  🎮 Playing Retro Player                               │
│                                                        │
│  [🖼️ Box Art]   Playing Pokémon Emerald Version        │
│                  Game Boy Advance                      │
│                  🎮 00:14:22 elapsed                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📂 GitHub Repository                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Discord RPC Payload Features:
* **Active Game Title**: Displays the full canonical name of the active game (`Playing <Game Title>`).
* **Retro System Tag**: Shows the console system (`Game Boy Advance`, `PlayStation`, `Super Nintendo`, etc.).
* **Dynamic Box Art / App Icon Fallback**:
  * **When Deployed / Public HTTPS Cover Available**: Discord's image proxy automatically loads and renders the **authentic high-resolution game box art** for every title.
  * **When Running Locally / Offline**: Discord cleanly displays your custom **Retro Player App Icon**.
* **Live Session Playtime**: Synchronizes elapsed gameplay time in real time (`🎮 00:14:22 elapsed`).
* **Interactive Profile Button**: Link to open the open-source repository on GitHub (`📂 GitHub Repository`).
* **Zero Configuration**: No manual "Add a Game" required in Discord — Retro Player connects and registers automatically via the official Discord RPC protocol.

### Setting Up Your Discord Application:
1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and name it `Retro Player` (or your preferred display title).
3. **Set Your App Icon**: Under the **General Information** tab, upload a logo or game controller icon in the **App Icon** box to replace the default dice placeholder.
4. **Copy Application ID**: Copy the 18/19-digit **Application ID** from the General Information page.
5. **Add to `.env`**: Add the ID to your local `.env` file in the project root (which is gitignored):
   ```env
   DISCORD_CLIENT_ID=YOUR_APPLICATION_ID
   ```
6. Ensure the Discord Desktop App is running on your Mac/PC with **"Display current activity as a status message"** toggled **ON** in Discord **User Settings ➔ Activity Privacy**.

---

## 2. 📱 OS MediaSession & Hardware Media Controls

Retro Player integrates natively with the **W3C MediaSession API**, publishing live gameplay telemetry to your operating system's native media control deck:
* **macOS**: Control Center "Now Playing" widget, Lock Screen, and Touch Bar.
* **Windows 11 / 10**: Action Center & Lock Screen media controls.
* **iOS / iPadOS**: Lock Screen, Dynamic Island, and Control Center.
* **Android**: Notification drawer media card & Quick Settings.

```
┌────────────────────────────────────────────────────────┐
│  🍎 Now Playing                                        │
│                                                        │
│  [🖼️ Cover Art]  Pokémon Blue Version                  │
│                   Game Boy • Retro Player              │
│                                                        │
│   00:14:22 ━━━━━━━●──────────────────────── 24:00:00   │
│                   [⏮️]     [⏯️]     [⏭️]               │
│               Step-Down  Pause/Play  Fast-Forward      │
└────────────────────────────────────────────────────────┘
```

### Interactive Hardware Media Actions:
* **⏱️ Live Session Playtime Scrubber (`setPositionState`)**: Tracks your exact active session playtime (`00:00 ➔ 01:05:00`) continuously on the timeline without looping resets.
* **⏯️ Play / Pause (`play` / `pause`)**: Freezes the active WebAssembly emulation frame loop and audio, and pauses the session playtime clock simultaneously. Seamlessly resumes upon press. Also triggered via Mac / keyboard Play/Pause media keys and bluetooth headphones.
* **⏭️ Fast-Forward (`nexttrack` / `seekforward`)**: Cycles through emulation speed multipliers (`1.0x ➔ 1.5x ➔ 2.0x ➔ 3.0x ➔ 4.0x ➔ 5.0x`).
* **⏮️ Step Down Speed (`previoustrack` / `seekbackward`)**: Decrements speed multiplier back down toward normal speed (`1.0x`).

### Platform & Browser Verification Status:

| Operating System | Browser / Environment | Status | Notes |
| :--- | :--- | :---: | :--- |
| **macOS** | **Google Chrome** | ✅ **Verified & Working** | Full Game Title, System Subtitle, Cover Art, Live Session Scrubber, Play/Pause freeze & Fast-Forward controls verified. |
| **macOS** | **Safari** | 📋 *Yet to Test* | Implemented via W3C MediaSession spec & persistent audio anchor; manual Safari testing pending. |
| **macOS** | **Mozilla Firefox** | 📋 *Yet to Test* | Implemented via W3C MediaSession spec; manual Firefox macOS testing pending. |
| **Windows 11 / 10** | **Google Chrome / Edge** | 📋 *Yet to Test* | Implemented for Action Center & Windows Lock Screen; manual Windows testing pending. |
| **Windows 11 / 10** | **Mozilla Firefox** | 📋 *Yet to Test* | Implemented for Windows System Media Transport Controls (SMTC); manual testing pending. |
| **Android** | **Google Chrome** | 📋 *Yet to Test* | Implemented with persistent audio anchor for notification drawer player; manual mobile testing pending. |
| **Android** | **Mozilla Firefox** | 📋 *Yet to Test* | Implemented for Android media notification player; manual mobile testing pending. |
| **iOS / iPadOS** | **Mobile Safari** | 📋 *Yet to Test* | Implemented for Lock Screen & Dynamic Island; manual iOS testing pending. |

---

## 3. 🌐 REST API & OBS Streamer Overlay Widget

Retro Player exposes real-time game presence over REST and bundles a transparent HTML overlay widget designed for OBS Studio, Streamlabs, and smart home automations:

### A. REST Endpoint (`/api/presence`)
```bash
# Query current active game presence
curl http://localhost:3000/api/presence
```

**Response Payload (`PLAYING`):**
```json
{
  "action": "PLAYING",
  "gameTitle": "Pokémon Emerald Version",
  "systemKey": "gba",
  "systemName": "Game Boy Advance",
  "coverUrl": "/roms/gba/Pokemon%20Emerald/cover.png",
  "startTimestamp": 1725134800000,
  "updatedAt": 1725134800000
}
```

**Response Payload (`IDLE`):**
```json
{
  "action": "IDLE",
  "gameTitle": null,
  "systemKey": null,
  "systemName": null,
  "coverUrl": null,
  "startTimestamp": null,
  "updatedAt": 1725134900000
}
```

### B. OBS Streamer Overlay Widget (`/widgets/now-playing.html`)
Streamers can add Retro Player's live "Now Playing" card directly into OBS Studio / Streamlabs as a **Browser Source**:
1. In OBS, add a new **Browser Source**.
2. Set the URL to: `http://localhost:3000/widgets/now-playing.html` (or your hosted domain).
3. Set dimensions to `420 x 140`.
4. Check **"Shutdown source when not visible"**.
5. The widget automatically appears when a game is launched (displaying animated glowing pill, box art, system badge, and live session playtime) and gracefully slides out when returning to the game library.

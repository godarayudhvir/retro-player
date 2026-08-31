import net from 'net';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1544079303598411776';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const GITHUB_URL = 'https://github.com/godarayudhvir/retro-player';

const OPCODES = {
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4
};

class DiscordRpcClient {
  constructor(clientId = CLIENT_ID) {
    this.clientId = clientId;
    this.socket = null;
    this.isConnected = false;
    this.isHandshaking = false;
    this.currentActivity = null;
    this.reconnectTimer = null;
  }

  getIpcPaths(id = 0) {
    if (process.platform === 'win32') {
      return [`\\\\?\\pipe\\discord-ipc-${id}`];
    }
    const candidates = [
      path.join(os.tmpdir(), `discord-ipc-${id}`),
      path.join(process.env.TMPDIR || '', `discord-ipc-${id}`),
      path.join(process.env.XDG_RUNTIME_DIR || '', `discord-ipc-${id}`),
      path.join('/tmp', `discord-ipc-${id}`),
      path.join(process.env.TMP || '', `discord-ipc-${id}`),
      path.join(process.env.TEMP || '', `discord-ipc-${id}`)
    ].filter(Boolean);

    // Return unique existing paths or fallbacks
    return Array.from(new Set(candidates));
  }

  connect() {
    if (this.socket || this.isHandshaking) return;
    this.isHandshaking = true;

    const allPaths = [];
    for (let id = 0; id <= 9; id++) {
      allPaths.push(...this.getIpcPaths(id));
    }
    const uniquePaths = Array.from(new Set(allPaths));

    const tryConnect = (idx = 0) => {
      if (idx >= uniquePaths.length) {
        this.isHandshaking = false;
        this.socket = null;
        return;
      }

      const socketPath = uniquePaths[idx];
      const socket = net.createConnection(socketPath);

      socket.once('connect', () => {
        this.socket = socket;
        this.isHandshaking = false;
        this.sendHandshake();
      });

      socket.on('data', (data) => {
        this.handleData(data);
      });

      socket.once('error', () => {
        socket.destroy();
        if (!this.isConnected && idx < uniquePaths.length - 1) {
          tryConnect(idx + 1);
        } else {
          this.cleanup();
        }
      });

      socket.once('close', () => {
        this.cleanup();
      });
    };

    tryConnect(0);
  }

  cleanup() {
    this.isConnected = false;
    this.isHandshaking = false;
    if (this.socket) {
      this.socket.removeAllListeners();
      try {
        this.socket.destroy();
      } catch {
        // Ignore destroy error
      }
      this.socket = null;
    }
  }

  encode(op, data) {
    const json = JSON.stringify(data);
    const len = Buffer.byteLength(json);
    const buf = Buffer.alloc(8 + len);
    buf.writeInt32LE(op, 0);
    buf.writeInt32LE(len, 4);
    buf.write(json, 8, len);
    return buf;
  }

  sendHandshake() {
    if (!this.socket) return;
    const packet = this.encode(OPCODES.HANDSHAKE, {
      v: 1,
      client_id: this.clientId
    });
    this.socket.write(packet);
  }

  handleData(buffer) {
    if (buffer.length < 8) return;
    const op = buffer.readInt32LE(0);
    const len = buffer.readInt32LE(4);
    const dataStr = buffer.slice(8, 8 + len).toString();

    try {
      const data = JSON.parse(dataStr);
      if (op === OPCODES.FRAME && data.cmd === 'DISPATCH' && data.evt === 'READY') {
        this.isConnected = true;
        if (this.currentActivity) {
          this.dispatchActivity(this.currentActivity);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  setActivity({ gameTitle, systemKey, systemName, coverUrl, startTimestamp }) {
    if (!gameTitle) {
      this.clearActivity();
      return;
    }

    const activity = {
      details: `Playing ${gameTitle}`,
      state: systemName || systemKey?.toUpperCase() || 'Retro Console',
      timestamps: {
        start: startTimestamp ? Math.floor(new Date(startTimestamp).getTime() / 1000) : Math.floor(Date.now() / 1000)
      }
    };

    // Assets: Discord only accepts public HTTPS URLs or uploaded Developer Portal asset keys
    const assets = {};
    if (coverUrl && coverUrl.startsWith('https://')) {
      assets.large_image = coverUrl;
      assets.large_text = gameTitle;
    }
    if (Object.keys(assets).length > 0) {
      activity.assets = assets;
    }

    // Buttons: Discord strictly requires valid HTTPS URLs (rejects http://localhost)
    const buttons = [];
    if (APP_URL && APP_URL.startsWith('https://')) {
      buttons.push({
        label: '🎮 Play in Browser',
        url: APP_URL
      });
    }
    if (GITHUB_URL && GITHUB_URL.startsWith('https://')) {
      buttons.push({
        label: '📂 GitHub Repository',
        url: GITHUB_URL
      });
    }
    if (buttons.length > 0) {
      activity.buttons = buttons.slice(0, 2);
    }

    this.currentActivity = activity;

    if (this.isConnected && this.socket) {
      this.dispatchActivity(activity);
    } else {
      this.connect();
    }
  }

  dispatchActivity(activity) {
    if (!this.socket || !this.isConnected) return;
    const payload = {
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity: activity || null
      },
      nonce: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    };

    try {
      this.socket.write(this.encode(OPCODES.FRAME, payload));
    } catch {
      this.cleanup();
    }
  }

  clearActivity() {
    this.currentActivity = null;
    if (this.isConnected && this.socket) {
      this.dispatchActivity(null);
    }
  }
}

export const discordRpc = new DiscordRpcClient();

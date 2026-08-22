import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Gamepad2, 
  Wifi, 
  WifiOff, 
  Menu, 
  Activity, 
  ShieldCheck, 
  RotateCcw, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Save, 
  Download, 
  Camera, 
  Sliders,
  Tv,
  Sparkles,
  CircleDot,
  Gauge,
  Video,
  Cpu,
  Zap,
  Check
} from 'lucide-react';
import { detectSystemFromExtension } from '../utils/systemDetector';
import { dbGet, dbSet, STORES } from '../services/db';
import { resolveAssetPath } from '../utils/assetPath';

export default function EmulatorModal({ game, gamepadConnected, activeProfileId = 'prof_default', sfx, onClose, onSessionEnd }) {
  const stageRef = useRef(null);
  const iframeRef = useRef(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [isLocalOffline, setIsLocalOffline] = useState(!navigator.onLine);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showSubToolbar, setShowSubToolbar] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [isGameMuted, setIsGameMuted] = useState(false);
  const isGameMutedRef = useRef(false);
  const volumeRef = useRef(1.0);
  const [activeShader, setActiveShader] = useState('none');
  const [volume, setVolumeState] = useState(1.0);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef(null);

  // Advanced In-Game Features: Speed, Recording, VSync, Threads, FPS
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [emulationSpeed, setEmulationSpeed] = useState(1.0);
  const [isVsyncEnabled, setIsVsyncEnabled] = useState(true);
  const [isThreadedEnabled, setIsThreadedEnabled] = useState(true);
  const [showFpsCounter, setShowFpsCounter] = useState(true);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingStartTimeRef = useRef(0);

  // Standalone EBML Segment Duration Patcher for WebM
  const fixWebmDuration = async (blob, durationMs) => {
    try {
      const buffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const dataView = new DataView(buffer);

      // Scan for Segment Info element (0x15, 0x49, 0xA9, 0x66)
      let infoPos = -1;
      for (let i = 0; i < uint8.length - 4; i++) {
        if (uint8[i] === 0x15 && uint8[i + 1] === 0x49 && uint8[i + 2] === 0xA9 && uint8[i + 3] === 0x66) {
          infoPos = i;
          break;
        }
      }

      if (infoPos === -1) return blob;

      // Scan for Duration element (0x44, 0x89) inside Info segment (search up to 256 bytes)
      let durationPos = -1;
      const maxSearch = Math.min(uint8.length - 8, infoPos + 256);
      for (let i = infoPos; i < maxSearch; i++) {
        if (uint8[i] === 0x44 && uint8[i + 1] === 0x89) {
          durationPos = i;
          break;
        }
      }

      if (durationPos !== -1) {
        const lenType = uint8[durationPos + 2];
        if (lenType === 0x84) {
          dataView.setFloat32(durationPos + 3, durationMs, false);
          return new Blob([buffer], { type: blob.type });
        } else if (lenType === 0x88) {
          dataView.setFloat64(durationPos + 3, durationMs, false);
          return new Blob([buffer], { type: blob.type });
        }
      }

      // If Duration element does not exist, insert 0x44, 0x89, 0x88 + Float64 (11 bytes)
      const offset = infoPos + 4;
      const firstByte = uint8[offset];
      let vintLen = 0;
      for (let j = 0; j < 8; j++) {
        if (firstByte & (0x80 >> j)) {
          vintLen = j + 1;
          break;
        }
      }

      if (vintLen > 0) {
        const durationBytes = new Uint8Array(11);
        durationBytes[0] = 0x44;
        durationBytes[1] = 0x89;
        durationBytes[2] = 0x88;
        const dv = new DataView(durationBytes.buffer);
        dv.setFloat64(3, durationMs, false);

        const insertAt = offset + vintLen;
        const newBuffer = new Uint8Array(uint8.length + 11);
        newBuffer.set(uint8.subarray(0, insertAt), 0);
        newBuffer.set(durationBytes, insertAt);
        newBuffer.set(uint8.subarray(insertAt), insertAt + 11);

        if (vintLen === 1 && (firstByte & 0x7F) < 127 - 11) {
          newBuffer[offset] = firstByte + 11;
        }

        return new Blob([newBuffer.buffer], { type: blob.type });
      }

      return blob;
    } catch (err) {
      console.warn('WebM duration fix warning:', err);
      return blob;
    }
  };

  const SPEED_PRESETS = [1.0, 1.5, 2.0, 3.0, 4.0, 5.0];
  const SHADERS = ['none', 'crt', 'smooth', 'vibrant'];
  const SHADER_LABELS = { none: 'Pixel', crt: 'CRT', smooth: 'Smooth', vibrant: 'Vibrant' };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Keep references to prevent re-renders in parent from destroying the running emulator
  const onSessionEndRef = useRef(onSessionEnd);
  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Performance & Diagnostic Health State
  const [perfStats, setPerfStats] = useState({
    fps: 60,
    frameTimeMs: 16.6,
    droppedFrames: 0,
    audioState: 'Active (48.0 kHz)',
    inputLatency: '< 1 ms',
    healthStatus: 'OPTIMAL (VSYNC)',
    healthColor: '#10b981',
    diagnosticTip: 'WebAssembly core & GPU swapchain running with synchronized audio/video presentation.'
  });

  const sessionReportedRef = useRef(false);
  const activeSecondsRef = useRef(0);
  const isTabActiveRef = useRef(!document.hidden);
  const activeTimerRef = useRef(null);

  // Suspend parent Web Audio SFX during active gameplay so WASM emulator owns audio clock
  useEffect(() => {
    sfx?.suspendAudio?.();
    return () => {
      sfx?.resumeAudio?.();
    };
  }, [sfx]);

  // Accurate active playtime timer (pauses when browser tab is inactive / backgrounded)
  useEffect(() => {
    sessionReportedRef.current = false;
    activeSecondsRef.current = 0;
    isTabActiveRef.current = !document.hidden;

    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    activeTimerRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        activeSecondsRef.current += 1;
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activeTimerRef.current) {
        clearInterval(activeTimerRef.current);
      }
    };
  }, [game?.id, game?.romUrl]);

  const reportSessionEnd = useCallback(() => {
    if (sessionReportedRef.current) return;
    sessionReportedRef.current = true;
    const finalSeconds = activeSecondsRef.current;
    const currentGame = gameRef.current;
    if (finalSeconds >= 3 && onSessionEndRef.current && currentGame) {
      console.log(`⏱️ [PLAYTIME TRACKER] Recorded active gameplay: ${finalSeconds}s for "${currentGame.title}"`);
      onSessionEndRef.current(currentGame.id || currentGame.title, finalSeconds);
    }
  }, []);

  // Real-Time Diagnostic Engine reading directly from the active Emulator Canvas loop
  useEffect(() => {
    const interval = setInterval(() => {
      let coreFps = 60;
      let frameTime = 16.6;
      let audioStateStr = 'Active (Sync)';

      try {
        const win = iframeRef.current?.contentWindow;
        if (win) {
          if (typeof win.getEmulationFps === 'function') {
            coreFps = win.getEmulationFps();
          }
          const emu = win.EJS_emulator;
          if (emu?.audioContext) {
            const rate = (emu.audioContext.sampleRate / 1000).toFixed(1);
            audioStateStr = `${emu.audioContext.state === 'running' ? 'Active' : emu.audioContext.state} (${rate} kHz)`;
          }
        }
      } catch (e) {}

      if (coreFps > 0) {
        frameTime = parseFloat((1000 / coreFps).toFixed(1));
      }

      let status = 'OPTIMAL (VSYNC)';
      let color = '#10b981';
      let tip = 'Hardware accelerated presentation. VSync & audio buffer in sync.';

      if (!isTabActiveRef.current) {
        status = 'BACKGROUND PAUSED';
        color = '#f59e0b';
        tip = 'Browser throttled background tab. Focus the game window to resume.';
      } else if (coreFps < 45) {
        status = 'PERFORMANCE THROTTLED';
        color = '#ef4444';
        tip = 'Core execution delayed. Close duplicate background tabs or active audio streams.';
      } else if (coreFps < 58) {
        status = 'STABLE EMULATION';
        color = '#10b981';
        tip = 'Emulation running smoothly.';
      }

      setPerfStats(prev => ({
        fps: Math.min(60, coreFps || 60),
        frameTimeMs: frameTime || 16.6,
        droppedFrames: prev.droppedFrames + (coreFps < 50 ? 1 : 0),
        audioState: audioStateStr,
        inputLatency: gamepadConnected ? '< 2 ms' : '< 1 ms (Keyboard)',
        healthStatus: status,
        healthColor: color,
        diagnosticTip: tip
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [gamepadConnected]);

  const formatCleanFilename = (title, type, ext) => {
    const normalized = (title || 'RetroPlayer')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const cleanTitle = normalized
      .replace(/[^a-zA-Z0-9\s-_]/g, ' ')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
    return `${cleanTitle}_${type}_${timeStamp}.${ext}`;
  };

  // Safe ESC key to exit game without hijacking in-game keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Emulator Lifecycle - STRICTLY STABLE ON MOUNT
  useEffect(() => {
    if (!stageRef.current) return;

    let isCancelled = false;
    let sessionBlobUrl = null;

    const setupEmulator = async () => {
      stageRef.current.innerHTML = '';

      let absoluteRomUrl = '';
      const currentGame = gameRef.current || game;
      try {
        if (currentGame.file) {
          sessionBlobUrl = URL.createObjectURL(currentGame.file);
          absoluteRomUrl = sessionBlobUrl;
        } else if (currentGame.romUrl && (currentGame.romUrl.startsWith('blob:') || currentGame.romUrl.startsWith('data:') || currentGame.romUrl.startsWith('http://') || currentGame.romUrl.startsWith('https://'))) {
          absoluteRomUrl = currentGame.romUrl;
        } else if (currentGame.romUrl) {
          const resolvedPath = resolveAssetPath(currentGame.romUrl);
          absoluteRomUrl = new URL(resolvedPath, window.location.href).href;
        }
        console.log(`🎮 [EMULATOR LAUNCHING] Game: "${currentGame.title}" | System Core: ${currentGame.systemCore} | ROM URL: ${absoluteRomUrl}`);
      } catch (e) {
        console.error(`🚨 [EMULATOR ERROR] Invalid ROM URL construction for game "${currentGame.title}":`, currentGame.romUrl, e);
      }

      // Pre-load existing in-game battery RAM and snapshot states from RetroPlayerDB / localStorage
      let initialSaveBase64 = null;
      let initialStateBase64 = null;
      try {
        const scopedSaveKey = `save_${activeProfileId}_${currentGame.id}`;
        const legacySaveKey = `save_${currentGame.id}`;
        let dbSave = await dbGet(STORES.GAME_SAVES, scopedSaveKey);
        if (!dbSave) dbSave = await dbGet(STORES.GAME_SAVES, legacySaveKey);

        if (dbSave && dbSave.data) {
          initialSaveBase64 = typeof dbSave.data === 'string' ? dbSave.data : (dbSave.data.save || null);
        }
        if (!initialSaveBase64) {
          const lsSave = localStorage.getItem(scopedSaveKey) || localStorage.getItem(legacySaveKey);
          if (lsSave) {
            const parsed = JSON.parse(lsSave);
            if (parsed && parsed.data) {
              initialSaveBase64 = typeof parsed.data === 'string' ? parsed.data : (parsed.data.save || null);
            }
          }
        }

        const scopedStateKey = `state_${activeProfileId}_${currentGame.id}`;
        const legacyStateKey = `state_${currentGame.id}`;
        let dbState = await dbGet(STORES.SAVE_STATES, scopedStateKey);
        if (!dbState) dbState = await dbGet(STORES.SAVE_STATES, legacyStateKey);

        if (dbState && dbState.data) {
          initialStateBase64 = typeof dbState.data === 'string' ? dbState.data : (dbState.data.state || null);
        }
        if (!initialStateBase64) {
          const lsState = localStorage.getItem(scopedStateKey) || localStorage.getItem(legacyStateKey);
          if (lsState) {
            const parsed = JSON.parse(lsState);
            if (parsed && parsed.data) {
              initialStateBase64 = typeof parsed.data === 'string' ? parsed.data : (parsed.data.state || null);
            }
          }
        }
        if (initialSaveBase64) {
          console.log(`💾 [SAVE DATA PRELOADED] Found saved battery RAM for "${currentGame.title}" (Profile: ${activeProfileId})`);
        }
      } catch (err) {
        console.warn('⚠️ [SAVE PRELOAD WARN]:', err);
      }

      if (isCancelled || !stageRef.current) return;

      const cdnDataPath = 'https://cdn.emulatorjs.org/stable/data/';
      const localDataPath = '/emulatorjs/data/';
      const isOffline = !navigator.onLine;
      const initialDataPath = isOffline ? localDataPath : cdnDataPath;
      setIsLocalOffline(isOffline);

      let core = currentGame.systemCore;
      if (!core || core === 'custom' || core === 'nes') {
        const detected = detectSystemFromExtension(currentGame.filename || currentGame.title || '');
        if (detected && detected.core && detected.core !== 'custom') {
          core = detected.core;
        } else {
          core = core || 'nes';
        }
      }
      if (core === 'gbc') core = 'gb';
      if (core === 'ps1' || core === 'playstation') core = 'psx';
      if (core === 'sega' || core === 'genesis' || core === 'megadrive' || core === 'sega_genesis') core = 'segaMD';
      if (core === 'gamegear' || core === 'game_gear') core = 'segaGG';
      if (core === 'arcade') core = 'mame2003_plus';
      if (core === 'atari_2600') core = 'atari2600';

      const iframe = document.createElement('iframe');
      iframeRef.current = iframe;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.background = '#000000';
      iframe.tabIndex = 0;
      iframe.allow = 'autoplay *; gamepad *; fullscreen *; cross-origin-isolated; accelerometer; gyroscope';

      stageRef.current.appendChild(iframe);

      const isMobileTouch = (typeof window !== 'undefined') && (
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        (window.innerWidth <= 1024) ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
          <style>
            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: #000000;
              overflow: hidden;
              position: fixed;
              inset: 0;
              touch-action: none;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
              contain: layout style paint;
            }
            #game {
              width: 100%;
              height: 100%;
              position: absolute;
              inset: 0;
              overflow: hidden;
              background: #000000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            #game canvas {
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: contain !important;
              image-rendering: pixelated !important;
              image-rendering: -moz-crisp-edges !important;
              image-rendering: crisp-edges !important;
              transform: translateZ(0);
              will-change: transform;
            }

            .ejs_virtualGamepad_parent {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              height: 280px !important;
              pointer-events: none !important;
              z-index: 99999 !important;
              display: block !important;
            }

            .ejs_virtualGamepad_left,
            .ejs_virtualGamepad_right,
            .ejs_virtualGamepad_bottom,
            .ejs_virtualGamepad_top,
            .ejs_virtualGamepad_button,
            .ejs_dpad_main {
              pointer-events: auto !important;
            }

            /* Natural thumb ergonomics: elevated 52px-64px above screen bottom */
            .ejs_virtualGamepad_left {
              position: absolute !important;
              bottom: calc(54px + env(safe-area-inset-bottom, 0px)) !important;
              left: 16px !important;
              width: 132px !important;
              height: 132px !important;
              z-index: 100000 !important;
            }

            .ejs_virtualGamepad_right {
              position: absolute !important;
              bottom: calc(54px + env(safe-area-inset-bottom, 0px)) !important;
              right: 16px !important;
              width: 136px !important;
              height: 136px !important;
              z-index: 100000 !important;
            }

            .ejs_virtualGamepad_bottom {
              position: absolute !important;
              bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              margin-left: 0 !important;
              height: 34px !important;
              width: 140px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 12px !important;
              z-index: 100000 !important;
            }

            .ejs_virtualGamepad_button {
              background: rgba(30, 41, 59, 0.85) !important;
              border: 1.5px solid rgba(255, 255, 255, 0.5) !important;
              color: #ffffff !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
              touch-action: none !important;
            }

            .ejs_virtualGamepad_button_down {
              background: rgba(59, 130, 246, 0.9) !important;
              transform: scale(0.92) !important;
            }

            .ejs_dpad_main {
              opacity: 0.95 !important;
              filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.6)) !important;
            }

            #ejs_screen,
            .ejs_screen {
              width: 100% !important;
              height: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              position: absolute !important;
              inset: 0 !important;
            }

            /* Internal EmulatorJS bar and all rogue bottom buttons completely hidden */
            .ejs_menu_bar,
            .ejs_menu_bottom,
            .ejs_bottom_bar,
            .ejs_menu_button,
            .ejs_menu_button_parent,
            #ejs_menu_bar,
            #ejs_menu_bottom,
            [class*="menu_bar"],
            [class*="menu_button"],
            [class*="bottom_bar"],
            .ejs_menu_bar_hidden,
            .ejs_virtualGamepad_parent > div:not(.ejs_virtualGamepad_left):not(.ejs_virtualGamepad_right):not(.ejs_virtualGamepad_bottom):not(.ejs_virtualGamepad_top) {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
              visibility: hidden !important;
              height: 0 !important;
              min-height: 0 !important;
              max-height: 0 !important;
              overflow: hidden !important;
              position: absolute !important;
              top: -9999px !important;
              left: -9999px !important;
            }

            @keyframes retroPulse {
              0% { box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85), 0 0 20px rgba(59, 130, 246, 0.3); }
              100% { box-shadow: 0 24px 64px rgba(0, 0, 0, 0.95), 0 0 36px rgba(59, 130, 246, 0.55); }
            }

            @keyframes retroSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            /* Perfectly center & beautify EmulatorJS built-in progress line */
            #ejs_loading,
            .ejs_loading,
            #ejs_load_progress,
            .ejs_load_progress,
            #ejs_loading_text,
            .ejs_loading_text,
            [id*="loading"],
            [class*="loading_progress"],
            [class*="load_progress"] {
              position: fixed !important;
              top: 42% !important;
              left: 50% !important;
              bottom: auto !important;
              right: auto !important;
              transform: translate(-50%, -50%) !important;
              z-index: 100005 !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              text-align: center !important;
              gap: 12px !important;
              background: rgba(15, 23, 42, 0.92) !important;
              border: 1.5px solid rgba(59, 130, 246, 0.65) !important;
              backdrop-filter: blur(24px) !important;
              -webkit-backdrop-filter: blur(24px) !important;
              border-radius: 24px !important;
              padding: 24px 36px !important;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(59, 130, 246, 0.35) !important;
              color: #ffffff !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              font-size: 0.95rem !important;
              font-weight: 700 !important;
              letter-spacing: 0.3px !important;
              max-width: 85% !important;
              min-width: 260px !important;
              animation: retroPulse 2s ease-in-out infinite alternate !important;
              pointer-events: none !important;
            }

            #ejs_loading progress,
            .ejs_loading progress,
            [class*="loading_progress"] progress,
            [class*="load_progress"] progress {
              width: 100% !important;
              height: 8px !important;
              border-radius: 4px !important;
              border: none !important;
              background: rgba(255, 255, 255, 0.15) !important;
              overflow: hidden !important;
              margin-top: 6px !important;
            }

            #ejs_loading progress::-webkit-progress-bar,
            .ejs_loading progress::-webkit-progress-bar {
              background: rgba(255, 255, 255, 0.15) !important;
              border-radius: 4px !important;
            }

            #ejs_loading progress::-webkit-progress-value,
            .ejs_loading progress::-webkit-progress-value {
              background: linear-gradient(90deg, #3b82f6, #60a5fa, #38bdf8) !important;
              border-radius: 4px !important;
            }

            .ejs_virtualGamepad_open {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          </style>
        </head>
        <body>
          <div id="game" tabindex="0"></div>
          <script>
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              console.error('🚨 [EMULATORJS ENGINE RUNTIME ERROR]:', msg, 'Script:', url, 'Line:', lineNo, error);
              return false;
            };

            // High-Precision Core Loop FPS Counter
            let _coreFps = 60;
            let _fCount = 0;
            let _fTime = performance.now();
            function _measureLoop(now) {
              _fCount++;
              if (now - _fTime >= 500) {
                _coreFps = Math.round((_fCount * 1000) / (now - _fTime));
                _fCount = 0;
                _fTime = now;
              }
              requestAnimationFrame(_measureLoop);
            }
            requestAnimationFrame(_measureLoop);
            window.getEmulationFps = function() {
              return _coreFps;
            };
            // Dynamically enhance EmulatorJS native loading indicator with animated spinner
            const _loaderWatcher = setInterval(function() {
              const loadingEl = document.querySelector('#ejs_loading, .ejs_loading, #ejs_load_progress, .ejs_load_progress, [id*="loading"]');
              if (loadingEl) {
                if (!loadingEl.querySelector('.retro-loader-spinner')) {
                  const sp = document.createElement('div');
                  sp.className = 'retro-loader-spinner';
                  sp.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(59, 130, 246, 0.25); border-top-color: #38bdf8; animation: retroSpin 0.8s linear infinite; margin-bottom: 8px; display: inline-block;';
                  loadingEl.insertBefore(sp, loadingEl.firstChild);
                }
              }
            }, 80);

            // Clear any lingering mute flags in storage to guarantee fresh unmuted startup
            try {
              localStorage.removeItem('ejs_muted');
              localStorage.removeItem('muted');
              localStorage.setItem('ejs_volume', '1');
            } catch(e) {}

            window.EJS_player = '#game';
            window.EJS_volume = 1.0;
            window.EJS_gameUrl = ${JSON.stringify(absoluteRomUrl)};
            window.EJS_gameID = ${JSON.stringify(currentGame.id || 'custom_game')};
            window.EJS_gameId = ${JSON.stringify(currentGame.id || 'custom_game')};
            window.EJS_gameName = ${JSON.stringify(currentGame.title || 'Custom Game')};
            window.EJS_core = ${JSON.stringify(core)};
            window.EJS_pathtodata = ${JSON.stringify(initialDataPath)};
            window.EJS_startOnLoaded = true;
            window.EJS_backgroundColor = '#000000';
            window.EJS_language = 'en-US';
            window.EJS_VirtualGamepad = ${isMobileTouch ? 'true' : 'false'};
            window.__INITIAL_SAVE_BASE64__ = ${JSON.stringify(initialSaveBase64)};
            window.__INITIAL_STATE_BASE64__ = ${JSON.stringify(initialStateBase64)};
            window.EJS_Buttons = {
              playPause: true,
              restart: true,
              mute: true,
              settings: true,
              fullscreen: true,
              saveState: false,
              loadState: false,
              saveSavFiles: false,
              loadSavFiles: false,
              screenRecord: true,
              gamepad: true,
              cheat: true,
              volumeSlider: true,
              quickSave: true,
              quickLoad: true,
              screenshot: true,
              cacheManager: false
            };

            const isTabletOrAbove = (window.innerWidth >= 768) || (window.parent && window.parent.innerWidth >= 768);
            window.EJS_defaultOptions = {
              video_vsync: 'true',
              video_threaded: 'true',
              video_max_swapchain_images: '2',
              video_frame_delay: '0',
              audio_sync: 'true',
              audio_max_timing_skew: '0.05',
              audio_rate_control: 'true',
              ...((${JSON.stringify(core)} === 'nds' && isTabletOrAbove) ? {
                desmume_screens_layout: 'left/right',
                desmume_screen_layout: 'left/right',
                desmume_screens_gap: '0',
                melonds_screen_layout: 'Left/Right',
                melonds_screen_layout_orientation: 'horizontal'
              } : {})
            };

            function patchEmulatorGamepad() {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return;

                if (emu.gameManager && !emu.gameManager._safeSimulatePatched) {
                  emu.gameManager._safeSimulatePatched = true;
                  const origSimulate = emu.gameManager.simulateInput;
                  if (typeof origSimulate === 'function') {
                    emu.gameManager.simulateInput = function(player, btn, val) {
                      try {
                        return origSimulate.call(this, player, btn, val);
                      } catch (err) {
                        console.warn('⚠️ [CAUGHT EMULATOR INPUT EXCEPTION]:', err);
                      }
                    };
                  }
                }

                if (!emu._gamepadPatched) {
                  emu._gamepadPatched = true;
                  console.log('🎮 [PATCHING EMULATORJS GAMEPAD ENGINE] Direct mapped controller dispatch');

                  emu.gamepadEvent = function(e) {
                    if (!this.started || !this.gameManager) return;

                    const activeGps = (this.gamepad && this.gamepad.gamepads) ? this.gamepad.gamepads : [];
                    const gp = activeGps.find(f => f && f.index === e.gamepadIndex) || activeGps[0];
                    if (!gp) return;

                    const gpKey = gp.id + "_" + gp.index;
                    let gamepadIndex = this.gamepadSelection ? this.gamepadSelection.indexOf(gpKey) : -1;

                    if (gamepadIndex < 0) {
                      if (!Array.isArray(this.gamepadSelection)) {
                        this.gamepadSelection = ['', '', '', ''];
                      }
                      this.gamepadSelection[0] = gpKey;
                      gamepadIndex = 0;
                    }

                    const value = (function(val) {
                      if (val > 0.5 || val < -0.5) {
                        return (val > 0) ? 1 : -1;
                      }
                      return 0;
                    })(e.value || 0);

                    try {
                      const rawGps = navigator.getGamepads ? navigator.getGamepads() : [];
                      const curGp = rawGps.find(g => g && g.index === e.gamepadIndex) || rawGps[0];
                      if (curGp && curGp.buttons) {
                        const btn = curGp.buttons;
                        const isSelect = btn[8]?.pressed;
                        const isStart = btn[9]?.pressed;
                        const isGuide = btn[16]?.pressed;
                        const isL3R3 = btn[10]?.pressed && btn[11]?.pressed;

                        if ((isSelect && isStart) || isGuide || isL3R3) {
                          console.log('🎮 [CONTROLLER EXIT COMBO TRIGGERED IN IFRAME]');
                          window.parent.postMessage({ type: 'RETRO_PLAYER_EXIT_GAME' }, '*');
                          return;
                        }
                      }
                    } catch (eExit) {}

                    if (this.controlPopup && 
                        this.controlPopup.parentElement && 
                        this.controlPopup.parentElement.parentElement && 
                        this.controlPopup.parentElement.parentElement.getAttribute("hidden") === null) {
                      if ("buttonup" === e.type || (e.type === "axischanged" && value === 0)) return;
                      const num = this.controlPopup.getAttribute("button-num");
                      const player = parseInt(this.controlPopup.getAttribute("player-num")) || 0;
                      if (gamepadIndex !== player && gamepadIndex !== -1) return;
                      if (!this.controls) this.controls = [[], [], [], []];
                      if (!this.controls[player]) this.controls[player] = [];
                      this.controls[player][num] = { value2: e.label };
                      this.controlPopup.parentElement.parentElement.setAttribute("hidden", "");
                      if (typeof this.checkGamepadInputs === 'function') this.checkGamepadInputs();
                      if (typeof this.saveSettings === 'function') this.saveSettings();
                      return;
                    }

                    if ((this.settingsMenu && this.settingsMenu.style.display !== "none") || (typeof this.isPopupOpen === 'function' && this.isPopupOpen())) return;

                    const special = [16, 17, 18, 19, 20, 21, 22, 23];
                    for (let i = 0; i < 4; i++) {
                      if (gamepadIndex !== i) continue;

                      if (e.type === "axischanged" && this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                        if (e.axis === 'LEFT_STICK_X') {
                          if (e.value > 0.35) {
                            this.gameManager.simulateInput(i, 7, 1);
                            this.gameManager.simulateInput(i, 6, 0);
                          } else if (e.value < -0.35) {
                            this.gameManager.simulateInput(i, 6, 1);
                            this.gameManager.simulateInput(i, 7, 0);
                          } else {
                            this.gameManager.simulateInput(i, 6, 0);
                            this.gameManager.simulateInput(i, 7, 0);
                          }
                        } else if (e.axis === 'LEFT_STICK_Y') {
                          if (e.value > 0.35) {
                            this.gameManager.simulateInput(i, 5, 1);
                            this.gameManager.simulateInput(i, 4, 0);
                          } else if (e.value < -0.35) {
                            this.gameManager.simulateInput(i, 4, 1);
                            this.gameManager.simulateInput(i, 5, 0);
                          } else {
                            this.gameManager.simulateInput(i, 4, 0);
                            this.gameManager.simulateInput(i, 5, 0);
                          }
                        }
                      }

                      for (let j = 0; j < 30; j++) {
                        if (!this.controls || !this.controls[i] || !this.controls[i][j] || this.controls[i][j].value2 === undefined) {
                          continue;
                        }
                        const controlValue = this.controls[i][j].value2;

                        if (["buttonup", "buttondown"].includes(e.type) && (controlValue === e.label || controlValue === e.index)) {
                          if (this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                            this.gameManager.simulateInput(i, j, (e.type === "buttonup" ? 0 : (special.includes(j) ? 0x7fff : 1)));
                          }
                        } else if (e.type === "axischanged") {
                          if (typeof controlValue === "string" && controlValue.split(":")[0] === e.axis && this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                            if (special.includes(j)) {
                              if (j === 16 || j === 17) {
                                if (e.value > 0) {
                                  this.gameManager.simulateInput(i, 16, 0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 17, 0);
                                } else {
                                  this.gameManager.simulateInput(i, 17, -0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 16, 0);
                                }
                              } else if (j === 18 || j === 19) {
                                if (e.value > 0) {
                                  this.gameManager.simulateInput(i, 18, 0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 19, 0);
                                } else {
                                  this.gameManager.simulateInput(i, 19, -0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 18, 0);
                                }
                              }
                            } else if (value === 0 || controlValue === e.label || controlValue === (e.axis + ':' + value)) {
                              this.gameManager.simulateInput(i, j, ((value === 0) ? 0 : 1));
                            }
                          }
                        }
                      }
                    }
                  };

                  if (emu.gamepad) {
                    emu.gamepad.on("axischanged", emu.gamepadEvent.bind(emu));
                    emu.gamepad.on("buttondown", emu.gamepadEvent.bind(emu));
                    emu.gamepad.on("buttonup", emu.gamepadEvent.bind(emu));
                  }
                }
              } catch (err) {
                console.warn('Patch error:', err);
              }
            }

            function autoBindGamepadsToPlayers() {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return;

                patchEmulatorGamepad();

                if (!emu.gamepad && typeof window.GamepadHandler === 'function') {
                  emu.gamepad = new window.GamepadHandler();
                  emu.gamepad.on("axischanged", emu.gamepadEvent.bind(emu));
                  emu.gamepad.on("buttondown", emu.gamepadEvent.bind(emu));
                  emu.gamepad.on("buttonup", emu.gamepadEvent.bind(emu));
                }

                if (emu.gamepad) {
                  if (typeof emu.gamepad.updateGamepadState === 'function') {
                    emu.gamepad.updateGamepadState();
                  }

                  const activeGps = (emu.gamepad.gamepads || []).filter(g => g && g.id);
                  if (!Array.isArray(emu.gamepadSelection) || emu.gamepadSelection.length === 0) {
                    emu.gamepadSelection = ['', '', '', ''];
                  }

                  let assignedAny = false;
                  for (let i = 0; i < activeGps.length; i++) {
                    const gp = activeGps[i];
                    if (!gp || !gp.id) continue;
                    const gpKey = gp.id + '_' + (gp.index !== undefined ? gp.index : i);
                    if (!emu.gamepadSelection.includes(gpKey)) {
                      const targetSlot = (i < 4 && (!emu.gamepadSelection[i] || emu.gamepadSelection[i] === 'notconnected'))
                        ? i
                        : emu.gamepadSelection.findIndex(s => !s || s === 'notconnected');
                      if (targetSlot !== -1) {
                        emu.gamepadSelection[targetSlot] = gpKey;
                        assignedAny = true;
                      }
                    }
                  }

                  if (assignedAny && typeof emu.updateGamepadLabels === 'function' && Array.isArray(emu.gamepadLabels) && emu.gamepadLabels.length > 0) {
                    emu.updateGamepadLabels();
                  }
                }
              } catch (err) {
                console.warn('Gamepad auto-binding error:', err);
              }
            }

            window.autoBindGamepadsToPlayers = autoBindGamepadsToPlayers;

            const _connectedGps = new Set();
            function forwardGamepadConnected(gp) {
              if (!gp) return;
              const key = (gp.id || 'gp') + '_' + (gp.index !== undefined ? gp.index : 0);
              if (_connectedGps.has(key)) return;
              _connectedGps.add(key);
              try {
                const evt = new GamepadEvent('gamepadconnected', { gamepad: gp });
                window.dispatchEvent(evt);
              } catch (e) {
                try {
                  const custEvt = new CustomEvent('gamepadconnected');
                  custEvt.gamepad = gp;
                  window.dispatchEvent(custEvt);
                } catch (err) {}
              }
            }

            function syncAllGamepads() {
              try {
                const gps = navigator.getGamepads ? navigator.getGamepads() : [];
                for (let i = 0; i < gps.length; i++) {
                  if (gps[i] && gps[i].connected) {
                    forwardGamepadConnected(gps[i]);
                  }
                }
              } catch (e) {}
            }

            function syncVirtualGamepadVisibility() {
              try {
                const gps = navigator.getGamepads ? navigator.getGamepads() : [];
                let hasPhysical = false;
                for (let i = 0; i < gps.length; i++) {
                  if (gps[i] && gps[i].connected) {
                    hasPhysical = true;
                    break;
                  }
                }
                const vgp = document.querySelector('.ejs_virtualGamepad_parent');
                if (vgp) {
                  if (hasPhysical) {
                    vgp.style.setProperty('display', 'none', 'important');
                    vgp.style.setProperty('opacity', '0', 'important');
                    vgp.style.setProperty('pointer-events', 'none', 'important');
                  } else if (${isMobileTouch ? 'true' : 'false'}) {
                    vgp.style.setProperty('display', 'block', 'important');
                    vgp.style.setProperty('opacity', '1', 'important');
                    vgp.style.removeProperty('pointer-events');
                  }
                }
              } catch (e) {}
            }

            window.addEventListener('gamepadconnected', function(e) {
              autoBindGamepadsToPlayers();
              syncVirtualGamepadVisibility();
            });

            window.addEventListener('gamepaddisconnected', function(e) {
              syncVirtualGamepadVisibility();
            });

            window.addEventListener('focus', function() {
              syncAllGamepads();
              syncVirtualGamepadVisibility();
            }, { once: false });

            // Periodic sync check to ensure seamless controller plug/unplug handling
            setInterval(syncVirtualGamepadVisibility, 500);
            window.addEventListener('click', syncAllGamepads, { once: true });
            window.addEventListener('keydown', syncAllGamepads, { once: true });

            function injectSaveData(base64Data) {
              if (!base64Data) return false;
              try {
                const emu = window.EJS_emulator;
                if (!emu || !emu.gameManager || !emu.gameManager.FS) return false;
                const savePath = typeof emu.gameManager.getSaveFilePath === 'function' ? emu.gameManager.getSaveFilePath() : null;
                if (!savePath) return false;

                let uint8 = null;
                if (typeof base64Data === 'string') {
                  const binary = atob(base64Data);
                  uint8 = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++) {
                    uint8[i] = binary.charCodeAt(i);
                  }
                } else if (Array.isArray(base64Data)) {
                  uint8 = new Uint8Array(base64Data);
                } else if (typeof base64Data === 'object') {
                  if (base64Data.save) {
                    return injectSaveData(base64Data.save);
                  }
                  const vals = Object.values(base64Data);
                  if (vals.length > 0) uint8 = new Uint8Array(vals);
                }

                if (!uint8 || uint8.byteLength === 0) return false;

                // Ensure parent directory exists in Emscripten FS
                const parts = savePath.split('/');
                let current = '';
                for (let i = 0; i < parts.length - 1; i++) {
                  if (parts[i] !== '') {
                    current += '/' + parts[i];
                    if (!emu.gameManager.FS.analyzePath(current).exists) {
                      emu.gameManager.FS.mkdir(current);
                    }
                  }
                }

                // Write SRAM file into Emscripten Virtual FileSystem
                if (emu.gameManager.FS.analyzePath(savePath).exists) {
                  emu.gameManager.FS.unlink(savePath);
                }
                emu.gameManager.FS.writeFile(savePath, uint8);
                if (typeof emu.gameManager.loadSaveFiles === 'function') {
                  emu.gameManager.loadSaveFiles();
                }
                console.log('💾 [BATTERY SAVE RESTORED] Successfully injected', uint8.byteLength, 'bytes into Emscripten FS at', savePath);
                return true;
              } catch (err) {
                console.warn('⚠️ [SAVE INJECTION EXCEPTION]:', err);
                return false;
              }
            }

            function extractCurrentSaveBase64() {
              try {
                const emu = window.EJS_emulator;
                if (!emu || !emu.gameManager) return null;
                let uint8 = null;
                if (typeof emu.gameManager.getSaveFile === 'function') {
                  uint8 = emu.gameManager.getSaveFile(false);
                }
                if (!uint8 && emu.gameManager.FS && typeof emu.gameManager.getSaveFilePath === 'function') {
                  const p = emu.gameManager.getSaveFilePath();
                  if (p && emu.gameManager.FS.analyzePath(p).exists) {
                    uint8 = emu.gameManager.FS.readFile(p);
                  }
                }
                if (!uint8 || uint8.byteLength === 0) return null;
                let binary = '';
                const len = uint8.byteLength;
                for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode(uint8[i]);
                }
                return btoa(binary);
              } catch (e) {
                return null;
              }
            }

            // Automatic Audio Node Mirror for Lossless Recording
            window.__audioNodes = new Set();
            try {
              const OrigAudioNodeConnect = AudioNode.prototype.connect;
              AudioNode.prototype.connect = function(dest, outIdx, inIdx) {
                try {
                  if (dest && this.context && dest === this.context.destination) {
                    window.__audioNodes.add(this);
                    if (window.__activeMediaStreamDest) {
                      OrigAudioNodeConnect.call(this, window.__activeMediaStreamDest);
                    }
                  }
                } catch(e) {}
                return OrigAudioNodeConnect.apply(this, arguments);
              };
            } catch(e) {}

            window.attachRecordingDestination = function(destNode) {
              window.__activeMediaStreamDest = destNode;
              try {
                if (window.__audioNodes) {
                  window.__audioNodes.forEach(node => {
                    try { node.connect(destNode); } catch(e) {}
                  });
                }
                const emu = window.EJS_emulator;
                const alCtx = emu?.Module?.AL?.currentCtx;
                if (alCtx?.gain) {
                  try { alCtx.gain.connect(destNode); } catch(e) {}
                }
                if (emu?.gainNode) {
                  try { emu.gainNode.connect(destNode); } catch(e) {}
                }
                if (emu?.audioNode) {
                  try { emu.audioNode.connect(destNode); } catch(e) {}
                }
                if (emu?.Module?.SDL2?.audio?.gainNode) {
                  try { emu.Module.SDL2.audio.gainNode.connect(destNode); } catch(e) {}
                }
              } catch(e) {}
            };

            window._isMutedState = false;

            window.setEmulatorMute = function(isMuted, vol) {
              try {
                window._isMutedState = isMuted;
                const emu = window.EJS_emulator;
                if (!emu) return;
                const targetVol = isMuted ? 0 : (typeof vol === 'number' ? vol : 1.0);
                emu.muted = isMuted;
                if (typeof emu.setVolume === 'function') {
                  emu.setVolume(targetVol);
                }
                if (emu.gainNode && emu.gainNode.gain) {
                  emu.gainNode.gain.value = targetVol;
                }
                const audioCtx = emu?.Module?.AL?.currentCtx?.audioCtx || emu?.Module?.AL?.currentCtx || emu?.audioContext || window.AudioContext;
                if (audioCtx) {
                  if (isMuted && audioCtx.state === 'running') {
                    audioCtx.suspend?.().catch(() => {});
                  } else if (!isMuted && audioCtx.state === 'suspended') {
                    audioCtx.resume?.().catch(() => {});
                  }
                }
              } catch(e) {}
            };

            function _unlockAndEnforceAudio() {
              try {
                if (window._isMutedState) return;
                const emu = window.EJS_emulator;
                if (emu) {
                  emu.muted = false;
                  if (typeof emu.setVolume === 'function') {
                    emu.setVolume(1.0);
                  }
                  if (emu.gainNode && emu.gainNode.gain) {
                    emu.gainNode.gain.value = 1.0;
                  }
                }
                const audioCtx = emu?.Module?.AL?.currentCtx?.audioCtx || emu?.Module?.AL?.currentCtx || emu?.audioContext || window.AudioContext;
                if (audioCtx && typeof audioCtx.resume === 'function' && audioCtx.state === 'suspended') {
                  audioCtx.resume().catch(() => {});
                }
              } catch(e) {}
            }

            window.setEmulationSpeed = function(spd) {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return false;
                emu.speed = spd;
                if (emu.gameManager) {
                  emu.gameManager.speed = spd;
                }
                if (typeof emu.setSpeed === 'function') {
                  emu.setSpeed(spd);
                }
                if (typeof emu.gameManager?.setSpeed === 'function') {
                  emu.gameManager.setSpeed(spd);
                }
                if (typeof emu.gameManager?.functions?.setSpeed === 'function') {
                  emu.gameManager.functions.setSpeed(spd);
                }
                if (typeof emu.gameManager?.functions?.fastForward === 'function') {
                  emu.gameManager.functions.fastForward(spd);
                }
                if (typeof emu.gameManager?.functions?.toggleFastForward === 'function') {
                  emu.gameManager.functions.toggleFastForward(spd > 1 ? 1 : 0);
                }
                if (typeof emu.gameManager?.setOption === 'function') {
                  emu.gameManager.setOption('fastforward_ratio', spd.toString());
                }
                if (emu.Module && typeof emu.Module._cmd_fastforward === 'function') {
                  emu.Module._cmd_fastforward(spd > 1 ? 1 : 0);
                }
                return true;
              } catch(e) {
                console.warn('Set speed error:', e);
                return false;
              }
            };

            ['click', 'keydown', 'touchstart', 'mousedown', 'pointerdown'].forEach(ev => {
              window.addEventListener(ev, _unlockAndEnforceAudio, { passive: true });
              document.addEventListener(ev, _unlockAndEnforceAudio, { passive: true });
            });

            window.EJS_ready = function() {
              console.log('🎮 [EMULATORJS READY] Emulation Ready');
              try {
                window.focus();
                const el = document.querySelector('canvas') || document.querySelector('#game canvas') || document.querySelector('#game');
                if (el) el.focus();
                syncAllGamepads();
                autoBindGamepadsToPlayers();
                _unlockAndEnforceAudio();
                if (window.__INITIAL_SAVE_BASE64__) {
                  injectSaveData(window.__INITIAL_SAVE_BASE64__);
                }
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'RETRO_PLAYER_CORE_RUNNING' }, '*');
                }
              } catch(e) {}
            };

            window.EJS_onGameStart = function() {
              console.log('🎮 [GAME STARTED] Emulation canvas active');
              try {
                window.focus();
                const el = document.querySelector('canvas') || document.querySelector('#game canvas') || document.querySelector('#game');
                if (el) el.focus();
                syncAllGamepads();
                autoBindGamepadsToPlayers();
                _unlockAndEnforceAudio();
                if (window.__INITIAL_SAVE_BASE64__) {
                  injectSaveData(window.__INITIAL_SAVE_BASE64__);
                }
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'RETRO_PLAYER_CORE_RUNNING' }, '*');
                }
              } catch(e) {}
            };

            // Loop checker to signal parent as soon as first canvas frame is active
            let _canvasSignaled = false;
            function _pollCanvasReady() {
              if (_canvasSignaled) return;
              const cv = document.querySelector('canvas');
              if (cv && cv.width > 0 && cv.height > 0) {
                _canvasSignaled = true;
                try {
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'RETRO_PLAYER_CORE_RUNNING' }, '*');
                  }
                } catch(e) {}
                return;
              }
              requestAnimationFrame(_pollCanvasReady);
            }
            requestAnimationFrame(_pollCanvasReady);

            // Direct DB / Parent window save sync bridge
            window.EJS_onLoadSave = function() {
              console.log('💾 [BATTERY SAVE LOADED] In-game SRAM successfully restored from DB for:', ${JSON.stringify(currentGame.id)});
            };

            window.EJS_onSaveSave = function(e) {
              console.log('💾 [BATTERY SAVE FLUSH EVENT] Committing SRAM to RetroPlayerDB for:', ${JSON.stringify(currentGame.id)}, e);
              try {
                let uint8 = e && e.save ? e.save : null;
                if (!uint8) {
                  const b64 = extractCurrentSaveBase64();
                  if (b64 && window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: 'RETRO_PLAYER_SAVE_SYNC',
                      gameId: ${JSON.stringify(currentGame.id)},
                      saveData: b64
                    }, '*');
                  }
                  return;
                }
                if (uint8 && uint8.byteLength > 0) {
                  let binary = '';
                  for (let i = 0; i < uint8.byteLength; i++) {
                    binary += String.fromCharCode(uint8[i]);
                  }
                  const b64 = btoa(binary);
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: 'RETRO_PLAYER_SAVE_SYNC',
                      gameId: ${JSON.stringify(currentGame.id)},
                      saveData: b64
                    }, '*');
                  }
                }
              } catch(err) {}
            };

            window.EJS_onSaveState = function(e) {
              console.log('💾 [SAVE STATE FLUSH EVENT] Committing snapshot state to RetroPlayerDB for:', ${JSON.stringify(currentGame.id)}, e);
              try {
                let uint8 = e && e.state ? e.state : null;
                if (uint8 && uint8.byteLength > 0) {
                  let binary = '';
                  for (let i = 0; i < uint8.byteLength; i++) {
                    binary += String.fromCharCode(uint8[i]);
                  }
                  const b64 = btoa(binary);
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: 'RETRO_PLAYER_STATE_SYNC',
                      gameId: ${JSON.stringify(currentGame.id)},
                      stateData: b64
                    }, '*');
                  }
                }
              } catch(err) {}
            };

            window.EJS_onLoadState = function() {
              console.log('💾 [SAVE SYSTEM READY] Persistent save states bound to IndexedDB key:', ${JSON.stringify(currentGame.id)});
            };

            window.flushSaveToDB = function() {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return false;
                
                // 1. Flush in-game Battery RAM (SRAM) to Emscripten FS
                if (emu.gameManager && typeof emu.gameManager.saveSaveFiles === 'function') {
                  emu.gameManager.saveSaveFiles();
                } else if (typeof emu.saveSave === 'function') {
                  emu.saveSave();
                }

                // 2. Extract and send base64 to parent window
                const b64 = extractCurrentSaveBase64();
                if (b64 && window.parent && window.parent !== window) {
                  window.parent.postMessage({
                    type: 'RETRO_PLAYER_SAVE_SYNC',
                    gameId: ${JSON.stringify(currentGame.id)},
                    saveData: b64
                  }, '*');
                }
                return true;
              } catch (e) {
                console.warn('⚠️ [SAVE FLUSH WARN]:', e);
                return false;
              }
            };

            // Auto-flush in-game battery saves every 10 seconds to ensure continuous persistence
            setInterval(function() {
              if (window.flushSaveToDB) {
                window.flushSaveToDB();
              }
            }, 10000);

            function handleLoaderFallback() {
              console.warn('⚠️ [EMULATOR LOADER FALLBACK] Primary path failed. Attempting local /emulatorjs/data/loader.js fallback...');
              window.EJS_pathtodata = '/emulatorjs/data/';
              const fallbackScript = document.createElement('script');
              fallbackScript.src = '/emulatorjs/data/loader.js';
              fallbackScript.onerror = function() {
                console.error('🚨 [EMULATOR FATAL ERROR] Both online and local EmulatorJS loader failed to load.');
              };
              document.body.appendChild(fallbackScript);
            }
          </script>
          <script src="${initialDataPath}loader.js" onerror="handleLoaderFallback()"></script>
        </body>
      </html>
    `;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      setTimeout(() => {
        try {
          if (iframeRef.current) {
            iframeRef.current.focus();
            iframeRef.current.contentWindow?.focus();
          }
        } catch (e) {}
      }, 150);

      // Safety fallback: ensure loading overlay auto-dismisses once core is initialized
      const safetyTimer = setTimeout(() => {
        if (!isCancelled) {
          setIsLoadingGame(false);
        }
      }, 3500);

      return () => {
        clearTimeout(safetyTimer);
      };
    } catch (err) {
      console.error(`🚨 [EMULATOR IFRAME WRITE ERROR] Failed writing iframe doc for "${currentGame.title}":`, err);
    }
  };

  setupEmulator();

  return () => {
    isCancelled = true;
    console.log(`🧹 [EMULATOR UNMOUNTING] Destroying emulator instance for "${gameRef.current?.title || game?.title}"`);
    reportSessionEnd();
    if (sessionBlobUrl) {
      try {
        URL.revokeObjectURL(sessionBlobUrl);
        console.log(`🧹 [BLOB CLEANUP] Revoked session Object URL for custom ROM "${gameRef.current?.title || game?.title}"`);
      } catch (e) {}
    }
    if (iframeRef.current) {
      try {
        const win = iframeRef.current.contentWindow;
        if (win) {
          if (typeof win.flushSaveToDB === 'function') {
            win.flushSaveToDB();
          }
          if (win.EJS_emulator && typeof win.EJS_emulator.destroy === 'function') {
            win.EJS_emulator.destroy();
          }
          win.location.href = 'about:blank';
        }
      } catch (e) {}
      iframeRef.current.remove();
      iframeRef.current = null;
    }
    if (stageRef.current) {
      stageRef.current.innerHTML = '';
    }
  };
}, [game?.id, game?.romUrl]);

  // Sync gamepad when physical hardware connection state changes (Event-driven, no interval poll)
  useEffect(() => {
    if (!iframeRef.current) return;
    const win = iframeRef.current?.contentWindow;
    if (win && typeof win.autoBindGamepadsToPlayers === 'function') {
      win.autoBindGamepadsToPlayers();
    }
  }, [gamepadConnected]);

  // Proactive Audio Unlock & Synchronization (strictly guarded against muted state)
  const ensureAudioUnlocked = useCallback(() => {
    if (isGameMutedRef.current) return;
    try {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      if (typeof win.setEmulatorMute === 'function') {
        win.setEmulatorMute(false, volumeRef.current || 1.0);
      } else {
        const emu = win.EJS_emulator;
        if (emu) {
          emu.muted = false;
          if (typeof emu.setVolume === 'function') {
            emu.setVolume(volumeRef.current || 1.0);
          }
          if (emu.gainNode && emu.gainNode.gain) {
            emu.gainNode.gain.value = volumeRef.current || 1.0;
          }
          const audioCtx = emu?.Module?.AL?.currentCtx?.audioCtx || emu?.Module?.AL?.currentCtx || emu?.audioContext || win?.AudioContext;
          if (audioCtx && typeof audioCtx.resume === 'function' && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
        }
      }
    } catch(e) {}
  }, []);

  // Global user interaction listener to wake up any suspended audio context
  useEffect(() => {
    const handleUserTouch = (e) => {
      // Ignore clicks on mute/action buttons
      if (e && e.target && e.target.closest && e.target.closest('button')) {
        return;
      }
      if (!isGameMutedRef.current) {
        ensureAudioUnlocked();
      }
    };
    window.addEventListener('click', handleUserTouch);
    window.addEventListener('keydown', handleUserTouch);
    window.addEventListener('touchstart', handleUserTouch);
    return () => {
      window.removeEventListener('click', handleUserTouch);
      window.removeEventListener('keydown', handleUserTouch);
      window.removeEventListener('touchstart', handleUserTouch);
    };
  }, [ensureAudioUnlocked]);

  // Listen for Controller Exit triggers & Save Sync posted from within the active emulator iframe
  useEffect(() => {
    const handleFrameMessage = async (e) => {
      if (e.data.type === 'RETRO_PLAYER_CORE_RUNNING' || e.data.type === 'RETRO_PLAYER_CORE_STARTED' || e.data.type === 'RETRO_PLAYER_FIRST_FRAME') {
        setIsLoadingGame(false);
        if (!isGameMutedRef.current) {
          ensureAudioUnlocked();
        }
      }

      if (e.data.type === 'RETRO_PLAYER_EXIT_GAME') {
        console.log('🎮 [EMULATOR MODAL] Exit command received from gamepad combo. Closing game.');
        handleClose();
      }

      // Persist in-game battery RAM directly into RetroPlayerDB
      if (e.data.type === 'RETRO_PLAYER_SAVE_SYNC' && e.data.gameId) {
        try {
          const saveKey = `save_${activeProfileId}_${e.data.gameId}`;
          const payload = {
            gameId: e.data.gameId,
            profileId: activeProfileId,
            timestamp: Date.now(),
            data: e.data.saveData || null
          };
          await dbSet(STORES.GAME_SAVES, saveKey, payload);
          try {
            localStorage.setItem(saveKey, JSON.stringify(payload));
          } catch(err) {}
          console.log(`💾 [RetroPlayerDB SAVED] Stored battery RAM for "${e.data.gameId}" (Profile: ${activeProfileId})`);
        } catch (err) {
          console.warn('⚠️ [DB SAVE ERROR]:', err);
        }
      }

      // Persist quick save state snapshot directly into RetroPlayerDB
      if (e.data.type === 'RETRO_PLAYER_STATE_SYNC' && e.data.gameId) {
        try {
          const stateKey = `state_${activeProfileId}_${e.data.gameId}`;
          const payload = {
            gameId: e.data.gameId,
            profileId: activeProfileId,
            timestamp: Date.now(),
            data: e.data.stateData || null
          };
          await dbSet(STORES.SAVE_STATES, stateKey, payload);
          try {
            localStorage.setItem(stateKey, JSON.stringify(payload));
          } catch(err) {}
          console.log(`💾 [RetroPlayerDB SAVED] Stored snapshot state for "${e.data.gameId}" (Profile: ${activeProfileId})`);
        } catch (err) {
          console.warn('⚠️ [DB STATE ERROR]:', err);
        }
      }
    };
    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [onClose, activeProfileId, ensureAudioUnlocked]);

  const focusEmulator = (e) => {
    if (e && e.target && e.target.closest && (e.target.closest('button') || e.target.closest('.emulator-topbar'))) {
      return;
    }
    try {
      if (!isGameMutedRef.current) {
        ensureAudioUnlocked();
      }
      if (iframeRef.current) {
        iframeRef.current.focus();
        iframeRef.current.contentWindow?.focus();
      }
    } catch (e) {}
  };

  const handleClose = () => {
    reportSessionEnd();
    setIsGameMuted(false);
    setVolumeState(1.0);
    if (iframeRef.current) {
      try {
        const win = iframeRef.current.contentWindow;
        if (win) {
          if (typeof win.flushSaveToDB === 'function') {
            win.flushSaveToDB();
          } else if (win.EJS_emulator && typeof win.EJS_emulator.saveSave === 'function') {
            win.EJS_emulator.saveSave();
          }
        }
      } catch (e) {
        console.warn('⚠️ [SAVE FLUSH ON CLOSE WARN]:', e);
      }

      // Small 150ms buffer to allow IndexedDB async transaction to finalize
      setTimeout(() => {
        if (iframeRef.current) {
          try {
            const win = iframeRef.current.contentWindow;
            if (win) {
              if (win.EJS_emulator && typeof win.EJS_emulator.destroy === 'function') {
                win.EJS_emulator.destroy();
              }
              win.location.href = 'about:blank';
            }
          } catch (e) {}
          iframeRef.current.remove();
          iframeRef.current = null;
        }
        onClose();
      }, 150);
      return;
    }
    onClose();
  };

  const handleToggleEmulatorMenu = (e) => {
    e.stopPropagation();
    setShowSubToolbar(prev => !prev);
  };

  const handleDownloadSave = async () => {
    try {
      const win = iframeRef.current?.contentWindow;
      const emu = win?.EJS_emulator;
      if (typeof emu?.gameManager?.saveSaveFiles === 'function') {
        emu.gameManager.saveSaveFiles();
      }
      const scopedKey = `save_${activeProfileId}_${game.id || game.title}`;
      const legacyKey = `save_${game.id || game.title}`;
      let dbSave = await dbGet(STORES.GAME_SAVES, scopedKey);
      if (!dbSave) dbSave = await dbGet(STORES.GAME_SAVES, legacyKey);
      let base64Data = dbSave?.data || null;
      if (!base64Data) {
        const lsSave = localStorage.getItem(scopedKey) || localStorage.getItem(legacyKey);
        if (lsSave) {
          const parsed = JSON.parse(lsSave);
          base64Data = parsed?.data || null;
        }
      }
      if (base64Data) {
        const rawBase64 = typeof base64Data === 'string' ? base64Data : (base64Data.save || '');
        const binary = atob(rawBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = formatCleanFilename(game.title, 'Save', 'sav');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Battery save (.sav) downloaded!');
      } else {
        showToast('No battery save RAM file available yet');
      }
    } catch (err) {
      console.warn('Save file export error:', err);
      showToast('Save file export failed');
    }
  };

  // Screen Video Recording Handler (Lossless 60 FPS Canvas & In-Game Audio Capture Engine)
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        } catch(e) {}
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      sfx?.play?.('click');
    } else {
      // Start recording
      try {
        const win = iframeRef.current?.contentWindow;
        const canvas = win?.document?.querySelector('canvas') || win?.document?.querySelector('#game canvas') || win?.document?.querySelector('#ejs_screen canvas');
        if (!canvas) {
          showToast('Canvas not ready for recording');
          return;
        }

        const canvasStream = canvas.captureStream(60);
        const emu = win?.EJS_emulator;
        const audioCtx = emu?.Module?.AL?.currentCtx?.audioCtx || emu?.Module?.AL?.currentCtx || emu?.audioContext || win?.AudioContext;

        let tracks = [...canvasStream.getVideoTracks()];
        if (audioCtx && typeof audioCtx.createMediaStreamDestination === 'function') {
          try {
            const dest = audioCtx.createMediaStreamDestination();
            if (typeof win?.attachRecordingDestination === 'function') {
              win.attachRecordingDestination(dest);
            }
            if (emu?.gainNode) {
              try { emu.gainNode.connect(dest); } catch(e) {}
            }
            if (emu?.audioNode) {
              try { emu.audioNode.connect(dest); } catch(e) {}
            }
            const alCtx = emu?.Module?.AL?.currentCtx;
            if (alCtx?.gain) {
              try { alCtx.gain.connect(dest); } catch(e) {}
            }
            if (dest.stream && dest.stream.getAudioTracks().length > 0) {
              tracks.push(dest.stream.getAudioTracks()[0]);
            }
          } catch(e) {}
        }

        const stream = new MediaStream(tracks);
        let mimeType = 'video/webm;codecs=vp8';
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }

        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
        recordedChunksRef.current = [];
        recordingStartTimeRef.current = performance.now();

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          if (recordedChunksRef.current.length === 0) {
            showToast('No video frames captured');
            return;
          }
          const rawBlob = new Blob(recordedChunksRef.current, { type: mimeType });
          if (rawBlob.size === 0) {
            showToast('Recording was empty');
            return;
          }
          
          const durationMs = Math.max(1000, performance.now() - recordingStartTimeRef.current);
          const finalBlob = await fixWebmDuration(rawBlob, durationMs);

          const url = URL.createObjectURL(finalBlob);
          const a = document.createElement('a');
          const fileName = formatCleanFilename(game?.title, 'Gameplay', 'webm');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 2000);
          showToast('Gameplay Video Saved!');
        };

        recorder.start(500); // Record chunks every 500ms
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingSeconds(0);
        showToast('Screen Recording Started (60 FPS)');
        sfx?.play?.('click');

        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      } catch(err) {
        console.error('Recording start failed:', err);
        showToast('Could not start recording');
      }
    }
  };

  // Speed Multiplier Handler [1.0, 1.5, 2.0, 3.0, 4.0, 5.0]
  const handleSpeedChange = (newSpeed) => {
    const spd = parseFloat(newSpeed);
    setEmulationSpeed(spd);
    try {
      const win = iframeRef.current?.contentWindow;
      let applied = false;
      if (win && typeof win.setEmulationSpeed === 'function') {
        applied = win.setEmulationSpeed(spd);
      }
      if (!applied) {
        const emu = win?.EJS_emulator;
        if (emu) {
          emu.speed = spd;
          if (emu.gameManager) emu.gameManager.speed = spd;
          if (typeof emu.setSpeed === 'function') emu.setSpeed(spd);
          if (typeof emu.gameManager?.setSpeed === 'function') emu.gameManager.setSpeed(spd);
          if (typeof emu.gameManager?.functions?.setSpeed === 'function') emu.gameManager.functions.setSpeed(spd);
          if (typeof emu.gameManager?.functions?.fastForward === 'function') emu.gameManager.functions.fastForward(spd);
          if (typeof emu.gameManager?.functions?.toggleFastForward === 'function') emu.gameManager.functions.toggleFastForward(spd > 1 ? 1 : 0);
          if (typeof emu.gameManager?.setOption === 'function') emu.gameManager.setOption('fastforward_ratio', spd.toString());
        }
      }
      showToast(spd === 1.0 ? 'Speed: Normal (1.0x)' : `Speed: Fast (${spd}x)`);
      sfx?.play?.('click');
    } catch(e) {
      console.warn('Speed set error:', e);
    }
  };

  // Engine Tuning Handlers: VSync, Threads, FPS
  const handleToggleVsync = () => {
    const next = !isVsyncEnabled;
    setIsVsyncEnabled(next);
    try {
      const win = iframeRef.current?.contentWindow;
      const emu = win?.EJS_emulator;
      if (emu?.gameManager?.setOption) {
        emu.gameManager.setOption('video_vsync', next ? 'true' : 'false');
      }
      showToast(next ? 'VSync Enabled (60Hz Lock)' : 'VSync Disabled (Unlocked)');
      sfx?.play?.('click');
    } catch(e) {}
  };

  const handleToggleThreaded = () => {
    const next = !isThreadedEnabled;
    setIsThreadedEnabled(next);
    try {
      const win = iframeRef.current?.contentWindow;
      const emu = win?.EJS_emulator;
      if (emu?.gameManager?.setOption) {
        emu.gameManager.setOption('video_threaded', next ? 'true' : 'false');
      }
      showToast(next ? 'Threaded Video: ON' : 'Threaded Video: OFF');
      sfx?.play?.('click');
    } catch(e) {}
  };

  const handleToggleFps = () => {
    const next = !showFpsCounter;
    setShowFpsCounter(next);
    showToast(next ? 'FPS Counter: Visible' : 'FPS Counter: Hidden');
    sfx?.play?.('click');
  };

  const handleEmulatorAction = async (action) => {
    try {
      const win = iframeRef.current?.contentWindow;
      const emu = win?.EJS_emulator;

      switch (action) {
        case 'restart': {
          let restarted = false;
          if (typeof emu?.restart === 'function') {
            emu.restart();
            restarted = true;
          } else if (typeof emu?.gameManager?.restart === 'function') {
            emu.gameManager.restart();
            restarted = true;
          } else if (typeof emu?.gameManager?.functions?.restart === 'function') {
            emu.gameManager.functions.restart();
            restarted = true;
          }
          if (!restarted) {
            try {
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.location.reload();
              }
            } catch (e) {}
          }
          showToast('Game Restarted');
          sfx?.play?.('click');
          break;
        }

        case 'pause': {
          const nextPaused = !isGamePaused;
          setIsGamePaused(nextPaused);
          if (typeof emu?.togglePlaying === 'function') {
            emu.togglePlaying();
          } else if (typeof emu?.togglePlay === 'function') {
            emu.togglePlay();
          } else if (nextPaused && typeof emu?.pause === 'function') {
            emu.pause();
          } else if (!nextPaused && typeof emu?.play === 'function') {
            emu.play();
          } else if (emu?.gameManager?.functions?.toggleMainLoop) {
            emu.gameManager.functions.toggleMainLoop(nextPaused ? 0 : 1);
          }
          showToast(nextPaused ? 'Emulation Paused' : 'Emulation Resumed');
          sfx?.play?.('click');
          break;
        }

        case 'mute': {
          const nextMuted = !isGameMuted;
          isGameMutedRef.current = nextMuted;
          setIsGameMuted(nextMuted);
          try {
            if (win && typeof win.setEmulatorMute === 'function') {
              win.setEmulatorMute(nextMuted, volume);
            } else if (emu) {
              const targetVol = nextMuted ? 0 : (volume || 1.0);
              emu.muted = nextMuted;
              if (typeof emu.setVolume === 'function') emu.setVolume(targetVol);
              if (emu.gainNode && emu.gainNode.gain) emu.gainNode.gain.value = targetVol;
              const audioCtx = emu?.Module?.AL?.currentCtx?.audioCtx || emu?.Module?.AL?.currentCtx || emu?.audioContext || win?.AudioContext;
              if (audioCtx) {
                if (nextMuted && audioCtx.state === 'running') audioCtx.suspend?.().catch(() => {});
                else if (!nextMuted && audioCtx.state === 'suspended') audioCtx.resume?.().catch(() => {});
              }
            }
          } catch(e) {}
          showToast(nextMuted ? 'Audio Muted' : 'Audio Unmuted');
          sfx?.play?.('click');
          break;
        }

        case 'screenshot': {
          let captured = false;
          
          // Strategy 1: Direct in-core RetroArch framebuffer extraction (Never blank on WebGL)
          if (typeof emu?.gameManager?.screenshot === 'function') {
            try {
              const pngBytes = await emu.gameManager.screenshot();
              if (pngBytes && pngBytes.length > 0) {
                const blob = new Blob([pngBytes], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const fileName = formatCleanFilename(game.title, 'Screenshot', 'png');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                captured = true;
                showToast('Lossless Screenshot Saved!');
              }
            } catch (err) {
              console.warn('GameManager screenshot error:', err);
            }
          }

          // Strategy 2: EmulatorJS takeScreenshot API
          if (!captured && typeof emu?.takeScreenshot === 'function') {
            try {
              const res = await emu.takeScreenshot();
              if (res && res.blob) {
                const url = URL.createObjectURL(res.blob);
                const a = document.createElement('a');
                const fileName = formatCleanFilename(game.title, 'Screenshot', res.format || 'png');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                captured = true;
                showToast('Screenshot Saved!');
              }
            } catch (err) {
              console.warn('takeScreenshot error:', err);
            }
          }

          // Strategy 3: Canvas toDataURL fallback
          if (!captured) {
            try {
              const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
              const canvas = doc?.querySelector('canvas') || stageRef.current?.querySelector('canvas');
              if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                const fileName = formatCleanFilename(game.title, 'Screenshot', 'png');
                a.href = dataUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                captured = true;
                showToast('Canvas Screenshot Saved!');
              }
            } catch (e) {
              console.warn('Canvas capture fallback failed:', e);
            }
          }
          sfx?.play?.('click');
          break;
        }

        case 'settings':
          setShowSettingsModal(prev => !prev);
          sfx?.play?.('click');
          break;

        case 'saveState':
          try {
            let stateBytes = null;
            if (typeof emu?.gameManager?.getState === 'function') {
              stateBytes = emu.gameManager.getState();
            } else if (typeof emu?.saveState === 'function') {
              stateBytes = emu.saveState();
            } else if (typeof emu?.gameManager?.functions?.saveState === 'function') {
              stateBytes = emu.gameManager.functions.saveState();
            }

            if (stateBytes && stateBytes.byteLength > 0) {
              let binary = '';
              const len = stateBytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(stateBytes[i]);
              }
              const b64 = btoa(binary);
              const scopedKey = `state_${activeProfileId}_${game.id || game.title}`;
              const payload = {
                gameId: game.id || game.title,
                profileId: activeProfileId,
                timestamp: Date.now(),
                data: b64
              };
              await dbSet(STORES.SAVE_STATES, scopedKey, payload);
              try { localStorage.setItem(scopedKey, JSON.stringify(payload)); } catch(e) {}
              showToast('Quick Save Created!');
            } else {
              showToast('Quick Save failed - state empty');
            }
          } catch(e) {
            console.warn('Quick save error:', e);
            showToast('Quick Save failed');
          }
          sfx?.play?.('click');
          break;

        case 'loadState':
          try {
            const scopedKey = `state_${activeProfileId}_${game.id || game.title}`;
            const legacyKey = `state_${game.id || game.title}`;
            let dbState = await dbGet(STORES.SAVE_STATES, scopedKey);
            if (!dbState) dbState = await dbGet(STORES.SAVE_STATES, legacyKey);
            let b64 = dbState?.data || null;
            if (!b64) {
              const ls = localStorage.getItem(scopedKey) || localStorage.getItem(legacyKey);
              if (ls) {
                const parsed = JSON.parse(ls);
                b64 = parsed?.data || null;
              }
            }
            if (b64) {
              const binary = atob(b64);
              const len = binary.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              if (typeof emu?.gameManager?.loadState === 'function') {
                emu.gameManager.loadState(bytes);
              } else if (typeof emu?.loadState === 'function') {
                emu.loadState(bytes);
              } else if (typeof emu?.gameManager?.functions?.loadState === 'function') {
                emu.gameManager.functions.loadState(bytes);
              }
              showToast('Quick Load Restored!');
            } else {
              showToast('No Quick Save state found');
            }
          } catch(e) {
            console.warn('Quick load error:', e);
            showToast('Quick Load failed');
          }
          sfx?.play?.('click');
          break;

        case 'fullscreen':
          if (typeof emu?.fullscreen === 'function') {
            emu.fullscreen();
          } else {
            const el = stageRef.current;
            if (el?.requestFullscreen) el.requestFullscreen();
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn('Action dispatch error:', err);
    }
  };

  const handleVolumeChange = (newVal) => {
    const val = parseFloat(newVal);
    setVolumeState(val);
    volumeRef.current = val;
    const isMuted = (val === 0);
    isGameMutedRef.current = isMuted;
    setIsGameMuted(isMuted);
    try {
      const win = iframeRef.current?.contentWindow;
      if (win && typeof win.setEmulatorMute === 'function') {
        win.setEmulatorMute(isMuted, val);
      }
    } catch (e) {}
  };

  return (
    <div className="emulator-backdrop-iisu" onClick={focusEmulator}>
      <header className="emulator-topbar">
        <div className="emulator-topbar-left">
          <Gamepad2 size={20} style={{ color: game.systemColor || '#00c6ff', flexShrink: 0 }} />
          <span className="emulator-game-title" title={game.title}>{game.title}</span>
          <span className="tile-sys-badge emulator-sys-badge" style={{ '--sys-color': game.systemColor || '#00c6ff' }}>
            {game.systemIcon ? (
              <img src={resolveAssetPath(game.systemIcon)} alt="" className="tile-sys-badge-icon" />
            ) : (
              <span className="tile-sys-dot" />
            )}
            <span className="tile-sys-name">{game.systemName}</span>
          </span>
          {isLocalOffline ? (
            <span className="emulator-status-tag tag-offline" title="Running with local offline emulator core">
              <WifiOff size={11} /> <span>OFFLINE</span>
            </span>
          ) : (
            <span className="emulator-status-tag tag-cdn" title="Connected to online emulator core">
              <Wifi size={11} /> <span>CDN</span>
            </span>
          )}
          {gamepadConnected && (
            <span className="emulator-status-tag tag-gamepad">
              <span>GAMEPAD</span>
            </span>
          )}

          {/* Active Screen Recording Live Pill */}
          {isRecording && (
            <span className="emulator-status-tag tag-recording animate-pulse" title="Recording active gameplay">
              <CircleDot size={11} color="#ef4444" />
              <span>REC {formatTimer(recordingSeconds)}</span>
            </span>
          )}

          {/* Real-Time Live FPS Badge reading directly from emulator canvas */}
          {showFpsCounter && (
            <span
              className="emulator-status-tag tag-fps"
              style={{
                background: perfStats.fps >= 55 ? 'rgba(16, 185, 129, 0.2)' : perfStats.fps >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: perfStats.fps >= 55 ? '#34d399' : perfStats.fps >= 40 ? '#fbbf24' : '#f87171',
                borderColor: perfStats.fps >= 55 ? 'rgba(52, 211, 153, 0.35)' : 'rgba(239, 68, 68, 0.35)'
              }}
              title="Real-time frame rate"
            >
              <Activity size={11} /> <span>{perfStats.fps} FPS</span>
            </span>
          )}
        </div>

        {/* Center / Actions directly in topbar for Large Displays */}
        <div className="emulator-topbar-actions">
          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => handleEmulatorAction('restart')} 
            title="Restart Game"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => handleEmulatorAction('pause')} 
            title={isGamePaused ? "Resume Game" : "Pause Game"}
          >
            {isGamePaused ? <Play size={14} color="#10b981" /> : <Pause size={14} />}
            <span>{isGamePaused ? "Resume" : "Pause"}</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => handleEmulatorAction('mute')} 
            title={isGameMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isGameMuted ? <VolumeX size={14} color="#f87171" /> : <Volume2 size={14} />}
            <span>{isGameMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button 
            className={`emulator-topbar-action-btn ${isRecording ? 'recording-active' : ''}`}
            onClick={handleToggleRecording}
            title={isRecording ? "Stop Screen Recording" : "Start 60 FPS Screen Recording"}
          >
            <CircleDot size={14} color={isRecording ? "#ef4444" : "currentColor"} />
            <span>{isRecording ? "Stop REC" : "Record"}</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => {
              const nextIdx = (SPEED_PRESETS.indexOf(emulationSpeed) + 1) % SPEED_PRESETS.length;
              handleSpeedChange(SPEED_PRESETS[nextIdx]);
            }}
            title="Cycle Emulation Speed"
          >
            <Gauge size={14} color="#38bdf8" />
            <span>{emulationSpeed}x</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => handleEmulatorAction('screenshot')} 
            title="Take Lossless Screenshot"
          >
            <Camera size={14} />
            <span>Capture</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => {
              const sIdx = (SHADERS.indexOf(activeShader) + 1) % SHADERS.length;
              setActiveShader(SHADERS[sIdx]);
              showToast(`Display Filter: ${SHADER_LABELS[SHADERS[sIdx]]}`);
            }}
            title="Cycle Display Filters"
          >
            <Tv size={14} color="#a78bfa" />
            <span>{SHADER_LABELS[activeShader]}</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => handleEmulatorAction('saveState')} 
            title="Quick Save State"
          >
            <Save size={14} color="#10b981" />
            <span>Save</span>
          </button>

          <button 
            className="emulator-topbar-action-btn" 
            onClick={() => handleEmulatorAction('loadState')} 
            title="Quick Load State"
          >
            <RotateCcw size={14} color="#38bdf8" />
            <span>Load</span>
          </button>
        </div>

        <div className="emulator-topbar-right">
          {/* Diagnostic Monitor Toggle Button */}
          <button
            className={`emulator-diag-btn ${showDiagnostics ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDiagnostics(prev => !prev);
            }}
            title="Toggle Performance Diagnostics"
          >
            <Activity size={15} />
            <span className="btn-label">Diagnostics</span>
          </button>

          {/* Mobile Collapsible Menu Button (hidden on large displays) */}
          <button
            className={`emulator-menu-btn mobile-menu-btn ${showSubToolbar ? 'active' : ''}`}
            onClick={handleToggleEmulatorMenu}
            title="Toggle Emulator Menu"
          >
            <Menu size={18} />
          </button>

          <button className="emulator-close-btn" onClick={handleClose} title="Close Game">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Mobile-only Dropdown Toolbar */}
      {showSubToolbar && (
        <div className="emulator-sub-toolbar mobile-sub-toolbar animate-slide-down" onClick={(e) => e.stopPropagation()}>
          <button 
            className="sub-toolbar-btn" 
            onClick={() => handleEmulatorAction('restart')} 
            title="Restart Game"
          >
            <RotateCcw size={16} />
            <span>Restart</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => handleEmulatorAction('pause')} 
            title={isGamePaused ? "Resume Game" : "Pause Game"}
          >
            {isGamePaused ? <Play size={16} color="#10b981" /> : <Pause size={16} />}
            <span>{isGamePaused ? "Resume" : "Pause"}</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => handleEmulatorAction('mute')} 
            title={isGameMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isGameMuted ? <VolumeX size={16} color="#f87171" /> : <Volume2 size={16} />}
            <span>{isGameMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button 
            className={`sub-toolbar-btn ${isRecording ? 'recording-active' : ''}`}
            onClick={handleToggleRecording}
            title={isRecording ? "Stop Screen Recording" : "Start 60 FPS Screen Recording"}
          >
            <CircleDot size={16} color={isRecording ? "#ef4444" : "currentColor"} />
            <span>{isRecording ? "Stop REC" : "Record"}</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => {
              const nextIdx = (SPEED_PRESETS.indexOf(emulationSpeed) + 1) % SPEED_PRESETS.length;
              handleSpeedChange(SPEED_PRESETS[nextIdx]);
            }}
            title="Cycle Emulation Speed"
          >
            <Gauge size={16} color="#38bdf8" />
            <span>{emulationSpeed}x</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => handleEmulatorAction('screenshot')} 
            title="Take Lossless In-Core Screenshot (PNG)"
          >
            <Camera size={16} />
            <span>Capture</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => {
              const sIdx = (SHADERS.indexOf(activeShader) + 1) % SHADERS.length;
              setActiveShader(SHADERS[sIdx]);
              showToast(`Display Filter: ${SHADER_LABELS[SHADERS[sIdx]]}`);
            }}
            title="Cycle Display Filters"
          >
            <Tv size={16} color="#a78bfa" />
            <span>{SHADER_LABELS[activeShader]}</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => handleEmulatorAction('saveState')} 
            title="Quick Save State"
          >
            <Save size={16} color="#10b981" />
            <span>Save</span>
          </button>

          <button 
            className="sub-toolbar-btn" 
            onClick={() => handleEmulatorAction('loadState')} 
            title="Quick Load State"
          >
            <RotateCcw size={16} color="#38bdf8" />
            <span>Load</span>
          </button>

          <button 
            className={`sub-toolbar-btn ${showDiagnostics ? 'diag-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDiagnostics(prev => !prev);
              setShowSubToolbar(false);
            }}
            title="Toggle Performance Diagnostics"
          >
            <Activity size={16} color="#38bdf8" />
            <span>Diagnostics</span>
          </button>
        </div>
      )}

      {/* In-App Toast Notification */}
      {toastMessage && (
        <div className="emulator-toast-banner animate-fade-in">
          <Sparkles size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Real-Time Performance & Diagnostic Health HUD */}
      {showDiagnostics && (
        <aside className="emulator-diag-panel" onClick={(e) => e.stopPropagation()}>
          <div className="diag-header">
            <div className="diag-title">
              <ShieldCheck size={16} color="#38bdf8" />
              <span>EMULATION HEALTH & PERFORMANCE</span>
            </div>
            <button
              className="diag-close-btn"
              onClick={() => setShowDiagnostics(false)}
              title="Close Diagnostics"
            >
              <X size={14} />
            </button>
          </div>

          <div className="diag-grid">
            <div className="diag-card">
              <span className="diag-card-label">CORE FPS</span>
              <span className="diag-card-val" style={{ color: perfStats.fps >= 55 ? '#34d399' : '#f87171' }}>
                {perfStats.fps} <span className="diag-unit">FPS</span>
              </span>
              <span className="diag-card-sub">Target: 60.0 FPS</span>
            </div>

            <div className="diag-card">
              <span className="diag-card-label">FRAME TIME</span>
              <span className="diag-card-val" style={{ color: perfStats.frameTimeMs <= 18 ? '#34d399' : '#fbbf24' }}>
                {perfStats.frameTimeMs} <span className="diag-unit">ms</span>
              </span>
              <span className="diag-card-sub">Ideal VSync: 16.6 ms</span>
            </div>

            <div className="diag-card">
              <span className="diag-card-label">AUDIO CLOCK SYNC</span>
              <span className="diag-card-val audio-val">
                {perfStats.audioState}
              </span>
              <span className="diag-card-sub">Dynamic Rate Control</span>
            </div>

            <div className="diag-card">
              <span className="diag-card-label">INPUT LATENCY</span>
              <span className="diag-card-val input-val">
                {perfStats.inputLatency}
              </span>
              <span className="diag-card-sub">{gamepadConnected ? 'Direct Gamepad Hook' : 'Direct Keyboard Hook'}</span>
            </div>
          </div>

          <div className="diag-health-banner" style={{ borderLeftColor: perfStats.healthColor }}>
            <div className="diag-health-status" style={{ color: perfStats.healthColor }}>
              <ShieldCheck size={14} />
              <span>{perfStats.healthStatus}</span>
            </div>
            <p className="diag-health-desc">{perfStats.diagnosticTip}</p>
          </div>
        </aside>
      )}

      <div className={`emulator-stage filter-${activeShader}`} ref={stageRef} onClick={focusEmulator}>
        {/* Isolated Engine */}
      </div>
    </div>
  );
}

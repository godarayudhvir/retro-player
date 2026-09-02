import { useEffect, useRef } from 'react';
import { apiFetch } from '../utils/apiClient';

/**
 * Creates a valid, in-memory 2-second silent PCM WAV Blob URL.
 * Having a real duration (>0s) with loop=true prevents browsers from firing 'ended'
 * and keeps the OS MediaSession persistently alive across Chrome, Safari, and Android.
 */
function createSilentAudioBlobUrl() {
  try {
    const sampleRate = 8000;
    const numSamples = 8000 * 2; // 2 seconds of silence
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // 16 for PCM
    view.setUint16(20, 1, true); // Audio format 1 = PCM
    view.setUint16(22, 1, true); // Mono (1 channel)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate, true); // byteRate = sampleRate * 1 * 8/8
    view.setUint16(32, 1, true); // blockAlign
    view.setUint16(34, 8, true); // 8 bits per sample

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples, true);

    // Fill audio PCM samples with 128 (8-bit silence midpoint)
    const bytes = new Uint8Array(buffer, 44, numSamples);
    bytes.fill(128);

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

function resolveAbsoluteUrl(pathStr) {
  if (!pathStr || typeof window === 'undefined') return '';
  if (
    pathStr.startsWith('data:') ||
    pathStr.startsWith('blob:') ||
    pathStr.startsWith('http://') ||
    pathStr.startsWith('https://')
  ) {
    return pathStr;
  }

  try {
    const base = new URL(window.location.href);
    const basePath = base.pathname.replace(/\/+$/, '');
    const cleanPath = pathStr.startsWith('/') ? pathStr : `/${pathStr}`;

    if (basePath && !cleanPath.startsWith(`${basePath}/`)) {
      return `${base.origin}${basePath}${cleanPath}`;
    }
    return `${base.origin}${cleanPath}`;
  } catch {
    return pathStr;
  }
}

// Module-level persistent audio singleton to preserve browser Autoplay permissions across game switches
let singletonAudio = null;
let singletonBlobUrl = null;

function getPersistentAudioAnchor() {
  if (typeof window === 'undefined') return null;
  if (!singletonBlobUrl) {
    singletonBlobUrl = createSilentAudioBlobUrl();
  }
  if (!singletonAudio && singletonBlobUrl) {
    singletonAudio = new Audio(singletonBlobUrl);
    singletonAudio.loop = true;
    singletonAudio.volume = 0.0001;
  }
  return singletonAudio;
}

/**
 * Universal Hook to manage multi-platform Game Presence:
 * 1. OS MediaSession API (macOS Control Center, iOS Lock Screen, Android Notification Shade, Windows 11 Action Center)
 *    - Real-time continuous session playtime scrubber (00:00 ➔ 01:05:00) using setPositionState.
 *    - Play/Pause simultaneously freezes/resumes both the emulation frame loop and the session playtime clock.
 *    - Forward/Backward fast-forwards and steps-down emulation speed.
 * 2. Discord Desktop Rich Presence (RPC) & REST broadcast feeds via /api/presence
 */
export function useGamePresence(activeGame) {
  const lastDispatchedGameKeyRef = useRef(null);

  useEffect(() => {
    const audioAnchor = getPersistentAudioAnchor();

    if (!activeGame) {
      // 1. Pause persistent audio anchor on exit
      if (audioAnchor) {
        try {
          audioAnchor.pause();
          audioAnchor.currentTime = 0;
        } catch {
          // Ignore
        }
      }

      // 2. Clear OS MediaSession metadata & position state
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = 'none';
          if (typeof navigator.mediaSession.setPositionState === 'function') {
            navigator.mediaSession.setPositionState(null);
          }
        } catch {
          // Ignore
        }
      }

      // 3. Notify server / Discord RPC of IDLE state only if we were playing previously
      if (lastDispatchedGameKeyRef.current) {
        lastDispatchedGameKeyRef.current = null;
        apiFetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'IDLE' })
        }).catch(() => {});
      }
      return;
    }

    const gameTitle = activeGame.title || activeGame.name || 'Retro Game';
    const systemKey = activeGame.systemKey || activeGame.system || '';
    const systemName = activeGame.systemName || activeGame.systemTitle || (systemKey ? systemKey.toUpperCase() : 'Retro Console');
    
    // Resolve absolute cover URL for MediaSession and Discord RPC (supports GitHub Pages subpaths)
    let rawCover = activeGame.coverUrl || activeGame.cover || activeGame.boxArt || activeGame.metadata?.coverUrl || activeGame.metadata?.cover || '';
    if (rawCover && rawCover.endsWith('.svg')) {
      rawCover = '';
    }
    const coverUrl = resolveAbsoluteUrl(rawCover);

    const gameKey = `${systemKey}_${activeGame.id || activeGame.filename || gameTitle}`;
    lastDispatchedGameKeyRef.current = gameKey;
    const startTimestamp = Date.now();
    let accumulatedPausedMs = 0;
    let pauseStartTimestamp = null;

    // 1. Play persistent audio anchor
    if (audioAnchor) {
      try {
        if (audioAnchor.paused) {
          audioAnchor.play().catch(() => {});
        }
      } catch {
        // Ignore
      }
    }

    // Helper to calculate active playing seconds (excluding paused time)
    const getElapsedSeconds = () => {
      const now = Date.now();
      const currentPauseDuration = pauseStartTimestamp ? (now - pauseStartTimestamp) : 0;
      const totalElapsedMs = now - startTimestamp - accumulatedPausedMs - currentPauseDuration;
      return Math.max(0, Math.min(86400, totalElapsedMs / 1000));
    };

    // Helper to sync continuous session playtime to OS scrubber
    const syncPositionState = (isPaused = false) => {
      if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function') return;

      try {
        navigator.mediaSession.setPositionState({
          duration: 86400, // 24-hour continuous timeline
          playbackRate: isPaused ? 0 : 1.0,
          position: getElapsedSeconds()
        });
      } catch {
        // Ignore
      }
    };

    // 2. Set OS MediaSession metadata
    const updateMediaSession = () => {
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
        try {
          const artwork = [];
          if (coverUrl) {
            artwork.push(
              { src: coverUrl, sizes: '96x96' },
              { src: coverUrl, sizes: '128x128' },
              { src: coverUrl, sizes: '256x256' },
              { src: coverUrl, sizes: '512x512' }
            );
          }

          navigator.mediaSession.metadata = new MediaMetadata({
            title: gameTitle,
            artist: `${systemName} • Retro Player`,
            album: 'Retro Player',
            artwork
          });

          navigator.mediaSession.playbackState = 'playing';
          syncPositionState(false);

          // Chrome, Safari & OS Media Center Action Handlers
          navigator.mediaSession.setActionHandler('play', () => {
            navigator.mediaSession.playbackState = 'playing';
            if (pauseStartTimestamp) {
              accumulatedPausedMs += (Date.now() - pauseStartTimestamp);
              pauseStartTimestamp = null;
            }
            syncPositionState(false);

            if (audioAnchor && audioAnchor.paused) {
              audioAnchor.play().catch(() => {});
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('retro:media-play'));
            }
          });

          navigator.mediaSession.setActionHandler('pause', () => {
            navigator.mediaSession.playbackState = 'paused';
            if (!pauseStartTimestamp) {
              pauseStartTimestamp = Date.now();
            }
            syncPositionState(true);

            if (audioAnchor && !audioAnchor.paused) {
              audioAnchor.pause();
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('retro:media-pause'));
            }
          });

          // Fast-Forward on Next Track / Seek Forward
          const handleSpeedUp = () => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('retro:media-speed-up'));
            }
          };
          navigator.mediaSession.setActionHandler('nexttrack', handleSpeedUp);
          navigator.mediaSession.setActionHandler('seekforward', handleSpeedUp);

          // Step Down Speed on Previous Track / Seek Backward
          const handleSpeedDown = () => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('retro:media-speed-down'));
            }
          };
          navigator.mediaSession.setActionHandler('previoustrack', handleSpeedDown);
          navigator.mediaSession.setActionHandler('seekbackward', handleSpeedDown);

          try {
            navigator.mediaSession.setActionHandler('seekto', null);
            navigator.mediaSession.setActionHandler('skipad', null);
          } catch {
            // Ignore
          }
        } catch {
          // Gracefully ignore browser MediaSession constraints
        }
      }
    };

    updateMediaSession();

    // Periodic time sync every 10s to keep OS scrubber perfectly accurate to the second
    const syncInterval = setInterval(() => {
      if (!pauseStartTimestamp) {
        syncPositionState(false);
      }
    }, 10000);

    // 3. Dispatch to Server for Discord RPC & Webhooks / OBS Widget
    apiFetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'PLAYING',
        gameTitle,
        systemKey,
        systemName,
        coverUrl,
        startTimestamp
      })
    }).catch(() => {});

    return () => {
      clearInterval(syncInterval);

      // Pause on unmount / game transition
      if (audioAnchor) {
        try {
          audioAnchor.pause();
          audioAnchor.currentTime = 0;
        } catch {
          // Ignore
        }
      }

      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = 'none';
          if (typeof navigator.mediaSession.setPositionState === 'function') {
            navigator.mediaSession.setPositionState(null);
          }
        } catch {
          // Ignore
        }
      }
    };
  }, [activeGame]);
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveAssetPath } from '../utils/assetPath';

const BGM_VOLUME_KEY = 'retro_bgm_volume';
const BGM_MUTED_KEY = 'retro_bgm_muted';
const BGM_TRACK_INDEX_KEY = 'retro_bgm_track_index';

// Built-in fallback tracklist guaranteeing zero broken BGM on static hosts / GitHub Pages
const DEFAULT_BGM_TRACKS = [
  { id: 'bgm-track2', title: 'CHILL LOBBY', filename: 'track2.m4a', url: '/bgm/track2.m4a' },
  { id: 'bgm-track3', title: 'PIXEL GROOVE', filename: 'track3.m4a', url: '/bgm/track3.m4a' },
  { id: 'bgm-track4', title: 'RETRO WAVES', filename: 'track4.m4a', url: '/bgm/track4.m4a' },
  { id: 'bgm-track5', title: 'MIDNIGHT SYNTH', filename: 'track5.m4a', url: '/bgm/track5.m4a' },
  { id: 'bgm-track6', title: 'ARCADE DREAMS', filename: 'track6.m4a', url: '/bgm/track6.m4a' }
];

/**
 * Hook managing Background Music (BGM) tracks, looping playlist, volume, and smart auto-pause during gameplay.
 * Fully compatible with GitHub Pages subpaths, Localhost, Docker, and Offline PWA environments.
 */
export function useBgmEngine({ activeGame = null } = {}) {
  const [tracks, setTracks] = useState(DEFAULT_BGM_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(BGM_TRACK_INDEX_KEY);
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(BGM_MUTED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(BGM_VOLUME_KEY);
      return saved !== null ? parseFloat(saved) : 0.35; // default comfortable background volume
    } catch {
      return 0.35;
    }
  });

  const audioRef = useRef(null);
  const wasPlayingBeforeGameRef = useRef(false);

  // Fetch available BGM tracks from backend API with automatic JSON / static fallback
  const fetchTracks = useCallback(async () => {
    const endpoints = [
      resolveAssetPath('api/bgm'),
      resolveAssetPath('api/bgm.json'),
      '/api/bgm',
      '/api/bgm.json'
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json') || endpoint.endsWith('.json')) {
            const data = await res.json();
            if (data.tracks && data.tracks.length > 0) {
              setTracks(data.tracks);
              return;
            }
          }
        }
      } catch {
        // Try next fallback endpoint
      }
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Audio element initialization & lifecycle
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = false;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleEnded = () => {
      // Auto-advance to next track in playlist
      setCurrentTrackIndex((prevIndex) => {
        const nextIndex = tracks.length > 0 ? (prevIndex + 1) % tracks.length : 0;
        try {
          localStorage.setItem(BGM_TRACK_INDEX_KEY, String(nextIndex));
        } catch {}
        return nextIndex;
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [tracks]);

  // Synchronize audio track source when index or tracks change
  useEffect(() => {
    if (!audioRef.current || tracks.length === 0) return;
    const audio = audioRef.current;
    const currentTrack = tracks[currentTrackIndex % tracks.length];

    if (!currentTrack) return;

    const resolvedUrl = resolveAssetPath(currentTrack.url);
    const currentAudioUrl = audio.src ? new URL(audio.src, window.location.href).href : '';
    const targetAudioUrl = new URL(resolvedUrl, window.location.href).href;

    if (currentAudioUrl !== targetAudioUrl) {
      audio.src = resolvedUrl;
      audio.load();
      if (isPlaying && !activeGame && !isMuted) {
        audio.play().catch((err) => {
          console.debug('[BGM ENGINE] Auto-playback prevented by browser policy:', err);
        });
      }
    }
  }, [currentTrackIndex, tracks, isPlaying, activeGame, isMuted]);

  // Volume and mute controls
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Smart gameplay pause / resume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeGame) {
      // Game running - fade/pause BGM so game chiptune audio plays cleanly
      if (isPlaying) {
        wasPlayingBeforeGameRef.current = true;
        audio.pause();
      }
    } else {
      // Returned to menu - resume if it was playing previously
      if (wasPlayingBeforeGameRef.current && !isMuted) {
        audio.play().catch(() => {});
        wasPlayingBeforeGameRef.current = false;
      }
    }
  }, [activeGame, isPlaying, isMuted]);

  // Toggle playback play / pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || tracks.length === 0) return;
    const audio = audioRef.current;
    const currentTrack = tracks[currentTrackIndex % tracks.length];

    if (!audio.src && currentTrack) {
      audio.src = resolveAssetPath(currentTrack.url);
      audio.load();
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      wasPlayingBeforeGameRef.current = false;
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.debug('[BGM ENGINE] User interaction needed to start audio:', err);
      });
    }
  }, [isPlaying, tracks, currentTrackIndex]);

  // Skip to next track
  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => {
      const next = (prev + 1) % tracks.length;
      try {
        localStorage.setItem(BGM_TRACK_INDEX_KEY, String(next));
      } catch {}
      return next;
    });
  }, [tracks]);

  // Previous track
  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => {
      const next = (prev - 1 + tracks.length) % tracks.length;
      try {
        localStorage.setItem(BGM_TRACK_INDEX_KEY, String(next));
      } catch {}
      return next;
    });
  }, [tracks]);

  // Play specific track by index
  const playTrack = useCallback((index) => {
    if (tracks.length === 0) return;
    const safeIdx = Math.max(0, Math.min(tracks.length - 1, index));
    setCurrentTrackIndex(safeIdx);
    setIsPlaying(true);
    try {
      localStorage.setItem(BGM_TRACK_INDEX_KEY, String(safeIdx));
    } catch {}
  }, [tracks]);

  // Change volume
  const setBgmVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    try {
      localStorage.setItem(BGM_VOLUME_KEY, String(clamped));
    } catch {}
  }, []);

  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex % tracks.length] : null;

  return {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isMuted,
    volume,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    refreshTracks: fetchTracks,
    setBgmVolume,
    setIsMuted: (muted) => {
      setIsMuted(muted);
      try {
        localStorage.setItem(BGM_MUTED_KEY, String(muted));
      } catch {}
    }
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';

const BGM_VOLUME_KEY = 'retro_bgm_volume';
const BGM_MUTED_KEY = 'retro_bgm_muted';
const BGM_TRACK_INDEX_KEY = 'retro_bgm_track_index';

/**
 * Hook managing Background Music (BGM) tracks, looping playlist, volume, and smart auto-pause during gameplay.
 */
export function useBgmEngine({ activeGame = null } = {}) {
  const [tracks, setTracks] = useState([]);
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

  // Fetch available BGM tracks from backend API
  const fetchTracks = useCallback(async () => {
    try {
      const res = await fetch('/api/bgm');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        }
      }
    } catch (e) {
      console.warn('Failed to load BGM tracklist:', e);
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

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [tracks]);

  // Synchronize audio track source when index or tracks change
  useEffect(() => {
    if (!audioRef.current || tracks.length === 0) return;
    const audio = audioRef.current;
    const currentTrack = tracks[currentTrackIndex % tracks.length];

    if (currentTrack && audio.src !== window.location.origin + currentTrack.url) {
      audio.src = currentTrack.url;
      if (isPlaying && !activeGame && !isMuted) {
        audio.play().catch((err) => {
          console.debug('[BGM ENGINE] Play prevented:', err);
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
  }, [isPlaying, tracks]);

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

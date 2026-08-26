import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Pure Web Audio API Synthesizer Hook for Retro Console UI Sound Effects.
 * Generates zero-latency tactile audio feedback without external audio assets.
 */
export function useWebAudioSfx() {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const saved = localStorage.getItem('retro_sfx_muted');
      if (saved !== null) return saved === 'true';
      return false; // Enabled by default for rich retro console experience
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);

  // Initialize / resume AudioContext with master gain bus
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.75, ctx.currentTime);
        masterGain.connect(ctx.destination);
        audioCtxRef.current = ctx;
        masterGainRef.current = masterGain;
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  }, []);

  // Proactively unlock Web Audio on any initial user gesture (click, keydown, gamepad)
  useEffect(() => {
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      } else if (!audioCtxRef.current) {
        getAudioContext();
      }
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('gamepadconnected', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('gamepadconnected', unlockAudio);
    };
  }, [getAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('retro_sfx_muted', String(next));
      } catch {}
      return next;
    });
  }, []);

  const getDestination = (ctx) => {
    return masterGainRef.current || ctx.destination;
  };

  /**
   * Crisp tactile tick for D-pad / tile cursor navigation.
   */
  const playTileNav = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.05);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(getDestination(ctx));

      osc.start(now);
      osc.stop(now + 0.055);
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Frequency swoosh for L1 / R1 console system tab switching.
   */
  const playTabSwitch = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(getDestination(ctx));

      osc.start(now);
      osc.stop(now + 0.075);
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Authentic cartridge insert "click-clack" insertion sound followed by a cheerful console boot chime.
   */
  const playGameLaunch = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Mechanical Cartridge Insert Clack (Percussive double click)
      const playClick = (time, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.025);

        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

        osc.connect(gain);
        gain.connect(getDestination(ctx));
        osc.start(time);
        osc.stop(time + 0.03);
      };

      playClick(now, 260);        // First mechanical latch
      playClick(now + 0.065, 420); // Second cartridge lock click

      // 2. Cheerful Boot Chime (Ascending arpeggio: G4 -> C5 -> E5 -> G5)
      const notes = [
        { freq: 392.00, delay: 0.14, dur: 0.12 }, // G4
        { freq: 523.25, delay: 0.22, dur: 0.12 }, // C5
        { freq: 659.25, delay: 0.30, dur: 0.14 }, // E5
        { freq: 783.99, delay: 0.38, dur: 0.35 }  // G5
      ];

      notes.forEach(({ freq, delay, dur }) => {
        const noteTime = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.28, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

        osc.connect(gain);
        gain.connect(getDestination(ctx));

        osc.start(noteTime);
        osc.stop(noteTime + dur + 0.01);
      });
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Harmonic crystal chime for opening modal dialogs / drawers.
   */
  const playModalOpen = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (i * 0.025));

        gain.gain.setValueAtTime(0.2, now + (i * 0.025));
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(getDestination(ctx));

        osc.start(now + (i * 0.025));
        osc.stop(now + 0.13);
      });
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Soft descending resonance for dismissing modals.
   */
  const playModalClose = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(getDestination(ctx));

      osc.start(now);
      osc.stop(now + 0.075);
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Light click for virtual keyboard typing.
   */
  const playKeyTick = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(getDestination(ctx));

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Confirmation tone when save data is detected.
   */
  const playSaveDetected = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [587.33, 880.00].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + (i * 0.06);

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(getDestination(ctx));

        osc.start(start);
        osc.stop(start + 0.13);
      });
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Sparkling star arpeggio on favorite toggle (ascending on add, mellow descending on remove).
   */
  const playFavoriteToggle = useCallback((isFav = true) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (isFav) {
        // High sparkle arpeggio (E5 -> G#5 -> B5 -> E6)
        const notes = [659.25, 830.61, 987.77, 1318.51];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const start = now + (i * 0.045);

          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.24, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

          osc.connect(gain);
          gain.connect(getDestination(ctx));

          osc.start(start);
          osc.stop(start + 0.15);
        });
      } else {
        // Soft descending release tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(getDestination(ctx));

        osc.start(now);
        osc.stop(now + 0.085);
      }
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  /**
   * Futuristic filter sweep for theme switching.
   */
  const playThemeSwitch = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.09);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(getDestination(ctx));

      osc.start(now);
      osc.stop(now + 0.095);
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  const suspendAudio = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, []);

  /**
   * Retro warning double-chime when controller battery drops low.
   */
  const playBatteryLow = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.14].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now + delay);
        osc.frequency.exponentialRampToValueAtTime(330, now + delay + 0.1);

        gain.gain.setValueAtTime(0.22, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(getDestination(ctx));

        osc.start(now + delay);
        osc.stop(now + delay + 0.105);
      });
    } catch (e) {
      console.debug('SFX error:', e);
    }
  }, [isMuted, getAudioContext]);

  return {
    isMuted,
    toggleMute,
    suspendAudio,
    resumeAudio,
    playTileNav,
    playTabSwitch,
    playGameLaunch,
    playModalOpen,
    playModalClose,
    playKeyTick,
    playSaveDetected,
    playFavoriteToggle,
    playThemeSwitch,
    playBatteryLow,
    playNavSelect: playTileNav
  };
}


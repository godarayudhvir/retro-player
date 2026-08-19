# Web Audio UI Sound Effects Synthesizer

## 1. Description

The Web Audio UI Sound Effects Synthesizer is a zero-latency audio engine implemented via the native HTML5 Web Audio API (`AudioContext`). It delivers tactile acoustic feedback throughout the Retro Player interface without requiring external MP3 or WAV audio files, eliminating asset network latency and memory overhead.

The synthesizer powers tactile feedback across every layer of interaction: directional D-pad and tile cursor movements, console system ribbon switches, modal transitions, virtual keyboard clicks, and physical cartridge insertion sound effects with console boot chimes.

---

## 2. Detailed List of What It Does

- **Pure Web Audio Synthesis**: Generates sound using dynamic `OscillatorNode`, `GainNode`, and exponential gain/frequency ramps in real-time.
- **Tile & Grid Navigation Feedback (`playTileNav`)**: Soft 40ms triangle-wave blip (480Hz down to 240Hz) accompanying tile focus changes and spatial D-pad navigation.
- **System Ribbon Tab Swoosh (`playTabSwitch`)**: Resonant sine sweep (320Hz to 680Hz) triggered when switching console systems via `L1`/`R1` shoulder buttons or keyboard `Q`/`E`.
- **Physical Cartridge Load & Boot Chime (`playGameLaunch`)**:
  - Mechanical double-click latch sound (two 20ms square-wave percussive bursts at 260Hz and 420Hz).
  - Ascending 4-note boot chord (G4 392Hz, C5 523Hz, E5 659Hz, G5 784Hz) paying homage to classic handheld startup chimes.
- **Harmonic Modal Transitions (`playModalOpen` / `playModalClose`)**:
  - Resonant harmonic chord (523Hz, 659Hz, 1046Hz) for opening dialogs and game detail drawers.
  - Descending sine wave dismiss tone (440Hz to 220Hz) on modal exit.
- **Virtual Keyboard Typing Clicks (`playKeyTick`)**: Crisp micro-clicks (800Hz to 600Hz, 15ms) for on-screen keyboard text input.
- **Save Data Notification Ping (`playSaveDetected`)**: Two-tone chime (587Hz and 880Hz) confirming detected save state or battery RAM.
- **Persistent Mute Control (`toggleMute`)**: Stores audio toggle state in `localStorage.getItem('retro_sfx_muted')` with status indicator in the top status bar.

---

## 3. Detailed Logic Behind Everything and How It Works

### State Management & AudioContext Lifecycle
- **Lazy Initialization**: `AudioContext` is instantiated on the first user interaction to comply with modern browser autoplay policies. If initialized in a `suspended` state, `useWebAudioSfx` automatically invokes `.resume()`.
- **Audio Routing**: Every synthesized sound dynamically creates an oscillator, connects to a gain node configured with exponential decay curves, and terminates at `audioCtx.destination`. Oscillators automatically stop and garbage-collect after playback.

```
[User Interaction: Nav / Shoulder / Launch]
                    │
                    ▼
           [useWebAudioSfx]
                    │
   ┌────────────────┼────────────────┐
   ▼                ▼                ▼
[OscillatorNode] [GainNode]   [ExponentialRamp]
 (Sine/Square)   (Volume Env)  (Pitch Drop)
   │                │                │
   └────────────────┼────────────────┘
                    ▼
          [audioCtx.destination]
                    │
                    ▼
          [Hardware Speakers]
```

### Module Location
- Implementation: [src/hooks/useWebAudioSfx.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useWebAudioSfx.js)
- UI Integration: [src/components/Topbar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/Topbar.jsx), [src/hooks/useGamepadNavigation.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useGamepadNavigation.js)

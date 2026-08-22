# Emulator Modal UI Component (`architecture/components/emulator-modal.md`)

## 1. Description
The Emulator Modal UI component ([EmulatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/EmulatorModal.jsx)) renders the hardware-accelerated full-screen retro console overlay, top HUD bar, isolated iframe canvas stage, real-time performance & diagnostic health HUD, and RetroArch control panel integration.

---

## 2. Detailed List of What It Does
- **Hardware-Accelerated Container**: Renders fixed overlay `.emulator-backdrop-iisu` with dark background `#090b10`, `contain: layout style paint;`, and `transform: translateZ(0)` to eliminate GPU compositor bottlenecks.
- **Unified Large-Display Topbar (`.emulator-topbar`)**: On desktop and tablets (> 768px), hosts all in-game actions directly in the main topbar with zero popup overlay menus: Restart (`RotateCcw`), Pause/Resume (`Play`/`Pause`), Mute/Unmute (`Volume2`/`VolumeX`), 60 FPS Lossless Screen Recording (`CircleDot`), Live Emulation Speed Cycling (`Gauge`, `1.0x` - `5.0x`), Instant Lossless Capture (`Camera`), 1-Click Display Filter/Shader Cycling (`Tv`), Quick Save State (`Save`), Quick Load State (`RotateCcw`), and Diagnostic Health Monitor (`Activity`).
- **Compact Mobile Dropdown Fallback (`.mobile-sub-toolbar`)**: On small mobile devices (<= 768px), provides a collapsible hamburger menu button (`<Menu size={18} />`) that slides down the action buttons smoothly without overflowing the viewport.
- **Top Responsive Header Metadata**: Shows active game title with ellipsis constraints, system badge, offline/CDN indicator, live controller status indicator, active screen recording indicator (`.tag-recording` with pulsing live timer), real-time FPS badge (`.tag-fps`), and exit close button (`<X size={18} />`).
- **Real-Time Performance & Diagnostic Health HUD (`.emulator-diag-panel`)**: Toggleable in-app diagnostic dashboard displaying measured live FPS, delta frame time in milliseconds (`16.6ms` target), Web Audio clock state and sample rate (e.g. `48.0 kHz`), gamepad polling latency, and real-time health diagnostic advice with automated root-cause detection.
- **Instant Lossless PNG Screenshot Capture**: Dual-pipeline capture exporting direct WebGL/2D `<canvas>` buffers as timestamped PNG files with zero frame drops.
- **60 FPS Screen Video Recording Engine**: Native `MediaRecorder` integration capturing active gameplay canvas and Web Audio sound tracks into `.webm` video files with live topbar indicator and automatic download.
- **Distraction-Free Fullscreen Stage**: Full-screen isolated canvas stage without distracting on-canvas floating buttons, supporting CSS-based CRT scanlines and display filters.
- **Mobile Touchscreen Gamepad Viewport Optimization**: The iframe injects viewport-fit metadata and activates touch controls conditionally on mobile touchscreens (`<= 1024px`), avoiding touch DOM overhead on desktop.

---

## 3. Detailed Logic Behind Everything and How It Works
- **Core Engine Configuration**: Injects `window.EJS_defaultOptions` with `video_vsync: 'true'`, `video_threaded: 'true'`, `video_max_swapchain_images: '2'`, `audio_sync: 'true'`, `audio_rate_control: 'true'`, and `audio_max_timing_skew: '0.05'` ensuring smooth VSync presentation without audio-induced frame rate halving.
- **Action Dispatch Engine (`handleEmulatorAction`)**:
  - `restart`: Directly invokes `emu.gameManager.restart()` and `emu.gameManager.functions.restart()` with iframe fallback.
  - `pause`: Synchronizes `emu.togglePlaying()` and `emu.gameManager.functions.toggleMainLoop()` with state tracking.
  - `mute`: Adjusts volume via `emu.setVolume()` and suspends/resumes OpenAL Web Audio context (`emu.Module.AL.currentCtx`).
  - `screenshot`: Direct in-core RetroArch framebuffer extraction via `emu.gameManager.screenshot()` (PNG byte buffer) to prevent black/blank WebGL frames, with `emu.takeScreenshot()` and canvas fallbacks.
  - `settings`: Toggles the glassmorphic in-game retro settings panel (`showSettingsModal`).
  - `saveState` / `loadState`: Reads/writes serialized state snapshots into IndexedDB (`STORES.SAVE_STATES`).
- **Zero-Contention Audio Yield**: Suspends the host application's Web Audio SFX synthesizer context (`sfx.suspendAudio()`) upon mounting `EmulatorModal` and resumes it on exit (`sfx.resumeAudio()`), preventing audio clock sample rate collisions between the host window and the emulator.
- **Event-Driven Controller Hook**: Automatically binds connected USB and Bluetooth gamepads upon initialization and on physical hardware connection events, eliminating recurring interval timers.
- **Controller Exit Bridge**: Detects exit combos (`Select + Start`, `Guide/PS`, `L3 + R3`) directly inside the active iframe and emits `postMessage('RETRO_PLAYER_EXIT_GAME')` to the host window to safely unmount the emulator.
- **Left Stick Analog Fallback**: Automatically translates `LEFT_STICK_X` and `LEFT_STICK_Y` analog movements into D-Pad directional inputs (`UP`, `DOWN`, `LEFT`, `RIGHT`) across all games without nested loop overhead.
- **Diagnostic Engine Timing**: Calculates live frame-to-frame delta times using `requestAnimationFrame` and `performance.now()`, rendering live FPS and frame time metrics updated every 500ms.
- **Clean Teardown & Session Blob Lifecycle**: Dynamically creates a dedicated session Object URL from `game.file` when mounting `EmulatorModal`, ensuring clean teardown (`win.EJS_emulator.destroy()`) and revoking only the active session's Object URL upon unmount.

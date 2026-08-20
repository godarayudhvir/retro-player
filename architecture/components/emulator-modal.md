# Emulator Modal UI Component (`architecture/components/emulator-modal.md`)

## 1. Description
The Emulator Modal UI component ([EmulatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/EmulatorModal.jsx)) renders the hardware-accelerated 60 FPS full-screen retro console overlay, top HUD bar, isolated iframe canvas stage, real-time performance & diagnostic health HUD, and RetroArch control panel integration.

---

## 2. Detailed List of What It Does
- **60 FPS Hardware-Accelerated Container**: Renders fixed overlay `.emulator-backdrop-iisu` with dark background `#090b10`, `contain: layout style paint;`, and `transform: translateZ(0)` to eliminate GPU compositor bottlenecks and maintain a solid 60 FPS / 16.6ms frame rate.
- **Top Responsive Header (`.emulator-topbar`)**: Shows active game title with ellipsis constraints, system badge, offline/CDN indicator, live controller status indicator, real-time FPS badge (`.tag-fps`), Diagnostic Performance HUD toggle (`.emulator-diag-btn`), Extension **Menu** toolbar toggle button (`<Menu size={18} />`), and exit close button (`<X size={18} />`).
- **In-App Extension Toolbar (`.emulator-sub-toolbar`)**: Slide-down action bar featuring Restart (`RotateCcw`), Pause/Resume (`Play`/`Pause`), Mute/Unmute (`Volume2`/`VolumeX`), Instant Lossless Capture (`Camera`), and In-Game Retro Settings (`Sliders`).
- **In-Game Retro Settings & Shader Modal (`.emulator-settings-panel`)**: Toggleable in-game HUD modal providing audio volume slider control, real-time display shaders (Pixel Perfect, CRT Phosphor scanlines, Bilinear Smooth, Vibrant Arcade), Quick Save/Load state actions, battery RAM export (`.sav` download), and keyboard/gamepad shortcut layout reference.
- **Real-Time Performance & Diagnostic Health HUD (`.emulator-diag-panel`)**: Toggleable in-app diagnostic dashboard displaying measured live FPS, delta frame time in milliseconds (`16.6ms` target), Web Audio clock state and sample rate (e.g. `48.0 kHz`), gamepad polling latency, and real-time health diagnostic advice with automated root-cause detection.
- **Instant Lossless PNG Screenshot Capture**: Dual-pipeline capture exporting direct WebGL/2D `<canvas>` buffers as timestamped PNG files with zero frame drops.
- **Distraction-Free Fullscreen Stage**: Full-screen isolated canvas stage without distracting on-canvas floating buttons, supporting CSS-based CRT scanlines and display filters.
- **Mobile Touchscreen Gamepad Viewport Optimization**: The iframe injects viewport-fit metadata and activates touch controls conditionally on mobile touchscreens (`<= 1024px`), avoiding touch DOM overhead on desktop.

---

## 3. Detailed Logic Behind Everything and How It Works
- **60 FPS Core Engine Configuration**: Injects `window.EJS_defaultOptions` with `video_vsync: 'true'`, `video_threaded: 'true'`, `video_max_swapchain_images: '2'`, `audio_sync: 'true'`, `audio_rate_control: 'true'`, and `audio_max_timing_skew: '0.05'` ensuring smooth 60 FPS presentation without audio-induced frame rate halving.
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

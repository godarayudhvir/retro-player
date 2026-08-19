# Emulator Modal UI Component (`architecture/components/emulator-modal.md`)

## 1. Description
The Emulator Modal UI component ([EmulatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/EmulatorModal.jsx)) renders the hardware-accelerated 60 FPS full-screen retro console overlay, top HUD bar, isolated iframe canvas stage, real-time performance & diagnostic health HUD, and RetroArch control panel integration.

---

## 2. Detailed List of What It Does
- **60 FPS Hardware-Accelerated Container**: Renders fixed overlay `.emulator-backdrop-iisu` with dark background `#090b10`, `contain: layout style paint;`, and `transform: translateZ(0)` to eliminate GPU compositor bottlenecks and maintain a solid 60 FPS / 16.6ms frame rate.
- **Top Responsive Header (`.emulator-topbar`)**: Shows active game title with ellipsis constraints, system badge, offline/CDN indicator, live controller status indicator, real-time FPS badge (`.tag-fps`), Diagnostic Performance HUD toggle (`.emulator-diag-btn`), RetroArch control panel **Menu** toggle button (`<Menu size={18} />`), and exit close button (`<X size={18} />`).
- **Real-Time Performance & Diagnostic Health HUD (`.emulator-diag-panel`)**: Toggleable in-app diagnostic dashboard displaying measured live FPS, delta frame time in milliseconds (`16.6ms` target), Web Audio clock state and sample rate (e.g. `48.0 kHz`), gamepad polling latency, and real-time health diagnostic advice with automated root-cause detection.
- **Distraction-Free Fullscreen Stage**: Full-screen isolated canvas stage without distracting on-canvas floating buttons. RetroArch / EmulatorJS's built-in control panel is seamlessly toggled via the clean topbar Menu button or shortcut `M`.
- **Mobile Touchscreen Gamepad Viewport Optimization**: The iframe injects viewport-fit metadata and activates touch controls conditionally on mobile touchscreens (`<= 1024px`), avoiding touch DOM overhead on desktop.

---

## 3. Detailed Logic Behind Everything and How It Works
- **60 FPS Core Engine Configuration**: Injects `window.EJS_defaultOptions` with `video_vsync: 'true'`, `video_threaded: 'true'`, `video_max_swapchain_images: '2'`, `audio_sync: 'true'`, `audio_rate_control: 'true'`, and `audio_max_timing_skew: '0.05'` ensuring smooth 60 FPS presentation without audio-induced frame rate halving.
- **Zero-Contention Audio Yield**: Suspends the host application's Web Audio SFX synthesizer context (`sfx.suspendAudio()`) upon mounting `EmulatorModal` and resumes it on exit (`sfx.resumeAudio()`), preventing audio clock sample rate collisions between the host window and the emulator.
- **Event-Driven Controller Hook**: Automatically binds connected USB and Bluetooth gamepads upon initialization and on physical hardware connection events, eliminating recurring interval timers.
- **Controller Exit Bridge**: Detects exit combos (`Select + Start`, `Guide/PS`, `L3 + R3`) directly inside the active iframe and emits `postMessage('RETRO_PLAYER_EXIT_GAME')` to the host window to safely unmount the emulator.
- **Left Stick Analog Fallback**: Automatically translates `LEFT_STICK_X` and `LEFT_STICK_Y` analog movements into D-Pad directional inputs (`UP`, `DOWN`, `LEFT`, `RIGHT`) across all games without nested loop overhead.
- **Diagnostic Engine Timing**: Calculates live frame-to-frame delta times using `requestAnimationFrame` and `performance.now()`, rendering live FPS and frame time metrics updated every 500ms.
- **Clean Teardown & Session Blob Lifecycle**: Dynamically creates a dedicated session Object URL from `game.file` when mounting `EmulatorModal`, ensuring clean teardown (`win.EJS_emulator.destroy()`) and revoking only the active session's Object URL upon unmount.

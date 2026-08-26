# 🔮 Hardware-Accelerated 3D WebGL2 Upscaling & Custom Shaders

## 1. Description
In browser-based WebAssembly emulation (EmulatorJS / Libretro Wasm), 2D systems (NES, SNES, Genesis, GBA) execute with pixel-accurate fidelity using canvas-level post-processing shaders (CRT, Scanlines, Sharp Bilinear). However, 3D polygonal consoles (**Nintendo DS, Nintendo 64, PlayStation 1, PSP, Sega Dreamcast**) currently run in a **CPU software rasterizer** mode compiled to fixed native framebuffers:
- **Nintendo DS (DeSmuME / melonDS Wasm)**: Fixed native $256 \times 192$ dual-screen software rasterizer.
- **Nintendo 64 (Mupen64Plus-Next Wasm)**: Fixed native $640 \times 480$ software/canvas pipeline.
- **PlayStation 1 (PCSX ReARMed Wasm)**: Fixed native $320 \times 240$ software frame buffer.

Because current public WebAssembly Libretro cores lack compiled WebGL2 / OpenGL ES hardware context bindings in their Emscripten build chains, internal core resolution options (`desmume_internal_resolution`, `mupen64plus-screensize`, `pcsx_rearmed_neon_enhancement_enable`) are ignored by the Wasm binaries.

This milestone defines the architectural requirements, proven reference implementations, and build pipeline necessary to introduce true **hardware-accelerated WebGL2 3D rendering** ($2\times$, $3\times$, $4\times$ internal resolution upscaling, PGXP perspective correction, and geometry anti-aliasing) once upstream Libretro Wasm backends enable WebGL2/GLES3 compilation targets.

---

## 2. Detailed List of What It Will Do
1. **WebGL2 Offscreen Multi-Sampling Render Buffers**:
   - Allocate high-resolution WebGL2 framebuffers ($1280 \times 960$ for 2x HD, $1920 \times 1440$ for 3x Full HD, $3840 \times 2160$ for 4K) directly inside the WebAssembly web-worker execution thread.
2. **True Internal Polygonal Geometry Upscaling**:
   - **Nintendo DS**: Hardware polygon rasterization at $2\times$ ($512 \times 384$) up to $4\times$ ($1024 \times 768$) while preserving crisp 1:1 pixel alignment for 2D UI, text, and touch digitizer overlays.
   - **Nintendo 64**: GlideN64 GLES3 hardware rasterization, 16:9 widescreen geometry frustum clipping, and 3-point bilinear texture filtering.
   - **PlayStation 1**: Hardware rasterization ($2\times$ to $8\times$), PGXP sub-pixel precision (eliminating classic PS1 polygon wobbling/jitter), and 32-bit true color depth.
   - **PSP**: PPSSPP WebAssembly core running hardware-accelerated vertex transform pipelines ($1\times$ to $5\times$ resolution scaling).
3. **Adaptive Performance Guardrails & Telemetry**:
   - Dynamic GPU thermal/framerate monitor that automatically scales down internal multiplier if frame rate drops below 55 FPS or frame time exceeds 18 ms.
   - Real-time resolution multiplier, VSync status, and GPU frame time reported in the in-game Diagnostics HUD.
4. **Zero-Lag UI & Controller Spatial Navigation**:
   - Dedicated in-game quick menu resolution toggle and hot-reloading pipeline with 100% spatial gamepad (D-Pad/Stick) and keyboard navigation.

---

## 3. Detailed Logic Behind It

### Architectural Difference: Software Wasm vs WebGL2 Hardware Wasm

```
CURRENT WASM PIPELINE (Fixed Native Resolution):
┌─────────────────────────────────────────────────────────────┐
│  Libretro Core (Wasm) -> Software Rasterizer (Fixed Buffer) │
│  NDS: 256x192 | N64: 640x480 | PS1: 320x240                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Outputs fixed pixel array)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  HTML5 Canvas 2D / WebGL Post-Processing Shaders            │
│  (CRT Scanlines, Smooth Bilinear, Pixel Perfect Scaling)    │
└─────────────────────────────────────────────────────────────┘

FUTURE HARDWARE WASM PIPELINE (True 3D Polygonal Upscaling):
┌─────────────────────────────────────────────────────────────┐
│  Libretro Core (Wasm + Emscripten GLES3 / WebGL2 Bindings)  │
│  Dynamic Multiplier: 1x (Native), 2x (HD), 3x (FHD), 4x (4K)│
└──────────────────────────────┬──────────────────────────────┘
                               │ (Direct GPU Draw Calls)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Offscreen WebGL2 Framebuffer (1080p/4K 3D Geometry)        │
│  + PGXP Perspective Correction + Texture Filtering          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Composite Viewport Display @ 60.0 FPS                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Reference Implementations & Proven Repositories

| Project | Target System | Key Technical Reference | Repository |
| :--- | :--- | :--- | :--- |
| **`n64wasm`** | Nintendo 64 | Emscripten port of Mupen64Plus + GlideN64 translating RSP/RDP microcode into WebGL2 shader pipelines with full internal scaling. | [roblabla/n64wasm](https://github.com/roblabla/n64wasm) |
| **`mupen64plus-libretro-nx`** | Nintendo 64 | Official Libretro Emscripten target (`platform=emscripten HAVE_GLIDEN64=1 HAVE_GLES3=1`) for building GLES3 WebGL2 cores. | [libretro/mupen64plus-libretro-nx](https://github.com/libretro/mupen64plus-libretro-nx) |
| **`PPSSPP WebAssembly`** | Sony PSP | Official C++ WebAssembly compile targeting WebGL2 with internal resolution scaling from $1\times$ to $5\times$ (4K). | [hrydgard/ppsspp](https://github.com/hrydgard/ppsspp) |
| **`webarcade`** | Multi-system | Production web gaming frontend utilizing custom-compiled WebAssembly Libretro cores with WebGL acceleration and cloud save sync. | [webarcade/webarcade](https://github.com/webarcade/webarcade) |
| **`sm64-wasm`** | N64 (Decompiled) | WebGL GLSL Fast3D shader conversion and native widescreen 16:9 geometry frustum viewport clipping. | Open-source sm64 decompilation web ports |

---

## 5. Detailed Guide of How to Set It Up

### Step 1: Upstream Emscripten Build Toolchain
1. Compile Libretro cores (`melonDS`, `mupen64plus-next`, `beetle-psx-hw`, `ppsspp`) using Emscripten with WebGL2 and threading flags:
   ```bash
   emcc -O3 -s USE_WEBGL2=1 -s FULL_ES3=1 -s WASM_BIGINT=1 -s USE_PTHREADS=1 \
        -s OFFSCREEN_CANVAS=1 -s ALLOW_MEMORY_GROWTH=1 ...
   ```
2. Link against OpenGL ES 3.0 headers (`GLES3/gl3.h`) to route 3D polygon render calls directly to the browser WebGL2 context.

### Step 2: Emulator Bridge Integration (`EmulatorModal.jsx`)
1. Pass WebGL2 context initialization flags and core options into `window.EJS_defaultOptions`:
   ```javascript
   window.EJS_defaultOptions = {
     video_vsync: 'true',
     video_threaded: 'true',
     video_renderer: 'webgl2',
     // Core-specific hardware multipliers:
     'desmume_internal_resolution': '512x384',
     'mupen64plus-screensize': '1280x960',
     'pcsx_rearmed_neon_enhancement_enable': 'enabled'
   };
   ```

### Step 3: UI & Gamepad Integration
1. Persist user preferences in `localStorage` under `retro_3d_resolution_${core}`.
2. Provide in-game resolution cycling via `<button id="ingame-resolution">` with spatial gamepad navigation in `useGamepadNavigation.js`.
3. Display active internal resolution and GPU frame time inside the in-game Diagnostics panel.

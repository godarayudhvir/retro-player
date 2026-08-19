# DemoWelcomeModal Component Specification

## 1. Description

The `DemoWelcomeModal` component (`.demo-modal-backdrop` + `.demo-modal-content`) is an intelligent environment-aware dialog displayed exclusively when the **Retro Player** web application is hosted on static CDN environments (such as **GitHub Pages** `https://godarayudhvir.github.io/retro-player/` or URLs with `?demo=true`).

When the application is self-hosted with Docker Compose, Node.js (`server.js`), or custom domains, the component evaluates `isGitHubPagesDemo = false` and remains completely hidden.

---

## 2. Detailed List of What It Does

- **Environment Detection Engine**:
  - Checks if `window.location.hostname.endsWith('github.io')` or `window.location.search.includes('demo=true')`.
  - Checks `localStorage.getItem('retro_demo_dismissed')` to avoid prompting returning visitors.
- **Showcase Feature Transparency**:
  - Highlights full 60 FPS client-side WebAssembly emulation across all 10+ console cores.
  - Informs players about 100% private local custom ROM testing via the topbar **Load Custom ROM** button and drag-and-drop.
  - Explains the 1-click PWA standalone console installation on desktop and mobile.
- **Static Hosting Limitations Notice**:
  - Clearly explains that server host disk storage operations (`/api/upload-rom` and `/api/delete-rom` in Settings) are disabled on static CDNs, directing self-hosters to the GitHub Docker Compose setup.
- **Full Theme & Responsive Fidelity**:
  - Responsive across mobile portrait/landscape, desktop, and large displays.
  - Seamlessly adapts across all console themes (iiSU Light, Midnight Cyber, Sony XMB, DMG).
- **100% Gamepad & Keyboard Navigation**:
  - Mapped to spatial navigation zone `demoModal`.
  - Supports <kbd>Enter</kbd> / <kbd>A</kbd> button for instant play and <kbd>Esc</kbd> / <kbd>B</kbd> for dismissal.

---

## 3. Props & Component State

### Props:
- `sfx` (Object): Web Audio synthesizer SFX suite (`playModalOpen`, `playModalClose`).
- `focusedTarget` (Object): Spatial navigation focus coordinate (`zone: 'demoModal'`, `id: 'dismiss' | 'github' | 'close'`).
- `setFocusedTarget` (function): Updates active spatial focus.

### Source Location:
- Component: [src/components/DemoWelcomeModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/DemoWelcomeModal.jsx)

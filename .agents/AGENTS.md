# Project Rules & Guidelines

1. Whenever preparing or executing a git commit requested by the user, cross-check and update all relevant markdown documentation based strictly on the committed code changes:
   - Achievements / Pokémon Save Inspector changes -> update [guides/achievements.md](file:///Users/godarayudhvir/Github/retro-player/guides/achievements.md)
   - Save / Battery SRAM / Save State changes -> update [guides/save-states.md](file:///Users/godarayudhvir/Github/retro-player/guides/save-states.md)
   - Docker / Server / Deployment changes -> update [guides/docker.md](file:///Users/godarayudhvir/Github/retro-player/guides/docker.md) and [guides/hosting.md](file:///Users/godarayudhvir/Github/retro-player/guides/hosting.md)
   - ROM Ingestion / Scraping / Sidecar metadata changes -> update [guides/roms.md](file:///Users/godarayudhvir/Github/retro-player/guides/roms.md)
   - Input / Controller / Hotkey / Keyboard changes -> update [guides/controls.md](file:///Users/godarayudhvir/Github/retro-player/guides/controls.md)
   - UI Layout / Responsive Breakpoints / Viewport changes -> update [guides/device-matrix.md](file:///Users/godarayudhvir/Github/retro-player/guides/device-matrix.md)
   - General features, highlights, and platform stats -> update [README.md](file:///Users/godarayudhvir/Github/retro-player/README.md) and [public/llms.txt](file:///Users/godarayudhvir/Github/retro-player/public/llms.txt)
   - Completed `mirai/` roadmap features -> remove completed items from [mirai/README.md](file:///Users/godarayudhvir/Github/retro-player/mirai/README.md) and delete their completed spec files from `mirai/`. Do NOT add completed features to `mirai/` — `mirai/` is strictly a backlog for future/planned milestones.
   - **New Feature / Subsystem Guides**: If code changes introduce an entirely new subsystem, major architectural feature, or capability that might warrant a brand-new guide in `guides/`, always proactively ask the user first before creating the file, suggest the proposed title and scope, and obtain the user's explicit permission before creating any new markdown document.
2. Never use automated browser testing tools like Playwright or subagent browser execution for testing. The user will handle all manual browser testing personally.
3. Ensure the entire application (every view, modal, wizard, button, and interactive component) is 100% navigable and controllable via both keyboard navigation (Arrow keys, Enter, Esc, Tab, Hotkeys) and USB/Bluetooth gamepads (D-Pad, Analog sticks, A/B/X/Y, L1/R1, Start/Select).
4. Never use native browser dialog popups (`alert()`, `confirm()`, `prompt()`). All user confirmations, alerts, warnings, and prompts MUST use custom styled in-app modal dialogs or status banners that match the console theme and support 100% keyboard and gamepad spatial navigation.
5. Ensure every page, module, modal, wizard, and component is 100% responsive and adaptive across all form factors and resolutions with zero modal overflow, unstyled elements, or cut-off actions. Strictly adhere to the target viewports, breakpoints, and layout specifications detailed in [guides/device-matrix.md](file:///Users/godarayudhvir/Github/retro-player/guides/device-matrix.md).
6. When the user asks a question, always provide a direct, informative answer first. Never proactively execute code edits or modifications when answering a question. Always explain clearly what actions and changes you intend to perform, and obtain the user's explicit permission/approval before proceeding with execution.
7. Never execute `git commit` or `git push` unless the user specifically and explicitly requests you to commit or push in their prompt. Whenever executing a git commit requested by the user, always format the commit with a concise title and a comprehensive multi-line description detailing the exact changes and rationale (e.g. `git commit -m '<type>(<scope>): <summary>' -m '- <detail 1>' -m '- <detail 2>'`). Never push any commits without the user's explicit request and approval.
8. Never use generic AI design clichés and tropes. Never include floating pill badges with sparkles/stars/emojis above headings (e.g. `✨ FEATURE NAME`, `✨ LIVE DEMO`, `✨ EMULATION STATION`), cheesy multi-color gradient buzzwords in headings, or generic SaaS marketing filler. Always build bespoke, authentic, human-crafted interfaces with clean typography, purposeful visual hierarchy, and genuine console-grade craftsmanship.
9. Never execute `npm run build` or production bundling commands on your own unless the user explicitly requests you to build or validate via build in their prompt.
10. Ensure Tri-Environment Universal Compatibility for every feature and modification. Every new or updated capability, API endpoint, asset path, and configuration MUST operate seamlessly across all 3 deployment environments:
    - **Local Development**: `http://localhost:3000` via Vite dev server (`vite.config.js`).
    - **Docker / Self-Hosted Production**: `http://<server-ip>:3000` via Express runtime (`server.js` and `Dockerfile`).
    - **GitHub Pages / Static Hosting**: `https://<user>.github.io/<repo>/` with subpath base routing (`./` or `/<repo>/`).
    **Mandatory Engineering Checkpoints**:
    - **Dual Server Middleware Parity**: Any API route, WebSocket, or backend handler added to `server.js` MUST also be mirrored in `vite.config.js` (`server.middlewares`) so it functions in `npm run dev`.
    - **Docker Multi-Stage Runtime Parity**: Any new server helper, backend module, or runtime asset directory (e.g. `src/server/`, `data/`, `public/`) MUST be copied to the `runner` stage in [Dockerfile](file:///Users/godarayudhvir/Github/retro-player/Dockerfile).
    - **Subpath-Aware URL & Asset Resolution**: All asset URLs, cover art paths, audio links, and API fetches MUST be subpath-aware so they never 404 when hosted on a repository subpath (e.g. GitHub Pages) vs domain root (e.g. localhost/Docker).
11. **Release Version Synchronization & Verification**:
    Whenever preparing or executing a release commit or version bump requested by the user, **always** execute the automated version synchronization script (`node .agents/skills/release-version/scripts/bump_version.js <version>`) and run a strict codebase grep verification to guarantee that **every** version touchpoint across the entire project is 100% updated with zero stale version references:
    - `package.json` & `package-lock.json`
    - `public/sw.js` (`CACHE_NAME`)
    - `public/manifest.webmanifest`
    - `src/components/AboutInfoModal.jsx` (`.info-version-badge`)
    - `src/components/MobileAppView.jsx` (all `.info-version-badge` instances)
    - `public/llms.txt`
    - `README.md` (Version status badge)
    - Cover showcase images (`home.webp` -> `public/og-image.webp` & `public/screenshots/desktop-1.webp`)
    - [Dockerfile](file:///Users/godarayudhvir/Github/retro-player/Dockerfile) (Multi-stage runner runtime directory parity verification)


# Full-Screen Onboarding Screen Component Specification (`OnboardingScreen.jsx`)

## Domain & Scope
The `OnboardingScreen` component provides a modern, streamlined 2-step full-screen responsive onboarding and character creation walkthrough for both Desktop and Mobile devices. Built on research and best practices from Mobbin's analysis of high-converting onboarding flows, it prioritizes selling the outcome and enabling Pokémon-style player character setup.

---

## Architectural Principles
1. **Outcome-Driven Value Pitch**: Slide 1 presents a clean, spacious 3-card showcase: (1) 12 Handheld & Home Consoles with embedded platform badges (GBA, SNES, N64, PS1, NDS, Genesis, NES, GBC, Arcade), (2) 100% Private Client-Side Saves & Multiavatar Profiles, and (3) Universal Gamepad Navigation & Web Audio SFX / BGM. When installable, an optional standalone PWA card or Safari Dock/Home Screen guidance is cleanly displayed.
2. **Multiavatar Interactive Player Passport**: Slide 2 allows players to name their character, pick or customize their Multiavatar avatar seed (with instant live SVG preview, dice randomize, and presets), and choose a signature accent color directly inside the onboarding flow.
3. **Universal Spatial & Gamepad Navigation**: Full D-pad and keyboard arrow support for progressing through slides, customizing avatars, and launching games with direct local execution.

---

## Props Interface
```typescript
interface OnboardingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  activeProfile: UserProfile;
  onSaveCreatedProfile: (name: string, avatarSeed: string, favoriteColor: string) => void;
  sfx: SoundEffectsManager;
  pwa?: PwaInstallManager;
}
```

---

## Persistence & Storage Keys
- `localStorage.getItem('retro_onboarding_completed')`: Tracks whether the user has completed the onboarding flow.
- `localStorage.getItem('retro_demo_dismissed')`: Synchronized with demo environment disclaimers.

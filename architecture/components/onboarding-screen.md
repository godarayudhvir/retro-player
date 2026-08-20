# Full-Screen Onboarding Screen Component Specification (`OnboardingScreen.jsx`)

## Domain & Scope
The `OnboardingScreen` component provides a modern, full-screen, responsive onboarding and personalization walkthrough for both Desktop and Mobile devices. Built on research and best practices from Mobbin's analysis of high-converting onboarding flows, it prioritizes selling the outcome, personalizing the retro experience, enabling Pokémon-style player character setup, and providing essential game exit pro-tips.

---

## Architectural Principles
1. **Outcome-Driven Value Pitch**: Slide 1 emphasizes WebAssembly performance, zero-install instant play, 10+ legendary console platforms, and 100% client-side privacy.
2. **Interactive Platform Personalization**: Slide 2 allows users to select and prioritize their favorite console platforms and retro eras, automatically pinning them to the front of their feed.
3. **Pokémon-Style Interactive Player Passport**: Slide 3 allows players to name their character and customize their Nintendo Mii avatar (hairstyle, skin tone, facial features, shirt color, and live preview) directly inside the onboarding flow.
4. **Essential Game Controls & Exit Combos**: Slide 4 features controller game exit instructions (**L3 + R3** / **Select + Start**), touchpad mouse pointer guidance, and universal keyboard shortcuts.
5. **Universal Spatial & Gamepad Navigation**: Full D-pad and keyboard arrow support for progressing through slides, selecting chips, and launching games with 0ms lag.

---

## Props Interface
```typescript
interface OnboardingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  systems: SystemDefinition[];
  activeProfile: UserProfile;
  onSaveCreatedProfile: (name: string, miiData: MiiData, favoriteColor: string) => void;
  sfx: SoundEffectsManager;
}
```

---

## Persistence & Storage Keys
- `localStorage.getItem('retro_onboarding_completed')`: Tracks whether the user has completed the onboarding flow.
- `localStorage.getItem('retro_favorite_systems')`: Stores selected favorite consoles for dashboard ordering.
- `localStorage.getItem('retro_demo_dismissed')`: Synchronized with demo environment disclaimers.

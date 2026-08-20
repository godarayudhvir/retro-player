# Full-Screen Onboarding Screen Component Specification (`OnboardingScreen.jsx`)

## Domain & Scope
The `OnboardingScreen` component provides a modern, streamlined 3-step full-screen responsive onboarding and character creation walkthrough for both Desktop and Mobile devices. Built on research and best practices from Mobbin's analysis of high-converting onboarding flows, it prioritizes selling the outcome, enabling Pokémon-style player character setup, and providing essential game exit pro-tips.

---

## Architectural Principles
1. **Outcome-Driven Value Pitch**: Slide 1 emphasizes WebAssembly performance, zero-install instant play, 10+ legendary console platforms, and 100% client-side privacy.
2. **Pokémon-Style Interactive Player Passport**: Slide 2 allows players to name their character and customize their Nintendo Mii avatar (hairstyle, skin tone, facial features, shirt color, and live preview) directly inside the onboarding flow.
3. **Essential Game Controls & Exit Combos**: Slide 3 features controller game exit instructions (**L3 + R3** / **Select + Start**), touchpad mouse pointer guidance, and universal keyboard shortcuts.
4. **Universal Spatial & Gamepad Navigation**: Full D-pad and keyboard arrow support for progressing through slides, customizing avatars, and launching games with 0ms lag.

---

## Props Interface
```typescript
interface OnboardingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  activeProfile: UserProfile;
  onSaveCreatedProfile: (name: string, miiData: MiiData, favoriteColor: string) => void;
  sfx: SoundEffectsManager;
}
```

---

## Persistence & Storage Keys
- `localStorage.getItem('retro_onboarding_completed')`: Tracks whether the user has completed the onboarding flow.
- `localStorage.getItem('retro_demo_dismissed')`: Synchronized with demo environment disclaimers.

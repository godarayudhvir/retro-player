# Full-Screen Onboarding Screen Component Specification (`OnboardingScreen.jsx`)

## Domain & Scope
The `OnboardingScreen` component provides a modern, full-screen, responsive onboarding and personalization walkthrough for both Desktop and Mobile devices. Built on research and best practices from Mobbin's analysis of high-converting onboarding flows, it prioritizes selling the outcome, personalizing the retro experience, enabling user profile management, and providing quick pro-tips.

---

## Architectural Principles
1. **Outcome-Driven Value Pitch**: Slide 1 emphasizes WebAssembly performance, zero-install instant play, 10+ legendary console platforms, and 100% client-side privacy.
2. **Interactive Personalization**: Slide 2 allows users to select and highlight their favorite console platforms and retro eras.
3. **Comprehensive Profile & Mii Management**: Slide 3 integrates profile selection, Mii avatar customization studio launch, and player editing/deletion across mobile and desktop.
4. **Quick Guidance**: Slide 4 showcases plug-and-play gamepad auto-detection, keyboard shortcuts, and instant SRAM save persistence.
5. **Universal Spatial & Gamepad Navigation**: Full D-pad and keyboard arrow support for progressing through slides, selecting chips, and launching games with 0ms lag.

---

## Props Interface
```typescript
interface OnboardingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  systems: SystemDefinition[];
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onCreateNewProfile: () => void;
  onEditProfile: (profile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  sfx: SoundEffectsManager;
  focusedTarget: FocusTarget;
  setFocusedTarget: (target: FocusTarget) => void;
  gamepadConnected?: boolean;
}
```

---

## Persistence & Storage Keys
- `localStorage.getItem('retro_onboarding_completed')`: Tracks whether the user has completed the onboarding flow.
- `localStorage.getItem('retro_demo_dismissed')`: Synchronized with demo environment disclaimers.

# Mobile Experience Architecture Specification (`MobileAppView.jsx`)

## Overview
The `MobileAppView` component delivers a dedicated, streaming-app inspired (Netflix / Switch style) mobile experience specifically tailored for smartphones and compact touch devices (<= 768px). It leaves tablet, desktop, and 10-foot TV UI modes completely unaffected while streamlining mobile interactions into a clean, modern, light-themed gaming feed.

---

## Architectural Principles

1. **Initial Profile Gateway ("Who's Playing?")**:
   - When opened on mobile, the app presents a clean profile chooser with Mii avatar circles.
   - Once selected, the user seamlessly enters the primary catalog feed with their scoped favorites, recently played list, and playtime tracking.
   - The user can switch profiles at any time by tapping their avatar in the mobile topbar.

2. **Streamlined Mobile Topbar**:
   - **Profile Icon** (left): Displays active Mii avatar; tapping opens profile switcher.
   - **Search Bar Widget** (center): Real-time search with instant game card filtering.
   - **Load ROM Button** (right): Quick button to open local file picker for custom ROMs.

3. **Streaming-Style Horizontal Feed**:
   - **Recently Played**: Horizontal carousel of recently launched titles with playtime tracking.
   - **Favorites**: Horizontal carousel of starred titles.
   - **Platforms & Systems**: Interactive system chips showing game counts and custom platform icons.
   - **Per-System Carousels**: Dedicated horizontal rows for each system (GBA, SNES, N64, NES, Genesis, etc.) with a "See All" drill-down trigger.

4. **Drill-Down System View**:
   - Tapping "See All" or a system chip displays a dedicated grid of all ROMs in that system with an instant back button to return to the main feed.

5. **Streamlined Game Detail Bottom Sheet**:
   - Tapping any game opens a clean bottom drawer displaying high-res box art, platform badge, release year, core, and game synopsis.
   - Contains only two focused actions:
     - **Play Game**: Launches the emulator immediately.
     - **Favorite**: Stars or unstars the game.

6. **Light Theme & Silent Background Services**:
   - Standardizes on a clean Light Theme (`data-theme="classic-light"`) for maximum readability on small screens.
   - BGM audio, SFX synthesizer, and online scraper operate seamlessly in the background without UI clutter.

---

## Component Interface

```typescript
interface MobileAppViewProps {
  games: Game[];
  systems: System[];
  activeProfile: Profile;
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateNewProfile: () => void;
  favorites: string[];
  recentlyPlayed: RecentItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  getGameStats: (id: string) => GameStats;
  onPlayGame: (game: Game) => void;
  metadataMap: Record<string, GameMetadata>;
  onCustomRomLoad: (file: File) => void;
  sfx: WebAudioSfx;
}
```

# User Profiles & Multiavatar System (`architecture/modules/user-profiles.md`)

## 1. Description
The **User Profiles & Multiavatar System** introduces multi-user profile management inspired by Netflix, Prime Video, and modern gaming consoles. Players can create customized multicultural vector avatars via **[Multiavatar](https://multiavatar.com/)** with 12 billion unique combinations, choose signature accent colors, and maintain fully isolated gaming profiles with independent Favorites, Recently Played history, and Playtime analytics.

---

## 2. Detailed List of What It Does
- **Netflix / Nintendo Switch Style "Who's Playing?" Selector (`ProfileSelectModal.jsx`)**:
  - Fullscreen profile selection modal displaying large animated Multiavatar avatars, profile names, and active status indicators.
  - "Add Profile" card with styled dashed circular button triggering the interactive creator.
  - Console-grade "Manage Profiles" / "Done Editing" action pill button supporting all color themes (Classic, Midnight, Cyber, XMB).
  - 100% responsive layout across mobile phones (<=640px), tablets (641px - 1024px), desktop PCs, and large TVs (1601px+).
- **Multiavatar Profile Creator Studio (`ProfileCreatorModal.jsx`)**:
  - Live vector avatar rendering stage that morphs in real-time as the user types their name or avatar seed.
  - "Randomize / Roll Dice" button for instant avatar seed generation.
  - Curated seed presets gallery (e.g., Mario, Zelda, Link, Samus, Sonic, Pixel Knight, Cyber Ninja, Cosmic Pilot).
  - Profile accent color palette swatches (10+ vibrant console colors).
  - 100% Keyboard and Gamepad spatial navigation.
- **Deterministic Vector Multiavatar Component (`MultiAvatar.jsx`)**:
  - Pure SVG vector rendering powered by `@multiavatar/multiavatar` running 100% locally and offline in the browser.
  - Scalable from 36px topbar badges up to 140px avatar creation stages.
- **Topbar Profile Switcher**:
  - Topbar renders the active user's custom Multiavatar avatar and player name.
  - Clicking the avatar or user tag immediately opens the "Who's Playing?" profile selector.
- **Isolated Storage Namespaces**:
  - Automatically scopes `favorites`, `recentlyPlayed`, and `playtimeStats` to the active profile ID in IndexedDB.

---

## 3. Detailed Logic Behind Everything and How It Works

### Hook Management (`useProfileManager.js`)
- `profiles`: Array of profile objects containing `id`, `name`, `avatarSeed`, `favoriteColor`, and `created`.
- `activeProfileId`: Current active profile ID persisted in `retro_player_active_profile_id`.
- `createProfile(name, avatarSeed, favoriteColor)`: Generates a unique profile and activates it immediately in IndexedDB.
- `updateProfile(profileId, updates)`: Updates name, avatar seed, or favorite color.
- `deleteProfile(profileId)`: Deletes specified profile while ensuring at least one profile remains.
- `switchProfile(profileId)`: Transitions active user and triggers smooth data re-scoping.

### Data Isolation (`usePlaytimeAndFavorites.js`)
- Automatically generates keys: `${FAVORITES_KEY}_${activeProfileId}`, `${RECENTS_KEY}_${activeProfileId}`, and `${PLAYTIME_KEY}_${activeProfileId}`.
- Re-syncs internal state on `activeProfileId` changes, guaranteeing isolated saves and history per player.

### Source Locations
- Profile Hook: [src/hooks/useProfileManager.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useProfileManager.js)
- MultiAvatar Component: [src/components/MultiAvatar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/MultiAvatar.jsx)
- Profile Selector: [src/components/ProfileSelectModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ProfileSelectModal.jsx)
- Profile Creator Wizard: [src/components/ProfileCreatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ProfileCreatorModal.jsx)

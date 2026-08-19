# User Profiles & Nintendo Mii Avatar System (`architecture/modules/user-profiles.md`)

## 1. Description
The **User Profiles & Nintendo Mii Avatar System** introduces multi-user profile management inspired by Netflix, Prime Video, and the Nintendo Switch. Players can create customized Nintendo Mii style vector avatars, choose signature colors, and maintain fully isolated gaming profiles with independent Favorites, Recently Played history, and Playtime analytics.

---

## 2. Detailed List of What It Does
- **Netflix / Nintendo Switch Style "Who's Playing?" Selector (`ProfileSelectModal.jsx`)**:
  - Fullscreen profile selection modal displaying large animated Mii avatars, profile names, and active status indicators.
  - "Add Profile" card with styled dashed circular button triggering the interactive creator.
  - Console-grade "Manage Profiles" / "Done Editing" action pill button supporting all color themes (Classic, Midnight, Cyber, XMB).
  - 100% responsive layout across mobile phones (<=640px), tablets (641px - 1024px), desktop PCs, and large TVs (1601px+).
- **Nintendo Mii Avatar Studio Wizard (`MiiCreatorModal.jsx`)**:
  - Live vector avatar rendering stage that reacts immediately to customizer controls.
  - Head & Face customization (Face shapes: Round, Oval, Square, Soft/Cute; 8+ Skin tones).
  - Hairstyle & Hair color customizers (10+ Colors, Parted, Anime Bangs, Curly Wave, Nintendo Cap, Ponytail, Clean Cut).
  - Eye shapes, eye colors, eyebrows, noses, and mouth expressions (Smile, Open Joy, Smirk, Calm).
  - Style & Accessories (Classic frames, Gold rounds, 80s Cool Shades, Mario Mustaches, Goatees, and 10+ Favorite Shirt colors).
  - Quick Nintendo Presets (Mario, Luigi, Peach, Link).
  - "Surprise Me / Randomize" dice generator for rapid character creation.
- **Dynamic Vector Mii Component (`MiiAvatar.jsx`)**:
  - Pure SVG vector rendering with gradient badge borders, soft shadows, layered eyes, hair geometry, and favorite color shirts.
  - Scalable from 36px topbar badges up to 160px avatar creation stages.
- **Topbar Profile Switcher**:
  - Topbar renders the active user's custom Mii avatar and player name.
  - Clicking the avatar or user tag immediately opens the "Who's Playing?" profile selector.
- **Isolated Storage Namespaces**:
  - Automatically scopes `favorites`, `recentlyPlayed`, and `playtimeStats` to the active profile ID (e.g. `retro_player_favorites_${profileId}`).

---

## 3. Detailed Logic Behind Everything and How It Works

### Hook Management (`useProfileManager.js`)
- `profiles`: Array of profile objects containing `id`, `name`, `favoriteColor`, `miiData`, and `created`.
- `activeProfileId`: Current active profile ID persisted in `retro_player_active_profile_id`.
- `createProfile(name, miiData, favoriteColor)`: Generates a unique profile and activates it immediately.
- `updateProfile(profileId, updates)`: Updates name, favorite color, or facial features.
- `deleteProfile(profileId)`: Deletes specified profile while ensuring at least one profile remains.
- `switchProfile(profileId)`: Transitions active user and triggers smooth data re-scoping.

### Data Isolation (`usePlaytimeAndFavorites.js`)
- Automatically generates keys: `${FAVORITES_KEY}_${activeProfileId}`, `${RECENTS_KEY}_${activeProfileId}`, and `${PLAYTIME_KEY}_${activeProfileId}`.
- Re-syncs internal state on `activeProfileId` changes, guaranteeing isolated saves and history per player.

### Source Locations
- Profile Hook: [src/hooks/useProfileManager.js](file:///Users/godarayudhvir/Github/retro-player/src/hooks/useProfileManager.js)
- Mii Component: [src/components/MiiAvatar.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/MiiAvatar.jsx)
- Profile Selector: [src/components/ProfileSelectModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/ProfileSelectModal.jsx)
- Mii Wizard: [src/components/MiiCreatorModal.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/MiiCreatorModal.jsx)

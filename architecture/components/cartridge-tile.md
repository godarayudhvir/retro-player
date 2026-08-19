# CartridgeTile Component Specification

## 1. Description

The `CartridgeTile` component renders an authentic 3D physical retro game cartridge tile with tactile skeuomorphism, dynamic plastic shell colors, side grips, an embossed brand stadium capsule, a recessed sticker label with metallic sheen reflection, fallback icon handlers, and a bottom notch arrow.

---

## 2. Detailed List of What It Does

- **Physical 3D Cartridge Shell (`.cartridge-shell`)**: CSS transform and drop shadow mimicking a Game Boy / classic cartridge body.
- **Dynamic Color Mapping (`--cart-color`)**: Heuristic color assignment via `getCartridgeColor(game)` matching game titles (e.g. *Pokémon Emerald* -> `#059669`, *Ruby* -> `#e11d48`, *FireRed* -> `#dc2626`, *Sapphire* -> `#1d4ed8`, *Gold* -> `#d97706`) and system themes.
- **Embossed Header & Grip Ribs (`.cartridge-header`)**: Dual side grip ribs (`.cartridge-grips.left` / `.right`) and recessed stadium pill with embossed platform branding text.
- **Recessed Sticker Label (`.cartridge-sticker-area`)**: Renders high-res box art, an animated gloss sheen gradient (`.cartridge-label-sheen`), and fallback system icon in case of missing art.
- **Favorite Star Badge (`.cartridge-favorite-badge`)**: Displays a golden star badge (`⭐`) on favorited cartridges.
- **Focus Indicator (`.gamepad-focused`)**: Prominent glowing focus ring for controller, touchscreen, and keyboard navigation.

---

## 3. Detailed Logic Behind Everything and How It Works

### Props & Structure
- `game` (Object): Metadata object containing `id`, `title`, `coverUrl`, `systemName`, `systemColor`, `systemIcon`.
- `isFocused` (boolean): Applies `.gamepad-focused` CSS class when active.
- `isFavorite` (boolean): Conditionally renders `.cartridge-favorite-badge`.
- `onClick` (function): Selects the cartridge and opens the game detail drawer.

### Source Location
- Component: [src/components/CartridgeTile.jsx](file:///Users/godarayudhvir/Github/retro-player/src/components/CartridgeTile.jsx)
- Utility: [src/utils/cartridgeColors.js](file:///Users/godarayudhvir/Github/retro-player/src/utils/cartridgeColors.js)

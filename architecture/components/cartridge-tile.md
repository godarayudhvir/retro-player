# CartridgeTile Component Specification

## 1. Description

The `CartridgeTile` component renders an authentic 3D physical retro game cartridge tile with tactile skeuomorphism, dynamic plastic shell colors, side grips, an embossed brand stadium capsule, a recessed sticker label with metallic sheen reflection, fallback icon handlers, and a bottom notch arrow.

---

## 2. Detailed List of What It Does

- **Pure Cover Poster View (`.cover-poster-tile`)**: When viewing the unified "All Games" library (`activeSystem === 'all'`), cartridge plastic shells are omitted in favor of clean high-resolution box art posters with platform tag badges, glossy sheen reflection, and fallback gradient cards.
- **Arcade & MAME Cabinet Flyer Mode (`.arcade-poster-tile`)**: Arcade and MAME games completely omit all console cartridge shells and plastic notches in favor of clean arcade marquee flyer cards with amber neon focus rings and arcade badges.
- **Physical 3D Cartridge Shell (`.cartridge-shell`)**: When viewing dedicated console channels (NES, SNES, N64, GBA, NDS, Genesis, GB, GBC, Atari, etc.), renders authentic skeuomorphic physical cartridge bodies.
- **Dedicated Authentic NES Cartridge Geometry (`.cartridge-shell-nes`)**: Accurately reproduces the iconic NES cartridge anatomy:
  - Matte textured grey plastic casing (`#8c8c91`) with top lip edge.
  - Left vertical ribbed grip column with stepped top relief and 13 horizontal relief grooves.
  - Right-aligned vertical sticker label with custom artwork or stylized vintage Nintendo Seal fallback.
  - Molded downward insertion arrow (`▼`) underneath the sticker label.
  - Stepped bottom connector notches on left and right corners.
- **Dedicated Authentic Super Nintendo (SNES) Cartridge Geometry (`.cartridge-shell-snes`)**: Accurately reproduces the iconic North American 16-bit SNES cartridge anatomy:
  - Wide horizontal light/lilac grey casing (`#94909c`).
  - Left and right flanking wings with 5 horizontal relief ribs and bottom screw dots.
  - Raised center face featuring the wide horizontal sticker label with left license band and right red Super Nintendo logo.
  - Lower recessed thumb insertion pocket with center ramp.
- **Dedicated Authentic Nintendo 64 (N64) Cartridge Geometry (`.cartridge-shell-n64`)**: Accurately reproduces the iconic 64-bit N64 cartridge anatomy:
  - Broad continuous top dome arch with recessed parting line and matte slate grey casing (`#8e92a2`).
  - Flanking grip wings with top vertical parting seams and bottom 30% stepped notch cut-ins.
  - Arched top recessed sticker well matching the shell's top curvature.
  - Authentic bottom footer overlay strip with gold circular Nintendo Seal, red oval Nintendo badge with NUS model code (`NUS-006`), and 3D Nintendo 64 logo card.
- **Dedicated Authentic PlayStation 1 (PS1) CD Jewel Case (`.cartridge-shell-psx`)**: Accurately reproduces the iconic obsidian black CD jewel case anatomy:
  - Classic jet-black jewel case outer casing and ribbed tray backing with subtle glass reflection edges and left hinge slots.
  - Paper booklet insert with the iconic black left vertical "PlayStation" spine stripe.
  - Four-color PlayStation logo (red/yellow/cyan/green) in top-left corner and region badge.
  - Mini ESRB rating and SLUS catalog serial number (`SLUS-xxxxx`) at the bottom of the spine.
  - Dynamic acrylic glass diagonal glare reflection across the front cover.
- **Dedicated Authentic Game Boy Advance (GBA) Cartridge Geometry (`.cartridge-shell-gba`)**: Accurately reproduces the iconic GBA cartridge anatomy:
  - Wider horizontal form factor with top shoulder ears and concave thumb grip arch.
  - Embossed "GAME BOY ADVANCE" relief banner across the upper grip.
  - Wide horizontal recessed sticker label with smooth 6px corner radii and gloss reflection sheen.
  - Authentic cartridge colors (Emerald Green, Ruby Red, Sapphire Blue, FireRed, LeafGreen, Charcoal) mapped to title keywords.
- **Dedicated Authentic Nintendo DS (NDS) Cartridge / Card Geometry (`.cartridge-shell-nds`)**: Accurately reproduces the iconic NDS card anatomy:
  - Compact square/vertical profile with dark matte charcoal plastic casing (`#38383e`).
  - Smooth curved side grip notches on left and right edges.
  - Official top white/silver header band with iconic "NINTENDO DS™" dual-screen typography.
  - Authentic bottom footer band with NTR serial codes (e.g. `NTR-AMCE-USA`).
  - Lower shelf with left-hand alignment key chamfer notch.
- **Dedicated Authentic Sega Genesis / Mega Drive Cartridge Geometry (`.cartridge-shell-genesis`)**: Accurately reproduces the iconic Sega 16-bit cartridge anatomy:
  - Deep obsidian textured black shell (`#1a1a1d`) with rounded top arch crest.
  - Dual vertical grip pillars along left and right flanks with 9 horizontal relief ridges.
  - Recessed central label with gloss reflection sheen.
  - Iconic bottom brand capsule with white/blue "SEGA GENESIS" stadium wordmark.
- **Dedicated Authentic Game Boy (GB) & Game Boy Color (GBC) Cartridge Geometry (`.cartridge-shell-gb`)**: Accurately reproduces the iconic 8-bit DMG & GBC cartridge anatomy:
  - Top-right corner interlock power switch notch with flanking 6-rib horizontal shoulder grips.
  - Concentric outer stadium groove enclosing the recessed pill with embossed "Nintendo GAME BOY™" / "GAME BOY COLOR™" branding.
  - Recessed square sticker label with left vertical DMG catalog serial (`DMG-APCE-USA`) and right vertical `THIS SIDE OUT` spine stripe.
  - Deep molded downward insertion arrow (`▼`) molded below the label.
  - Dynamic cartridge colors (DMG Grey, Pokémon Red, Blue, Yellow, Gold, Silver, Crystal, etc.).
- **Dedicated Authentic Sega Game Gear Cartridge Geometry (`.cartridge-shell-gamegear`)**: Accurately reproduces the iconic Game Gear handheld cartridge anatomy:
  - Deep slate/charcoal black casing (`#202026`) with top grip brow, 7 tactile grip dots, and dual horizontal relief grooves.
  - Flanking curved side guide rails that step down midway.
  - Recessed sticker label with left vertical red "GAME GEAR™" spine stripe.
  - Embossed "SEGA" stadium pill engraved into the lower chin.
- **Dedicated Authentic Atari 2600 Cartridge Geometry (`.cartridge-shell-atari`)**: Accurately reproduces the iconic Atari VCS cartridge anatomy:
  - Chunky, thick matte black outer bezel casing (`#141417`).
  - Left vertical spine slot displaying the game title.
  - Classic vintage Atari label layout with "game program™" subtitle, bold stylized title, and "Use with Joystick Controllers" text.
  - Central illustrative artwork card with rounded corners.
  - Iconic vintage Atari Fuji logo and CX catalog serial number footer.
- **Dynamic Color Mapping (`--cart-color`)**: Heuristic color assignment via `getCartridgeColor(game)` matching game titles (e.g. *Pokémon Emerald* -> `#059669`, *Ruby* -> `#e11d48`, *FireRed* -> `#dc2626`, *Sapphire* -> `#1d4ed8`, *Gold* -> `#d97706`) and system themes.
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

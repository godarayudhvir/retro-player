# Game Card UI Grid Component (`architecture/components/game-card.md`)

## 1. Description
The Game Card component within [App.jsx](file:///Users/godarayudhvir/Projects/retro-player/src/App.jsx) renders individual interactive retro game tiles within the main launcher grid.

---

## 2. Detailed List of What It Does
- **Cover Artwork Display**: Renders game artwork or fallback retro placeholder with system logo.
- **Cartridge Visual Accents**: Applies dynamic top border cartridge colors (`getCartridgeColor(game)`).
- **Interactive Badges**: Renders system platform badge, save state indicator badge (`<Save size={12} />`), and release date.
- **Click & Focus Triggers**: Opens game detail drawer on click/selection and launches emulator on double-click or primary button trigger.

---

## 3. Detailed Logic Behind Everything and How It Works
- Renders element `<div className={`game-tile ${isFocused ? 'focused' : ''}`}>`.
- Evaluates `checkSaveData(game)` asynchronously to display "SAVE DATA" badge if save states or local storage records exist.
- Triggers `setSelectedGameCard(game)` to open inspection drawer.

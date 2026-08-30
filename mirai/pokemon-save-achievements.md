# Universal Pokémon Save Achievements & Trainer Milestones (Gen 1 – Gen 5)

## 1. Description

Retro Player currently features a universal organic achievement engine tracking playtime, session streaks, and emulator features. This specification defines a lightweight, client-side **Pokémon Save Data Inspector** capable of analyzing battery SRAM and Flash save files (`.sav` / `Uint8Array`) in real time across all mainline Pokémon titles from **Generation 1 (Game Boy: Red/Blue/Yellow)** through **Generation 5 (Nintendo DS: Black 2/White 2)**.

By inspecting raw save bytes during emulator auto-flushes, manual saves, and save imports, Retro Player unlocks deterministic, game-specific milestones—including Gym Badges 1 through 8, starter selection, Pokédex milestones, Victory Road conquest, and League Championship—with zero emulator memory hacking, zero native dependencies, and 100% offline execution in `< 1ms`.

---

## 2. Detailed List of What It Will Do

### 2.1 Universal Milestones Tracked (Gen 1 through Gen 5 / B2W2)
The parser tracks only universal gameplay milestones present in every mainline Pokémon release:

1. **Journey Begun (Starter Chosen)**: Triggers when the player selects their first Grass, Fire, or Water starter companion from the regional Professor.
2. **Pedal to the Metal (Bicycle Acquired)**: Triggers when the player receives the Bicycle in their key items pocket.
3. **Master Ball Acquired**: Triggers when the player obtains the legendary Master Ball.
4. **Gym Badges 1 through 8**: Individual achievements for defeating each of the 8 regional Gym Leaders and acquiring their official League Badges (e.g., Boulder through Earth in Kanto, Zephyr through Rising in Johto, Stone through Rain in Hoenn, Coal through Beacon in Sinnoh, Trio/Basic through Legend/Wave in Unova).
5. **Eight Badges Assembled**: Milestone for completing the regional badge case.
6. **Victory Road Conquered**: Triggers when the player successfully navigates Victory Road and steps onto the grounds of the regional Pokémon League.
7. **Hall of Fame / League Champion**: Triggers upon recording the player's first official League victory in the Hall of Fame records.
8. **First Wild Catch**: Triggers when the player registers their first non-starter wild Pokémon capture.
9. **Evolution Master**: Triggers when the player registers their first evolved species in their party or Pokédex.
10. **Full Battle Party**: Triggers when the player's active party holds 6 Pokémon.
11. **Level 100 Ascension**: Triggers when any single Pokémon in the player's party or PC boxes reaches maximum Level 100.
12. **High Roller (Max Wallet)**: Triggers when the trainer's wallet reaches maximum currency (₽999,999 PokéDollars).
13. **Pokédex Scaling (10, 25, 50, 100 Caught)**: Progressive milestones for expanding the trainer's collection.
14. **Regional Pokédex Completed**: Triggers when the player completes all owned entries for the regional Pokédex.

### 2.2 Per-ROM Scoping Architecture (`isPerRom: true`)
All Pokémon milestones are strictly scoped on a **per-ROM basis**:
* **Individual Cartridge Progression**: Earning the Boulder Badge in *Pokémon Red* tracks independently from earning the Boulder Badge in *Pokémon Yellow* or *Pokémon FireRed*. Each ROM file in the player's library has its own distinct save state, badge case, and achievement progress ledger.
* **Per-ROM Keying**: Unlocked achievements are persisted in IndexedDB under `achievements_${profileId}_${game.id}`, ensuring multiple versions, regional revisions, and ROM hacks track their own independent badges without collisions.
* **Dedicated In-App Trainer Cards**: Selecting any Pokémon game in the Trophy Cabinet renders that cartridge's individual Trainer Card showing its specific trainer name, money, active party, and 8-badge case.

### 2.3 User-Facing Features & UI Integration
* **Real-Time Toast Notifications**: Console-styled slide-up toasts with badge icons and authentic chime sound effects whenever an in-game save or 10-second SRAM flush detects a newly unlocked milestone for the current ROM.
* **Game Badge Case in Trophy Cabinet**: The in-app Trophy Cabinet displays a dedicated "Trainer Card & Badge Case" view when inspecting any Pokémon title, rendering its 8 regional badges with authentic metallic finishes.
* **Save Import Auto-Scan**: Importing any legacy `.sav` file into Retro Player's Save Data Studio immediately scans the buffer and retroactively unlocks all accomplished milestones for that specific cartridge.
* **Zero Performance Overhead**: Pure byte inspection takes less than 1 millisecond on modern WebAssembly and JavaScript runtimes, running asynchronously off the main emulation thread.

---

## 3. Detailed Logic Behind It

### 3.1 Save Format & Generation Architecture

```
+-------------------------------------------------------------------------+
|                  Emulator SRAM / Flash Buffer (.sav)                    |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
   [GB / GBC: 32 KB SRAM]                          [GBA: 64KB/128KB Flash]
   • Fixed Offsets (Bank 1)                        • 14 Rotating 4KB Blocks
   • Direct Badge Bitmasks                         • Active Block Detection via
   • Bitfield Dex Arrays                             Save Index & Section IDs
            |                                               |
            +-----------------------+-----------------------+
                                    |
                           [NDS: 512 KB EEPROM]
                           • Dual Save Slot Partitioning
                           • CRC16 Checksum Validation
                           • General Block Shift Offsets
```

### 3.2 Generation Byte Offset & Bitmask Specifications

#### Generation 1: Game Boy (Red, Blue, Yellow)
* **SRAM Buffer Size**: 32,768 bytes (32 KB).
* **Game Identification**: Title string at header or signature bytes at `0x2598`–`0x25A3`.
* **Badges Offset**: `0x2602` (1 byte bitmask):
  * `0x01`: Boulder Badge (Brock)
  * `0x02`: Cascade Badge (Misty)
  * `0x04`: Thunder Badge (Lt. Surge)
  * `0x08`: Rainbow Badge (Erika)
  * `0x10`: Soul Badge (Koga)
  * `0x20`: Marsh Badge (Sabrina)
  * `0x40`: Volcano Badge (Blaine)
  * `0x80`: Earth Badge (Giovanni)
* **Pokédex Owned**: `0x25A3` – `0x25B5` (19 bytes = 152 bit flags). Count popcount of active bits.
* **Hall of Fame Record Count**: `0x2596` (1 byte, `> 0` means Champion).
* **Money**: `0x25F3` – `0x25F5` (3 bytes BCD, `0x99 0x99 0x99` = ₽999,999).
* **Party Count**: `0x2F2C` (1 byte, 1 to 6).

#### Generation 2: Game Boy Color (Gold, Silver, Crystal)
* **SRAM Buffer Size**: 32,768 bytes (32 KB).
* **Johto Badges**: `0x23E4` (1 byte bitmask: Zephyr, Hive, Plain, Fog, Storm, Mineral, Glacier, Rising).
* **Kanto Badges**: `0x23E5` (1 byte bitmask: Boulder, Cascade, Thunder, Rainbow, Soul, Marsh, Volcano, Earth).
* **Pokédex Owned**: `0x2A4C` – `0x2A6B` (32 bytes = 256 bit flags).
* **Party Data**: `0x288A` (Party count and Level 100 detection).
* **Money**: `0x23DC` – `0x23DE` (3 bytes big-endian integer).

#### Generation 3: Game Boy Advance (Ruby, Sapphire, Emerald, FireRed, LeafGreen)
* **Save Buffer Size**: 65,536 bytes (64 KB) or 131,072 bytes (128 KB).
* **Save Rotation Logic**: Gen 3 saves rotate between two 57,344-byte slots (Slot A at `0x0000`, Slot B at `0xE000`). Each slot contains 14 independent 4,096-byte sections (IDs 0–13).
* **Active Slot Detection**: Iterate sections, read the 12-byte footer at offset `4084` (`SectionID [2B]`, `Checksum [2B]`, `Signature [4B]`, `SaveIndex [4B]`). The slot with the highest `SaveIndex` is the active save.
* **Section 0 (Trainer Info)**:
  * Trainer Name, Gender, Security Key.
* **Section 2 (Game State & Key Items / Badges)**:
  * R/S/E Badges: Bitmask at offset `0x0000` of Section 2 flags array (8 Hoenn badges).
  * FR/LG Badges: Bitmask at offset `0x0000` of Section 2 flags array (8 Kanto badges).
* **Section 1 (Team & Items)**:
  * Party count at `0x0234`, party Pokémon levels (check for Level 100), Pokédex owned bitmasks.

#### Generation 4: Nintendo DS (Diamond, Pearl, Platinum, HeartGold, SoulSilver)
* **Save Buffer Size**: 524,288 bytes (512 KB).
* **Save Structure**: Two partitions (General Block and Storage Block). Each general block has a header and footer with a block counter and CRC16 checksum.
* **Active Partition**: Read block counters at sector footers; the higher counter with a valid CRC16 is active.
* **DPPt / HGSS Badges**: 8 Sinnoh / 8 Johto badges bitmask located within the active General Block system flags structure.
* **Pokédex & Party**: Decoded from the active party structure and Dex bitfields.

#### Generation 5: Nintendo DS (Black, White, Black 2, White 2)
* **Save Buffer Size**: 524,288 bytes (512 KB).
* **Dual Slot System**: Primary slot at `0x00000`, Secondary slot at `0x24000`.
* **Block Header**: Read 4-byte save counter at `0x23FFC` vs `0x47FFC`.
* **Unova Badges**: 8 badge flags stored at relative offset `0x21C00` within the active block.
* **Hall of Fame & High Roller**: Extracted from trainer metadata offsets in the active sector.

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Create `src/services/pokemonSaveParser.js`
Implement a standalone parsing service with functions:
```javascript
// src/services/pokemonSaveParser.js
export function isPokemonRom(game) {
  if (!game) return false;
  const name = (game.title || game.name || '').toLowerCase();
  return name.includes('pokemon') || name.includes('pokémon');
}

export function parsePokemonSave(uint8Array, game) {
  if (!uint8Array || uint8Array.byteLength < 32768) return null;
  const length = uint8Array.byteLength;

  if (length === 32768) {
    return parseGen1Or2(uint8Array);
  } else if (length === 65536 || length === 131072) {
    return parseGen3(uint8Array, game);
  } else if (length === 524288) {
    return parseGen4Or5(uint8Array, game);
  }
  return null;
}
```

### Step 2: Register Universal Milestones in `achievementsManifest.js`
Add a dedicated `POKEMON` category or dynamic game-specific manifest with `isPerRom: true`:
```javascript
export const POKEMON_ACHIEVEMENTS = [
  {
    id: 'poke_badge_1',
    title: 'First Badge of Honor',
    description: 'Defeat the first Gym Leader and earn your inaugural regional League Badge.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Shield',
    isPerRom: true // Stored per game.id in IndexedDB
  },
  {
    id: 'poke_league_champion',
    title: 'Regional Champion',
    description: 'Defeat the Elite Four and reigning Champion to register in the Hall of Fame.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Trophy',
    isPerRom: true
  }
];
```

### Step 3: Wire into Emulator Save Pipeline (`EmulatorModal.jsx`)
Hook `parsePokemonSave` into:
1. `onSave` / battery RAM flush event in `EmulatorModal.jsx`.
2. Battery import handler in `SaveDataStudio` / `BackupModal.jsx`.
3. Game launch pre-load cycle.

When new badges or flags are detected:
```javascript
const saveSummary = parsePokemonSave(sramBuffer, currentGame);
if (saveSummary) {
  achievementsEngine?.evaluatePokemonMilestones(currentGame, saveSummary);
}
```

### Step 4: Expand Trophy Cabinet with Trainer Badge Case
Update `CartridgeGrid.jsx` and `TrophyCabinetModal.jsx` to render an authentic physical Badge Case tray when viewing Pokémon titles, highlighting earned vs locked gym badges.

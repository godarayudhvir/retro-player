# 🔮 Pokémon Save Inspector: Single-Player Milestones Expansion (Gen 1 – Gen 5)

## 1. Description

While **Gym Badges** (8/16 regional badges) and **Pokémon League Champions** (Hall of Fame) are fully verified and live in Retro Player, mainline Pokémon cartridges contain rich single-player storylines, key items, legendary encounters, and post-game triumphs.

This specification defines the **Single-Player Milestones Expansion** for Generations 1 through 5 (*Game Boy, Game Boy Color, Game Boy Advance, and Nintendo DS*). 

> **Core Guarantee**: Every milestone in this catalog is **100% offline and single-player**. It strictly excludes trade-evolution requirements, version-exclusive link trades, time-limited Mystery Gift events, and external distribution tickets. Every milestone can be naturally unlocked by an offline player on a standalone cartridge.

---

## 2. Detailed List of What It Will Do

### A. Generation 1 (Kanto — Red, Blue, Yellow)
1. 🚲 **Cerulean Cyclist (Bicycle)**: Exchange the Bike Voucher at the Cerulean City Bike Shop.
2. 👁️ **Ghostbusters (Silph Scope)**: Retrieve the Silph Scope from Team Rocket Hideout to unveil ghosts in Pokémon Tower.
3. 🎶 **Awaken the Giant (Poké Flute)**: Acquire the Poké Flute from Mr. Fuji in Lavender Town to wake slumbering Snorlax.
4. 🎣 **Master Angler (Super Rod)**: Obtain the Super Rod on Route 12 to hook deep-water titans.
5. 🧬 **The Genetic Apex (Mewtwo)**: Encounter and capture the legendary clone Mewtwo in Cerulean Cave.
6. ⚡ **Legendary Bird Trio**: Capture Articuno (Seafoam Islands), Zapdos (Power Plant), and Moltres (Victory Road).
7. 💛 **Pikachu Companionship (Yellow Only)**: Maximize your starter Pikachu's happiness (`Friendship >= 200` at `0x271C`).

---

### B. Generation 2 (Johto & Kanto Return — Gold, Silver, Crystal)
1. 📱 **Pokégear Navigation**: Receive your Pokégear with Map Card from the Guide Gent in Cherrygrove City.
2. 🚿 **Mysterious Tree (SquirtBottle)**: Acquire the SquirtBottle from Goldenrod Flower Shop to clear Sudowoodo on Route 36.
3. 🔴 **Red Gyarados (Lake of Rage)**: Catch or defeat the Shiny Red Gyarados and obtain the Red Scale for Mr. Pokémon.
4. 🌊 **Guardian of Sea & Sky**: Encounter and capture Lugia (Whirl Islands) or Ho-Oh (Tin/Bell Tower).
5. 💧 **The Crystal Beast (Suicune - Crystal Only)**: Encounter and capture Suicune at Bell Tower with Eusine.
6. 🚢 **S.S. Aqua Voyager**: Board the S.S. Aqua luxury liner to voyage between Johto and Kanto.
7. 🏔️ **Legendary Summit (Defeat Red)**: Ascend the peak of Mt. Silver and defeat Pokémon Master Red in the ultimate endgame duel.

---

### C. Generation 3 (Hoenn & Kanto Remakes — Ruby, Sapphire, Emerald, FireRed, LeafGreen)
1. 📟 **PokéNav Cartographer (RSE)**: Receive the PokéNav from President Stone at the Devon Corporation in Rustboro City.
2. 🚲 **Rydel's Dual Cycles (RSE)**: Obtain the Mach Bike or Acro Bike from Rydel in Mauville City.
3. 👁️ **Unseen Chameleon (Devon Scope - RSE)**: Receive the Devon Scope from Steven on Route 120 to reveal camouflaged Kecleon.
4. 🌋 **Titans of Land, Sea & Sky (RSE)**: Encounter and capture Groudon (Cave of Origin/Terra Cave), Kyogre (Marine Cave), or Rayquaza (Sky Pillar).
5. 🗿 **Ancient Golem Trio (Regi Chambers - RSE)**: Unseal and capture Regirock (Desert Ruins), Regice (Island Cave), and Registeel (Ancient Tomb).
6. 💎 **Network Restoration (Ruby & Sapphire Gems - FRLG)**: Recover the Ruby and Sapphire gemstones from the Sevii Islands to connect Celio's Network Machine.

---

### D. Generation 4 (Sinnoh & Johto Remakes — Diamond, Pearl, Platinum, HeartGold, SoulSilver)
1. ⌚ **Pokétch Technology (DPPt)**: Collect 3 Company Coupons in Jubilife City to receive the Pokétch wristwatch.
2. 🚲 **Rad Rickshaw's Cyclist (DPPt)**: Receive the gear-shifting Bicycle from Rad Rickshaw in Eterna City.
3. ⛏️ **Underground Explorer (DPPt)**: Receive the Explorer Kit from the Underground Man in Eterna City.
4. 🌌 **The Creation Dragon (DPPt)**: Encounter and capture Dialga, Palkia (Spear Pillar), or Giratina (Distortion World / Turnback Cave).
5. 🧠 **Lake Guardians Trio (DPPt)**: Encounter and capture the beings of Willpower, Emotion, and Knowledge: Uxie, Mesprit, and Azelf.
6. 🐣 **The Mystery Egg (HGSS)**: Hatch the Togepi Mystery Egg gifted by Professor Elm and Mr. Pokémon.
7. 🏔️ **Mt. Silver Red Duel (HGSS)**: Conquer the snowy summit of Mt. Silver and defeat Trainer Red.

---

### E. Generation 5 (Unova — Black, White, Black 2, White 2)
1. 📟 **C-Gear Activation**: Receive the C-Gear from Fennel after retrieving Dream Mist in Striaton City.
2. 🚲 **Folding Cyclist**: Receive the folding Bicycle from the Day Care Man in Nimbasa City.
3. 🏰 **Fall of Team Plasma**: Infiltrate N's Castle / Neo Plasma Frigate and defeat Ghetsis.
4. 🐉 **Dragons of Truth, Ideals & Void**: Capture Reshiram (Dragonspiral Tower), Zekrom (N's Castle), or Kyurem (Giant Chasm).
5. ⚔️ **Swords of Justice**: Encounter and capture Cobalion (Guidance Chamber), Terrakion (Trial Chamber), and Virizion (Rumination Field).
6. 🌳 **Hollow / Tower Conquest (B2W2)**: Conquer Area 10 of Black Tower (Black 2) or White Treehollow (White 2) and defeat Benga.

---

## 3. Detailed Logic Behind It

### Memory Signatures & Offset Directory (Offline Saves)

```
+---------------------------------------------------------------------------------------+
| GENERATION | TARGET MILESTONE          | STORAGE BLOCK  | BINARY OFFSET & BITMASK      |
+---------------------------------------------------------------------------------------+
| Gen 1 (GB) | Starter Chosen            | Main Bank      | Party Count > 0 at 0x2F2C    |
| Gen 1 (GB) | Bicycle In Bag            | Bag List       | Item 0x06 in 0x25CA..0x25EE  |
| Gen 1 (GB) | Silph Scope               | Bag List       | Item 0x48 in 0x25CA..0x25EE  |
| Gen 1 (GB) | Mewtwo Captured           | Pokedex / Box  | Species 0x83 caught bit 150  |
| Gen 1 (GB) | Yellow Pika Happiness     | Yellow Block   | Byte at 0x271C >= 200        |
+---------------------------------------------------------------------------------------+
| Gen 2 (GBC)| Starter Chosen            | Main Bank      | Party Count > 0 at 0x288A    |
| Gen 2 (GBC)| SquirtBottle              | Key Items      | Item 0x89 in 0x2477..0x2496  |
| Gen 2 (GBC)| Red Scale / Exp Share     | Key Items      | Item 0x93 or 0x61 in bag     |
| Gen 2 (GBC)| Lugia / Ho-Oh             | Pokedex / Box  | Species #249 / #250 in Dex   |
| Gen 2 (GBC)| Red Defeated (Mt. Silver) | Event Flags    | Flag bit at 0x2600 + 0x0E    |
+---------------------------------------------------------------------------------------+
| Gen 3 (GBA)| Starter Chosen            | Section 1      | Party Count > 0 in Sec 1     |
| Gen 3 (GBA)| Mach / Acro Bike          | Section 1      | Item 0x0103 / 0x0104 in Bag  |
| Gen 3 (GBA)| Devon Scope               | Section 1      | Item 0x011C in Key Items Bag |
| Gen 3 (GBA)| Groudon / Kyogre / Ray    | Section 0 (Dex)| Species #382, #383, #384     |
| Gen 3 (GBA)| Regi Trio Captured        | Section 0 (Dex)| Species #377, #378, #379     |
| Gen 3 (FRLG| Ruby & Sapphire Gems      | Section 1      | Items 0x0163 & 0x0164 in Bag |
+---------------------------------------------------------------------------------------+
| Gen 4 (NDS)| Pokétch Acquired          | General Block  | Key Item 0x01A3 in Bag list  |
| Gen 4 (NDS)| Explorer Kit              | General Block  | Key Item 0x01A4 in Bag list  |
| Gen 4 (NDS)| Dialga/Palkia/Giratina    | General Block  | Species #483, #484, #487 Dex |
| Gen 4 (HGSS| Mt. Silver Red Defeated   | General Block  | Story Event Flag Bit in Sec  |
+---------------------------------------------------------------------------------------+
| Gen 5 (NDS)| C-Gear Acquired           | General Block  | C-Gear Enabled Flag in Sec   |
| Gen 5 (NDS)| Reshiram/Zekrom/Kyurem    | General Block  | Species #643, #644, #646 Dex |
| Gen 5 (NDS)| Swords of Justice         | General Block  | Species #638, #639, #640 Dex |
+---------------------------------------------------------------------------------------+
```

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Extend `src/services/pokemonSaveParser.js`
1. Add key item extraction routines and event flag parsers to `parseGen1`, `parseGen2`, `parseGen3`, `parseGen4`, and `parseGen5`.
2. Output a structured `milestones` object:
```js
{
  starterChosen: true,
  hasBicycle: true,
  hasScope: true,
  hasPokeFlute: true,
  legendariesCaptured: ['mewtwo', 'articuno', 'zapdos', 'moltres'],
  postGameDefeated: ['trainer_red']
}
```

### Step 2: Register Milestone Entries in `src/data/achievementsManifest.js`
Extend `POKEMON_ACHIEVEMENTS_MANIFEST` with the respective offline milestone definitions and connect them into `getPokemonMilestonesForGame(game)`.

### Step 3: Wire Automatic Unlock Evaluator in `useAchievements.js`
In `evaluatePokemonSave(game, sramBuffer)`, evaluate the unpacked `milestones` flags and invoke `unlockAchievement(id, game)` for each completed offline feat.

### Step 4: Add Verification Unit Tests
Update `test/pokemon_save_test.cjs` to assert valid milestone detection across all canonical reference `.sav` files.

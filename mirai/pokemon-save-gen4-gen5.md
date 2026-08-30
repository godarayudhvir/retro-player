# 🔮 Pokémon Save Inspector: Generation 4 & Generation 5 (Nintendo DS 512 KB Flash / EEPROM)

## 1. Description

This specification outlines the architectural design and implementation roadmap for extending the zero-overhead, offline **Pokémon Save Inspector** to support **Generation 4** (*Pokémon Diamond, Pearl, Platinum, HeartGold, SoulSilver*) and **Generation 5** (*Pokémon Black, White, Black 2, White 2*) on Nintendo DS.

Building on the verified Generation 1–3 save parsing engine ([`guides/pokemon/README.md`](../guides/pokemon/README.md)), this expansion adds automated SRAM/Flash inspection for 512 KB NDS save binaries. It will automatically populate regional badge cases (Sinnoh 8 Badges, HGSS 16 Badges, Unova 8 Badges), Pokédex catch counts, LCRNG encrypted party structs, and story progression feats directly from real cartridge battery saves without any emulator memory hacking.

---

## 2. Detailed List of What It Will Do

### A. Generation 4 (Sinnoh & Johto Remakes - NDS)
1. **Sinnoh Regional League (Diamond, Pearl, Platinum — 8 Badges)**:
   * 🪨 **Coal Badge** (Roark • Oreburgh City • Rock)
   * 🌲 **Forest Badge** (Gardenia • Eterna City • Grass)
   * 🥊 **Cobble Badge** (Maylene • Veilstone City • Fighting)
   * 💧 **Fen Badge** (Crasher Wake • Pastoria City • Water)
   * 👻 **Relic Badge** (Fantina • Hearthome City • Ghost)
   * ⚙️ **Mine Badge** (Byron • Canalave City • Steel)
   * ❄️ **Icicle Badge** (Candice • Snowpoint City • Ice)
   * ⚡ **Beacon Badge** (Volkner • Sunyshore City • Electric)
2. **HeartGold & SoulSilver Post-Game Dual League (16 Badges Total)**:
   * Full 8 Johto Badges + 8 Kanto Return Badges tray parsing in NDS save format.
3. **Generation 4 Storyline Feats & Key Items**:
   * **Sinnoh Starter Choice**: Turtwig (`387`), Chimchar (`390`), or Piplup (`393`) at Lake Verity / Prof. Rowan.
   * **Pokétch Wristwatch**: Acquired in Jubilife City (Company Campaign coupon quest).
   * **Creation Trio & Mythicals**: Dialga (`483`), Palkia (`484`), Giratina (`487`), Arceus (`493`), Darkrai (`491`), Shaymin (`492`).
   * **Sinnoh League Champion**: Defeat Elite Four and Champion Cynthia.
   * **Level 100 Ascension & Pokérus**: Parse 236-byte party structs with LCRNG decryption.

### B. Generation 5 (Unova Region - NDS)
1. **Unova Regional League (Black, White, Black 2, White 2 — 8 Badges)**:
   * **Badge 1**: Trio Badge (Cilan/Cress/Chili) / Basic Badge (Cheren)
   * **Badge 2**: Basic Badge (Lenora) / Toxic Badge (Roxie)
   * **Badge 3**: Insect Badge (Burgh • Castelia City • Bug)
   * **Badge 4**: Bolt Badge (Elesa • Nimbasa City • Electric)
   * **Badge 5**: Quake Badge (Clay • Driftveil City • Ground)
   * **Badge 6**: Jet Badge (Skyla • Mistralton City • Flying)
   * **Badge 7**: Freeze Badge (Brycen) / Legend Badge (Drayden)
   * **Badge 8**: Legend Badge (Drayden) / Wave Badge (Marlon)
2. **Generation 5 Storyline Feats & Key Items**:
   * **Unova Starter Choice**: Snivy (`495`), Tepig (`498`), or Oshawott (`501`).
   * **C-Gear Activation**: Acquired from Fennel in Striaton City.
   * **Tao Trio & Mythicals**: Reshiram (`643`), Zekrom (`644`), Kyurem (`646`), Victini (`494`), Keldeo (`647`), Genesect (`649`).
   * **Plasma Fall**: Defeat N & Ghetsis at N's Castle.
   * **Unova League Champion**: Defeat Alder (BW) / Iris (B2W2).

---

## 3. Detailed Logic Behind It

### A. NDS 512 KB Save Architecture & Dual Slot Rotation
Nintendo DS Pokémon save files are 524,288 bytes (512 KB). Saves alternate between two primary storage blocks to prevent write corruption:
* **Generation 4 (DPPt)**:
  * **General Block Slot 1**: `0x00000` to `0x3FFFF` (256 KB)
  * **General Block Slot 2**: `0x40000` to `0x7FFFF` (256 KB)
  * Each block contains a **Small Block** (General save info, party, badges, money) and a **Large Block** (PC storage boxes).
  * Block footer contains a 32-bit Save Sequence Count and a 16-bit CRC16-CCITT checksum at the block boundary.
* **Generation 5 (BW / B2W2)**:
  * **Slot 1**: `0x00000` to `0x23FFF` (144 KB)
  * **Slot 2**: `0x24000` to `0x47FFF` (144 KB)
  * The active slot is determined by reading the 32-bit save index counter at the header/footer of each slot.

### B. CRC16-CCITT Checksum Verification
```js
function calculateCRC16(data, offset, length) {
  let crc = 0xFFFF;
  for (let i = 0; i < length; i++) {
    crc = ((crc << 8) & 0xFFFF) ^ CRC16_TABLE[((crc >>> 8) ^ data[offset + i]) & 0xFF];
  }
  return crc & 0xFFFF;
}
```

### C. 236-Byte Party Pokémon Decryption (LCRNG)
In Gen 4 and Gen 5, party Pokémon records are 236 bytes (136 bytes unencrypted box data + 100 bytes party stats):
1. **Decryption Seed**: Read 32-bit Personality Value (PID) and 16-bit Checksum.
2. **Linear Congruential PRNG**: `Seed = (Seed * 0x41C64E6D + 0x6073) >>> 0`.
3. **Substructure Ordering**: Permutation lookup determined by `((PID & 0x3E000) >>> 13) % 24`.
4. **Substructures (32 bytes each)**:
   * **Block A**: Species ID, Held Item, OT ID, EXP points, Ability.
   * **Block B**: Moves and PP Up counters.
   * **Block C**: EVs and Condition.
   * **Block D**: Pokérus byte (High nibble = Strain, Low nibble = Days remaining), IVs, Egg flags, Shiny status.

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Ingest Reference Save Files
Add real, verified battery `.sav` files from physical cartridges into:
* `ref_save_files/gen4/` (*Pokemon_-_Platinum_Version_Save.sav*, *Pokemon_-_HeartGold_Version_Save.sav*)
* `ref_save_files/gen5/` (*Pokemon_-_Black_Version_Save.sav*, *Pokemon_-_Black_Version_2_Save.sav*)

### Step 2: Implement `parseGen4` and `parseGen5` Handlers
Add sub-parsers in `src/services/pokemonSaveParser.js`:
1. Check `data.length === 524288` (512 KB).
2. Validate CRC16-CCITT on General and Storage blocks.
3. Compare sequence counters to select the active slot.
4. Extract Money, Pokédex Owned bitset (493 species in Gen 4, 649 species in Gen 5), and 8/16-badge bitmasks.
5. Decrypt 236-byte party structs using the LCRNG pipeline to detect Species, Level 100, Shinies, and Pokérus.

### Step 3: Register Badges & Milestones in Manifest
Link Gen 4 (`REGIONAL_BADGES.sinnoh`) and Gen 5 (`REGIONAL_BADGES.unova`) in `src/data/achievementsManifest.js` to enable automatic badge rendering in Nintendo DS View and the Trophy Cabinet.

### Step 4: Verification Suite
Run automated test suite verifying 100% pass rate across all Gen 4 and Gen 5 reference files and update `guides/pokemon/README.md` documentation matrix.

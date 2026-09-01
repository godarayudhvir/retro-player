# 🔮 Pokémon Save Inspector: Generation 5 (Nintendo DS 512 KB Flash / EEPROM)

## 1. Description

This specification outlines the architectural design and implementation roadmap for extending the zero-overhead, offline **Pokémon Save Inspector** to support **Generation 5** (*Pokémon Black, White, Black 2, White 2*) on Nintendo DS.

Building on the verified Generation 1–4 save parsing engine ([`guides/pokemon/README.md`](../guides/pokemon/README.md)), this expansion adds automated Flash save inspection for 512 KB NDS save binaries. It will automatically populate the Unova regional badge case (8 Badges) and recognize Unova League Champions (Alder & Iris) directly from real cartridge battery saves without any emulator memory hacking.

---

## 2. Detailed List of What It Will Do

### A. Unova Regional League (Black, White, Black 2, White 2 — 8 Badges)
* **Badge 1**: 🌿 Trio Badge (Cilan/Cress/Chili) / 📖 Basic Badge (Cheren)
* **Badge 2**: 📚 Basic Badge (Lenora) / 🎸 Toxic Badge (Roxie)
* **Badge 3**: 🐛 Insect Badge (Burgh • Castelia City • Bug)
* **Badge 4**: ⚡ Bolt Badge (Elesa • Nimbasa City • Electric)
* **Badge 5**: 🏔️ Quake Badge (Clay • Driftveil City • Ground)
* **Badge 6**: ✈️ Jet Badge (Skyla • Mistralton City • Flying)
* **Badge 7**: ❄️ Freeze Badge (Brycen) / 🐉 Legend Badge (Drayden)
* **Badge 8**: 🐉 Legend Badge (Drayden) / 🌊 Wave Badge (Marlon)

### B. Storyline Progression & League Victory Feats
* **Nuvema / Aspertia Departure (`poke_journey_begun`)**: Unbox your starter companion gift from Professor Juniper (BW) or Bianca (B2W2).
* **Unova League Champion (`poke_hall_of_fame`)**: Defeat the Elite Four and Champion Alder (BW) or Iris (B2W2) to conquer Unova and enter the Hall of Fame.

---

## 3. Detailed Logic Behind It

### A. NDS 512 KB Save Architecture & Dual Slot Rotation
Nintendo DS Generation 5 save files are 524,288 bytes (512 KB), alternating between two 144 KB storage slots:
* **Slot 1**: `0x00000` to `0x23FFF`
* **Slot 2**: `0x24000` to `0x47FFF`
* The active slot is determined by comparing the 32-bit save index counter at the header/footer of each slot.

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

---

## 4. Detailed Guide of How to Set It Up

### Step 1: Ingest Reference Save Files
Add real, verified battery `.sav` files from physical cartridges into:
* `ref_save_files/gen5/` (*Pokemon_-_Black_Version_Save.sav*, *Pokemon_-_Black_Version_2_Save.sav*)

### Step 2: Implement `parseGen5` Handler
Add sub-parser in `src/services/pokemonSaveParser.js`:
1. Check `data.length === 524288` (512 KB).
2. Validate CRC16-CCITT on General and Storage blocks.
3. Compare sequence counters to select the active slot.
4. Extract Money, Trainer Info, and 8-badge bitmasks.
5. Identify Champion / Hall of Fame flags.

### Step 3: Register Badges & Contextual Milestones in Manifest
1. Unova WebP Badges (`trio.webp`, `basic.webp`, `insect.webp`, `bolt.webp`, `quake.webp`, `jet.webp`, `freeze.webp`, `legend.webp`) are pre-extracted in `public/assets/badges/unova/`.
2. Connect `REGIONAL_BADGES.unova` in `src/data/achievementsManifest.js`.

### Step 4: Verification Suite
Run automated test suite verifying 100% pass rate across Gen 5 reference files and update documentation.

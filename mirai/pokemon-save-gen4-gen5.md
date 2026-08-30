# 🔮 Pokémon Save Inspector: Generation 4 & Generation 5 (Nintendo DS 512 KB Flash)

## 1. Description
Specification for extending the zero-overhead offline **Pokémon Save Inspector** to support **Generation 4** (*Pokémon Diamond, Pearl, Platinum, HeartGold, SoulSilver*) and **Generation 5** (*Pokémon Black, White, Black 2, White 2*) on Nintendo DS.

---

## 2. Detailed List of What It Will Do

### A. Generation 4 (Sinnoh & Johto Remakes - NDS)
- **Sinnoh Gym Badges (DPPt)**:
  - 🪨 Coal Badge (Roark • Oreburgh)
  - 🌲 Forest Badge (Gardenia • Eterna)
  - 🥊 Cobble Badge (Maylene • Veilstone)
  - 💧 Fen Badge (Crasher Wake • Pastoria)
  - 👻 Relic Badge (Fantina • Hearthome)
  - ⚙️ Mine Badge (Byron • Canalave)
  - ❄️ Icicle Badge (Candice • Snowpoint)
  - ⚡ Beacon Badge (Volkner • Sunyshore)
- **Generation 4 Storybeats**:
  - **Sinnoh Starter Choice** (Turtwig, Chimchar, Piplup at Lake Verity / Prof. Rowan)
  - **Pokétch Wristwatch** (Jubilife City Company Campaign)
  - **Creation Trio** (Dialga in Diamond, Palkia in Pearl, Giratina in Platinum Distortion World)
  - **Sinnoh Champion** (Conquer Elite Four & Champion Cynthia)
  - **HeartGold / SoulSilver 16-Badge Quest** (8 Johto + 8 Kanto Badges + Pokéathlon)

### B. Generation 5 (Unova - NDS)
- **Unova Gym Badges (BW / B2W2)**:
  - Trio / Basic, Basic / Toxic, Insect, Bolt, Quake, Jet, Freeze / Legend, Legend / Wave.
- **Generation 5 Storybeats**:
  - **Unova Starter Choice** (Snivy, Tepig, Oshawott from Bianca/Juniper)
  - **Tao Trio** (Reshiram in Black / N's Castle, Zekrom in White, Kyurem in Giant Chasm)
  - **Plasma Fall** (Defeat N & Ghetsis at N's Castle)
  - **Unova League Champion** (Defeat Alder in BW / Iris in B2W2)
  - **Black 2 / White 2 PWT & Join Avenue**

---

## 3. Detailed Logic Behind It

### NDS 512 KB Save Architecture:
- NDS save files alternate between **Slot 1 (`0x00000`)** and **Slot 2 (`0x40000` in Gen 4, `0x24000` in Gen 5)** based on save sequence counter words at the block headers/footers.
- Block checksums use standard CRC16 CCITT polynomials across specific data sections (Trainer Info, Bag Items, Party Structs, Box Storage, Pokédex).

---

## 4. Activation Steps
1. Drop real starter `.sav` files into `ref_save_files/gen4/` (Platinum, HeartGold) and `ref_save_files/gen5/` (Black, Black 2).
2. Perform deep binary byte inspection to map active slot selection, team structs, and Pokédex bitsets.
3. Hook verified offsets into `src/services/pokemonSaveParser.js`.

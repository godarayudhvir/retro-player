# 🏆 Pokémon Save Inspector & Regional Milestones Guide (Gen 1 – Gen 3)

This documentation provides the complete master directory of all **Generation 1, Generation 2, and Generation 3 Pokémon Save Inspector Milestones**, including memory-verified offsets, authentic regional gym badge cases, and game-specific storyline progression across 11 canonical titles.

---

## 📌 Supported Pokémon Cartridges (Gen 1 – Gen 3)

| Generation | Platform | Cartridge Save Architecture | Verified Canonical ROMs |
| :--- | :--- | :--- | :--- |
| **Generation 1** | **Game Boy (GB)** | 32 KB Battery SRAM (`.sav` / `.srm`) | **Pokémon Red**, **Pokémon Blue**, **Pokémon Yellow** |
| **Generation 2** | **Game Boy Color (GBC)** | 32 KB Battery SRAM (`.sav` / `.srm`) | **Pokémon Gold**, **Pokémon Silver**, **Pokémon Crystal** |
| **Generation 3** | **Game Boy Advance (GBA)** | 128 KB Flash (Dual 57KB Rotation Slots) | **Pokémon Ruby**, **Pokémon Sapphire**, **Pokémon Emerald**, **Pokémon FireRed**, **Pokémon LeafGreen** |
| **Generation 4** | **Nintendo DS (NDS)** | 512 KB Flash / EEPROM | ⏳ *Pending reference save files (Diamond, Pearl, Platinum, HGSS)* |
| **Generation 5** | **Nintendo DS (NDS)** | 512 KB Flash / EEPROM | ⏳ *Pending reference save files (Black, White, Black 2, White 2)* |

> 🔮 **Gen 4 & 5 Roadmap**: Nintendo DS Pokémon save parsing specification is tracked in **[`mirai/pokemon-save-gen4-gen5.md`](../mirai/pokemon-save-gen4-gen5.md)** and will activate once reference `.sav` files are added to `ref_save_files/gen4` and `ref_save_files/gen5`.

---

## 🪪 1. Regional League Badge Cases

Every Pokémon game features an authentic 8-badge case in the **Nintendo DS Theme Pane** with verified gym leaders, cities, and element typings.

### 🔴 Kanto League (Red, Blue, Yellow, FireRed, LeafGreen)
| Slot | Badge Name | Gym Leader | Gym City | Type Specialization | Tier |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | 🪨 **Boulder Badge** | Brock | Pewter City | Rock | 🥉 Bronze |
| **2** | 💧 **Cascade Badge** | Misty | Cerulean City | Water | 🥉 Bronze |
| **3** | ⚡ **Thunder Badge** | Lt. Surge | Vermilion City | Electric | 🥉 Bronze |
| **4** | 🌸 **Rainbow Badge** | Erika | Celadon City | Grass | 🥈 Silver |
| **5** | 💖 **Soul Badge** | Koga | Fuchsia City | Poison | 🥈 Silver |
| **6** | 🔮 **Marsh Badge** | Sabrina | Saffron City | Psychic | 🥈 Silver |
| **7** | 🔥 **Volcano Badge** | Blaine | Cinnabar Island | Fire | 🥇 Gold |
| **8** | 🌍 **Earth Badge** | Giovanni | Viridian City | Ground | 🥇 Gold |

---

### 🟡 Johto League (Gold, Silver, Crystal)
| Slot | Badge Name | Gym Leader | Gym City | Type Specialization | Tier |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | 🪶 **Zephyr Badge** | Falkner | Violet City | Flying | 🥉 Bronze |
| **2** | 🐝 **Hive Badge** | Bugsy | Azalea Town | Bug | 🥉 Bronze |
| **3** | ⚪ **Plain Badge** | Whitney | Goldenrod City | Normal | 🥉 Bronze |
| **4** | 👻 **Fog Badge** | Morty | Ecruteak City | Ghost | 🥈 Silver |
| **5** | 🥊 **Storm Badge** | Chuck | Cianwood City | Fighting | 🥈 Silver |
| **6** | ⚙️ **Mineral Badge** | Jasmine | Olivine City | Steel | 🥈 Silver |
| **7** | ❄️ **Glacier Badge** | Pryce | Mahogany Town | Ice | 🥇 Gold |
| **8** | 🐉 **Rising Badge** | Clair | Blackthorn City | Dragon | 🥇 Gold |

---

### 🟢 Hoenn League (Ruby, Sapphire, Emerald)
| Slot | Badge Name | Gym Leader | Gym City | Type Specialization | Tier |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | 🪨 **Stone Badge** | Roxanne | Rustboro City | Rock | 🥉 Bronze |
| **2** | 🥊 **Knuckle Badge** | Brawly | Dewford Town | Fighting | 🥉 Bronze |
| **3** | ⚡ **Dynamo Badge** | Wattson | Mauville City | Electric | 🥉 Bronze |
| **4** | 🌋 **Heat Badge** | Flannery | Lavaridge Town | Fire | 🥈 Silver |
| **5** | ⚖️ **Balance Badge** | Norman | Petalburg City | Normal | 🥈 Silver |
| **6** | 🪶 **Feather Badge** | Winona | Fortree City | Flying | 🥈 Silver |
| **7** | 🔮 **Mind Badge** | Tate & Liza | Mossdeep City | Psychic | 🥇 Gold |
| **8** | 💧 **Rain Badge** | Wallace / Juan | Sootopolis City | Water | 🥇 Gold |

---

## 📜 2. Game-Specific Contextual Story & Exploration Milestones

When inspecting `.sav` save buffers, the engine resolves tailored lore titles depending on the active cartridge:

### A. Journey Departure & Exploration
| Milestone ID | Universal Base | Kanto (RBY / FRLG) | Johto (GSC) | Hoenn (RSE) |
| :--- | :--- | :--- | :--- | :--- |
| `poke_journey_begun` | **Journey Begun** | **Pallet Town Departure** (Oak's Lab) | **New Bark Departure** (Elm's Lab) | **Littleroot Departure** (Birch Rescue) |
| `poke_digital_cartographer`| **Regional Cartographer**| **Cartographer of Kanto** (Town Map) | **Pokégear Navigation** (Map Card) | **PokéNav Navigator** (Devon Corp) |
| `poke_pedal_to_metal` | **Regional Cyclist** | **Cerulean Cyclist** (Bicycle) | **Goldenrod Cyclist** (Bicycle) | **Rydel's Dual Cycles** (Mach/Acro) |
| `poke_gone_fishin` | **Inaugural Angler** | **Vermilion Angler** (Old Rod) | **Route 32 Angler** (Old Rod) | **Dewford Angler** (Old Rod) |
| `poke_master_angler` | **Master Angler** | **Super Rod (Route 12)** | **Super Rod (Route 12 Kanto)** | **Super Rod (Mossdeep City)** |

### B. Story Devices & Mystery Items
| Milestone ID | Universal Base | Kanto (RBY / FRLG) | Johto (GSC) | Hoenn (RSE) |
| :--- | :--- | :--- | :--- | :--- |
| `poke_revealer_of_mysteries`| **Scope Unmasked** | **Ghostbusters (Silph Scope)** | **SquirtBottle (Route 36)** | **Unseen Chameleon (Devon Scope)** |
| `poke_wake_up_call` | **Awaken the Giant** | **Poké Flute (Mr. Fuji)** | **Pokégear Radio (Poké Flute Channel)** | **Magma Emblem / Orb** |
| `poke_shared_growth` | **Shared Experience** | **Exp. All (Oak's Aide)** | **Exp. Share (Mr. Pokémon Red Scale)** | **Exp. Share (Mr. Stone Letter)** |
| `poke_master_ball` | **Master Ball** | **Silph Co. President's Gift** | **Professor Elm's Reward** | **Team Magma/Aqua Hideout Loot** |

### C. League Climax & Legendary Encounters
| Milestone ID | Universal Base | Kanto (RBY / FRLG) | Johto (GSC) | Hoenn (RSE) |
| :--- | :--- | :--- | :--- | :--- |
| `poke_hall_of_fame` | **League Champion** | **Indigo Plateau Champion** (vs Blue) | **Silver Conference Champion** (vs Lance)| **Ever Grande Champion** (vs Steven/Wallace)|
| `poke_myth_and_legend` | **Myth & Legend** | **The Genetic Apex (Mewtwo/Birds)** | **Guardian of Sea & Sky (Lugia/Ho-Oh)** | **Sovereign of Land, Sea & Sky (Rayquaza)** |

---

## ⚡ 3. Cartridge-Specific Exclusives & Endgame Feats

| Milestone ID | Title | Tier | Requirement & Evaluation Logic | Cartridge Scope |
| :--- | :--- | :---: | :--- | :--- |
| `poke_yellow_pika_friend` | ⚡ **Pikachu's Best Companion** | 🥇 Gold | Maximize Pikachu's happiness rating (`SRAM 0x271C >= 200`). | **Pokémon Yellow Only** |
| `poke_star_trainer` | ✨ **Star Trainer (Shiny)** | 💎 Platinum | Register or capture a shiny Pokémon with alternate palette (Atk/Def/Spd/Spc IV check in Gen 2; Personality/OT XOR `< 8` in Gen 3). | **GSC & RSE/FRLG** |
| `poke_microscopic_miracle`| 🧬 **Microscopic Miracle** | 🥇 Gold | Contract or harbor the rare beneficial **Pokérus** virus in your party. | **GSC & RSE/FRLG** |
| `poke_level_100` | 👑 **Level 100 Ascension** | 💎 Platinum | Train any single Pokémon to the maximum peak of **Level 100**. | All Titles |
| `poke_high_roller` | 💰 **High Roller (Max Wallet)** | 🥇 Gold | Reach the maximum trainer wallet cap (**₽999,999 PokéDollars**). | All Titles |
| `poke_jurassic_revival` | 🦕 **Prehistoric Revival** | 🥈 Silver | Revive a fossilized prehistoric Pokémon at Cinnabar Lab or Devon Corp. | All Titles |
| `poke_full_party` | 🎒 **Six-Slot Battle Squad** | 🥈 Silver | Assemble 6 battle-ready Pokémon in your active party. | All Titles |
| `poke_evolution_master` | 💫 **Metamorphosis** | 🥉 Bronze | Evolve any Pokémon through level, stone, or trade. | All Titles |

---

## 📖 4. Regional Pokédex Scaling Milestones

| Milestone ID | Title | Points | Target |
| :--- | :--- | :---: | :--- |
| `poke_dex_10` | 🥉 **Novice Collector** | +5G | Catch and register **10** unique species in the Pokédex. |
| `poke_dex_25` | 🥈 **Seasoned Collector** | +10G | Catch and register **25** unique species in the Pokédex. |
| `poke_dex_50` | 🥇 **Master Collector** | +15G | Catch and register **50** unique species in the Pokédex. |
| `poke_dex_100` | 💎 **Grandmaster Collector**| +20G | Catch and register **100** unique species in the Pokédex. |

---

## 🛠️ 5. Binary Save Parsing Specification

### Generation 1 (Game Boy - 32 KB)
- **Checksum Verification**: Bitwise inverted byte sum across `0x2598`–`0x3522` equals `data[0x3523]`.
- **Party Inspection**: Count at `0x2F2C`, struct starts at `0x2F34` (44 bytes/entry, level at `offset + 0x21`).
- **Money**: 3-byte Binary Coded Decimal (BCD) at `0x25F3`–`0x25F5`.
- **Badges**: 1-byte bitmask at `0x2602`.

### Generation 2 (Game Boy Color - 32 KB)
- **Crystal Checksum**: 16-bit word at `0x2D0D` (sum of `0x2009`–`0x2D0C`).
- **Gold/Silver Checksum**: 16-bit word at `0x2D69` (sum of `0x2009`–`0x2D68`).
- **Party Inspection**: Crystal at `0x2865` / `0x286D`, Gold/Silver at `0x288A` / `0x2892` (48 bytes/entry).
- **Money**: 3-byte big-endian integer at `0x23DC`–`0x23DE`.
- **Johto Badges**: 1-byte bitmask at `0x23E4`.

### Generation 3 (Game Boy Advance - 128 KB)
- **4KB Section Magic Code**: Signature `0x08012025` at section offset `4088`.
- **Dual-Slot Rotation**: Alternates between Slot 1 (`0x0000`) and Slot 2 (`0xE000`); parser selects whichever slot contains higher valid `saveIdx` and valid section sums.
- **Section 0 (Trainer & Dex)**:
  - Pokédex Owned bitset at `0x0028` (32 bytes).
  - Security Key at `0x0AF8` (FRLG) or `0x0AC4` (RSE) for money decryption `rawMoney ^ secKey`.
- **Section 1 (Party Structs)**:
  - FRLG: Team count at `0x0034`, party starts at `0x0038` (100 bytes/entry).
  - RSE: Team count at `0x0234`, party starts at `0x0238` (100 bytes/entry).
- **Section 2 (Game State & Badges)**:
  - Badge byte at `0x0024` (FRLG) or `0x0020` (RSE).

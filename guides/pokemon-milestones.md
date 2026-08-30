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

### 🟡 Johto League & Kanto Return (Gold, Silver, Crystal — 16 Badges Total)

#### Johto Regional League (Badges 1 – 8)
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

#### Post-Game Kanto Regional League Return (Badges 9 – 16)
*After conquering the Pokémon League at Indigo Plateau, trainers travel by S.S. Aqua / Magnet Train to Kanto to assemble the 8 classic Kanto gym badges (`0x23E5` in Crystal / `0x23E4` in Gold/Silver), earning the **`poke_sixteen_badges`** milestone and unlocking the summit of **Mt. Silver**.*

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
| `poke_sixteen_badges` | 👑 **Dual-Region Master (16 Badges)** | 💎 Platinum | Conquer both the Johto and Kanto leagues, assembling all **16 Regional Gym Badges** to unlock the summit of **Mt. Silver**. | **Pokémon Gold, Silver, Crystal** |
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

### Generation 1 (Game Boy - 32 KB SRAM)
* **Checksum Verification**: Bitwise inverted byte sum across `0x2598`–`0x3522` must match `data[0x3523]`. Uninitialized `0xFF` banks are rejected.
* **Party Inspection**:
  * Party count at `0x2F2C` (0 to 6).
  * Structs start at `0x2F34` (44 bytes per entry, internal Gen 1 species index at `offset + 0x00`, level at `offset + 0x21`, HP at `offset + 0x01..0x02`).
  * Fossil species detection: Omanyte (`0x62`), Omastar (`0x63`), Kabuto (`0x5A`), Kabutops (`0x5B`), Aerodactyl (`0xAB`).
  * Legendary species detection: Mewtwo (`0x83`), Mew (`0x15`), Articuno (`0x4A`), Zapdos (`0x4B`), Moltres (`0x49`).
* **Bag Inventory**: Total item count at `0x25C9`, item pairs `[ItemID, Quantity]` at `0x25CA..0x25F1`.
* **Money**: 3-byte Binary Coded Decimal (BCD) at `0x25F3`–`0x25F5` (Max cap: ¥999,999).
* **Badges**: 1-byte bitmask at `0x2602` (Bits 0–7: Boulder to Earth).
* **Pokédex Owned**: 19-byte bitmask across `0x25A3`–`0x25B5` (152 total flags).
* **Hall of Fame**: Victory counter at `0x2596`.
* **Pokémon Yellow Pikachu Friendship**: Friendship byte at `0x271C` (Max happiness unlocked at `>= 200`).

---

### Generation 2 (Game Boy Color - 32 KB SRAM)
* **Checksum Verification**:
  * *Pokémon Crystal*: 16-bit word at `0x2D0D` (sum of bytes `0x2009`–`0x2D0C`).
  * *Pokémon Gold & Silver*: 16-bit word at `0x2D69` (sum of bytes `0x2009`–`0x2D68`).
* **Party Structs**:
  * *Crystal*: Count at `0x2865`, structs start at `0x286D` (48 bytes per entry).
  * *Gold/Silver*: Count at `0x288A`, structs start at `0x2892` (48 bytes per entry).
  * Level byte at `offset + 0x1F`, Friendship at `offset + 0x1B`.
  * Species ID: National Pokédex number (1 to 251) at `offset + 0x00`.
  * Legendary detection: Raikou (`243`), Entei (`244`), Suicune (`245`), Lugia (`249`), Ho-Oh (`250`), Celebi (`251`), Articuno (`144`), Zapdos (`145`), Moltres (`146`), Mewtwo (`150`), Mew (`151`).
  * Fossil detection: Omanyte (`138`), Omastar (`139`), Kabuto (`140`), Kabutops (`141`), Aerodactyl (`142`).
* **Pokérus Detection**: Byte offset `0x1C` in party structure (High nibble = Strain, Low nibble = Days remaining).
* **Shiny Calculation**: DVs at `offset + 0x15` and `offset + 0x16` (`Defense === 10`, `Speed === 10`, `Special === 10`, `Attack` in `[2, 3, 6, 7, 10, 11, 14, 15]`).
* **Money**: 3-byte big-endian integer at `0x23DC` (Crystal) / `0x23DB` (Gold/Silver).
* **Badges**:
  * Johto Badges at `0x23E4` (Crystal) / `0x23E3` (Gold/Silver) (Bits 0–7: Zephyr to Rising).
  * Kanto Badges at `0x23E5` (Crystal) / `0x23E4` (Gold/Silver) (Bits 0–7: Boulder to Earth).
* **Inventory Pockets Scanning**: Universal scan across all 4 pockets (`0x2410`–`0x24B0`) detecting Bicycle (`0x07`), Old Rod (`0x3C`), Good Rod (`0x3D`), Super Rod (`0x3E`), Itemfinder (`0x36`), Squirtbottle (`0x56`), Radio Card / Poké Flute channel (`0x28`), Exp. Share (`0x96`), and Master Ball (`0x01`).
* **Pokédex Owned**: 32-byte bitset at `0x2A4C` (Crystal) / `0x2A27` (Gold/Silver).

---

### Generation 3 (Game Boy Advance - 128 KB Flash)
* **4KB Section Magic Code**: Signature `0x08012025` at section offset `4088`, 16-bit checksum at offset `4086` (sum of 996 32-bit words).
* **Dual-Slot Rotation**: Alternates between Slot 1 (`0x0000`–`0xDFFF`) and Slot 2 (`0xE000`–`0x1BFFF`); parser dynamically validates all 14 section checksums per slot and binds to whichever slot possesses the higher valid `saveIdx`.
* **Section 0 (Trainer & Pokédex)**:
  * Pokédex Owned bitset at `0x0028` (32 bytes = 256 flags).
  * Security Key at `0x0AF8` (FRLG) or `0x0AC4` (RSE) for money decryption `(rawMoney ^ secKey) >>> 0`.
  * Trainer Name verification at `0x0000`–`0x0006`.
* **Section 1 (Party Structs & Substructure Decryption)**:
  * Team count at `0x0034` (FRLG) or `0x0234` (RSE).
  * Party records start at `0x0038` (FRLG) or `0x0238` (RSE), 100 bytes per Pokémon.
  * Level byte at offset `84` (`0x54`), Held Mail ID at offset `85` (`0x55`, defaults to `0xFF` when no mail is held).
  * **48-Byte Substructure XOR Decryption**:
    * Decryption Key: `(Personality ^ OT ID) >>> 0`.
    * Substructure Permutation: Lookup in 24-order table via `(Personality >>> 0) % 24`.
    * **Substructure 0 (Growth)**: National Species ID at bytes `0..1` (`decrypted[growthOffset] | (decrypted[growthOffset + 1] << 8)`).
    * **Substructure 3 (Miscellaneous)**: Authentic Pokérus byte at byte `0` (`decrypted[miscOffset]`).
  * **Legendary Detection**: Rayquaza (`384`), Kyogre (`382`), Groudon (`383`), Latios (`381`), Latias (`380`), Regirock (`377`), Regice (`378`), Registeel (`379`), Jirachi (`385`), Deoxys (`386`), Mewtwo (`150`), Mew (`151`), Articuno (`144`), Zapdos (`145`), Moltres (`146`), Raikou (`243`), Entei (`244`), Suicune (`245`), Lugia (`249`), Ho-Oh (`250`), Celebi (`251`).
  * **Fossil Revival**: Lileep (`345`), Cradily (`346`), Anorith (`347`), Armaldo (`348`), Omanyte (`138`), Omastar (`139`), Kabuto (`140`), Kabutops (`141`), Aerodactyl (`142`).
* **Shiny Calculation**: `(((OT_ID_Low ^ OT_ID_High) ^ (PID_Low ^ PID_High)) < 8) && Personality > 0`.
* **Section 2 (Game State & Badges)**:
  * 8-Badge bitmask at `0x0024` (FRLG) or `0x0020` (RSE) (Bits 0–7: Stone/Boulder to Rain/Earth).

---

## 🧭 6. System Architecture & UI Separation

* **Universal Platform Achievements**: Universal milestones (*Insert Coin*, *Safety Net*, *Multi-Timeline Master*, *Instant Regret?*, *Night Owl*, etc.) are tracked globally, contribute to the 300G Gamerscore, and are displayed on game overview cards under **Milestones Mastered**.
* **Per-Cartridge Pokémon Milestones**: Regional gym badge cases, trainer milestones (*Journey Begun*, *Metamorphosis*, *Pokérus*, *Silph Scope*, *Master Ball*), and Pokédex progression bars are strictly isolated to the dedicated **Pokémon Trainer Milestones & Badge Case** touchscreen tab (Nintendo DS view) and the **Trophy Cabinet Modal**.

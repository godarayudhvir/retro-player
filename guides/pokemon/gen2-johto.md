# 🟡 Generation 2: Johto League & Kanto Return (*Gold, Silver, Crystal*)

This specification details the dual-region 16-badge save format, multi-pocket inventory scanning, shiny DV formulas, and Pokérus strain extraction for Generation 2 Game Boy Color titles.

---

## 💾 Save Memory Map (32 KB Battery SRAM)

| Data Field | Pokémon Crystal Offset | Pokémon Gold / Silver Offset | Encoding & Parsing Logic |
| :--- | :---: | :---: | :--- |
| **Checksum Word** | `0x2D0D` (sum `0x2009`–`0x2D0C`) | `0x2D69` (sum `0x2009`–`0x2D68`) | 16-bit little-endian word sum |
| **Trainer Money** | `0x23DC`–`0x23DE` | `0x23DB`–`0x23DD` | 3-Byte Big-Endian Integer (Max cap: ¥999,999) |
| **Johto Badges (1–8)** | `0x23E4` | `0x23E3` | 1-Byte Bitmask (Zephyr `0x01` to Rising `0x80`) |
| **Kanto Badges (9–16)** | `0x23E5` | `0x23E4` | 1-Byte Bitmask (Boulder `0x01` to Earth `0x80`) |
| **Party Member Count** | `0x2865` | `0x288A` | 1 Byte Integer (0–6) |
| **Party Pokémon Structs** | `0x286D` | `0x2892` | 48 Bytes Per Pokémon (Level at `+0x1F`, Species at `+0x00`) |
| **Pokérus Infection** | `partyStart + 0x1C` | `partyStart + 0x1C` | High nibble = Strain, Low nibble = Days remaining |
| **Shiny DV Validation** | `partyStart + 0x15..0x16` | `partyStart + 0x15..0x16` | `Def===10 && Spd===10 && Spc===10 && Atk in [2,3,6,7,10,11,14,15]` |
| **Inventory Scanning** | `0x2410`–`0x24B0` | `0x2410`–`0x24B0` | Multi-pocket scan across Items, Key Items, Balls, and TMs |
| **Pokédex Owned Bitset** | `0x2A4C`–`0x2A6B` | `0x2A27`–`0x2A46` | 32 Bytes (256 Bit Flags) |

---

## 🪪 Dual-Region 16-Badge League Cases

### 1. Johto Regional League (Badges 1 – 8)
| Bit | Badge Name | Gym Leader | City | Specialization | Milestone ID |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `0x01` | 🪶 **Zephyr Badge** | Falkner | Violet City | Flying | `poke_badge_1` |
| `0x02` | 🐝 **Hive Badge** | Bugsy | Azalea Town | Bug | `poke_badge_2` |
| `0x04` | ⚪ **Plain Badge** | Whitney | Goldenrod City | Normal | `poke_badge_3` |
| `0x08` | 👻 **Fog Badge** | Morty | Ecruteak City | Ghost | `poke_badge_4` |
| `0x10` | 🥊 **Storm Badge** | Chuck | Cianwood City | Fighting | `poke_badge_5` |
| `0x20` | ⚙️ **Mineral Badge** | Jasmine | Olivine City | Steel | `poke_badge_6` |
| `0x40` | ❄️ **Glacier Badge** | Pryce | Mahogany Town | Ice | `poke_badge_7` |
| `0x80` | 🐉 **Rising Badge** | Clair | Blackthorn City | Dragon | `poke_badge_8` |

### 2. Post-Game Kanto League Return (Badges 9 – 16)
| Bit | Badge Name | Gym Leader | City | Specialization | Milestone ID |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `0x01` | 🪨 **Boulder Badge** | Brock | Pewter City | Rock | `poke_badge_kanto_1` |
| `0x02` | 💧 **Cascade Badge** | Misty | Cerulean City | Water | `poke_badge_kanto_2` |
| `0x04` | ⚡ **Thunder Badge** | Lt. Surge | Vermilion City | Electric | `poke_badge_kanto_3` |
| `0x08` | 🌸 **Rainbow Badge** | Erika | Celadon City | Grass | `poke_badge_kanto_4` |
| `0x10` | 💖 **Soul Badge** | Janine | Fuchsia City | Poison | `poke_badge_kanto_5` |
| `0x20` | 🔮 **Marsh Badge** | Sabrina | Saffron City | Psychic | `poke_badge_kanto_6` |
| `0x40` | 🔥 **Volcano Badge** | Blaine | Seafoam Islands | Fire | `poke_badge_kanto_7` |
| `0x80` | 🌍 **Earth Badge** | Blue | Viridian City | Various | `poke_badge_kanto_8` |

After defeating Lance at Indigo Plateau, players cross to Kanto to assemble the 8 classic badges. Gathering all 16 badges triggers the Platinum milestone **`poke_sixteen_badges`** (*Dual-Region Master*) and unlocks access to the summit of Mt. Silver.

---

## 🎒 Inventory & Key Items Recognized

* **Bicycle**: `0x07`
* **Old Rod / Good Rod / Super Rod**: `0x3C` / `0x3D` / `0x3E`
* **Itemfinder**: `0x36`
* **Squirtbottle / Poké Flute Channel**: `0x56` / `0x28`
* **Exp. Share**: `0x96`
* **Master Ball**: `0x01`

---

## 🦕 Gen 2 Legendary & Fossil Species (National Dex IDs)

* **Legendary Pokémon**: Raikou (`243`), Entei (`244`), Suicune (`245`), Lugia (`249`), Ho-Oh (`250`), Celebi (`251`), Articuno (`144`), Zapdos (`145`), Moltres (`146`), Mewtwo (`150`), Mew (`151`).
* **Prehistoric Fossils**: Omanyte (`138`), Omastar (`139`), Kabuto (`140`), Kabutops (`141`), Aerodactyl (`142`).

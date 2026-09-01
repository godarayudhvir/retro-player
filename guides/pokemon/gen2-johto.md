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

## 🪓 Hidden Machines (HMs 01–07) & Utility

| HM / Item | ID | In-Game Name | Milestone Title | Memory Location |
| :---: | :---: | :--- | :--- | :--- |
| **HM01** | `0xF3` | Cut | **Arbor Day Nightmare** | Ilex Forest Charcoal Apprentice rescue |
| **HM02** | `0xF4` | Fly | **Commuter Pass** | Chuck's Wife after 5th Gym (Cianwood) |
| **HM03** | `0xF5` | Surf | **Kimono Connoisseur** | Ecruteak Dance Theater after defeating 5 Kimono Girls |
| **HM04** | `0xF6` | Strength | **Milk Drinker** | Route 42 Sailor / Moomoo Farm |
| **HM05** | `0xF7` | Flash | **Sprout Tower Enlightenment** | Sage Li at the top of Sprout Tower |
| **HM06** | `0xF8` | Whirlpool | **Whirlpool Navigator** | Lance gift after Rocket Hideout in Mahogany Town |
| **HM07** | `0xF9` | Waterfall | **Ice Path Hiker** | Ice Path B1F navigation |
| **All 7 HMs** | — | Johto HM Utility Set | **Johto Swiss Army Knife** | All 7 HM flags/items present in save |

---

## 🎬 Action Story Feats & Event Flag Milestones

| Event Feat | Milestone Title | Milestone Type | Milestone ID | Binary Verification / Event Flag |
| :--- | :--- | :---: | :--- | :--- |
| **Sudowoodo Roadblock** | **Tree Pruner** | 🗺️ Story Feat | `poke_sudowoodo_cleared` | Route 36 Sudowoodo sprayed with Squirtbottle & defeated/caught |
| **Red Gyarados** | **Seeing Red** | 🐲 Boss Feat | `poke_lake_of_rage` | Lake of Rage Shiny Gyarados caught/defeated & Red Scale obtained |
| **Radio Tower Liberation** | **Broadcast Interrupted** | 🏢 Boss Feat | `poke_goldenrod_liberation` | Goldenrod Radio Tower liberated from Executive Archer & Director saved |
| **Sprout Tower Sage** | **Towering Ambition** | 🗺️ Story Feat | `poke_sprout_tower` | Sage Li defeated atop the swaying Sprout Tower pillar |
| **Moomoo Farm Rescue** | **Got Milk?** | 🐮 Story Feat | `poke_moomoo_farm` | Sick Miltank fed 7 Oran Berries until fully recovered |
| **Bug-Catching Contest** | **Entomology Champion** | 🐝 Trainer Feat | `poke_bug_contest` | Win 1st place Sun Stone in National Park Bug-Catching Contest |
| **Legendary Beasts** | **Roamers of Johto** | 🦅 Legendary | `poke_legendary_beasts` | Awaken and capture Raikou, Entei, or Suicune |
| **Tower Duo Guardian** | **Wings of Legend** | 🦅 Legendary | `poke_tower_duo` | Summon and capture Ho-Oh (Tin Tower) or Lugia (Whirl Islands) |
| **Mt. Silver Pinnacle** | **Living Legend** | 👑 League Feat | `poke_champion_red` | Ascend the deepest peak of Mt. Silver and defeat Pokémon Trainer Red |

---

## 🪪 Special Feats & Rarity

* **Shiny Pokémon & Pokérus**: Validated dynamically via Divergent DVs (`0x15`..`0x16`) and viral strains (`+0x1C`).
* **16-Badge Mastery**: Unlocked upon gathering all 8 Johto Badges and all 8 Kanto Badges (`poke_sixteen_badges`).
* **Legendary Pokémon**: Raikou (`243`), Entei (`244`), Suicune (`245`), Lugia (`249`), Ho-Oh (`250`), Celebi (`251`), Articuno (`144`), Zapdos (`145`), Moltres (`146`), Mewtwo (`150`), Mew (`151`).
* **Prehistoric Fossils**: Omanyte (`138`), Omastar (`139`), Kabuto (`140`), Kabutops (`141`), Aerodactyl (`142`).

# 🔴 Generation 1: Kanto Classic (*Red, Blue, Yellow*)

This specification details the binary SRAM save format, checksum validation, and milestone trigger offsets for Generation 1 Game Boy Pokémon titles.

---

## 💾 Save Memory Map (32 KB Battery SRAM)

Gen 1 saves reside in Bank 1 (`0x2000` to `0x3FFF`):

| Address Range | Data Field | Structure / Encoding | Logic & Evaluation |
| :--- | :--- | :--- | :--- |
| `0x2596` | **Hall of Fame Counter** | 1 Byte Unsigned Integer | `count > 0` unlocks Champion milestone |
| `0x2598`–`0x3522` | **Main Data Checksum Payload** | Raw Save Stream | Sum of bytes inverted `~sum & 0xFF` |
| `0x3523` | **Inverted Checksum Byte** | 1 Byte Checksum Target | Must equal `~sum & 0xFF` (Rejects uninitialized `0xFF`) |
| `0x25A3`–`0x25B5` | **Pokédex Owned Bitmask** | 19 Bytes (152 Bit Flags) | Bitcount yields total unique species caught |
| `0x25C9` | **Bag Item Count (`wNumBagItems`)** | 1 Byte Integer (0–20) | Number of active item slots |
| `0x25CA`–`0x25F1` | **Bag Inventory Items** | Item/Qty Pairs `[ID, Qty]` | Scanned for key items (Bicycle `0x06`, Rods `0x3D/0x3F`, Scope `0x48`, Flute `0x49`, Master Ball `0x01`) |
| `0x25F3`–`0x25F5` | **Trainer Money** | 3-Byte Binary Coded Decimal (BCD) | Max cap: ¥999,999 (`0x999999`) |
| `0x2602` | **Kanto Gym Badges** | 1-Byte Bitmask | Bit 0: Boulder ... Bit 7: Earth |
| `0x271C` | **Yellow Pikachu Friendship** | 1 Byte Unsigned (0–255) | `>= 200` unlocks *Pikachu's Best Companion* (Yellow only) |
| `0x2F2C` | **Party Member Count** | 1 Byte Integer (0–6) | Active party size (`=== 6` for Full Squad) |
| `0x2F34` | **Party Pokémon Records** | 44 Bytes Per Pokémon | Offset `+0x00`: Species Internal Index, Offset `+0x21`: Level (1–100) |

---

## 🪪 Kanto Regional League Badge Case

| Bit | Badge Name | Gym Leader | City | Specialization | Milestone ID |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `0x01` | 🪨 **Boulder Badge** | Brock | Pewter City | Rock | `poke_badge_1` |
| `0x02` | 💧 **Cascade Badge** | Misty | Cerulean City | Water | `poke_badge_2` |
| `0x04` | ⚡ **Thunder Badge** | Lt. Surge | Vermilion City | Electric | `poke_badge_3` |
| `0x08` | 🌸 **Rainbow Badge** | Erika | Celadon City | Grass | `poke_badge_4` |
| `0x10` | 💖 **Soul Badge** | Koga | Fuchsia City | Poison | `poke_badge_5` |
| `0x20` | 🔮 **Marsh Badge** | Sabrina | Saffron City | Psychic | `poke_badge_6` |
| `0x40` | 🔥 **Volcano Badge** | Blaine | Cinnabar Island | Fire | `poke_badge_7` |
| `0x80` | 🌍 **Earth Badge** | Giovanni | Viridian City | Ground | `poke_badge_8` |

---

## 🪓 Hidden Machines (HMs 01–05) & Key Items

| HM / Item | ID | In-Game Name | Milestone Title | Memory Location |
| :---: | :---: | :--- | :--- | :--- |
| **HM01** | `0xC4` | Cut | **Property Damage License** | Bag (`0x25C9`), PC (`0x27E6`), Move ID `15` |
| **HM02** | `0xC5` | Fly | **Frequent Flyer Miles** | Bag (`0x25C9`), PC (`0x27E6`), Move ID `19` |
| **HM03** | `0xC6` | Surf | **No Lifeguard on Duty** | Bag (`0x25C9`), PC (`0x27E6`), Move ID `57` |
| **HM04** | `0xC7` | Strength | **Do You Even Lift, Bro?** | Bag (`0x25C9`), PC (`0x27E6`), Move ID `70` |
| **HM05** | `0xC8` | Flash | **High Beams On** | Bag (`0x25C9`), PC (`0x27E6`), Move ID `148` |
| **All 5 HMs** | — | Core HM Set | **Certified Swiss Army Trainer** | All 5 HM flags/items present in save |

---

## 🦅 Legendary Encounters & Prehistoric Science

* **Legendary Birds**:
  * ❄️ **Articuno** (#144, Species `0x4A`): *"Brain Freeze"* (`poke_articuno`)
  * ⚡ **Zapdos** (#145, Species `0x4B`): *"OSHA Violation"* (`poke_zapdos`)
  * 🔥 **Moltres** (#146, Species `0x49`): *"Spicy Chicken"* (`poke_moltres`)
  * 👑 **All 3 Birds**: *"Avian Trifecta"* (`poke_legendary_birds`)
* **The Genetic Apex**:
  * 🧬 **Mewtwo** (#150, Species `0x83`): *"Genetic Hubris"* (`poke_mewtwo`)
* **Revived Prehistoric Fossils**:
  * 🐚 **Omanyte/Omastar** (`0x62`/`0x63`), **Kabuto/Kabutops** (`0x5A`/`0x5B`), **Aerodactyl** (`0xAB`): *"Praise Helix!"* (`poke_fossil_revival`)

---

## 🎬 Action Story Feats & Event Flag Milestones

| Event Feat | Milestone Title | Tier | Milestone ID | Binary Verification / Event Flag |
| :--- | :--- | :---: | :--- | :--- |
| **Snorlax Roadblocks** | **Alarm Clock from Hell** | 🥉 Bronze | `poke_snorlax_cleared` | Route 12 (`0x2A1E`) or Route 16 (`0x2A1F`) Snorlax cleared with Poké Flute |
| **Ghost Marowak** | **Rest in Peace** | 🥉 Bronze | `poke_ghost_marowak` | 6F Pokémon Tower Ghost Marowak unmasked with Silph Scope (`0x2A39`) |
| **Silph Co. Liberation** | **Hostile Takeover Denied** | 🥈 Silver | `poke_silph_co` | 11F Giovanni defeated & Silph President rescued (`0x2A53` / Master Ball) |
| **Saffron Fighting Dojo** | **Mortal Wombat** | 🥉 Bronze | `poke_fighting_dojo` | Karate Master Koichi defeated (`0x2A5D` / Hitmonlee or Hitmonchan) |
| **Saffron Guard Quenched** | **It's All About the Tea** | 🥉 Bronze | `poke_saffron_guard` | Parched guard given beverage to unlock Saffron gates (`0x2A4F`) |
| **S.S. Anne Departure** | **Bon Voyage, Sailor!** | 🥉 Bronze | `poke_ss_anne_departed` | Captain cured of seasickness and luxury liner sets sail (`0x2A00`) |
| **Nugget Bridge Gauntlet** | **Gold Digger** | 🥉 Bronze | `poke_nugget_bridge` | All 5 trainers defeated on Route 24 Nugget Bridge (`0x29F2`) |
| **Mr. Fuji Rescue** | **Senior Citizen Extraction** | 🥉 Bronze | `poke_rescued_mr_fuji` | Top floor of Pokémon Tower stormed to save Mr. Fuji (`0x2A39` / Flute) |

---

## 🟡 Pokémon Yellow Exclusives

* **Max Pikachu Friendship** (`0x271C` $\ge 200$): *"Soulmates on Two Feet"* (`poke_yellow_soulmates`)
* **Anime Gift Starter Trio** (Bulbasaur, Charmander, Squirtle): *"Anime Canon"* (`poke_yellow_starter_trio`)
* **Jessie & James Rocket Encounters**: *"Blasting Off Again!"* (`poke_yellow_rocket_duo`)

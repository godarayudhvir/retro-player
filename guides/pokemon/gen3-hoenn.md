# 🟢 Generation 3: Hoenn League (*Ruby, Sapphire, Emerald*)

This specification details the 128 KB dual-slot rotating Flash save format, 14-section validation, 48-byte XOR substructure decryption, and security-key encryption for Generation 3 Hoenn titles (*Pokémon Ruby, Sapphire, and Emerald*).

---

## 💾 Save Memory Map (128 KB Flash Dual-Slot Rotation)

GBA Pokémon games alternate saves between two 57,344-byte rotation slots to prevent power-loss save corruption:
* **Slot 1**: `0x0000` to `0xDFFF` (Sections 0 to 13)
* **Slot 2**: `0xE000` to `0x1BFFF` (Sections 0 to 13)

### Section Header & Footer Format (4096 Bytes Per Section)
* `offset + 4084`: Section ID (16-bit word, `0` to `13`)
* `offset + 4086`: 16-bit Checksum (Sum of 996 32-bit words across `0x000`–`0xFF4`)
* `offset + 4088`: Magic Signature Code (`0x08012025`)
* `offset + 4092`: 32-bit Save Index Counter (Parser dynamically selects whichever slot has higher index and valid checksums)

---

## 🧩 Hoenn Section Offsets & Data Fields

| Section ID | Name | RSE Base Offset | Extracted Data & Decoding Logic |
| :---: | :--- | :---: | :--- |
| **0** | **Trainer Info & Dex** | `+0x0000` | • **Trainer Name**: `0x0000`–`0x0006`<br>• **Pokédex Owned**: `0x0028` (32 bytes = 256 flags)<br>• **Security Key**: 32-bit integer at `0x0AC4`<br>• **Money**: 32-bit integer at `0x0490` decoded via `(rawMoney ^ secKey) >>> 0` (Max cap: ₽999,999) |
| **1** | **Team & Party** | `+0x0000` | • **Party Count**: 1-byte integer at `0x0234` (0–6)<br>• **Party Records**: Start at `0x0238` (100 bytes per Pokémon)<br>• **Level**: Byte at `pOffset + 84`<br>• **Held Mail ID**: Byte at `pOffset + 85` (defaults to `0xFF` when no mail is held) |
| **2** | **Game State & Badges** | `+0x0000` | • **Hoenn Badges**: 1-byte bitmask at `0x0020` (Stone to Rain) |

---

## 🔐 48-Byte Substructure XOR Decryption (Gen 3 Party Format)

Each 100-byte party Pokémon structure contains 48 encrypted data bytes at byte offset `32`:
1. **Decryption Key**: `Key = (Personality ^ OT ID) >>> 0`
2. **Substructure Ordering Permutation**: Table lookup indexed by `(Personality >>> 0) % 24`:
   * `0` = Growth (Species ID at bytes `0..1`)
   * `1` = Attacks (Move IDs)
   * `2` = EVs & Condition
   * `3` = Miscellaneous (Authentic Pokérus byte at byte `0`)
3. **Shiny Calculation**: `(((OT_ID_Low ^ OT_ID_High) ^ (PID_Low ^ PID_High)) < 8) && Personality > 0`
4. **Level Byte**: Read from unencrypted party struct offset `84` (`0x54`).
5. **Held Mail ID**: Read from party offset `85` (`0x55`, defaults to `0xFF` when no mail is held).

---

## 🪪 Hoenn Regional Gym Badge Case

| Bit | Badge Name | Gym Leader | City | Specialization | Milestone ID |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `0x01` | 🪨 **Stone Badge** | Roxanne | Rustboro City | Rock | `poke_badge_1` |
| `0x02` | 🥊 **Knuckle Badge** | Brawly | Dewford Town | Fighting | `poke_badge_2` |
| `0x04` | ⚡ **Dynamo Badge** | Wattson | Mauville City | Electric | `poke_badge_3` |
| `0x08` | 🌋 **Heat Badge** | Flannery | Lavaridge Town | Fire | `poke_badge_4` |
| `0x10` | ⚖️ **Balance Badge** | Norman | Petalburg City | Normal | `poke_badge_5` |
| `0x20` | 🪶 **Feather Badge** | Winona | Fortree City | Flying | `poke_badge_6` |
| `0x40` | 🔮 **Mind Badge** | Tate & Liza | Mossdeep City | Psychic | `poke_badge_7` |
| `0x80` | 💧 **Rain Badge** | Wallace / Juan | Sootopolis City | Water | `poke_badge_8` |

---

---

## 🪓 Hidden Machines (HMs 01–08) & Utility

| HM / Item | ID | In-Game Name | Milestone Title | Memory Location |
| :---: | :---: | :--- | :--- | :--- |
| **HM01** | `0x153` | Cut | **Rustboro Landscaping** | Rustboro Cutter's House |
| **HM02** | `0x154` | Fly | **Airspace Cleared** | Rival battle on Route 119 |
| **HM03** | `0x155` | Surf | **Wally's Gratitude** | Wally's Uncle after defeating Petalburg Gym |
| **HM04** | `0x156` | Strength | **Tunnel Demolition** | Rusturf Tunnel cleared with Rock Smash |
| **HM05** | `0x157` | Flash | **Granite Cave Lantern** | Hiker at Granite Cave entrance |
| **HM06** | `0x158` | Rock Smash | **Mauville Gravel** | Mauville City Scientist |
| **HM07** | `0x159` | Waterfall | **Cave of Origin Ascent** | Cave of Origin / Sootopolis Gym |
| **HM08** | `0x15A` | Dive | **Submarine Depths** | Steven's gift in Mossdeep City |
| **All 8 HMs** | — | Hoenn HM Master Set | **Hoenn Nautical Master** | All 8 HM flags/items present in save |

---

## 🎬 Action Story Feats & Event Flag Milestones

| Event Feat | Milestone Title | Milestone Type | Milestone ID | Binary Verification / Event Flag |
| :--- | :--- | :---: | :--- | :--- |
| **Kecleon Unmasked** | **Camouflage Broken** | 🗺️ Story Feat | `poke_kecleon_scope` | Route 120 invisible Kecleon revealed with Devon Scope |
| **Mt. Chimney Volcano** | **Meteorite Crisis** | 🌋 Boss Feat | `poke_mt_chimney` | Maxie / Archie defeated at Mt. Chimney crater & Meteorite saved |
| **Weather Trio Awakening** | **Primal Clashing** | 🦅 Legendary | `poke_weather_trio` | Kyogre or Groudon calmed/captured in Cave of Origin |
| **Sky Pillar Ascent** | **Dragon of the Ozone** | 🦅 Legendary | `poke_rayquaza_ascend` | Traverse Mach Bike fractures and awaken Rayquaza atop Sky Pillar |
| **Sealed Chamber Braille** | **Ancient Cryptography** | 🗿 Mystery Feat | `poke_sealed_chamber` | Decipher Braille chamber with Relicanth & Wailord to open Regi tombs |
| **Trick House Master** | **Trick Master Outsmarted** | 🎪 Puzzle Feat | `poke_trick_house` | Clear all 8 puzzle scroll mazes in the Route 110 Trick House |
| **Battle Frontier Silver** | **Frontier Symbolist** | 🏆 League Feat | `poke_frontier_silver` | Defeat any Frontier Brain to claim a Silver Frontier Symbol (*Emerald*) |

---

## 🦕 Hoenn Recognized Species (National Dex IDs)

* **Legendary Pokémon**: Rayquaza (`384`), Kyogre (`382`), Groudon (`383`), Latios (`381`), Latias (`380`), Regirock (`377`), Regice (`378`), Registeel (`379`), Jirachi (`385`), Deoxys (`386`).
* **Prehistoric Fossils**: Lileep (`345`), Cradily (`346`), Anorith (`347`), Armaldo (`348`).

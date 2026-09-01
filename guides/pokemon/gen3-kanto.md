# 🔴 Generation 3: Kanto Remakes (*FireRed & LeafGreen*)

This specification details the binary Flash save format, Section mapping, security-key encryption, and milestone trigger offsets for Generation 3 Game Boy Advance Kanto remake titles (*Pokémon FireRed* and *Pokémon LeafGreen*).

---

## 💾 Save Memory Map (128 KB Flash Dual-Slot Rotation)

*Pokémon FireRed* and *Pokémon LeafGreen* alternate saves between two 57,344-byte rotation slots to protect save integrity:
* **Slot 1**: `0x0000` to `0xDFFF` (Sections 0 to 13)
* **Slot 2**: `0xE000` to `0x1BFFF` (Sections 0 to 13)

### Section Header & Footer Structure (4096 Bytes Per Section)
* `offset + 4084`: Section ID (16-bit word, `0` to `13`)
* `offset + 4086`: 16-bit Checksum (Sum of 996 32-bit words across `0x000`–`0xFF4`)
* `offset + 4088`: Magic Signature Code (`0x08012025`)
* `offset + 4092`: 32-bit Save Index Counter (Parser selects whichever slot has higher index and valid checksums)

---

## 🧩 FRLG Section Offsets & Data Fields

| Section ID | Name | FRLG Base Offset | Extracted Data & Decoding Logic |
| :---: | :--- | :---: | :--- |
| **0** | **Trainer Info & Dex** | `+0x0000` | • **Trainer Name**: `0x0000`–`0x0006`<br>• **Pokédex Owned**: `0x0028` (32 bytes = 256 flags; Bit 6 = Bulbasaur/Charmander starter)<br>• **Security Key**: 32-bit integer at `0x0AF8`<br>• **Money**: 32-bit integer at `0x0490` decoded via `(rawMoney ^ secKey) >>> 0` (Max cap: ₽999,999) |
| **1** | **Team & Party** | `+0x0000` | • **Party Count**: 1-byte integer at `0x0034` (0–6)<br>• **Party Records**: Start at `0x0038` (100 bytes per Pokémon)<br>• **Level**: Byte at `pOffset + 84`<br>• **Held Mail ID**: Byte at `pOffset + 85` (defaults to `0xFF` when no mail is held) |
| **2** | **Game State & Badges** | `+0x0000` | • **Kanto Badges**: 1-byte bitmask at `0x0024` (Boulder to Earth) |

---

## 🔐 48-Byte Substructure XOR Decryption

Party Pokémon records in *FireRed/LeafGreen* store 48 encrypted data bytes at byte offset `32`:
1. **Decryption Key**: `Key = (Personality ^ OT ID) >>> 0`
2. **Substructure Permutation**: 24-order table indexed by `(Personality >>> 0) % 24`:
   * **Substructure 0 (Growth)**: National Species ID at bytes `0..1` (`decrypted[growthOffset] | (decrypted[growthOffset + 1] << 8)`)
   * **Substructure 1 (Attacks)**: Moves and PP
   * **Substructure 2 (EVs)**: Effort Values & Condition
   * **Substructure 3 (Miscellaneous)**: Authentic Pokérus byte at byte `0` (`decrypted[miscOffset]`)
3. **Shiny Formula**: `(((OT_ID_Low ^ OT_ID_High) ^ (PID_Low ^ PID_High)) < 8) && Personality > 0`

---

## 🪪 Kanto Remake Regional Badge Case (FRLG)

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

---

## 🪓 Hidden Machines (HMs 01–07) & Utility

| HM / Item | In-Game Name | Milestone Title | Memory Location |
| :---: | :--- | :--- | :--- |
| **HM01** | Cut | **Property Damage License** | S.S. Anne Captain in Vermilion Port |
| **HM02** | Fly | **Frequent Flyer Miles** | Route 16 Secret House |
| **HM03** | Surf | **No Lifeguard on Duty** | Safari Zone Secret House |
| **HM04** | Strength | **Do You Even Lift, Bro?** | Fuchsia City Warden (Gold Teeth) |
| **HM05** | Flash | **High Beams On** | Route 2 Oak's Aide (requires 10 catches) |
| **HM06** | Rock Smash | **Ember Spa Geothermal** | One Island Ember Spa Master |
| **HM07** | Waterfall | **Icefall Cavern Climber** | Four Island Icefall Cave |
| **All 7 HMs** | Kanto Remake HM Set | **Kanto Master Outdoorsman** | All 7 HM flags/items present in save |

---

## 🎬 Action Story Feats & Event Flag Milestones

| Event Feat | Milestone Title | Milestone Type | Milestone ID | Binary Verification / Event Flag |
| :--- | :--- | :---: | :--- | :--- |
| **Snorlax Roadblocks** | **Alarm Clock from Hell** | 🗺️ Story Feat | `poke_snorlax_cleared` | Route 12 or Route 16 Snorlax cleared with Poké Flute |
| **Ghost Marowak** | **Rest in Peace** | 🗺️ Story Feat | `poke_ghost_marowak` | 6F Pokémon Tower Ghost Marowak unmasked with Silph Scope |
| **Silph Co. Liberation** | **Hostile Takeover Denied** | 🏢 Boss Feat | `poke_silph_co` | 11F Giovanni defeated & Silph President rescued |
| **Saffron Fighting Dojo** | **Mortal Wombat** | 🥋 Dojo Feat | `poke_fighting_dojo` | Karate Master Koichi defeated (Hitmonlee/Hitmonchan earned) |
| **Saffron Guard Quenched** | **It's All About the Tea** | 🗺️ Story Feat | `poke_saffron_guard` | Celadon Mansion Old Lady Tea given to thirsty guard |
| **S.S. Anne Departure** | **Bon Voyage, Sailor!** | 🚢 Story Feat | `poke_ss_anne_departed` | Captain cured of seasickness and luxury liner sets sail |
| **Sevii Islands Connection** | **Network Machine Linked** | 🏝️ Story Feat | `poke_network_machine` | Deliver Ruby (Mt. Ember) & Sapphire (Dotted Hole) to Celio on One Island |
| **Genetic Apex Encounter** | **Genetic Hubris** | 🦅 Legendary | `poke_mewtwo` | Descend into Cerulean Cave and capture Mewtwo |
| **Indigo Plateau Rematch** | **Indigo Plateau Champion** | 👑 League Feat | `poke_hall_of_fame` | Defeat upgraded Elite Four and Rival to enter the Hall of Fame |

---

## 🦕 Recognized Species & Sevii Extensions

* **Legendary Pokémon**: Mewtwo (`150`), Mew (`151`), Articuno (`144`), Zapdos (`145`), Moltres (`146`), Raikou (`243`), Entei (`244`), Suicune (`245`), Lugia (`249`), Ho-Oh (`250`), Deoxys (`386`).
* **Prehistoric Fossils**: Omanyte (`138`), Omastar (`139`), Kabuto (`140`), Kabutops (`141`), Aerodactyl (`142`).

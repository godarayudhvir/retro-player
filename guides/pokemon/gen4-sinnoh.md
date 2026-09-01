# ❄️ Generation 4: Sinnoh League & Johto Remakes (*Diamond, Pearl, Platinum, HeartGold, SoulSilver*)

This specification details the binary Flash/DSV save format, CRC16-CCITT checksum verification, Small Block data structures, and milestone trigger offsets for Generation 4 Nintendo DS Pokémon titles.

---

## 💾 Save Memory Map (512 KB Flash / .sav / .dsv)

Generation 4 games utilize a ping-pong rotation architecture with two 256 KB slots (Slot 1 at `0x00000`, Slot 2 at `0x40000`):

| Data Field | Diamond / Pearl Offset | Platinum Offset | HeartGold / SoulSilver Offset | Encoding & Parsing Logic |
| :--- | :---: | :---: | :---: | :--- |
| **Small Block Offset** | `0xC100` | `0xCF2C` | `0xF628` | Block holding Trainer Info, Money, Badges |
| **CRC16-CCITT** | `smallBlock + length - 2` | `smallBlock + length - 2` | `smallBlock + length - 2` | Polynomial `0x1021`, initial `0xFFFF` |
| **Trainer Money** | `smallBlock + 0x00` | `smallBlock + 0x00` | `smallBlock + 0x00` | 4-Byte Little-Endian Integer (Encrypted with Security Key in DPPt) |
| **Gym Badges (1–8)** | `smallBlock + 0x08` | `smallBlock + 0x08` | `smallBlock + 0x08` | 1-Byte Bitmask (Coal `0x01` to Beacon `0x80` / Zephyr to Rising) |
| **Kanto Badges (9–16)** | — | — | `smallBlock + 0x09` | 1-Byte Bitmask (Boulder `0x01` to Earth `0x80` in HGSS) |
| **Party Member Count** | General Block | General Block | General Block | 1 Byte Integer (0–6) |
| **Party Pokémon Structs** | `236` Bytes per Pokémon | `236` Bytes per Pokémon | `236` Bytes per Pokémon | Decrypted via Personality Value (PID) & Checksum PRNG |

---

## 🪓 Hidden Machines (HMs 01–08) & Utility

| HM / Item | In-Game Name | Milestone Title | Memory Location |
| :---: | :--- | :--- | :--- |
| **HM01** | Rock Smash | **Oreburgh Excavator** | Oreburgh Gate Hiker |
| **HM02** | Cut | **Gardenia's Shears** | Cynthia gift in Eterna City |
| **HM03** | Fly | **Galactic Aviator** | Team Galactic Warehouse in Veilstone |
| **HM04** | Surf | **Celestic Folklore** | Cynthia's Grandmother in Celestic Town |
| **HM05** | Defog / Whirlpool | **Fog Dissipator** | Great Marsh Safari Zone (DPPt) / HGSS |
| **HM06** | Strength | **Lost Tower Rescuer** | Lost Tower 5F Grandmother |
| **HM07** | Waterfall | **Sunyshore Navigator** | Gym Leader Jasmine at Sunyshore Beach |
| **HM08** | Rock Climb | **Blizzard Scaler** | Route 217 in the deep snowstorm |
| **All 8 HMs** | Sinnoh HM Master Set | **Sinnoh Mountain Climber** | All 8 HM flags/items present in save |

---

## 🎬 Action Story Feats & Event Flag Milestones

| Event Feat | Milestone Title | Milestone Type | Milestone ID | Binary Verification / Event Flag |
| :--- | :--- | :---: | :--- | :--- |
| **Spear Pillar Climax** | **Ruler of Time & Space** | 🦅 Legendary | `poke_spear_pillar` | Dialga or Palkia captured/calmed atop Spear Pillar |
| **Distortion World** | **Shadow of the Anti-Matter** | 🌌 Mystery Feat | `poke_distortion_world` | Traverse the upside-down Distortion World and calm Giratina (*Platinum*) |
| **Galactic HQ Raid** | **Cosmic Delusions** | 🏢 Boss Feat | `poke_galactic_liberation` | Infiltrate Veilstone Galactic HQ and liberate the Lake Guardians (Uxie, Mesprit, Azelf) |
| **Lake Verity Rescue** | **Courage at Lake Verity** | 🗺️ Story Feat | `poke_lake_verity` | Defeat Commander Mars at Lake Verity |
| **Underground Miner** | **Down in the Dirt** | ⛏️ Mining Feat | `poke_sinnoh_underground` | Excavate ancient fossils and spheres in the Sinnoh Underground |
| **Sinnoh League Champion** | **Sinnoh League Champion** | 👑 League Feat | `poke_hall_of_fame` | Defeat the Elite Four and Champion Cynthia at the Pokémon League |

---

## 🦕 Gen 4 Recognized Species (National Dex IDs)

* **Legendary Pokémon**: Dialga (`483`), Palkia (`484`), Giratina (`487`), Arceus (`493`), Darkrai (`491`), Shaymin (`492`), Cresselia (`488`), Heatran (`485`), Regigigas (`486`), Uxie (`480`), Mesprit (`481`), Azelf (`482`), Manaphy (`490`), Phione (`489`).
* **Prehistoric Fossils**: Cranidos (`408`), Rampardos (`409`), Shieldon (`410`), Bastiodon (`411`).

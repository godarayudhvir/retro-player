# ⚡ Generation 5: Unova League (*Black, White, Black 2, White 2*)

This specification details the binary Flash/DSV save format, Block 23 Trainer Info parsing, CRC16-CCITT integrity validation, and milestone trigger offsets for Generation 5 Nintendo DS Pokémon titles.

---

## 💾 Save Memory Map (512 KB Flash / .sav / .dsv)

Generation 5 uses partitioned dynamic sub-blocks within two 256 KB rotation slots (Slot 1 at `0x00000`, Slot 2 at `0x24000`):

| Data Field | Block / Offset | Structure & Encoding | Parsing Logic |
| :--- | :--- | :--- | :--- |
| **Block 23 (Trainer Info)** | `0x19400`–`0x194B0` | Raw Block Stream | Contains Trainer ID, Gender, Money, Gym Badges |
| **CRC16-CCITT** | Block Footer (2 Bytes) | Polynomial `0x1021` | Verifies integrity of Block 23 |
| **Trainer Money** | `Block 23 + 0xB0` | 4-Byte Little-Endian Integer | Maximum cap: ¥9,999,999 |
| **Unova Badges (1–8)** | `Block 23 + 0x08` | 1-Byte Bitmask | Bit 0: Trio ... Bit 7: Legend |
| **Party Member Count** | General Block | 1 Byte Integer (0–6) | Active party count |
| **Party Pokémon Structs** | `220` Bytes per Pokémon | Gen 5 Substructure Encryption | Personality Value (PID) & Checksum PRNG |

---

## 🪓 Hidden Machines (HMs 01–06) & Utility

| HM / Item | In-Game Name | Milestone Title | Memory Location |
| :---: | :--- | :--- | :--- |
| **HM01** | Cut | **Dreamyard Landscaper** | Fennel after defeating Striaton Gym |
| **HM02** | Fly | **Castelia Wings** | Bianca gift after defeating Castelia Gym |
| **HM03** | Surf | **Twist Mountain Waves** | Champion Alder on Route 7 / Twist Mountain |
| **HM04** | Strength | **Nimbasa Heavyweight** | Nimbasa City northwestern house |
| **HM05** | Waterfall | **Route 18 Cascades** | Route 18 southeastern shore |
| **HM06** | Dive | **Undella Abyssal Ruins** | Undella Town girl outside villa |
| **All 6 HMs** | Unova HM Utility Set | **Unova Metropolitan Navigator** | All 6 HM flags/items present in save |

---

## 🎬 Action Story Feats & Event Flag Milestones

| Event Feat | Milestone Title | Milestone Type | Milestone ID | Binary Verification / Event Flag |
| :--- | :--- | :---: | :--- | :--- |
| **Dreamyard Dream Mist** | **Dreamer’s Awakening** | 🗺️ Story Feat | `poke_dreamyard` | Defeat Team Plasma grunts in Dreamyard and rescue Munna |
| **Dragonspiral Tower Climax** | **Hero of Truth & Ideals** | 🦅 Legendary | `poke_dragonspiral` | Witness the awakening of Reshiram / Zekrom atop Dragonspiral Tower |
| **N's Castle Liberation** | **Philosophy of Ideals** | 👑 Boss Feat | `poke_ns_castle` | Infiltrate N's Castle, defeat King N and Ghetsis, and save Unova |
| **Abyssal Ruins Relics** | **Abyssal Archaeologist** | 🏛️ Mystery Feat | `poke_abyssal_ruins` | Decipher ancient Unovan script and collect the 16 ancient crowns/plates |
| **Swords of Justice** | **Sacred Musketeers** | 🦅 Legendary | `poke_swords_of_justice` | Track and capture Cobalion, Terrakion, and Virizion |
| **Unova League Champion** | **Unova League Champion** | 👑 League Feat | `poke_hall_of_fame` | Defeat the Elite Four and Champion Alder / Iris to enter the Hall of Fame |

---

## 🦕 Gen 5 Recognized Species (National Dex IDs)

* **Legendary Pokémon**: Victini (`494`), Cobalion (`638`), Terrakion (`639`), Virizion (`640`), Tornadus (`641`), Thundurus (`642`), Reshiram (`643`), Zekrom (`644`), Landorus (`645`), Kyurem (`646`), Keldeo (`647`), Meloetta (`648`), Genesect (`649`).
* **Prehistoric Fossils**: Tirtouga (`564`), Carracosta (`565`), Archen (`566`), Archeops (`567`).

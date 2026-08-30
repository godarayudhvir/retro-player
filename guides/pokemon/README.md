# 🏆 Pokémon Save Inspector & Regional Milestones Hub (Gen 1 – Gen 3)

Welcome to the **Pokémon Save Inspector & Regional Milestones Guide Hub**. Retro Player features an authentic, zero-hack binary save analyzer capable of inspecting SRAM and Flash memory banks across 11 canonical Pokémon cartridges to unlock tailored storyline achievements, Pokédex progression bars, and 8/16-badge regional gym cases.

---

## 🗂️ Guide Directory by Generation

| Document | Generation | Platform | Supported Cartridges | Key Architecture Highlights |
| :--- | :---: | :---: | :--- | :--- |
| **[Gen 1: Kanto Classic](gen1-kanto.md)** | **Gen 1** | GB | *Red*, *Blue*, *Yellow* | 32 KB SRAM, Inverted Checksum (`0x3523`), 8 Kanto Badges (`0x2602`), Yellow Pikachu Friendship (`0x271C`) |
| **[Gen 2: Johto & Kanto Return](gen2-johto.md)** | **Gen 2** | GBC | *Gold*, *Silver*, *Crystal* | 32 KB SRAM, 16 Badges Dual-Case, Multi-Pocket Inventory Scan (`0x2410`–`0x24B0`), DV Shiny Math & Pokérus |
| **[Gen 3: Hoenn League](gen3-hoenn.md)** | **Gen 3** | GBA | *Ruby*, *Sapphire*, *Emerald* | 128 KB Flash (Dual 57KB Rotation Slots), RSE Base Offsets, 48-byte XOR Decryption, Devon Scope & PokéNav |
| **[Gen 3: Kanto Remakes](gen3-kanto.md)** | **Gen 3** | GBA | *FireRed*, *LeafGreen* | 128 KB Flash, FRLG Base Offsets, Security Key Money Decryption, Silph Scope & Sevii Islands |

---

## 📌 Mainline Cartridge Verification Matrix

All 11 canonical Gen 1–3 cartridges have been verified against real battery save files in `ref_save_files/`:

| Generation | System | Game Title | Save Format | Test Verification | Core Memory Signatures |
| :---: | :---: | :--- | :---: | :---: | :--- |
| **Gen 1** | GB | *Pokémon Red Version* | 32 KB SRAM | ✅ Verified | Checksum `0x3523`, Badges `0x2602`, Bag `0x25CA` |
| **Gen 1** | GB | *Pokémon Blue Version* | 32 KB SRAM | ✅ Verified | Checksum `0x3523`, Badges `0x2602`, Bag `0x25CA` |
| **Gen 1** | GB | *Pokémon Yellow Version* | 32 KB SRAM | ✅ Verified | Checksum `0x3523`, Pikachu Friendship `0x271C` |
| **Gen 2** | GBC | *Pokémon Gold Version* | 32 KB SRAM | ✅ Verified | Checksum `0x2D69`, Johto (`0x23E3`) & Kanto (`0x23E4`) 16 Badges |
| **Gen 2** | GBC | *Pokémon Silver Version* | 32 KB SRAM | ✅ Verified | Checksum `0x2D69`, Johto (`0x23E3`) & Kanto (`0x23E4`) 16 Badges |
| **Gen 2** | GBC | *Pokémon Crystal Version* | 32 KB SRAM | ✅ Verified | Checksum `0x2D0D`, Johto (`0x23E4`) & Kanto (`0x23E5`) 16 Badges |
| **Gen 3** | GBA | *Pokémon Ruby Version* | 64/128 KB Flash | ✅ Verified | 14 Rotating Sections, Substructure XOR Decryption |
| **Gen 3** | GBA | *Pokémon Sapphire Version* | 64/128 KB Flash | ✅ Verified | 14 Rotating Sections, Substructure XOR Decryption |
| **Gen 3** | GBA | *Pokémon Emerald Version* | 128 KB Flash | ✅ Verified | 14 Rotating Sections, Substructure XOR Decryption |
| **Gen 3** | GBA | *Pokémon FireRed Version* | 128 KB Flash | ✅ Verified | 14 Rotating Sections, Substructure XOR Decryption |
| **Gen 3** | GBA | *Pokémon LeafGreen Version* | 128 KB Flash | ✅ Verified | 14 Sections, Substructure XOR Decryption |
| **Gen 4** | NDS | *Diamond, Pearl, Platinum, HGSS* | 512 KB EEPROM | ⏳ *In Roadmap* | Documented in [`mirai/pokemon-save-gen4-gen5.md`](../../mirai/pokemon-save-gen4-gen5.md) |
| **Gen 5** | NDS | *Black, White, Black 2, White 2* | 512 KB Flash | ⏳ *In Roadmap* | Documented in [`mirai/pokemon-save-gen4-gen5.md`](../../mirai/pokemon-save-gen4-gen5.md) |

---

## 🧭 System Architecture & UI Separation

* **Universal Platform Achievements**: 24 platform achievements (Insert Coin, Safety Net, Night Owl, etc.) are tracked globally, contribute to the 300G Gamerscore, and appear under **Milestones Mastered** on game overview cards.
* **Per-Cartridge Pokémon Milestones**: Regional gym badge cases (8 badges for Kanto/Hoenn, 16 badges for Johto), Pokédex catch counters, and trainer feats are strictly isolated to the **Pokémon Trainer Milestones & Badge Case** tab in Nintendo DS View and the Trophy Cabinet.

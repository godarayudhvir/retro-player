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

## 🦖 Gen 1 Special Species Recognition

* **Revived Prehistoric Fossils**: Omanyte (`0x62`), Omastar (`0x63`), Kabuto (`0x5A`), Kabutops (`0x5B`), Aerodactyl (`0xAB`).
* **Legendary Encounters**: Mewtwo (`0x83`), Mew (`0x15`), Articuno (`0x4A`), Zapdos (`0x4B`), Moltres (`0x49`).

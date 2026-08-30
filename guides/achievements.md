# 🏆 Universal Achievements & Player Milestones Guide

This guide contains the master registry of all **24 Universal Organic Achievements & Milestones** in Retro Player. Every achievement is 100% universal across all 12 retro systems and works out-of-the-box with any standard ROM file without requiring emulator memory hacking.

The achievement system features a balanced **6 Categories × 4 Tiers (1 Bronze, 1 Silver, 1 Gold, 1 Platinum)** distribution:
- 🥉 **Bronze (+5G)**: 6 Trophies = 30G
- 🥈 **Silver (+10G)**: 6 Trophies = 60G
- 🥇 **Gold (+15G)**: 6 Trophies = 90G
- 💎 **Platinum (+20G)**: 6 Trophies = 120G
- **🏆 Total Obtainable Gamer Score: 300G**

> 📖 **Pokémon Save Inspector Guide**: For game-specific cartridge milestones, Gym Badge Cases, and memory parsing specifications across Pokémon Red, Blue, Yellow, Gold, Silver, Crystal, Ruby, Sapphire, Emerald, FireRed, and LeafGreen, see the dedicated **[Pokémon Save Inspector & Regional Milestones Guide](pokemon-milestones.md)**.

> **Status Checklist**: Use the `Status / Working` column to mark off testing verification on your local setup (✅ Verified Working).

---

## 🎮 Category A: Catalog & Exploration (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `first_launch` | **Insert Coin** | Launch your very first retro game in Retro Player. | `totalLaunches >= 1` | Global |
| ✅ | 🥈 Silver | +10G | `console_hopper` | **Console Hopper** | Play at least one game across 3 distinct retro systems. | Unique system keys played `>= 3` | Global |
| ✅ | 🥇 Gold | +15G | `gen_traveler` | **Generation Traveler** | Play games across 8-bit, 16-bit, and 32/64-bit platforms. | Played `[NES/GB/GG]` + `[SNES/MD]` + `[N64/PS1/NDS/GBA]` | Global |
| ✅ | 💎 Platinum | +20G | `full_spectrum` | **Full Spectrum** | Play at least one game on every supported system in your library. | All detected library systems played | Global |

---

## ⏱️ Category B: Playtime & Endurance (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `warming_up` | **Warming Up** | Log 15 cumulative minutes of gameplay across any games. | Cumulative playtime `>= 900s` (15m) | Global |
|  | 🥈 Silver | +10G | `marathon_runner` | **Marathon Runner** | Play a single game continuously for 1 hour in one sitting. | Single session duration `>= 3600s` (1h) | Per-ROM |
|  | 🥇 Gold | +15G | `loyal_companion` | **Loyal Companion** | Spend 2 total hours played on a single title. | Cumulative single-game playtime `>= 7200s` (2h) | Per-ROM |
|  | 💎 Platinum | +20G | `ironman_endurance` | **Ironman Endurance** | Play a single game continuously for 7 hours in one sitting. | Single session duration `>= 25200s` (7h) | Per-ROM |

---

## 📅 Category C: Habits & Streaks (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
|  | 🥉 Bronze | +5G | `weekend_warrior` | **Weekend Warrior** | Play games on both Saturday and Sunday of the same weekend. | Active calendar dates include Sat & Sun | Global |
| ✅ | 🥈 Silver | +10G | `night_owl` | **Night Owl** | Boot any retro game between 11:00 PM and 4:00 AM local time. | Browser local hour `h >= 23 || h < 4` | Global |
|  | 🥇 Gold | +15G | `daily_streak_3` | **Dedicated Gamer** | Play games for 3 consecutive days in a row. | Consecutive active calendar days `>= 3` | Global |
|  | 💎 Platinum | +20G | `weekly_streak_7` | **Relentless Habit** | Play games for 7 consecutive days in a row. | Consecutive active calendar days `>= 7` | Global |

---

## 🎭 Category D: Retro Quirks (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `rage_quit` | **Instant Regret?** | Exit a game in under 45 seconds of launching. | Session duration `3s < s < 45s` | Global |
| ✅ | 🥈 Silver | +10G | `need_for_speed` | **Need for Speed** | Keep Fast-Forward active continuously for over 45 seconds. | Continuous fast-forward `>= 45s` | Global |
|  | 🥇 Gold | +15G | `window_shopper` | **Window Shopper** | Idle in the cartridge library with BGM playing for > 5 minutes. | Menu idle duration `>= 300s` | Global |
|  | 💎 Platinum | +20G | `button_masher` | **Button Masher** | Register 1,500+ total gamepad/keyboard input events in a single session. | Active session button count `>= 1500` | Per-ROM |

---

## 💾 Category E: Saves & Preservation (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `safety_net` | **Safety Net** | Create your very first Quick Save state snapshot. | Save state created (`Slot 0`) | Global |
| ✅ | 🥈 Silver | +10G | `save_scummer` | **Save Scummer** | Create 10 save states in a single game. | Game save state count `>= 10` | Per-ROM |
| ✅ | 🥇 Gold | +15G | `timeline_master` | **Multi-Timeline Master** | Use both Auto-Resume and Manual Load State in the same title. | Auto-Resume + Load State used | Per-ROM |
| ✅ | 💎 Platinum | +20G | `vault_custodian` | **Vault Custodian** | Export a full JSON database backup snapshot from Storage Studio. | Storage Studio backup export | Global |

---

## 🎨 Category F: Shell & Hardware (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `audiophile` | **Audiophile** | Listen to at least 3 distinct chiptune BGM background music tracks. | Unique BGM tracks played `>= 3` | Global |
| ✅ | 🥈 Silver | +10G | `chameleon` | **Chameleon** | Toggle between Light and Dark mode 5 times. | Theme toggles `>= 5` | Global |
| ✅ | 🥇 Gold | +15G | `retro_purist` | **Retro Purist** | Toggle ON the authentic CRT scanline shader during gameplay. | CRT filter enabled | Global |
| ✅ | 💎 Platinum | +20G | `certified_tactile`| **Certified Tactile** | Connect and use a real physical USB or Bluetooth gamepad controller. | Physical gamepad button/axis input detected | Global |

---

## ⚡ Category G: Pokémon Trainer Milestones (Per-ROM Scoped)

| Status | Tier | ID | Title | Universal Requirement | Evaluation Logic / Byte Source | Scope |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ⏳ | 🥉 Bronze | `poke_journey_begun` | **Journey Begun** | Receive your first starter Pokémon companion. | `summary.hasStarter === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_digital_cartographer` | **Digital Cartographer** | Acquire Town Map / Pokégear / Device. | `summary.keyItems.townMap === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_first_catch` | **First Wild Catch** | Register first non-starter capture. | `summary.hasFirstCatch === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_gone_fishin` | **Gone Fishin'** | Acquire your first fishing rod (Old / Good Rod). | `oldRod || goodRod === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_full_party` | **Full Battle Party** | Assemble 6 battle Pokémon in party. | `summary.hasFullParty === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_pedal_to_metal` | **Pedal to the Metal** | Acquire the Bicycle key item. | `summary.keyItems.bicycle === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_evolution_master` | **Evolution Master** | Evolve a Pokémon into a new stage. | `summary.hasEvolved === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_badge_1` | **First Badge of Honor** | Defeat Gym Leader 1 & earn Badge 1. | `summary.badges[0] === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_badge_2` | **Second Badge Claimed** | Defeat Gym Leader 2 & earn Badge 2. | `summary.badges[1] === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_badge_3` | **Third Badge Claimed** | Defeat Gym Leader 3 & earn Badge 3. | `summary.badges[2] === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_badge_4` | **Fourth Badge Claimed** | Defeat Gym Leader 4 & earn Badge 4. | `summary.badges[3] === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_badge_5` | **Fifth Badge Claimed** | Defeat Gym Leader 5 & earn Badge 5. | `summary.badges[4] === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_badge_6` | **Sixth Badge Claimed** | Defeat Gym Leader 6 & earn Badge 6. | `summary.badges[5] === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_badge_7` | **Seventh Badge Claimed** | Defeat Gym Leader 7 & earn Badge 7. | `summary.badges[6] === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_badge_8` | **Eighth Badge Claimed** | Defeat Gym Leader 8 & earn Badge 8. | `summary.badges[7] === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_treasure_hunter` | **Treasure Hunter** | Acquire the Itemfinder / Dowsing Machine. | `summary.keyItems.itemfinder === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_wake_up_call` | **Wake-Up Call** | Acquire the Poké Flute. | `summary.keyItems.pokeFlute === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_revealer_of_mysteries` | **Revealer of Mysteries** | Acquire the Scope (Silph / Devon / Goggles). | `summary.keyItems.scope === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_shared_growth` | **Shared Growth** | Acquire the Exp. Share key item. | `summary.keyItems.expShare === true` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_jurassic_revival` | **Jurassic Revival** | Revive an ancient prehistoric fossil. | `summary.hasFossil === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_master_angler` | **Master Angler** | Acquire the legendary Super Rod. | `summary.keyItems.superRod === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_master_ball` | **Master Ball Acquired** | Obtain the legendary Master Ball. | `summary.keyItems.masterBall === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_eight_badges` | **Eight Badges Assembled** | Complete the 8-badge regional case. | `summary.hasAllBadges === true` | Per-ROM |
| ⏳ | 💎 Platinum | `poke_sixteen_badges` | **Dual-Region Master (16 Badges)** | Assemble all 16 Johto & Kanto badges to unlock Mt. Silver. | `summary.has16Badges === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_myth_and_legend` | **Myth & Legend** | Encounter and capture a legendary Pokémon. | `summary.hasLegendary === true` | Per-ROM |
| ⏳ | 💎 Platinum | `poke_hall_of_fame` | **Regional Champion** | Defeat Elite Four & enter Hall of Fame. | `summary.isChampion === true` | Per-ROM |
| ⏳ | 💎 Platinum | `poke_level_100` | **Level 100 Ascension** | Train any single Pokémon to Level 100. | `summary.hasLevel100 === true` | Per-ROM |
| ⏳ | 💎 Platinum | `poke_star_trainer` | **Star Trainer (Shiny)** | Capture or own an ultra-rare Shiny Pokémon. | `summary.hasShiny === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_microscopic_miracle`| **Microscopic Miracle**| Harbor the beneficial Pokérus virus. | `summary.hasPokerus === true` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_high_roller` | **High Roller (Max Wallet)** | Reach maximum wealth (₽999,999). | `summary.isHighRoller === true` | Per-ROM |
| ⏳ | 🥉 Bronze | `poke_dex_10` | **Novice Collector** | Register 10 caught Dex entries. | `summary.pokedexCaught >= 10` | Per-ROM |
| ⏳ | 🥈 Silver | `poke_dex_25` | **Seasoned Collector** | Register 25 caught Dex entries. | `summary.pokedexCaught >= 25` | Per-ROM |
| ⏳ | 🥇 Gold | `poke_dex_50` | **Master Collector** | Register 50 caught Dex entries. | `summary.pokedexCaught >= 50` | Per-ROM |
| ⏳ | 💎 Platinum | `poke_dex_100` | **Grandmaster Collector** | Register 100 caught Dex entries. | `summary.pokedexCaught >= 100` | Per-ROM |

---

## 🎮 Mainline Cartridge Verification Matrix (Gen 1 – Gen 5)

Track local hardware and ROM verification status across all official mainline titles:

| Generation | System | Game Title | Save Format | Status | Notes |
| :---: | :---: | :--- | :---: | :---: | :--- |
| **Gen 1** | GB | *Pokémon Red Version* | 32 KB SRAM | ✅ Verified | Checksum `0x3523`, 8 Badges `0x2602`, Bag items `0x25CA` |
| **Gen 1** | GB | *Pokémon Blue Version* | 32 KB SRAM | ✅ Verified | Checksum `0x3523`, 8 Badges `0x2602`, Bag items `0x25CA` |
| **Gen 1** | GB | *Pokémon Yellow: Special Pikachu* | 32 KB SRAM | ✅ Verified | Checksum `0x3523`, Pikachu Friendship `0x271C` (`>= 200`) |
| **Gen 2** | GBC | *Pokémon Gold Version* | 32 KB SRAM | ✅ Verified | Checksum `0x2D69`, Johto (`0x23E3`) & Kanto (`0x23E4`) 16 Badges |
| **Gen 2** | GBC | *Pokémon Silver Version* | 32 KB SRAM | ✅ Verified | Checksum `0x2D69`, Johto (`0x23E3`) & Kanto (`0x23E4`) 16 Badges |
| **Gen 2** | GBC | *Pokémon Crystal Version* | 32 KB SRAM | ✅ Verified | Checksum `0x2D0D`, Johto (`0x23E4`) & Kanto (`0x23E5`) 16 Badges |
| **Gen 3** | GBA | *Pokémon Ruby Version* | 64/128 KB Flash | ✅ Verified | 14 Sections, Substructure XOR Decryption, Hoenn Badges |
| **Gen 3** | GBA | *Pokémon Sapphire Version* | 64/128 KB Flash | ✅ Verified | 14 Sections, Substructure XOR Decryption, Hoenn Badges |
| **Gen 3** | GBA | *Pokémon Emerald Version* | 128 KB Flash | ✅ Verified | 14 Sections, Substructure XOR Decryption, Hoenn Badges |
| **Gen 3** | GBA | *Pokémon FireRed Version* | 128 KB Flash | ✅ Verified | 14 Sections, Substructure XOR Decryption, Kanto Badges |
| **Gen 3** | GBA | *Pokémon LeafGreen Version* | 128 KB Flash | ✅ Verified | 14 Sections, Substructure XOR Decryption, Kanto Badges |
| **Gen 4** | NDS | *Pokémon Diamond Version* | 512 KB EEPROM | ⏳ Pending | Dual sector CRC16 block counters |
| **Gen 4** | NDS | *Pokémon Pearl Version* | 512 KB EEPROM | ⏳ Pending | Dual sector CRC16 block counters |
| **Gen 4** | NDS | *Pokémon Platinum Version* | 512 KB EEPROM | ⏳ Pending | Distortion World & Sinnoh badges |
| **Gen 4** | NDS | *Pokémon HeartGold Version* | 512 KB EEPROM | ⏳ Pending | 16 Badges & Pokéathlon flags |
| **Gen 4** | NDS | *Pokémon SoulSilver Version* | 512 KB EEPROM | ⏳ Pending | 16 Badges & Pokéathlon flags |
| **Gen 5** | NDS | *Pokémon Black Version* | 512 KB Flash | ⏳ Pending | Unova badges & C-Gear sectors |
| **Gen 5** | NDS | *Pokémon White Version* | 512 KB Flash | ⏳ Pending | Unova badges & C-Gear sectors |
| **Gen 5** | NDS | *Pokémon Black Version 2* | 512 KB Flash | ⏳ Pending | PWT & Aspertia start badges |
| **Gen 5** | NDS | *Pokémon White Version 2* | 512 KB Flash | ⏳ Pending | PWT & Aspertia start badges |

---

## 💡 How Achievements Work Under the Hood

1. **In-Game Silence**: When playing inside the emulator, unlocked achievements buffer silently in memory with zero on-screen HUD popups or sound interruptions during gameplay.
2. **Session Exit Toast Flush**: When you exit emulation back to the library, all earned achievements slide in sequentially at the top right with Nintendo DS Touch styling and Web Audio chiptune fanfare.
3. **Menu Immediate Triggers**: Non-game actions (e.g. toggling theme 5 times, exporting backup, listening to 3 BGM tracks, or loading 25/100 ROMs) trigger their unlock toasts immediately.
4. **Trophy Cabinet**: Press **`H`** on keyboard or click the **Trophy (🏆)** icon in the topbar to open the **Hall of Fame**, view progress meters, gamer level, and filter by categories.
5. **Persistence**: Achievements and gamer scores are stored in `RetroPlayerDB` under `achievements_<profile_id>` and synchronize across backups and device reloads.

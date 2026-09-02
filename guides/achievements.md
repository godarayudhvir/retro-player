# 🏆 Universal Trophies Guide

This guide contains the master registry of all **24 Universal Trophies** in Retro Player. Every trophy is 100% universal across all 12 retro systems and works out-of-the-box with any standard ROM file without requiring emulator memory hacking.

The trophy system features a balanced **6 Categories × 4 Tiers (1 Bronze, 1 Silver, 1 Gold, 1 Platinum)** distribution:
- 🥉 **Bronze (+5G)**: 6 Trophies = 30G
- 🥈 **Silver (+10G)**: 6 Trophies = 60G
- 🥇 **Gold (+15G)**: 6 Trophies = 90G
- 💎 **Platinum (+20G)**: 6 Trophies = 120G
- **🏆 Total Obtainable Gamer Score: 300G**

> 📖 **Pokémon Save Inspector Guide**: For game-specific cartridge milestones, Gym Badge Cases, and memory parsing specifications across all 20 canonical Pokémon games (*Red, Blue, Yellow, Gold, Silver, Crystal, Ruby, Sapphire, Emerald, FireRed, LeafGreen, Diamond, Pearl, Platinum, HeartGold, SoulSilver, Black, White, Black 2, White 2*), see the dedicated **[Pokémon Save Inspector & Regional Milestones Hub](pokemon/README.md)**.

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
| ✅ | 🥈 Silver | +10G | `marathon_runner` | **Marathon Runner** | Play a single game continuously for 1 hour in one sitting. | Single session duration `>= 3600s` (1h) | Per-ROM |
| ✅ | 🥇 Gold | +15G | `loyal_companion` | **Loyal Companion** | Spend 2 total hours played on a single title. | Cumulative single-game playtime `>= 7200s` (2h) | Per-ROM |
| ✅ | 💎 Platinum | +20G | `ironman_endurance` | **Ironman Endurance** | Play a single game continuously for 7 hours in one sitting. | Single session duration `>= 25200s` (7h) | Per-ROM |

---

## 📅 Category C: Habits & Streaks (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `weekend_warrior` | **Weekend Warrior** | Play games on both Saturday and Sunday of the same weekend. | Active calendar dates include Sat & Sun | Global |
| ✅ | 🥈 Silver | +10G | `night_owl` | **Night Owl** | Boot any retro game between 11:00 PM and 4:00 AM local time. | Browser local hour `h >= 23 || h < 4` | Global |
| ✅ | 🥇 Gold | +15G | `daily_streak_3` | **Dedicated Gamer** | Play games for 3 consecutive days in a row. | Consecutive active calendar days `>= 3` | Global |
| ✅ | 💎 Platinum | +20G | `weekly_streak_7` | **Relentless Habit** | Play games for 7 consecutive days in a row. | Consecutive active calendar days `>= 7` | Global |

---

## 🎭 Category D: Retro Quirks (50G)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `rage_quit` | **Instant Regret?** | Exit a game in under 45 seconds of launching. | Session duration `3s < s < 45s` | Global |
| ✅ | 🥈 Silver | +10G | `need_for_speed` | **Need for Speed** | Keep Fast-Forward active continuously for over 45 seconds. | Continuous fast-forward `>= 45s` | Global |
| ✅ | 🥇 Gold | +15G | `window_shopper` | **Window Shopper** | Idle in the cartridge library with BGM playing for > 5 minutes. | Menu idle duration `>= 300s` | Global |
| ✅ | 💎 Platinum | +20G | `button_masher` | **Button Masher** | Register 1,500+ total gamepad/keyboard input events in a single session. | Active session button count `>= 1500` | Per-ROM |

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

## 🎯 Pokémon Save Inspector & Regional Badge Cases

For cartridge-specific memory maps, 16-badge dual cases, and generation-by-generation specifications across Gen 1 (*Red, Blue, Yellow*), Gen 2 (*Gold, Silver, Crystal*), Gen 3 (*Ruby, Sapphire, Emerald, FireRed, LeafGreen*), Gen 4 (*Diamond, Pearl, Platinum, HeartGold, SoulSilver*), and Gen 5 (*Black, White, Black 2, White 2*), see the dedicated documentation hub:

👉 **[Pokémon Milestones & Save Inspector Guide Hub (Gen 1 – Gen 5)](pokemon/README.md)**

---

## 💡 How Universal Achievements Work Under the Hood

1. **In-Game Silence**: When playing inside the emulator, unlocked achievements buffer silently in memory with zero on-screen HUD popups or sound interruptions during gameplay.
2. **Session Exit Toast Flush**: When you exit emulation back to the library, all earned achievements slide in sequentially at the top right with Nintendo DS Touch styling and Web Audio chiptune fanfare.
3. **Console-Grade Compact Toast HUD**: Toasts display a streamlined layout (Icon Box, Kicker, Title, Tier/Points Badge, Close Button) without multi-line description clutter.
4. **Contextual Parity & Navigation**:
   - Universal achievement toasts (`category !== 'pokemon'`) are clickable and open the **Trophy Cabinet & Hall of Fame** modal directly, automatically switching to the **Unlocked** filter, focusing the exact earned trophy card, and highlighting it with a glow pulse animation.
   - Pokémon milestone and gym badge toasts (`category === 'pokemon'`) display authentic high-resolution regional badge artwork (Kanto, Johto, Hoenn, Sinnoh, Unova) in the toast icon box, matching the **Trainer Milestones & Badge Case** view 1-to-1, and clicking them dismisses the toast without navigating to the universal Trophy Cabinet.
5. **Menu Immediate Triggers**: Non-game actions (e.g. toggling theme 5 times, exporting backup, listening to 3 BGM tracks, or loading 25/100 ROMs) trigger their unlock toasts immediately.
6. **Trophy Cabinet & Hall of Fame**: Press **`H`** on keyboard or click the **Trophy (🏆)** icon in the topbar to open the **Hall of Fame**, view progress meters, gamer level pill (`Lv.X`) cleanly integrated inline alongside the player name and rank badge, and filter trophies by category.
7. **Persistence**: Achievements and gamer scores are stored in `RetroPlayerDB` under `achievements_<profile_id>` and synchronize across backups and device reloads.

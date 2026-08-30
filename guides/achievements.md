# 🏆 Universal Achievements & Player Milestones Guide

This guide contains the master registry of all **30+ Universal Organic Achievements & Milestones** in Retro Player. Every achievement is 100% universal across all 12 retro systems and works out-of-the-box with any standard ROM file without requiring emulator memory hacking.

> **Status Checklist**: Use the `Status / Working` column to mark off testing verification on your local setup (✅ Verified Working, ❌ Unverified / Needs Testing).

---

## 🎮 Category A: Catalog & System Exploration

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `first_launch` | **Insert Coin** | Launch your very first retro game in Retro Player. | `totalLaunches >= 1` | Global |
| ✅ | 🥉 Bronze | +5G | `console_hopper` | **Console Hopper** | Play at least one game across 3 distinct retro systems. | Unique system keys played `>= 3` | Global |
| ✅ | 🥈 Silver | +10G | `gen_traveler` | **Generation Traveler** | Play games across 8-bit, 16-bit, and 32/64-bit platforms. | Played `[NES/GB/GG]` + `[SNES/MD]` + `[N64/PS1/NDS/GBA]` | Global |
| ✅ | 🥇 Gold | +15G | `full_spectrum` | **Full Spectrum** | Play at least one game on every supported system in your library. | All detected library systems played | Global |
| ✅ | 🥉 Bronze | +5G | `indecisive_swapper` | **Indecisive Swapper** | Launch 3 different games within 3 minutes. | 3 distinct game boots within `180s` | Global |
| ✅ | 🥉 Bronze | +5G | `library_tourist` | **Library Tourist** | Launch 5 different games in a single active session. | Single session launch list `>= 5` | Global |
| ✅ | 🥈 Silver | +10G | `cartridge_collector` | **Cartridge Collector** | Have at least 25 ROMs indexed in your local library. | Mounted `games.length >= 25` | Global |
| ✅ | 🥇 Gold | +15G | `grand_archivist` | **Grand Archivist** | Have 100+ ROMs indexed in your library across all consoles. | Mounted `games.length >= 100` | Global |

---

## ⏱️ Category B: Playtime & Endurance

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
|  | 🥉 Bronze | +5G | `warming_up` | **Warming Up** | Log 15 cumulative minutes of gameplay across any games. | Cumulative playtime `>= 900s` (15m) | Global |
|  | 🥈 Silver | +10G | `marathon_runner` | **Marathon Runner** | Play a single game continuously for 1 hour in one sitting. | Single session duration `>= 3600s` (1h) | Per-ROM |
|  | 🥇 Gold | +15G | `ironman_endurance` | **Ironman Endurance** | Play a single game continuously for 7 hours in one sitting. | Single session duration `>= 25200s` (7h) | Per-ROM |
|  | 🥈 Silver | +10G | `loyal_companion` | **Loyal Companion** | Spend 2 total hours played on a single title. | Cumulative single-game playtime `>= 7200s` (2h) | Per-ROM |

---

## 📅 Category C: Habits, Streaks & Time-of-Day (Local Time)

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
|  | 🥈 Silver | +10G | `night_owl` | **Night Owl** | Boot any retro game between 11:00 PM and 4:00 AM local time. | Browser local hour `h >= 23 || h < 4` | Global |
|  | 🥈 Silver | +10G | `early_bird` | **Early Bird** | Boot any retro game between 5:00 AM and 8:00 AM local time. | Browser local hour `5 <= h < 8` | Global |
|  | 🥉 Bronze | +5G | `weekend_warrior` | **Weekend Warrior** | Play games on both Saturday and Sunday of the same weekend. | Active calendar dates include Sat & Sun | Global |
|  | 🥈 Silver | +10G | `daily_streak_3` | **Dedicated Gamer** | Play games for 3 consecutive days in a row. | Consecutive active calendar days `>= 3` | Global |
|  | 🥇 Gold | +15G | `weekly_streak_7` | **Relentless Habit** | Play games for 7 consecutive days in a row. | Consecutive active calendar days `>= 7` | Global |

---

## 🎭 Category D: Retro Quirks & Fun Habits

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `rage_quit` | **Instant Regret?** | Exit a game in under 45 seconds of launching. | Session duration `3s < s < 45s` | Global |
|  | 🥈 Silver | +10G | `button_masher` | **Button Masher** | Register 1,500+ total gamepad/keyboard input events in a single session. | Active session button count `>= 1500` | Per-ROM |
| ✅ | 🥉 Bronze | +5G | `need_for_speed` | **Need for Speed** | Keep Fast-Forward active continuously for over 45 seconds. | Continuous fast-forward `>= 45s` | Global |
|  | 🥉 Bronze | +5G | `pause_for_thought`| **AFK Champion** | Leave the emulator paused for over 10 minutes. | Continuous pause duration `>= 600s` | Global |
|  | 🥈 Silver | +10G | `window_shopper` | **Window Shopper** | Idle in the cartridge library with BGM playing for > 5 minutes. | Menu idle duration `>= 300s` | Global |

---

## 💾 Category E: Saves, States & Memory Preservation

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥉 Bronze | +5G | `safety_net` | **Safety Net** | Create your very first Quick Save state snapshot. | Save state created (`Slot 0`) | Global |
| ✅ | 🥉 Bronze | +5G | `time_traveler` | **Time Traveler** | Load a previously saved state snapshot. | Save state loaded (`Slot 0`) | Global |
| ✅ | 🥈 Silver | +10G | `save_scummer` | **Save Scummer** | Create 10 save states in a single game. | Game save state count `>= 10` | Per-ROM |
| ✅ | 🥇 Gold | +15G | `timeline_master` | **Multi-Timeline Master** | Use both Auto-Resume and Manual Load State in the same title. | Auto-Resume + Load State used | Per-ROM |
|  | 🥈 Silver | +10G | `cartridge_keeper`| **Cartridge Keeper** | Export an authentic `.sav` battery SRAM file to your device. | Save Data Studio `.sav` export | Global |
|  | 🥈 Silver | +10G | `memory_rebirth` | **Memory Rebirth** | Import an authentic `.sav` battery SRAM file into a game. | Save Data Studio `.sav` import | Global |
| ✅ | 🥇 Gold | +15G | `vault_custodian` | **Vault Custodian** | Export a full JSON database backup snapshot from Storage Studio. | Storage Studio backup export | Global |

---

## 🎨 Category F: Media, Shell & Customization

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| ✅ | 🥈 Silver | +10G | `memory_keeper` | **Memory Keeper** | Capture an in-game screenshot. | In-game screenshot action | Global |
| ✅ | 🥈 Silver | +10G | `clip_master` | **Clip Master** | Record an in-game video clip. | In-game video recording action | Global |
| ✅ | 🥉 Bronze | +5G | `audiophile` | **Audiophile** | Listen to at least 3 distinct chiptune BGM background music tracks. | Unique BGM tracks played `>= 3` | Global |
| ✅ | 🥉 Bronze | +5G | `identity_crisis` | **Identity Crisis** | Customize/randomize your player avatar 3 times in Profile Studio. | Avatar updates `>= 3` | Global |
| ✅ | 🥉 Bronze | +5G | `chameleon` | **Chameleon** | Toggle between Light and Dark mode 5 times. | Theme toggles `>= 5` | Global |
| ✅ | 🥈 Silver | +10G | `retro_purist` | **Retro Purist** | Toggle ON the authentic CRT scanline shader during gameplay. | CRT filter enabled | Global |
| ✅ | 🥈 Silver | +10G | `certified_tactile`| **Certified Tactile** | Connect and use a real physical USB or Bluetooth gamepad controller. | Physical gamepad button/axis input detected | Global |

---

## 📖 Category G: Lore & Strategy Guides

| Status | Tier | Points | ID | Title | Universal Requirement | Evaluation Logic | Scope |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
|  | 🥉 Bronze | +5G | `strategy_scholar`| **Strategy Scholar** | Open or view QR companion for a game's Strategy Guide / Walkthrough. | Strategy guide open or QR action | Global |

---

## 💡 How Achievements Work Under the Hood

1. **In-Game Silence**: When playing inside the emulator, unlocked achievements buffer silently in memory with zero on-screen HUD popups or sound interruptions during gameplay.
2. **Session Exit Toast Flush**: When you exit emulation back to the library, all earned achievements slide in sequentially at the top right with Nintendo DS Touch styling and Web Audio chiptune fanfare.
3. **Menu Immediate Triggers**: Non-game actions (e.g. toggling theme 5 times, exporting backup, listening to 3 BGM tracks, or loading 25/100 ROMs) trigger their unlock toasts immediately.
4. **Trophy Cabinet**: Press **`H`** on keyboard or click the **Trophy (🏆)** icon in the topbar to open the **Hall of Fame**, view progress meters, gamer level, and filter by categories.
5. **Persistence**: Achievements and gamer scores are stored in `RetroPlayerDB` under `achievements_<profile_id>` and synchronize across backups and device reloads.

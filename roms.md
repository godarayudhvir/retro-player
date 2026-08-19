# 🎮 Bundled Demo ROMs Catalog & Compliance Policy

This document provides a complete inventory of all pre-packaged demonstration ROMs in the Retro Player repository under `public/roms/`, along with our strict compliance policy and Git distribution categorization.

---

## 📜 Curatorial Statement: Non-Complete & Demo ROMs Only

Retro Player is engineered specifically as an educational, high-performance WebAssembly retro emulation showcase. In accordance with this principle:

1. **Strictly Non-Complete Titles**: All ROMs in this repository were **specifically curated to be non-complete evaluation software**. This includes:
   - Time-limited and feature-limited trade show demonstrations.
   - Sega Channel broadcast demo slices (e.g. *Part One*, *Part A*, *Showdown*).
   - Official developer sample cartridges and promo preview builds.
   - Independent aftermarket homebrew and public domain software.
   - Unfinished developer prototypes and proof-of-concept showcases.
2. **Zero Commercial Full-Release Games**: No full, retail commercial video games are bundled with this application. The pre-installed titles exist exclusively to demonstrate that the WebAssembly emulator cores (mGBA, Gambatte, Snes9x, FCEUmm, Mupen64Plus, MelonDS, Genesis Plus GX, Beetle PSX, MAME 2003 Plus, Stella) initialize, render at 60 FPS, and accept gamepad/keyboard inputs within modern web browsers.
3. **Private Personal ROM Loading**: Users who own full retail game cartridges are encouraged to use the built-in **"Load Custom ROM"** button or viewport drag-and-drop. Personal files run strictly in browser RAM and are never transmitted to any external server.

---

## ⚖️ Rights Holder Notice & Immediate Compliance Policy

We deeply respect intellectual property rights and the work of all game developers, publishers, and preservationists.

> [!IMPORTANT]
> **Removal / Takedown Compliance Statement**:
> If you are a copyright holder, original developer, or publisher of any title in this repository and you wish for your demo, sample slice, or homebrew ROM to be removed—in whole or in part—**please let us know and we will immediately and willingly comply** without hesitation.
>
> **How to Request Removal**:
> - Open an issue on GitHub: [github.com/godarayudhvir/retro-player/issues](https://github.com/godarayudhvir/retro-player/issues)
> - Submit a pull request or reach out directly to the repository maintainers.
>
> Your request will be processed immediately upon receipt.

---

## 📦 Git & Web Hosting Distribution Architecture

To adhere strictly to **GitHub Free Plan file size constraints** (100 MB per file limit) and **GitHub Pages static deployment quotas** (1 GB total artifact quota), the ROM library is split into two tiers:

1. **Public Web Demo Showcase Tier (Included in Git Repository & GitHub Pages)**:
   - **282 titles across ALL 12 console platforms**, totaling **572.60 MB**.
   - Includes full coverage of 10 lightweight consoles plus **6 curated low-size showcase demos for PS1 and NDS** (*Dino Crisis*, *Rayman 2*, *Driver*, *Mario Kart DS*, *Super Mario 64 DS*, *Tetris DS*).
   - Max single file size is only **45.28 MB**, avoiding any GitHub 50 MB/100 MB push warnings or blocks.
2. **Local / Self-Hosted Tier (Gitignored from Git / GitHub Pages Uploads)**:
   - **68 titles** across 2 heavy disc systems (`playstation` and `nds`), totaling **3086.70 MB**.
   - Excluded from Git tracking because individual disc dumps range from 64 MB up to 586 MB, which exceeds GitHub push limits.
   - *Note*: All 12 consoles remain 100% playable in Retro Player via personal custom ROM loading in browser memory or local Docker volume mounts (`/roms`).

---

## 📊 Summary of Included ROMs by System

### 🟢 Tier 1: Public Web Demo Showcase (Git Tracked — 279 Titles Across All 12 Consoles)

| System Key | Console Name | Public Demo ROMs | Public Size | Status |
| :--- | :--- | :---: | :---: | :---: |
| `arcade` | **Arcade (MAME)** | **18** | 891.5 KB | 🟢 Full Platform |
| `atari_2600` | **Atari 2600** | **60** | 255.4 KB | 🟢 Full Platform |
| `game_gear` | **Sega Game Gear** | **9** | 1.59 MB | 🟢 Full Platform |
| `gb` | **Game Boy (DMG)** | **10** | 10.06 MB | 🟢 Full Platform |
| `gba` | **Game Boy Advance** | **5** | 52.00 MB | 🟢 Full Platform |
| `gbc` | **Game Boy Color** | **17** | 24.50 MB | 🟢 Full Platform |
| `n64` | **Nintendo 64** | **7** | 138.36 MB | 🟢 Full Platform |
| `nds` | **Nintendo DS** | **3** | 48.00 MB | 🟢 Curated Exceptions |
| `nes` | **Nintendo Entertainment System (NES)** | **72** | 31.03 MB | 🟢 Full Platform |
| `playstation` | **Sony PlayStation (PS1)** | **6** | 105.52 MB | 🟢 Curated Exceptions |
| `sega_genesis` | **Sega Genesis / Mega Drive** | **66** | 152.15 MB | 🟢 Full Platform |
| `snes` | **Super Nintendo Entertainment System (SNES)** | **9** | 8.28 MB | 🟢 Full Platform |
| **Subtotal** | **All 12 Systems** | **282** | **572.60 MB** | **Tracked in Git** |

### ⚪ Tier 2: Local / Self-Hosted Heavy Systems (Gitignored — 71 Titles)

| System Key | Console Name | Local Only ROMs | Local Size | Reason |
| :--- | :--- | :---: | :---: | :--- |
| `nds` | **Nintendo DS** | **22** | 1080.00 MB | Exceeds GitHub 100MB file / 1GB repo limits |
| `playstation` | **Sony PlayStation (PS1)** | **46** | 2006.70 MB | Exceeds GitHub 100MB file / 1GB repo limits |
| **Subtotal** | **2 Heavy Disc Systems** | **68** | **3086.70 MB** | **Local / Docker Volume Only** |

| **Grand Total** | **12 Supported Systems** | **350** | **3659.30 MB** | - |

---

## 📁 Complete File-by-File Inventory

### 🕹️ Arcade (MAME) (`arcade`) — 18 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `alienar.zip` | 19.5 KB | Public Domain / Test ROM | 🟢 Public |
| 2 | `carpolo.zip` | 5.5 KB | Public Domain / Test ROM | 🟢 Public |
| 3 | `circus.zip` | 8.2 KB | Public Domain / Test ROM | 🟢 Public |
| 4 | `crash.zip` | 9.9 KB | Public Domain / Test ROM | 🟢 Public |
| 5 | `fax.zip` | 377.5 KB | Public Domain / Test ROM | 🟢 Public |
| 6 | `fireone.zip` | 22.7 KB | Public Domain / Test ROM | 🟢 Public |
| 7 | `gridlee.zip` | 24.9 KB | Public Domain / Test ROM | 🟢 Public |
| 8 | `hardhat.zip` | 19.5 KB | Public Domain / Test ROM | 🟢 Public |
| 9 | `looping.zip` | 42.8 KB | Public Domain / Test ROM | 🟢 Public |
| 10 | `ripcord.zip` | 5.8 KB | Public Domain / Test ROM | 🟢 Public |
| 11 | `robby.zip` | 27.3 KB | Public Domain / Test ROM | 🟢 Public |
| 12 | `robotbwl.zip` | 5.5 KB | Public Domain / Test ROM | 🟢 Public |
| 13 | `spectar.zip` | 42.9 KB | Public Domain / Test ROM | 🟢 Public |
| 14 | `starfire.zip` | 32.6 KB | Public Domain / Test ROM | 🟢 Public |
| 15 | `targ.zip` | 15.0 KB | Public Domain / Test ROM | 🟢 Public |
| 16 | `teetert.zip` | 23.9 KB | Public Domain / Test ROM | 🟢 Public |
| 17 | `topgunnr.zip` | 132.4 KB | Public Domain / Test ROM | 🟢 Public |
| 18 | `victory.zip` | 75.8 KB | Public Domain / Test ROM | 🟢 Public |

### 🕹️ Atari 2600 (`atari_2600`) — 60 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Adventure (USA).7z` | 3.0 KB | Demo / Sample | 🟢 Public |
| 2 | `Air-Sea Battle ~ Target Fun (Japan, USA) (En).7z` | 1.9 KB | Demo / Sample | 🟢 Public |
| 3 | `Asteroids (Japan, USA) (En).7z` | 5.3 KB | Demo / Sample | 🟢 Public |
| 4 | `Atlantis (USA).7z` | 3.1 KB | Demo / Sample | 🟢 Public |
| 5 | `Barnstorming (USA).7z` | 2.9 KB | Demo / Sample | 🟢 Public |
| 6 | `Battlezone (Japan, USA) (En).7z` | 5.6 KB | Demo / Sample | 🟢 Public |
| 7 | `Beamrider (USA).7z` | 5.9 KB | Demo / Sample | 🟢 Public |
| 8 | `Berzerk (World) (Enhanced Edition).7z` | 10.5 KB | Demo / Sample | 🟢 Public |
| 9 | `Breakout ~ Breakaway IV (Japan, USA) (En).7z` | 1.9 KB | Demo / Sample | 🟢 Public |
| 10 | `Centipede (Japan, USA) (En).7z` | 4.9 KB | Demo / Sample | 🟢 Public |
| 11 | `Chopper Command (USA).7z` | 3.6 KB | Demo / Sample | 🟢 Public |
| 12 | `Combat ~ Tank-Plus (USA).7z` | 1.9 KB | Demo / Sample | 🟢 Public |
| 13 | `Crystal Castles (USA).7z` | 8.4 KB | Demo / Sample | 🟢 Public |
| 14 | `Defender (USA).7z` | 3.4 KB | Demo / Sample | 🟢 Public |
| 15 | `Demon Attack (USA) (Rev 1).7z` | 3.5 KB | Promotional Demo / Trial | 🟢 Public |
| 16 | `Dig Dug (USA).7z` | 9.5 KB | Demo / Sample | 🟢 Public |
| 17 | `Donkey Kong (USA).7z` | 2.9 KB | Demo / Sample | 🟢 Public |
| 18 | `Dragonfire (USA).7z` | 3.2 KB | Demo / Sample | 🟢 Public |
| 19 | `Enduro (USA).7z` | 3.3 KB | Demo / Sample | 🟢 Public |
| 20 | `Fishing Derby (USA).7z` | 1.9 KB | Demo / Sample | 🟢 Public |
| 21 | `Freeway (USA).7z` | 1.7 KB | Demo / Sample | 🟢 Public |
| 22 | `Frogger (USA).7z` | 3.3 KB | Demo / Sample | 🟢 Public |
| 23 | `Frostbite (USA).7z` | 3.2 KB | Demo / Sample | 🟢 Public |
| 24 | `Galaxian (USA).7z` | 5.4 KB | Demo / Sample | 🟢 Public |
| 25 | `Grand Prix (USA).7z` | 2.5 KB | Demo / Sample | 🟢 Public |
| 26 | `H.E.R.O. (USA).7z` | 6.0 KB | Demo / Sample | 🟢 Public |
| 27 | `Haunted House (USA).7z` | 3.5 KB | Demo / Sample | 🟢 Public |
| 28 | `Indy 500 ~ Race (USA).7z` | 1.8 KB | Demo / Sample | 🟢 Public |
| 29 | `Joust (USA).7z` | 5.8 KB | Demo / Sample | 🟢 Public |
| 30 | `Jungle Hunt (USA).7z` | 6.0 KB | Demo / Sample | 🟢 Public |
| 31 | `Kaboom! (USA).7z` | 1.7 KB | Demo / Sample | 🟢 Public |
| 32 | `Keystone Kapers (USA).7z` | 3.4 KB | Demo / Sample | 🟢 Public |
| 33 | `Kung-Fu Master (USA).7z` | 6.2 KB | Demo / Sample | 🟢 Public |
| 34 | `Laser Blast (USA).7z` | 1.8 KB | Demo / Sample | 🟢 Public |
| 35 | `Mario Bros. (USA).7z` | 4.9 KB | Demo / Sample | 🟢 Public |
| 36 | `MegaMania - A Space Nightmare (USA).7z` | 3.2 KB | Demo / Sample | 🟢 Public |
| 37 | `Missile Command (USA).7z` | 3.4 KB | Demo / Sample | 🟢 Public |
| 38 | `Montezuma's Revenge - Featuring Panama Joe (USA).7z` | 5.6 KB | Demo / Sample | 🟢 Public |
| 39 | `Moon Patrol (USA).7z` | 6.0 KB | Demo / Sample | 🟢 Public |
| 40 | `Mr. Do! (USA).7z` | 5.4 KB | Demo / Sample | 🟢 Public |
| 41 | `Ms. Pac-Man (USA).7z` | 5.3 KB | Demo / Sample | 🟢 Public |
| 42 | `Night Driver (USA).7z` | 1.9 KB | Demo / Sample | 🟢 Public |
| 43 | `Pac-Man (USA).7z` | 3.2 KB | Demo / Sample | 🟢 Public |
| 44 | `Phoenix (USA).7z` | 5.5 KB | Demo / Sample | 🟢 Public |
| 45 | `Pitfall! - Pitfall Harry's Jungle Adventure (USA).7z` | 3.1 KB | Demo / Sample | 🟢 Public |
| 46 | `Pole Position (USA).7z` | 5.2 KB | Demo / Sample | 🟢 Public |
| 47 | `Popeye (USA).7z` | 5.0 KB | Demo / Sample | 🟢 Public |
| 48 | `Q-bert (USA).7z` | 3.1 KB | Demo / Sample | 🟢 Public |
| 49 | `Raiders of the Lost Ark (USA).7z` | 6.3 KB | Demo / Sample | 🟢 Public |
| 50 | `River Raid (USA).7z` | 3.2 KB | Demo / Sample | 🟢 Public |
| 51 | `Robot Tank (USA).7z` | 5.1 KB | Demo / Sample | 🟢 Public |
| 52 | `Seaquest (USA).7z` | 3.2 KB | Demo / Sample | 🟢 Public |
| 53 | `Solaris (USA).7z` | 12.1 KB | Demo / Sample | 🟢 Public |
| 54 | `Space Invaders (USA).7z` | 3.4 KB | Demo / Sample | 🟢 Public |
| 55 | `Spy Hunter (USA).7z` | 5.6 KB | Demo / Sample | 🟢 Public |
| 56 | `Star Wars - The Empire Strikes Back (USA).7z` | 3.5 KB | Demo / Sample | 🟢 Public |
| 57 | `Super Breakout (USA).7z` | 2.7 KB | Demo / Sample | 🟢 Public |
| 58 | `Warlords (USA).7z` | 2.9 KB | Demo / Sample | 🟢 Public |
| 59 | `Yars' Revenge (USA).7z` | 3.4 KB | Demo / Sample | 🟢 Public |
| 60 | `Zaxxon (USA).7z` | 4.2 KB | Demo / Sample | 🟢 Public |

### 🕹️ Sega Game Gear (`game_gear`) — 9 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Colorlines (World) (Demo) (Aftermarket) (Unl)/Colorlines (World) (Demo) (Aftermarket) (Unl).gg` | 64.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 2 | `Dangerous Demolition (World) (Aftermarket) (Unl)/Dangerous Demolition (World) (Aftermarket) (Unl).gg` | 32.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 3 | `David Robinson's Supreme Court (USA) (Auto Demo)/David Robinson's Supreme Court (USA) (Auto Demo).gg` | 256.0 KB | Promotional Demo / Trial | 🟢 Public |
| 4 | `Dr. Franken (Europe) (Demo)/Dr. Franken (Europe) (Demo).gg` | 128.0 KB | Promotional Demo / Trial | 🟢 Public |
| 5 | `GG Turrican (World) (v1.0) (Demo) (Aftermarket) (Unl)/GG Turrican (World) (v1.0) (Demo) (Aftermarket) (Unl).gg` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 6 | `Mr. Ultra (World) (v0.1) (Demo) (Aftermarket) (Unl)/Mr. Ultra (World) (v0.1) (Demo) (Aftermarket) (Unl).gg` | 32.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 7 | `Neko (World) (Demo 2) (Aftermarket) (Unl)/Neko (World) (Demo 2) (Aftermarket) (Unl).gg` | 32.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 8 | `Quest (World) (Demo) (Aftermarket) (Unl)/Quest (World) (Demo) (Aftermarket) (Unl).gg` | 64.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 9 | `Sonic Drift (Japan) (En) (Demo)/Sonic Drift (Japan) (En) (Demo).gg` | 512.0 KB | Promotional Demo / Trial | 🟢 Public |

### 🕹️ Game Boy (DMG) (`gb`) — 10 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Castledark (World) (v2.0) (Demo) (Aftermarket) (Unl)/Castledark (World) (v2.0) (Demo) (Aftermarket) (Unl).gb` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 2 | `Dragonborne (World) (Demo) (Aftermarket) (Unl)/Dragonborne (World) (Demo) (Aftermarket) (Unl).gb` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 3 | `Gargoyle's Quest II - The Demon Darkness (USA) (Proto)/Gargoyle's Quest II - The Demon Darkness (USA) (Proto).gb` | 256.0 KB | Developer Prototype | 🟢 Public |
| 4 | `Glory Hunters - Chapter 1 (World) (v0.2) (Demo) (Aftermarket) (Unl)/Glory Hunters - Chapter 1 (World) (v0.2) (Demo) (Aftermarket) (Unl).gb` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 5 | `Gunman Clive (World) (Demo) (Aftermarket) (Unl)/Gunman Clive (World) (Demo) (Aftermarket) (Unl).gb` | 64.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 6 | `Kudzu (World) (v1.1c) (Demo) (Aftermarket) (Unl)/Kudzu (World) (v1.1c) (Demo) (Aftermarket) (Unl).gb` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 7 | `Last Crown Warriors (World) (v1.1.1) (Demo) (SGB Enhanced) (Aftermarket) (Unl)/Last Crown Warriors (World) (v1.1.1) (Demo) (SGB Enhanced) (Aftermarket) (Unl).gb` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 8 | `Oiopolis (World) (En) (Demo) (Aftermarket) (Unl)/Oiopolis (World) (En) (Demo) (Aftermarket) (Unl).gb` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 9 | `Traumatarium (World) (Demo) (2022-06-18) (Aftermarket) (Unl)/Traumatarium (World) (Demo) (2022-06-18) (Aftermarket) (Unl).gb` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 10 | `Zelda - Majora's Mask (World) (v1.1) (Demo) (Aftermarket) (Unl)/Zelda - Majora's Mask (World) (v1.1) (Demo) (Aftermarket) (Unl).gb` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |

### 🕹️ Game Boy Advance (`gba`) — 5 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `DK - King of Swing (USA) (Demo) (Kiosk)/DK - King of Swing (USA) (Demo) (Kiosk).gba` | 8.00 MB | Promotional Demo / Trial | 🟢 Public |
| 2 | `Legend of Zelda, The - The Minish Cap (USA) (Demo) (Kiosk)/Legend of Zelda, The - The Minish Cap (USA) (Demo) (Kiosk).gba` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 3 | `Mario & Luigi - Superstar Saga (USA) (Demo) (Kiosk)/Mario & Luigi - Superstar Saga (USA) (Demo) (Kiosk).gba` | 8.00 MB | Promotional Demo / Trial | 🟢 Public |
| 4 | `Pokemon Mystery Dungeon - Red Rescue Team (USA) (Demo) (Kiosk)/Pokemon Mystery Dungeon - Red Rescue Team (USA) (Demo) (Kiosk).gba` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 5 | `Super Mario Advance (USA) (Demo) (Kiosk)/Super Mario Advance (USA) (Demo) (Kiosk).gba` | 4.00 MB | Promotional Demo / Trial | 🟢 Public |

### 🕹️ Game Boy Color (`gbc`) — 17 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Coria and the Sunken City (World) (Demo) (GB Compatible) (Aftermarket) (Unl)/Coria and the Sunken City (World) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 128.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 2 | `Cosmo Knight ZiON (World) (En,Es) (v0.47) (Demo) (Aftermarket) (Unl)/Cosmo Knight ZiON (World) (En,Es) (v0.47) (Demo) (Aftermarket) (Unl).gbc` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 3 | `Donkey Kong Country (USA) (En,Fr,De,Es,It) (Demo) (Kiosk)/Donkey Kong Country (USA) (En,Fr,De,Es,It) (Demo) (Kiosk).gbc` | 4.00 MB | Promotional Demo / Trial | 🟢 Public |
| 4 | `Dracula - Dark Reign (World) (Demo) (Aftermarket) (Unl)/Dracula - Dark Reign (World) (Demo) (Aftermarket) (Unl).gbc` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 5 | `Dragonborne DX (World) (v1.0.2) (Demo) (GB Compatible) (Aftermarket) (Unl)/Dragonborne DX (World) (v1.0.2) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 4.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 6 | `Dragonyhm (World) (v1.1) (Demo) (GB Compatible) (Aftermarket) (Unl)/Dragonyhm (World) (v1.1) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 4.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 7 | `Far After (World) (v1.1) (Demo) (GB Compatible) (Aftermarket) (Unl)/Far After (World) (v1.1) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 8 | `Inspector Waffles Early Days (World) (v1.0.1) (Demo) (GB Compatible) (Aftermarket) (Unl)/Inspector Waffles Early Days (World) (v1.0.1) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 9 | `Last Crown Warriors (World) (v2.1.1) (Demo) (GB Compatible) (Aftermarket) (Unl)/Last Crown Warriors (World) (v2.1.1) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 10 | `Legacy of Verintia (World) (2023-05-31) (Demo) (GB Compatible) (Aftermarket) (Unl)/Legacy of Verintia (World) (2023-05-31) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 11 | `Machine, The (World) (v1.1) (Demo) (GB Compatible) (Aftermarket) (Unl)/Machine, The (World) (v1.1) (Demo) (GB Compatible) (Aftermarket) (Unl).gbc` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 12 | `Pokettohiro! (World) (v2.0) (Demo) (Aftermarket) (Unl)/Pokettohiro! (World) (v2.0) (Demo) (Aftermarket) (Unl).gbc` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 13 | `Repugnant Bounty (World) (Demo) (Aftermarket) (Unl)/Repugnant Bounty (World) (Demo) (Aftermarket) (Unl).gbc` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 14 | `Resident Evil (Unknown) (Demo) (Climax Entertainment)/Resident Evil (Unknown) (Demo) (Climax Entertainment).gbc` | 512.0 KB | Promotional Demo / Trial | 🟢 Public |
| 15 | `Revelations - The Demon Slayer (USA) (SGB Enhanced) (GB Compatible)/Revelations - The Demon Slayer (USA) (SGB Enhanced) (GB Compatible).gbc` | 1.00 MB | Promotional Demo / Trial | 🟢 Public |
| 16 | `Rumble & Tumble (USA) (Demo) (E3 2001)/Rumble & Tumble (USA) (Demo) (E3 2001).gbc` | 128.0 KB | Promotional Demo / Trial | 🟢 Public |
| 17 | `Silent Hill 2 - Born From a Wish (World) (2023-10-03) (Demo) (Aftermarket) (Unl)/Silent Hill 2 - Born From a Wish (World) (2023-10-03) (Demo) (Aftermarket) (Unl).gbc` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |

### 🕹️ Nintendo 64 (`n64`) — 7 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Bike Race '98 (World) (v1.2) (Demo) (Unl)/Bike Race '98 (World) (v1.2) (Demo) (Unl).z64` | 821.1 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 2 | `Donkey Kong 64 (USA) (Demo) (Kiosk)/Donkey Kong 64 (USA) (Demo) (Kiosk).z64` | 32.00 MB | Promotional Demo / Trial | 🟢 Public |
| 3 | `Excitebike 64 (USA) (Demo) (Kiosk)/Excitebike 64 (USA) (Demo) (Kiosk).z64` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 4 | `Jet Force Gemini (USA) (Demo) (Kiosk)/Jet Force Gemini (USA) (Demo) (Kiosk).z64` | 32.00 MB | Promotional Demo / Trial | 🟢 Public |
| 5 | `Legend of Zelda, The - Majora's Mask (USA) (Demo) (Kiosk)/Legend of Zelda, The - Majora's Mask (USA) (Demo) (Kiosk).z64` | 32.00 MB | Promotional Demo / Trial | 🟢 Public |
| 6 | `Pokemon Snap Station (USA) (Demo) (Kiosk)/Pokemon Snap Station (USA) (Demo) (Kiosk).z64` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 7 | `Turok - Dinosaur Hunter (USA) (Demo) (Kiosk, E3 1997)/Turok - Dinosaur Hunter (USA) (Demo) (Kiosk, E3 1997).z64` | 9.56 MB | Promotional Demo / Trial | 🟢 Public |

### 🕹️ Nintendo DS (`nds`) — 25 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Advance Wars - Days of Ruin (USA) (Demo) (Kiosk)/Advance Wars - Days of Ruin (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 2 | `Big Brain Academy (USA) (Demo) (Kiosk)/Big Brain Academy (USA) (Demo) (Kiosk).nds` | 8.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 3 | `Brain Age 2 - More Training in Minutes a Day! (USA) (Demo) (Kiosk)/Brain Age 2 - More Training in Minutes a Day! (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 4 | `Castlevania - Dawn of Sorrow (USA) (Demo) (Kiosk)/Castlevania - Dawn of Sorrow (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 5 | `Golden Sun - Dark Dawn (USA) (Demo) (Kiosk)/Golden Sun - Dark Dawn (USA) (Demo) (Kiosk).nds` | 128.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 6 | `Kirby - Canvas Curse (USA) (Demo) (Kiosk)/Kirby - Canvas Curse (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 7 | `Kirby - Squeak Squad (USA) (Demo) (Kiosk)/Kirby - Squeak Squad (USA) (Demo) (Kiosk).nds` | 32.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 8 | `Kirby Super Star Ultra (USA) (Demo) (Kiosk)/Kirby Super Star Ultra (USA) (Demo) (Kiosk).nds` | 128.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 9 | `Legend of Zelda, The - Phantom Hourglass (USA) (Demo) (Kiosk)/Legend of Zelda, The - Phantom Hourglass (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 10 | `Mario & Luigi - Partners in Time (USA) (Demo) (Kiosk)/Mario & Luigi - Partners in Time (USA) (Demo) (Kiosk).nds` | 32.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 11 | `Mario Kart DS (USA) (Demo) (Kiosk)/Mario Kart DS (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 12 | `Mario Party DS (USA) (Demo) (Kiosk)/Mario Party DS (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 13 | `Mario vs. Donkey Kong 2 - March of the Minis (USA) (Demo) (Kiosk)/Mario vs. Donkey Kong 2 - March of the Minis (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 14 | `Metroid Prime - Hunters (USA) (Demo) (Kiosk)/Metroid Prime - Hunters (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 15 | `New Super Mario Bros. (USA) (Demo) (Kiosk)/New Super Mario Bros. (USA) (Demo) (Kiosk).nds` | 32.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 16 | `Picross 3D (USA) (Demo) (Kiosk)/Picross 3D (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 17 | `Pokemon - Diamond Version + Pokemon - Pearl Version (USA) (Demo) (Kiosk)/Pokemon - Diamond Version + Pokemon - Pearl Version (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 18 | `Pokemon Mystery Dungeon - Explorers of Time + Pokemon Mystery Dungeon - Explorers of Darkness (USA) (Demo) (Kiosk)/Pokemon Mystery Dungeon - Explorers of Time + Pokemon Mystery Dungeon - Explorers of Darkness (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 19 | `Pokemon Ranger - Shadows of Almia (USA) (Demo) (Kiosk)/Pokemon Ranger - Shadows of Almia (USA) (Demo) (Kiosk).nds` | 32.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 20 | `Professor Layton and the Curious Village (USA) (Demo) (Kiosk)/Professor Layton and the Curious Village (USA) (Demo) (Kiosk).nds` | 64.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 21 | `Rhythm Heaven (USA) (Demo) (Kiosk)/Rhythm Heaven (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 22 | `Super Mario 64 DS (USA) (Demo) (Kiosk)/Super Mario 64 DS (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 23 | `Tetris DS (USA) (Demo) (Kiosk)/Tetris DS (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | 🟢 Public |
| 24 | `WarioWare - Touched! (USA) (Demo) (Kiosk)/WarioWare - Touched! (USA) (Demo) (Kiosk).nds` | 16.00 MB | Promotional Demo / Trial | ⚪ Local Only |
| 25 | `Yoshi's Island DS (USA) (Demo) (Kiosk)/Yoshi's Island DS (USA) (Demo) (Kiosk).nds` | 32.00 MB | Promotional Demo / Trial | ⚪ Local Only |

### 🕹️ Nintendo Entertainment System (NES) (`nes`) — 72 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Alien Cat 2 (World) (Demo) (Aftermarket) (Unl)/Alien Cat 2 (World) (Demo) (Aftermarket) (Unl).nes` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 2 | `Alwa's Awakening - The 8-Bit Edition (World) (Demo) (Aftermarket) (Unl)/Alwa's Awakening - The 8-Bit Edition (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 3 | `Armed for Battle (World) (Demo) (2016-05-04) (Aftermarket) (Unl)/Armed for Battle (World) (Demo) (2016-05-04) (Aftermarket) (Unl).nes` | 128.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 4 | `Assimilate (World) (Demo) (Aftermarket) (Unl)/Assimilate (World) (Demo) (Aftermarket) (Unl).nes` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 5 | `Catventure - The Red Cat Quest (World) (Demo) (Aftermarket) (Unl)/Catventure - The Red Cat Quest (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 6 | `Chibi Monster Br4wl (World) (Demo) (Aftermarket) (Unl)/Chibi Monster Br4wl (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 7 | `Coffin Pauper (World) (Demo) (Aftermarket) (Unl)/Coffin Pauper (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 8 | `Copter Bot (World) (Demo) (Aftermarket) (Unl)/Copter Bot (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 9 | `Crabbie Attack! (World) (Demo) (Aftermarket) (Unl)/Crabbie Attack! (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 10 | `Creepy Brawlers (World) (Demo) (Aftermarket) (Unl)/Creepy Brawlers (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 11 | `Dimension Shift (World) (Demo) (2021-05-05) (Aftermarket) (Unl)/Dimension Shift (World) (Demo) (2021-05-05) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 12 | `Doodle World (World) (Demo) (2020-09-08) (Aftermarket) (Unl)/Doodle World (World) (Demo) (2020-09-08) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 13 | `Dungeons & Doomknights (World) (Demo) (Aftermarket) (Unl)/Dungeons & Doomknights (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 14 | `Enormous Adventures (World) (Demo) (Aftermarket) (Unl)/Enormous Adventures (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 15 | `Eternal Prelude (World) (Demo) (Aftermarket) (Unl)/Eternal Prelude (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 16 | `Eyra, The Crow Maiden (World) (Demo) (Aftermarket) (Unl)/Eyra, The Crow Maiden (World) (Demo) (Aftermarket) (Unl).nes` | 40.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 17 | `Flea! (World) (Demo) (2021-02-19) (Aftermarket) (Unl)/Flea! (World) (Demo) (2021-02-19) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 18 | `Get It Together! (World) (Demo) (2023-08-09) (Aftermarket) (Unl)/Get It Together! (World) (Demo) (2023-08-09) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 19 | `Ghoul Grind - Night of the Necromancer (World) (Demo) (2021-10-28) (Aftermarket) (Unl)/Ghoul Grind - Night of the Necromancer (World) (Demo) (2021-10-28) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 20 | `Guardian 5 (World) (Demo) (Aftermarket) (Unl)/Guardian 5 (World) (Demo) (Aftermarket) (Unl).nes` | 96.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 21 | `Gypsum and The Travelers (World) (Demo) (Aftermarket) (Unl)/Gypsum and The Travelers (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 22 | `Happy Scrappy (World) (Demo) (Byte-Off 2019) (Aftermarket) (Unl)/Happy Scrappy (World) (Demo) (Byte-Off 2019) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 23 | `Horror Hospital (World) (Demo) (Aftermarket) (Unl)/Horror Hospital (World) (Demo) (Aftermarket) (Unl).nes` | 384.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 24 | `House in the Cemetery, The (World) (Demo) (Aftermarket) (Unl)/House in the Cemetery, The (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 25 | `Isostasy (World) (Demo) (Aftermarket) (Unl)/Isostasy (World) (Demo) (Aftermarket) (Unl).nes` | 64.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 26 | `Jane Austen's 8-bit Adventure (World) (Demo) (NESDev 2022) (Aftermarket) (Unl)/Jane Austen's 8-bit Adventure (World) (Demo) (NESDev 2022) (Aftermarket) (Unl).nes` | 40.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 27 | `Kosmity Atakujo - Open Map Test (World) (Demo) (Aftermarket) (Unl)/Kosmity Atakujo - Open Map Test (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 28 | `Labyrinth of Yggdrasil (World) (Demo) (Aftermarket) (Unl)/Labyrinth of Yggdrasil (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 29 | `Lizard (World) (Demo) (2018-11-01) (Aftermarket) (Unl)/Lizard (World) (Demo) (2018-11-01) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 30 | `Manoir des Zombies, Le (World) (Demo) (2022-09-16) (Aftermarket) (Unl)/Manoir des Zombies, Le (World) (Demo) (2022-09-16) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 31 | `Mark of the Beast (World) (Demo) (Aftermarket) (Unl)/Mark of the Beast (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 32 | `Mawthorne (World) (Demo) (Aftermarket) (Unl)/Mawthorne (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 33 | `Meating, The (World) (Demo) (Aftermarket) (Unl)/Meating, The (World) (Demo) (Aftermarket) (Unl).nes` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 34 | `Micro Mages (World) (Demo) (Digital) (Aftermarket) (Unl)/Micro Mages (World) (Demo) (Digital) (Aftermarket) (Unl).nes` | 40.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 35 | `Mischief Castle (World) (Demo) (2024-01-22) (Aftermarket) (Unl)/Mischief Castle (World) (Demo) (2024-01-22) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 36 | `Mojonian Tales (World) (Demo) (Aftermarket) (Unl)/Mojonian Tales (World) (Demo) (Aftermarket) (Unl).nes` | 160.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 37 | `Muck Sunflower - Escape from Bot Planet (World) (Demo) (Aftermarket) (Unl)/Muck Sunflower - Escape from Bot Planet (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 38 | `Neotoxin (World) (Demo) (Aftermarket) (Unl)/Neotoxin (World) (Demo) (Aftermarket) (Unl).nes` | 506.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 39 | `Ooze Redux (World) (Demo) (Aftermarket) (Unl)/Ooze Redux (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 40 | `Oratorio (World) (Demo) (2023-08-05) (Aftermarket) (Unl)/Oratorio (World) (Demo) (2023-08-05) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 41 | `Orebody - Binder's Tale (World) (Demo) (2022-09-29) (Aftermarket) (Unl)/Orebody - Binder's Tale (World) (Demo) (2022-09-29) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 42 | `Pinky (World) (Demo) (Aftermarket) (Unl)/Pinky (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 43 | `Project Blue (World) (Demo) (2019-10-22) (Kickstarter) (Aftermarket) (Unl)/Project Blue (World) (Demo) (2019-10-22) (Kickstarter) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 44 | `Project S.K.I.F.F. (World) (Demo) (Aftermarket) (Unl)/Project S.K.I.F.F. (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 45 | `Prying Eye, The (World) (Demo) (Aftermarket) (Unl)/Prying Eye, The (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 46 | `Ramen Adventure (World) (Demo) (Aftermarket) (Unl)/Ramen Adventure (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 47 | `Rick Rolled! (World) (Demo) (Aftermarket) (Unl)/Rick Rolled! (World) (Demo) (Aftermarket) (Unl).nes` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 48 | `Roniu's Tale (World) (Demo) (Aftermarket) (Unl)/Roniu's Tale (World) (Demo) (Aftermarket) (Unl).nes` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 49 | `Save the Kuin (World) (Demo) (Kickstarter Version) (Aftermarket) (Unl)/Save the Kuin (World) (Demo) (Kickstarter Version) (Aftermarket) (Unl).nes` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 50 | `Secret of NecroNancy, The (World) (Demo) (Aftermarket) (Unl)/Secret of NecroNancy, The (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 51 | `Shadow Animus (World) (Demo) (Aftermarket) (Unl)/Shadow Animus (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 52 | `Shera and the 40 Thieves (World) (Demo) (Aftermarket) (Unl)/Shera and the 40 Thieves (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 53 | `Shutshimi (World) (Demo) (Aftermarket) (Unl)/Shutshimi (World) (Demo) (Aftermarket) (Unl).nes` | 40.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 54 | `Skatemasta Tcheco (World) (Demo) (Aftermarket) (Unl)/Skatemasta Tcheco (World) (Demo) (Aftermarket) (Unl).nes` | 768.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 55 | `Soko Banana (World) (Demo) (2024-01-19) (Aftermarket) (Unl)/Soko Banana (World) (Demo) (2024-01-19) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 56 | `Space Mutants (World) (Demo) (Aftermarket) (Unl)/Space Mutants (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 57 | `Space Soviets (World) (Demo) (Aftermarket) (Unl)/Space Soviets (World) (Demo) (Aftermarket) (Unl).nes` | 768.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 58 | `Steel Legion (World) (Demo) (2023-11-29) (Aftermarket) (Unl)/Steel Legion (World) (Demo) (2023-11-29) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 59 | `Storied Sword, The (World) (Demo) (2023-01-09) (UNROM 512) (Aftermarket) (Unl)/Storied Sword, The (World) (Demo) (2023-01-09) (UNROM 512) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 60 | `Storied Sword, The (World) (Demo) (2023-01-10) (GTROM) (Aftermarket) (Unl)/Storied Sword, The (World) (Demo) (2023-01-10) (GTROM) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 61 | `Street Fighter II - Nostalgic Edition (World) (Demo) (Aftermarket) (Unl)/Street Fighter II - Nostalgic Edition (World) (Demo) (Aftermarket) (Unl).nes` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 62 | `Summer Island Battle Tactics (World) (Demo) (2023-10-22) (Aftermarket) (Unl)/Summer Island Battle Tactics (World) (Demo) (2023-10-22) (Aftermarket) (Unl).nes` | 768.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 63 | `Sunset Land (World) (Demo) (2023-04-25) (Aftermarket) (Unl)/Sunset Land (World) (Demo) (2023-04-25) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 64 | `Sunset World (World) (Demo) (2022-08-07) (Aftermarket) (Unl)/Sunset World (World) (Demo) (2022-08-07) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 65 | `Super Tilt Bro. (World) (Demo) (Kickstarter) (Aftermarket) (Unl)/Super Tilt Bro. (World) (Demo) (Kickstarter) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 66 | `Tapeworm - Disco Puzzle (World) (Demo) (Aftermarket) (Unl)/Tapeworm - Disco Puzzle (World) (Demo) (Aftermarket) (Unl).nes` | 64.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 67 | `Troll Burner (World) (Demo) (Aftermarket) (Unl)/Troll Burner (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 68 | `Tryptic (World) (Demo) (Aftermarket) (Unl)/Tryptic (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 69 | `Underground Adventure (World) (Demo) (2019-07-19) (Aftermarket) (Unl)/Underground Adventure (World) (Demo) (2019-07-19) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 70 | `Vigilante Ninja II (World) (Demo) (2017-05-17) (Aftermarket) (Unl)/Vigilante Ninja II (World) (Demo) (2017-05-17) (Aftermarket) (Unl).nes` | 192.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 71 | `Wolf Spirit (World) (Demo) (Aftermarket) (Unl)/Wolf Spirit (World) (Demo) (Aftermarket) (Unl).nes` | 64.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 72 | `neMULEsis (World) (Demo) (Aftermarket) (Unl)/neMULEsis (World) (Demo) (Aftermarket) (Unl).nes` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |

### 🕹️ Sony PlayStation (PS1) (`playstation`) — 52 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Crash Bandicoot - Warped (USA) (Demo)/Crash Bandicoot - Warped (USA) (Demo).bin` | 67.55 MB | Promotional Demo / Trial | ⚪ Local Only |
| 2 | `Crash Bandicoot - Warped (USA) (Demo)/Crash Bandicoot - Warped (USA) (Demo).cue` | 103 B | Promotional Demo / Trial | ⚪ Local Only |
| 3 | `Dino Crisis (USA) (Demo)/Dino Crisis (USA) (Demo).bin` | 26.36 MB | Promotional Demo / Trial | 🟢 Public |
| 4 | `Dino Crisis (USA) (Demo)/Dino Crisis (USA) (Demo).cue` | 90 B | Promotional Demo / Trial | 🟢 Public |
| 5 | `Driver - You Are the Wheelman (USA) (Demo)/Driver - You Are the Wheelman (USA) (Demo).bin` | 45.28 MB | Promotional Demo / Trial | 🟢 Public |
| 6 | `Driver - You Are the Wheelman (USA) (Demo)/Driver - You Are the Wheelman (USA) (Demo).cue` | 108 B | Promotional Demo / Trial | 🟢 Public |
| 7 | `Gran Turismo (USA) (Demo)/Gran Turismo (USA) (Demo).bin` | 586.86 MB | Promotional Demo / Trial | ⚪ Local Only |
| 8 | `Gran Turismo (USA) (Demo)/Gran Turismo (USA) (Demo).cue` | 91 B | Promotional Demo / Trial | ⚪ Local Only |
| 9 | `Harvest Moon - Back to Nature (USA) (Demo)/Harvest Moon - Back to Nature (USA) (Demo).bin` | 204.08 MB | Promotional Demo / Trial | ⚪ Local Only |
| 10 | `Harvest Moon - Back to Nature (USA) (Demo)/Harvest Moon - Back to Nature (USA) (Demo).cue` | 108 B | Promotional Demo / Trial | ⚪ Local Only |
| 11 | `Jurassic Park - The Lost World (USA) (Demo)/Jurassic Park - The Lost World (USA) (Demo) (Track 1).bin` | 42.13 MB | Promotional Demo / Trial | ⚪ Local Only |
| 12 | `Jurassic Park - The Lost World (USA) (Demo)/Jurassic Park - The Lost World (USA) (Demo) (Track 2).bin` | 23.88 MB | Promotional Demo / Trial | ⚪ Local Only |
| 13 | `Jurassic Park - The Lost World (USA) (Demo)/Jurassic Park - The Lost World (USA) (Demo) (Track 3).bin` | 2.68 MB | Promotional Demo / Trial | ⚪ Local Only |
| 14 | `Jurassic Park - The Lost World (USA) (Demo)/Jurassic Park - The Lost World (USA) (Demo).cue` | 393 B | Promotional Demo / Trial | ⚪ Local Only |
| 15 | `Mega Man Legends 2 (USA) (Demo)/Mega Man Legends 2 (USA) (Demo) (Track 1).bin` | 93.29 MB | Promotional Demo / Trial | ⚪ Local Only |
| 16 | `Mega Man Legends 2 (USA) (Demo)/Mega Man Legends 2 (USA) (Demo) (Track 2).bin` | 35.66 MB | Promotional Demo / Trial | ⚪ Local Only |
| 17 | `Mega Man Legends 2 (USA) (Demo)/Mega Man Legends 2 (USA) (Demo).cue` | 232 B | Promotional Demo / Trial | ⚪ Local Only |
| 18 | `Metal Gear Solid (USA) (Demo)/Metal Gear Solid (USA) (Demo).bin` | 88.79 MB | Promotional Demo / Trial | ⚪ Local Only |
| 19 | `Metal Gear Solid (USA) (Demo)/Metal Gear Solid (USA) (Demo).cue` | 95 B | Promotional Demo / Trial | ⚪ Local Only |
| 20 | `Nickelodeon Rugrats - Search for Reptar (USA) (Demo)/Nickelodeon Rugrats - Search for Reptar (USA) (Demo) (Track 1).bin` | 20.33 MB | Promotional Demo / Trial | ⚪ Local Only |
| 21 | `Nickelodeon Rugrats - Search for Reptar (USA) (Demo)/Nickelodeon Rugrats - Search for Reptar (USA) (Demo) (Track 2).bin` | 1.34 MB | Promotional Demo / Trial | ⚪ Local Only |
| 22 | `Nickelodeon Rugrats - Search for Reptar (USA) (Demo)/Nickelodeon Rugrats - Search for Reptar (USA) (Demo).cue` | 274 B | Promotional Demo / Trial | ⚪ Local Only |
| 23 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 01).bin` | 55.30 MB | Promotional Demo / Trial | ⚪ Local Only |
| 24 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 02).bin` | 15.49 MB | Promotional Demo / Trial | ⚪ Local Only |
| 25 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 03).bin` | 1.24 MB | Promotional Demo / Trial | ⚪ Local Only |
| 26 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 04).bin` | 1.31 MB | Promotional Demo / Trial | ⚪ Local Only |
| 27 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 05).bin` | 1.28 MB | Promotional Demo / Trial | ⚪ Local Only |
| 28 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 06).bin` | 1.21 MB | Promotional Demo / Trial | ⚪ Local Only |
| 29 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 07).bin` | 1.33 MB | Promotional Demo / Trial | ⚪ Local Only |
| 30 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 08).bin` | 1.20 MB | Promotional Demo / Trial | ⚪ Local Only |
| 31 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 09).bin` | 15.85 MB | Promotional Demo / Trial | ⚪ Local Only |
| 32 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 10).bin` | 10.60 MB | Promotional Demo / Trial | ⚪ Local Only |
| 33 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 11).bin` | 8.56 MB | Promotional Demo / Trial | ⚪ Local Only |
| 34 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1) (Track 12).bin` | 26.71 MB | Promotional Demo / Trial | ⚪ Local Only |
| 35 | `Pac-Man World (USA) (Demo) (Rev 1)/Pac-Man World (USA) (Demo) (Rev 1).cue` | 1.5 KB | Promotional Demo / Trial | ⚪ Local Only |
| 36 | `Rayman 2 - The Great Escape (USA) (Demo)/Rayman 2 - The Great Escape (USA) (Demo).bin` | 33.88 MB | Promotional Demo / Trial | 🟢 Public |
| 37 | `Rayman 2 - The Great Escape (USA) (Demo)/Rayman 2 - The Great Escape (USA) (Demo).cue` | 106 B | Promotional Demo / Trial | 🟢 Public |
| 38 | `Resident Evil 2 (USA) (Demo)/Resident Evil 2 (USA) (Demo).bin` | 155.29 MB | Promotional Demo / Trial | ⚪ Local Only |
| 39 | `Resident Evil 2 (USA) (Demo)/Resident Evil 2 (USA) (Demo).cue` | 94 B | Promotional Demo / Trial | ⚪ Local Only |
| 40 | `Silent Hill (USA) (Demo)/Silent Hill (USA) (Demo).bin` | 103.93 MB | Promotional Demo / Trial | ⚪ Local Only |
| 41 | `Silent Hill (USA) (Demo)/Silent Hill (USA) (Demo).cue` | 90 B | Promotional Demo / Trial | ⚪ Local Only |
| 42 | `Spyro the Dragon (USA) (Demo) (SCUS-94290)/Spyro the Dragon (USA) (Demo) (SCUS-94290).bin` | 101.36 MB | Promotional Demo / Trial | ⚪ Local Only |
| 43 | `Spyro the Dragon (USA) (Demo) (SCUS-94290)/Spyro the Dragon (USA) (Demo) (SCUS-94290).cue` | 108 B | Promotional Demo / Trial | ⚪ Local Only |
| 44 | `Spyro the Dragon (USA) (Demo) (SCUS-94439)/Spyro the Dragon (USA) (Demo) (SCUS-94439).bin` | 125.94 MB | Promotional Demo / Trial | ⚪ Local Only |
| 45 | `Spyro the Dragon (USA) (Demo) (SCUS-94439)/Spyro the Dragon (USA) (Demo) (SCUS-94439).cue` | 108 B | Promotional Demo / Trial | ⚪ Local Only |
| 46 | `Star Wars - Demolition (USA) (Demo)/Star Wars - Demolition (USA) (Demo) (Track 1).bin` | 6.05 MB | Promotional Demo / Trial | ⚪ Local Only |
| 47 | `Star Wars - Demolition (USA) (Demo)/Star Wars - Demolition (USA) (Demo) (Track 2).bin` | 38.38 MB | Promotional Demo / Trial | ⚪ Local Only |
| 48 | `Star Wars - Demolition (USA) (Demo)/Star Wars - Demolition (USA) (Demo).cue` | 240 B | Promotional Demo / Trial | ⚪ Local Only |
| 49 | `Star Wars - Episode I - The Phantom Menace (USA) (Demo)/Star Wars - Episode I - The Phantom Menace (USA) (Demo).bin` | 101.37 MB | Promotional Demo / Trial | ⚪ Local Only |
| 50 | `Star Wars - Episode I - The Phantom Menace (USA) (Demo)/Star Wars - Episode I - The Phantom Menace (USA) (Demo).cue` | 121 B | Promotional Demo / Trial | ⚪ Local Only |
| 51 | `Tony Hawk's Pro Skater 2 (USA) (Demo)/Tony Hawk's Pro Skater 2 (USA) (Demo).bin` | 67.69 MB | Promotional Demo / Trial | ⚪ Local Only |
| 52 | `Tony Hawk's Pro Skater 2 (USA) (Demo)/Tony Hawk's Pro Skater 2 (USA) (Demo).cue` | 103 B | Promotional Demo / Trial | ⚪ Local Only |

### 🕹️ Sega Genesis / Mega Drive (`sega_genesis`) — 66 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Adventures of Batman & Robin, The (USA) (Demo) (Sega Channel)/Adventures of Batman & Robin, The (USA) (Demo) (Sega Channel).md` | 2.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 2 | `Astebros (World) (En,Ja,Fr,De,Es,It,Pt-BR,Zh) (Demo) (2023-07-07) (Aftermarket) (Unl)/Astebros (World) (En,Ja,Fr,De,Es,It,Pt-BR,Zh) (Demo) (2023-07-07) (Aftermarket) (Unl).md` | 14.75 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 3 | `Attack of the PETSCII Robots (World) (v1.2) (Demo) (Aftermarket) (Unl)/Attack of the PETSCII Robots (World) (v1.2) (Demo) (Aftermarket) (Unl).md` | 1.38 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 4 | `Bio Evil (World) (Demo 3) (Aftermarket) (Unl)/Bio Evil (World) (Demo 3) (Aftermarket) (Unl).md` | 2.12 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 5 | `Black Jewel Reborn (World) (v0.2) (Demo) (Aftermarket) (Unl)/Black Jewel Reborn (World) (v0.2) (Demo) (Aftermarket) (Unl).md` | 2.12 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 6 | `Bomb on Basic City - Special Edition + Papi Commando Tennis Demo (World) (En,Fr) (Aftermarket) (Unl)/Bomb on Basic City - Special Edition + Papi Commando Tennis Demo (World) (En,Fr) (Aftermarket) (Unl).md` | 3.08 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 7 | `Bone Marrow Rebirth (World) (En,Ru) (Demo) (Aftermarket) (Unl)/Bone Marrow Rebirth (World) (En,Ru) (Demo) (Aftermarket) (Unl).md` | 1.88 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 8 | `Bugs Bunny in Double Trouble (USA) (Demo) (Sega Channel)/Bugs Bunny in Double Trouble (USA) (Demo) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 9 | `ChuChu Rocket! (World) (Demo) (Aftermarket) (Unl)/ChuChu Rocket! (World) (Demo) (Aftermarket) (Unl).md` | 256.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 10 | `Coffee Crisis (World) (Demo) (Aftermarket) (Unl)/Coffee Crisis (World) (Demo) (Aftermarket) (Unl).md` | 2.62 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 11 | `Comix Zone (USA) (Demo) (1995-06-12) (Sega Channel)/Comix Zone (USA) (Demo) (1995-06-12) (Sega Channel).md` | 2.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 12 | `Curse of Illmoore Bay, The (World) (Demo 3) (Aftermarket) (Unl)/Curse of Illmoore Bay, The (World) (Demo 3) (Aftermarket) (Unl).md` | 1.44 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 13 | `Cursed Knight, The (World) (v3.0) (Demo) (Aftermarket) (Unl)/Cursed Knight, The (World) (v3.0) (Demo) (Aftermarket) (Unl).md` | 3.62 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 14 | `Debtor (World) (Demo 4) (Aftermarket) (Unl)/Debtor (World) (Demo 4) (Aftermarket) (Unl).md` | 1.12 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 15 | `Demolition Man (USA, Europe)/Demolition Man (USA, Europe).md` | 2.00 MB | Promotional Demo / Trial | 🟢 Public |
| 16 | `Demons of Asteborg (World) (En,Fr,De,Es,It,Pt-BR) (v1.1) (Demo 5) (2021-09-13) (Aftermarket) (Unl)/Demons of Asteborg (World) (En,Fr,De,Es,It,Pt-BR) (v1.1) (Demo 5) (2021-09-13) (Aftermarket) (Unl).md` | 14.62 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 17 | `Desert Demolition Starring Road Runner and Wile E. Coyote (USA, Europe)/Desert Demolition Starring Road Runner and Wile E. Coyote (USA, Europe).md` | 1.00 MB | Promotional Demo / Trial | 🟢 Public |
| 18 | `Devwill Too (World) (Demo 2) (Aftermarket) (Unl)/Devwill Too (World) (Demo 2) (Aftermarket) (Unl).md` | 1.88 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 19 | `Dynamite Headdy - Jitsuen-you Sample (Japan) (En) (Demo)/Dynamite Headdy - Jitsuen-you Sample (Japan) (En) (Demo).md` | 2.00 MB | Promotional Demo / Trial | 🟢 Public |
| 20 | `Earthworm Jim (USA) (Demo) (Test Drive) (Sega Channel)/Earthworm Jim (USA) (Demo) (Test Drive) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 21 | `Elite (Europe) (Demo 1) (Game)/Elite (Europe) (Demo 1) (Game).md` | 512.0 KB | Promotional Demo / Trial | 🟢 Public |
| 22 | `Eyra - The Crow Maiden (World) (Demo) (Aftermarket) (Unl)/Eyra - The Crow Maiden (World) (Demo) (Aftermarket) (Unl).md` | 1.04 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 23 | `Foxy Land (World) (Demo) (Aftermarket) (Unl)/Foxy Land (World) (Demo) (Aftermarket) (Unl).md` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 24 | `Irena - Genesis Metal Fury (World) (2021-12-09) (Demo) (Aftermarket) (Unl)/Irena - Genesis Metal Fury (World) (2021-12-09) (Demo) (Aftermarket) (Unl).md` | 2.50 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 25 | `Jessie Jaeger in Cleopatra's Curse (World) (Demo) (Aftermarket) (Unl)/Jessie Jaeger in Cleopatra's Curse (World) (Demo) (Aftermarket) (Unl).md` | 1.38 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 26 | `Journey to Oblivion (World) (En,Pt) (v0.2.7.2) (Demo) (Aftermarket) (Unl)/Journey to Oblivion (World) (En,Pt) (v0.2.7.2) (Demo) (Aftermarket) (Unl).md` | 3.68 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 27 | `Lethal Wedding (USA) (Demo) (Aftermarket) (Unl)/Lethal Wedding (USA) (Demo) (Aftermarket) (Unl).md` | 2.88 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 28 | `Life on Earth (World) (Demo) (Aftermarket) (Unl)/Life on Earth (World) (Demo) (Aftermarket) (Unl).md` | 2.75 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 29 | `Lion King, The (USA) (Demo)/Lion King, The (USA) (Demo).md` | 3.00 MB | Promotional Demo / Trial | 🟢 Public |
| 30 | `Little Medusa (World) (Demo) (Aftermarket) (Unl)/Little Medusa (World) (Demo) (Aftermarket) (Unl).md` | 1.12 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 31 | `Lost World, The - Jurassic Park (USA) (Demo) (Part One) (Sega Channel)/Lost World, The - Jurassic Park (USA) (Demo) (Part One) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 32 | `Magic School Bus, The - Space Exploration Game (USA) (Demo) (Sega Channel)/Magic School Bus, The - Space Exploration Game (USA) (Demo) (Sega Channel).md` | 1018.8 KB | Sega Channel Trial Slice | 🟢 Public |
| 33 | `Mega Bomberman - Special 8-Player-Demo (Europe) (Proto)/Mega Bomberman - Special 8-Player-Demo (Europe) (Proto).md` | 1.00 MB | Developer Prototype | 🟢 Public |
| 34 | `Mega Man X (World) (Demo) (ROM 1) (Aftermarket) (Unl)/Mega Man X (World) (Demo) (ROM 1) (Aftermarket) (Unl).md` | 1.61 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 35 | `Mega R-Type (World) (v1.2) (Demo) (Aftermarket) (Unl)/Mega R-Type (World) (v1.2) (Demo) (Aftermarket) (Unl).md` | 1.75 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 36 | `Mega Slow Mole (World) (Demo) (2023-07-06) (Aftermarket) (Unl)/Mega Slow Mole (World) (Demo) (2023-07-06) (Aftermarket) (Unl).md` | 1.88 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 37 | `Metal Dragon (World) (v1.2) (Demo) (Aftermarket) (Unl)/Metal Dragon (World) (v1.2) (Demo) (Aftermarket) (Unl).md` | 1.32 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 38 | `Metal Slug Warfare (World) (v2.3) (Demo) (Aftermarket) (Unl)/Metal Slug Warfare (World) (v2.3) (Demo) (Aftermarket) (Unl).md` | 1.37 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 39 | `Mortal Kombat 3 (USA) (Demo) (Part A) (Sega Channel)/Mortal Kombat 3 (USA) (Demo) (Part A) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 40 | `NCAA Final Four Special Edition (USA) (Demo 1) (Sega Channel)/NCAA Final Four Special Edition (USA) (Demo 1) (Sega Channel).md` | 1.50 MB | Sega Channel Trial Slice | 🟢 Public |
| 41 | `Olympic Summer Games (USA) (Demo) (Sega Channel)/Olympic Summer Games (USA) (Demo) (Sega Channel).md` | 2.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 42 | `Papi Commando (World) (Demo) (Aftermarket) (Unl)/Papi Commando (World) (Demo) (Aftermarket) (Unl).md` | 3.14 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 43 | `Perlin & Pinpin - The Robin Tower - Back to School (World) (Demo 2) (Aftermarket) (Unl)/Perlin & Pinpin - The Robin Tower - Back to School (World) (Demo 2) (Aftermarket) (Unl).md` | 640.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 44 | `Phantom Gear (World) (v0.9) (Demo) (Aftermarket) (Unl)/Phantom Gear (World) (v0.9) (Demo) (Aftermarket) (Unl).md` | 308.7 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 45 | `Primal Rage (USA) (Demo) (1995-08-26) (Sega Channel) (Showdown)/Primal Rage (USA) (Demo) (1995-08-26) (Sega Channel) (Showdown).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 46 | `Reknum (World) (Demo 2) (Aftermarket) (Unl)/Reknum (World) (Demo 2) (Aftermarket) (Unl).md` | 640.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 47 | `Rocket Panda (World) (Demo) (Megacat) (Aftermarket) (Unl)/Rocket Panda (World) (Demo) (Megacat) (Aftermarket) (Unl).md` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 48 | `Sacred Line II (World) (Demo) (Aftermarket) (Unl)/Sacred Line II (World) (Demo) (Aftermarket) (Unl).md` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 49 | `Sega Channel (USA) (Demo) (1994-02-16)/Sega Channel (USA) (Demo) (1994-02-16).md` | 512.0 KB | Sega Channel Trial Slice | 🟢 Public |
| 50 | `Shinobi (World) (Demo) (Aftermarket) (Unl)/Shinobi (World) (Demo) (Aftermarket) (Unl).md` | 1.50 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 51 | `Skull & Crossbones (USA) (Demo 1)/Skull & Crossbones (USA) (Demo 1).md` | 512.0 KB | Promotional Demo / Trial | 🟢 Public |
| 52 | `Sonic 3D Blast (USA) (Demo) (Part One) (Sega Channel)/Sonic 3D Blast (USA) (Demo) (Part One) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 53 | `Spider-Man (USA) (Tengen) (Demo)/Spider-Man (USA) (Tengen) (Demo).md` | 256.0 KB | Promotional Demo / Trial | 🟢 Public |
| 54 | `Super Street Fighter II (USA) (Demo) (Sega Channel)/Super Street Fighter II (USA) (Demo) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 55 | `Switchblade (World) (Demo) (Aftermarket) (Unl)/Switchblade (World) (Demo) (Aftermarket) (Unl).md` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 56 | `Tanglewood (World) (Rev 2) (Demo) (Steam) (Windows, Mac, Linux) (Aftermarket) (Unl)/Tanglewood (World) (Rev 2) (Demo) (Steam) (Windows, Mac, Linux) (Aftermarket) (Unl).md` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 57 | `Tanzer (World) (Demo) (Mega Cat Studios) (Aftermarket) (Unl)/Tanzer (World) (Demo) (Mega Cat Studios) (Aftermarket) (Unl).md` | 1.50 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 58 | `Thunder Paw (World) (Demo 2) (Aftermarket) (Unl)/Thunder Paw (World) (Demo 2) (Aftermarket) (Unl).md` | 1.50 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 59 | `Toy Story (USA) (Demo)/Toy Story (USA) (Demo).md` | 4.00 MB | Promotional Demo / Trial | 🟢 Public |
| 60 | `Triple Play 96 Special Edition (USA) (Demo) (Sega Channel)/Triple Play 96 Special Edition (USA) (Demo) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 61 | `Virtua Fighter 2 (USA) (Demo) (Part A) (Sega Channel)/Virtua Fighter 2 (USA) (Demo) (Part A) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 62 | `Wolfenstein 3D (World) (Demo) (Aftermarket) (Unl)/Wolfenstein 3D (World) (Demo) (Aftermarket) (Unl).md` | 1.67 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 63 | `World Series Baseball '96 (USA) (Demo) (Sega Channel)/World Series Baseball '96 (USA) (Demo) (Sega Channel).md` | 3.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 64 | `Wrath of the Demon (USA) (Proto)/Wrath of the Demon (USA) (Proto).md` | 1.00 MB | Developer Prototype | 🟢 Public |
| 65 | `X-Men 2 - Clone Wars (USA) (Demo) (Sega Channel)/X-Men 2 - Clone Wars (USA) (Demo) (Sega Channel).md` | 2.00 MB | Sega Channel Trial Slice | 🟢 Public |
| 66 | `ZPF (World) (Demo) (Aftermarket) (Unl)/ZPF (World) (Demo) (Aftermarket) (Unl).md` | 3.88 MB | Homebrew / Aftermarket Demo | 🟢 Public |

### 🕹️ Super Nintendo Entertainment System (SNES) (`snes`) — 9 Titles

| # | Complete File Name / Relative Path | File Size | Classification / Type | Git Status |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `Alien Cat 2 (World) (Demo) (Aftermarket) (Unl)/Alien Cat 2 (World) (Demo) (Aftermarket) (Unl).sfc` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 2 | `Attack of the PETSCII Robots (World) (Demo) (Aftermarket) (Unl)/Attack of the PETSCII Robots (World) (Demo) (Aftermarket) (Unl).sfc` | 512.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 3 | `Eyra - The Crow Maiden (World) (Demo) (2022-06-07) (Aftermarket) (Unl)/Eyra - The Crow Maiden (World) (Demo) (2022-06-07) (Aftermarket) (Unl).sfc` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 4 | `Gunman Clive (World) (Demo) (Aftermarket) (Unl)/Gunman Clive (World) (Demo) (Aftermarket) (Unl).sfc` | 128.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 5 | `Horizontal Shooter (World) (v1.1) (Demo) (Aftermarket) (Unl)/Horizontal Shooter (World) (v1.1) (Demo) (Aftermarket) (Unl).sfc` | 128.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 6 | `Little Medusa (USA) (Demo) (Aftermarket) (Unl)/Little Medusa (USA) (Demo) (Aftermarket) (Unl).sfc` | 2.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 7 | `Lizard (World) (Demo) (Aftermarket) (Unl)/Lizard (World) (Demo) (Aftermarket) (Unl).sfc` | 544.0 KB | Homebrew / Aftermarket Demo | 🟢 Public |
| 8 | `Nova the Squirrel 2 (World) (2023-09-23) (Demo) (Aftermarket) (Unl)/Nova the Squirrel 2 (World) (2023-09-23) (Demo) (Aftermarket) (Unl).sfc` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |
| 9 | `Rrodas Cross (World) (v1.03) (Demo) (Aftermarket) (Unl)/Rrodas Cross (World) (v1.03) (Demo) (Aftermarket) (Unl).sfc` | 1.00 MB | Homebrew / Aftermarket Demo | 🟢 Public |


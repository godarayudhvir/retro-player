---
name: rom-cleanup
description: >-
  Teaches the agent how to clean up a ROMs directory by: (1) removing older
  duplicate/dated versions of the same game and keeping only the latest,
  (2) removing non-English regional ROMs (Japan, Korea, etc.), and
  (3) removing non-famous or very obscure titles. Always presents a full
  plan with keep/remove lists and obtains user approval before deleting anything.
---

# ROM Cleanup Skill

Use this skill whenever the user asks to clean up, trim, or organize a ROMs
directory. This skill applies to any console (NES, SNES, GBA, etc.).

---

## Workflow Overview

Always follow this three-pass cleanup order:

1. **Identify duplicates** — games with multiple dated versions, multiple regional releases, or multiple demo builds
2. **Remove non-English ROMs** — keep only US, Europe, and World releases
3. **Remove non-famous titles** — prune obscure demos, test programs, and seasonal/event-only releases

After each pass, **compile a full keep/remove table** and **present it to the
user for approval** before running any `rm` commands.

---

## Pass 1: Deduplicate (Keep Latest Version)

### How to identify duplicates

ROM filenames follow the No-Intro / GoodTools naming convention:

```
Game Title (Region) (Version or Date) (Flags...).ext
```

A game is a **duplicate** if the same base title appears more than once with:
- Different **dates** — e.g., `(2019-03-11)`, `(2021-05-05)`
- Different **build tags** — e.g., `(Byte-Off 2019)`, `(Kickstarter)`, `(NESDev 2017)`, `(Recalbox)`, `(Digital)`
- Different **revision tags** — e.g., `(Rev 1)`, `(Earlier)`, `(Enhanced)`

### Decision rule

- **Keep** the entry with the latest date or most complete build.
- If one version is clearly the commercial/Kickstarter release and another is
  an older demo, keep the commercial release.
- If two files differ only by **mapper or hardware variant** (e.g., `UNROM 512`
  vs. `GTROM`), keep **both** — they are not true duplicates.

### Example

```
Flea! (World) (Demo) (Byte-Off 2019) ← REMOVE
Flea! (World) (Demo) (2020-02-23)    ← REMOVE
Flea! (World) (Demo) (2020-09-19)    ← REMOVE
Flea! (World) (Demo) (2021-02-19)    ← KEEP (latest)
```

---

## Pass 2: Remove Non-English ROMs

### Regions to REMOVE

Look for these region tags in the filename and remove them:

| Tag | Region |
|-----|--------|
| `(Japan)` | Japanese release |
| `(Japan, Korea)` | Japanese/Korean |
| `(Korea)` | Korean release |
| `(China)` | Chinese release |
| `(Taiwan)` | Taiwanese release |
| `(Brazil)` | Brazilian (Portuguese) release |
| `(Germany)` | German-only release |
| `(France)` | French-only release |
| `(Spain)` | Spanish-only release |
| `(Italy)` | Italian-only release |
| `(Netherlands)` | Dutch-only release |
| `(Sweden)` | Swedish-only release |

### Regions to KEEP

| Tag | Region |
|-----|--------|
| `(USA)` | North American English |
| `(Europe)` | European (usually English or multi) |
| `(World)` | Global multi-region release |
| `(USA, Europe)` | Dual North America + Europe |
| `(USA, Australia)` | English-speaking regions |

### How to check

Use `grep` to find any non-English files before deciding:

```bash
ls | grep -E "\(Japan\)|\(Korea\)|\(China\)|\(Taiwan\)|\(Brazil\)|\(Germany\)|\(France\)|\(Spain\)|\(Italy\)"
```

If the result is empty, skip this pass — no action needed.

---

## Pass 3: Remove Non-Famous / Obscure Titles

This pass is the most subjective. Use the criteria below to classify titles.

### Remove these categories unconditionally

| Category | Examples |
|----------|---------|
| Hardware/peripheral test programs | `Gesture Test for Power Pad`, any `(Program)` flagged ROM |
| Tiny tech demos (< 5 KB) | Usually alphabet/sprite tests, minimal gameplay |
| Seasonal/holiday releases with no standalone fame | Annual `8-BIT XMAS` series, `Santa's Magical Christmas Sleigh` |
| Very early unfinished prototypes tagged `(Earlier)` or `(Proto)` with no follow-up | `Geminim (Earlier)` |
| Pure joke/meme ROMs with minimal gameplay | `NES Matrix`, `Pixel Poops` |
| Pirated hacks unless historically notable | `(Pirate)` tag |

### Keep criteria for homebrew titles

A title is worth keeping if **any** of the following apply:

- Had a **commercial physical or digital release** (e.g., sold on Limited Run, Kickstarter, or itch.io)
- Received **notable coverage** from gaming press (Kotaku, Eurogamer, Ars Technica, etc.)
- Is frequently cited in **NESDev community** top lists or game-of-the-year posts
- Was developed by a **recognized homebrew studio** (e.g., Morphcat, Second Dimension, Broke Studio)
- Has **significant itch.io/Steam downloads** or community following

### Common "always remove" homebrew categories for NES

- All `Allison of Astra` demo series entries (very niche game jam entries)
- All `Byte-Off` contest entries that did not develop into a full/notable game
- Single-screen puzzle demos with no story (`Babel Blox`, `Tic-Tac XO`, `Putt Putt`)
- Games clearly named after real-world events with no replay value (`Escape from the Art Trail`)

---

## Pass 4: Remove Sequels (When Original Is Present)

When a collection contains **multiple installments from the same series**, keep only the
**earliest / original entry** and remove the later sequels.

### Rule

- A **sequel** is any game whose title contains a numeral, subtitle implying continuation
  (e.g., `2`, `3`, `II`, `III`, `Part 2`, `The Next Chapter`), or is widely known to be
  a numbered follow-up.
- **Only remove a sequel if an earlier entry from the same series is also present** in the
  collection. Do not remove a sequel that is the sole representative of its franchise.
- If both the original and a sequel exist, keep the **lowest-numbered / earliest** entry.
- If only sequels are present (no original), **keep them all** — do not remove anything
  from this pass.

### Examples

```
Driver - You Are the Wheelman (USA) (Demo).zip   ← KEEP (original)
Driver 2 (USA) (Demo).zip                        ← REMOVE (sequel, original present)

Spyro the Dragon (USA) (Demo) (SCUS-94290).zip   ← KEEP (original)
Spyro 2 - Ripto's Rage! (USA) (Demo).zip         ← REMOVE (sequel, original present)
Spyro - Year of the Dragon (USA) (Demo).zip      ← REMOVE (sequel, original present)

Mega Man Legends 2 (USA) (Demo).zip              ← KEEP (no Mega Man Legends 1 present)
```

### Reason label for the table

- `sequel (original present)` — a numbered sequel when the original is also in the collection

---

## Presenting the Plan

Before running any deletions, always generate a markdown table split into two sections:

```markdown
## ✅ FILES TO KEEP (N titles)
| # | Filename |

## 🗑️ FILES TO REMOVE (N files)
| Filename | Reason |
```

**Reasons to use in the table:**
- `older version` — superseded by a newer dated release
- `non-English region` — not US/Europe/World
- `test program` — hardware test, not a game
- `very obscure` — no community recognition
- `seasonal demo` — holiday/event-only release
- `pirate/hack` — unauthorized derivative
- `joke ROM` — minimal gameplay, novelty only

Wait for the user to say **"yes"**, **"go ahead"**, or explicitly approve the
plan before running any `rm` commands.

---

## Executing Deletions

Use `rm -v` so every deleted file is echoed to the terminal for confirmation:

```bash
rm -v \
  "Filename 1.zip" \
  "Filename 2.zip"
```

Always run from the target directory using `Cwd` so filenames stay short.

After deletion, verify with:

```bash
ls | wc -l && ls
```

Report the before/after file count to the user.

---

## Notes

- Never use `rm -rf` on the whole directory — always list files individually.
- Always preserve the `README.md` or `.gitkeep` if present in the ROMs folder.
- If you are unsure whether a title is "famous enough," err on the side of
  keeping it and note it as borderline in the plan.
- This skill applies to any console subdirectory: `nes/`, `snes/`, `gba/`,
  `genesis/`, etc. The naming conventions and region tags are the same.

# 📚 Audit Specification 06: Documentation & Roadmap Sync

> **Audit Date**: 2026-09-02  
> **Severity**: 🟢 **LOW / QUICK WIN**  
> **Impact**: Developer Experience, Repository Health, User Navigation, Licensing Integrity  
> **Target Files**: `README.md`, `LICENSE`, `guides/README.md`, `mirai/README.md`

---

## 📌 1. Executive Summary

This specification addresses documentation hygiene, broken internal links, a missing MIT license file, and status discrepancies across the **`guides/`** and **`mirai/`** directories.

Per **Project Rule 1**, whenever documentation is inspected or updated, all cross-references, roadmap backlog items, and platform statistics must remain 100% accurate with zero broken links or stale entries.

---

## 🔍 2. Defect Details & Root Cause Analysis

### Defect 6.1: Broken Markdown Link in `README.md`
* **Affected File**: `README.md` (line 201)
* **Code**:
  ```markdown
  | **[📱 Cross-Device Experience Matrix](guides/device-experience-matrix.md)** | Feature sets, UI density... |
  ```
* **Root Cause**: The guide was named `guides/device-matrix.md`. The link in `README.md` points to a non-existent file name `guides/device-experience-matrix.md`, producing a 404 error when clicked from GitHub.

### Defect 6.2: Missing Root `LICENSE` File
* **Affected File**: `LICENSE` (Missing)
* **Root Cause**: `README.md` displays the badge `[License: MIT](LICENSE)` on line 18 and states `See LICENSE for more information.` on line 246. However, no `LICENSE` file exists in the repository root.

### Defect 6.3: Dead Links to Missing `mirai/` Specs in `README.md`
* **Affected File**: `README.md` (lines 230–233)
* **Code**:
  ```markdown
  - **[Pokémon Save Inspector (Gen 5 NDS)](mirai/pokemon-save-gen5.md)**
  - **[Pokémon Single-Player Milestones Expansion (Gen 1–5)](mirai/pokemon-milestones-expansion.md)**
  - **[Mobile UI Gamepad & Spatial Navigation](mirai/mobile-gamepad-navigation.md)**
  ```
* **Root Cause**:
  - Gen 5 NDS was already implemented and documented in [guides/pokemon/gen5-unova.md](file:///Users/godarayudhvir/Github/retro-player/guides/pokemon/gen5-unova.md).
  - `pokemon-milestones-expansion.md` does not exist in `mirai/`.
  - The actual mobile navigation specification is named [mirai/gamepad-ui-navigation-rearchitecture.md](file:///Users/godarayudhvir/Github/retro-player/mirai/gamepad-ui-navigation-rearchitecture.md).

### Defect 6.4: Missing Guide Row in `guides/README.md`
* **Affected File**: `guides/README.md` (lines 10–24)
* **Root Cause**: [guides/compatibility.md](file:///Users/godarayudhvir/Github/retro-player/guides/compatibility.md) (*Hardware & Platform Compatibility Matrix*) is present in `guides/` and linked in `README.md`, but is absent from the master directory table in `guides/README.md`.

### Defect 6.5: Missing Spec in `mirai/README.md` Status Table
* **Affected File**: `mirai/README.md` (lines 11–21)
* **Root Cause**: [mirai/cartridge-designs-spec.md](file:///Users/godarayudhvir/Github/retro-player/mirai/cartridge-designs-spec.md) exists in the directory but is omitted from the table index in `mirai/README.md`.

### Defect 6.6: Incomplete Pokémon Save Inspector Summary in `README.md`
* **Affected File**: `README.md` (line 203)
* **Code**:
  ```markdown
  Binary SRAM/Flash save inspection specifications across Gen 1 (Kanto), Gen 2 (Johto 16 Badges), Gen 3 (Hoenn & FRLG), and Gen 4 (Sinnoh & HGSS).
  ```
* **Root Cause**: Omits **Gen 5 (Unova)**, which is fully operational in the codebase and documented in [guides/pokemon/gen5-unova.md](file:///Users/godarayudhvir/Github/retro-player/guides/pokemon/gen5-unova.md).

---

## 🛠️ 3. Concrete Implementation Plan & Code Diffs

### Step 1: Fix Broken Link in `README.md`
```diff
-| **[📱 Cross-Device Experience Matrix](guides/device-experience-matrix.md)** | Feature sets, UI density, input modes, and admin capabilities compared across Mobile, Handheld, PC, and TV. |
+| **[📱 Cross-Device Experience Matrix](guides/device-matrix.md)** | Feature sets, UI density, input modes, and admin capabilities compared across Mobile, Handheld, PC, and TV. |
```

### Step 2: Create Root `LICENSE` File (MIT)
Create `LICENSE`:
```text
MIT License

Copyright (c) 2026 Yudhvir Godara

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Step 3: Update `README.md` Roadmap Links
```diff
-- **[Pokémon Save Inspector (Gen 5 NDS)](mirai/pokemon-save-gen5.md)**: Zero-overhead binary save parser for 512KB NDS saves for Gen 5 (Unova Gym Badges and League Champions Alder & Iris).
-- **[Pokémon Single-Player Milestones Expansion (Gen 1–5)](mirai/pokemon-milestones-expansion.md)**: Offline single-player storyline milestones across Gen 1–5 (Starters, Key Items, Legendary Titans, and Mt. Silver Red).
-- **[Mobile UI Gamepad & Spatial Navigation](mirai/mobile-gamepad-navigation.md)**: Purpose-built 2D spatial navigation engine for mobile feeds and bottom sheets.
+- **[App UI Gamepad & Spatial Navigation Re-Architecture](mirai/gamepad-ui-navigation-rearchitecture.md)**: Purpose-built 2D spatial navigation engine for dashboard, mobile feeds, and console views.
```

### Step 4: Add `compatibility.md` to `guides/README.md` Table
```markdown
| **[🌐 Platform & Hardware Compatibility](compatibility.md)** | Browser, OS, Smart TV (LG webOS, Tizen, Fire TV), Handheld, and controller support breakdown. | Web browsers, Smart TVs, Steam Deck, Mobile |
```

### Step 5: Add `cartridge-designs-spec.md` to `mirai/README.md` Table
Add to active specifications table:
```markdown
| 4 | 🟡 Medium | **[3D Cartridge & Media Designs](cartridge-designs-spec.md)** | UI / 3D Graphics | Authentic geometric specifications, labels, and rendering parameters for classic game cartridges. | 📋 Planned |
```

### Step 6: Update Pokémon Save Inspector Summary in `README.md`
```diff
-| **[⚡ Pokémon Save Inspector & Regional Milestones Hub](guides/pokemon/README.md)** | Binary SRAM/Flash save inspection specifications across Gen 1 (Kanto), Gen 2 (Johto 16 Badges), Gen 3 (Hoenn & FRLG), and Gen 4 (Sinnoh & HGSS). |
+| **[⚡ Pokémon Save Inspector & Regional Milestones Hub](guides/pokemon/README.md)** | Binary SRAM/Flash save inspection specifications across Gen 1 (Kanto), Gen 2 (Johto 16 Badges), Gen 3 (Hoenn & FRLG), Gen 4 (Sinnoh & HGSS), and Gen 5 (Unova). |
```

---

## 🧪 4. Verification & Testing Checklist

- [ ] **Markdown Link Integrity**: Run a markdown link checker across `README.md`, `guides/`, and `mirai/` to ensure 0 dead internal links.
- [ ] **License Check**: Click the License badge in `README.md` and verify it links to `LICENSE`.
- [ ] **Table Parity**: Verify every file in `guides/` has a corresponding row in `guides/README.md`.
- [ ] **Roadmap Backlog Parity**: Verify every file in `mirai/` has a corresponding row in `mirai/README.md`.

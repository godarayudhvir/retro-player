---
name: update-roms
description: >-
  Organizes ROM directory structures, standardizes folder and file names, ingests
  loose screenshots/cover drops in authentic image formats (PNG/JPG/WebP),
  and queries the official Libretro CDN database to fetch authentic 1:1 box art covers
  and generate local metadata.json sidecar files for retro game collections.
---

# Update ROMs Skill

Use this skill whenever you or the user drops ROMs or screenshot/cover images into the ROMs directory (`public/roms/`) and wants them automatically organized, standardized, and enriched with authentic metadata.

---

## 🏛️ Two Distinct Metadata Scraper Architectures

Retro Player maintains two completely independent metadata enrichment layers:

| Layer | Domain / Target | Storage Location | Execution Environment | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Backend `update-roms` Skill** | Codebase repository library maintainers | `public/roms/<system>/<Title>/<Title>.<ext>` + `metadata.json` | Local Node.js runtime in IDE (Libretro CDN only) | **Top Priority (1st)** |
| **Frontend Online Scraper** | End users visiting website / GitHub Pages | Browser `IndexedDB` (`RetroPlayerMetadataDB`) | Client-side Chrome / Web browser | **Fallback Priority (2nd)** |

- **Covers are Top Priority**: The pipeline prioritizes fetching authentic 1:1 box art covers directly from the official Libretro CDN (`http://thumbnails.libretro.com/`) in their native pixel-perfect format before secondary metadata generation.
- **High-Throughput Parallel Concurrency**: Features a built-in async worker concurrency pool (5 workers) for sub-second directory scanning and batch cover updates.
- **Layered Fallback Matching & Checksum Verification**: The scraper queries exact matching titles first. If not found, it activates layered fallback candidate generation:
  1. *Libretro Sanitization*: Special characters sanitized according to Libretro rules (`&` $\rightarrow$ `_`, `: / \ * ? " < > |` $\rightarrow$ `_`).
  2. *Patch & Anti-Piracy Suffix Stripping*: Strips `_apfix`, `_ap_fix`, `_fix`, `_patched`, `_v...`, and `(AP Fix)` tags while preserving region.
  3. *Auxiliary Tag Stripping*: Strips compilation/re-release/aftermarket tags (e.g. `(e-Reader)`, `(Evercade)`, `(Wii U Virtual Console)`, `(Castlevania Anniversary Collection)`, `(Limited Run Games)`, `(Aftermarket)`) while preserving region tags.
  4. *Regional, NDSi Enhanced & Revision Fallbacks*: Tries alternate regions and revisions (`(USA)`, `(USA, Europe)`, `(World)`, `(Japan, USA)`, `(Europe)`, `(Europe) (En,Fr,De,Es,It)`, `(USA, Europe) (NDSi Enhanced)`).
  5. *Article Inversion*: Tries `Title, The` $\leftrightarrow$ `The Title`.
  6. *CRC32 Checksum Matching*: Computes internal ROM checksums for renamed or truncated files.
- **File Names as Title**: The `metadata.json` sidecar strictly uses the exact ROM file base name as its `"title"` (e.g. `"Super Mario Bros. 3 (USA)"`), preserving authentic region, revision, and version indicators without artificial stripping or truncation.
- **Local Codebase Sidecars Take Precedence**: Whenever `metadata.json` or companion covers exist on disk inside the game folder, the web application immediately serves and renders them, completely bypassing the browser scraper.

---

## 🚀 Universal Workflows

### 1. New ROM & Cover Drop-In Workflow
Whenever a new game or cover is added:
1. **Drop ROM file** (`.gba`, `.sfc`, `.nes`, `.nds`, `.z64`, `.zip`, `.iso`, etc.) anywhere into `public/roms/` or inside a console folder.
2. **Drop Screenshot / Box Art image** (`.png`, `.jpg`, `.jpeg`, `.webp`) into `public/roms/`.
3. **Run `update-roms`**:
   ```bash
   node .agents/skills/update-roms/scripts/update_roms.js --all
   ```
4. **The script automatically**:
   - Detects the console type from the file extension and creates the canonical subdirectory: `public/roms/<system>/<Exact Title>/`.
   - Moves the ROM file into its subfolder and standardizes its filename.
   - **(Priority 1 - Covers)**: Ingests loose screenshots or queries the official Libretro Thumbnail CDN (`http://thumbnails.libretro.com/`) to download authentic 1:1 box art covers directly into `<Exact Title>.<ext>`.
   - **(Priority 2 - Metadata)**: Generates clean local companion `metadata.json` sidecars strictly using the exact ROM file name as the `"title"`.

### 2. In-Folder ROM Version Upgrade & Custom Screenshot Replacement Workflow
Whenever an existing game receives an updated ROM version or a new custom screenshot inside its existing folder (e.g. `public/roms/gba/Pokemon Heart & Soul (v1.2.1)`):
1. **Drop New ROM Version** (e.g. `Pokémon Heart and Soul (v2.0.2).gba`) directly into the existing game folder.
2. **Drop New Custom Screenshot / Cover** (e.g. `Pokemon_Heart_and_Soul_v2_0_2_Custom_Screenshot_...png`) into the folder.
3. **Run `update-roms`**:
   ```bash
   node .agents/skills/update-roms/scripts/update_roms.js --all
   ```
4. **The script automatically**:
   - Compares ROM version numbers/dates within the folder, selects the latest active ROM, and safely purges obsolete superseded ROMs.
   - Standardizes the new custom screenshot to `<Exact Title>.<ext>`.
   - Renames the parent folder and ROM file to match the clean canonical active title and version tag.
   - Synchronizes `metadata.json` so the title strictly matches the exact updated ROM filename.

### 3. Staging Drop-In Folders Workflow (`/roms/new/`, `/roms/drops/`, `/roms/staging/`)
Whenever one or more ROMs and screenshots are placed inside staging folders like `public/roms/new/`:
1. **Drop ROMs and Screenshots** inside any staging directory (`public/roms/new/`, `public/roms/staging/`, or `public/roms/drops/`).
2. **Run `update-roms`**:
   ```bash
   node .agents/skills/update-roms/scripts/update_roms.js --all
   ```
3. **The script automatically**:
   - Recursively inspects staging folders, detecting console systems from file extensions (e.g. `.gba` -> `gba`).
   - Normalizes game titles to canonical formatting (e.g. `Pokemon Recharged Emerald (v2.2.5)`).
   - Routes ROMs into `public/roms/<system>/<Exact Title>/`.
   - Ingests companion staging screenshots/covers to `<Exact Title>.<ext>` in the game directory and cleans staging.
   - Generates companion `metadata.json` sidecars with the exact filename as title.
   - Cleans up and deletes the staging folder when complete.

---

## Standard ROM Directory Layout

```text
public/roms/
└── <system_folder>/                      # e.g., gba, snes, nes, genesis, ps1, arcade
    └── <Exact Title (Flags)>/            # Subdirectory named exactly after the ROM release
        ├── <Exact Title (Flags)>.<ext>   # ROM file (extension: .gba, .sfc, .nes, .iso, etc.)
        ├── <Exact Title (Flags)>.<imgExt># Companion cover image (.png, .webp, .jpg)
        └── metadata.json                 # Companion metadata sidecar (Title = Filename)
```

### Companion Cover Format
- Filename must match the ROM base name: `<ROM_BASE_NAME>.<ext>` (.png, .webp, .jpg)
- Authentic pixel-perfect box art display on retro cartridges and HUD carousels.

### Companion Sidecar (`metadata.json`) Format
The `title` property strictly uses the exact ROM file base name:
```json
{
  "title": "Super Mario Bros. 3 (USA)",
  "description": "Authentic Nintendo Entertainment System release of Super Mario Bros. 3 (USA).",
  "releaseYear": "1990",
  "developer": "Nintendo Entertainment System",
  "publisher": "Nintendo Entertainment System",
  "genre": "Retro Classic"
}
```

---

## Automated Script Usage

The workspace includes a dedicated automated script at [update_roms.js](file:///Users/godarayudhvir/Github/retro-player/.agents/skills/update-roms/scripts/update_roms.js).

### Running All Updates (Organize + Convert Covers + Fetch Metadata)

```bash
node .agents/skills/update-roms/scripts/update_roms.js --all
```

### Target Specific Operations

- **Dry run (inspect proposed changes without writing to disk):**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --all --dry-run
  ```

- **Force re-scrape online metadata (overwriting existing sidecars):**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --all --force
  ```

- **Organize directory and fix folder/file name mismatches only:**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --organize
  ```

- **Convert PNG/JPG covers to WebP:**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --convert-covers
  ```

- **Fetch missing metadata sidecars (`metadata.json`):**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --fetch-metadata
  ```

- **Target a specific console system (e.g. GBA):**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --system gba --all
  ```

- **Target multiple console systems sequentially (comma or slash separated):**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --system nes,gb,gbc --all
  # Or:
  node .agents/skills/update-roms/scripts/update_roms.js --system nes/gb/gbc --all
  ```

- **Target a custom ROM directory path:**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --dir /path/to/roms --all
  ```


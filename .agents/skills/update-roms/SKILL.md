---
name: update-roms
description: >-
  Organizes ROM directory structures, standardizes folder and file names, ingests
  loose screenshots/cover drops, converts PNG/JPG box art covers to optimized WebP format,
  and queries the official Libretro CDN database to fetch authentic 1:1 box art covers
  and generate local metadata.json sidecar files for retro game collections.
---

# Update ROMs Skill

Use this skill whenever you or the user drops ROMs or screenshot/cover images into the ROMs directory (`public/roms/`) and wants them automatically organized, converted, and enriched with authentic metadata.

---

## 🏛️ Two Distinct Metadata Scraper Architectures

Retro Player maintains two completely independent metadata enrichment layers:

| Layer | Domain / Target | Storage Location | Execution Environment | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Backend `update-roms` Skill** | Codebase repository library maintainers | `public/roms/<system>/<Title>/<Title>.webp` + `metadata.json` | Local Node.js runtime in IDE (Libretro CDN only) | **Top Priority (1st)** |
| **Frontend Online Scraper** | End users visiting website / GitHub Pages | Browser `IndexedDB` (`RetroPlayerMetadataDB`) | Client-side Chrome / Web browser | **Fallback Priority (2nd)** |

- **Covers are Top Priority**: The pipeline prioritizes fetching and converting authentic 1:1 box art covers (`.webp`, quality 85) directly from the official Libretro CDN (`http://thumbnails.libretro.com/`) before secondary metadata generation.
- **File Names as Title**: The `metadata.json` sidecar strictly uses the exact ROM file base name as its `"title"` (e.g. `"Super Mario Bros. 3 (USA)"`), preserving authentic region, revision, and version indicators without artificial stripping or truncation.
- **Local Codebase Sidecars Take Precedence**: Whenever `metadata.json` or companion `.webp` covers exist on disk inside the game folder, the web application immediately serves and renders them, completely bypassing the browser scraper.

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
   - **(Priority 1 - Covers)**: Ingests loose screenshots or queries the official Libretro Thumbnail CDN (`http://thumbnails.libretro.com/`) to download authentic 1:1 box art covers, converting them to `<Exact Title>.webp` (quality 85).
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
   - Converts the new custom screenshot to the standardized `<Exact Title>.webp` and cleans up old covers and source PNG/JPG files.
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
   - Converts companion staging screenshots/covers to `<Exact Title>.webp` (quality 85) in the game directory and removes the source images.
   - Generates companion `metadata.json` sidecars with the exact filename as title.
   - Cleans up and deletes the staging folder when complete.

---

## Standard ROM Directory Layout

```text
public/roms/
└── <system_folder>/                      # e.g., gba, snes, nes, genesis, ps1, arcade
    └── <Exact Title (Flags)>/            # Subdirectory named exactly after the ROM release
        ├── <Exact Title (Flags)>.<ext>   # ROM file (extension: .gba, .sfc, .nes, .iso, etc.)
        ├── <Exact Title (Flags)>.webp    # Companion WebP cover image (1st Priority)
        └── metadata.json                 # Companion metadata sidecar (Title = Filename)
```

### Companion Cover Format
- Filename must match the ROM base name: `<ROM_BASE_NAME>.webp`
- WebP format (quality 85) provides fast loading times and crisp display on retro cartridges and HUD carousels.

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

- **Target a custom ROM directory path:**
  ```bash
  node .agents/skills/update-roms/scripts/update_roms.js --dir /path/to/roms --all
  ```

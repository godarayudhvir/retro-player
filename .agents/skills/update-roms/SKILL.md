---
name: update-roms
description: >-
  Organizes ROM directory structures, standardizes folder and file names, ingests
  loose screenshots/cover drops, converts PNG/JPG box art covers to optimized WebP format,
  and dynamically queries live online sources (Wikipedia, PokeCommunity, ROMhacking, Web)
  to generate local metadata.json sidecar files for retro game collections.
---

# Update ROMs Skill

Use this skill whenever you or the user drops ROMs or screenshot/cover images into the ROMs directory (`public/roms/`) and wants them automatically organized, converted, and enriched with authentic metadata.

---

## 🏛️ Two Distinct Metadata Scraper Architectures

Retro Player maintains two completely independent metadata enrichment layers:

| Layer | Domain / Target | Storage Location | Execution Environment | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Backend `update-roms` Skill** | Codebase repository library maintainers | `public/roms/<system>/<Title>/metadata.json` + `.webp` | Local Node.js runtime in IDE | **Top Priority (1st)** |
| **Frontend Online Scraper** | End users visiting website / GitHub Pages | Browser `IndexedDB` (`RetroPlayerMetadataDB`) | Client-side Chrome / Web browser | **Fallback Priority (2nd)** |

- **Local Codebase Sidecars Take Precedence**: Whenever `metadata.json` or companion `.webp` covers exist on disk inside the game folder, the web application immediately serves and renders them, completely bypassing the browser scraper.
- **Frontend Scraper is Isolated**: The client-side scraper is strictly designed for web users uploading ROMs in RAM without backend access.

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
   - Detects the console type from the file extension and creates the canonical subdirectory: `public/roms/<system>/<Clean Title>/`.
   - Moves the ROM file into its subfolder and standardizes its filename.
   - Matches the loose screenshot/cover to the game via fuzzy title normalization, converts it to `<Clean Title>.webp` (quality 85), and removes the loose source image.
   - Dynamically queries online databases (Wikipedia Full-Text Open Search, PokeCommunity, ROMhacking, and Open Web Search) to extract authentic plot descriptions, developer/author names, release years, and genres without any hardcoded lists.
   - Generates the local companion `metadata.json` sidecar directly in the game's directory.

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
   - Converts the new custom screenshot to the standardized `<Clean Title>.webp` and cleans up old covers and source PNG/JPG files.
   - Renames the parent folder and ROM file to match the clean canonical active title and version tag.
   - Synchronizes `metadata.json` so the title version tag matches the updated ROM.

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
   - Routes ROMs into `public/roms/<system>/<Canonical Title>/`.
   - Converts companion staging screenshots/covers to `<Canonical Title>.webp` (quality 85) in the game directory and removes the source images.
   - Generates or enriches companion `metadata.json` sidecars.
   - Cleans up and deletes the staging folder when complete.

---

## Standard ROM Directory Layout

```text
public/roms/
└── <system_folder>/                      # e.g., gba, snes, nes, genesis, ps1, arcade
    └── <Clean Title (Flags)>/            # Subdirectory named exactly after the ROM release
        ├── <Clean Title (Flags)>.<ext>   # ROM file (extension: .gba, .sfc, .nes, .iso, etc.)
        ├── <Clean Title (Flags)>.webp    # Companion WebP cover image
        └── metadata.json                 # Companion metadata sidecar
```

### Companion Cover Format
- Filename must match the ROM base name: `<ROM_BASE_NAME>.webp`
- WebP format (quality 85) provides fast loading times and crisp display on retro cartridges and HUD carousels.

### Companion Sidecar (`metadata.json`) Format
```json
{
  "title": "Clean Display Title",
  "description": "Engaging plot summary and background overview of the game.",
  "releaseYear": "1995",
  "developer": "Original Studio / Homebrew Author",
  "publisher": "Publisher / Homebrew Publisher",
  "genre": "Action / Platformer / RPG",
  "walkthrough": {
    "written": "https://gamefaqs.gamespot.com/...",
    "video": "https://www.youtube.com/watch?v=..."
  }
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

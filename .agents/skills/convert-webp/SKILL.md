---
name: convert-webp
description: >-
  Scans ROM directories (or any directory path) for image files (PNG, JPG, JPEG),
  converts them to high-performance WebP format using cwebp / sips, and deletes
  the original files afterwards.
---

# Convert WebP Skill

Use this skill whenever the user asks to convert covers or images in `public/roms/` (or any custom directory) from PNG/JPG/JPEG into `.webp` and remove the original source images.

---

## 🛠️ Usage

### Run conversion on the default `public/roms` directory:

```bash
node .agents/skills/convert-webp/scripts/convert_webp.js
```

### Options & Flags:

- **Target specific directory:**
  ```bash
  node .agents/skills/convert-webp/scripts/convert_webp.js --dir public/roms/gba
  ```
- **Target a specific console system:**
  ```bash
  node .agents/skills/convert-webp/scripts/convert_webp.js --system gba
  ```
- **Dry-run mode (preview files to be converted without modifying disk):**
  ```bash
  node .agents/skills/convert-webp/scripts/convert_webp.js --dry-run
  ```
- **Keep original files (do not delete PNG/JPG after conversion):**
  ```bash
  node .agents/skills/convert-webp/scripts/convert_webp.js --keep-originals
  ```
- **Adjust WebP compression quality (default: 85):**
  ```bash
  node .agents/skills/convert-webp/scripts/convert_webp.js --quality 90
  ```

---

## ⚙️ How it Works

1. Recursively scans the target directory for `.png`, `.jpg`, `.jpeg` image files.
2. Converts each image to `.webp` with native `cwebp` (falling back to macOS `sips` if needed).
3. Verifies that the destination `.webp` file exists and has non-zero size.
4. Safely deletes the original source image (`.png`/`.jpg`/`.jpeg`).
5. Reports total images processed, total space saved, and errors (if any).

---
name: codebase-stats
description: >-
  Analyzes and reports file statistics across the codebase (file extensions, counts, and sizes).
  Automatically filters out build artifacts, caches, and dependency directories (dist, build,
  node_modules, .git, .gemini). Supports sorting by count or size and formatting as Markdown tables
  or compact strings.
---

# Codebase File Statistics Skill

Use this skill whenever the user asks for codebase file statistics, counts, sizes, or a breakdown of file types in the project.

---

## Capabilities & Rules

1. **Ignore Non-Source / Build Directories**: Always exclude folders that contain duplicate/generated files:
   - `dist/`, `build/`, `.output/`, `.next/`, `.cache/`, `.turbo/`, `.vercel/`, `coverage/`
   - `node_modules/`
   - `.git/`, `.gemini/`
2. **Accurate Categorization**: Group files by lowercase extension (e.g. `.js`, `.jsx`, `.gba`, `.json`). Files without an extension should be grouped under `(no extension)`.
3. **Flexible Sorting**: Support sorting by **count** (descending) or **size** (descending) based on user preference. Default to sorting by **count** if unspecified or requested.
4. **Dual Output Formatting**: Provide both:
   - A structured GitHub Markdown table
   - A compact summary string: `ext count size, ext count size, ...`

---

## Execution Methods

### Option 1: Run Built-in Skill Script

Run the bundled python analyzer:

```bash
# Sorted by count (default)
python3 .agents/skills/codebase-stats/scripts/count_stats.py --sort count

# Sorted by size
python3 .agents/skills/codebase-stats/scripts/count_stats.py --sort size

# Specific path
python3 .agents/skills/codebase-stats/scripts/count_stats.py --path ./src --sort count
```

### Option 2: Inline Python Execution

If running directly in any environment without the script path:

```python
import os

EXCLUDE = {'.git', 'node_modules', '.gemini', 'dist', 'build', '.output', '.next', '.cache'}
stats = {}

for dirpath, dirnames, filenames in os.walk('.'):
    dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
    for f in filenames:
        ext = os.path.splitext(f)[1].lower().lstrip('.') or '(no extension)'
        try:
            size = os.path.getsize(os.path.join(dirpath, f))
        except OSError:
            size = 0
        if ext not in stats:
            stats[ext] = {'count': 0, 'size': 0}
        stats[ext]['count'] += 1
        stats[ext]['size'] += size
```

---

## Output Templates

### 1. Markdown Table

```markdown
### Summary Table

| File Type | Count | Total Size |
| :--- | :--- | :--- |
| **`.md`** | **59** | 5.27 MB |
| **`.webp`** | **50** | 2.01 MB |
| **`.json`** | **45** | 91.74 MB |
```

### 2. Compact Format

```markdown
### Compact Format
md 59 5.27MB, webp 50 2.01MB, json 45 91.74MB, js 25 729.53KB, gba 22 563.99MB...
```

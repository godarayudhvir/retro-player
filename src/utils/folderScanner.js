import { detectSystemFromExtension, isSupportedRomFile, SUPPORTED_ROM_EXTENSIONS } from './systemDetector';

export { isSupportedRomFile, SUPPORTED_ROM_EXTENSIONS };

export const SUPPORTED_IMAGE_EXTENSIONS = new Set(['webp', 'png', 'jpg', 'jpeg']);
export const SUPPORTED_SIDECAR_EXTENSIONS = new Set(['json', 'nfo']);

export function isSupportedImageFile(filename) {
  if (!filename || filename.startsWith('.')) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.has(ext);
}

export function isSupportedSidecarFile(filename) {
  if (!filename || filename.startsWith('.')) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_SIDECAR_EXTENSIONS.has(ext);
}

/**
 * Recursively read all entries from a FileSystemEntry (drag & drop directory traversal).
 */
async function readEntryRecursively(entry, pathPrefix = '') {
  const currentPath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file) => {
        if (isSupportedRomFile(file.name) || isSupportedImageFile(file.name) || isSupportedSidecarFile(file.name)) {
          try {
            Object.defineProperty(file, 'webkitRelativePath', {
              value: currentPath,
              writable: true
            });
          } catch (_) {
            file.relativePath = currentPath;
          }
          resolve([file]);
        } else {
          resolve([]);
        }
      }, () => resolve([]));
    });
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const readAllEntries = async () => {
      let entries = [];
      let batch;
      do {
        batch = await new Promise((resolve) => {
          reader.readEntries(resolve, () => resolve([]));
        });
        entries = entries.concat(batch);
      } while (batch && batch.length > 0);
      return entries;
    };

    const dirEntries = await readAllEntries();
    const nestedFiles = await Promise.all(dirEntries.map(child => readEntryRecursively(child, currentPath)));
    return nestedFiles.flat();
  }
  return [];
}

/**
 * Recursively scans a FileSystemDirectoryHandle (Modern File System Access API).
 */
export async function scanDirectoryHandle(dirHandle, pathPrefix = '') {
  let files = [];
  for await (const entry of dirHandle.values()) {
    const relativePath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      if (isSupportedRomFile(entry.name) || isSupportedImageFile(entry.name) || isSupportedSidecarFile(entry.name)) {
        try {
          const file = await entry.getFile();
          try {
            Object.defineProperty(file, 'webkitRelativePath', {
              value: relativePath,
              writable: true
            });
          } catch (_) {
            file.relativePath = relativePath;
          }
          files.push(file);
        } catch (e) {
          console.warn('Could not read file from directory handle:', entry.name, e);
        }
      }
    } else if (entry.kind === 'directory') {
      const subFiles = await scanDirectoryHandle(entry, relativePath);
      files = files.concat(subFiles);
    }
  }
  return files;
}

/**
 * Pair companion cover images and metadata sidecars with their corresponding ROMs.
 */
function pairCompanionFiles(romFiles, imageFiles, sidecarFiles) {
  let localCoversCount = 0;
  let localSidecarsCount = 0;

  // Group images and sidecars by directory
  const getDir = (file) => {
    const rel = file.webkitRelativePath || file.relativePath || file.name;
    const idx = rel.lastIndexOf('/');
    return idx !== -1 ? rel.substring(0, idx) : '';
  };

  const getBaseName = (filename) => filename.replace(/\.[^/.]+$/, "");
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const imagesByDir = new Map();
  for (const img of imageFiles) {
    const dir = getDir(img);
    if (!imagesByDir.has(dir)) imagesByDir.set(dir, []);
    imagesByDir.get(dir).push(img);
  }

  const sidecarsByDir = new Map();
  for (const meta of sidecarFiles) {
    const dir = getDir(meta);
    if (!sidecarsByDir.has(dir)) sidecarsByDir.set(dir, []);
    sidecarsByDir.get(dir).push(meta);
  }

  for (const rom of romFiles) {
    const dir = getDir(rom);
    const rawBase = getBaseName(rom.name);
    const normBase = normalize(rawBase);

    // 1. Pair Companion Cover Image
    const candidateImages = imagesByDir.get(dir) || [];
    let matchedCover = null;

    // Exact base name match (e.g. Pokemon.gba -> Pokemon.webp / Pokemon.png)
    matchedCover = candidateImages.find(img => getBaseName(img.name) === rawBase);
    
    // Normalized base name match
    if (!matchedCover) {
      matchedCover = candidateImages.find(img => normalize(getBaseName(img.name)) === normBase);
    }

    // Generic cover match in same folder (e.g. cover.webp, boxart.png, folder.jpg)
    if (!matchedCover) {
      matchedCover = candidateImages.find(img => {
        const name = getBaseName(img.name).toLowerCase();
        return name === 'cover' || name === 'boxart' || name === 'front' || name === 'folder' || name === 'poster';
      });
    }

    // Suffix match (e.g. Pokemon-cover.webp)
    if (!matchedCover) {
      matchedCover = candidateImages.find(img => {
        const name = normalize(getBaseName(img.name));
        return name.startsWith(normBase) || normBase.startsWith(name);
      });
    }

    if (matchedCover) {
      rom.companionCoverFile = matchedCover;
      localCoversCount++;
    }

    // 2. Pair Companion Metadata Sidecar (.json, .nfo)
    const candidateSidecars = sidecarsByDir.get(dir) || [];
    let matchedMeta = null;

    // Exact base name match (e.g. Pokemon.gba -> Pokemon.json / Pokemon.nfo)
    matchedMeta = candidateSidecars.find(m => getBaseName(m.name) === rawBase);

    // Normalized match
    if (!matchedMeta) {
      matchedMeta = candidateSidecars.find(m => normalize(getBaseName(m.name)) === normBase);
    }

    // Generic sidecar match in subfolder (e.g. metadata.json, game.nfo)
    if (!matchedMeta) {
      matchedMeta = candidateSidecars.find(m => {
        const name = getBaseName(m.name).toLowerCase();
        return name === 'metadata' || name === 'game' || name === 'info';
      });
    }

    if (matchedMeta) {
      rom.companionMetaFile = matchedMeta;
      localSidecarsCount++;
    }
  }

  return { localCoversCount, localSidecarsCount };
}

/**
 * Extract all ROM files and companion assets from a DataTransferItemList, FileList, or File array.
 * @param {DataTransfer|FileList|Array<File>} input 
 * @returns {Promise<{ folderName: string, files: Array<File>, stats: { totalFiles: number, totalSizeBytes: number, systems: Record<string, number>, localCoversCount: number, localSidecarsCount: number } }>}
 */
export async function extractRomsFromInput(input) {
  let allFiles = [];
  let detectedFolderName = 'ROMs Collection';

  if (input?.items && input.items.length > 0) {
    const entryPromises = [];
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          if (entry.isDirectory && i === 0) {
            detectedFolderName = entry.name;
          }
          entryPromises.push(readEntryRecursively(entry));
        }
      } else {
        const file = item.getAsFile();
        if (file && (isSupportedRomFile(file.name) || isSupportedImageFile(file.name) || isSupportedSidecarFile(file.name))) {
          allFiles.push(file);
        }
      }
    }
    const resolvedEntries = (await Promise.all(entryPromises)).flat();
    allFiles = allFiles.concat(resolvedEntries);
  } else if (input?.files) {
    allFiles = Array.from(input.files).filter(f => isSupportedRomFile(f.name) || isSupportedImageFile(f.name) || isSupportedSidecarFile(f.name));
    if (allFiles.length > 0 && allFiles[0].webkitRelativePath) {
      const parts = allFiles[0].webkitRelativePath.split('/');
      if (parts.length > 1) {
        detectedFolderName = parts[0];
      }
    }
  } else if (Array.isArray(input)) {
    allFiles = input.filter(f => isSupportedRomFile(f.name) || isSupportedImageFile(f.name) || isSupportedSidecarFile(f.name));
  } else if (input instanceof FileList) {
    allFiles = Array.from(input).filter(f => isSupportedRomFile(f.name) || isSupportedImageFile(f.name) || isSupportedSidecarFile(f.name));
    if (allFiles.length > 0 && allFiles[0].webkitRelativePath) {
      const parts = allFiles[0].webkitRelativePath.split('/');
      if (parts.length > 1) {
        detectedFolderName = parts[0];
      }
    }
  }

  // Clean folder name display
  if (detectedFolderName.toLowerCase() === 'roms') {
    detectedFolderName = 'ROMs Collection';
  }

  // Split into ROMs, Images, and Sidecars
  const romFiles = [];
  const imageFiles = [];
  const sidecarFiles = [];
  const seen = new Set();
  let totalSizeBytes = 0;
  const systems = {};

  for (const file of allFiles) {
    const key = `${file.name}_${file.size}`;
    if (!seen.has(key)) {
      seen.add(key);

      if (isSupportedRomFile(file.name)) {
        romFiles.push(file);
        totalSizeBytes += file.size;

        const pathToCheck = file.webkitRelativePath || file.relativePath || file.name;
        const sys = detectSystemFromExtension(pathToCheck);
        const sysKey = sys?.key || 'custom';
        systems[sysKey] = (systems[sysKey] || 0) + 1;
      } else if (isSupportedImageFile(file.name)) {
        imageFiles.push(file);
      } else if (isSupportedSidecarFile(file.name)) {
        sidecarFiles.push(file);
      }
    }
  }

  // Pair companion assets with ROMs
  const { localCoversCount, localSidecarsCount } = pairCompanionFiles(romFiles, imageFiles, sidecarFiles);

  return {
    folderName: detectedFolderName,
    files: romFiles,
    stats: {
      totalFiles: romFiles.length,
      totalSizeBytes,
      systems,
      localCoversCount,
      localSidecarsCount
    }
  };
}

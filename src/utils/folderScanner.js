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
export async function scanDirectoryHandle(dirHandle, pathPrefix = '', onProgress = null) {
  let files = [];
  let count = 0;
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
          count++;
          if (count % 150 === 0) {
            if (onProgress) {
              onProgress({ current: count, total: 0, message: `Discovered ${count} items in "${pathPrefix || dirHandle.name}"...` });
            }
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        } catch (e) {
          console.warn('Could not read file from directory handle:', entry.name, e);
        }
      }
    } else if (entry.kind === 'directory') {
      const subFiles = await scanDirectoryHandle(entry, relativePath, onProgress);
      files = files.concat(subFiles);
    }
  }
  return files;
}

/**
 * Pair companion cover images and metadata sidecars with their corresponding ROMs using O(1) hash maps.
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

  // Index images by directory into indexed maps for O(1) lookup
  const imagesByDir = new Map();
  for (const img of imageFiles) {
    const dir = getDir(img);
    let dirData = imagesByDir.get(dir);
    if (!dirData) {
      dirData = { exact: new Map(), norm: new Map(), generic: null, list: [] };
      imagesByDir.set(dir, dirData);
    }
    const rawBase = getBaseName(img.name);
    const normBase = normalize(rawBase);
    dirData.exact.set(rawBase, img);
    dirData.norm.set(normBase, img);
    dirData.list.push({ rawBase, normBase, file: img });

    const lower = rawBase.toLowerCase();
    if (!dirData.generic && (lower === 'cover' || lower === 'boxart' || lower === 'front' || lower === 'folder' || lower === 'poster')) {
      dirData.generic = img;
    }
  }

  // Index sidecars by directory into indexed maps for O(1) lookup
  const sidecarsByDir = new Map();
  for (const meta of sidecarFiles) {
    const dir = getDir(meta);
    let dirData = sidecarsByDir.get(dir);
    if (!dirData) {
      dirData = { exact: new Map(), norm: new Map(), generic: null, list: [] };
      sidecarsByDir.set(dir, dirData);
    }
    const rawBase = getBaseName(meta.name);
    const normBase = normalize(rawBase);
    dirData.exact.set(rawBase, meta);
    dirData.norm.set(normBase, meta);
    dirData.list.push({ rawBase, normBase, file: meta });

    const lower = rawBase.toLowerCase();
    if (!dirData.generic && (lower === 'metadata' || lower === 'game' || lower === 'info')) {
      dirData.generic = meta;
    }
  }

  for (const rom of romFiles) {
    const dir = getDir(rom);
    const rawBase = getBaseName(rom.name);
    const normBase = normalize(rawBase);

    // 1. Pair Companion Cover Image (O(1) lookups)
    const imgData = imagesByDir.get(dir);
    if (imgData) {
      let matchedCover = imgData.exact.get(rawBase) || imgData.norm.get(normBase) || imgData.generic;

      // Suffix / Prefix fallback only if small directory list and not found in Map
      if (!matchedCover && imgData.list.length > 0 && imgData.list.length <= 50) {
        const found = imgData.list.find(i => i.normBase.startsWith(normBase) || normBase.startsWith(i.normBase));
        if (found) matchedCover = found.file;
      }

      if (matchedCover) {
        rom.companionCoverFile = matchedCover;
        localCoversCount++;
      }
    }

    // 2. Pair Companion Metadata Sidecar (O(1) lookups)
    const metaData = sidecarsByDir.get(dir);
    if (metaData) {
      let matchedMeta = metaData.exact.get(rawBase) || metaData.norm.get(normBase) || metaData.generic;
      if (matchedMeta) {
        rom.companionMetaFile = matchedMeta;
        localSidecarsCount++;
      }
    }
  }

  return { localCoversCount, localSidecarsCount };
}

/**
 * Extract all ROM files and companion assets from a DataTransferItemList, FileList, or File array.
 * @param {DataTransfer|FileList|Array<File>} input 
 * @param {Function} [onProgress]
 * @returns {Promise<{ folderName: string, files: Array<File>, stats: { totalFiles: number, totalSizeBytes: number, systems: Record<string, number>, localCoversCount: number, localSidecarsCount: number } }>}
 */
export async function extractRomsFromInput(input, onProgress = null) {
  let detectedFolderName = 'ROMs Collection';
  let rawSourceList = [];

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
        if (file) rawSourceList.push(file);
      }
    }
    const resolvedEntries = (await Promise.all(entryPromises)).flat();
    rawSourceList = rawSourceList.concat(resolvedEntries);
  } else if (input?.files) {
    rawSourceList = input.files;
    if (rawSourceList.length > 0 && rawSourceList[0]?.webkitRelativePath) {
      const parts = rawSourceList[0].webkitRelativePath.split('/');
      if (parts.length > 1) detectedFolderName = parts[0];
    }
  } else if (input instanceof FileList) {
    rawSourceList = input;
    if (rawSourceList.length > 0 && rawSourceList[0]?.webkitRelativePath) {
      const parts = rawSourceList[0].webkitRelativePath.split('/');
      if (parts.length > 1) detectedFolderName = parts[0];
    }
  } else if (Array.isArray(input)) {
    rawSourceList = input;
    if (rawSourceList.length > 0 && rawSourceList[0]?.webkitRelativePath) {
      const parts = rawSourceList[0].webkitRelativePath.split('/');
      if (parts.length > 1) detectedFolderName = parts[0];
    }
  }

  // Clean folder name display
  if (detectedFolderName.toLowerCase() === 'roms') {
    detectedFolderName = 'ROMs Collection';
  }

  const totalInputCount = rawSourceList.length || 0;
  const romFiles = [];
  const imageFiles = [];
  const sidecarFiles = [];
  const seen = new Set();
  let totalSizeBytes = 0;
  const systems = {};

  const CHUNK_SIZE = 75;
  for (let i = 0; i < totalInputCount; i++) {
    const file = rawSourceList[i];
    if (!file || !file.name) continue;

    const fname = file.name;
    const isRom = isSupportedRomFile(fname);
    const isImg = !isRom && isSupportedImageFile(fname);
    const isMeta = !isRom && !isImg && isSupportedSidecarFile(fname);

    if (isRom || isImg || isMeta) {
      const key = `${fname}_${file.size || 0}`;
      if (!seen.has(key)) {
        seen.add(key);

        if (isRom) {
          romFiles.push(file);
          totalSizeBytes += (file.size || 0);

          const pathToCheck = file.webkitRelativePath || file.relativePath || fname;
          const sys = detectSystemFromExtension(pathToCheck);
          const sysKey = sys?.key || 'custom';
          systems[sysKey] = (systems[sysKey] || 0) + 1;
        } else if (isImg) {
          imageFiles.push(file);
        } else if (isMeta) {
          sidecarFiles.push(file);
        }
      }
    }

    // Yield to the event loop every chunk for smooth UI rendering and responsive progress
    if (i > 0 && i % CHUNK_SIZE === 0) {
      if (onProgress) {
        const percent = Math.round(((i + 1) / totalInputCount) * 100);
        onProgress({
          current: i + 1,
          total: totalInputCount,
          message: `Scanned ${i + 1} of ${totalInputCount} items (${percent}%)...`
        });
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  if (onProgress) {
    onProgress({
      current: totalInputCount,
      total: totalInputCount,
      message: `Pairing artwork & sidecars for ${romFiles.length} detected ROMs...`
    });
  }
  await new Promise(resolve => setTimeout(resolve, 0));

  // Pair companion assets with ROMs (O(1) lookups)
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

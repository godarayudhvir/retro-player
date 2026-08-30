import { resolveAssetPath } from './assetPath';

export const SUPPORTED_ROM_EXTENSIONS = new Set([
  'gba', 'gb', 'gbc', 'nes', 'sfc', 'smc', 'snes', 'z64', 'n64', 'v64', 
  'nds', 'bin', 'cue', 'chd', 'pbp', 'iso', 'zip', 'md', 'smd', 'gen', 'genesis', 'megadrive', 'gg', 'gamegear', 'a26', 'atari2600'
]);

export function isSupportedRomFile(filename) {
  if (!filename || filename.startsWith('.')) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_ROM_EXTENSIONS.has(ext);
}

export const SYSTEM_DEFINITIONS = {
  gba: {
    key: 'gba',
    core: 'gba',
    name: 'Game Boy Advance',
    color: '#6366f1',
    icon: resolveAssetPath('assets/platforms/gba.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  },
  gb: {
    key: 'gb',
    core: 'gb',
    name: 'Game Boy',
    color: '#94a3b8',
    icon: resolveAssetPath('assets/platforms/gb.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  },
  gbc: {
    key: 'gbc',
    core: 'gb',
    name: 'Game Boy Color',
    color: '#8b5cf6',
    icon: resolveAssetPath('assets/platforms/gbc.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  },
  nes: {
    key: 'nes',
    core: 'nes',
    name: 'Nintendo Entertainment System',
    color: '#ef4444',
    icon: resolveAssetPath('assets/platforms/nes.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  },
  snes: {
    key: 'snes',
    core: 'snes',
    name: 'Super Nintendo',
    color: '#8b5cf6',
    icon: resolveAssetPath('assets/platforms/snes.svg'),
    supportsBatterySaves: true,
    saveExt: 'srm'
  },
  n64: {
    key: 'n64',
    core: 'n64',
    name: 'Nintendo 64',
    color: '#f59e0b',
    icon: resolveAssetPath('assets/platforms/n64.svg'),
    supportsBatterySaves: true,
    saveExt: 'srm'
  },
  nds: {
    key: 'nds',
    core: 'nds',
    name: 'Nintendo DS',
    color: '#06b6d4',
    icon: resolveAssetPath('assets/platforms/nds.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  },
  ps1: {
    key: 'ps1',
    core: 'psx',
    name: 'PlayStation',
    color: '#6366f1',
    icon: resolveAssetPath('assets/platforms/psx.svg'),
    supportsBatterySaves: true,
    saveExt: 'mcr'
  },
  genesis: {
    key: 'genesis',
    core: 'segaMD',
    name: 'Sega Genesis',
    color: '#ec4899',
    icon: resolveAssetPath('assets/platforms/genesis.svg'),
    supportsBatterySaves: true,
    saveExt: 'srm'
  },
  gamegear: {
    key: 'gamegear',
    core: 'segaGG',
    name: 'Game Gear',
    color: '#14b8a6',
    icon: resolveAssetPath('assets/platforms/gamegear.svg'),
    supportsBatterySaves: true,
    saveExt: 'srm'
  },
  arcade: {
    key: 'arcade',
    core: 'mame2003_plus',
    name: 'Arcade (MAME)',
    color: '#f43f5e',
    icon: resolveAssetPath('assets/platforms/arcade.svg'),
    supportsBatterySaves: false,
    saveExt: 'nvram'
  },
  atari2600: {
    key: 'atari2600',
    core: 'atari2600',
    name: 'Atari 2600',
    color: '#d97706',
    icon: resolveAssetPath('assets/platforms/atari2600.svg'),
    supportsBatterySaves: false,
    saveExt: 'sav'
  }
};

const FOLDER_SYSTEM_ALIASES = {
  gba: 'gba',
  gameboyadvance: 'gba',
  game_boy_advance: 'gba',
  'game boy advance': 'gba',

  gb: 'gb',
  gameboy: 'gb',
  game_boy: 'gb',
  'game boy': 'gb',

  gbc: 'gbc',
  gameboycolor: 'gbc',
  game_boy_color: 'gbc',
  'game boy color': 'gbc',

  nes: 'nes',
  famicom: 'nes',
  fc: 'nes',

  snes: 'snes',
  super_nintendo: 'snes',
  supernintendo: 'snes',
  'super nintendo': 'snes',
  sfc: 'snes',
  super_famicom: 'snes',
  superfamicom: 'snes',

  n64: 'n64',
  nintendo64: 'n64',
  nintendo_64: 'n64',
  'nintendo 64': 'n64',

  nds: 'nds',
  nintendods: 'nds',
  nintendo_ds: 'nds',
  'nintendo ds': 'nds',
  ds: 'nds',

  ps1: 'ps1',
  psx: 'ps1',
  playstation: 'ps1',
  'playstation 1': 'ps1',
  'sony playstation': 'ps1',
  ps: 'ps1',

  genesis: 'genesis',
  sega_genesis: 'genesis',
  segagenesis: 'genesis',
  'sega genesis': 'genesis',
  megadrive: 'genesis',
  mega_drive: 'genesis',
  'mega drive': 'genesis',
  sega: 'genesis',
  md: 'genesis',

  gamegear: 'gamegear',
  game_gear: 'gamegear',
  'game gear': 'gamegear',
  segagamegear: 'gamegear',
  sega_game_gear: 'gamegear',
  gg: 'gamegear',

  arcade: 'arcade',
  mame: 'arcade',
  neogeo: 'arcade',
  'neo geo': 'arcade',
  neo_geo: 'arcade',
  fbalpha: 'arcade',
  fbneo: 'arcade',

  atari2600: 'atari2600',
  atari_2600: 'atari2600',
  'atari 2600': 'atari2600',
  atari: 'atari2600',
  a26: 'atari2600'
};

const EXTENSION_SYSTEM_MAP = {
  gba: 'gba',
  gb: 'gb',
  gbc: 'gbc',
  nes: 'nes',
  sfc: 'snes',
  smc: 'snes',
  snes: 'snes',
  z64: 'n64',
  n64: 'n64',
  v64: 'n64',
  nds: 'nds',
  bin: 'ps1',
  cue: 'ps1',
  chd: 'ps1',
  pbp: 'ps1',
  iso: 'ps1',
  ps1: 'ps1',
  psx: 'ps1',
  zip: 'arcade',
  md: 'genesis',
  smd: 'genesis',
  gen: 'genesis',
  genesis: 'genesis',
  megadrive: 'genesis',
  gg: 'gamegear',
  gamegear: 'gamegear',
  a26: 'atari2600',
  atari2600: 'atari2600'
};

/**
 * Get canonical system metadata object by system key.
 * @param {string} systemKey - e.g. 'snes', 'gba', 'ps1', 'genesis'
 * @returns {{ key: string, core: string, name: string, color: string, icon: string }}
 */
export function getSystemInfoByKey(systemKey) {
  const normKey = (systemKey || '').toLowerCase().trim();
  if (SYSTEM_DEFINITIONS[normKey]) {
    return SYSTEM_DEFINITIONS[normKey];
  }
  if (FOLDER_SYSTEM_ALIASES[normKey] && SYSTEM_DEFINITIONS[FOLDER_SYSTEM_ALIASES[normKey]]) {
    return SYSTEM_DEFINITIONS[FOLDER_SYSTEM_ALIASES[normKey]];
  }
  if (EXTENSION_SYSTEM_MAP[normKey] && SYSTEM_DEFINITIONS[EXTENSION_SYSTEM_MAP[normKey]]) {
    return SYSTEM_DEFINITIONS[EXTENSION_SYSTEM_MAP[normKey]];
  }

  return {
    key: normKey || 'custom',
    core: 'nes',
    name: normKey ? normKey.toUpperCase() : 'Custom System',
    color: '#64748b',
    icon: resolveAssetPath('assets/platforms/custom.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  };
}

/**
 * Detects console platform from a ROM filename or full directory path.
 * Checks both path hierarchy (e.g. `/roms/snes/...`) and file extension.
 * @param {string} filenameOrPath - ROM filename or relative/absolute path
 * @returns {{ key: string, core: string, name: string, color: string, icon: string, supportsBatterySaves?: boolean, saveExt?: string }}
 */
export function detectSystemFromExtension(filenameOrPath) {
  if (!filenameOrPath) return getSystemInfoByKey('nes');

  const normalized = filenameOrPath.toLowerCase().replace(/\\/g, '/');
  const pathParts = normalized.split('/');
  const filename = pathParts[pathParts.length - 1] || '';
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Check parent folder segments for known system directory names
  // e.g. "roms/snes/Super Mario.zip" -> parent folder "snes" identifies Super Nintendo
  for (let i = 0; i < pathParts.length - 1; i++) {
    const segment = pathParts[i].trim();
    if (FOLDER_SYSTEM_ALIASES[segment]) {
      const canonicalKey = FOLDER_SYSTEM_ALIASES[segment];
      return getSystemInfoByKey(canonicalKey);
    }
  }

  // 2. Fall back to file extension
  if (EXTENSION_SYSTEM_MAP[ext]) {
    const canonicalKey = EXTENSION_SYSTEM_MAP[ext];
    return getSystemInfoByKey(canonicalKey);
  }

  // 3. Fallback for custom / unknown extensions
  return {
    key: 'custom',
    core: 'nes',
    name: 'Custom System',
    color: '#64748b',
    icon: resolveAssetPath('assets/platforms/custom.svg'),
    supportsBatterySaves: true,
    saveExt: 'sav'
  };
}

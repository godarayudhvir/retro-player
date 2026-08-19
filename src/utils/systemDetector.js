import { resolveAssetPath } from './assetPath';

/**
 * Detects console platform, EmulatorJS core, brand color, icon asset, and display name from a ROM filename extension.
 * @param {string} filename - ROM filename with extension
 * @returns {{ key: string, core: string, name: string, color: string, icon: string }}
 */
export function detectSystemFromExtension(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'gba': 
      return { key: 'gba', core: 'gba', name: 'Game Boy Advance', color: '#6366f1', icon: resolveAssetPath('assets/platforms/gba.svg') };
    case 'gb': 
      return { key: 'gb', core: 'gb', name: 'Game Boy', color: '#94a3b8', icon: resolveAssetPath('assets/platforms/gb.svg') };
    case 'gbc': 
      return { key: 'gbc', core: 'gb', name: 'Game Boy Color', color: '#8b5cf6', icon: resolveAssetPath('assets/platforms/gbc.svg') };
    case 'nes': 
      return { key: 'nes', core: 'nes', name: 'Nintendo Entertainment System', color: '#ef4444', icon: resolveAssetPath('assets/platforms/nes.svg') };
    case 'sfc':
    case 'smc': 
      return { key: 'snes', core: 'snes', name: 'Super Nintendo', color: '#8b5cf6', icon: resolveAssetPath('assets/platforms/snes.svg') };
    case 'z64':
    case 'n64':
    case 'v64': 
      return { key: 'n64', core: 'n64', name: 'Nintendo 64', color: '#f59e0b', icon: resolveAssetPath('assets/platforms/n64.svg') };
    case 'nds': 
      return { key: 'nds', core: 'nds', name: 'Nintendo DS', color: '#06b6d4', icon: resolveAssetPath('assets/platforms/nds.svg') };
    case 'bin':
    case 'cue':
    case 'chd':
    case 'iso': 
      return { key: 'ps1', core: 'psx', name: 'PlayStation', color: '#3b82f6', icon: resolveAssetPath('assets/platforms/psx.svg') };
    case 'zip': 
      return { key: 'arcade', core: 'mame2003_plus', name: 'Arcade', color: '#ec4899', icon: resolveAssetPath('assets/platforms/arcade.svg') };
    case 'md':
    case 'smd':
    case 'gen': 
      return { key: 'sega', core: 'segaMD', name: 'Sega Genesis', color: '#10b981', icon: resolveAssetPath('assets/platforms/genesis.svg') };
    default: 
      return { key: 'gba', core: 'gba', name: 'Custom System', color: '#64748b', icon: resolveAssetPath('assets/pokeball.png') };
  }
}

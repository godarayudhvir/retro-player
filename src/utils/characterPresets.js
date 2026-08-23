// Curated Character Presets and Archetypes for Multiavatar Engine
export const CHARACTER_ARCHETYPES = [
  {
    id: 'heroes',
    label: 'Retro Heroes',
    icon: 'Sword',
    presets: [
      { id: 'mario', name: 'Plumber Hero', avatarSeed: 'SuperMario99', favoriteColor: '#ef4444' },
      { id: 'link', name: 'Hero of Time', avatarSeed: 'HeroOfTime77', favoriteColor: '#10b981' },
      { id: 'zelda', name: 'Princess Wisdom', avatarSeed: 'PrincessZelda12', favoriteColor: '#ec4899' },
      { id: 'samus', name: 'Bounty Hunter', avatarSeed: 'MetroidSamus88', favoriteColor: '#f97316' },
      { id: 'sonic', name: 'Blue Blur', avatarSeed: 'SonicSpeed01', favoriteColor: '#3b82f6' },
      { id: 'megaman', name: 'Blue Bomber', avatarSeed: 'MegaBuster42', favoriteColor: '#06b6d4' }
    ]
  },
  {
    id: 'cyber',
    label: 'Cyber & Sci-Fi',
    icon: 'Zap',
    presets: [
      { id: 'cyberninja', name: 'Neon Shinobi', avatarSeed: 'CyberNinja001', favoriteColor: '#10b981' },
      { id: 'cosmic', name: 'Void Pilot', avatarSeed: 'CosmicPilot505', favoriteColor: '#06b6d4' },
      { id: 'hacker', name: 'Net Runner', avatarSeed: 'GridBreaker909', favoriteColor: '#6366f1' },
      { id: 'cyborg', name: 'Mecha Unit', avatarSeed: 'CyborgTitan00', favoriteColor: '#334155' },
      { id: 'android', name: 'Synth Girl', avatarSeed: 'AndroidModel7', favoriteColor: '#ec4899' },
      { id: 'glitch', name: 'Glitch Runner', avatarSeed: 'MatrixGlitch101', favoriteColor: '#a855f7' }
    ]
  },
  {
    id: 'rpg',
    label: 'Fantasy & RPG',
    icon: 'Shield',
    presets: [
      { id: 'knight', name: 'Pixel Paladin', avatarSeed: 'PixelKnight99', favoriteColor: '#f59e0b' },
      { id: 'mage', name: 'Chrono Mage', avatarSeed: 'ChronoMage7', favoriteColor: '#a855f7' },
      { id: 'rogue', name: 'Shadow Thief', avatarSeed: 'ShadowRogue88', favoriteColor: '#334155' },
      { id: 'cleric', name: 'Aura Priest', avatarSeed: 'SanctuaryPriest', favoriteColor: '#10b981' },
      { id: 'barbarian', name: 'Iron Berserker', avatarSeed: 'IronBarbarian1', favoriteColor: '#ef4444' },
      { id: 'ranger', name: 'Forest Hunter', avatarSeed: 'WoodlandRanger', favoriteColor: '#84cc16' }
    ]
  },
  {
    id: 'arcade',
    label: 'Arcade Classics',
    icon: 'Gamepad2',
    presets: [
      { id: 'retrogamer', name: 'Arcade Kid', avatarSeed: 'RetroGamer90s', favoriteColor: '#ef4444' },
      { id: 'speedrunner', name: 'Speed Runner', avatarSeed: 'FramePerfect99', favoriteColor: '#f59e0b' },
      { id: 'boss', name: 'Final Boss', avatarSeed: 'MasterBoss64', favoriteColor: '#6366f1' },
      { id: 'streamer', name: 'Pixel Streamer', avatarSeed: 'GamerVlogger', favoriteColor: '#ec4899' },
      { id: 'collector', name: 'ROM Collector', avatarSeed: 'CartridgeArchivist', favoriteColor: '#06b6d4' },
      { id: 'quarter', name: 'Token Master', avatarSeed: 'InsertCoinHero', favoriteColor: '#f97316' }
    ]
  }
];

export const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#334155'
];

export const RANDOM_CHARACTER_SEEDS = [
  'RetroGamer', 'PixelKnight', 'CyberNinja', 'CosmicPilot', 'NeonSamurai',
  'SuperMario', 'HeroOfTime', 'StarVoyager', 'ChronoMage', 'ArcadeMaster',
  'VoxelHero', 'SpaceCadet', 'HyperSonic', 'ShadowRogue', 'MegaBuster',
  'CyberSamurai', 'MysticWizard', 'GalacticAce', 'IronTitan', 'PixelQueen',
  'SpeedRunner', 'BossDefeater', 'DungeonCrawler', 'NeonRebel', 'TurboPlayer'
];

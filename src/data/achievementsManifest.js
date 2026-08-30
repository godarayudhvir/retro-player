/**
 * Master Registry of Universal Organic Achievements & Player Milestones.
 * 100% universal across all retro consoles and ROMs without requiring emulator memory hacking.
 */

export const ACHIEVEMENT_TIERS = {
  BRONZE: { id: 'bronze', label: 'Bronze', points: 10, color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.4)' },
  SILVER: { id: 'silver', label: 'Silver', points: 25, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)' },
  GOLD: { id: 'gold', label: 'Gold', points: 50, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  PLATINUM: { id: 'platinum', label: 'Platinum', points: 100, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)' }
};

export const ACHIEVEMENT_CATEGORIES = {
  EXPLORATION: { id: 'exploration', label: 'Exploration', icon: 'Compass' },
  ENDURANCE: { id: 'endurance', label: 'Endurance & Time', icon: 'Clock' },
  HABITS: { id: 'habits', label: 'Habits & Streaks', icon: 'Flame' },
  QUIRKS: { id: 'quirks', label: 'Retro Quirks', icon: 'Sparkles' },
  SAVES: { id: 'saves', label: 'Saves & Memory', icon: 'Save' },
  CUSTOMIZATION: { id: 'customization', label: 'Shell & Hardware', icon: 'Sliders' },
  LORE: { id: 'lore', label: 'Lore & Guides', icon: 'BookOpen' }
};

export const ACHIEVEMENTS_MANIFEST = [
  // -------------------------------------------------------------------------
  // CATEGORY A: CATALOG & SYSTEM EXPLORATION
  // -------------------------------------------------------------------------
  {
    id: 'first_launch',
    title: 'Insert Coin',
    description: 'Launch your very first retro game in Retro Player.',
    category: 'exploration',
    tier: 'bronze',
    icon: 'PlayCircle',
    isPerRom: false
  },
  {
    id: 'console_hopper',
    title: 'Console Hopper',
    description: 'Play at least one game across 3 distinct retro systems.',
    category: 'exploration',
    tier: 'bronze',
    icon: 'Gamepad2',
    isPerRom: false
  },
  {
    id: 'gen_traveler',
    title: 'Generation Traveler',
    description: 'Play games across 8-bit, 16-bit, and 32/64-bit platforms.',
    category: 'exploration',
    tier: 'silver',
    icon: 'Layers',
    isPerRom: false
  },
  {
    id: 'full_spectrum',
    title: 'Full Spectrum',
    description: 'Play at least one game on every supported system in your library.',
    category: 'exploration',
    tier: 'gold',
    icon: 'Globe',
    isPerRom: false
  },
  {
    id: 'library_tourist',
    title: 'Library Tourist',
    description: 'Launch 5 different games in a single session.',
    category: 'exploration',
    tier: 'bronze',
    icon: 'Navigation',
    isPerRom: false
  },
  {
    id: 'cartridge_collector',
    title: 'Cartridge Collector',
    description: 'Have at least 25 ROMs indexed in your local library.',
    category: 'exploration',
    tier: 'silver',
    icon: 'FolderHeart',
    isPerRom: false
  },
  {
    id: 'grand_archivist',
    title: 'Grand Archivist',
    description: 'Have 100+ ROMs indexed in your library across all consoles.',
    category: 'exploration',
    tier: 'gold',
    icon: 'Database',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY B: PLAYTIME & ENDURANCE
  // -------------------------------------------------------------------------
  {
    id: 'warming_up',
    title: 'Warming Up',
    description: 'Log 15 cumulative minutes of gameplay across any games.',
    category: 'endurance',
    tier: 'bronze',
    icon: 'Flame',
    isPerRom: false
  },
  {
    id: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Play a single game continuously for over 1 hour in one sitting.',
    category: 'endurance',
    tier: 'silver',
    icon: 'Timer',
    isPerRom: true
  },
  {
    id: 'ironman_endurance',
    title: 'Ironman Endurance',
    description: 'Play a single game continuously for over 7 hours in one sitting.',
    category: 'endurance',
    tier: 'gold',
    icon: 'Zap',
    isPerRom: true
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Spend over 100 hours total playing a single retro game.',
    category: 'endurance',
    tier: 'gold',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'loyal_companion',
    title: 'Loyal Companion',
    description: 'Spend over 2 hours total playing a single favorite game.',
    category: 'endurance',
    tier: 'silver',
    icon: 'Heart',
    isPerRom: true
  },

  // -------------------------------------------------------------------------
  // CATEGORY C: HABITS, STREAKS & TIME-OF-DAY (Dynamic Local Time)
  // -------------------------------------------------------------------------
  {
    id: 'night_owl',
    title: 'Night Owl Gamer',
    description: 'Play any retro game between 11:00 PM and 4:00 AM local time.',
    category: 'habits',
    tier: 'silver',
    icon: 'Moon',
    isPerRom: false
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Play any retro game between 5:00 AM and 8:00 AM local time.',
    category: 'habits',
    tier: 'silver',
    icon: 'Sun',
    isPerRom: false
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Play games on both Saturday and Sunday of the same weekend.',
    category: 'habits',
    tier: 'bronze',
    icon: 'Calendar',
    isPerRom: false
  },
  {
    id: 'daily_streak_3',
    title: 'Daily Ritual',
    description: 'Play at least one game 3 consecutive days in a row.',
    category: 'habits',
    tier: 'silver',
    icon: 'Sparkles',
    isPerRom: false
  },
  {
    id: 'weekly_streak_7',
    title: 'Weekly Devotion',
    description: 'Play games for 7 consecutive days without breaking the streak.',
    category: 'habits',
    tier: 'gold',
    icon: 'Trophy',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY D: RETRO QUIRKS & HUMOR
  // -------------------------------------------------------------------------
  {
    id: 'rage_quit',
    title: 'Instant Regret / Rage Quit?',
    description: 'Launch a game and exit back to the menu in under 45 seconds.',
    category: 'quirks',
    tier: 'bronze',
    icon: 'AlertTriangle',
    isPerRom: false
  },
  {
    id: 'indecisive_swapper',
    title: 'Indecisive Swapper',
    description: 'Launch 3 different games in under 3 minutes total.',
    category: 'quirks',
    tier: 'bronze',
    icon: 'Shuffle',
    isPerRom: false
  },
  {
    id: 'window_shopper',
    title: 'Window Shopper',
    description: 'Spend 5+ minutes browsing library shelves with BGM playing without launching a game.',
    category: 'quirks',
    tier: 'silver',
    icon: 'Eye',
    isPerRom: false
  },
  {
    id: 'button_masher',
    title: 'Button Masher',
    description: 'Register over 1,500 total inputs in a single gameplay session.',
    category: 'quirks',
    tier: 'silver',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'need_for_speed',
    title: 'Need for Speed',
    description: 'Fast-forward emulation continuously for more than 45 seconds.',
    category: 'quirks',
    tier: 'bronze',
    icon: 'FastForward',
    isPerRom: false
  },
  {
    id: 'pause_for_thought',
    title: 'Pause for Thought',
    description: 'Leave a game paused for more than 10 minutes and then resume.',
    category: 'quirks',
    tier: 'bronze',
    icon: 'PauseCircle',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY E: SAVE STATES & BATTERY SRAM
  // -------------------------------------------------------------------------
  {
    id: 'safety_net',
    title: 'Safety Net',
    description: 'Create your first Quick Save.',
    category: 'saves',
    tier: 'bronze',
    icon: 'Save',
    isPerRom: true
  },
  {
    id: 'time_traveler',
    title: 'Time Traveler',
    description: 'Reload a previous Quick Save state.',
    category: 'saves',
    tier: 'bronze',
    icon: 'RotateCcw',
    isPerRom: true
  },
  {
    id: 'save_scummer',
    title: 'Save Scummer',
    description: 'Create 10 save states in a single game session.',
    category: 'saves',
    tier: 'silver',
    icon: 'Repeat',
    isPerRom: true
  },
  {
    id: 'cartridge_keeper',
    title: 'Authentic Cartridge Keeper',
    description: 'Export an authentic .sav battery RAM file to your computer.',
    category: 'saves',
    tier: 'silver',
    icon: 'DownloadCloud',
    isPerRom: true
  },
  {
    id: 'memory_rebirth',
    title: 'Memory Card Rebirth',
    description: 'Import an existing .sav save file into a game.',
    category: 'saves',
    tier: 'silver',
    icon: 'UploadCloud',
    isPerRom: true
  },
  {
    id: 'timeline_master',
    title: 'Multi-Timeline Master',
    description: 'Utilize both Auto Resume and Load State features in a title.',
    category: 'saves',
    tier: 'gold',
    icon: 'GitBranch',
    isPerRom: true
  },

  // -------------------------------------------------------------------------
  // CATEGORY F: CONSOLE CUSTOMIZATION & SHELL
  // -------------------------------------------------------------------------
  {
    id: 'identity_crisis',
    title: 'Identity Crisis',
    description: 'Change your profile avatar 3 times in the Multiavatar studio.',
    category: 'customization',
    tier: 'bronze',
    icon: 'UserCheck',
    isPerRom: false
  },
  {
    id: 'chameleon',
    title: 'Chameleon',
    description: 'Switch between Dark and Light mode 5 times.',
    category: 'customization',
    tier: 'bronze',
    icon: 'SunMoon',
    isPerRom: false
  },
  {
    id: 'retro_purist',
    title: 'Retro Purist',
    description: 'Play a game with CRT scanline shader filter active.',
    category: 'customization',
    tier: 'silver',
    icon: 'Tv',
    isPerRom: false
  },
  {
    id: 'audiophile',
    title: 'Audiophile',
    description: 'Listen to 3 different BGM soundtrack songs in the topbar player.',
    category: 'customization',
    tier: 'bronze',
    icon: 'Music',
    isPerRom: false
  },
  {
    id: 'gold_curator',
    title: 'Gold Star Curator',
    description: 'Add 5 games to your Favorites collection.',
    category: 'customization',
    tier: 'bronze',
    icon: 'Star',
    isPerRom: false
  },
  {
    id: 'certified_tactile',
    title: 'Certified Tactile',
    description: 'Play a game using a physical Bluetooth or USB controller.',
    category: 'customization',
    tier: 'silver',
    icon: 'Gamepad',
    isPerRom: false
  },
  {
    id: 'memory_keeper',
    title: 'Memory Keeper',
    description: 'Take your first in-game screenshot capture.',
    category: 'customization',
    tier: 'silver',
    icon: 'Camera',
    isPerRom: true
  },
  {
    id: 'clip_master',
    title: 'Clip Master',
    description: 'Record an in-game gameplay video recording.',
    category: 'customization',
    tier: 'silver',
    icon: 'Video',
    isPerRom: true
  },
  {
    id: 'vault_custodian',
    title: 'Vault Custodian',
    description: 'Create a complete JSON database snapshot backup.',
    category: 'customization',
    tier: 'gold',
    icon: 'ShieldCheck',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY G: LORE & STRATEGY GUIDES
  // -------------------------------------------------------------------------
  {
    id: 'strategy_scholar',
    title: 'Strategy Guide Scholar',
    description: 'Open and read a game\'s Strategy Guide / Walkthrough for over 60 seconds.',
    category: 'lore',
    tier: 'bronze',
    icon: 'BookOpen',
    isPerRom: true
  }
];

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS_MANIFEST.reduce((acc, ach) => {
  return acc + (ACHIEVEMENT_TIERS[ach.tier.toUpperCase()]?.points || 10);
}, 0);

/**
 * Master Registry of Universal Organic Achievements & Player Milestones.
 * 100% universal across all retro consoles and ROMs without requiring emulator memory hacking.
 */

export const ACHIEVEMENT_TIERS = {
  BRONZE: { id: 'bronze', label: 'Bronze', points: 5, color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.4)' },
  SILVER: { id: 'silver', label: 'Silver', points: 10, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)' },
  GOLD: { id: 'gold', label: 'Gold', points: 15, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  PLATINUM: { id: 'platinum', label: 'Platinum', points: 20, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)' }
};

export const ACHIEVEMENT_CATEGORIES = {
  EXPLORATION: { id: 'exploration', label: 'Catalog & Exploration', icon: 'Compass' },
  ENDURANCE: { id: 'endurance', label: 'Playtime & Endurance', icon: 'Clock' },
  HABITS: { id: 'habits', label: 'Habits & Streaks', icon: 'Flame' },
  QUIRKS: { id: 'quirks', label: 'Retro Quirks', icon: 'Sparkles' },
  SAVES: { id: 'saves', label: 'Saves & Preservation', icon: 'Save' },
  CUSTOMIZATION: { id: 'customization', label: 'Shell & Hardware', icon: 'Sliders' }
};

export const ACHIEVEMENTS_MANIFEST = [
  // -------------------------------------------------------------------------
  // CATEGORY A: CATALOG & EXPLORATION (50G)
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
    tier: 'silver',
    icon: 'Gamepad2',
    isPerRom: false
  },
  {
    id: 'gen_traveler',
    title: 'Generation Traveler',
    description: 'Play games across 8-bit, 16-bit, and 32/64-bit platforms.',
    category: 'exploration',
    tier: 'gold',
    icon: 'Layers',
    isPerRom: false
  },
  {
    id: 'full_spectrum',
    title: 'Full Spectrum',
    description: 'Play at least one game on every supported system in your library.',
    category: 'exploration',
    tier: 'platinum',
    icon: 'Globe',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY B: PLAYTIME & ENDURANCE (50G)
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
    id: 'loyal_companion',
    title: 'Loyal Companion',
    description: 'Spend over 2 hours total playing a single favorite game.',
    category: 'endurance',
    tier: 'gold',
    icon: 'Heart',
    isPerRom: true
  },
  {
    id: 'ironman_endurance',
    title: 'Ironman Endurance',
    description: 'Play a single game continuously for over 7 hours in one sitting.',
    category: 'endurance',
    tier: 'platinum',
    icon: 'Zap',
    isPerRom: true
  },

  // -------------------------------------------------------------------------
  // CATEGORY C: HABITS & STREAKS (50G)
  // -------------------------------------------------------------------------
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
    id: 'night_owl',
    title: 'Night Owl Gamer',
    description: 'Play any retro game between 11:00 PM and 4:00 AM local time.',
    category: 'habits',
    tier: 'silver',
    icon: 'Moon',
    isPerRom: false
  },
  {
    id: 'daily_streak_3',
    title: 'Daily Ritual',
    description: 'Play at least one game 3 consecutive days in a row.',
    category: 'habits',
    tier: 'gold',
    icon: 'Sparkles',
    isPerRom: false
  },
  {
    id: 'weekly_streak_7',
    title: 'Weekly Devotion',
    description: 'Play games for 7 consecutive days without breaking the streak.',
    category: 'habits',
    tier: 'platinum',
    icon: 'Trophy',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY D: RETRO QUIRKS (50G)
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
    id: 'need_for_speed',
    title: 'Need for Speed',
    description: 'Fast-forward emulation continuously for more than 45 seconds.',
    category: 'quirks',
    tier: 'silver',
    icon: 'FastForward',
    isPerRom: false
  },
  {
    id: 'window_shopper',
    title: 'Window Shopper',
    description: 'Spend 5+ minutes browsing library shelves with BGM playing without launching a game.',
    category: 'quirks',
    tier: 'gold',
    icon: 'Eye',
    isPerRom: false
  },
  {
    id: 'button_masher',
    title: 'Button Masher',
    description: 'Register over 1,500 total inputs in a single gameplay session.',
    category: 'quirks',
    tier: 'platinum',
    icon: 'Activity',
    isPerRom: true
  },

  // -------------------------------------------------------------------------
  // CATEGORY E: SAVES & PRESERVATION (50G)
  // -------------------------------------------------------------------------
  {
    id: 'safety_net',
    title: 'Safety Net',
    description: 'Create your first Quick Save.',
    category: 'saves',
    tier: 'bronze',
    icon: 'Save',
    isPerRom: false
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
    id: 'timeline_master',
    title: 'Multi-Timeline Master',
    description: 'Utilize both Auto Resume and Load State features in a title.',
    category: 'saves',
    tier: 'gold',
    icon: 'GitBranch',
    isPerRom: true
  },
  {
    id: 'vault_custodian',
    title: 'Vault Custodian',
    description: 'Create a complete JSON database snapshot backup.',
    category: 'saves',
    tier: 'platinum',
    icon: 'ShieldCheck',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY F: SHELL & HARDWARE (50G)
  // -------------------------------------------------------------------------
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
    id: 'chameleon',
    title: 'Chameleon',
    description: 'Switch between Dark and Light mode 5 times.',
    category: 'customization',
    tier: 'silver',
    icon: 'SunMoon',
    isPerRom: false
  },
  {
    id: 'retro_purist',
    title: 'Retro Purist',
    description: 'Play a game with CRT scanline shader filter active.',
    category: 'customization',
    tier: 'gold',
    icon: 'Tv',
    isPerRom: false
  },
  {
    id: 'certified_tactile',
    title: 'Certified Tactile',
    description: 'Play a game using a physical Bluetooth or USB controller.',
    category: 'customization',
    tier: 'platinum',
    icon: 'Gamepad',
    isPerRom: false
  }
];

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS_MANIFEST.reduce((acc, ach) => {
  return acc + (ACHIEVEMENT_TIERS[ach.tier.toUpperCase()]?.points || 5);
}, 0);

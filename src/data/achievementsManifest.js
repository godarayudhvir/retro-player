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
    description: 'Play games on both Saturday and Sunday in the same weekend.',
    category: 'habits',
    tier: 'bronze',
    icon: 'Calendar',
    isPerRom: false
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Launch a game between 11:00 PM and 4:00 AM local time.',
    category: 'habits',
    tier: 'silver',
    icon: 'Moon',
    isPerRom: false
  },
  {
    id: 'daily_streak_3',
    title: 'Dedicated Gamer',
    description: 'Play games for 3 consecutive days in a row.',
    category: 'habits',
    tier: 'gold',
    icon: 'Sparkles',
    isPerRom: false
  },
  {
    id: 'weekly_streak_7',
    title: 'Relentless Habit',
    description: 'Play games for 7 consecutive days in a row.',
    category: 'habits',
    tier: 'platinum',
    icon: 'Flame',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY D: RETRO QUIRKS (50G)
  // -------------------------------------------------------------------------
  {
    id: 'rage_quit',
    title: 'Instant Regret?',
    description: 'Exit a game within 45 seconds of launching.',
    category: 'quirks',
    tier: 'bronze',
    icon: 'DoorOpen',
    isPerRom: false
  },
  {
    id: 'need_for_speed',
    title: 'Need for Speed',
    description: 'Maintain Fast-Forward speed boost for over 45 seconds.',
    category: 'quirks',
    tier: 'silver',
    icon: 'FastForward',
    isPerRom: false
  },
  {
    id: 'window_shopper',
    title: 'Window Shopper',
    description: 'Idle in the main cartridge library for over 5 minutes with BGM on.',
    category: 'quirks',
    tier: 'gold',
    icon: 'Coffee',
    isPerRom: false
  },
  {
    id: 'button_masher',
    title: 'Button Masher',
    description: 'Press 1,500+ gamepad or keyboard inputs in a single play session.',
    category: 'quirks',
    tier: 'platinum',
    icon: 'Dices',
    isPerRom: true
  },

  // -------------------------------------------------------------------------
  // CATEGORY E: SAVES & PRESERVATION (50G)
  // -------------------------------------------------------------------------
  {
    id: 'safety_net',
    title: 'Safety Net',
    description: 'Save a Quick Save state in slot 0.',
    category: 'saves',
    tier: 'bronze',
    icon: 'Save',
    isPerRom: false
  },
  {
    id: 'save_scummer',
    title: 'Save Scummer',
    description: 'Create 10 or more save states in a single game.',
    category: 'saves',
    tier: 'silver',
    icon: 'Copy',
    isPerRom: true
  },
  {
    id: 'timeline_master',
    title: 'Multi-Timeline Master',
    description: 'Use both Auto-Resume and Manual Load State in the same title.',
    category: 'saves',
    tier: 'gold',
    icon: 'History',
    isPerRom: true
  },
  {
    id: 'vault_custodian',
    title: 'Vault Custodian',
    description: 'Export a full JSON database backup snapshot from Storage Studio.',
    category: 'saves',
    tier: 'platinum',
    icon: 'DownloadCloud',
    isPerRom: false
  },

  // -------------------------------------------------------------------------
  // CATEGORY F: SHELL & HARDWARE (50G)
  // -------------------------------------------------------------------------
  {
    id: 'audiophile',
    title: 'Audiophile',
    description: 'Listen to at least 3 distinct chiptune BGM background music tracks.',
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

// ---------------------------------------------------------------------------
// POKÉMON SPECIFIC MILESTONES (Rendered in Game Detail Pane)
// ---------------------------------------------------------------------------
export const POKEMON_ACHIEVEMENTS_MANIFEST = [
  // 1. Departure & Early Steps
  {
    id: 'poke_journey_begun',
    title: 'Journey Begun',
    description: 'Receive your very first starter companion from the regional Professor.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Compass',
    isPerRom: true
  },
  {
    id: 'poke_digital_cartographer',
    title: 'Digital Cartographer',
    description: 'Acquire your regional navigation guide (Town Map, Pokégear, or Device).',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Map',
    isPerRom: true
  },
  {
    id: 'poke_first_catch',
    title: 'First Wild Catch',
    description: 'Capture your first non-starter wild Pokémon in a Pokéball.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'PlusCircle',
    isPerRom: true
  },

  // 2. Early Journey & Items
  {
    id: 'poke_gone_fishin',
    title: "Gone Fishin'",
    description: 'Obtain your first fishing rod and begin casting lines into regional waters.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Anchor',
    isPerRom: true
  },
  {
    id: 'poke_full_party',
    title: 'Full Battle Party',
    description: 'Assemble a complete combat team of 6 battle-ready Pokémon.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Users',
    isPerRom: true
  },
  {
    id: 'poke_pedal_to_metal',
    title: 'Pedal to the Metal',
    description: 'Acquire the Bicycle and cruise across regional routes in style.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Bike',
    isPerRom: true
  },
  {
    id: 'poke_evolution_master',
    title: 'Evolution Master',
    description: 'Raise and evolve a Pokémon into a new stage of power.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Zap',
    isPerRom: true
  },

  // 3. Gym Badges 1 to 8
  {
    id: 'poke_badge_1',
    title: 'First Badge of Honor',
    description: 'Defeat Gym Leader 1 and earn your inaugural regional League Badge.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_2',
    title: 'Second Badge Claimed',
    description: 'Defeat Gym Leader 2 and secure your second regional League Badge.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_3',
    title: 'Third Badge Claimed',
    description: 'Defeat Gym Leader 3 and secure your third regional League Badge.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_4',
    title: 'Fourth Badge Claimed',
    description: 'Defeat Gym Leader 4 and secure your fourth regional League Badge.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_5',
    title: 'Fifth Badge Claimed',
    description: 'Defeat Gym Leader 5 and secure your fifth regional League Badge.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_6',
    title: 'Sixth Badge Claimed',
    description: 'Defeat Gym Leader 6 and secure your sixth regional League Badge.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_7',
    title: 'Seventh Badge Claimed',
    description: 'Defeat Gym Leader 7 and secure your seventh regional League Badge.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_badge_8',
    title: 'Eighth Badge Claimed',
    description: 'Defeat Gym Leader 8 and secure your final regional League Badge.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Shield',
    isPerRom: true
  },

  // 4. Mid-Game Exploration & Tools
  {
    id: 'poke_treasure_hunter',
    title: 'Treasure Hunter',
    description: 'Acquire the Itemfinder / Dowsing Machine to unearth buried secrets.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Search',
    isPerRom: true
  },
  {
    id: 'poke_wake_up_call',
    title: 'Wake-Up Call',
    description: 'Acquire the legendary Poké Flute to awaken slumbering giants.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Volume2',
    isPerRom: true
  },
  {
    id: 'poke_revealer_of_mysteries',
    title: 'Revealer of Mysteries',
    description: 'Acquire the Scope to unmask hidden illusions and invisible obstacles.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Eye',
    isPerRom: true
  },
  {
    id: 'poke_shared_growth',
    title: 'Shared Growth',
    description: 'Acquire the Exp. Share to distribute battle experience across your team.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Share2',
    isPerRom: true
  },
  {
    id: 'poke_jurassic_revival',
    title: 'Jurassic Revival',
    description: 'Revive an ancient prehistoric Pokémon from a fossilized remnant.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Feather',
    isPerRom: true
  },
  {
    id: 'poke_master_angler',
    title: 'Master Angler',
    description: 'Obtain the ultimate Super Rod capable of hooking deep-sea titans.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Waves',
    isPerRom: true
  },

  // 5. Climax & Victory
  {
    id: 'poke_master_ball',
    title: 'Master Ball Acquired',
    description: 'Obtain the legendary Master Ball with an infallible 100% capture rate.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Disc',
    isPerRom: true
  },
  {
    id: 'poke_eight_badges',
    title: 'Eight Badges Assembled',
    description: 'Complete the regional Badge Case and qualify for the Pokémon League.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_myth_and_legend',
    title: 'Myth & Legend',
    description: 'Encounter and capture a legendary or mythical box-art Pokémon.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Star',
    isPerRom: true
  },
  {
    id: 'poke_hall_of_fame',
    title: 'Regional Champion',
    description: 'Conquer the Elite Four and reigning Champion to enter the Hall of Fame.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Trophy',
    isPerRom: true
  },

  // 6. Endgame & Mastery Feats
  {
    id: 'poke_level_100',
    title: 'Level 100 Ascension',
    description: 'Train any single Pokémon to the maximum peak of Level 100.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Crown',
    isPerRom: true
  },
  {
    id: 'poke_star_trainer',
    title: 'Star Trainer (Shiny Caught)',
    description: 'Register or capture an ultra-rare Shiny Pokémon with alternate coloration.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Sparkles',
    isPerRom: true
  },
  {
    id: 'poke_microscopic_miracle',
    title: 'Microscopic Miracle',
    description: 'Contract or harbor the rare, beneficial Pokérus virus on your team.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_high_roller',
    title: 'High Roller (Max Wallet)',
    description: 'Accumulate maximum wealth (₽999,999 PokéDollars) in your trainer wallet.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'DollarSign',
    isPerRom: true
  },

  // 7. Pokédex Collector Scaling
  {
    id: 'poke_dex_10',
    title: 'Novice Collector',
    description: 'Register 10 caught Pokémon entries in the regional Pokédex.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'BookOpen',
    isPerRom: true
  },
  {
    id: 'poke_dex_25',
    title: 'Seasoned Collector',
    description: 'Register 25 caught Pokémon entries in the regional Pokédex.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'BookOpen',
    isPerRom: true
  },
  {
    id: 'poke_dex_50',
    title: 'Master Collector',
    description: 'Register 50 caught Pokémon entries in the regional Pokédex.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'BookOpen',
    isPerRom: true
  },
  {
    id: 'poke_dex_100',
    title: 'Grandmaster Collector',
    description: 'Register 100 caught Pokémon entries in the regional Pokédex.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'BookOpen',
    isPerRom: true
  }
];

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS_MANIFEST.reduce((acc, ach) => {
  return acc + (ACHIEVEMENT_TIERS[ach.tier.toUpperCase()]?.points || 5);
}, 0);

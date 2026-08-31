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
// REGIONAL POKÉMON LEAGUE BADGE DIRECTORY (Gen 1 to 5)
// ---------------------------------------------------------------------------
export const REGIONAL_BADGES = {
  kanto: [
    { num: 1, name: 'Boulder Badge', leader: 'Brock', city: 'Pewter City', type: 'Rock', tier: 'bronze' },
    { num: 2, name: 'Cascade Badge', leader: 'Misty', city: 'Cerulean City', type: 'Water', tier: 'bronze' },
    { num: 3, name: 'Thunder Badge', leader: 'Lt. Surge', city: 'Vermilion City', type: 'Electric', tier: 'bronze' },
    { num: 4, name: 'Rainbow Badge', leader: 'Erika', city: 'Celadon City', type: 'Grass', tier: 'silver' },
    { num: 5, name: 'Soul Badge', leader: 'Koga', city: 'Fuchsia City', type: 'Poison', tier: 'silver' },
    { num: 6, name: 'Marsh Badge', leader: 'Sabrina', city: 'Saffron City', type: 'Psychic', tier: 'silver' },
    { num: 7, name: 'Volcano Badge', leader: 'Blaine', city: 'Cinnabar Island', type: 'Fire', tier: 'gold' },
    { num: 8, name: 'Earth Badge', leader: 'Giovanni', city: 'Viridian City', type: 'Ground', tier: 'gold' }
  ],
  johto: [
    { num: 1, name: 'Zephyr Badge', leader: 'Falkner', city: 'Violet City', type: 'Flying', tier: 'bronze' },
    { num: 2, name: 'Hive Badge', leader: 'Bugsy', city: 'Azalea Town', type: 'Bug', tier: 'bronze' },
    { num: 3, name: 'Plain Badge', leader: 'Whitney', city: 'Goldenrod City', type: 'Normal', tier: 'bronze' },
    { num: 4, name: 'Fog Badge', leader: 'Morty', city: 'Ecruteak City', type: 'Ghost', tier: 'silver' },
    { num: 5, name: 'Storm Badge', leader: 'Chuck', city: 'Cianwood City', type: 'Fighting', tier: 'silver' },
    { num: 6, name: 'Mineral Badge', leader: 'Jasmine', city: 'Olivine City', type: 'Steel', tier: 'silver' },
    { num: 7, name: 'Glacier Badge', leader: 'Pryce', city: 'Mahogany Town', type: 'Ice', tier: 'gold' },
    { num: 8, name: 'Rising Badge', leader: 'Clair', city: 'Blackthorn City', type: 'Dragon', tier: 'gold' }
  ],
  hoenn: [
    { num: 1, name: 'Stone Badge', leader: 'Roxanne', city: 'Rustboro City', type: 'Rock', tier: 'bronze' },
    { num: 2, name: 'Knuckle Badge', leader: 'Brawly', city: 'Dewford Town', type: 'Fighting', tier: 'bronze' },
    { num: 3, name: 'Dynamo Badge', leader: 'Wattson', city: 'Mauville City', type: 'Electric', tier: 'bronze' },
    { num: 4, name: 'Heat Badge', leader: 'Flannery', city: 'Lavaridge Town', type: 'Fire', tier: 'silver' },
    { num: 5, name: 'Balance Badge', leader: 'Norman', city: 'Petalburg City', type: 'Normal', tier: 'silver' },
    { num: 6, name: 'Feather Badge', leader: 'Winona', city: 'Fortree City', type: 'Flying', tier: 'silver' },
    { num: 7, name: 'Mind Badge', leader: 'Tate & Liza', city: 'Mossdeep City', type: 'Psychic', tier: 'gold' },
    { num: 8, name: 'Rain Badge', leader: 'Wallace / Juan', city: 'Sootopolis City', type: 'Water', tier: 'gold' }
  ],
  sinnoh: [
    { num: 1, name: 'Coal Badge', leader: 'Roark', city: 'Oreburgh City', type: 'Rock', tier: 'bronze' },
    { num: 2, name: 'Forest Badge', leader: 'Gardenia', city: 'Eterna City', type: 'Grass', tier: 'bronze' },
    { num: 3, name: 'Cobble Badge', leader: 'Maylene', city: 'Veilstone City', type: 'Fighting', tier: 'bronze' },
    { num: 4, name: 'Fen Badge', leader: 'Crasher Wake', city: 'Pastoria City', type: 'Water', tier: 'silver' },
    { num: 5, name: 'Relic Badge', leader: 'Fantina', city: 'Hearthome City', type: 'Ghost', tier: 'silver' },
    { num: 6, name: 'Mine Badge', leader: 'Byron', city: 'Canalave City', type: 'Steel', tier: 'silver' },
    { num: 7, name: 'Icicle Badge', leader: 'Candice', city: 'Snowpoint City', type: 'Ice', tier: 'gold' },
    { num: 8, name: 'Beacon Badge', leader: 'Volkner', city: 'Sunyshore City', type: 'Electric', tier: 'gold' }
  ],
  unova: [
    { num: 1, name: 'Trio / Basic Badge', leader: 'Cilan / Cheren', city: 'Striaton / Aspertia', type: 'Various', tier: 'bronze' },
    { num: 2, name: 'Basic / Toxic Badge', leader: 'Lenora / Roxie', city: 'Nacrene / Virbank', type: 'Normal / Poison', tier: 'bronze' },
    { num: 3, name: 'Insect Badge', leader: 'Burgh', city: 'Castelia City', type: 'Bug', tier: 'bronze' },
    { num: 4, name: 'Bolt Badge', leader: 'Elesa', city: 'Nimbasa City', type: 'Electric', tier: 'silver' },
    { num: 5, name: 'Quake Badge', leader: 'Clay', city: 'Driftveil City', type: 'Ground', tier: 'silver' },
    { num: 6, name: 'Jet Badge', leader: 'Skyla', city: 'Mistralton City', type: 'Flying', tier: 'silver' },
    { num: 7, name: 'Freeze / Legend Badge', leader: 'Brycen / Drayden', city: 'Icirrus / Opelucid', type: 'Ice / Dragon', tier: 'gold' },
    { num: 8, name: 'Legend / Wave Badge', leader: 'Drayden / Marlon', city: 'Opelucid / Humilau', type: 'Dragon / Water', tier: 'gold' }
  ]
};

/**
 * Returns the exact 8 regional gym badges for a specific game cartridge.
 */
export function getPokemonBadgesForGame(game) {
  if (!game) return REGIONAL_BADGES.kanto;
  const rawTitle = (game.title || game.name || game.fileName || '').toLowerCase();
  const sysKey = (game.systemKey || game.systemCore || '').toLowerCase();

  if (rawTitle.includes('gold') || rawTitle.includes('silver') || rawTitle.includes('crystal') || rawTitle.includes('heartgold') || rawTitle.includes('soulsilver')) {
    return REGIONAL_BADGES.johto;
  }
  if (rawTitle.includes('ruby') || rawTitle.includes('sapphire') || rawTitle.includes('emerald')) {
    return REGIONAL_BADGES.hoenn;
  }
  if (rawTitle.includes('diamond') || rawTitle.includes('pearl') || rawTitle.includes('platinum')) {
    return REGIONAL_BADGES.sinnoh;
  }
  if (rawTitle.includes('black') || rawTitle.includes('white')) {
    return REGIONAL_BADGES.unova;
  }
  if (sysKey === 'gbc') return REGIONAL_BADGES.johto;
  if (sysKey === 'gba' && !rawTitle.includes('fire') && !rawTitle.includes('leaf')) return REGIONAL_BADGES.hoenn;
  return REGIONAL_BADGES.kanto;
}

// ---------------------------------------------------------------------------
// POKÉMON SPECIFIC MILESTONES (Rendered in Game Detail Pane)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// MASTER POKÉMON MILESTONES RESOLVER (Game & Generation Specific)
// ---------------------------------------------------------------------------

export const POKEMON_ACHIEVEMENTS_MANIFEST = [
  // Core Universal Milestones
  {
    id: 'poke_journey_begun',
    title: 'Journey Begun',
    description: 'Receive your inaugural starter companion from the regional Professor.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Compass',
    isPerRom: true
  },
  {
    id: 'poke_digital_cartographer',
    title: 'Regional Cartographer',
    description: 'Obtain your regional navigation guide (Town Map, Pokégear, or PokéNav).',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Map',
    isPerRom: true
  },
  {
    id: 'poke_first_catch',
    title: 'First Wild Catch',
    description: 'Capture your first non-starter wild Pokémon with a Poké Ball.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'PlusCircle',
    isPerRom: true
  },
  {
    id: 'poke_gone_fishin',
    title: 'Inaugural Angler (Old Rod)',
    description: 'Obtain your first fishing rod and cast lines into regional waterways.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Anchor',
    isPerRom: true
  },
  {
    id: 'poke_full_party',
    title: 'Six-Slot Battle Squad',
    description: 'Assemble a full battle team of 6 combat-ready Pokémon in your active party.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Users',
    isPerRom: true
  },
  {
    id: 'poke_pedal_to_metal',
    title: 'Regional Cyclist (Bicycle)',
    description: 'Acquire your Bicycle to cruise across routes, slopes, and cycling roads.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Bike',
    isPerRom: true
  },
  {
    id: 'poke_evolution_master',
    title: 'Metamorphosis',
    description: 'Raise and evolve any Pokémon into a new evolutionary stage of power.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'Zap',
    isPerRom: true
  },

  // Tools & Items
  {
    id: 'poke_treasure_hunter',
    title: 'Dowsing Detective (Itemfinder)',
    description: 'Obtain the Itemfinder / Dowsing Machine to detect hidden items and buried treasures.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Search',
    isPerRom: true
  },
  {
    id: 'poke_wake_up_call',
    title: 'Awaken the Giant (Poké Flute)',
    description: 'Acquire the Poké Flute to awaken slumbering giants and clear blocked routes.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Volume2',
    isPerRom: true
  },
  {
    id: 'poke_revealer_of_mysteries',
    title: 'Revealer of Mysteries (Scope)',
    description: 'Acquire the Scope (Silph Scope / Devon Scope) to unmask hidden illusions and ghosts.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Eye',
    isPerRom: true
  },
  {
    id: 'poke_shared_growth',
    title: 'Shared Experience (Exp. Share)',
    description: 'Acquire the Exp. All / Exp. Share to distribute battle experience across your team.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Share2',
    isPerRom: true
  },
  {
    id: 'poke_jurassic_revival',
    title: 'Prehistoric Revival (Fossil)',
    description: 'Revive an ancient prehistoric Pokémon from a fossilized remnant in a research lab.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'Feather',
    isPerRom: true
  },
  {
    id: 'poke_master_angler',
    title: 'Master Angler (Super Rod)',
    description: 'Obtain the ultimate Super Rod to hook deep-water titans and legendary sea Pokémon.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Waves',
    isPerRom: true
  },

  // Climax & Victory
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
    title: 'Regional League Qualified',
    description: 'Assemble all 8 Regional Gym Badges and qualify for the Pokémon League.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_sixteen_badges',
    title: 'Dual-Region Master (16 Badges)',
    description: 'Conquer both the Johto and Kanto leagues, assembling all 16 Regional Gym Badges to unlock Mt. Silver.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Crown',
    isPerRom: true
  },
  {
    id: 'poke_myth_and_legend',
    title: 'Legendary Encounter',
    description: 'Encounter and capture a legendary or mythical box-art Pokémon.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'Star',
    isPerRom: true
  },
  {
    id: 'poke_hall_of_fame',
    title: 'Regional League Champion',
    description: 'Conquer the Elite Four and reigning Champion to enter the Hall of Fame.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Trophy',
    isPerRom: true
  },

  // Special Exclusives & Endgame Mastery
  {
    id: 'poke_yellow_pika_friend',
    title: "Pikachu's Best Companion",
    description: "Maximize your Pikachu's happiness rating in Pokémon Yellow (Friendship >= 200).",
    category: 'pokemon',
    tier: 'gold',
    icon: 'Heart',
    isPerRom: true
  },
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
    title: 'Star Trainer (Shiny)',
    description: 'Register or own an ultra-rare Shiny Pokémon with alternate coloration.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'Star',
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

  // Pokédex Collector Scaling
  {
    id: 'poke_dex_10',
    title: 'Novice Collector (10 Caught)',
    description: 'Register 10 caught Pokémon entries in your regional Pokédex.',
    category: 'pokemon',
    tier: 'bronze',
    icon: 'BookOpen',
    isPerRom: true
  },
  {
    id: 'poke_dex_25',
    title: 'Seasoned Collector (25 Caught)',
    description: 'Register 25 caught Pokémon entries in your regional Pokédex.',
    category: 'pokemon',
    tier: 'silver',
    icon: 'BookOpen',
    isPerRom: true
  },
  {
    id: 'poke_dex_50',
    title: 'Master Collector (50 Caught)',
    description: 'Register 50 caught Pokémon entries in your regional Pokédex.',
    category: 'pokemon',
    tier: 'gold',
    icon: 'BookOpen',
    isPerRom: true
  },
  {
    id: 'poke_dex_100',
    title: 'Grandmaster Collector (100 Caught)',
    description: 'Register 100 caught Pokémon entries in your regional Pokédex.',
    category: 'pokemon',
    tier: 'platinum',
    icon: 'BookOpen',
    isPerRom: true
  }
];

/**
 * Returns dynamic contextual milestone titles & descriptions tailored to the selected game.
 */
export function getPokemonMilestonesForGame(game) {
  if (!game) return POKEMON_ACHIEVEMENTS_MANIFEST;
  const rawTitle = (game.title || game.name || game.fileName || '').toLowerCase();
  const sysKey = (game.systemKey || game.systemCore || '').toLowerCase();

  const isYellow = rawTitle.includes('yellow');
  const isJohto = rawTitle.includes('gold') || rawTitle.includes('silver') || rawTitle.includes('crystal') || rawTitle.includes('heartgold') || rawTitle.includes('soulsilver') || sysKey === 'gbc';
  const isHoenn = rawTitle.includes('ruby') || rawTitle.includes('sapphire') || rawTitle.includes('emerald');
  const isEmerald = rawTitle.includes('emerald');
  const isFRLG = rawTitle.includes('fire') || rawTitle.includes('leaf');

  return POKEMON_ACHIEVEMENTS_MANIFEST.filter(item => {
    // Only show Yellow-specific milestone for Pokemon Yellow
    if (item.id === 'poke_yellow_pika_friend' && !isYellow) return false;
    // Only show 16 Badges for Gen 2 Dual Region (Johto + Kanto)
    if (item.id === 'poke_sixteen_badges' && !isJohto) return false;
    return true;
  }).map(item => {
    if (isJohto) {
      if (item.id === 'poke_journey_begun') return { ...item, title: 'New Bark Departure', description: 'Receive your starter companion from Professor Elm in New Bark Town.' };
      if (item.id === 'poke_digital_cartographer') return { ...item, title: 'Pokégear Navigation', description: 'Acquire your Pokégear with the Map Card to explore Johto and Kanto.' };
      if (item.id === 'poke_pedal_to_metal') return { ...item, title: 'Goldenrod Cyclist (Bicycle)', description: 'Receive the Bicycle from the Goldenrod Bike Shop.' };
      if (item.id === 'poke_hall_of_fame') return { ...item, title: 'Silver Conference Champion', description: 'Defeat the Elite Four and Champion Lance at the Indigo Plateau.' };
      if (item.id === 'poke_myth_and_legend') return { ...item, title: 'Guardian of Sea & Sky', description: 'Encounter and capture Lugia (Whirl Islands) or Ho-Oh (Tin Tower).' };
    } else if (isHoenn) {
      if (item.id === 'poke_journey_begun') return { ...item, title: 'Littleroot Departure', description: 'Rescue Professor Birch with your starter companion in Littleroot Town.' };
      if (item.id === 'poke_digital_cartographer') return { ...item, title: 'PokéNav Navigator', description: 'Acquire the PokéNav from the Devon Corporation President in Rustboro.' };
      if (item.id === 'poke_pedal_to_metal') return { ...item, title: "Rydel's Dual Cycles (Mach/Acro)", description: 'Obtain the Mach or Acro Bike from Rydel in Mauville City.' };
      if (item.id === 'poke_revealer_of_mysteries') return { ...item, title: 'Unseen Chameleon (Devon Scope)', description: 'Receive the Devon Scope from Steven on Route 120 to unmask camouflaged Kecleon.' };
      if (item.id === 'poke_hall_of_fame') return { ...item, title: 'Ever Grande Champion', description: isEmerald ? 'Defeat Champion Wallace to claim the Hoenn League throne.' : 'Defeat Champion Steven Stone to conquer the Hoenn League.' };
      if (item.id === 'poke_myth_and_legend') return { ...item, title: 'Sovereign of Land, Sea & Sky', description: 'Capture Groudon, Kyogre, or the dragon king Rayquaza at Sky Pillar.' };
    } else if (isFRLG || (!isJohto && !isHoenn)) {
      if (item.id === 'poke_journey_begun') return { ...item, title: 'Pallet Town Departure', description: 'Receive your starter companion from Professor Oak in Pallet Town.' };
      if (item.id === 'poke_digital_cartographer') return { ...item, title: 'Cartographer of Kanto (Town Map)', description: 'Obtain the Town Map from Daisy Oak in Pallet Town.' };
      if (item.id === 'poke_pedal_to_metal') return { ...item, title: 'Cerulean Cyclist (Bicycle)', description: 'Exchange your Bike Voucher for a Bicycle at the Cerulean Bike Shop.' };
      if (item.id === 'poke_revealer_of_mysteries') return { ...item, title: 'Ghostbusters (Silph Scope)', description: 'Obtain the Silph Scope from Team Rocket Hideout to unveil ghosts in Pokémon Tower.' };
      if (item.id === 'poke_hall_of_fame') return { ...item, title: 'Indigo Plateau Champion', description: 'Defeat the Elite Four and Rival Blue to enter the Hall of Fame.' };
      if (item.id === 'poke_myth_and_legend') return { ...item, title: 'The Genetic Apex (Mewtwo/Birds)', description: 'Encounter and capture Articuno, Zapdos, Moltres, or Mewtwo in Cerulean Cave.' };
    }
    return item;
  });
}

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS_MANIFEST.reduce((acc, ach) => {
  return acc + (ACHIEVEMENT_TIERS[ach.tier.toUpperCase()]?.points || 5);
}, 0);

/**
 * Canonical Mainline Pokémon Game Registry & Identification Matcher (Gen 1 - Gen 5).
 */

export const POKEMON_GAMES = [
  // Generation 1 (Game Boy)
  { id: 'red', name: 'Pokemon Red Version', matchPatterns: [/\bred version\b/, /\bred\b/], gen: 1, code: 'RED', region: 'kanto' },
  { id: 'blue', name: 'Pokemon Blue Version', matchPatterns: [/\bblue version\b/, /\bblue\b/], gen: 1, code: 'BLUE', region: 'kanto' },
  { id: 'yellow', name: 'Pokemon Yellow Version', matchPatterns: [/\byellow version\b/, /\byellow\b/, /\bspecial pikachu\b/], gen: 1, code: 'YELLOW', region: 'kanto' },

  // Generation 2 (Game Boy Color)
  { id: 'gold', name: 'Pokemon Gold Version', matchPatterns: [/\bgold version\b/, /\bgold\b/], gen: 2, code: 'GOLD', region: 'johto' },
  { id: 'silver', name: 'Pokemon Silver Version', matchPatterns: [/\bsilver version\b/, /\bsilver\b/], gen: 2, code: 'SILVER', region: 'johto' },
  { id: 'crystal', name: 'Pokemon Crystal Version', matchPatterns: [/\bcrystal version\b/, /\bcrystal\b/], gen: 2, code: 'CRYSTAL', region: 'johto' },

  // Generation 3 (Game Boy Advance)
  { id: 'ruby', name: 'Pokemon Ruby Version', matchPatterns: [/\bruby version\b/, /\bruby\b/], gen: 3, code: 'RUBY', region: 'hoenn' },
  { id: 'sapphire', name: 'Pokemon Sapphire Version', matchPatterns: [/\bsapphire version\b/, /\bsapphire\b/], gen: 3, code: 'SAPPHIRE', region: 'hoenn' },
  { id: 'emerald', name: 'Pokemon Emerald Version', matchPatterns: [/\bemerald version\b/, /\bemerald\b/], gen: 3, code: 'EMERALD', region: 'hoenn' },
  { id: 'firered', name: 'Pokemon FireRed Version', matchPatterns: [/\bfirered version\b/, /\bfire red version\b/, /\bfirered\b/, /\bfire red\b/], gen: 3, code: 'FIRERED', region: 'kanto' },
  { id: 'leafgreen', name: 'Pokemon LeafGreen Version', matchPatterns: [/\bleafgreen version\b/, /\bleaf green version\b/, /\bleafgreen\b/, /\bleaf green\b/], gen: 3, code: 'LEAFGREEN', region: 'kanto' },

  // Generation 4 (Nintendo DS)
  { id: 'diamond', name: 'Pokemon Diamond Version', matchPatterns: [/\bdiamond version\b/, /\bdiamond\b/], gen: 4, code: 'DIAMOND', region: 'sinnoh' },
  { id: 'pearl', name: 'Pokemon Pearl Version', matchPatterns: [/\bpearl version\b/, /\bpearl\b/], gen: 4, code: 'PEARL', region: 'sinnoh' },
  { id: 'platinum', name: 'Pokemon Platinum Version', matchPatterns: [/\bplatinum version\b/, /\bplatinum\b/], gen: 4, code: 'PLATINUM', region: 'sinnoh' },
  { id: 'heartgold', name: 'Pokemon HeartGold Version', matchPatterns: [/\bheartgold version\b/, /\bheart gold version\b/, /\bheartgold\b/, /\bheart gold\b/], gen: 4, code: 'HEARTGOLD', region: 'johto' },
  { id: 'soulsilver', name: 'Pokemon SoulSilver Version', matchPatterns: [/\bsoulsilver version\b/, /\bsoul silver version\b/, /\bsoulsilver\b/, /\bsoul silver\b/], gen: 4, code: 'SOULSILVER', region: 'johto' },

  // Generation 5 (Nintendo DS)
  { id: 'black2', name: 'Pokemon Black Version 2', matchPatterns: [/\bblack version 2\b/, /\bblack 2\b/, /\bblack2\b/], gen: 5, code: 'BLACK2', region: 'unova' },
  { id: 'white2', name: 'Pokemon White Version 2', matchPatterns: [/\bwhite version 2\b/, /\bwhite 2\b/, /\bwhite2\b/], gen: 5, code: 'WHITE2', region: 'unova' },
  { id: 'black', name: 'Pokemon Black Version', matchPatterns: [/\bblack version\b/, /\bblack\b/], gen: 5, code: 'BLACK', region: 'unova' },
  { id: 'white', name: 'Pokemon White Version', matchPatterns: [/\bwhite version\b/, /\bwhite\b/], gen: 5, code: 'WHITE', region: 'unova' }
];

export const NON_CANONICAL_KEYWORDS = [
  'pinball', 'mystery dungeon', 'rescue team', 'puzzle', 'trading card', 'tcg', 'snap', 'stadium',
  'adventure', 'chapter', 'unbound', 'radical', 'gaia', 'rocket edition', 'scorched', 'scorchedsilver',
  'glazed', 'flora sky', 'liquid crystal', 'prism', 'theta', 'mega power', 'lazarus', 'seaglass',
  'dark rising', 'light platinum', 'ash gray', 'blazed', 'clover', 'snakewood', 'dreamstone',
  'recharged', 'inclement', 'rowan', 'shiny gold', 'xenoverse', 'uranium', 'stupid rom', 'hack', 'v1.', 'v2.', 'v3.', 'v4.'
];

/**
 * Checks if a game record strictly matches a verified canonical mainline Pokémon title (Gen 1-5).
 */
export function isPokemonRom(game) {
  if (!game) return false;
  const sysKey = (game.systemKey || game.systemCore || '').toLowerCase();
  
  if (sysKey && !['gb', 'gbc', 'gba', 'gameboy', 'gameboy advance', 'gameboy color', 'nds', 'nintendo ds', 'ds'].includes(sysKey)) {
    return false;
  }

  const rawTitle = (game.title || game.name || game.fileName || '').toLowerCase().trim();
  if (!rawTitle) return false;
  
  if (!rawTitle.includes('pokemon') && !rawTitle.includes('pokémon') && !rawTitle.includes('pocket monster')) {
    return false;
  }

  if (NON_CANONICAL_KEYWORDS.some(kw => rawTitle.includes(kw))) {
    return false;
  }

  if (rawTitle.includes('pinball')) return false;

  return POKEMON_GAMES.some(g => g.matchPatterns.some(pat => pat.test(rawTitle)));
}

/**
 * Identifies the specific Pokémon game metadata from title/filename.
 */
export function identifyPokemonGame(game) {
  if (!isPokemonRom(game)) return null;
  const rawTitle = (game.title || game.name || game.fileName || '').toLowerCase().trim();

  for (const p of POKEMON_GAMES) {
    if (p.matchPatterns.some(pat => pat.test(rawTitle))) {
      return p;
    }
  }

  return null;
}

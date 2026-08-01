// Official overview descriptions and metadata for retro titles
export const GAME_DESCRIPTIONS = {
  // Game Boy Advance
  'firered': 'Journey through the iconic Kanto region in this enhanced Generation III remake.',
  'leafgreen': 'Revisit classic adventures across the Kanto region and Sevii Archipelago.',
  'emerald': 'Experience the expanded storyline featuring legendary dragon battles.',
  'ruby': 'Explore tropical islands, defeat rival factions, and conquer the region league.',
  'sapphire': 'Adventure across sea and land to restore balance to the elemental forces.',

  // Generic fallback by system or genre
  'default': 'Classic retro title. Relive nostalgic gameplay on your favorite console.'
};

// Release Dates (YYYY-MM-DD or Year for sorting)
export const GAME_RELEASE_DATES = {
  'default': '2000-01-01'
};

/**
 * Returns a clean description based on game title / filename
 */
export function getGameDescription(game) {
  if (!game) return GAME_DESCRIPTIONS.default;

  const titleLower = (game.title || '').toLowerCase();
  const rawLower = (game.rawTitle || '').toLowerCase();
  const fileLower = (game.filename || '').toLowerCase();

  const searchStr = `${titleLower} ${rawLower} ${fileLower}`;

  // Find matching key
  for (const [key, desc] of Object.entries(GAME_DESCRIPTIONS)) {
    if (key === 'default') continue;
    if (searchStr.includes(key)) {
      return desc;
    }
  }

  return GAME_DESCRIPTIONS.default;
}

/**
 * Returns the release date for a given game
 */
export function getReleaseDate(game) {
  if (!game) return GAME_RELEASE_DATES.default;

  const titleLower = (game.title || '').toLowerCase();
  const rawLower = (game.rawTitle || '').toLowerCase();
  const fileLower = (game.filename || '').toLowerCase();

  const searchStr = `${titleLower} ${rawLower} ${fileLower}`;

  // Check specific keys first to avoid false partial matches (e.g., "black 2" before "black")
  const sortedKeys = Object.keys(GAME_RELEASE_DATES).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (key === 'default') continue;
    if (searchStr.includes(key)) {
      return GAME_RELEASE_DATES[key];
    }
  }

  return GAME_RELEASE_DATES.default;
}

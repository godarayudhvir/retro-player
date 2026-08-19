// Universal fallback helpers for metadata when offline or before scraper runs

const DEFAULT_DESCRIPTION = 'Classic retro gaming title. Relive authentic gameplay, music, and nostalgia.';
const DEFAULT_RELEASE_DATE = '2000-01-01';

/**
 * Returns a fallback description based on game title / filename
 */
export function getGameDescription(game) {
  if (!game) return DEFAULT_DESCRIPTION;
  const cleanTitle = (game.title || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  const sys = game.systemName || 'Retro Console';
  return `Experience the timeless adventure of ${cleanTitle} on ${sys}.`;
}

/**
 * Returns the release date for a given game
 */
export function getReleaseDate(game) {
  if (!game) return DEFAULT_RELEASE_DATE;
  return game.releaseDate || DEFAULT_RELEASE_DATE;
}

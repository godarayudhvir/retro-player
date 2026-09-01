/**
 * Universal Pokémon Save Inspector & Router Façade (Gen 1 – Gen 5).
 * Re-exports the modular per-game save parsers from src/services/pokemon/.
 */

export {
  parsePokemonSave,
  isPokemonRom,
  identifyPokemonGame,
  POKEMON_GAMES,
  NON_CANONICAL_KEYWORDS,

  // Modular Parsers
  parsePokemonRed,
  parsePokemonBlue,
  parsePokemonYellow,
  parsePokemonGold,
  parsePokemonSilver,
  parsePokemonCrystal,
  parsePokemonRuby,
  parsePokemonSapphire,
  parsePokemonEmerald,
  parsePokemonFireRed,
  parsePokemonLeafGreen,
  parsePokemonDiamond,
  parsePokemonPearl,
  parsePokemonPlatinum,
  parsePokemonHeartGold,
  parsePokemonSoulSilver,
  parsePokemonBlack,
  parsePokemonWhite
} from './pokemon/index.js';

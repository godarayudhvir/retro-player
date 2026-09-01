/**
 * Universal Pokémon Save Inspector & Router Façade (Gen 1 – Gen 5).
 * Re-exports from src/services/pokemon-save-inspector/.
 */

export {
  parsePokemonSave,
  isPokemonRom,
  identifyPokemonGame,
  getPokemonGameModule,
  getPokemonMilestonesForGame,
  getPokemonBadgesForGame,
  isJohtoPokemonGame,
  POKEMON_GAMES,
  NON_CANONICAL_KEYWORDS
} from './pokemon-save-inspector/index.js';

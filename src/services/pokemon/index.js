/**
 * Universal Pokémon Save Inspector & Router (Gen 1 – Gen 5).
 * Routes any identified game cartridge to its dedicated, isolated parser module.
 */

import { POKEMON_GAMES, NON_CANONICAL_KEYWORDS, isPokemonRom, identifyPokemonGame } from './registry.js';

// Gen 1 Parsers
import { parsePokemonRed } from './parsers/gen1/parseRed.js';
import { parsePokemonBlue } from './parsers/gen1/parseBlue.js';
import { parsePokemonYellow } from './parsers/gen1/parseYellow.js';

// Gen 2 Parsers
import { parsePokemonGold } from './parsers/gen2/parseGold.js';
import { parsePokemonSilver } from './parsers/gen2/parseSilver.js';
import { parsePokemonCrystal } from './parsers/gen2/parseCrystal.js';

// Gen 3 Parsers
import { parsePokemonRuby } from './parsers/gen3/parseRuby.js';
import { parsePokemonSapphire } from './parsers/gen3/parseSapphire.js';
import { parsePokemonEmerald } from './parsers/gen3/parseEmerald.js';
import { parsePokemonFireRed } from './parsers/gen3/parseFireRed.js';
import { parsePokemonLeafGreen } from './parsers/gen3/parseLeafGreen.js';

// Gen 4 Parsers
import { parsePokemonDiamond } from './parsers/gen4/parseDiamond.js';
import { parsePokemonPearl } from './parsers/gen4/parsePearl.js';
import { parsePokemonPlatinum } from './parsers/gen4/parsePlatinum.js';
import { parsePokemonHeartGold } from './parsers/gen4/parseHeartGold.js';
import { parsePokemonSoulSilver } from './parsers/gen4/parseSoulSilver.js';

// Gen 5 Parsers
import { parsePokemonBlack } from './parsers/gen5/parseBlack.js';
import { parsePokemonWhite } from './parsers/gen5/parseWhite.js';

// Dedicated Parser Router Map
const PARSER_REGISTRY = {
  // Gen 1
  red: parsePokemonRed,
  blue: parsePokemonBlue,
  yellow: parsePokemonYellow,

  // Gen 2
  gold: parsePokemonGold,
  silver: parsePokemonSilver,
  crystal: parsePokemonCrystal,

  // Gen 3
  ruby: parsePokemonRuby,
  sapphire: parsePokemonSapphire,
  emerald: parsePokemonEmerald,
  firered: parsePokemonFireRed,
  leafgreen: parsePokemonLeafGreen,

  // Gen 4
  diamond: parsePokemonDiamond,
  pearl: parsePokemonPearl,
  platinum: parsePokemonPlatinum,
  heartgold: parsePokemonHeartGold,
  soulsilver: parsePokemonSoulSilver,

  // Gen 5
  black: parsePokemonBlack,
  white: parsePokemonWhite
};

/**
 * Universal Pokémon Save Analyzer.
 * Inspects raw save buffer (`Uint8Array`) and executes the dedicated parser for the given game.
 */
export function parsePokemonSave(uint8Array, game) {
  if (!uint8Array || !(uint8Array instanceof Uint8Array)) return null;
  const length = uint8Array.byteLength || uint8Array.length;
  if (length < 0x8000) return null; // Minimum 32 KB

  const identifiedGame = identifyPokemonGame(game);
  if (!identifiedGame && !isPokemonRom(game)) {
    return null;
  }

  try {
    const parser = PARSER_REGISTRY[identifiedGame?.id];
    if (typeof parser === 'function') {
      return parser(uint8Array);
    }

    // Fallback heuristic by save buffer length & generation if game ID pattern didn't match directly
    if (length === 32768) {
      if (identifiedGame?.gen === 2) return parsePokemonGold(uint8Array);
      return parsePokemonRed(uint8Array);
    } else if (length === 65536 || length === 131072) {
      return parsePokemonEmerald(uint8Array);
    } else if (length >= 262144) {
      if (identifiedGame?.gen === 5) return parsePokemonBlack(uint8Array);
      return parsePokemonDiamond(uint8Array);
    }
  } catch (err) {
    console.warn('[pokemonSaveParser] Error parsing Pokémon save buffer:', err);
  }

  return null;
}

export {
  POKEMON_GAMES,
  NON_CANONICAL_KEYWORDS,
  isPokemonRom,
  identifyPokemonGame,

  // Export individual parsers
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
};

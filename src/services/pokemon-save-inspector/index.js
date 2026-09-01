/**
 * Master Registry & Router for All Dedicated Pokémon Modules (Gen 1 – Gen 5).
 * 100% self-contained game modules with isolated parser, milestones, and badges.
 */

import { POKEMON_GAMES, NON_CANONICAL_KEYWORDS, isPokemonRom, identifyPokemonGame } from './registry.js';

// Gen 1
import * as red from './games/gen1/red/index.js';
import * as blue from './games/gen1/blue/index.js';
import * as yellow from './games/gen1/yellow/index.js';

// Gen 2
import * as gold from './games/gen2/gold/index.js';
import * as silver from './games/gen2/silver/index.js';
import * as crystal from './games/gen2/crystal/index.js';

// Gen 3
import * as ruby from './games/gen3/ruby/index.js';
import * as sapphire from './games/gen3/sapphire/index.js';
import * as emerald from './games/gen3/emerald/index.js';
import * as firered from './games/gen3/firered/index.js';
import * as leafgreen from './games/gen3/leafgreen/index.js';

// Gen 4
import * as diamond from './games/gen4/diamond/index.js';
import * as pearl from './games/gen4/pearl/index.js';
import * as platinum from './games/gen4/platinum/index.js';
import * as heartgold from './games/gen4/heartgold/index.js';
import * as soulsilver from './games/gen4/soulsilver/index.js';

// Gen 5
import * as black from './games/gen5/black/index.js';
import * as white from './games/gen5/white/index.js';
import * as black2 from './games/gen5/black2/index.js';
import * as white2 from './games/gen5/white2/index.js';

const GAME_MODULES = {
  // Gen 1
  red,
  blue,
  yellow,

  // Gen 2
  gold,
  silver,
  crystal,

  // Gen 3
  ruby,
  sapphire,
  emerald,
  firered,
  leafgreen,

  // Gen 4
  diamond,
  pearl,
  platinum,
  heartgold,
  soulsilver,

  // Gen 5
  black,
  white,
  black2,
  white2
};

export function getPokemonGameModule(game) {
  const identified = identifyPokemonGame(game);
  if (identified && GAME_MODULES[identified.id]) {
    return GAME_MODULES[identified.id];
  }
  return null;
}

export function parsePokemonSave(uint8Array, game) {
  if (!uint8Array || !(uint8Array instanceof Uint8Array)) return null;
  const length = uint8Array.byteLength || uint8Array.length;
  if (length < 0x8000) return null;

  const mod = getPokemonGameModule(game);
  if (mod && typeof mod.parseSave === 'function') {
    return mod.parseSave(uint8Array);
  }

  // Fallback by length if game title pattern did not resolve directly
  if (length === 32768) {
    return red.parseSave(uint8Array);
  } else if (length === 65536 || length === 131072) {
    return emerald.parseSave(uint8Array);
  } else if (length >= 262144) {
    return diamond.parseSave(uint8Array);
  }

  return null;
}

export function getPokemonMilestonesForGame(game) {
  const mod = getPokemonGameModule(game);
  if (mod && typeof mod.getMilestones === 'function') {
    return mod.getMilestones();
  }
  return [];
}

export function getPokemonBadgesForGame(game) {
  const mod = getPokemonGameModule(game);
  if (mod && typeof mod.getBadges === 'function') {
    return mod.getBadges();
  }
  return [];
}

export function getPokemonKantoBadgesForGame(game) {
  const mod = getPokemonGameModule(game);
  if (mod && typeof mod.getKantoBadges === 'function') {
    return mod.getKantoBadges();
  }
  return [];
}

export function isJohtoPokemonGame(game) {
  if (!game) return false;
  const rawTitle = (game.title || game.name || game.fileName || '').toLowerCase();
  const sysKey = (game.systemKey || game.systemCore || '').toLowerCase();
  return rawTitle.includes('gold') || rawTitle.includes('silver') || rawTitle.includes('crystal') || rawTitle.includes('heartgold') || rawTitle.includes('soulsilver') || sysKey === 'gbc';
}

export {
  POKEMON_GAMES,
  NON_CANONICAL_KEYWORDS,
  isPokemonRom,
  identifyPokemonGame
};

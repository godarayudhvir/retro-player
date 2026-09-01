import { resolveAssetPath } from '../../../../../utils/assetPath.js';

export const BADGES = [
  {
    "num": 1,
    "name": "Coal Badge",
    "leader": "Roark",
    "city": "Oreburgh City",
    "type": "Rock",
    "image": "assets/badges/sinnoh/coal.webp"
  },
  {
    "num": 2,
    "name": "Forest Badge",
    "leader": "Gardenia",
    "city": "Eterna City",
    "type": "Grass",
    "image": "assets/badges/sinnoh/forest.webp"
  },
  {
    "num": 3,
    "name": "Cobble Badge",
    "leader": "Maylene",
    "city": "Veilstone City",
    "type": "Fighting",
    "image": "assets/badges/sinnoh/cobble.webp"
  },
  {
    "num": 4,
    "name": "Fen Badge",
    "leader": "Crasher Wake",
    "city": "Pastoria City",
    "type": "Water",
    "image": "assets/badges/sinnoh/fen.webp"
  },
  {
    "num": 5,
    "name": "Relic Badge",
    "leader": "Fantina",
    "city": "Hearthome City",
    "type": "Ghost",
    "image": "assets/badges/sinnoh/relic.webp"
  },
  {
    "num": 6,
    "name": "Mine Badge",
    "leader": "Byron",
    "city": "Canalave City",
    "type": "Steel",
    "image": "assets/badges/sinnoh/mine.webp"
  },
  {
    "num": 7,
    "name": "Icicle Badge",
    "leader": "Candice",
    "city": "Snowpoint City",
    "type": "Ice",
    "image": "assets/badges/sinnoh/icicle.webp"
  },
  {
    "num": 8,
    "name": "Beacon Badge",
    "leader": "Volkner",
    "city": "Sunyshore City",
    "type": "Electric",
    "image": "assets/badges/sinnoh/beacon.webp"
  }
];

export function getBadges() {
  return BADGES.map(b => ({ ...b, image: resolveAssetPath(b.image) }));
}

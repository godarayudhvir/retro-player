import { resolveAssetPath } from '../../../../../utils/assetPath.js';

export const BADGES = [
  {
    "num": 1,
    "name": "Stone Badge",
    "leader": "Roxanne",
    "city": "Rustboro City",
    "type": "Rock",
    "image": "assets/badges/hoenn/stone.webp"
  },
  {
    "num": 2,
    "name": "Knuckle Badge",
    "leader": "Brawly",
    "city": "Dewford Town",
    "type": "Fighting",
    "image": "assets/badges/hoenn/knuckle.webp"
  },
  {
    "num": 3,
    "name": "Dynamo Badge",
    "leader": "Wattson",
    "city": "Mauville City",
    "type": "Electric",
    "image": "assets/badges/hoenn/dynamo.webp"
  },
  {
    "num": 4,
    "name": "Heat Badge",
    "leader": "Flannery",
    "city": "Lavaridge Town",
    "type": "Fire",
    "image": "assets/badges/hoenn/heat.webp"
  },
  {
    "num": 5,
    "name": "Balance Badge",
    "leader": "Norman",
    "city": "Petalburg City",
    "type": "Normal",
    "image": "assets/badges/hoenn/balance.webp"
  },
  {
    "num": 6,
    "name": "Feather Badge",
    "leader": "Winona",
    "city": "Fortree City",
    "type": "Flying",
    "image": "assets/badges/hoenn/feather.webp"
  },
  {
    "num": 7,
    "name": "Mind Badge",
    "leader": "Tate & Liza",
    "city": "Mossdeep City",
    "type": "Psychic",
    "image": "assets/badges/hoenn/mind.webp"
  },
  {
    "num": 8,
    "name": "Rain Badge",
    "leader": "Wallace",
    "city": "Sootopolis City",
    "type": "Water",
    "image": "assets/badges/hoenn/rain.webp"
  }
];

export function getBadges() {
  return BADGES.map(b => ({ ...b, image: resolveAssetPath(b.image) }));
}

import { resolveAssetPath } from '../../../../../utils/assetPath.js';

export const BADGES = [
  {
    "num": 1,
    "name": "Boulder Badge",
    "leader": "Brock",
    "city": "Pewter City",
    "type": "Rock",
    "image": "assets/badges/kanto/boulder.webp"
  },
  {
    "num": 2,
    "name": "Cascade Badge",
    "leader": "Misty",
    "city": "Cerulean City",
    "type": "Water",
    "image": "assets/badges/kanto/cascade.webp"
  },
  {
    "num": 3,
    "name": "Thunder Badge",
    "leader": "Lt. Surge",
    "city": "Vermilion City",
    "type": "Electric",
    "image": "assets/badges/kanto/thunder.webp"
  },
  {
    "num": 4,
    "name": "Rainbow Badge",
    "leader": "Erika",
    "city": "Celadon City",
    "type": "Grass",
    "image": "assets/badges/kanto/rainbow.webp"
  },
  {
    "num": 5,
    "name": "Soul Badge",
    "leader": "Koga",
    "city": "Fuchsia City",
    "type": "Poison",
    "image": "assets/badges/kanto/soul.webp"
  },
  {
    "num": 6,
    "name": "Marsh Badge",
    "leader": "Sabrina",
    "city": "Saffron City",
    "type": "Psychic",
    "image": "assets/badges/kanto/marsh.webp"
  },
  {
    "num": 7,
    "name": "Volcano Badge",
    "leader": "Blaine",
    "city": "Cinnabar Island",
    "type": "Fire",
    "image": "assets/badges/kanto/volcano.webp"
  },
  {
    "num": 8,
    "name": "Earth Badge",
    "leader": "Giovanni",
    "city": "Viridian City",
    "type": "Ground",
    "image": "assets/badges/kanto/earth.webp"
  }
];

export function getBadges() {
  return BADGES.map(b => ({ ...b, image: resolveAssetPath(b.image) }));
}

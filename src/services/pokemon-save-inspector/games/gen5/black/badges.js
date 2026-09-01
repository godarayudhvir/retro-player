import { resolveAssetPath } from '../../../../../utils/assetPath.js';

export const BADGES = [
  {
    "num": 1,
    "name": "Trio Badge",
    "leader": "Cilan / Chili / Cress",
    "city": "Striaton City",
    "type": "Grass / Fire / Water",
    "image": "assets/badges/unova/trio.webp"
  },
  {
    "num": 2,
    "name": "Basic Badge",
    "leader": "Lenora",
    "city": "Nacrene City",
    "type": "Normal",
    "image": "assets/badges/unova/basic.webp"
  },
  {
    "num": 3,
    "name": "Insect Badge",
    "leader": "Burgh",
    "city": "Castelia City",
    "type": "Bug",
    "image": "assets/badges/unova/insect.webp"
  },
  {
    "num": 4,
    "name": "Bolt Badge",
    "leader": "Elesa",
    "city": "Nimbasa City",
    "type": "Electric",
    "image": "assets/badges/unova/bolt.webp"
  },
  {
    "num": 5,
    "name": "Quake Badge",
    "leader": "Clay",
    "city": "Driftveil City",
    "type": "Ground",
    "image": "assets/badges/unova/quake.webp"
  },
  {
    "num": 6,
    "name": "Jet Badge",
    "leader": "Skyla",
    "city": "Mistralton City",
    "type": "Flying",
    "image": "assets/badges/unova/jet.webp"
  },
  {
    "num": 7,
    "name": "Freeze Badge",
    "leader": "Brycen",
    "city": "Icirrus City",
    "type": "Ice",
    "image": "assets/badges/unova/freeze.webp"
  },
  {
    "num": 8,
    "name": "Legend Badge",
    "leader": "Drayden",
    "city": "Opelucid City",
    "type": "Dragon",
    "image": "assets/badges/unova/legend.webp"
  }
];

export function getBadges() {
  return BADGES.map(b => ({ ...b, image: resolveAssetPath(b.image) }));
}

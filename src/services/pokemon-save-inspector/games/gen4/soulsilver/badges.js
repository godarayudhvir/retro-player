import { resolveAssetPath } from '../../../../../utils/assetPath.js';

export const SILVER_JOHTO_BADGES = [
  { num: 1, name: 'Zephyr Badge', leader: 'Falkner', city: 'Violet City', type: 'Flying', image: resolveAssetPath('assets/badges/johto/zephyr.webp') },
  { num: 2, name: 'Hive Badge', leader: 'Bugsy', city: 'Azalea Town', type: 'Bug', image: resolveAssetPath('assets/badges/johto/hive.webp') },
  { num: 3, name: 'Plain Badge', leader: 'Whitney', city: 'Goldenrod City', type: 'Normal', image: resolveAssetPath('assets/badges/johto/plain.webp') },
  { num: 4, name: 'Fog Badge', leader: 'Morty', city: 'Ecruteak City', type: 'Ghost', image: resolveAssetPath('assets/badges/johto/fog.webp') },
  { num: 5, name: 'Storm Badge', leader: 'Chuck', city: 'Cianwood City', type: 'Fighting', image: resolveAssetPath('assets/badges/johto/storm.webp') },
  { num: 6, name: 'Mineral Badge', leader: 'Jasmine', city: 'Olivine City', type: 'Steel', image: resolveAssetPath('assets/badges/johto/mineral.webp') },
  { num: 7, name: 'Glacier Badge', leader: 'Pryce', city: 'Mahogany Town', type: 'Ice', image: resolveAssetPath('assets/badges/johto/glacier.webp') },
  { num: 8, name: 'Rising Badge', leader: 'Clair', city: 'Blackthorn City', type: 'Dragon', image: resolveAssetPath('assets/badges/johto/rising.webp') }
];

export const SILVER_KANTO_BADGES = [
  { num: 1, name: 'Boulder Badge', leader: 'Brock', city: 'Pewter City', type: 'Rock', image: resolveAssetPath('assets/badges/kanto/boulder.webp') },
  { num: 2, name: 'Cascade Badge', leader: 'Misty', city: 'Cerulean City', type: 'Water', image: resolveAssetPath('assets/badges/kanto/cascade.webp') },
  { num: 3, name: 'Thunder Badge', leader: 'Lt. Surge', city: 'Vermilion City', type: 'Electric', image: resolveAssetPath('assets/badges/kanto/thunder.webp') },
  { num: 4, name: 'Rainbow Badge', leader: 'Erika', city: 'Celadon City', type: 'Grass', image: resolveAssetPath('assets/badges/kanto/rainbow.webp') },
  { num: 5, name: 'Soul Badge', leader: 'Janine', city: 'Fuchsia City', type: 'Poison', image: resolveAssetPath('assets/badges/kanto/soul.webp') },
  { num: 6, name: 'Marsh Badge', leader: 'Sabrina', city: 'Saffron City', type: 'Psychic', image: resolveAssetPath('assets/badges/kanto/marsh.webp') },
  { num: 7, name: 'Volcano Badge', leader: 'Blaine', city: 'Seafoam Islands', type: 'Fire', image: resolveAssetPath('assets/badges/kanto/volcano.webp') },
  { num: 8, name: 'Earth Badge', leader: 'Blue', city: 'Viridian City', type: 'Ground', image: resolveAssetPath('assets/badges/kanto/earth.webp') }
];

export function getBadges() {
  return SILVER_JOHTO_BADGES;
}

export function getKantoBadges() {
  return SILVER_KANTO_BADGES;
}

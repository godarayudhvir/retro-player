import { resolveAssetPath } from '../../../../../utils/assetPath.js';

export const BLACK2_BADGES = [
  { num: 1, name: 'Basic Badge', leader: 'Cheren', city: 'Aspertia City', type: 'Normal', image: resolveAssetPath('assets/badges/unova/basic.webp') },
  { num: 2, name: 'Toxic Badge', leader: 'Roxie', city: 'Virbank City', type: 'Poison', image: resolveAssetPath('assets/badges/unova/trio.webp') },
  { num: 3, name: 'Insect Badge', leader: 'Burgh', city: 'Castelia City', type: 'Bug', image: resolveAssetPath('assets/badges/unova/insect.webp') },
  { num: 4, name: 'Bolt Badge', leader: 'Elesa', city: 'Nimbasa City', type: 'Electric', image: resolveAssetPath('assets/badges/unova/bolt.webp') },
  { num: 5, name: 'Quake Badge', leader: 'Clay', city: 'Driftveil City', type: 'Ground', image: resolveAssetPath('assets/badges/unova/quake.webp') },
  { num: 6, name: 'Jet Badge', leader: 'Skyla', city: 'Mistralton City', type: 'Flying', image: resolveAssetPath('assets/badges/unova/jet.webp') },
  { num: 7, name: 'Legend Badge', leader: 'Drayden', city: 'Opelucid City', type: 'Dragon', image: resolveAssetPath('assets/badges/unova/legend.webp') },
  { num: 8, name: 'Wave Badge', leader: 'Marlon', city: 'Humilau City', type: 'Water', image: resolveAssetPath('assets/badges/unova/freeze.webp') }
];

export function getBadges() {
  return BLACK2_BADGES;
}

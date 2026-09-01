export const GOLD_MILESTONES = [
  {
    id: 'poke_journey_begun',
    title: 'New Bark Departure',
    description: 'Receive your starter companion from Professor Elm in New Bark Town.',
    category: 'pokemon',
    type: 'story',
    icon: 'Compass',
    isPerRom: true
  },
  {
    id: 'poke_hm01',
    title: 'Arbor Day Nightmare',
    description: 'Acquire HM01 Cut from the Charcoal Apprentice in Ilex Forest.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_hm02',
    title: 'Commuter Pass',
    description: 'Acquire HM02 Fly from Chuck’s wife in Cianwood City.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Feather',
    isPerRom: true
  },
  {
    id: 'poke_hm03',
    title: 'Kimono Connoisseur',
    description: 'Acquire HM03 Surf after defeating the 5 Kimono Girls at Ecruteak Dance Theater.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Waves',
    isPerRom: true
  },
  {
    id: 'poke_hm04',
    title: 'Milk Drinker',
    description: 'Acquire HM04 Strength from the sailor in Olivine City café.',
    category: 'pokemon',
    type: 'hm',
    icon: 'PlusCircle',
    isPerRom: true
  },
  {
    id: 'poke_hm05',
    title: 'Sprout Tower Enlightenment',
    description: 'Acquire HM05 Flash from Sage Li atop Sprout Tower in Violet City.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Zap',
    isPerRom: true
  },
  {
    id: 'poke_hm06',
    title: 'Whirlpool Navigator',
    description: 'Acquire HM06 Whirlpool from Lance after raiding the Mahogany Rocket Hideout.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Waves',
    isPerRom: true
  },
  {
    id: 'poke_hm07',
    title: 'Ice Path Hiker',
    description: 'Acquire HM07 Waterfall deep within the frozen caverns of Ice Path.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_hms_master',
    title: 'Johto Swiss Army Knife',
    description: 'Collect all 7 Johto Hidden Machines (HM01 Cut through HM07 Waterfall).',
    category: 'pokemon',
    type: 'hm',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_sprout_tower',
    title: 'Towering Ambition',
    description: 'Defeat Sage Li atop the swaying pillar of Sprout Tower.',
    category: 'pokemon',
    type: 'story',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_sudowoodo_cleared',
    title: 'Tree Pruner',
    description: 'Clear the stubborn strange tree blocking Route 36 using the Squirtbottle.',
    category: 'pokemon',
    type: 'story',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_moomoo_farm',
    title: 'Got Milk?',
    description: 'Nurse the sick Miltank at Route 39 Moomoo Farm back to full health with berries.',
    category: 'pokemon',
    type: 'story',
    icon: 'Heart',
    isPerRom: true
  },
  {
    id: 'poke_lake_of_rage',
    title: 'Seeing Red',
    description: 'Subdue the legendary shiny Red Gyarados rampaging across Lake of Rage and claim the Red Scale.',
    category: 'pokemon',
    type: 'story',
    icon: 'Zap',
    isPerRom: true
  },
  {
    id: 'poke_goldenrod_liberation',
    title: 'Broadcast Interrupted',
    description: 'Liberate Goldenrod Radio Tower from Executive Archer and rescue the Radio Director.',
    category: 'pokemon',
    type: 'story',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_bug_contest',
    title: 'Entomology Champion',
    description: 'Participate in the National Park Bug-Catching Contest and win 1st place Sun Stone.',
    category: 'pokemon',
    type: 'story',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_legendary_beasts',
    title: 'Roamers of Johto',
    description: 'Awaken and capture any of the roaming Legendary Beasts of Johto (Raikou, Entei, or Suicune).',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Zap',
    isPerRom: true
  },
  {
    id: 'poke_tower_duo',
    title: 'Wings of Legend (Ho-Oh)',
    description: 'Ascend Tin Tower with the Rainbow Wing and capture the legendary guardian Ho-Oh.',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Crown',
    isPerRom: true
  },
  {
    id: 'poke_eight_badges',
    title: 'Johto League Qualified',
    description: 'Assemble all 8 Johto Gym Badges and qualify for the Silver Conference.',
    category: 'pokemon',
    type: 'league',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_hall_of_fame',
    title: 'Silver Conference Champion',
    description: 'Defeat the Elite Four and Champion Lance at the Indigo Plateau.',
    category: 'pokemon',
    type: 'league',
    icon: 'Trophy',
    isPerRom: true
  },
  {
    id: 'poke_sixteen_badges',
    title: 'Dual-Region Master (16 Badges)',
    description: 'Conquer both the Johto and Kanto Regional Leagues by collecting all 16 Gym Badges.',
    category: 'pokemon',
    type: 'league',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_champion_red',
    title: 'Living Legend',
    description: 'Ascend the freezing summit of Mt. Silver and defeat Pokémon Trainer Red.',
    category: 'pokemon',
    type: 'league',
    icon: 'Trophy',
    isPerRom: true
  }
];

export function getMilestones() {
  return GOLD_MILESTONES;
}

export const DIAMOND_MILESTONES = [
  {
    id: 'poke_journey_begun',
    title: 'Twinleaf Departure',
    description: 'Defend against wild Starly with Professor Rowan’s briefcase starter at Lake Verity.',
    category: 'pokemon',
    type: 'story',
    icon: 'Compass',
    isPerRom: true
  },
  {
    id: 'poke_valley_windworks',
    title: 'Renewable Energy Saved',
    description: 'Defeat Commander Mars at the Valley Windworks and restore electrical power.',
    category: 'pokemon',
    type: 'story',
    icon: 'Zap',
    isPerRom: true
  },
  {
    id: 'poke_fossil_revival',
    title: 'Sinnoh Paleontology',
    description: 'Excavate a Skull Fossil from the Underground and revive Cranidos in Oreburgh City.',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Star',
    isPerRom: true
  },
  {
    id: 'poke_galactic_hq',
    title: 'Galactic HQ Liberation',
    description: 'Raid Team Galactic HQ in Veilstone City, defeat Cyrus, and liberate the Lake Guardians.',
    category: 'pokemon',
    type: 'story',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_spear_pillar',
    title: 'Rift at Spear Pillar',
    description: 'Scale Mt. Coronet and defeat Commanders Mars and Jupiter alongside Barry at Spear Pillar.',
    category: 'pokemon',
    type: 'story',
    icon: 'Sparkles',
    isPerRom: true
  },
  {
    id: 'poke_dialga',
    title: 'Lord of Time',
    description: 'Brave the temporal rift atop Spear Pillar and capture the legendary dragon Dialga.',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Crown',
    isPerRom: true
  },
  {
    id: 'poke_lake_guardians',
    title: 'Guardians of the Spirit',
    description: 'Capture the legendary trio of emotion, knowledge, and willpower (Mesprit, Uxie, Azelf).',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Shield',
    isPerRom: true
  },
  {
    id: 'poke_heatran',
    title: 'Magma Core',
    description: 'Explore the volcanic interior of Stark Mountain with Buck and capture Heatran.',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Flame',
    isPerRom: true
  },
  {
    id: 'poke_cresselia',
    title: 'Lunar Dreams',
    description: 'Sail to Fullmoon Island, retrieve the Lunar Wing, and encounter legendary Cresselia.',
    category: 'pokemon',
    type: 'legendary',
    icon: 'Sparkles',
    isPerRom: true
  },
  {
    id: 'poke_hm01',
    title: 'Property Damage License (Cut)',
    description: 'Acquire HM01 Cut from Cynthia in Eterna City.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_hm02',
    title: 'Frequent Flyer Miles (Fly)',
    description: 'Acquire HM02 Fly from the Galactic Warehouse in Veilstone City.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Feather',
    isPerRom: true
  },
  {
    id: 'poke_hm03',
    title: 'No Lifeguard on Duty (Surf)',
    description: 'Acquire HM03 Surf from Cynthia’s grandmother in Celestic Town.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Waves',
    isPerRom: true
  },
  {
    id: 'poke_hm04',
    title: 'Do You Even Lift (Strength)',
    description: 'Acquire HM04 Strength atop the Lost Tower on Route 209.',
    category: 'pokemon',
    type: 'hm',
    icon: 'PlusCircle',
    isPerRom: true
  },
  {
    id: 'poke_hm05',
    title: 'Dense Mist Clearer (Defog)',
    description: 'Acquire HM05 Defog inside the Great Marsh Safari Zone.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Eye',
    isPerRom: true
  },
  {
    id: 'poke_hm06',
    title: 'Geological Demolition (Rock Smash)',
    description: 'Acquire HM06 Rock Smash from the hiker in Oreburgh Gate.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_hm07',
    title: 'Vertical Ascent (Waterfall)',
    description: 'Acquire HM07 Waterfall from Jasmine in Sunyshore City.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Waves',
    isPerRom: true
  },
  {
    id: 'poke_hm08',
    title: 'Cliffhanger Mountaineer (Rock Climb)',
    description: 'Acquire HM08 Rock Climb on Route 217 in the blizzard.',
    category: 'pokemon',
    type: 'hm',
    icon: 'Activity',
    isPerRom: true
  },
  {
    id: 'poke_hms_master',
    title: 'Sinnoh Mountaineer',
    description: 'Collect all 8 Sinnoh Hidden Machines (HM01 Cut through HM08 Rock Climb).',
    category: 'pokemon',
    type: 'hm',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_eight_badges',
    title: 'Sinnoh League Qualified',
    description: 'Assemble all 8 Sinnoh Gym Badges by defeating Volkner in Sunyshore City.',
    category: 'pokemon',
    type: 'league',
    icon: 'Award',
    isPerRom: true
  },
  {
    id: 'poke_hall_of_fame',
    title: 'Sinnoh League Champion',
    description: 'Defeat the Elite Four and Champion Cynthia to claim the Sinnoh League Championship.',
    category: 'pokemon',
    type: 'league',
    icon: 'Trophy',
    isPerRom: true
  }
];

export function getMilestones() {
  return DIAMOND_MILESTONES;
}

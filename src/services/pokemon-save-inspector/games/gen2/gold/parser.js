/**
 * Dedicated Pokémon Gold Version Save Parser (Game Boy Color - 32 KB SRAM).
 */
import { countSetBits, readUint24BE } from '../../../binaryUtils.js';

export function parsePokemonGold(data) {
  if (!data || data.length < 0x8000) return null;

  // Gold Checksum: 16-bit word at 0x2D69 (sum of bytes 0x2009 to 0x2D68)
  let sum = 0;
  for (let i = 0x2009; i <= 0x2D68; i++) {
    sum = (sum + data[i]) & 0xFFFF;
  }
  const expectedChecksum = (data[0x2D6A] << 8) | data[0x2D69];
  const isValidChecksum = sum === expectedChecksum;

  // Reject uninitialized memory
  if (!isValidChecksum && (data[0x2009] === 0xFF || data[0x2009] === 0x00)) {
    return null;
  }

  // Johto Badges at 0x23E3, Kanto Badges at 0x23E4
  const johtoBadgesByte = data[0x23E3] || 0;
  const kantoBadgesByte = data[0x23E4] || 0;

  const johtoBadges = [
    Boolean(johtoBadgesByte & 0x01), // Zephyr
    Boolean(johtoBadgesByte & 0x02), // Hive
    Boolean(johtoBadgesByte & 0x04), // Plain
    Boolean(johtoBadgesByte & 0x08), // Fog
    Boolean(johtoBadgesByte & 0x10), // Storm
    Boolean(johtoBadgesByte & 0x20), // Mineral
    Boolean(johtoBadgesByte & 0x40), // Glacier
    Boolean(johtoBadgesByte & 0x80)  // Rising
  ];
  const johtoBadgeCount = johtoBadges.filter(Boolean).length;

  const kantoBadges = [
    Boolean(kantoBadgesByte & 0x01), // Boulder
    Boolean(kantoBadgesByte & 0x02), // Cascade
    Boolean(kantoBadgesByte & 0x04), // Thunder
    Boolean(kantoBadgesByte & 0x08), // Rainbow
    Boolean(kantoBadgesByte & 0x10), // Soul
    Boolean(kantoBadgesByte & 0x20), // Marsh
    Boolean(kantoBadgesByte & 0x40), // Volcano
    Boolean(kantoBadgesByte & 0x80)  // Earth
  ];
  const kantoBadgeCount = kantoBadges.filter(Boolean).length;
  const totalBadgeCount = johtoBadgeCount + kantoBadgeCount;
  const has16Badges = johtoBadgeCount === 8 && kantoBadgeCount === 8;

  // Money at 0x23DB (3-byte big-endian)
  const money = readUint24BE(data, 0x23DB);

  // Pokédex Owned: 0x2A27 - 0x2A46 (32 bytes = 256 flags)
  const pokedexCaught = countSetBits(data, 0x2A27, 32);

  // Party Count at 0x288A, Structs at 0x2892
  const rawPartyCount = data[0x288A] || 0;
  const partyCount = (rawPartyCount >= 1 && rawPartyCount <= 6) ? rawPartyCount : 0;

  let maxPartyLevel = 0;
  let hasShiny = false;
  let hasPokerus = false;
  let hasLegendary = false;
  let hasFossil = false;

  const gen2Legends = [243, 244, 245, 249, 250, 251, 144, 145, 146, 150, 151];
  const gen2Fossils = [138, 139, 140, 141, 142];

  for (let p = 0; p < partyCount; p++) {
    const entryOffset = 0x2892 + (p * 48);
    if (entryOffset + 48 <= data.length) {
      const species = data[entryOffset];
      const level = data[entryOffset + 0x1F];
      const iv1 = data[entryOffset + 0x15];
      const iv2 = data[entryOffset + 0x16];
      const pokerusByte = data[entryOffset + 0x1C];

      if (level > maxPartyLevel && level <= 100) maxPartyLevel = level;
      if (gen2Legends.includes(species)) hasLegendary = true;
      if (gen2Fossils.includes(species)) hasFossil = true;
      if (pokerusByte > 0) hasPokerus = true;

      // Gen 2 Shiny formula
      const atk = (iv1 >> 4) & 0xF;
      const def = iv1 & 0xF;
      const spd = (iv2 >> 4) & 0xF;
      const spc = iv2 & 0xF;
      if (def === 10 && spd === 10 && spc === 10 && [2, 3, 6, 7, 10, 11, 14, 15].includes(atk)) {
        hasShiny = true;
      }
    }
  }

  // Pokédex Helper
  function isDexCaught(num) {
    if (num < 1 || num > 251) return false;
    const byteOffset = 0x2A27 + Math.floor((num - 1) / 8);
    const bitOffset = (num - 1) % 8;
    return Boolean(data[byteOffset] & (1 << bitOffset));
  }

  // Party Species & Moves
  const partySpeciesList = [];
  const partyMoves = new Set();
  for (let p = 0; p < partyCount; p++) {
    const entryOffset = 0x2892 + (p * 48);
    if (entryOffset + 48 <= data.length) {
      const species = data[entryOffset];
      partySpeciesList.push(species);
      for (let m = 0; m < 4; m++) {
        const move = data[entryOffset + 0x0C + m];
        if (move > 0) partyMoves.add(move);
      }
    }
  }

  // Inventory scanning across Gen 2 pockets (0x2410 - 0x24B0)
  const keyItemsSet = new Set();
  for (let i = 0x2410; i <= 0x24B0; i++) {
    const val = data[i];
    if (val > 0 && val !== 0xFF) keyItemsSet.add(val);
  }

  // HMs in Gen 2 (Items in TM/HM pocket or Move known in party)
  // HM01 Cut: 0xF3 (move 15), HM02 Fly: 0xF4 (move 19), HM03 Surf: 0xF5 (move 57),
  // HM04 Strength: 0xF6 (move 70), HM05 Flash: 0xF7 (move 148), HM06 Whirlpool: 0xF8 (move 250), HM07 Waterfall: 0xF9 (move 127)
  const hasHM01 = keyItemsSet.has(0xF3) || partyMoves.has(15);
  const hasHM02 = keyItemsSet.has(0xF4) || partyMoves.has(19);
  const hasHM03 = keyItemsSet.has(0xF5) || partyMoves.has(57);
  const hasHM04 = keyItemsSet.has(0xF6) || partyMoves.has(70);
  const hasHM05 = keyItemsSet.has(0xF7) || partyMoves.has(148);
  const hasHM06 = keyItemsSet.has(0xF8) || partyMoves.has(250);
  const hasHM07 = keyItemsSet.has(0xF9) || partyMoves.has(127);
  const hasAllHMs = hasHM01 && hasHM02 && hasHM03 && hasHM04 && hasHM05 && hasHM06 && hasHM07;

  // Gen 2 Legendaries
  const hasRaikou = isDexCaught(243) || partySpeciesList.includes(243);
  const hasEntei = isDexCaught(244) || partySpeciesList.includes(244);
  const hasSuicune = isDexCaught(245) || partySpeciesList.includes(245);
  const hasLugia = isDexCaught(249) || partySpeciesList.includes(249);
  const hasHoOh = isDexCaught(250) || partySpeciesList.includes(250);
  const hasCelebi = isDexCaught(251) || partySpeciesList.includes(251);
  const hasBeasts = hasRaikou || hasEntei || hasSuicune;
  const hasTowerDuo = hasHoOh || hasLugia;

  // Fossils
  const hasOmanyte = isDexCaught(138) || isDexCaught(139) || partySpeciesList.includes(138) || partySpeciesList.includes(139);
  const hasKabuto = isDexCaught(140) || isDexCaught(141) || partySpeciesList.includes(140) || partySpeciesList.includes(141);
  const hasAerodactyl = isDexCaught(142) || partySpeciesList.includes(142);
  const hasAnyFossil = hasFossil || hasOmanyte || hasKabuto || hasAerodactyl;

  // Action Story Events & Boss Battles
  const hasClearedSudowoodo = isDexCaught(185) || partySpeciesList.includes(185) || johtoBadgeCount >= 3 || keyItemsSet.has(0x40);
  const hasLakeOfRage = isDexCaught(130) || keyItemsSet.has(0x27) || johtoBadgeCount >= 7; // Red Scale (0x27)
  const hasLiberatedRadioTower = johtoBadgeCount >= 8 || keyItemsSet.has(0x45) || keyItemsSet.has(0x46); // Clear Bell / Silver Wing
  const hasSproutTower = johtoBadgeCount >= 1 || hasHM05;
  const hasMoomooFarm = johtoBadgeCount >= 4 || keyItemsSet.has(0x54); // Moomoo Milk / healed
  const hasBugContest = isDexCaught(123) || isDexCaught(127) || keyItemsSet.has(0x16); // Scyther / Pinsir / Sun Stone (0x16)
  const hasDefeatedRed = has16Badges;

  const hasValidTrainer = data[0x200B] !== 0x00 && data[0x200B] !== 0xFF && data[0x200B] !== 0x50;
  const hasStarter = (partyCount > 0 || pokedexCaught > 0) || totalBadgeCount > 0;

  return {
    isPokemon: true,
    generation: 2,
    gameCode: 'GOLD',
    isValidChecksum,
    money: money > 999999 ? 0 : money,
    badges: johtoBadges,
    badgeCount: johtoBadgeCount,
    hasAllBadges: johtoBadgeCount === 8,
    johtoBadges,
    johtoBadgeCount,
    kantoBadges,
    kantoBadgeCount,
    totalBadgeCount,
    has16Badges,
    pokedexCaught,
    partyCount,
    maxPartyLevel,
    hasLevel100: maxPartyLevel >= 100,
    hasStarter,
    hasFirstCatch: pokedexCaught >= 2,
    hasFullParty: partyCount >= 6,
    hasShiny,
    hasPokerus,
    hasLegendary: hasLegendary || pokedexCaught >= 240,
    hasFossil: hasAnyFossil,
    fossils: {
      hasAnyFossil,
      omanyte: hasOmanyte,
      kabuto: hasKabuto,
      aerodactyl: hasAerodactyl
    },
    hms: {
      hm01: hasHM01,
      hm02: hasHM02,
      hm03: hasHM03,
      hm04: hasHM04,
      hm05: hasHM05,
      hm06: hasHM06,
      hm07: hasHM07,
      hasAllHMs
    },
    legendaries: {
      hasBeasts,
      hasTowerDuo,
      raikou: hasRaikou,
      entei: hasEntei,
      suicune: hasSuicune,
      hoOh: hasHoOh,
      lugia: hasLugia,
      celebi: hasCelebi
    },
    events: {
      sudowoodoCleared: hasClearedSudowoodo,
      lakeOfRage: hasLakeOfRage,
      goldenrodLiberated: hasLiberatedRadioTower,
      sproutTower: hasSproutTower,
      moomooFarm: hasMoomooFarm,
      bugContest: hasBugContest,
      championRed: hasDefeatedRed
    },
    hallOfFameCount: johtoBadgeCount === 8 ? 1 : 0,
    isChampion: johtoBadgeCount === 8,
    isHighRoller: money >= 999999,
    hasPikaFriend: false,
    keyItems: {
      bicycle: keyItemsSet.has(0x07),
      oldRod: keyItemsSet.has(0x3C),
      goodRod: keyItemsSet.has(0x3D),
      superRod: keyItemsSet.has(0x3E),
      itemfinder: keyItemsSet.has(0x36),
      pokeFlute: keyItemsSet.has(0x28) || keyItemsSet.has(0x56),
      scope: false,
      expShare: keyItemsSet.has(0x96) || data.includes(0x96),
      townMap: hasValidTrainer,
      masterBall: keyItemsSet.has(0x01)
    }
  };
}

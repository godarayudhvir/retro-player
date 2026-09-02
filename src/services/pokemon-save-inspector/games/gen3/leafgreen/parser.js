/**
 * Dedicated Pokémon LeafGreen Version Save Parser (GBA - 64 KB / 128 KB Flash).
 * 100% self-contained parser.
 */
import { countSetBits, readUint16LE, readUint32LE } from '../../../binaryUtils.js';

const GEN3_ORDER_TABLE = [
  [0,1,2,3], [0,1,3,2], [0,2,1,3], [0,2,3,1], [0,3,1,2], [0,3,2,1],
  [1,0,2,3], [1,0,3,2], [1,2,0,3], [1,2,3,0], [1,3,0,2], [1,3,2,0],
  [2,0,1,3], [2,0,3,1], [2,1,0,3], [2,1,3,0], [2,3,0,1], [2,3,1,0],
  [3,0,1,2], [3,0,2,1], [3,1,0,2], [3,1,2,0], [3,2,0,1], [3,2,1,0]
];

const GEN3_LEGENDS = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386];
const GEN3_FOSSILS = [138, 139, 140, 141, 142, 345, 346, 347, 348];

function validateGen3SectionChecksum(data, sOffset) {
  const magic = readUint32LE(data, sOffset + 4088);
  if (magic !== 0x08012025) return false;

  let sum = 0;
  for (let i = 0; i < 996; i++) {
    const word = readUint32LE(data, sOffset + (i * 4));
    sum = (sum + word) >>> 0;
  }
  const calculated = ((sum >>> 16) + (sum & 0xFFFF)) & 0xFFFF;
  const stored = readUint16LE(data, sOffset + 4086);
  return calculated === stored;
}

function getActiveSections(data) {
  if (!data || data.length < 0x10000) return null;

  let slot1Index = -1;
  let slot2Index = -1;
  const slot1Sections = {};
  const slot2Sections = {};
  let slot1ValidCount = 0;
  let slot2ValidCount = 0;

  for (let s = 0; s < 14; s++) {
    const sOffset = s * 4096;
    const secId = readUint16LE(data, sOffset + 4084);
    const saveIdx = readUint32LE(data, sOffset + 4092);
    if (secId >= 0 && secId <= 13) {
      if (validateGen3SectionChecksum(data, sOffset)) {
        slot1Sections[secId] = sOffset;
        slot1ValidCount++;
        if (saveIdx > slot1Index) slot1Index = saveIdx;
      }
    }
  }

  if (data.length >= 0x1C000) {
    for (let s = 0; s < 14; s++) {
      const sOffset = 0xE000 + (s * 4096);
      const secId = readUint16LE(data, sOffset + 4084);
      const saveIdx = readUint32LE(data, sOffset + 4092);
      if (secId >= 0 && secId <= 13) {
        if (validateGen3SectionChecksum(data, sOffset)) {
          slot2Sections[secId] = sOffset;
          slot2ValidCount++;
          if (saveIdx > slot2Index) slot2Index = saveIdx;
        }
      }
    }
  }

  if (slot1ValidCount === 0 && slot2ValidCount === 0) return null;

  if (slot2ValidCount > slot1ValidCount || (slot2ValidCount >= 2 && slot2Index > slot1Index)) {
    return slot2Sections;
  }
  return slot1Sections;
}

export function parsePokemonLeafGreen(data) {
  const activeSections = getActiveSections(data);
  if (!activeSections) return null;

  // Section 0: Trainer Info (FRLG security key at sec0 + 0x0AF8)
  let money = 0;
  let hasValidTrainer = false;
  let pokedexCaught = 0;
  const sec0 = activeSections[0];
  if (sec0 !== undefined) {
    if (data[sec0] !== 0x00 && data[sec0] !== 0xFF) hasValidTrainer = true;
    const rawMoney = readUint32LE(data, sec0 + 0x0490);
    const securityKey = readUint32LE(data, sec0 + 0x0AF8);
    money = (rawMoney ^ securityKey) >>> 0;
    if (money > 999999) money = 0;

    const rawDex = countSetBits(data, sec0 + 0x0028, 32);
    pokedexCaught = Math.min(386, rawDex);
  }

  // Section 1: Team & Party (FRLG party at sec1 + 0x0034, structs at 0x0038)
  let partyCount = 0;
  let maxPartyLevel = 0;
  let hasShiny = false;
  let hasPokerus = false;
  let hasLegendary = false;
  let hasFossil = false;

  const sec1 = activeSections[1];
  if (sec1 !== undefined) {
    const rawPartyCount = data[sec1 + 0x0034] || 0;
    partyCount = (rawPartyCount >= 1 && rawPartyCount <= 6) ? rawPartyCount : 0;
    const partyStart = sec1 + 0x0038;

    for (let p = 0; p < partyCount; p++) {
      const pOffset = partyStart + (p * 100);
      if (pOffset + 100 <= data.length) {
        const personality = readUint32LE(data, pOffset);
        const otId = readUint32LE(data, pOffset + 4);
        const level = data[pOffset + 84];
        if (level > maxPartyLevel && level <= 100) maxPartyLevel = level;

        const p1 = personality & 0xFFFF;
        const p2 = (personality >>> 16) & 0xFFFF;
        const id1 = otId & 0xFFFF;
        const id2 = (otId >>> 16) & 0xFFFF;
        if (((id1 ^ id2) ^ (p1 ^ p2)) < 8 && personality > 0) hasShiny = true;

        const key = (personality ^ otId) >>> 0;
        const order = GEN3_ORDER_TABLE[(personality >>> 0) % 24] || [0, 1, 2, 3];
        const decrypted = new Uint8Array(48);
        for (let w = 0; w < 12; w++) {
          const encWord = readUint32LE(data, pOffset + 32 + (w * 4));
          const decWord = (encWord ^ key) >>> 0;
          decrypted[w * 4] = decWord & 0xFF;
          decrypted[w * 4 + 1] = (decWord >>> 8) & 0xFF;
          decrypted[w * 4 + 2] = (decWord >>> 16) & 0xFF;
          decrypted[w * 4 + 3] = (decWord >>> 24) & 0xFF;
        }

        const growthOffset = (order.indexOf(0)) * 12;
        const species = decrypted[growthOffset] | (decrypted[growthOffset + 1] << 8);
        if (GEN3_LEGENDS.includes(species)) hasLegendary = true;
        if (GEN3_FOSSILS.includes(species)) hasFossil = true;

        const miscOffset = (order.indexOf(3)) * 12;
        if (decrypted[miscOffset] > 0) hasPokerus = true;
      }
    }
  }

  // Section 2: Kanto Badges
  const sec2 = activeSections[2];
  let badges = [false, false, false, false, false, false, false, false];
  let badgeCount = 0;
  if (sec2 !== undefined) {
    const rawFlags = readUint16LE(data, sec2 + 0x0118);
    for (let b = 0; b < 8; b++) {
      if (rawFlags & (1 << (7 + b))) {
        badges[b] = true;
        badgeCount++;
      }
    }
  }

  const hasStarter = partyCount > 0;

  return {
    isPokemon: true,
    generation: 3,
    gameCode: 'LEAFGREEN',
    money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    pokedexCaught,
    partyCount,
    maxPartyLevel,
    hasLevel100: maxPartyLevel >= 100,
    hasStarter,
    hasFirstCatch: pokedexCaught >= 2,
    hasFullParty: partyCount >= 6,
    hasShiny,
    hasPokerus,
    hasLegendary: hasLegendary || pokedexCaught >= 180,
    hasFossil: hasFossil || pokedexCaught >= 10,
    hallOfFameCount: badgeCount >= 8 ? 1 : 0,
    isChampion: badgeCount === 8,
    isHighRoller: money >= 999999,
    hasPikaFriend: false,
    hms: {
      hm01: badgeCount >= 2,
      hm02: badgeCount >= 4,
      hm03: badgeCount >= 5,
      hm04: badgeCount >= 5,
      hm05: badgeCount >= 2,
      hm06: badgeCount >= 7,
      hm07: badgeCount >= 7,
      hasAllHMs: badgeCount >= 7
    },
    events: {
      nuggetBridgeCleared: badgeCount >= 1,
      ssAnneDeparted: badgeCount >= 2,
      ghostMarowakCalmed: badgeCount >= 4,
      snorlaxCleared: badgeCount >= 4,
      silphCoLiberated: badgeCount >= 6,
      seviiLostelle: badgeCount >= 7,
      rubySapphirePlates: badgeCount >= 8,
      rocketWarehouse: badgeCount >= 8
    },
    legendaries: {
      hasAllBirds: hasLegendary || badgeCount >= 8,
      mewtwo: hasLegendary || badgeCount >= 8,
      roamingBeast: hasLegendary || badgeCount >= 8
    },
    keyItems: {
      bicycle: badgeCount >= 3,
      oldRod: badgeCount >= 2 || pokedexCaught >= 5,
      goodRod: badgeCount >= 3,
      superRod: badgeCount >= 6,
      itemfinder: badgeCount >= 3,
      pokeFlute: badgeCount >= 4,
      scope: badgeCount >= 4,
      expShare: badgeCount >= 1 || pokedexCaught >= 10,
      townMap: hasValidTrainer,
      masterBall: badgeCount >= 7
    }
  };
}

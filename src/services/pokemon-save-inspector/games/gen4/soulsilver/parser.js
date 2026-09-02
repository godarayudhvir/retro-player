/**
 * Dedicated Pokémon SoulSilver Version Save Parser (NDS - 512 KB Flash).
 * 100% self-contained parser.
 */
import { readUint16LE, readUint32LE, calculateCRC16, decodeGen4String } from '../../../binaryUtils.js';

const LAYOUT = {
  smallSize: 0xF628,
  smallDataLen: 0xF618,
  smallCountOff: 0xF620,
  smallCrcOff: 0xF626,
  nameOff: 0x64,
  tidOff: 0x74,
  sidOff: 0x76,
  moneyOff: 0x78,
  badgeOff: 0x7C,
  kantoBadgeOff: 0x7D
};

function getActiveSlot(data) {
  let activeSlot = -1;
  let maxCount = -1;

  for (const slot of [0, 0x40000]) {
    const storedCrc = readUint16LE(data, slot + LAYOUT.smallCrcOff);
    const calcCrc = calculateCRC16(data, slot, LAYOUT.smallDataLen);
    const count = readUint32LE(data, slot + LAYOUT.smallCountOff);

    if (storedCrc === calcCrc && storedCrc !== 0 && count !== 0xFFFFFFFF) {
      if (count > maxCount) {
        maxCount = count;
        activeSlot = slot;
      }
    }
  }

  return activeSlot === -1 ? 0 : activeSlot;
}

export function parsePokemonSoulSilver(data) {
  if (!data || data.length < 524288) return null;

  const activeSlot = getActiveSlot(data);
  const trainerName = decodeGen4String(data, activeSlot + LAYOUT.nameOff, 16);
  const trainerId = readUint16LE(data, activeSlot + LAYOUT.tidOff);
  const money = readUint32LE(data, activeSlot + LAYOUT.moneyOff);

  // Johto Badges at 0x7C
  const badges = [false, false, false, false, false, false, false, false];
  let badgeCount = 0;
  const badgeByte = data[activeSlot + LAYOUT.badgeOff] || 0;

  for (let b = 0; b < 8; b++) {
    if (badgeByte & (1 << b)) {
      badges[b] = true;
      badgeCount++;
    }
  }

  // Kanto Badges at 0x7D
  const kantoBadges = [false, false, false, false, false, false, false, false];
  let kantoBadgeCount = 0;
  const kantoByte = data[activeSlot + LAYOUT.kantoBadgeOff] || 0;

  for (let b = 0; b < 8; b++) {
    if (kantoByte & (1 << b)) {
      kantoBadges[b] = true;
      kantoBadgeCount++;
    }
  }

  const totalBadgeCount = badgeCount + kantoBadgeCount;
  const has16Badges = totalBadgeCount >= 16;
  const isChampion = has16Badges || badgeCount >= 8;

  return {
    isPokemon: true,
    generation: 4,
    gameCode: 'SOULSILVER',
    trainerName,
    trainerId,
    money: money > 999999 ? 0 : money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    hasStarter: (data[activeSlot + 0x9C] >= 1 && data[activeSlot + 0x9C] <= 6) || badgeCount > 0,
    hasFirstCatch: badgeCount >= 1,
    hasFullParty: (data[activeSlot + 0x9C] >= 6) || badgeCount >= 2,
    hms: {
      hm01: badgeCount >= 2,
      hm02: badgeCount >= 5,
      hm03: badgeCount >= 4,
      hm04: badgeCount >= 4,
      hm05: badgeCount >= 1,
      hm06: badgeCount >= 7,
      hm07: badgeCount >= 8,
      hm08: totalBadgeCount >= 16,
      hasAllHMs: totalBadgeCount >= 16
    },
    events: {
      sproutTower: badgeCount >= 1,
      sudowoodoCleared: badgeCount >= 3,
      moomooFarm: badgeCount >= 4,
      lakeOfRage: badgeCount >= 7,
      goldenrodLiberated: badgeCount >= 8,
      kimonoTrial: badgeCount >= 8,
      suicuneTracking: badgeCount >= 8,
      pokeathlonChampion: badgeCount >= 3,
      championRed: has16Badges
    },
    legendaries: {
      lugia: badgeCount >= 8,
      hasBeasts: badgeCount >= 4
    },
    kantoBadges,
    totalBadgeCount,
    has16Badges,
    isChampion
  };
}

/**
 * Dedicated Pokémon Pearl Version Save Parser (NDS - 512 KB Flash).
 * 100% self-contained parser.
 */
import { readUint16LE, readUint32LE, calculateCRC16, decodeGen4String } from '../../../binaryUtils.js';

const LAYOUT = {
  smallSize: 0xC100,
  smallDataLen: 0xC0EC,
  smallCountOff: 0xC0F4,
  smallCrcOff: 0xC0FE,
  nameOff: 0x64,
  tidOff: 0x74,
  sidOff: 0x76,
  moneyOff: 0x78,
  badgeOff: 0x7C
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

export function parsePokemonPearl(data) {
  if (!data || data.length < 524288) return null;

  const activeSlot = getActiveSlot(data);
  const trainerName = decodeGen4String(data, activeSlot + LAYOUT.nameOff, 16);
  const trainerId = readUint16LE(data, activeSlot + LAYOUT.tidOff);
  const money = readUint32LE(data, activeSlot + LAYOUT.moneyOff);

  const badges = [false, false, false, false, false, false, false, false];
  let badgeCount = 0;
  const badgeByte = data[activeSlot + LAYOUT.badgeOff] || 0;

  for (let b = 0; b < 8; b++) {
    if (badgeByte & (1 << b)) {
      badges[b] = true;
      badgeCount++;
    }
  }

  const isChampion = badgeCount >= 8;

  return {
    isPokemon: true,
    generation: 4,
    gameCode: 'PEARL',
    trainerName,
    trainerId,
    money: money > 999999 ? 0 : money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    hasStarter: (data[activeSlot + 0x9C] >= 1 && data[activeSlot + 0x9C] <= 6) || badgeCount > 0,
    hasFirstCatch: badgeCount >= 1,
    hasFullParty: (data[activeSlot + 0x9C] >= 6) || badgeCount >= 2,
    hasFossil: badgeCount >= 2,
    hms: {
      hm01: badgeCount >= 1,
      hm02: badgeCount >= 2,
      hm03: badgeCount >= 5,
      hm04: badgeCount >= 6,
      hm05: badgeCount >= 4,
      hm06: badgeCount >= 6,
      hm07: badgeCount >= 8,
      hm08: badgeCount >= 7,
      hasAllHMs: badgeCount >= 8
    },
    events: {
      valleyWindworks: badgeCount >= 1,
      galacticHq: badgeCount >= 7,
      spearPillar: badgeCount >= 7
    },
    legendaries: {
      palkia: badgeCount >= 7,
      lakeGuardians: badgeCount >= 7,
      heatran: badgeCount >= 8,
      cresselia: badgeCount >= 8
    },
    kantoBadges: null,
    totalBadgeCount: badgeCount,
    has16Badges: false,
    isChampion
  };
}

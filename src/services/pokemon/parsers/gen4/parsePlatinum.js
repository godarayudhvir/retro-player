/**
 * Dedicated Pokémon Platinum Version Save Parser (NDS - 512 KB Flash).
 * 100% self-contained parser.
 */
import { readUint16LE, readUint32LE, calculateCRC16, decodeGen4String } from '../../binaryUtils.js';

const LAYOUT = {
  smallSize: 0xCF2C,
  smallDataLen: 0xCF18,
  smallCountOff: 0xCF20,
  smallCrcOff: 0xCF2A,
  nameOff: 0x68,
  tidOff: 0x78,
  sidOff: 0x7A,
  moneyOff: 0x7C,
  badgeOff: 0x80
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

export function parsePokemonPlatinum(data) {
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
    gameCode: 'PLATINUM',
    trainerName,
    trainerId,
    money: money > 999999 ? 0 : money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    hasStarter: Boolean(trainerName && trainerName.length > 0) || badgeCount > 0,
    kantoBadges: null,
    totalBadgeCount: badgeCount,
    has16Badges: false,
    isChampion
  };
}

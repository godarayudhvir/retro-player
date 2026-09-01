/**
 * Dedicated Pokémon HeartGold Version Save Parser (NDS - 512 KB Flash).
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

export function parsePokemonHeartGold(data) {
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
    gameCode: 'HEARTGOLD',
    trainerName,
    trainerId,
    money: money > 999999 ? 0 : money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    hasStarter: Boolean(trainerName && trainerName.length > 0) || totalBadgeCount > 0,
    kantoBadges,
    totalBadgeCount,
    has16Badges,
    isChampion
  };
}

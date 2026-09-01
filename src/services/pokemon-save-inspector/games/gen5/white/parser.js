/**
 * Dedicated Pokémon White Version Save Parser (NDS - 512 KB Flash).
 * 100% self-contained parser.
 */
import { decodeGen4String, readUint16LE, readUint32LE } from '../../../binaryUtils.js';

export function parsePokemonWhite(data) {
  if (!data || data.length < 524288) return null;

  // In Pokémon White 1: Block 23 (Trainer Info) is located at offset 0x19400 (Slot 1) / 0x3D400 (Slot 2)
  let activeSlot = 0x19400;

  let trainerName = decodeGen4String(data, activeSlot + 0x04, 16);
  let trainerId = readUint16LE(data, activeSlot + 0x14);
  let money = readUint32LE(data, activeSlot + 0x18);
  let badgeByte = data[activeSlot + 0x24] || 0;

  // Fallback to secondary slot if primary is uninitialized
  if (!trainerName || trainerName.length === 0 || trainerName === '???') {
    activeSlot = 0x3D400;
    trainerName = decodeGen4String(data, activeSlot + 0x04, 16);
    trainerId = readUint16LE(data, activeSlot + 0x14);
    money = readUint32LE(data, activeSlot + 0x18);
    badgeByte = data[activeSlot + 0x24] || 0;
  }

  const badges = [false, false, false, false, false, false, false, false];
  let badgeCount = 0;
  for (let b = 0; b < 8; b++) {
    if (badgeByte & (1 << b)) {
      badges[b] = true;
      badgeCount++;
    }
  }

  const isChampion = badgeCount >= 8;

  return {
    isPokemon: true,
    generation: 5,
    gameCode: 'WHITE',
    trainerName,
    trainerId,
    money: money > 999999 ? 0 : money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    hasStarter: badgeCount > 0,
    kantoBadges: null,
    totalBadgeCount: badgeCount,
    has16Badges: false,
    isChampion
  };
}

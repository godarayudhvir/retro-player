/**
 * Dedicated Pokémon Yellow Version (Special Pikachu Edition) Save Parser (Game Boy - 32 KB SRAM).
 */
import { countSetBits, bcdToNumber } from '../../../binaryUtils.js';

export function parsePokemonYellow(data) {
  if (!data || data.length < 0x8000) return null;

  // Gen 1 SRAM Bank 1: 0x2000 - 0x3FFF
  let sum = 0;
  for (let i = 0x2598; i <= 0x3522; i++) {
    sum = (sum + data[i]) & 0xFF;
  }
  const expectedChecksum = (~sum) & 0xFF;
  const isValidChecksum = data[0x3523] === expectedChecksum;

  // Reject uninitialized memory
  const partyCountRaw = data[0x2F2C];
  if (!isValidChecksum && (partyCountRaw === 0xFF || partyCountRaw === undefined || data[0x2598] === 0xFF)) {
    return null;
  }

  // 8 Kanto Badges bitmask at 0x2602
  const badgesByte = (data[0x2602] === 0xFF && !isValidChecksum) ? 0 : (data[0x2602] || 0);
  const badges = [
    Boolean(badgesByte & 0x01), // Boulder
    Boolean(badgesByte & 0x02), // Cascade
    Boolean(badgesByte & 0x04), // Thunder
    Boolean(badgesByte & 0x08), // Rainbow
    Boolean(badgesByte & 0x10), // Soul
    Boolean(badgesByte & 0x20), // Marsh
    Boolean(badgesByte & 0x40), // Volcano
    Boolean(badgesByte & 0x80)  // Earth
  ];
  const badgeCount = badges.filter(Boolean).length;

  // Trainer Money: 3-byte BCD at 0x25F3 - 0x25F5
  const money = bcdToNumber(data[0x25F3], data[0x25F4], data[0x25F5]);

  // Pokédex Caught: 19 bytes at 0x25A3 - 0x25B5 (152 flags)
  const pokedexCaught = countSetBits(data, 0x25A3, 19);

  // Party Count at 0x2F2C (0 to 6)
  const partyCount = Math.min(6, Math.max(0, data[0x2F2C] || 0));

  let maxPartyLevel = 0;
  const starterByte = data[0x29C3] || 0;
  let hasStarter = partyCount > 0 || pokedexCaught > 0 || [0x99, 0xB0, 0xB1, 0x54].includes(starterByte);
  let hasLegendary = false;
  let hasFossil = false;

  const legendarySpecies = [0x83, 0x15, 0x4A, 0x4B, 0x49]; // Mewtwo, Mew, Articuno, Zapdos, Moltres
  const fossilSpecies = [0x62, 0x63, 0x5A, 0x5B, 0xAB];     // Omanyte, Omastar, Kabuto, Kabutops, Aerodactyl

  // Party inspection
  const partySpeciesList = [];
  const partyMoves = new Set();

  for (let p = 0; p < partyCount; p++) {
    const entryOffset = 0x2F34 + (p * 44);
    if (entryOffset + 44 <= data.length) {
      const species = data[entryOffset];
      partySpeciesList.push(species);
      const level = data[entryOffset + 0x21];
      if (level > maxPartyLevel && level <= 100) maxPartyLevel = level;
      if (legendarySpecies.includes(species)) hasLegendary = true;
      if (fossilSpecies.includes(species)) hasFossil = true;

      // Moves at +0x08, +0x09, +0x0A, +0x0B
      for (let m = 0; m < 4; m++) {
        const moveId = data[entryOffset + 0x08 + m];
        if (moveId > 0) partyMoves.add(moveId);
      }
    }
  }

  // Helper for Pokédex Owned bitfield
  function isDexCaught(dexNum) {
    if (dexNum < 1 || dexNum > 152) return false;
    const byteOffset = 0x25A3 + Math.floor((dexNum - 1) / 8);
    const bitOffset = (dexNum - 1) % 8;
    return Boolean(data[byteOffset] & (1 << bitOffset));
  }

  // Bag items at 0x25C9
  const bagCount = Math.min(20, data[0x25C9] || 0);
  const allItems = new Set();
  for (let i = 0; i < bagCount; i++) {
    allItems.add(data[0x25CA + (i * 2)]);
  }

  // PC items at 0x27E6
  const pcCount = Math.min(50, data[0x27E6] || 0);
  for (let i = 0; i < pcCount; i++) {
    allItems.add(data[0x27E7 + (i * 2)]);
  }

  // HM Detection
  const hasHM01 = allItems.has(0xC4) || partyMoves.has(15);
  const hasHM02 = allItems.has(0xC5) || partyMoves.has(19);
  const hasHM03 = allItems.has(0xC6) || partyMoves.has(57);
  const hasHM04 = allItems.has(0xC7) || partyMoves.has(70);
  const hasHM05 = allItems.has(0xC8) || partyMoves.has(148);
  const hasAllHMs = hasHM01 && hasHM02 && hasHM03 && hasHM04 && hasHM05;

  // Legendaries & Mewtwo
  const hasArticuno = isDexCaught(144) || partySpeciesList.includes(0x4A);
  const hasZapdos = isDexCaught(145) || partySpeciesList.includes(0x4B);
  const hasMoltres = isDexCaught(146) || partySpeciesList.includes(0x49);
  const hasAllBirds = hasArticuno && hasZapdos && hasMoltres;
  const hasMewtwo = isDexCaught(150) || partySpeciesList.includes(0x83);

  // Fossils Revived
  const hasOmanyte = isDexCaught(138) || isDexCaught(139) || partySpeciesList.includes(0x62) || partySpeciesList.includes(0x63);
  const hasKabuto = isDexCaught(140) || isDexCaught(141) || partySpeciesList.includes(0x5A) || partySpeciesList.includes(0x5B);
  const hasAerodactyl = isDexCaught(142) || partySpeciesList.includes(0xAB);
  const hasAnyFossil = hasFossil || hasOmanyte || hasKabuto || hasAerodactyl;

  // Yellow-Exclusive: Pikachu Friendship byte at 0x271C (0 to 255)
  const pikaFriendship = data[0x271C] || 0;
  const hasPikaFriend = pikaFriendship >= 200;

  // Yellow-Exclusive: Kanto Gift Starter Trio
  const hasBulbasaur = isDexCaught(1) || partySpeciesList.includes(0x99);
  const hasCharmander = isDexCaught(4) || partySpeciesList.includes(0xB0);
  const hasSquirtle = isDexCaught(7) || partySpeciesList.includes(0xB1);
  const hasStarterTrio = hasBulbasaur && hasCharmander && hasSquirtle;

  // Yellow-Exclusive: Team Rocket Duo Defeated
  // In Yellow event flags: EVENT_BEAT_MT_MOON_JESSIE_JAMES is byte 0x29D4 + 21 bit 3
  const hasDefeatedRocketDuo = Boolean(data[0x29E9] & 0x08) || badgeCount >= 2;

  // Action Event Flags & Story Feats
  // 1. Snorlax Roadblocks (Route 12 or Route 16 cleared with Poké Flute)
  const hasClearedSnorlax = isDexCaught(143) || partySpeciesList.includes(0x84) || Boolean(data[0x2A1E] & 0x01) || Boolean(data[0x2A1F] & 0x01);

  // 2. Ghost Marowak Calmed (Pokémon Tower 6F)
  const hasCalmedGhostMarowak = Boolean(data[0x2A39] & 0x04) || allItems.has(0x49); // Fuji's Poké Flute given only after Marowak calmed

  // 3. Silph Co. Liberated (11F Giovanni defeated & President rescued)
  const hasLiberatedSilphCo = allItems.has(0x01) || Boolean(badges[5]) || Boolean(data[0x2A53] & 0x08); // Master Ball gifted by President upon rescue

  // 4. Saffron Fighting Dojo Master Defeated (Hitmonlee / Hitmonchan earned)
  const hasWonFightingDojo = isDexCaught(106) || isDexCaught(107) || partySpeciesList.includes(0x2B) || partySpeciesList.includes(0x2C) || Boolean(data[0x2A5D] & 0x01);

  // 5. Saffron City Thirsty Guard Quenched (Bribed with tea / soda to open gates)
  const hasQuenchedSaffronGuard = Boolean(data[0x2A4F] & 0x01) || hasWonFightingDojo || hasLiberatedSilphCo || Boolean(badges[5]);

  // 6. S.S. Anne Set Sail (Tended to captain & stepped off ship)
  const hasDepartedSSAnne = Boolean(data[0x2A00] & 0x01) || hasHM01 || Boolean(badges[2]);

  // 7. Nugget Bridge 5-Trainer Gauntlet Cleared (Route 24)
  // Requires passing Pewter City (Boulder Badge 0) AND having the Route 24 Nugget event flag or S.S. Ticket from Bill past the bridge
  const hasReachedCerulean = Boolean(badges[0]);
  const hasClearedNuggetBridge = hasReachedCerulean && (Boolean(data[0x2A10] & 0x20) || allItems.has(0x3F) || Boolean(data[0x29F2] & 0x01));

  // 8. Mr. Fuji Rescued from Pokémon Tower
  const hasRescuedMrFuji = allItems.has(0x49) || Boolean(data[0x2A39] & 0x80);

  return {
    isPokemon: true,
    generation: 1,
    gameCode: 'YELLOW',
    isValidChecksum,
    money,
    badges,
    badgeCount,
    hasAllBadges: badgeCount === 8,
    pokedexCaught,
    partyCount,
    maxPartyLevel,
    hasLevel100: maxPartyLevel >= 100,
    hasStarter: partyCount > 0,
    hasFirstCatch: pokedexCaught >= 2,
    hasFullParty: partyCount >= 6,
    hasShiny: false,
    hasPokerus: false,
    hasLegendary: hasLegendary || hasArticuno || hasZapdos || hasMoltres || hasMewtwo,
    hasFossil: hasAnyFossil,
    hallOfFameCount: badgeCount === 8 ? (data[0x0598] || 1) : 0,
    isChampion: badgeCount === 8 && (data[0x0598] > 0 || pokedexCaught >= 50 || maxPartyLevel >= 60),
    isBankrupt: money === 0,
    isHighRoller: money >= 999999,
    hasPikaFriend,
    pikaFriendship,
    hasStarterTrio,
    hasDefeatedRocketDuo,
    events: {
      snorlaxCleared: hasClearedSnorlax,
      ghostMarowakCalmed: hasCalmedGhostMarowak,
      silphCoLiberated: hasLiberatedSilphCo,
      fightingDojoWon: hasWonFightingDojo,
      saffronGuardQuenched: hasQuenchedSaffronGuard,
      ssAnneDeparted: hasDepartedSSAnne,
      nuggetBridgeCleared: hasClearedNuggetBridge,
      mrFujiRescued: hasRescuedMrFuji
    },
    hms: {
      hm01: hasHM01,
      hm02: hasHM02,
      hm03: hasHM03,
      hm04: hasHM04,
      hm05: hasHM05,
      hasAllHMs
    },
    legendaries: {
      articuno: hasArticuno,
      zapdos: hasZapdos,
      moltres: hasMoltres,
      hasAllBirds,
      mewtwo: hasMewtwo
    },
    fossils: {
      omanyte: hasOmanyte,
      kabuto: hasKabuto,
      aerodactyl: hasAerodactyl,
      hasAnyFossil
    },
    keyItems: {
      bicycle: allItems.has(0x06),
      oldRod: allItems.has(0x3D),
      goodRod: allItems.has(0x3E),
      superRod: allItems.has(0x3F),
      itemfinder: allItems.has(0x41),
      pokeFlute: allItems.has(0x49),
      scope: allItems.has(0x48),
      expShare: allItems.has(0x3A),
      townMap: allItems.has(0x05) || hasStarter,
      masterBall: allItems.has(0x01)
    }
  };
}

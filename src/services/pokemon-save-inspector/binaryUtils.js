/**
 * Shared Binary & Low-Level Math Utilities for Pokémon Save Parsing.
 * Offline, zero-dependency, bit-exact binary manipulation.
 */

/**
 * Counts the number of active bits (popcount) in a Uint8Array slice.
 */
export function countSetBits(bytes, start = 0, length = bytes.length) {
  let count = 0;
  const end = Math.min(bytes.length, start + length);
  for (let i = start; i < end; i++) {
    let byte = bytes[i];
    while (byte > 0) {
      count += (byte & 1);
      byte >>= 1;
    }
  }
  return count;
}

/**
 * Converts 3-byte Binary Coded Decimal (BCD) to integer (Gen 1 money).
 */
export function bcdToNumber(b1, b2, b3) {
  const hexStr = [b1, b2, b3].map(b => b.toString(16).padStart(2, '0')).join('');
  const num = parseInt(hexStr, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Reads 16-bit little-endian integer.
 */
export function readUint16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

/**
 * Reads 32-bit little-endian unsigned integer.
 */
export function readUint32LE(bytes, offset) {
  return (
    (bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)) >>> 0
  );
}

/**
 * Reads 24-bit big-endian integer (Gen 2 money).
 */
export function readUint24BE(bytes, offset) {
  return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
}

/**
 * Reads 32-bit big-endian unsigned integer.
 */
export function readUint32BE(bytes, offset) {
  return (
    ((bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 8] << 8) |
    bytes[offset + 3]) >>> 0
  );
}

// Precomputed CRC16 Table (CCITT-FALSE / X.25 polynomial 0x1021) for Gen 4 & Gen 5
const CRC16_TABLE = new Uint16Array(256);
for (let i = 0; i < 256; i++) {
  let curr = i << 8;
  for (let j = 0; j < 8; j++) {
    curr = (curr & 0x8000) ? ((curr << 1) ^ 0x1021) : (curr << 1);
  }
  CRC16_TABLE[i] = curr & 0xFFFF;
}

/**
 * Calculates standard CRC16 over a byte slice.
 */
export function calculateCRC16(bytes, offset, length) {
  let crc = 0xFFFF;
  for (let i = 0; i < length; i++) {
    crc = ((crc << 8) & 0xFFFF) ^ CRC16_TABLE[((crc >>> 8) ^ bytes[offset + i]) & 0xFF];
  }
  return crc & 0xFFFF;
}

/**
 * Decodes Gen 4 / Gen 5 2-byte encoded character strings to UTF-8.
 */
export function decodeGen4String(bytes, offset, maxLength = 16) {
  let str = '';
  for (let i = 0; i < maxLength; i += 2) {
    const code = readUint16LE(bytes, offset + i);
    if (code === 0xFFFF || code === 0x0000) break;
    if (code >= 0x0121 && code <= 0x012A) str += String.fromCharCode(48 + (code - 0x0121));
    else if (code >= 0x012B && code <= 0x0144) str += String.fromCharCode(65 + (code - 0x012B));
    else if (code >= 0x0145 && code <= 0x015E) str += String.fromCharCode(97 + (code - 0x0145));
    else if (code >= 0x0001 && code <= 0x001A) str += String.fromCharCode(65 + (code - 1));
    else if (code >= 0x001B && code <= 0x0034) str += String.fromCharCode(97 + (code - 0x1B));
    else if (code >= 0x0020 && code <= 0x007E) str += String.fromCharCode(code);
  }
  return str.trim();
}

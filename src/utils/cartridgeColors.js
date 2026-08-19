/**
 * Maps cartridge shell colors based on game title keywords and system themes.
 * @param {Object} game - Game metadata object
 * @returns {string} Hex color string
 */
export function getCartridgeColor(game) {
  if (!game) return '#64748b';
  const title = (game.title || '').toLowerCase();
  
  if (title.includes('red') || title.includes('firered')) return '#dc2626';
  if (title.includes('blue')) return '#2563eb';
  if (title.includes('yellow')) return '#eab308';
  if (title.includes('gold') || title.includes('heartgold')) return '#d97706';
  if (title.includes('silver') || title.includes('soulsilver')) return '#78716c';
  if (title.includes('crystal')) return '#06b6d4';
  if (title.includes('ruby')) return '#e11d48';
  if (title.includes('sapphire')) return '#1d4ed8';
  if (title.includes('emerald')) return '#059669';
  if (title.includes('leafgreen') || title.includes('green')) return '#16a34a';
  if (title.includes('diamond')) return '#0284c7';
  if (title.includes('pearl')) return '#db2777';
  if (title.includes('platinum')) return '#475569';
  if (title.includes('black')) return '#1e293b';
  if (title.includes('white')) return '#94a3b8';

  return game.systemColor || '#64748b';
}

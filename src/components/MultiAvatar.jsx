import React, { useMemo } from 'react';
import multiavatar from '@multiavatar/multiavatar';

/**
 * MultiAvatar Component (https://multiavatar.com/)
 * Deterministically generates crisp, multicultural SVG avatars based on any text seed or player name.
 */
export default function MultiAvatar({
  seed = 'Player 1',
  size = 48,
  className = '',
  style = {},
  borderColor,
  onClick
}) {
  const cleanSeed = useMemo(() => {
    if (!seed || typeof seed !== 'string') return 'Player 1';
    return seed.trim() || 'Player 1';
  }, [seed]);

  const svgContent = useMemo(() => {
    try {
      return multiavatar(cleanSeed);
    } catch (err) {
      console.warn('Multiavatar generation fallback for seed:', cleanSeed, err);
      return multiavatar('Player');
    }
  }, [cleanSeed]);

  return (
    <div
      className={`multiavatar-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: borderColor ? `2.5px solid ${borderColor}` : undefined,
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
        ...style
      }}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

import React, { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { getCartridgeColor } from '../utils/cartridgeColors';

/**
 * Individual 3D Physical Retro Cartridge Tile component with tactile sheen, grips, dynamic scraped box art, and brand stamps.
 */
export default function CartridgeTile({ game, metadata, isFocused, isFavorite, onClick }) {
  if (!game) return null;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartColor = getCartridgeColor(game);
  const coverSrc = metadata?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);

  return (
    <div
      className={`game-tile cartridge-shell ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
      onClick={onClick}
      title={game.title}
      style={{ '--cart-color': cartColor }}
    >
      {/* Top Cartridge Header with Recessed Oval Stadium Capsule */}
      <div className="cartridge-header">
        <div className="cartridge-grips left" />
        <div className="cartridge-recessed-pill">
          <span className="cartridge-brand-text">{game.systemName || 'RETRO'}</span>
        </div>
        <div className="cartridge-grips right" />
      </div>

      {/* Favorite Star Indicator */}
      {isFavorite && (
        <div className="cartridge-favorite-badge" title="Favorite Game">
          <Star size={13} fill="#fbbf24" color="#d97706" />
        </div>
      )}

      {/* Recessed Sticker Label Area */}
      <div className="cartridge-sticker-area">
        {/* Shimmer Placeholder when loading cover image */}
        {!imgLoaded && !imgError && coverSrc && (
          <div className="cartridge-loading-shimmer">
            <Sparkles size={16} className="shimmer-sparkle" />
          </div>
        )}

        {coverSrc && !imgError ? (
          <img
            src={coverSrc}
            alt={game.title}
            className={`tile-img cartridge-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(false);
            }}
          />
        ) : (
          <div className="tile-fallback-label">
            <span className="fallback-console-pill">{game.systemName}</span>
            <span className="fallback-game-title">{game.title}</span>
          </div>
        )}

        <div className="cartridge-label-sheen" />
      </div>

      {/* Bottom Cartridge Notch Arrow */}
      <div className="cartridge-footer">
        <div className="cartridge-arrow-down" />
      </div>
    </div>
  );
}

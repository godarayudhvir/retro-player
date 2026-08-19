import React from 'react';
import { Star } from 'lucide-react';
import { getCartridgeColor } from '../utils/cartridgeColors';

/**
 * Individual 3D Physical Retro Cartridge Tile component with tactile sheen, grips, and brand stamps.
 */
export default function CartridgeTile({ game, index, isFocused, isFavorite, onClick }) {
  if (!game) return null;

  const cartColor = getCartridgeColor(game);

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
          <span className="cartridge-brand-text">{game.systemName || 'GAME BOY'}</span>
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
        <img
          src={game.coverUrl}
          alt={game.title}
          className="tile-img cartridge-label-img"
          onError={(e) => {
            console.warn(`⚠️ [COVER LOAD ERROR] Cover image failed to load for game "${game.title}":`, game.coverUrl);
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
        <div className="cartridge-label-sheen" />
        <div className="tile-fallback" style={{ display: 'none' }}>
          {game.systemIcon ? (
            <img src={game.systemIcon} alt="" className="fallback-sys-icon" />
          ) : (
            <img src="/assets/pokeball.png" alt="" style={{ width: '40px', height: '40px', opacity: 0.7 }} />
          )}
        </div>
      </div>

      {/* Bottom Cartridge Notch Arrow */}
      <div className="cartridge-footer">
        <div className="cartridge-arrow-down" />
      </div>
    </div>
  );
}

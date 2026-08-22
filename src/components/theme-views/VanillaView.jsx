import React from 'react';
import CartridgeTile from '../CartridgeTile';

/**
 * VanillaView: Original porcelain-white 3D physical cartridge shelf & grid.
 * Preserved 100% untouched.
 */
export default function VanillaView({
  filteredGames = [],
  metadataMap = {},
  focusedTarget,
  setFocusedTarget,
  handleGameSelect,
  isFavorite,
  activeSystem,
  currentSystemName
}) {
  return (
    <div className="console-viewport-inner">
      {/* Ambient Channel Showcase Header */}
      <div className="channel-spotlight-bar">
        <div className="channel-meta-badge">
          <span className="channel-title-text">{currentSystemName}</span>
        </div>
      </div>

      {/* Full-Bleed Ambient Tiles Grid */}
      <div className="tiles-grid">
        {filteredGames.map((game, index) => {
          const isFocused = focusedTarget.zone === 'grid' && focusedTarget.index === index;
          const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
          const meta =
            metadataMap[game.id] ||
            metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];

          return (
            <CartridgeTile
              key={game.id || index}
              game={game}
              metadata={meta}
              isFocused={isFocused}
              isFavorite={isFav}
              coverOnly={activeSystem === 'all'}
              onClick={() => {
                setFocusedTarget({ zone: 'grid', index });
                handleGameSelect(game);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

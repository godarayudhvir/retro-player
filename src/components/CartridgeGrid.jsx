import React from 'react';
import { FolderOpen, RefreshCw } from 'lucide-react';
import CartridgeTile from './CartridgeTile';

/**
 * Viewport rendering the 3D cartridge tiles grid or the empty library prompt with rescan button.
 */
export default function CartridgeGrid({
  filteredGames,
  focusedTarget,
  setFocusedTarget,
  handleGameSelect,
  fetchGames,
  loading,
  isFavorite,
  sfx
}) {
  return (
    <main className="console-viewport">
      {filteredGames.length > 0 ? (
        <div className="tiles-grid">
          {filteredGames.map((game, index) => {
            const isFocused = focusedTarget.zone === 'grid' && focusedTarget.index === index;
            const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
            return (
              <CartridgeTile
                key={game.id}
                game={game}
                index={index}
                isFocused={isFocused}
                isFavorite={isFav}
                onClick={() => {
                  setFocusedTarget({ zone: 'grid', index });
                  handleGameSelect(game);
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="console-empty">
          <FolderOpen size={56} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3>No Titles Registered</h3>
          <p>
            Drop your ROM files into <span className="code-block">public/roms/[system]</span>
            <br />
            Add custom channel artwork into <span className="code-block">public/assets/cover/[system]</span>
          </p>
          <button
            className={`system-tab active ${focusedTarget.zone === 'grid' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              fetchGames();
              sfx?.playTileNav?.();
            }}
            style={{ margin: '1.5rem auto 0', cursor: 'pointer' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Rescan Channels
          </button>
        </div>
      )}
    </main>
  );
}

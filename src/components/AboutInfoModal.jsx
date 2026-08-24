import React from 'react';
import { X, Gamepad2 } from 'lucide-react';

/**
 * About & Controls Reference Modal displaying system capabilities and full keyboard / gamepad mappings.
 */
export default function AboutInfoModal({ isOpen, focusedTarget, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Gamepad2 size={28} color="#ef4444" />
            <h2>Retro Player</h2>
            <span className="info-version-badge">v1.0.1</span>
          </div>
          <button
            className={`info-close-btn ${focusedTarget.zone === 'infoModal' && focusedTarget.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="info-modal-body">
          <p className="info-tagline">
            A modern, high-performance web-based retro game launcher and emulator library for classic retro console games.
          </p>

          <div className="info-section">
            <h3>✨ Key Features</h3>
            <ul>
              <li><strong>🕹️ Multi-System Emulation:</strong> GB, GBC, GBA, NES, SNES, N64, NDS, Genesis, Game Gear, PS1, Atari 2600 & Arcade via EmulatorJS.</li>
              <li><strong>🔊 Synthesized Web Audio SFX:</strong> Synthesized tactile UI navigation audio, shoulder swooshes, and cartridge insertion sound effects.</li>
              <li><strong>🖼️ Automated Online Scraper:</strong> Dynamically scrapes authentic 3D box art & metadata without local files.</li>
              <li><strong>🎮 Handheld Gamepad Navigation:</strong> Full DPAD, thumbstick, and shoulder button cycling support.</li>
              <li><strong>📊 Dynamic System Ribbon:</strong> Consoles with the most games appear first automatically.</li>
              <li><strong>🚀 Zero-Config Setup:</strong> Drop ROMs in platform folders to instantly index games.</li>
            </ul>
          </div>
        </div>

        <div className="info-modal-footer">
          <button
            className={`info-ack-btn ${focusedTarget.zone === 'infoModal' && focusedTarget.id === 'ack' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}

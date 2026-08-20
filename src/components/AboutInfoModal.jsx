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

          <div className="info-section">
            <h3>🎮 Handheld & Keyboard Controls</h3>
            <div className="info-table-wrapper">
              <table className="info-controls-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Keyboard</th>
                    <th>Gamepad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Navigate Tiles</td>
                    <td>Arrow Keys / WASD</td>
                    <td>D-Pad / Left Stick</td>
                  </tr>
                  <tr>
                    <td>Switch System</td>
                    <td>Q / E / PageUp / PageDn</td>
                    <td>L1 / R1 (Shoulder)</td>
                  </tr>
                  <tr>
                    <td>Launch Game / Select</td>
                    <td>Enter / Space</td>
                    <td>A Button (Btn 0)</td>
                  </tr>
                  <tr>
                    <td>Toggle Favorite ⭐</td>
                    <td>F Key</td>
                    <td>X Button (Btn 2)</td>
                  </tr>
                  <tr>
                    <td>Switch Theme 🎨</td>
                    <td>T Key</td>
                    <td>Topbar Theme Pill</td>
                  </tr>
                  <tr>
                    <td>Search / Keyboard</td>
                    <td>⌘K / Ctrl+K</td>
                    <td>Y Button (Btn 3) / Select</td>
                  </tr>
                  <tr>
                    <td>Back / Close Dialogs</td>
                    <td>Escape / Backspace</td>
                    <td>B Button (Btn 1)</td>
                  </tr>
                  <tr>
                    <td>Exit Game to Launcher</td>
                    <td>Escape</td>
                    <td>L3 + R3 / Select + Start / Guide</td>
                  </tr>
                </tbody>
              </table>
            </div>
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

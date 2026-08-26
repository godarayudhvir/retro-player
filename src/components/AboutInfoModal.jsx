import React from 'react';
import { X, Gamepad2, Github, ExternalLink } from 'lucide-react';

/**
 * About & Controls Reference Modal displaying system capabilities, repository source, and full keyboard / gamepad mappings.
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
            <span className="info-version-badge">v1.0.3</span>
          </div>
          <button
            className="info-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="info-modal-body">
          <p className="info-tagline">
            A modern, high-performance web-based retro game launcher and emulator library for classic retro console games.
          </p>

          <div className="info-repo-card">
            <div className="info-repo-icon-wrap">
              <Github size={24} />
            </div>
            <div className="info-repo-content">
              <div className="info-repo-header-row">
                <span className="info-repo-heading">Open Source Repository</span>
                <span className="github-live-chip">GITHUB</span>
              </div>
              <p className="info-repo-desc">
                Retro Player is completely free and open source. Star the repository, contribute new features, report bugs, or inspect the codebase.
              </p>
              <a
                href="https://github.com/godarayudhvir/retro-player"
                target="_blank"
                rel="noopener noreferrer"
                className="info-repo-link"
              >
                <span>github.com/godarayudhvir/retro-player</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="info-section">
            <h3>Key Features</h3>
            <ul>
              <li><strong>Multi-System Emulation:</strong> GB, GBC, GBA, NES, SNES, N64, NDS, Genesis, Game Gear, PS1, Atari 2600 & Arcade via EmulatorJS.</li>
              <li><strong>Synthesized Web Audio SFX:</strong> Synthesized tactile UI navigation audio, shoulder swooshes, and cartridge insertion sound effects.</li>
              <li><strong>Automated Online Scraper:</strong> Dynamically scrapes authentic 3D box art & metadata without local files.</li>
              <li><strong>Handheld Gamepad Navigation:</strong> Full DPAD, thumbstick, and shoulder button cycling support.</li>
              <li><strong>Dynamic System Ribbon:</strong> Consoles with the most games appear first automatically.</li>
              <li><strong>Zero-Config Setup:</strong> Drop ROMs in platform folders to instantly index games.</li>
            </ul>
          </div>
        </div>

        <div className="info-modal-footer">
          <a
            href="https://github.com/godarayudhvir/retro-player"
            target="_blank"
            rel="noopener noreferrer"
            className="info-repo-btn"
          >
            <Github size={18} />
            <span>GitHub Repository</span>
            <ExternalLink size={14} />
          </a>
          <button
            className="info-ack-btn"
            onClick={onClose}
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}


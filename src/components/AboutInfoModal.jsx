import React, { useEffect } from 'react';
import { Gamepad2, Github, ExternalLink, Info, X, Cpu } from 'lucide-react';
import { haptics } from '../services/hapticsService';
import { resolveAssetPath } from '../utils/assetPath';

const EMULATION_SYSTEMS = [
  { name: 'Atari 2600', core: 'Stella', icon: 'atari2600.svg', year: '1977' },
  { name: 'Arcade (MAME)', core: 'MAME 2003+', icon: 'arcade.svg', year: '1978' },
  { name: 'NES / Famicom', core: 'FCEUmm', icon: 'nes.svg', year: '1983' },
  { name: 'Sega Genesis / MD', core: 'Genesis Plus GX', icon: 'genesis.svg', year: '1988' },
  { name: 'Game Boy', core: 'Gambatte', icon: 'gb.svg', year: '1989' },
  { name: 'Super Nintendo', core: 'Snes9x', icon: 'snes.svg', year: '1990' },
  { name: 'Sega Game Gear', core: 'Genesis Plus GX', icon: 'gamegear.svg', year: '1990' },
  { name: 'PlayStation', core: 'Beetle PSX', icon: 'psx.svg', year: '1994' },
  { name: 'Nintendo 64', core: 'Mupen64Plus', icon: 'n64.svg', year: '1996' },
  { name: 'Game Boy Color', core: 'Gambatte', icon: 'gbc.svg', year: '1998' },
  { name: 'Game Boy Advance', core: 'mGBA', icon: 'gba.svg', year: '2001' },
  { name: 'Nintendo DS', core: 'melonDS', icon: 'nds.svg', year: '2004' },
];

/**
 * About & System Specs Modal displaying emulation engines and repository source.
 */
export default function AboutInfoModal({ isOpen, focusedTarget, onClose, sfx }) {
  // Listen for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        sfx?.playModalClose?.();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sfx]);

  if (!isOpen) return null;

  return (
    <div className="info-modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="scraper-modal-container animate-scale-up" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', width: '92%' }}
      >
        {/* Modal Header */}
        <header className="scraper-modal-header">
          <div className="scraper-modal-title-group">
            <div className="scraper-icon-bubble" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <Info size={22} color="#059669" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2>Retro Player</h2>
                <span className="info-version-badge" style={{ fontSize: '0.68rem', padding: '0.12rem 0.5rem' }}>v1.1.0</span>
              </div>
              <p>The High-Performance, Zero-Overhead Web Emulation Station</p>
            </div>
          </div>
          <button
            type="button"
            className={`scraper-modal-close-btn ${focusedTarget?.zone === 'infoModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              sfx?.playModalClose?.();
              onClose?.();
            }}
            title="Close (Esc)"
            aria-label="Close About Modal"
          >
            <X size={18} />
          </button>
        </header>
        
        {/* Modal Body */}
        <div className="backup-modal-body" style={{ padding: '1.25rem 1.75rem', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Supported Emulation Systems & WebAssembly Cores Matrix */}
          <div className="info-section-title">
            <Cpu size={15} color="#10b981" />
            <span>Supported Systems &amp; WebAssembly Cores</span>
          </div>

          <div className="info-systems-grid">
            {EMULATION_SYSTEMS.map((sys) => (
              <div key={sys.name} className="info-system-chip">
                <div className="info-system-chip-left">
                  <img 
                    src={resolveAssetPath(`assets/platforms/${sys.icon}`)} 
                    alt={sys.name} 
                    className="info-system-chip-icon" 
                  />
                  <span className="info-system-chip-name">{sys.name}</span>
                </div>
                <span className="info-system-chip-core">{sys.core}</span>
              </div>
            ))}
          </div>

          {/* Open Source Repository Card */}
          <div className="info-repo-card" style={{ marginBottom: 0 }}>
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
                onClick={() => haptics.selection()}
              >
                <span>github.com/godarayudhvir/retro-player</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


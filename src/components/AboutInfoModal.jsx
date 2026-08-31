import React, { useEffect } from 'react';
import { Gamepad2, Github, ExternalLink, Info, X } from 'lucide-react';
import { haptics } from '../services/hapticsService';

/**
 * About & Controls Reference Modal displaying system capabilities, repository source, and full keyboard / gamepad mappings.
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
        style={{ maxWidth: '580px' }}
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
              <p>System specifications, emulation engines, and repository source</p>
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
        <div className="backup-modal-body" style={{ padding: '1.25rem 1.75rem', overflowY: 'auto' }}>
          <p className="info-tagline" style={{ marginTop: 0, marginBottom: '1rem' }}>
            Your favorite retro classics, beautifully organized and ready to play anywhere. A dedicated retro console experience directly in your browser.
          </p>

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


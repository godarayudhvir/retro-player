import React, { useEffect } from 'react';
import { X, Gamepad2, Github, ExternalLink } from 'lucide-react';

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
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="info-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Gamepad2 size={28} color="#ef4444" />
            <h2>Retro Player</h2>
            <span className="info-version-badge">v1.0.6</span>
          </div>
          <button
            className="info-close-btn"
            onClick={() => {
              sfx?.playModalClose?.();
              onClose?.();
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="info-modal-body" style={{ paddingBottom: '1.5rem' }}>
          <p className="info-tagline">
            A modern, high-performance web-based retro game launcher and emulator library for classic retro console games.
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


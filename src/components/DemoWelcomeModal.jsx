import React, { useState, useEffect } from 'react';
import { Sparkles, Gamepad2, ShieldCheck, HardDrive, Download, ExternalLink, X, CheckCircle2 } from 'lucide-react';

/**
 * DemoWelcomeModal - In-app modal displayed when running on GitHub Pages (or with ?demo=true).
 * Informs visitors about available features and static hosting limitations.
 */
export default function DemoWelcomeModal({
  sfx,
  focusedTarget,
  setFocusedTarget
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const isDemoEnv = typeof window !== 'undefined' && (
        window.location.hostname.endsWith('github.io') ||
        window.location.search.includes('demo=true')
      );
      const isDismissed = localStorage.getItem('retro_demo_dismissed') === 'true';

      if (isDemoEnv && !isDismissed) {
        setIsOpen(true);
        if (setFocusedTarget) {
          setFocusedTarget({ zone: 'demoModal', id: 'dismiss' });
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [setFocusedTarget]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem('retro_demo_dismissed', 'true');
    } catch {
      // Ignore
    }
    setIsOpen(false);
    sfx?.playModalClose?.();
    if (setFocusedTarget) {
      setFocusedTarget({ zone: 'grid', index: 0 });
    }
  };

  return (
    <div className="modal-backdrop demo-modal-backdrop" onClick={handleDismiss}>
      <div className="demo-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="demo-modal-header">
          <div className="demo-modal-badge">
            <Sparkles size={16} />
            <span>LIVE WEB DEMO</span>
          </div>
          <button
            className={`demo-modal-close-btn ${focusedTarget?.zone === 'demoModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={handleDismiss}
            title="Close (ESC / B)"
            aria-label="Close Demo Notice"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="demo-modal-title-group">
          <h2>Welcome to Retro Player</h2>
          <p className="demo-modal-subtitle">
            A high-performance retro console station running 100% in your web browser via WebAssembly.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="demo-modal-features">
          <div className="demo-feature-card">
            <div className="demo-feature-icon">
              <Gamepad2 size={20} color="#3b82f6" />
            </div>
            <div className="demo-feature-text">
              <strong>Hardware-Accelerated WASM Emulation</strong>
              <span>Zero-install retro gaming across 10+ legendary consoles.</span>
            </div>
          </div>

          <div className="demo-feature-card">
            <div className="demo-feature-icon">
              <ShieldCheck size={20} color="#10b981" />
            </div>
            <div className="demo-feature-text">
              <strong>100% Private Custom ROMs</strong>
              <span>Use <em>"Load Custom ROM"</em> or drag & drop. ROMs run strictly in memory without uploading.</span>
            </div>
          </div>

          <div className="demo-feature-card">
            <div className="demo-feature-icon">
              <Download size={20} color="#8b5cf6" />
            </div>
            <div className="demo-feature-text">
              <strong>Installable PWA Console</strong>
              <span>Install to your desktop, Steam Deck, or mobile home screen with offline caching.</span>
            </div>
          </div>
        </div>

        {/* Static Hosting Limitations Notice */}
        <div className="demo-modal-notice-box">
          <div className="demo-notice-header">
            <HardDrive size={18} color="#f59e0b" />
            <strong>GitHub Pages Demo Mode</strong>
          </div>
          <p>
            Because GitHub Pages is a static read-only CDN, <strong>host server disk file uploads</strong> (under <em>Settings &rarr; ROM Library</em>) are disabled. For full multi-user server disk storage and synchronized save backups, deploy your own instance with Docker.
          </p>
        </div>

        {/* Demo Showcase Non-Complete Disclaimer */}
        <div className="demo-modal-notice-box" style={{ borderLeftColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.08)' }}>
          <div className="demo-notice-header">
            <ShieldCheck size={18} color="#3b82f6" />
            <strong>Non-Commercial Demo Showcase</strong>
          </div>
          <p>
            All pre-loaded titles in this web demo are strictly <strong>non-complete evaluation slices, promotional samples, homebrew, or prototypes</strong> specifically curated to test WebAssembly emulation performance. No full commercial games are bundled. For full retail titles, use <strong>Load Custom ROM</strong> for 100% private in-memory play. If you are a rights holder wishing for any demo to be removed, please contact us for immediate compliance.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="demo-modal-footer">
          <a
            href="https://github.com/godarayudhvir/retro-player/blob/main/guides/docker.md"
            target="_blank"
            rel="noopener noreferrer"
            className={`demo-modal-btn-secondary ${focusedTarget?.zone === 'demoModal' && focusedTarget?.id === 'github' ? 'gamepad-focused' : ''}`}
            onClick={() => sfx?.playModalOpen?.()}
          >
            <ExternalLink size={16} />
            <span>Docker Self-Host Guide</span>
          </a>

          <button
            className={`demo-modal-btn-primary ${focusedTarget?.zone === 'demoModal' && focusedTarget?.id === 'dismiss' ? 'gamepad-focused' : ''}`}
            onClick={handleDismiss}
            autoFocus
          >
            <CheckCircle2 size={16} />
            <span>Play Web Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

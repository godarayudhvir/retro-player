import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Tv, ExternalLink, QrCode, Smartphone, Globe, ArrowLeft, Check } from 'lucide-react';
import QRCode from 'qrcode';

/**
 * GuideModal Component
 * Offers users an interactive choice when opening a walkthrough (Written or Video):
 * 1. 🌐 Open in Browser (Direct tab redirect)
 * 2. 📱 Scan on Mobile (Crisp client-side QR Code for phone companion reading/watching while playing on TV/PC)
 * Supports 100% spatial gamepad navigation and tactile Nintendo DS touch styling.
 */
export default function GuideModal({
  isOpen,
  gameTitle,
  guideType = 'written', // 'written' | 'video'
  guideUrl,
  onClose,
  sfx
}) {
  const [viewMode, setViewMode] = useState('choice'); // 'choice' | 'qr'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const openBtnRef = useRef(null);
  const qrBackBtnRef = useRef(null);

  // Generate QR Code when guideUrl changes or when opening QR view
  useEffect(() => {
    if (guideUrl) {
      QRCode.toDataURL(guideUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('[QR Generation Error]', err));
    }
    setViewMode('choice');
    setCopied(false);
  }, [guideUrl, isOpen]);

  // Focus management on open or mode change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (viewMode === 'choice') {
          openBtnRef.current?.focus();
        } else if (viewMode === 'qr') {
          qrBackBtnRef.current?.focus();
        }
      }, 60);
    }
  }, [isOpen, viewMode]);

  // Gamepad & Keyboard navigation (Escape to back/close, Enter to activate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (viewMode === 'qr') {
          setViewMode('choice');
          sfx?.playTileNav?.();
        } else {
          onClose?.();
          sfx?.playModalClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, onClose, sfx]);

  if (!isOpen || !guideUrl) return null;

  const isVideo = guideType === 'video';
  const modalBadgeTitle = isVideo ? 'Video Walkthrough' : 'Written Walkthrough';
  const IconComponent = isVideo ? Tv : BookOpen;

  const handleOpenBrowser = () => {
    sfx?.playMenuConfirm?.();
    window.open(guideUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(guideUrl);
      setCopied(true);
      sfx?.playNotification?.();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="confirm-modal-backdrop animate-fade-in guide-modal-backdrop" onClick={onClose}>
      <div 
        className="guide-modal-container animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          className="guide-modal-close-btn"
          onClick={() => {
            onClose?.();
            sfx?.playModalClose?.();
          }}
          title="Close Walkthrough Menu"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="guide-modal-header">
          <div className={`guide-modal-icon-badge ${isVideo ? 'is-video' : 'is-written'}`}>
            <IconComponent size={24} />
          </div>
          <div className="guide-modal-title-group">
            <span className="guide-modal-subtitle">{modalBadgeTitle}</span>
            <h3 className="guide-modal-game-title">{gameTitle || 'Retro Game'}</h3>
          </div>
        </div>

        {/* Choice View: Open in Browser vs QR Scan on Phone */}
        {viewMode === 'choice' && (
          <div className="guide-modal-body">
            <p className="guide-modal-prompt">
              How would you like to view this walkthrough guide?
            </p>

            <div className="guide-choice-grid">
              {/* Option 1: Direct Tab Redirect */}
              <button
                ref={openBtnRef}
                type="button"
                className="guide-choice-card"
                onClick={handleOpenBrowser}
              >
                <div className="guide-choice-icon">
                  <Globe size={28} color="#3b82f6" />
                </div>
                <div className="guide-choice-text">
                  <strong>Open in Browser</strong>
                  <span>Launch guide in a new browser tab</span>
                </div>
                <ExternalLink size={18} className="guide-choice-arrow" />
              </button>

              {/* Option 2: Mobile QR Code Companion */}
              <button
                type="button"
                className="guide-choice-card"
                onClick={() => {
                  setViewMode('qr');
                  sfx?.playTileNav?.();
                }}
              >
                <div className="guide-choice-icon" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                  <Smartphone size={28} color="#10b981" />
                </div>
                <div className="guide-choice-text">
                  <strong>Scan on Mobile Phone</strong>
                  <span>Show QR code to view on your phone while playing</span>
                </div>
                <QrCode size={18} className="guide-choice-arrow" />
              </button>
            </div>
          </div>
        )}

        {/* QR Code Phone Companion View */}
        {viewMode === 'qr' && (
          <div className="guide-modal-qr-body">
            <div className="guide-qr-wrapper">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Walkthrough QR Code" className="guide-qr-image" />
              ) : (
                <div className="guide-qr-loading">Generating QR Code...</div>
              )}
            </div>

            <p className="guide-qr-caption">
              Point your phone's camera at the QR code to open the {isVideo ? 'video' : 'guide'} instantly.
            </p>

            <div className="guide-qr-actions">
              <button
                ref={qrBackBtnRef}
                type="button"
                className="guide-btn-secondary"
                onClick={() => {
                  setViewMode('choice');
                  sfx?.playTileNav?.();
                }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="guide-btn-secondary"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} color="#10b981" /> : <ExternalLink size={16} />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                className="guide-btn-primary"
                onClick={handleOpenBrowser}
              >
                <Globe size={16} />
                <span>Open Tab</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

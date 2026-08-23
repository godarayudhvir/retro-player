import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Tv, ExternalLink, QrCode, Smartphone, Globe, ArrowLeft, Check, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';

/**
 * Unified Strategy Guides & Walkthroughs Hub Modal
 * Presents all available written strategy guides and video walkthroughs in a single, elegant console dialog.
 * Allows instant 1-click tab opening or generating a phone companion QR code to read/watch on mobile while playing.
 * 100% keyboard and gamepad spatial navigation compliant.
 */
export default function GuideModal({
  isOpen,
  gameTitle,
  walkthrough = {},
  guideType,
  guideUrl,
  onClose,
  sfx
}) {
  // Normalize walkthrough links from props
  const writtenUrl = walkthrough?.written || (guideType === 'written' ? guideUrl : null);
  const videoUrl = walkthrough?.video || (guideType === 'video' ? guideUrl : null);

  const [activeQrTarget, setActiveQrTarget] = useState(null); // 'written' | 'video' | null
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const closeBtnRef = useRef(null);
  const qrBackBtnRef = useRef(null);

  // Generate QR Code whenever activeQrTarget changes
  useEffect(() => {
    const targetUrl = activeQrTarget === 'written' ? writtenUrl : activeQrTarget === 'video' ? videoUrl : null;
    if (targetUrl) {
      QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('[QR Generation Error]', err));
    } else {
      setQrDataUrl('');
    }
    setCopied(false);
  }, [activeQrTarget, writtenUrl, videoUrl]);

  // Reset QR target on modal open/close
  useEffect(() => {
    if (!isOpen) {
      setActiveQrTarget(null);
      setCopied(false);
    }
  }, [isOpen]);

  // Keyboard navigation: Escape to back/close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (activeQrTarget) {
          setActiveQrTarget(null);
          sfx?.playTileNav?.();
        } else {
          onClose?.();
          sfx?.playModalClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeQrTarget, onClose, sfx]);

  if (!isOpen || (!writtenUrl && !videoUrl)) return null;

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (_) {
      return 'web guide';
    }
  };

  const handleOpenUrl = (url) => {
    sfx?.playMenuConfirm?.();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      sfx?.playNotification?.();
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const activeQrUrl = activeQrTarget === 'written' ? writtenUrl : videoUrl;
  const isSingleGuide = (writtenUrl && !videoUrl) || (!writtenUrl && videoUrl);

  return (
    <div className="guide-hub-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="guide-hub-modal animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          className="guide-hub-close-btn"
          onClick={() => {
            onClose?.();
            sfx?.playModalClose?.();
          }}
          title="Close Walkthrough Hub"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="guide-hub-header">
          <div className="guide-hub-icon-badge">
            <BookOpen size={24} color="#3b82f6" />
          </div>
          <div className="guide-hub-title-group">
            <div className="guide-hub-subtitle-pill">
              <Sparkles size={12} color="#3b82f6" />
              <span>STRATEGY &amp; WALKTHROUGHS HUB</span>
            </div>
            <h2 className="guide-hub-game-title">{gameTitle || 'Game Guide'}</h2>
          </div>
        </div>

        {/* VIEW 1: HUB MENU (Listing Available Guides) */}
        {!activeQrTarget && (
          <div className="guide-hub-body">
            <p className="guide-hub-description">
              Select a verified community walkthrough to open in a new tab or scan on your phone while playing:
            </p>

            <div className="guide-cards-stack">
              {/* Written Strategy Guide Card */}
              {writtenUrl && (
                <div className="guide-channel-card written-card">
                  <div className="guide-channel-info">
                    <div className="guide-channel-icon written-icon">
                      <BookOpen size={22} />
                    </div>
                    <div className="guide-channel-text">
                      <div className="guide-channel-label-row">
                        <strong className="guide-channel-title">Written Strategy Guide</strong>
                        <span className="guide-domain-pill">{getDomain(writtenUrl)}</span>
                      </div>
                      <span className="guide-channel-desc">Step-by-step maps, boss strategies &amp; item checklists</span>
                    </div>
                  </div>

                  <div className="guide-channel-actions">
                    <button
                      type="button"
                      className="guide-action-btn primary-guide-btn"
                      onClick={() => handleOpenUrl(writtenUrl)}
                      title="Open Written Guide in Browser Tab"
                    >
                      <Globe size={15} />
                      <span>Open Guide</span>
                      <ExternalLink size={13} className="ext-icon" />
                    </button>

                    <button
                      type="button"
                      className="guide-action-btn secondary-guide-btn"
                      onClick={() => {
                        setActiveQrTarget('written');
                        sfx?.playTileNav?.();
                      }}
                      title="Scan QR Code to Read on Mobile Phone"
                    >
                      <Smartphone size={15} />
                      <span>Phone QR</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Video Playthrough Card */}
              {videoUrl && (
                <div className="guide-channel-card video-card">
                  <div className="guide-channel-info">
                    <div className="guide-channel-icon video-icon">
                      <Tv size={22} />
                    </div>
                    <div className="guide-channel-text">
                      <div className="guide-channel-label-row">
                        <strong className="guide-channel-title">Video Playthrough &amp; Longplay</strong>
                        <span className="guide-domain-pill">{getDomain(videoUrl)}</span>
                      </div>
                      <span className="guide-channel-desc">Full video walkthrough playlist, speedruns &amp; secret guides</span>
                    </div>
                  </div>

                  <div className="guide-channel-actions">
                    <button
                      type="button"
                      className="guide-action-btn primary-guide-btn video-btn"
                      onClick={() => handleOpenUrl(videoUrl)}
                      title="Watch Video Playthrough in New Tab"
                    >
                      <Globe size={15} />
                      <span>Watch Video</span>
                      <ExternalLink size={13} className="ext-icon" />
                    </button>

                    <button
                      type="button"
                      className="guide-action-btn secondary-guide-btn"
                      onClick={() => {
                        setActiveQrTarget('video');
                        sfx?.playTileNav?.();
                      }}
                      title="Scan QR Code to Watch on Mobile Phone"
                    >
                      <Smartphone size={15} />
                      <span>Phone QR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: PHONE COMPANION QR CODE */}
        {activeQrTarget && (
          <div className="guide-hub-qr-view">
            <div className="guide-qr-hero-card">
              <div className="guide-qr-img-frame">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Walkthrough Companion QR Code" className="guide-qr-img" />
                ) : (
                  <div className="guide-qr-loading-spinner">Generating QR Code...</div>
                )}
              </div>
              <div className="guide-qr-meta">
                <span className="guide-qr-badge">
                  {activeQrTarget === 'written' ? '📖 WRITTEN STRATEGY GUIDE' : '📺 VIDEO PLAYTHROUGH'}
                </span>
                <p className="guide-qr-instructions">
                  Point your phone's camera at the QR code to read or watch on your companion device while playing on your console.
                </p>
              </div>
            </div>

            <div className="guide-qr-footer-actions">
              <button
                ref={qrBackBtnRef}
                type="button"
                className="guide-qr-btn back-btn"
                onClick={() => {
                  setActiveQrTarget(null);
                  sfx?.playTileNav?.();
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Guides</span>
              </button>

              <button
                type="button"
                className="guide-qr-btn copy-btn"
                onClick={() => handleCopyLink(activeQrUrl)}
              >
                {copied ? <Check size={16} color="#10b981" /> : <ExternalLink size={16} />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                className="guide-qr-btn launch-btn"
                onClick={() => handleOpenUrl(activeQrUrl)}
              >
                <Globe size={16} />
                <span>Open in Tab</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

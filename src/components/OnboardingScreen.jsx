import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  ShieldCheck,
  Download,
  ChevronRight,
  ArrowLeft,
  Play,
  Check,
  Smartphone,
  Monitor,
  Compass,
  Copy,
  ExternalLink,
  Layers,
  Volume2
} from 'lucide-react';
import CharacterStudio from './CharacterStudio';
import DualShockVisualizer from './DualShockVisualizer';
import { resolveAssetPath } from '../utils/assetPath';

const isApplePlatform = typeof navigator !== 'undefined' && (/Macintosh|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
const isSafariBrowser = typeof navigator !== 'undefined' && (/Safari/i.test(navigator.userAgent || '') && !/Chrome|Chromium|CriOS|FxiOS|Edg/i.test(navigator.userAgent || ''));
const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent || '');
const isSmartTv = typeof navigator !== 'undefined' && /SmartTV|Tizen|Web0S|BRAVIA|NetCast|Viera|AppleTV|HbbTV|CrKey/i.test(navigator.userAgent || '');

/**
 * Modern Full-Screen Responsive Onboarding Experience for Desktop & Mobile.
 * Step 1: Console Overview & Value Proposition (with PWA install & Safari guides)
 * Step 2: Exhaustive Character Creation Studio & Profile Passport
 */
export default function OnboardingScreen({
  isOpen,
  onComplete,
  activeProfile,
  onSaveCreatedProfile,
  sfx,
  pwa,
  gamepadConnected = false,
  focusedTarget,
  setFocusedTarget
}) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Overview, 1: Gamepad Controls, 2: Character Creation
  const [copiedLink, setCopiedLink] = useState(false);
  const totalSteps = 3;

  // Multiavatar Profile Setup State
  const [playerName, setPlayerName] = useState(() => activeProfile?.name || 'Player 1');
  const [avatarSeed, setAvatarSeed] = useState(() => activeProfile?.avatarSeed || activeProfile?.name || 'RetroGamer');
  const [favoriteColor, setFavoriteColor] = useState(() => activeProfile?.favoriteColor || '#ef4444');

  // 1-Click Robust Copy Current URL (Supports HTTP IP / Local Network & HTTPS)
  const handleCopySafariLink = async () => {
    const currentUrl = window.location.href;
    let successful = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        successful = true;
      } catch (err) {
        successful = false;
      }
    }

    if (!successful) {
      const tempInput = document.createElement('textarea');
      tempInput.value = currentUrl;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.focus();
      tempInput.select();
      try {
        successful = document.execCommand('copy');
      } catch (err) {
        successful = false;
      }
      document.body.removeChild(tempInput);
    }

    if (successful) {
      setCopiedLink(true);
      sfx?.playSaveDetected?.();
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Auto-focus logic when opening or changing steps
  useEffect(() => {
    if (isOpen) {
      if (currentStep === 0) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_0' });
      } else if (currentStep === 1) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'random' });
      } else if (currentStep === 2) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
      }
    }
  }, [isOpen, currentStep, setFocusedTarget]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sfx?.playTabSwitch?.();
      if (nextStep === 1) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'random' });
      } else if (nextStep === 2) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
      }
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      sfx?.playTabSwitch?.();
      if (prevStep === 0) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_0' });
      } else if (prevStep === 1) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'random' });
      } else {
        setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
      }
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('retro_onboarding_completed', 'true');
      localStorage.setItem('retro_demo_dismissed', 'true');
    } catch { }

    // Save customized profile
    if (onSaveCreatedProfile) {
      const finalName = playerName.trim() || 'Player 1';
      const finalSeed = avatarSeed.trim() || finalName;
      onSaveCreatedProfile(finalName, finalSeed, favoriteColor);
    }

    sfx?.playGameLaunch?.();
    setFocusedTarget?.({ zone: 'grid', index: 0 });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="onboarding-root animate-fade-in" role="dialog" aria-modal="true">
        {/* Top Header Bar: Skip & Brand */}
        <header className="onboarding-topbar">
          <div className="onboarding-brand">
            <img src={resolveAssetPath('favicon.svg')} alt="Retro Player Logo" className="onboarding-brand-logo" />
            <span className="onboarding-brand-retro">RETRO</span>
            <span className="onboarding-brand-player">PLAYER</span>
          </div>

          <button
            className={`onboarding-skip-btn ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'skip' ? 'gamepad-focused' : ''}`}
            onClick={handleFinish}
            title="Skip Onboarding & Explore Library (START Button)"
          >
            <span className="onboarding-btn-gamepad-badge">
              <span className="gamepad-badge-key">START</span>
            </span>
            <span>Skip to Games</span>
            <ChevronRight size={16} />
          </button>
        </header>

      {/* Main Slide Carousel Body */}
      <main className="onboarding-body-viewport">
        {/* =========================================================
            SLIDE 0: CONSOLE OVERVIEW & SYSTEM VALUE PILLARS
            ========================================================= */}
        {currentStep === 0 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-header-card">
              <h1 className="onboarding-slide-title">
                Play 12 Classic Consoles in Your Browser
              </h1>
              <p className="onboarding-slide-desc">
                Console-grade retro gaming running locally in WebAssembly with low input latency, instant battery saves, and gamepad support.
              </p>
            </div>

            {/* 4 Feature Pillars Grid */}
            <div className="onboarding-pillars-grid">
              {/* Card 1: 12 Consoles & Live Emulation */}
              <div
                className={`onboarding-pillar-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_0' ? 'gamepad-focused' : ''}`}
                tabIndex={0}
                data-onboarding-id="pillar_0"
                onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_0' }); sfx?.playTileNav?.(); }}
              >
                <div className="pillar-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Gamepad2 size={24} />
                </div>
                <div className="pillar-text">
                  <h3>12 Handheld & Home Consoles</h3>
                  <p>Native WASM emulation cores for Game Boy, GBA, SNES, N64, PS1, Sega Genesis, NDS, Arcade, and Atari.</p>
                </div>
                <div className="pillar-system-tags">
                  <span className="system-pill" style={{ '--accent': '#7c3aed' }}>GBA</span>
                  <span className="system-pill" style={{ '--accent': '#ef4444' }}>SNES</span>
                  <span className="system-pill" style={{ '--accent': '#2563eb' }}>N64</span>
                  <span className="system-pill" style={{ '--accent': '#0284c7' }}>PS1</span>
                  <span className="system-pill" style={{ '--accent': '#06b6d4' }}>NDS</span>
                  <span className="system-pill" style={{ '--accent': '#10b981' }}>GENESIS</span>
                  <span className="system-pill" style={{ '--accent': '#dc2626' }}>NES</span>
                  <span className="system-pill" style={{ '--accent': '#f59e0b' }}>GBC</span>
                  <span className="system-pill" style={{ '--accent': '#ec4899' }}>ARCADE</span>
                </div>
              </div>

              {/* Card 2: 100% Free & Open Source GitHub */}
              <a
                href="https://github.com/godarayudhvir/retro-player"
                target="_blank"
                rel="noopener noreferrer"
                className={`onboarding-pillar-card onboarding-github-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_1' ? 'gamepad-focused' : ''}`}
                data-onboarding-id="pillar_1"
                onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_1' }); sfx?.playTileNav?.(); }}
              >
                <div className="pillar-icon-wrap" style={{ background: 'rgba(30, 41, 59, 0.15)', color: '#0f172a' }}>
                  <ExternalLink size={24} />
                </div>
                <div className="pillar-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3>100% Free & Open Source</h3>
                    <span className="github-live-chip">GITHUB</span>
                  </div>
                  <p>Check out our repository at <strong>github.com/godarayudhvir/retro-player</strong> to star the project or contribute.</p>
                </div>
              </a>

              {/* Mobile-only PWA card — always shown on mobile, adapts to browser capability */}
              {isMobileDevice && !pwa?.isStandalone && (
                pwa?.canInstall ? (
                  // Chrome / Edge / Samsung: native install prompt available
                  <button
                    type="button"
                    className={`onboarding-install-card-btn onboarding-pwa-grid-item ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_pwa' ? 'gamepad-focused' : ''}`}
                    data-onboarding-id="pillar_pwa"
                    onClick={() => {
                      setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_pwa' });
                      pwa.promptInstall();
                      sfx?.playThemeSwitch?.();
                    }}
                  >
                    <div className="onboarding-install-icon">
                      <Download size={24} />
                    </div>
                    <div className="onboarding-install-text">
                      <strong>Install Standalone App</strong>
                      <span>Full-screen offline gaming, no browser bar.</span>
                    </div>
                    <ChevronRight size={18} className="install-arrow" />
                  </button>
                ) : isSafariBrowser && isApplePlatform ? (
                  // Safari on iPhone / iPad / macOS
                  <div className={`onboarding-pillar-card onboarding-pwa-grid-item ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_pwa' ? 'gamepad-focused' : ''}`} style={{ gap: '0.6rem' }} data-onboarding-id="pillar_pwa">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
                      <Compass size={24} />
                    </div>
                    <div className="pillar-text">
                      <h3>Add to Home Screen</h3>
                      <p>Tap <em>Share</em> → <em>"Add to Home Screen"</em> for fullscreen offline gaming with Metal hardware acceleration.</p>
                    </div>
                    <button
                      type="button"
                      className={`apple-copy-btn ${copiedLink ? 'is-copied' : ''}`}
                      style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                      onClick={(e) => { e.stopPropagation(); handleCopySafariLink(); }}
                      title="Copy URL to paste in Safari"
                    >
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                ) : (
                  // Any other mobile browser — generic Add to Home Screen tip
                  <div className={`onboarding-pillar-card onboarding-pwa-grid-item ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_pwa' ? 'gamepad-focused' : ''}`} data-onboarding-id="pillar_pwa">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
                      <Download size={24} />
                    </div>
                    <div className="pillar-text">
                      <h3>Add to Home Screen</h3>
                      <p>Open your browser menu and tap <em>"Add to Home Screen"</em> or <em>"Install App"</em> for fullscreen offline play.</p>
                    </div>
                  </div>
                )
              )}

              {/* Card 3: 100% Private Client Saves */}
              <div
                className={`onboarding-pillar-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_2' ? 'gamepad-focused' : ''}`}
                tabIndex={0}
                data-onboarding-id="pillar_2"
                onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_2' }); sfx?.playTileNav?.(); }}
              >
                <div className="pillar-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <ShieldCheck size={24} />
                </div>
                <div className="pillar-text">
                  <h3>100% Private Local Saves</h3>
                  <p>Real in-game battery RAM (.sav), instant quick save states, and playtime statistics stored safely on your device.</p>
                </div>
              </div>

              {/* Card 4: Gamepad & Acoustic Audio */}
              <div
                className={`onboarding-pillar-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_3' ? 'gamepad-focused' : ''}`}
                tabIndex={0}
                data-onboarding-id="pillar_3"
                onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_3' }); sfx?.playTileNav?.(); }}
              >
                <div className="pillar-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  <Volume2 size={24} />
                </div>
                <div className="pillar-text">
                  <h3>Spatial Gamepad & Web Audio</h3>
                  <p>Plug-and-play controller spatial navigation, acoustic synthesized sound effects, and ambient lofi BGM tracks.</p>
                </div>
              </div>
            </div>

            {/* Standalone Install & Platform Guidance Cards (Hidden on Smart TVs or if already installed/standalone) */}
            {!pwa?.isStandalone && !isSmartTv && (pwa?.canInstall || (isSafariBrowser && isApplePlatform)) && (
              <div className="onboarding-pwa-cta-container">
                {pwa?.canInstall ? (
                  <button
                    type="button"
                    className={`onboarding-install-card-btn ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pwa_cta' ? 'gamepad-focused' : ''}`}
                    data-onboarding-id="pwa_cta"
                    onClick={() => {
                      setFocusedTarget?.({ zone: 'onboarding', id: 'pwa_cta' });
                      pwa.promptInstall();
                      sfx?.playThemeSwitch?.();
                    }}
                  >
                    <div className="onboarding-install-icon">
                      <Download size={24} />
                    </div>
                    <div className="onboarding-install-text">
                      <strong>Install Standalone App</strong>
                      <span> Enjoy full-screen offline gaming with zero browser address bar distractions.</span>
                    </div>
                    <ChevronRight size={18} className="install-arrow" />
                  </button>
                ) : (
                  <div className="onboarding-apple-guidance-card animate-fade-in">
                    <div className="apple-guidance-header">
                      <div className="apple-guidance-badge">
                        <Compass size={18} />
                        <span>SAFARI RECOMMENDATION</span>
                      </div>
                      <span className="apple-metal-badge">⚡ METAL HW ACCEL</span>
                    </div>

                    <p className="apple-guidance-text">
                      For optimal <strong>W3C Gamepad API</strong> support and zero-latency audio on Apple devices, add Retro Player to your Home Screen or Dock:
                    </p>

                    <div className="apple-steps-grid">
                      <div className="apple-step-item">
                        <Smartphone size={20} className="apple-step-icon" />
                        <div>
                          <strong>iPhone & iPad</strong>
                          <span>Tap <em>Share</em> (<ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />) &rarr; <em>&quot;Add to Home Screen&quot;</em></span>
                        </div>
                      </div>

                      <div className="apple-step-item">
                        <Monitor size={20} className="apple-step-icon" />
                        <div>
                          <strong>macOS Sonoma & Newer</strong>
                          <span>Click <em>File</em> &rarr; <em>&quot;Add to Dock...&quot;</em> for standalone app mode</span>
                        </div>
                      </div>
                    </div>

                    <div className="apple-copy-link-row">
                      <button
                        type="button"
                        className={`apple-copy-btn ${copiedLink ? 'is-copied' : ''} ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pwa_cta' ? 'gamepad-focused' : ''}`}
                        data-onboarding-id="pwa_cta"
                        onClick={() => {
                          setFocusedTarget?.({ zone: 'onboarding', id: 'pwa_cta' });
                          handleCopySafariLink();
                        }}
                        title="Copy URL to paste in Safari"
                      >
                        {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Link for Safari'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SLIDE 1: EXHAUSTIVE CHARACTER CREATION STUDIO
            ========================================================= */}
        {currentStep === 1 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-header-card">
              <h1 className="onboarding-slide-title">
                Create Your Player Character
              </h1>

              <p className="onboarding-slide-desc">
                Choose an archetype, roll randomized styles, or customize your player handle and color.
              </p>
            </div>

            {/* Exhaustive Character Studio Component */}
            <CharacterStudio
              playerName={playerName}
              setPlayerName={setPlayerName}
              avatarSeed={avatarSeed}
              setAvatarSeed={setAvatarSeed}
              favoriteColor={favoriteColor}
              setFavoriteColor={setFavoriteColor}
              sfx={sfx}
              focusedTarget={focusedTarget}
              setFocusedTarget={setFocusedTarget}
              focusZone="onboarding"
              gamepadConnected={gamepadConnected}
            />
          </div>
        )}

        {/* =========================================================
            SLIDE 2: GAMEPAD CONTROLS & DUALSHOCK VISUALIZER
            ========================================================= */}
        {currentStep === 2 && (
          <div className="onboarding-slide slide-controls animate-slide-up">
            <div className="onboarding-header-card is-compact">
              <h1 className="onboarding-slide-title">
                Interactive Gamepad Controls
              </h1>
              <p className="onboarding-slide-desc">
                Test your controller buttons in real time below to explore native mappings and tactile audio responses. Press <strong>START</strong> anytime to boot into the game library.
              </p>
            </div>

            {/* Interactive DualShock 4 Controller Visualizer */}
            <DualShockVisualizer
              sfx={sfx}
              gamepadConnected={gamepadConnected}
              focusedTarget={focusedTarget}
              setFocusedTarget={setFocusedTarget}
            />
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Footer (Hidden on Phase 3 to give the visualizer full height) */}
      {currentStep < totalSteps - 1 && (
        <footer className="onboarding-footer">
          {/* Step Indicator Dots */}
          <div className="onboarding-dots-indicator" role="tablist" aria-label="Onboarding Progress">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                className={`onboarding-dot ${idx === currentStep ? 'is-active' : ''}`}
                onClick={() => {
                  setCurrentStep(idx);
                  sfx?.playTileNav?.();
                }}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Controls */}
          <div className="onboarding-footer-actions">
            {currentStep > 0 && (
              <button
                className={`onboarding-back-btn ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'back' ? 'gamepad-focused' : ''}`}
                onClick={handleBack}
                title="Previous Step"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}

            <button
              className={`onboarding-primary-btn ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'next' ? 'gamepad-focused' : ''}`}
              onClick={handleNext}
              title={currentStep === 0 ? 'Create Character' : 'View Controls Guide'}
            >
              <span>{currentStep === 0 ? 'Create Character' : 'View Controls'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

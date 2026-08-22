import React, { useState } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  ShieldCheck, 
  Download, 
  ChevronRight, 
  ArrowLeft, 
  User, 
  Dices, 
  Play, 
  Check, 
  Smartphone, 
  Zap, 
  Monitor, 
  Compass, 
  Copy, 
  ExternalLink 
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { AVATAR_PRESETS, RANDOM_SEEDS } from '../hooks/useProfileManager';

const isApplePlatform = typeof navigator !== 'undefined' && (/Macintosh|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
const isSafariBrowser = typeof navigator !== 'undefined' && (/Safari/i.test(navigator.userAgent || '') && !/Chrome|Chromium|CriOS|FxiOS|Edg/i.test(navigator.userAgent || ''));

const COLOR_PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#334155'];

/**
 * Modern Full-Screen Responsive Onboarding Experience for Desktop & Mobile.
 * Streamlined 2-Step Flow:
 * Step 1: Selling the Outcome / Value Proposition
 * Step 2: Multiavatar Player Passport & Profile Customization
 */
export default function OnboardingScreen({
  isOpen,
  onComplete,
  activeProfile,
  onSaveCreatedProfile,
  sfx,
  pwa
}) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Value, 1: Character Creation
  const [copiedLink, setCopiedLink] = useState(false);
  const totalSteps = 2;

  // 1-Click Robust Copy Current URL (Supports HTTP IP / Local Network & HTTPS)
  const handleCopySafariLink = async () => {
    const currentUrl = window.location.href;
    let successful = false;

    // 1. Try modern Async Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        successful = true;
      } catch (err) {
        successful = false;
      }
    }

    // 2. Fallback to execCommand('copy') for HTTP / local LAN IP addresses (192.168.x.x)
    if (!successful) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, currentUrl.length);
        successful = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('Clipboard fallback copy error:', err);
      }
    }

    if (successful) {
      setCopiedLink(true);
      sfx?.playKeyTick?.();
      setTimeout(() => setCopiedLink(false), 2800);
    }
  };

  // Multiavatar Profile Setup State
  const [playerName, setPlayerName] = useState(() => activeProfile?.name || 'Player');
  const [avatarSeed, setAvatarSeed] = useState(() => activeProfile?.avatarSeed || activeProfile?.name || 'RetroGamer');
  const [favoriteColor, setFavoriteColor] = useState(() => activeProfile?.favoriteColor || '#ef4444');

  // Randomize Avatar
  const handleRandomizeAvatar = () => {
    const randomSeed = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)] + Math.floor(Math.random() * 999);
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    setAvatarSeed(randomSeed);
    setFavoriteColor(randomColor);
    sfx?.playFavoriteToggle?.(true);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      sfx?.playTabSwitch?.();
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      sfx?.playTabSwitch?.();
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('retro_onboarding_completed', 'true');
      localStorage.setItem('retro_demo_dismissed', 'true');
    } catch {}

    // Save customized profile
    if (onSaveCreatedProfile) {
      const finalName = playerName.trim() || 'Player';
      const finalSeed = avatarSeed.trim() || finalName;
      onSaveCreatedProfile(finalName, finalSeed, favoriteColor);
    }

    sfx?.playGameLaunch?.();
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="onboarding-root animate-fade-in" role="dialog" aria-modal="true">
      {/* Top Header Bar: Skip & Brand */}
      <header className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-brand-retro">RETRO</span>
          <span className="onboarding-brand-player">PLAYER</span>
        </div>

        <button
          className="onboarding-skip-btn"
          onClick={handleFinish}
          title="Skip Onboarding & Explore Library"
        >
          <span>Skip to Games</span>
          <ChevronRight size={16} />
        </button>
      </header>

      {/* Main Slide Carousel Body */}
      <main className="onboarding-body-viewport">
        {/* =========================================================
            SLIDE 0: SELLING THE OUTCOME / VALUE PROPOSITION
            ========================================================= */}
        {currentStep === 0 && (
          <div className="onboarding-slide animate-slide-up">
            <h1 className="onboarding-slide-title">
              Play 12 Classic Consoles in Your Browser
            </h1>

            <p className="onboarding-slide-desc">
              High-performance retro gaming running 100% locally in your browser sandbox with low input latency, instant battery saves, and USB/Bluetooth gamepad support.
            </p>

            {/* 3 High-Impact Spacious Feature Cards */}
            <div className="onboarding-cards-stack">
              {/* Card 1: 12 Classic Systems & Embedded Platform Strip */}
              <div className="onboarding-showcase-card">
                <div className="onboarding-card-header">
                  <div className="onboarding-card-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                    <Gamepad2 size={24} />
                  </div>
                  <div className="onboarding-card-heading">
                    <strong>12 Handheld & Home Consoles</strong>
                    <span>WASM emulation cores for Game Boy, SNES, N64, PS1, Sega, NDS & arcade classics.</span>
                  </div>
                </div>
                <div className="onboarding-card-tags-row">
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

              {/* Card 2: SRAM Battery Saves & Profiles */}
              <div className="onboarding-showcase-card">
                <div className="onboarding-card-header">
                  <div className="onboarding-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div className="onboarding-card-heading">
                    <strong>100% Private Client-Side Saves & Profiles</strong>
                    <span>Real in-game battery RAM (.sav), quick save states, playtime analytics, and Multiavatar profiles.</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Gamepad & Audio */}
              <div className="onboarding-showcase-card">
                <div className="onboarding-card-header">
                  <div className="onboarding-card-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' }}>
                    <Zap size={24} />
                  </div>
                  <div className="onboarding-card-heading">
                    <strong>Universal Gamepad Navigation & Web Audio</strong>
                    <span>Plug-and-play controller spatial navigation, synthesized acoustic SFX, and ambient BGM jukebox.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standalone Install & Platform Guidance Cards (Only rendered if relevant) */}
            {(pwa?.canInstall || (isSafariBrowser && isApplePlatform)) && (
              <div className="onboarding-pwa-cta-container">
                {pwa?.canInstall ? (
                  <button
                    type="button"
                    className="onboarding-install-card-btn"
                    onClick={() => {
                      pwa.promptInstall();
                      sfx?.playThemeSwitch?.();
                    }}
                  >
                    <div className="onboarding-install-icon">
                      <Download size={24} />
                    </div>
                    <div className="onboarding-install-text">
                      <strong>Install Standalone App</strong>
                      <span>Enjoy full-screen offline gaming with zero browser address bar distractions.</span>
                    </div>
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
                        className={`apple-copy-btn ${copiedLink ? 'is-copied' : ''}`}
                        onClick={handleCopySafariLink}
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
            SLIDE 1: MULTIAVATAR PLAYER PASSPORT & CUSTOMIZATION
            ========================================================= */}
        {currentStep === 1 && (
          <div className="onboarding-slide animate-slide-up">
            <h1 className="onboarding-slide-title">
              Create Your Player Character
            </h1>

            <p className="onboarding-slide-desc">
              Set up your profile identity and customize your avatar with Multiavatar.
            </p>

            {/* Interactive Player Passport Card */}
            <div className="onboarding-passport-card">
              {/* Left Column: Live Avatar Preview */}
              <div className="onboarding-passport-avatar-side">
                <div 
                  className="onboarding-passport-avatar-circle"
                  style={{ borderColor: favoriteColor, boxShadow: `0 8px 24px ${favoriteColor}33` }}
                >
                  <MultiAvatar seed={avatarSeed || playerName || 'Player'} size={110} />
                </div>
                <button
                  type="button"
                  className="onboarding-randomize-btn"
                  onClick={handleRandomizeAvatar}
                  title="Randomize Character"
                >
                  <Dices size={16} />
                  <span>Randomize</span>
                </button>
              </div>

              {/* Right Column: Interactive Editor Controls */}
              <div className="onboarding-passport-form-side">
                {/* Player Name Input */}
                <div className="onboarding-form-group">
                  <label className="onboarding-form-label">Player Name</label>
                  <input
                    type="text"
                    className="onboarding-name-input"
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value);
                      if (!avatarSeed || avatarSeed === playerName) {
                        setAvatarSeed(e.target.value);
                      }
                    }}
                    placeholder="Enter your name..."
                    maxLength={16}
                  />
                </div>

                {/* Avatar Seed Presets */}
                <div className="onboarding-form-group">
                  <label className="onboarding-form-label">Avatar Presets</label>
                  <div className="avatar-presets-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                    {AVATAR_PRESETS.slice(0, 6).map((preset) => {
                      const isSelected = avatarSeed === preset.avatarSeed;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`avatar-preset-chip ${isSelected ? 'is-active' : ''}`}
                          onClick={() => {
                            setAvatarSeed(preset.avatarSeed);
                            setFavoriteColor(preset.favoriteColor);
                            sfx?.playTileNav?.();
                          }}
                        >
                          <MultiAvatar seed={preset.avatarSeed} size={24} />
                          <span className="preset-name">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Favorite Color Palette */}
                <div className="onboarding-form-group">
                  <label className="onboarding-form-label">Profile Accent Color</label>
                  <div className="color-swatch-row">
                    {COLOR_PALETTE.map((col) => (
                      <button
                        key={col}
                        type="button"
                        className={`color-swatch-circle ${favoriteColor === col ? 'is-active' : ''}`}
                        style={{ background: col }}
                        onClick={() => {
                          setFavoriteColor(col);
                          sfx?.playTileNav?.();
                        }}
                      >
                        {favoriteColor === col && <Check size={12} color="#ffffff" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Footer */}
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
              className="onboarding-back-btn"
              onClick={handleBack}
              title="Previous Step"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}

          <button
            className="onboarding-primary-btn"
            onClick={handleNext}
            title={currentStep === totalSteps - 1 ? 'Start Playing' : 'Continue to Next Step'}
          >
            <span>{currentStep === totalSteps - 1 ? 'Start Playing' : 'Continue'}</span>
            {currentStep === totalSteps - 1 ? <Play size={18} fill="#ffffff" /> : <ChevronRight size={18} />}
          </button>
        </div>
      </footer>
    </div>
  );
}

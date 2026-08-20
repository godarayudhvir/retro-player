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
  Keyboard, 
  Play, 
  LogOut,
  MousePointer,
  Check,
  Smartphone,
  Zap,
  Monitor
} from 'lucide-react';
import MiiAvatar from './MiiAvatar';
import { INITIAL_MII_DATA } from '../hooks/useProfileManager';

const SKIN_PALETTE = ['#fed7aa', '#ffd1a4', '#fde047', '#fef08a', '#fbcfe8', '#d6a374', '#a16207', '#78350f'];
const HAIR_PALETTE = ['#451a03', '#1e293b', '#78350f', '#d97706', '#f59e0b', '#dc2626', '#3b82f6', '#10b981', '#a855f7', '#64748b'];
const SHIRT_PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#334155'];

/**
 * Modern Full-Screen Responsive Onboarding Experience for Desktop & Mobile.
 * Streamlined 3-Step Flow:
 * Step 1: Selling the Outcome / Value Proposition
 * Step 2: Pokémon-Style Interactive Player Passport & Character Creation
 * Step 3: Controller Exit Combos (L3+R3 / Select+Start) & Essential Shortcuts
 */
export default function OnboardingScreen({
  isOpen,
  onComplete,
  activeProfile,
  onSaveCreatedProfile,
  sfx,
  pwa
}) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Value, 1: Character Creation, 2: Tips
  const totalSteps = 3;

  // Character Creation State (Pokémon-Style Player Setup)
  const [playerName, setPlayerName] = useState(() => activeProfile?.name || 'Red');
  const [customMii, setCustomMii] = useState(() => activeProfile?.miiData ? { ...activeProfile.miiData } : { ...INITIAL_MII_DATA, hairStyle: 1, favoriteColor: '#ef4444' });
  const [activeCustomTab, setActiveCustomTab] = useState('hair'); // 'hair', 'skin', 'eyes', 'shirt'

  // Randomize Avatar
  const handleRandomizeAvatar = () => {
    const randomSkin = SKIN_PALETTE[Math.floor(Math.random() * SKIN_PALETTE.length)];
    const randomHair = HAIR_PALETTE[Math.floor(Math.random() * HAIR_PALETTE.length)];
    const randomShirt = SHIRT_PALETTE[Math.floor(Math.random() * SHIRT_PALETTE.length)];

    setCustomMii({
      gender: Math.random() > 0.5 ? 'male' : 'female',
      faceShape: Math.floor(Math.random() * 4),
      skinColor: randomSkin,
      hairStyle: Math.floor(Math.random() * 6),
      hairColor: randomHair,
      eyeType: Math.floor(Math.random() * 4),
      eyeColor: '#1e293b',
      eyebrowType: Math.floor(Math.random() * 3),
      noseType: Math.floor(Math.random() * 3),
      mouthType: Math.floor(Math.random() * 4),
      glasses: 0,
      mustache: 0,
      favoriteColor: randomShirt
    });
    sfx?.playDiceRoll?.();
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
      onSaveCreatedProfile(playerName.trim() || 'Player', customMii, customMii.favoriteColor);
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
          title="Skip Onboarding & Explore Library (ESC / B)"
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
            <div className="onboarding-hero-icon-cluster">
              <div className="onboarding-hero-bubble bubble-primary">
                <Gamepad2 size={42} color="#ffffff" />
              </div>
              <div className="onboarding-hero-bubble bubble-accent">
                <Sparkles size={24} color="#ffffff" />
              </div>
            </div>

            <h1 className="onboarding-slide-title">
              Zero Install. Instant Play. <br />
              <span className="onboarding-text-gradient">Pure Retro Gaming in Your Browser.</span>
            </h1>

            <p className="onboarding-slide-desc">
              Experience authentic console emulation running 100% locally on your device via WebAssembly with fluid hardware-accelerated rendering and low controller input latency.
            </p>

            <div className="onboarding-features-grid">
              <div className="onboarding-feature-pill">
                <div className="onboarding-feat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                  <Gamepad2 size={22} />
                </div>
                <div className="onboarding-feat-text">
                  <strong>12 Classic Platforms</strong>
                  <span>Game Boy, SNES, N64, PS1, Sega, NDS & arcade.</span>
                </div>
              </div>

              <div className="onboarding-feature-pill">
                <div className="onboarding-feat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                  <ShieldCheck size={22} />
                </div>
                <div className="onboarding-feat-text">
                  <strong>100% Private Custom ROMs</strong>
                  <span>Drag & drop game dumps. ROMs run in local RAM.</span>
                </div>
              </div>

              <div className="onboarding-feature-pill">
                <div className="onboarding-feat-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#0891b2' }}>
                  <Zap size={22} />
                </div>
                <div className="onboarding-feat-text">
                  <strong>Local WASM Engine</strong>
                  <span>Client-side execution with low controller input latency.</span>
                </div>
              </div>

              {/* Entire PWA Card as an interactive CTA button */}
              <button
                type="button"
                className={`onboarding-feature-pill onboarding-pwa-card ${pwa?.isStandalone ? 'is-standalone' : 'is-actionable'}`}
                onClick={() => {
                  if (pwa?.promptInstall && !pwa?.isStandalone) {
                    pwa.promptInstall();
                  }
                  sfx?.playThemeSwitch?.();
                }}
                disabled={pwa?.isStandalone}
                title={pwa?.isStandalone ? 'Retro Player is running in standalone app mode' : 'Click to install Retro Player to home screen or desktop'}
                aria-label={pwa?.isStandalone ? 'App Installed and running standalone' : 'Install Retro Player Standalone App'}
              >
                <div className="onboarding-feat-icon-wrap" style={{ background: pwa?.isStandalone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)', color: pwa?.isStandalone ? '#059669' : '#7c3aed' }}>
                  {pwa?.isStandalone ? <Check size={22} /> : <Download size={22} />}
                </div>
                <div className="onboarding-feat-text">
                  <strong>{pwa?.isStandalone ? 'Installed & Offline Ready' : 'Optional Standalone App'}</strong>
                  <span>
                    {pwa?.isStandalone 
                      ? 'Running in full standalone mode with offline cache.' 
                      : 'Tap to add to home screen or desktop for offline play.'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SLIDE 1: POKÉMON-STYLE INTERACTIVE PLAYER PASSPORT & MII
            ========================================================= */}
        {currentStep === 1 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-step-badge">
              <User size={14} />
              <span>STEP 2 OF 3: PLAYER PASSPORT</span>
            </div>

            <h1 className="onboarding-slide-title">
              Create Your Player Character
            </h1>

            <p className="onboarding-slide-desc">
              Set up your profile identity and customize your personal Nintendo Mii avatar.
            </p>

            {/* Interactive Player Passport Card */}
            <div className="onboarding-passport-card">
              {/* Left Column: Live Avatar Preview */}
              <div className="onboarding-passport-avatar-side">
                <div 
                  className="onboarding-passport-mii-circle"
                  style={{ borderColor: customMii.favoriteColor || '#ef4444' }}
                >
                  <MiiAvatar miiData={customMii} size={110} />
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
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={16}
                  />
                </div>

                {/* Quick Style Category Tabs */}
                <div className="onboarding-mii-subtabs">
                  <button
                    type="button"
                    className={`onboarding-subtab ${activeCustomTab === 'hair' ? 'is-active' : ''}`}
                    onClick={() => setActiveCustomTab('hair')}
                  >
                    Hairstyle
                  </button>
                  <button
                    type="button"
                    className={`onboarding-subtab ${activeCustomTab === 'skin' ? 'is-active' : ''}`}
                    onClick={() => setActiveCustomTab('skin')}
                  >
                    Skin
                  </button>
                  <button
                    type="button"
                    className={`onboarding-subtab ${activeCustomTab === 'eyes' ? 'is-active' : ''}`}
                    onClick={() => setActiveCustomTab('eyes')}
                  >
                    Face
                  </button>
                  <button
                    type="button"
                    className={`onboarding-subtab ${activeCustomTab === 'shirt' ? 'is-active' : ''}`}
                    onClick={() => setActiveCustomTab('shirt')}
                  >
                    Shirt Color
                  </button>
                </div>

                {/* Subtab Dynamic Option Palette */}
                <div className="onboarding-mii-options-area">
                  {activeCustomTab === 'hair' && (
                    <div className="onboarding-palette-row">
                      {[0, 1, 2, 3, 4, 5].map((styleIdx) => (
                        <button
                          key={styleIdx}
                          type="button"
                          className={`onboarding-opt-chip ${customMii.hairStyle === styleIdx ? 'is-active' : ''}`}
                          onClick={() => {
                            setCustomMii(m => ({ ...m, hairStyle: styleIdx }));
                            sfx?.playTileNav?.();
                          }}
                        >
                          Style {styleIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeCustomTab === 'skin' && (
                    <div className="onboarding-palette-colors">
                      {SKIN_PALETTE.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className={`onboarding-col-circle ${customMii.skinColor === col ? 'is-active' : ''}`}
                          style={{ background: col }}
                          onClick={() => {
                            setCustomMii(m => ({ ...m, skinColor: col }));
                            sfx?.playTileNav?.();
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {activeCustomTab === 'eyes' && (
                    <div className="onboarding-palette-row">
                      {[0, 1, 2, 3].map((eyeIdx) => (
                        <button
                          key={eyeIdx}
                          type="button"
                          className={`onboarding-opt-chip ${customMii.eyeType === eyeIdx ? 'is-active' : ''}`}
                          onClick={() => {
                            setCustomMii(m => ({ ...m, eyeType: eyeIdx }));
                            sfx?.playTileNav?.();
                          }}
                        >
                          Eyes {eyeIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeCustomTab === 'shirt' && (
                    <div className="onboarding-palette-colors">
                      {SHIRT_PALETTE.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className={`onboarding-col-circle ${customMii.favoriteColor === col ? 'is-active' : ''}`}
                          style={{ background: col }}
                          onClick={() => {
                            setCustomMii(m => ({ ...m, favoriteColor: col }));
                            sfx?.playTileNav?.();
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SLIDE 2: CONTROLLER EXIT COMBOS & PRO-TIPS
            ========================================================= */}
        {currentStep === 2 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-step-badge">
              <Sparkles size={14} />
              <span>STEP 3 OF 3: CONTROLS & EXIT COMBOS</span>
            </div>

            <h1 className="onboarding-slide-title">
              You&apos;re Ready to Play! 🚀
            </h1>

            <p className="onboarding-slide-desc">
              Master these essential shortcuts to control games and return to your library effortlessly:
            </p>

            <div className="onboarding-tips-list">
              {/* Highlighted Controller Quick Exit Banner */}
              <div className="onboarding-tip-row is-featured-tip">
                <div className="onboarding-tip-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <LogOut size={24} />
                </div>
                <div className="onboarding-tip-content">
                  <strong>🎮 Controller Quick Exit</strong>
                  <p>
                    Press <strong>L3 + R3</strong> (Click Both Thumbsticks) or <strong>Select + Start</strong> at the same time to instantly exit any running game and return to the library!
                  </p>
                </div>
              </div>

              {/* Touchpad Pointer & NDS Stylus */}
              <div className="onboarding-tip-row">
                <div className="onboarding-tip-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                  <MousePointer size={22} />
                </div>
                <div className="onboarding-tip-content">
                  <strong>DualShock 4 Touchpad Pointer</strong>
                  <p>The PS4/PS5 touchpad acts as an on-screen mouse pointer for browsing and serves as the touchscreen stylus in Nintendo DS games.</p>
                </div>
              </div>

              {/* Universal Keyboard Shortcuts */}
              <div className="onboarding-tip-row">
                <div className="onboarding-tip-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                  <Keyboard size={22} />
                </div>
                <div className="onboarding-tip-content">
                  <strong>Universal Keyboard Shortcuts</strong>
                  <p>Use <strong>Arrow Keys / WASD</strong> to navigate, <strong>Enter</strong> to launch, <strong>ESC</strong> to exit games, <strong>⌘K</strong> for quick search, and <strong>D</strong> for live diagnostics.</p>
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

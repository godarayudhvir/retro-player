import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  ShieldCheck, 
  Download, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Keyboard, 
  Play, 
  X,
  Layers,
  ExternalLink
} from 'lucide-react';
import MiiAvatar from './MiiAvatar';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Modern Full-Screen Responsive Onboarding Experience for Desktop & Mobile.
 * Inspired by modern best practices (Mobbin analysis, Duolingo, Netflix, WanderWise):
 * 1. Selling the Outcome (WASM Emulation, zero-install, 10+ consoles)
 * 2. Personalization (Favorite consoles/eras selection)
 * 3. Human Touch & User Management (Mii Avatars, Profile creation & editing)
 * 4. Controller & Shortcut Tips (Quick "Aha!" moment)
 */
export default function OnboardingScreen({
  isOpen,
  onComplete,
  systems = [],
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  onEditProfile,
  onDeleteProfile,
  sfx,
  focusedTarget,
  setFocusedTarget,
  gamepadConnected = false
}) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Value, 1: Systems, 2: Profiles, 3: Tips
  const [selectedSystems, setSelectedSystems] = useState(() => new Set(['gba', 'snes', 'n64', 'playstation', 'nds']));
  const totalSteps = 4;

  // Toggle favorite system chip
  const toggleSystemSelection = (sysKey) => {
    setSelectedSystems(prev => {
      const next = new Set(prev);
      if (next.has(sysKey)) next.delete(sysKey);
      else next.add(sysKey);
      sfx?.playTileNav?.();
      return next;
    });
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
              Zero Install. Zero Lag. <br />
              <span className="onboarding-text-gradient">Pure Retro Gaming in Your Browser.</span>
            </h1>

            <p className="onboarding-slide-desc">
              Experience authentic console emulation running 100% locally on your device via WebAssembly with fluid hardware-accelerated rendering and ultra-low controller input lag.
            </p>

            <div className="onboarding-features-grid">
              <div className="onboarding-feature-pill">
                <div className="onboarding-feat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                  <Gamepad2 size={20} />
                </div>
                <div className="onboarding-feat-text">
                  <strong>10+ Legendary Platforms</strong>
                  <span>Game Boy, SNES, N64, PS1, Sega, NDS & more.</span>
                </div>
              </div>

              <div className="onboarding-feature-pill">
                <div className="onboarding-feat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                  <ShieldCheck size={20} />
                </div>
                <div className="onboarding-feat-text">
                  <strong>100% Private Custom ROMs</strong>
                  <span>Drag & drop your game dumps. ROMs run strictly in local RAM.</span>
                </div>
              </div>

              <div className="onboarding-feature-pill">
                <div className="onboarding-feat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed' }}>
                  <Download size={20} />
                </div>
                <div className="onboarding-feat-text">
                  <strong>Installable PWA App</strong>
                  <span>Save to your home screen or desktop for full offline play.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SLIDE 1: PERSONALIZATION / ERA & CONSOLE SELECTION
            ========================================================= */}
        {currentStep === 1 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-step-badge">
              <Layers size={14} />
              <span>STEP 2 OF 4: PERSONALIZATION</span>
            </div>

            <h1 className="onboarding-slide-title">
              What are your favorite retro consoles?
            </h1>

            <p className="onboarding-slide-desc">
              Select the platforms you love. We&apos;ll tailor your library discovery feed and recommendations.
            </p>

            <div className="onboarding-systems-grid">
              {systems.map(sys => {
                const isSelected = selectedSystems.has(sys.key);
                return (
                  <button
                    key={sys.key}
                    type="button"
                    className={`onboarding-system-card ${isSelected ? 'is-selected' : ''}`}
                    style={{ '--sys-accent': sys.color || '#3b82f6' }}
                    onClick={() => toggleSystemSelection(sys.key)}
                  >
                    <div className="onboarding-sys-icon-wrap">
                      {sys.icon && <img src={resolveAssetPath(sys.icon)} alt="" className="onboarding-sys-icon" />}
                    </div>
                    <div className="onboarding-sys-meta">
                      <span className="onboarding-sys-name">{sys.name}</span>
                      <span className="onboarding-sys-badge">{sys.gameCount || 0} Games</span>
                    </div>
                    <div className="onboarding-sys-checkbox">
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            SLIDE 2: HUMAN TOUCH & COMPREHENSIVE USER MANAGEMENT
            ========================================================= */}
        {currentStep === 2 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-step-badge">
              <User size={14} />
              <span>STEP 3 OF 4: PLAYERS & PROFILES</span>
            </div>

            <h1 className="onboarding-slide-title">
              Who&apos;s Playing Today?
            </h1>

            <p className="onboarding-slide-desc">
              Create your personalized Nintendo Mii avatar. Each player keeps their own independent saves, playtime records, and starred favorites.
            </p>

            <div className="onboarding-profiles-grid">
              {profiles.map(p => {
                const isActive = p.id === activeProfileId;
                return (
                  <div
                    key={p.id}
                    className={`onboarding-profile-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      onSelectProfile?.(p.id);
                      sfx?.playTileNav?.();
                    }}
                  >
                    <div 
                      className="onboarding-profile-avatar"
                      style={{ borderColor: p.favoriteColor || '#3b82f6' }}
                    >
                      <MiiAvatar miiData={p.miiData || {}} size={72} />
                      {isActive && (
                        <div className="onboarding-avatar-active-badge">
                          <Check size={12} color="#ffffff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="onboarding-profile-name">{p.name}</span>

                    {/* Profile Action Toolbar */}
                    <div className="onboarding-profile-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="onboarding-prof-tool-btn"
                        onClick={() => onEditProfile?.(p)}
                        title={`Edit ${p.name}'s Mii Avatar`}
                        aria-label="Edit Profile"
                      >
                        <Edit3 size={13} />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          className="onboarding-prof-tool-btn is-delete"
                          onClick={() => onDeleteProfile?.(p.id)}
                          title={`Delete ${p.name}`}
                          aria-label="Delete Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Player Card */}
              <div
                className="onboarding-profile-card add-card"
                onClick={() => {
                  onCreateNewProfile?.();
                  sfx?.playModalOpen?.();
                }}
              >
                <div className="onboarding-profile-avatar add-circle">
                  <Plus size={32} color="#64748b" />
                </div>
                <span className="onboarding-profile-name">Add Player</span>
                <span className="onboarding-add-sub">Create Mii</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SLIDE 3: CONTROLLER & TOUCH PRO-TIPS
            ========================================================= */}
        {currentStep === 3 && (
          <div className="onboarding-slide animate-slide-up">
            <div className="onboarding-step-badge">
              <Sparkles size={14} />
              <span>STEP 4 OF 4: READY TO PLAY</span>
            </div>

            <h1 className="onboarding-slide-title">
              You&apos;re Ready to Game! 🚀
            </h1>

            <p className="onboarding-slide-desc">
              Here are a few quick tips to get the most out of your Retro Player console:
            </p>

            <div className="onboarding-tips-list">
              <div className="onboarding-tip-row">
                <div className="onboarding-tip-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                  <Gamepad2 size={22} />
                </div>
                <div className="onboarding-tip-content">
                  <strong>Plug-and-Play Gamepads</strong>
                  <p>Connect any USB or Bluetooth controller (PS5, PS4 DualShock, Xbox, Switch Pro). The DualShock 4 touchpad also works as an on-screen mouse!</p>
                </div>
              </div>

              <div className="onboarding-tip-row">
                <div className="onboarding-tip-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                  <Keyboard size={22} />
                </div>
                <div className="onboarding-tip-content">
                  <strong>Universal Keyboard Shortcuts</strong>
                  <p>Use <strong>Arrow Keys / WASD</strong> to navigate, <strong>Enter</strong> to select, <strong>ESC / B</strong> to go back, <strong>⌘K</strong> for quick search, and <strong>D</strong> for live FPS diagnostics.</p>
                </div>
              </div>

              <div className="onboarding-tip-row">
                <div className="onboarding-tip-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                  <ShieldCheck size={22} />
                </div>
                <div className="onboarding-tip-content">
                  <strong>Instant Battery SRAM Saves</strong>
                  <p>In-game progress is automatically saved to your browser&apos;s IndexedDB and instantly re-injected on your next play session.</p>
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

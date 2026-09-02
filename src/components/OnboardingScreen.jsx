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
  Volume2,
  Trophy,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Keyboard,
  Save,
  Cpu,
  FileJson,
  ArrowDownToLine,
  Radio,
  Flame,
  Sparkles,
  Sliders,
  HardDrive
} from 'lucide-react';
import CharacterStudio from './CharacterStudio';
import DualShockVisualizer from './DualShockVisualizer';
import MobileOnboardingScreen from './MobileOnboardingScreen';
import { resolveAssetPath } from '../utils/assetPath';

const isApplePlatform = typeof navigator !== 'undefined' && (/Macintosh|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
const isSafariBrowser = typeof navigator !== 'undefined' && (/Safari/i.test(navigator.userAgent || '') && !/Chrome|Chromium|CriOS|FxiOS|Edg/i.test(navigator.userAgent || ''));
const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent || '');
const isSmartTv = typeof navigator !== 'undefined' && /SmartTV|Tizen|Web0S|BRAVIA|NetCast|Viera|AppleTV|HbbTV|CrKey/i.test(navigator.userAgent || '');

/**
 * Modern Full-Screen Responsive Onboarding Experience for Desktop & Mobile.
 * Automatically delegates to dedicated MobileOnboardingScreen on mobile touch devices.
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
  setFocusedTarget,
  isMobile = false
}) {
  // If explicitly flagged as mobile or matched via mobile viewport, render dedicated MobileOnboardingScreen
  if (isMobile || isMobileDevice) {
    return (
      <MobileOnboardingScreen
        isOpen={isOpen}
        onComplete={onComplete}
        activeProfile={activeProfile}
        onSaveCreatedProfile={onSaveCreatedProfile}
        sfx={sfx}
        pwa={pwa}
        gamepadConnected={gamepadConnected}
        focusedTarget={focusedTarget}
        setFocusedTarget={setFocusedTarget}
      />
    );
  }

  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(0); // Desktop: 0: Overview, 1: Character Studio, 2: Gamepad Controls
  const [copiedLink, setCopiedLink] = useState(false);

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

  const viewportRef = React.useRef(null);

  // Auto-focus logic & scroll-to-top when opening or changing steps
  useEffect(() => {
    if (isOpen) {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = 0;
      }
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
      <main ref={viewportRef} className="onboarding-body-viewport">
        {/* =========================================================
            SLIDE 0: CONSOLE OVERVIEW & SYSTEM VALUE PILLARS (Option A: 2-Column Hero Showcase)
            ========================================================= */}
        {currentStep === 0 && (
          <div className="onboarding-slide onboarding-hero-layout animate-slide-up">
            {/* Left Column: Title & 4 Feature Pillars */}
            <div className="onboarding-hero-left">
              <div className="onboarding-header-card">
                <h1 className="onboarding-slide-title">
                  The High-Performance, Zero-Overhead Web Emulation Station
                </h1>
                <p className="onboarding-slide-desc">
                  Play classic retro consoles in your browser via low-latency WebAssembly. Real in-game battery saves, universal achievements, and full gamepad support.
                </p>
              </div>

              {/* 4 Feature Pillars (2x2 Grid) */}
              <div className="onboarding-pillars-grid">
                {/* Card 1: 12 Emulated Systems & Native WASM Cores */}
                <div
                  className={`onboarding-pillar-card ${gamepadConnected && focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_0' ? 'gamepad-focused' : ''}`}
                  tabIndex={0}
                  data-onboarding-id="pillar_0"
                  onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_0' }); sfx?.playTileNav?.(); }}
                >
                  <div className="pillar-header-row">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                      <Cpu size={22} />
                    </div>
                    <span className="pillar-badge-tag">12 SYSTEMS</span>
                  </div>
                  <div className="pillar-text">
                    <h3>12 Native WASM Cores</h3>
                    <p>Low-latency WebAssembly emulation cores with smooth 60 FPS V-Sync, CRT scanline shaders, and fast-forward.</p>
                  </div>

                  {/* Graphic: 12 Consoles in a Clean 4x3 Grid with Larger SVGs */}
                  <div className="pillar-visual-graphic-wrap">
                    <div className="pillar-system-icons-grid-4x3">
                      {[
                        { key: 'gba', name: 'GBA', svg: 'gba.svg' },
                        { key: 'snes', name: 'SNES', svg: 'snes.svg' },
                        { key: 'n64', name: 'N64', svg: 'n64.svg' },
                        { key: 'psx', name: 'PS1', svg: 'psx.svg' },
                        { key: 'nds', name: 'NDS', svg: 'nds.svg' },
                        { key: 'genesis', name: 'Genesis', svg: 'genesis.svg' },
                        { key: 'nes', name: 'NES', svg: 'nes.svg' },
                        { key: 'gbc', name: 'GBC', svg: 'gbc.svg' },
                        { key: 'gb', name: 'GB', svg: 'gb.svg' },
                        { key: 'arcade', name: 'Arcade', svg: 'arcade.svg' },
                        { key: 'gamegear', name: 'Game Gear', svg: 'gamegear.svg' },
                        { key: 'atari2600', name: 'Atari', svg: 'atari2600.svg' }
                      ].map(sys => (
                        <div key={sys.key} className="pillar-console-card-item" title={sys.name}>
                          <img 
                            src={resolveAssetPath(`assets/platforms/${sys.svg}`)} 
                            alt={sys.name} 
                            className="pillar-console-svg-large"
                          />
                          <span>{sys.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: Battery RAM, Auto-Resume & Quick States (In-App UX Demo) */}
                <div
                  className={`onboarding-pillar-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_1' ? 'gamepad-focused' : ''}`}
                  tabIndex={0}
                  data-onboarding-id="pillar_1"
                  onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_1' }); sfx?.playTileNav?.(); }}
                >
                  <div className="pillar-header-row">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#10b981' }}>
                      <Save size={22} />
                    </div>
                    <span className="pillar-badge-tag green">SAVE ENGINE</span>
                  </div>
                  <div className="pillar-text">
                    <h3>Battery Saves &amp; Auto-Resume</h3>
                    <p>Real in-game battery RAM (.sav) exports, instant quick save states, and auto-resume right where you left off.</p>
                  </div>

                  {/* Graphic: In-App UX Demo for Battery RAM & Storage Studio Export */}
                  <div className="pillar-visual-graphic-wrap">
                    <div className="pillar-ux-demo-card save-demo">
                      <div className="save-demo-header">
                        <div className="save-demo-file-info">
                          <HardDrive size={15} color="#10b981" />
                          <span className="save-demo-filename">pokemon-emerald.sav</span>
                          <span className="save-demo-size">128 KB</span>
                        </div>
                        <span className="save-demo-status">SAVED</span>
                      </div>
                      <div className="save-demo-actions-row">
                        <div className="save-demo-btn export-btn">
                          <ArrowDownToLine size={13} />
                          <span>Export .SAV</span>
                        </div>
                        <div className="save-demo-btn resume-btn">
                          <span className="resume-dot" />
                          <span>Auto-Resume Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Universal Achievements & Pokémon Milestones (In-App UX Demo) */}
                <div
                  className={`onboarding-pillar-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_2' ? 'gamepad-focused' : ''}`}
                  tabIndex={0}
                  data-onboarding-id="pillar_2"
                  onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_2' }); sfx?.playTileNav?.(); }}
                >
                  <div className="pillar-header-row">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
                      <Trophy size={22} />
                    </div>
                    <span className="pillar-badge-tag gold">TROPHIES</span>
                  </div>
                  <div className="pillar-text">
                    <h3>Achievements &amp; Milestones</h3>
                    <p>Earn trophies for gaming habits like <em>Night Owl</em> sessions, <em>Rage Quits</em>, and <em>Button Mashing</em> — plus authentic cartridge milestones like conquering Pokémon Gyms and becoming Champion.</p>
                  </div>

                  {/* Graphic: In-App UX Demo with Kanto 3/8 Badge Case & Ironman Trophy */}
                  <div className="pillar-visual-graphic-wrap">
                    {/* Badge Case Strip (3/8 Unlocked) */}
                    <div className="pillar-badge-case-header">
                      <span className="badge-case-title">🪪 KANTO LEAGUE</span>
                      <span className="badge-case-progress">3 / 8 BADGES</span>
                    </div>
                    <div className="pillar-badges-showcase-row">
                      {[
                        { id: 'boulder', unlocked: true },
                        { id: 'cascade', unlocked: true },
                        { id: 'thunder', unlocked: true },
                        { id: 'rainbow', unlocked: false },
                        { id: 'soul', unlocked: false },
                        { id: 'marsh', unlocked: false },
                        { id: 'volcano', unlocked: false },
                        { id: 'earth', unlocked: false }
                      ].map((item) => (
                        <div key={item.id} className={`pillar-gym-badge-box ${item.unlocked ? 'is-unlocked' : 'is-locked'}`} title={`${item.id.toUpperCase()} BADGE`}>
                          <img 
                            src={resolveAssetPath(`assets/badges/kanto/${item.id}.webp`)} 
                            alt={`${item.id} badge`}
                            className={`pillar-gym-badge-img ${item.unlocked ? 'is-earned' : 'is-locked'}`}
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Real-time In-App Trophy Card: Ironman Endurance */}
                    <div className="pillar-ux-trophy-card tier-platinum">
                      <div className="trophy-mini-icon-box">
                        <Flame size={15} color="#38bdf8" />
                      </div>
                      <div className="trophy-mini-body">
                        <div className="trophy-mini-top">
                          <strong className="trophy-mini-title">Ironman Endurance</strong>
                          <span className="trophy-mini-pts">+20G</span>
                        </div>
                        <span className="trophy-mini-sub">Play a single game continuously for 7 hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Gamepad, Keyboard, Touch UI & Battery Alert (In-App UX Demo) */}
                <div
                  className={`onboarding-pillar-card ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'pillar_3' ? 'gamepad-focused' : ''}`}
                  tabIndex={0}
                  data-onboarding-id="pillar_3"
                  onClick={() => { setFocusedTarget?.({ zone: 'onboarding', id: 'pillar_3' }); sfx?.playTileNav?.(); }}
                >
                  <div className="pillar-header-row">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                      <Gamepad2 size={22} />
                    </div>
                    <span className="pillar-badge-tag purple">CONTROLS</span>
                  </div>
                  <div className="pillar-text">
                    <h3>Universal Controls &amp; Battery HUD</h3>
                    <p>Plug &amp; play PlayStation (DualShock/DualSense), Xbox, Switch Pro, and Steam Deck controllers, haptic mobile touch overlays, full keyboard spatial navigation, and live low-battery gamepad warnings.</p>
                  </div>

                  {/* Graphic: In-App UX Demo with Real Topbar Gamepad & Battery HUD Widgets */}
                  <div className="pillar-visual-graphic-wrap">
                    {/* Topbar Gamepad HUD Demo Row */}
                    <div className="pillar-topbar-hud-demo-row">
                      {/* Real In-App Gamepad Pill (Active & Charging) */}
                      <div className="status-pill status-gamepad is-connected demo-pill" title="Wireless Controller (Charging)">
                        <Gamepad2 size={16} />
                        <span className="battery-badge">
                          <BatteryCharging size={15} className="battery-icon is-charging" />
                          <span className="battery-percent-text">100%</span>
                          <span className="charging-tag">⚡</span>
                        </span>
                      </div>

                      {/* Real In-App Gamepad Pill (Low Battery Warning) */}
                      <div className="status-pill status-gamepad is-connected is-battery-low demo-pill" title="DualSense Controller (15% Low Battery)">
                        <Gamepad2 size={16} />
                        <span className="battery-badge">
                          <BatteryLow size={15} className="battery-icon is-low" />
                          <span className="battery-percent-text">15%</span>
                        </span>
                      </div>
                    </div>

                    {/* Spatial Navigation Keycaps */}
                    <div className="pillar-keybinds-showcase-row">
                      <span className="pillar-keycap-btn">D-PAD</span>
                      <span className="pillar-keycap-btn primary">A / ✕</span>
                      <span className="pillar-keycap-btn primary">B / ◯</span>
                      <span className="pillar-keycap-btn">START</span>
                      <span className="pillar-keycap-btn keyb">ENTER ↵</span>
                      <span className="pillar-keycap-btn keyb">ESC</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only Standalone Install & Platform Guidance Cards (Hidden on Desktop & Smart TVs) */}
              {isMobileDevice && !pwa?.isStandalone && !isSmartTv && (pwa?.canInstall || (isSafariBrowser && isApplePlatform)) && (
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
                        Run Retro Player without browser toolbars using Safari's native web app engine:
                      </p>

                      <div className="apple-steps-grid">
                        <div className="apple-step-item">
                          <Smartphone size={20} className="apple-step-icon" />
                          <div>
                            <strong>iPhone &amp; iPad</strong>
                            <span>Tap <em>Share</em> &rarr; <em>&quot;Add to Home Screen&quot;</em></span>
                          </div>
                        </div>

                        <div className="apple-step-item">
                          <Monitor size={20} className="apple-step-icon" />
                          <div>
                            <strong>macOS Sonoma &amp; Newer</strong>
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

            {/* Right Column: 2 Stacked Showcase Frames (Desktop & TV Only) */}
            <div className="onboarding-hero-right">
              {/* Frame 1: DS Console Firmware */}
              <div className="onboarding-hero-preview-frame">
                <div className="onboarding-hero-preview-header">
                  <div className="onboarding-hero-preview-tabs">
                    <span className="hero-preview-pill active">
                      🎮 DUAL-SCREEN CONSOLE FIRMWARE
                    </span>
                  </div>
                  <span className="hero-preview-live-tag">⚡ LIVE WASM</span>
                </div>

                <div className="onboarding-hero-img-wrap">
                  <img 
                    src={resolveAssetPath('docs-screenshots/ds-view-medium.webp')} 
                    alt="Dual-Screen Console Firmware UI" 
                    className="onboarding-hero-img"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Frame 2: Instant Gameplay */}
              <div className="onboarding-hero-preview-frame">
                <div className="onboarding-hero-preview-header">
                  <div className="onboarding-hero-preview-tabs">
                    <span className="hero-preview-pill active">
                      ⚡ INSTANT LOW-LATENCY GAMEPLAY
                    </span>
                  </div>
                  <span className="hero-preview-live-tag">🎮 60 FPS</span>
                </div>

                <div className="onboarding-hero-img-wrap">
                  <img 
                    src={resolveAssetPath('docs-screenshots/ingame-gba.webp')} 
                    alt="In-Game Emulation Gameplay" 
                    className="onboarding-hero-img"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SLIDE 1: EXHAUSTIVE CHARACTER CREATION STUDIO
            ========================================================= */}
        {currentStep === 1 && (
          <div className="onboarding-slide slide-character animate-slide-up">
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
            SLIDE 2: GAMEPAD CONTROLS & DUALSHOCK VISUALIZER (Desktop & TV only)
            ========================================================= */}
        {!isMobileDevice && currentStep === 2 && (
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

      {/* Bottom Sticky Action Footer (Hidden on Phase 3 on Desktop to give the visualizer full height; visible on Phase 2 on Mobile) */}
      {(!isMobileDevice ? currentStep < totalSteps - 1 : true) && (
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
              title={currentStep === 0 ? 'Create Character' : isMobileDevice ? 'Start Playing' : 'View Controls Guide'}
            >
              <span>{currentStep === 0 ? 'Create Character' : isMobileDevice ? 'Start Playing' : 'View Controls'}</span>
              {currentStep === totalSteps - 1 ? <Play size={16} fill="currentColor" /> : <ChevronRight size={18} />}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

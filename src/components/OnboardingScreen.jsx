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
  Upload,
  Trash2,
  Zap,
  Radio,
  Flame,
  Sparkles,
  Sliders,
  HardDrive
} from 'lucide-react';
import CharacterStudio from './CharacterStudio';
import DualShockVisualizer from './DualShockVisualizer';
import MobileOnboardingScreen from './MobileOnboardingScreen';
import MultiAvatar from './MultiAvatar';
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
  onOpenLoadRomModal,
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
        onOpenLoadRomModal={onOpenLoadRomModal}
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
                    <h3 className="pillar-card-title">Native WebAssembly Emulation</h3>
                  </div>
                  <div className="pillar-text">
                    <p>Zero installation, zero server lag. Runs locally in your browser with hardware-accelerated 60 FPS V-Sync, CRT scanline shaders, and turbo fast-forward.</p>
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
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Save size={22} />
                    </div>
                    <h3 className="pillar-card-title">Universal Saves &amp; Auto-Resume</h3>
                  </div>
                  <div className="pillar-text">
                    <p>Transfer real cartridge saves to physical hardware, capture instant snapshot states, and jump back into gameplay seamlessly with smart auto-resume.</p>
                  </div>

                  {/* Graphic: Save Studio Actions & In-Game Auto-Resume Demo */}
                  <div className="pillar-visual-graphic-wrap">
                    <div className="desktop-pillar-save-grid">
                      {/* Tile 1: Export Battery Save */}
                      <div className="desktop-pillar-save-tile">
                        <div className="save-tile-icon export-blue">
                          <Download size={14} />
                        </div>
                        <div className="save-tile-content">
                          <strong className="save-tile-title">Export Battery Save (.sav)</strong>
                          <span className="save-tile-sub">Download in-game cartridge SRAM save file</span>
                        </div>
                      </div>

                      {/* Tile 2: Export Quick Save */}
                      <div className="desktop-pillar-save-tile">
                        <div className="save-tile-icon export-blue">
                          <Download size={14} />
                        </div>
                        <div className="save-tile-content">
                          <strong className="save-tile-title">Export Quick Save (.state)</strong>
                          <span className="save-tile-sub">Download emulator snapshot state file</span>
                        </div>
                      </div>

                      {/* Tile 3: Import Save / State */}
                      <div className="desktop-pillar-save-tile">
                        <div className="save-tile-icon import-green">
                          <Upload size={14} />
                        </div>
                        <div className="save-tile-content">
                          <strong className="save-tile-title">Import Save / State (.sav / .state)</strong>
                          <span className="save-tile-sub">Upload an existing .sav battery save or .state snapshot</span>
                        </div>
                      </div>

                      {/* Tile 4: Delete All Saved Data */}
                      <div className="desktop-pillar-save-tile is-danger">
                        <div className="save-tile-icon delete-red">
                          <Trash2 size={14} />
                        </div>
                        <div className="save-tile-content">
                          <strong className="save-tile-title">Delete All Saved Data</strong>
                          <span className="save-tile-sub">Erase in-game saves &amp; quick save states</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Resume Prompt Banner (Light Console Theme) */}
                    <div className="desktop-pillar-resume-banner">
                      <div className="erp-icon-wrap">
                        <Zap size={14} color="#f59e0b" />
                      </div>
                      <div className="erp-content">
                        <div className="erp-title">Resume where you left off?</div>
                        <div className="erp-sub">Auto-Save snapshot available from last session</div>
                      </div>
                      <div className="erp-btn is-resume">
                        <Zap size={12} />
                        <span>Resume (5s)</span>
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
                    <h3 className="pillar-card-title">Achievements &amp; Milestones</h3>
                  </div>
                  <div className="pillar-text">
                    <p>Earn trophies for gaming habits like <em>Night Owl</em> sessions, <em>Rage Quits</em>, and <em>Button Mashing</em> — plus authentic cartridge milestones like conquering Pokémon Gyms and becoming Champion.</p>
                  </div>

                  {/* Graphic: In-App UX Demo with Hall of Fame, Kanto Badge Case & Ironman Trophy */}
                  <div className="pillar-visual-graphic-wrap">
                    {/* Player Profile & Trophy Meter Strip */}
                    <div className="desktop-pillar-hof-card">
                      <div className="desktop-pillar-hof-profile">
                        <div className="trophy-avatar-frame">
                          <MultiAvatar seed={activeProfile?.avatarSeed || activeProfile?.name || 'RetroGamer'} size={32} />
                          <span className="trophy-level-pill">Lv.2</span>
                        </div>

                        <div className="desktop-pillar-hof-info">
                          <div className="desktop-pillar-hof-top">
                            <strong className="desktop-pillar-hof-name">{activeProfile?.name || 'Player 1'}</strong>
                            <span className="trophy-rank-badge">Apprentice</span>
                          </div>

                          <div className="trophy-meter-wrap">
                            <div className="trophy-meter-track">
                              <div className="trophy-meter-fill" style={{ width: '13%' }} />
                            </div>
                            <div className="trophy-meter-labels">
                              <span>3 / 24 Unlocked (13%)</span>
                              <span className="trophy-points-tag">
                                <Trophy size={9} color="#f59e0b" />
                                <strong>25</strong> / 300 G
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
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

                    {/* Badge Case Strip (3/8 Unlocked) */}
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
                    <h3 className="pillar-card-title">Universal Controls &amp; Battery HUD</h3>
                  </div>
                  <div className="pillar-text">
                    <p>Plug &amp; play PlayStation (DualShock/DualSense), Xbox, Switch Pro, and Steam Deck controllers, haptic mobile touch overlays, full keyboard spatial navigation, and live low-battery gamepad warnings.</p>
                  </div>

                  {/* Graphic: In-App UX Demo with Controller, Keyboard & Status Pills */}
                  <div className="pillar-visual-graphic-wrap">
                    {/* Top Row: 3 Status Pills + Square Controller Icon */}
                    <div className="desktop-controls-pills-row">
                      <div className="status-pill status-gamepad is-connected is-charging demo-pill" title="Gamepad Connected (Charging)">
                        <Gamepad2 size={15} />
                        <span className="battery-badge">
                          <BatteryCharging size={13} className="battery-icon is-charging" />
                          <span className="battery-percent-text">100%</span>
                          <span className="charging-tag">⚡</span>
                        </span>
                      </div>

                      <div className="status-pill status-gamepad is-connected is-battery-low demo-pill" title="Gamepad Low Battery (15%)">
                        <Gamepad2 size={15} />
                        <span className="battery-badge">
                          <BatteryLow size={13} className="battery-icon is-low" />
                          <span className="battery-percent-text">15%</span>
                        </span>
                      </div>

                      <div className="status-pill status-gamepad is-connected demo-pill" title="Gamepad Connected">
                        <Gamepad2 size={15} />
                        <span className="battery-badge">
                          <span className="battery-percent-text">READY</span>
                        </span>
                      </div>

                      {/* Square Controller Icon Box */}
                      <div className="desktop-controller-square-badge" title="DualShock 4 Controller">
                        <svg viewBox="0 0 700 420" className="ctrl-square-svg">
                          <g transform="translate(10, 5)">
                            {/* L2 / R2 Triggers */}
                            <path d="M 175 48 C 175 22, 230 20, 242 42 L 235 70 C 215 62, 185 64, 175 48 Z" className="ctrl-trigger" />
                            <text x="210" y="44" className="ctrl-trigger-text">L2</text>
                            <path d="M 505 48 C 505 22, 450 20, 438 42 L 445 70 C 465 62, 495 64, 505 48 Z" className="ctrl-trigger" />
                            <text x="470" y="44" className="ctrl-trigger-text">R2</text>

                            {/* Controller Body Shell & Grips */}
                            <path d="M 170 78 C 240 68, 440 68, 510 78 C 555 88, 595 130, 580 190 C 560 235, 520 258, 470 258 C 420 258, 395 295, 340 295 C 285 295, 260 258, 210 258 C 160 258, 120 235, 100 190 C 85 130, 125 88, 170 78 Z" className="ctrl-shell-body" />
                            <path d="M 100 150 C 70 190, 45 270, 70 355 C 85 400, 130 410, 160 375 C 185 345, 205 280, 215 235 Z" className="ctrl-shell-grip" />
                            <path d="M 580 150 C 610 190, 635 270, 610 355 C 595 400, 550 410, 520 375 C 495 345, 475 280, 465 235 Z" className="ctrl-shell-grip" />

                            {/* L1 / R1 Bumpers */}
                            <path d="M 155 76 C 155 58, 235 55, 245 74 L 240 92 C 215 84, 170 84, 155 76 Z" className="ctrl-bumper" />
                            <text x="195" y="80" className="ctrl-bumper-text">L1</text>
                            <path d="M 525 76 C 525 58, 445 55, 435 74 L 440 92 C 465 84, 510 84, 525 76 Z" className="ctrl-bumper" />
                            <text x="485" y="80" className="ctrl-bumper-text">R1</text>

                            {/* Touchpad */}
                            <rect x="250" y="76" width="180" height="90" rx="6" className="ctrl-touchpad" />

                            {/* Share & Options */}
                            <rect x="225" y="105" width="12" height="26" rx="6" className="ctrl-meta-btn" />
                            <rect x="443" y="105" width="12" height="26" rx="6" className="ctrl-meta-btn" />

                            {/* D-Pad Cluster */}
                            <g className="ctrl-dpad-cluster" transform="translate(135, 125)">
                              <path d="M 36 6 L 60 6 C 64 6, 66 8, 66 12 L 66 36 L 30 36 L 30 12 C 30 8, 32 6, 36 6 Z" />
                              <polygon points="48,14 41,24 55,24" className="dpad-arrow-glyph" />
                              <path d="M 30 60 L 66 60 L 66 84 C 66 88, 64 90, 60 90 L 36 90 C 32 90, 30 88, 30 84 Z" />
                              <polygon points="48,82 41,72 55,72" className="dpad-arrow-glyph" />
                              <path d="M 6 36 C 6 32, 8 30, 12 30 L 36 30 L 36 66 L 12 66 C 8 66, 6 64, 6 60 Z" />
                              <polygon points="14,48 24,41 24,55" className="dpad-arrow-glyph" />
                              <path d="M 60 30 L 84 30 C 88 30, 90 32, 90 36 L 90 60 C 90 64, 88 66, 84 66 L 60 66 Z" />
                              <polygon points="82,48 72,41 72,55" className="dpad-arrow-glyph" />
                              <rect x="34" y="34" width="28" height="28" className="ctrl-dpad-center" />
                            </g>

                            {/* Action Face Buttons Cluster */}
                            <g className="ctrl-action-cluster" transform="translate(485, 125)">
                              <circle cx="48" cy="18" r="17" />
                              <polygon points="48,9 39,24 57,24" className="glyph-triangle" />
                              <circle cx="78" cy="48" r="17" />
                              <circle cx="78" cy="48" r="7.5" className="glyph-circle" />
                              <circle cx="48" cy="78" r="17" />
                              <line x1="41" y1="71" x2="55" y2="85" className="glyph-cross" />
                              <line x1="55" y1="71" x2="41" y2="85" className="glyph-cross" />
                              <circle cx="18" cy="48" r="17" />
                              <rect x="11.5" y="41.5" width="13" height="13" rx="1.5" className="glyph-square" />
                            </g>

                            {/* Dual Sticks */}
                            <circle cx="250" cy="255" r="42" className="ctrl-stick-base" />
                            <circle cx="250" cy="255" r="32" className="ctrl-stick-pad" />
                            <circle cx="250" cy="255" r="22" className="ctrl-stick-inner" />
                            <text x="250" y="259" className="ctrl-stick-text">L3</text>

                            <circle cx="340" cy="235" r="11" className="ctrl-home-btn" />

                            <circle cx="430" cy="255" r="42" className="ctrl-stick-base" />
                            <circle cx="430" cy="255" r="32" className="ctrl-stick-pad" />
                            <circle cx="430" cy="255" r="22" className="ctrl-stick-inner" />
                            <text x="430" y="259" className="ctrl-stick-text">R3</text>

                            {/* L3 + R3 Exit Game Combo */}
                            <g transform="translate(340, 325)" className="ctrl-combo-tag">
                              <rect x="-70" y="-12" width="140" height="24" rx="12" />
                              <text x="0" y="4" textAnchor="middle">L3 + R3 EXIT GAME</text>
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>

                    {/* Dual Column Row: In-Game Touch Controls (50%) + Keyboard Controls (50%) */}
                    <div className="desktop-controls-dual-grid">
                      {/* Column 1: In-Game Mobile Haptic Touch Pad Overlay Preview */}
                      <div className="desktop-touch-pad-showcase">
                        <div className="touch-pad-label-row">
                          <span className="touch-pad-title">📱 IN-GAME TOUCH CONTROLS</span>
                          <span className="touch-pad-sub">Touchscreens</span>
                        </div>
                        <div className="touch-pad-demo-surface">
                          {/* Left D-Pad Virtual Overlay */}
                          <div className="touch-v-dpad">
                            <div className="v-dpad-btn up">▲</div>
                            <div className="v-dpad-btn left">◄</div>
                            <div className="v-dpad-center" />
                            <div className="v-dpad-btn right">►</div>
                            <div className="v-dpad-btn down">▼</div>
                          </div>

                          {/* Center Select & Start */}
                          <div className="touch-v-meta">
                            <div className="v-meta-btn">SELECT</div>
                            <div className="v-meta-btn">START</div>
                          </div>

                          {/* Right Action Face Buttons (B / A) */}
                          <div className="touch-v-actions">
                            <div className="v-action-btn b">B</div>
                            <div className="v-action-btn a">A</div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Keyboard Controls Card */}
                      <div className="desktop-controls-keyboard-card">
                        <div className="touch-pad-label-row">
                          <span className="touch-pad-title">⌨️ KEYBOARD CONTROLS</span>
                          <span className="touch-pad-sub">Spatial Keys</span>
                        </div>
                        <div className="desktop-keyboard-keys-surface">
                          <div className="desktop-kc-row">
                            <div className="kc-keycap-group">
                              <span className="kc-keycap">▲</span>
                              <span className="kc-keycap">▼</span>
                              <span className="kc-keycap">◄</span>
                              <span className="kc-keycap">►</span>
                            </div>
                            <span className="desktop-kc-label">D-Pad / Arrows</span>
                          </div>

                          <div className="desktop-kc-grid-row">
                            <div className="desktop-kc-sub-item">
                              <span className="kc-keycap is-action">Z</span>
                              <span className="desktop-kc-label">B Button</span>
                            </div>
                            <div className="desktop-kc-sub-item">
                              <span className="kc-keycap is-action">X</span>
                              <span className="desktop-kc-label">A Button</span>
                            </div>
                          </div>

                          <div className="desktop-kc-grid-row">
                            <div className="desktop-kc-sub-item">
                              <span className="kc-keycap is-shoulder">Q</span>
                              <span className="kc-keycap is-shoulder">W</span>
                              <span className="desktop-kc-label">L / R</span>
                            </div>
                            <div className="desktop-kc-sub-item">
                              <span className="kc-keycap is-system">Shift</span>
                              <span className="kc-keycap is-system">Enter</span>
                              <span className="desktop-kc-label">Start/Select</span>
                            </div>
                          </div>
                        </div>
                      </div>
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

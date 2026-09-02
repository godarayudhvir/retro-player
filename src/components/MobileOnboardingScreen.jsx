import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  ChevronRight,
  ArrowLeft,
  Play,
  Check,
  HardDrive,
  Download,
  Upload,
  FolderUp,
  Trash2,
  Zap,
  ArrowDownToLine,
  BatteryCharging,
  BatteryLow,
  Dices,
  Tag,
  Sparkles,
  Flame,
  Trophy,
  Info
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { CHARACTER_ARCHETYPES, COLOR_PALETTE, RANDOM_CHARACTER_SEEDS } from '../utils/characterPresets';
import { resolveAssetPath } from '../utils/assetPath';
import { haptics } from '../services/hapticsService';

// Curated poster-wall cover art paths for the Netflix-style Screen 0 background
const POSTER_WALL_COVERS = [
  'docs-screenshots/ingame-gba.webp',
  'docs-screenshots/ds-view-medium.webp',
  'docs-screenshots/ingame-snes.webp',
  'docs-screenshots/ingame-genesis.webp',
  'docs-screenshots/ingame-ps1.webp',
  'docs-screenshots/ingame-nds.webp',
  'docs-screenshots/ingame-nes.webp',
  'docs-screenshots/ingame-n64.webp',
  'docs-screenshots/ingame-gbc.webp',
  'docs-screenshots/ingame-arcade.webp',
  'docs-screenshots/ingame-gamegear.webp',
  'docs-screenshots/ingame-gb.webp'
];

const EMULATED_SYSTEMS = [
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
];

const KANTO_BADGES = [
  { id: 'boulder', name: 'Boulder Badge', unlocked: true },
  { id: 'cascade', name: 'Cascade Badge', unlocked: true },
  { id: 'thunder', name: 'Thunder Badge', unlocked: true },
  { id: 'rainbow', name: 'Rainbow Badge', unlocked: false },
  { id: 'soul', name: 'Soul Badge', unlocked: false },
  { id: 'marsh', name: 'Marsh Badge', unlocked: false },
  { id: 'volcano', name: 'Volcano Badge', unlocked: false },
  { id: 'earth', name: 'Earth Badge', unlocked: false }
];

/**
 * Dedicated Native Mobile Onboarding Experience (7 Distinct Screens: 0 through 6).
 * Inspired by high-converting mobile streaming apps (Netflix) and gaming handhelds.
 */
export default function MobileOnboardingScreen({
  isOpen,
  onComplete,
  onOpenLoadRomModal,
  activeProfile,
  onSaveCreatedProfile,
  sfx,
  gamepadConnected = false,
  focusedTarget,
  setFocusedTarget
}) {
  // Screen indices: 0 = Netflix Hero, 1 = WASM Cores, 2 = Battery Saves, 3 = Trophies, 4 = Controls, 5 = Character Studio, 6 = Ready Pass
  const [currentScreen, setCurrentScreen] = useState(0);
  const totalScreens = 7;

  // Multiavatar Profile Customization State
  const [playerName, setPlayerName] = useState(() => activeProfile?.name || 'Player 1');
  const [avatarSeed, setAvatarSeed] = useState(() => activeProfile?.avatarSeed || activeProfile?.name || 'RetroGamer');
  const [favoriteColor, setFavoriteColor] = useState(() => activeProfile?.favoriteColor || '#ef4444');
  const [characterTab, setCharacterTab] = useState('archetypes'); // 'archetypes' | 'custom'

  const scrollRef = useRef(null);

  // Scroll to top upon navigating to a new screen
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentScreen]);

  const handleNext = () => {
    if (currentScreen < totalScreens - 1) {
      const next = currentScreen + 1;
      setCurrentScreen(next);
      haptics.selection();
      sfx?.playTabSwitch?.();
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      const prev = currentScreen - 1;
      setCurrentScreen(prev);
      haptics.light();
      sfx?.playTabSwitch?.();
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('retro_onboarding_completed', 'true');
      localStorage.setItem('retro_demo_dismissed', 'true');
    } catch { }

    if (onSaveCreatedProfile) {
      const finalName = playerName.trim() || 'Player 1';
      const finalSeed = avatarSeed.trim() || finalName;
      onSaveCreatedProfile(finalName, finalSeed, favoriteColor);
    }

    haptics.success();
    sfx?.playGameLaunch?.();
    setFocusedTarget?.({ zone: 'grid', index: 0 });
    onComplete();
  };

  const handleRollDice = () => {
    const randomSeedBase = RANDOM_CHARACTER_SEEDS[Math.floor(Math.random() * RANDOM_CHARACTER_SEEDS.length)];
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newSeed = `${randomSeedBase}_${randomSuffix}`;
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    setAvatarSeed(newSeed);
    setFavoriteColor(randomColor);
    haptics.medium();
    sfx?.playFavoriteToggle?.(true);
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-ob-root animate-fade-in" role="dialog" aria-modal="true">
      {/* =========================================================================
          SCREEN 0: NETFLIX-STYLE HERO LANDING (Wall Backdrop + High Impact CTA)
          ========================================================================= */}
      {currentScreen === 0 && (
        <div className="mobile-ob-screen mobile-ob-screen-0 animate-fade-in">
          {/* Ambient Wall Backdrop of Retro Game Art */}
          <div className="mobile-ob-poster-wall" aria-hidden="true">
            <div className="mobile-ob-poster-grid">
              {POSTER_WALL_COVERS.concat(POSTER_WALL_COVERS).map((src, i) => (
                <div key={i} className="mobile-ob-poster-cell">
                  <img src={resolveAssetPath(src)} alt="" loading="lazy" />
                </div>
              ))}
            </div>
            {/* Cinematic Gradient Vignette & Dark Dimmer */}
            <div className="mobile-ob-poster-overlay" />
          </div>

          {/* Top Bar: Skip Button (Right-Aligned) */}
          <header className="mobile-ob-header transparent-header screen-0-header">
            <button
              type="button"
              className="mobile-ob-skip-btn pill screen-0-skip-btn"
              onClick={handleFinish}
              title="Skip directly to game library"
            >
              <span>Skip</span>
              <ChevronRight size={14} />
            </button>
          </header>

          {/* Premium Centered Hero Stage */}
          <div className="mobile-ob-hero-stage">
            <div className="mobile-ob-hero-card">
              {/* Stacked Brand Centerpiece */}
              <div className="mobile-ob-brand-stacked">
                <div className="mobile-ob-logo-bubble">
                  <img src={resolveAssetPath('favicon.svg')} alt="Retro Player" className="mobile-ob-stacked-logo" />
                </div>
                <div className="mobile-ob-stacked-name">
                  <span className="mobile-ob-brand-retro">RETRO</span>
                  <span className="mobile-ob-brand-player">PLAYER</span>
                </div>
              </div>

              <h1 className="mobile-ob-hero-title">
                The High-Performance, Zero-Overhead Web Emulation Station
              </h1>

              <p className="mobile-ob-hero-desc">
                Play classic retro consoles in your browser via low-latency WebAssembly. Real in-game battery saves, achievements, and instant touch controls.
              </p>

              <button
                type="button"
                className="mobile-ob-cta-btn"
                onClick={handleNext}
              >
                <span>Get Started</span>
                <ChevronRight size={18} />
              </button>

              <span className="mobile-ob-hero-subtext">
                Zero installation required · Free &amp; Open Source
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREENS 1 TO 6: FOCUSED VALUE-STORY SCREENS + CHARACTER CREATOR
          ========================================================================= */}
      {currentScreen > 0 && (
        <div className="mobile-ob-screen mobile-ob-screen-flow animate-slide-up">
          {/* Top Header with Brand & Skip */}
          <header className="mobile-ob-header">
            <div className="mobile-ob-brand">
              <img src={resolveAssetPath('favicon.svg')} alt="Retro Player" className="mobile-ob-logo" />
              <span className="mobile-ob-brand-retro">RETRO</span>
              <span className="mobile-ob-brand-player">PLAYER</span>
            </div>

            <button
              type="button"
              className="mobile-ob-skip-btn"
              onClick={handleFinish}
              title="Skip to game library"
            >
              <span>Skip</span>
              <ChevronRight size={14} />
            </button>
          </header>

          {/* Segmented Momentum Progress Bar (Screens 1 through 6) */}
          <div className="mobile-ob-progress-container" aria-label={`Step ${currentScreen} of 6`}>
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <div
                key={stepNum}
                className={`mobile-ob-progress-seg ${currentScreen === stepNum ? 'is-active' : currentScreen > stepNum ? 'is-done' : ''
                  }`}
              />
            ))}
          </div>

          {/* Scrollable Story Body */}
          <div ref={scrollRef} className="mobile-ob-body">
            {/* -------------------------------------------------------------
                SCREEN 1: 12 Native WASM Cores
                ------------------------------------------------------------- */}
            {currentScreen === 1 && (
              <div className="mobile-ob-story-card animate-fade-in">

                <h2 className="mobile-ob-card-title">
                  Native WebAssembly Emulation
                </h2>

                <p className="mobile-ob-card-desc">
                  Zero installation, zero server lag. Runs locally on your device with hardware-accelerated 60 FPS V-Sync, authentic display shaders, and instant fast-forward.
                </p>

                {/* 12 Consoles 4x3 Grid */}
                <div className="mobile-ob-systems-grid">
                  {EMULATED_SYSTEMS.map((sys) => (
                    <div key={sys.key} className="mobile-ob-system-item">
                      <img
                        src={resolveAssetPath(`assets/platforms/${sys.svg}`)}
                        alt={sys.name}
                        className="mobile-ob-system-icon"
                      />
                      <span>{sys.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SCREEN 2: Real Battery Saves & Auto-Resume
                ------------------------------------------------------------- */}
            {currentScreen === 2 && (
              <div className="mobile-ob-story-card animate-fade-in">

                <h2 className="mobile-ob-card-title">
                  Universal Saves &amp; Auto-Resume
                </h2>

                <p className="mobile-ob-card-desc">
                  Transfer real cartridge saves to physical hardware, capture instant snapshot states, and jump back into gameplay seamlessly with smart auto-resume.
                </p>

                {/* Save Studio Action Tiles (Matching Console Save Manager) */}
                <div className="mobile-ob-save-tiles-stack">
                  {/* Tile 1: Export Battery Save */}
                  <div className="mobile-ob-save-tile">
                    <div className="save-tile-icon export-blue">
                      <Download size={18} />
                    </div>
                    <div className="save-tile-content">
                      <strong className="save-tile-title">Export Battery Save (.sav)</strong>
                      <span className="save-tile-sub">Download in-game cartridge SRAM save file</span>
                    </div>
                  </div>

                  {/* Tile 2: Export Quick Save */}
                  <div className="mobile-ob-save-tile">
                    <div className="save-tile-icon export-blue">
                      <Download size={18} />
                    </div>
                    <div className="save-tile-content">
                      <strong className="save-tile-title">Export Quick Save (.state)</strong>
                      <span className="save-tile-sub">Download emulator snapshot state file</span>
                    </div>
                  </div>

                  {/* Tile 3: Import Save / State */}
                  <div className="mobile-ob-save-tile">
                    <div className="save-tile-icon import-green">
                      <Upload size={18} />
                    </div>
                    <div className="save-tile-content">
                      <strong className="save-tile-title">Import Save / State (.sav / .state)</strong>
                      <span className="save-tile-sub">Upload an existing .sav battery save or .state snapshot</span>
                    </div>
                  </div>

                  {/* Tile 4: Delete All Saved Data */}
                  <div className="mobile-ob-save-tile is-danger">
                    <div className="save-tile-icon delete-red">
                      <Trash2 size={18} />
                    </div>
                    <div className="save-tile-content">
                      <strong className="save-tile-title">Delete All Saved Data</strong>
                      <span className="save-tile-sub">Erase in-game saves &amp; quick save states</span>
                    </div>
                  </div>
                </div>

                {/* In-Game Auto-Resume Prompt Banner Showcase */}
                <div className="mobile-ob-resume-showcase">
                  <div className="mobile-ob-resume-banner">
                    <div className="erp-icon-wrap">
                      <Zap size={16} color="#f59e0b" />
                    </div>
                    <div className="erp-content">
                      <div className="erp-title">Resume where you left off?</div>
                      <div className="erp-sub">Auto-Save snapshot available from last session</div>
                    </div>
                    <div className="erp-actions">
                      <div className="erp-btn is-resume">
                        <Zap size={12} />
                        <span>Resume (5s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SCREEN 3: Achievements & Milestones
                ------------------------------------------------------------- */}
            {currentScreen === 3 && (
              <div className="mobile-ob-story-card animate-fade-in">

                <h2 className="mobile-ob-card-title">
                  Earn Trophies as You Play
                </h2>

                <p className="mobile-ob-card-desc">
                  Unlock trophies for gaming habits like <em>Night Owl</em> sessions, <em>Rage Quits</em>, and <em>Button Mashing</em> — plus authentic cartridge milestones like conquering Pokémon Gyms.
                </p>

                {/* Player Profile & Trophy Meter Strip */}
                <div className="mobile-ob-hof-container">
                  <div className="mobile-ob-hof-profile-strip">
                    <div className="trophy-avatar-frame">
                      <MultiAvatar seed={activeProfile?.avatarSeed || activeProfile?.name || 'RetroGamer'} size={38} />
                      <span className="trophy-level-pill">Lv.2</span>
                    </div>

                    <div className="mobile-ob-hof-info">
                      <div className="mobile-ob-hof-top">
                        <strong className="mobile-ob-hof-player">{activeProfile?.name || 'Player 1'}</strong>
                        <span className="trophy-rank-badge">Apprentice</span>
                      </div>

                      <div className="trophy-meter-wrap">
                        <div className="trophy-meter-track">
                          <div className="trophy-meter-fill" style={{ width: '13%' }} />
                        </div>
                        <div className="trophy-meter-labels">
                          <span>3 / 24 Unlocked (13%)</span>
                          <span className="trophy-points-tag">
                            <Trophy size={10} color="#f59e0b" />
                            <strong>25</strong> / 300 G
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mobile-ob-badges-card">
                  {/* Trophy Card: Ironman Endurance */}
                  <div className="mobile-ob-trophy-banner">
                    <div className="trophy-badge-icon">
                      <Flame size={16} color="#38bdf8" />
                    </div>
                    <div className="trophy-badge-text">
                      <div className="trophy-badge-row">
                        <strong>Ironman Endurance</strong>
                        <span className="trophy-pts">+20G</span>
                      </div>
                      <span>Play a single game continuously for 7 hours</span>
                    </div>
                  </div>

                  {/* Badge Case Strip (3/8 Unlocked) */}
                  <div className="badges-grid-strip">
                    {KANTO_BADGES.map((b) => (
                      <div key={b.id} className={`badge-box ${b.unlocked ? 'is-earned' : 'is-locked'}`} title={b.name}>
                        <img
                          src={resolveAssetPath(`assets/badges/kanto/${b.id}.webp`)}
                          alt={b.name}
                          className={`badge-icon ${b.unlocked ? 'earned' : 'locked'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SCREEN 4: Universal Controls & Mobile Touch
                ------------------------------------------------------------- */}
            {currentScreen === 4 && (
              <div className="mobile-ob-story-card animate-fade-in">

                <h2 className="mobile-ob-card-title">
                  Touch, Gamepad, or Keyboard
                </h2>

                <p className="mobile-ob-card-desc">
                  Engineered with haptic on-screen controls for mobile touchscreens, plus instant plug &amp; play pairing for PlayStation, Xbox, Switch, and Steam Deck Bluetooth controllers.
                </p>

                {/* 3 Status Pills Showcase: Connected, Low Battery, Charging */}
                <div className="controls-pills-showcase">
                  <div className="status-pill status-gamepad is-connected is-charging demo-pill" title="Gamepad Connected (Charging)">
                    <Gamepad2 size={14} />
                    <span className="battery-badge">
                      <BatteryCharging size={12} className="battery-icon is-charging" />
                      <span className="battery-percent-text">100%</span>
                      <span className="charging-tag">⚡</span>
                    </span>
                  </div>

                  <div className="status-pill status-gamepad is-connected is-battery-low demo-pill" title="Gamepad Low Battery (15%)">
                    <Gamepad2 size={14} />
                    <span className="battery-badge">
                      <BatteryLow size={12} className="battery-icon is-low" />
                      <span className="battery-percent-text">15%</span>
                    </span>
                  </div>

                  <div className="status-pill status-gamepad is-connected demo-pill" title="Gamepad Connected">
                    <Gamepad2 size={14} />
                    <span className="battery-badge">
                      <span className="battery-percent-text">READY</span>
                    </span>
                  </div>
                </div>

                {/* 1. Vector Gamepad Visualizer (No Labels) */}
                <div className="controls-controller-wrap">
                  <svg viewBox="0 0 700 420" className="controls-controller-svg">
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

                {/* In-Game Mobile Haptic Touch Pad Overlay Preview */}
                <div className="mobile-touch-pad-showcase">
                  <div className="touch-pad-label-row">
                    <span className="touch-pad-title">📱 IN-GAME TOUCH CONTROLS</span>
                    <span className="touch-pad-sub">Auto-enabled on touchscreens</span>
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

                {/* 2. Compact Keyboard Controls Grid */}
                <div className="controls-keyboard-compact">
                  {/* Movement */}
                  <div className="kc-compact-section">
                    <div className="kc-compact-label">MOVEMENT / DIRECTION</div>
                    <div className="kc-compact-row">
                      <div className="kc-keycap-group">
                        <span className="kc-keycap">▲</span>
                        <span className="kc-keycap">▼</span>
                        <span className="kc-keycap">◄</span>
                        <span className="kc-keycap">►</span>
                      </div>
                      <div className="kc-key-info">
                        <span className="kc-key-title">Arrow Keys</span>
                        <span className="kc-key-desc">D-Pad / Analog Navigation</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="kc-compact-section">
                    <div className="kc-compact-label">ACTION BUTTONS</div>
                    <div className="kc-compact-grid-2">
                      <div className="kc-compact-row">
                        <span className="kc-keycap is-action">Z</span>
                        <div className="kc-key-info">
                          <span className="kc-key-title">B Button</span>
                          <span className="kc-key-desc">Cancel / Run</span>
                        </div>
                      </div>
                      <div className="kc-compact-row">
                        <span className="kc-keycap is-action">X</span>
                        <div className="kc-key-info">
                          <span className="kc-key-title">A Button</span>
                          <span className="kc-key-desc">Confirm / Jump</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shoulders */}
                  <div className="kc-compact-section">
                    <div className="kc-compact-label">SHOULDERS &amp; TRIGGERS</div>
                    <div className="kc-compact-grid-2">
                      <div className="kc-compact-row">
                        <span className="kc-keycap is-shoulder">Q</span>
                        <div className="kc-key-info">
                          <span className="kc-key-title">L Shoulder</span>
                          <span className="kc-key-desc">Left Bumper</span>
                        </div>
                      </div>
                      <div className="kc-compact-row">
                        <span className="kc-keycap is-shoulder">W</span>
                        <div className="kc-key-info">
                          <span className="kc-key-title">R Shoulder</span>
                          <span className="kc-key-desc">Right Bumper</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System */}
                  <div className="kc-compact-section">
                    <div className="kc-compact-label">SYSTEM / UTILITY</div>
                    <div className="kc-compact-grid-2">
                      <div className="kc-compact-row">
                        <span className="kc-keycap is-system">Shift</span>
                        <div className="kc-key-info">
                          <span className="kc-key-title">Select</span>
                          <span className="kc-key-desc">Select / Coin</span>
                        </div>
                      </div>
                      <div className="kc-compact-row">
                        <span className="kc-keycap is-system">Enter</span>
                        <div className="kc-key-info">
                          <span className="kc-key-title">Start</span>
                          <span className="kc-key-desc">Start / Pause</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Note Banner */}
                <div className="mobile-ob-controls-note">
                  <Info size={14} className="controls-note-icon" />
                  <span>Controls differ across games and consoles.</span>
                </div>

              </div>
            )}

            {/* -------------------------------------------------------------
                SCREEN 5: Mobile Character Customization (Image 3 Ref)
                ------------------------------------------------------------- */}
            {currentScreen === 5 && (
              <div className="mobile-ob-story-card animate-fade-in">
                <h2 className="mobile-ob-card-title">
                  Create Your Character
                </h2>

                <p className="mobile-ob-card-desc">
                  Pick an archetype, roll randomized styles, or personalize your player handle and color.
                </p>

                {/* Retro Passport Stage Card */}
                <div className="mobile-ob-passport-card" style={{ borderColor: `${favoriteColor}88` }}>
                  <div className="passport-header">
                    <span className="passport-chip" style={{ background: `${favoriteColor}22`, color: favoriteColor }}>
                      RETRO PASSPORT
                    </span>
                    <span className="passport-id">
                      #{Math.abs((avatarSeed || '0').split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0) % 99999).toString().padStart(5, '0')}
                    </span>
                  </div>

                  <div className="passport-body">
                    <div className="passport-avatar-portal" style={{ borderColor: favoriteColor }}>
                      <MultiAvatar seed={avatarSeed || playerName || 'Player 1'} size={88} />
                    </div>

                    <div className="passport-meta">
                      <strong className="passport-name">{playerName || 'Player 1'}</strong>
                      <button
                        type="button"
                        className="passport-dice-btn"
                        onClick={handleRollDice}
                      >
                        <Dices size={14} />
                        <span>Randomize</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tab Switcher: Archetypes (48) vs Custom */}
                <div className="mobile-ob-tabs-row" role="tablist">
                  <button
                    type="button"
                    className={`mobile-ob-tab-btn ${characterTab === 'archetypes' ? 'is-active' : ''}`}
                    onClick={() => { setCharacterTab('archetypes'); haptics.selection(); sfx?.playTabSwitch?.(); }}
                  >
                    <Gamepad2 size={14} />
                    <span>Archetypes ({CHARACTER_ARCHETYPES.length})</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-ob-tab-btn ${characterTab === 'custom' ? 'is-active' : ''}`}
                    onClick={() => { setCharacterTab('custom'); haptics.selection(); sfx?.playTabSwitch?.(); }}
                  >
                    <Tag size={14} />
                    <span>Custom Name &amp; Color</span>
                  </button>
                </div>

                {/* Tab 1: 4-Column Mobile Touch Archetypes Grid */}
                {characterTab === 'archetypes' && (
                  <div className="mobile-ob-archetype-grid-wrap animate-fade-in">
                    <div className="mobile-ob-archetypes-4col">
                      {CHARACTER_ARCHETYPES.map((preset) => {
                        const isSelected = avatarSeed === preset.avatarSeed;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            className={`mobile-archetype-card ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => {
                              setAvatarSeed(preset.avatarSeed);
                              setFavoriteColor(preset.favoriteColor);
                              setPlayerName(preset.name);
                              haptics.selection();
                              sfx?.playTileNav?.();
                            }}
                          >
                            <div className="archetype-avatar">
                              <MultiAvatar seed={preset.avatarSeed} size={42} />
                            </div>
                            <span className="archetype-label">{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: Custom Name & Color Form */}
                {characterTab === 'custom' && (
                  <div className="mobile-ob-custom-form animate-fade-in">
                    <div className="custom-input-group">
                      <label className="custom-label">Player Name</label>
                      <input
                        type="text"
                        className="custom-text-input"
                        value={playerName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlayerName(val);
                          if (!avatarSeed || avatarSeed === playerName) {
                            setAvatarSeed(val);
                          }
                        }}
                        placeholder="Enter player handle..."
                        maxLength={16}
                      />
                    </div>

                    <div className="custom-input-group">
                      <label className="custom-label">Custom Avatar Seed</label>
                      <input
                        type="text"
                        className="custom-text-input"
                        value={avatarSeed}
                        onChange={(e) => setAvatarSeed(e.target.value)}
                        placeholder="Type any word or code..."
                        maxLength={32}
                      />
                    </div>

                    <div className="custom-input-group">
                      <label className="custom-label">Console Accent Color</label>
                      <div className="custom-palette-row">
                        {COLOR_PALETTE.map((col) => (
                          <button
                            key={col}
                            type="button"
                            className={`palette-circle ${favoriteColor === col ? 'is-active' : ''}`}
                            style={{ background: col }}
                            onClick={() => {
                              setFavoriteColor(col);
                              haptics.selection();
                              sfx?.playTileNav?.();
                            }}
                          >
                            {favoriteColor === col && <Check size={14} color="#ffffff" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                SCREEN 6: In the App (Ready Pass Handoff & Load ROM)
                ------------------------------------------------------------- */}
            {currentScreen === 6 && (
              <div className="mobile-ob-story-card animate-fade-in">
                <div className="mobile-ob-ready-celebration">
                  <div className="ready-sparkle-circle" style={{ background: `${favoriteColor}22`, color: favoriteColor }}>
                    <Sparkles size={32} />
                  </div>
                  <h2 className="mobile-ob-card-title">You're All Set!</h2>
                  <p className="mobile-ob-card-desc">
                    Your customized profile is ready. Load your favorite retro ROMs to jump straight into gameplay.
                  </p>
                </div>

                {/* Completed Passport Ticket */}
                <div className="mobile-ob-ticket-card" style={{ borderColor: `${favoriteColor}88` }}>
                  <div className="ticket-header">
                    <span className="ticket-chip" style={{ background: `${favoriteColor}22`, color: favoriteColor }}>
                      RETRO PASSPORT READY
                    </span>
                    <span className="ticket-badge-ok">VERIFIED</span>
                  </div>

                  <div className="ticket-body">
                    <div className="ticket-avatar" style={{ borderColor: favoriteColor }}>
                      <MultiAvatar seed={avatarSeed || playerName || 'Player 1'} size={64} />
                    </div>

                    <div className="ticket-meta">
                      <strong className="ticket-name">{playerName || 'Player 1'}</strong>
                      <span className="ticket-sub">Profile Ready</span>
                    </div>
                  </div>
                </div>

                {/* Direct Load ROM Action Card */}
                <div className="mobile-ob-load-rom-prompt">
                  <button
                    type="button"
                    className="mobile-ob-load-rom-btn"
                    onClick={() => {
                      try {
                        localStorage.setItem('retro_onboarding_completed', 'true');
                        localStorage.setItem('retro_demo_dismissed', 'true');
                      } catch { }
                      if (onSaveCreatedProfile) {
                        const finalName = playerName.trim() || 'Player 1';
                        const finalSeed = avatarSeed.trim() || finalName;
                        onSaveCreatedProfile(finalName, finalSeed, favoriteColor);
                      }
                      onOpenLoadRomModal?.();
                      haptics.selection();
                      sfx?.playModalOpen?.();
                    }}
                  >
                    <div className="load-rom-btn-icon">
                      <FolderUp size={22} />
                    </div>
                    <div className="load-rom-btn-text">
                      <strong>Load Your Favorite ROMs</strong>
                      <span>Pick ROM files (.gba, .nds, .sfc) or an entire game folder to play</span>
                    </div>
                    <ChevronRight size={18} className="load-rom-btn-arrow" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sticky Action Footer */}
          <footer className="mobile-ob-footer">
            <button
              type="button"
              className="mobile-ob-back-btn"
              onClick={handleBack}
              title="Previous screen"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <button
              type="button"
              className="mobile-ob-next-btn"
              onClick={handleNext}
            >
              <span>{currentScreen === 6 ? 'Explore Library' : currentScreen === 5 ? 'Ready' : 'Continue'}</span>
              {currentScreen === 6 ? <Play size={16} fill="currentColor" /> : <ChevronRight size={18} />}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

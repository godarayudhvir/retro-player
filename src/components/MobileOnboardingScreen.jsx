import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Save,
  Trophy,
  Gamepad2,
  ChevronRight,
  ArrowLeft,
  Play,
  Check,
  HardDrive,
  ArrowDownToLine,
  BatteryCharging,
  BatteryLow,
  Dices,
  Tag,
  Sparkles,
  Flame
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
                <div className="mobile-ob-card-badge blue">
                  <Cpu size={14} />
                  <span>12 NATIVE SYSTEMS · 60 FPS</span>
                </div>

                <h2 className="mobile-ob-card-title">
                  Console-Grade Performance
                </h2>

                <p className="mobile-ob-card-desc">
                  Powered by WebAssembly emulation cores. Enjoy buttery smooth 60 FPS V-Sync, CRT scanline filters, and instantaneous fast-forward directly in your mobile browser.
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
                <div className="mobile-ob-card-badge green">
                  <Save size={14} />
                  <span>SAVE ENGINE · ZERO DATA LOSS</span>
                </div>

                <h2 className="mobile-ob-card-title">
                  Save Anywhere, Never Lose Progress
                </h2>

                <p className="mobile-ob-card-desc">
                  Real in-game cartridge battery RAM (.sav) exports you can transfer to real hardware, plus quick save states and seamless auto-resume right where you left off.
                </p>

                {/* In-App Save Demo Visual */}
                <div className="mobile-ob-ux-card save-ux-card">
                  <div className="save-ux-top">
                    <div className="save-ux-file">
                      <HardDrive size={16} color="#10b981" />
                      <span className="save-ux-name">pokemon-emerald.sav</span>
                      <span className="save-ux-size">128 KB</span>
                    </div>
                    <span className="save-ux-status">SAVED</span>
                  </div>

                  <div className="save-ux-buttons">
                    <div className="save-ux-btn export">
                      <ArrowDownToLine size={14} />
                      <span>Export .SAV</span>
                    </div>
                    <div className="save-ux-btn resume">
                      <span className="live-dot" />
                      <span>Auto-Resume Active</span>
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
                <div className="mobile-ob-card-badge gold">
                  <Trophy size={14} />
                  <span>TROPHIES &amp; MILESTONES</span>
                </div>

                <h2 className="mobile-ob-card-title">
                  Earn Trophies as You Play
                </h2>

                <p className="mobile-ob-card-desc">
                  Unlock trophies for gaming habits like <em>Night Owl</em> sessions, <em>Rage Quits</em>, and <em>Button Mashing</em> — plus authentic cartridge milestones like conquering Pokémon Gyms.
                </p>

                {/* Badge Case Strip (3/8 Unlocked) */}
                <div className="mobile-ob-badges-card">
                  <div className="badges-card-header">
                    <span className="badges-header-title">🪪 KANTO LEAGUE</span>
                    <span className="badges-header-count">3 / 8 BADGES</span>
                  </div>
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
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SCREEN 4: Universal Controls & Mobile Touch
                ------------------------------------------------------------- */}
            {currentScreen === 4 && (
              <div className="mobile-ob-story-card animate-fade-in">
                <div className="mobile-ob-card-badge purple">
                  <Gamepad2 size={14} />
                  <span>UNIVERSAL CONTROLS</span>
                </div>

                <h2 className="mobile-ob-card-title">
                  Touch, Gamepad, or Keyboard
                </h2>

                <p className="mobile-ob-card-desc">
                  Engineered with haptic on-screen controls for mobile touchscreens, plus instant plug &amp; play pairing for PlayStation, Xbox, Switch, and Steam Deck Bluetooth controllers.
                </p>

                {/* Gamepad HUD Visual Card */}
                <div className="mobile-ob-controls-visual">
                  <div className="controls-pills-row">
                    <div className="hud-pill is-charging">
                      <Gamepad2 size={16} />
                      <BatteryCharging size={14} className="charging-icon" />
                      <span>100% ⚡</span>
                    </div>
                    <div className="hud-pill is-low">
                      <Gamepad2 size={16} />
                      <BatteryLow size={14} className="low-icon" />
                      <span>15%</span>
                    </div>
                  </div>

                  <div className="controls-touch-keys">
                    <span className="keycap">D-PAD</span>
                    <span className="keycap action">A / ✕</span>
                    <span className="keycap action">B / ◯</span>
                    <span className="keycap">START</span>
                    <span className="keycap">SELECT</span>
                  </div>
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
                SCREEN 6: In the App (Ready Pass Handoff)
                ------------------------------------------------------------- */}
            {currentScreen === 6 && (
              <div className="mobile-ob-story-card animate-fade-in">
                <div className="mobile-ob-ready-celebration">
                  <div className="ready-sparkle-circle" style={{ background: `${favoriteColor}22`, color: favoriteColor }}>
                    <Sparkles size={32} />
                  </div>
                  <h2 className="mobile-ob-card-title">You're All Set!</h2>
                  <p className="mobile-ob-card-desc">
                    Your customized profile is ready. Boot into the game library to launch classics instantly.
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
                      <span className="ticket-sub">Profile #1 · 12 Systems Online</span>
                    </div>
                  </div>

                  <div className="ticket-features-footer">
                    <span>⚡ 60 FPS V-Sync</span>
                    <span>💾 Auto-Resume</span>
                    <span>🏆 Badges</span>
                  </div>
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
              <span>{currentScreen === 6 ? 'Start Playing' : currentScreen === 5 ? 'Ready' : 'Continue'}</span>
              {currentScreen === 6 ? <Play size={16} fill="currentColor" /> : <ChevronRight size={18} />}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

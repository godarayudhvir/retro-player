import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { findNextSpatialElement } from '../utils/spatialNavigation';

const isApplePlatform = typeof navigator !== 'undefined' && (/Macintosh|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
const isSafariBrowser = typeof navigator !== 'undefined' && (/Safari/i.test(navigator.userAgent || '') && !/Chrome|Chromium|CriOS|FxiOS|Edg/i.test(navigator.userAgent || ''));
const isSmartTv = typeof navigator !== 'undefined' && /SmartTV|Tizen|Web0S|BRAVIA|NetCast|Viera|AppleTV|HbbTV|CrKey/i.test(navigator.userAgent || '');

/**
 * Modern Full-Screen Responsive Onboarding Experience for Desktop, Tablets & TVs.
 * Automatically delegates to dedicated MobileOnboardingScreen on mobile touch phones (<= 640px).
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
  // If explicitly flagged as mobile or matched via mobile phone viewport (<= 640px), render dedicated MobileOnboardingScreen
  const shouldRenderMobile = isMobile || (typeof window !== 'undefined' && window.innerWidth <= 640);

  if (shouldRenderMobile) {
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
  const [characterStudioTab, setCharacterStudioTab] = useState('archetypes'); // 'archetypes' | 'custom'
  const [copiedLink, setCopiedLink] = useState(false);

  // Reactive Gamepad State Detection
  const [hasGamepad, setHasGamepad] = useState(() => {
    if (gamepadConnected) return true;
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gps = navigator.getGamepads();
      for (let i = 0; i < gps.length; i++) {
        if (gps[i] && gps[i].connected) return true;
      }
    }
    return false;
  });

  useEffect(() => {
    setHasGamepad(gamepadConnected);
  }, [gamepadConnected]);

  useEffect(() => {
    const handleConnect = () => setHasGamepad(true);
    const handleDisconnect = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      let anyConnected = false;
      for (let i = 0; i < gps.length; i++) {
        if (gps[i] && gps[i].connected) {
          anyConnected = true;
          break;
        }
      }
      setHasGamepad(anyConnected);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

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

  const viewportRef = useRef(null);

  const handleFinish = useCallback(() => {
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
  }, [playerName, avatarSeed, favoriteColor, onSaveCreatedProfile, sfx, setFocusedTarget, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sfx?.playTabSwitch?.();
      if (nextStep === 1) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'random' });
      } else if (nextStep === 2) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'skip' });
      }
    } else {
      handleFinish();
    }
  }, [currentStep, totalSteps, sfx, setFocusedTarget, handleFinish]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      sfx?.playTabSwitch?.();
      if (prevStep === 0) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
      } else if (prevStep === 1) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'random' });
      } else {
        setFocusedTarget?.({ zone: 'onboarding', id: 'skip' });
      }
    }
  }, [currentStep, sfx, setFocusedTarget]);

  // Auto-focus logic & scroll-to-top when opening or changing steps
  useEffect(() => {
    if (isOpen) {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = 0;
      }
      if (currentStep === 0) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
      } else if (currentStep === 1) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'random' });
      } else if (currentStep === 2) {
        setFocusedTarget?.({ zone: 'onboarding', id: 'skip' });
      }
    }
  }, [isOpen, currentStep, setFocusedTarget]);

  // Desktop Onboarding Keyboard Navigation (Screen 01 & Screen 02)
  useEffect(() => {
    if (!isOpen || shouldRenderMobile) return;

    const handleKeyDown = (e) => {
      const isInputFocused = e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA';

      // --- SCREEN 01 ---
      if (currentStep === 0) {
        if (isInputFocused) return;
        if (e.key === ' ') {
          e.preventDefault();
          handleNext();
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedTarget?.id === 'skip') {
            handleFinish();
          } else {
            handleNext();
          }
          return;
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleFinish();
          return;
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setFocusedTarget?.({ zone: 'onboarding', id: 'skip' });
          sfx?.playTileNav?.();
          return;
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
          sfx?.playTileNav?.();
          return;
        }
        return;
      }

      // --- SCREEN 02: Character Studio ---
      if (currentStep === 1) {
        // Space key: Dedicated shortcut to advance to next page (View Controls)
        if (!isInputFocused && e.key === ' ') {
          e.preventDefault();
          handleNext();
          return;
        }

        // Tab switching: Q / L1 -> Character Archetypes, E / R1 -> Custom Name & Color
        if (!isInputFocused && (e.key === 'q' || e.key === 'Q')) {
          e.preventDefault();
          setCharacterStudioTab('archetypes');
          setFocusedTarget?.({ zone: 'onboarding', id: 'archetypeTab' });
          sfx?.playTabSwitch?.();
          return;
        }
        if (!isInputFocused && (e.key === 'e' || e.key === 'E' || e.key === 'r' || e.key === 'R')) {
          e.preventDefault();
          setCharacterStudioTab('custom');
          setFocusedTarget?.({ zone: 'onboarding', id: 'customTab' });
          sfx?.playTabSwitch?.();
          return;
        }

        // Global Action: ESC -> Skip to Games
        if (e.key === 'Escape') {
          e.preventDefault();
          handleFinish();
          return;
        }

        // Global Action: Delete / Backspace -> Go back to Screen 01 (when not actively typing in an input)
        if (!isInputFocused && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault();
          handleBack();
          return;
        }

        // Enter Action: activates currently focused element
        if (e.key === 'Enter') {
          e.preventDefault();
          const curId = focusedTarget?.id;
          if (curId === 'next') {
            handleNext();
          } else if (curId === 'back') {
            handleBack();
          } else if (curId === 'skip') {
            handleFinish();
          } else if (curId === 'random') {
            const randomBtn = document.querySelector('.onboarding-root [data-nav-id="random"]');
            if (randomBtn) randomBtn.click();
            sfx?.playDiceRoll?.();
          } else if (curId === 'archetypeTab') {
            setCharacterStudioTab('archetypes');
            sfx?.playTabSwitch?.();
          } else if (curId === 'customTab') {
            setCharacterStudioTab('custom');
            sfx?.playTabSwitch?.();
          } else if (curId?.startsWith('preset_')) {
            const el = document.querySelector(`.onboarding-root [data-nav-id="${curId}"]`);
            if (el) el.click();
          } else if (curId?.startsWith('color_')) {
            const el = document.querySelector(`.onboarding-root [data-nav-id="${curId}"]`);
            if (el) el.click();
          } else {
            handleNext();
          }
          return;
        }

        // Arrow Key 2D Spatial Navigation
        if (!isInputFocused && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          const dir = e.key === 'ArrowUp' ? 'UP' : e.key === 'ArrowDown' ? 'DOWN' : e.key === 'ArrowLeft' ? 'LEFT' : 'RIGHT';
          const container = document.querySelector('.onboarding-root');
          const currentEl = container?.querySelector(`.gamepad-focused`) ||
                            container?.querySelector(`[data-nav-id="${focusedTarget?.id}"]`);

          const nextEl = findNextSpatialElement({ container, currentEl, direction: dir });
          if (nextEl && nextEl.dataset.navId) {
            setFocusedTarget?.({ zone: 'onboarding', id: nextEl.dataset.navId });
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            sfx?.playTileNav?.();
          }
          return;
        }
      }

      // --- SCREEN 03: Interactive Gamepad Controls ---
      if (currentStep === 2) {
        // ESC -> Skip to Games
        if (e.key === 'Escape') {
          e.preventDefault();
          handleFinish();
          return;
        }
        // Delete / Backspace -> Go back to Screen 02 (Character Studio)
        if (!isInputFocused && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault();
          handleBack();
          return;
        }
        // Enter / Space on Screen 03 -> Skip to Games & Boot Library
        if (e.key === 'Enter' || (e.key === ' ' && !isInputFocused)) {
          e.preventDefault();
          handleFinish();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, shouldRenderMobile, currentStep, focusedTarget?.id, handleNext, handleBack, handleFinish, setFocusedTarget, sfx]);

  // Desktop Onboarding Gamepad Polling Loop (Screen 01 & Screen 02)
  useEffect(() => {
    if (!isOpen || shouldRenderMobile) return;

    let animId = null;
    let prevButtons = {};
    const STICK_DEADZONE = 0.45;
    let lastNavTime = 0;
    const NAV_COOLDOWN = 180;

    const pollGamepad = (timestamp) => {
      const now = (typeof timestamp === 'number') ? timestamp : performance.now();
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let gp = null;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
          gp = gamepads[i];
          break;
        }
      }

      if (gp) {
        const b = gp.buttons;
        const btnA = !!b[0]?.pressed;      // A / Cross
        const btnB = !!b[1]?.pressed;      // B / Circle
        const btnStart = !!b[9]?.pressed;  // Start / Options / Menu
        const shoulderL = !!b[4]?.pressed; // L1 / Left Bumper
        const shoulderR = !!b[5]?.pressed; // R1 / Right Bumper
        const dpadUp = !!(b[12]?.pressed || (gp.axes[1] < -STICK_DEADZONE));
        const dpadDown = !!(b[13]?.pressed || (gp.axes[1] > STICK_DEADZONE));
        const dpadLeft = !!(b[14]?.pressed || (gp.axes[0] < -STICK_DEADZONE));
        const dpadRight = !!(b[15]?.pressed || (gp.axes[0] > STICK_DEADZONE));

        // --- SCREEN 01 ---
        if (currentStep === 0) {
          if (btnA && !prevButtons.btnA) {
            if (focusedTarget?.id === 'skip') {
              handleFinish();
            } else {
              handleNext();
            }
          } else if (btnStart && !prevButtons.btnStart) {
            handleFinish();
          } else if (btnB && !prevButtons.btnB) {
            handleFinish();
          } else if (dpadUp && !prevButtons.dpadUp) {
            setFocusedTarget?.({ zone: 'onboarding', id: 'skip' });
            sfx?.playTileNav?.();
          } else if (dpadDown && !prevButtons.dpadDown) {
            setFocusedTarget?.({ zone: 'onboarding', id: 'next' });
            sfx?.playTileNav?.();
          }
        }

        // --- SCREEN 02: Character Studio ---
        else if (currentStep === 1) {
          // L1 -> Character Archetypes tab
          if (shoulderL && !prevButtons.shoulderL) {
            setCharacterStudioTab('archetypes');
            setFocusedTarget?.({ zone: 'onboarding', id: 'archetypeTab' });
            sfx?.playTabSwitch?.();
          }
          // R1 -> Custom Name & Color tab
          else if (shoulderR && !prevButtons.shoulderR) {
            setCharacterStudioTab('custom');
            setFocusedTarget?.({ zone: 'onboarding', id: 'customTab' });
            sfx?.playTabSwitch?.();
          }
          // START -> Skip to Games
          else if (btnStart && !prevButtons.btnStart) {
            handleFinish();
          }
          // B button -> Go Back to Screen 01
          else if (btnB && !prevButtons.btnB) {
            handleBack();
          }
          // A button -> Confirm / Select
          else if (btnA && !prevButtons.btnA) {
            const curId = focusedTarget?.id;
            if (curId === 'next') {
              handleNext();
            } else if (curId === 'back') {
              handleBack();
            } else if (curId === 'skip') {
              handleFinish();
            } else if (curId === 'random') {
              const randomBtn = document.querySelector('.onboarding-root [data-nav-id="random"]');
              if (randomBtn) randomBtn.click();
              sfx?.playDiceRoll?.();
            } else if (curId === 'archetypeTab') {
              setCharacterStudioTab('archetypes');
              sfx?.playTabSwitch?.();
            } else if (curId === 'customTab') {
              setCharacterStudioTab('custom');
              sfx?.playTabSwitch?.();
            } else if (curId?.startsWith('preset_')) {
              const el = document.querySelector(`.onboarding-root [data-nav-id="${curId}"]`);
              if (el) el.click();
            } else if (curId?.startsWith('color_')) {
              const el = document.querySelector(`.onboarding-root [data-nav-id="${curId}"]`);
              if (el) el.click();
            } else {
              handleNext();
            }
          }
          // Directional Navigation
          else if (now - lastNavTime > NAV_COOLDOWN) {
            let dir = null;
            if (dpadUp && (!prevButtons.dpadUp || now - lastNavTime > NAV_COOLDOWN)) dir = 'UP';
            else if (dpadDown && (!prevButtons.dpadDown || now - lastNavTime > NAV_COOLDOWN)) dir = 'DOWN';
            else if (dpadLeft && (!prevButtons.dpadLeft || now - lastNavTime > NAV_COOLDOWN)) dir = 'LEFT';
            else if (dpadRight && (!prevButtons.dpadRight || now - lastNavTime > NAV_COOLDOWN)) dir = 'RIGHT';

            if (dir) {
              const container = document.querySelector('.onboarding-root');
              const currentEl = container?.querySelector(`.gamepad-focused`) ||
                                container?.querySelector(`[data-nav-id="${focusedTarget?.id}"]`);
              const nextEl = findNextSpatialElement({ container, currentEl, direction: dir });
              if (nextEl && nextEl.dataset.navId) {
                setFocusedTarget?.({ zone: 'onboarding', id: nextEl.dataset.navId });
                nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                sfx?.playTileNav?.();
                lastNavTime = now;
              }
            }
          }
        }

        // --- SCREEN 03: Interactive Gamepad Controls ---
        else if (currentStep === 2) {
          // START button -> Skip to Games & Boot Library
          if (btnStart && !prevButtons.btnStart) {
            handleFinish();
          }
          // A button on Skip -> Skip to Games
          else if (btnA && !prevButtons.btnA && focusedTarget?.id === 'skip') {
            handleFinish();
          }
        }

        prevButtons = { btnA, btnB, btnStart, shoulderL, shoulderR, dpadUp, dpadDown, dpadLeft, dpadRight };
      }

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, shouldRenderMobile, currentStep, focusedTarget?.id, handleNext, handleBack, handleFinish, setFocusedTarget, sfx]);

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
            title={hasGamepad ? 'Skip Onboarding & Explore Library (START Button)' : 'Skip Onboarding & Explore Library (ESC Key)'}
            data-nav="onboarding"
            data-nav-id="skip"
          >
            <span className="onboarding-btn-gamepad-badge">
              <span className="gamepad-badge-key">{hasGamepad ? 'START' : 'ESC'}</span>
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
                <div className="onboarding-pillar-card">
                  <div className="pillar-header-row">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                      <Cpu size={22} />
                    </div>
                    <h3 className="pillar-card-title">Native WebAssembly Emulation</h3>
                  </div>
                  <div className="pillar-text">
                    <p>Zero installation, zero server lag. Runs locally in your browser with hardware-accelerated 60 FPS V-Sync, CRT scanline shaders, and turbo fast-forward.</p>
                  </div>

                  {/* Performance Feature Tags */}
                  <div className="pillar-highlight-chips" style={{ margin: '0.15rem 0 0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <span className="pillar-badge-tag">60 FPS V-SYNC</span>
                    <span className="pillar-badge-tag green">0ms LOCAL WASM</span>
                    <span className="pillar-badge-tag purple">CRT SHADERS</span>
                    <span className="pillar-badge-tag gold">TURBO SPEED</span>
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
                <div className="onboarding-pillar-card">
                  <div className="pillar-header-row">
                    <div className="pillar-icon-wrap" style={{ background: 'rgba(160, 185, 129, 0.15)', color: '#10b981' }}>
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
                        <div className="save-tile-icon export-cyan">
                          <ArrowDownToLine size={14} />
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

                      {/* Tile 5: Smart Auto-Resume Banner Simulation */}
                      <div className="desktop-pillar-resume-banner">
                        <div className="erp-icon-wrap">
                          <Zap size={14} />
                        </div>
                        <div className="erp-content">
                          <strong className="erp-title">Resume where you left off?</strong>
                          <span className="erp-sub">Auto-Save snapshot available from last session</span>
                        </div>
                        <div className="erp-btn is-resume">
                          <Zap size={12} />
                          <span>Resume (5s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Universal Achievements & Pokémon Milestones (In-App UX Demo) */}
                <div className="onboarding-pillar-card">
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
                        </div>

                        <div className="desktop-pillar-hof-info">
                          <div className="desktop-pillar-hof-top">
                            <strong className="desktop-pillar-hof-name">{activeProfile?.name || 'Player 1'}</strong>
                            <span className="trophy-level-pill">Lv.2</span>
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
                <div className="onboarding-pillar-card">
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
                    {/* Top Row: 3 Gamepad Status Pills */}
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
                    </div>

                    {/* Dual Column Row: In-Game Touch Controls (50%) + Keyboard Controls (50%) */}
                    <div className="desktop-controls-dual-grid">
                      {/* Column 1: In-Game Mobile Haptic Touch Pad Overlay Preview */}
                      <div className="desktop-touch-pad-showcase">
                        <div className="touch-pad-label-row">
                          <span className="touch-pad-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Smartphone size={12} color="#3b82f6" />
                            <span>TOUCH HUD</span>
                          </span>
                          <span className="touch-pad-sub">Touchscreen</span>
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
                          <span className="touch-pad-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Keyboard size={12} color="#a855f7" />
                            <span>KEYBOARD</span>
                          </span>
                          <span className="touch-pad-sub">Spatial</span>
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
                              <span className="desktop-kc-label">B</span>
                            </div>
                            <div className="desktop-kc-sub-item">
                              <span className="kc-keycap is-action">X</span>
                              <span className="desktop-kc-label">A</span>
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
                              <span className="kc-keycap is-system">↵</span>
                              <span className="desktop-kc-label">Start / Sel</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only Standalone Install & Platform Guidance Cards (Hidden on Desktop & Smart TVs) */}
              {isMobile && !pwa?.isStandalone && !isSmartTv && (pwa?.canInstall || (isSafariBrowser && isApplePlatform)) && (
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
                      DUAL-SCREEN CONSOLE FIRMWARE
                    </span>
                  </div>
                  <span className="hero-preview-live-tag">LIVE WASM</span>
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
                      INSTANT LOW-LATENCY GAMEPLAY
                    </span>
                  </div>
                  <span className="hero-preview-live-tag">60 FPS</span>
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
              activeTab={characterStudioTab}
              onTabChange={setCharacterStudioTab}
            />
          </div>
        )}

        {/* =========================================================
            SLIDE 2: GAMEPAD CONTROLS & DUALSHOCK VISUALIZER (Desktop & TV only)
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

      {/* Bottom Sticky Action Footer (Hidden on Phase 3 on Desktop to give the visualizer full height) */}
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
                title={hasGamepad ? 'Previous Step (B Button)' : 'Previous Step (DEL / BACKSPACE Key)'}
                data-nav="onboarding"
                data-nav-id="back"
              >
                <span className="onboarding-btn-gamepad-badge">
                  <span className="gamepad-badge-key">{hasGamepad ? 'B' : 'DEL'}</span>
                </span>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}

            <button
              className={`onboarding-primary-btn ${focusedTarget?.zone === 'onboarding' && focusedTarget?.id === 'next' ? 'gamepad-focused' : ''}`}
              onClick={handleNext}
              title={currentStep === 0 
                ? (hasGamepad ? 'Create Character (A Button)' : 'Create Character (SPACE Key)')
                : (hasGamepad ? 'View Controls (A Button)' : 'View Controls (SPACE Key)')}
              data-nav="onboarding"
              data-nav-id="next"
            >
              <span className="onboarding-btn-gamepad-badge is-primary">
                <span className="gamepad-badge-key">{hasGamepad ? 'A' : 'SPACE'}</span>
              </span>
              <span>{currentStep === 0 ? 'Create Character' : 'View Controls'}</span>
              {currentStep === totalSteps - 1 ? <Play size={16} fill="currentColor" /> : <ChevronRight size={18} />}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

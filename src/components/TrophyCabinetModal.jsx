import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, 
  X, 
  CheckCircle2, 
  Lock, 
  Flame, 
  Sparkles, 
  Calendar, 
  Clock, 
  Compass, 
  Save, 
  Sliders, 
  BookOpen,
  Award,
  PlayCircle,
  Gamepad2,
  Layers,
  Globe,
  Navigation,
  FolderHeart,
  Database,
  Timer,
  Zap,
  Heart,
  Moon,
  Sun,
  AlertTriangle,
  Shuffle,
  Eye,
  Activity,
  FastForward,
  PauseCircle,
  RotateCcw,
  Repeat,
  DownloadCloud,
  UploadCloud,
  GitBranch,
  UserCheck,
  SunMoon,
  Tv,
  Music,
  Star,
  Gamepad,
  Camera,
  Video,
  ShieldCheck,
  Image,
  Shield,
  Bike,
  Anchor,
  Waves,
  Search,
  Volume2,
  Share2,
  Map,
  Disc,
  Users,
  Crown,
  Feather,
  DollarSign,
  AlertCircle,
  PlusCircle,
  DoorOpen,
  Copy,
  History,
  Coffee,
  Dices,
  ArrowLeft,
  Settings,
  ChevronDown
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { ACHIEVEMENTS_MANIFEST, ACHIEVEMENT_TIERS, ACHIEVEMENT_CATEGORIES } from '../data/achievementsManifest';
import { haptics } from '../services/hapticsService';

const ICON_MAP = {
  PlayCircle,
  Gamepad2,
  Layers,
  Globe,
  Navigation,
  FolderHeart,
  Database,
  Flame,
  Timer,
  Zap,
  Award,
  Heart,
  Moon,
  Sun,
  Calendar,
  Sparkles,
  AlertTriangle,
  Shuffle,
  Eye,
  Activity,
  FastForward,
  PauseCircle,
  Save,
  RotateCcw,
  Repeat,
  DownloadCloud,
  UploadCloud,
  GitBranch,
  UserCheck,
  SunMoon,
  Tv,
  Music,
  Star,
  Gamepad,
  Camera,
  Video,
  ShieldCheck,
  BookOpen,
  Image,
  Trophy,
  Compass,
  Clock,
  Sliders,
  Shield,
  Bike,
  Anchor,
  Waves,
  Search,
  Volume2,
  Share2,
  Map,
  Disc,
  Users,
  Crown,
  Feather,
  DollarSign,
  AlertCircle,
  PlusCircle,
  DoorOpen,
  Copy,
  History,
  Coffee,
  Dices
};

// Calculate Gamer Level from points (scaled for 300G maximum)
function getGamerLevel(points = 0) {
  if (points >= 280) return { level: 8, title: 'Retro Legend' };
  if (points >= 220) return { level: 7, title: 'Master Collector' };
  if (points >= 160) return { level: 6, title: 'Console Champion' };
  if (points >= 110) return { level: 5, title: 'Dedicated Gamer' };
  if (points >= 70) return { level: 4, title: 'Seasoned Player' };
  if (points >= 35) return { level: 3, title: 'Cartridge Explorer' };
  if (points >= 15) return { level: 2, title: 'Apprentice' };
  return { level: 1, title: 'Novice Gamer' };
}

export default function TrophyCabinetModal({
  isOpen,
  onClose,
  initialAchievementId = null,
  activeProfile,
  achievementsEngine,
  sfx
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', or category id
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cardsContainerRef = useRef(null);
  const categoryMenuRef = useRef(null);

  const unlocked = achievementsEngine?.unlocked || {};
  const totalEarnedPoints = achievementsEngine?.totalEarnedPoints || 0;
  const totalPossiblePoints = achievementsEngine?.totalPossiblePoints || 1000;
  const completionPercentage = achievementsEngine?.completionPercentage || 0;

  const unlockedCount = Object.keys(unlocked).length;
  const totalCount = ACHIEVEMENTS_MANIFEST.length;
  const gamerRank = useMemo(() => getGamerLevel(totalEarnedPoints), [totalEarnedPoints]);

  // Filtered achievements list
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS_MANIFEST.filter(item => {
      const isUnlocked = !!unlocked[item.id];
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [statusFilter, categoryFilter, unlocked]);

  const STATUS_TABS = ['all', 'unlocked', 'locked'];
  const CATEGORY_LIST = ['all', ...Object.keys(ACHIEVEMENT_CATEGORIES).map(k => ACHIEVEMENT_CATEGORIES[k].id)];

  // Automatically focus & navigate to target trophy when opened via universal achievement toast click
  useEffect(() => {
    if (!isOpen) return;
    if (initialAchievementId) {
      const targetItem = ACHIEVEMENTS_MANIFEST.find(a => a.id === initialAchievementId);
      if (targetItem) {
        setStatusFilter('unlocked');
        setCategoryFilter('all');
        const unlockedList = ACHIEVEMENTS_MANIFEST.filter(item => !!unlocked[item.id]);
        const idx = unlockedList.findIndex(item => item.id === initialAchievementId);
        if (idx >= 0) {
          setFocusedIndex(idx);
        }
        return;
      }
    }
  }, [isOpen, initialAchievementId, unlocked]);

  // Auto-scroll focused card into view smoothly
  useEffect(() => {
    if (!isOpen || !cardsContainerRef.current) return;
    const focusedCard = cardsContainerRef.current.children[focusedIndex];
    if (focusedCard && typeof focusedCard.scrollIntoView === 'function') {
      focusedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  // Close category dropdown on outside click or touch
  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isCategoryMenuOpen]);

  // Enhanced 2D Spatial Grid & Gamepad Navigation (2 columns: left/right/up/down, L1/R1 tabs, L2/R2 categories)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Close category dropdown or modal on Escape / B
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        if (isCategoryMenuOpen) {
          setIsCategoryMenuOpen(false);
          sfx?.playTileNav?.();
          return;
        }
        sfx?.playModalClose?.();
        onClose();
        return;
      }

      // L1 / Q / PageUp: Cycle Status Tab Left (All -> Locked -> Unlocked -> All)
      if (e.key === 'PageUp' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setStatusFilter(prev => {
          const curIdx = STATUS_TABS.indexOf(prev);
          const nextIdx = (curIdx - 1 + STATUS_TABS.length) % STATUS_TABS.length;
          return STATUS_TABS[nextIdx];
        });
        setFocusedIndex(0);
        sfx?.playTabSwitch?.();
        return;
      }

      // R1 / E / PageDown: Cycle Status Tab Right (All -> Unlocked -> Locked -> All)
      if (e.key === 'PageDown' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setStatusFilter(prev => {
          const curIdx = STATUS_TABS.indexOf(prev);
          const nextIdx = (curIdx + 1) % STATUS_TABS.length;
          return STATUS_TABS[nextIdx];
        });
        setFocusedIndex(0);
        sfx?.playTabSwitch?.();
        return;
      }

      // [ or ] / L2 or R2: Cycle Categories
      if (e.key === '[' || e.key === '{') {
        e.preventDefault();
        setCategoryFilter(prev => {
          const curIdx = CATEGORY_LIST.indexOf(prev);
          const nextIdx = (curIdx - 1 + CATEGORY_LIST.length) % CATEGORY_LIST.length;
          return CATEGORY_LIST[nextIdx];
        });
        setFocusedIndex(0);
        sfx?.playTabSwitch?.();
        return;
      }
      if (e.key === ']' || e.key === '}') {
        e.preventDefault();
        setCategoryFilter(prev => {
          const curIdx = CATEGORY_LIST.indexOf(prev);
          const nextIdx = (curIdx + 1) % CATEGORY_LIST.length;
          return CATEGORY_LIST[nextIdx];
        });
        setFocusedIndex(0);
        sfx?.playTabSwitch?.();
        return;
      }

      const total = filteredAchievements.length;
      if (total === 0) return;

      const cols = window.innerWidth <= 640 ? 1 : 2;

      // 2D Spatial Grid Navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (cols === 2) {
          if (focusedIndex % 2 === 0 && focusedIndex + 1 < total) {
            setFocusedIndex(prev => prev + 1);
            sfx?.playTileNav?.();
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (cols === 2) {
          if (focusedIndex % 2 === 1) {
            setFocusedIndex(prev => prev - 1);
            sfx?.playTileNav?.();
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedIndex + cols < total) {
          setFocusedIndex(prev => prev + cols);
          sfx?.playTileNav?.();
        } else if (focusedIndex < total - 1) {
          setFocusedIndex(total - 1);
          sfx?.playTileNav?.();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedIndex - cols >= 0) {
          setFocusedIndex(prev => prev - cols);
          sfx?.playTileNav?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Direct Gamepad Polling Loop for physical controllers
    let animId = null;
    let prevButtons = {};
    let lastStickMove = 0;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (gp && gp.connected) {
        const now = Date.now();
        const total = filteredAchievements.length;
        const cols = window.innerWidth <= 640 ? 1 : 2;

        const isDown = gp.buttons[13]?.pressed || gp.axes[1] > 0.5;
        const isUp = gp.buttons[12]?.pressed || gp.axes[1] < -0.5;
        const isRight = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;
        const isLeft = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
        const isL1 = gp.buttons[4]?.pressed;
        const isR1 = gp.buttons[5]?.pressed;
        const isL2 = gp.buttons[6]?.pressed;
        const isR2 = gp.buttons[7]?.pressed;
        const isB = gp.buttons[1]?.pressed; // B / Circle button

        // Close on B
        if (isB && !prevButtons[1]) {
          sfx?.playModalClose?.();
          onClose();
          return;
        }

        // L1: Previous status tab
        if (isL1 && !prevButtons[4]) {
          setStatusFilter(prev => {
            const curIdx = STATUS_TABS.indexOf(prev);
            const nextIdx = (curIdx - 1 + STATUS_TABS.length) % STATUS_TABS.length;
            return STATUS_TABS[nextIdx];
          });
          setFocusedIndex(0);
          sfx?.playTabSwitch?.();
        }

        // R1: Next status tab
        if (isR1 && !prevButtons[5]) {
          setStatusFilter(prev => {
            const curIdx = STATUS_TABS.indexOf(prev);
            const nextIdx = (curIdx + 1) % STATUS_TABS.length;
            return STATUS_TABS[nextIdx];
          });
          setFocusedIndex(0);
          sfx?.playTabSwitch?.();
        }

        // L2 / R2: Cycle categories
        if (isL2 && !prevButtons[6]) {
          setCategoryFilter(prev => {
            const curIdx = CATEGORY_LIST.indexOf(prev);
            const nextIdx = (curIdx - 1 + CATEGORY_LIST.length) % CATEGORY_LIST.length;
            return CATEGORY_LIST[nextIdx];
          });
          setFocusedIndex(0);
          sfx?.playTabSwitch?.();
        }
        if (isR2 && !prevButtons[7]) {
          setCategoryFilter(prev => {
            const curIdx = CATEGORY_LIST.indexOf(prev);
            const nextIdx = (curIdx + 1) % CATEGORY_LIST.length;
            return CATEGORY_LIST[nextIdx];
          });
          setFocusedIndex(0);
          sfx?.playTabSwitch?.();
        }

        // Directional 2D grid movement
        if (now - lastStickMove > 180) {
          if (isDown) {
            setFocusedIndex(prev => {
              const next = (prev + cols < total) ? prev + cols : (prev < total - 1 ? total - 1 : prev);
              if (next !== prev) sfx?.playTileNav?.();
              return next;
            });
            lastStickMove = now;
          } else if (isUp) {
            setFocusedIndex(prev => {
              const next = (prev - cols >= 0) ? prev - cols : prev;
              if (next !== prev) sfx?.playTileNav?.();
              return next;
            });
            lastStickMove = now;
          } else if (isRight && cols === 2) {
            setFocusedIndex(prev => {
              if (prev % 2 === 0 && prev + 1 < total) {
                sfx?.playTileNav?.();
                return prev + 1;
              }
              return prev;
            });
            lastStickMove = now;
          } else if (isLeft && cols === 2) {
            setFocusedIndex(prev => {
              if (prev % 2 === 1) {
                sfx?.playTileNav?.();
                return prev - 1;
              }
              return prev;
            });
            lastStickMove = now;
          }
        }

        prevButtons = {
          1: isB,
          4: isL1,
          5: isR1,
          6: isL2,
          7: isR2
        };
      }

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, onClose, filteredAchievements.length, sfx]);

  if (!isOpen) return null;

  return (
    <div className="info-modal-backdrop trophy-modal-backdrop" onClick={onClose}>
      <div 
        className="info-modal-content trophy-cabinet-ds-modal animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Trophy Cabinet & Milestones Showcase"
      >
        {/* Mobile Page Topbar (Back Arrow, Centered Icon & Title, Search/Spacer) */}
        <header className="mobile-games-nav mobile-trophy-page-nav">
          <button 
            type="button"
            className="mobile-games-back-btn"
            onClick={() => {
              sfx?.playModalClose?.();
              haptics.selection();
              onClose();
            }}
            aria-label="Back to Library"
          >
            <ArrowLeft size={16} />
            <span>Library</span>
          </button>
          
          <div className="mobile-games-nav-center">
            <Trophy size={16} color="#f59e0b" />
            <span className="mobile-games-nav-title">Trophies</span>
          </div>

          <div className="mobile-games-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '70px', justifyContent: 'flex-end' }}>
            <span className="mobile-nav-badge is-gold" style={{ position: 'static', padding: '2px 8px', fontSize: '0.65rem' }}>
              {achievementsEngine?.totalEarnedPoints || 0}G
            </span>
          </div>
        </header>

        {/* Nintendo DS Desktop Header (Hidden on Mobile) */}
        <div className="info-modal-header trophy-cabinet-header desktop-only-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="trophy-header-icon-box">
              <Trophy size={20} color="#f59e0b" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="trophy-modal-title">HALL OF FAME</h2>
              <span className="trophy-modal-subtitle">Universal Milestones &amp; Trophies</span>
            </div>
          </div>

          <button 
            type="button"
            className="scraper-modal-close-btn"
            onClick={() => {
              sfx?.playModalClose?.();
              onClose();
            }}
            title="Close (Esc)"
            aria-label="Close Trophy Cabinet"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nintendo DS Player Profile & Status Banner */}
        <div className="trophy-profile-ds-card">
          <div className="trophy-profile-avatar-row">
            <div className="trophy-avatar-frame">
              <MultiAvatar seed={activeProfile?.avatarSeed || activeProfile?.name || 'RetroGamer'} size={46} />
              <span className="trophy-level-pill">Lv.{gamerRank.level}</span>
            </div>

            <div className="trophy-profile-info">
              <div className="trophy-profile-top">
                <strong className="trophy-player-name">{activeProfile?.name || 'Player 1'}</strong>
                <span className="trophy-rank-badge">{gamerRank.title}</span>
              </div>

              {/* Nintendo DS Progress Bar */}
              <div className="trophy-meter-wrap">
                <div className="trophy-meter-track">
                  <div 
                    className="trophy-meter-fill"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="trophy-meter-labels">
                  <span>{unlockedCount} / {totalCount} Unlocked ({completionPercentage}%)</span>
                  <span className="trophy-points-tag">
                    <Trophy size={11} color="#f59e0b" />
                    <strong>{totalEarnedPoints}</strong> / {totalPossiblePoints} G
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="trophy-filter-toolbar">
          {/* Status Tabs */}
          <div className="trophy-status-group">
            <button
              type="button"
              className={`trophy-ds-tab ${statusFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => {
                setStatusFilter('all');
                sfx?.playTabSwitch?.();
                haptics.selection();
              }}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              className={`trophy-ds-tab ${statusFilter === 'unlocked' ? 'is-active' : ''}`}
              onClick={() => {
                setStatusFilter('unlocked');
                sfx?.playTabSwitch?.();
                haptics.selection();
              }}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              type="button"
              className={`trophy-ds-tab ${statusFilter === 'locked' ? 'is-active' : ''}`}
              onClick={() => {
                setStatusFilter('locked');
                sfx?.playTabSwitch?.();
                haptics.selection();
              }}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>

          {/* Category Custom Popover Filter */}
          <div className="trophy-category-wrap" ref={categoryMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="trophy-ds-select-btn"
              onClick={() => {
                setIsCategoryMenuOpen(prev => !prev);
                sfx?.playTileNav?.();
                haptics.selection();
              }}
              aria-haspopup="listbox"
              aria-expanded={isCategoryMenuOpen}
              aria-label="Filter by Category"
            >
              <span>{categoryFilter === 'all' ? 'All Categories' : (ACHIEVEMENT_CATEGORIES[categoryFilter?.toUpperCase()]?.label || categoryFilter)}</span>
              <ChevronDown size={14} style={{ transform: isCategoryMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', opacity: 0.7 }} />
            </button>

            {isCategoryMenuOpen && (
              <div 
                className="trophy-custom-dropdown-menu animate-scale-up"
                role="listbox"
                aria-label="Category Selection"
              >
                <div
                  className={`trophy-dropdown-item ${categoryFilter === 'all' ? 'is-active' : ''}`}
                  role="option"
                  aria-selected={categoryFilter === 'all'}
                  onClick={() => {
                    setCategoryFilter('all');
                    setIsCategoryMenuOpen(false);
                    sfx?.playTabSwitch?.();
                    haptics.selection();
                  }}
                >
                  <span className="trophy-dropdown-item-label">All Categories</span>
                  <div className="trophy-dropdown-radio-indicator">
                    {categoryFilter === 'all' && <div className="trophy-dropdown-radio-inner" />}
                  </div>
                </div>

                {Object.values(ACHIEVEMENT_CATEGORIES).map(cat => {
                  const isSelected = categoryFilter === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`trophy-dropdown-item ${isSelected ? 'is-active' : ''}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        setIsCategoryMenuOpen(false);
                        sfx?.playTabSwitch?.();
                        haptics.selection();
                      }}
                    >
                      <span className="trophy-dropdown-item-label">{cat.label}</span>
                      <div className="trophy-dropdown-radio-indicator">
                        {isSelected && <div className="trophy-dropdown-radio-inner" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trophies Grid */}
        <div className="trophy-ds-cards-grid" ref={cardsContainerRef}>
          {filteredAchievements.length === 0 ? (
            <div className="trophy-ds-empty-state">
              <Lock size={32} color="var(--text-sub)" />
              <span>No trophies match the selected filter.</span>
            </div>
          ) : (
            filteredAchievements.map((item, idx) => {
              const unlockData = unlocked[item.id];
              const isUnlocked = !!unlockData;
              const tier = ACHIEVEMENT_TIERS[item.tier?.toUpperCase()] || ACHIEVEMENT_TIERS.BRONZE;
              const IconComponent = ICON_MAP[item.icon] || Trophy;
              const isFocused = idx === focusedIndex;
              const isTarget = item.id === initialAchievementId;

              return (
                <div
                  key={item.id}
                  className={`trophy-ds-card tier-${item.tier} ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isFocused ? 'is-focused' : ''} ${isTarget ? 'is-target-trophy' : ''}`}
                  tabIndex={0}
                  onFocus={() => setFocusedIndex(idx)}
                  onClick={() => haptics.selection()}
                >
                  {/* Left Icon Box */}
                  <div 
                    className="trophy-ds-icon-box"
                    style={{
                      background: isUnlocked ? tier.bg : 'var(--bg-glass)',
                      color: isUnlocked ? tier.color : 'var(--text-sub)',
                      borderColor: isUnlocked ? tier.border : 'var(--panel-border)'
                    }}
                  >
                    {isUnlocked ? (
                      <IconComponent size={20} strokeWidth={2.3} />
                    ) : (
                      <Lock size={18} />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="trophy-ds-card-body">
                    <div className="trophy-ds-card-title-row">
                      <strong className="trophy-ds-card-title">{item.title}</strong>
                      <span 
                        className="trophy-ds-points-pill"
                        style={{
                          background: isUnlocked ? tier.bg : 'var(--bg-glass)',
                          color: isUnlocked ? tier.color : 'var(--text-sub)',
                          borderColor: isUnlocked ? tier.border : 'var(--panel-border)'
                        }}
                      >
                        +{tier.points}G
                      </span>
                    </div>

                    <p className="trophy-ds-card-desc">{item.description}</p>

                    {/* Footer Row */}
                    <div className="trophy-ds-card-footer">
                      {isUnlocked ? (
                        <div className="trophy-ds-status-meta is-unlocked">
                          <CheckCircle2 size={11} color="#10b981" />
                          <span>
                            {unlockData.unlockedAt ? new Date(unlockData.unlockedAt).toLocaleDateString() : 'Unlocked'}
                            {unlockData.gameTitle ? ` in ${unlockData.gameTitle}` : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="trophy-ds-status-meta is-locked">
                          <Lock size={11} />
                          <span>Locked</span>
                        </div>
                      )}

                      <span className="trophy-ds-category-badge">
                        {ACHIEVEMENT_CATEGORIES[item.category?.toUpperCase()]?.label || item.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Persistent Bottom Navigation Dock on Trophies Page */}
        <nav className="mobile-bottom-nav-bar" aria-label="Main Mobile Navigation">
          {/* Tab 1: Library */}
          <button
            type="button"
            className="mobile-nav-tab"
            onClick={() => {
              onClose();
              sfx?.playTabSwitch?.();
              haptics.selection();
            }}
            aria-label="Library - All Games"
          >
            <div className="mobile-nav-icon-wrap">
              <Gamepad2 size={20} />
            </div>
            <span className="mobile-nav-label">Library</span>
          </button>

          {/* Tab 2: Favorites */}
          <button
            type="button"
            className="mobile-nav-tab"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('retro_nav_tab', { detail: 'favorites' }));
              sfx?.playTabSwitch?.();
              haptics.selection();
            }}
            aria-label="Favorites"
          >
            <div className="mobile-nav-icon-wrap">
              <Star size={20} />
            </div>
            <span className="mobile-nav-label">Favorites</span>
          </button>

          {/* Tab 3: Recent */}
          <button
            type="button"
            className="mobile-nav-tab"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('retro_nav_tab', { detail: 'recent' }));
              sfx?.playTabSwitch?.();
              haptics.selection();
            }}
            aria-label="Recently Played Games"
          >
            <div className="mobile-nav-icon-wrap">
              <Clock size={20} />
            </div>
            <span className="mobile-nav-label">Recent</span>
          </button>

          {/* Tab 4: Trophies (Active) */}
          <button
            type="button"
            className="mobile-nav-tab is-active"
            aria-label="Trophy Cabinet & Achievements"
          >
            <div className="mobile-nav-icon-wrap">
              <Trophy size={20} color="#f59e0b" />
            </div>
            <span className="mobile-nav-label">Trophies</span>
          </button>

          {/* Tab 5: Tools & System Utilities */}
          <button
            type="button"
            className="mobile-nav-tab"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('retro_nav_tab', { detail: 'tools' }));
              sfx?.playTileNav?.();
              haptics.medium();
            }}
            aria-label="Console Utilities & Settings"
          >
            <div className="mobile-nav-icon-wrap">
              <Settings size={20} />
            </div>
            <span className="mobile-nav-label">Tools</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

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
  Image
} from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { ACHIEVEMENTS_MANIFEST, ACHIEVEMENT_TIERS, ACHIEVEMENT_CATEGORIES } from '../data/achievementsManifest';

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
  Sliders
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
  activeProfile,
  achievementsEngine,
  sfx
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', or category id
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cardsContainerRef = useRef(null);

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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        sfx?.playModalClose?.();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filteredAchievements.length - 1));
        sfx?.playTileNav?.();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - 1));
        sfx?.playTileNav?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        {/* Nintendo DS Header */}
        <div className="info-modal-header trophy-cabinet-header">
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
            className="info-close-btn"
            onClick={() => {
              sfx?.playModalClose?.();
              onClose();
            }}
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
              }}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="trophy-category-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                sfx?.playTabSwitch?.();
              }}
              className="trophy-ds-select"
              aria-label="Filter by Category"
            >
              <option value="all">All Categories</option>
              {Object.values(ACHIEVEMENT_CATEGORIES).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
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

              return (
                <div
                  key={item.id}
                  className={`trophy-ds-card tier-${item.tier} ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isFocused ? 'is-focused' : ''}`}
                  tabIndex={0}
                  onFocus={() => setFocusedIndex(idx)}
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
      </div>
    </div>
  );
}

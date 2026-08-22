import React, { useState, useEffect } from 'react';
import { X, Check, Dices, User, Sparkles, Palette } from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { AVATAR_PRESETS, RANDOM_SEEDS } from '../hooks/useProfileManager';

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#334155'
];

/**
 * ProfileCreatorModal - Multiavatar Profile Creation & Customizer Studio
 * Supports real-time Multiavatar SVG morphing, random dice rolls, curated presets, and theme colors.
 * 100% Keyboard & Gamepad accessible.
 */
export default function ProfileCreatorModal({
  isOpen,
  initialProfile = null,
  suggestedName = 'Player',
  onSave,
  onClose,
  focusedTarget,
  setFocusedTarget,
  sfx
}) {
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(suggestedName);
  const [favoriteColor, setFavoriteColor] = useState('#ef4444');

  useEffect(() => {
    if (!isOpen) return;

    if (initialProfile) {
      setName(initialProfile.name || 'Player');
      setAvatarSeed(initialProfile.avatarSeed || initialProfile.name || 'Player');
      setFavoriteColor(initialProfile.favoriteColor || '#ef4444');
    } else {
      const defaultSuggested = suggestedName || 'Player';
      const randomPreset = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
      setName('');
      setAvatarSeed(randomPreset.avatarSeed || defaultSuggested);
      setFavoriteColor(randomPreset.favoriteColor);
    }
  }, [isOpen, initialProfile, suggestedName]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomSeed = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)] + Math.floor(Math.random() * 999);
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    setAvatarSeed(randomSeed);
    setFavoriteColor(randomColor);
    sfx?.playFavoriteToggle?.(true);
  };

  const handleSelectPreset = (preset) => {
    if (!name) setName(preset.name);
    setAvatarSeed(preset.avatarSeed);
    setFavoriteColor(preset.favoriteColor);
    sfx?.playTabSwitch?.();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const fallbackName = suggestedName || 'Player';
    const finalName = name.trim() || fallbackName;
    const finalSeed = avatarSeed.trim() || finalName;

    onSave?.({
      name: finalName,
      avatarSeed: finalSeed,
      favoriteColor
    });
    sfx?.playMenuConfirm?.();
  };

  return (
    <div className="profile-creator-backdrop animate-fade-in" onClick={onClose}>
      <div className="profile-creator-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-creator-header">
          <div className="profile-creator-title">
            <User size={24} color="#ef4444" />
            <h2>{initialProfile ? 'Edit Player Profile' : 'Create Player Profile'}</h2>
          </div>
          <button 
            className={`profile-close-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`} 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="profile-creator-body">
          {/* Left Column: Big Live Multiavatar Preview & Randomize */}
          <div className="avatar-preview-stage">
            <div 
              className="avatar-stage-circle"
              style={{
                borderColor: favoriteColor,
                boxShadow: `0 12px 32px ${favoriteColor}33`
              }}
            >
              <MultiAvatar seed={avatarSeed || name || suggestedName || 'Player'} size={140} />
            </div>

            <button
              type="button"
              className={`avatar-random-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'random' ? 'gamepad-focused' : ''}`}
              onClick={handleRandomize}
              onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: 'random' })}
            >
              <Dices size={18} />
              <span>Randomize Avatar</span>
            </button>

            <span className="multiavatar-attribution">
              Powered by <a href="https://multiavatar.com/" target="_blank" rel="noopener noreferrer">Multiavatar</a>
            </span>
          </div>

          {/* Right Column: Customization Fields & Presets */}
          <div className="profile-fields-column">
            {/* Player Name */}
            <div className="profile-field-group">
              <label htmlFor="player-name-input">Player Name</label>
              <input
                id="player-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!initialProfile && (!avatarSeed || avatarSeed === name)) {
                    setAvatarSeed(e.target.value);
                  }
                }}
                placeholder={suggestedName || 'Enter player name...'}
                maxLength={20}
                onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: 'nameInput' })}
                className={`profile-input-field ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'nameInput' ? 'gamepad-focused' : ''}`}
                autoFocus
              />
            </div>

            {/* Avatar Seed Customizer */}
            <div className="profile-field-group">
              <label htmlFor="avatar-seed-input">Avatar Seed / Character Tag</label>
              <input
                id="avatar-seed-input"
                type="text"
                value={avatarSeed}
                onChange={(e) => setAvatarSeed(e.target.value)}
                placeholder="Custom avatar seed..."
                maxLength={32}
                onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: 'seedInput' })}
                className={`profile-input-field ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'seedInput' ? 'gamepad-focused' : ''}`}
              />
            </div>

            {/* Curated Seed Presets */}
            <div className="profile-field-group">
              <label><Sparkles size={14} /> Avatar Presets</label>
              <div className="avatar-presets-grid">
                {AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = avatarSeed === preset.avatarSeed;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`avatar-preset-chip ${isSelected ? 'is-active' : ''} ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === `preset_${idx}` ? 'gamepad-focused' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                      onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: `preset_${idx}` })}
                    >
                      <MultiAvatar seed={preset.avatarSeed} size={28} />
                      <span className="preset-name">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite Color Palette */}
            <div className="profile-field-group">
              <label><Palette size={14} /> Profile Theme Color</label>
              <div className="color-swatch-row">
                {COLOR_PALETTE.map((color, idx) => {
                  const isSelected = favoriteColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch-circle ${isSelected ? 'is-active' : ''} ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === `color_${idx}` ? 'gamepad-focused' : ''}`}
                      style={{ background: color }}
                      onClick={() => {
                        setFavoriteColor(color);
                        sfx?.playTileNav?.();
                      }}
                      onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: `color_${idx}` })}
                      aria-label={`Select color ${color}`}
                    >
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="profile-creator-footer">
          <button
            type="button"
            className={`profile-btn-secondary ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: 'cancel' })}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`profile-btn-primary ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'save' ? 'gamepad-focused' : ''}`}
            onClick={handleSubmit}
            onFocus={() => setFocusedTarget?.({ zone: 'profileModal', id: 'save' })}
          >
            <Check size={18} />
            <span>{initialProfile ? 'Save Changes' : 'Create Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

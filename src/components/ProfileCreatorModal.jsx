import React, { useState, useEffect } from 'react';
import { X, Check, User, Sparkles } from 'lucide-react';
import CharacterStudio from './CharacterStudio';
import { CHARACTER_ARCHETYPES } from '../utils/characterPresets';

/**
 * ProfileCreatorModal - Multiavatar Profile Creation & Customizer Studio
 * Powered by the unified CharacterStudio component.
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
      const defaultPreset = CHARACTER_ARCHETYPES[0].presets[0];
      setName('');
      setAvatarSeed(defaultPreset.avatarSeed || defaultSuggested);
      setFavoriteColor(defaultPreset.favoriteColor);
    }
  }, [isOpen, initialProfile, suggestedName]);

  if (!isOpen) return null;

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
      <div className="profile-creator-modal custom-studio-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-creator-header">
          <div className="profile-creator-title">
            <User size={22} color={favoriteColor} />
            <h2>{initialProfile ? 'Edit Character Profile' : 'Character Creation Studio'}</h2>
          </div>
          <button 
            className={`profile-close-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`} 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Character Studio */}
        <div className="profile-creator-body custom-studio-body">
          <CharacterStudio
            playerName={name}
            setPlayerName={setName}
            avatarSeed={avatarSeed}
            setAvatarSeed={setAvatarSeed}
            favoriteColor={favoriteColor}
            setFavoriteColor={setFavoriteColor}
            sfx={sfx}
            focusedTarget={focusedTarget}
            setFocusedTarget={setFocusedTarget}
          />
        </div>

        {/* Footer Actions */}
        <div className="profile-creator-footer">
          <button
            type="button"
            className={`profile-btn-secondary profile-btn-cancel ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`profile-btn-primary profile-btn-save ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'save' ? 'gamepad-focused' : ''}`}
            style={{ backgroundColor: favoriteColor }}
            onClick={handleSubmit}
          >
            <Check size={18} />
            <span>{initialProfile ? 'Save Changes' : 'Create Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

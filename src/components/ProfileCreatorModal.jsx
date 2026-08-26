import React, { useState, useEffect } from 'react';
import { X, Check, User, Sparkles, Trash2 } from 'lucide-react';
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
  onDelete,
  canDelete = false,
  onClose,
  focusedTarget,
  setFocusedTarget,
  sfx,
  gamepadConnected = false
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
    <>
      <div className="profile-creator-backdrop animate-fade-in" onClick={onClose}>
        <div className="profile-creator-modal custom-studio-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="profile-creator-header">
            <div className="profile-creator-title">
              <User size={20} color={favoriteColor} />
              <h2>{initialProfile ? 'Edit Character Profile' : 'Character Creation Studio'}</h2>
            </div>
            <button 
              type="button" 
              className={`info-close-btn profile-close-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`} 
              onClick={() => { onClose(); sfx?.playModalClose?.(); }}
              aria-label="Close"
            >
              <X size={18} />
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
              suggestedName={suggestedName}
              sfx={sfx}
              focusedTarget={focusedTarget}
              setFocusedTarget={setFocusedTarget}
              focusZone="profileModal"
              gamepadConnected={gamepadConnected}
            />
          </div>

          {/* Footer Actions */}
          <div className="profile-creator-footer">
            {canDelete && onDelete && (
              <button
                type="button"
                className={`profile-btn-danger ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'delete' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  if (onDelete && initialProfile) {
                    onDelete(initialProfile.id);
                    onClose?.();
                    sfx?.playModalClose?.();
                  }
                }}
                title="Delete Profile"
                aria-label="Delete Profile"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            )}

            <div className="profile-footer-right-actions" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
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
                <Check size={16} />
                <span>{initialProfile ? 'Save Changes' : 'Create Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

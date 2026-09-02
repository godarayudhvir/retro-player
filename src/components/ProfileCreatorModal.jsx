import React, { useState, useEffect } from 'react';
import { X, Check, User, Sparkles, Trash2 } from 'lucide-react';
import CharacterStudio from './CharacterStudio';
import ConfirmModal from './ConfirmModal';
import { CHARACTER_ARCHETYPES } from '../utils/characterPresets';
import { haptics } from '../services/hapticsService';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }

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
      <div className="info-modal-backdrop animate-fade-in" onClick={onClose}>
        <div className="scraper-modal-container custom-studio-modal animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px', width: '92%' }}>
          {/* Header */}
          <header className="scraper-modal-header">
            <div className="scraper-modal-title-group">
              <div className="scraper-icon-bubble" style={{ background: `${favoriteColor}22`, color: favoriteColor }}>
                <User size={22} color={favoriteColor} />
              </div>
              <div>
                <h2>{initialProfile ? 'Edit Character Profile' : 'Character Creation Studio'}</h2>
                <p>Customize your gamer identity, avatar seed, and favorite console color</p>
              </div>
            </div>
            <button
              type="button"
              className={`scraper-modal-close-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
              onClick={() => {
                sfx?.playModalClose?.();
                onClose?.();
                haptics.selection();
              }}
              title="Close (Esc)"
              aria-label="Close Character Studio Modal"
            >
              <X size={18} />
            </button>
          </header>

          {/* Modal Body: Character Studio */}
          <div className="profile-creator-body custom-studio-body" style={{ padding: '1.25rem 1.75rem', overflowY: 'auto' }}>
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
          <footer className="scraper-modal-footer" style={{ justifyContent: canDelete && initialProfile ? 'space-between' : 'flex-end' }}>
            {canDelete && initialProfile && (
              <div className="scraper-footer-left">
                <button
                  type="button"
                  className={`settings-action-btn profile-btn-danger ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'delete' ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    sfx?.playTileNav?.();
                    setShowDeleteConfirm(true);
                  }}
                  title={`Delete Profile (${initialProfile.name})`}
                >
                  <Trash2 size={16} />
                  <span>Delete Profile</span>
                </button>
              </div>
            )}
            <div className="scraper-footer-actions">
              <button
                type="button"
                className={`settings-action-btn folder-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`}
                onClick={() => {
                  onClose?.();
                  sfx?.playModalClose?.();
                  haptics.selection();
                }}
              >
                {gamepadConnected && <span className="osk-btn-badge badge-b">B</span>}
                <span>Cancel</span>
              </button>

              <button
                type="button"
                className={`settings-action-btn primary ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'save' ? 'gamepad-focused' : ''}`}
                style={{ backgroundColor: favoriteColor, borderColor: favoriteColor }}
                onClick={(e) => {
                  haptics.medium();
                  handleSubmit(e);
                }}
              >
                {gamepadConnected && <span className="osk-btn-badge badge-x">X</span>}
                <Check size={16} />
                <span>{initialProfile ? 'Save Changes' : 'Create Profile'}</span>
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Profile?"
        message={`Are you sure you want to permanently delete profile "${initialProfile?.name}"? All profile favorites, recents, in-game saves, save states, and playtime data will be permanently erased.`}
        confirmLabel="Delete Profile"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          if (initialProfile) {
            onDelete?.(initialProfile.id);
            sfx?.playModalClose?.();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        sfx={sfx}
      />
    </>
  );
}

import React, { useState } from 'react';
import { Plus, Check, Edit2, Trash2, X, Sparkles, Gamepad2 } from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import ConfirmModal from './ConfirmModal';

/**
 * Netflix / Nintendo Switch style "Who's Playing?" profile selector modal.
 */
export default function ProfileSelectModal({
  isOpen,
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  onEditProfile,
  onDeleteProfile,
  onClose,
  focusedTarget,
  setFocusedTarget,
  sfx
}) {
  const [isManaging, setIsManaging] = useState(false);
  const [pendingDeleteProfile, setPendingDeleteProfile] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-select-backdrop animate-fade-in" onClick={onClose}>
        <div className="profile-select-modal" onClick={(e) => e.stopPropagation()}>
          <div className="profile-modal-header">
            <div className="profile-modal-title">
              <Gamepad2 size={32} color="#ef4444" />
              <h2>Who&apos;s Playing?</h2>
            </div>
            {onClose && (
              <button 
                className={`profile-close-btn ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`} 
                onClick={onClose} 
                aria-label="Close Profile Selector"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <p className="profile-select-subtitle">
            Select your profile to continue your gaming saves, favorites, and playtime progress.
          </p>

          <div className="profile-cards-grid">
            {profiles.map((profile, index) => {
              const isActive = profile.id === activeProfileId;
              const isFocused = focusedTarget?.zone === 'profileModal' && focusedTarget?.index === index;
              return (
                <div
                  key={profile.id}
                  className={`profile-card ${isActive ? 'active' : ''} ${isManaging ? 'managing' : ''} ${isFocused ? 'gamepad-focused' : ''}`}
                  onClick={() => {
                    if (isManaging) {
                      onEditProfile?.(profile);
                    } else {
                      onSelectProfile?.(profile.id);
                    }
                  }}
                  tabIndex={0}
                >
                  <div
                    className="profile-avatar-container"
                    style={{ borderColor: isActive ? (profile.favoriteColor || '#ef4444') : undefined }}
                  >
                    <MultiAvatar seed={profile.avatarSeed || profile.name || 'Player'} size={110} />
                    {isActive && !isManaging && (
                      <div className="profile-active-check" style={{ background: profile.favoriteColor || '#ef4444' }}>
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <span className="profile-card-name">{profile.name}</span>
                </div>
              );
            })}

            {/* Add Profile Card */}
            <div
              className={`profile-card add-profile-card ${focusedTarget?.zone === 'profileModal' && focusedTarget?.index === profiles.length ? 'gamepad-focused' : ''}`}
              onClick={() => {
                onCreateNewProfile?.();
              }}
              tabIndex={0}
            >
              <div className="add-profile-circle">
                <Plus size={36} />
              </div>
              <span className="profile-card-name">Add Profile</span>
            </div>
          </div>

          {/* Footer Management Actions */}
          <div className="profile-modal-footer">
            <button
              className={`profile-manage-toggle-btn ${isManaging ? 'active' : ''} ${focusedTarget?.zone === 'profileModal' && focusedTarget?.id === 'manage' ? 'gamepad-focused' : ''}`}
              onClick={() => {
                setIsManaging(!isManaging);
                sfx?.playTileNav?.();
              }}
            >
              {isManaging ? 'Done Editing' : 'Manage Profiles'}
            </button>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingDeleteProfile}
        title="Delete Profile?"
        message={`Are you sure you want to permanently delete profile "${pendingDeleteProfile?.name}"? All profile favorites, recents, in-game saves, save states, and playtime data will be permanently erased.`}
        confirmLabel="Delete Profile"
        onConfirm={() => {
          if (pendingDeleteProfile) {
            onDeleteProfile?.(pendingDeleteProfile.id);
            setPendingDeleteProfile(null);
            sfx?.playModalClose?.();
          }
        }}
        onCancel={() => setPendingDeleteProfile(null)}
        sfx={sfx}
      />
    </>
  );
}

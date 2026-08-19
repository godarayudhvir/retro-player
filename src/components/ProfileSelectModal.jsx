import React, { useState } from 'react';
import { Plus, Check, Edit2, Trash2, X, Sparkles, Gamepad2 } from 'lucide-react';
import MiiAvatar from './MiiAvatar';

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
  sfx
}) {
  const [isManaging, setIsManaging] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="profile-select-backdrop animate-fade-in" onClick={onClose}>
      <div className="profile-select-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div className="profile-modal-title">
            <Gamepad2 size={32} color="#ef4444" />
            <h2>Who&apos;s Playing?</h2>
          </div>
          {onClose && (
            <button className="profile-close-btn" onClick={onClose} aria-label="Close Profile Selector">
              <X size={20} />
            </button>
          )}
        </div>

        <p className="profile-select-subtitle">
          Select your profile to continue your gaming saves, favorites, and playtime progress.
        </p>

        {/* Profiles Grid */}
        <div className="profile-cards-grid">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfileId;

            return (
              <div
                key={profile.id}
                className={`profile-card ${isActive ? 'is-active-profile' : ''}`}
                onClick={() => {
                  if (isManaging) {
                    onEditProfile?.(profile);
                  } else {
                    onSelectProfile?.(profile.id);
                    sfx?.playTabSwitch?.();
                    onClose?.();
                  }
                }}
              >
                <div className="profile-avatar-container" style={{ borderColor: profile.favoriteColor || '#ef4444' }}>
                  <MiiAvatar miiData={profile.miiData || {}} size={96} />
                  {isActive && !isManaging && (
                    <div className="profile-active-check" title="Active Profile">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  )}
                  {isManaging && (
                    <div className="profile-edit-overlay">
                      <Edit2 size={22} color="#ffffff" />
                    </div>
                  )}
                </div>

                <span className="profile-card-name">{profile.name}</span>

                {isManaging && profiles.length > 1 && (
                  <button
                    className="profile-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete profile "${profile.name}"?`)) {
                        onDeleteProfile?.(profile.id);
                        sfx?.playModalClose?.();
                      }
                    }}
                    title="Delete Profile"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Profile Card */}
          <div
            className="profile-card add-profile-card"
            onClick={() => {
              onCreateNewProfile?.();
              sfx?.playModalOpen?.();
            }}
          >
            <div className="add-profile-circle">
              <Plus size={36} color="#64748b" />
            </div>
            <span className="profile-card-name">Add Profile</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="profile-modal-footer">
          <button
            className={`profile-manage-toggle-btn ${isManaging ? 'active' : ''}`}
            onClick={() => {
              setIsManaging(prev => !prev);
              sfx?.playTileNav?.();
            }}
          >
            {isManaging ? 'Done Managing' : 'Manage Profiles'}
          </button>
        </div>
      </div>
    </div>
  );
}

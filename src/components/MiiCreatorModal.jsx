import React, { useState } from 'react';
import { X, Check, Dices, User, Sparkles, Palette, Smile, Eye, Glasses } from 'lucide-react';
import MiiAvatar from './MiiAvatar';
import { MII_PRESETS, INITIAL_MII_DATA } from '../hooks/useProfileManager';

const SKIN_PALETTE = ['#fed7aa', '#ffd1a4', '#fde047', '#fef08a', '#fbcfe8', '#d6a374', '#a16207', '#78350f'];
const HAIR_PALETTE = ['#451a03', '#1e293b', '#78350f', '#d97706', '#f59e0b', '#dc2626', '#3b82f6', '#10b981', '#a855f7', '#64748b'];
const SHIRT_PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#334155'];
const EYE_PALETTE = ['#1e293b', '#451a03', '#0284c7', '#059669', '#7c3aed', '#b91c1c'];

/**
 * Nintendo Mii Style Avatar Creation & Profile Customizer Studio Wizard.
 */
export default function MiiCreatorModal({
  isOpen,
  initialProfile = null,
  onSave,
  onClose,
  focusedTarget,
  setFocusedTarget,
  sfx
}) {
  const [name, setName] = useState('Player');
  const [activeTab, setActiveTab] = useState('face'); // 'face', 'hair', 'eyes', 'extras', 'presets'
  const [miiData, setMiiData] = useState({ ...INITIAL_MII_DATA });
  const [favoriteColor, setFavoriteColor] = useState('#ef4444');

  // Reset or load profile whenever modal is opened
  React.useEffect(() => {
    if (!isOpen) return;

    if (initialProfile) {
      setName(initialProfile.name || 'Player');
      setMiiData(initialProfile.miiData ? { ...initialProfile.miiData } : { ...INITIAL_MII_DATA });
      setFavoriteColor(initialProfile.favoriteColor || initialProfile.miiData?.favoriteColor || '#ef4444');
    } else {
      // Fresh new profile with randomized playful defaults
      const randomSkin = SKIN_PALETTE[Math.floor(Math.random() * SKIN_PALETTE.length)];
      const randomHair = HAIR_PALETTE[Math.floor(Math.random() * HAIR_PALETTE.length)];
      const randomShirt = SHIRT_PALETTE[Math.floor(Math.random() * SHIRT_PALETTE.length)];
      const randomEyeCol = EYE_PALETTE[Math.floor(Math.random() * EYE_PALETTE.length)];

      setName('');
      setMiiData({
        gender: Math.random() > 0.5 ? 'male' : 'female',
        faceShape: Math.floor(Math.random() * 4),
        skinColor: randomSkin,
        hairStyle: Math.floor(Math.random() * 6),
        hairColor: randomHair,
        eyeType: Math.floor(Math.random() * 4),
        eyeColor: randomEyeCol,
        eyebrowType: Math.floor(Math.random() * 3),
        noseType: Math.floor(Math.random() * 3),
        mouthType: Math.floor(Math.random() * 4),
        glasses: 0,
        mustache: 0,
        favoriteColor: randomShirt
      });
      setFavoriteColor(randomShirt);
    }
    setActiveTab('face');
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setMiiData(prev => ({ ...prev, [field]: value }));
    sfx?.playTileNav?.();
  };

  const handleRandomize = () => {
    const randomSkin = SKIN_PALETTE[Math.floor(Math.random() * SKIN_PALETTE.length)];
    const randomHair = HAIR_PALETTE[Math.floor(Math.random() * HAIR_PALETTE.length)];
    const randomShirt = SHIRT_PALETTE[Math.floor(Math.random() * SHIRT_PALETTE.length)];
    const randomEyeCol = EYE_PALETTE[Math.floor(Math.random() * EYE_PALETTE.length)];

    setMiiData({
      gender: Math.random() > 0.5 ? 'male' : 'female',
      faceShape: Math.floor(Math.random() * 4),
      skinColor: randomSkin,
      hairStyle: Math.floor(Math.random() * 6),
      hairColor: randomHair,
      eyeType: Math.floor(Math.random() * 4),
      eyeColor: randomEyeCol,
      eyebrowType: Math.floor(Math.random() * 3),
      noseType: Math.floor(Math.random() * 3),
      mouthType: Math.floor(Math.random() * 4),
      glasses: Math.floor(Math.random() * 4),
      mustache: Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0,
      favoriteColor: randomShirt
    });
    setFavoriteColor(randomShirt);
    sfx?.playFavoriteToggle?.(true);
  };

  const handleSelectPreset = (preset) => {
    setName(preset.name);
    setMiiData({ ...preset.miiData });
    setFavoriteColor(preset.favoriteColor);
    sfx?.playTabSwitch?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave?.({
      name: name.trim(),
      favoriteColor,
      miiData: { ...miiData, favoriteColor }
    });
    sfx?.playSaveDetected?.();
    onClose?.();
  };

  return (
    <div className="mii-creator-backdrop animate-fade-in" onClick={onClose}>
      <div className="mii-creator-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mii-creator-header">
          <div className="mii-creator-title">
            <Sparkles size={24} color="#f59e0b" />
            <h2>{initialProfile ? 'Edit Profile & Mii Avatar' : 'Create Mii Profile'}</h2>
          </div>
          <button 
            className={`profile-close-btn ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`} 
            onClick={onClose} 
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mii-creator-body">
          {/* Left Column: Live Avatar Stage */}
          <div className="mii-stage-column">
            <div className="mii-stage-preview">
              <MiiAvatar miiData={{ ...miiData, favoriteColor }} size={160} />
            </div>

            <div className="mii-name-input-group">
              <label htmlFor="mii-name-input">Player Name</label>
              <input
                id="mii-name-input"
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedTarget?.({ zone: 'miiModal', id: 'nameInput' })}
                placeholder="Enter Name"
                className={`mii-input-field ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'nameInput' ? 'gamepad-focused' : ''}`}
              />
            </div>

            <button 
              type="button" 
              className={`mii-random-btn ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'random' ? 'gamepad-focused' : ''}`} 
              onClick={handleRandomize}
            >
              <Dices size={18} />
              <span>Randomize Avatar</span>
            </button>
          </div>

          {/* Right Column: Customizer Tabs & Palettes */}
          <div className="mii-editor-column">
            {/* Tabs Nav */}
            <div className="mii-editor-tabs">
              <button
                type="button"
                className={`mii-tab-btn ${activeTab === 'face' ? 'active' : ''} ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'tab-face' ? 'gamepad-focused' : ''}`}
                onClick={() => setActiveTab('face')}
              >
                <Smile size={16} />
                <span>Head & Skin</span>
              </button>

              <button
                type="button"
                className={`mii-tab-btn ${activeTab === 'hair' ? 'active' : ''} ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'tab-hair' ? 'gamepad-focused' : ''}`}
                onClick={() => setActiveTab('hair')}
              >
                <Palette size={16} />
                <span>Hair</span>
              </button>

              <button
                type="button"
                className={`mii-tab-btn ${activeTab === 'eyes' ? 'active' : ''} ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'tab-eyes' ? 'gamepad-focused' : ''}`}
                onClick={() => setActiveTab('eyes')}
              >
                <Eye size={16} />
                <span>Face & Eyes</span>
              </button>

              <button
                type="button"
                className={`mii-tab-btn ${activeTab === 'extras' ? 'active' : ''} ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'tab-extras' ? 'gamepad-focused' : ''}`}
                onClick={() => setActiveTab('extras')}
              >
                <Glasses size={16} />
                <span>Style & Shirt</span>
              </button>

              <button
                type="button"
                className={`mii-tab-btn ${activeTab === 'presets' ? 'active' : ''} ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'tab-presets' ? 'gamepad-focused' : ''}`}
                onClick={() => setActiveTab('presets')}
              >
                <User size={16} />
                <span>Presets</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mii-tab-content">
              {activeTab === 'face' && (
                <div className="mii-section">
                  <h4>Face Shape</h4>
                  <div className="mii-grid-options">
                    {['Round', 'Oval', 'Square', 'Cute / Soft'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`mii-option-chip ${miiData.faceShape === idx ? 'active' : ''}`}
                        onClick={() => updateField('faceShape', idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <h4>Skin Tone</h4>
                  <div className="mii-color-palette">
                    {SKIN_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch ${miiData.skinColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateField('skinColor', color)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'hair' && (
                <div className="mii-section">
                  <h4>Hairstyle</h4>
                  <div className="mii-grid-options">
                    {['Classic Parted', 'Anime Bangs', 'Curly Wave', 'Nintendo Cap', 'Ponytail', 'Clean Cut'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`mii-option-chip ${miiData.hairStyle === idx ? 'active' : ''}`}
                        onClick={() => updateField('hairStyle', idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <h4>Hair Color</h4>
                  <div className="mii-color-palette">
                    {HAIR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch ${miiData.hairColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateField('hairColor', color)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'eyes' && (
                <div className="mii-section">
                  <h4>Eye Shape & Expression</h4>
                  <div className="mii-grid-options">
                    {['Classic Dots', 'Anime Shine', 'Happy Smiles (^_^)', 'Cool Wink'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`mii-option-chip ${miiData.eyeType === idx ? 'active' : ''}`}
                        onClick={() => updateField('eyeType', idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <h4>Eye Color</h4>
                  <div className="mii-color-palette">
                    {EYE_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch ${miiData.eyeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateField('eyeColor', color)}
                      />
                    ))}
                  </div>

                  <h4>Mouth Expression</h4>
                  <div className="mii-grid-options">
                    {['Gentle Smile', 'Open Joy', 'Playful Smirk', 'Calm Neutral'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`mii-option-chip ${miiData.mouthType === idx ? 'active' : ''}`}
                        onClick={() => updateField('mouthType', idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'extras' && (
                <div className="mii-section">
                  <h4>Glasses & Eyewear</h4>
                  <div className="mii-grid-options">
                    {['None', 'Classic Rectangular', 'Round Gold', '80s Cool Shades'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`mii-option-chip ${miiData.glasses === idx ? 'active' : ''}`}
                        onClick={() => updateField('glasses', idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <h4>Mustache & Facial Hair</h4>
                  <div className="mii-grid-options">
                    {['None', 'Mario Mustache', 'Goatee'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`mii-option-chip ${miiData.mustache === idx ? 'active' : ''}`}
                        onClick={() => updateField('mustache', idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <h4>Favorite Color (Shirt & Badge)</h4>
                  <div className="mii-color-palette">
                    {SHIRT_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-swatch ${favoriteColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setFavoriteColor(color);
                          updateField('favoriteColor', color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'presets' && (
                <div className="mii-section">
                  <h4>Nintendo Icon Presets</h4>
                  <div className="mii-presets-grid">
                    {MII_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className="mii-preset-card"
                        onClick={() => handleSelectPreset(preset)}
                      >
                        <MiiAvatar miiData={preset.miiData} size={54} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mii-creator-footer">
          <button 
            type="button" 
            className={`mii-cancel-btn ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`} 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={`mii-save-btn ${focusedTarget?.zone === 'miiModal' && focusedTarget?.id === 'save' ? 'gamepad-focused' : ''}`} 
            onClick={handleSubmit} 
            disabled={!name.trim()}
          >
            <Check size={18} />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

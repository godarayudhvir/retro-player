import React, { useState } from 'react';
import { Dices, Check, Tag, Shield, Zap, Sword, Gamepad2, User, Sparkles } from 'lucide-react';
import MultiAvatar from './MultiAvatar';
import { CHARACTER_ARCHETYPES, COLOR_PALETTE, RANDOM_CHARACTER_SEEDS } from '../utils/characterPresets';

/**
 * Reusable DS Touch Character Studio & Profile Customizer.
 * Used in Onboarding Step 2 and Profile Creator/Editor Modal.
 */
export default function CharacterStudio({
  playerName,
  setPlayerName,
  avatarSeed,
  setAvatarSeed,
  favoriteColor,
  setFavoriteColor,
  suggestedName = 'Player',
  sfx,
  focusedTarget,
  setFocusedTarget,
  focusZone = 'profileModal',
  gamepadConnected = false
}) {
  const [activeTab, setActiveTab] = useState('archetypes'); // 'archetypes' | 'custom'
  const [activeCategory, setActiveCategory] = useState('heroes');

  // Full random character generator
  const handleRollDice = () => {
    const randomSeedBase = RANDOM_CHARACTER_SEEDS[Math.floor(Math.random() * RANDOM_CHARACTER_SEEDS.length)];
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newSeed = `${randomSeedBase}_${randomSuffix}`;
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    setAvatarSeed(newSeed);
    setFavoriteColor(randomColor);
    sfx?.playFavoriteToggle?.(true);
  };

  const currentArchetypeGroup = CHARACTER_ARCHETYPES.find(a => a.id === activeCategory) || CHARACTER_ARCHETYPES[0];

  return (
    <div className="character-studio-container">
      {/* Left Column: Live Character Card Stage */}
      <div className="character-studio-hero">
        <div 
          className="character-passport-card"
          style={{ borderColor: `${favoriteColor}88` }}
        >
          {/* Passport Header Badge */}
          <div className="character-passport-header">
            <span className="character-passport-chip" style={{ background: `${favoriteColor}22`, color: favoriteColor }}>
              RETRO PASSPORT
            </span>
            <span className="character-passport-id">
              #{Math.abs((avatarSeed || '0').split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0) % 99999).toString().padStart(5, '0')}
            </span>
          </div>

          <div className="character-passport-body">
            {/* Live Dynamic Multiavatar */}
            <div 
              className="character-avatar-portal"
              style={{ borderColor: favoriteColor }}
            >
              <MultiAvatar seed={avatarSeed || playerName || suggestedName || 'Player'} size={120} />
            </div>

            {/* Player Identity Details & Randomizer */}
            <div className="character-passport-meta">
              <div className="character-passport-name">{playerName || suggestedName || 'Player'}</div>
              <button
                type="button"
                className={`character-dice-btn avatar-random-btn ${gamepadConnected && focusedTarget?.zone === focusZone && focusedTarget?.id === 'random' ? 'gamepad-focused' : ''}`}
                onClick={handleRollDice}
                title="Roll Random Character"
              >
                <Dices size={15} />
                <span>Randomize</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Customization Controls */}
      <div className="character-studio-controls">
        {/* Navigation Tabs */}
        <div className="character-studio-tabs" role="tablist">
          <button
            type="button"
            className={`character-studio-tab ${activeTab === 'archetypes' ? 'is-active' : ''} ${gamepadConnected && focusedTarget?.zone === focusZone && focusedTarget?.id === 'archetypeTab' ? 'gamepad-focused' : ''}`}
            onClick={() => { setActiveTab('archetypes'); sfx?.playTabSwitch?.(); }}
          >
            {gamepadConnected && (
              <span className="tab-bumper-key">L</span>
            )}
            <Gamepad2 size={15} />
            <span>Character Archetypes</span>
          </button>

          <button
            type="button"
            className={`character-studio-tab ${activeTab === 'custom' ? 'is-active' : ''} ${gamepadConnected && focusedTarget?.zone === focusZone && focusedTarget?.id === 'customTab' ? 'gamepad-focused' : ''}`}
            onClick={() => { setActiveTab('custom'); sfx?.playTabSwitch?.(); }}
          >
            {gamepadConnected && (
              <span className="tab-bumper-key">R</span>
            )}
            <Tag size={15} />
            <span>Custom Name & Color</span>
          </button>
        </div>

        {/* Tab 1: Archetypes & Presets */}
        {activeTab === 'archetypes' && (
          <div className="character-tab-content animate-fade-in">
            {/* Category Filter Chips — 4 inline categories */}
            <div className="archetype-category-chips">
              {CHARACTER_ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  type="button"
                  data-category-id={arch.id}
                  className={`archetype-category-btn ${activeCategory === arch.id ? 'is-active' : ''} ${(focusedTarget?.zone === focusZone || focusedTarget?.zone === 'profileModal') && focusedTarget?.id === `category-${arch.id}` ? 'gamepad-focused' : ''}`}
                  onClick={() => { setActiveCategory(arch.id); sfx?.playTileNav?.(); }}
                >
                  {arch.id === 'heroes' && <Sword size={14} />}
                  {arch.id === 'cyber' && <Zap size={14} />}
                  {arch.id === 'rpg' && <Shield size={14} />}
                  {arch.id === 'arcade' && <Gamepad2 size={14} />}
                  <span>{arch.label}</span>
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="archetype-grid-scrollable">
              {currentArchetypeGroup.presets.map((preset) => {
                const isSelected = avatarSeed === preset.avatarSeed;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`archetype-card-chip ${isSelected ? 'is-active' : ''} ${(focusedTarget?.zone === focusZone || focusedTarget?.zone === 'profileModal') && focusedTarget?.id === `preset_${currentArchetypeGroup.presets.indexOf(preset)}` ? 'gamepad-focused' : ''}`}
                    onClick={() => {
                      setAvatarSeed(preset.avatarSeed);
                      setFavoriteColor(preset.favoriteColor);
                      if (!playerName || playerName === 'Player 1' || playerName === 'Player') {
                        setPlayerName(preset.name);
                      }
                      sfx?.playTileNav?.();
                    }}
                  >
                    <div className="archetype-avatar-wrap">
                      <MultiAvatar seed={preset.avatarSeed} size={36} />
                    </div>
                    <div className="archetype-info">
                      <strong>{preset.name}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Identity & Color Swatches */}
        {activeTab === 'custom' && (
          <div className="character-tab-content animate-fade-in">
            {/* Player Name Input */}
            <div className="character-form-row">
              <label className="character-field-label">Player Name</label>
              <input
                id="player-name-input"
                type="text"
                data-character-field="name"
                className={`character-text-input ${(focusedTarget?.zone === focusZone || focusedTarget?.zone === 'profileModal') && focusedTarget?.id === 'nameInput' ? 'gamepad-focused' : ''}`}
                value={playerName}
                onChange={(e) => {
                  const val = e.target.value;
                  setPlayerName(val);
                  if (!avatarSeed || avatarSeed === playerName) {
                    setAvatarSeed(val);
                  }
                }}
                placeholder="Enter player handle..."
                maxLength={16}
              />
            </div>

            {/* Custom Seed Input */}
            <div className="character-form-row">
              <label className="character-field-label">Custom Avatar Seed</label>
              <input
                id="avatar-seed-input"
                type="text"
                data-character-field="seed"
                className={`character-text-input ${(focusedTarget?.zone === focusZone || focusedTarget?.zone === 'profileModal') && focusedTarget?.id === 'seedInput' ? 'gamepad-focused' : ''}`}
                value={avatarSeed}
                onChange={(e) => setAvatarSeed(e.target.value)}
                placeholder="Type any word or code..."
                maxLength={32}
              />
            </div>

            {/* Console Color Palette */}
            <div className="character-form-row">
              <label className="character-field-label">Console Accent Color</label>
              <div className="character-palette-row">
                {COLOR_PALETTE.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`character-color-circle ${favoriteColor === col ? 'is-active' : ''} ${(focusedTarget?.zone === focusZone || focusedTarget?.zone === 'profileModal') && focusedTarget?.id === `color_${COLOR_PALETTE.indexOf(col)}` ? 'gamepad-focused' : ''}`}
                    style={{ background: col }}
                    onClick={() => {
                      setFavoriteColor(col);
                      sfx?.playTileNav?.();
                    }}
                  >
                    {favoriteColor === col && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

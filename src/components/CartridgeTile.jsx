import React, { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { getCartridgeColor } from '../utils/cartridgeColors';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Individual 3D Physical Retro Game Tile component.
 * Supports:
 * - Pure Cover Poster View (used in "All Games" overview mode)
 * - Authentic Dedicated Cartridge & Jewel Case Geometries:
 *   - NES, SNES, N64, GBA, NDS, Sega Genesis, GB/GBC, Game Gear, Atari 2600, PlayStation (PS1 Jewel Case)
 * - Standard Console Cartridge Shells (Arcade, etc.)
 */
export default function CartridgeTile({
  game,
  metadata,
  isFocused,
  isFavorite,
  onClick,
  coverOnly = false
}) {
  if (!game) return null;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isNes = game.systemKey === 'nes' || game.systemCore === 'nes' || game.systemKey === 'famicom';
  const isSnes = game.systemKey === 'snes' || game.systemCore === 'snes' || game.systemKey === 'super_nintendo' || game.systemKey === 'supernintendo' || game.systemKey === 'sfc';
  const isN64 = game.systemKey === 'n64' || game.systemCore === 'n64' || game.systemKey === 'nintendo64';
  const isGba = game.systemKey === 'gba' || game.systemCore === 'gba' || game.systemKey === 'gameboyadvance';
  const isNds = game.systemKey === 'nds' || game.systemCore === 'nds' || game.systemKey === 'nintendods' || game.systemKey === 'ds';
  const isGenesis = game.systemKey === 'genesis' || game.systemCore === 'segaMD' || game.systemKey === 'megadrive' || game.systemKey === 'sega_genesis' || game.systemKey === 'segagenesis' || game.systemKey === 'sega';
  const isGb = game.systemKey === 'gb' || game.systemKey === 'gbc' || game.systemCore === 'gb' || game.systemKey === 'gameboy' || game.systemKey === 'gameboycolor';
  const isGameGear = game.systemKey === 'gamegear' || game.systemCore === 'segaGG' || game.systemKey === 'game_gear' || game.systemKey === 'gg';
  const isAtari = game.systemKey === 'atari2600' || game.systemCore === 'atari2600' || game.systemKey === 'atari' || game.systemKey === 'atari_2600' || game.systemKey === 'a2600';
  const isPsx = game.systemKey === 'psx' || game.systemKey === 'ps1' || game.systemKey === 'playstation' || game.systemCore === 'psx' || game.systemCore === 'playstation';
  const isArcade = game.systemKey === 'arcade' || game.systemKey === 'mame' || game.systemKey === 'neogeo' || game.systemKey === 'fbalpha' || game.systemKey === 'fbneo' || game.systemCore === 'mame' || game.systemCore === 'fbalpha' || game.systemCore === 'fbneo' || game.systemCore === 'arcade' || game.systemCore === 'mame2003_plus';
  const cartColor = getCartridgeColor(game);
  const rawCover = metadata?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;

  // =========================================================================
  // 0. CLEAN COVER POSTER MODE (For "All Games" and Arcade / MAME titles)
  // =========================================================================
  if (coverOnly || isArcade) {
    return (
      <div
        className={`game-tile cover-poster-tile ${isArcade ? 'arcade-poster-tile' : ''} ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        <div
          className="cover-platform-pill"
          style={{
            backgroundColor: isArcade ? '#f59e0b' : (game.systemColor || '#3b82f6')
          }}
        >
          {isArcade ? (game.systemName || 'ARCADE') : (game.systemName || game.systemKey?.toUpperCase())}
        </div>

        {isFavorite && (
          <div className="cartridge-favorite-badge cover-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="cover-poster-frame">
          {!imgLoaded && !imgError && coverSrc && (
            <div className="cartridge-loading-shimmer">
              <Sparkles size={16} className="shimmer-sparkle" />
            </div>
          )}

          {coverSrc && !imgError ? (
            <img
              src={coverSrc}
              alt={game.title}
              className={`tile-img cover-poster-img ${imgLoaded ? 'loaded' : 'loading'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(false);
              }}
            />
          ) : (
            <div
              className="cover-fallback-poster"
              style={{
                background: `linear-gradient(145deg, ${game.systemColor || '#3b82f6'}33 0%, rgba(15, 23, 42, 0.95) 100%)`
              }}
            >
              {game.systemIcon && (
                <img src={resolveAssetPath(game.systemIcon)} alt="" className="cover-fallback-icon" />
              )}
              <span className="cover-fallback-title">{game.title}</span>
              <span className="cover-fallback-system">{game.systemName}</span>
            </div>
          )}

          <div className="cartridge-label-sheen" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. NES Cartridge Specialized Layout
  // =========================================================================
  if (isNes) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-nes ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge nes-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="nes-cart-top-lip" />

        <div className="nes-cart-body">
          <div className="nes-rib-column">
            <div className="nes-rib-top-step">
              <div className="nes-mini-groove" />
              <div className="nes-mini-groove" />
              <div className="nes-mini-groove" />
            </div>

            <div className="nes-rib-main-track">
              {Array.from({ length: 13 }).map((_, idx) => (
                <div key={idx} className="nes-rib-groove" />
              ))}
            </div>

            <div className="nes-rib-bottom-pocket" />
          </div>

          <div className="nes-right-section">
            <div className="nes-sticker-area">
              {!imgLoaded && !imgError && coverSrc && (
                <div className="cartridge-loading-shimmer">
                  <Sparkles size={16} className="shimmer-sparkle" />
                </div>
              )}

              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img nes-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="nes-fallback-label">
                  <div className="nes-fallback-top-header">
                    <span className="nes-fallback-sys-pill">NES</span>
                    <span className="nes-fallback-series">ACTION SERIES</span>
                  </div>
                  <div className="nes-fallback-title-wrap">
                    <span className="nes-fallback-title">{game.title}</span>
                  </div>
                  <div className="nes-fallback-seal">
                    <span className="seal-text">Official</span>
                    <span className="seal-nintendo">Nintendo</span>
                    <span className="seal-text">Seal</span>
                  </div>
                </div>
              )}

              <div className="cartridge-label-sheen" />
            </div>

            <div className="nes-arrow-wrapper">
              <div className="nes-molded-arrow" />
            </div>
          </div>
        </div>

        <div className="nes-bottom-connector-steps">
          <div className="nes-notch-corner left" />
          <div className="nes-connector-center" />
          <div className="nes-notch-corner right" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SNES (Super Nintendo) Cartridge Specialized Layout
  // =========================================================================
  if (isSnes) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-snes ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge snes-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="snes-cart-body">
          <div className="snes-side-wing left">
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-screw-hole" />
          </div>

          <div className="snes-center-section">
            <div className="snes-sticker-area">
              {!imgLoaded && !imgError && coverSrc && (
                <div className="cartridge-loading-shimmer">
                  <Sparkles size={16} className="shimmer-sparkle" />
                </div>
              )}

              <div className="snes-label-left-col">
                <span className="snes-license-text">LICENSED BY</span>
                <span className="snes-nintendo-text">Nintendo</span>
                <div className="snes-seal-dot">★</div>
              </div>

              <div className="snes-art-frame">
                {coverSrc && !imgError ? (
                  <img
                    src={coverSrc}
                    alt={game.title}
                    className={`tile-img snes-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => {
                      setImgError(true);
                      setImgLoaded(false);
                    }}
                  />
                ) : (
                  <div className="snes-fallback-art">
                    <span className="snes-fallback-title">{game.title}</span>
                  </div>
                )}
              </div>

              <div className="snes-label-right-col">
                <span className="snes-red-banner">SUPER NINTENDO</span>
                <span className="snes-sub-banner">ENTERTAINMENT SYSTEM</span>
              </div>

              <div className="cartridge-label-sheen" />
            </div>

            <div className="snes-lower-grip-pocket">
              <div className="snes-pocket-left-cut" />
              <div className="snes-pocket-center-ramp" />
              <div className="snes-pocket-right-cut" />
            </div>
          </div>

          <div className="snes-side-wing right">
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-wing-rib" />
            <div className="snes-screw-hole" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. Nintendo 64 (N64) Cartridge Specialized Layout
  // =========================================================================
  if (isN64) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-n64 ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
        style={{ '--cart-color': cartColor }}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge n64-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="n64-top-crest-bevel">
          <div className="n64-crest-arch-line" />
        </div>

        <div className="n64-main-body">
          <div className="n64-grip-wing left">
            <div className="n64-wing-seam" />
            <div className="n64-wing-step-notch" />
          </div>

          <div className="n64-center-well">
            <div className="n64-sticker-area">
              {!imgLoaded && !imgError && coverSrc && (
                <div className="cartridge-loading-shimmer">
                  <Sparkles size={16} className="shimmer-sparkle" />
                </div>
              )}

              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img n64-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="n64-fallback-label">
                  <div className="n64-fallback-title-wrap">
                    <span className="n64-fallback-title">{game.title}</span>
                  </div>
                </div>
              )}

              <div className="n64-label-footer-strip">
                <div className="n64-seal-gold-badge">
                  <span className="seal-text">Official</span>
                  <span className="seal-text">Nintendo</span>
                  <span className="seal-sub">Seal</span>
                </div>

                <div className="n64-center-brand-meta">
                  <div className="n64-nintendo-oval">
                    <span className="n64-nintendo-text">Nintendo</span>
                  </div>
                  <span className="n64-model-code">
                    NUS-{game.id?.substring(0, 4)?.toUpperCase() || '006'}-USA
                  </span>
                </div>

                <div className="n64-3d-logo-card">
                  <div className="n64-cube-icon">N</div>
                  <span className="n64-64-sub">64</span>
                </div>
              </div>

              <div className="cartridge-label-sheen" />
            </div>
          </div>

          <div className="n64-grip-wing right">
            <div className="n64-wing-seam" />
            <div className="n64-wing-step-notch" />
          </div>
        </div>

        <div className="n64-bottom-chin" />
      </div>
    );
  }

  // =========================================================================
  // 4. PlayStation 1 (PS1) CD Jewel Case Layout
  // =========================================================================
  if (isPsx) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-psx ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge psx-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="psx-jewel-case-frame">
          <div className="psx-hinge-slot top" />
          <div className="psx-hinge-slot bottom" />

          <div className="psx-booklet-insert">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            {/* Iconic Left Vertical PlayStation Spine */}
            <div className="psx-vertical-spine">
              <div className="psx-spine-logo-box">
                <div className="psx-color-logo">
                  <span className="psx-p-red">P</span>
                  <span className="psx-s-cyan">S</span>
                </div>
                <span className="psx-region-tag">NTSC U/C</span>
              </div>

              <span className="psx-spine-wordmark">PlayStation</span>

              <div className="psx-spine-footer">
                <span className="psx-esrb-mini">E</span>
                <span className="psx-slus-code">SLUS-{game.id?.substring(0, 4) || '01395'}</span>
              </div>
            </div>

            {/* Main Cover Artwork Frame */}
            <div className="psx-art-frame">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img psx-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="psx-fallback-art">
                  <span className="psx-fallback-title">{game.title}</span>
                </div>
              )}
            </div>

            <div className="psx-jewel-glass-glare" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. GBA (Game Boy Advance) Cartridge Specialized Layout
  // =========================================================================
  if (isGba) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-gba ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
        style={{ '--cart-color': cartColor }}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge gba-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="gba-top-shoulder">
          <div className="gba-shoulder-ear left" />
          <div className="gba-thumb-ridge">
            <span className="gba-embossed-brand">GAME BOY ADVANCE</span>
          </div>
          <div className="gba-shoulder-ear right" />
        </div>

        <div className="gba-cart-body">
          <div className="gba-sticker-area">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            {coverSrc && !imgError ? (
              <img
                src={coverSrc}
                alt={game.title}
                className={`tile-img gba-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgError(true);
                  setImgLoaded(false);
                }}
              />
            ) : (
              <div className="gba-fallback-label">
                <div className="gba-fallback-header">
                  <span className="gba-fallback-pill">GBA</span>
                  <span className="gba-fallback-code">AGB-USA</span>
                </div>
                <div className="gba-fallback-title-wrap">
                  <span className="gba-fallback-title">{game.title}</span>
                </div>
                <div className="gba-fallback-footer">
                  <span className="gba-fallback-seal">Official Nintendo Seal</span>
                </div>
              </div>
            )}

            <div className="cartridge-label-sheen" />
          </div>
        </div>

        <div className="gba-bottom-edge" />
      </div>
    );
  }

  // =========================================================================
  // 6. NDS (Nintendo DS) Cartridge Specialized Layout
  // =========================================================================
  if (isNds) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-nds ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge nds-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="nds-top-edge" />

        <div className="nds-cart-body">
          <div className="nds-side-notch left" />

          <div className="nds-sticker-area">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            <div className="nds-label-top-banner">
              <span className="nds-brand-title">NINTENDO</span>
              <span className="nds-dual-screen-icon">DS</span>
              <span className="nds-tm">™</span>
            </div>

            <div className="nds-label-art-frame">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img nds-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="nds-fallback-art">
                  <span className="nds-fallback-title">{game.title}</span>
                </div>
              )}
            </div>

            <div className="nds-label-footer">
              <span className="nds-ntr-code">NTR-{game.id?.substring(0, 4)?.toUpperCase() || 'AMCE'}-USA</span>
            </div>

            <div className="cartridge-label-sheen" />
          </div>

          <div className="nds-side-notch right" />
        </div>

        <div className="nds-bottom-shelf">
          <div className="nds-key-notch-left" />
          <div className="nds-shelf-line" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. Sega Genesis / Mega Drive Cartridge Specialized Layout
  // =========================================================================
  if (isGenesis) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-genesis ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge genesis-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="genesis-top-crest" />

        <div className="genesis-cart-body">
          <div className="genesis-side-pillar left">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="genesis-pillar-groove" />
            ))}
          </div>

          <div className="genesis-sticker-area">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            <div className="genesis-art-container">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img genesis-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="genesis-fallback-label">
                  <div className="genesis-fallback-top-grid">
                    <span className="genesis-grid-text">16-BIT CARTRIDGE</span>
                  </div>
                  <div className="genesis-fallback-title-wrap">
                    <span className="genesis-fallback-title">{game.title}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="genesis-sticker-bottom-banner">
              <div className="sega-genesis-stadium-badge">
                <span className="sega-wordmark">SEGA</span>
                <span className="genesis-wordmark">GENESIS</span>
              </div>
            </div>

            <div className="cartridge-label-sheen" />
          </div>

          <div className="genesis-side-pillar right">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="genesis-pillar-groove" />
            ))}
          </div>
        </div>

        <div className="genesis-bottom-lip" />
      </div>
    );
  }

  // =========================================================================
  // 8. Game Boy (GB) & Game Boy Color (GBC) Cartridge Specialized Layout
  // =========================================================================
  if (isGb) {
    const isColorOnly = game.systemKey === 'gbc';
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-gb ${isColorOnly ? 'cartridge-shell-gbc' : ''} ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
        style={{ '--cart-color': cartColor }}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge gb-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="gb-top-section">
          <div className="gb-shoulder-grips left">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="gb-mini-rib" />
            ))}
          </div>

          <div className="gb-concentric-oval-ring">
            <div className="gb-recessed-pill">
              <span className="gb-brand-prefix">Nintendo </span>
              <span className="gb-brand-bold">{isColorOnly ? 'GAME BOY COLOR' : 'GAME BOY'}</span>
              <span className="gb-tm">™</span>
            </div>
          </div>

          <div className="gb-shoulder-grips right">
            <div className="gb-notch-step" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="gb-mini-rib" />
            ))}
          </div>
        </div>

        <div className="gb-cart-body">
          <div className="gb-sticker-area">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            <div className="gb-sticker-spine left">
              <span className="gb-spine-dmg-code">
                DMG-{game.id?.substring(0, 4)?.toUpperCase() || 'APCE'}-USA
              </span>
            </div>

            <div className="gb-art-frame">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img gb-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="gb-fallback-label">
                  <div className="gb-fallback-header">
                    <span className="gb-fallback-pill">{isColorOnly ? 'GBC' : 'GB'}</span>
                  </div>
                  <div className="gb-fallback-title-wrap">
                    <span className="gb-fallback-title">{game.title}</span>
                  </div>
                  <div className="gb-fallback-footer">
                    <span className="gb-fallback-seal">Official Nintendo Seal</span>
                  </div>
                </div>
              )}
            </div>

            <div className="gb-sticker-spine right">
              <span className="gb-spine-side-out">THIS SIDE OUT</span>
            </div>

            <div className="cartridge-label-sheen" />
          </div>

          <div className="gb-arrow-wrapper">
            <div className="gb-molded-arrow" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9. Sega Game Gear Cartridge Specialized Layout
  // =========================================================================
  if (isGameGear) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-gamegear ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge gg-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="gg-top-section">
          <div className="gg-side-rail left" />

          <div className="gg-top-center-crest">
            <div className="gg-grip-dots-row">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="gg-grip-dot" />
              ))}
            </div>
            <div className="gg-horizontal-grooves">
              <div className="gg-groove-line" />
              <div className="gg-groove-line" />
            </div>
          </div>

          <div className="gg-side-rail right" />
        </div>

        <div className="gg-cart-body">
          <div className="gg-sticker-area">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            <div className="gg-vertical-spine">
              <span className="gg-spine-text">GAME GEAR</span>
              <span className="gg-spine-tm">TM</span>
            </div>

            <div className="gg-art-frame">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img gg-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="gg-fallback-art">
                  <span className="gg-fallback-title">{game.title}</span>
                  <span className="gg-fallback-code">670-6940</span>
                </div>
              )}
            </div>

            <div className="cartridge-label-sheen" />
          </div>

          <div className="gg-lower-chin">
            <div className="gg-sega-embossed-pill">
              <span className="gg-sega-embossed-text">SEGA</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 10. Atari 2600 Cartridge Specialized Layout
  // =========================================================================
  if (isAtari) {
    return (
      <div
        className={`game-tile cartridge-shell cartridge-shell-atari ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
        onClick={onClick}
        title={game.title}
      >
        {isFavorite && (
          <div className="cartridge-favorite-badge atari-fav-badge" title="Favorite Game">
            <Star size={13} fill="#fbbf24" color="#d97706" />
          </div>
        )}

        <div className="atari-outer-frame">
          <div className="atari-side-spine-slot">
            <span className="atari-spine-title">{game.title}</span>
          </div>

          <div className="atari-sticker-area">
            {!imgLoaded && !imgError && coverSrc && (
              <div className="cartridge-loading-shimmer">
                <Sparkles size={16} className="shimmer-sparkle" />
              </div>
            )}

            <div className="atari-label-header">
              <span className="atari-game-program-text">game program™</span>
              <span className="atari-label-title">{game.title}</span>
              <span className="atari-controller-text">Use with Joystick Controllers</span>
            </div>

            <div className="atari-art-frame">
              {coverSrc && !imgError ? (
                <img
                  src={coverSrc}
                  alt={game.title}
                  className={`tile-img atari-label-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(false);
                  }}
                />
              ) : (
                <div className="atari-fallback-art">
                  <span className="atari-fallback-fuji">▲</span>
                </div>
              )}
            </div>

            <div className="atari-label-footer">
              <div className="atari-fuji-brand">
                <span className="atari-fuji-icon">▲</span>
                <span className="atari-wordmark">ATARI</span>
              </div>
              <span className="atari-cx-code">CX{game.id?.replace(/[^0-9]/g, '')?.substring(0, 4) || '2600'}</span>
            </div>

            <div className="cartridge-label-sheen" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 11. Clean Box Art Poster Fallback for Unspecified Platforms
  // =========================================================================
  return (
    <div
      className={`game-tile cover-poster-tile ${isFocused ? 'gamepad-focused' : ''} ${isFavorite ? 'is-favorite' : ''}`}
      onClick={onClick}
      title={game.title}
    >
      <div
        className="cover-platform-pill"
        style={{
          backgroundColor: game.systemColor || '#3b82f6'
        }}
      >
        {game.systemName || game.systemKey?.toUpperCase() || 'RETRO'}
      </div>

      {isFavorite && (
        <div className="cartridge-favorite-badge cover-fav-badge" title="Favorite Game">
          <Star size={13} fill="#fbbf24" color="#d97706" />
        </div>
      )}

      <div className="cover-poster-frame">
        {!imgLoaded && !imgError && coverSrc && (
          <div className="cartridge-loading-shimmer">
            <Sparkles size={16} className="shimmer-sparkle" />
          </div>
        )}

        {coverSrc && !imgError ? (
          <img
            src={coverSrc}
            alt={game.title}
            className={`tile-img cover-poster-img ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(false);
            }}
          />
        ) : (
          <div
            className="cover-fallback-poster"
            style={{
              background: `linear-gradient(145deg, ${game.systemColor || '#3b82f6'}33 0%, rgba(15, 23, 42, 0.95) 100%)`
            }}
          >
            {game.systemIcon && (
              <img src={resolveAssetPath(game.systemIcon)} alt="" className="cover-fallback-icon" />
            )}
            <span className="cover-fallback-title">{game.title}</span>
            <span className="cover-fallback-system">{game.systemName}</span>
          </div>
        )}

        <div className="cartridge-label-sheen" />
      </div>
    </div>
  );
}

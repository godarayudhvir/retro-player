import React, { useEffect, useRef } from 'react';
import { Star, Clock, Layers } from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Horizontal System Selection Ribbon with icon-first representation, dynamic label reveal on hover/active,
 * smart collections, and zero-swipe full visibility.
 */
export default function SystemRibbon({
  systems,
  activeSystem,
  setActiveSystem,
  totalGamesCount,
  favoritesCount = 0,
  recentCount = 0,
  focusedTarget,
  setFocusedTarget,
  gamepadConnected = false,
  sfx
}) {
  const ribbonRef = useRef(null);

  // Auto-scroll active tab into center view
  useEffect(() => {
    const activeTab = ribbonRef.current?.querySelector('.system-tab.active');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSystem]);

  const activeSysList = systems
    .filter((sys) => sys.gameCount > 0)
    .sort((a, b) => b.gameCount - a.gameCount);

  // Unified list of all selectable tabs
  const allTabs = [
    { key: 'all', name: 'All Games', count: totalGamesCount, iconNode: <Layers size={18} />, isSpecialIcon: true },
    { key: 'favorites', name: 'Favorites', count: favoritesCount, iconNode: <Star size={18} fill="currentColor" />, isSpecialIcon: true },
    { key: 'recent', name: 'Recent', iconNode: <Clock size={18} />, isSpecialIcon: true },
    ...activeSysList.map(s => ({ key: s.key, name: s.name, count: s.gameCount, icon: s.icon, isSpecialIcon: false }))
  ];

  return (
    <div className="system-ribbon-wrapper">
      {gamepadConnected && (
        <div className="ribbon-bumper-badge badge-left" title="Previous System (L1 / Left Bumper)">
          <span className="osk-btn-badge badge-bumper">L</span>
        </div>
      )}

      <nav className="system-ribbon" ref={ribbonRef}>
        {allTabs.map((tab, idx) => (
          <button
            key={tab.key}
            className={`system-tab ${activeSystem === tab.key ? 'active' : ''} ${focusedTarget.zone === 'ribbon' && focusedTarget.index === idx ? 'gamepad-focused' : ''}`}
            onClick={() => {
              setActiveSystem(tab.key);
              setFocusedTarget({ zone: 'ribbon', index: idx });
              sfx?.playTabSwitch?.();
            }}
            title={tab.count > 0 ? `${tab.name} (${tab.count})` : tab.name}
            aria-label={tab.name}
          >
            <div className="tab-icon-wrapper">
              {tab.isSpecialIcon ? (
                tab.iconNode
              ) : (
                tab.icon && <img src={resolveAssetPath(tab.icon)} alt="" className="tab-icon" />
              )}
            </div>
            <span className="tab-label">
              {tab.name}
              {tab.count > 0 && (
                <span className="tab-count-badge">{tab.count}</span>
              )}
            </span>
          </button>
        ))}
      </nav>

      {gamepadConnected && (
        <div className="ribbon-bumper-badge badge-right" title="Next System (R1 / Right Bumper)">
          <span className="osk-btn-badge badge-bumper">R</span>
        </div>
      )}
    </div>
  );
}


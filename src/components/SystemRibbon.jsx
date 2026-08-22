import React, { useEffect, useRef } from 'react';
import { Star, Clock } from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';

/**
 * Horizontal System Selection Ribbon with dynamic game count sorting, smart collections, and smooth auto-scrolling.
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
    { key: 'all', name: 'All Games', count: totalGamesCount, icon: null, isSpecialIcon: false },
    { key: 'favorites', name: 'Favorites', count: favoritesCount, iconNode: <Star size={18} fill="currentColor" />, isSpecialIcon: true },
    { key: 'recent', name: 'Recent', count: recentCount, iconNode: <Clock size={18} />, isSpecialIcon: true },
    ...activeSysList.map(s => ({ key: s.key, name: s.name, count: s.gameCount, icon: s.icon, isSpecialIcon: false }))
  ];

  return (
    <nav className="system-ribbon" ref={ribbonRef}>
      {allTabs.map((tab, idx) => (
        <button
          key={tab.key}
          className={`system-tab ${activeSystem === tab.key ? 'active' : ''} ${focusedTarget.zone === 'ribbon' && focusedTarget.index === idx ? 'gamepad-focused' : ''} ${tab.key === 'favorites' ? 'tab-favorites tab-icon-only' : ''} ${tab.key === 'recent' ? 'tab-recent tab-icon-only' : ''}`}
          onClick={() => {
            setActiveSystem(tab.key);
            setFocusedTarget({ zone: 'ribbon', index: idx });
            sfx?.playTabSwitch?.();
          }}
          title={tab.name}
          aria-label={tab.name}
        >
          {tab.isSpecialIcon ? (
            tab.iconNode
          ) : (
            <>
              {tab.icon && <img src={resolveAssetPath(tab.icon)} alt="" className="tab-icon" />}
              <span>{tab.name}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}


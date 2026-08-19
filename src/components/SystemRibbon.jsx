import React, { useEffect, useRef } from 'react';

/**
 * Horizontal System Selection Ribbon with dynamic game count sorting and smooth auto-scrolling.
 */
export default function SystemRibbon({
  systems,
  activeSystem,
  setActiveSystem,
  totalGamesCount,
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

  return (
    <nav className="system-ribbon" ref={ribbonRef}>
      <button
        className={`system-tab ${activeSystem === 'all' ? 'active' : ''} ${focusedTarget.zone === 'ribbon' && focusedTarget.index === 0 ? 'gamepad-focused' : ''}`}
        onClick={() => {
          setActiveSystem('all');
          setFocusedTarget({ zone: 'ribbon', index: 0 });
          sfx?.playTabSwitch?.();
        }}
      >
        <span>All Games</span>
        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({totalGamesCount})</span>
      </button>

      {activeSysList.map((sys, idx) => (
        <button
          key={sys.key}
          className={`system-tab ${activeSystem === sys.key ? 'active' : ''} ${focusedTarget.zone === 'ribbon' && focusedTarget.index === idx + 1 ? 'gamepad-focused' : ''}`}
          onClick={() => {
            setActiveSystem(sys.key);
            setFocusedTarget({ zone: 'ribbon', index: idx + 1 });
            sfx?.playTabSwitch?.();
          }}
        >
          {sys.icon && <img src={sys.icon} alt="" className="tab-icon" />}
          <span>{sys.name}</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({sys.gameCount})</span>
        </button>
      ))}
    </nav>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  FileText, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Users, 
  Save, 
  Clock, 
  Sliders, 
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import ConfirmModal from './ConfirmModal.jsx';
import { resetEntireApp, resetUserDataPreserveRoms } from '../utils/appReset.js';
import { exportFullDatabase, importFullDatabase, checkServerDbStatus } from '../services/db.js';
import { haptics } from '../services/hapticsService.js';

/**
 * BackupModal: Centralized Filesystem Database & Storage Management Studio.
 * Allows 1-click JSON snapshot export, drag-and-drop restore, soft data reset, and full factory reset.
 * Styled with authentic DS Touch theme aesthetics and full keyboard/gamepad accessibility.
 */
export default function BackupModal({
  isOpen,
  onClose,
  sfx,
  focusedTarget,
  setFocusedTarget,
  onDataRestored,
  achievementsEngine
}) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSoftResetConfirm, setShowSoftResetConfirm] = useState(false);
  const [showHardResetConfirm, setShowHardResetConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [focusedSection, setFocusedSection] = useState(0); // 0: Export, 1: Import, 2: Soft Reset, 3: Hard Reset
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const isServerAvailable = checkServerDbStatus();

  // Load database statistics on open
  useEffect(() => {
    if (!isOpen) {
      setImportPreview(null);
      setStatusMessage(null);
      setErrorMessage(null);
      setShowSoftResetConfirm(false);
      setShowHardResetConfirm(false);
      return;
    }

    async function loadStats() {
      setIsLoading(true);
      try {
        const fullData = await exportFullDatabase();
        if (fullData && fullData.stats) {
          setStats(fullData.stats);
        }
      } catch (err) {
        console.warn('Failed to load initial DB stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [isOpen]);

  // Keyboard navigation across 2x2 grid
  useEffect(() => {
    if (!isOpen || showSoftResetConfirm || showHardResetConfirm) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sfx?.playModalClose?.();
        onClose();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedSection(prev => (prev % 2 === 0 ? prev + 1 : prev));
        sfx?.playTileNav?.();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedSection(prev => (prev % 2 === 1 ? prev - 1 : prev));
        sfx?.playTileNav?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedSection(prev => (prev < 2 ? prev + 2 : prev));
        sfx?.playTileNav?.();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedSection(prev => (prev >= 2 ? prev - 2 : prev));
        sfx?.playTileNav?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedSection === 0) handleExportBackup();
        else if (focusedSection === 1) {
            if (importPreview) handleExecuteImport();
            else fileInputRef.current?.click();
        }
        else if (focusedSection === 2) {
            setShowSoftResetConfirm(true);
            sfx?.playModalOpen?.();
        }
        else if (focusedSection === 3) {
            setShowHardResetConfirm(true);
            sfx?.playModalOpen?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSoftResetConfirm, showHardResetConfirm, focusedSection, importPreview, onClose, sfx]);

  // Handle Export Backup
  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      setStatusMessage(null);
      setErrorMessage(null);
      sfx?.playThemeSwitch?.();
      haptics.selection();

      const dbData = await exportFullDatabase();
      const jsonString = JSON.stringify(dbData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `retroplayer-backup-${timestamp}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage(`Backup exported successfully as "${fileName}".`);
      setIsExporting(false);

      if (achievementsEngine?.triggerDatabaseBackup) {
        achievementsEngine.triggerDatabaseBackup();
      } else if (achievementsEngine?.triggerBackupExported) {
        achievementsEngine.triggerBackupExported();
      }
    } catch (err) {
      setErrorMessage(`Export failed: ${err.message}`);
      setIsExporting(false);
    }
  };

  // Handle File Input Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const rawContent = evt.target.result;
        const parsed = JSON.parse(rawContent);

        // Basic validation logic for file
        const profilesCount = Array.isArray(parsed.profiles) ? parsed.profiles.length : 0;
        const savesCount = Object.keys(parsed.game_saves || {}).length;
        const statesCount = Object.keys(parsed.save_states || {}).length;
        const userDataCount = Object.keys(parsed.user_data || {}).length;

        setImportPreview({
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          profilesCount,
          savesCount,
          statesCount,
          userDataCount,
          parsedData: parsed
        });

        sfx?.playTileNav?.();
        haptics.selection();
      } catch (err) {
        setErrorMessage(`Invalid backup file: ${err.message}`);
        setImportPreview(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute Restore
  const handleExecuteImport = async () => {
    if (!importPreview?.parsedData) return;

    try {
      setIsImporting(true);
      setStatusMessage(null);
      setErrorMessage(null);
      sfx?.playThemeSwitch?.();
      haptics.medium();

      const result = await importFullDatabase(importPreview.parsedData);
      
      const refreshedData = await exportFullDatabase();
      if (refreshedData?.stats) {
        setStats(refreshedData.stats);
      }

      setStatusMessage(`Restored successfully.`);
      setImportPreview(null);
      setIsImporting(false);

      if (onDataRestored) {
        onDataRestored();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMessage(`Restore failed: ${err.message}`);
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="info-modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="scraper-modal-container animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        style={{ maxWidth: '820px' }}
      >
        <header className="scraper-modal-header">
          <div className="scraper-modal-title-group">
            <div className="scraper-icon-bubble" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Database size={22} color="#3b82f6" />
            </div>
            <div>
              <h2>Data &amp; Storage Management</h2>
              <p>Export data snapshots, restore backups, and manage browser storage</p>
            </div>
          </div>
          <button
            type="button"
            className={`scraper-modal-close-btn ${focusedTarget?.zone === 'backupModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={() => {
              sfx?.playModalClose?.();
              onClose?.();
            }}
            title="Close (Esc)"
            aria-label="Close Data & Storage Management"
          >
            <X size={18} />
          </button>
        </header>

        <div className="backup-modal-body" style={{ overflowY: 'auto' }}>
          {stats && (
            <div className="backup-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
              <div className="backup-metric-card">
                <Users size={14} style={{ color: '#3b82f6' }} />
                <span className="metric-count">{stats.profilesCount || 0}</span>
                <span className="metric-label">Profiles</span>
              </div>
              <div className="backup-metric-card">
                <Save size={14} style={{ color: '#10b981' }} />
                <span className="metric-count">{stats.savesCount || 0}</span>
                <span className="metric-label">Battery Saves</span>
              </div>
              <div className="backup-metric-card">
                <Clock size={14} style={{ color: '#f59e0b' }} />
                <span className="metric-count">{stats.statesCount || 0}</span>
                <span className="metric-label">Save States</span>
              </div>
              <div className="backup-metric-card">
                <Sliders size={14} style={{ color: '#8b5cf6' }} />
                <span className="metric-count">{stats.userDataCount || 0}</span>
                <span className="metric-label">User History</span>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="backup-alert is-success">
              <CheckCircle2 size={16} />
              <span>{statusMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="backup-alert is-danger">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="backup-actions-container">
            
            {/* Action 1: Export Full Database */}
            <div className={`backup-action-card ${focusedSection === 0 ? 'is-focused' : ''}`}>
              <div className="backup-card-info">
                <div className="backup-card-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.25)' }}>
                  <Download size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                    Export Database Snapshot
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                    Download a full JSON backup containing saves, states, profiles, and favorites.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="backup-action-btn is-export"
                onClick={handleExportBackup}
                disabled={isExporting}
              >
                {isExporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                <span>{isExporting ? 'Exporting...' : 'Download Backup (.json)'}</span>
              </button>
            </div>

            {/* Action 2: Import / Restore Database */}
            <div className={`backup-action-card ${focusedSection === 1 ? 'is-focused' : ''}`}>
              <div className="backup-card-info">
                <div className="backup-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
                  <Upload size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                    Restore from JSON Backup
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                    Upload a previously exported backup file to restore or migrate data.
                  </span>
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".json,application/json" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />

              {!importPreview ? (
                <button
                  type="button"
                  className="backup-action-btn is-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText size={15} />
                  <span>Select Backup File...</span>
                </button>
              ) : (
                <div className="backup-import-preview-box">
                  <div className="preview-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                      <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {importPreview.fileName}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', flexShrink: 0 }}>({importPreview.fileSize})</span>
                    </div>
                    <button 
                      type="button" 
                      className="preview-clear-btn" 
                      onClick={() => setImportPreview(null)}
                      aria-label="Clear selection"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', padding: '2px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="preview-stats-row" style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginBottom: '6px' }}>
                    <span>{importPreview.profilesCount} Profiles</span> • <span>{importPreview.savesCount} Saves</span> • <span>{importPreview.statesCount} States</span>
                  </div>

                  <button
                    type="button"
                    className="backup-action-btn is-success"
                    onClick={handleExecuteImport}
                    disabled={isImporting}
                  >
                    {isImporting ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
                    <span>{isImporting ? 'Restoring...' : 'Confirm Restore'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action 3: Reset Browser Data & Saves (Preserves ROMs) */}
            <div className={`backup-action-card is-warning-card ${focusedSection === 2 ? 'is-focused' : ''}`}>
              <div className="backup-card-info">
                <div className="backup-card-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
                  <RotateCcw size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      Reset Data &amp; Saves
                    </strong>
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      background: '#f59e0b',
                      color: '#fff',
                      fontWeight: 800
                    }}>
                      PRESERVES ROMS
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                    Clears in-game saves, profiles, settings, and browser caches back to defaults, while keeping all imported ROMs in your library.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="backup-action-btn is-warning"
                onClick={() => {
                  setShowSoftResetConfirm(true);
                  sfx?.playModalOpen?.();
                  haptics.medium();
                }}
              >
                <RotateCcw size={15} />
                <span>Reset Data (Keep ROMs)...</span>
              </button>
            </div>

            {/* Action 4: Full Factory Reset (Wipes Everything) */}
            <div className={`backup-action-card is-danger-card ${focusedSection === 3 ? 'is-focused' : ''}`}>
              <div className="backup-card-info">
                <div className="backup-card-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <Trash2 size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      Full Factory Reset
                    </strong>
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      background: '#ef4444',
                      color: '#fff',
                      fontWeight: 800
                    }}>
                      WIPES EVERYTHING
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                    Completely wipes all browser storage, imported ROMs, battery saves, offline caches, and settings for a 100% fresh start.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="backup-action-btn is-danger"
                onClick={() => {
                  setShowHardResetConfirm(true);
                  sfx?.playModalOpen?.();
                  haptics.medium();
                }}
              >
                <Trash2 size={15} />
                <span>Factory Reset &amp; Wipe All...</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Soft Reset Confirmation Modal (Keeps ROMs) */}
      <ConfirmModal
        isOpen={showSoftResetConfirm}
        title="Reset Browser Data & Saves?"
        message="This will reset all player profiles, battery saves, save states, settings, and browser caches back to defaults. All your imported ROMs in the library will be safely preserved."
        confirmLabel="Reset Data & Reload"
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={async () => {
          sfx?.playDelete?.();
          setStatusMessage('Resetting player data and caches...');
          await resetUserDataPreserveRoms();
        }}
        onCancel={() => {
          setShowSoftResetConfirm(false);
          sfx?.playModalClose?.();
        }}
        sfx={sfx}
      />

      {/* Hard Factory Reset Confirmation Modal (Wipes Everything) */}
      <ConfirmModal
        isOpen={showHardResetConfirm}
        title="Full Factory Reset & Storage Wipe?"
        message="This will completely erase all player profiles, battery saves, save states, offline caches, and browser-imported ROMs from local storage. Server ROM files on disk will not be deleted."
        confirmLabel="Wipe Everything & Reload"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          sfx?.playDelete?.();
          setStatusMessage('Performing factory reset & clearing all storage...');
          await resetEntireApp();
        }}
        onCancel={() => {
          setShowHardResetConfirm(false);
          sfx?.playModalClose?.();
        }}
        sfx={sfx}
      />
    </div>
  );
}

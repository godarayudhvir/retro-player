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
  AlertTriangle
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { resetEntireApp } from '../utils/appReset';
import { exportFullDatabase, importFullDatabase, checkServerDbStatus } from '../services/db';

/**
 * BackupModal: Centralized Filesystem Database & Storage Management Studio.
 * Allows 1-click JSON snapshot export, drag-and-drop restore, and factory reset.
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [focusedSection, setFocusedSection] = useState(0); // 0: Export, 1: Import, 2: Reset
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const isServerAvailable = checkServerDbStatus();

  // Load database statistics on open
  useEffect(() => {
    if (!isOpen) {
      setImportPreview(null);
      setStatusMessage(null);
      setErrorMessage(null);
      setShowResetConfirm(false);
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || showResetConfirm) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sfx?.playModalClose?.();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedSection(prev => (prev + 1) % 3);
        sfx?.playTileNav?.();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedSection(prev => (prev - 1 + 3) % 3);
        sfx?.playTileNav?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedSection === 0) {
          handleExportBackup();
        } else if (focusedSection === 1) {
          if (importPreview) {
            handleExecuteImport();
          } else {
            fileInputRef.current?.click();
          }
        } else if (focusedSection === 2) {
          setShowResetConfirm(true);
          sfx?.playModalOpen?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showResetConfirm, focusedSection, importPreview, sfx, onClose]);

  // Trigger export download
  const handleExportBackup = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      sfx?.playTabSwitch?.();
      const exportData = await exportFullDatabase();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const filename = `retroplayer-backup-${dateStr}-${timeStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage(`Database successfully exported as "${filename}"`);
      achievementsEngine?.triggerDatabaseBackup?.();
      sfx?.playThemeSwitch?.();
    } catch (err) {
      console.error('Export error:', err);
      setErrorMessage(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection / drop
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processBackupFile(file);
  };

  const processBackupFile = (file) => {
    setErrorMessage(null);
    setStatusMessage(null);
    if (!file.name.endsWith('.json')) {
      setErrorMessage('Please select a valid .json backup file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const database = parsed.database || parsed;

        if (!database || typeof database !== 'object') {
          throw new Error('Unrecognized backup format');
        }

        const preview = {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          exportedAt: parsed.exportedAt || 'Unknown date',
          profilesCount: Array.isArray(database.profiles) ? database.profiles.length : Object.keys(database.profiles || {}).length,
          userDataCount: Object.keys(database.user_data || {}).length,
          savesCount: Object.keys(database.game_saves || {}).length,
          statesCount: Object.keys(database.save_states || {}).length,
          payload: parsed
        };

        setImportPreview(preview);
        sfx?.playTileNav?.();
      } catch (err) {
        console.error('Failed to parse backup JSON:', err);
        setErrorMessage('Failed to read backup file. Invalid JSON structure.');
      }
    };
    reader.onerror = () => setErrorMessage('Error reading selected file');
    reader.readAsText(file);
  };

  // Execute restore
  const handleExecuteImport = async () => {
    if (!importPreview?.payload) return;
    setIsImporting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      sfx?.playTabSwitch?.();
      const res = await importFullDatabase(importPreview.payload);
      if (res && res.success) {
        setStatusMessage('Database restored successfully! Reloading...');
        sfx?.playThemeSwitch?.();
        setTimeout(() => {
          if (onDataRestored) {
            onDataRestored();
          } else {
            window.location.reload();
          }
        }, 800);
      } else {
        throw new Error(res?.message || 'Restore failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setErrorMessage(`Restore failed: ${err.message}`);
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="theme-modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="backup-modal-content animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* Modal Header */}
        <div className="backup-modal-header">
          <div className="backup-modal-title">
            <Database size={20} className="backup-header-icon" />
            <div>
              <h2>Storage &amp; Database Management</h2>
              <p>Export full game saves &amp; stats, restore backups, or factory reset storage</p>
            </div>
          </div>

          <button 
            type="button" 
            className="info-close-btn" 
            onClick={() => { onClose(); sfx?.playModalClose?.(); }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="backup-modal-body">
          {/* Database Overview Metric Chips */}
          {stats && (
            <div className="backup-metrics-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '0.5rem'
            }}>
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

          {/* Status Alerts */}
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

          {/* Modal Actions Body */}
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                    Download a full backup JSON file containing all profiles, playtime, favorites, and game saves.
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
                <div className="backup-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Upload size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                    Restore from JSON Backup
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                    Load a previously exported backup file to restore or migrate data across devices.
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
                  <div className="preview-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{importPreview.fileName}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>({importPreview.fileSize})</span>
                    </div>
                    <button 
                      type="button" 
                      className="preview-clear-btn" 
                      onClick={() => setImportPreview(null)}
                      aria-label="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="preview-stats-row">
                    <span>{importPreview.profilesCount} Profiles</span> • 
                    <span>{importPreview.savesCount} Battery Saves</span> • 
                    <span>{importPreview.statesCount} Save States</span>
                  </div>

                  <div className="preview-actions-row">
                    <button
                      type="button"
                      className="backup-action-btn is-success"
                      onClick={handleExecuteImport}
                      disabled={isImporting}
                    >
                      {isImporting ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
                      <span>{isImporting ? 'Restoring Database...' : 'Confirm & Restore Backup'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action 3: Factory Reset & Wipe Storage (Danger Zone) */}
            <div className={`backup-action-card is-danger-card ${focusedSection === 2 ? 'is-focused' : ''}`}>
              <div className="backup-card-info">
                <div className="backup-card-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <RotateCcw size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      Factory Reset &amp; Clear Storage
                    </strong>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      background: '#ef4444',
                      color: '#fff',
                      fontWeight: 800
                    }}>
                      DANGER ZONE
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                    Reset all profiles, battery saves, save states, and browser caches back to defaults. ROMs and covers on disk will not be deleted.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="backup-action-btn is-danger"
                onClick={() => {
                  setShowResetConfirm(true);
                  sfx?.playModalOpen?.();
                }}
              >
                <RotateCcw size={15} />
                <span>Factory Reset &amp; Clear Storage...</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Factory Reset Nested Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Factory Reset & Clear Storage?"
        message="This will reset all player profiles, battery saves, save states, and browser caches back to defaults. Your ROM files and cover artwork on disk will not be deleted."
        confirmLabel="Reset & Reload"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          setShowResetConfirm(false);
          sfx?.playDelete?.();
          await resetEntireApp();
        }}
        onCancel={() => {
          setShowResetConfirm(false);
          sfx?.playModalClose?.();
        }}
        sfx={sfx}
      />
    </div>
  );
}

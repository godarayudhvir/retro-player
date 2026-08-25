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
  ArrowRight
} from 'lucide-react';
import { exportFullDatabase, importFullDatabase, checkServerDbStatus } from '../services/db';

/**
 * BackupModal: Centralized Filesystem Database Backup & Restore Studio.
 * Allows 1-click JSON database snapshot export and drag-and-drop import.
 * Styled with authentic DS Touch theme aesthetics and full keyboard/gamepad accessibility.
 */
export default function BackupModal({
  isOpen,
  onClose,
  sfx,
  focusedTarget,
  setFocusedTarget,
  onDataRestored
}) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [focusedSection, setFocusedSection] = useState(0); // 0: Export, 1: Import, 2: Close
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const isServerAvailable = checkServerDbStatus();

  // Load database statistics on open
  useEffect(() => {
    if (!isOpen) {
      setImportPreview(null);
      setStatusMessage(null);
      setErrorMessage(null);
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
    if (!isOpen) return;

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
          sfx?.playModalClose?.();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedSection, importPreview, sfx, onClose]);

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
          settingsCount: Object.keys(database.app_settings || {}).length,
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
        className="theme-switcher-modal-content backup-modal-content" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        style={{ maxWidth: '640px' }}
      >
        {/* Mobile Sheet Drag Handle Bar */}
        <div className="theme-sheet-handle-bar"></div>

        {/* Modal Header */}
        <div className="theme-switcher-header">
          <div className="theme-switcher-title">
            <Database size={22} className="theme-header-icon" style={{ color: 'var(--accent-red, #e11d48)' }} />
            <div>
              <h2>Database Backup &amp; Restore</h2>
              <p>Export full game saves, profiles &amp; settings to disk or restore from JSON</p>
            </div>
          </div>

          <button 
            type="button" 
            className="theme-close-btn" 
            onClick={() => { onClose(); sfx?.playModalClose?.(); }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Persistence Status Banner */}
        <div className="backup-persistence-banner" style={{
          margin: '0.75rem 1.25rem 0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: isServerAvailable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
          border: isServerAvailable ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <HardDrive size={20} style={{ color: isServerAvailable ? '#10b981' : '#3b82f6', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {isServerAvailable ? 'Docker / Server Persistence Active' : 'Browser Offline / IndexedDB Storage'}
              </strong>
              <span style={{
                fontSize: '0.68rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                background: isServerAvailable ? '#10b981' : '#3b82f6',
                color: '#fff',
                fontWeight: 700
              }}>
                {isServerAvailable ? 'SERVER DISK' : 'LOCAL CACHE'}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-sub)', margin: '2px 0 0', lineHeight: 1.35 }}>
              {isServerAvailable 
                ? 'All profiles, SRAM saves, and save states automatically sync to data/retroplayer_db.json on the server.'
                : 'Data is safely stored in browser IndexedDB. Export a JSON backup to transfer your saves to another device.'}
            </p>
          </div>
        </div>

        {/* Database Overview Metric Chips */}
        {stats && (
          <div className="backup-metrics-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '0.5rem',
            margin: '0.5rem 1.25rem 1rem'
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
          <div className="backup-alert is-success" style={{ margin: '0 1.25rem 0.75rem' }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="backup-alert is-danger" style={{ margin: '0 1.25rem 0.75rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Actions Body */}
        <div className="backup-actions-container" style={{ padding: '0 1.25rem 1.25rem' }}>
          
          {/* Action 1: Export Full Database */}
          <div className={`backup-action-card ${focusedSection === 0 ? 'is-focused' : ''}`}>
            <div className="backup-card-info">
              <div className="backup-card-icon" style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
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
              className="backup-action-btn is-primary"
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

        </div>

        {/* Modal Footer */}
        <div className="theme-switcher-footer">
          <button 
            type="button" 
            className="theme-footer-btn" 
            onClick={() => { onClose(); sfx?.playModalClose?.(); }}
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

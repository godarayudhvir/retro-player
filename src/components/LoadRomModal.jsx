import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  FolderOpen, 
  Upload, 
  Gamepad2, 
  Sparkles, 
  Play, 
  HardDrive, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FolderTree,
  Zap,
  Check
} from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';
import { detectSystemFromExtension, getSystemInfoByKey } from '../utils/systemDetector';
import { haptics } from '../services/hapticsService';
import { 
  checkServerDbStatus,
  saveLinkedDirectoryHandle,
  getLinkedDirectoryHandles,
  getLinkedDirectoryHandle,
  removeLinkedDirectoryHandle
} from '../services/db';
import { extractRomsFromInput, scanDirectoryHandle } from '../utils/folderScanner';

/**
 * LoadRomModal - Smart In-App Modal Dialog for loading or permanently ingesting custom ROMs and ROM Folders.
 * - Single ROM File: Direct In-Memory Quick Play or Save to Library & Scrape.
 * - Entire ROMs Folder:
 *   1. Desktop: Persistent Zero-Copy Link (0 MB disk duplication) or Save to Library (Permanent).
 *   2. Mobile: Permanent Library Ingestion (Fast or Background Scrape) to guarantee persistence across tab reloads.
 */
export default function LoadRomModal({
  isOpen,
  initialFile = null,
  focusedTarget,
  isMobile = false,
  savedLinkedHandles = [],
  onReconnectLinkedFolders = null,
  onRemoveLinkedFolder = null,
  onClose,
  onQuickPlay,
  onUploadToLibrary,
  onLoadFolderSession,
  onIngestFolderToLibrary,
  sfx
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [isDragInside, setIsDragInside] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderData, setFolderData] = useState(null); // { folderName, files: [], stats, dirHandle }
  const [storageMode, setStorageMode] = useState('session'); // 'session' | 'permanent'
  const [localLinkedHandles, setLocalLinkedHandles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState(null); // { step, current, total, message }
  const [errorMessage, setErrorMessage] = useState(null);
  const [focusedOption, setFocusedOption] = useState(0); 
  const isServerAvailable = checkServerDbStatus();

  const activeHandles = savedLinkedHandles && savedLinkedHandles.length > 0 ? savedLinkedHandles : localLinkedHandles;

  // Check for saved linked directory handles on desktop
  useEffect(() => {
    if (isOpen && !isMobile && typeof window !== 'undefined' && window.showDirectoryPicker) {
      getLinkedDirectoryHandles().then(handles => {
        setLocalLinkedHandles(handles || []);
      }).catch(() => {
        setLocalLinkedHandles([]);
      });
    }
  }, [isOpen, isMobile]);

  // Reset or initialize state when modal opens/closes or initialFile is supplied
  useEffect(() => {
    if (isOpen) {
      if (initialFile) {
        setSelectedFile(initialFile);
        setFolderData(null);
      }
    } else {
      setSelectedFile(null);
      setFolderData(null);
      setStorageMode(isMobile ? 'permanent' : 'session');
      setIsProcessing(false);
      setProgressState(null);
      setErrorMessage(null);
      setFocusedOption(0);
      setIsDragInside(false);
    }
  }, [isOpen, initialFile, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sfx?.playModalClose?.();
        if ((selectedFile || folderData) && !isProcessing) {
          setSelectedFile(null);
          setFolderData(null);
          setErrorMessage(null);
        } else {
          onClose();
        }
        return;
      }

      if (selectedFile && !isProcessing) {
        // Single File Navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedOption(prev => (prev + 1) % 3);
          sfx?.playTileNav?.();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedOption(prev => (prev - 1 + 3) % 3);
          sfx?.playTileNav?.();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedOption === 0) {
            handleAddAndScrape();
          } else if (focusedOption === 1) {
            handleExecuteQuickPlay();
          } else if (focusedOption === 2) {
            setSelectedFile(null);
            setErrorMessage(null);
            sfx?.playTileNav?.();
          }
        }
      } else if (folderData && !isProcessing) {
        // Folder Navigation
        if (e.key === 'Tab') {
          // Tab switches storage mode or button
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setStorageMode('session');
          sfx?.playTileNav?.();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setStorageMode('permanent');
          sfx?.playTileNav?.();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedOption(prev => (prev + 1) % 3);
          sfx?.playTileNav?.();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedOption(prev => (prev - 1 + 3) % 3);
          sfx?.playTileNav?.();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedOption === 0) {
            handleFolderAction(false); // No scrape
          } else if (focusedOption === 1) {
            handleFolderAction(true); // Scrape in background
          } else if (focusedOption === 2) {
            setFolderData(null);
            setErrorMessage(null);
            sfx?.playTileNav?.();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedFile, folderData, storageMode, isProcessing, focusedOption, sfx, onClose]);

  if (!isOpen) return null;

  const handleIncomingFiles = async (input, dirHandle = null) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressState({ step: 'scanning', current: 0, total: 0, message: 'Scanning files & console formats...' });

    // Yield to the event loop so the scanning progress banner immediately renders
    await new Promise(resolve => setTimeout(resolve, 40));

    try {
      const extracted = await extractRomsFromInput(input, (prog) => {
        setProgressState(prev => ({
          ...prev,
          step: 'scanning',
          current: prog.current || 0,
          total: prog.total || 0,
          message: prog.message || prev?.message || 'Scanning files & console formats...'
        }));
      });

      setIsProcessing(false);
      setProgressState(null);

      if (!extracted.files || extracted.files.length === 0) {
        setErrorMessage('No supported retro ROM files were found in the selected location. (Tip: On mobile devices with large collections, select individual system folders like /GBA or /SNES).');
        sfx?.playModalClose?.();
        return;
      }

      if (extracted.files.length === 1 && !extracted.stats?.isExplicitFolder) {
        setSelectedFile(extracted.files[0]);
        setFolderData(null);
      } else {
        setFolderData({ ...extracted, dirHandle });
        setSelectedFile(null);
        setStorageMode(isMobile ? 'permanent' : 'session');
      }
      setFocusedOption(0);
      sfx?.playTileNav?.();
    } catch (err) {
      console.error('Error extracting ROMs:', err);
      setIsProcessing(false);
      setProgressState(null);
      setErrorMessage(err.message || 'Failed to parse dropped files');
    }
  };

  const handleSingleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length === 1) {
        setSelectedFile(files[0]);
        setFolderData(null);
        setFocusedOption(0);
        sfx?.playTileNav?.();
      } else {
        handleIncomingFiles(files);
      }
    }
    e.target.value = '';
  };

  const handleChooseFolderClick = async (e) => {
    e?.stopPropagation?.();
    if (typeof window !== 'undefined' && window.showDirectoryPicker) {
      try {
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        if (!dirHandle) return;
        setIsProcessing(true);
        setErrorMessage(null);
        setProgressState({ step: 'scanning', current: 0, total: 0, message: `Scanning folder "${dirHandle.name}" for retro titles...` });
        await new Promise(resolve => setTimeout(resolve, 40));
        const files = await scanDirectoryHandle(dirHandle, dirHandle.name, (prog) => {
          setProgressState(prev => ({
            ...prev,
            step: 'scanning',
            current: prog.current || 0,
            total: prog.total || 0,
            message: prog.message || `Scanning folder "${dirHandle.name}" for retro titles...`
          }));
        });
        await handleIncomingFiles(files, dirHandle);
      } catch (err) {
        if (err.name === 'AbortError') {
          // User cancelled native directory picker
          return;
        }
        console.warn('showDirectoryPicker unavailable, falling back to input:', err);
        folderInputRef.current?.click();
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  const handleReconnectAllLinkedFolders = async (e) => {
    e?.stopPropagation?.();
    if (!activeHandles || activeHandles.length === 0) return;
    if (onReconnectLinkedFolders) {
      await onReconnectLinkedFolders(activeHandles);
      onClose();
      return;
    }
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressState({ step: 'scanning', current: 0, total: 0, message: `Reconnecting ${activeHandles.length} linked folder(s)...` });
      
      const allFiles = [];
      for (const h of activeHandles) {
        try {
          const perm = await h.requestPermission({ mode: 'read' });
          if (perm === 'granted') {
            const files = await scanDirectoryHandle(h, h.name);
            allFiles.push(...files);
          }
        } catch (_) {}
      }
      if (allFiles.length > 0) {
        await handleIncomingFiles(allFiles);
      } else {
        setIsProcessing(false);
        setProgressState(null);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setIsProcessing(false);
        setProgressState(null);
        return;
      }
      console.error('Failed to reconnect linked folders:', err);
      setIsProcessing(false);
      setProgressState(null);
      setErrorMessage(err.message || 'Failed to reconnect linked folders');
    }
  };

  const handleRemoveSingleLinkedFolder = async (folderName) => {
    if (onRemoveLinkedFolder) {
      await onRemoveLinkedFolder(folderName);
    } else {
      await removeLinkedDirectoryHandle(folderName);
      const updated = await getLinkedDirectoryHandles();
      setLocalLinkedHandles(updated);
    }
  };

  const handleFolderChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleIncomingFiles(files);
    } else {
      setErrorMessage('The mobile file picker returned 0 items. Mobile OS restricts selecting massive root directories at once. Try selecting a specific system folder (e.g. GBA, SNES, NES) or individual ROMs.');
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragInside(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragInside(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragInside(false);

    if (e.dataTransfer) {
      handleIncomingFiles(e.dataTransfer);
    }
  };

  // Single File Action 1: Add to Library & Scrape
  const handleAddAndScrape = async () => {
    if (!selectedFile || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);
    sfx?.playTabSwitch?.();

    try {
      const sys = detectSystemFromExtension(selectedFile.name);
      if (onUploadToLibrary) {
        await onUploadToLibrary(selectedFile, sys.key, (progress) => {
          setProgressState(progress);
        });
      }
      sfx?.playThemeSwitch?.();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to add ROM to library:', err);
      setErrorMessage(err.message || 'Failed to save ROM to library');
      setIsProcessing(false);
    }
  };

  // Single File Action 2: Quick Play (RAM Only)
  const handleExecuteQuickPlay = () => {
    if (!selectedFile || isProcessing) return;
    sfx?.playGameLaunch?.();
    if (onQuickPlay) {
      onQuickPlay(selectedFile);
    }
    onClose();
  };

  // Folder Actions: Session Mode vs Permanent Ingestion Mode
  const handleFolderAction = async (scrapeInBackground = false) => {
    if (!folderData || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (storageMode === 'session') {
        // Path A: Just Load Folder (In-Memory Session / Persistent Zero-Copy on Desktop)
        if (folderData?.dirHandle && !isMobile) {
          try {
            await saveLinkedDirectoryHandle(folderData.dirHandle);
            const updated = await getLinkedDirectoryHandles();
            setLocalLinkedHandles(updated);
          } catch (_) {}
        }

        setProgressState({
          step: 'loading',
          current: 0,
          total: folderData.files.length,
          message: `Loading 0/${folderData.files.length} ROMs into session...`
        });
        sfx?.playGameLaunch?.();

        if (onLoadFolderSession) {
          await onLoadFolderSession(folderData.files, {
            scrapeInBackground,
            folderName: folderData.folderName,
            onProgress: (p) => setProgressState(p)
          });
        }
        
        sfx?.playThemeSwitch?.();
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        // Path B: Ingest to Library (Permanent Storage — Copies to Server / IndexedDB)
        if (folderData?.dirHandle) {
          try {
            await removeLinkedDirectoryHandle(folderData.dirHandle.name);
            const updated = await getLinkedDirectoryHandles();
            setLocalLinkedHandles(updated);
          } catch (_) {}
        }

        setProgressState({
          step: 'saving',
          current: 0,
          total: folderData.files.length,
          message: `Saving 0/${folderData.files.length} ROMs to library...`
        });
        sfx?.playTabSwitch?.();

        if (onIngestFolderToLibrary) {
          await onIngestFolderToLibrary(folderData.files, {
            scrapeInBackground,
            folderName: folderData.folderName,
            onProgress: (p) => setProgressState(p)
          });
        }

        sfx?.playThemeSwitch?.();
        setTimeout(() => {
          onClose();
        }, 300);
      }
    } catch (err) {
      console.error('Failed to process folder:', err);
      setErrorMessage(err.message || 'Failed to process ROMs folder');
      setIsProcessing(false);
    }
  };

  const detectedSystem = selectedFile ? detectSystemFromExtension(selectedFile.name) : null;
  const rawTitle = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : '';
  const cleanDisplayTitle = rawTitle
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || rawTitle;

  const fileSizeMb = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0.00';
  const folderTotalMb = folderData ? (folderData.stats.totalSizeBytes / (1024 * 1024)).toFixed(1) : '0';

  const supportedPlatforms = [
    { name: 'Game Boy Advance', ext: '.gba', icon: resolveAssetPath('assets/platforms/gba.svg') },
    { name: 'Game Boy', ext: '.gb', icon: resolveAssetPath('assets/platforms/gb.svg') },
    { name: 'Game Boy Color', ext: '.gbc', icon: resolveAssetPath('assets/platforms/gbc.svg') },
    { name: 'NES', ext: '.nes', icon: resolveAssetPath('assets/platforms/nes.svg') },
    { name: 'SNES', ext: '.sfc, .smc', icon: resolveAssetPath('assets/platforms/snes.svg') },
    { name: 'Nintendo 64', ext: '.z64, .n64', icon: resolveAssetPath('assets/platforms/n64.svg') },
    { name: 'Nintendo DS', ext: '.nds', icon: resolveAssetPath('assets/platforms/nds.svg') },
    { name: 'PlayStation', ext: '.iso, .bin', icon: resolveAssetPath('assets/platforms/psx.svg') },
    { name: 'Sega Genesis', ext: '.md, .gen', icon: resolveAssetPath('assets/platforms/genesis.svg') },
    { name: 'Game Gear', ext: '.gg', icon: resolveAssetPath('assets/platforms/gamegear.svg') },
    { name: 'Arcade (MAME)', ext: '.zip', icon: resolveAssetPath('assets/platforms/arcade.svg') },
    { name: 'Atari 2600', ext: '.a26', icon: resolveAssetPath('assets/platforms/atari2600.svg') }
  ];

  return (
    <div className="modal-backdrop load-rom-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="load-rom-modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: folderData ? '660px' : '620px' }}
      >
        
        {/* Header */}
        <div className="load-rom-header">
          <div className="load-rom-title-group">
            <div className="load-rom-icon-badge" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#e11d48' }}>
              {folderData ? <FolderTree size={22} /> : isProcessing ? <RefreshCw size={22} className="animate-spin" /> : <FolderOpen size={22} />}
            </div>
            <div>
              <h2>
                {isProcessing
                  ? 'Scanning ROMs & Assets'
                  : folderData 
                    ? 'Batch ROM Folder Review' 
                    : selectedFile 
                      ? 'ROM Ingestion & Review' 
                      : 'Load Custom ROM or Folder'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '2px 0 0' }}>
                {isProcessing
                  ? 'Parsing directory structure and verifying supported retro formats...'
                  : folderData 
                    ? `Configuring ${folderData.stats.totalFiles} detected retro titles`
                    : selectedFile 
                      ? 'Select how you want to launch this title' 
                      : 'Drop a ROM file, browse multiple ROMs, or select an entire folder'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="load-rom-body">

          {/* Hidden File Inputs (Always in DOM for ref accessibility) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".gba,.gb,.gbc,.nes,.fds,.sfc,.smc,.snes,.z64,.n64,.v64,.nds,.bin,.cue,.chd,.pbp,.iso,.zip,.7z,.md,.smd,.gen,.gg,.a26,.png,.webp,.jpg,.jpeg,.json,.nfo"
            onChange={handleSingleFileChange}
            style={{ display: 'none' }}
          />

          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderChange}
            style={{ display: 'none' }}
          />
          
          {/* STAGE 1: Dropzone & Initial State (When not scanning and nothing selected) */}
          {!selectedFile && !folderData && !isProcessing && (
            <>

              {/* Interactive Dual-Mode Drop Zone */}
              <div
                className={`load-rom-dropzone ${isDragInside ? 'drag-active' : ''} ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'browse' ? 'gamepad-focused' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={38} className="load-rom-dropzone-icon" />
                <div className="load-rom-dropzone-text">
                  <strong>Drag &amp; Drop ROMs or Folder here</strong>
                  <span>Supports single ROMs, multiple ROMs in a system folder, or full ROMs directory</span>
                </div>

                {/* Dual Action Buttons */}
                <div className="load-rom-dual-triggers">
                  <button
                    type="button"
                    className="load-rom-browse-btn"
                    onClick={() => {
                      haptics.medium();
                      fileInputRef.current?.click();
                    }}
                  >
                    <FolderOpen size={16} /> Choose File(s)
                  </button>

                  <button
                    type="button"
                    className="load-rom-browse-btn is-folder"
                    onClick={(e) => {
                      haptics.medium();
                      handleChooseFolderClick(e);
                    }}
                  >
                    <FolderTree size={16} /> Choose ROMs Folder
                  </button>
                </div>
              </div>

              {/* Desktop Reconnect Linked Folder(s) Card */}
              {activeHandles && activeHandles.length > 0 && !isMobile && (
                <div className="rom-linked-folder-card animate-fade-in" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
                    <div className="rom-linked-folder-left">
                      <FolderTree size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                      <div className="rom-linked-folder-info">
                        <strong>
                          {activeHandles.length === 1 ? `Linked Folder: "${activeHandles[0].name}"` : `${activeHandles.length} Linked Folders Saved`}
                        </strong>
                        <span>
                          Persistent zero-copy links saved on this device.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rom-linked-folder-btn"
                      onClick={handleReconnectAllLinkedFolders}
                      disabled={isProcessing}
                    >
                      <Zap size={13} />
                      <span>{activeHandles.length > 1 ? `Reconnect All (${activeHandles.length})` : 'Reconnect'}</span>
                    </button>
                  </div>

                  {/* Individual Folder Chips with Remove Option */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '6px', borderTop: '1px solid rgba(99, 102, 241, 0.15)' }}>
                    {activeHandles.map((handle) => (
                      <div key={handle.name} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-main)'
                      }}>
                        <span>📁 {handle.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.selection();
                            handleRemoveSingleLinkedFolder(handle.name);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0 2px',
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            lineHeight: 1
                          }}
                          title={`Remove link for ${handle.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Universal Speed & Efficiency Tip */}
              <div className="load-rom-speed-tip" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.22)',
                borderRadius: '10px',
                padding: '0.65rem 0.95rem',
                fontSize: '0.81rem',
                color: '#b45309',
                lineHeight: 1.45
              }}>
                <Zap size={16} style={{ flexShrink: 0, color: '#f59e0b' }} />
                <span>
                  <strong>Pro Tip:</strong> Selecting a specific system folder (e.g. <code>/gba</code>, <code>/snes</code>, or <code>/n64</code>) loads near-instantly compared to scanning entire multi-thousand root directories at once.
                </span>
              </div>

              {/* Error Message Alert Banner in Stage 1 */}
              {errorMessage && (
                <div className="rom-ingestion-error-box animate-fade-in" style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#dc2626'
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.86rem', lineHeight: 1.4, flex: 1 }}>{errorMessage}</span>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Supported Systems Grid */}
              <div className="load-rom-section">
                <h3 className="load-rom-section-title">
                  <Gamepad2 size={16} /> Supported Console Formats
                </h3>
                <div className="load-rom-platforms-grid">
                  {supportedPlatforms.map((plat) => (
                    <div key={plat.name} className="load-rom-platform-chip">
                      {plat.icon && <img src={plat.icon} alt="" className="load-rom-chip-icon" />}
                      <div className="load-rom-chip-info">
                        <span className="load-rom-chip-name">{plat.name}</span>
                        <span className="load-rom-chip-ext">{plat.ext}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

          {/* STAGE 1B: Active Scanning / Processing Progress View (When scanning is active) */}
          {!selectedFile && !folderData && isProcessing && (
            <div className="rom-ingestion-progress-box animate-fade-in" style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1.5px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '14px',
              padding: '1.5rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)',
              margin: '0.5rem 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <RefreshCw className="animate-spin" size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-color, #0f172a)' }}>
                      Scanning ROMs &amp; Assets...
                    </span>
                    {progressState?.total > 0 && (
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#3b82f6',
                        background: 'rgba(59, 130, 246, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {progressState.total} items
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {progressState?.message || 'Scanning files & console formats...'}
                  </span>
                </div>
              </div>

              <div className="rom-progress-track" style={{
                width: '100%',
                height: '7px',
                background: 'rgba(0, 0, 0, 0.08)',
                borderRadius: '999px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {progressState?.total > 0 ? (
                  <div
                    className="rom-progress-fill"
                    style={{
                      width: `${Math.max(3, Math.min(100, Math.round(((progressState.current || 0) / progressState.total) * 100)))}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                      transition: 'width 0.15s ease'
                    }}
                  />
                ) : (
                  <div className="rom-progress-indeterminate" />
                )}
              </div>
            </div>
          )}

          {/* STAGE 2A: Single File Ingestion Review */}
          {selectedFile && !folderData && (
            <div className="rom-ingestion-review-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Detected Game Preview Card */}
              <div className="rom-ingestion-card" style={{
                background: 'var(--panel-bg, #f8fafc)',
                border: '2px solid var(--panel-border, #cbd5e1)',
                borderRadius: '14px',
                padding: '1.1rem',
                boxShadow: 'inset 0 1px 0 #ffffff, 0 2px 8px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: detectedSystem?.color ? `${detectedSystem.color}18` : 'rgba(225, 29, 72, 0.12)',
                  border: `2px solid ${detectedSystem?.color || '#e11d48'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {detectedSystem?.icon ? (
                    <img src={detectedSystem.icon} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                  ) : (
                    <Gamepad2 size={28} style={{ color: detectedSystem?.color || '#e11d48' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.5rem',
                      borderRadius: '4px',
                      background: detectedSystem?.color || '#e11d48',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {detectedSystem?.name || 'CUSTOM CONSOLE'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                      {fileSizeMb} MB
                    </span>
                  </div>

                  <strong style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    display: 'block',
                    margin: '0.25rem 0 0.1rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cleanDisplayTitle}
                  </strong>

                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-sub)',
                    display: 'block',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {selectedFile.name}
                  </span>
                </div>
              </div>

              {/* Progress State */}
              {isProcessing && progressState && (
                <div className="rom-ingestion-progress-box">
                  {progressState.step === 'done' ? (
                    <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  ) : (
                    <RefreshCw size={20} className="animate-spin" style={{ color: '#e11d48', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>
                      {progressState.step === 'done' ? 'Ingestion Complete!' : 'Processing ROM...'}
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                      {progressState.message}
                    </span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="backup-alert is-danger">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Choice Cards */}
              {!isProcessing && (
                <div className="rom-ingestion-choices-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  {/* Choice 1: Add to Library & Scrape */}
                  <div className={`backup-action-card ${focusedOption === 0 ? 'is-focused' : ''}`}>
                    <div className="backup-card-info">
                      <div className="backup-card-icon" style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
                        <Sparkles size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                          Add to Library &amp; Auto-Scrape
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                          {isServerAvailable 
                            ? `Saves ROM to /roms/${detectedSystem?.key || 'system'}/, fetches authentic 3D box art & synopsis from Libretro CDN, and adds to your permanent dashboard.`
                            : `Saves ROM to browser storage (IndexedDB), fetches authentic 3D box art & synopsis from Libretro CDN, and keeps it in your offline library across reloads.`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="backup-action-btn is-primary"
                      onClick={handleAddAndScrape}
                      disabled={isProcessing}
                    >
                      <Sparkles size={15} />
                      <span>Add to Library &amp; Scrape</span>
                    </button>
                  </div>

                  {/* Choice 2: Quick Play (One-Time) */}
                  <div className={`backup-action-card ${focusedOption === 1 ? 'is-focused' : ''}`}>
                    <div className="backup-card-info">
                      <div className="backup-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Play size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                          Quick Play (One-Time Session)
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                          Boots immediately into the WebAssembly emulator sandbox without saving the file to host disk.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="backup-action-btn is-secondary"
                      onClick={handleExecuteQuickPlay}
                      disabled={isProcessing}
                    >
                      <Play size={15} />
                      <span>Launch One-Time Game</span>
                    </button>
                  </div>

                  {/* Choice 3: Back */}
                  <button
                    type="button"
                    className={`backup-action-btn is-secondary ${focusedOption === 2 ? 'is-focused' : ''}`}
                    style={{ justifyContent: 'center', height: '36px', marginTop: '0.25rem' }}
                    onClick={() => {
                      setSelectedFile(null);
                      setErrorMessage(null);
                      sfx?.playTileNav?.();
                    }}
                  >
                    <span>Choose Different File</span>
                  </button>

                </div>
              )}

            </div>
          )}

          {/* STAGE 2B: Folder Ingestion & Batch Review View */}
          {folderData && (
            <div className="rom-folder-review-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              
              {/* Folder Summary Card */}
              <div className="rom-folder-summary-card">
                <div className="rom-folder-summary-header">
                  <div className="rom-folder-icon-circle">
                    <FolderTree size={24} />
                  </div>
                  <div className="rom-folder-details">
                    <strong className="rom-folder-name">{folderData.folderName}</strong>
                    <div className="rom-folder-meta-row">
                      <span className="rom-folder-pill-count">
                        <Check size={12} /> {folderData.stats.totalFiles} Games Found
                      </span>
                      <span className="rom-folder-pill-size">
                        {folderTotalMb} MB Total
                      </span>
                      {folderData.stats.localCoversCount > 0 && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          background: '#8b5cf6',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Sparkles size={11} /> {folderData.stats.localCoversCount} Local Artwork
                        </span>
                      )}
                      {folderData.stats.localSidecarsCount > 0 && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          background: '#06b6d4',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          📝 {folderData.stats.localSidecarsCount} Sidecars
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* System Distribution Chips */}
                <div className="rom-folder-systems-list">
                  {Object.entries(folderData.stats.systems).map(([key, count]) => {
                    const sampleSys = getSystemInfoByKey(key);
                    return (
                      <span key={key} className="rom-folder-system-badge" style={{ borderColor: sampleSys.color }}>
                        {sampleSys.icon && <img src={sampleSys.icon} alt="" />}
                        <strong>{count}</strong> {sampleSys.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress Box for Folder Processing */}
              {isProcessing && progressState && (
                <div className="rom-ingestion-progress-box">
                  {progressState.step === 'done' ? (
                    <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  ) : (
                    <RefreshCw size={20} className="animate-spin" style={{ color: '#e11d48', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>
                      {progressState.step === 'done' ? 'Batch Ingestion Complete!' : 'Processing ROMs Folder...'}
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                      {progressState.message}
                    </span>
                    {progressState.total > 0 && (
                      <div className="rom-folder-progress-bar-bg">
                        <div 
                          className="rom-folder-progress-bar-fill" 
                          style={{ width: `${Math.min(100, Math.round(((progressState.current || 0) / progressState.total) * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="backup-alert is-danger">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!isProcessing && (
                <>
                  {/* Storage Mode: Mobile Permanent Notice vs Desktop Zero-Copy Selector */}
                  {isMobile ? (
                    <div className="rom-storage-mobile-notice" style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1.5px solid rgba(59, 130, 246, 0.22)',
                      borderRadius: '12px',
                      padding: '0.8rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)'
                    }}>
                      <HardDrive size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                      <div style={{ lineHeight: 1.4 }}>
                        <strong style={{ display: 'block', marginBottom: '2px', color: '#2563eb' }}>Permanent Mobile Library Storage</strong>
                        <span>Saves {folderData.stats.totalFiles} ROMs, local artwork, and sidecars directly into offline browser storage to persist across refreshes.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rom-storage-mode-selector">
                      <div className="rom-storage-mode-label">Select Storage Destination:</div>
                      <div className="rom-storage-mode-tabs">
                        <button
                          type="button"
                          className={`rom-storage-mode-tab ${storageMode === 'session' ? 'is-active' : ''}`}
                          onClick={() => {
                            setStorageMode('session');
                            sfx?.playTileNav?.();
                          }}
                        >
                          <Zap size={14} />
                          <span>Persistent Zero-Copy Link</span>
                        </button>

                        <button
                          type="button"
                          className={`rom-storage-mode-tab ${storageMode === 'permanent' ? 'is-active' : ''}`}
                          onClick={() => {
                            setStorageMode('permanent');
                            sfx?.playTileNav?.();
                          }}
                        >
                          <HardDrive size={14} />
                          <span>Save to Library (Permanent)</span>
                        </button>
                      </div>

                      <p className="rom-storage-mode-hint">
                        {storageMode === 'session'
                          ? '⚡ Zero disk duplication. Keeps the folder linked directly on your computer and streams games into your session.'
                          : `💾 Copies all ${folderData.stats.totalFiles} ROMs permanently to ${isServerAvailable ? 'server /roms/ directory' : 'browser IndexedDB storage'} for offline portability.`}
                      </p>
                    </div>
                  )}

                  {/* Dual Action Choices for Selected Storage Mode */}
                  <div className="rom-folder-actions-grid">
                    
                    {/* Action 1: Load Without Scrape */}
                    <div className={`backup-action-card ${focusedOption === 0 ? 'is-focused' : ''}`}>
                      <div className="backup-card-info">
                        <div className="backup-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                          <Play size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                            {storageMode === 'session' ? 'Just Load (No Scrape)' : 'Save to Library (Fast / No Scrape)'}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                            {storageMode === 'session'
                              ? 'Instantly imports all titles and local covers into your session without scraping or internet lookups.'
                              : 'Fast batch saves all ROMs, local box art, and sidecars to your persistent library without internet scraping.'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="backup-action-btn is-secondary"
                        onClick={() => handleFolderAction(false)}
                        disabled={isProcessing}
                      >
                        <Play size={14} />
                        <span>{storageMode === 'session' ? 'Just Load Fast' : 'Save (Fast)'}</span>
                      </button>
                    </div>

                    {/* Action 2: Load & Scrape in Background */}
                    <div className={`backup-action-card ${focusedOption === 1 ? 'is-focused' : ''}`}>
                      <div className="backup-card-info">
                        <div className="backup-card-icon" style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
                          <Sparkles size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                            {storageMode === 'session' ? 'Just Load & Scrape (Background)' : 'Save & Scrape (Background)'}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                            {storageMode === 'session'
                              ? 'Loads your session instantly while fetching missing 3D box art & metadata in the background.'
                              : 'Saves your entire collection locally and automatically fills in missing 3D box art from the internet in the background.'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="backup-action-btn is-primary"
                        onClick={() => handleFolderAction(true)}
                        disabled={isProcessing}
                      >
                        <Sparkles size={14} />
                        <span>{storageMode === 'session' ? 'Load & Scrape' : 'Save & Scrape'}</span>
                      </button>
                    </div>

                    {/* Action 3: Choose Different Folder */}
                    <button
                      type="button"
                      className={`backup-action-btn is-secondary ${focusedOption === 2 ? 'is-focused' : ''}`}
                      style={{ justifyContent: 'center', height: '36px', marginTop: '0.2rem' }}
                      onClick={() => {
                        setFolderData(null);
                        setErrorMessage(null);
                        sfx?.playTileNav?.();
                      }}
                    >
                      <span>Choose Different Folder or File</span>
                    </button>

                  </div>
                </>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

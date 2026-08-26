import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  FolderOpen, 
  Upload, 
  ShieldCheck, 
  Gamepad2, 
  Sparkles, 
  Play, 
  HardDrive, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';
import { detectSystemFromExtension } from '../utils/systemDetector';
import { checkServerDbStatus } from '../services/db';

/**
 * LoadRomModal - Smart In-App Modal Dialog for loading or permanently ingesting custom ROMs.
 * - On Static Hosts (GitHub Pages): Directly launches 100% private in-browser WebAssembly quick play.
 * - On Self-Hosted (Docker / Localhost): Shows Ingestion Review Card to either Add to Library & Scrape
 *   (upload, query Libretro CDN for 3D box art, write <game>.webp and <game>.json sidecars) or Quick Play.
 */
export default function LoadRomModal({
  isOpen,
  initialFile = null,
  focusedTarget,
  onClose,
  onQuickPlay,
  onUploadToLibrary,
  sfx
}) {
  const fileInputRef = useRef(null);
  const [isDragInside, setIsDragInside] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState(null); // { step: string, message: string }
  const [errorMessage, setErrorMessage] = useState(null);
  const [focusedOption, setFocusedOption] = useState(0); // 0: Add & Scrape, 1: Quick Play, 2: Back
  const isServerAvailable = checkServerDbStatus();

  // Sync state when modal opens/closes or when initialFile is supplied
  useEffect(() => {
    if (isOpen) {
      if (initialFile) {
        setSelectedFile(initialFile);
      }
    } else {
      setSelectedFile(null);
      setIsProcessing(false);
      setProgressState(null);
      setErrorMessage(null);
      setFocusedOption(0);
      setIsDragInside(false);
    }
  }, [isOpen, initialFile]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sfx?.playModalClose?.();
        if (selectedFile && !isProcessing) {
          setSelectedFile(null);
          setErrorMessage(null);
        } else {
          onClose();
        }
        return;
      }

      if (selectedFile && !isProcessing) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedFile, isProcessing, focusedOption, sfx, onClose]);

  if (!isOpen) return null;

  const handleIncomingFile = (file) => {
    if (!file) return;

    // Transition to Ingestion Review Card for all environments
    setSelectedFile(file);
    setErrorMessage(null);
    setProgressState(null);
    setFocusedOption(0);
    sfx?.playTileNav?.();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleIncomingFile(file);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleIncomingFile(file);
    }
  };

  // Option 1: Add to Library and Scrape
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

  // Option 2: Quick Play (RAM Only)
  const handleExecuteQuickPlay = () => {
    if (!selectedFile || isProcessing) return;
    sfx?.playGameLaunch?.();
    if (onQuickPlay) {
      onQuickPlay(selectedFile);
    }
    onClose();
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

  const supportedPlatforms = [
    { name: 'Game Boy Advance', ext: '.gba', icon: resolveAssetPath('assets/platforms/gba.svg') },
    { name: 'Game Boy', ext: '.gb', icon: resolveAssetPath('assets/platforms/gb.svg') },
    { name: 'Game Boy Color', ext: '.gbc', icon: resolveAssetPath('assets/platforms/gbc.svg') },
    { name: 'NES', ext: '.nes', icon: resolveAssetPath('assets/platforms/nes.svg') },
    { name: 'SNES', ext: '.sfc, .smc', icon: resolveAssetPath('assets/platforms/snes.svg') },
    { name: 'Nintendo 64', ext: '.z64, .n64', icon: resolveAssetPath('assets/platforms/n64.svg') },
    { name: 'Nintendo DS', ext: '.nds', icon: resolveAssetPath('assets/platforms/nds.svg') },
    { name: 'PlayStation', ext: '.iso', icon: resolveAssetPath('assets/platforms/psx.svg') },
    { name: 'Sega Genesis', ext: '.md, .gen', icon: resolveAssetPath('assets/platforms/genesis.svg') },
    { name: 'Game Gear', ext: '.gg', icon: resolveAssetPath('assets/platforms/gamegear.svg') },
    { name: 'Arcade (MAME)', ext: '.zip', icon: resolveAssetPath('assets/platforms/arcade.svg') },
    { name: 'Atari 2600', ext: '.a26', icon: resolveAssetPath('assets/platforms/atari2600.svg') }
  ];

  return (
    <div className="modal-backdrop load-rom-backdrop animate-fade-in" onClick={onClose}>
      <div className="load-rom-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        
        {/* Header */}
        <div className="load-rom-header">
          <div className="load-rom-title-group">
            <div className="load-rom-icon-badge" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#e11d48' }}>
              <FolderOpen size={22} />
            </div>
            <div>
              <h2>{selectedFile ? 'ROM Ingestion & Review' : 'Load Custom ROM'}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '2px 0 0' }}>
                {selectedFile ? 'Select how you want to launch this title' : 'Drop a ROM file to launch or add to your library'}
              </p>
            </div>
          </div>
          <button
            className={`load-rom-close-btn ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="load-rom-body">
          
          {/* STAGE 1: Dropzone (When no file selected) */}
          {!selectedFile ? (
            <>
              <p className="load-rom-tagline">
                Drop any retro ROM file below or browse from your device. Self-hosted instances automatically give you the option to save to library with authentic 3D box art scraping.
              </p>

              {/* Interactive Drop Zone */}
              <div
                className={`load-rom-dropzone ${isDragInside ? 'drag-active' : ''} ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'browse' ? 'gamepad-focused' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={38} className="load-rom-dropzone-icon" />
                <div className="load-rom-dropzone-text">
                  <strong>Drag &amp; Drop ROM here</strong>
                  <span>or click to browse from your device</span>
                </div>
                <button
                  type="button"
                  className="load-rom-browse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <FolderOpen size={16} /> Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gba,.gb,.gbc,.nes,.sfc,.smc,.z64,.n64,.nds,.bin,.cue,.chd,.iso,.zip,.md,.smd,.gen"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

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

              {/* Persistence Notice */}
              <div className="load-rom-privacy-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <HardDrive size={18} style={{ color: isServerAvailable ? '#10b981' : '#3b82f6', flexShrink: 0 }} />
                <span>
                  <strong>{isServerAvailable ? 'Docker / Server Storage Active:' : '100% Client-Side Play:'}</strong>{' '}
                  {isServerAvailable 
                    ? 'Uploaded games are automatically organized into /roms/<system>/ with authentic Libretro 3D box art & metadata.' 
                    : 'Loaded ROMs execute directly in your browser WASM sandbox without uploading to any remote server.'}
                </span>
              </div>
            </>
          ) : (
            /* STAGE 2: Ingestion Review & Choices (When file selected on Docker / Localhost) */
            <div className="rom-ingestion-review-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Detected Game Preview Card (DS Touch Style) */}
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
                {/* Platform Icon Badge */}
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

                {/* Game & Console Info */}
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

              {/* Progress State during Upload / Scraping */}
              {isProcessing && progressState && (
                <div className="rom-ingestion-progress-box" style={{
                  background: 'rgba(225, 29, 72, 0.08)',
                  border: '1.5px solid rgba(225, 29, 72, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
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

              {/* Error Message if any */}
              {errorMessage && (
                <div className="backup-alert is-danger">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Choice Cards (When not currently processing) */}
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
                            ? `Saves ROM to /roms/${detectedSystem?.key || 'system'}/ on server disk, fetches authentic 3D box art & synopsis from Libretro CDN, and adds to your permanent dashboard.`
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

                  {/* Choice 3: Back / Choose Different File */}
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

        </div>

      </div>
    </div>
  );
}

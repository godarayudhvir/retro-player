import React, { useRef, useState } from 'react';
import { X, FolderOpen, Upload, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * LoadRomModal - In-app modal dialog for loading local custom ROMs via browse or drag-and-drop.
 * Fully styled via CSS design tokens and theme engine overrides.
 */
export default function LoadRomModal({
  isOpen,
  focusedTarget,
  onClose,
  onFileLoaded,
  sfx
}) {
  const fileInputRef = useRef(null);
  const [isDragInside, setIsDragInside] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoaded(file);
      onClose();
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
      onFileLoaded(file);
      onClose();
    }
  };

  const supportedPlatforms = [
    { name: 'Game Boy Advance', ext: '.gba', icon: '/assets/platforms/gba.svg' },
    { name: 'Game Boy / Color', ext: '.gb, .gbc', icon: '/assets/platforms/gbc.svg' },
    { name: 'NES & SNES', ext: '.nes, .sfc, .smc', icon: '/assets/platforms/snes.svg' },
    { name: 'Nintendo 64', ext: '.z64, .n64', icon: '/assets/platforms/n64.svg' },
    { name: 'Nintendo DS', ext: '.nds', icon: '/assets/platforms/nds.svg' },
    { name: 'PlayStation', ext: '.bin, .iso, .chd', icon: '/assets/platforms/psx.svg' },
    { name: 'Sega Genesis', ext: '.md, .gen', icon: '/assets/platforms/genesis.svg' },
    { name: 'Arcade (MAME)', ext: '.zip', icon: '/assets/platforms/arcade.svg' }
  ];

  return (
    <div className="modal-backdrop load-rom-backdrop" onClick={onClose}>
      <div className="load-rom-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="load-rom-header">
          <div className="load-rom-title-group">
            <div className="load-rom-icon-badge">
              <FolderOpen size={22} />
            </div>
            <h2>Load Custom ROM</h2>
          </div>
          <button
            className={`load-rom-close-btn ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            title="Close (ESC / B)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="load-rom-body">
          <p className="load-rom-tagline">
            Drop any retro ROM file below or browse from your device to launch it instantly in high-performance WebAssembly emulation.
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
              <strong>Drag & Drop ROM here</strong>
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

          {/* Supported Systems */}
          <div className="load-rom-section">
            <h3 className="load-rom-section-title">
              <Sparkles size={16} /> Supported Console Formats
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

          {/* Privacy Note */}
          <div className="load-rom-privacy-banner">
            <ShieldCheck size={18} className="load-rom-privacy-icon" />
            <span><strong>100% Client-Side Privacy:</strong> ROMs run directly in browser memory and are never uploaded to any server.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="load-rom-footer">
          <button
            className={`load-rom-btn-cancel ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`load-rom-btn-primary ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'browse' ? 'gamepad-focused' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files...
          </button>
        </div>
      </div>
    </div>
  );
}

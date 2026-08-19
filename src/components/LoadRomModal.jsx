import React, { useRef, useState } from 'react';
import { X, FolderOpen, Upload, ShieldCheck, Sparkles, Gamepad2 } from 'lucide-react';

/**
 * LoadRomModal - In-app modal dialog for loading local custom ROMs via browse or drag-and-drop.
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
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className="info-modal-content load-rom-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="info-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              borderRadius: '12px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderOpen size={24} color="#3b82f6" />
            </div>
            <h2>Load Custom ROM</h2>
          </div>
          <button
            className={`info-close-btn ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            title="Close (ESC / B)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="info-modal-body">
          <p className="info-tagline" style={{
            background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(240, 253, 250, 0.8) 100%)',
            borderColor: '#dbeafe',
            color: '#1e3a8a'
          }}>
            Drop any retro ROM file below or browse from your device to launch it instantly in high-performance WebAssembly emulation.
          </p>

          {/* Interactive Drop Zone */}
          <div
            className={`modal-dropzone ${isDragInside ? 'drag-active' : ''} ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'browse' ? 'gamepad-focused' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={40} className="modal-dropzone-icon" />
            <div className="modal-dropzone-text">
              <strong>Drag & Drop ROM here</strong>
              <span>or click to browse from your device</span>
            </div>
            <button
              type="button"
              className="modal-browse-btn"
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
          <div className="info-section">
            <h3><Sparkles size={16} color="#3b82f6" /> Supported Console Formats</h3>
            <div className="supported-formats-grid">
              {supportedPlatforms.map((plat) => (
                <div key={plat.name} className="platform-chip">
                  {plat.icon && <img src={plat.icon} alt="" className="chip-icon" />}
                  <div className="chip-info">
                    <span className="chip-name">{plat.name}</span>
                    <span className="chip-ext">{plat.ext}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.82rem',
            color: '#64748b',
            background: '#f8fafc',
            padding: '0.75rem 1rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0'
          }}>
            <ShieldCheck size={18} color="#10b981" />
            <span><strong>100% Client-Side Privacy:</strong> ROMs run in browser memory and are never uploaded to any server.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="info-modal-footer" style={{ gap: '0.75rem' }}>
          <button
            className={`info-ack-btn ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '2px solid #e2e8f0',
              boxShadow: 'none'
            }}
          >
            Cancel
          </button>
          <button
            className={`info-ack-btn ${focusedTarget?.zone === 'loadRomModal' && focusedTarget?.id === 'browse' ? 'gamepad-focused' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)'
            }}
          >
            Browse Files...
          </button>
        </div>
      </div>
    </div>
  );
}

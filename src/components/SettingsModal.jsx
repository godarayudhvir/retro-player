import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Settings, 
  Disc, 
  Music, 
  Upload, 
  Trash2, 
  Search, 
  FolderPlus, 
  Gamepad2, 
  HardDrive, 
  Check, 
  AlertCircle,
  Play,
  Volume2
} from 'lucide-react';
import { detectSystemFromExtension } from '../utils/systemDetector';
import ConfirmDialog from './ConfirmDialog';

/**
 * Console Settings & Library Manager Modal
 * Allows uploading and deleting ROMs across all platforms, and managing Background Music (BGM) tracks.
 * 100% navigable via Keyboard and Gamepad.
 */
export default function SettingsModal({
  isOpen,
  onClose,
  games = [],
  systems = [],
  fetchGames,
  bgm,
  sfx
}) {
  const [activeTab, setActiveTab] = useState('roms'); // 'roms' | 'bgm'
  const [romSearch, setRomSearch] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error'|'info', message: string }
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteRom, setPendingDeleteRom] = useState(null);
  const [pendingDeleteBgm, setPendingDeleteBgm] = useState(null);

  const fileInputRef = useRef(null);
  const bgmInputRef = useRef(null);

  // Filter ROMs based on search and system
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = !romSearch || 
        game.title?.toLowerCase().includes(romSearch.toLowerCase()) ||
        game.filename?.toLowerCase().includes(romSearch.toLowerCase());
      
      const matchesSystem = selectedSystemFilter === 'all' || game.systemKey === selectedSystemFilter;
      return matchesSearch && matchesSystem;
    });
  }, [games, romSearch, selectedSystemFilter]);

  if (!isOpen) return null;

  // Handle ROM Upload
  const handleRomUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: `Uploading ${files.length} ROM(s)...` });

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        const sys = detectSystemFromExtension(file.name);
        const response = await fetch('/api/upload-rom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-filename': encodeURIComponent(file.name),
            'x-system-key': sys.key
          },
          body: file
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Failed uploading ROM:', err);
        failCount++;
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setUploadStatus({ type: 'success', message: `Successfully uploaded ${successCount} ROM(s)!` });
      sfx?.playSaveDetected?.();
      fetchGames?.();
    } else {
      setUploadStatus({ type: 'error', message: `Failed to upload files.` });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Handle BGM Track Upload
  const handleBgmUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: `Uploading ${files.length} audio track(s)...` });

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        const response = await fetch('/api/upload-bgm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-filename': encodeURIComponent(file.name)
          },
          body: file
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error('Failed uploading BGM:', err);
        failCount++;
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setUploadStatus({ type: 'success', message: `Successfully uploaded ${successCount} track(s)!` });
      sfx?.playSaveDetected?.();
      bgm?.refreshTracks?.();
    } else {
      setUploadStatus({ type: 'error', message: `Failed to upload audio files.` });
    }

    if (bgmInputRef.current) bgmInputRef.current.value = '';
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Execute ROM Deletion after in-app confirmation
  const executeDeleteRom = async (game) => {
    setDeletingId(game.id);
    try {
      const res = await fetch('/api/delete-rom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemKey: game.systemKey,
          filename: game.filename,
          relativePath: game.romUrl?.replace('/roms/', '')
        })
      });

      if (res.ok) {
        setUploadStatus({ type: 'success', message: `Deleted "${game.title}" from disk.` });
        sfx?.playModalClose?.();
        fetchGames?.();
      } else {
        setUploadStatus({ type: 'error', message: `Failed to delete "${game.title}" from disk.` });
      }
    } catch (e) {
      console.error('Error deleting ROM:', e);
      setUploadStatus({ type: 'error', message: 'Error connecting to server.' });
    } finally {
      setDeletingId(null);
      setPendingDeleteRom(null);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  // Execute BGM Deletion after in-app confirmation
  const executeDeleteBgm = async (track) => {
    setDeletingId(track.id);
    try {
      const res = await fetch('/api/delete-bgm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: track.filename })
      });

      if (res.ok) {
        setUploadStatus({ type: 'success', message: `Deleted track "${track.title}" from disk.` });
        sfx?.playModalClose?.();
        bgm?.refreshTracks?.();
      } else {
        setUploadStatus({ type: 'error', message: `Failed to delete "${track.title}" from disk.` });
      }
    } catch (e) {
      console.error('Error deleting BGM:', e);
      setUploadStatus({ type: 'error', message: 'Error connecting to server.' });
    } finally {
      setDeletingId(null);
      setPendingDeleteBgm(null);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  return (
    <>
      <div className="settings-modal-backdrop animate-fade-in" onClick={onClose}>
        <div className="settings-modal-container" onClick={(e) => e.stopPropagation()}>
          
          {/* Settings Header */}
          <div className="settings-header">
            <div className="settings-title">
              <Settings size={28} color="#ef4444" />
              <div>
                <h2>Console Settings & Library Manager</h2>
                <span className="settings-subtitle">Manage ROM files, background music playlist, and storage</span>
              </div>
            </div>
            <button className="settings-close-btn" onClick={onClose} aria-label="Close Settings">
              <X size={20} />
            </button>
          </div>

          {/* Settings Tab Navigation */}
          <div className="settings-tabs-bar">
            <button
              className={`settings-tab-btn ${activeTab === 'roms' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('roms');
                sfx?.playTileNav?.();
              }}
            >
              <Disc size={18} />
              <span>ROMs Management ({games.length})</span>
            </button>

            <button
              className={`settings-tab-btn ${activeTab === 'bgm' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('bgm');
                sfx?.playTileNav?.();
              }}
            >
              <Music size={18} />
              <span>Background Music ({bgm?.tracks?.length || 0})</span>
            </button>
          </div>

          {/* Upload Status Notification Banner */}
          {uploadStatus && (
            <div className={`settings-status-banner ${uploadStatus.type} animate-fade-in`}>
              {uploadStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{uploadStatus.message}</span>
            </div>
          )}

          {/* Tab 1: ROMs Management */}
          {activeTab === 'roms' && (
            <div className="settings-content-pane">
              <div className="settings-actions-bar">
                {/* Search & System Filter */}
                <div className="settings-filter-group">
                  <div className="settings-search-box">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Filter ROMs..."
                      value={romSearch}
                      onChange={(e) => setRomSearch(e.target.value)}
                    />
                    {romSearch && (
                      <button onClick={() => setRomSearch('')} className="clear-search-btn">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedSystemFilter}
                    onChange={(e) => setSelectedSystemFilter(e.target.value)}
                    className="settings-select"
                  >
                    <option value="all">All Systems ({games.length})</option>
                    {systems.map(sys => (
                      <option key={sys.key} value={sys.key}>
                        {sys.name} ({sys.gameCount || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Button */}
                <div className="settings-upload-wrapper">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".nes,.snes,.smc,.sfc,.gba,.gbc,.gb,.n64,.z64,.v64,.nds,.gen,.zip,.iso,.cue,.chd,.bin"
                    onChange={handleRomUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="settings-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <FolderPlus size={18} />
                    <span>{isUploading ? 'Uploading...' : 'Upload ROMs'}</span>
                  </button>
                </div>
              </div>

              {/* ROMs List */}
              <div className="settings-list-scroll">
                {filteredGames.length === 0 ? (
                  <div className="settings-empty-state">
                    <Gamepad2 size={40} color="#94a3b8" />
                    <p>No ROMs match your search or filter</p>
                  </div>
                ) : (
                  <div className="settings-items-grid">
                    {filteredGames.map((game) => (
                      <div key={game.id} className="settings-item-row">
                        <div className="settings-item-left">
                          <span 
                            className="settings-system-badge" 
                            style={{ backgroundColor: game.systemColor || '#ef4444' }}
                          >
                            {game.systemName}
                          </span>
                          <div className="settings-item-info">
                            <span className="settings-item-title">{game.title}</span>
                            <span className="settings-item-file">{game.filename}</span>
                          </div>
                        </div>

                        <div className="settings-item-actions">
                          <button
                            className="settings-delete-btn"
                            onClick={() => {
                              setPendingDeleteRom(game);
                              sfx?.playModalOpen?.();
                            }}
                            disabled={deletingId === game.id}
                            title={`Delete ${game.title} from disk`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Background Music (BGM) Management */}
          {activeTab === 'bgm' && (
            <div className="settings-content-pane">
              <div className="settings-actions-bar">
                <div className="settings-info-text">
                  <span>Manage audio tracks streamed in console background. (MP3, OGG, WAV, FLAC, M4A)</span>
                </div>

                {/* Upload BGM Button */}
                <div className="settings-upload-wrapper">
                  <input
                    ref={bgmInputRef}
                    type="file"
                    multiple
                    accept=".mp3,.ogg,.wav,.flac,.m4a,.aac"
                    onChange={handleBgmUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="settings-upload-btn"
                    onClick={() => bgmInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload size={18} />
                    <span>{isUploading ? 'Uploading...' : 'Upload Tracks'}</span>
                  </button>
                </div>
              </div>

              {/* BGM Tracks List */}
              <div className="settings-list-scroll">
                {(!bgm?.tracks || bgm.tracks.length === 0) ? (
                  <div className="settings-empty-state">
                    <Music size={40} color="#94a3b8" />
                    <p>No background music tracks in library</p>
                  </div>
                ) : (
                  <div className="settings-items-grid">
                    {bgm.tracks.map((track, idx) => {
                      const isCurrent = bgm.currentTrackIndex === idx;

                      return (
                        <div key={track.id || idx} className={`settings-item-row ${isCurrent ? 'is-playing-track' : ''}`}>
                          <div className="settings-item-left">
                            <button
                              className={`settings-play-track-btn ${isCurrent && bgm.isPlaying ? 'active' : ''}`}
                              onClick={() => {
                                if (isCurrent) {
                                  bgm.togglePlay();
                                } else {
                                  bgm.playTrack(idx);
                                }
                                sfx?.playTileNav?.();
                              }}
                              title={isCurrent && bgm.isPlaying ? "Pause Track" : "Play Track"}
                            >
                              {isCurrent && bgm.isPlaying ? <Volume2 size={16} color="#10b981" /> : <Play size={16} />}
                            </button>
                            <div className="settings-item-info">
                              <span className="settings-item-title">{track.title}</span>
                              <span className="settings-item-file">{track.filename}</span>
                            </div>
                          </div>

                          <div className="settings-item-actions">
                            <button
                              className="settings-delete-btn"
                              onClick={() => {
                                setPendingDeleteBgm(track);
                                sfx?.playModalOpen?.();
                              }}
                              disabled={deletingId === track.id}
                              title={`Delete ${track.title} from disk`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="settings-footer">
            <div className="settings-footer-info">
              <HardDrive size={16} color="#64748b" />
              <span>Volume Mounts: <code>./roms</code> & <code>./bgm</code></span>
            </div>
            <button className="settings-done-btn" onClick={onClose}>
              Done
            </button>
          </div>

        </div>
      </div>

      {/* Themed In-App Confirmation Modal for ROM Delete */}
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteRom)}
        title="Delete ROM from Disk?"
        message={`Are you sure you want to permanently delete "${pendingDeleteRom?.title}" (${pendingDeleteRom?.filename}) from server disk?`}
        confirmText="Delete ROM"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (pendingDeleteRom) {
            executeDeleteRom(pendingDeleteRom);
          }
        }}
        onCancel={() => {
          setPendingDeleteRom(null);
        }}
        sfx={sfx}
      />

      {/* Themed In-App Confirmation Modal for BGM Delete */}
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteBgm)}
        title="Delete Audio Track?"
        message={`Are you sure you want to permanently delete audio track "${pendingDeleteBgm?.title}" (${pendingDeleteBgm?.filename}) from server storage?`}
        confirmText="Delete Track"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (pendingDeleteBgm) {
            executeDeleteBgm(pendingDeleteBgm);
          }
        }}
        onCancel={() => {
          setPendingDeleteBgm(null);
        }}
        sfx={sfx}
      />
    </>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, Upload, Image as ImageIcon, Sparkles, Tag, Calendar, User, Building, Film, Check, AlertCircle, BookOpen, Video } from 'lucide-react';
import { resolveAssetPath } from '../utils/assetPath';
import { saveManualMetadata, deleteManualMetadata } from '../services/metadataScraper';
import { convertRemoteImageToWebpDataUrl } from '../utils/imageConverter';

/**
 * Jellyfin-Style In-App Manual Metadata Editor
 * Allows players to override metadata and cover art for ROM hacks, homebrew, and custom titles.
 * Supports 100% spatial gamepad and keyboard navigation.
 */
export default function MetadataEditModal({
  isOpen,
  game,
  metadata,
  onSaveSuccess,
  onClose,
  focusedTarget,
  setFocusedTarget,
  sfx
}) {
  if (!isOpen || !game) return null;

  const currentMeta = metadata || {};
  const [title, setTitle] = useState(currentMeta.title || game.sidecarMetadata?.title || game.title || '');
  const [description, setDescription] = useState(currentMeta.description || game.sidecarMetadata?.description || '');
  const [releaseYear, setReleaseYear] = useState(currentMeta.releaseYear || game.sidecarMetadata?.year || '');
  const [developer, setDeveloper] = useState(currentMeta.developer || game.sidecarMetadata?.developer || '');
  const [publisher, setPublisher] = useState(currentMeta.publisher || game.sidecarMetadata?.publisher || '');
  const [genre, setGenre] = useState(currentMeta.genre || game.sidecarMetadata?.genre || '');
  const [writtenWalkthrough, setWrittenWalkthrough] = useState(
    currentMeta.walkthrough?.written || currentMeta.writtenWalkthroughUrl || game.sidecarMetadata?.walkthrough?.written || ''
  );
  const [videoWalkthrough, setVideoWalkthrough] = useState(
    currentMeta.walkthrough?.video || currentMeta.videoWalkthroughUrl || game.sidecarMetadata?.walkthrough?.video || ''
  );
  const [coverUrl, setCoverUrl] = useState(currentMeta.coverUrl || game.coverUrl || '');
  const [previewError, setPreviewError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  // Sync state when game changes
  useEffect(() => {
    const meta = metadata || {};
    setTitle(meta.title || game.sidecarMetadata?.title || game.title || '');
    setDescription(meta.description || game.sidecarMetadata?.description || '');
    setReleaseYear(meta.releaseYear || game.sidecarMetadata?.year || '');
    setDeveloper(meta.developer || game.sidecarMetadata?.developer || '');
    setPublisher(meta.publisher || game.sidecarMetadata?.publisher || '');
    setGenre(meta.genre || game.sidecarMetadata?.genre || '');
    setWrittenWalkthrough(
      meta.walkthrough?.written || meta.writtenWalkthroughUrl || game.sidecarMetadata?.walkthrough?.written || ''
    );
    setVideoWalkthrough(
      meta.walkthrough?.video || meta.videoWalkthroughUrl || game.sidecarMetadata?.walkthrough?.video || ''
    );
    setCoverUrl(meta.coverUrl || game.coverUrl || '');
    setPreviewError(false);
    setSaveStatus(null);
  }, [game, metadata]);

  // Handle local image file upload & compression
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setSaveStatus({ type: 'error', message: 'Please select a valid image file (PNG, WebP, JPG)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and resize image onto canvas to keep memory reasonable
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', 0.88);
        setCoverUrl(dataUrl);
        setPreviewError(false);
        sfx?.playThemeSwitch?.();
        setSaveStatus({ type: 'success', message: 'Custom cover image loaded into preview.' });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const gameId = game.id || `${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let finalCoverUrl = coverUrl.trim() || null;
      let diskSaved = false;

      const walkthroughObj = (writtenWalkthrough.trim() || videoWalkthrough.trim()) ? {
        ...(writtenWalkthrough.trim() ? { written: writtenWalkthrough.trim() } : {}),
        ...(videoWalkthrough.trim() ? { video: videoWalkthrough.trim() } : {})
      } : undefined;

      // Prepare cover data URL (convert remote URLs to WebP data URL so server can write .webp to disk)
      let payloadCoverDataUrl = coverUrl.startsWith('data:image/') ? coverUrl : null;
      if (!payloadCoverDataUrl && coverUrl && (coverUrl.startsWith('http://') || coverUrl.startsWith('https://'))) {
        try {
          const converted = await convertRemoteImageToWebpDataUrl(coverUrl);
          if (converted && converted.startsWith('data:image/')) {
            payloadCoverDataUrl = converted;
          }
        } catch (_) {}
      }

      // Try saving directly to disk backend via /api/metadata/save-sidecar
      try {
        const res = await fetch('/api/metadata/save-sidecar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            systemKey: game.systemKey,
            romPath: game.romUrl || game.url,
            title: title.trim() || game.title,
            description: description.trim(),
            releaseYear: releaseYear.trim(),
            developer: developer.trim() || game.systemName,
            publisher: publisher.trim() || game.systemName,
            genre: genre.trim() || 'Retro Classic',
            walkthrough: walkthroughObj,
            coverDataUrl: payloadCoverDataUrl,
            coverUrl: !payloadCoverDataUrl ? coverUrl : null
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            diskSaved = true;
            if (result.savedCoverUrl) {
              finalCoverUrl = result.savedCoverUrl;
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend disk write unavailable, saving to IndexedDB:', backendErr);
      }

      const updatedData = {
        title: title.trim() || game.title,
        description: description.trim(),
        releaseYear: releaseYear.trim(),
        releaseDate: releaseYear.trim() ? `${releaseYear.trim()}-01-01` : '2000-01-01',
        developer: developer.trim() || game.systemName,
        publisher: publisher.trim() || game.systemName,
        genre: genre.trim() || 'Retro Classic',
        coverUrl: finalCoverUrl,
        hasCustomCover: !!finalCoverUrl,
        systemKey: game.systemKey,
        isSidecar: true,
        walkthrough: walkthroughObj,
        writtenWalkthroughUrl: writtenWalkthrough.trim() || null,
        videoWalkthroughUrl: videoWalkthrough.trim() || null
      };

      const record = await saveManualMetadata(gameId, updatedData);
      sfx?.playCartridgeClick?.();
      setSaveStatus({
        type: 'success',
        message: diskSaved
          ? 'Saved to ROMs folder & Git repository!'
          : 'Saved to browser IndexedDB storage!'
      });
      setIsSaving(false);

      if (onSaveSuccess) {
        onSaveSuccess(record);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to save manual metadata:', err);
      setIsSaving(false);
      setSaveStatus({ type: 'error', message: 'Failed to save metadata: ' + err.message });
    }
  };

  const handleExportSidecar = () => {
    const walkthroughObj = (writtenWalkthrough.trim() || videoWalkthrough.trim()) ? {
      ...(writtenWalkthrough.trim() ? { written: writtenWalkthrough.trim() } : {}),
      ...(videoWalkthrough.trim() ? { video: videoWalkthrough.trim() } : {})
    } : undefined;

    const sidecarJson = {
      title: title.trim() || game.title,
      description: description.trim(),
      developer: developer.trim() || game.systemName,
      publisher: publisher.trim() || game.systemName,
      year: releaseYear.trim(),
      genre: genre.trim() || 'Retro Classic',
      systemKey: game.systemKey,
      walkthrough: walkthroughObj,
      updatedAt: new Date().toISOString()
    };

    if (!sidecarJson.walkthrough) {
      delete sidecarJson.walkthrough;
    }

    const blob = new Blob([JSON.stringify(sidecarJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = (game.title || 'game').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.href = url;
    a.download = `${baseName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sfx?.playTabSwitch?.();
  };

  const handleRevert = async () => {
    const gameId = game.id || `${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await deleteManualMetadata(gameId);
    sfx?.playFavoriteToggle?.(false);
    setSaveStatus({ type: 'success', message: 'Reverted to default. Re-scraping on next open.' });
    if (onSaveSuccess) {
      onSaveSuccess(null);
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const resolvedCoverSrc = coverUrl ? (coverUrl.startsWith('data:') ? coverUrl : resolveAssetPath(coverUrl)) : null;

  return (
    <div className="meta-edit-modal-backdrop" onClick={onClose}>
      <div 
        ref={modalContentRef}
        className="meta-edit-modal-content animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="meta-edit-header">
          <div className="meta-edit-title-group">
            <Sparkles size={20} color="#3b82f6" />
            <div>
              <h3>Edit Game Metadata</h3>
              <p>Customize artwork, plot synopsis, and tags (Jellyfin Style)</p>
            </div>
          </div>
          <button
            className={`meta-edit-close-btn ${focusedTarget?.zone === 'metaEditModal' && focusedTarget?.id === 'close' ? 'gamepad-focused' : ''}`}
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Notification */}
        {saveStatus && (
          <div className={`meta-edit-status-banner ${saveStatus.type}`}>
            {saveStatus.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{saveStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="meta-edit-form">
          <div className="meta-edit-body-grid">
            {/* Left Column: Cover Art Preview & Upload */}
            <div className="meta-edit-cover-col">
              <label className="meta-edit-label">
                <ImageIcon size={14} /> Cover Artwork
              </label>
              <div className="meta-edit-cover-preview-wrapper">
                {resolvedCoverSrc && !previewError ? (
                  <img
                    src={resolvedCoverSrc}
                    alt="Cover Preview"
                    className="meta-edit-cover-img"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="meta-edit-cover-placeholder">
                    <ImageIcon size={36} color="var(--text-muted, #94a3b8)" />
                    <span>No Custom Cover</span>
                  </div>
                )}
              </div>

              <div className="meta-edit-cover-actions">
                <input
                  type="text"
                  placeholder="https://... or /roms/cover.webp"
                  value={coverUrl.startsWith('data:') ? '[Embedded Image Data]' : coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  className="meta-edit-input cover-url-input"
                  title="Cover Image URL or Path"
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                <button
                  type="button"
                  className="meta-edit-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image from Disk"
                >
                  <Upload size={14} /> Upload Image
                </button>
              </div>
            </div>

            {/* Right Column: Text Metadata Fields */}
            <div className="meta-edit-fields-col">
              {/* Title Field */}
              <div className="meta-edit-field-group">
                <label className="meta-edit-label">
                  <Film size={14} /> Display Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pokémon Unbound"
                  className="meta-edit-input"
                  required
                />
              </div>

              {/* Grid 2-col: Year & Genre */}
              <div className="meta-edit-row-2col">
                <div className="meta-edit-field-group">
                  <label className="meta-edit-label">
                    <Calendar size={14} /> Release Year
                  </label>
                  <input
                    type="text"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="e.g. 2020"
                    maxLength={4}
                    className="meta-edit-input"
                  />
                </div>

                <div className="meta-edit-field-group">
                  <label className="meta-edit-label">
                    <Tag size={14} /> Genre / Tags
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. RPG / Romhack"
                    className="meta-edit-input"
                  />
                </div>
              </div>

              {/* Grid 2-col: Developer & Publisher */}
              <div className="meta-edit-row-2col">
                <div className="meta-edit-field-group">
                  <label className="meta-edit-label">
                    <User size={14} /> Developer
                  </label>
                  <input
                    type="text"
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    placeholder="e.g. Skeli & Team"
                    className="meta-edit-input"
                  />
                </div>

                <div className="meta-edit-field-group">
                  <label className="meta-edit-label">
                    <Building size={14} /> Publisher
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="e.g. Homebrew Community"
                    className="meta-edit-input"
                  />
                </div>
              </div>

              {/* Description / Story Overview */}
              <div className="meta-edit-field-group">
                <label className="meta-edit-label">
                  Plot Synopsis / Overview
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter game summary, romhack patch details, or custom notes..."
                  rows={4}
                  className="meta-edit-textarea"
                />
              </div>

              {/* Grid 2-col: Walkthrough Links (Written & Video Guides) */}
              <div className="meta-edit-row-2col">
                <div className="meta-edit-field-group">
                  <label className="meta-edit-label">
                    <BookOpen size={14} /> Written Walkthrough URL
                  </label>
                  <input
                    type="url"
                    value={writtenWalkthrough}
                    onChange={(e) => setWrittenWalkthrough(e.target.value)}
                    placeholder="e.g. https://unboundwiki.com/walkthrough/"
                    className="meta-edit-input"
                  />
                </div>

                <div className="meta-edit-field-group">
                  <label className="meta-edit-label">
                    <Video size={14} /> Video Walkthrough URL
                  </label>
                  <input
                    type="url"
                    value={videoWalkthrough}
                    onChange={(e) => setVideoWalkthrough(e.target.value)}
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    className="meta-edit-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="meta-edit-footer">
            <div className="meta-edit-footer-left">
              {currentMeta.isManualOverride && (
                <button
                  type="button"
                  className="meta-edit-revert-btn"
                  onClick={handleRevert}
                  title="Revert manual overrides to scraped/sidecar data"
                >
                  <RotateCcw size={14} /> Revert
                </button>
              )}
              <button
                type="button"
                className="meta-edit-export-btn"
                onClick={handleExportSidecar}
                title="Download companion .json sidecar for manual drop"
              >
                <Tag size={14} /> Export Sidecar (.json)
              </button>
            </div>

            <div className="meta-edit-footer-right">
              <button
                type="button"
                className={`meta-edit-cancel-btn ${focusedTarget?.zone === 'metaEditModal' && focusedTarget?.id === 'cancel' ? 'gamepad-focused' : ''}`}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`meta-edit-save-btn ${focusedTarget?.zone === 'metaEditModal' && focusedTarget?.id === 'save' ? 'gamepad-focused' : ''}`}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Metadata'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

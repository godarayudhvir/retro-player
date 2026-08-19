import React from 'react';
import { FolderOpen } from 'lucide-react';

/**
 * DropzoneOverlay component displayed when ROM files are dragged over the dashboard.
 */
export default function DropzoneOverlay({ isDraggingOver }) {
  if (!isDraggingOver) return null;

  return (
    <div className="drag-drop-overlay">
      <div className="drag-drop-card">
        <FolderOpen size={64} className="drag-drop-icon" />
        <h2>DROP CUSTOM ROM TO PLAY</h2>
        <p>Supports .GBA, .GB, .GBC, .NES, .SMC, .Z64, .NDS, .ISO, .ZIP and more</p>
      </div>
    </div>
  );
}

import React from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

/**
 * Themed In-App Confirmation Modal Dialog.
 * Replaces native browser window.confirm / alert dialogs.
 * 100% navigable via Keyboard and Gamepad.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
  sfx
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-backdrop animate-fade-in" onClick={onCancel}>
      <div className="confirm-dialog-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <div className="confirm-icon-wrapper" style={{ background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: isDanger ? '#ef4444' : '#3b82f6' }}>
            <AlertTriangle size={24} />
          </div>
          <h3>{title}</h3>
        </div>

        <p className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <button
            className="confirm-btn-cancel"
            onClick={() => {
              sfx?.playModalClose?.();
              onCancel();
            }}
          >
            {cancelText}
          </button>

          <button
            className={`confirm-btn-action ${isDanger ? 'danger' : 'primary'}`}
            onClick={() => {
              sfx?.playModalOpen?.();
              onConfirm();
            }}
          >
            {isDanger ? <Trash2 size={16} /> : <Check size={16} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

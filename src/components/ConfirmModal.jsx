import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

/**
 * Universal In-App Confirmation Modal Dialog.
 * Replaces native browser window.confirm() and alert() dialogs with a console-grade,
 * theme-compatible modal that supports 100% Keyboard and Gamepad spatial navigation.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  sfx
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
        sfx?.playModalClose?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm?.();
        sfx?.playMenuConfirm?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel, sfx]);

  const [isProcessing, setIsProcessing] = React.useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      sfx?.playMenuConfirm?.();
      await onConfirm?.();
    } catch (e) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="confirm-modal-backdrop animate-fade-in" onClick={isProcessing ? undefined : onCancel}>
      <div className="confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon-wrapper" style={{ background: isDestructive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}>
          {isDestructive ? (
            <Trash2 size={32} color="#ef4444" />
          ) : (
            <AlertTriangle size={32} color="#3b82f6" />
          )}
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-btn cancel-btn"
            disabled={isProcessing}
            onClick={() => {
              if (isProcessing) return;
              onCancel?.();
              sfx?.playModalClose?.();
            }}
          >
            <X size={16} />
            <span>{cancelLabel}</span>
          </button>

          <button
            ref={confirmBtnRef}
            disabled={isProcessing}
            className={`confirm-modal-btn confirm-btn ${isDestructive ? 'destructive' : 'primary'}`}
            onClick={handleExecute}
          >
            {isProcessing ? (
              <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            ) : isDestructive ? (
              <Trash2 size={16} />
            ) : (
              <Check size={16} />
            )}
            <span>{isProcessing ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * Government Minimalism Modal Component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className = '',
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] transition-opacity">
      <div
        className={`w-full ${maxWidth} bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden max-h-[90vh] ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-bold text-[#17202A] tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#5F6B76] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#87919B] hover:text-[#17202A] hover:bg-[#F1F3F6] rounded-[4px] transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-4 overflow-y-auto text-sm text-[#17202A]">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Confirm Dialog (Section 42)
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={title}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-1">
        {danger && (
          <div className="p-2 bg-[#FEE4E2] text-[#B42318] rounded-[6px] flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        <p className="text-xs sm:text-sm text-[#5F6B76] leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default Modal;

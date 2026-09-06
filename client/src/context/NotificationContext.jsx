import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Shield,
  HelpCircle,
  MessageSquare,
  Loader2
} from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // Toast state
  const [toasts, setToasts] = useState([]);

  // Dialog state
  const [dialog, setDialog] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const promptInputRef = useRef(null);
  const [promptValue, setPromptValue] = useState('');

  // -------------------------------------------------------------
  // TOAST METHODS
  // -------------------------------------------------------------
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title, duration = 2500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message, title, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, title = 'Success', duration = 2500) => addToast('success', msg, title, duration),
    error: (msg, title = 'Error', duration = 2500) => addToast('error', msg, title, duration),
    warning: (msg, title = 'Warning', duration = 2500) => addToast('warning', msg, title, duration),
    info: (msg, title = 'Notice', duration = 2500) => addToast('info', msg, title, duration)
  };

  // -------------------------------------------------------------
  // DIALOG METHODS (Promise-based Confirm, Prompt, Alert)
  // -------------------------------------------------------------
  const showConfirm = useCallback(({
    title = 'Please Confirm',
    message = 'Are you sure you want to proceed with this action?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
    onConfirm: callbackOnConfirm,
    onCancel: callbackOnCancel
  }) => {
    return new Promise((resolve) => {
      setDialog({
        mode: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: async () => {
          if (typeof callbackOnConfirm === 'function') {
            setDialogLoading(true);
            try {
              await callbackOnConfirm();
            } catch (err) {
              console.error('Error in confirm callback:', err);
            } finally {
              setDialogLoading(false);
              setDialog(null);
            }
          } else {
            setDialog(null);
          }
          resolve(true);
        },
        onCancel: async () => {
          setDialog(null);
          try {
            if (typeof callbackOnCancel === 'function') {
              await callbackOnCancel();
            }
          } catch (err) {
            console.error('Error in cancel callback:', err);
          }
          resolve(false);
        }
      });
    });
  }, []);

  const showPrompt = useCallback(({
    title = 'Input Required',
    message = 'Please enter the requested information:',
    defaultValue = '',
    placeholder = 'Type here...',
    confirmText = 'Submit',
    cancelText = 'Cancel',
    type = 'info',
    required = false
  }) => {
    return new Promise((resolve) => {
      setPromptValue(defaultValue || '');
      setDialog({
        mode: 'prompt',
        title,
        message,
        defaultValue,
        placeholder,
        confirmText,
        cancelText,
        type,
        required,
        onConfirm: (val) => {
          setDialog(null);
          resolve(val);
        },
        onCancel: () => {
          setDialog(null);
          resolve(null);
        }
      });
    });
  }, []);

  const showAlert = useCallback(({
    title = 'Notice',
    message = '',
    confirmText = 'Understood',
    type = 'info' // 'info' | 'success' | 'warning' | 'error'
  }) => {
    return new Promise((resolve) => {
      setDialog({
        mode: 'alert',
        title,
        message,
        confirmText,
        type,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        }
      });
    });
  }, []);

  // Keyboard accessibility for active dialog
  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (dialog.mode === 'alert') {
          dialog.onConfirm();
        } else {
          dialog.onCancel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  // Focus prompt input when prompt dialog opens
  useEffect(() => {
    if (dialog && dialog.mode === 'prompt') {
      setTimeout(() => {
        if (promptInputRef.current) {
          promptInputRef.current.focus();
          promptInputRef.current.select();
        }
      }, 50);
    }
  }, [dialog]);

  // Helper icons and styles
  const getDialogIcon = (type, mode) => {
    if (mode === 'prompt') {
      return (
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
          <MessageSquare className="w-5 h-5" />
        </div>
      );
    }
    switch (type) {
      case 'danger':
      case 'error':
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <XCircle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const getConfirmBtnClass = (type) => {
    switch (type) {
      case 'danger':
      case 'error':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20';
      default:
        return 'bg-[#0B2545] hover:bg-slate-800 text-white shadow-slate-900/20';
    }
  };

  return (
    <NotificationContext.Provider value={{ toast, showConfirm, showPrompt, showAlert }}>
      {children}

      {/* --------------------------------------------------------- */}
      {/* TOAST NOTIFICATION CONTAINER (Fixed Top-Right, Dynamic)    */}
      {/* --------------------------------------------------------- */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end space-y-2.5 pointer-events-none max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => {
          let borderClass = 'border-slate-200/80 shadow-slate-900/5';
          let icon = <Info className="w-4 h-4 text-blue-600" />;
          let bgIcon = 'bg-blue-50/80';
          let progressBg = 'bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
          let trackBg = 'bg-blue-50/50';

          if (t.type === 'success') {
            borderClass = 'border-emerald-200/80 shadow-emerald-500/10';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            bgIcon = 'bg-emerald-50/80';
            progressBg = 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            trackBg = 'bg-emerald-50/50';
          } else if (t.type === 'error') {
            borderClass = 'border-rose-200/80 shadow-rose-500/10';
            icon = <XCircle className="w-4 h-4 text-rose-600" />;
            bgIcon = 'bg-rose-50/80';
            progressBg = 'bg-gradient-to-r from-rose-400 via-red-500 to-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
            trackBg = 'bg-rose-50/50';
          } else if (t.type === 'warning') {
            borderClass = 'border-amber-200/80 shadow-amber-500/10';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
            bgIcon = 'bg-amber-50/80';
            progressBg = 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
            trackBg = 'bg-amber-50/50';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-white/95 backdrop-blur-xl border ${borderClass} shadow-xl rounded-2xl p-3.5 pb-3.5 flex items-start space-x-3 transition-all duration-300 animate-in slide-in-from-top-4 relative overflow-hidden w-auto min-w-[280px] sm:min-w-[320px] max-w-[92vw] sm:max-w-md md:max-w-lg lg:max-w-xl`}
            >
              <div className={`w-8 h-8 rounded-xl ${bgIcon} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-snug mt-0.5 break-words">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition flex-shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Ultra-Sleek Nano Countdown Progress Bar */}
              {t.duration > 0 && (
                <div className={`absolute bottom-0 inset-x-0 h-[2px] ${trackBg} overflow-hidden`}>
                  <div
                    className={`h-full ${progressBg} rounded-r-full`}
                    style={{
                      animation: `toastProgress ${t.duration}ms linear forwards`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------- */}
      {/* GLOBAL MODAL / DIALOG CONTAINER                          */}
      {/* --------------------------------------------------------- */}
      {dialog && (
        <div 
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (dialog.mode === 'alert') {
              dialog.onConfirm();
            } else {
              dialog.onCancel();
            }
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] border border-slate-200/95 space-y-4 animate-in zoom-in-95 duration-150 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-blue-600 to-[#138808]" />

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                {getDialogIcon(dialog.type, dialog.mode)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-[#0B2545] leading-tight">
                    {dialog.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5 whitespace-pre-line">
                    {dialog.message}
                  </p>
                </div>
              </div>

              {/* Close Button (X) */}
              <button
                type="button"
                disabled={dialogLoading}
                onClick={() => {
                  if (dialogLoading) return;
                  if (dialog.mode === 'alert') {
                    dialog.onConfirm();
                  } else {
                    dialog.onCancel();
                  }
                }}
                title="Close"
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition flex-shrink-0 -mt-1 -mr-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Mode Input Field */}
            {dialog.mode === 'prompt' && (
              <div className="pt-2">
                <textarea
                  ref={promptInputRef}
                  value={promptValue}
                  rows={3}
                  placeholder={dialog.placeholder}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      dialog.onConfirm(promptValue);
                    }
                  }}
                  className="w-full p-3 bg-slate-50/80 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Press <strong>Enter</strong> to submit, <strong>Shift+Enter</strong> for newline, <strong>Esc</strong> to cancel.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              {dialog.mode !== 'alert' && (
                <button
                  type="button"
                  disabled={dialogLoading}
                  onClick={dialog.onCancel}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {dialog.cancelText || 'Cancel'}
                </button>
              )}

              <button
                type="button"
                disabled={dialogLoading}
                onClick={async () => {
                  if (dialog.mode === 'prompt') {
                    if (dialog.required && !promptValue.trim()) return;
                    dialog.onConfirm(promptValue);
                  } else {
                    await dialog.onConfirm();
                  }
                }}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition inline-flex items-center justify-center space-x-1.5 ${getConfirmBtnClass(dialog.type)} ${dialogLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {dialogLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                <span>
                  {dialogLoading
                    ? (dialog.type === 'danger' ? 'Deleting...' : 'Processing...')
                    : (dialog.confirmText || (dialog.mode === 'alert' ? 'Understood' : 'Confirm'))}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Aliases for convenience
export const useToast = () => {
  const { toast } = useNotification();
  return toast;
};

export const useDialog = () => {
  const { showConfirm, showPrompt, showAlert } = useNotification();
  return { showConfirm, showPrompt, showAlert };
};

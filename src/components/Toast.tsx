import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />,
    error: <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />,
    info: <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
  };

  const colors = {
    success: 'bg-gradient-to-r from-slate-700 to-slate-900',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    info: 'bg-gradient-to-r from-slate-700 to-slate-900'
  };

  return (
    <div className="fixed top-2 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-[9999] max-w-md animate-slide-in">
      <div className={`${colors[type]} rounded-lg shadow-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 text-xs sm:text-sm font-semibold text-white">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
